# Vídeo, audio, iframes y animaciones

**Criterios**: 1.2.1–1.2.5 Multimedia (EN 9.1.2.x), 1.4.2 Control del audio, 2.2.2 Poner en pausa, detener, ocultar, 2.3.1 Tres destellos, 2.5.4 Activación mediante movimiento, 4.1.2 (controles del reproductor y `title` de iframes). EN 301 549 cap. 7 añade requisitos al reproductor (que permita mostrar subtítulos y audiodescripción). Reglas axe: `video-caption`, `audio-caption`, `no-autoplay-audio`, `frame-title`, `frame-focusable-content`, `blink`, `marquee`.

## Vídeo

| Necesidad | Qué aportar |
|---|---|
| Vídeo con voz | **Subtítulos** sincronizados (1.2.2): diálogos + sonidos relevantes («[risas]», «[suena el timbre]»). Revisa los automáticos: no basta con generarlos. |
| Información solo visual (texto en pantalla, acciones) | **Audiodescripción** (1.2.5) o una versión con narración que la incluya. Alternativa en nivel A: transcripción descriptiva (1.2.3). |
| Vídeo sin sonido | Descripción textual o pista de audio (1.2.1). |
| Emisión en directo | Subtítulos en directo (1.2.4). |
| Vídeo puramente decorativo (fondo) | Sin información; con botón de pausa si dura más de 5 s (2.2.2). Ocúltalo al lector (`aria-hidden="true"`), pero **el botón de pausa va fuera** de lo oculto (ver más abajo). |

```html
<video controls preload="metadata" poster="demo.jpg">
  <source src="demo.mp4" type="video/mp4">
  <track kind="captions" src="demo.es.vtt" srclang="es" label="Español" default>
  <track kind="descriptions" src="demo.desc.es.vtt" srclang="es" label="Audiodescripción">
</video>
<p><a href="demo-transcripcion.html">Transcripción del vídeo</a></p>
```

- Vídeo con `autoplay` o `loop` que no sea de fondo: o lleva `controls`, o un botón de pausa propio (receta de «Vídeo de fondo con pausa»). Sin una de las dos cosas, `auditar.mjs` da `movimiento-sin-pausa`.
- `controls` nativos son accesibles por teclado en los navegadores actuales; si usas un reproductor propio, cada botón necesita nombre, foco y estado.
- La pista `kind="descriptions"` tiene soporte limitado en navegadores y lectores: la vía más robusta para audiodescripción es una **versión alternativa del vídeo** con la descripción grabada.

Formato WebVTT mínimo:

```text
WEBVTT

00:00:00.000 --> 00:00:03.500
Bienvenidos a la demostración de la cafetera X200.

00:00:03.500 --> 00:00:06.000
[Suena el molinillo]
```

## Audio y podcasts

- Transcripción completa enlazada junto al reproductor (1.2.1).
- Nada de audio automático; si lo hay y dura más de 3 s, botón para pararlo o silenciarlo al principio de la página (1.4.2).

## Iframes (YouTube, Vimeo, mapas, reseñas)

```html
<iframe src="https://www.youtube-nocookie.com/embed/ID" title="Vídeo: cómo descalcificar la cafetera X200"
        allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>
```

- `title` que describa el contenido, no «iframe» ni «YouTube video player».
- No pongas `tabindex="-1"` a un iframe con contenido interactivo.
- Activa los subtítulos del proveedor (YouTube: `cc_load_policy=1` fuerza mostrarlos; súbelos revisados).

## Animaciones y movimiento

- Todo lo que se mueve, parpadea o se desplaza solo **más de 5 s** junto a otro contenido necesita mecanismo de pausa, parada u ocultación (2.2.2): carruseles, vídeos de fondo, contadores, marquesinas, *tickers*.
- Nada que destelle más de **3 veces por segundo** (2.3.1).
- Respeta la preferencia del sistema:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```js
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
const video = document.querySelector('video.fondo');
if (reducir.matches) { video.pause(); video.removeAttribute('autoplay'); }
```

Ese bloque global es un punto de partida; las animaciones que transmiten información (p. ej. un indicador de carga) deben seguir siendo perceptibles de otra forma.

Vídeo de fondo con pausa:

```html
<div class="hero">
  <video class="fondo" autoplay muted loop playsinline aria-hidden="true" src="fondo.mp4"></video>
  <button type="button" class="pausa-fondo" aria-pressed="false">Pausar animación de fondo</button>
</div>
```

