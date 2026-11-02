import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aplicarArreglos, aplicarCssGlobal, diffUnificado, limpiarViewport } from '../lib/arreglos.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(DIR, '..', 'arreglar.mjs');
const FIXTURE = path.join(DIR, 'fixtures', 'proyecto');
const arr = (nombre, texto, ops) => aplicarArreglos(nombre, texto, ops).texto;

function copia() {
  const d = mkdtempSync(path.join(tmpdir(), 'arr-'));
  cpSync(FIXTURE, d, { recursive: true });
  // Se crea aquí porque .gitignore excluye node_modules del repositorio.
  mkdirSync(path.join(d, 'node_modules', 'lib'), { recursive: true });
  writeFileSync(path.join(d, 'node_modules', 'lib', 'x.html'), '<html><body>No tocar</body></html>\n');
  return d;
}

test('lang: solo con idioma indicado y sin pisar plantillas dinámicas', () => {
  assert.equal(arr('a.html', '<html><head>', {}), '<html><head>');
  assert.equal(arr('a.html', '<html class="x">', { idioma: 'es' }), '<html lang="es" class="x">');
  assert.equal(arr('a.html', '<html lang="en">', { idioma: 'es' }), '<html lang="en">');
  assert.equal(arr('a.php', '<html <?php language_attributes(); ?>>', { idioma: 'es' }), '<html <?php language_attributes(); ?>>');
  assert.equal(arr('a.tsx', '<html {...props}>', { idioma: 'es' }), '<html {...props}>');
  assert.equal(arr('a.tsx', '<Html>', { idioma: 'es' }), '<Html lang="es">');
  assert.equal(arr('a.html', '<html lang="es_ES">'), '<html lang="es-ES">');
});

test('viewport: quita el bloqueo y conserva el resto', () => {
  assert.equal(limpiarViewport('width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'), 'width=device-width, initial-scale=1');
  assert.equal(limpiarViewport('width=device-width, initial-scale=1'), null);
  assert.equal(limpiarViewport('width=device-width, user-scalable=yes'), null);
  assert.equal(
    arr('a.html', '<meta name="viewport" content="width=device-width, user-scalable=no">'),
    '<meta name="viewport" content="width=device-width">',
  );
  assert.equal(
    arr('a.html', '<meta content="width=device-width, maximum-scale=1" name="viewport">'),
    '<meta content="width=device-width" name="viewport">',
  );
  assert.equal(arr('a.html', '<meta name="description" content="user-scalable=no">'), '<meta name="description" content="user-scalable=no">');
});

test('tabindex: los positivos pasan a 0; 0 y -1 no se tocan', () => {
  assert.equal(arr('a.html', '<a tabindex="5">'), '<a tabindex="0">');
  assert.equal(arr('a.jsx', '<a tabIndex={5}>'), '<a tabIndex={0}>');
  assert.equal(arr('a.jsx', '<a tabIndex="2">'), '<a tabIndex="0">');
  assert.equal(arr('a.html', '<a tabindex="0"><b tabindex="-1">'), '<a tabindex="0"><b tabindex="-1">');
  assert.equal(arr('a.jsx', '<a tabIndex={n}>'), '<a tabIndex={n}>');
});

test('marquee y blink dejan el contenido sin el movimiento', () => {
  assert.equal(arr('a.html', '<marquee behavior="x">Hola</marquee><blink>Ya</blink>'), '<div>Hola</div><span>Ya</span>');
});

test('outline: lo quita si no hay sustituto y respeta las técnicas correctas', () => {
  assert.equal(arr('a.css', 'a { outline: none; color: red; }').includes('outline'), false);
  assert.equal(arr('a.css', '*:focus { outline: 0 }').includes('outline'), false);
  const nofv = ':focus:not(:focus-visible) { outline: none; }';
  assert.equal(arr('a.css', nofv), nofv);
  const sust = 'a:focus { outline: none; box-shadow: 0 0 0 3px blue; }';
  assert.equal(arr('a.css', sust), sust);
  // Solo en hojas de estilo.
  assert.equal(arr('a.html', '<style>a { outline: none; }</style>'), '<style>a { outline: none; }</style>');
});

