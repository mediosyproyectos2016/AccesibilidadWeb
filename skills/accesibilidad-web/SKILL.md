---
name: accesibilidad-web
description: Lleva una web de la auditoría de accesibilidad al código arreglado, conforme a la normativa española y europea (Ley 11/2023 – Acta Europea de Accesibilidad, RD 1112/2018, EN 301 549, WCAG 2.2 AA), y responde si esa normativa le aplica. Úsala cuando pregunten si una web está obligada, si es microempresa o comercio electrónico, qué autoridad le toca o cómo redactar «parcialmente conforme», y cuando pidan revisar, arreglar o mejorar la accesibilidad de una web o un componente, implementar los cambios, corregir fallos de axe/Lighthouse/WAVE, comprobar teclado, foco, contraste, lectores de pantalla, formularios, modales, carruseles, menús o vídeo, añadir un panel de preferencias de accesibilidad, proteger la accesibilidad en la CI, o preparar la declaración de accesibilidad y el canal de comunicación. Sirve para HTML, React/Next, Vue/Nuxt, Astro, WordPress, Shopify y plantillas de servidor.
license: MIT
---

# Accesibilidad web (WCAG 2.2 AA · EN 301 549 · Ley 11/2023)

Objetivo: arreglar la web de verdad, en su código, y poder decir qué se comprobó y cómo. El trabajo termina con **cero fallos detectables, la lista de comprobación manual completada con lector de pantalla y personas reales, y la declaración publicada**.

## Lo que debes decir siempre

