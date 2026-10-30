# Menús de navegación

**Criterios**: 2.1.1 Teclado, 2.4.1 Evitar bloques, 2.4.3 Orden del foco, 2.4.5 Múltiples vías, 3.2.3 Navegación coherente, 4.1.2 Nombre, función, valor, 1.4.13 Contenido con hover o foco, 1.4.10 Reajuste.

## Principios

- Navegación del sitio = `<nav>` + lista de enlaces. **No** `role="menu"`/`menuitem` (ver [anti-patrones](../anti-patrones.md)).
- Submenús y menú móvil = **disclosure**: un `<button>` con `aria-expanded` que muestra u oculta la lista.
- Si hay varias navegaciones, dales nombre: `aria-label="Principal"`, `"Pie"`, `"Migas de pan"`.
- Mismo orden en todas las páginas (3.2.3); además del menú, un buscador o mapa del sitio (2.4.5).

## Menú principal con submenú

```html
<nav aria-label="Principal">
  <ul class="menu">
    <li><a href="/">Inicio</a></li>
    <li class="con-submenu">
      <button type="button" aria-expanded="false" aria-controls="sub-categorias">Categorías</button>
      <ul id="sub-categorias" hidden>
        <li><a href="/hogar">Hogar</a></li>
        <li><a href="/moda">Moda</a></li>
      </ul>
    </li>
    <li><a href="/ofertas" aria-current="page">Ofertas</a></li>
  </ul>
</nav>
```

```js
document.querySelectorAll('nav .con-submenu > button').forEach((btn) => {
  const sub = document.getElementById(btn.getAttribute('aria-controls'));
  const cerrar = () => { btn.setAttribute('aria-expanded', 'false'); sub.hidden = true; };
  btn.addEventListener('click', () => {
    const abierto = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!abierto));
    sub.hidden = abierto;
  });
  // Esc cierra y devuelve el foco al botón
  btn.parentElement.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sub.hidden) { cerrar(); btn.focus(); }
  });
  // Cerrar al salir del submenú con el teclado
  btn.parentElement.addEventListener('focusout', (e) => {
    if (!btn.parentElement.contains(e.relatedTarget)) cerrar();
  });
});
```

Si el submenú también se abre con **hover**, debe abrirse igualmente con el botón (teclado y táctil) y cumplir 1.4.13: no cerrarse al mover el ratón hacia él (usa un pequeño retardo) y cerrarse con `Esc`.

Si la categoría padre tiene su propia página, no la conviertas en botón: deja el enlace y añade un botón aparte para desplegar («Mostrar subcategorías de Hogar»), o incluye un enlace «Todo Hogar» dentro del submenú.

## Menú móvil (hamburguesa)

```html
<header>
  <a href="/" class="logo"><img src="/logo.svg" alt="Mi Tienda, inicio"></a>
  <button type="button" class="btn-menu" aria-expanded="false" aria-controls="menu-movil">
    <svg aria-hidden="true" focusable="false">…</svg>
    <span class="visualmente-oculto">Menú</span>
  </button>
  <nav id="menu-movil" aria-label="Principal" hidden>…</nav>
</header>
```

- El botón tiene nombre («Menú») y `aria-expanded`.
- Cuando el menú está cerrado, sus enlaces **no** deben ser enfocables (`hidden`, `display:none` o `inert`; no basta con `transform` o `opacity`).
- Si el menú abierto cubre toda la pantalla, trátalo como un diálogo modal (foco dentro, `Esc` cierra, foco vuelve al botón): ver [modales.md](modales.md).
- El botón debe medir al menos 24×24 px (mejor 44×44).

## Notas por stack

- **WordPress**: `wp_nav_menu()` genera la lista; en temas clásicos el botón de submenú lo añade JS del tema (revísalo). Temas por defecto como Twenty Twenty-One implementan bien el patrón y sirven de referencia. En temas de bloques, el bloque «Navegación» gestiona `aria-expanded`; revisa la opción «Abrir al hacer clic» (mejor que solo hover).
- **Shopify**: Dawn y derivados usan `<details>/<summary>` para submenús y el cajón móvil; si personalizas, mantén ese patrón.
- **React/Vue**: refleja el estado en `aria-expanded` desde el mismo estado que controla la visibilidad; cierra el menú y mueve el foco al cambiar de ruta.

## Verificar

1. Con teclado: abre y cierra submenús con `Intro`/`Espacio`, `Esc` cierra, no se enfocan enlaces ocultos.
2. Con lector: «Menú, botón, contraído» → «expandido».
3. A 320 px el menú cabe y se desplaza.
