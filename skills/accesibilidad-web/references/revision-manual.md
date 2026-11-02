# Revisión manual guiada

La auditoría automática no puede juzgar si un `alt` describe bien la imagen, si el orden del foco tiene sentido o si un lector de pantalla anuncia lo que debe. Esta guía cubre lo que falta. Hazla sobre una **muestra representativa**: portada, una página de cada plantilla (listado, ficha, artículo), el buscador, los formularios clave (registro, contacto, compra) y las páginas legales.

## Cómo registrar los resultados

Regístralo con `node revision.mjs`: crea `revision-manual.json` con las comprobaciones de esta guía y la declaración se genera a partir de él. Una comprobación sin autor y método no cuenta, y un agente (`--agente`) no puede aprobar lo que exige a una persona.

```bash
node revision.mjs crear --informe informe.json --salida revision-manual.json
node revision.mjs marcar revision-manual.json --id lector-pantalla --estado fallo --por "Ana" --metodo "NVDA + Firefox" --notas "El carrito no anuncia los cambios"
```

Además, prueba con personas: quien usa a diario un lector de pantalla, un magnificador o control por voz encontrará lo que esta lista no recoge. Pídele que complete las tareas principales (buscar, comprar, contactar) y escucha.

Si necesitas el detalle por página, añade esta tabla al informe final:

Para cada comprobación anota una fila. Va al informe final junto a los resultados automáticos:

| Página | Criterio | Resultado | Evidencia | Arreglo propuesto |
|---|---|---|---|---|
| /ofertas | 2.4.7 Foco visible | No cumple | Las tarjetas de producto no muestran foco (captura `foco-tarjeta.png`) | `:focus-visible` en `.tarjeta a` → [teclado-y-foco](recetas/teclado-y-foco.md) |

Resultados posibles: **Cumple**, **No cumple**, **No aplica** (p. ej. no hay vídeo) y **No comprobado**. No marques «Cumple» lo que no has probado.

Si eres un agente sin navegador ni lector de pantalla, no inventes resultados: marca **No comprobado** y deja los pasos concretos para que una persona los ejecute.

---

## 1. Teclado y foco (2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 3.2.1)

Deja el ratón. Recarga la página y recórrela entera:

| Tecla | Qué debe pasar |
|---|---|
| `Tab` / `Mayús+Tab` | Avanza / retrocede por enlaces, botones y campos en orden lógico (de arriba abajo y de izquierda a derecha, en el orden en que se lee). |
| `Intro` | Activa enlaces y botones; envía formularios. |
| `Espacio` | Activa botones, marca casillas, abre `<select>`. En una página, desplaza hacia abajo. |
| `Esc` | Cierra diálogos, menús desplegables y tooltips. |
| Flechas | Dentro de grupos de radio, pestañas, menús y sliders, mueven la selección. |

Comprueba:

1. **El primer `Tab`** lleva a un enlace «Saltar al contenido» (puede estar oculto hasta recibir foco). Al activarlo, el siguiente `Tab` empieza en el contenido principal (2.4.1).
2. **Siempre ves dónde está el foco** (2.4.7): contorno o cambio claro, también sobre fondos de color y en modo oscuro. El indicador debe contrastar al menos 3:1 con lo que lo rodea (1.4.11).
3. **El foco nunca queda tapado del todo** por la cabecera fija, el banner de cookies o el chat (2.4.11).
4. **Todo lo que se hace con ratón se puede hacer con teclado** (2.1.1): menús desplegables, filtros, carruseles, galerías, mapas, «añadir al carrito», selección de talla o color.
5. **No hay trampas** (2.1.2): de cualquier widget (vídeo incrustado, mapa, iframe de pago, diálogo) se puede salir con `Tab`, `Mayús+Tab` o `Esc`.
6. **Diálogos**: al abrirse, el foco entra en el diálogo; mientras está abierto, `Tab` no sale a la página de detrás; al cerrarse, el foco vuelve al botón que lo abrió.
7. **Recibir foco no provoca cambios** (3.2.1): no se abren ventanas ni se envían formularios por el mero hecho de tabular.
8. **No se enfocan elementos invisibles** (enlaces de un menú cerrado, diapositivas ocultas del carrusel).

La comprobación automática de `auditar.mjs` (sección «Teclado» del informe) hace una primera pasada de tabulación; esta revisión la confirma y cubre la interacción.

## 2. Lectores de pantalla (1.1.1, 1.3.1, 2.4.4, 2.4.6, 3.3.1, 4.1.2, 4.1.3)

Prueba al menos con una combinación de escritorio y una móvil. Combinaciones habituales:

| Plataforma | Lector | Navegador | Activar |
|---|---|---|---|
| Windows | NVDA (gratuito) | Firefox o Chrome | `Ctrl+Alt+N` |
| macOS | VoiceOver | Safari | `Cmd+F5` |
| iOS | VoiceOver | Safari | Ajustes › Accesibilidad › VoiceOver (o triple clic en el botón lateral si está configurado) |
| Android | TalkBack | Chrome | Ajustes › Accesibilidad › TalkBack |

