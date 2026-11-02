// Del fallo a la web arreglada, de extremo a extremo y con navegador real.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servir } from '../ayuda-tests/servidor.mjs';
import { fraccionSinContraste, muestraPorSecciones, relacionContraste, urlsDeSitemap, validarEstados } from '../lib/comprobaciones.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const FX = (f) => path.join(DIR, 'fixtures', f);
const SCRIPTS = path.join(DIR, '..');
const AUDITAR = path.join(SCRIPTS, 'auditar.mjs');
const tmp = () => mkdtempSync(path.join(tmpdir(), 'a11y-'));

let srv;
before(async () => {
  srv = await servir({
    '/': FX('tienda-con-fallos.html'),
    '/trampa': FX('trampa.html'),
    '/casos': FX('sin-falsos-positivos.html'),
    '/sitemap.xml': { tipo: 'application/xml', texto: '' },
  });
});
after(() => srv.cerrar());

/** Sin bloquear el bucle de eventos: el servidor de los tests vive en este proceso. */
function auditar(args, cwd = SCRIPTS) {
  const salida = tmp();
  return new Promise((ok) => {
    const h = spawn(process.execPath, [AUDITAR, '--anchos', '1280', '--esquemas', 'claro', '--espera', '0', '--salida', salida, ...args], { cwd });
    let log = '';
    h.stdout.on('data', (d) => { log += d; });
    h.stderr.on('data', (d) => { log += d; });
    h.on('close', (codigo) => {
      const fich = path.join(salida, 'informe.json');
      ok({ codigo, log, salida, informe: existsSync(fich) ? JSON.parse(readFileSync(fich, 'utf8')) : null });
    });
  });
}

const reglas = (i) => Object.keys(i.resumen.porRegla);

test('la tienda con fallos activa las comprobaciones que axe no cubre', { timeout: 300000 }, async () => {
  const { codigo, informe, log } = await auditar([`${srv.base}/`]);
  assert.equal(codigo, 1, log);
  const r = reglas(informe);
  for (const esperada of [
    'movimiento-sin-pausa', 'movimiento-reducido-ignorado', 'modal-sin-foco', 'modal-foco-escapa', 'modal-esc',
    'desplegable-sin-estado', 'tabindex-positivo', 'espaciado-recorta', 'zoom-200-desborde', 'reflow-320',
    'texto-sobre-media', 'target-size', 'foco-no-visible', 'image-alt', 'html-has-lang', 'meta-viewport',
  ]) assert.ok(r.includes(esperada), `falta ${esperada} en ${r.join(', ')}`);
  const carrusel = informe.problemas.find((p) => p.regla === 'movimiento-sin-pausa' && /carrusel/i.test(p.selector));
  assert.ok(carrusel, 'no detecta el carrusel que cambia solo');
  assert.ok(informe.problemas.every((p) => p.huella), 'todo hallazgo lleva huella');
  // axe analiza también lo que solo aparece al abrir.
  assert.ok(informe.problemas.some((p) => p.contextos.some((c) => /diálogo|desplegable/.test(c))));
});

test('la misma tienda arreglada queda sin fallos detectables', { timeout: 300000 }, async () => {
  srv.estado.rutas['/arreglada'] = FX('tienda-arreglada.html');
  const { codigo, informe, log } = await auditar([`${srv.base}/arreglada`]);
  assert.equal(codigo, 0, log);
  assert.deepEqual(informe.problemas.map((p) => `${p.regla} ${p.selector}`), []);
});

test('bucle completo: auditar, priorizar, arreglar, comparar, revisar y declarar', { timeout: 500000 }, async () => {
  // Misma URL con la versión mala y con la arreglada, como en un proyecto real.
  srv.estado.rutas['/bucle'] = FX('tienda-con-fallos.html');
  const antes = await auditar(['--umbral', 'ninguno', `${srv.base}/bucle`]);
  const iAntes = path.join(antes.salida, 'informe.json');
  assert.ok(antes.informe.problemas.length > 10, antes.log);

  const correr = (s, ...a) => spawnSync(process.execPath, [path.join(SCRIPTS, s), ...a], { encoding: 'utf8' });
  const plan = correr('priorizar.mjs', iAntes);
  assert.equal(plan.status, 0, plan.stderr);
  const md = readFileSync(path.join(antes.salida, 'plan.md'), 'utf8');
  assert.match(md, /image-alt/);
  assert.match(md, /Decisión humana/);

  srv.estado.rutas['/bucle'] = FX('tienda-arreglada.html');
  const despues = await auditar(['--umbral', 'ninguno', `${srv.base}/bucle`]);
  const iDespues = path.join(despues.salida, 'informe.json');
  assert.deepEqual(despues.informe.problemas, [], 'la versión arreglada queda limpia');

  const cmp = correr('comparar.mjs', iAntes, iDespues, '--salida', path.join(despues.salida, 'c.md'));
  assert.equal(cmp.status, 0, cmp.stdout + cmp.stderr);
  assert.match(cmp.stdout, /pasar-a-revision-manual/);
  assert.match(readFileSync(path.join(despues.salida, 'c.md'), 'utf8'), /Arreglados: \*\*\d+\*\*/);

  // Sin fallos detectables, la declaración sigue siendo un borrador sin situación.
  const rev = path.join(despues.salida, 'revision.json');
  assert.equal(correr('revision.mjs', 'crear', '--informe', iDespues, '--salida', rev).status, 0);
  const dec = correr('declaracion.mjs', '--informe', iDespues, '--revision', rev);
  assert.equal(dec.status, 1, dec.stdout);
  const texto = readFileSync(path.join(despues.salida, 'declaracion.md'), 'utf8');
  assert.match(texto, /BORRADOR/);
  assert.doesNotMatch(texto, /plenamente conforme/i);

  // Y su HTML pasa la auditoría.
  srv.estado.rutas['/declaracion'] = path.join(despues.salida, 'declaracion.html');
  const a = await auditar([`${srv.base}/declaracion`]);
  assert.deepEqual(a.informe.problemas.filter((p) => p.impacto === 'critical' || p.impacto === 'serious'), []);
});

