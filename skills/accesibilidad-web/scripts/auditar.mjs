#!/usr/bin/env node
// Auditoría automática de accesibilidad (WCAG 2.2 AA / EN 301 549) con
// Playwright + axe-core. Genera informe.json e informe.md.
//
//   node auditar.mjs https://ejemplo.es https://ejemplo.es/contacto
//   node auditar.mjs --rastrear 10 https://ejemplo.es
//   node auditar.mjs --ayuda
//
// Códigos de salida: 0 = sin problemas por encima del umbral,
// 1 = hay problemas por encima del umbral, 2 = error de ejecución.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

import { normalizarUmbral, IMPACTO_ES, IMPACTOS } from './lib/wcag.mjs';
import { revisarTeclado, revisarReflow } from './lib/teclado.mjs';
import {
  agrupar, generarMarkdown, hallazgosDeAxe, hallazgosPropios,
  resumir, revisionDeAxe, superaUmbral,
} from './lib/informe.mjs';

const require = createRequire(import.meta.url);
const DIR = path.dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(await readFile(path.join(DIR, 'package.json'), 'utf8')).version;

const AYUDA = `
Uso: node auditar.mjs [opciones] <url> [<url>...]

Audita páginas con axe-core (WCAG 2.2 A/AA) a varios anchos y esquemas de color,
recorre la página con el teclado y comprueba el reflow a 320 px.

Opciones:
  --urls <fichero>        Fichero con una URL por línea (# para comentarios).
  --rastrear <N>          Descubre hasta N páginas del mismo dominio a partir de la primera URL.
  --anchos <lista>        Anchos de ventana en px (por defecto 1280,390).
  --esquemas <modo>       auto | claro | oscuro | claro,oscuro (por defecto auto: añade
                          oscuro solo si la web cambia con prefers-color-scheme).
  --salida <dir>          Carpeta del informe (por defecto ./informe-accesibilidad).
  --umbral <impacto>      Falla (código 1) si hay problemas de ese impacto o peor:
                          critico | grave | moderado | leve | ninguno (por defecto grave).
  --etiquetas <lista>     Etiquetas de axe (por defecto wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa).
  --buenas-practicas      Incluye también las reglas «best-practice» de axe.
  --excluir <selector>    Excluye un selector CSS del análisis (repetible).
  --clic <selector>       Pulsa este elemento tras cargar cada página, p. ej. el botón
                          «Aceptar» del banner de cookies (repetible; si no existe, se ignora).
  --sin-teclado           No hace el recorrido con Tab.
  --sin-reflow            No comprueba el reflow a 320 px.
  --tabs <N>              Máximo de pulsaciones de Tab por página (por defecto 40).
  --espera <ms>           Espera extra tras cargar cada página (por defecto 1000).
  --timeout <ms>          Tiempo máximo de carga por página (por defecto 45000).
  --recetas <ruta>        Ruta (relativa al informe) a la carpeta de la skill para enlazar recetas.
  --idioma <código>       Idioma de los mensajes de axe (es por defecto; en para inglés).
  --ayuda                 Muestra esta ayuda.
`;

function leerOpciones(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      urls: { type: 'string' },
      url: { type: 'string', multiple: true },
      rastrear: { type: 'string' },
      anchos: { type: 'string', default: '1280,390' },
      esquemas: { type: 'string', default: 'auto' },
      salida: { type: 'string', default: 'informe-accesibilidad' },
      umbral: { type: 'string', default: 'grave' },
      etiquetas: { type: 'string', default: 'wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa' },
      'buenas-practicas': { type: 'boolean', default: false },
      excluir: { type: 'string', multiple: true },
      clic: { type: 'string', multiple: true },
      'sin-teclado': { type: 'boolean', default: false },
      'sin-reflow': { type: 'boolean', default: false },
      tabs: { type: 'string', default: '40' },
      espera: { type: 'string', default: '1000' },
      timeout: { type: 'string', default: '45000' },
      recetas: { type: 'string' },
      idioma: { type: 'string', default: 'es' },
      ayuda: { type: 'boolean', short: 'h', default: false },
    },
  });
  return { values, positionals };
}

async function leerUrls(values, positionals) {
  const urls = [...positionals, ...(values.url ?? [])];
  if (values.urls) {
    const txt = await readFile(values.urls, 'utf8');
    for (const l of txt.split(/\r?\n/)) {
      const s = l.trim();
      if (s && !s.startsWith('#')) urls.push(s);
    }
  }
  for (const u of urls) {
    try { new URL(u); } catch { throw new Error(`URL no válida: ${u}`); }
  }
  return [...new Set(urls)];
}

