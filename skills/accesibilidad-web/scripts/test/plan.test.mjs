import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generarPlan, planMarkdown } from '../lib/plan.mjs';
import { indexarProyecto, localizar, pistasDe } from '../lib/localizar.mjs';
import { detectarStack } from '../lib/stack.mjs';
import { agrupar } from '../lib/informe.mjs';
import { tipoArreglo } from '../lib/wcag.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(DIR, 'fixtures', 'proyecto');
const SCRIPT = path.join(DIR, '..', 'priorizar.mjs');

const h = (regla, selector, pagina, impacto, html = '') => ({
  regla, selector, pagina, impacto, html, origen: 'axe', criterios: ['1.1.1'], descripcion: `Regla ${regla}`, contexto: 'c',
});

function informe() {
  return {
    fecha: '2026-01-01', version: '0',
    paginas: [{ url: 'https://a.es/' }, { url: 'https://a.es/b' }],
    revisar: [],
    problemas: agrupar([
      h('color-contrast', '.tarjeta-oferta', 'https://a.es/', 'serious', '<a class="tarjeta-oferta" href="/ofertas-de-temporada">Ver todas las ofertas</a>'),
      h('image-alt', '.logo-marca', 'https://a.es/', 'critical', '<img class="logo-marca" src="/logo-mi-tienda.png">'),
      h('image-alt', '.logo-marca', 'https://a.es/b', 'critical', '<img class="logo-marca" src="/logo-mi-tienda.png">'),
      h('html-has-lang', 'html', 'https://a.es/', 'serious'),
      h('region', 'aside', 'https://a.es/', 'moderate'),
      h('region', 'aside', 'https://a.es/b', 'moderate'),
    ]),
  };
}

test('ordena por impacto y detecta componentes compartidos', () => {
  const plan = generarPlan(informe());
  assert.deepEqual(plan.tareas.map((t) => t.regla), ['image-alt', 'color-contrast', 'html-has-lang', 'region']);
  assert.equal(plan.tareas[0].compartido, true);
  assert.equal(plan.tareas[1].compartido, false);
  assert.equal(plan.tareas[0].orden, 1);
});

test('separa lo automático, lo asistido y lo que exige criterio humano', () => {
  assert.equal(tipoArreglo('html-has-lang'), 'automatico');
  assert.equal(tipoArreglo('image-alt'), 'humano');
  assert.equal(tipoArreglo('color-contrast'), 'humano');
  assert.equal(tipoArreglo('region'), 'asistido');
  const plan = generarPlan(informe());
  assert.deepEqual(plan.resumen, { automatico: 1, asistido: 1, humano: 2 });
  const alt = plan.tareas.find((t) => t.regla === 'image-alt');
  assert.match(alt.decisionHumana, /nunca lo generes/);
});

test('saca pistas útiles del HTML y descarta clases generadas o genéricas', () => {
  const textos = pistasDe({ html: '<a id="x12" class="css-1ab2c3 flex tarjeta-oferta" href="/ofertas" aria-label="Ver ofertas">Ver</a>', selector: '.tarjeta-oferta' }).map((p) => p.texto);
  assert.ok(textos.includes('x12'));
  assert.ok(textos.includes('tarjeta-oferta'));
  assert.ok(textos.includes('/ofertas'));
  assert.ok(textos.includes('Ver ofertas'));
  assert.ok(!textos.includes('css-1ab2c3'));
  assert.ok(!textos.includes('flex'));
});

test('localiza el fichero fuente probable', () => {
  const indice = indexarProyecto(FIXTURE);
  const [u] = localizar(indice, { html: '<img class="logo-marca" src="/logo-mi-tienda.png">', selector: '.logo-marca' });
  assert.equal(u.fichero, 'src/Cabecera.jsx');
  assert.equal(u.linea, 7);
  assert.equal(localizar(indice, { html: '<a href="/nada-de-nada">xq</a>', selector: 'a' }).length, 0);
  const c = localizar(indice, { html: '<a class="tarjeta-oferta">zz</a>', selector: '.tarjeta-oferta' }, { conEstilos: true });
  assert.ok(c.some((x) => x.fichero === 'estilos.css'), 'mira las hojas de estilo cuando es un fallo de estilo');
});

test('detecta stacks', () => {
  const crear = (ficheros) => {
    const d = mkdtempSync(path.join(tmpdir(), 'stk-'));
    for (const [f, t] of Object.entries(ficheros)) {
      mkdirSync(path.dirname(path.join(d, f)), { recursive: true });
      writeFileSync(path.join(d, f), t);
    }
    return d;
  };
  const dep = (n) => JSON.stringify({ dependencies: { [n]: '1' } });
  assert.equal(detectarStack(crear({ 'package.json': dep('next'), 'app/layout.tsx': '' })).id, 'next');
  assert.deepEqual(detectarStack(crear({ 'package.json': dep('next'), 'app/layout.tsx': '' })).ficherosRaiz, ['app/layout.tsx']);
  assert.equal(detectarStack(crear({ 'package.json': dep('astro') })).id, 'astro');
  assert.equal(detectarStack(crear({ 'package.json': dep('vue') })).id, 'vue');
  assert.equal(detectarStack(crear({ 'layout/theme.liquid': '' })).id, 'shopify');
  assert.equal(detectarStack(crear({ 'functions.php': '', 'style.css': '' })).id, 'wordpress');
  assert.equal(detectarStack(crear({ 'index.html': '' })).id, 'html');
  assert.equal(detectarStack(crear({ 'x.txt': '' })).id, 'desconocido');
});

test('toda guía de framework que apunta el detector existe', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'stk-'));
  writeFileSync(path.join(dir, 'index.html'), '');
  const raiz = path.join(DIR, '..', '..');
  assert.doesNotThrow(() => readFileSync(path.join(raiz, detectarStack(dir).guia)));
  const fuente = readFileSync(path.join(DIR, '..', 'lib', 'stack.mjs'), 'utf8');
  for (const m of fuente.matchAll(/guia: '([^']+)'/g)) {
    assert.doesNotThrow(() => readFileSync(path.join(raiz, m[1])), m[1]);
  }
});

test('el Markdown dice qué hacer y no promete accesibilidad', () => {
  const md = planMarkdown(generarPlan(informe(), { indice: indexarProyecto(FIXTURE), stack: detectarStack(FIXTURE) }));
  assert.match(md, /Fichero probable .*src\/Cabecera\.jsx:7/);
  assert.match(md, /Componente compartido/);
  assert.match(md, /Se arregla en la plantilla común/);
  assert.match(md, /no una web accesible/);
  assert.match(planMarkdown(generarPlan({ problemas: [], paginas: [] })), /revisión manual/);
});

test('CLI', () => {
  const d = mkdtempSync(path.join(tmpdir(), 'pl-'));
  const f = path.join(d, 'informe.json');
  writeFileSync(f, JSON.stringify(informe()));
  const r = spawnSync(process.execPath, [SCRIPT, f, '--proyecto', FIXTURE], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(readFileSync(path.join(d, 'plan.json'), 'utf8')).tareas.length, 4);
  assert.equal(spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' }).status, 2);
});
