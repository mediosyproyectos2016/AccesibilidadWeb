# Checklist WCAG 2.2 AA con mapeo a EN 301 549

Lista de los 55 criterios de nivel A y AA de WCAG 2.2 (más 4.1.1, que sigue vigente en la norma europea). Es la referencia que usa el informe para citar criterios.

**Cómo leer las columnas**

- **EN 301 549**: cláusula de la versión 3.2.1 (2021) para contenido web (capítulo 9). Esa versión incorpora WCAG 2.1 AA. Los seis criterios nuevos de WCAG 2.2 no tienen cláusula en la V3.2.1: marcados con «—». La **V4.1.1** (publicada por ETSI el 2-09-2026, cita en el DOUE prevista para el 16-12-2026) pasa a WCAG 2.2 AA y los incorpora; por eso el proyecto recomienda cumplir ya WCAG 2.2 AA. Detalle y fuentes en [docs/normativa-es.md](../../../docs/normativa-es.md#52-estado-real-de-la-en-301-549-v411).
- **Auto**: qué parte cubre la auditoría automática (`scripts/auditar.mjs` con axe-core y sus comprobaciones propias).
  - **sí**: la herramienta detecta los fallos habituales; aun así, revisa a mano los casos que marque como «necesita revisión».
  - **parcial**: detecta solo algunos fallos; el criterio requiere juicio humano.
  - **no**: solo revisión manual (ver [revision-manual.md](revision-manual.md)).
- **Receta**: dónde está el arreglo con ejemplos por stack.

Un «sí» automático **no** significa que el criterio se cumpla: las herramientas automáticas detectan, según distintas estimaciones, entre un 30 % y un 50 % de los problemas.

## 1. Perceptible

| Criterio | Nombre | Nivel | EN 301 549 | Qué comprobar | Auto | Receta |
|---|---|---|---|---|---|---|
| 1.1.1 | Contenido no textual | A | 9.1.1.1 | Toda imagen, icono o control gráfico tiene alternativa textual equivalente; los decorativos se ocultan (`alt=""`, `aria-hidden`). | parcial (presencia, no calidad) | [imagenes](recetas/imagenes.md), [iconos](recetas/iconos.md) |
| 1.2.1 | Solo audio y solo vídeo (grabado) | A | 9.1.2.1 | El audio grabado tiene transcripción; el vídeo sin sonido, descripción textual o pista de audio. | no | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 1.2.2 | Subtítulos (grabado) | A | 9.1.2.2 | Los vídeos grabados con audio tienen subtítulos sincronizados y correctos. | parcial (`<track>` en `<video>`) | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 1.2.3 | Audiodescripción o medio alternativo (grabado) | A | 9.1.2.3 | La información solo visual del vídeo se describe (audiodescripción o transcripción completa). | no | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 1.2.4 | Subtítulos (en directo) | AA | 9.1.2.4 | Las emisiones en directo tienen subtítulos. | no | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 1.2.5 | Audiodescripción (grabado) | AA | 9.1.2.5 | Los vídeos grabados tienen audiodescripción si hay información visual relevante no narrada. | no | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 1.3.1 | Información y relaciones | A | 9.1.3.1 | La estructura visual (encabezados, listas, tablas, etiquetas, grupos) está en el marcado. | parcial | [estructura](recetas/estructura.md), [tablas](recetas/tablas.md), [formularios](recetas/formularios.md) |
| 1.3.2 | Secuencia significativa | A | 9.1.3.2 | El orden del DOM conserva el sentido cuando se lee linealmente (sin CSS). | no | [estructura](recetas/estructura.md) |
| 1.3.3 | Características sensoriales | A | 9.1.3.3 | Las instrucciones no dependen solo de forma, posición, tamaño o sonido («pulsa el botón verde de la derecha»). | no | [estructura](recetas/estructura.md) |
| 1.3.4 | Orientación | AA | 9.1.3.4 | El contenido funciona en vertical y en horizontal. | parcial (`css-orientation-lock`) | [estructura](recetas/estructura.md) |
| 1.3.5 | Identificar el propósito de la entrada | AA | 9.1.3.5 | Los campos de datos personales usan `autocomplete` correcto. | parcial (valor válido, no si falta) | [formularios](recetas/formularios.md) |
| 1.4.1 | Uso del color | A | 9.1.4.1 | El color no es el único medio para transmitir información (errores, enlaces en texto, gráficos). | parcial (`link-in-text-block`) | [contraste](recetas/contraste.md), [enlaces](recetas/enlaces.md) |
| 1.4.2 | Control del audio | A | 9.1.4.2 | El audio que se reproduce solo más de 3 s se puede pausar o silenciar. | parcial | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 1.4.3 | Contraste (mínimo) | AA | 9.1.4.3 | Texto 4,5:1; texto grande (≥ 24 px, o ≥ 18,66 px en negrita) 3:1. | sí (texto sobre fondo plano; imágenes de fondo y degradados, manual) | [contraste](recetas/contraste.md) |
| 1.4.4 | Cambio de tamaño del texto | AA | 9.1.4.4 | Con zoom del 200 % no se pierde contenido ni funcionalidad. | parcial (`meta-viewport`) | [estructura](recetas/estructura.md) |
| 1.4.5 | Imágenes de texto | AA | 9.1.4.5 | No se usan imágenes para mostrar texto (salvo logotipos o casos esenciales). | no | [imagenes](recetas/imagenes.md) |
| 1.4.10 | Reajuste del texto (reflow) | AA | 9.1.4.10 | A 320 px CSS de ancho (equivale a 1280 px al 400 %) no hay scroll horizontal ni pérdida de contenido. | parcial (`reflow-320` propio) | [estructura](recetas/estructura.md) |
| 1.4.11 | Contraste no textual | AA | 9.1.4.11 | Bordes de campos, iconos informativos, estados de controles e indicadores de foco: 3:1 con lo adyacente. | parcial (`imagen-transparente-oscuro`, a revisar) | [contraste](recetas/contraste.md) |
| 1.4.12 | Espaciado del texto | AA | 9.1.4.12 | Con interlineado 1,5, párrafos 2×, letras 0,12 y palabras 0,16 em no se corta ni solapa texto. | no (bookmarklet en revisión manual) | [estructura](recetas/estructura.md) |
| 1.4.13 | Contenido con hover o foco | AA | 9.1.4.13 | Tooltips y desplegables por hover/foco: se pueden descartar (Esc), se puede pasar el ratón por encima y persisten. | no | [patrones-aria](patrones-aria.md#tooltip) |

## 2. Operable

| Criterio | Nombre | Nivel | EN 301 549 | Qué comprobar | Auto | Receta |
|---|---|---|---|---|---|---|
| 2.1.1 | Teclado | A | 9.2.1.1 | Toda la funcionalidad se maneja con teclado. | parcial (`scrollable-region-focusable`, tabulación) | [teclado-y-foco](recetas/teclado-y-foco.md) |
| 2.1.2 | Sin trampas para el foco del teclado | A | 9.2.1.2 | El foco puede salir de cualquier componente con teclado. | parcial (`trampa-foco` propio) | [teclado-y-foco](recetas/teclado-y-foco.md), [modales](recetas/modales.md) |
| 2.1.4 | Atajos de teclado de un carácter | A | 9.2.1.4 | Los atajos de una sola tecla se pueden desactivar, reasignar o solo actúan con foco. | no | [teclado-y-foco](recetas/teclado-y-foco.md) |
| 2.2.1 | Tiempo ajustable | A | 9.2.2.1 | Los límites de tiempo (sesión, reservas) se pueden ampliar, ajustar o desactivar. | parcial (`meta-refresh`) | [formularios](recetas/formularios.md) |
| 2.2.2 | Poner en pausa, detener, ocultar | A | 9.2.2.2 | Lo que se mueve, parpadea o se actualiza solo más de 5 s tiene pausa. | parcial (`blink`, `marquee`) | [carruseles](recetas/carruseles.md), [video-y-animaciones](recetas/video-y-animaciones.md) |
| 2.3.1 | Umbral de tres destellos o menos | A | 9.2.3.1 | Nada destella más de 3 veces por segundo. | no | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 2.4.1 | Evitar bloques | A | 9.2.4.1 | Hay forma de saltar bloques repetidos (enlace «Saltar al contenido», regiones). | sí (`bypass`, `skip-link`, `sin-enlace-saltar` propio) | [estructura](recetas/estructura.md) |
| 2.4.2 | Titulado de páginas | A | 9.2.4.2 | Cada página tiene un `<title>` descriptivo y único. | parcial (presencia) | [estructura](recetas/estructura.md) |
| 2.4.3 | Orden del foco | A | 9.2.4.3 | El orden de tabulación es lógico; los diálogos reciben el foco. | parcial (`tabindex`, secuencia de tabulación) | [teclado-y-foco](recetas/teclado-y-foco.md) |
| 2.4.4 | Propósito de los enlaces (en contexto) | A | 9.2.4.4 | El texto del enlace (con su contexto) dice adónde lleva. | parcial (`link-name`) | [enlaces](recetas/enlaces.md) |
| 2.4.5 | Múltiples vías | AA | 9.2.4.5 | Hay más de una forma de llegar a cada página (menú, buscador, mapa del sitio). | no | [menus](recetas/menus.md) |
| 2.4.6 | Encabezados y etiquetas | AA | 9.2.4.6 | Encabezados y etiquetas describen el tema o propósito. | no | [estructura](recetas/estructura.md), [formularios](recetas/formularios.md) |
| 2.4.7 | Foco visible | AA | 9.2.4.7 | Todo elemento enfocable muestra un indicador de foco visible. | parcial (`foco-no-visible` propio) | [teclado-y-foco](recetas/teclado-y-foco.md) |
| 2.4.11 | Foco no oculto (mínimo) | AA | — (WCAG 2.2) | El elemento enfocado no queda totalmente tapado por cabeceras fijas, banners de cookies o chats. | parcial (`foco-oculto` propio) | [teclado-y-foco](recetas/teclado-y-foco.md) |
| 2.5.1 | Gestos del puntero | A | 9.2.5.1 | Lo que exige gestos multipunto o de trayectoria tiene alternativa de un solo punto (botones). | no | [carruseles](recetas/carruseles.md) |
| 2.5.2 | Cancelación del puntero | A | 9.2.5.2 | Las acciones se disparan al soltar (`click`), no al presionar (`mousedown`/`touchstart`). | no | [botones](recetas/botones.md) |
| 2.5.3 | Etiqueta en el nombre | A | 9.2.5.3 | El nombre accesible contiene el texto visible del control. | parcial (`label-content-name-mismatch`) | [botones](recetas/botones.md) |
| 2.5.4 | Activación mediante movimiento | A | 9.2.5.4 | Lo que se activa agitando o inclinando el dispositivo tiene alternativa y se puede desactivar. | no | [video-y-animaciones](recetas/video-y-animaciones.md) |
| 2.5.7 | Movimientos de arrastre | AA | — (WCAG 2.2) | Lo que se hace arrastrando (sliders, reordenar, mapas) se puede hacer con clics simples. | no | [botones](recetas/botones.md) |
| 2.5.8 | Tamaño del objetivo (mínimo) | AA | — (WCAG 2.2) | Objetivos de al menos 24×24 px CSS o con separación suficiente (excepciones: enlaces en texto, nativos sin estilo). | sí (`target-size` y lista `objetivo-pequeno`) | [botones](recetas/botones.md) |

## 3. Comprensible

| Criterio | Nombre | Nivel | EN 301 549 | Qué comprobar | Auto | Receta |
|---|---|---|---|---|---|---|
| 3.1.1 | Idioma de la página | A | 9.3.1.1 | `<html lang="es">` (o el idioma real). | sí | [estructura](recetas/estructura.md) |
| 3.1.2 | Idioma de las partes | AA | 9.3.1.2 | Los fragmentos en otro idioma llevan `lang` (p. ej. `lang="ca"`, `lang="en"`). | parcial (validez del código) | [estructura](recetas/estructura.md) |
| 3.2.1 | Al recibir el foco | A | 9.3.2.1 | Enfocar algo no cambia de contexto (no abre ventanas ni envía formularios). | no | [teclado-y-foco](recetas/teclado-y-foco.md) |
| 3.2.2 | Al recibir entradas | A | 9.3.2.2 | Cambiar un campo (p. ej. un `<select>`) no navega ni envía sin avisar. | no | [formularios](recetas/formularios.md) |
| 3.2.3 | Navegación coherente | AA | 9.3.2.3 | Los menús repetidos aparecen en el mismo orden en todas las páginas. | no | [menus](recetas/menus.md) |
| 3.2.4 | Identificación coherente | AA | 9.3.2.4 | Lo que hace lo mismo se llama igual en todo el sitio (iconos, botones). | parcial (`identical-links-same-purpose`) | [iconos](recetas/iconos.md) |
| 3.2.6 | Ayuda coherente | A | — (WCAG 2.2) | Los mecanismos de ayuda (contacto, chat, FAQ) están en el mismo orden relativo en todas las páginas. | no | [estructura](recetas/estructura.md) |
| 3.3.1 | Identificación de errores | A | 9.3.3.1 | Los errores se describen en texto e identifican el campo. | no | [formularios](recetas/formularios.md) |
| 3.3.2 | Etiquetas o instrucciones | A | 9.3.3.2 | Los campos tienen etiqueta visible e instrucciones de formato. | parcial (`label`) | [formularios](recetas/formularios.md) |
| 3.3.3 | Sugerencias ante errores | AA | 9.3.3.3 | El mensaje de error sugiere cómo corregirlo. | no | [formularios](recetas/formularios.md) |
| 3.3.4 | Prevención de errores (legales, financieros, de datos) | AA | 9.3.3.4 | Compras, contratos y borrados son reversibles, revisables o confirmables. | no | [formularios](recetas/formularios.md) |
| 3.3.7 | Entrada redundante | A | — (WCAG 2.2) | No se pide dos veces el mismo dato en un proceso (se autocompleta o se puede seleccionar). | no | [formularios](recetas/formularios.md) |
| 3.3.8 | Autenticación accesible (mínimo) | AA | — (WCAG 2.2) | Iniciar sesión no exige una prueba cognitiva (recordar, transcribir, resolver) sin alternativa; se permite pegar y gestores de contraseñas. | no | [formularios](recetas/formularios.md) |

## 4. Robusto

| Criterio | Nombre | Nivel | EN 301 549 | Qué comprobar | Auto | Receta |
|---|---|---|---|---|---|---|
| 4.1.1 | Procesamiento | A | 9.4.1.1 | Obsoleto en WCAG 2.2 (siempre se considera cumplido), pero sigue en EN 301 549 v3.2.1: evita `id` duplicados y marcado mal anidado. | parcial (`duplicate-id*`) | [estructura](recetas/estructura.md) |
| 4.1.2 | Nombre, función, valor | A | 9.4.1.2 | Los controles tienen nombre, rol y estado accesibles (`aria-expanded`, `aria-pressed`, `checked`…). | parcial (reglas `aria-*`, `button-name`, `link-name`) | [patrones-aria](patrones-aria.md), [botones](recetas/botones.md) |
| 4.1.3 | Mensajes de estado | AA | 9.4.1.3 | Avisos como «Añadido al carrito» o «3 resultados» se anuncian sin mover el foco (`role="status"`, `aria-live`). | no | [formularios](recetas/formularios.md), [patrones-aria](patrones-aria.md#region-viva) |

## Más allá del capítulo 9 de EN 301 549

EN 301 549 no se limita a WCAG. Para una web o tienda en línea suelen aplicar también:

- **Cap. 5 (requisitos genéricos)**, p. ej. funcionalidad cerrada o biometría, si el servicio la usa.
- **Cap. 6 (comunicación bidireccional por voz)**, si hay llamadas o videollamadas integradas (p. ej. atención al cliente por voz desde la web).
- **Cap. 7 (vídeo)**: subtítulos y audiodescripción en reproductores, incluido que el reproductor permita activarlos.
- **Cap. 10 y 11**: documentos no web (PDF descargables) y software, incluidas las **apps móviles** (cap. 11).
- **Cap. 12 (documentación y servicios de soporte)**: la documentación del producto o servicio debe describir sus funciones de accesibilidad, estar disponible en formatos accesibles, y los servicios de soporte (atención al cliente) deben informar sobre accesibilidad y atender por medios accesibles.

Estos requisitos influyen en la **declaración de accesibilidad** y en el canal de quejas. Ver [docs/normativa-es.md](../../../docs/normativa-es.md) y [docs/declaracion-accesibilidad-plantilla.md](../../../docs/declaracion-accesibilidad-plantilla.md).

> Este checklist es una ayuda técnica. No sustituye una auditoría manual completa ni asesoramiento jurídico sobre qué obligaciones aplican a cada organización.
