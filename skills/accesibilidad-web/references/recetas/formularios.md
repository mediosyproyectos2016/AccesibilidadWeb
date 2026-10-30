# Formularios

**Criterios**: 1.3.1 Información y relaciones, 1.3.5 Identificar el propósito de la entrada, 3.3.1 Identificación de errores, 3.3.2 Etiquetas o instrucciones, 3.3.3 Sugerencias ante errores, 3.3.4 Prevención de errores, 3.3.7 Entrada redundante (2.2), 3.3.8 Autenticación accesible (2.2), 3.2.2 Al recibir entradas, 2.2.1 Tiempo ajustable, 4.1.2, 4.1.3 Mensajes de estado. EN 9.x.x.x equivalentes salvo los de WCAG 2.2. Reglas axe: `label`, `select-name`, `label-title-only`, `form-field-multiple-labels`, `autocomplete-valid`, `aria-input-field-name`, `aria-toggle-field-name`.

## Etiquetas

```html
<!-- Mal -->
<input type="text" placeholder="Nombre">
<span>Email</span> <input type="email">

<!-- Bien -->
<label for="nombre">Nombre</label>
<input id="nombre" name="nombre" type="text" autocomplete="given-name" required>

<label for="email">Correo electrónico</label>
<input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-ayuda">
<p id="email-ayuda" class="ayuda">Te enviaremos la confirmación del pedido.</p>
```

- Etiqueta **visible** y asociada (`for`/`id` o `<label>` envolviendo el campo).
- Instrucciones de formato y ayuda con `aria-describedby`.
- Obligatorios: `required` y una indicación visible en texto («obligatorio», o asterisco explicado al principio del formulario).

### Grupos

```html
<fieldset>
  <legend>Forma de envío</legend>
  <label><input type="radio" name="envio" value="estandar" checked> Estándar (3-5 días)</label>
  <label><input type="radio" name="envio" value="expres"> Exprés (24 h)</label>
</fieldset>
```

### Buscador

```html
<form role="search" action="/buscar">
  <label for="q" class="visualmente-oculto">Buscar productos</label>
  <input id="q" name="q" type="search" autocomplete="off">
  <button type="submit">Buscar</button>
</form>
```

(Ocultar visualmente la etiqueta es aceptable en un buscador con botón «Buscar» visible al lado; en el resto de campos, mejor visible.)

## Autocompletado (1.3.5)

Usa los [tokens de `autocomplete`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute) en los datos del usuario:

| Campo | `autocomplete` |
|---|---|
| Nombre / apellidos | `given-name` / `family-name` (o `name`) |
| Email | `email` |
| Teléfono | `tel` |
| Dirección | `street-address` o `address-line1`, `address-line2` |
| Código postal / ciudad / país | `postal-code` / `address-level2` / `country-name` |
| Usuario / contraseña actual / nueva | `username` / `current-password` / `new-password` |
| Código de un solo uso | `one-time-code` |

## Errores (3.3.1, 3.3.3)

```html
<label for="cp">Código postal</label>
<input id="cp" name="cp" inputmode="numeric" autocomplete="postal-code"
       aria-invalid="true" aria-describedby="cp-error">
<p id="cp-error" class="error">
  <span aria-hidden="true">⚠</span> El código postal debe tener 5 cifras, por ejemplo 28013.
</p>
```

Al enviar con errores:

1. Valida en el servidor siempre; en el cliente, si quieres, al enviar o al salir del campo (no a cada pulsación).
2. Marca cada campo con `aria-invalid="true"` y enlaza el mensaje con `aria-describedby`.
3. El mensaje dice **qué** está mal y **cómo** arreglarlo, en texto (no solo borde rojo: 1.4.1).
4. Lleva el foco al primer campo erróneo, o a un resumen de errores al principio con enlaces a cada campo:

