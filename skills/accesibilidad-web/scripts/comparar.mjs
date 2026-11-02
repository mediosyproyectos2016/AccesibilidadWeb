#!/usr/bin/env node
// Compara dos auditorías y dice qué se arregló, qué es nuevo y si hay que seguir.
//
//   node comparar.mjs antes/informe.json despues/informe.json --salida comparacion.md
//
// Códigos de salida: 0 = sin regresiones; 1 = hay fallos nuevos o sin comprobar; 2 = error.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { comparacionMarkdown, comparar } from './lib/comparar.mjs';

const AYUDA = `
Uso: node comparar.mjs <antes/informe.json> <despues/informe.json> [--salida comparacion.md] [--json]

Veredicto (criterio de parada del bucle):
  seguir                    Hay progreso y queda trabajo.
  corregir-regresion        El último cambio introdujo fallos nuevos.
  reauditar                 Alguna página no se auditó en ambos informes.
  escalar                   Sin progreso: para y documenta cada pendiente.
  pasar-a-revision-manual   Cero fallos detectables. No significa que la web sea accesible.
`;

function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      salida: { type: 'string' },
      json: { type: 'boolean', default: false },
      ayuda: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.ayuda) { console.log(AYUDA); return 0; }
  const [a, b] = positionals;
  if (!a || !b || !existsSync(a) || !existsSync(b)) {
    console.error(`Error: indica dos informes que existan.\n${AYUDA}`);
    return 2;
  }
  const c = comparar(JSON.parse(readFileSync(a, 'utf8')), JSON.parse(readFileSync(b, 'utf8')));
  const md = comparacionMarkdown(c);
  if (values.salida) writeFileSync(values.salida, md);
  if (values.json) {
    console.log(JSON.stringify(c, null, 2));
  } else {
    const r = c.resumen;
    console.log(`Antes: ${r.antes} · Después: ${r.despues} · Arreglados: ${r.arreglados} · Nuevos: ${r.nuevos} · Persisten: ${r.persisten} · Sin comprobar: ${r.sinComprobar}`);
    for (const av of c.avisos) console.log(`Aviso: ${av}`);
    console.log(`Veredicto: ${c.veredicto.codigo}. ${c.veredicto.texto}`);
    if (values.salida) console.log(`Detalle: ${values.salida}`);
  }
  return c.resumen.nuevos || c.resumen.sinComprobar ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 2;
}
