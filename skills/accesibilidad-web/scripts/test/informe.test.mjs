import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agrupar, generarMarkdown, hallazgosDeAxe, resumir, superaUmbral } from '../lib/informe.mjs';

const axeFalso = {
  violations: [{
    id: 'image-alt', impact: 'critical', tags: ['wcag2a', 'wcag111', 'EN-9.1.1.1'],
    help: 'Las imágenes deben tener texto alternativo', helpUrl: 'https://example.org',
    nodes: [
      { target: ['img.logo'], html: '<img class="logo">', impact: 'critical', failureSummary: 'x' },
      { target: ['img.foto'], html: '<img class="foto">', impact: 'critical', failureSummary: 'x' },
    ],
  }],
};

test('agrupa el mismo elemento visto en varios contextos', () => {
  const h = [
    ...hallazgosDeAxe(axeFalso, 'https://a.es/', '1280 px · claro'),
    ...hallazgosDeAxe(axeFalso, 'https://a.es/', '390 px · claro'),
  ];
  const p = agrupar(h);
  assert.equal(p.length, 2);
  assert.deepEqual(p[0].contextos, ['1280 px · claro', '390 px · claro']);
  assert.deepEqual(p[0].en, ['9.1.1.1']);
  assert.match(p[0].receta, /imagenes\.md$/);
});

test('resumen y umbral', () => {
  const p = agrupar(hallazgosDeAxe(axeFalso, 'https://a.es/', 'c'));
  const r = resumir(p);
  assert.equal(r.problemas, 2);
  assert.equal(r.porImpacto.critical, 2);
  assert.equal(r.porCriterio['1.1.1'], 2);
  assert.equal(superaUmbral(p, 'serious'), true);
  assert.equal(superaUmbral(p, null), false);
  assert.equal(superaUmbral([], 'minor'), false);
});

test('el Markdown cita criterio y cláusula EN', () => {
  const problemas = agrupar(hallazgosDeAxe(axeFalso, 'https://a.es/', '1280 px · claro'));
  const md = generarMarkdown({
    version: '0.0.0', axeVersion: '4', fecha: 'hoy',
    configuracion: { anchos: [1280], esquemas: ['claro'], teclado: false, reflow: false },
    paginas: [{ url: 'https://a.es/' }], resumen: resumir(problemas), problemas, revisar: [], teclado: {},
  });
  assert.match(md, /1\.1\.1 Contenido no textual \(A\)/);
  assert.match(md, /9\.1\.1\.1/);
  assert.match(md, /No sustituye la revisión manual/);
});
