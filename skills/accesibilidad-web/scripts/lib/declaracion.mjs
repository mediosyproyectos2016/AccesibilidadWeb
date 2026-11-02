// Genera la declaración de accesibilidad con los resultados reales: informe
// automático y revisión manual registrada. Estructura del modelo de la Decisión de
// Ejecución (UE) 2018/1523 (ver docs/declaracion-accesibilidad-plantilla.md).
//
// Regla central: el código nunca afirma por sí solo una conformidad que nadie ha
// verificado. Sin revisión manual completa, el resultado es un borrador sin situación.
import { CRITERIOS } from './wcag.mjs';
import { estadoRevision } from './manual.mjs';
import { rutaDe } from './comparar.mjs';

const DOCE_MESES = 365 * 24 * 3600 * 1000;

/** Situación de cumplimiento que permiten los datos. */
export function evaluar(informe, revision, { confirmacion = null, situacion = null, ahora = Date.now() } = {}) {
  const problemas = (informe?.problemas ?? []).filter((p) => p.criterios?.length);
  const e = revision ? estadoRevision(revision) : null;
  const motivos = [];
  const fallidas = (informe?.paginas ?? []).filter((p) => p.error);
  const antiguedad = informe?.fecha ? ahora - new Date(informe.fecha).getTime() : Infinity;

  if (fallidas.length) motivos.push(`${fallidas.length} página(s) no se pudieron auditar.`);
  if (antiguedad > DOCE_MESES) motivos.push('El informe tiene más de 12 meses o no tiene fecha: reaudita.');
  if (!e) motivos.push('No hay revisión manual registrada.');
  else if (!e.completa) motivos.push(`Faltan ${e.pendientes.length} comprobaciones de la revisión manual.`);

  const fallosManual = e?.fallos ?? [];
  const conFallos = problemas.length > 0 || fallosManual.length > 0;
  let resultado;
  if (motivos.length) {
    resultado = 'sin-determinar';
  } else if (conFallos) {
    resultado = situacion === 'no-conforme' ? 'no-conforme' : 'parcial';
  } else if (confirmacion) {
    resultado = 'plena';
  } else {
    resultado = 'sin-confirmar';
    motivos.push('Sin fallos conocidos, pero la plena conformidad debe asumirla una persona responsable (--confirmar-plena-conformidad).');
  }
  return { situacion: resultado, motivos, problemas, fallosManual, revision: e };
}

/** Si piden confirmar plena conformidad y no se sostiene, se rechaza con el motivo. */
export function motivoRechazoConfirmacion(ev) {
  if (ev.situacion === 'plena') return null;
  if (ev.problemas.length) return `Hay ${ev.problemas.length} fallo(s) automáticos sin resolver.`;
  if (ev.fallosManual.length) return `Hay ${ev.fallosManual.length} fallo(s) registrados en la revisión manual.`;
  return ev.motivos.join(' ') || 'No se cumplen las condiciones.';
}

const marc = (nombre) => `{{${nombre}}}`;

/** Agrupa los fallos por regla, en lenguaje de la herramienta, con sus criterios. */
function contenidoNoAccesible(ev) {
  const porRegla = new Map();
  for (const p of ev.problemas) {
    const r = porRegla.get(p.regla) ?? { descripcion: p.descripcion, criterios: p.criterios, paginas: new Set(), n: 0 };
    r.paginas.add(rutaDe(p.pagina));
    r.n++;
    porRegla.set(p.regla, r);
  }
  const lista = [...porRegla.values()].map((r) => {
    const criterios = r.criterios.map((c) => `${c}${CRITERIOS[c] ? ` ${CRITERIOS[c].nombre}` : ''}`).join('; ');
    const paginas = [...r.paginas];
    const donde = paginas.length <= 3 ? paginas.join(', ') : `${paginas.length} páginas, entre ellas ${paginas.slice(0, 3).join(', ')}`;
    return `${r.descripcion} (${criterios}). En ${donde}. ${marc('PLAZO_O_PLAN_DE_CORRECCIÓN')}`;
  });
  for (const c of ev.fallosManual) {
    lista.push(`${c.notas || c.titulo} (${c.criterios.join(', ') || 'revisión manual'}). ${marc('PLAZO_O_PLAN_DE_CORRECCIÓN')}`);
  }
  return lista;
}

