#!/usr/bin/env node
// Del informe al plan de arreglo: ordena por impacto y alcance, señala el fichero
// fuente probable y separa lo automático, lo asistido y lo que exige criterio humano.
//
//   node priorizar.mjs informe-accesibilidad/informe.json --proyecto ../mi-web
//
// Códigos de salida: 0 = plan generado; 2 = error.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { indexarProyecto } from './lib/localizar.mjs';
import { generarPlan, planMarkdown } from './lib/plan.mjs';
import { detectarStack } from './lib/stack.mjs';

const AYUDA = `
Uso: node priorizar.mjs <informe.json> [opciones]

Opciones:
  --proyecto <carpeta>   Carpeta del código de la web, para localizar ficheros y detectar el stack.
  --salida <carpeta>     Dónde escribir plan.md y plan.json (por defecto, junto al informe).
  --recetas <ruta>       Ruta (relativa a plan.md) a la carpeta de la skill, para enlazar las recetas.
  --ayuda                Muestra esta ayuda.
`;

function main() {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      options: {
        proyecto: { type: 'string' },
        salida: { type: 'string' },
        recetas: { type: 'string' },
        ayuda: { type: 'boolean', short: 'h', default: false },
      },
    }));
  } catch (e) {
    console.error(`Error: ${e.message}\n${AYUDA}`);
    return 2;
  }
  if (values.ayuda) { console.log(AYUDA); return 0; }
  const ruta = positionals[0];
  if (!ruta || !existsSync(ruta)) {
    console.error(`Error: indica un informe.json que exista.\n${AYUDA}`);
    return 2;
  }
  if (values.proyecto && !existsSync(values.proyecto)) {
    console.error(`Error: no existe la carpeta ${values.proyecto}.`);
    return 2;
  }
  const informe = JSON.parse(readFileSync(ruta, 'utf8'));
  const dir = values.proyecto ? path.resolve(values.proyecto) : null;
  const plan = generarPlan(informe, {
    stack: dir ? detectarStack(dir) : null,
    indice: dir ? indexarProyecto(dir) : null,
  });
  const salida = values.salida ?? path.dirname(ruta);
  mkdirSync(salida, { recursive: true });
  writeFileSync(path.join(salida, 'plan.json'), JSON.stringify(plan, null, 2));
  writeFileSync(path.join(salida, 'plan.md'), planMarkdown(plan, { baseSkill: values.recetas ?? '' }));
  console.log(`${plan.tareas.length} tarea(s) de ${plan.total} fallos: ${plan.resumen.automatico} con arreglo automático, ${plan.resumen.asistido} asistidas, ${plan.resumen.humano} con criterio humano.`);
  console.log(`Plan: ${path.resolve(salida, 'plan.md')}`);
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(`Error: ${e.stack || e.message}`);
  process.exitCode = 2;
}
