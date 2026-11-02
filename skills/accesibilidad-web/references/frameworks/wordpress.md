# WordPress y WooCommerce

**No edites el tema padre ni plugins ajenos:** se pierde en la siguiente actualización. Usa un tema hijo, o un plugin propio pequeño en `wp-content/mu-plugins/`. `arreglar.mjs` tampoco debería apuntar a `wp-content/plugins/`: pásale solo tu tema (`--proyecto wp-content/themes/mi-tema-hijo`).

## Dónde está cada cosa

| Fallo | Dónde |
|---|---|
| `lang` | `language_attributes()` en `header.php`, e idioma del sitio en Ajustes › Generales |
| Título | `add_theme_support('title-tag')`; o el plugin de SEO que uses |
| Enlace de salto | Tras `wp_body_open()` en `header.php`; muchos temas ya lo traen |
| Regiones | `header.php`, `footer.php`, plantillas del tema |
| Colores y foco | `theme.json` y el editor del sitio (temas de bloques), o `style.css` del tema hijo |
| Textos alternativos | Biblioteca de medios: es contenido; lo debe escribir una persona |
| Formularios | Ajustes del plugin de formularios; si no es accesible, valora cambiarlo |

```php
// functions.php del tema hijo: enlace de salto si el tema no lo trae
add_action('wp_body_open', function () {
    echo '<a class="saltar" href="#principal">' . esc_html__('Saltar al contenido', 'mi-tema') . '</a>';
});
```

```php
// Imagen: wp_get_attachment_image usa el texto alternativo de la biblioteca
echo wp_get_attachment_image($id, 'large');
```

## Temas de bloques

En `theme.json`, ajusta la paleta para que los pares de color lleguen al contraste y añade `:focus-visible` a tu hoja. Revisa los bloques *Navegación* y *Grupo* con un lector: la marcación del encabezado la decide quien edita.

## WooCommerce

Revisa tres puntos: los botones «Añadir al carrito» de los listados (nombre con el producto), los avisos que aparecen sin recargar (deben anunciarse; `wc_add_notice` va a una región con `role="alert"` en los temas correctos) y el proceso de pago, también con la pasarela elegida. Si una pasarela o app no es accesible, va a la declaración, y a la conversación con su proveedor.

## Plugins

Sirven los comprobadores para quien edita, como *Accessibility Checker* o *Editoria11y*. **Evita los plugins tipo overlay** que prometen arreglar la web con un botón: ver [anti-patrones](../anti-patrones.md#overlays). El [panel de preferencias](../../panel/README.md) de esta skill es otra cosa: no arregla nada ni lo promete.

## Comprobar

Audita en una copia de pruebas con el mismo tema y plugins, sin sesión iniciada (la barra de administración cambia la página), y con el banner de cookies cerrado: `--clic "#aceptar-cookies"`.
