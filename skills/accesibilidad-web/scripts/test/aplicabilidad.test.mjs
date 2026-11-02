import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aMarkdown, evaluar, evaluarTamano, normalizar, PREGUNTAS } from '../lib/aplicabilidad.mjs';
import { COMUNIDADES, REVISADO_ES } from '../lib/normativa/es.mjs';
import { paquetePara } from '../lib/normativa/index.mjs';
import { generarDeclaracion } from '../lib/declaracion.mjs';
import { crearRevision } from '../lib/manual.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(DIR, '..', 'aplicabilidad.mjs');
const ahora = new Date('2026-11-02T12:00:00Z');
const ev = (r) => evaluar(r, { ahora });

const privado = { titular: 'privado', destinatarios: 'consumidores', comunidad: 'MD' };
const pyme = { personas: 40, volumen: 5_000_000, balance: 4_000_000, grupo: 'no' };
const micro = { personas: 3, volumen: 200_000, balance: 100_000, grupo: 'no' };

// El mismo árbol para cualquier web: cada fila son hechos, sin tipos de negocio en el motor.
const CASOS = [
  ['tienda en línea', { ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular', contraprestacion: 'dinero' }, 'aplica', 'alta', 'obligado'],
  ['marketplace con pago en la web', { ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'terceros', contraprestacion: 'dinero' }, 'aplica', 'media', 'obligado'],
  ['reservas o citas en línea', { ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular', contraprestacion: 'dinero' }, 'aplica', 'alta', 'obligado'],
  ['SaaS para consumidores', { ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular', contraprestacion: 'dinero' }, 'aplica', 'alta', 'obligado'],
  ['SaaS solo para empresas, comprobado', { ...privado, ...pyme, destinatarios: 'empresas', soloEmpresasVerificado: 'si' }, 'no aplica', 'alta', 'voluntaria'],
  ['B2B que no comprueba quién compra', { ...privado, ...pyme, destinatarios: 'empresas', soloEmpresasVerificado: 'no' }, 'dudoso', 'media', 'prudente'],
  ['banca', { ...privado, ...pyme, sector: ['banca'] }, 'aplica', 'alta', 'obligado'],
  ['transporte de viajeros', { ...privado, ...pyme, sector: ['transporte'] }, 'aplica', 'alta', 'obligado'],
  ['transporte urbano sin venta', { ...privado, ...pyme, sector: ['transporte-urbano'], contrato: 'no' }, 'no aplica', 'media', 'voluntaria'],
  ['transporte urbano que vende billetes', { ...privado, ...pyme, sector: ['transporte-urbano'], contrato: 'en-la-web', contraparte: 'titular' }, 'aplica', 'alta', 'obligado'],
  ['red social, solo en España', { ...privado, ...pyme, sector: ['red-social'] }, 'aplica', 'media', 'obligado'],
  ['medio con suscripción', { ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular', contraprestacion: 'dinero' }, 'aplica', 'alta', 'obligado'],
  ['medio o blog con publicidad', { ...privado, ...pyme, contrato: 'no', interaccion: 'no' }, 'no aplica', 'alta', 'voluntaria'],
  ['web corporativa', { ...privado, ...pyme, contrato: 'no', interaccion: 'no' }, 'no aplica', 'alta', 'voluntaria'],
  ['enlaces sin cobrar ni petición', { ...privado, ...pyme, contrato: 'redirige', remunerado: 'no', interaccion: 'no' }, 'no aplica', 'media', 'voluntaria'],
  ['blog con enlaces de afiliación', { ...privado, ...pyme, contrato: 'redirige', remunerado: 'si', interaccion: 'no' }, 'dudoso', 'baja', 'prudente'],
  ['comparador con afiliación', { ...privado, ...pyme, contrato: 'redirige', contraparte: 'terceros', remunerado: 'si', interaccion: 'si' }, 'dudoso', 'media', 'prudente'],
  ['solicitud de presupuesto', { ...privado, ...pyme, contrato: 'pasos-previos' }, 'dudoso', 'baja', 'prudente'],
  ['ONG con donaciones', { ...privado, ...pyme, actividadEconomica: 'no', contrato: 'en-la-web' }, 'dudoso', 'baja', 'prudente'],
  ['ONG que solo informa', { ...privado, ...pyme, actividadEconomica: 'no', contrato: 'no' }, 'no aplica', 'alta', 'voluntaria'],
  ['alta gratuita sin datos', { ...privado, ...pyme, contrato: 'en-la-web', contraprestacion: 'gratis' }, 'dudoso', 'baja', 'prudente'],
  ['servicio pagado con datos', { ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular', contraprestacion: 'datos' }, 'aplica', 'media', 'obligado'],
  ['autónomo microempresa con tienda', { ...privado, ...micro, contrato: 'en-la-web', contraparte: 'titular' }, 'no aplica', 'alta', 'voluntaria-micro'],
  ['microempresa con servicio dudoso', { ...privado, ...micro, contrato: 'redirige', remunerado: 'si', interaccion: 'si' }, 'no aplica', 'alta', 'voluntaria-micro'],
  ['administración pública informativa', { titular: 'publico', destinatarios: 'consumidores', contrato: 'no', comunidad: 'MD' }, 'aplica', 'alta', 'sector-publico'],
  ['empresa pública dependiente', { titular: 'dependiente', destinatarios: 'consumidores', contrato: 'no', comunidad: 'MD' }, 'aplica', 'media', 'sector-publico'],
  ['privada con financiación pública de la web', { ...privado, ...pyme, contrato: 'no', financiacionPublica: 'si' }, 'aplica', 'media', 'financiacion-publica'],
  ['concesionaria de un servicio público', { ...privado, ...pyme, contrato: 'no', gestionaServicioPublico: 'si' }, 'aplica', 'media', 'financiacion-publica'],
];

for (const [nombre, respuestas, veredicto, certeza, variante] of CASOS) {
  test(`aplicabilidad: ${nombre}`, () => {
    const x = ev(respuestas);
    assert.equal(x.veredicto, veredicto);
    assert.equal(x.certeza, certeza);
    assert.equal(x.declaracion.variante, variante);
    assert.ok(x.revisado, 'siempre lleva fecha de revisión');
    assert.match(x.aviso, /no asesoramiento jurídico/);
  });
}

test('aplicabilidad: umbral de microempresa según la ley, sin sumar ni redondear', () => {
  const P = paquetePara('ES');
  const t = (r) => evaluarTamano({ grupo: 'no', ...r }, P).categoria;
  assert.equal(t({ personas: 9, volumen: 2_000_000 }), 'micro');
  assert.equal(t({ personas: 10, volumen: 100 }), 'no-micro');
  assert.equal(t({ personas: 4, volumen: 3_000_000, balance: 1_000_000 }), 'micro', 'basta volumen o balance');
  assert.equal(t({ personas: 4, volumen: 3_000_000, balance: 3_000_000 }), 'no-micro');
  assert.equal(t({ personas: 4, volumen: 3_000_000 }), 'desconocido', 'falta el balance, que podría salvarla');
  assert.equal(t({ volumen: 100 }), 'desconocido');
  assert.equal(t({ personas: 2, volumen: 100, grupo: 'si' }), 'desconocido', 'el grupo suma');
  assert.equal(t({ personas: 2, volumen: 100, grupo: 'si', datosAgregados: 'si' }), 'micro');
  assert.equal(evaluarTamano({ personas: 2, volumen: 100 }, P).provisional, true, 'sin saber si hay grupo es provisional');
  assert.equal(t({ personas: 2, volumen: 100, controlPublico: 'si' }), 'no-micro');
});

test('aplicabilidad: sin tamaño, da los dos escenarios y no afirma nada', () => {
  const x = ev({ ...privado, contrato: 'en-la-web', contraparte: 'titular' });
  assert.equal(x.veredicto, 'dudoso');
  assert.deepEqual(x.escenarios.map((e) => e.veredicto), ['no aplica', 'aplica']);
  assert.equal(x.declaracion.variante, 'prudente');
  assert.ok(x.faltan.some((f) => f.id === 'personas'));
});

test('aplicabilidad: sin tamaño pero fuera de ámbito, el tamaño no importa', () => {
  const x = ev({ ...privado, contrato: 'no', interaccion: 'no' });
  assert.equal(x.veredicto, 'no aplica');
  assert.equal(x.escenarios, null);
});

test('aplicabilidad: la microempresa queda exenta solo de los servicios', () => {
  const x = ev({ ...privado, ...micro, contrato: 'en-la-web', productos: 'si' });
  assert.equal(x.normas.productosYServicios.veredicto, 'no aplica');
  assert.equal(x.normas.productos.veredicto, 'aplica');
  assert.deepEqual(x.obligaciones, []);
});

test('aplicabilidad: sin confirmar si hay grupo, la exención no se menciona en la declaración', () => {
  const x = ev({ ...privado, personas: 3, volumen: 100, contrato: 'en-la-web' });
  assert.equal(x.veredicto, 'no aplica');
  assert.equal(x.certeza, 'media');
  assert.equal(x.declaracion.variante, 'voluntaria');
  assert.ok(x.declaracion.avisos.some((a) => /sin confirmar/.test(a)));
  assert.doesNotMatch(x.declaracion.introduccion, /microempresa/);
});

test('aplicabilidad: el dudoso siempre da los dos argumentos y una recomendación', () => {
  for (const [, r, veredicto] of CASOS) {
    if (veredicto !== 'dudoso') continue;
    const x = ev(r);
    assert.ok(x.argumentos?.aFavor.length, 'a favor');
    assert.ok(x.argumentos?.enContra.length, 'en contra');
    assert.ok(x.recomendacion);
    for (const a of [...x.argumentos.aFavor, ...x.argumentos.enContra]) assert.ok(a.tipo, 'cada argumento dice de qué tipo es');
  }
});

test('aplicabilidad: ningún caso sin norma ni criterio oficial se presenta como certeza alta', () => {
  const x = ev({ ...privado, ...pyme, contrato: 'redirige', remunerado: 'si', interaccion: 'si' });
  assert.equal(x.veredicto, 'dudoso');
  assert.equal(x.tendencia, 'aplica');
  assert.match(x.recomendacion, /no certeza/);
});

test('aplicabilidad: falta de datos, nunca «aplica» sin saber si hay consumidores', () => {
  const x = ev({ titular: 'privado', ...pyme, contrato: 'en-la-web', contraparte: 'titular' });
  assert.equal(x.veredicto, 'dudoso');
  assert.ok(x.faltan.some((f) => f.id === 'destinatarios'));
  const vacio = ev({});
  assert.equal(vacio.veredicto, 'dudoso');
  assert.ok(vacio.faltan.length > 3);
});

test('aplicabilidad: las obligaciones citan artículo y enlace', () => {
  const x = ev({ ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular' });
  const articulos = x.obligaciones.map((o) => o.articulo);
  for (const a of ['art. 13.2', 'art. 13.4', 'art. 13.7', 'art. 16 y anexo V', 'art. 15', 'anexo I, sec. IV, g)']) assert.ok(articulos.includes(a), a);
  for (const o of x.obligaciones) assert.match(o.url, /^https:\/\/www\.boe\.es/);
  assert.ok(x.plazos.some((p) => /28-06-2030/.test(p.texto)));
  assert.ok(x.sanciones.resumen.some((s) => /1\.000\.000/.test(s)));
});

test('aplicabilidad: autoridad por comunidad, sin inventar ninguna', () => {
  assert.equal(Object.keys(COMUNIDADES).length, 19, '17 comunidades, Ceuta y Melilla');
  for (const [codigo, c] of Object.entries(COMUNIDADES)) {
    assert.ok(['no-consta', 'requerida', 'no-designada', 'designada'].includes(c.estado), codigo);
    assert.match(c.detalle, /\d/, `${codigo}: el estado lleva fecha`);
    if (c.estado !== 'no-consta') assert.match(c.fuente, /^https:/, `${codigo}: lleva fuente`);
    if (c.estado === 'designada') assert.ok(c.autoridad, `${codigo}: designada exige nombre`);
  }
  const vc = ev({ ...privado, ...pyme, contrato: 'en-la-web', comunidad: 'VC' }).autoridad;
  assert.equal(vc.comunidad, 'Comunitat Valenciana');
  assert.equal(vc.estado, 'no-designada');
  assert.match(vc.textoDeclaracion, /no nos consta/);
  assert.match(vc.unidadTecnica.correo, /utac@/);
  assert.equal(vc.domicilioOUsuario.veredicto, 'dudoso');
  const sin = ev({ ...privado, ...pyme, comunidad: undefined, contrato: 'no' });
  assert.ok(sin.faltan.some((f) => f.id === 'comunidad'));
});

test('aplicabilidad: la versión de la norma técnica no se presenta como exigida', () => {
  const texto = ev(privado).normaTecnica.resumen.join(' ');
  assert.match(texto, /No consta citada en el DOUE/);
  assert.match(texto, /no da esa presunción/);
});

test('aplicabilidad: Ley 10/2025 con su propio ámbito', () => {
  const clientela = (r) => ev({ ...privado, contrato: 'en-la-web', contraparte: 'titular', ...r }).normas.atencionClientela;
  assert.equal(clientela({ personas: 300, volumen: 100, balance: 100 }).veredicto, 'aplica');
  assert.equal(clientela({ personas: 20, volumen: 60_000_000, balance: 100 }).veredicto, 'aplica', 'basta un umbral');
  assert.equal(clientela({ ...pyme }).veredicto, 'no aplica');
  assert.equal(clientela({}).veredicto, 'dudoso');
  assert.equal(clientela({ ...micro, sector: ['suministros'] }).veredicto, 'aplica', 'servicio básico, sea cual sea el tamaño');
  assert.equal(clientela({ personas: 300, contrato: 'redirige' }).veredicto, 'dudoso');
  assert.match(clientela({}).plazo, /28-12-2026/);
  assert.ok(clientela({}).obligaciones.some((o) => /15 días hábiles/.test(o)));
});

test('aplicabilidad: preparado para otros países con la Directiva como base', () => {
  const es = ev({ ...privado, ...pyme, sector: ['red-social'] });
  assert.equal(es.veredicto, 'aplica');
  const fr = ev({ ...privado, pais: 'fr', ...pyme, sector: ['red-social'], contrato: 'no' });
  assert.equal(fr.pais, 'FR');
  assert.equal(fr.datosNacionales, false);
  assert.ok(fr.avisos.some((a) => /Directiva/.test(a)));
  assert.ok(fr.avisos.some((a) => /no está en la Directiva/.test(a)), 'la red social es añadido español');
  assert.equal(fr.veredicto, 'no aplica', 'con la Directiva sola, se decide por el resto de hechos');
  assert.equal(fr.certeza, 'baja', 'sin datos nacionales nunca hay certeza');
  const de = ev({ ...privado, pais: 'DE', ...pyme, contrato: 'en-la-web', contraparte: 'titular' });
  assert.equal(de.veredicto, 'aplica');
  assert.equal(de.certeza, 'baja');
  assert.equal(de.autoridad, null);
  assert.equal(de.declaracion.variante, null);
});

test('aplicabilidad: avisa cuando los datos se han quedado viejos', () => {
  const nueva = evaluar(privado, { ahora: new Date(`${REVISADO_ES}T12:00:00Z`) });
  assert.equal(nueva.avisos.length, 0);
  const vieja = evaluar(privado, { ahora: new Date('2027-11-02T12:00:00Z') });
  assert.ok(vieja.avisos.some((a) => /Comprueba las autoridades/.test(a)));
});

test('aplicabilidad: rechaza respuestas con erratas', () => {
  assert.throws(() => normalizar({ contrato: 'tal-vez' }), /valor no válido/);
  assert.throws(() => normalizar({ inventada: 'x' }), /desconocida/);
  assert.throws(() => normalizar({ personas: 'muchas' }), /número/);
  assert.throws(() => normalizar({ sector: 'banca,casino' }), /casino/);
  assert.deepEqual(normalizar({ sector: 'banca, libros', comunidad: 'vc' }), { sector: ['banca', 'libros'], comunidad: 'VC' });
});

test('aplicabilidad: el informe en Markdown dice veredicto, fuentes y fecha', () => {
  const md = aMarkdown(ev({ ...privado, contrato: 'redirige', remunerado: 'si', interaccion: 'si' }));
  assert.match(md, /Veredicto: DUDOSO/);
  assert.match(md, /A favor de que aplique/);
  assert.match(md, /En contra/);
  assert.match(md, /Por escenario de tamaño/);
  assert.match(md, /revisada el 2026-11-02/);
  assert.match(md, /https:\/\/www\.boe\.es/);
  assert.doesNotMatch(md, /undefined/);
});

test('aplicabilidad: el motor no conoce tipos de negocio, solo hechos', () => {
  const motor = readFileSync(path.join(DIR, '..', 'lib', 'aplicabilidad.mjs'), 'utf8').split('// ——— Informe legible')[0];
  const codigo = motor.replace(/'[^'\n]*'|`[^`]*`|\/\/.*$/gm, '');
  for (const palabra of ['comparador', 'marketplace', 'tienda', 'blog', 'saas', 'ong']) {
    assert.doesNotMatch(codigo, new RegExp(`\\b${palabra}\\b`, 'i'), palabra);
  }
});

test('aplicabilidad: en el repositorio no hay datos de ninguna empresa concreta como ejemplo', () => {
  const SKILL = path.join(DIR, '..', '..');
  const textos = [
    path.join(SKILL, 'references', 'aplicabilidad.md'),
    path.join(SKILL, 'scripts', 'lib', 'aplicabilidad.mjs'),
    path.join(SKILL, 'scripts', 'lib', 'normativa', 'es.mjs'),
    path.join(SKILL, 'scripts', 'lib', 'normativa', 'ue.mjs'),
  ].map((f) => readFileSync(f, 'utf8'));
  for (const t of textos) assert.doesNotMatch(t, /Medios y Proyectos|shop\.myp|Alcoy|Alicante/);
  assert.match(textos[0], /Información revisada el 2-11-2026/);
});

test('aplicabilidad: CLI con opciones, JSON y salida a ficheros', () => {
  const d = mkdtempSync(path.join(tmpdir(), 'apl-'));
  const correr = (...a) => spawnSync(process.execPath, [SCRIPT, ...a], { encoding: 'utf8' });

  const json = correr('--titular', 'privado', '--destinatarios', 'consumidores', '--contrato', 'en-la-web', '--contraparte', 'titular', '--personas', '40', '--volumen', '5000000', '--balance', '4000000', '--grupo', 'no', '--comunidad', 'MD', '--json');
  assert.equal(json.status, 0, json.stderr);
  assert.equal(JSON.parse(json.stdout).veredicto, 'aplica');

  const entrada = path.join(d, 'r.json');
  writeFileSync(entrada, JSON.stringify({ titular: 'privado', destinatarios: 'consumidores', contrato: 'no', interaccion: 'no' }));
  const fichero = correr('--entrada', entrada, '--salida', d);
  assert.equal(fichero.status, 0, fichero.stderr);
  assert.match(fichero.stdout, /no aplica/);
  assert.equal(JSON.parse(readFileSync(path.join(d, 'aplicabilidad.json'), 'utf8')).esquema, 1);
  assert.match(readFileSync(path.join(d, 'aplicabilidad.md'), 'utf8'), /NO APLICA/);

  assert.equal(correr('--contrato', 'quizá').status, 2);
  assert.equal(JSON.parse(correr('--preguntas').stdout).length, PREGUNTAS.length);
  assert.match(correr('--comunidades').stdout, /VC\tComunitat Valenciana\tno-designada/);
  assert.match(correr('--ayuda').stdout, /--contrato/);
});

// ——— Declaración según el veredicto ———

const informe = (problemas = []) => ({
  fecha: new Date().toISOString(), version: '0.3.0', axeVersion: '4.14',
  paginas: [{ url: 'https://a.es/' }], problemas, revisar: [],
});
const fallo = { regla: 'image-alt', pagina: 'https://a.es/', criterios: ['1.1.1'], descripcion: 'Imágenes sin texto alternativo' };
const revision = () => {
  const r = crearRevision(informe());
  for (const c of r.comprobaciones) Object.assign(c, { estado: 'ok', comprobadoPor: 'Ana', metodo: 'NVDA' });
  return r;
};
const datos = {
  entidad: 'Mi Web', ambito: 'https://a.es', norma: 'WCAG 2.2 AA', metodo: 'autoevaluación',
  formulario: 'https://a.es/f', correo: 'a@a.es', telefono: '900', plazo: '15 días hábiles',
  descripcionServicio: 'X', funcionamiento: 'Y', procesoRevision: 'Z', canalOral: '900',
};

test('aplicabilidad: declaración de quien está obligado', () => {
  const a = ev({ ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular', comunidad: 'VC' });
  const r = generarDeclaracion(informe([fallo]), revision(), datos, { aplicabilidad: a });
  assert.match(r.markdown, /presta un servicio incluido en el Título I/);
  assert.match(r.markdown, /parcialmente conforme con WCAG 2\.2 AA/);
  assert.match(r.markdown, /Las medidas correctoras y sus fechas/);
  assert.match(r.markdown, /Información de accesibilidad del servicio/);
  assert.match(r.markdown, /En Comunitat Valenciana no nos consta autoridad/);
  assert.match(r.markdown, /satisfecho con nuestra respuesta, puede dirigirse a la Unidad técnica/);
  assert.doesNotMatch(r.markdown, /\[SECTOR/);
  assert.ok(r.deberes.some((d) => /13\.7/.test(d)), 'recuerda el aviso a la autoridad');
});

test('aplicabilidad: declaración prudente si es dudoso, sin afirmar que obliga ni que no', () => {
  const a = ev({ ...privado, ...pyme, contrato: 'redirige', remunerado: 'si', interaccion: 'si' });
  const r = generarDeclaracion(informe([fallo]), revision(), datos, { aplicabilidad: a });
  assert.match(r.markdown, /sin prejuzgar si esa ley es exigible/);
  assert.match(r.markdown, /cumple parcialmente WCAG 2\.2 AA, que usamos como referencia/);
  assert.doesNotMatch(r.markdown, /de conformidad con|parcialmente conforme|presta un servicio incluido/);
  assert.ok(r.deberes.some((d) => /abogado/.test(d)));
});

test('aplicabilidad: declaración voluntaria si no aplica, sin citar la ley como obligación', () => {
  for (const respuestas of [
    { ...privado, ...pyme, contrato: 'no', interaccion: 'no' },
    { ...privado, ...micro, contrato: 'en-la-web' },
  ]) {
    const a = ev(respuestas);
    const r = generarDeclaracion(informe([fallo]), revision(), datos, { aplicabilidad: a });
    assert.match(r.markdown, /de forma voluntaria/);
    assert.match(r.markdown, /referencia voluntaria/);
    assert.doesNotMatch(r.markdown, /de conformidad con|parcialmente conforme/);
    assert.doesNotMatch(r.markdown, /autoridad de vigilancia/);
    assert.doesNotMatch(r.markdown, /Información de accesibilidad del servicio/);
  }
});

test('aplicabilidad: la plena conformidad sigue dependiendo de la evaluación, no del veredicto', () => {
  const a = ev({ ...privado, ...pyme, contrato: 'en-la-web', contraparte: 'titular' });
  const sin = generarDeclaracion(informe(), null, datos, { aplicabilidad: a });
  assert.equal(sin.publicable, false);
  assert.doesNotMatch(sin.markdown, /plenamente conforme/);
});

test('aplicabilidad: declaración del sector público', () => {
  const a = ev({ titular: 'publico', destinatarios: 'consumidores', contrato: 'no', comunidad: 'MD' });
  const r = generarDeclaracion(informe([fallo]), revision(), { ...datos, responsable: 'U', reclamaciones: 'https://a.es/r' }, { aplicabilidad: a });
  assert.match(r.markdown, /de conformidad con el Real Decreto 1112\/2018/);
  assert.match(r.markdown, /presentar una reclamación ante U/);
});

test('aplicabilidad: CLI de la declaración con --aplicabilidad y rechazo de un fichero ajeno', () => {
  const d = mkdtempSync(path.join(tmpdir(), 'apl-dec-'));
  const DECL = path.join(DIR, '..', 'declaracion.mjs');
  const inf = path.join(d, 'informe.json');
  const dat = path.join(d, 'datos.json');
  const apl = path.join(d, 'apl.json');
  writeFileSync(inf, JSON.stringify(informe()));
  writeFileSync(dat, JSON.stringify(datos));
  writeFileSync(apl, JSON.stringify(ev({ ...privado, ...pyme, contrato: 'redirige', remunerado: 'si', interaccion: 'si' })));
  const r = spawnSync(process.execPath, [DECL, '--informe', inf, '--datos', dat, '--aplicabilidad', apl, '--salida', d], { encoding: 'utf8' });
  assert.equal(r.status, 1, 'sin revisión manual sigue siendo borrador');
  assert.match(r.stdout, /Veredicto de aplicabilidad: dudoso/);
  assert.match(readFileSync(path.join(d, 'declaracion.md'), 'utf8'), /sin prejuzgar/);
  writeFileSync(apl, '{"otra":"cosa"}');
  assert.equal(spawnSync(process.execPath, [DECL, '--informe', inf, '--aplicabilidad', apl], { encoding: 'utf8' }).status, 2);
});
