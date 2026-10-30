// Agrupa los hallazgos y genera informe.json e informe.md.
import {
  ARREGLOS, CRITERIOS, CRITERIOS_PROPIOS, IMPACTO_ES, IMPACTOS,
  clausulaEN, compararCriterios, criteriosDeEtiquetas, rangoImpacto,
} from './wcag.mjs';

const MAX_SELECTORES_MD = 6;

const TITULOS_PROPIOS = {
  'reflow-320': 'Desplazamiento horizontal a 320 px de ancho',
  'foco-no-visible': 'El foco del teclado no se ve',
  'foco-oculto': 'El elemento enfocado queda oculto o tapado',
  'trampa-foco': 'Trampa de foco',
  'sin-enlace-saltar': 'Falta el enlace «Saltar al contenido» al principio',
};

/** Convierte un resultado de axe (violations) en hallazgos planos. */
export function hallazgosDeAxe(resultados, pagina, contexto) {
  const out = [];
  for (const v of resultados.violations ?? []) {
    const criterios = criteriosDeEtiquetas(v.tags);
    for (const nodo of v.nodes) {
      out.push({
        regla: v.id,
        origen: 'axe',
        impacto: nodo.impact || v.impact || 'minor',
        criterios,
        descripcion: v.help,
        ayudaUrl: v.helpUrl,
        pagina,
        contexto,
        selector: nodo.target.map((t) => (Array.isArray(t) ? t.join(' >>> ') : t)).join(' → '),
        html: (nodo.html || '').replace(/\s+/g, ' ').slice(0, 220),
        detalle: (nodo.failureSummary || '').replace(/\s+/g, ' ').trim().slice(0, 400),
      });
    }
  }
  return out;
}

/** Elementos que axe no pudo decidir («necesita revisión»). */
export function revisionDeAxe(resultados, pagina) {
  return (resultados.incomplete ?? []).map((v) => ({
    regla: v.id,
    descripcion: v.help,
    criterios: criteriosDeEtiquetas(v.tags),
    pagina,
    elementos: v.nodes.length,
  }));
}

/** Hallazgos de las comprobaciones propias (teclado, reflow). */
export function hallazgosPropios(lista, pagina, contexto) {
  return lista.map((h) => ({
    regla: h.regla,
    origen: 'propia',
    impacto: h.impacto,
    criterios: CRITERIOS_PROPIOS[h.regla] ?? [],
    descripcion: TITULOS_PROPIOS[h.regla] ?? h.regla,
    ayudaUrl: '',
    pagina,
    contexto,
    selector: h.selector,
    html: h.texto ? `«${h.texto}»` : '',
    detalle: h.detalle,
  }));
}

/** Fusiona hallazgos iguales (misma regla, página y selector) vistos en varios contextos. */
export function agrupar(hallazgos) {
  const mapa = new Map();
  for (const h of hallazgos) {
    const clave = `${h.regla}|${h.pagina}|${h.selector}`;
    const previo = mapa.get(clave);
    if (previo) {
      if (!previo.contextos.includes(h.contexto)) previo.contextos.push(h.contexto);
      if (rangoImpacto(h.impacto) < rangoImpacto(previo.impacto)) previo.impacto = h.impacto;
    } else {
      const { contexto, ...resto } = h;
      const arreglo = ARREGLOS[h.regla];
      mapa.set(clave, {
        ...resto,
        contextos: [contexto],
        en: h.criterios.map(clausulaEN).filter(Boolean),
        arreglo: arreglo?.texto ?? null,
        receta: arreglo?.receta ?? null,
      });
    }
  }
  return [...mapa.values()].sort(
    (a, b) => rangoImpacto(a.impacto) - rangoImpacto(b.impacto) ||
      a.regla.localeCompare(b.regla) || a.pagina.localeCompare(b.pagina),
  );
}

function contar(problemas, clave) {
  const r = {};
  for (const p of problemas) for (const k of [].concat(clave(p))) r[k] = (r[k] ?? 0) + 1;
  return r;
}

export function resumir(problemas) {
  const porImpacto = Object.fromEntries(IMPACTOS.map((i) => [i, 0]));
  for (const p of problemas) porImpacto[p.impacto] = (porImpacto[p.impacto] ?? 0) + 1;
  return {
    problemas: problemas.length,
    reglas: new Set(problemas.map((p) => p.regla)).size,
    porImpacto,
    porCriterio: contar(problemas, (p) => (p.criterios.length ? p.criterios : ['buenas-practicas'])),
    porPagina: contar(problemas, (p) => p.pagina),
    porRegla: contar(problemas, (p) => p.regla),
  };
}

