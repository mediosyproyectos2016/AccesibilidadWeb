# Patrones ARIA correctos

## Primera regla de ARIA: usa HTML nativo

> Si puedes usar un elemento HTML nativo con la semántica y el comportamiento que necesitas, úsalo en lugar de reutilizar otro elemento y añadirle ARIA.
> — [Using ARIA, W3C](https://www.w3.org/TR/using-aria/#rule1)

- `<button>` en lugar de `<div role="button" tabindex="0">` (el nativo ya responde a Intro y Espacio).
- `<a href>` para navegar, `<button>` para acciones.
- `<dialog>`, `<details>/<summary>`, `<input type="checkbox">`, `<select>`, `<fieldset>/<legend>`, `<nav>`, `<main>`.

**ARIA no añade comportamiento**: `role="button"` no hace que el elemento se pueda enfocar ni que responda al teclado. Si usas un rol, implementas tú todo lo que el patrón exige. Un ARIA mal puesto es peor que ninguno.

Referencia principal: [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/).

---

## Diálogo modal

Usa `<dialog>` con `showModal()`: el navegador gestiona el foco inicial, vuelve inertes los elementos de detrás, cierra con `Esc` y ofrece `::backdrop`.

```html
<button type="button" id="abrir-filtros">Filtros</button>

<dialog id="filtros" aria-labelledby="filtros-titulo">
  <h2 id="filtros-titulo">Filtros</h2>
  <!-- contenido -->
  <button type="button" id="cerrar-filtros">Cerrar</button>
</dialog>

<script>
  const dlg = document.getElementById('filtros');
  const abrir = document.getElementById('abrir-filtros');
  abrir.addEventListener('click', () => dlg.showModal());
  document.getElementById('cerrar-filtros').addEventListener('click', () => dlg.close());
  // Devuelve el foco al botón que lo abrió (los navegadores actuales suelen hacerlo; asegúralo):
  dlg.addEventListener('close', () => abrir.focus());
</script>
```

- Nombre: `aria-labelledby` apuntando al título.
- No uses `dlg.show()` (no modal) para algo que bloquea la página.
- Si no puedes usar `<dialog>`, ver [APG Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): `role="dialog"`, `aria-modal="true"`, foco atrapado dentro, `inert` en el resto de la página, `Esc` cierra y el foco vuelve.

Más: [recetas/modales.md](recetas/modales.md).

## Disclosure (mostrar/ocultar)

La opción más simple es nativa:

```html
<details>
  <summary>Gastos de envío</summary>
  <p>Gratis a partir de 50 €.</p>
</details>
```

Con botón (cuando necesitas control de estilo o el contenido está en otro sitio):

```html
<button type="button" aria-expanded="false" aria-controls="envio">Gastos de envío</button>
<div id="envio" hidden>
  <p>Gratis a partir de 50 €.</p>
</div>

<script>
  document.querySelectorAll('button[aria-controls][aria-expanded]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const abierto = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!abierto));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = abierto;
    });
  });
</script>
```

El estado lo comunica `aria-expanded`; no cambies el texto del botón a «Ocultar»/«Mostrar» y además `aria-expanded` (se anuncia doble).

## Acordeón

Un acordeón es una serie de disclosures con encabezados:

```html
<h3>
  <button type="button" aria-expanded="true" aria-controls="sec-1" id="acc-1">Descripción</button>
</h3>
<div id="sec-1" role="region" aria-labelledby="acc-1">…</div>

<h3>
  <button type="button" aria-expanded="false" aria-controls="sec-2" id="acc-2">Especificaciones</button>
</h3>
<div id="sec-2" role="region" aria-labelledby="acc-2" hidden>…</div>
```

- El botón va **dentro** del encabezado (así aparece en la lista de encabezados).
- `role="region"` es opcional; evítalo si hay más de ~6 paneles (demasiadas regiones).
- Ref.: [APG Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

## Pestañas

```html
<div role="tablist" aria-label="Información del producto">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">Descripción</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Opiniones</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">…</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>…</div>
```

Teclado obligatorio: `Tab` entra en la pestaña activa y sale al panel; `←`/`→` cambian de pestaña (tabindex itinerante: la activa `tabindex="0"`, el resto `-1`); `Inicio`/`Fin` opcionales.

```js
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activar(tab) {
  tabs.forEach((t) => {
    const sel = t === tab;
    t.setAttribute('aria-selected', String(sel));
    t.tabIndex = sel ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
  });
  tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => activar(t));
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') activar(tabs[(i + 1) % tabs.length]);
    if (e.key === 'ArrowLeft') activar(tabs[(i - 1 + tabs.length) % tabs.length]);
    if (e.key === 'Home') activar(tabs[0]);
    if (e.key === 'End') activar(tabs[tabs.length - 1]);
  });
});
```

Si las «pestañas» cambian de URL, no son pestañas: son **navegación** (enlaces con `aria-current="page"`).

Ref.: [APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Menú de navegación del sitio

**No uses `role="menu"`/`menuitem` para la navegación de un sitio web.** Esos roles son para menús de aplicación (como el menú «Archivo» de un escritorio) y obligan a navegar con flechas; los usuarios de lector esperan enlaces normales.

```html
<nav aria-label="Principal">
  <ul>
    <li><a href="/" aria-current="page">Inicio</a></li>
    <li>
      <button type="button" aria-expanded="false" aria-controls="sub-ofertas">Ofertas</button>
      <ul id="sub-ofertas" hidden>
        <li><a href="/ofertas/hogar">Hogar</a></li>
        <li><a href="/ofertas/moda">Moda</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

Es un **disclosure** por submenú. `Esc` debería cerrar el submenú abierto y devolver el foco a su botón. Ref.: [APG Disclosure Navigation Menu](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/). Más: [recetas/menus.md](recetas/menus.md).

## Combobox / autocompletar

Es el patrón más difícil de hacer bien. Orden de preferencia:

1. `<select>` nativo si las opciones son pocas.
2. `<input list="…">` con `<datalist>` para sugerencias simples (verifica el soporte en lectores de pantalla de tu público).
3. Una librería probada con lectores de pantalla (p. ej. los componentes de React Aria, Headless UI, Downshift).
4. Implementación propia siguiendo **exactamente** [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/): `role="combobox"` en el `<input>`, `aria-expanded`, `aria-controls` hacia un `role="listbox"`, `aria-activedescendant` para la opción resaltada, flechas, `Intro`, `Esc`. Anuncia el número de resultados con una región viva.

<a id="region-viva"></a>

## Región viva para mensajes de estado

Para avisos que no reciben foco (4.1.3): «Añadido al carrito», «12 resultados», «Guardado».

```html
<!-- Debe existir en el DOM ANTES de escribir el mensaje -->
<div id="estado" role="status" aria-live="polite" class="visualmente-oculto"></div>

<script>
  function anunciar(texto) {
    const el = document.getElementById('estado');
    el.textContent = '';
    // pequeño retardo para que el cambio se detecte aunque el texto se repita
    setTimeout(() => { el.textContent = texto; }, 50);
  }
  anunciar('Producto añadido al carrito');
</script>
```

- `role="status"` (educado, implica `aria-live="polite"`) para informaciones; `role="alert"` (asertivo) solo para errores urgentes.
- No metas en la región viva contenido enorme ni la recrees con cada mensaje (insertar la región junto con el texto no se anuncia de forma fiable).

Clase para ocultar visualmente sin ocultar al lector:

```css
.visualmente-oculto {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

## Interruptor (switch)

Primero valora una casilla nativa (`<input type="checkbox">`) con estilo de interruptor; añade `role="switch"` solo si el significado es «encendido/apagado» con efecto inmediato:

```html
<label>
  <input type="checkbox" role="switch" checked>
  Avisarme cuando baje de precio
</label>
```

Con botón:

```html
<button type="button" role="switch" aria-checked="false">Modo oscuro</button>
```

Alterna `aria-checked` en el clic. No cambies la etiqueta («Activado»/«Desactivado») además del estado. Ref.: [APG Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

Para botones conmutadores tipo «Favorito» usa `aria-pressed`:

```html
<button type="button" aria-pressed="false">Favorito</button>
```

<a id="tooltip"></a>

## Tooltip

- Un tooltip es una **descripción** adicional, no el nombre: el control necesita su propio nombre.
- Debe aparecer al **enfocar** además de al pasar el ratón, cerrarse con `Esc`, poder sobrevolarse y no desaparecer solo (1.4.13).
- No pongas contenido interactivo (enlaces, botones) dentro de un tooltip; para eso, un disclosure o un diálogo no modal.

```html
<button type="button" aria-describedby="tip-envio">Envío exprés</button>
<div id="tip-envio" role="tooltip" hidden>Entrega en 24 h laborables</div>
```

```js
const btn = document.querySelector('[aria-describedby="tip-envio"]');
const tip = document.getElementById('tip-envio');
const mostrar = () => { tip.hidden = false; };
const ocultar = () => { tip.hidden = true; };
btn.addEventListener('focus', mostrar);
btn.addEventListener('blur', ocultar);
btn.addEventListener('mouseenter', mostrar);
btn.parentElement.addEventListener('mouseleave', ocultar); // el contenedor incluye el tooltip: se puede sobrevolar
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });
```

No uses el atributo `title` como único medio de información (no aparece con teclado ni en táctil). Ref.: [APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

## Migas de pan (breadcrumb)

```html
<nav aria-label="Migas de pan">
  <ol>
    <li><a href="/">Inicio</a></li>
    <li><a href="/hogar">Hogar</a></li>
    <li><a href="/hogar/cocina" aria-current="page">Cocina</a></li>
  </ol>
</nav>
```

Los separadores («/», «›») van por CSS (`::before`) o con `aria-hidden="true"` para que no se lean. Ref.: [APG Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

## Errores frecuentes con ARIA

| Error | Arreglo |
|---|---|
| `aria-label` en un `<div>` o `<span>` sin rol | No tiene efecto fiable: usa texto visible o un elemento con rol. |
| `aria-hidden="true"` en algo enfocable | El foco llega a un elemento «inexistente»: quita el foco (`inert`, `tabindex="-1"`) o el `aria-hidden`. |
| `role="button"` sin `tabindex="0"` ni manejo de `Intro`/`Espacio` | Usa `<button>`. |
| `aria-labelledby`/`aria-controls` apuntando a un `id` que no existe | Corrige el `id`; en componentes, genera ids únicos (`useId()`). |
| `role="presentation"` en un elemento con foco o con ARIA | Se ignora el rol; elimina el conflicto. |
| Estado solo visual (clase `.activo`) | Refleja el estado en ARIA: `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-current`, `aria-checked`. |
