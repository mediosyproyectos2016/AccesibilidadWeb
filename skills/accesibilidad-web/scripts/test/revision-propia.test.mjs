// Comprobaciones propias en un navegador real, sobre páginas mínimas: foco en
// pseudo-elementos, repeticiones de selector, pausa por sección, imágenes con
// transparencia en modo oscuro y objetivos pequeños.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { servir } from '../ayuda-tests/servidor.mjs';
import { revisarTeclado } from '../lib/teclado.mjs';
import {
  revisarImagenTransparenteOscuro, revisarMovimiento, revisarObjetivosPequenos,
} from '../lib/comprobaciones.mjs';

let browser;
let otroOrigen;
before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser.close();
  if (otroOrigen) await otroOrigen.cerrar();
});

const html = (cuerpo, cabeza = '') => `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Prueba</title><style>body{margin:60px;font:16px sans-serif}${cabeza}</style></head><body>${cuerpo}</body></html>`;

async function conPagina(contenido, opciones, fn) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opciones });
  ctx.setDefaultTimeout(60000);
  const page = await ctx.newPage();
  try {
    await page.setContent(contenido);
    return await fn(page);
  } finally {
    await ctx.close();
  }
}

/* ---------- foco visible en pseudo-elementos ---------- */

const ANILLO_FUERA = html(
  '<div class="w"><a class="b" href="#a">Botón con anillo</a></div><p><a href="#z">Otro enlace</a></p>',
  `.w{display:inline-block}
   .b{position:relative;display:inline-block;padding:10px 16px;background:#eee;color:#000}
   .b:focus-visible{outline:none}
   .b::before{content:'';position:absolute;inset:-16px;border:3px solid #c00;opacity:0}
   .b:focus-visible::before{opacity:1}
   a:focus-visible{outline:3px solid #00f}
   .b:focus-visible{outline:none}`,
);

const ANILLO_RECORTADO = html(
  '<div class="tarjeta"><a class="b" href="#a">Tarjeta</a></div><p><a href="#z">Otro enlace</a></p>',
  `.tarjeta{display:inline-block;overflow:hidden;background:#ddd}
   .b{position:relative;display:block;padding:10px 16px;color:#000;text-decoration:none}
   .b:focus-visible{outline:none}
   .b::after{content:'';position:absolute;inset:-6px;border:3px solid #c00;opacity:0}
   .b:focus-visible::after{opacity:1}
   p a:focus-visible{outline:3px solid #00f}`,
);

const SIN_ANILLO = html(
  '<p><a class="b" href="#a">Sin foco visible</a> <a href="#z">Otro enlace</a></p>',
  'a:focus-visible{outline:none} .b:focus-visible{outline:none}',
);

const reglasDe = (r, regla) => r.hallazgos.filter((h) => h.regla === regla);

test('foco-no-visible: un anillo pintado en ::before fuera de la zona medida no es un fallo', { timeout: 120000 }, async () => {
  const r = await conPagina(ANILLO_FUERA, {}, (page) => revisarTeclado(page, { maxTabs: 6 }));
  assert.deepEqual(reglasDe(r, 'foco-no-visible'), [], JSON.stringify(r.hallazgos));
});

test('foco-no-visible: un anillo en ::after que recorta overflow:hidden es un fallo real', { timeout: 120000 }, async () => {
  const r = await conPagina(ANILLO_RECORTADO, {}, (page) => revisarTeclado(page, { maxTabs: 6 }));
  const f = reglasDe(r, 'foco-no-visible');
  assert.equal(f.length, 1, JSON.stringify(r.hallazgos));
  assert.match(f[0].detalle, /::after.*recorta/, f[0].detalle);
});

test('foco-no-visible: sin ningún anillo sigue siendo un fallo', { timeout: 120000 }, async () => {
  const r = await conPagina(SIN_ANILLO, {}, (page) => revisarTeclado(page, { maxTabs: 6 }));
  assert.ok(reglasDe(r, 'foco-no-visible').length >= 1, JSON.stringify(r.hallazgos));
});

/* ---------- trampa de foco: repeticiones por identidad ---------- */

