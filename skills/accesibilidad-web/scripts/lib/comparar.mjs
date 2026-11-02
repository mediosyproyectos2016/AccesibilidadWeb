// Compara dos informes (antes/después) y calcula regresiones frente a una línea
// base. Sin dependencias y sin navegador: solo trabaja con informe.json.
import { IMPACTOS, IMPACTO_ES, rangoImpacto } from './wcag.mjs';

/** Ruta estable de una URL: sin dominio, para comparar local, pruebas y producción. */
export function rutaDe(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'file:') return u.pathname.split('/').pop() || '/';
    const ruta = u.pathname
      .split('/')
      .map((s) => (/^\d+$/.test(s) || /^[0-9a-f]{12,}$/i.test(s) ? ':id' : s))
      .join('/');
    return (ruta.replace(/\/+$/, '') || '/') + u.search;
  } catch {
    return url;
  }
}

// Clases generadas (CSS Modules, styled-components, Emotion, Svelte, Vue…) que
// cambian en cada compilación y romperían la comparación.
const CLASE_GENERADA = /\.(?:css-[\w-]+|jsx-\d+|sc-[\w-]+|svelte-[\w]+|[\w-]*_{1,2}(?=[A-Za-z+/-]*\d)[A-Za-z0-9+/-]{5,}(?:_\d+)?|[a-zA-Z]{1,3}-[a-f0-9]{6,})(?=$|[\s.>:#[+~,])/g;

/** Selector sin posiciones ni clases generadas: sobrevive a listas que cambian de orden. */
export function selectorEstable(selector = '') {
  return String(selector)
    .replace(/:nth-(?:child|of-type|last-child|last-of-type)\([^)]*\)/g, '')
    .replace(CLASE_GENERADA, '')
    .replace(/\[data-v-[\w-]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function huellaDe(p) {
  return `${p.regla}|${rutaDe(p.pagina)}|${selectorEstable(p.selector)}`;
}

function agruparPorHuella(problemas) {
  const mapa = new Map();
  for (const p of problemas) {
    const h = p.huella ?? huellaDe(p);
    if (!mapa.has(h)) mapa.set(h, []);
    mapa.get(h).push(p);
  }
  return mapa;
}

/**
 * axe construye selectores según el contexto: al añadir un hermano, el selector de un
 * elemento que no ha cambiado puede ser otro. Por eso, un sobrante «antes» y otro
 * «después» de la misma regla y ruta se tratan como el mismo fallo que ha cambiado de
 * selector. Consecuencia conocida: arreglar uno y crear otro igual en la misma página
 * no cuenta como cambio, porque la cifra de esa regla en esa página es la misma.
 */
function emparejarMovidos(sobranA, sobranD, claveA = (p) => `${p.regla}|${rutaDe(p.pagina)}`, claveD = claveA) {
  const pendientes = new Map();
  for (const p of sobranA) {
    const k = claveA(p);
    if (!pendientes.has(k)) pendientes.set(k, []);
    pendientes.get(k).push(p);
  }
  const nuevos = [];
  const movidos = [];
  for (const p of sobranD) {
    const lista = pendientes.get(claveD(p));
    if (lista?.length) {
      lista.pop();
      movidos.push(p);
    } else {
      nuevos.push(p);
    }
  }
  return { nuevos, movidos, sinPareja: [...pendientes.values()].flat() };
}

const rutasOk = (informe) => new Set((informe.paginas ?? []).filter((p) => !p.error).map((p) => rutaDe(p.url)));

function porImpacto(lista) {
  const r = Object.fromEntries(IMPACTOS.map((i) => [i, 0]));
  for (const p of lista) r[p.impacto] = (r[p.impacto] ?? 0) + 1;
  return r;
}

/** Diferencias de configuración que hacen la comparación menos fiable. */
function avisosConfiguracion(a, b) {
  const avisos = [];
  const ca = a.configuracion ?? {};
  const cb = b.configuracion ?? {};
  for (const [campo, nombre] of [['anchos', 'anchos'], ['esquemas', 'esquemas de color'], ['etiquetas', 'etiquetas de axe'], ['excluir', 'exclusiones']]) {
    if (JSON.stringify(ca[campo] ?? []) !== JSON.stringify(cb[campo] ?? [])) {
      avisos.push(`Los informes no usan los mismos ${nombre} (${JSON.stringify(ca[campo] ?? [])} frente a ${JSON.stringify(cb[campo] ?? [])}): un hallazgo «arreglado» puede ser solo un hallazgo que ya no se mira.`);
    }
  }
  if ((cb.excluir ?? []).length > (ca.excluir ?? []).length) {
    avisos.push('El informe posterior excluye más selectores: lo excluido no está arreglado, solo sin auditar.');
  }
  return avisos;
}

/**
 * Compara dos informes. Solo cuenta como arreglado lo que estaba en una página
 * auditada en ambos: si una página falla o desaparece, sus hallazgos quedan «sin
 * comprobar», nunca «arreglados».
 */
export function comparar(antes, despues) {
  const rutasA = rutasOk(antes);
  const rutasD = rutasOk(despues);
  const comunes = new Set([...rutasA].filter((r) => rutasD.has(r)));
  const mapaA = agruparPorHuella(antes.problemas ?? []);
  const mapaD = agruparPorHuella(despues.problemas ?? []);

  let arreglados = [];
  let nuevos = [];
  const persisten = [];
  const sinComprobar = [];
  const paginasNuevas = [];

  for (const h of new Set([...mapaA.keys(), ...mapaD.keys()])) {
    const la = mapaA.get(h) ?? [];
    const ld = mapaD.get(h) ?? [];
    const ruta = rutaDe((la[0] ?? ld[0]).pagina);
    if (!comunes.has(ruta)) {
      if (la.length) sinComprobar.push(...la);
      else paginasNuevas.push(...ld);
      continue;
    }
    persisten.push(...ld.slice(0, la.length));
    if (la.length > ld.length) arreglados.push(...la.slice(ld.length));
    if (ld.length > la.length) nuevos.push(...ld.slice(la.length));
  }

  const par = emparejarMovidos(arreglados, nuevos);
  arreglados = par.sinPareja;
  nuevos = par.nuevos;
  persisten.push(...par.movidos);

  const totalA = antes.problemas?.length ?? 0;
  const totalD = despues.problemas?.length ?? 0;
  const impA = porImpacto(antes.problemas ?? []);
  const impD = porImpacto(despues.problemas ?? []);

  return {
    fechas: { antes: antes.fecha, despues: despues.fecha },
    resumen: {
      antes: totalA, despues: totalD,
      arreglados: arreglados.length, nuevos: nuevos.length, persisten: persisten.length,
      sinComprobar: sinComprobar.length, deNuevasPaginas: paginasNuevas.length,
      porImpacto: IMPACTOS.map((i) => ({ impacto: i, antes: impA[i] ?? 0, despues: impD[i] ?? 0 })),
      revisarAntes: antes.revisar?.length ?? 0,
      revisarDespues: despues.revisar?.length ?? 0,
    },
    arreglados, nuevos, persisten, sinComprobar, paginasNuevas,
    avisos: avisosConfiguracion(antes, despues),
    veredicto: veredicto({ arreglados, nuevos, persisten, sinComprobar, paginasNuevas, despues }),
  };
}

/**
 * Criterio de parada del bucle auditar → arreglar → reauditar.
 * - seguir: hay progreso y queda trabajo.
 * - corregir-regresion: el último cambio introdujo fallos nuevos.
 * - escalar: no hubo progreso; un nuevo intento igual no ayudará, hace falta
 *   otra persona, una decisión o aceptar el pendiente.
 * - pasar-a-revision-manual: cero fallos detectables. No significa «accesible».
 */
export function veredicto({ arreglados, nuevos, persisten, sinComprobar, paginasNuevas, despues }) {
  const restantes = despues.problemas?.length ?? 0;
  if (nuevos.length) {
    return { codigo: 'corregir-regresion', texto: `Hay ${nuevos.length} fallo(s) nuevo(s) respecto a la auditoría anterior: corrígelos antes de seguir.` };
  }
  if (sinComprobar.length) {
    return { codigo: 'reauditar', texto: `${sinComprobar.length} hallazgo(s) quedan sin comprobar porque su página no se auditó en ambos informes: reaudita esas páginas.` };
  }
  if (restantes === 0) {
    return { codigo: 'pasar-a-revision-manual', texto: 'Cero fallos detectables en lo auditado. Eso no significa que la web sea accesible: pasa a la revisión manual, con lector de pantalla y personas reales.' };
  }
  if (!arreglados.length && !paginasNuevas.length) {
    return { codigo: 'escalar', texto: `Sin progreso: siguen ${persisten.length} fallo(s). Para el bucle y documenta cada pendiente: quién decide, qué falta (contenido, diseño, proveedor) y para cuándo.` };
  }
  return { codigo: 'seguir', texto: `Quedan ${restantes} fallo(s): sigue con el siguiente bloque del plan.` };
}

function lineaProblema(p) {
  return `- \`${p.regla}\` (${IMPACTO_ES[p.impacto] ?? p.impacto}) · ${rutaDe(p.pagina)} · \`${String(p.selector).replace(/`/g, "'")}\``;
}

function seccion(L, titulo, lista, max = 40) {
  if (!lista.length) return;
  L.push(`## ${titulo} (${lista.length})`, '');
  const orden = [...lista].sort((a, b) => rangoImpacto(a.impacto) - rangoImpacto(b.impacto) || a.regla.localeCompare(b.regla));
  for (const p of orden.slice(0, max)) L.push(lineaProblema(p));
  if (lista.length > max) L.push(`- … y ${lista.length - max} más`);
  L.push('');
}

export function comparacionMarkdown(c) {
  const r = c.resumen;
  const L = ['# Comparación de auditorías', ''];
  L.push(`- **Antes:** ${c.fechas.antes ?? '—'}`, `- **Después:** ${c.fechas.despues ?? '—'}`, '');
  L.push(`**Veredicto: ${c.veredicto.codigo}.** ${c.veredicto.texto}`, '');
  for (const a of c.avisos) L.push(`> **Aviso.** ${a}`, '');
  L.push('| | Antes | Después |', '|---|---:|---:|');
  L.push(`| **Total de fallos detectados** | ${r.antes} | ${r.despues} |`);
  for (const f of r.porImpacto) L.push(`| ${IMPACTO_ES[f.impacto]} | ${f.antes} | ${f.despues} |`);
  L.push(`| Pendiente de revisar a mano | ${r.revisarAntes} | ${r.revisarDespues} |`, '');
  L.push(`Arreglados: **${r.arreglados}** · Nuevos: **${r.nuevos}** · Persisten: **${r.persisten}** · Sin comprobar: **${r.sinComprobar}**`, '');
  seccion(L, 'Nuevos (regresiones)', c.nuevos);
  seccion(L, 'Sin comprobar (la página no se auditó en ambos)', c.sinComprobar);
  seccion(L, 'Persisten', c.persisten);
  seccion(L, 'Arreglados', c.arreglados);
  seccion(L, 'De páginas nuevas', c.paginasNuevas);
  L.push('> Un fallo «arreglado» es un fallo que la herramienta ya no detecta. Compruébalo también a mano: las herramientas automáticas solo ven una parte de los problemas.', '');
  return L.join('\n');
}

/** Línea base para CI: cuántos hallazgos hay de cada huella. */
export function crearLineaBase(informe) {
  const huellas = {};
  for (const [h, lista] of agruparPorHuella(informe.problemas ?? [])) {
    const p = lista[0];
    huellas[h] = { n: lista.length, regla: p.regla, impacto: p.impacto, ruta: rutaDe(p.pagina), selector: selectorEstable(p.selector) };
  }
  return {
    herramienta: 'AccesibilidadWeb',
    version: informe.version,
    fecha: informe.fecha,
    total: informe.problemas?.length ?? 0,
    aviso: 'Lista de fallos conocidos, no de fallos aceptables. Debe bajar con el tiempo; no la regeneres para hacer pasar la CI.',
    paginas: (informe.paginas ?? []).map((p) => rutaDe(p.url)),
    huellas,
  };
}

/**
 * Regresiones del informe frente a la línea base: hallazgos que superan el
 * recuento conocido y llegan al umbral de impacto. Las páginas que no están en
 * la línea base también cuentan, porque nadie ha aceptado todavía sus fallos.
 */
export function regresiones(lineaBase, informe, umbral = 'minor') {
  const limite = umbral ? rangoImpacto(umbral) : -1;
  const mapa = agruparPorHuella(informe.problemas ?? []);
  const sobranD = [];
  for (const [h, lista] of mapa) {
    sobranD.push(...lista.slice(lineaBase.huellas?.[h]?.n ?? 0));
  }
  const auditadas = rutasOk(informe);
  const sinComprobar = (lineaBase.paginas ?? []).filter((r) => !auditadas.has(r));
  const sobranA = [];
  for (const [h, b] of Object.entries(lineaBase.huellas ?? {})) {
    if (!auditadas.has(b.ruta)) continue;
    const ahora = mapa.get(h)?.length ?? 0;
    for (let i = ahora; i < b.n; i++) sobranA.push({ ...b, huella: h, ahora });
  }
  const par = emparejarMovidos(sobranA, sobranD, (b) => `${b.regla}|${b.ruta}`, (p) => `${p.regla}|${rutaDe(p.pagina)}`);
  return {
    regresiones: par.nuevos.filter((p) => rangoImpacto(p.impacto) <= limite),
    mejoras: par.sinPareja,
    sinComprobar,
  };
}
