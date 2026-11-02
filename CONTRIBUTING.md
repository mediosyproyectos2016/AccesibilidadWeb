# Cómo contribuir

¡Gracias por ayudar a que la web sea más accesible! Este proyecto es útil en la medida en que sus recetas sean correctas y prácticas, así que toda mejora cuenta: una receta nueva, un ejemplo para otro stack, una corrección normativa, una regla automática o una errata.

Issues y PR en español o en inglés.

## Qué puedes aportar

| Quiero… | Dónde |
|---|---|
| Añadir o mejorar una receta (componente) | `skills/accesibilidad-web/references/recetas/` — plantilla en [recetas/README.md](skills/accesibilidad-web/references/recetas/README.md) |
| Añadir ejemplos para un stack (Svelte, Astro, Angular, Drupal…) | La receta del componente + `references/deteccion-stack.md` |
| Corregir un criterio o el mapeo a EN 301 549 | `references/checklist-wcag22-aa.md` y `scripts/lib/wcag.mjs` (`CRITERIOS`) |
| Sugerencia de arreglo para una regla de axe | `scripts/lib/wcag.mjs` (`ARREGLOS`) |
| Nueva comprobación automática | `scripts/lib/comprobaciones.mjs`, su entrada en `ARREGLOS` y `CRITERIOS_PROPIOS`, su título en `lib/informe.mjs` y un test con su caso en `tienda-con-fallos.html` |
| Arreglo automático | `scripts/lib/arreglos.mjs`, solo si el resultado es correcto sea cual sea el contenido, con tests que muestren qué no toca |
| Guía de otro framework | `references/frameworks/` y su entrada en `scripts/lib/stack.mjs` |
| Panel de preferencias | `panel/`, sin dependencias, red ni rastreo, y pasando su propia auditoría |
| Normativa | `docs/normativa-es.md`, siempre con fuente oficial (BOE, DOUE, ETSI, W3C) |
| Adaptador para otra IA | Fichero breve que apunte a `skills/accesibilidad-web/SKILL.md` |

## Principios

1. **Una sola fuente.** El conocimiento vive en `skills/accesibilidad-web/`. Los adaptadores (`AGENTS.md`, `GEMINI.md`, Cursor, Copilot) solo apuntan a ella.
2. **Divulgación progresiva.** `SKILL.md` es corto (flujo y reglas); el detalle va en `references/`, que el agente lee solo cuando le hace falta.
3. **HTML nativo antes que ARIA**, y código de ejemplo que funcione de verdad. Si puedes, comprueba el ejemplo con `auditar.mjs` y con teclado.
4. **Cita el criterio**: `1.4.3 Contraste (mínimo) (AA) · EN 9.1.4.3`.
5. **Prudencia normativa.** Nada de afirmar plazos, sanciones u obligaciones sin fuente oficial. Si no está verificado, se marca como tal.
6. **Sin overlays** ni soluciones que oculten problemas a las herramientas. El panel es una comodidad y se presenta como tal.
7. **Sin marcas** de terceros en los ejemplos (usa «Mi Tienda», «Tienda A»).
8. **Sin promesas.** Nada de «100 % accesible». Si una comprobación duda, va a «revisar», no a «cumple».

## Estilo

- Español claro, frases cortas, segunda persona («añade», «comprueba»). Términos en inglés solo si son el nombre técnico (`aria-label`, *focus trap*) y, la primera vez, con su traducción.
- Markdown: encabezados `##`, bloques de código con lenguaje (`html`, `jsx`, `vue`, `liquid`, `php`), tablas solo cuando comparan.
- JavaScript: Node ≥ 20, ESM (`.mjs`), sin dependencias de ejecución nuevas salvo que se justifique (hoy solo `playwright`, `axe-core` y `@axe-core/playwright`; `esbuild` y React solo para probar el envoltorio del panel). Nombres en español, como el resto del código.

## Desarrollo y tests

```bash
cd skills/accesibilidad-web/scripts
npm install
npx playwright install chromium
npm test                     # tests unitarios y de extremo a extremo con páginas locales
node auditar.mjs --ayuda
```

Los tests de extremo a extremo usan páginas con fallos conocidos (`test/fixtures/mala.html`, `tienda-con-fallos.html`) y sus versiones correctas (`buena.html`, `tienda-arreglada.html`); `sin-falsos-positivos.html` guarda casos legítimos. Si añades una comprobación, añade el caso a la página con fallos y comprueba que la arreglada sigue limpia. No pongas ficheros `.js` bajo `test/`: `node --test` los ejecutaría. El test «cada receta enlazada existe» falla si una entrada de `ARREGLOS` apunta a una receta que no existe.

## Proceso

1. Abre un issue si el cambio es grande (nueva comprobación, cambio del flujo) para hablarlo antes.
2. Rama desde `main`, commits pequeños con mensaje claro en español o inglés.
3. PR con la plantilla: qué cambia, criterio WCAG afectado, cómo lo has comprobado.
4. Añade una línea en `CHANGELOG.md` bajo «Sin publicar».

## Conducta

Este proyecto sigue el [código de conducta](CODE_OF_CONDUCT.md). Muchas personas que usan tecnologías de apoyo pueden participar: haz accesibles tus issues y PR (texto alternativo en capturas, nada de información solo por color).