```html
<div id="resumen-errores" role="alert" tabindex="-1">
  <h2>Hay 2 errores en el formulario</h2>
  <ul>
    <li><a href="#cp">El código postal debe tener 5 cifras</a></li>
    <li><a href="#email">Falta el correo electrónico</a></li>
  </ul>
</div>
```

Si usas validación nativa del navegador (`required`, `type="email"`), sus mensajes son accesibles pero poco controlables; para formularios importantes, `novalidate` en el `<form>` y mensajes propios como los anteriores.

## Mensajes de estado (4.1.3)

Éxito, «añadido al carrito», número de resultados: región viva ya presente en el DOM. Ver [patrones-aria.md](../patrones-aria.md#region-viva).

```html
<div role="status" class="visualmente-oculto" id="estado-carrito"></div>
```

## Cambios de contexto (3.2.2)

Un `<select>` que navega al cambiar es un problema con teclado (cada flecha dispara la navegación). Añade un botón «Aplicar», o avisa antes del campo de que el cambio es inmediato.

## Operaciones importantes (3.3.4) y datos repetidos (3.3.7)

- Compras y contratos: paso de revisión antes de confirmar, o posibilidad de corregir/cancelar.
- No pidas otra vez un dato ya dado en el mismo proceso: casilla «La dirección de facturación es la misma que la de envío», o campos ya rellenos.

## Tiempo (2.2.1)

Si la sesión o la reserva caduca, avisa con antelación y permite ampliar (al menos 20 s para reaccionar y ampliar con una acción sencilla, hasta 10 veces), salvo excepciones (subastas en tiempo real, límites de más de 20 horas).

## Autenticación (3.3.8)

```html
<label for="usuario">Correo electrónico</label>
<input id="usuario" name="usuario" type="email" autocomplete="username">
<label for="clave">Contraseña</label>
<input id="clave" name="clave" type="password" autocomplete="current-password">
<button type="button" aria-pressed="false" aria-controls="clave">Mostrar contraseña</button>
```

- No bloquees pegar (`onpaste`) ni el autocompletado.
- No pidas transcribir códigos sin permitir copiar/pegar; ofrece enlaces mágicos, passkeys o códigos por SMS con `autocomplete="one-time-code"`.
- CAPTCHA: alternativa que no exija reconocer o transcribir (ver [anti-patrones](../anti-patrones.md)).

## Notas por stack

**React**: usa `useId()` para relacionar etiqueta, ayuda y error:

```jsx
function Campo({ etiqueta, error, ayuda, ...props }) {
  const id = useId();
  const desc = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={desc} {...props} />
      {ayuda && <p id={`${id}-ayuda`}>{ayuda}</p>}
      {error && <p id={`${id}-error`} className="error">{error}</p>}
    </div>
  );
}
```

Librerías de formularios (React Hook Form, Formik): no ponen `aria-invalid`/`aria-describedby` solas; añádelos.

**WordPress**: Contact Form 7, Gravity Forms, WPForms… revisa que generen `<label>` asociadas y mensajes de error enlazados (Gravity Forms tiene ajustes de accesibilidad; en CF7 usa `[text* nombre id:nombre]` y una `<label for="nombre">`). WooCommerce: el checkout clásico usa `woocommerce_form_field()`, que genera etiquetas; revisa las personalizaciones.

**Shopify**: plantillas `customers/login.liquid`, `customers/register.liquid`, y los formularios de `sections/contact-form.liquid`; los errores salen en `form.errors` y deben enlazarse a su campo. El checkout de Shopify no se puede editar en la mayoría de planes: documéntalo como contenido del proveedor si tiene problemas.

## Verificar

1. `auditar.mjs` sin `label`, `select-name`, `autocomplete-valid`.
2. Envía vacío y con errores: mensajes en texto, enlazados y anunciados; el foco va al error.
3. El navegador propone autocompletar los datos personales.
4. Con lector: cada campo anuncia etiqueta, obligatorio, ayuda y error.
