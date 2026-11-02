#!/usr/bin/env node
// Registro de la revisión manual: lo que la auditoría automática no puede juzgar.
//
//   node revision.mjs crear --informe informe.json --salida revision-manual.json
//   node revision.mjs marcar revision-manual.json --id lector-pantalla --estado ok --por "Ana" --metodo "NVDA + Firefox"
//   node revision.mjs estado revision-manual.json
//
// Códigos de salida: 0 = correcto (en «estado», revisión completa); 1 = quedan
// comprobaciones pendientes; 2 = error.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { crearRevision, ESTADOS, estadoRevision, respuestaValida, revisionMarkdown } from './lib/manual.mjs';

const AYUDA = `
Uso:
  node revision.mjs crear --informe <informe.json> [--salida revision-manual.json]
      Crea el registro. Si ya existe, conserva las respuestas.
  node revision.mjs marcar <revision.json> --id <id> --estado <estado> --por <nombre> --metodo <texto>
      [--notas <texto>] [--agente]   Estados: ${ESTADOS.join(', ')}.
      Usa --agente si quien lo marca es una IA: no podrá aprobar lo que exige a una persona.
  node revision.mjs estado <revision.json>
      Resume y sale con código 1 si quedan comprobaciones pendientes.
`;

const leerJSON = (r) => JSON.parse(readFileSync(r, 'utf8'));
const guardar = (ruta, rev) => {
  writeFileSync(ruta, JSON.stringify(rev, null, 2) + '\n');
  writeFileSync(ruta.replace(/\.json$/i, '') + '.md', revisionMarkdown(rev));
};

function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      informe: { type: 'string' },
      salida: { type: 'string', default: 'revision-manual.json' },
      id: { type: 'string' },
      estado: { type: 'string' },
      por: { type: 'string' },
      metodo: { type: 'string' },
      notas: { type: 'string' },
      agente: { type: 'boolean', default: false },
      ayuda: { type: 'boolean', short: 'h', default: false },
    },
  });
  const [orden, fichero] = positionals;
  if (values.ayuda || !orden) { console.log(AYUDA); return values.ayuda ? 0 : 2; }

  if (orden === 'crear') {
    const informe = values.informe ? leerJSON(values.informe) : null;
    const anterior = existsSync(values.salida) ? leerJSON(values.salida) : null;
    const rev = crearRevision(informe, anterior);
    guardar(values.salida, rev);
    const e = estadoRevision(rev);
    console.log(`Revisión en ${values.salida}: ${e.pendientes.length} de ${e.total} comprobaciones pendientes.`);
    return 0;
  }
  if (orden === 'marcar') {
    if (!fichero || !existsSync(fichero)) { console.error(`Error: indica el fichero de revisión.\n${AYUDA}`); return 2; }
    const rev = leerJSON(fichero);
    const c = rev.comprobaciones.find((x) => x.id === values.id);
    if (!c) { console.error(`Error: no existe la comprobación «${values.id}».`); return 2; }
    if (!ESTADOS.includes(values.estado)) { console.error(`Error: estado no válido. Usa: ${ESTADOS.join(', ')}.`); return 2; }
    if (values.estado !== 'pendiente' && (!values.por?.trim() || !values.metodo?.trim())) {
      console.error('Error: registrar una comprobación exige --por y --metodo.');
      return 2;
    }
    Object.assign(c, {
      estado: values.estado,
      comprobadoPor: values.por ?? '',
      esAgente: values.agente,
      metodo: values.metodo ?? '',
      fecha: new Date().toISOString().slice(0, 10),
      notas: values.notas ?? c.notas,
    });
    guardar(fichero, rev);
    if (values.estado !== 'pendiente' && !respuestaValida(c)) {
      console.error(`Aviso: «${c.id}» exige a una persona o no admite ese estado: sigue contando como pendiente.`);
      return 1;
    }
    console.log(`«${c.id}»: ${c.estado}.`);
    return 0;
  }
  if (orden === 'estado') {
    if (!fichero || !existsSync(fichero)) { console.error(`Error: indica el fichero de revisión.\n${AYUDA}`); return 2; }
    const e = estadoRevision(leerJSON(fichero));
    console.log(`${e.respondidas}/${e.total} registradas · ${e.ok} ok · ${e.fallos.length} con fallo · ${e.noAplica} no aplican · ${e.pendientes.length} pendientes.`);
    for (const c of e.pendientes) console.log(`  - ${c.id}: ${c.titulo}`);
    for (const c of e.fallos) console.log(`  ✗ ${c.id}: ${c.notas || c.titulo}`);
    return e.pendientes.length ? 1 : 0;
  }
  console.error(`Error: orden desconocida «${orden}».\n${AYUDA}`);
  return 2;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 2;
}
