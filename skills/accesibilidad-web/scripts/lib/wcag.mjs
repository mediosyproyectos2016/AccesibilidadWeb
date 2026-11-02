// Criterios WCAG 2.2 de nivel A y AA con su nombre en español y su
// correspondencia con la cláusula 9 de EN 301 549 v3.2.1 (contenido web).
// EN 301 549 V3.2.1 incorpora WCAG 2.1 AA: los criterios nuevos de WCAG 2.2
// no tienen cláusula en ella (clausulaEN devuelve null). La V4.1.1 (ETSI,
// 2-09-2026) pasa a WCAG 2.2 AA; ver docs/normativa-es.md.

export const CRITERIOS = {
  '1.1.1': { nombre: 'Contenido no textual', nivel: 'A' },
  '1.2.1': { nombre: 'Solo audio y solo vídeo (grabado)', nivel: 'A' },
  '1.2.2': { nombre: 'Subtítulos (grabado)', nivel: 'A' },
  '1.2.3': { nombre: 'Audiodescripción o medio alternativo (grabado)', nivel: 'A' },
  '1.2.4': { nombre: 'Subtítulos (en directo)', nivel: 'AA' },
  '1.2.5': { nombre: 'Audiodescripción (grabado)', nivel: 'AA' },
  '1.3.1': { nombre: 'Información y relaciones', nivel: 'A' },
  '1.3.2': { nombre: 'Secuencia significativa', nivel: 'A' },
  '1.3.3': { nombre: 'Características sensoriales', nivel: 'A' },
  '1.3.4': { nombre: 'Orientación', nivel: 'AA' },
  '1.3.5': { nombre: 'Identificar el propósito de la entrada', nivel: 'AA' },
  '1.4.1': { nombre: 'Uso del color', nivel: 'A' },
  '1.4.2': { nombre: 'Control del audio', nivel: 'A' },
  '1.4.3': { nombre: 'Contraste (mínimo)', nivel: 'AA' },
  '1.4.4': { nombre: 'Cambio de tamaño del texto', nivel: 'AA' },
  '1.4.5': { nombre: 'Imágenes de texto', nivel: 'AA' },
  '1.4.10': { nombre: 'Reajuste del texto (reflow)', nivel: 'AA' },
  '1.4.11': { nombre: 'Contraste no textual', nivel: 'AA' },
  '1.4.12': { nombre: 'Espaciado del texto', nivel: 'AA' },
  '1.4.13': { nombre: 'Contenido con hover o foco', nivel: 'AA' },
  '2.1.1': { nombre: 'Teclado', nivel: 'A' },
  '2.1.2': { nombre: 'Sin trampas para el foco del teclado', nivel: 'A' },
  '2.1.4': { nombre: 'Atajos de teclado de un carácter', nivel: 'A' },
  '2.2.1': { nombre: 'Tiempo ajustable', nivel: 'A' },
  '2.2.2': { nombre: 'Poner en pausa, detener, ocultar', nivel: 'A' },
  '2.3.1': { nombre: 'Umbral de tres destellos o menos', nivel: 'A' },
  '2.4.1': { nombre: 'Evitar bloques', nivel: 'A' },
  '2.4.2': { nombre: 'Titulado de páginas', nivel: 'A' },
  '2.4.3': { nombre: 'Orden del foco', nivel: 'A' },
  '2.4.4': { nombre: 'Propósito de los enlaces (en contexto)', nivel: 'A' },
  '2.4.5': { nombre: 'Múltiples vías', nivel: 'AA' },
  '2.4.6': { nombre: 'Encabezados y etiquetas', nivel: 'AA' },
  '2.4.7': { nombre: 'Foco visible', nivel: 'AA' },
  '2.4.11': { nombre: 'Foco no oculto (mínimo)', nivel: 'AA', wcag22: true },
  '2.5.1': { nombre: 'Gestos del puntero', nivel: 'A' },
  '2.5.2': { nombre: 'Cancelación del puntero', nivel: 'A' },
  '2.5.3': { nombre: 'Etiqueta en el nombre', nivel: 'A' },
  '2.5.4': { nombre: 'Activación mediante movimiento', nivel: 'A' },
  '2.5.7': { nombre: 'Movimientos de arrastre', nivel: 'AA', wcag22: true },
  '2.5.8': { nombre: 'Tamaño del objetivo (mínimo)', nivel: 'AA', wcag22: true },
  '3.1.1': { nombre: 'Idioma de la página', nivel: 'A' },
  '3.1.2': { nombre: 'Idioma de las partes', nivel: 'AA' },
  '3.2.1': { nombre: 'Al recibir el foco', nivel: 'A' },
  '3.2.2': { nombre: 'Al recibir entradas', nivel: 'A' },
  '3.2.3': { nombre: 'Navegación coherente', nivel: 'AA' },
  '3.2.4': { nombre: 'Identificación coherente', nivel: 'AA' },
  '3.2.6': { nombre: 'Ayuda coherente', nivel: 'A', wcag22: true },
  '3.3.1': { nombre: 'Identificación de errores', nivel: 'A' },
  '3.3.2': { nombre: 'Etiquetas o instrucciones', nivel: 'A' },
  '3.3.3': { nombre: 'Sugerencias ante errores', nivel: 'AA' },
  '3.3.4': { nombre: 'Prevención de errores (legales, financieros, de datos)', nivel: 'AA' },
  '3.3.7': { nombre: 'Entrada redundante', nivel: 'A', wcag22: true },
  '3.3.8': { nombre: 'Autenticación accesible (mínimo)', nivel: 'AA', wcag22: true },
  '4.1.1': { nombre: 'Procesamiento (obsoleto en WCAG 2.2; vigente en EN 301 549 v3.2.1)', nivel: 'A' },
  '4.1.2': { nombre: 'Nombre, función, valor', nivel: 'A' },
  '4.1.3': { nombre: 'Mensajes de estado', nivel: 'AA' },
};

