// Del hallazgo al código: busca en el proyecto el fichero fuente probable de un
// elemento a partir de su HTML renderizado. Es una pista, nunca una certeza: el
// HTML puede venir de un CMS, de una biblioteca o de un tercero.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const CARPETAS_IGNORADAS = new Set([
  'node_modules', '.git', '.next', '.nuxt', '.output', '.svelte-kit', '.astro', '.cache', '.turbo', '.vercel',
  'dist', 'build', 'out', 'coverage', 'vendor', '.venv', 'venv', '__pycache__', 'storybook-static',
  'informe-accesibilidad',
]);
export const EXT_PLANTILLA = /\.(html?|jsx|tsx|vue|svelte|astro|liquid|php|twig|njk|erb|ejs|hbs|mustache|tpl|cshtml|razor|blade\.php|mdx)$/i;
export const EXT_ESTILO = /\.(css|scss|sass|less|styl|pcss)$/i;
const EXT_CODIGO = /\.(js|mjs|cjs|ts|json)$/i;
const TAM_MAX = 512 * 1024;

/** Lista recursiva de ficheros de código del proyecto, sin artefactos ni minificados. */
export function listarFicheros(dir, { filtro } = {}) {
  const out = [];
  const pendientes = [dir];
  while (pendientes.length) {
    const actual = pendientes.pop();
    let entradas;
    try {
      entradas = readdirSync(actual, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entradas) {
      if (CARPETAS_IGNORADAS.has(e.name)) continue;
      const ruta = path.join(actual, e.name);
      if (e.isDirectory()) {
        pendientes.push(ruta);
      } else if (e.isFile() && !/\.min\.(js|css)$/i.test(e.name) && e.name !== 'package-lock.json') {
        const vale = filtro ? filtro(e.name) : EXT_PLANTILLA.test(e.name) || EXT_ESTILO.test(e.name) || EXT_CODIGO.test(e.name);
        if (!vale) continue;
        try {
          if (statSync(ruta).size <= TAM_MAX) out.push(ruta);
        } catch { /* fichero que desaparece durante el recorrido */ }
      }
    }
  }
  return out.sort();
}

/** Carga el proyecto en memoria una sola vez para las búsquedas. */
export function indexarProyecto(dir) {
  return listarFicheros(dir).flatMap((ruta) => {
    try {
      const texto = readFileSync(ruta, 'utf8');
      return [{ ruta: path.relative(dir, ruta).split(path.sep).join('/'), texto, plantilla: EXT_PLANTILLA.test(ruta), estilo: EXT_ESTILO.test(ruta) }];
    } catch {
      return [];
    }
  });
}

const CLASE_INUTIL = /^(?:css-|jsx-|sc-|svelte-|_|[a-z]{1,3}-[a-f0-9]{5,}$)|[0-9a-f]{6,}|^(?:active|open|show|hidden|visible|container|wrapper|row|col|btn|button|link|text|flex|grid|block|inline|relative|absolute)$/i;
const es_utilidad = (c) => /[:[\]/]/.test(c) || /^(?:[mp][trblxy]?|w|h|gap|text|bg|border|rounded|font|leading|flex|grid|items|justify)-/.test(c);

/** Pistas buscables de un fragmento HTML y su selector, de más a menos específica. */
export function pistasDe({ html = '', selector = '' }) {
  const pistas = [];
  const add = (texto, peso, tipo) => {
    const t = String(texto).trim();
    if (t.length >= 3 && !pistas.some((p) => p.texto === t)) pistas.push({ texto: t, peso, tipo });
  };
  const attr = (nombre) => [...html.matchAll(new RegExp(`\\s${nombre}=(?:"([^"]*)"|'([^']*)')`, 'gi'))].map((m) => m[1] ?? m[2] ?? '');
  for (const v of attr('id')) add(v, 6, 'id');
  for (const n of ['data-testid', 'data-test', 'data-cy', 'data-qa']) for (const v of attr(n)) add(v, 6, 'test');
  for (const n of ['aria-label', 'alt', 'placeholder', 'title']) for (const v of attr(n)) add(v, 5, n);
  for (const v of attr('name')) add(v, 4, 'name');
  for (const v of attr('href')) if (v.startsWith('/') && v.length > 1) add(v, 3, 'href');
  for (const v of attr('src')) {
    const f = v.split(/[?#]/)[0].split('/').pop();
    if (f && !f.startsWith('data:') && !/^[0-9a-f]{8,}/.test(f)) add(f, 4, 'src');
  }
  const textoVisible = html.replace(/<[^>]*>/g, ' ').replace(/«|»/g, ' ').replace(/\s+/g, ' ').trim();
  if (textoVisible.length >= 4 && textoVisible.length <= 80) add(textoVisible, 5, 'texto');
  for (const v of attr('class')) {
    for (const c of v.split(/\s+/)) if (c && !CLASE_INUTIL.test(c) && !es_utilidad(c)) add(c, 2, 'clase');
  }
  for (const m of String(selector).matchAll(/#([A-Za-z][\w-]*)/g)) add(m[1], 5, 'id');
  for (const m of String(selector).matchAll(/\.([A-Za-z][\w-]*)/g)) {
    if (!CLASE_INUTIL.test(m[1]) && !es_utilidad(m[1])) add(m[1], 2, 'clase');
  }
  return pistas;
}

function numeroDeLinea(texto, indice) {
  let n = 1;
  for (let i = 0; i < indice; i++) if (texto.charCodeAt(i) === 10) n++;
  return n;
}

/**
 * Ficheros más probables de un hallazgo. Las pistas raras pesan más: una clase que
 * aparece en un solo fichero dice mucho más que una que aparece en cien. Los
 * fallos de color o foco miran también las hojas de estilo.
 */
export function localizar(indice, problema, { max = 3, conEstilos = false } = {}) {
  const pistas = pistasDe(problema);
  const puntos = new Map();
  for (const p of pistas) {
    const con = indice.filter((f) => (f.plantilla || (conEstilos && f.estilo) || (!f.estilo && p.tipo !== 'clase')) && f.texto.includes(p.texto));
    if (!con.length || con.length > 40) continue;
    const valor = p.peso / con.length;
    for (const f of con) {
      const previo = puntos.get(f.ruta) ?? { fichero: f.ruta, puntos: 0, pista: null, linea: 0, mejor: 0 };
      previo.puntos += valor * (f.plantilla ? 1 : f.estilo ? 0.8 : 0.5);
      if (valor > previo.mejor) {
        previo.mejor = valor;
        previo.pista = p.texto;
        previo.linea = numeroDeLinea(f.texto, f.texto.indexOf(p.texto));
      }
      puntos.set(f.ruta, previo);
    }
  }
  return [...puntos.values()]
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, max)
    .map((u) => ({
      fichero: u.fichero, linea: u.linea, pista: u.pista,
      confianza: u.puntos >= 3 ? 'alta' : u.puntos >= 1 ? 'media' : 'baja',
    }));
}
