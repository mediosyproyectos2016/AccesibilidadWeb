#!/usr/bin/env node
// Auditoría automática de accesibilidad (WCAG 2.2 AA / EN 301 549) con
// Playwright + axe-core. Genera informe.json e informe.md.
//
//   node auditar.mjs https://ejemplo.es https://ejemplo.es/contacto
//   node auditar.mjs --rastrear 10 https://ejemplo.es
//   node auditar.mjs --sitemap https://ejemplo.es/sitemap.xml --max-paginas 20
//   node auditar.mjs --linea-base a11y-base.json https://ejemplo.es
//   node auditar.mjs --ayuda
//
// Códigos de salida: 0 = sin problemas por encima del umbral (o sin regresiones,
// con --linea-base); 1 = hay problemas por encima del umbral (o regresiones);
// 2 = error de ejecución.

import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

import { normalizarUmbral, IMPACTO_ES, IMPACTOS } from './lib/wcag.mjs';
import { revisarTeclado, revisarReflow } from './lib/teclado.mjs';
import {
  esIndiceSitemap, ejecutarPasos, muestraPorSecciones, revisarDesplegables, revisarDialogoAbierto,
  revisarEspaciado, revisarModales, revisarMovimiento, revisarMovimientoReducido, revisarOrdenFoco,
  revisarTextoSobreMedia, revisarZoom200, revisarObjetivosPequenos, revisarImagenTransparenteOscuro, urlsDeSitemap, validarEstados,
} from './lib/comprobaciones.mjs';
import { irConReintento } from './lib/carga.mjs';
import { crearLineaBase, regresiones } from './lib/comparar.mjs';
import {
  agrupar, generarMarkdown, hallazgosDeAxe, hallazgosPropios,
  resumir, revisionDeAxe, revisionPropia, superaUmbral,
} from './lib/informe.mjs';

const require = createRequire(import.meta.url);
const DIR = path.dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(await readFile(path.join(DIR, 'package.json'), 'utf8')).version;

