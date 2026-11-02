import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { comparacionMarkdown, comparar, crearLineaBase, huellaDe, regresiones, rutaDe, selectorEstable } from '../lib/comparar.mjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'comparar.mjs');
const p = (regla, selector, pagina = 'https://a.es/x', impacto = 'serious') => ({ regla, selector, pagina, impacto, criterios: ['1.1.1'] });
const inf = (problemas, paginas = ['https://a.es/x'], extra = {}) => ({
  fecha: '2026-01-01', paginas: paginas.map((url) => ({ url })), problemas, revisar: [], configuracion: { anchos: [1280] }, ...extra,
});

test('la ruta ignora el dominio: local y producción son comparables', () => {
  assert.equal(rutaDe('http://localhost:3000/a/'), '/a');
  assert.equal(rutaDe('https://mi.es/a'), '/a');
  assert.equal(rutaDe('https://mi.es/'), '/');
  assert.equal(rutaDe('https://mi.es/producto/1234'), '/producto/:id');
  assert.equal(huellaDe(p('x', 'a', 'http://localhost/z')), huellaDe(p('x', 'a', 'https://mi.es/z')));
});

test('el selector estable ignora posiciones y clases generadas', () => {
  assert.equal(selectorEstable('ul > li:nth-child(3) > a'), 'ul > li > a');
  assert.equal(selectorEstable('.tarjeta.css-1a2b3c > a'), '.tarjeta > a');
  assert.equal(selectorEstable('.Boton_raiz__3xYz9 > span'), '> span');
  assert.equal(selectorEstable('.tarjeta__titulo > span'), '.tarjeta__titulo > span', 'BEM no es una clase generada');
  assert.equal(selectorEstable('.tarjeta > a'), '.tarjeta > a');
});

test('distingue arreglados, nuevos y persistentes', () => {
  const c = comparar(
    inf([p('image-alt', 'img.a'), p('label', 'input')]),
    inf([p('label', 'input'), p('link-name', 'a')]),
  );
  assert.equal(c.resumen.arreglados, 1);
  assert.equal(c.resumen.nuevos, 1);
  assert.equal(c.resumen.persisten, 1);
  assert.equal(c.veredicto.codigo, 'corregir-regresion');
  assert.match(comparacionMarkdown(c), /Regresiones|regresiones/);
});

test('cuenta instancias: una lista que crece es una regresión aunque el selector sea igual', () => {
  const c = comparar(
    inf([p('image-alt', 'li:nth-child(1) img')]),
    inf([p('image-alt', 'li:nth-child(1) img'), p('image-alt', 'li:nth-child(2) img')]),
  );
  assert.equal(c.resumen.nuevos, 1);
  assert.equal(c.resumen.arreglados, 0);
});

test('un selector que cambia en la misma regla y página no es arreglo y regresión a la vez', () => {
  const c = comparar(inf([p('image-alt', 'img')]), inf([p('image-alt', 'img[src$="x.png"]'), p('image-alt', '.otra')]));
  assert.equal(c.resumen.nuevos, 1);
  assert.equal(c.resumen.arreglados, 0);
  assert.equal(c.resumen.persisten, 1);
  const base = crearLineaBase(inf([p('image-alt', 'img')]));
  const r = regresiones(base, inf([p('image-alt', 'img[src$="x.png"]'), p('image-alt', '.otra')]), 'minor');
  assert.equal(r.regresiones.length, 1);
  assert.equal(r.mejoras.length, 0);
});

test('una página que falla no cuenta como arreglada', () => {
  const antes = inf([p('image-alt', 'img', 'https://a.es/y')], ['https://a.es/x', 'https://a.es/y']);
  const despues = { ...inf([], ['https://a.es/x', 'https://a.es/y']) };
  despues.paginas[1].error = 'HTTP 500';
  const c = comparar(antes, despues);
  assert.equal(c.resumen.arreglados, 0);
  assert.equal(c.resumen.sinComprobar, 1);
  assert.equal(c.veredicto.codigo, 'reauditar');
});

test('criterio de parada', () => {
  assert.equal(comparar(inf([p('a', 'x'), p('b', 'y')]), inf([p('a', 'x')])).veredicto.codigo, 'seguir');
  assert.equal(comparar(inf([p('a', 'x')]), inf([p('a', 'x')])).veredicto.codigo, 'escalar');
  const limpio = comparar(inf([p('a', 'x')]), inf([]));
  assert.equal(limpio.veredicto.codigo, 'pasar-a-revision-manual');
  assert.match(limpio.veredicto.texto, /no significa/i);
});

test('avisa si los informes no miran lo mismo', () => {
  const c = comparar(inf([p('a', 'x')], undefined, { configuracion: { excluir: [] } }), inf([], undefined, { configuracion: { excluir: ['#chat'] } }));
  assert.ok(c.avisos.some((a) => /excluye más/.test(a)));
});

test('línea base: conocidos, regresiones, mejoras y páginas sin comprobar', () => {
  const base = crearLineaBase(inf([p('image-alt', 'img'), p('label', 'input', 'https://a.es/x', 'minor')]));
  assert.equal(base.total, 2);
  assert.match(base.aviso, /no de fallos aceptables/);

  assert.equal(regresiones(base, inf([p('image-alt', 'img'), p('label', 'input', 'https://a.es/x', 'minor')]), 'minor').regresiones.length, 0);

  const nuevo = regresiones(base, inf([p('image-alt', 'img'), p('image-alt', 'img'), p('label', 'input', 'https://a.es/x', 'minor')]), 'minor');
  assert.equal(nuevo.regresiones.length, 1);

  const leve = regresiones(base, inf([p('image-alt', 'img'), p('link-name', 'a', 'https://a.es/x', 'minor'), p('label', 'input', 'https://a.es/x', 'minor')]), 'serious');
  assert.equal(leve.regresiones.length, 0, 'bajo el umbral no falla');

  const mejora = regresiones(base, inf([p('image-alt', 'img')]), 'minor');
  assert.equal(mejora.mejoras.length, 1);

  const falta = regresiones(base, inf([], ['https://a.es/otra']), 'minor');
  assert.deepEqual(falta.sinComprobar, ['/x']);
});

test('CLI: código 1 con regresiones, 0 sin ellas y 2 sin ficheros', () => {
  const d = mkdtempSync(path.join(tmpdir(), 'cmp-'));
  const a = path.join(d, 'a.json');
  const b = path.join(d, 'b.json');
  writeFileSync(a, JSON.stringify(inf([p('image-alt', 'img')])));
  writeFileSync(b, JSON.stringify(inf([])));
  const ok = spawnSync(process.execPath, [SCRIPT, a, b, '--salida', path.join(d, 'c.md')], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /pasar-a-revision-manual/);
  assert.equal(spawnSync(process.execPath, [SCRIPT, b, a], { encoding: 'utf8' }).status, 1);
  assert.equal(spawnSync(process.execPath, [SCRIPT, a], { encoding: 'utf8' }).status, 2);
});
