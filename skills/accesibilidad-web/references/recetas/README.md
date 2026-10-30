# Recetas de arreglos

Cada receta explica un tipo de componente: el problema, los criterios WCAG/EN 301 549 que afecta, el código incorrecto frente al correcto, notas por stack y cómo verificar el arreglo. El informe de `scripts/auditar.mjs` enlaza la receta adecuada para cada regla.

| Receta | Cubre |
|---|---|
| [imagenes.md](imagenes.md) | Texto alternativo, decorativas, funcionales, gráficos, imágenes de texto |
| [enlaces.md](enlaces.md) | Nombre del enlace, «leer más», enlaces en texto, enlace o botón, `aria-current` |
| [botones.md](botones.md) | Nombre, estados (`aria-pressed`, `aria-expanded`), etiqueta en el nombre, tamaño del objetivo, arrastre |
| [formularios.md](formularios.md) | Etiquetas, grupos, autocompletado, errores, mensajes de estado, tiempo, autenticación |
| [modales.md](modales.md) | `<dialog>`, foco, `inert`, `Esc`, devolver el foco, banners de cookies |
| [carruseles.md](carruseles.md) | Pausa, controles, diapositivas ocultas, movimiento reducido |
| [menus.md](menus.md) | Navegación, submenús disclosure, menú móvil |
| [tablas.md](tablas.md) | Encabezados, `caption`, ordenación, tablas en móvil |
| [iconos.md](iconos.md) | SVG decorativo e informativo, fuentes de iconos, botones de icono |
| [video-y-animaciones.md](video-y-animaciones.md) | Subtítulos, audiodescripción, transcripciones, iframes, autoplay, movimiento reducido |
| [contraste.md](contraste.md) | Ratios, tokens de color, contraste no textual, modo oscuro, uso del color |
| [estructura.md](estructura.md) | Idioma, título, regiones, encabezados, enlace de salto, zoom, reflow 320 px |
| [teclado-y-foco.md](teclado-y-foco.md) | Foco visible y no oculto, orden, `tabindex`, trampas, atajos |

Ver también: [patrones-aria.md](../patrones-aria.md), [anti-patrones.md](../anti-patrones.md), [deteccion-stack.md](../deteccion-stack.md) y [checklist-wcag22-aa.md](../checklist-wcag22-aa.md).

## Añadir o mejorar una receta

1. **Nombre del fichero**: minúsculas, sin tildes, con guiones (`acordeones.md`). Los nombres existentes son un contrato: `scripts/lib/wcag.mjs` los enlaza; si renombras uno, actualiza `ARREGLOS` allí y este índice.
2. **Fuentes**: cita el criterio WCAG y su cláusula EN 301 549; enlaza la [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) o los [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) cuando apoyes una afirmación. No inventes requisitos: si algo es buena práctica y no requisito AA, dilo.
3. **Ejemplos**: código mínimo, funcional y probado en un navegador y, si puedes, con un lector de pantalla. Textos de ejemplo en español y sin marcas reales.
4. **Neutralidad**: no recomiendes productos comerciales salvo cuando sean la referencia habitual y haya alternativa libre; nunca overlays.
5. Si la receta corresponde a una regla de axe-core o a una comprobación propia, añade la entrada en `ARREGLOS` de `scripts/lib/wcag.mjs`.

### Plantilla

````markdown
# <Componente>

**Criterios**: <x.x.x Nombre (EN 9.x.x.x)>, … Reglas axe: `<regla>`, …

## Problema

<Qué falla y a quién afecta, en dos o tres frases.>

## Incorrecto → correcto

```html
<!-- Mal -->
…
<!-- Bien -->
…
```

<Requisitos o decisiones clave en una lista breve.>

## Notas por stack

- **React / Next.js**: …
- **Vue / Nuxt**: …
- **WordPress**: …
- **Shopify**: …

## Verificar

1. `auditar.mjs` sin `<regla>`.
2. <Prueba manual con teclado o lector de pantalla.>
````
