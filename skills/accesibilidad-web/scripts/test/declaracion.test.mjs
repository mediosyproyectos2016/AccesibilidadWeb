import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluar, generarDeclaracion } from '../lib/declaracion.mjs';
import { COMPROBACIONES, crearRevision, estadoRevision, respuestaValida } from '../lib/manual.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DECL = path.join(DIR, '..', 'declaracion.mjs');
const REV = path.join(DIR, '..', 'revision.mjs');

const ahora = new Date().toISOString();
const informe = (problemas = [], extra = {}) => ({
  fecha: ahora, version: '0.2.0', axeVersion: '4.14',
  paginas: [{ url: 'https://a.es/' }], problemas, revisar: [], ...extra,
});
const fallo = { regla: 'image-alt', pagina: 'https://a.es/', criterios: ['1.1.1'], descripcion: 'Las imágenes deben tener texto alternativo' };
const completa = (estado = 'ok', cambios = {}) => {
  const r = crearRevision(informe());
  for (const c of r.comprobaciones) {
    Object.assign(c, { estado, comprobadoPor: 'Ana', metodo: 'NVDA + Firefox' }, cambios);
  }
  return r;
};
const datos = {
  entidad: 'Mi Tienda', sector: 'privado', ambito: 'https://a.es', norma: 'EN 301 549', metodo: 'autoevaluación',
  formulario: 'https://a.es/f', correo: 'a@a.es', telefono: '900', plazo: '15 días hábiles', comunidad: 'X', autoridad: 'Y',
};

test('sin revisión manual nunca hay situación de cumplimiento, aunque axe no vea fallos', () => {
  const r = generarDeclaracion(informe(), null, datos);
  assert.equal(r.evaluacion.situacion, 'sin-determinar');
  assert.equal(r.publicable, false);
  assert.match(r.markdown, /BORRADOR\. NO PUBLICAR/);
  assert.match(r.html, /BORRADOR\. NO PUBLICAR/);
  assert.doesNotMatch(r.markdown, /plenamente conforme|parcialmente conforme/i);
});

test('con revisión a medias tampoco', () => {
  const rev = crearRevision(informe());
  Object.assign(rev.comprobaciones[0], { estado: 'ok', comprobadoPor: 'Ana', metodo: 'teclado' });
  const r = generarDeclaracion(informe(), rev, datos);
  assert.equal(r.evaluacion.situacion, 'sin-determinar');
  assert.doesNotMatch(r.markdown, /plenamente conforme/i);
});

test('todo limpio y revisado sigue sin ser «plena» hasta que alguien la asuma', () => {
  const sin = generarDeclaracion(informe(), completa(), datos);
  assert.equal(sin.evaluacion.situacion, 'sin-confirmar');
  assert.equal(sin.publicable, false);
  assert.doesNotMatch(sin.markdown, /plenamente conforme con/i);

  const con = generarDeclaracion(informe(), completa(), datos, { confirmacion: 'Ana Pérez, directora' });
  assert.equal(con.evaluacion.situacion, 'plena');
  assert.match(con.markdown, /plenamente conforme con EN 301 549\. Lo confirma Ana Pérez/);
  assert.equal(con.publicable, true);
});

test('la confirmación no vale si hay fallos o el informe es viejo', () => {
  const conFallo = evaluar(informe([fallo]), completa(), { confirmacion: 'Ana' });
  assert.equal(conFallo.situacion, 'parcial');
  const viejo = evaluar(informe([], { fecha: '2020-01-01T00:00:00Z' }), completa(), { confirmacion: 'Ana' });
  assert.equal(viejo.situacion, 'sin-determinar');
  const caida = evaluar(informe([], { paginas: [{ url: 'x', error: '500' }] }), completa(), { confirmacion: 'Ana' });
  assert.equal(caida.situacion, 'sin-determinar');
});

test('con fallos conocidos y revisión completa: parcial, con la lista real', () => {
  const r = generarDeclaracion(informe([fallo]), completa(), datos);
  assert.equal(r.evaluacion.situacion, 'parcial');
  assert.match(r.markdown, /parcialmente conforme con EN 301 549/);
  assert.match(r.markdown, /Las imágenes deben tener texto alternativo \(1\.1\.1 Contenido no textual\)/);
  assert.match(r.markdown, /\{\{PLAZO_O_PLAN_DE_CORRECCIÓN\}\}/);
  assert.equal(r.publicable, false, 'falta el plan de corrección');
  const no = generarDeclaracion(informe([fallo]), completa(), datos, { situacion: 'no-conforme' });
  assert.match(no.markdown, /no es conforme con EN 301 549/);
});

test('un fallo de la revisión manual aparece en la declaración', () => {
  const rev = completa();
  Object.assign(rev.comprobaciones.find((c) => c.id === 'multimedia'), { estado: 'fallo', notas: 'Los vídeos no tienen subtítulos' });
  const r = generarDeclaracion(informe(), rev, datos);
  assert.equal(r.evaluacion.situacion, 'parcial');
  assert.match(r.markdown, /Los vídeos no tienen subtítulos/);
});