/** Cláusula EN 301 549 v3.2.1 para contenido web, o null si no existe. */
export function clausulaEN(criterio) {
  const c = CRITERIOS[criterio];
  if (!c || c.wcag22) return null;
  return `9.${criterio}`;
}

/** Convierte una etiqueta de axe-core («wcag1410») en criterio («1.4.10»). */
export function etiquetaACriterio(tag) {
  const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

/** Criterios WCAG de una regla de axe a partir de sus etiquetas. */
export function criteriosDeEtiquetas(tags = []) {
  const out = [];
  for (const t of tags) {
    const c = etiquetaACriterio(t);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

/** Ordena criterios numéricamente: 1.4.3 < 1.4.10 < 2.1.1. */
export function compararCriterios(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

export const IMPACTOS = ['critical', 'serious', 'moderate', 'minor'];
export const IMPACTO_ES = {
  critical: 'crítico',
  serious: 'grave',
  moderate: 'moderado',
  minor: 'leve',
};

/** Rango numérico del impacto (0 = crítico). Desconocido = leve. */
export function rangoImpacto(impacto) {
  const i = IMPACTOS.indexOf(impacto);
  return i === -1 ? IMPACTOS.length - 1 : i;
}

/** Acepta el umbral en inglés o en español. Devuelve el impacto en inglés o null (= nunca falla). */
export function normalizarUmbral(valor) {
  if (!valor) return 'serious';
  const v = String(valor).toLowerCase().trim();
  if (['ninguno', 'none', 'off', 'no'].includes(v)) return null;
  const mapa = { critico: 'critical', 'crítico': 'critical', grave: 'serious', moderado: 'moderate', leve: 'minor' };
  const r = mapa[v] ?? v;
  if (!IMPACTOS.includes(r)) throw new Error(`Umbral no válido: «${valor}». Usa crítico, grave, moderado, leve o ninguno.`);
  return r;
}

const REC = 'references/recetas';

// Sugerencias de arreglo por regla de axe-core. `receta` apunta a la receta
// de la skill que explica el patrón correcto con ejemplos por stack.
export const ARREGLOS = {
  'image-alt': { texto: 'Añade `alt` descriptivo a las imágenes con información; `alt=""` a las decorativas.', receta: `${REC}/imagenes.md` },
  'input-image-alt': { texto: 'El `<input type="image">` necesita `alt` que diga la acción («Buscar»).', receta: `${REC}/imagenes.md` },
  'role-img-alt': { texto: 'Los elementos con `role="img"` necesitan `aria-label` o `aria-labelledby`.', receta: `${REC}/imagenes.md` },
  'svg-img-alt': { texto: 'Los SVG con `role="img"` necesitan `<title>` o `aria-label`; los decorativos, `aria-hidden="true"`.', receta: `${REC}/iconos.md` },
  'image-redundant-alt': { texto: 'No repitas en el `alt` el texto que ya está junto a la imagen; usa `alt=""`.', receta: `${REC}/imagenes.md` },
  'object-alt': { texto: 'Da un texto alternativo a `<object>` (contenido de reserva o `aria-label`).', receta: `${REC}/imagenes.md` },
  'area-alt': { texto: 'Cada `<area>` de un mapa de imagen necesita `alt`.', receta: `${REC}/imagenes.md` },
  'link-name': { texto: 'El enlace no tiene nombre accesible: añade texto visible, `aria-label` o `alt` a la imagen que contiene.', receta: `${REC}/enlaces.md` },
  'button-name': { texto: 'El botón no tiene nombre accesible: texto visible o `aria-label` («Cerrar», «Añadir a favoritos»).', receta: `${REC}/botones.md` },
  'input-button-name': { texto: 'Los `<input type="button|submit|reset">` necesitan `value` o `aria-label`.', receta: `${REC}/botones.md` },
  'label': { texto: 'Asocia una `<label for>` visible a cada campo (el `placeholder` no es etiqueta).', receta: `${REC}/formularios.md` },
  'select-name': { texto: 'El `<select>` necesita una `<label>` asociada.', receta: `${REC}/formularios.md` },
  'label-title-only': { texto: 'No uses solo `title` como etiqueta; añade una `<label>` visible.', receta: `${REC}/formularios.md` },
  'form-field-multiple-labels': { texto: 'Deja una sola etiqueta por campo.', receta: `${REC}/formularios.md` },
  'autocomplete-valid': { texto: 'Usa valores válidos de `autocomplete` (`email`, `given-name`, `postal-code`…).', receta: `${REC}/formularios.md` },
  'label-content-name-mismatch': { texto: 'El nombre accesible debe contener el texto visible (para control por voz). Lo más limpio: quita el `aria-label` y añade el resto como texto oculto visualmente dentro del enlace o botón.', receta: `${REC}/botones.md` },
  'color-contrast': { texto: 'Sube el contraste a 4,5:1 (texto normal) o 3:1 (texto grande ≥ 24 px o ≥ 18,66 px en negrita).', receta: `${REC}/contraste.md` },
  'color-contrast-enhanced': { texto: 'Contraste AAA (7:1): recomendable, no obligatorio para AA.', receta: `${REC}/contraste.md` },
  'link-in-text-block': { texto: 'Los enlaces dentro de un párrafo deben distinguirse sin depender solo del color (subrayado).', receta: `${REC}/enlaces.md` },
  'document-title': { texto: 'Añade un `<title>` único y descriptivo («Ofertas – Mi tienda»).', receta: `${REC}/estructura.md` },
  'html-has-lang': { texto: 'Declara el idioma: `<html lang="es">`.', receta: `${REC}/estructura.md` },
  'html-lang-valid': { texto: 'Usa un código de idioma válido (`es`, `ca`, `eu`, `gl`, `en`).', receta: `${REC}/estructura.md` },
  'valid-lang': { texto: 'Corrige el atributo `lang` del fragmento a un código válido.', receta: `${REC}/estructura.md` },
  'html-xml-lang-mismatch': { texto: 'Haz coincidir `lang` y `xml:lang`.', receta: `${REC}/estructura.md` },
  'bypass': { texto: 'Añade un enlace «Saltar al contenido» y regiones (`<main>`, `<nav>`).', receta: `${REC}/estructura.md` },
  'skip-link': { texto: 'El enlace para saltar bloques apunta a un destino que no existe o no es enfocable.', receta: `${REC}/estructura.md` },
  'region': { texto: 'Mete todo el contenido en regiones (`<header>`, `<nav>`, `<main>`, `<footer>`).', receta: `${REC}/estructura.md` },
  'landmark-one-main': { texto: 'La página debe tener exactamente un `<main>`.', receta: `${REC}/estructura.md` },
  'landmark-unique': { texto: 'Diferencia regiones repetidas con un `aria-label` según su contexto («Menú principal» y «Pie»; dos `role="search"`: «Buscar en la cabecera» y «Buscar en la página»).', receta: `${REC}/estructura.md` },
  'page-has-heading-one': { texto: 'Añade un `<h1>` que describa la página.', receta: `${REC}/estructura.md` },
  'heading-order': { texto: 'No saltes niveles de encabezado (h2 → h4); usa CSS para el tamaño.', receta: `${REC}/estructura.md` },
  'empty-heading': { texto: 'Los encabezados no pueden estar vacíos.', receta: `${REC}/estructura.md` },
  'list': { texto: '`<ul>`/`<ol>` solo pueden contener `<li>` (o `<script>`/`<template>`).', receta: `${REC}/estructura.md` },
  'listitem': { texto: '`<li>` debe estar dentro de `<ul>` u `<ol>`.', receta: `${REC}/estructura.md` },
  'definition-list': { texto: '`<dl>` solo puede contener grupos `<dt>`/`<dd>`.', receta: `${REC}/estructura.md` },
  'dlitem': { texto: '`<dt>`/`<dd>` deben estar dentro de `<dl>`.', receta: `${REC}/estructura.md` },
  'duplicate-id-aria': { texto: 'Los `id` usados por ARIA o `<label for>` deben ser únicos.', receta: `${REC}/estructura.md` },
  'duplicate-id': { texto: 'Los `id` deben ser únicos.', receta: `${REC}/estructura.md` },
  'duplicate-id-active': { texto: 'Los `id` de elementos enfocables deben ser únicos.', receta: `${REC}/estructura.md` },
  'meta-viewport': { texto: 'No bloquees el zoom: quita `user-scalable=no` y `maximum-scale<2` del viewport.', receta: `${REC}/estructura.md` },
  'meta-refresh': { texto: 'No recargues ni redirijas con `<meta http-equiv="refresh">` temporizado.', receta: `${REC}/estructura.md` },
  'frame-title': { texto: 'Cada `<iframe>` necesita un `title` que diga qué contiene («Mapa de la tienda»).', receta: `${REC}/video-y-animaciones.md` },
  'frame-focusable-content': { texto: 'No pongas `tabindex="-1"` a iframes con contenido enfocable.', receta: `${REC}/video-y-animaciones.md` },
  'video-caption': { texto: 'Añade subtítulos (`<track kind="captions">`) a los vídeos con audio.', receta: `${REC}/video-y-animaciones.md` },
  'audio-caption': { texto: 'Ofrece transcripción del audio.', receta: `${REC}/video-y-animaciones.md` },
  'no-autoplay-audio': { texto: 'No reproduzcas audio automáticamente más de 3 s sin control para pararlo.', receta: `${REC}/video-y-animaciones.md` },
  'blink': { texto: 'Elimina `<blink>`.', receta: `${REC}/video-y-animaciones.md` },
  'marquee': { texto: 'Elimina `<marquee>`; si hay movimiento, ofrece pausa.', receta: `${REC}/video-y-animaciones.md` },
  'tabindex': { texto: 'No uses `tabindex` positivo; ordena el DOM.', receta: `${REC}/teclado-y-foco.md` },
  'scrollable-region-focusable': { texto: 'Las zonas con desplazamiento deben poder enfocarse (`tabindex="0"` + nombre) o contener enfocables.', receta: `${REC}/teclado-y-foco.md` },
  'nested-interactive': { texto: 'No anides controles interactivos (botón dentro de enlace, etc.).', receta: `${REC}/botones.md` },
  'aria-hidden-focus': { texto: 'Un contenedor `aria-hidden="true"` no puede tener elementos enfocables. Pasa a menudo al envolver un widget decorativo que trae un botón (por ejemplo, de pausa): saca el control del envoltorio y deja `aria-hidden` solo en lo decorativo, o usa `inert` si de verdad no debe usarse.', receta: `${REC}/modales.md` },
  'aria-hidden-body': { texto: 'No pongas `aria-hidden` en `<body>`.', receta: `${REC}/modales.md` },
  'aria-dialog-name': { texto: 'Da nombre al diálogo con `aria-labelledby` apuntando a su título.', receta: `${REC}/modales.md` },
  'aria-required-attr': { texto: 'Añade los atributos obligatorios del rol (p. ej. `aria-checked` en `role="checkbox"`).', receta: 'references/patrones-aria.md' },
  'aria-required-children': { texto: 'El rol exige hijos concretos (p. ej. `tablist` → `tab`).', receta: 'references/patrones-aria.md' },
  'aria-required-parent': { texto: 'El rol exige un padre concreto (p. ej. `tab` dentro de `tablist`).', receta: 'references/patrones-aria.md' },
  'aria-allowed-attr': { texto: 'Quita atributos ARIA que no admite ese rol.', receta: 'references/patrones-aria.md' },
  'aria-allowed-role': { texto: 'Ese rol no es válido sobre ese elemento; usa el elemento HTML nativo.', receta: 'references/patrones-aria.md' },
  'aria-valid-attr': { texto: 'Corrige el nombre del atributo ARIA (errata).', receta: 'references/patrones-aria.md' },
  'aria-valid-attr-value': { texto: 'Corrige el valor del atributo ARIA (id inexistente, valor no permitido).', receta: 'references/patrones-aria.md' },
  'aria-roles': { texto: 'Usa un rol ARIA válido.', receta: 'references/patrones-aria.md' },
  'aria-command-name': { texto: 'Los elementos con rol de botón, enlace o menuitem necesitan nombre accesible.', receta: `${REC}/botones.md` },
  'aria-input-field-name': { texto: 'Los campos ARIA (combobox, searchbox…) necesitan nombre accesible.', receta: `${REC}/formularios.md` },
  'aria-toggle-field-name': { texto: 'Los interruptores ARIA (checkbox, switch…) necesitan nombre accesible.', receta: `${REC}/formularios.md` },
  'aria-progressbar-name': { texto: 'Las barras de progreso necesitan nombre accesible.', receta: 'references/patrones-aria.md' },
  'aria-tooltip-name': { texto: 'Los tooltips necesitan texto.', receta: 'references/patrones-aria.md' },
  'aria-prohibited-attr': { texto: '`aria-label` no está permitido en ese elemento (p. ej. `<div>` sin rol); usa texto visible o un rol.', receta: 'references/patrones-aria.md' },
  'presentation-role-conflict': { texto: 'Un elemento con `role="none|presentation"` no puede ser enfocable ni tener ARIA global.', receta: 'references/patrones-aria.md' },
  'td-headers-attr': { texto: 'El atributo `headers` debe apuntar a celdas de la misma tabla.', receta: `${REC}/tablas.md` },
  'th-has-data-cells': { texto: 'Cada `<th>` debe encabezar alguna celda de datos.', receta: `${REC}/tablas.md` },
  'td-has-header': { texto: 'Las celdas de tablas grandes necesitan encabezados `<th scope>`.', receta: `${REC}/tablas.md` },
  'scope-attr-valid': { texto: 'Usa `scope="col"` o `scope="row"` solo en `<th>`.', receta: `${REC}/tablas.md` },
  'empty-table-header': { texto: 'Los `<th>` no pueden estar vacíos.', receta: `${REC}/tablas.md` },
  'table-duplicate-name': { texto: 'No repitas en `summary` el texto del `<caption>`.', receta: `${REC}/tablas.md` },
  'target-size': { texto: 'Haz los objetivos táctiles de al menos 24×24 px o sepáralos lo suficiente.', receta: `${REC}/botones.md` },
  'css-orientation-lock': { texto: 'No bloquees la orientación (vertical/horizontal) con CSS.', receta: `${REC}/estructura.md` },
  'identical-links-same-purpose': { texto: 'Enlaces con el mismo nombre deben llevar al mismo sitio (o diferenciar el nombre).', receta: `${REC}/enlaces.md` },
  'accesskeys': { texto: 'Los valores de `accesskey` deben ser únicos.', receta: `${REC}/teclado-y-foco.md` },
  'focus-order-semantics': { texto: 'Los elementos enfocables necesitan un rol interactivo.', receta: `${REC}/teclado-y-foco.md` },
  'p-as-heading': { texto: 'No uses párrafos en negrita como encabezados; usa `<h2>`…', receta: `${REC}/estructura.md` },
  'summary-name': { texto: 'El `<summary>` necesita texto.', receta: `${REC}/botones.md` },
  'server-side-image-map': { texto: 'Sustituye los mapas de imagen del lado servidor por enlaces.', receta: `${REC}/imagenes.md` },
  'aria-braille-equivalent': { texto: 'Si usas `aria-braillelabel` o `aria-brailleroledescription`, añade también su equivalente sin braille.', receta: 'references/patrones-aria.md' },
  'aria-conditional-attr': { texto: 'Quita los atributos ARIA que no se permiten en este estado del rol (p. ej. `aria-checked` en un checkbox nativo).', receta: 'references/patrones-aria.md' },
  'aria-deprecated-role': { texto: 'Sustituye el rol obsoleto por uno vigente.', receta: 'references/patrones-aria.md' },
  'aria-meter-name': { texto: 'Los elementos `meter` necesitan nombre accesible.', receta: 'references/patrones-aria.md' },
  'aria-roledescription': { texto: 'Usa `aria-roledescription` solo en elementos con un rol que lo admita.', receta: 'references/patrones-aria.md' },
  'aria-tab-name': { texto: 'Cada `tab` necesita nombre accesible.', receta: 'references/patrones-aria.md' },
  'aria-text': { texto: 'No uses `role="text"` en elementos con descendientes enfocables.', receta: 'references/patrones-aria.md' },
  'aria-treeitem-name': { texto: 'Cada `treeitem` necesita nombre accesible.', receta: 'references/patrones-aria.md' },
  'avoid-inline-spacing': { texto: 'No fijes el espaciado de texto con `!important` en línea: impide que el usuario lo ajuste.', receta: `${REC}/estructura.md` },
  'frame-tested': { texto: 'El iframe no se pudo analizar: audita su contenido por separado.', receta: `${REC}/video-y-animaciones.md` },
  'frame-title-unique': { texto: 'Cada iframe necesita un `title` distinto.', receta: `${REC}/video-y-animaciones.md` },
  'hidden-content': { texto: 'axe no pudo analizar contenido oculto: revísalo con ese contenido visible (`--estados`).', receta: `${REC}/estructura.md` },
  'landmark-banner-is-top-level': { texto: 'La región `banner` no debe ir dentro de otra región.', receta: `${REC}/estructura.md` },
  'landmark-complementary-is-top-level': { texto: 'La región `complementary` (`<aside>`) debe estar en el nivel superior.', receta: `${REC}/estructura.md` },
  'landmark-contentinfo-is-top-level': { texto: 'La región `contentinfo` no debe ir dentro de otra región.', receta: `${REC}/estructura.md` },
  'landmark-main-is-top-level': { texto: '`<main>` no debe ir dentro de otra región.', receta: `${REC}/estructura.md` },
  'landmark-no-duplicate-banner': { texto: 'Solo debe haber un `banner`.', receta: `${REC}/estructura.md` },
  'landmark-no-duplicate-contentinfo': { texto: 'Solo debe haber un `contentinfo`.', receta: `${REC}/estructura.md` },
  'landmark-no-duplicate-main': { texto: 'Solo debe haber un `<main>`.', receta: `${REC}/estructura.md` },
  'meta-viewport-large': { texto: 'Permite un zoom amplio: quita `maximum-scale` y `user-scalable=no` del viewport.', receta: `${REC}/estructura.md` },
  'table-fake-caption': { texto: 'Usa `<caption>` en lugar de una celda que simula el título de la tabla.', receta: `${REC}/tablas.md` },
  // Comprobaciones propias de auditar.mjs
  'reflow-320': { texto: 'A 320 px de ancho aparece scroll horizontal: usa unidades relativas, `flex-wrap`, `max-width:100%` y evita anchos fijos. Si lo causa un texto oculto visualmente (`sr-only`) dentro de un contenedor con `overflow-x`, pon `position: relative` en ese contenedor.', receta: `${REC}/estructura.md` },
  'foco-no-visible': { texto: 'El elemento recibe foco sin indicador visible: añade estilos `:focus-visible` (contorno ≥ 2 px con contraste 3:1).', receta: `${REC}/teclado-y-foco.md` },
  'foco-oculto': { texto: 'El elemento enfocado queda oculto o fuera de la pantalla (cabecera fija, tamaño cero): usa `scroll-padding-top` o retira del orden de tabulación lo que no se ve.', receta: `${REC}/teclado-y-foco.md` },
  'trampa-foco': { texto: 'El foco queda atrapado en el mismo elemento: revisa los manejadores de teclado.', receta: `${REC}/teclado-y-foco.md` },
  'sin-enlace-saltar': { texto: 'El primer elemento enfocable no es un enlace «Saltar al contenido».', receta: `${REC}/estructura.md` },
  'tabindex-positivo': { texto: 'Cambia el `tabindex` positivo por `0` y ordena el DOM.', receta: `${REC}/teclado-y-foco.md` },
  'orden-foco-sospechoso': { texto: 'Comprueba con el teclado que el orden sigue el de lectura; si no, reordena el DOM.', receta: `${REC}/teclado-y-foco.md` },
  'movimiento-sin-pausa': { texto: 'Añade un botón visible de pausa cerca del contenido que se mueve o haz que no arranque solo.', receta: `${REC}/video-y-animaciones.md` },
  'movimiento-reducido-ignorado': { texto: 'Detén animaciones y vídeos automáticos con `@media (prefers-reduced-motion: reduce)`.', receta: `${REC}/video-y-animaciones.md` },
  'modal-sin-foco': { texto: 'Mueve el foco dentro del diálogo al abrirlo (`<dialog>` con `showModal()` lo hace solo).', receta: `${REC}/modales.md` },
  'modal-foco-escapa': { texto: 'Retén el foco dentro del diálogo: `showModal()` o `inert` en el resto de la página.', receta: `${REC}/modales.md` },
  'modal-esc': { texto: 'Haz que Esc cierre el diálogo.', receta: `${REC}/modales.md` },
  'modal-foco-no-vuelve': { texto: 'Al cerrar, devuelve el foco al control que abrió el diálogo.', receta: `${REC}/modales.md` },
  'desplegable-sin-estado': { texto: 'Actualiza `aria-expanded` al abrir y cerrar el desplegable.', receta: `${REC}/menus.md` },
  'espaciado-recorta': { texto: 'Quita alturas fijas y `overflow:hidden` del contenedor de texto; usa `min-height`.', receta: `${REC}/estructura.md` },
  'zoom-200-desborde': { texto: 'Al 200 % aparece scroll horizontal: usa anchos relativos y `flex-wrap`.', receta: `${REC}/estructura.md` },
  'zoom-200-cabecera': { texto: 'Reduce los elementos fijos a poca altura de ventana (`@media (max-height: …)`, sin `position: sticky`).', receta: `${REC}/estructura.md` },
  'objetivo-pequeno': { texto: 'Dale al objetivo al menos 24×24 px (`min-width`/`min-height` o `padding`) o separa los objetivos vecinos; un enlace dentro de una frase está exento.', receta: `${REC}/botones.md` },
  'imagen-transparente-oscuro': { texto: 'Dale al contenedor de la imagen un fondo claro fijo en modo oscuro y comprueba que ninguna regla más específica lo pisa ni aplica `mix-blend-mode: multiply`.', receta: `${REC}/contraste.md` },
  'texto-sobre-media': { texto: 'Pon un fondo o velo opaco bajo el texto, o cambia su color, para llegar al contraste mínimo en todo el fondo.', receta: `${REC}/contraste.md` },
};

/**
 * Quién puede resolver cada regla.
 * - automatico: `arreglar.mjs` tiene un arreglo seguro, revisable en un diff.
 * - humano: hace falta contenido o una decisión que el código no contiene.
 * - asistido (por defecto): lo puede hacer un agente o desarrollador con la receta.
 */
export const ARREGLO_AUTOMATICO = {
  'html-has-lang': 'lang-html',
  'html-lang-valid': 'lang-formato',
  'meta-viewport': 'viewport-zoom',
  'meta-viewport-large': 'viewport-zoom',
  tabindex: 'tabindex-positivo',
  'tabindex-positivo': 'tabindex-positivo',
  marquee: 'marquee-blink',
  blink: 'marquee-blink',
  'foco-no-visible': 'outline-none',
  'movimiento-reducido-ignorado': 'css-movimiento',
};

export const CRITERIO_HUMANO = {
  'image-alt': 'El texto alternativo depende de qué comunica la imagen en esa página. Un agente puede proponerlo viendo la imagen, pero alguien debe validarlo; nunca lo generes por el nombre del fichero.',
  'input-image-alt': 'El texto debe decir la acción del botón.',
  'role-img-alt': 'El nombre depende de lo que representa el gráfico.',
  'svg-img-alt': 'Decide si el SVG informa (necesita nombre) o decora (`aria-hidden="true"`).',
  'object-alt': 'La alternativa depende del contenido incrustado.',
  'area-alt': 'El texto depende de a dónde lleva cada zona.',
  'link-name': 'El nombre debe decir a dónde lleva el enlace.',
  'button-name': 'El nombre debe decir qué hace el botón: compruébalo en la interfaz.',
  label: 'La etiqueta debe decir qué dato se pide y ser visible, lo que puede cambiar el diseño del formulario.',
  'select-name': 'La etiqueta debe decir qué se elige.',
  'document-title': 'El título debe describir cada página y distinguirla de las demás.',
  'page-has-heading-one': 'El título principal es una decisión de contenido.',
  'empty-heading': 'Decide si el encabezado sobra o le falta texto.',
  'heading-order': 'La jerarquía de encabezados refleja la estructura del contenido.',
  'color-contrast': 'Cambiar colores toca la marca: propón el token mínimo que llega a 4,5:1 y que alguien lo apruebe.',
  'imagen-transparente-oscuro': 'Fondo y modo de mezcla del contenedor en modo oscuro: es una decisión de diseño; confirma a ojo con las imágenes reales.',
  'texto-sobre-media': 'Velo, cambio de color o de imagen: es una decisión de diseño. Compruébalo con todas las imágenes y fotogramas que pueda haber.',
  'link-in-text-block': 'Subrayar enlaces cambia el aspecto del texto corrido.',
  'frame-title': 'El título debe decir qué contiene el iframe.',
  'video-caption': 'Los subtítulos los debe escribir o revisar una persona; la transcripción automática sola no basta.',
  'audio-caption': 'La transcripción la debe escribir o revisar una persona.',
  'no-autoplay-audio': 'Quitar el sonido automático puede tocar una decisión de producto.',
  'movimiento-sin-pausa': 'Si el movimiento es esencial no hace falta pausa; si no, decide entre pausa, parar a los 5 s o quitarlo.',
  'orden-foco-sospechoso': 'Solo una persona puede decir si el orden tiene sentido.',
  'identical-links-same-purpose': 'Decide si los dos destinos deben ser el mismo o tener nombres distintos.',
  'label-content-name-mismatch': 'El nombre accesible debe contener el texto visible; decide cuál de los dos cambia.',
};

/** Tipo de arreglo de una regla: automatico, humano o asistido. */
export function tipoArreglo(regla) {
  if (ARREGLO_AUTOMATICO[regla]) return 'automatico';
  if (CRITERIO_HUMANO[regla]) return 'humano';
  return 'asistido';
}

/** Criterios de comprobaciones propias (no vienen de axe). */
export const CRITERIOS_PROPIOS = {
  'reflow-320': ['1.4.10'],
  'foco-no-visible': ['2.4.7'],
  'foco-oculto': ['2.4.11'],
  'trampa-foco': ['2.1.2'],
  'sin-enlace-saltar': ['2.4.1'],
  'tabindex-positivo': ['2.4.3'],
  'orden-foco-sospechoso': ['2.4.3'],
  'movimiento-sin-pausa': ['2.2.2'],
  'movimiento-reducido-ignorado': [], // 2.3.3 es AAA: buena práctica, no requisito AA
  'modal-sin-foco': ['2.4.3'],
  'modal-foco-escapa': ['2.4.3'],
  'modal-esc': [], // patrón de la WAI-ARIA APG, no requisito AA en sí
  'modal-foco-no-vuelve': ['2.4.3'],
  'desplegable-sin-estado': ['4.1.2'],
  'espaciado-recorta': ['1.4.12'],
  'zoom-200-desborde': ['1.4.4'],
  'zoom-200-cabecera': ['1.4.10'],
  'texto-sobre-media': ['1.4.3'],
  'objetivo-pequeno': ['2.5.8'],
  'imagen-transparente-oscuro': ['1.4.11'],
};
