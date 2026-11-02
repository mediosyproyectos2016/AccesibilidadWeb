---
description: Instala el panel de preferencias de accesibilidad (comodidad adicional, no cumplimiento) en este proyecto
argument-hint: "[flotante | en-linea]"
---

Usa la skill `accesibilidad-web` para instalar el panel de `${CLAUDE_PLUGIN_ROOT}/skills/accesibilidad-web/panel/`. Lee antes su `README.md`.

1. Avisa con claridad: el panel es una comodidad para quien visita la web. No la hace conforme con ninguna norma ni sustituye arreglar el código. Si la web no se ha auditado, propón empezar por `/accesibilidad-web:auditar-accesibilidad`.
2. Detecta el stack y copia `panel-accesibilidad.js` a los estáticos del proyecto, sin modificarlo. En React o Next, copia también `react/PanelAccesibilidad.jsx`.
3. Inserta el elemento en la plantilla común. Por defecto `modo="en-linea"` en el pie, porque un botón flotante puede tapar contenido; respeta $ARGUMENTS si piden otro. Añade `declaracion="<url>"` si existe la declaración.
4. Si la web tiene carruseles con JavaScript o vídeos propios, conéctalos al evento `panel-accesibilidad:cambio`: el panel no puede pararlos solo.
5. Audita la página con el panel abierto y cerrado, y pruébalo con teclado. No añadas sellos ni textos que sugieran cumplimiento.