```js
const v = document.querySelector('video.fondo');
const b = document.querySelector('.pausa-fondo');
b.addEventListener('click', () => {
  const pausado = !v.paused;
  pausado ? v.pause() : v.play();
  b.setAttribute('aria-pressed', String(pausado));
});
```

**El botón de pausa va fuera del contenedor oculto.** Si envuelves la decoración en `aria-hidden="true"` y metes dentro el botón, dispara `aria-hidden-focus` (enfocable dentro de algo oculto) y, además, no sirve a quien usa lector de pantalla. Ponlo como hermano del contenedor oculto, o sácalo con un portal si el componente lo impide:

```html
<section class="hero" aria-labelledby="t-hero">
  <h2 id="t-hero">Colección de otoño</h2>
  <div class="hero__fondo" aria-hidden="true"><video autoplay muted loop playsinline src="fondo.mp4"></video></div>
  <button type="button" class="pausa-fondo" aria-pressed="false">Pausar animación de fondo</button>
</section>
```

### Animaciones CSS: el patrón `[data-pausable]`

Para animaciones de CSS (no vídeo) es lo más barato: un contenedor marcado, un botón y `animation-play-state`. No hace falta tocar cada animación.

```html
<section data-pausable aria-labelledby="t-marcas">
  <h2 id="t-marcas">Marcas</h2>
  <button type="button" data-pausar aria-pressed="false">Pausar animación</button>
  <div class="cinta" aria-hidden="true">…</div>
</section>
```

```css
[data-pausable][data-pausado] *,
[data-pausable][data-pausado] *::before,
[data-pausable][data-pausado] *::after {
  animation-play-state: paused !important;
}
```

```js
document.querySelectorAll('[data-pausable]').forEach((zona) => {
  const boton = zona.querySelector('[data-pausar]');
  boton.addEventListener('click', () => {
    const pausado = zona.toggleAttribute('data-pausado');
    boton.setAttribute('aria-pressed', String(pausado));
    boton.textContent = pausado ? 'Reanudar animación' : 'Pausar animación';
    zona.querySelectorAll('video').forEach((v) => (pausado ? v.pause() : v.play()));
  });
});
```

El botón tiene que estar en la misma `<section>` (o región) que lo que se mueve, visible y fuera de cualquier `aria-hidden`. Si el visitante pide `prefers-reduced-motion: reduce`, pon `data-pausado` desde el principio.

Animaciones con librerías (GSAP, Lottie, Three.js, scroll animado): comprueba `prefers-reduced-motion` antes de iniciarlas y ofrece pausa si son en bucle.

### Qué comprueba `auditar.mjs`

- `movimiento-sin-pausa` (2.2.2): tras observar la página más de 5 s, animaciones infinitas o largas, vídeos automáticos sin controles, `<marquee>` y carruseles que cambian solos, si no hay un control de pausa cerca: en los seis antepasados más próximos o en la misma `<section>` o región (`role="region"`). Un botón dentro de `aria-hidden` o en otra sección no cuenta. Si el elemento es pequeño, o solo se ve que algo cambia, queda como «revisar»: no sabe si es decorativo ni si es esencial.
- `movimiento-reducido-ignorado`: lo que se sigue moviendo con `prefers-reduced-motion: reduce`. 2.3.3 es de nivel AAA, así que se informa como buena práctica. Hacerle caso no sustituye a la pausa: quien no tiene activada esa preferencia también tiene derecho a parar el movimiento.

## Activación por movimiento (2.5.4)

Agitar, inclinar o girar el dispositivo para hacer algo: alternativa con un control en pantalla y opción de desactivarlo.

## Notas por stack

- **React/Next**: un componente `<VideoAccesible>` que exija `subtitulos` y `titulo` en sus props evita olvidos; para `next/dynamic` con reproductores de terceros, revisa su accesibilidad.
- **WordPress**: el bloque Vídeo permite añadir pistas de texto (subtítulos); el bloque Insertar (YouTube) genera `title` a partir del título del vídeo: compruébalo.
- **Shopify**: la sección de vídeo de Dawn y derivados admite descripción alternativa; los vídeos de producto alojados en Shopify no admiten pistas de subtítulos en todos los temas: usa YouTube/Vimeo con subtítulos o añade transcripción.

## Verificar

1. `auditar.mjs` sin `video-caption`, `frame-title`, `no-autoplay-audio`.
2. Reproduce con subtítulos activados: completos y sincronizados.
3. Con `prefers-reduced-motion: reduce` no hay animaciones grandes ni autoplay.
4. Todo lo que se mueve tiene pausa accesible con teclado.
