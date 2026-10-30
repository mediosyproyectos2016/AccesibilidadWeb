// Prueba de extremo a extremo con páginas locales (necesita Chromium de Playwright).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(DIR, '..', 'auditar.mjs');
const url = (f) => pathToFileURL(path.join(DIR, 'fixtures', f)).href;

function auditar(args) {
  const salida = mkdtempSync(path.join(tmpdir(), 'a11y-'));
  const r = spawnSync(process.execPath,
    [SCRIPT, '--anchos', '1280', '--esquemas', 'claro', '--espera', '0', '--salida', salida, ...args],
    { encoding: 'utf8', timeout: 120000 });
  const log = (r.stdout ?? '') + (r.stderr ?? '');
  const informe = JSON.parse(readFileSync(path.join(salida, 'informe.json'), 'utf8'));
  return { codigo: r.status, informe, md: readFileSync(path.join(salida, 'informe.md'), 'utf8'), log };
}

test('detecta los fallos de una página mala y sale con código 1', () => {
  const { codigo, informe, md, log } = auditar([url('mala.html')]);
  assert.equal(codigo, 1, log);
  const reglas = Object.keys(informe.resumen.porRegla);
  for (const r of ['image-alt', 'button-name', 'label', 'html-has-lang', 'document-title', 'color-contrast', 'reflow-320', 'foco-no-visible']) {
    assert.ok(reglas.includes(r), `falta ${r} en ${reglas.join(', ')}`);
  }
  assert.match(md, /1\.1\.1 Contenido no textual/);
});

test('una página correcta no supera el umbral', () => {
  const { codigo, informe, log } = auditar([url('buena.html')]);
  assert.equal(codigo, 0, log + JSON.stringify(informe.resumen));
  assert.equal(informe.resumen.porImpacto.critical, 0);
  assert.equal(informe.resumen.porImpacto.serious, 0);
});

test('umbral ninguno nunca falla por problemas', () => {
  const { codigo } = auditar(['--umbral', 'ninguno', url('mala.html')]);
  assert.equal(codigo, 0);
});

test('sin URL sale con código 2', () => {
  const r = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(r.status, 2);
});
