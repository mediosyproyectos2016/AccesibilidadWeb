# Instrucciones para GitHub Copilot

Cuando trabajes en accesibilidad web (auditar, arreglar fallos, revisar componentes, añadir el panel de preferencias, proteger la CI, preparar la declaración de accesibilidad), sigue la skill **[skills/accesibilidad-web/SKILL.md](../skills/accesibilidad-web/SKILL.md)**, fuente única de este repositorio. Normativa de referencia: WCAG 2.2 AA, EN 301 549 (cap. 9), Ley 11/2023 y RD 1112/2018 ([docs/normativa-es.md](../docs/normativa-es.md)).

Al generar código de interfaz:
- HTML nativo antes que ARIA (`<button>`, `<a href>`, `<dialog>`, `<label for>`); ver [patrones ARIA](../skills/accesibilidad-web/references/patrones-aria.md).
- Todo control con nombre accesible; imágenes con `alt` (vacío si son decorativas).
- Foco visible (`:focus-visible`), orden lógico, sin `tabindex` positivo, sin trampas de foco.
- Contraste ≥ 4,5:1 (texto) y ≥ 3:1 (texto grande y componentes); objetivos ≥ 24×24 px.
- Respeta `prefers-reduced-motion`; nada de autoplay sin pausa.
- No propongas overlays ni widgets de accesibilidad como solución ([anti-patrones](../skills/accesibilidad-web/references/anti-patrones.md)). El panel de la skill es solo una comodidad adicional.
- No prometas una web «100 % accesible», no inventes textos alternativos y no afirmes conformidad no verificada.
