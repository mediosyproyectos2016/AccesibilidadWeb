# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones según [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [0.3.1] - 2026-11-02

Lo aprendido al usar la skill en una web real: menos falsos positivos y tres comprobaciones nuevas.

### Cambiado
- Panel: Tab y Mayús+Tab dan la vuelta dentro del diálogo; antes, en 40 pulsaciones, 4 paradas caían en `body`.
- `@axe-core/playwright` fijado a `~4.13.0`: la 4.14 declara Node ≥ 22.12 y el proyecto admite Node ≥ 20 (la CI prueba 20, 22 y 24). `axe-core` sigue en `^4.10.3` y es el que se inyecta.
- `foco-no-visible` mira los `::before`/`::after`: un anillo que cambia al enfocar y no está recortado ya no es un fallo. Al revés, un anillo en pseudo-elemento que recorta por completo un `overflow` de un antepasado se avisa como fallo real (2.4.7).
- `trampa-foco` compara por identidad del elemento y no por selector: tarjetas iguales con enlace estirado ya no dan una repetición falsa.
- `movimiento-sin-pausa` cuenta un control de pausa en la misma `<section>` o región, aunque esté a más de 6 niveles. Sigue sin contar el que está en `aria-hidden` o en otra sección.
- `texto-sobre-media` no mide la foto en etiquetas con fondo sólido propio (esquinas de `clip-path`).
- `target-size` solo se mide dentro de un diálogo modal abierto; `zoom-200-cabecera` ignora lo tapado por un diálogo modal.
- Recetas: patrón `[data-pausable]` con `animation-play-state`, botón de pausa fuera de `aria-hidden`, dónde dejar el foco si un diálogo se abre solo, etiqueta en el nombre con texto oculto, regiones duplicadas y fondo claro fijo para imágenes con transparencia.

### Añadido
- `imagen-transparente-oscuro` (modo oscuro): fondo y `mix-blend-mode` calculados en el contenedor de cada `img` con transparencia. Sale como «revisar» salvo que se puedan leer los píxeles y el dibujo no llegue a 3:1. `--sin-imagen-oscuro` lo desactiva.
- `objetivo-pequeno`: lista de objetivos de menos de 24×24 px que no están en línea en un texto, con su medida. `--sin-objetivos` la desactiva.

## [0.3.0] - 2026-11-02

La skill responde si la normativa de accesibilidad le aplica a una web, con fuentes y sin presentar como cierto lo que no lo está.

### Añadido
- `aplicabilidad.mjs`: para cualquier web, por hechos y sin tipos de negocio. Veredicto («aplica», «no aplica», «dudoso»), certeza, base con artículo y enlace, argumentos a favor y en contra, obligaciones, plazos, sanciones, autoridad por comunidad, Ley 10/2025, RD 1112/2018 y texto para la declaración. Sin red ni dependencias. Sin datos, da cada escenario.
- `references/aplicabilidad.md`: árbol de decisión, microempresa con asociadas y vinculadas, comercio electrónico con criterios de otros Estados, «parcialmente conforme» y cómo actualizar. Cada dato dice si es norma, criterio oficial, tercero o razonamiento propio.
- `lib/normativa/`: datos con fuente y fecha. La Directiva es la base común y España el primer país completo; añadir otro país no toca el motor. El resultado avisa si los datos pasan de 180 días.
- `declaracion.mjs --aplicabilidad`: el texto cambia con el veredicto. No dice «de conformidad con» una ley que no obliga o es dudosa, añade la información del art. 13.2 si procede y avisa de lo que supone publicar «parcialmente conforme» (art. 13.7).
- Comando `/aplicabilidad-accesibilidad` en el plugin de Claude Code.

### Cambiado
- `SKILL.md` y adaptadores: paso 0 de aplicabilidad antes del flujo.
- Guía de normativa: autoridades por comunidad, RD 1112/2018 DA 1.ª (empresas privadas con fondos públicos o que gestionan servicios públicos), microempresa y fechas contrapuestas de la cita de EN 301 549 V4.1.1.

## [0.2.0] - 2026-11-02

De auditar a arreglar: la skill lleva de la auditoría a la web arreglada, en cualquier stack y con cualquier IA.