async function cargar(page, url, { timeout, espera, clic = [] }) {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForLoadState('load', { timeout: Math.min(timeout, 15000) }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  if (espera) await page.waitForTimeout(espera);
  for (const sel of clic) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
  const estado = resp?.status() ?? 0;
  if (estado >= 400) throw new Error(`HTTP ${estado}${estado === 403 ? ' (posible bloqueo antibot: no se rodea)' : ''}`);
  return estado;
}

const EXTENSIONES_NO_HTML = /\.(pdf|jpe?g|png|gif|webp|avif|svg|zip|mp4|mp3|webm|docx?|xlsx?|pptx?|xml|json|txt|ics)$/i;

/** Rastreo en anchura de enlaces del mismo origen. */
async function rastrear(context, inicio, max, opciones) {
  const origen = new URL(inicio).origin;
  const cola = [inicio];
  const vistas = new Set();
  const encontradas = [];
  const page = await context.newPage();
  while (cola.length && encontradas.length < max) {
    const url = cola.shift();
    if (vistas.has(url)) continue;
    vistas.add(url);
    try {
      await cargar(page, url, { ...opciones, espera: 0 });
      encontradas.push(page.url().split('#')[0]);
      const enlaces = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
      for (const href of enlaces) {
        let u;
        try { u = new URL(href); } catch { continue; }
        u.hash = '';
        const s = u.toString();
        if (u.origin === origen && !EXTENSIONES_NO_HTML.test(u.pathname) &&
          !/logout|salir|cerrar-sesion|wp-admin|wp-login/i.test(u.pathname) &&
          !vistas.has(s) && !cola.includes(s)) cola.push(s);
      }
    } catch (e) {
      console.warn(`  ! No se pudo rastrear ${url}: ${e.message}`);
    }
  }
  await page.close();
  return [...new Set(encontradas)];
}

/** ¿Cambia la web con prefers-color-scheme? Compara colores de fondo y texto. */
async function detectarModoOscuro(browser, url, opciones) {
  const firma = async (colorScheme) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme });
    const page = await ctx.newPage();
    try {
      await cargar(page, url, { ...opciones, espera: 300 });
      return await page.evaluate(() => {
        const c = (el) => el ? `${getComputedStyle(el).backgroundColor}|${getComputedStyle(el).color}` : '';
        return [document.documentElement, document.body, document.querySelector('main'), document.querySelector('header')].map(c).join(';');
      });
    } finally { await ctx.close(); }
  };
  try {
    return (await firma('light')) !== (await firma('dark'));
  } catch {
    return false;
  }
}

function fuenteAxe(idioma) {
  const axe = require('axe-core');
  let fuente = axe.source;
  if (idioma && idioma !== 'en') {
    try {
      const locale = require(`axe-core/locales/${idioma}.json`);
      fuente += `\n;axe.configure({ locale: ${JSON.stringify(locale)} });`;
    } catch {
      console.warn(`  ! axe-core no tiene traducción «${idioma}»; se usa inglés.`);
    }
  }
  return { fuente, version: axe.version };
}