const AYUDA = `
Uso: node auditar.mjs [opciones] <url> [<url>...]

Audita páginas con axe-core (WCAG 2.2 A/AA) a varios anchos y esquemas de color,
y añade lo que axe no cubre: recorrido de teclado y orden del foco, diálogos (foco,
Esc, devolución), desplegables, movimiento sin pausa, prefers-reduced-motion,
reflow a 320 px, zoom al 200 %, espaciado de texto y texto sobre imagen o vídeo.

Solo pulsa controles que declaran abrir un diálogo o un desplegable: nunca envía
formularios. Detecta una parte de los fallos; no acredita conformidad.

Opciones:
  --urls <fichero>        Fichero con una URL por línea (# para comentarios).
  --rastrear <N>          Descubre hasta N páginas del mismo dominio a partir de la primera URL.
  --sitemap <url>         Toma las páginas de un sitemap.xml (o índice de sitemaps).
  --max-paginas <N>       Máximo de páginas del sitemap, repartidas entre secciones (por defecto 20).
  --estados <fichero>     JSON con estados interactivos que auditar (menú abierto, error de
                          formulario…): [{"nombre":"…","url":"…","pasos":[{"clic":"#menu"}]}].
                          Pasos: clic, pasar, foco, escribir:[sel,texto], tecla, esperar.
  --sesion <fichero>      storageState de Playwright para auditar páginas con inicio de sesión.
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
  --tecla <tecla>         Pulsa esta tecla tras cargar, p. ej. Escape para cerrar un aviso (repetible).
  --almacenamiento <clave=valor>  Guarda esto en localStorage antes de cargar, p. ej. para
                          descartar un aviso ya visto (repetible).
  --concurrencia <N>      Páginas auditadas a la vez (por defecto 1; 4 va bien con muchas páginas).
  --sin-teclado           No hace el recorrido con Tab.
  --sin-reflow            No comprueba el reflow a 320 px.
  --sin-modales           No abre los diálogos declarados (aria-haspopup="dialog"…).
  --desplegables <N>      Máximo de desplegables que abrir por página (por defecto 5; 0 = ninguno).
  --sin-movimiento        No observa el movimiento (ahorra unos 6 s por página).
  --sin-zoom              No comprueba el zoom al 200 % ni el espaciado de texto.
  --sin-texto-media       No mide el contraste del texto sobre imagen o vídeo.
  --sin-objetivos         No lista los objetivos de menos de 24×24 px (2.5.8).
  --sin-imagen-oscuro     No revisa las imágenes con transparencia sobre fondo oscuro (modo oscuro).
  --rapido                Solo axe, teclado y reflow: desactiva las siete opciones anteriores.
  --linea-base <fichero>  Compara con una línea base: falla (código 1) solo con regresiones del
                          umbral o peor; si no se puede auditar una página conocida, código 2.
  --guardar-linea-base <fichero>  Guarda los fallos actuales como línea base y sale con código 0.
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
      tecla: { type: 'string', multiple: true },
      almacenamiento: { type: 'string', multiple: true },
      concurrencia: { type: 'string', default: '1' },
      'sin-teclado': { type: 'boolean', default: false },
      'sin-reflow': { type: 'boolean', default: false },
      'sin-modales': { type: 'boolean', default: false },
      'sin-movimiento': { type: 'boolean', default: false },
      'sin-zoom': { type: 'boolean', default: false },
      'sin-texto-media': { type: 'boolean', default: false },
      'sin-objetivos': { type: 'boolean', default: false },
      'sin-imagen-oscuro': { type: 'boolean', default: false },
      rapido: { type: 'boolean', default: false },
      desplegables: { type: 'string', default: '5' },
      sitemap: { type: 'string' },
      'max-paginas': { type: 'string', default: '20' },
      estados: { type: 'string' },
      sesion: { type: 'string' },
      'linea-base': { type: 'string' },
      'guardar-linea-base': { type: 'string' },
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

/** Ejecuta `fn` sobre la lista con un máximo de `n` tareas a la vez. */
async function enParalelo(lista, n, fn) {
  let i = 0;
  const trabajador = async () => {
    while (i < lista.length) await fn(lista[i++]);
  };
  await Promise.all(Array.from({ length: Math.max(1, n) }, trabajador));
}

async function cargar(page, url, { timeout, espera, clic = [], teclas = [] }) {
  const resp = await irConReintento(page, url, { waitUntil: 'domcontentloaded', timeout });
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
  for (const tecla of teclas) {
    await page.keyboard.press(tecla);
    await page.waitForTimeout(150);
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

/** URLs de un sitemap; si es un índice, sigue un nivel. Sin rodear bloqueos. */
async function leerSitemap(context, url, max) {
  const leer = async (u) => {
    const r = await context.request.get(u, { timeout: 30000 });
    if (!r.ok()) throw new Error(`El sitemap ${u} responde HTTP ${r.status()}`);
    return r.text();
  };
  const xml = await leer(url);
  let urls = urlsDeSitemap(xml);
  if (esIndiceSitemap(xml)) {
    const hijas = [];
    for (const s of urls.slice(0, 10)) {
      try { hijas.push(...urlsDeSitemap(await leer(s))); } catch (e) { console.warn(`  ! ${e.message}`); }
    }
    urls = hijas;
  }
  return muestraPorSecciones([...new Set(urls)], max);
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

/** Una comprobación auxiliar que falla no debe tumbar la auditoría de la página. */
async function seguro(fn, pag, nombre) {
  try {
    return await fn();
  } catch (e) {
    (pag.avisos ??= []).push(`No se pudo completar la comprobación de ${nombre}: ${e.message.split('\n')[0]}`);
    return null;
  }
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
  if (!urls.length && !values.sitemap) { console.error(`Error: indica al menos una URL.\n${AYUDA}`); return 2; }

  const rapido = values.rapido;
  const hacer = {
    modales: !rapido && !values['sin-modales'],
    movimiento: !rapido && !values['sin-movimiento'],
    zoom: !rapido && !values['sin-zoom'],
    textoMedia: !rapido && !values['sin-texto-media'],
    objetivos: !rapido && !values['sin-objetivos'],
    imagenOscuro: !rapido && !values['sin-imagen-oscuro'],
    desplegables: rapido ? 0 : parseInt(values.desplegables, 10) || 0,
  };

  const estados = values.estados ? validarEstados(JSON.parse(await readFile(values.estados, 'utf8'))) : [];
  let lineaBase = null;
  if (values['linea-base']) {
    try {
      lineaBase = JSON.parse(await readFile(values['linea-base'], 'utf8'));
    } catch (e) {
      console.error(`Error: no se puede leer la línea base ${values['linea-base']}: ${e.message}\nCréala con --guardar-linea-base.`);
      return 2;
    }
  }
  if (values.sesion) await access(values.sesion);
  const sesion = values.sesion ? { storageState: values.sesion } : {};

  const anchos = values.anchos.split(',').map((s) => parseInt(s, 10)).filter((n) => n >= 200);
  const carga = { timeout: parseInt(values.timeout, 10), espera: parseInt(values.espera, 10), clic: values.clic ?? [], teclas: values.tecla ?? [] };
  const concurrencia = parseInt(values.concurrencia, 10) || 1;
  const almacenamiento = (values.almacenamiento ?? []).map((s) => {
    const i = s.indexOf('=');
    if (i < 1) throw new Error(`--almacenamiento necesita clave=valor: «${s}»`);
    return [s.slice(0, i), s.slice(i + 1)];
  });
  const prepararContexto = async (c) => {
    if (almacenamiento.length) {
      await c.addInitScript((pares) => {
        try { for (const [k, v] of pares) localStorage.setItem(k, v); } catch { /* sin almacenamiento en este origen */ }
      }, almacenamiento);
    }
    return c;
  };
  const etiquetas = values.etiquetas.split(',').map((s) => s.trim()).filter(Boolean);
  if (values['buenas-practicas']) etiquetas.push('best-practice');
  const { fuente, version: axeVersion } = fuenteAxe(values.idioma);

  const browser = await chromium.launch();
  try {
    if (values.sitemap) {
      const ctx = await browser.newContext({ ...sesion });
      const max = parseInt(values['max-paginas'], 10);
      const delSitemap = await leerSitemap(ctx, values.sitemap, max);
      await ctx.close();
      console.log(`Sitemap: ${delSitemap.length} página(s) elegidas de ${values.sitemap}`);
      urls = [...new Set([...urls, ...delSitemap])];
      if (!urls.length) { console.error('Error: el sitemap no contiene URLs.'); return 2; }
    }

    if (values.rastrear) {
      const max = parseInt(values.rastrear, 10);
      console.log(`Rastreando hasta ${max} páginas desde ${urls[0]}…`);
      const ctx = await prepararContexto(await browser.newContext({ ...sesion }));
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
        const ctx = await prepararContexto(await browser.newContext({
          viewport: { width: ancho, height: movil ? 844 : 800 },
          isMobile: movil,
          hasTouch: movil,
          colorScheme: esquema === 'oscuro' ? 'dark' : 'light',
          locale: 'es-ES',
          ...sesion,
        }));
        const contexto = `${ancho} px · ${esquema}`;
        const primero = esquema === esquemas[0] && ancho === anchos[0];
        await enParalelo(paginas, concurrencia, async (pag) => {
          if (pag.error) return;
          const page = await ctx.newPage();
          try {
            await cargar(page, pag.url, carga);
            if (!pag.titulo) pag.titulo = await page.title();
            // target-size (2.5.8) está desactivada por defecto en axe: hay que pedirla.
            const analizar = async () => {
              const nuevo = () => new AxeBuilder({ page, axeSource: fuente }).withTags(etiquetas);
              // Con un diálogo modal abierto encima, lo que queda debajo no se puede pulsar:
              // target-size solo se mide dentro del diálogo.
              const hayModal = await page.evaluate(() => {
                document.querySelectorAll('[data-a11y-axe-modal]').forEach((n) => n.removeAttribute('data-a11y-axe-modal'));
                const d = [...document.querySelectorAll('dialog[open], [aria-modal="true"]')].find((n) => {
                  const r = n.getBoundingClientRect();
                  const cs = getComputedStyle(n);
                  return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && (n.matches('dialog:modal') || n.getAttribute('aria-modal') === 'true');
                });
                if (d) d.setAttribute('data-a11y-axe-modal', '1');
                return !!d;
              }).catch(() => false);
              const conExcluidos = (b) => { for (const sel of values.excluir ?? []) b = b.exclude(sel); return b; };
              if (!hayModal) return conExcluidos(nuevo().options({ rules: { 'target-size': { enabled: true } } })).analyze();
              const general = await conExcluidos(nuevo().options({ rules: { 'target-size': { enabled: false } } })).analyze();
              const dentro = await nuevo().include('[data-a11y-axe-modal]').options({ rules: { 'target-size': { enabled: true } } }).analyze();
              general.violations.push(...dentro.violations.filter((v) => v.id === 'target-size'));
              return general;
            };
            const res = await analizar();
            hallazgos.push(...hallazgosDeAxe(res, pag.url, contexto));
            if (primero) revisar.push(...revisionDeAxe(res, pag.url));

            // Comprobaciones propias: una vez por página, en el primer contexto.
            if (primero && !values['sin-teclado'] && !movil) {
              const t = await revisarTeclado(page, { maxTabs: parseInt(values.tabs, 10) });
              teclado[pag.url] = t.pasos;
              if (t.avisos.length) pag.avisos = t.avisos;
              hallazgos.push(...hallazgosPropios(t.hallazgos, pag.url, contexto));
              const orden = await revisarOrdenFoco(page, t.pasos);
              hallazgos.push(...hallazgosPropios(orden.hallazgos, pag.url, contexto));
              revisar.push(...revisionPropia(orden.revisar, pag.url));
            }
            if (primero && !values['sin-reflow']) {
              hallazgos.push(...hallazgosPropios(await revisarReflow(page), pag.url, '320 px · ' + esquema));
            }

            // Comprobaciones que no cambian el estado de la página.
            if (primero && hacer.textoMedia) {
              const r = await seguro(() => revisarTextoSobreMedia(page), pag, 'texto sobre imagen');
              if (r) { hallazgos.push(...hallazgosPropios(r.hallazgos, pag.url, contexto)); revisar.push(...revisionPropia(r.revisar, pag.url)); }
            }
            if (primero && hacer.objetivos) {
              const o = await seguro(() => revisarObjetivosPequenos(page), pag, 'objetivos pequeños');
              if (o) revisar.push(...revisionPropia(o.revisar, pag.url));
            }
            // Las imágenes con transparencia solo se miden en modo oscuro (una vez por página).
            if (esquema === 'oscuro' && ancho === anchos[0] && hacer.imagenOscuro) {
              const im = await seguro(() => revisarImagenTransparenteOscuro(page), pag, 'imágenes sobre fondo oscuro');
              if (im) { hallazgos.push(...hallazgosPropios(im.hallazgos, pag.url, contexto)); revisar.push(...revisionPropia(im.revisar, pag.url)); }
            }
            if (primero && hacer.zoom && !movil) {
              const z = await seguro(() => revisarZoom200(page), pag, 'zoom');
              if (z) { hallazgos.push(...hallazgosPropios(z.hallazgos, pag.url, '200 % · ' + esquema)); revisar.push(...revisionPropia(z.revisar, pag.url)); }
              const e = await seguro(() => revisarEspaciado(page), pag, 'espaciado');
              if (e) hallazgos.push(...hallazgosPropios(e, pag.url, contexto));
            }
            if (primero && hacer.movimiento) {
              const m = await seguro(() => revisarMovimiento(page), pag, 'movimiento');
              if (m) { hallazgos.push(...hallazgosPropios(m.hallazgos, pag.url, contexto)); revisar.push(...revisionPropia(m.revisar, pag.url)); }
              const mr = await revisarMovimientoReducido(ctx, pag.url, cargar, { ...carga, espera: 300 });
              hallazgos.push(...hallazgosPropios(mr, pag.url, contexto));
            }

            // Estados interactivos: se analiza con axe también lo que solo aparece al abrir.
            if (primero && (hacer.modales || hacer.desplegables)) {
              await cargar(page, pag.url, { ...carga, espera: 0 });
              const enEstado = (nombre) => async () => {
                const r = await analizar();
                hallazgos.push(...hallazgosDeAxe(r, pag.url, `${contexto} · ${nombre}`));
              };
              if (hacer.modales) {
                const m = await seguro(() => revisarModales(page, {
                  recargar: () => cargar(page, pag.url, { ...carga, espera: 0 }),
                  alAbrir: (d) => enEstado(`diálogo «${d.texto}»`)(),
                }), pag, 'diálogos');
                if (m) hallazgos.push(...hallazgosPropios(m.hallazgos, pag.url, contexto));
              }
              if (hacer.desplegables) {
                await cargar(page, pag.url, { ...carga, espera: 0 });
                const d = await seguro(() => revisarDesplegables(page, {
                  max: hacer.desplegables,
                  alAbrir: (x) => enEstado(`desplegable «${x.texto}»`)(),
                }), pag, 'desplegables');
                if (d) hallazgos.push(...hallazgosPropios(d.hallazgos, pag.url, contexto));
              }
            }

            // Estados definidos por el usuario.
            for (const est of estados) {
              if (est.url && !pag.url.includes(est.url)) continue;
              if ((est.ancho ?? anchos[0]) !== ancho || esquema !== esquemas[0]) continue;
              const nombre = `${contexto} · estado «${est.nombre}»`;
              try {
                await cargar(page, pag.url, { ...carga, espera: 0 });
                await ejecutarPasos(page, est.pasos);
                const r = await analizar();
                hallazgos.push(...hallazgosDeAxe(r, pag.url, nombre));
                const d = await revisarDialogoAbierto(page).catch(() => null);
                if (d) hallazgos.push(...hallazgosPropios(d.hallazgos, pag.url, nombre));
                console.log(`  ✓ ${pag.url} [${nombre}]: ${r.violations.length} reglas incumplidas`);
              } catch (e) {
                (pag.avisos ??= []).push(`No se pudo reproducir el estado «${est.nombre}»: ${e.message.split('\n')[0]}`);
                console.warn(`  ! ${pag.url}: estado «${est.nombre}» no reproducido`);
              }
            }
            console.log(`  ✓ ${pag.url} [${contexto}]: ${res.violations.length} reglas incumplidas`);
          } catch (e) {
            if (primero) pag.error = e.message.split('\n')[0];
            else (pag.avisos ??= []).push(`No se pudo auditar en ${contexto}: ${e.message.split('\n')[0]}`);
            console.warn(`  ✗ ${pag.url} [${contexto}]: ${e.message.split('\n')[0]}`);
          } finally {
            await page.close();
          }
        });
        await ctx.close();
      }
    }

    const problemas = agrupar(hallazgos);
    const resumen = resumir(problemas);
    resumen.paginasNoAuditadas = paginas.filter((p) => p.error).length;
    const datos = {
      herramienta: 'AccesibilidadWeb',
      version: VERSION,
      axeVersion,
      fecha: new Date().toISOString(),
      configuracion: {
        anchos, esquemas, etiquetas, umbral,
        teclado: !values['sin-teclado'], reflow: !values['sin-reflow'],
        comprobaciones: hacer,
        estados: estados.map((e) => e.nombre),
        excluir: values.excluir ?? [],
        clic: values.clic ?? [],
      },
      paginas,
      resumen,
      problemas,
      revisar,
      teclado,
    };

    if (lineaBase) {
      const r = regresiones(lineaBase, datos, umbral ?? 'minor');
      datos.lineaBase = { fecha: lineaBase.fecha, total: lineaBase.total, ...r };
    }

    await mkdir(values.salida, { recursive: true });
    await writeFile(path.join(values.salida, 'informe.json'), JSON.stringify(datos, null, 2));
    await writeFile(path.join(values.salida, 'informe.md'), generarMarkdown(datos, { baseRecetas: values.recetas ?? '' }));

    console.log(`\n${resumen.problemas} problemas · ` +
      IMPACTOS.map((i) => `${IMPACTO_ES[i]}: ${resumen.porImpacto[i] ?? 0}`).join(' · '));
    if (resumen.paginasNoAuditadas) console.log(`Atención: ${resumen.paginasNoAuditadas} página(s) no auditadas; sus fallos no están contados.`);
    console.log(`Informe: ${path.resolve(values.salida, 'informe.md')}`);

    const fallidas = paginas.filter((p) => p.error);
    for (const p of fallidas) console.warn(`  ! Página no auditada: ${p.url} (${p.error})`);
    if (paginas.every((p) => p.error)) return 2;
    if (values['guardar-linea-base']) {
      if (fallidas.length) { console.error('Error: no se guarda la línea base con páginas sin auditar.'); return 2; }
      await writeFile(values['guardar-linea-base'], JSON.stringify(crearLineaBase(datos), null, 2) + '\n');
      console.log(`Línea base guardada en ${values['guardar-linea-base']} con ${resumen.problemas} fallos conocidos. No es una lista de fallos aceptables: debe ir bajando.`);
      return 0;
    }
    if (lineaBase) {
      const { regresiones: rs, mejoras, sinComprobar } = datos.lineaBase;
      console.log(`Línea base: ${rs.length} regresión(es), ${mejoras.length} mejora(s), ${sinComprobar.length} página(s) sin comprobar.`);
      if (mejoras.length) console.log('  Hay mejoras: actualiza la línea base para que no puedan volver (--guardar-linea-base).');
      for (const p of rs.slice(0, 20)) console.log(`  ✗ ${p.regla} (${IMPACTO_ES[p.impacto]}) · ${p.pagina} · ${p.selector}`);
      if (sinComprobar.length || fallidas.length) return 2;
      return rs.length ? 1 : 0;
    }
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
