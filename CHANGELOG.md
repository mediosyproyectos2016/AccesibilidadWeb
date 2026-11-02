# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones según [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

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
