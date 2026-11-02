#!/usr/bin/env node
// Declaración de accesibilidad generada de los resultados reales.
//
//   node declaracion.mjs --informe informe.json --revision revision-manual.json --datos datos.json
//
// Nunca afirma una conformidad no verificada: sin revisión manual completa genera
// un borrador sin situación de cumplimiento, marcado para no publicarse.
//
// Códigos de salida: 0 = generada (lee el aviso si es borrador); 1 = se generó un
// borrador no publicable; 2 = error o confirmación rechazada.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { evaluar, generarDeclaracion, motivoRechazoConfirmacion } from './lib/declaracion.mjs';

const AYUDA = `
Uso: node declaracion.mjs --informe <informe.json> [opciones]

Opciones:
  --revision <fichero>    Revisión manual (revision.mjs). Sin ella, solo un borrador.
  --datos <fichero>       Datos de la entidad: ver plantillas/datos-declaracion.json.
  --salida <carpeta>      Dónde escribir declaracion.md y .html (por defecto, carpeta del informe).
  --situacion no-conforme Si hay fallos, declara «no conforme» en lugar de «parcialmente».
                          Decídelo tú: «parcial» supone que se cumple la mayor parte.
  --confirmar-plena-conformidad "<nombre y cargo>"
                          Quien asume la plena conformidad. Se rechaza si hay fallos,
                          la revisión manual no está completa o el informe es antiguo.
  --ayuda                 Muestra esta ayuda.

No es asesoramiento jurídico: revisa el texto antes de publicarlo.
`;

function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      informe: { type: 'string' },
      revision: { type: 'string' },
      datos: { type: 'string' },
      salida: { type: 'string' },
      situacion: { type: 'string' },
      'confirmar-plena-conformidad': { type: 'string' },
      ayuda: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.ayuda) { console.log(AYUDA); return 0; }
  if (!values.informe || !existsSync(values.informe)) {
    console.error(`Error: indica un informe.json que exista.\n${AYUDA}`);
    return 2;
  }
  if (values.situacion && values.situacion !== 'no-conforme') {
    console.error('Error: --situacion solo admite no-conforme.');
    return 2;
  }
  const leer = (r) => (r ? JSON.parse(readFileSync(r, 'utf8')) : null);
  const informe = leer(values.informe);
  const revision = leer(values.revision);
  const datos = leer(values.datos) ?? {};
  const confirmacion = values['confirmar-plena-conformidad']?.trim() || null;
  const opciones = { confirmacion, situacion: values.situacion ?? null };

  if (confirmacion) {
    const motivo = motivoRechazoConfirmacion(evaluar(informe, revision, opciones));
    if (motivo) {
      console.error(`Error: no se puede declarar plena conformidad. ${motivo}`);
      return 2;
    }
  }

  const r = generarDeclaracion(informe, revision, datos, opciones);
  const salida = values.salida ?? path.dirname(values.informe);
  mkdirSync(salida, { recursive: true });
  writeFileSync(path.join(salida, 'declaracion.md'), r.markdown);
  writeFileSync(path.join(salida, 'declaracion.html'), r.html);
  console.log(`Situación: ${r.evaluacion.situacion}.`);
  for (const m of r.evaluacion.motivos) console.log(`  - ${m}`);
  if (r.marcadores.length) console.log(`  - Faltan datos: ${r.marcadores.join(', ')}`);
  console.log(`Declaración: ${path.resolve(salida, 'declaracion.md')} y .html`);
  if (!r.publicable) {
    console.log('Es un BORRADOR: no la publiques hasta resolver lo anterior.');
    return 1;
  }
  console.log('Lista para revisar. Compruébala antes de publicar: no es asesoramiento jurídico.');
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 2;
}