Atajos mínimos:

| Acción | NVDA | VoiceOver macOS (VO = `Ctrl+Opción`) |
|---|---|---|
| Leer siguiente elemento | `↓` | `VO+→` |
| Siguiente encabezado | `H` (`1`–`6` por nivel) | `VO+Cmd+H` |
| Lista de elementos (encabezados, enlaces, regiones) | `NVDA+F7` | `VO+U` (rotor) |
| Siguiente región | `D` | rotor › Puntos de referencia |
| Siguiente campo de formulario | `F` | `VO+Cmd+J` |
| Siguiente tabla | `T` | `VO+Cmd+T` |
| Detener la voz | `Ctrl` | `Ctrl` |

En móvil (VoiceOver iOS / TalkBack): desliza a derecha/izquierda para pasar de elemento, doble toque para activar; el rotor (iOS: giro con dos dedos) o el menú de lectura (TalkBack) permite saltar por encabezados.

Qué escuchar:

1. **Título de la página** al cargar, y que sea descriptivo (2.4.2).
2. **Lista de encabezados**: un único `h1`, jerarquía sin saltos, y que leídos solos describan la página (1.3.1, 2.4.6).
3. **Regiones**: banner, navegación, principal, pie (1.3.1).
4. **Lista de enlaces**: cada enlace se entiende solo o con su contexto; nada de cinco «Ver más» indistinguibles (2.4.4).
5. **Imágenes**: el `alt` transmite lo mismo que la imagen; las decorativas no se anuncian (1.1.1).
6. **Controles**: cada botón anuncia nombre, rol y estado: «Menú, botón, contraído», «Favorito, botón conmutador, pulsado» (4.1.2).
7. **Formularios**: cada campo anuncia su etiqueta, si es obligatorio y sus instrucciones; los errores se anuncian al enviar (3.3.1, 3.3.2).
8. **Mensajes de estado**: «Añadido al carrito», «12 resultados», «Guardado» se anuncian sin mover el foco (4.1.3).
9. **Contenido dinámico**: al abrir un diálogo se anuncia su título; al filtrar, el cambio se comunica.

## 3. Contraste (1.4.3, 1.4.11, 1.4.1)