/** Rango del peor impacto presente (para el código de salida). */
export function superaUmbral(problemas, umbral) {
  if (!umbral) return false;
  const limite = rangoImpacto(umbral);
  return problemas.some((p) => rangoImpacto(p.impacto) <= limite);
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const codigo = (s) => '`' + String(s).replace(/`/g, "'") + '`';

function nombreCriterio(c) {
  const d = CRITERIOS[c];
  return d ? `${c} ${d.nombre} (${d.nivel})` : c;
}

function enTexto(c) {
  const en = clausulaEN(c);
  if (en) return en;
  return CRITERIOS[c]?.wcag22 ? '— (nuevo en WCAG 2.2; en EN 301 549 V4.1.1)' : '—';
}

/** Ruta relativa de la receta desde el informe, o desde la skill si no se conoce. */
function enlaceReceta(receta, baseRecetas) {
  if (!receta) return '';
  const nombre = receta.split('/').pop().replace('.md', '');
  return baseRecetas ? `[receta: ${nombre}](${baseRecetas}/${receta})` : `receta: ${codigo(receta)}`;
}

export function generarMarkdown(datos, { baseRecetas = '' } = {}) {
  const { resumen, problemas, revisar, paginas, configuracion, teclado } = datos;
  const L = [];
  L.push('# Informe de accesibilidad');
  L.push('');
  L.push(`- **Fecha:** ${datos.fecha}`);
  L.push(`- **Herramienta:** AccesibilidadWeb ${datos.version} · axe-core ${datos.axeVersion} · Playwright (Chromium)`);
  L.push(`- **Norma de referencia:** WCAG 2.2 nivel AA · EN 301 549 (cap. 9) · Ley 11/2023 y RD 1112/2018`);
  L.push(`- **Contextos:** ${configuracion.anchos.map((a) => `${a} px`).join(', ')} · esquema ${configuracion.esquemas.join('/')}${configuracion.teclado ? ' · recorrido de teclado' : ''}${configuracion.reflow ? ' · reflow a 320 px' : ''}`);
  L.push(`- **Páginas auditadas:** ${paginas.filter((p) => !p.error).length} de ${paginas.length}`);
  L.push('');
  L.push('> **Aviso.** Esta auditoría automática detecta solo una parte de los problemas (según distintas estimaciones, entre un 30 % y un 50 %). ' +
    'No sustituye la revisión manual guiada (teclado, lector de pantalla, zoom, contenido) ni el asesoramiento jurídico. ' +
    'Un informe sin errores **no** acredita el cumplimiento.');
  L.push('');

  L.push('## Resumen');
  L.push('');
  L.push(`**${resumen.problemas} problemas** (elemento × regla × página) de **${resumen.reglas} reglas** distintas.`);
  L.push('');
  L.push('| Impacto | Problemas |');
  L.push('|---|---:|');
  for (const i of IMPACTOS) L.push(`| ${IMPACTO_ES[i]} | ${resumen.porImpacto[i] ?? 0} |`);
  L.push('');

  // Por criterio
  const criterios = Object.keys(resumen.porCriterio).filter((c) => c !== 'buenas-practicas').sort(compararCriterios);
  if (criterios.length || resumen.porCriterio['buenas-practicas']) {
    L.push('### Por criterio');
    L.push('');
    L.push('| Criterio WCAG 2.2 | EN 301 549 | Problemas | Peor impacto |');
    L.push('|---|---|---:|---|');
    for (const c of criterios) {
      const peor = problemas.filter((p) => p.criterios.includes(c)).reduce((m, p) => Math.min(m, rangoImpacto(p.impacto)), 9);
      L.push(`| ${esc(nombreCriterio(c))} | ${esc(enTexto(c))} | ${resumen.porCriterio[c]} | ${IMPACTO_ES[IMPACTOS[peor]] ?? ''} |`);
    }
    if (resumen.porCriterio['buenas-practicas']) L.push(`| Buenas prácticas (sin criterio WCAG) | — | ${resumen.porCriterio['buenas-practicas']} | |`);
    L.push('');
  }

  L.push('### Por página');
  L.push('');
  L.push('| Página | Problemas | Crítico | Grave |');
  L.push('|---|---:|---:|---:|');
  for (const p of paginas) {
    if (p.error) { L.push(`| ${esc(p.url)} | error: ${esc(p.error)} | | |`); continue; }
    const delaPagina = problemas.filter((x) => x.pagina === p.url);
    L.push(`| ${esc(p.url)} | ${delaPagina.length} | ${delaPagina.filter((x) => x.impacto === 'critical').length} | ${delaPagina.filter((x) => x.impacto === 'serious').length} |`);
  }
  L.push('');

  // Detalle por criterio y regla
  L.push('## Detalle por criterio');
  L.push('');
  L.push('Ordenado por criterio; dentro de cada uno, por impacto. Cada regla indica cómo arreglarlo y en qué páginas y elementos aparece.');
  L.push('');
  const grupos = new Map();
  for (const p of problemas) {
    const c = p.criterios.length ? [...p.criterios].sort(compararCriterios)[0] : 'buenas-practicas';
    if (!grupos.has(c)) grupos.set(c, []);
    grupos.get(c).push(p);
  }
  const ordenGrupos = [...grupos.keys()].sort((a, b) =>
    a === 'buenas-practicas' ? 1 : b === 'buenas-practicas' ? -1 : compararCriterios(a, b));
  for (const c of ordenGrupos) {
    const lista = grupos.get(c);
    if (c === 'buenas-practicas') L.push('### Buenas prácticas (sin criterio WCAG asociado)');
    else L.push(`### ${nombreCriterio(c)} · EN 301 549: ${enTexto(c)}`);
    L.push('');
    const porRegla = new Map();
    for (const p of lista) {
      if (!porRegla.has(p.regla)) porRegla.set(p.regla, []);
      porRegla.get(p.regla).push(p);
    }
    const reglas = [...porRegla.entries()].sort((a, b) =>
      Math.min(...a[1].map((p) => rangoImpacto(p.impacto))) - Math.min(...b[1].map((p) => rangoImpacto(p.impacto))));
    for (const [regla, ps] of reglas) {
      const peor = IMPACTOS[Math.min(...ps.map((p) => rangoImpacto(p.impacto)))];
      const otros = ps[0].criterios.filter((x) => x !== c);
      L.push(`#### ${codigo(regla)} — ${esc(ps[0].descripcion)}`);
      L.push('');
      L.push(`- **Impacto:** ${IMPACTO_ES[peor]} · **elementos afectados:** ${ps.length}${otros.length ? ` · también ${otros.join(', ')}` : ''}`);
      if (ps[0].arreglo) L.push(`- **Cómo arreglarlo:** ${ps[0].arreglo} ${enlaceReceta(ps[0].receta, baseRecetas)}`.trimEnd());
      if (ps[0].ayudaUrl) L.push(`- **Referencia:** ${ps[0].ayudaUrl}`);
      const porPagina = new Map();
      for (const p of ps) {
        if (!porPagina.has(p.pagina)) porPagina.set(p.pagina, []);
        porPagina.get(p.pagina).push(p);
      }
      for (const [pagina, items] of porPagina) {
        L.push(`- ${pagina} (${items.length})`);
        for (const it of items.slice(0, MAX_SELECTORES_MD)) {
          const extra = it.html ? ` — ${codigo(it.html.slice(0, 120))}` : '';
          L.push(`  - ${codigo(it.selector)}${extra} _[${it.contextos.join('; ')}]_`);
          if (it.origen === 'propia' && it.detalle) L.push(`    - ${esc(it.detalle)}`);
        }
        if (items.length > MAX_SELECTORES_MD) L.push(`  - … y ${items.length - MAX_SELECTORES_MD} más (ver informe.json)`);
      }
      L.push('');
    }
  }
  if (!problemas.length) { L.push('_Sin problemas detectados automáticamente._'); L.push(''); }

  if (teclado && Object.keys(teclado).length) {
    L.push('## Recorrido de teclado');
    L.push('');
    L.push('Primeros elementos que recibe el foco al pulsar Tab (a 1280 px). Úsalo para revisar a mano el orden (2.4.3).');
    L.push('');
    for (const [url, pasos] of Object.entries(teclado)) {
      L.push(`<details><summary>${esc(url)} — ${pasos.length} paradas</summary>`);
      L.push('');
      for (const a of paginas.find((p) => p.url === url)?.avisos ?? []) { L.push(`> ${a}`); L.push(''); }
      L.push('| # | Elemento | Texto | Foco visible |');
      L.push('|---:|---|---|---|');
      for (const p of pasos.slice(0, 25)) {
        L.push(`| ${p.orden} | ${codigo(p.selector)} | ${esc(p.texto)} | ${p.focoVisible === null ? '¿?' : p.focoVisible ? 'sí' : '**no**'} |`);
      }
      L.push('');
      L.push('</details>');
      L.push('');
    }
  }

  if (revisar.length) {
    L.push('## Necesita revisión manual');
    L.push('');
    L.push('axe-core no pudo decidir en estos casos (p. ej. contraste sobre imágenes o degradados). Compruébalos a mano.');
    L.push('');
    L.push('| Regla | Criterios | Páginas | Elementos |');
    L.push('|---|---|---:|---:|');
    const agr = new Map();
    for (const r of revisar) {
      const a = agr.get(r.regla) ?? { ...r, paginas: new Set(), elementos: 0 };
      a.paginas.add(r.pagina);
      a.elementos += r.elementos;
      agr.set(r.regla, a);
    }
    for (const a of [...agr.values()].sort((x, y) => y.elementos - x.elementos)) {
      L.push(`| ${codigo(a.regla)} ${esc(a.descripcion)} | ${a.criterios.join(', ') || '—'} | ${a.paginas.size} | ${a.elementos} |`);
    }
    L.push('');
  }

  L.push('## Siguiente paso');
  L.push('');
  L.push('1. Arreglar primero lo **crítico** y **grave**, empezando por los componentes compartidos (cabecera, menú, pie, tarjetas): un arreglo corrige muchas páginas.');
  L.push('2. Hacer la revisión manual guiada (`references/revision-manual.md`): teclado, lector de pantalla, zoom 200 %, reflow 320 px, movimiento, formularios y multimedia.');
  L.push('3. Publicar o actualizar la declaración de accesibilidad y el canal de quejas (`docs/declaracion-accesibilidad-plantilla.md`).');
  L.push('');
  return L.join('\n');
}