- **Nadie puede prometer una web «100 % accesible»**. Si te lo piden, adopta el objetivo de arriba y explica por qué.
- **La auditoría automática solo detecta una parte de los fallos**: en la [prueba del GDS británico](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) (2017), la mejor de 10 herramientas halló el 41 % de las barreras y 42 de 143 no las vio ninguna; [Deque](https://www.deque.com/automated-accessibility-testing-coverage/), fabricante de axe-core, estima el 57 % por volumen de incidencias. El [W3C](https://www.w3.org/WAI/test-evaluate/tools/selecting/) lo resume así: las herramientas «*can not determine accessibility, they can only assist*». Un informe limpio no acredita nada.
- **Un panel o *overlay* no hace conforme una web ni sustituye arreglar el código**. Lo dicen el [EDF y la IAAP](https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/), y la [FTC de EE. UU.](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) sancionó con 1 millón de dólares a un proveedor por prometerlo. Ver [anti-patrones](references/anti-patrones.md#overlays).
- **Nunca redactes una declaración que afirme una conformidad no verificada.** Esto no es asesoramiento jurídico.
- **Cuando el caso legal no está zanjado, dilo.** «Dudoso», los dos argumentos y una recomendación prudente. La mejor respuesta razonada no es una certeza. No inventes autoridades, plazos ni fuentes.

## Flujo

Sigue los pasos en orden. Lee cada referencia **solo cuando llegues a ese paso**. Los scripts están en `scripts/` (Node ≥ 20); la primera vez: `cd scripts && npm install --omit=dev && npx playwright install chromium`. Si no puedes ejecutar un navegador, revisa el código con la [checklist](references/checklist-wcag22-aa.md) y dilo en tu informe.

### 0. ¿Qué norma aplica?
Sirve para cualquier web. Pregunta a la persona solo lo que no puedas deducir del sitio: qué ofrece, a quién, si se contrata en la web, quién es el titular y su tamaño. Lo que no se sepa, se omite: el resultado dará cada escenario.
```bash
node aplicabilidad.mjs --preguntas
node aplicabilidad.mjs --titular privado --destinatarios consumidores --contrato en-la-web --contraparte titular --comunidad MD --salida a11y
```
No necesita red ni `npm install`. Da veredicto («aplica», «no aplica», «dudoso»), certeza, base con artículo y enlace, argumentos, obligaciones, autoridad y qué texto usar. Di siempre la fecha de revisión que trae y distingue norma, criterio oficial, opinión de terceros y razonamiento propio. Para responder preguntas legales de accesibilidad, lee [aplicabilidad.md](references/aplicabilidad.md). Haz el resto del flujo sea cual sea el veredicto si la persona quiere una web accesible: lo que cambia es lo que se puede afirmar.

### 1. Stack y alcance
Identifica el stack y su plantilla raíz → [deteccion-stack.md](references/deteccion-stack.md) y la guía de [frameworks/](references/frameworks/): `html`, `react-next`, `vue-nuxt`, `astro`, `wordpress`, `shopify`. Elige páginas representativas: portada, listado, ficha, formulario, carrito o pago, contacto, legal. Guía completa de normativa: [docs/normativa-es.md](../../docs/normativa-es.md) (si solo tienes la skill, está en el [repositorio](https://github.com/mediosyproyectos2016/AccesibilidadWeb/blob/main/docs/normativa-es.md)).

### 2. Auditar
```bash
node auditar.mjs --salida a11y/antes https://ejemplo.es https://ejemplo.es/contacto
# varias páginas:    --sitemap https://ejemplo.es/sitemap.xml --max-paginas 20  ó  --rastrear 15 <url>
# estados:           --estados estados.json (menú abierto, error de formulario…)
# con sesión:        --sesion storageState.json · avisos: --clic "#aceptar", --tecla Escape, --almacenamiento clave=valor
# muchas páginas:    --concurrencia 4
```
Además de axe-core a 1280 y 390 px, comprueba lo que axe no cubre: recorrido de teclado, trampas y orden del foco; diálogos (foco, retención, `Esc`, devolución); desplegables; movimiento sin pausa y `prefers-reduced-motion`; reflow a 320 px; zoom al 200 %; espaciado de texto; contraste de texto sobre imagen o vídeo. Abre también diálogos y desplegables declarados para pasar axe con ellos abiertos. Nunca envía formularios. `--ayuda` lista las opciones.

### 3. Priorizar
```bash
node priorizar.mjs a11y/antes/informe.json --proyecto <carpeta del código>
```
`plan.md` ordena por impacto y alcance, marca los componentes compartidos, da la receta y el fichero fuente probable (una pista: confírmala) y separa lo **automático**, lo **asistido** y lo que exige **criterio humano**.

### 4. Arreglar en el código
Lee [flujo-arreglo.md](references/flujo-arreglo.md).
1. Automático: `node arreglar.mjs --proyecto <carpeta> --idioma es`. Genera `arreglos.diff` y no toca nada hasta que añadas `--aplicar`. Enséñale el diff a la persona.
2. Lo demás, en el orden del plan, con las [recetas](references/recetas/README.md), los [patrones ARIA](references/patrones-aria.md) (HTML nativo antes que ARIA) y evitando los [anti-patrones](references/anti-patrones.md). Por bloques, con su commit.
3. Lo que exige criterio humano (textos alternativos, colores de marca, subtítulos): propón y pregunta. No lo inventes.
4. Respeta el diseño: cambia lo mínimo. Explica lo que cambie para el cliente.

### 5. Reauditar en bucle
```bash
node auditar.mjs --salida a11y/despues <mismas urls y opciones>
node comparar.mjs a11y/antes/informe.json a11y/despues/informe.json --salida a11y/comparacion.md
```
Sigue el veredicto: `seguir`, `corregir-regresion`, `reauditar`, `escalar` (sin progreso: para y documenta cada pendiente) o `pasar-a-revision-manual`. Para el bucle cuando no queden fallos detectables o cada fallo restante tenga motivo y responsable.

### 6. Revisión manual
```bash
node revision.mjs crear --informe a11y/despues/informe.json --salida a11y/revision-manual.json
node revision.mjs marcar a11y/revision-manual.json --id teclado-recorrido --estado ok --por "Tu nombre" --metodo "Teclado, Chrome" [--agente]
node revision.mjs estado a11y/revision-manual.json
```
Guía: [revision-manual.md](references/revision-manual.md). **Si eres una IA, usa `--agente` y no marques como `ok` nada que no hayas probado.** Las comprobaciones de lector de pantalla, personas reales y juicio de contenido deben cerrarlas personas: déjaselas con los pasos concretos.

### 7. Declaración y canal de comunicación
```bash
node declaracion.mjs --informe a11y/despues/informe.json --revision a11y/revision-manual.json --datos datos.json --aplicabilidad a11y/aplicabilidad.json
```
`datos.json`: ver [plantillas/datos-declaracion.json](plantillas/datos-declaracion.json). `--aplicabilidad` ajusta el texto al veredicto: no dice «de conformidad con» una ley que no obliga o es dudosa, y avisa de lo que supone publicar «parcialmente conforme» siendo sujeto obligado. Sin revisión completa genera un borrador sin situación de cumplimiento, marcado para no publicar. La plena conformidad solo se escribe con `--confirmar-plena-conformidad "Nombre, cargo"` y se rechaza si hay fallos o pendientes. Enlázala desde todas las páginas. Formulario de comunicación accesible: [plantillas/contacto-accesibilidad.html](plantillas/contacto-accesibilidad.html); necesita destino real y alguien que responda.

### 8. Que no vuelva: CI
```bash
node auditar.mjs --guardar-linea-base a11y-base.json <urls>   # una vez; súbelo al repositorio
node auditar.mjs --linea-base a11y-base.json <urls>           # en cada cambio: falla solo con regresiones
```
También como acción de GitHub (`action.yml`, entrada `linea-base`). Detalles: [flujo-arreglo.md](references/flujo-arreglo.md#integracion-continua).

### 9. Si lo piden: panel de preferencias
[panel/](panel/README.md) es un componente sin dependencias ni rastreo con ajustes de texto, contraste, espaciado, enlaces, animaciones y fuente. **Es una comodidad adicional: ofrécelo después de arreglar, nunca en su lugar**, y no lo presentes como cumplimiento. Prefiere `modo="en-linea"` en el pie.

### 10. Informe final
1. **Resumen:** antes y después por impacto (`comparar.mjs`), y qué estado de revisión manual hay. Nunca «la web ya es accesible».
2. **Cambios:** fichero, qué y criterio: `X.Y.Z Nombre (nivel) · EN 9.X.Y.Z`. Los nuevos de WCAG 2.2 (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) no están en EN 301 549 V3.2.1, sí en la V4.1.1.
3. **Pendientes:** cada fallo con motivo y quién decide.
4. **Revisión manual:** qué se comprobó, qué no y cómo hacerlo.
5. **Declaración:** estado y dónde enlazarla.

## Reglas
- No añadas overlays ni scripts de terceros que «arreglan» la accesibilidad.
- No ocultes problemas a la herramienta: nada de `aria-hidden` en contenido visible, `role="presentation"` en controles, `--excluir` para lo tuyo, ni regenerar la línea base para hacer pasar la CI.
- No inventes textos alternativos, etiquetas ni resultados de pruebas.
- No rodees bloqueos antibot ni captchas para auditar: documenta el límite.
- No toques textos legales, precios ni contenido del cliente sin avisar; propón el cambio.
- Arregla en la fuente (componente, plantilla, token), no en la salida generada.
