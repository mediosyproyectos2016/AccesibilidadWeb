#!/usr/bin/env node
// ¿Le aplica a esta web la normativa de accesibilidad? Sin red y sin dependencias.
//
//   node aplicabilidad.mjs --destinatarios consumidores --contrato en-la-web --personas 25 --comunidad MD
//   node aplicabilidad.mjs --entrada respuestas.json --salida a11y
//
// Vale para cualquier web: las preguntas son de hechos, no de tipos de negocio.
// Códigos de salida: 0 = evaluado (lee el veredicto); 2 = error en los datos.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { aMarkdown, evaluar, PREGUNTAS } from './lib/aplicabilidad.mjs';
import { COMUNIDADES } from './lib/normativa/es.mjs';

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const AYUDA = `
Uso: node aplicabilidad.mjs [respuestas] [opciones]

Responde lo que sepas: lo que falte sale como dato pendiente y, si cambia el resultado,
el veredicto es «dudoso» con cada escenario.

Respuestas:
${PREGUNTAS.map((p) => `  --${kebab(p.id)}${p.numero ? ' <n>' : ` <${(p.valores ?? []).join('|')}>`}\n      ${p.pregunta}`).join('\n')}

Opciones:
  --entrada <fichero>   Respuestas en JSON, con los mismos nombres (camelCase). Las opciones mandan.
  --salida <carpeta>    Escribe aplicabilidad.json y aplicabilidad.md.
  --json                Escribe el resultado en JSON por la salida estándar.
  --preguntas           Lista las preguntas en JSON.
  --comunidades         Lista códigos y estado de la autoridad por comunidad.
  --ayuda               Esta ayuda.

Después: node declaracion.mjs --aplicabilidad aplicabilidad.json ...

No es asesoramiento jurídico. La fecha de revisión de los datos va en el resultado.
`;

function main() {
  const opciones = {
    entrada: { type: 'string' },
    salida: { type: 'string' },
    json: { type: 'boolean', default: false },
    preguntas: { type: 'boolean', default: false },
    comunidades: { type: 'boolean', default: false },
    ayuda: { type: 'boolean', short: 'h', default: false },
  };
  for (const p of PREGUNTAS) opciones[kebab(p.id)] = { type: 'string' };
  const { values } = parseArgs({ args: process.argv.slice(2), options: opciones });

  if (values.ayuda) { console.log(AYUDA); return 0; }
  if (values.preguntas) { console.log(JSON.stringify(PREGUNTAS, null, 2)); return 0; }
  if (values.comunidades) {
    for (const [codigo, c] of Object.entries(COMUNIDADES)) console.log(`${codigo}\t${c.nombre}\t${c.estado}`);
    return 0;
  }

  const respuestas = values.entrada ? JSON.parse(readFileSync(values.entrada, 'utf8')) : {};
  for (const [k, v] of Object.entries(values)) {
    if (k in opciones && !['entrada', 'salida', 'json', 'preguntas', 'comunidades', 'ayuda'].includes(k)) {
      respuestas[camel(k)] = v;
    }
  }

  const resultado = evaluar(respuestas);
  const md = aMarkdown(resultado);
  if (values.salida) {
    mkdirSync(values.salida, { recursive: true });
    writeFileSync(path.join(values.salida, 'aplicabilidad.json'), `${JSON.stringify(resultado, null, 2)}\n`);
    writeFileSync(path.join(values.salida, 'aplicabilidad.md'), md);
    console.log(`Veredicto: ${resultado.veredicto}. Certeza: ${resultado.certeza}.`);
    console.log(`Resultado: ${path.resolve(values.salida, 'aplicabilidad.md')} y .json`);
    return 0;
  }
  console.log(values.json ? JSON.stringify(resultado, null, 2) : md);
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 2;
}
