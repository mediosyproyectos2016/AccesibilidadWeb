// Arreglos automáticos seguros, sobre el código fuente. Criterio de entrada: el
// resultado es correcto sea cual sea el contenido, no se inventa nada que dependa
// del significado (textos alternativos, títulos, etiquetas) y no puede ocultar un
// fallo a las herramientas. Lo demás se queda fuera y lo decide una persona.

/** Código de idioma BCP 47 sencillo. */
export const esCodigoIdioma = (v) => /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(String(v ?? ''));

/** Quita el bloqueo de zoom de un valor de meta viewport. Devuelve null si no hay nada que cambiar. */
export function limpiarViewport(contenido) {
  const partes = contenido.split(',').map((s) => s.trim()).filter(Boolean);
  const buenas = partes.filter((p) => {
    const [k, v] = p.split('=').map((s) => s.trim().toLowerCase());
    if (k === 'user-scalable') return !(v === 'no' || v === '0');
    if (k === 'maximum-scale') return false;
    return true;
  });
  return buenas.length === partes.length ? null : buenas.join(', ');
}

const SUSTITUCIONES = {
  /** <html> sin lang. Requiere que se indique el idioma: no se adivina. */
  'lang-html': {
    descripcion: 'Añade `lang` a `<html>` (necesita --idioma)',
    criterio: '3.1.1',
    extensiones: /\.(html?|jsx|tsx|astro|vue|erb|ejs|hbs|twig|njk|tpl|liquid|php|cshtml)$/i,
    aplicar(texto, { idioma }) {
      if (!idioma) return texto;
      // Tampoco en plantillas que ya lo calculan (language_attributes(), {{ … }}, spread…).
      return texto.replace(/<(html|Html)(\s[^<>]*?)?>/g, (m, tag, attrs = '') => {
        if (/\s(?:lang|xml:lang)\s*=|\{|<\?|<%|\.\.\./.test(attrs)) return m;
        return `<${tag} lang="${idioma}"${attrs}>`;
      });
    },
  },
  /** lang="es_ES" → lang="es-ES": el guion bajo no es válido. */
  'lang-formato': {
    descripcion: 'Corrige el guion bajo en `lang` (`es_ES` → `es-ES`)',
    criterio: '3.1.1',
    extensiones: /\.(html?|jsx|tsx|astro|vue|erb|ejs|hbs|twig|njk|tpl|liquid|php|cshtml)$/i,
    aplicar: (texto) => texto.replace(/(<(?:html|Html)\b[^<>]*?\slang=["'])([a-zA-Z]{2,3})_([a-zA-Z]{2,4})(["'])/g, '$1$2-$3$4'),
  },
  /** Quita user-scalable=no y maximum-scale del viewport. */
  'viewport-zoom': {
    descripcion: 'Permite el zoom: quita `user-scalable=no` y `maximum-scale` del viewport',
    criterio: '1.4.4',
    extensiones: /\.(html?|jsx|tsx|astro|vue|erb|ejs|hbs|twig|njk|tpl|liquid|php|cshtml)$/i,
    aplicar: (texto) => texto.replace(/(<meta\b[^<>]*?\bname=["']viewport["'][^<>]*?\bcontent=["'])([^"']*)(["'])/gi, (m, a, c, z) => {
      const limpio = limpiarViewport(c);
      return limpio === null ? m : `${a}${limpio}${z}`;
    }).replace(/(<meta\b[^<>]*?\bcontent=["'])([^"']*)(["'][^<>]*?\bname=["']viewport["'])/gi, (m, a, c, z) => {
      const limpio = limpiarViewport(c);
      return limpio === null ? m : `${a}${limpio}${z}`;
    }),
  },
  /** tabindex="3" → tabindex="0". Conserva que sea enfocable y devuelve el orden al DOM. */
  'tabindex-positivo': {
    descripcion: 'Cambia `tabindex` positivo por `0`',
    criterio: '2.4.3',
    extensiones: /\.(html?|jsx|tsx|astro|vue|svelte|erb|ejs|hbs|twig|njk|tpl|liquid|php|cshtml)$/i,
    aplicar: (texto) => texto
      .replace(/(\stab[iI]ndex=)(["'])0*[1-9]\d*\2/g, '$1$20$2')
      .replace(/(\stabIndex=)\{\s*0*[1-9]\d*\s*\}/g, '$1{0}'),
  },
  /** <marquee> y <blink> pasan a elementos normales: el contenido se queda, el movimiento no. */
  'marquee-blink': {
    descripcion: 'Sustituye `<marquee>` y `<blink>` por elementos estáticos',
    criterio: '2.2.2',
    extensiones: /\.(html?|jsx|tsx|astro|vue|svelte|erb|ejs|hbs|twig|njk|tpl|liquid|php|cshtml)$/i,
    aplicar: (texto) => texto
      .replace(/<marquee\b[^>]*>/gi, '<div>').replace(/<\/marquee\s*>/gi, '</div>')
      .replace(/<blink\b[^>]*>/gi, '<span>').replace(/<\/blink\s*>/gi, '</span>'),
  },
  /**
   * Quita `outline: none` donde nada lo sustituye. Si la regla pinta el foco de otra
   * forma (box-shadow, border, background) o es la técnica correcta
   * `:focus:not(:focus-visible)`, no se toca: decide una persona.
   */
  'outline-none': {
    descripcion: 'Quita `outline: none` de las reglas de CSS sin indicador de foco alternativo',
    criterio: '2.4.7',
    extensiones: /\.(css|scss|less|pcss)$/i,
    aplicar: (texto) => texto.replace(/([^{}]*)\{([^{}]*)\}/g, (regla, selector, cuerpo) => {
      if (!/outline\s*:\s*(?:none|0)\s*(?:!important\s*)?(?:;|$)/i.test(cuerpo)) return regla;
      if (/:not\(\s*:focus-visible\s*\)|@/.test(selector)) return regla;
      if (/:focus/i.test(selector) && /(?:box-shadow|border|background|text-decoration|color)\s*:/i.test(cuerpo)) return regla;
      const limpio = cuerpo.replace(/[ \t]*outline\s*:\s*(?:none|0)\s*(?:!important\s*)?(?:;|(?=\s*$))\n?/gi, '');
      // Si la regla queda vacía, se mantiene como regla vacía: menos riesgo que borrarla.
      return `${selector}{${limpio}}`;
    }),
  },
};

export const IDS_ARREGLOS = Object.keys(SUSTITUCIONES);
export const ID_CSS_GLOBAL = 'css-movimiento';

/** Bloques para añadir a la hoja global que indique --css-global. */
export const BLOQUE_MOVIMIENTO = `
/* Añadido por AccesibilidadWeb: respeta la preferencia de reducir el movimiento. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;
export const BLOQUE_FOCO = `
/* Añadido por AccesibilidadWeb: indicador de foco por defecto. Ajusta el color a tu marca (contraste 3:1). */
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
`;

export function descripcionDe(id) {
  return SUSTITUCIONES[id]?.descripcion ?? (id === ID_CSS_GLOBAL ? 'Añade a la hoja global un bloque `prefers-reduced-motion` y un `:focus-visible` por defecto (necesita --css-global)' : id);
}

/** Texto nuevo de un fichero con los arreglos pedidos, e identificadores aplicados. */
export function aplicarArreglos(nombre, texto, { ids = IDS_ARREGLOS, idioma = null } = {}) {
  let actual = texto;
  const aplicados = [];
  for (const id of ids) {
    const s = SUSTITUCIONES[id];
    if (!s || !s.extensiones.test(nombre)) continue;
    const nuevo = s.aplicar(actual, { idioma });
    if (nuevo !== actual) {
      aplicados.push(id);
      actual = nuevo;
    }
  }
  return { texto: actual, aplicados };
}

/** Añade los bloques globales a una hoja de estilos si no los tiene ya. */
export function aplicarCssGlobal(texto) {
  let actual = texto;
  if (!/prefers-reduced-motion/.test(actual)) actual = actual.replace(/\s*$/, '\n') + BLOQUE_MOVIMIENTO;
  if (!/:focus-visible/.test(actual)) actual = actual.replace(/\s*$/, '\n') + BLOQUE_FOCO;
  return actual;
}

/** Diferencia unificada, compatible con `git apply`, sin dependencias. */
export function diffUnificado(rutaRelativa, antes, despues, contexto = 3) {
  if (antes === despues) return '';
  // El último salto de línea no crea una línea más; si falta, se avisa como git.
  const partir = (t) => {
    const l = t.split('\n');
    if (l[l.length - 1] === '') l.pop();
    return l;
  };
  const SIN_SALTO = '\n\\ No newline at end of file';
  const a = partir(antes);
  const b = partir(despues);
  if (a.length && !antes.endsWith('\n')) a[a.length - 1] += SIN_SALTO;
  if (b.length && !despues.endsWith('\n')) b[b.length - 1] += SIN_SALTO;
  let inicio = 0;
  while (inicio < a.length && inicio < b.length && a[inicio] === b[inicio]) inicio++;
  let finA = a.length - 1;
  let finB = b.length - 1;
  while (finA >= inicio && finB >= inicio && a[finA] === b[finB]) { finA--; finB--; }

  const ops = operacionesLineas(a.slice(inicio, finA + 1), b.slice(inicio, finB + 1));
  const lineas = [];
  for (let i = 0; i < inicio; i++) lineas.push({ t: ' ', s: a[i] });
  lineas.push(...ops);
  for (let i = finA + 1; i < a.length; i++) lineas.push({ t: ' ', s: a[i] });

  // Agrupa en bloques con contexto.
  const cambios = lineas.map((l, i) => (l.t === ' ' ? -1 : i)).filter((i) => i >= 0);
  const bloques = [];
  for (const i of cambios) {
    const desde = Math.max(0, i - contexto);
    const hasta = Math.min(lineas.length - 1, i + contexto);
    const ultimo = bloques[bloques.length - 1];
    if (ultimo && desde <= ultimo.hasta + 1) ultimo.hasta = hasta;
    else bloques.push({ desde, hasta });
  }
  const salida = [`diff --git a/${rutaRelativa} b/${rutaRelativa}`, `--- a/${rutaRelativa}`, `+++ b/${rutaRelativa}`];
  let la = 1;
  let lb = 1;
  let pos = 0;
  for (const bl of bloques) {
    for (; pos < bl.desde; pos++) {
      if (lineas[pos].t !== '+') la++;
      if (lineas[pos].t !== '-') lb++;
    }
    const cuerpo = [];
    let na = 0;
    let nb = 0;
    const inicioA = la;
    const inicioB = lb;
    for (; pos <= bl.hasta; pos++) {
      const l = lineas[pos];
      cuerpo.push(l.t + l.s);
      if (l.t !== '+') { na++; la++; }
      if (l.t !== '-') { nb++; lb++; }
    }
    salida.push(`@@ -${na ? inicioA : inicioA - 1},${na} +${nb ? inicioB : inicioB - 1},${nb} @@`, ...cuerpo);
  }
  return salida.join('\n') + '\n';
}

/** Diferencia de líneas por subsecuencia común; si el tramo es enorme, lo sustituye entero. */
function operacionesLineas(a, b) {
  if (a.length * b.length > 4_000_000) {
    return [...a.map((s) => ({ t: '-', s })), ...b.map((s) => ({ t: '+', s }))];
  }
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { out.push({ t: ' ', s: a[i] }); i++; j++; }
    else if (i < n && (j >= m || dp[i + 1][j] >= dp[i][j + 1])) { out.push({ t: '-', s: a[i] }); i++; }
    else { out.push({ t: '+', s: b[j] }); j++; }
  }
  return out;
}
