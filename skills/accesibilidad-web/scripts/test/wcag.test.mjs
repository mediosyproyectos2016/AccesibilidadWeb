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
