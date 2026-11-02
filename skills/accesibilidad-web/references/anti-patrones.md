# Anti-patrones de accesibilidad

Lo que **no** hay que hacer, por qué y qué hacer en su lugar. Si un agente de código detecta uno de estos patrones en el repositorio, debe proponer el arreglo, no perpetuarlo.

<a id="overlays"></a>

## 1. Overlays y widgets de «accesibilidad automática»

**Qué es**: un script de terceros que añade un botón flotante con opciones (agrandar texto, contraste, «perfil para ciegos»…) y promete hacer la web accesible o «conforme a la ley» automáticamente, a menudo con IA.

**Por qué no**:

- **No corrige el código de origen**: los fallos de estructura, nombres accesibles, teclado o formularios siguen ahí. La conformidad con WCAG/EN 301 549 se evalúa sobre el contenido, no sobre un widget.
- **Puede empeorar la experiencia**: hay usuarios de lectores de pantalla que reportan interferencias con su tecnología de apoyo (atajos de teclado secuestrados, ARIA añadido automáticamente de forma errónea, contenido duplicado).
- **Duplica lo que ya hacen el sistema y el navegador** (zoom, alto contraste, lectores), que las personas con discapacidad ya tienen configurados.
- El [European Disability Forum y la IAAP](https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/) lo dijeron en 2023: «*Overlays do not make the website accessible or compliant with European accessibility legislation*».
- La comunidad de profesionales de la accesibilidad lo rechaza de forma pública en el [Overlay Fact Sheet](https://overlayfactsheet.com/en/), con más de mil firmas.
- En abril de 2025, la [FTC de Estados Unidos](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) aprobó una orden definitiva por la que accessiBe debe pagar 1 millón de dólares por afirmar que su producto podía hacer conforme cualquier web con WCAG.
- Instalar un overlay **no basta** para cumplir la Ley 11/2023 ni el RD 1112/2018: la obligación es que el producto o servicio sea accesible, con su declaración y canal de quejas. Ver [docs/normativa-es.md](../../../docs/normativa-es.md).

**Qué hacer**: arreglar el código siguiendo las [recetas](recetas/README.md), y retirar el overlay si interfiere. Si el cliente quiere ofrecer ajustes de visualización, que sean funciones propias, bien implementadas y que no sustituyan a la conformidad. El [panel de esta skill](../panel/README.md) es eso: sin rastreo, sin «reparaciones» automáticas y sin promesas. Ofrécelo después de arreglar, nunca en su lugar.

## 2. `div` o `span` clicables

```html
<!-- Mal: no se enfoca, no responde a Intro/Espacio, no tiene rol -->
<div class="btn" onclick="comprar()">Comprar</div>

<!-- Bien -->
<button type="button" class="btn" onclick="comprar()">Comprar</button>
```

Igual con enlaces: `<span onclick="location.href='/ofertas'">` → `<a href="/ofertas">`. Criterios: 2.1.1, 4.1.2.

## 3. `placeholder` como etiqueta

```html
<!-- Mal: desaparece al escribir, poco contraste, no siempre se anuncia -->
<input type="email" placeholder="Correo electrónico">

<!-- Bien -->
<label for="email">Correo electrónico</label>
<input id="email" type="email" autocomplete="email" placeholder="nombre@ejemplo.es">
```

Criterios: 1.3.1, 3.3.2. Ver [recetas/formularios.md](recetas/formularios.md).

## 4. `outline: none` sin sustituto

```css
/* Mal */
*:focus { outline: none; }

/* Bien: quita el contorno solo con ratón y deja uno claro con teclado */
:focus-visible {
  outline: 3px solid var(--color-foco, #1a5fb4);
  outline-offset: 2px;
}
```

Criterio: 2.4.7. Ver [recetas/teclado-y-foco.md](recetas/teclado-y-foco.md).

## 5. `tabindex` positivo

`tabindex="1"`, `"2"`… alteran el orden de tabulación de toda la página y casi siempre lo rompen. Usa solo `0` (hacer enfocable algo que no lo es, con rol) y `-1` (enfocable por script). Ordena el DOM en lugar de forzar el orden. Criterio: 2.4.3.

## 6. Nombre accesible que contradice el texto visible

```html
<!-- Mal: el usuario de control por voz dice «Comprar» y no funciona -->
<button aria-label="Añadir producto 4312">Comprar</button>

<!-- Bien: el nombre empieza por el texto visible -->
<button aria-label="Comprar Cafetera Express X200">Comprar</button>
<!-- o, mejor, texto visible + oculto -->
<button>Comprar <span class="visualmente-oculto">Cafetera Express X200</span></button>
```

Criterio: 2.5.3. Ver [recetas/botones.md](recetas/botones.md).

## 7. `role="menu"` en la navegación del sitio

Convierte una lista de enlaces en un menú de aplicación que exige flechas y oculta los enlaces a la navegación normal del lector. Usa `<nav>` + lista + disclosure. Ver [patrones-aria.md](patrones-aria.md#menú-de-navegación-del-sitio) y [recetas/menus.md](recetas/menus.md).

## 8. `alt` inútil

| Mal | Por qué | Bien |
|---|---|---|
| `alt="imagen"`, `alt="foto"`, `alt="IMG_2034.jpg"` | No describe nada | Lo que aporta la imagen: `alt="Cafetera Express X200 en color rojo"` |
| `alt="Logo"` | No dice de quién | `alt="Mi Tienda"` (y si enlaza a inicio: `alt="Mi Tienda, inicio"`) |
| `alt` en imágenes decorativas | Ruido | `alt=""` |
| Sin atributo `alt` | El lector lee el nombre del fichero | Siempre `alt`, vacío o con texto |

Criterio: 1.1.1. Ver [recetas/imagenes.md](recetas/imagenes.md).

## 9. Reproducción automática

Vídeos con sonido, carruseles que avanzan solos o animaciones de fondo sin pausa. Criterios: 1.4.2, 2.2.2. Arreglo: sin autoplay o con botón de pausa visible; respetar `prefers-reduced-motion`. Ver [recetas/carruseles.md](recetas/carruseles.md) y [recetas/video-y-animaciones.md](recetas/video-y-animaciones.md).

## 10. Bloquear el zoom

```html
<!-- Mal -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<!-- Bien -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Criterio: 1.4.4. También evita tamaños de letra en `px` fijos que no escalan con la preferencia del usuario cuando es posible (`rem`).

## 11. CAPTCHA sin alternativa

Un CAPTCHA visual o de audio como única vía bloquea a muchas personas. Criterios: 1.1.1 (exige alternativa en otra modalidad) y 3.3.8. Arreglo: protección invisible o por comportamiento, verificación por correo, enlace mágico, passkeys; si queda un CAPTCHA, que haya alternativa.

## 12. «Leer más», «Haz clic aquí», «Ver»

Fuera de contexto (lista de enlaces del lector) no dicen nada. Criterio: 2.4.4.

```html
<!-- Bien -->
<a href="/blog/ahorro">Leer más <span class="visualmente-oculto">sobre cómo ahorrar en electrodomésticos</span></a>
```

Ver [recetas/enlaces.md](recetas/enlaces.md).

## 13. Texto en imágenes

Banners con el texto de la oferta incrustado en la imagen: no escala, no se traduce, no tiene contraste controlable y el `alt` suele faltar. Criterio: 1.4.5. Arreglo: texto HTML sobre la imagen (con contraste suficiente) o, si es inevitable, `alt` con el texto completo.

## 14. Solo color

«Los campos en rojo son obligatorios», enlaces sin subrayado dentro de un párrafo, precio rebajado solo en verde, gráficos con leyenda solo cromática. Criterio: 1.4.1. Arreglo: añadir texto, icono con texto alternativo, subrayado o patrón.

## 15. Ocultar contenido de forma incorrecta

| Técnica | Efecto | Uso correcto |
|---|---|---|
| `display:none`, `hidden` | Oculto para todos | Contenido inactivo (paneles cerrados) |
| `.visualmente-oculto` | Solo para lectores | Textos de apoyo («(abre en ventana nueva)») |
| `aria-hidden="true"` | Solo oculto al lector | Decoración e iconos duplicados; **nunca** con elementos enfocables dentro |
| `opacity:0` o fuera de pantalla sin más | Sigue siendo enfocable e invisible | Evitar: provoca foco «perdido» (2.4.7, 2.4.11) |

Dos trampas frecuentes con estas técnicas:

- **`aria-hidden` en el envoltorio de un widget decorativo que trae un control.** Si el vídeo o la animación incluyen un botón de pausa, ese botón queda oculto al lector pero sigue recibiendo foco (regla `aria-hidden-focus`). Saca el control del envoltorio: `aria-hidden` solo en lo decorativo.
- **`.visualmente-oculto` sin antepasado posicionado dentro de un contenedor con `overflow-x`.** Al ser `position: absolute`, escapa del contenedor y puede dar scroll horizontal a toda la página a 320 px (regla `reflow-320`). Pon `position: relative` en el contenedor con `overflow`.

## 16. Abrir ventanas nuevas sin avisar

`target="_blank"` sin aviso desorienta. Si es necesario, indícalo: texto o icono con alternativa «(se abre en una ventana nueva)».

## 17. Desactivar pegar o el autocompletado

`onpaste="return false"` en contraseñas o emails, o `autocomplete="off"` en datos personales. Criterios: 1.3.5, 3.3.8. Deja que el usuario pegue y use su gestor de contraseñas.

## 18. Encabezados por aspecto

`<h3>` porque «queda bonito más pequeño», o `<p class="titulo">` en negrita como título. Criterio: 1.3.1. El nivel lo marca la estructura; el tamaño, el CSS.

## 19. Arreglar con JavaScript posterior lo que está mal en el origen

Scripts que añaden `alt` o `aria-label` tras cargar la página («parche en cliente»). Son frágiles, llegan tarde a algunos lectores y se rompen con cada cambio. Arregla en la plantilla o el componente: ver [deteccion-stack.md](deteccion-stack.md).
