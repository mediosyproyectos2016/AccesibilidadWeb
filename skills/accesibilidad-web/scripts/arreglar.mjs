#!/usr/bin/env node
// Arreglos automáticos seguros en el código fuente. Por defecto NO escribe nada:
// genera un diff para revisar. Solo con --aplicar modifica ficheros.
//
//   node arreglar.mjs --proyecto ../mi-web --idioma es
//   node arreglar.mjs --proyecto ../mi-web --idioma es --aplicar
//
// Códigos de salida: 0 = correcto; 2 = error.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  aplicarArreglos, aplicarCssGlobal, descripcionDe, diffUnificado, esCodigoIdioma, ID_CSS_GLOBAL, IDS_ARREGLOS,
} from './lib/arreglos.mjs';
import { listarFicheros } from './lib/localizar.mjs';

const AYUDA = `
Uso: node arreglar.mjs --proyecto <carpeta> [opciones]

Aplica solo arreglos cuyo resultado es correcto sea cual sea el contenido. Por
defecto no toca nada: escribe arreglos.diff para revisarlo. No genera textos
alternativos, etiquetas ni títulos: eso exige criterio humano (ver priorizar.mjs).

Arreglos:
${IDS_ARREGLOS.map((id) => `  ${id.padEnd(20)}${descripcionDe(id)}`).join('\n')}
  ${ID_CSS_GLOBAL.padEnd(20)}${descripcionDe(ID_CSS_GLOBAL)}

Opciones:
  --proyecto <carpeta>    Carpeta del código fuente (obligatoria).
  --idioma <código>       Idioma para el arreglo lang-html (es, ca, en…). Sin él, no se aplica.
  --solo <lista>          Solo estos arreglos, separados por comas.
  --css-global <fichero>  Hoja de estilos común, relativa al proyecto, para ${ID_CSS_GLOBAL}.
  --salida <fichero>      Dónde escribir el diff (por defecto arreglos.diff).
  --aplicar               Escribe los cambios en los ficheros. Hazlo sobre una rama limpia.
  --ayuda                 Muestra esta ayuda.

Después: revisa el diff, compila, reaudita y compara. Un arreglo correcto puede
cambiar el aspecto de la web (por ejemplo, reaparece el contorno de foco).
`;

function main() {
  let values;
  try {
    ({ values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        proyecto: { type: 'string' },
        idioma: { type: 'string' },
        solo: { type: 'string' },
        'css-global': { type: 'string' },
        salida: { type: 'string', default: 'arreglos.diff' },
        aplicar: { type: 'boolean', default: false },
        ayuda: { type: 'boolean', short: 'h', default: false },
      },
    }));
  } catch (e) {
    console.error(`Error: ${e.message}\n${AYUDA}`);
    return 2;
  }
  if (values.ayuda) { console.log(AYUDA); return 0; }
  if (!values.proyecto || !existsSync(values.proyecto)) {
    console.error(`Error: indica una carpeta de proyecto que exista con --proyecto.\n${AYUDA}`);
    return 2;
  }
  if (values.idioma && !esCodigoIdioma(values.idioma)) {
    console.error(`Error: «${values.idioma}» no es un código de idioma válido (es, ca, en-GB…).`);
    return 2;
  }
  const dir = path.resolve(values.proyecto);
  const conocidos = [...IDS_ARREGLOS, ID_CSS_GLOBAL];
  const pedidos = values.solo ? values.solo.split(',').map((s) => s.trim()).filter(Boolean) : conocidos;
  const desconocidos = pedidos.filter((p) => !conocidos.includes(p));
  if (desconocidos.length) {
    console.error(`Error: arreglos desconocidos: ${desconocidos.join(', ')}. Disponibles: ${conocidos.join(', ')}`);
    return 2;
  }

  const ids = pedidos.filter((p) => p !== ID_CSS_GLOBAL);
  const cambios = [];
  const ficheros = listarFicheros(dir, { filtro: (n) => /\.(html?|jsx|tsx|astro|vue|svelte|erb|ejs|hbs|twig|njk|tpl|liquid|php|cshtml|css|scss|less|pcss)$/i.test(n) });
  for (const ruta of ficheros) {
    const antes = readFileSync(ruta, 'utf8');
    const { texto, aplicados } = aplicarArreglos(ruta, antes, { ids, idioma: values.idioma });
    if (aplicados.length) cambios.push({ ruta, antes, despues: texto, aplicados });
  }

  if (pedidos.includes(ID_CSS_GLOBAL) && values['css-global']) {
    const ruta = path.resolve(dir, values['css-global']);
    if (path.relative(dir, ruta).startsWith('..')) {
      console.error('Error: --css-global debe estar dentro del proyecto.');
      return 2;
    }
    if (!existsSync(ruta)) {
      console.error(`Error: no existe la hoja de estilos ${values['css-global']}.`);
      return 2;
    }
    const previo = cambios.find((c) => c.ruta === ruta);
    const antes = previo ? previo.despues : readFileSync(ruta, 'utf8');
    const despues = aplicarCssGlobal(antes);
    if (despues !== antes) {
      if (previo) {
        previo.despues = despues;
        previo.aplicados.push(ID_CSS_GLOBAL);
      } else {
        cambios.push({ ruta, antes, despues, aplicados: [ID_CSS_GLOBAL] });
      }
    }
  }

  const relativa = (r) => path.relative(dir, r).split(path.sep).join('/');
  const diff = cambios.map((c) => diffUnificado(relativa(c.ruta), c.antes, c.despues)).join('');
  mkdirSync(path.dirname(path.resolve(values.salida)), { recursive: true });
  writeFileSync(values.salida, diff);

  if (!cambios.length) {
    console.log('No hay arreglos automáticos que aplicar.');
  }
  for (const c of cambios) console.log(`  ${relativa(c.ruta)}: ${c.aplicados.join(', ')}`);

  if (!values.idioma && pedidos.includes('lang-html')) {
    console.log('Aviso: sin --idioma no se añade lang a <html>. No se adivina el idioma de una web.');
  }
  if (pedidos.includes(ID_CSS_GLOBAL) && !values['css-global'] && !values.solo) {
    console.log(`Aviso: sin --css-global no se aplica ${ID_CSS_GLOBAL}.`);
  }

  if (values.aplicar) {
    for (const c of cambios) writeFileSync(c.ruta, c.despues);
    console.log(`\n${cambios.length} fichero(s) modificado(s). Copia del cambio en ${values.salida}. Revísalo, compila y reaudita.`);
  } else if (cambios.length) {
    console.log(`\nNo se ha modificado nada. Revisa ${values.salida} y aplícalo con --aplicar o con «git apply ${values.salida}» desde la carpeta del proyecto.`);
  }
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(`Error: ${e.stack || e.message}`);
  process.exitCode = 2;
}
