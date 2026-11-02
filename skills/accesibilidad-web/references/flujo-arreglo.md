# Del informe a la web arreglada

El bucle es auditar, priorizar, arreglar en el código y volver a auditar. Esta guía dice cómo trabajarlo y cuándo parar.

## Preparación

Trabaja en una rama. Guarda la primera auditoría aparte, porque es tu «antes»:

```bash
node auditar.mjs --salida a11y/antes https://localhost:3000 https://localhost:3000/contacto
node priorizar.mjs a11y/antes/informe.json --proyecto ../mi-web
```

Audita siempre las mismas páginas con las mismas opciones: `comparar.mjs` avisa si no es así. Añade con `--estados` lo que solo aparece tras interactuar (menú móvil, carrito lateral, errores de formulario, filtros): lo que no se abre no se audita.

## Orden de trabajo

`plan.md` ya viene ordenado. La lógica es:

1. **Lo automático.** `node arreglar.mjs --proyecto ../mi-web --idioma es`. Revisa `arreglos.diff`; aplícalo con `--aplicar` o `git apply`. Son pocos fallos, pero baratos.
2. **Crítico y grave, de plantilla y de componentes compartidos.** Un arreglo corrige muchas páginas.
3. **Asistido.** Lo que un agente o desarrollador resuelve con la receta y la [guía del framework](frameworks/). Un bloque por regla o componente, con su commit.
4. **Criterio humano.** Lo que depende del contenido o de la marca. No lo inventes: prepara una propuesta y pregunta (ver abajo).
5. **Moderado y leve.**

## Cómo arreglar un hallazgo

1. Lee la tarea del plan y su receta.
2. Confirma la ubicación. «Fichero probable» es una pista por coincidencia de texto. Si no aparece, busca por el texto visible, por el componente que renderiza esa zona o con las herramientas de desarrollo. Si viene de un CMS, de una biblioteca o de un tercero, arregla ahí o documéntalo.
3. Arregla en el origen, con HTML nativo antes que ARIA.
4. Comprueba el componente en el navegador con teclado, y revisa que no has roto otra cosa: compila y pasa los tests.
5. Si puedes, añade un test que lo proteja.

No hagas pasar el informe con trampas: ni `aria-hidden` en contenido visible, ni `role="presentation"` en controles, ni `--excluir` para lo que es tuyo, ni parches en cliente con JavaScript, ni textos que no signifiquen nada para llenar un `alt`. `--excluir` es solo para código que no controlas, y ese fallo va a la declaración.

## Lo que exige criterio humano

| Fallo | Qué puede hacer un agente | Qué decide una persona |
|---|---|---|
| Texto alternativo | Proponerlo viendo la imagen y su contexto | Si describe lo que aporta, o si es decorativa |
| Nombre de enlaces y botones | Proponerlo a partir de la función | Que sea correcto, y el tono |
| Contraste | Calcular el token mínimo que llega a 4,5:1 | Cambiar un color de marca |
| Texto sobre imagen | Proponer velo o color | La decisión de diseño, y todas las imágenes posibles |
| Subtítulos y audiodescripción | Generar un borrador | Revisarlo: un borrador automático no basta |
| Orden de encabezados y de foco | Señalar los saltos | Qué estructura tiene sentido |
| Movimiento | Añadir la pausa | Si es esencial, o si se quita |
| Declaración | Generar el borrador con datos reales | Situación final, plazos y firma |

Si eres un agente: no te bloquees. Haz lo demás y deja una lista corta de preguntas con tu propuesta. Si inventas un `alt`, conviertes un fallo detectable en uno que nadie volverá a ver.

## Reauditar y parar

Tras cada bloque:

```bash
node auditar.mjs --salida a11y/despues <mismas urls y opciones>
node comparar.mjs a11y/antes/informe.json a11y/despues/informe.json --salida a11y/comparacion.md
```

Sigue el veredicto:

| Veredicto | Qué hacer |
|---|---|
| `seguir` | Siguiente bloque del plan. |
| `corregir-regresion` | Corrige lo nuevo antes de avanzar. |
| `reauditar` | Alguna página no se pudo auditar en ambos informes. Lo suyo no cuenta como arreglado. |
| `escalar` | Dos pasadas sin progreso: para. Documenta cada pendiente: qué falta, quién decide y para cuándo. |
| `pasar-a-revision-manual` | Cero fallos detectables. Vas a la mitad del camino, no al final. |

**Criterio de parada del bucle:** cero fallos detectables en lo auditado, o bien cada fallo restante con su motivo y responsable. Como referencia, un máximo de cinco pasadas: si no bastan, el problema no es de más intentos.

## Después del bucle

«Cero fallos detectables» significa solo eso. Las herramientas no juzgan si un texto alternativo es bueno ni si la compra se puede completar con un lector de pantalla. Para el objetivo real:

1. **Revisión manual completa:** `node revision.mjs crear --informe a11y/despues/informe.json --salida a11y/revision-manual.json`. Sigue [revision-manual.md](revision-manual.md). Registra cada comprobación con autor y método. Un agente no puede aprobar lo que está marcado como «persona».
2. **Personas reales.** Pide a personas con discapacidad, o usuarias habituales de productos de apoyo, que completen las tareas principales. No hay otra forma de saber si funciona.
3. **Declaración** con resultados reales: `node declaracion.mjs`. No afirma conformidad si la evaluación no está completa.
4. **Línea base en la CI**, para que no vuelvan: [integración continua](#integracion-continua).

**Nadie puede garantizar una web «100 % accesible»**: las necesidades de las personas son diversas y a veces entran en conflicto, el contenido cambia y las pruebas son una muestra. Lo que sí se puede afirmar es lo comprobado: qué se evaluó, cómo y cuándo. Si alguien te pide que lo prometas, dile esto.

<a id="integracion-continua"></a>

## Integración continua

Con muchos fallos heredados, una CI que falla siempre se acaba ignorando. Por eso, la línea base:

```bash
node auditar.mjs --guardar-linea-base a11y-base.json <urls>   # una vez; súbelo al repositorio
node auditar.mjs --linea-base a11y-base.json <urls>           # en cada cambio
```

- Falla (código 1) solo con fallos nuevos del umbral o peor. Si una página conocida no se puede auditar, código 2: no es un aprobado.
- Las páginas fuera de la línea base cuentan como fallos nuevos.
- Compara por regla, ruta y selector sin posiciones ni clases generadas, y cuenta instancias: sirve entre local y pruebas, y resiste a listas que cambian de orden. Un componente renombrado aparecerá como fallo nuevo y otro arreglado.
- La línea base es una lista de deuda, no de fallos aceptables. Cuando mejores, regenérala para que no vuelvan. Si la regeneras para hacer pasar la CI con fallos nuevos, has desactivado el control.