const TARJETAS = html(
  [1, 2, 3, 4].map((n) => `<div><div><div><div><div><div><article class="t"><a href="#t${n}">Tarjeta ${n}</a></article></div></div></div></div></div></div>`).join('')
  + '<p><a href="#fin">Final</a></p>',
  `.t{position:relative;display:block;margin:12px 0;padding:12px;border:1px solid #888}
   .t a::after{content:'';position:absolute;inset:0}
   a:focus-visible{outline:3px solid #00f}`,
);

test('trampa-foco: tarjetas iguales con enlace estirado y el mismo selector no son una repetición', { timeout: 120000 }, async () => {
  const r = await conPagina(TARJETAS, {}, (page) => revisarTeclado(page, { maxTabs: 12 }));
  assert.deepEqual(reglasDe(r, 'trampa-foco'), [], JSON.stringify(r.hallazgos));
  const textos = r.pasos.map((p) => p.texto);
  for (const t of ['Tarjeta 1', 'Tarjeta 2', 'Tarjeta 3', 'Tarjeta 4', 'Final']) assert.ok(textos.includes(t), `no llega a «${t}»: ${textos.join(' | ')}`);
  assert.equal(new Set(r.pasos.slice(0, 4).map((p) => p.selector)).size, 1, 'el fixture exige selectores iguales');
});

test('trampa-foco: un ciclo real sigue detectándose', { timeout: 120000 }, async () => {
  const ciclo = html('<a id="a" href="#a">Uno</a> <a id="b" href="#b">Dos</a>'
    + '<script>document.getElementById("b").addEventListener("keydown",(e)=>{if(e.key==="Tab"){e.preventDefault();document.getElementById("a").focus();}});</script>',
  'a:focus-visible{outline:3px solid #00f}');
  const r = await conPagina(ciclo, {}, (page) => revisarTeclado(page, { maxTabs: 10 }));
  assert.ok(reglasDe(r, 'trampa-foco').length >= 1, JSON.stringify(r.hallazgos));
});

/* ---------- movimiento sin pausa: control en la sección ---------- */

const ANIMACION = '<div class="gira" style="width:120px;height:120px;background:#06c"></div>';
const ANIDADA = `<div><div><div><div><div><div><div>${ANIMACION}</div></div></div></div></div></div></div>`;
const GIRA = '@keyframes g{to{transform:rotate(1turn)}} .gira{animation:g 2s linear infinite}';
const BOTON = '<button type="button">Pausar animación</button>';

const movimiento = (cuerpo) => conPagina(html(cuerpo, GIRA), {}, (page) => revisarMovimiento(page, { ms: 200 }));
const sinPausa = (r) => r.hallazgos.filter((h) => h.regla === 'movimiento-sin-pausa');

test('movimiento-sin-pausa: el botón de la misma sección, a más de 6 niveles, cuenta', { timeout: 120000 }, async () => {
  const r = await movimiento(`<section>${BOTON}${ANIDADA}</section>`);
  assert.deepEqual(sinPausa(r), [], JSON.stringify(r));
});

test('movimiento-sin-pausa: sigue fallando si el botón está en aria-hidden, en otra sección o no existe', { timeout: 120000 }, async () => {
  for (const [nombre, cuerpo] of [
    ['aria-hidden', `<section><div aria-hidden="true">${BOTON}</div>${ANIDADA}</section>`],
    ['otra sección', `<section>${BOTON}</section><section>${ANIDADA}</section>`],
    ['sin botón', `<section>${ANIDADA}</section>`],
  ]) {
    const r = await movimiento(cuerpo);
    assert.equal(sinPausa(r).length, 1, `${nombre}: ${JSON.stringify(r)}`);
  }
});

/* ---------- imágenes con transparencia sobre fondo oscuro ---------- */

const imagen = (tinta, extra = '') => `<img id="i" width="64" height="64" alt="Producto" ${extra}>
<script>const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='${tinta}';x.beginPath();x.arc(32,32,26,0,7);x.fill();document.getElementById('i').src=c.toDataURL();</script>`;
const OSCURO = 'html{color-scheme:dark} body{background:#111;color:#eee} .caja{padding:8px}';
const imagenes = (cuerpo, cabeza = '') => conPagina(html(cuerpo, OSCURO + cabeza), { colorScheme: 'dark' }, async (page) => {
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
  return revisarImagenTransparenteOscuro(page);
});

