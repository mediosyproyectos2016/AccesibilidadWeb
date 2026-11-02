# Panel de preferencias de accesibilidad

Componente sin dependencias con el que cada visitante ajusta cómo ve la web en su navegador: tamaño del texto, contraste, espaciado, enlaces subrayados, parar animaciones y fuente sencilla.

## Lo que este panel no es

**El panel no hace conforme una web ni sustituye arreglar su código.** No corrige textos alternativos, etiquetas, teclado ni estructura. No lo presentes como solución de cumplimiento, ni pongas un sello de «web accesible» junto a él.

- El [European Disability Forum y la IAAP](https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/) (17-05-2023) lo dicen de los *overlays*: «*Overlays do not make the website accessible or compliant with European accessibility legislation*» y no son «*a substitute for fixing the website itself*».
- La [FTC de Estados Unidos](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) aprobó en abril de 2025 una orden definitiva por la que accessiBe debe pagar 1 millón de dólares por afirmar que su producto automatizado podía hacer conforme cualquier web con WCAG.
- El [Overlay Fact Sheet](https://overlayfactsheet.com/en/), con más de mil firmas de profesionales y personas con discapacidad, pide no usar estos productos como solución.

Este panel se diferencia de un *overlay* en lo que no hace: no «repara» la página con IA, no añade ARIA, no secuestra atajos de teclado, no pretende detectar a quien usa un lector de pantalla, no envía datos y no promete nada. Aun así, puede no aportar nada a quien ya tiene su sistema configurado: el valor está en arreglar la web. **Arregla primero; instálalo, si quieres, después.**

## Instalar

Copia `panel-accesibilidad.js` a tus estáticos.

**Lo recomendable, en línea en el pie o la cabecera.** Un botón flotante puede tapar contenido o el foco (2.4.11); en línea no estorba:

```html
<panel-accesibilidad modo="en-linea" declaracion="/accesibilidad"></panel-accesibilidad>
<script src="/panel-accesibilidad.js" defer></script>
```

**Lo mínimo, un botón flotante:**

```html
<script src="/panel-accesibilidad.js" data-declaracion="/accesibilidad" defer></script>
```

Para evitar el parpadeo al cargar con preferencias guardadas, pon el `<script>` en el `<head>` sin `defer`.

| Atributo | Valores | Por defecto |
|---|---|---|
| `modo` | `flotante`, `en-linea` | `flotante` |
| `posicion` | `derecha`, `izquierda` | `derecha` |
| `idioma` | `es`, `en` | el `lang` de `<html>` |
| `declaracion` | URL de tu declaración de accesibilidad | sin enlace |

En el `<script>`: `data-sin-boton` (no crea el botón; tú lo abres con `panel.abrir()`), `data-idioma`, `data-posicion` y `data-declaracion`. Otros idiomas o textos: define `window.panelAccesibilidadTextos = { titulo: '…', … }` antes de cargar el script.

```js
const panel = document.querySelector('panel-accesibilidad');
panel.abrir(); panel.cerrar(); panel.restablecer();
panel.preferencias; // { texto, contraste, espaciado, subrayado, animaciones, fuente }
document.addEventListener('panel-accesibilidad:cambio', (e) => {
  if (e.detail.animaciones) miCarrusel.pausar();
});
```

### Por plataforma

- **React / Next.js:** [`react/PanelAccesibilidad.jsx`](react/PanelAccesibilidad.jsx). En App Router, úsalo desde un componente con `'use client'`.
- **Vue / Nuxt:** declara el elemento como personalizado (`compilerOptions.isCustomElement`) e importa el script en `onMounted`.
- **Astro:** pon el elemento en el layout y carga el script con `<script src="/panel-accesibilidad.js" is:inline defer></script>`.
- **WordPress:** en un tema hijo, encola el fichero con `wp_enqueue_script` y pon el elemento en `footer.php`.
- **Shopify:** sube el fichero a `assets/` y añade en `layout/theme.liquid` `<script src="{{ 'panel-accesibilidad.js' | asset_url }}" defer></script>`.

## Límites conocidos

- **Tamaño del texto.** Escala las medidas en `rem` y `em`. Si la web usa `px`, cae a `zoom`, que amplía todo. En ambos casos, tu diseño debe aguantarlo sin perder contenido: pruébalo.
- **Parar animaciones.** Detiene las animaciones y transiciones CSS y los vídeos automáticos. **No puede parar** GIF animados, ni `canvas`, ni carruseles movidos con JavaScript: escucha el evento `panel-accesibilidad:cambio` y párelos tú. Ofrecer esto no reemplaza el control de pausa que exige 2.2.2.
- **Contraste alto.** Sustituye los colores por una paleta fija y quita las imágenes de fondo. En webs que transmiten información solo con el color de fondo, esa información se pierde. Pruébalo con tu web.
- **Fuente.** Usa fuentes del sistema; no descarga ninguna. No se afirma que mejore la lectura de todas las personas ni que trate la dislexia.
- **Sin JavaScript** no hay panel. La web debe funcionar igual sin él.
- **Datos:** solo `localStorage`, solo en este navegador, solo cuando la persona cambia algo; y se borra al restablecer. Sin cookies ni peticiones de red. Valora con tu asesor cómo encaja en tu política de privacidad.

## Probar

```bash
cd skills/accesibilidad-web/panel && python -m http.server 8000   # o npx serve
# abre http://localhost:8000/demo.html
```

Comprueba con teclado: `Tab` hasta el botón, `Intro` para abrir, `Tab` por los controles (el foco no sale del diálogo), `Esc` para cerrar (el foco vuelve al botón). Recarga: las preferencias se conservan. Pasa también un lector de pantalla: los tests automáticos no pueden sustituirlo.

`npm test` en `scripts/` audita el panel cerrado y abierto, y comprueba teclado, persistencia y ausencia de peticiones de red.