### Añadido
- `priorizar.mjs`: plan de arreglo por impacto y alcance, componentes compartidos, fichero fuente probable, receta y tipo de arreglo (automático, asistido o criterio humano). Detección de stack ejecutable.
- `arreglar.mjs`: arreglos automáticos seguros (`lang`, zoom bloqueado, `tabindex` positivo, `marquee`/`blink`, `outline: none` sin sustituto, bloques de `prefers-reduced-motion` y foco). No escribe nada sin `--aplicar`; genera un diff compatible con `git apply`.
- `comparar.mjs`: antes y después con veredicto y criterio de parada. Una página que no se audita no cuenta como arreglada.
- Línea base para CI: `--guardar-linea-base` y `--linea-base`; la CI falla solo con regresiones. Entrada `linea-base` en la acción.
- `revision.mjs`: registro de la revisión manual. Exige autor y método; un agente no puede aprobar lo que exige a una persona.
- `declaracion.mjs`: declaración en Markdown y HTML desde los resultados reales. Nunca afirma conformidad no verificada: borrador sin situación si la evaluación no está completa; la plena conformidad exige que una persona la asuma, y se rechaza si hay fallos.
- Comprobaciones nuevas en `auditar.mjs`: movimiento sin pausa (2.2.2), `prefers-reduced-motion`, diálogos (foco, retención, Esc, devolución), desplegables, orden del foco y `tabindex` positivo, zoom al 200 %, espaciado de texto (1.4.12), contraste medido de texto sobre imagen o vídeo y axe con diálogos y desplegables abiertos. Separan fallo de «revisar».
- `--sitemap`, `--max-paginas`, `--estados`, `--sesion`, `--rapido`, `--concurrencia`, `--tecla` y `--almacenamiento`.
- Un reintento ante tiempos agotados y errores de red (nunca ante un 403: un bloqueo no se rodea). Las páginas no auditadas se listan aparte en el informe.
- Sección «No comprobado» fija en `informe.md` con lo que exige a una persona.
- Panel de preferencias de accesibilidad (`panel/`): componente web sin dependencias ni red, con envoltorio de React. Se presenta como comodidad adicional, no como cumplimiento.
- Plantilla de formulario de comunicación accesible y datos de ejemplo para la declaración (`plantillas/`).
- Guías por framework (`references/frameworks/`: HTML, React/Next, Vue/Nuxt, Astro, WordPress, Shopify) y guía del bucle (`references/flujo-arreglo.md`).
- Comando `/arreglar-accesibilidad` y `/panel-accesibilidad` en el plugin de Claude Code.
- Todas las reglas de axe que se ejecutan tienen arreglo y receta (test).

### Cambiado
- `SKILL.md` y adaptadores: flujo de 10 pasos, con la honestidad sobre los límites como requisito.
- axe-core ahora ejecuta `target-size` (2.5.8), desactivada por defecto en axe.
- Instalación recomendada con `npm install --omit=dev`.

### Corregido
- Falso positivo de trampa de foco en iframes y en componentes con shadow DOM.
- Una trampa en ciclo entre varios elementos ya se detecta, antes pasaba por el final del recorrido.
- Un diálogo modal que retiene el foco a propósito, nativo o con JavaScript, ya no se marca como trampa.
- Falso positivo de foco tapado en componentes con shadow DOM.
- El reflow a 320 px ya no culpa a lo que recorta un contenedor con `overflow`, y señala el texto `sr-only` que escapa de él por no tener antepasado posicionado.
- Un botón de pausa solo cuenta si está cerca de lo que se mueve y no está dentro de `aria-hidden`.
- Una página no auditada se avisa siempre; con línea base da código 2.

## [0.1.0] - 2026-10-30

### Añadido
- Skill `accesibilidad-web` (formato Agent Skills) con flujo en 6 pasos: stack, auditoría automática, revisión manual, arreglos por impacto, declaración e informe.
- Referencias: checklist WCAG 2.2 AA con mapeo a EN 301 549, revisión manual guiada, detección de stack, patrones ARIA, anti-patrones y 13 recetas por componente.
- `auditar.mjs`: axe-core + Playwright a 1280/390 px, modo oscuro automático, recorrido de teclado (foco visible, foco tapado, trampas, enlace «saltar»), reflow a 320 px, rastreo, umbral y códigos de salida para CI, informe JSON y Markdown en español.
- Guía de normativa (Ley 11/2023, RD 1112/2018, EN 301 549 V3.2.1/V4.1.1) y plantilla de declaración de accesibilidad.
- Adaptadores: `AGENTS.md`, `GEMINI.md`, regla de Cursor, instrucciones de Copilot.
- Plugin y marketplace de Claude Code con el comando `/auditar-accesibilidad`.
- GitHub Action reutilizable (`action.yml`) y flujos de ejemplo y de tests.