test('imagen con transparencia: dibujo oscuro sobre contenedor transparente en modo oscuro', { timeout: 120000 }, async () => {
  const r = await imagenes(`<div class="caja">${imagen('#222')}</div>`);
  assert.equal(r.hallazgos.length, 1, JSON.stringify(r));
  assert.match(r.hallazgos[0].detalle, /fondo oscuro/);
});

test('imagen con transparencia: mix-blend-mode multiply sobre fondo oscuro oscurece aún más el dibujo claro', { timeout: 120000 }, async () => {
  const r = await imagenes(`<div class="caja" style="background:#202020">${imagen('#eee', 'style="mix-blend-mode:multiply"')}</div>`);
  assert.equal(r.hallazgos.length, 1, JSON.stringify(r));
  assert.match(r.hallazgos[0].detalle, /multiply/);
});

test('imagen con transparencia: con fondo claro fijo, o con un dibujo que se distingue, no se avisa', { timeout: 120000 }, async () => {
  const claro = await imagenes(`<div class="caja" style="background:#fff">${imagen('#222')}</div>`);
  assert.deepEqual([claro.hallazgos, claro.revisar], [[], []], JSON.stringify(claro));
  const visible = await imagenes(`<div class="caja">${imagen('#eee')}</div>`);
  assert.deepEqual([visible.hallazgos, visible.revisar], [[], []], JSON.stringify(visible));
});

test('imagen con transparencia: si no se pueden leer sus píxeles queda en «revisar», nunca como fallo', { timeout: 120000 }, async () => {
  // La imagen viene de otro origen sin CORS: el lienzo se «mancha» y no deja leerla.
  const png = await conPagina(html(imagen('#222')), {}, async (page) => {
    await page.waitForFunction(() => document.images[0].complete);
    return page.evaluate(() => document.images[0].src.split(',')[1]);
  });
  otroOrigen = await servir({ '/p.png': (req, res) => { res.writeHead(200, { 'content-type': 'image/png' }); res.end(Buffer.from(png, 'base64')); } });
  const r = await imagenes(`<div class="caja"><img id="i" width="64" height="64" alt="Producto" src="${otroOrigen.base}/p.png"></div>`);
  assert.equal(r.hallazgos.length, 0, JSON.stringify(r));
  assert.equal(r.revisar.length, 1, JSON.stringify(r));
  assert.match(r.revisar[0].detalle, /No se han podido leer sus píxeles/);
});

/* ---------- objetivos menores de 24 px ---------- */

test('objetivos pequeños: lista los sueltos y las casillas de 20 px, y no los enlaces dentro de un texto', { timeout: 120000 }, async () => {
  const cuerpo = `<p>Un texto largo con un <a href="#en">enlace en línea</a> dentro de la frase y más palabras después.</p>
    <div style="display:flex;gap:2px"><button type="button" style="width:20px;height:20px" aria-label="Uno">1</button><button type="button" style="width:20px;height:20px" aria-label="Dos">2</button></div>
    <p style="margin-top:80px"><input type="checkbox" id="c" style="width:20px;height:20px;appearance:none;border:1px solid #000"></p>`;
  const r = await conPagina(html(cuerpo), {}, (page) => revisarObjetivosPequenos(page));
  const sel = r.revisar.map((x) => x.selector).join(' | ');
  assert.ok(!/enlace/.test(sel) && !r.revisar.some((x) => /en línea/.test(x.detalle)), `no debe listar el enlace en línea: ${sel}`);
  assert.equal(r.revisar.length, 3, JSON.stringify(r.revisar));
  assert.ok(r.revisar.slice(0, 2).every((x) => /no lo salva la excepción/.test(x.detalle)), 'primero los que no salva la separación');
  assert.match(r.revisar[2].detalle, /excepción de separación/);
  assert.match(r.revisar[2].detalle, /20×20/);
});