async function main() {
  let opciones;
  try {
    opciones = leerOpciones(process.argv.slice(2));
  } catch (e) {
    console.error(`Error: ${e.message}\n${AYUDA}`);
    return 2;
  }
  const { values, positionals } = opciones;
  if (values.ayuda) { console.log(AYUDA); return 0; }

  const umbral = normalizarUmbral(values.umbral);
  let urls = await leerUrls(values, positionals);
  if (!urls.length) { console.error(`Error: indica al menos una URL.\n${AYUDA}`); return 2; }

  const anchos = values.anchos.split(',').map((s) => parseInt(s, 10)).filter((n) => n >= 200);
  const carga = { timeout: parseInt(values.timeout, 10), espera: parseInt(values.espera, 10), clic: values.clic ?? [] };
  const etiquetas = values.etiquetas.split(',').map((s) => s.trim()).filter(Boolean);
  if (values['buenas-practicas']) etiquetas.push('best-practice');
  const { fuente, version: axeVersion } = fuenteAxe(values.idioma);

  const browser = await chromium.launch();
  try {
    if (values.rastrear) {
      const max = parseInt(values.rastrear, 10);
      console.log(`Rastreando hasta ${max} páginas desde ${urls[0]}…`);
      const ctx = await browser.newContext();
      const descubiertas = await rastrear(ctx, urls[0], max, carga);
      await ctx.close();
      urls = [...new Set([...urls, ...descubiertas])].slice(0, Math.max(max, urls.length));
    }

    let esquemas;
    if (values.esquemas === 'auto') {
      esquemas = ['claro'];
      if (await detectarModoOscuro(browser, urls[0], carga)) esquemas.push('oscuro');
    } else {
      esquemas = values.esquemas.split(',').map((s) => s.trim()).filter((s) => ['claro', 'oscuro'].includes(s));
      if (!esquemas.length) esquemas = ['claro'];
    }

    console.log(`Auditando ${urls.length} página(s) a ${anchos.join(', ')} px · esquema ${esquemas.join('/')}`);

    const hallazgos = [];
    const revisar = [];
    const teclado = {};
    const paginas = urls.map((url) => ({ url, titulo: '', error: null }));

    for (const esquema of esquemas) {
      for (const ancho of anchos) {
        const movil = ancho < 768;
        const ctx = await browser.newContext({
          viewport: { width: ancho, height: movil ? 844 : 800 },
          isMobile: movil,
          hasTouch: movil,
          colorScheme: esquema === 'oscuro' ? 'dark' : 'light',
          locale: 'es-ES',
        });
        const contexto = `${ancho} px · ${esquema}`;
        const primero = esquema === esquemas[0] && ancho === anchos[0];
        for (const pag of paginas) {
          if (pag.error) continue;
          const page = await ctx.newPage();
          try {
            await cargar(page, pag.url, carga);
            if (!pag.titulo) pag.titulo = await page.title();
            let builder = new AxeBuilder({ page, axeSource: fuente }).withTags(etiquetas);
            for (const sel of values.excluir ?? []) builder = builder.exclude(sel);
            const res = await builder.analyze();
            hallazgos.push(...hallazgosDeAxe(res, pag.url, contexto));
            if (primero) revisar.push(...revisionDeAxe(res, pag.url));

            // Comprobaciones propias: una vez por página, en el primer contexto.
            if (primero && !values['sin-teclado'] && !movil) {
              const t = await revisarTeclado(page, { maxTabs: parseInt(values.tabs, 10) });
              teclado[pag.url] = t.pasos;
              if (t.avisos.length) pag.avisos = t.avisos;
              hallazgos.push(...hallazgosPropios(t.hallazgos, pag.url, contexto));
            }
            if (primero && !values['sin-reflow']) {
              hallazgos.push(...hallazgosPropios(await revisarReflow(page), pag.url, '320 px · ' + esquema));
            }
            console.log(`  ✓ ${pag.url} [${contexto}]: ${res.violations.length} reglas incumplidas`);
          } catch (e) {
            if (primero) pag.error = e.message.split('\n')[0];
            console.warn(`  ✗ ${pag.url} [${contexto}]: ${e.message.split('\n')[0]}`);
          } finally {
            await page.close();
          }
        }
        await ctx.close();
      }
    }

    const problemas = agrupar(hallazgos);
    const resumen = resumir(problemas);
    const datos = {
      herramienta: 'AccesibilidadWeb',
      version: VERSION,
      axeVersion,
      fecha: new Date().toISOString(),
      configuracion: {
        anchos, esquemas, etiquetas, umbral,
        teclado: !values['sin-teclado'], reflow: !values['sin-reflow'],
        excluir: values.excluir ?? [],
        clic: values.clic ?? [],
      },
      paginas,
      resumen,
      problemas,
      revisar,
      teclado,
    };

    await mkdir(values.salida, { recursive: true });
    await writeFile(path.join(values.salida, 'informe.json'), JSON.stringify(datos, null, 2));
    await writeFile(path.join(values.salida, 'informe.md'), generarMarkdown(datos, { baseRecetas: values.recetas ?? '' }));

    console.log(`\n${resumen.problemas} problemas · ` +
      IMPACTOS.map((i) => `${IMPACTO_ES[i]}: ${resumen.porImpacto[i] ?? 0}`).join(' · '));
    console.log(`Informe: ${path.resolve(values.salida, 'informe.md')}`);

    if (paginas.every((p) => p.error)) return 2;
    if (superaUmbral(problemas, umbral)) {
      console.log(`Hay problemas de impacto ${IMPACTO_ES[umbral]} o superior: código de salida 1.`);
      return 1;
    }
    return 0;
  } finally {
    await browser.close();
  }
}

main().then((code) => { process.exitCode = code; }).catch((e) => {
  console.error(`Error: ${e.stack || e.message}`);
  process.exitCode = 2;
});