test('el panel pasa la auditoría completa de la skill, con teclado y su diálogo abierto', { timeout: 300000 }, async () => {
  const panel = path.join(SCRIPTS, '..', 'panel');
  srv.estado.rutas['/demo.html'] = path.join(panel, 'demo.html');
  srv.estado.rutas['/panel-accesibilidad.js'] = path.join(panel, 'panel-accesibilidad.js');
  const { codigo, informe, log } = await auditar(['--anchos', '1280,390', `${srv.base}/demo.html`]);
  assert.equal(codigo, 0, log);
  assert.deepEqual(informe.problemas.map((p) => `${p.regla} ${p.selector}`), []);
  assert.ok(informe.teclado[Object.keys(informe.teclado)[0]].some((p) => p.selector.includes('panel-accesibilidad')), 'el recorrido llega al panel');
});

test('--tecla, --almacenamiento y --concurrencia', { timeout: 200000 }, async () => {
  const aviso = '<!doctype html><html lang="es"><title>Aviso</title><main><h1>Aviso</h1><img id="f" src="x.png"></main><script>' +
    "if (localStorage.getItem('visto') === 'si') document.getElementById('f').alt = 'Foto';" +
    "addEventListener('keydown', (e) => { if (e.key === 'Escape') document.getElementById('f').alt = 'Foto'; });" +
    '</script></html>';
  srv.estado.rutas['/aviso'] = { texto: aviso };
  const opc = ['--rapido', '--sin-teclado', '--sin-reflow'];
  const sin = await auditar([...opc, `${srv.base}/aviso`]);
  assert.ok(reglas(sin.informe).includes('image-alt'));
  const tecla = await auditar([...opc, '--tecla', 'Escape', `${srv.base}/aviso`]);
  assert.ok(!reglas(tecla.informe).includes('image-alt'), tecla.log);
  const alm = await auditar([...opc, '--almacenamiento', 'visto=si', `${srv.base}/aviso`]);
  assert.ok(!reglas(alm.informe).includes('image-alt'), alm.log);
  const conc = await auditar([...opc, '--concurrencia', '3', `${srv.base}/aviso`, `${srv.base}/trampa`, `${srv.base}/casos`]);
  assert.equal(conc.informe.paginas.filter((p) => !p.error).length, 3, conc.log);
});

