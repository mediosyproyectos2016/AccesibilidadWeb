// Convierte un informe en un plan de arreglo ordenado: qué tocar primero, dónde y
// quién puede hacerlo (arreglar.mjs, un agente con la receta o una persona).
import {
  ARREGLO_AUTOMATICO, CRITERIO_HUMANO, IMPACTOS, IMPACTO_ES, rangoImpacto, tipoArreglo,
} from './wcag.mjs';
import { rutaDe, selectorEstable } from './comparar.mjs';
import { localizar } from './localizar.mjs';

const PESO = { critical: 8, serious: 4, moderate: 2, minor: 1 };

/** Reglas que se arreglan en la plantilla común, no en un elemento concreto. */
const DE_PLANTILLA = new Set([
  'html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch', 'document-title', 'meta-viewport', 'meta-viewport-large',
  'meta-refresh', 'bypass', 'skip-link', 'sin-enlace-saltar', 'landmark-one-main', 'region', 'zoom-200-desborde', 'reflow-320',
  'movimiento-reducido-ignorado',
]);
const DE_ESTILO = new Set(['color-contrast', 'color-contrast-enhanced', 'link-in-text-block', 'foco-no-visible', 'espaciado-recorta', 'target-size', 'texto-sobre-media']);

/** Genera el plan a partir de un informe. `indice` y `stack` son opcionales. */
export function generarPlan(informe, { indice = null, stack = null } = {}) {
  const porRegla = new Map();
  for (const p of informe.problemas ?? []) {
    if (!porRegla.has(p.regla)) porRegla.set(p.regla, []);
    porRegla.get(p.regla).push(p);
  }
  const totalPaginas = (informe.paginas ?? []).filter((p) => !p.error).length || 1;

  const tareas = [...porRegla.entries()].map(([regla, lista]) => {
    const peor = IMPACTOS[Math.min(...lista.map((p) => rangoImpacto(p.impacto)))];
    const paginas = new Set(lista.map((p) => rutaDe(p.pagina)));

    // Mismo selector en varias páginas: casi seguro, un componente compartido.
    const grupos = new Map();
    for (const p of lista) {
      const s = selectorEstable(p.selector);
      if (!grupos.has(s)) grupos.set(s, []);
      grupos.get(s).push(p);
    }
    const ordenGrupos = [...grupos.entries()].sort((a, b) => b[1].length - a[1].length);
    const compartido = ordenGrupos.some(([, g]) => new Set(g.map((p) => p.pagina)).size >= 2);

    const elementos = ordenGrupos.slice(0, 5).map(([selector, g]) => ({
      selector,
      veces: g.length,
      paginas: [...new Set(g.map((p) => rutaDe(p.pagina)))].slice(0, 5),
      html: g[0].html,
      detalle: g[0].origen === 'propia' ? g[0].detalle : undefined,
      ubicaciones: indice ? localizar(indice, g[0], { conEstilos: DE_ESTILO.has(regla) }) : [],
    }));

    const tipo = tipoArreglo(regla);
    return {
      regla,
      descripcion: lista[0].descripcion,
      impacto: peor,
      criterios: lista[0].criterios,
      en: lista[0].en,
      apariciones: lista.length,
      paginas: paginas.size,
      compartido,
      dePlantilla: DE_PLANTILLA.has(regla),
      tipo,
      arregloAutomatico: ARREGLO_AUTOMATICO[regla] ?? null,
      decisionHumana: CRITERIO_HUMANO[regla] ?? null,
      arreglo: lista[0].arreglo,
      receta: lista[0].receta,
      ficherosRaiz: DE_PLANTILLA.has(regla) ? (stack?.ficherosRaiz ?? []) : [],
      elementos,
      puntos: PESO[peor] * lista.length * (1 + (paginas.size - 1) / totalPaginas),
    };
  });

  tareas.sort((a, b) => rangoImpacto(a.impacto) - rangoImpacto(b.impacto) || b.puntos - a.puntos);
  tareas.forEach((t, i) => { t.orden = i + 1; });

  return {
    herramienta: 'AccesibilidadWeb',
    version: informe.version,
    informeFecha: informe.fecha,
    stack,
    total: informe.problemas?.length ?? 0,
    resumen: {
      automatico: tareas.filter((t) => t.tipo === 'automatico').length,
      asistido: tareas.filter((t) => t.tipo === 'asistido').length,
      humano: tareas.filter((t) => t.tipo === 'humano').length,
    },
    revisar: informe.revisar ?? [],
    tareas,
  };
}

