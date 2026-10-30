---
name: accesibilidad-web
description: Audita y adapta una web a la normativa de accesibilidad española y europea (Ley 11/2023 – Acta Europea de Accesibilidad, RD 1112/2018, EN 301 549, WCAG 2.2 AA). Úsala cuando pidan revisar o mejorar la accesibilidad de una web o un componente, preparar la declaración de accesibilidad, arreglar fallos de axe/Lighthouse/WAVE, o comprobar teclado, foco, contraste, lectores de pantalla, formularios, modales, carruseles, menús o vídeo. Sirve para HTML, React/Next, Vue/Nuxt, WordPress, Shopify y plantillas de servidor.
license: MIT
---

# Accesibilidad web (WCAG 2.2 AA · EN 301 549 · Ley 11/2023)

Objetivo: dejar la web **conforme a WCAG 2.2 nivel AA** (que cubre EN 301 549 cap. 9) y con su **declaración de accesibilidad** y **canal de quejas**, con cambios reales en el código, no con parches.

> Esta skill no sustituye una auditoría manual experta ni asesoramiento jurídico. Los widgets «overlay» **no** garantizan el cumplimiento: no los propongas como solución ([anti-patrones](references/anti-patrones.md#overlays)).

## Flujo

Sigue los pasos en orden. Lee cada referencia **solo cuando llegues a ese paso**.

### 1. Detectar el stack y el alcance
- Identifica el stack y dónde viven las plantillas y componentes compartidos → [references/deteccion-stack.md](references/deteccion-stack.md).
- Pregunta (o deduce) qué URLs son representativas: portada, listado, ficha, formulario, carrito/pago, contacto, legal. Si la web es privada (sector servicios a consumidores, art. 2.2 Ley 11/2023) o pública (RD 1112/2018), consulta [docs/normativa-es.md](../../docs/normativa-es.md) para saber qué obligaciones aplican.

### 2. Auditoría automática
Ejecuta el script (Node ≥ 20). La primera vez instala dependencias:

```bash
cd skills/accesibilidad-web/scripts   # o ${CLAUDE_PLUGIN_ROOT}/skills/accesibilidad-web/scripts
npm install && npx playwright install chromium
node auditar.mjs --salida ./informe-accesibilidad https://ejemplo.es https://ejemplo.es/contacto
# o descubrir páginas: node auditar.mjs --rastrear 15 https://ejemplo.es
# en local:           node auditar.mjs http://localhost:3000
```

Audita a 1280 y 390 px, en modo oscuro si la web lo soporta, recorre la página con Tab (foco visible, foco tapado, trampas, enlace «saltar») y comprueba el reflow a 320 px. Genera `informe.json` e `informe.md` agrupados por criterio, impacto y página. `--ayuda` lista las opciones (umbral para CI, exclusiones, etiquetas…).

Si no puedes ejecutar navegador, revisa el código fuente con la [checklist](references/checklist-wcag22-aa.md) y dilo en el informe.

### 3. Revisión manual guiada
Lo automático detecta solo una parte. Recorre [references/revision-manual.md](references/revision-manual.md): teclado, foco, lector de pantalla, contraste, zoom 200 % y reflow 320 px, espaciado de texto, movimiento, formularios, multimedia, hover/foco, tamaño de objetivo y autenticación. Lo que no puedas comprobar tú (p. ej. escuchar con NVDA), márcalo como **«No comprobado»**; no lo inventes.

### 4. Arreglar, por impacto
1. **Crítico y grave primero**, empezando por componentes compartidos (cabecera, menú, pie, tarjetas, formularios): un arreglo corrige muchas páginas.
2. Usa la receta del componente → [references/recetas/](references/recetas/README.md): imágenes, enlaces, botones, formularios, modales, carruseles, menús, tablas, iconos, vídeo y animaciones, contraste, estructura, teclado y foco.
3. **HTML nativo antes que ARIA** → [references/patrones-aria.md](references/patrones-aria.md). Evita los [anti-patrones](references/anti-patrones.md).
4. Respeta el diseño: cambia lo mínimo para cumplir (p. ej. ajustar un token de color en lugar de rediseñar). Si un arreglo cambia algo visible para el cliente (colores, textos), explícalo.
5. Vuelve a ejecutar `auditar.mjs` para confirmar y añade, si el proyecto tiene tests, una prueba que lo proteja (p. ej. axe en los tests e2e, `eslint-plugin-jsx-a11y`).

### 5. Declaración de accesibilidad y canal de quejas
Rellena [docs/declaracion-accesibilidad-plantilla.md](../../docs/declaracion-accesibilidad-plantilla.md) con el resultado real (cumple / parcialmente / no cumple, contenido no accesible y motivo, fecha, método de evaluación) y enlázala desde el pie de todas las páginas. Incluye un canal de comunicación y quejas que funcione y sea accesible. No declares «plenamente conforme» sin revisión manual completa.

### 6. Informe final
Entrega al usuario, en este orden:
1. **Resumen**: estado (conforme / parcialmente / no conforme), nº de problemas por impacto, antes y después.
2. **Cambios hechos**: fichero, qué se cambió, criterio WCAG y cláusula EN 301 549 (p. ej. «1.4.3 Contraste (mínimo) · EN 9.1.4.3»).
3. **Pendientes**: problemas no resueltos con su prioridad y por qué (necesita decisión de diseño, contenido del cliente, proveedor externo…).
4. **Revisión manual**: qué se comprobó, qué no y cómo hacerlo.
5. **Declaración**: borrador o cambios y dónde enlazarla.

Cita siempre criterios como `X.Y.Z Nombre (nivel)` y su cláusula `9.X.Y.Z` de EN 301 549; los nuevos de WCAG 2.2 (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) no están en la V3.2.1 pero sí en la V4.1.1.

## Reglas
- No añadas overlays, ni scripts de terceros que «arreglan» la accesibilidad.
- No ocultes problemas a axe (`aria-hidden` en contenido visible, `role="presentation"` en controles) para que el informe salga limpio.
- No rodees bloqueos antibot ni captchas para auditar: documenta el límite.
- No toques textos legales, precios ni contenido del cliente sin avisar; propón el cambio.
- Prefiere arreglos en la fuente (componente, plantilla, token) a parches por página.