test('no toca nada que dependa del significado', () => {
  const t = '<img src="a.png"><button></button><input type="text"><title></title>';
  assert.equal(arr('a.html', t, { idioma: 'es' }), t);
});

test('la hoja global recibe los bloques una sola vez', () => {
  const una = aplicarCssGlobal('body { margin: 0 }\n');
  assert.match(una, /prefers-reduced-motion/);
  assert.match(una, /:focus-visible/);
  assert.equal(aplicarCssGlobal(una), una);
  // Si la web ya lo tiene, no se duplica.
  const ya = '@media (prefers-reduced-motion: reduce) { a { transition: none } } :focus-visible { outline: 2px solid }';
  assert.equal(aplicarCssGlobal(ya), ya);
});

test('el diff tiene cabeceras y bloques correctos', () => {
  const d = diffUnificado('a.txt', 'uno\ndos\ntres\n', 'uno\nDOS\ntres\n');
  assert.match(d, /^diff --git a\/a\.txt b\/a\.txt\n--- a\/a\.txt\n\+\+\+ b\/a\.txt\n@@ -1,3 \+1,3 @@\n uno\n-dos\n\+DOS\n tres\n/);
  assert.equal(diffUnificado('a.txt', 'x', 'x'), '');
});

test('por defecto no modifica nada y el diff se aplica limpio con git', () => {
  const d = copia();
  const original = readFileSync(path.join(d, 'index.html'), 'utf8');
  const diff = path.join(d, 'arreglos.diff');
  const r = spawnSync(process.execPath, [SCRIPT, '--proyecto', d, '--idioma', 'es', '--css-global', 'estilos.css', '--salida', diff], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /No se ha modificado nada/);
  assert.equal(readFileSync(path.join(d, 'index.html'), 'utf8'), original);
  const texto = readFileSync(diff, 'utf8');
  assert.match(texto, /\+<html lang="es">/);

  spawnSync('git', ['init', '-q'], { cwd: d });
  const check = spawnSync('git', ['apply', '--check', 'arreglos.diff'], { cwd: d, encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr);
  const aplica = spawnSync('git', ['apply', 'arreglos.diff'], { cwd: d, encoding: 'utf8' });
  assert.equal(aplica.status, 0, aplica.stderr);
  assert.match(readFileSync(path.join(d, 'index.html'), 'utf8'), /<html lang="es">/);
  assert.match(readFileSync(path.join(d, 'estilos.css'), 'utf8'), /prefers-reduced-motion/);
});

test('--aplicar modifica; ignora node_modules; repetir no cambia nada', () => {
  const d = copia();
  const diff = path.join(d, 'a.diff');
  const args = [SCRIPT, '--proyecto', d, '--idioma', 'es', '--salida', diff, '--aplicar'];
  assert.equal(spawnSync(process.execPath, args, { encoding: 'utf8' }).status, 0);
  assert.match(readFileSync(path.join(d, 'index.html'), 'utf8'), /<html lang="es">/);
  assert.match(readFileSync(path.join(d, 'src', 'Cabecera.jsx'), 'utf8'), /tabIndex=\{0\}/);
  assert.match(readFileSync(path.join(d, 'node_modules', 'lib', 'x.html'), 'utf8'), /<html>/, 'node_modules no se toca');
  const dos = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.match(dos.stdout, /No hay arreglos/);
  assert.equal(readFileSync(diff, 'utf8'), '');
});

test('valida argumentos', () => {
  const corre = (...a) => spawnSync(process.execPath, [SCRIPT, ...a], { encoding: 'utf8' }).status;
  assert.equal(corre(), 2);
  assert.equal(corre('--proyecto', 'no-existe-en-ningun-sitio'), 2);
  const d = copia();
  assert.equal(corre('--proyecto', d, '--idioma', 'español!'), 2);
  assert.equal(corre('--proyecto', d, '--solo', 'magia'), 2);
  assert.equal(corre('--proyecto', d, '--css-global', '../fuera.css', '--salida', path.join(d, 'x.diff')), 2);
  assert.equal(existsSync(path.join(d, 'x.diff')), false);
});