/** Bloques de contenido; se renderizan después a Markdown y HTML. */
export function bloques(informe, revision, datos, ev, { confirmacion = null } = {}) {
  const d = (k, m = k.toUpperCase()) => (datos?.[k] && String(datos[k]).trim()) || marc(m);
  const entidad = d('entidad', 'NOMBRE_ENTIDAD');
  const sector = datos?.sector;
  const norma = d('norma', 'NORMA_DE_REFERENCIA');
  const B = [];
  const h1 = (t) => B.push({ t: 'h1', v: t });
  const h2 = (t) => B.push({ t: 'h2', v: t });
  const p = (t) => B.push({ t: 'p', v: t });
  const ul = (v) => B.push({ t: 'ul', v });

  h1('Declaración de accesibilidad');
  const normas = [];
  if (sector !== 'privado') normas.push('[SECTOR PÚBLICO] el Real Decreto 1112/2018, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público');
  if (sector !== 'publico') normas.push('[SECTOR PRIVADO] el Título I de la Ley 11/2023, de 8 de mayo, que traspone la Directiva (UE) 2019/882 sobre los requisitos de accesibilidad de los productos y servicios');
  const limpiar = (s) => (sector ? s.replace(/^\[SECTOR [A-ZÚ]+\] /, '') : s);
  p(`${entidad} se ha comprometido a hacer accesible su sitio web, de conformidad con ${normas.map(limpiar).join(' / ')}.`);
  p(`La presente declaración se aplica a: ${d('ambito', 'URL_O_NOMBRE_APP')}.`);

  h2('Situación de cumplimiento');
  if (ev.situacion === 'plena') {
    p(`Este sitio web es plenamente conforme con ${norma}. Lo confirma ${confirmacion} a partir de la evaluación que se describe abajo.`);
  } else if (ev.situacion === 'parcial') {
    p(`Este sitio web es parcialmente conforme con ${norma} debido a la falta de conformidad que se indica a continuación.`);
  } else if (ev.situacion === 'no-conforme') {
    p(`Este sitio web no es conforme con ${norma}. La falta de conformidad se indica a continuación.`);
  } else {
    p(`Situación sin determinar: la evaluación no está completa y este texto no afirma ninguna conformidad. ${ev.motivos.join(' ')}`);
  }

  const lista = contenidoNoAccesible(ev);
  if (lista.length) {
    h2('Contenido no accesible');
    p('El contenido que se recoge a continuación no es accesible por lo siguiente.');
    B.push({ t: 'h3', v: 'Falta de conformidad con la normativa aplicable' });
    ul(lista);
    if (datos?.alternativas) p(`Alternativas accesibles: ${datos.alternativas}`);
  }

  h2('Preparación de la presente declaración');
  const paginasOk = (informe?.paginas ?? []).filter((x) => !x.error);
  const hoy = new Date().toISOString().slice(0, 10);
  const metodoManual = ev.revision
    ? `revisión manual con ${ev.revision.respondidas} de ${ev.revision.total} comprobaciones registradas (${[...new Set((revision?.comprobaciones ?? []).map((c) => c.metodo).filter(Boolean))].join('; ') || 'sin método indicado'})`
    : 'sin revisión manual registrada';
  ul([
    `Fecha de preparación: ${d('fecha', 'FECHA_PREPARACIÓN') === marc('FECHA_PREPARACIÓN') ? hoy : datos.fecha}.`,
    `Método empleado: ${d('metodo', 'AUTOEVALUACIÓN_O_TERCERO')}.`,
    `Herramientas y técnicas: análisis automático con axe-core ${informe?.axeVersion ?? '—'} y AccesibilidadWeb ${informe?.version ?? '—'} (${paginasOk.length} páginas, el ${String(informe?.fecha ?? '—').slice(0, 10)}), y ${metodoManual}. El análisis automático detecta solo una parte de los problemas.`,
    `Última revisión de la declaración: ${datos?.revision || hoy}.`,
  ]);
  if (paginasOk.length) {
    p(`Páginas evaluadas de forma automática: ${paginasOk.slice(0, 20).map((x) => rutaDe(x.url)).join(', ')}${paginasOk.length > 20 ? ` y ${paginasOk.length - 20} más` : ''}.`);
  }

  h2('Observaciones y datos de contacto');
  p('Puede comunicarnos cualquier problema de accesibilidad o pedir información sobre contenido no accesible por estas vías:');
  ul([
    `Formulario: ${d('formulario', 'URL_FORMULARIO_ACCESIBLE')}`,
    `Correo electrónico: ${d('correo', 'CORREO_ACCESIBILIDAD')}`,
    `Teléfono: ${d('telefono', 'TELÉFONO')}`,
    ...(sector === 'publico' ? [`Unidad responsable: ${d('responsable', 'UNIDAD_RESPONSABLE')}`] : []),
  ]);
  p(`Plazo de respuesta: ${d('plazo', 'PLAZO_RESPUESTA')}.`);

  h2('Procedimiento de aplicación');
  if (sector !== 'privado') {
    p(`${sector ? '' : '[SECTOR PÚBLICO] '}Si, una vez realizada una solicitud de información accesible o una queja, esta hubiera sido desestimada, no estuviera de acuerdo con la decisión adoptada o la respuesta no cumpliera los requisitos, puede presentar una reclamación ante ${d('responsable', 'UNIDAD_RESPONSABLE')} en ${d('reclamaciones', 'URL_O_SEDE_RECLAMACIONES')}.`);
  }
  if (sector !== 'publico') {
    p(`${sector ? '' : '[SECTOR PRIVADO] '}Si no está satisfecho con nuestra respuesta, puede dirigirse a la autoridad de vigilancia del mercado en materia de accesibilidad de ${d('comunidad', 'COMUNIDAD_AUTÓNOMA')}: ${d('autoridad', 'NOMBRE_Y_CONTACTO_AUTORIDAD')} (Ley 11/2023, arts. 24, 27 y 29).`);
  }
  return B;
}

