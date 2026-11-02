// El panel, en un navegador real: auditoría, teclado, persistencia y privacidad.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { servir } from '../ayuda-tests/servidor.mjs';
import { revisarDialogoAbierto } from '../lib/comprobaciones.mjs';

const require = createRequire(import.meta.url);
const DIR = path.dirname(fileURLToPath(import.meta.url));
const PANEL = path.join(DIR, '..', '..', 'panel');
const JS = path.join(PANEL, 'panel-accesibilidad.js');
const REACT = path.join(PANEL, 'react', 'PanelAccesibilidad.jsx');

const pagina = (cuerpo, cabeza = '') => ({
  texto: `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Prueba</title>${cabeza}</head><body><main><h1>Prueba</h1><p>Un <a href="#x">enlace</a> y más texto.</p>${cuerpo}</main></body></html>`,
});

let srv;
let browser;
before(async () => {
  srv = await servir({
    '/panel-accesibilidad.js': JS,
    '/demo.html': path.join(PANEL, 'demo.html'),
    '/flotante': pagina('<script src="/panel-accesibilidad.js"></script>'),
    '/en-linea': pagina('<panel-accesibilidad modo="en-linea" declaracion="/accesibilidad"></panel-accesibilidad><script src="/panel-accesibilidad.js"></script>'),
    '/maliciosa': pagina('<panel-accesibilidad modo="en-linea" declaracion="javascript:alert(1)"></panel-accesibilidad><script src="/panel-accesibilidad.js"></script>'),
    '/px': pagina('<panel-accesibilidad modo="en-linea"></panel-accesibilidad><script src="/panel-accesibilidad.js"></script>', '<style>html,body,p,h1{font-size:16px}</style>'),
    '/anim': pagina('<div id="a" style="width:100px;height:100px;animation:g 1s infinite"></div><style>@keyframes g{to{transform:rotate(1turn)}}</style><panel-accesibilidad modo="en-linea"></panel-accesibilidad><script src="/panel-accesibilidad.js"></script>'),
    '/ingles': { texto: '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>T</title></head><body><main><h1>T</h1><script src="/panel-accesibilidad.js"></script></main></body></html>' },
    '/accesibilidad': pagina(''),
  });
  browser = await chromium.launch();
});
after(async () => {
  await browser.close();
  await srv.cerrar();
});

async function abrir(ruta, opciones = {}) {
  const ctx = await browser.newContext(opciones);
  ctx.setDefaultTimeout(90000);
  ctx.setDefaultNavigationTimeout(90000);
  const page = await ctx.newPage();
  await page.goto(`${srv.base}${ruta}`);
  await page.waitForFunction(() => document.querySelector('panel-accesibilidad')?.shadowRoot?.querySelector('dialog'));
  return { ctx, page };
}
const violaciones = async (page) => {
  const r = await new AxeBuilder({ page, axeSource: require('axe-core').source })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .options({ rules: { 'target-size': { enabled: true } } })
    .analyze();
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
};
const abrirPanel = (page) => page.locator('panel-accesibilidad .abrir').click();
const prefs = (page) => page.evaluate(() => document.querySelector('panel-accesibilidad').preferencias);
const cambiar = async (page, nombre, valor) => {
  const c = page.locator(`panel-accesibilidad [name="${nombre}"]`);
  if (typeof valor === 'boolean') await c.setChecked(valor);
  else await c.selectOption(valor);
};

for (const [nombre, opciones] of [
  ['claro', {}],
  ['oscuro', { colorScheme: 'dark' }],
  ['móvil', { viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true }],
]) {
  test(`pasa la auditoría cerrado y abierto (${nombre})`, { timeout: 240000 }, async () => {
    const { ctx, page } = await abrir('/flotante', opciones);
    assert.deepEqual(await violaciones(page), []);
    await abrirPanel(page);
    assert.deepEqual(await violaciones(page), []);
    await ctx.close();
  });
}

test('sigue pasando con preferencias extremas', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/en-linea', { viewport: { width: 320, height: 568 } });
  await abrirPanel(page);
  await cambiar(page, 'texto', '200');
  await cambiar(page, 'contraste', 'oscuro');
  await cambiar(page, 'espaciado', true);
  assert.deepEqual(await violaciones(page), []);
  const desborda = await page.evaluate(() => {
    const d = document.querySelector('panel-accesibilidad').shadowRoot.querySelector('dialog');
    return d.getBoundingClientRect().right > innerWidth + 1;
  });
  assert.equal(desborda, false, 'cabe a 320 px con el texto al 200 %');
  await ctx.close();
});

test('teclado: abre con Intro, retiene el foco, cierra con Esc y devuelve el foco', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/flotante');
  await page.locator('panel-accesibilidad .abrir').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  const estado = await revisarDialogoAbierto(page);
  assert.ok(estado, 'el diálogo se abre');
  assert.equal(estado.modal, true);
  assert.deepEqual(estado.hallazgos, []);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.querySelector('panel-accesibilidad').shadowRoot.activeElement?.className), 'abrir');
  await ctx.close();
});

