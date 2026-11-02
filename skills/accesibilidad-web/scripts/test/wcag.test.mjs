import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ARREGLOS, CRITERIOS, clausulaEN, compararCriterios, criteriosDeEtiquetas,
  etiquetaACriterio, normalizarUmbral,
} from '../lib/wcag.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('etiquetas de axe a criterios WCAG', () => {
  assert.equal(etiquetaACriterio('wcag143'), '1.4.3');
  assert.equal(etiquetaACriterio('wcag1410'), '1.4.10');
  assert.equal(etiquetaACriterio('wcag2411'), '2.4.11');
  assert.equal(etiquetaACriterio('wcag21aa'), null);
  assert.equal(etiquetaACriterio('wcag2a'), null);
  assert.deepEqual(criteriosDeEtiquetas(['cat.color', 'wcag2aa', 'wcag143', 'EN-9.1.4.3']), ['1.4.3']);
});

test('cláusulas EN 301 549', () => {
  assert.equal(clausulaEN('1.4.3'), '9.1.4.3');
  assert.equal(clausulaEN('2.5.8'), null, 'los criterios nuevos de WCAG 2.2 no están en la V3.2.1');
  assert.equal(clausulaEN('9.9.9'), null);
});

test('orden numérico de criterios', () => {
  assert.deepEqual(['1.4.10', '2.1.1', '1.4.3'].sort(compararCriterios), ['1.4.3', '1.4.10', '2.1.1']);
});

test('umbral en español e inglés', () => {
  assert.equal(normalizarUmbral('grave'), 'serious');
  assert.equal(normalizarUmbral('crítico'), 'critical');
  assert.equal(normalizarUmbral('moderate'), 'moderate');
  assert.equal(normalizarUmbral('ninguno'), null);
  assert.throws(() => normalizarUmbral('fatal'));
});

test('hay 56 criterios (55 de WCAG 2.2 A/AA + 4.1.1)', () => {
  assert.equal(Object.keys(CRITERIOS).length, 56);
});

test('cada receta enlazada existe', () => {
  for (const [regla, { receta }] of Object.entries(ARREGLOS)) {
    assert.ok(existsSync(path.join(SKILL, receta)), `${regla}: falta ${receta}`);
  }
});

test('toda regla de axe que se ejecuta tiene arreglo y receta', async () => {
  const { createRequire } = await import('node:module');
  const axe = createRequire(import.meta.url)('axe-core');
  const etiquetas = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
  const faltan = axe.getRules(etiquetas).map((r) => r.ruleId).filter((id) => !ARREGLOS[id]);
  assert.deepEqual(faltan, []);
});

test('toda comprobación propia tiene título y arreglo, y el tipo de arreglo es coherente', async () => {
  const { TITULOS_PROPIOS } = await import('../lib/informe.mjs');
  const { CRITERIOS_PROPIOS, ARREGLO_AUTOMATICO, CRITERIO_HUMANO, tipoArreglo } = await import('../lib/wcag.mjs');
  const { IDS_ARREGLOS, ID_CSS_GLOBAL } = await import('../lib/arreglos.mjs');
  for (const regla of Object.keys(CRITERIOS_PROPIOS)) {
    assert.ok(TITULOS_PROPIOS[regla], `sin título: ${regla}`);
    assert.ok(ARREGLOS[regla], `sin arreglo: ${regla}`);
  }
  for (const id of Object.values(ARREGLO_AUTOMATICO)) assert.ok([...IDS_ARREGLOS, ID_CSS_GLOBAL].includes(id), id);
  for (const regla of Object.keys(ARREGLO_AUTOMATICO)) assert.equal(CRITERIO_HUMANO[regla], undefined, regla);
  assert.equal(tipoArreglo('regla-inventada'), 'asistido');
});