/* ---------- falsos positivos con clip-path y con un diálogo encima ---------- */

test('texto-sobre-media: una etiqueta con clip-path y fondo sólido no mide la foto de sus esquinas', { timeout: 120000 }, async () => {
  const foto = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><rect width="300" height="100" fill="#08f"/></svg>');
  const cuerpo = `<div style="position:relative;width:300px;height:100px"><img alt="" width="300" height="100" style="position:absolute;inset:0" src="data:image/svg+xml,${foto}">
    <span class="tag" style="position:relative;display:inline-block;margin:30px;padding:8px 14px 8px 22px;background:#cf2638;color:#fff;clip-path:polygon(8px 0,100% 0,100% 100%,8px 100%,0 50%)">OFERTA</span></div>`;
  const { revisarTextoSobreMedia } = await import('../lib/comprobaciones.mjs');
  const r = await conPagina(html(cuerpo), {}, async (page) => {
    await page.waitForFunction(() => document.images[0].complete);
    return revisarTextoSobreMedia(page);
  });
  assert.deepEqual([r.hallazgos, r.revisar], [[], []], JSON.stringify(r));
});

test('zoom-200-cabecera: una cabecera fija tapada por un diálogo modal no cuenta', { timeout: 120000 }, async () => {
  const { revisarZoom200 } = await import('../lib/comprobaciones.mjs');
  const pagina = (abrir) => html('<header style="position:fixed;top:0;left:0;right:0;height:250px;background:#ddd">Cabecera</header><dialog id="d" style="width:200px"><button>Entrar</button></dialog>'
    + `<p>Contenido</p>${abrir ? '<script>document.getElementById("d").showModal()</script>' : ''}`);
  const sin = await conPagina(pagina(false), {}, revisarZoom200);
  assert.equal(sin.revisar.length, 1, 'sin diálogo la cabecera sí se avisa');
  const con = await conPagina(pagina(true), {}, revisarZoom200);
  assert.deepEqual(con.revisar, [], JSON.stringify(con));
});

test('target-size: lo que queda debajo de un diálogo modal abierto no se mide, lo del diálogo sí', { timeout: 200000 }, async () => {
  const { spawn } = await import('node:child_process');
  const { mkdtempSync, readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const AUDITAR = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'auditar.mjs');
  const botones = (n) => Array.from({ length: n }, (_, i) => `<button type="button" style="width:14px;height:14px;padding:0" aria-label="B${i}">x</button>`).join('');
  const fondo = `<main><h1>Prueba</h1><p>${botones(3)}</p></main>`;
  const srv = await servir({
    '/sin': { texto: html(fondo) },
    '/con': { texto: html(`${fondo}<dialog id="d" aria-label="Edad"><p>¿Tienes 18 años?</p><button type="button" style="width:60px;height:40px">Sí</button></dialog><script>document.getElementById("d").showModal()</script>`) },
    '/dentro': { texto: html(`${fondo}<dialog id="d" aria-label="Edad"><p>${botones(3)}</p></dialog><script>document.getElementById("d").showModal()</script>`) },
  });
  const auditar = (ruta) => new Promise((ok) => {
    const salida = mkdtempSync(path.join(tmpdir(), 'a11y-'));
    const h = spawn(process.execPath, [AUDITAR, '--rapido', '--sin-teclado', '--sin-reflow', '--anchos', '1280', '--esquemas', 'claro', '--espera', '0', '--salida', salida, `${srv.base}${ruta}`]);
    h.on('close', () => ok(JSON.parse(readFileSync(path.join(salida, 'informe.json'), 'utf8'))));
  });
  try {
    const tiene = (i) => i.problemas.some((p) => p.regla === 'target-size');
    assert.ok(tiene(await auditar('/sin')), 'sin diálogo se mide');
    assert.ok(!tiene(await auditar('/con')), 'el diálogo está encima: no se miden los botones de debajo');
    assert.ok(tiene(await auditar('/dentro')), 'dentro del diálogo sí se mide');
  } finally {
    await srv.cerrar();
  }
});