test('aplica cada preferencia a la página y la quita', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/en-linea');
  await abrirPanel(page);
  const css = (sel, prop) => page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s))[p], [sel, prop]);
  const tamInicial = parseFloat(await css('p', 'fontSize'));

  await cambiar(page, 'texto', '150');
  assert.ok(Math.abs(parseFloat(await css('p', 'fontSize')) - tamInicial * 1.5) < 0.6, 'el texto crece');

  await cambiar(page, 'subrayado', true);
  assert.match(await css('a', 'textDecorationLine'), /underline/);

  await cambiar(page, 'espaciado', true);
  assert.equal(await css('p', 'lineHeight'), `${parseFloat(await css('p', 'fontSize')) * 1.5}px`);

  await cambiar(page, 'fuente', true);
  assert.match(await css('p', 'fontFamily'), /Verdana/);

  await cambiar(page, 'contraste', 'claro');
  assert.equal(await css('body', 'backgroundColor'), 'rgb(255, 255, 255)');
  assert.equal(await css('p', 'color'), 'rgb(0, 0, 0)');
  await cambiar(page, 'contraste', 'oscuro');
  assert.equal(await css('body', 'backgroundColor'), 'rgb(0, 0, 0)');
  assert.equal(await css('p', 'color'), 'rgb(255, 255, 255)');

  await page.locator('panel-accesibilidad [data-accion="restablecer"]').click();
  assert.equal(parseFloat(await css('p', 'fontSize')), tamInicial);
  assert.equal(await page.evaluate(() => document.documentElement.attributes.length), 1, 'solo queda lang');
  assert.equal(await page.locator('panel-accesibilidad [name="fuente"]').isChecked(), false);
  await ctx.close();
});

test('si la web usa px, el tamaño cae a zoom', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/px');
  await abrirPanel(page);
  await cambiar(page, 'texto', '150');
  assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('zoom')), '150%');
  await ctx.close();
});

test('parar animaciones detiene las animaciones CSS', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/anim');
  const corriendo = () => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect.getComputedTiming().iterations === Infinity).length);
  assert.equal(await corriendo(), 1);
  await abrirPanel(page);
  await cambiar(page, 'animaciones', true);
  await page.waitForTimeout(100);
  assert.equal(await corriendo(), 0);
  await cambiar(page, 'animaciones', false);
  assert.equal(await corriendo(), 1);
  await ctx.close();
});

test('respeta prefers-reduced-motion sin guardar nada', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/anim', { reducedMotion: 'reduce' });
  assert.equal((await prefs(page)).animaciones, true);
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await ctx.close();
});

test('guarda solo al cambiar y se conserva al recargar, sin parpadeo', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/en-linea');
  assert.equal(await page.evaluate(() => localStorage.length), 0, 'no escribe nada al cargar');
  await abrirPanel(page);
  await cambiar(page, 'subrayado', true);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['panel-accesibilidad:v1']);
  await page.reload();
  await page.waitForFunction(() => document.querySelector('panel-accesibilidad')?.preferencias);
  assert.equal((await prefs(page)).subrayado, true);
  assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-pa-subrayado')), true);
  await abrirPanel(page);
  assert.equal(await page.locator('panel-accesibilidad [name="subrayado"]').isChecked(), true);
  await page.locator('panel-accesibilidad [data-accion="restablecer"]').click();
  assert.equal(await page.evaluate(() => localStorage.length), 0, 'restablecer no deja rastro');
  await ctx.close();
});

test('funciona sin localStorage y con datos corruptos', { timeout: 240000 }, async () => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } });
  });
  await page.goto(`${srv.base}/en-linea`);
  await page.waitForFunction(() => document.querySelector('panel-accesibilidad')?.shadowRoot?.querySelector('dialog'));
  await abrirPanel(page);
  await cambiar(page, 'subrayado', true);
  assert.match(await page.evaluate(() => getComputedStyle(document.querySelector('a')).textDecorationLine), /underline/);
  await ctx.close();

  const c2 = await browser.newContext();
  const p2 = await c2.newPage();
  await p2.addInitScript(() => localStorage.setItem('panel-accesibilidad:v1', '{roto'));
  await p2.goto(`${srv.base}/en-linea`);
  await p2.waitForFunction(() => document.querySelector('panel-accesibilidad')?.preferencias);
  assert.equal((await prefs(p2)).texto, 100);
  await c2.close();
});