test('reintenta un tiempo agotado y lista aparte la página que no se pudo auditar', { timeout: 200000 }, async () => {
  let intentos = 0;
  srv.estado.rutas['/lenta'] = (req, res) => {
    intentos++;
    if (intentos === 1) return; // la primera vez no responde
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html lang="es"><title>Lenta</title><main><h1>Lenta</h1></main></html>');
  };
  const ok = await auditar(['--rapido', '--sin-teclado', '--sin-reflow', '--timeout', '3000', `${srv.base}/lenta`]);
  assert.equal(ok.informe.paginas[0].error, null, ok.log);
  assert.ok(intentos >= 2);

  srv.estado.rutas['/prohibida'] = (req, res) => { res.writeHead(403); res.end('no'); };
  const parcial = await auditar(['--rapido', '--sin-teclado', '--sin-reflow', `${srv.base}/lenta`, `${srv.base}/prohibida`]);
  const md = readFileSync(path.join(parcial.salida, 'informe.md'), 'utf8');
  assert.match(md, /1 página\(s\) no se pudieron auditar/);
  assert.match(md, /no se rodea/);
  assert.match(md, /## No comprobado/);
  assert.match(md, /lector de pantalla/);
});

test('detecta una trampa de foco en ciclo', { timeout: 120000 }, async () => {
  const { informe } = await auditar(['--rapido', `${srv.base}/trampa`]);
  assert.ok(reglas(informe).includes('trampa-foco'), reglas(informe).join(', '));
});

test('no da falsos positivos con iframes, shadow DOM ni texto legible sobre imagen', { timeout: 200000 }, async () => {
  const { informe } = await auditar([`${srv.base}/casos`]);
  const r = reglas(informe);
  for (const no of ['trampa-foco', 'texto-sobre-media', 'foco-no-visible']) assert.ok(!r.includes(no), `sobra ${no}: ${JSON.stringify(informe.problemas.filter((p) => p.regla === no))}`);
});

test('--estados audita un estado interactivo y avisa si no se puede reproducir', { timeout: 200000 }, async () => {
  const d = tmp();
  const estados = path.join(d, 'estados.json');
  writeFileSync(estados, JSON.stringify([
    { nombre: 'Aviso abierto', pasos: [{ clic: '#abrir' }, { esperar: 100 }] },
    { nombre: 'Imposible', pasos: [{ clic: '#no-existe-en-esta-pagina' }] },
  ]));
  const { informe, log } = await auditar(['--rapido', '--sin-teclado', '--sin-reflow', '--estados', estados, `${srv.base}/`]);
  assert.ok(informe.problemas.some((p) => p.contextos.some((c) => c.includes('estado «Aviso abierto»'))), log);
  assert.ok(informe.problemas.some((p) => p.regla === 'modal-sin-foco'), 'revisa el diálogo abierto por el estado');
  assert.ok(informe.paginas[0].avisos.some((a) => a.includes('Imposible')));
});

test('--sitemap toma las páginas del sitemap', { timeout: 200000 }, async () => {
  srv.estado.rutas['/sitemap.xml'].texto = `<urlset xmlns="x"><url><loc>${srv.base}/trampa</loc></url><url><loc>${srv.base}/casos</loc></url></urlset>`;
  const { informe, log } = await auditar(['--rapido', '--sin-teclado', '--sin-reflow', '--sitemap', `${srv.base}/sitemap.xml`]);
  assert.deepEqual(informe.paginas.map((p) => new URL(p.url).pathname).sort(), ['/casos', '/trampa'], log);
});

test('línea base: pasa con fallos conocidos y falla con regresiones', { timeout: 300000 }, async () => {
  const d = tmp();
  const base = path.join(d, 'base.json');
  const opc = ['--rapido', '--sin-teclado', '--sin-reflow'];
  srv.estado.rutas['/lb'] = { texto: '<!doctype html><html lang="es"><title>Línea base</title><main><h1>Hola</h1><img src="x.png"></main></html>' };
  const g = await auditar([...opc, '--guardar-linea-base', base, `${srv.base}/lb`]);
  assert.equal(g.codigo, 0, g.log);
  assert.equal(JSON.parse(readFileSync(base, 'utf8')).total, 1);

  const igual = await auditar([...opc, '--linea-base', base, `${srv.base}/lb`]);
  assert.equal(igual.codigo, 0, igual.log);

  srv.estado.rutas['/lb'].texto = '<!doctype html><html lang="es"><title>Línea base</title><main><h1>Hola</h1><img src="x.png"><img class="otra" src="y.png"></main></html>';
  const peor = await auditar([...opc, '--linea-base', base, `${srv.base}/lb`]);
  assert.equal(peor.codigo, 1, peor.log);
  assert.equal(peor.informe.lineaBase.regresiones.length, 1);

  const sinFichero = await auditar([...opc, '--linea-base', path.join(d, 'no.json'), `${srv.base}/lb`]);
  assert.equal(sinFichero.codigo, 2);
});

test('contraste: fórmula WCAG y fracción de píxeles', () => {
  assert.ok(Math.abs(relacionContraste([0, 0, 0], [255, 255, 255]) - 21) < 0.01);
  assert.equal(relacionContraste([10, 20, 30], [10, 20, 30]), 1);
  const blanco = new Array(40).fill(255);
  assert.equal(fraccionSinContraste(blanco, [0, 0, 0], 4.5), 0);
  assert.equal(fraccionSinContraste(blanco, [255, 255, 255], 4.5), 1);
});

test('sitemap y muestra por secciones', () => {
  assert.deepEqual(urlsDeSitemap('<urlset><url><loc> https://a.es/x?a=1&amp;b=2 </loc></url></urlset>'), ['https://a.es/x?a=1&b=2']);
  const urls = [1, 2, 3, 4, 5].map((n) => `https://a.es/producto/${n}`).concat('https://a.es/blog/a', 'https://a.es/contacto');
  const m = muestraPorSecciones(urls, 3);
  assert.equal(m.length, 3);
  assert.equal(new Set(m.map((u) => new URL(u).pathname.split('/')[1])).size, 3);
});

test('valida el fichero de estados', () => {
  assert.throws(() => validarEstados({}), /lista/);
  assert.throws(() => validarEstados([{ nombre: 'x', pasos: [{ volar: 1 }] }]), /Paso desconocido/);
  assert.equal(validarEstados([{ nombre: 'x', pasos: [{ tecla: 'Escape' }] }]).length, 1);
});

test('la ayuda documenta las opciones nuevas', () => {
  const r = spawnSync(process.execPath, [AUDITAR, '--ayuda'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  for (const o of ['--sitemap', '--estados', '--linea-base', '--guardar-linea-base', '--sesion', '--rapido']) assert.ok(r.stdout.includes(o), o);
});