const TIPO_ES = {
  automatico: 'arreglo automático seguro (`arreglar.mjs`, con diff)',
  asistido: 'arreglo asistido: un agente o desarrollador con la receta',
  humano: 'necesita criterio humano',
};
const cod = (s) => '`' + String(s ?? '').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 140) + '`';

export function planMarkdown(plan, { baseSkill = '' } = {}) {
  const rec = (r) => (baseSkill ? `[${r}](${baseSkill}/${r})` : cod(r));
  const L = ['# Plan de arreglo de accesibilidad', ''];
  L.push(`Generado del informe del ${plan.informeFecha ?? '—'}: **${plan.total} fallos detectados** en **${plan.tareas.length} reglas**.`);
  if (plan.stack) {
    L.push(`Stack detectado: **${plan.stack.nombre}** (guía: ${rec(plan.stack.guia)})${plan.stack.ficherosRaiz.length ? `; plantilla raíz: ${plan.stack.ficherosRaiz.map(cod).join(', ')}` : ''}.`);
  } else {
    L.push('Sin código fuente: indica `--proyecto <carpeta>` para localizar los ficheros probables.');
  }
  L.push('');
  L.push(`Reparto: ${plan.resumen.automatico} regla(s) con arreglo automático · ${plan.resumen.asistido} asistidas · ${plan.resumen.humano} con criterio humano.`, '');
  L.push('> Las ubicaciones son pistas por coincidencia de texto: confírmalas antes de editar. Arreglar todo esto deja «cero fallos detectables», no una web accesible: después viene la revisión manual.', '');
  L.push('## Cómo usar este plan', '');
  L.push('1. Trabaja las tareas en orden. Mejor un bloque cada vez (una regla o componente), con su commit.');
  L.push('2. Tras cada bloque: reaudita y `node comparar.mjs <antes>/informe.json <después>/informe.json`.');
  L.push('3. Para el bucle según el veredicto de `comparar.mjs`. Lo que no puedas resolver, déjalo documentado: qué falta y quién decide.');
  L.push('');
  L.push('## Tareas', '');
  for (const t of plan.tareas) {
    L.push(`### ${t.orden}. ${cod(t.regla)} — ${String(t.descripcion ?? '').replace(/\n/g, ' ')}`, '');
    const criterios = t.criterios?.length ? t.criterios.join(', ') : 'buena práctica, sin criterio AA';
    L.push(`- **Impacto:** ${IMPACTO_ES[t.impacto] ?? t.impacto} · **Apariciones:** ${t.apariciones} en ${t.paginas} página(s) · **Criterios:** ${criterios}`);
    L.push(`- **Tipo:** ${TIPO_ES[t.tipo]}${t.arregloAutomatico ? ` (\`--solo ${t.arregloAutomatico}\`)` : ''}`);
    if (t.compartido) L.push('- **Componente compartido:** el mismo selector aparece en varias páginas. Arréglalo una vez en el origen.');
    if (t.dePlantilla) L.push(`- **Se arregla en la plantilla común**${t.ficherosRaiz.length ? `: ${t.ficherosRaiz.map(cod).join(', ')}` : ''}.`);
    if (t.arreglo) L.push(`- **Cómo:** ${t.arreglo}`);
    if (t.decisionHumana) L.push(`- **Decisión humana:** ${t.decisionHumana}`);
    if (t.receta) L.push(`- **Receta:** ${rec(t.receta)}`);
    for (const el of t.elementos) {
      L.push(`- ${cod(el.selector)} × ${el.veces} — ${el.paginas.join(', ')}`);
      if (el.html) L.push(`  - HTML: ${cod(el.html)}`);
      if (el.detalle) L.push(`  - ${String(el.detalle).replace(/\n/g, ' ')}`);
      for (const u of el.ubicaciones) L.push(`  - Fichero probable (${u.confianza}): ${cod(`${u.fichero}:${u.linea}`)} — pista ${cod(u.pista)}`);
    }
    L.push('');
  }
  if (!plan.tareas.length) L.push('_Sin fallos detectados. Pasa a la revisión manual: `node revision.mjs crear`._', '');
  if (plan.revisar.length) {
    L.push('## Para revisar a mano', '');
    L.push(`Quedan ${plan.revisar.length} elemento(s) que la herramienta no puede decidir: ver la sección «Necesita revisión manual» de \`informe.md\`.`, '');
  }
  return L.join('\n');
}