- Herramientas: el inspector de Chrome/Edge/Firefox muestra la ratio al seleccionar un texto; [Colour Contrast Analyser (TPGi)](https://www.tpgi.com/color-contrast-checker/) con cuentagotas para imágenes y degradados; [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- Revisa a mano lo que la herramienta automática no puede: **texto sobre imágenes o degradados**, texto de **estados** (hover, foco, deshabilitado no cuenta), **placeholders** que se usan como información, **bordes de campos**, **iconos sin texto** y el **indicador de foco** (1.4.11: 3:1).
- Repite en **modo oscuro** si la web lo tiene.
- Uso del color (1.4.1): imprime la página en escala de grises (o usa la emulación de visión de DevTools › Rendering › «Emulate vision deficiencies»). Los errores, enlaces en texto, precios rebajados o leyendas de gráficos deben seguir distinguiéndose.

## 4. Zoom 200 % y reflow a 320 px (1.4.4, 1.4.10)

1. **Zoom 200 %**: navegador a 1280 px de ancho, `Ctrl` `+` hasta 200 %. Nada se corta, solapa ni desaparece; todos los controles siguen disponibles (pueden reorganizarse).
2. **Reflow**: zoom al 400 % con ventana de 1280 px, o DevTools en modo dispositivo a **320 px** de ancho. No debe haber scroll horizontal para leer texto (sí se admite en tablas de datos, mapas, gráficos o editores). Comprueba que el menú, los filtros, los diálogos y el banner de cookies caben y se pueden cerrar.
3. **Solo texto**: en Firefox, Ver › Zoom › «Ampliar solo el texto» al 200 %: los contenedores de altura fija no deben cortar el texto.

`auditar.mjs` ya detecta scroll horizontal a 320 px (`reflow-320`), pero no si algo se corta o se tapa.

## 5. Espaciado del texto (1.4.12)

Aplica este marcador (bookmarklet) con los valores exactos del criterio y comprueba que no se corta ni se solapa texto (botones, pestañas, tarjetas, menús):

```text
javascript:(()=>{const s=document.createElement('style');s.textContent='*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';document.head.appendChild(s)})()
```

Guárdalo como marcador en el navegador y púlsalo en cada plantilla.

## 6. Movimiento y animaciones (2.2.2, 2.3.1, 2.5.4)

1. Todo lo que se mueve solo más de 5 s (carruseles, vídeos de fondo, marquesinas, contadores animados) tiene **botón de pausa** visible y accesible por teclado.
2. Nada destella más de 3 veces por segundo (2.3.1). En caso de duda, usa [PEAT](https://trace.umd.edu/peat/) sobre una grabación.
3. Activa **«Reducir movimiento»** en el sistema (Windows: Configuración › Accesibilidad › Efectos visuales › Efectos de animación; macOS/iOS: Accesibilidad › Movimiento › Reducir movimiento; o DevTools › Rendering › `prefers-reduced-motion: reduce`). Las animaciones grandes, el parallax y el autoplay deberían desactivarse o reducirse. No es requisito AA estricto (2.3.3 es AAA), pero es una buena práctica que ayuda a cumplir 2.2.2.
4. Funciones activadas por movimiento del dispositivo (agitar para deshacer) tienen alternativa en pantalla (2.5.4).

## 7. Formularios (1.3.5, 3.2.2, 3.3.1–3.3.4, 3.3.7, 4.1.3)

1. Envía el formulario **vacío** y luego con **datos erróneos**: los errores aparecen en texto, junto al campo, explican cómo corregir (3.3.1, 3.3.3), se anuncian con lector de pantalla y el foco va al primer error o a un resumen.
2. Los campos obligatorios se indican en texto (no solo con color o asterisco sin leyenda).
3. Los campos de datos personales (nombre, email, teléfono, dirección, código postal) proponen **autocompletado** del navegador (1.3.5).
4. Cambiar un `<select>` o una casilla no envía ni navega sin avisar (3.2.2).
5. Compras, contratos y borrados: hay paso de revisión, confirmación o posibilidad de deshacer (3.3.4).
6. En procesos de varios pasos no se pide dos veces el mismo dato (p. ej. «misma dirección de facturación» como casilla) (3.3.7).
7. Mensajes de éxito («Mensaje enviado») se anuncian (4.1.3).
8. Si hay límite de tiempo (sesión, reserva), se avisa y se puede ampliar (2.2.1).

## 8. Autenticación (3.3.8)

- El inicio de sesión permite **pegar** la contraseña y usar **gestores de contraseñas** (`autocomplete="username"` / `"current-password"`, sin bloquear `paste`).
- Si hay CAPTCHA, existe una alternativa que no exija reconocer objetos ni transcribir caracteres (p. ej. verificación por correo, enlace mágico, passkey). Los CAPTCHA de reconocimiento de objetos son una excepción admitida en el nivel AA, pero siguen siendo una barrera; ofrece alternativa siempre que puedas.

## 9. Multimedia (1.2.1–1.2.5, 1.4.2)

1. Vídeos con voz: subtítulos sincronizados, completos y correctos (no solo automáticos sin revisar).
2. Información visual no narrada (texto en pantalla, acciones relevantes): audiodescripción o transcripción descriptiva.
3. Podcasts y audios: transcripción.
4. El reproductor se maneja con teclado, sus botones tienen nombre y permite activar subtítulos.
5. Audio automático de más de 3 s: se puede parar o silenciar desde el principio de la página (1.4.2).

## 10. Contenido en hover o foco (1.4.13)

Para tooltips, megamenús y vistas previas que aparecen al pasar el ratón o al enfocar:

- **Descartable**: `Esc` lo cierra sin mover el foco ni el puntero.
- **Sobrevolable**: se puede mover el ratón hasta el contenido sin que desaparezca.
- **Persistente**: no desaparece solo hasta que se quita el hover/foco o se descarta.

## 11. Tamaño de los objetivos y punteros (2.5.1, 2.5.2, 2.5.7, 2.5.8)

1. En móvil (390 px), los botones e iconos táctiles miden al menos **24×24 px CSS** o tienen separación equivalente (2.5.8). Recomendado: 44×44 px.
2. Lo que se hace **arrastrando** (slider de precio, reordenar, mapa) tiene alternativa de clic: botones +/−, campos numéricos (2.5.7).
3. Los gestos de **pellizco o deslizamiento** tienen alternativa con botones (2.5.1).
4. Pulsar y arrastrar fuera de un botón cancela la acción (2.5.2).

## 12. Coherencia y ayuda (2.4.5, 3.2.3, 3.2.4, 3.2.6)

- El menú y el pie aparecen en el mismo orden en todas las páginas.
- Hay al menos dos vías para encontrar páginas (menú + buscador o mapa del sitio).
- Los mecanismos de ayuda (contacto, chat, FAQ) están en el mismo sitio relativo en todas las páginas.
- Los iconos y botones que hacen lo mismo se llaman igual en todas partes.

## 13. Idioma (3.1.1, 3.1.2)

Con el lector de pantalla, los fragmentos en otro idioma (catalán, euskera, gallego, inglés…) deben leerse con la pronunciación correcta: eso exige `lang` en el elemento que los contiene.

---

Cuando termines, junta esta tabla con el informe automático y redacta la declaración de accesibilidad: ver [docs/declaracion-accesibilidad-plantilla.md](../../../docs/declaracion-accesibilidad-plantilla.md).