const faltan = (B) => [...new Set(B.flatMap((b) => [].concat(b.v).flatMap((t) => [...String(t).matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]))))];

export function aMarkdown(B, aviso) {
  const L = [];
  if (aviso) L.push(`> **BORRADOR. NO PUBLICAR.** ${aviso}`, '');
  for (const b of B) {
    if (b.t === 'h1') L.push(`# ${b.v}`, '');
    else if (b.t === 'h2') L.push(`## ${b.v}`, '');
    else if (b.t === 'h3') L.push(`### ${b.v}`, '');
    else if (b.t === 'p') L.push(b.v, '');
    else if (b.t === 'ul') L.push(...b.v.map((x) => `- ${x}`), '');
  }
  return L.join('\n');
}

const escHTML = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function aHTML(B, aviso) {
  const c = [];
  if (aviso) c.push(`<p role="note" class="borrador"><strong>BORRADOR. NO PUBLICAR.</strong> ${escHTML(aviso)}</p>`);
  for (const b of B) {
    if (b.t === 'ul') c.push(`<ul>${b.v.map((x) => `<li>${escHTML(x)}</li>`).join('')}</ul>`);
    else c.push(`<${b.t}>${escHTML(b.v)}</${b.t}>`);
  }
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Declaración de accesibilidad</title>
<style>
body { max-width: 44rem; margin: 0 auto; padding: 1rem; font-family: system-ui, sans-serif; line-height: 1.5; color: #1a1a1a; background: #fff; overflow-wrap: anywhere; }
.borrador { padding: .75rem; border: 3px solid #1a1a1a; }
</style>
</head>
<body>
<main>
${c.join('\n')}
</main>
</body>
</html>
`;
}

/** Punto de entrada: devuelve evaluación, Markdown, HTML y lo que falta rellenar. */
export function generarDeclaracion(informe, revision, datos, opciones = {}) {
  const ev = evaluar(informe, revision, opciones);
  const B = bloques(informe, revision, datos, ev, opciones);
  const marcadores = faltan(B);
  const avisos = [];
  if (ev.situacion === 'sin-determinar' || ev.situacion === 'sin-confirmar') avisos.push(ev.motivos.join(' '));
  if (marcadores.length) avisos.push(`Faltan datos: ${marcadores.join(', ')}.`);
  const aviso = avisos.join(' ');
  return { evaluacion: ev, marcadores, publicable: !aviso, markdown: aMarkdown(B, aviso), html: aHTML(B, aviso) };
}