test('sin rastreo: ninguna petición de red ni cookies', { timeout: 240000 }, async () => {
  const fuente = readFileSync(JS, 'utf8');
  assert.doesNotMatch(fuente, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|document\.cookie|import\s*\(|https?:\/\/(?!github\.com\/mediosyproyectos2016)/);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const peticiones = [];
  page.on('request', (r) => peticiones.push(r.url()));
  await page.goto(`${srv.base}/en-linea`);
  await page.waitForFunction(() => document.querySelector('panel-accesibilidad')?.shadowRoot?.querySelector('dialog'));
  await abrirPanel(page);
  await cambiar(page, 'contraste', 'oscuro');
  await cambiar(page, 'fuente', true);
  await page.waitForTimeout(150);
  assert.deepEqual(peticiones.map((u) => new URL(u).pathname).sort(), ['/en-linea', '/panel-accesibilidad.js']);
  assert.deepEqual(await ctx.cookies(), []);
  await ctx.close();
});

test('el panel es honesto: no promete conformidad y aclara que es una comodidad', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/en-linea');
  await abrirPanel(page);
  const texto = await page.locator('panel-accesibilidad dialog').innerText();
  assert.match(texto, /comodidad/);
  assert.match(texto, /no hacen accesible la web/);
  assert.match(texto, /no se envía a ningún sitio/);
  assert.doesNotMatch(texto, /conforme con|cumple la normativa|100 ?%\s*accesible/i);
  const enlace = page.locator('panel-accesibilidad .aviso a');
  assert.equal(await enlace.getAttribute('href'), '/accesibilidad');
  await ctx.close();
});

test('escapa atributos: ignora URLs peligrosas', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/maliciosa');
  assert.equal(await page.locator('panel-accesibilidad .aviso a').count(), 0);
  await ctx.close();
});

test('elige idioma por el lang de la página', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/ingles');
  assert.equal(await page.locator('panel-accesibilidad h2').innerText(), 'Display preferences');
  await ctx.close();
});

test('evento y API públicos', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/en-linea');
  await page.evaluate(() => {
    window.__det = null;
    document.addEventListener('panel-accesibilidad:cambio', (e) => { window.__det = e.detail; });
    document.querySelector('panel-accesibilidad').abrir();
  });
  await cambiar(page, 'animaciones', true);
  assert.equal((await page.evaluate(() => window.__det)).animaciones, true);
  await page.evaluate(() => document.querySelector('panel-accesibilidad').cerrar());
  assert.equal(await page.locator('panel-accesibilidad dialog').isVisible(), false);
  await ctx.close();
});

test('la página de prueba y el formulario de contacto pasan la auditoría', { timeout: 240000 }, async () => {
  const { ctx, page } = await abrir('/demo.html');
  assert.deepEqual(await violaciones(page), []);
  const plantilla = readFileSync(path.join(PANEL, '..', 'plantillas', 'contacto-accesibilidad.html'), 'utf8');
  srv.estado.rutas['/contacto'] = { texto: plantilla };
  await page.goto(`${srv.base}/contacto`);
  assert.deepEqual(await violaciones(page), []);
  await ctx.close();
});

test('envoltorio de React: monta, pasa props y escucha cambios', { timeout: 120000 }, async () => {
  const esbuild = await import('esbuild');
  const salida = await esbuild.build({
    stdin: {
      contents: `
        import { createRoot } from 'react-dom/client';
        import { createElement, useState } from 'react';
        import Panel from './react/PanelAccesibilidad.jsx';
        function App() {
          const [visible, ponerVisible] = useState(true);
          window.ocultar = () => ponerVisible(false);
          return visible ? createElement(Panel, { declaracion: '/accesibilidad', alCambiar: (p) => { window.ultimo = p; } }) : null;
        }
        createRoot(document.getElementById('raiz')).render(createElement(App));`,
      resolveDir: PANEL,
      loader: 'jsx',
    },
    bundle: true,
    format: 'esm',
    write: false,
    jsx: 'automatic',
    loader: { '.jsx': 'jsx' },
    outdir: 'x',
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
    absWorkingDir: path.join(DIR, '..'),
    nodePaths: [path.join(DIR, '..', 'node_modules')],
  });
  srv.estado.rutas['/react.js'] = { tipo: 'text/javascript', texto: salida.outputFiles[0].text };
  srv.estado.rutas['/react'] = pagina('<div id="raiz"></div><script type="module" src="/react.js"></script>');
  assert.match(REACT, /\.jsx$/);

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(`${srv.base}/react`);
  await page.waitForFunction(() => document.querySelector('panel-accesibilidad')?.shadowRoot?.querySelector('dialog'));
  assert.equal(await page.locator('panel-accesibilidad').getAttribute('modo'), 'en-linea');
  assert.equal(await page.locator('panel-accesibilidad').count(), 1, 'el script no duplica el panel');
  await abrirPanel(page);
  await cambiar(page, 'subrayado', true);
  assert.equal((await page.evaluate(() => window.ultimo)).subrayado, true);
  await page.evaluate(() => window.ocultar());
  await page.waitForFunction(() => !document.querySelector('panel-accesibilidad'));
  assert.deepEqual(errores, []);
  await ctx.close();
});