test('los fallos sin criterio (buenas prácticas) no cuentan como falta de conformidad', () => {
  const ev = evaluar(informe([{ ...fallo, regla: 'region', criterios: [] }]), completa(), { confirmacion: 'Ana' });
  assert.equal(ev.situacion, 'plena');
});

test('los datos que faltan quedan marcados y bloquean la publicación', () => {
  const r = generarDeclaracion(informe(), completa(), {}, { confirmacion: 'Ana' });
  assert.ok(r.marcadores.includes('NOMBRE_ENTIDAD'));
  assert.equal(r.publicable, false);
  assert.match(r.markdown, /\[SECTOR PÚBLICO\]/);
});

test('el HTML escapa los textos', () => {
  const r = generarDeclaracion(informe([{ ...fallo, descripcion: '<script>x</script>' }]), completa(), datos);
  assert.doesNotMatch(r.html, /<script>x/);
  assert.match(r.html, /&lt;script&gt;x/);
  assert.match(r.html, /<html lang="es">/);
});

test('un agente no puede aprobar lo que exige a una persona', () => {
  const lector = COMPROBACIONES.find((c) => c.id === 'lector-pantalla');
  assert.equal(lector.persona, true);
  const base = { id: 'lector-pantalla', persona: true, comprobadoPor: 'IA', metodo: 'x' };
  assert.equal(respuestaValida({ ...base, estado: 'ok', esAgente: true }), false);
  assert.equal(respuestaValida({ ...base, estado: 'no-aplica', esAgente: true }), false);
  assert.equal(respuestaValida({ ...base, estado: 'fallo', esAgente: true }), true, 'sí puede registrar un fallo');
  assert.equal(respuestaValida({ ...base, estado: 'ok', esAgente: false }), true);
  assert.equal(respuestaValida({ ...base, estado: 'ok', comprobadoPor: '' }), false, 'sin autor no cuenta');
  assert.equal(respuestaValida({ id: 'personas-reales', estado: 'no-aplica', comprobadoPor: 'A', metodo: 'x', persona: true }), false, 'probar con personas no es opcional');
});

test('la revisión conserva las respuestas al regenerarse', () => {
  const r = crearRevision(informe());
  Object.assign(r.comprobaciones[0], { estado: 'ok', comprobadoPor: 'Ana', metodo: 'teclado' });
  const otra = crearRevision(informe(), r);
  assert.equal(otra.comprobaciones[0].estado, 'ok');
  assert.equal(estadoRevision(otra).respondidas, 1);
});

test('CLI: flujo completo y rechazo de la confirmación', () => {
  const d = mkdtempSync(path.join(tmpdir(), 'dec-'));
  const inf = path.join(d, 'informe.json');
  const rev = path.join(d, 'revision.json');
  const dat = path.join(d, 'datos.json');
  writeFileSync(inf, JSON.stringify(informe()));
  writeFileSync(dat, JSON.stringify(datos));
  const correr = (s, ...a) => spawnSync(process.execPath, [s, ...a], { encoding: 'utf8' });

  assert.equal(correr(REV, 'crear', '--informe', inf, '--salida', rev).status, 0);
  assert.ok(existsSync(path.join(d, 'revision.md')));
  assert.equal(correr(REV, 'estado', rev).status, 1);

  // Borrador sin revisión: código 1. La confirmación se rechaza con código 2.
  assert.equal(correr(DECL, '--informe', inf, '--revision', rev, '--datos', dat, '--salida', d).status, 1);
  assert.match(readFileSync(path.join(d, 'declaracion.md'), 'utf8'), /BORRADOR/);
  const rech = correr(DECL, '--informe', inf, '--revision', rev, '--datos', dat, '--salida', path.join(d, 'x'), '--confirmar-plena-conformidad', 'Ana');
  assert.equal(rech.status, 2);
  assert.match(rech.stderr, /no se puede declarar plena conformidad/);
  assert.equal(existsSync(path.join(d, 'x', 'declaracion.md')), false);

  // Marcar exige autor y método; un agente no cierra lo que exige a una persona.
  assert.equal(correr(REV, 'marcar', rev, '--id', 'lector-pantalla', '--estado', 'ok').status, 2);
  assert.equal(correr(REV, 'marcar', rev, '--id', 'lector-pantalla', '--estado', 'ok', '--por', 'IA', '--metodo', 'x', '--agente').status, 1);
  assert.equal(correr(REV, 'marcar', rev, '--id', 'inventada', '--estado', 'ok', '--por', 'A', '--metodo', 'x').status, 2);

  for (const c of COMPROBACIONES) {
    assert.equal(correr(REV, 'marcar', rev, '--id', c.id, '--estado', 'ok', '--por', 'Ana', '--metodo', 'NVDA').status, 0);
  }
  assert.equal(correr(REV, 'estado', rev).status, 0);
  const ok = correr(DECL, '--informe', inf, '--revision', rev, '--datos', dat, '--salida', d, '--confirmar-plena-conformidad', 'Ana Pérez');
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(readFileSync(path.join(d, 'declaracion.md'), 'utf8'), /plenamente conforme/);
  assert.doesNotMatch(readFileSync(path.join(d, 'declaracion.md'), 'utf8'), /BORRADOR/);
});
