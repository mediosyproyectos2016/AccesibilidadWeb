# ¿Le aplica la normativa de accesibilidad a esta web?

Para responder a esto sin dejarlo «para el abogado», con la fuente al lado. **Información revisada el 2-11-2026. No es asesoramiento jurídico:** es la mejor lectura posible con fuentes públicas, y dice cuándo no hay respuesta cerrada. Antes de una decisión con riesgo, consulta a un profesional.

```bash
node aplicabilidad.mjs --titular privado --destinatarios consumidores --contrato en-la-web \
  --contraparte titular --personas 25 --volumen 3000000 --balance 2500000 --grupo no --comunidad MD
node aplicabilidad.mjs --preguntas     # las preguntas, en JSON, para hacérselas a la persona
node aplicabilidad.mjs --entrada respuestas.json --salida a11y   # escribe aplicabilidad.json y .md
node declaracion.mjs --aplicabilidad a11y/aplicabilidad.json ... # el texto se adapta al veredicto
```

Sin red ni dependencias. Si no sabes una respuesta, omítela: sale «dudoso» con cada escenario y lo que falta.

Cómo leer cada dato:

| Etiqueta | Qué es |
|---|---|
| `norma` | Texto de una ley o directiva. |
| `criterio-oficial` | Autoridad u organismo público español. |
| `criterio-oficial-otro-estado` | Lo mismo de otro país. Orienta, pero en España no obliga. |
| `resolucion-otro-estado` | Sentencia o auto de otro país, contado por un tercero. |
| `tercero` | Despacho, cámara de comercio, prensa o blog. |
| `propio` | Razonamiento de este proyecto. No es una fuente. |

## 1. El árbol

Son preguntas de hechos. Valen para cualquier web, conste o no su tipo en la norma.

```text
1. ¿Es administración, organismo público o entidad dependiente de una?
     Sí → RD 1112/2018 aplica. Sigue: si además vende, también la Ley 11/2023.
2. ¿La web recibe fondos públicos, gestiona un servicio público o es de un centro sostenido?
     Sí → los criterios técnicos se exigen por la DA 1.ª del RD 1112/2018.
3. ¿Se presta solo a empresas, y se impide de verdad que contrate un consumidor?
     Sí → la Ley 11/2023 no aplica. Si se dice pero no se impide → dudoso.
4. ¿Es un servicio citado por sí mismo? Banca, comunicaciones, acceso audiovisual, transporte
   de viajeros, libros electrónicos, y en España suministros, agencias de viajes y redes sociales.
     Sí → aplica, salvo microempresa.
5. ¿Cómo llega el usuario a contratar?
     En la web o app, aunque sea con otro (compra, reserva, cita, suscripción) → aplica.
     Pide algo y se cierra fuera (presupuesto, solicitud)                      → dudoso.
     Le envía a otra web a contratar:
        cobra si hay contrato y atiende una petición individual → dudoso, mejor tratar como si aplicara.
        solo una de las dos                                     → dudoso, más probable que no.
        ninguna                                                 → no aplica.
     No se contrata (informa, se financia con publicidad)       → no aplica.
     Sin actividad económica, o gratis y sin datos              → dudoso.
6. ¿Microempresa? Menos de 10 personas y volumen o balance de hasta 2 M€, contando asociadas
   y vinculadas.
     Sí → exenta de lo anterior si presta servicios. No si fabrica o distribuye productos del art. 2.1.
     No se sabe → se dan los dos escenarios.
7. Aparte: ¿Ley 10/2025? Depende de su propio tamaño o de ser un servicio básico (sección 6).
```

## 2. Salida por tipo de servicio

Resultado del script, comprobado por los tests, para una empresa privada que no es microempresa y se dirige a consumidores. Si es microempresa, los «aplica» y «dudoso» pasan a «no aplica» salvo sector público.

| Caso | Hechos que decide | Veredicto | Certeza |
|---|---|---|---|
| Tienda, reservas o citas, SaaS de pago, medio con suscripción | contrato en la web | aplica | alta |
| Marketplace con pago en la web | contrato en la web, con terceros | aplica | media |
| Servicio pagado con datos | contrato en la web, sin dinero | aplica | media |
| Banca, transporte de viajeros | sector citado | aplica | alta |
| Red social | sector citado, solo en España y sin definir | aplica | media |
| Transporte urbano o regional sin venta | solo terminales | no aplica | media |
| SaaS o tienda B2B que comprueba al cliente | sin consumidores | no aplica | alta |
| B2B que deja comprar a cualquiera | consumidores de hecho | dudoso | media |
| Web corporativa, blog o medio con publicidad, ONG que informa | sin contrato | no aplica | alta |
| Enlaces sin cobrar ni atender peticiones | sin contrato ni petición | no aplica | media |
| Comparador con afiliación, buscador que cobra por venta | redirige, cobra y hay petición | dudoso, mejor tratar como si aplicara | media |
| Blog con enlaces de afiliación | redirige y cobra, sin petición | dudoso, más probable que no | baja |
| Solicitud de presupuesto | pasos previos | dudoso | baja |
| ONG con donaciones, alta gratuita sin datos | sin actividad económica o sin pago | dudoso | baja |
| Administración pública | titular | aplica el RD 1112/2018 | alta |
| Empresa o fundación pública dependiente | titular | aplica el RD 1112/2018 | media |
| Privada con fondos públicos para la web, concesionaria | DA 1.ª | criterios técnicos del RD 1112/2018 | media |

Si tu caso no está aquí, responde a las preguntas igual: la tabla es una muestra, no la lista de lo que cuenta.

## 3. Microempresa

**Criterio exacto** (`norma`). «Una empresa que emplea a menos de 10 personas y cuyo volumen de negocios anual no supera los 2 millones de euros o cuyo balance anual total no supera los 2 millones de euros» (Ley 11/2023, anexo VII, 16; Directiva, art. 3.23). Es «o»: basta cumplir una de las dos cifras, junto con las personas.

**Hasta dónde llega** (`norma`). Las que presten servicios quedan exentas de los requisitos «y cualquier obligación relativa al cumplimiento de dichos requisitos» (art. 3.3 Ley 11/2023; art. 4.5 Directiva). Por eso tampoco deben publicar la información del art. 13.2 ni avisar por el 13.7. **Solo servicios:** quien fabrique, importe o distribuya productos del art. 2.1 sigue obligado por ellos, con alivios en la documentación (art. 16.4). Sigue valiendo la igualdad del art. 29 del RDL 1/2013, sin requisitos técnicos. La DA 2.ª obliga a las administraciones a darles orientación.

**Asociadas y vinculadas.** La Ley 11/2023 no lo dice. El considerando 53 de la Directiva pide cumplir «realmente» la Recomendación 2003/361/CE y su jurisprudencia para evitar la elusión. Aplicarla en España es una inferencia razonable (`propio`), no texto expreso. Según esa Recomendación (`norma`, no vinculante):

- **Asociada:** 25 % o más del capital o los votos, sin control. Se suma en proporción (arts. 3.2 y 6.2).
- **Vinculada:** mayoría de votos, nombrar a la mayoría del órgano de administración o influencia dominante. Se suma el 100 % (arts. 3.3 y 6.2). También por medio de personas físicas que actúen de común acuerdo, si operan en el mismo mercado o en uno contiguo.
- **Control público:** con el 25 % o más en manos públicas no es pyme, salvo algunos inversores (art. 3.4).
- **Personas:** unidades de trabajo anual, con propietarios que dirigen y socios con actividad regular y ventajas financieras. Sin aprendices (art. 5).
- **Cambio de categoría:** solo si se pasa el umbral dos ejercicios seguidos (art. 4.2).

Autónomos y asociaciones con actividad económica regular también son «empresa» (art. 1). Comprueba el tamaño en la fecha de cierre de cuentas y guarda el cálculo: las microempresas lo necesitarán si alguien pregunta.

## 4. Qué es comercio electrónico

**Texto** (`norma`). «Servicios prestados a distancia, a través de sitios web y servicios para dispositivos móviles, por medios electrónicos y a petición individual de un consumidor, al objeto de celebrar un contrato con el consumidor» (Directiva, art. 3.30; Ley 11/2023, anexo VII, 32). El considerando 42 explica «a distancia» y «por medios electrónicos». El 43 lo aplica «a la venta en línea de cualquier producto o servicio». No define «al objeto de» ni dice quién debe ser parte del contrato.

**Criterio oficial que consta a 2-11-2026:**

- **Comisión Europea:** lista el servicio y no lo define. No consta guía ni preguntas frecuentes sobre el concepto, aunque el considerando 86 prevé orientaciones no vinculantes para coordinar a las autoridades. El art. 4.6 pide a los Estados orientación para microempresas.
- **España:** no consta guía de la UTAC ni de otra autoridad, ni jurisprudencia.
- **Países Bajos, ACM** (`criterio-oficial-otro-estado`): «*An e-commerce service is an online service where consumers can take out a contract online*». Incluye comprar, alquilar, encargar, reservar y suscribirse, aunque la oferta ocupe una parte pequeña de la web, aunque las ofertas sean de otros vendedores y aunque se pague con datos.
- **Alemania, BMAS** (`criterio-oficial-otro-estado`): incluye la venta y también la reserva de citas de una peluquería, y dice que toda la web debe ser accesible.
- **Alemania, Bundesfachstelle** (`criterio-oficial-otro-estado`): una web de presentación solo informativa o que solo anuncia «no debería» entrar, entre otras cosas porque falta la petición individual. Lo exclusivamente B2B tampoco «debería».

**Opiniones de terceros, que discrepan:**

- **Piltz Legal** (`tercero`): da igual quién firme. Marketplaces, comparadores e intermediarios entran «en la regla» si buscan provocar contratos con terceros; quedan fuera si no caben ni pasos precontractuales ni contratar. Lo que no sea comercial, fuera. También sostiene que la ley puede cubrir solo una parte de la web, en contra del ejemplo del ministerio.
- **Freshfields** (`tercero`): las condiciones son acumulativas. Un perfil con enlace a la tienda o una app de información sin compra quedan «arguably» fuera, porque no permiten contratar directamente.
- **WKO, cámara de Austria** (`tercero`): páginas informativas sin pedido ni reserva, fuera. Sobre un formulario de contacto en una web informativa recoge dos posturas: una «muy estricta» que lo incluye y otra que no, porque no lleva a un contrato inmediato. Una microempresa no necesita publicar nada sobre su exención.

**Resoluciones:** no consta ninguna del TJUE ni española que interprete el concepto a 2-11-2026. Las francesas conocidas no tratan este punto (sección 8).

**Por qué «redirige» es dudoso y no otra cosa.** A favor, la letra («al objeto de», no «en la web») y un despacho que lo cita. En contra, un criterio oficial neerlandés que pide contratar en línea, los considerandos que hablan de venta, otro despacho y el anexo I, que regula identificación y pago, que aquí no están. Ninguna fuente oficial consultada trata esta situación. Si el usuario no hace ninguna petición y la web cobra por publicidad, no entra.

## 5. Obligaciones si aplica

Ley 11/2023 (`norma`). <https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022>

| Artículo | Obligación |
|---|---|
| 13.1 y anexo I | Diseñar y prestar el servicio conforme a los requisitos. |
| Anexo I, sec. IV, g) | Comercio electrónico: información de accesibilidad de lo que se vende cuando el responsable la dé; identificación, seguridad y pago accesibles. |
| DA 3.ª | Web: como mínimo nivel medio de criterios reconocidos; cita UNE 139803 «o aquella que la sustituya». |
| 13.2 | En las condiciones generales o documento equivalente, información que evalúe cómo se cumplen los requisitos: cuáles, descripción general, funcionamiento y cómo se garantiza. |
| 13.4 | Por escrito y de forma oral, accesible, actualizada mientras funcione el servicio. |
| 13.5 y 13.6 | Procedimientos para mantener la conformidad ante cambios y poder demostrarla. |
| 13.7 | Si no es conforme: medidas correctoras e **información inmediata** a las autoridades de los Estados donde se presta, con detalle del incumplimiento y de las medidas. |
| 13.8 | Dar información y cooperar ante solicitud motivada. |
| 14 | Productos usados y subcontratas también deben cumplir. |
| 15 | Formación adecuada y continua del personal. |
| 16 y anexo V | Excepción por modificación sustancial o carga desproporcionada: evaluación documentada, 5 años de conservación, renovación al cambiar el servicio, a petición de la autoridad y cada 5 años, y aviso a la autoridad. Cualquier financiación para mejorar la accesibilidad impide alegar carga. |
| 2.4 | Fuera: multimedia y ofimática anteriores al 28-06-2025, mapas si lo esencial es accesible, contenido de terceros no financiado ni controlado, archivos no editados. |

**Plazos** (DF 18.ª y DT única). En vigor desde el 28-06-2025. Hasta el 28-06-2030 se puede seguir usando **productos** con los que ya se prestaba el servicio. Contratos anteriores al 28-06-2025, sin cambios hasta su fin, 5 años como máximo. Terminales, hasta su vida útil, 10 años como máximo. No es un periodo de gracia para la web.

**Sanciones.** La Ley 11/2023 no fija cuantías. Remite a la legislación sectorial y, en lo no previsto, al título III del RDL 1/2013 (art. 30). Ahí: de 301 € a 1.000.000 €; leves hasta 30.000 €, graves hasta 90.000 € (art. 83). Son graves los incumplimientos de las exigencias de accesibilidad (art. 81.3.b) y leves los de obligaciones meramente formales (art. 81.2), sin perjuicio de la legislación autonómica. Qué régimen aplicará cada comunidad: no consta a 2-11-2026. Quién puede reclamar además: consumidores, asociaciones y entidades del sector (art. 29.2).

## 6. Otras normas

**RD 1112/2018** (`norma`). Aplica a administraciones, sector público institucional, asociaciones de entidades públicas y Administración de Justicia (art. 2). Una **empresa privada** entra de dos formas:

- **Por control:** el art. 2.1.d remite al art. 2.2 de la Ley 39/2015, que incluye las entidades de derecho privado «vinculadas o dependientes» de las administraciones. El RD no fija un porcentaje.
- **Por dinero o servicio público (DA 1.ª):** las administraciones «exigirán» los criterios de los arts. 5 y 6 a las webs y apps que reciban financiación pública para su diseño o mantenimiento; a las vinculadas a servicios públicos de empresas que los gestionen por concesión o contrato; y a las de centros educativos privados sostenidos con fondos públicos. Solo los criterios técnicos, no todo el régimen. Comprueba qué dice la subvención o el contrato.

La STC 100/2019 anuló o declaró no básicos varios preceptos: comunidades y entidades locales pueden tener plazos propios. Un organismo público que venda en línea cumple las dos normas (considerando 46 de la Directiva).

**Ley 10/2025** (`norma`). <https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698>

- **Ámbito:** sea cual sea el tamaño, suministro de agua, gas y electricidad; transporte aéreo, ferroviario, marítimo y en autobús; postales; comunicaciones electrónicas; financieros (art. 2.1). Y las empresas o grupos del art. 42 del Código de Comercio que venden principalmente a consumidores con al menos 250 personas, **o** más de 50 M€ de volumen, **o** más de 43 M€ de balance (art. 2.2). También la Administración General del Estado (art. 2.7). Solo la oferta onerosa (art. 2.8).
- **Plazos:** en vigor el 28-12-2025, doce meses para adaptarse (DT única): hasta el 28-12-2026. Banca y comunicaciones se rigen antes por su normativa sectorial.
- **15 días hábiles** para resolver consultas, quejas e incidencias, salvo plazo sectorial (art. 17.1). Cobros indebidos, 5 días (art. 17.3).
- Sus umbrales no son los de microempresa: una empresa de 100 personas puede estar fuera de esta ley y dentro de la 11/2023.

**Norma técnica. Qué versión.** La Ley 11/2023 no cita EN 301 549 ni ninguna versión. Exige los requisitos del anexo I. La presunción de conformidad es para la norma armonizada citada en el DOUE (art. 17).

- **V3.2.1** está citada, pero para la Directiva 2016/2102 de sector público (Decisión 2021/1339). WCAG 2.1 AA.
- **V4.1.1**, publicada el 2-09-2026, es WCAG 2.2 AA y tiene anexo para la Directiva 2019/882. No consta citada a 2-11-2026.
- **Para la Directiva 2019/882 no consta hoy ninguna norma con presunción.** EN 301 549 es referencia técnica, no presunción.
- **Fecha prevista de la cita, contrapuesta:** 16-12-2026 (NDA irlandesa), 30-11-2026 (calendario de ETSI, según un tercero); AccessibleEU no anuncia fecha (según otro tercero). No se pudo abrir EUR-Lex: compruébalo.
- **Recomendación del proyecto:** WCAG 2.2 AA, y decir en la declaración con qué versión se evaluó.

## 7. Autoridad por comunidad

**Quién.** Cada comunidad, Ceuta y Melilla determinan sus autoridades (art. 27.3 Ley 11/2023). **UTAC:** Unidad técnica en la Dirección General de Derechos de las Personas con Discapacidad, creada por el RD 143/2026. Coordina, es punto de contacto para ciudadanía y empresas, recibe denuncias (art. 3.g) y actúa como autoridad **donde no se haya designado ninguna** (art. 3.h). Contacto: `utac@dsca.gob.es`, <https://www.rpdiscapacidad.gob.es/discriminacion/utac-accesibilidad.htm>. Denuncias: por ahora, por la [página de infracciones](https://www.dsca.gob.es/es/derechos-sociales/discapacidad/derechos-personas-discapacidad/infracciones-y-sanciones); el trámite en sede electrónica está anunciado sin fecha.

**¿Domicilio o usuario? Dudoso.** Ninguna norma lo dice. El art. 27.3 solo dice «en el ámbito de sus competencias». El ministerio, para las infracciones del RDL 1/2013, dice que si la conducta supera una comunidad compete a la Administración General del Estado; no consta que se haya aplicado a esta ley. Recomendación (`propio`): nombra a la autoridad del domicilio si existe y añade siempre la UTAC.

**Listado a 2-11-2026.** Ninguna fuente oficial consultada publica un listado. «No consta» significa búsqueda en la web y en cada boletín por buscador, sin abrirlo número a número: no prueba que no exista.

| Territorio | Estado | Fuente y fecha |
|---|---|---|
| Comunitat Valenciana | **No designada.** La Generalitat dijo estar analizándolo entre departamentos, con la opción de integrarla en la vigilancia de mercado. | [Convención Discapacidad](https://www.convenciondiscapacidad.es/2026/08/29/el-defensor-del-pueblo-requiere-a-cinco-comunidades-autonomas-para-que-designen-su-autoridad-responsable-de-accesibilidad-a-productos-y-servicios/), 29-08-2026 (`tercero`) |
| Principado de Asturias | **No designada.** La consejería dice no tener competencia; el Defensor del Pueblo amplía actuaciones. | La misma, 29-08-2026 |
| Aragón, Cataluña, Galicia | No consta designación. El Defensor del Pueblo les pidió información; no consta respuesta. | La misma, 29-08-2026 |
| Andalucía, Illes Balears, Canarias, Cantabria, Castilla-La Mancha, Castilla y León, Extremadura, Madrid, Murcia, Navarra, País Vasco, La Rioja, Ceuta, Melilla | No consta. | Búsqueda a 2-11-2026 |

No se localizó la resolución del Defensor del Pueblo, solo la noticia. Un [blog](https://olgacarreras.blogspot.com/2025/07/la-utac-las-autoridades-de-vigilancia.html) cita una entrevista de 24-06-2025 según la cual ocho comunidades ya la habían designado, sin nombrarlas; no se ha podido confirmar y no cuadra con ningún listado público. Un despacho, visto solo en un extracto, atribuye la autoridad nacional a Consumo; no coincide con el art. 27 ni con el RD 143/2026. Lo más directo es preguntarlo a la UTAC.

## 8. Publicar «parcialmente conforme»

Las sentencias francesas se citan por lo que enseñan, con otra norma detrás: **TJ de Caen, référé de 4-06-2026, RG 25/00691** (`resolucion-otro-estado`, [contado por Handicap.fr](https://informations.handicap.fr/a-accessibilite-web-carrefour-condamne-par-la-justice-39309.php); el texto íntegro está tras un muro de pago y las fuentes discrepan en la multa). El juez rechazó que un 71 % de conformidad bastara: dijo que era una obligación de resultado y ordenó cumplir en seis meses. **TJ de Lille, mayo de 2026** (`resolucion-otro-estado`, [contado por las demandantes](https://droitpluriel.fr/decision-du-tribunal-judiciaire-de-lille-le-6-mai-2026apidv-et-droit-pluriel-c-auchan-e-commerce-une-interpretation-gravement-erronee-du-droit-de-laccessibilite-numerique/), recurrido): vio la no conformidad y rechazó la demanda por aplicar el umbral de 250 M€ de otra ley francesa. En España no consta nada parecido.

«Parcialmente conforme» viene del modelo para el sector público (Decisión 2018/1523). La Ley 11/2023 no usa ese término ni un modelo: pide evaluar cómo se cumple (art. 13.2). No consta ningún criterio español sobre este texto.

| Caso | Qué supone | Cómo redactar (`declaracion.mjs --aplicabilidad`) |
|---|---|---|
| **Sector público** | Es el texto del modelo. Previsto y normal, con lista de lo no accesible y alternativas. | Modelo tal cual: «parcialmente conforme con…». Revisión anual. |
| **Obligado por la Ley 11/2023** | Reconoces en público que no cumples. **No protege:** la ley no da plazo por declararlo. Nace el deber del art. 13.7 de corregir y avisar de inmediato. Solo el art. 16, documentado, excepciona. | «Parcialmente conforme», con cada fallo, su medida correctora y su fecha. Sin «estamos trabajando en ello» a secas. Decide con un abogado el aviso del 13.7. |
| **Dudoso** | Si la ley resulta aplicable, lo publicado cuenta igual como reconocimiento. Si no, es voluntario. | «Cumple parcialmente [norma], que usamos como referencia», «sin prejuzgar si esa ley es exigible». Sin «de conformidad con». |
| **No aplica o microempresa** | Sin consecuencia en la Ley 11/2023. Ojo: decir «de conformidad con la Ley 11/2023» sería afirmar que te obliga. | «Publica esta declaración de forma voluntaria», «cumple parcialmente […], que usamos como referencia voluntaria». Sin autoridad. |

En todos los casos: la plena conformidad la asume una persona, y solo sin fallos conocidos y con la revisión manual completa. Decir «cumple» sin haberlo comprobado es peor que no decir nada.

## 9. Cómo actualizar

Los datos están en `scripts/lib/normativa/`: `ue.mjs` (Directiva, común), `es.mjs` (España) e `index.mjs` (registro).

1. Abre cada URL y comprueba el dato. Nada de memoria. Lo que no se pueda comprobar queda como «no consta a <fecha>».
2. Cambia `REVISADO_ES` o `REVISADO_UE` y la fecha de `consultado`. El script avisa si los datos pasan de 180 días.
3. Revisa primero: autoridades designadas (pide la lista a la UTAC), la cita de EN 301 549 en el DOUE, guías de la Comisión o la UTAC y sentencias.
4. Si una comunidad designa autoridad: `estado: 'designada'`, `autoridad` y `fuente` en `COMUNIDADES`, con el boletín.
5. Actualiza esta página, `docs/normativa-es.md` y el CHANGELOG. Ejecuta: `node --test --test-name-pattern=aplicabilidad test/aplicabilidad.test.mjs`.

**Otro país:** copia `es.mjs`, rellena con fuentes de ese país y regístralo en `index.mjs`. Sin datos propios, el motor evalúa con la Directiva, avisa de ello y nunca da certeza por encima de «baja».

## 10. Fuentes

Consultadas el 2-11-2026.

| Fuente | Tipo |
|---|---|
| [Ley 11/2023, texto consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022) | norma |
| [Directiva (UE) 2019/882, DOUE L 151](https://www.boe.es/doue/2019/151/L00070-00115.pdf); referencia oficial <https://eur-lex.europa.eu/eli/dir/2019/882/oj> (no abrió desde aquí) | norma |
| [Recomendación 2003/361/CE](https://www.boe.es/doue/2003/124/L00036-00041.pdf) | norma, no vinculante |
| [RD 143/2026](https://www.boe.es/buscar/act.php?id=BOE-A-2026-4520), [RD 1112/2018](https://www.boe.es/buscar/act.php?id=BOE-A-2018-12699), [Ley 10/2025](https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698), [RDL 1/2013](https://www.boe.es/buscar/act.php?id=BOE-A-2013-12632), [Ley 39/2015](https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565) | norma |
| [UTAC](https://www.rpdiscapacidad.gob.es/discriminacion/utac-accesibilidad.htm), [ministerio, infracciones](https://www.dsca.gob.es/es/derechos-sociales/discapacidad/derechos-personas-discapacidad/infracciones-y-sanciones) | criterio oficial |
| [Comisión Europea, página de la Directiva](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en) | criterio oficial; no define el concepto |
| [ACM](https://www.acm.nl/en/accessibility/accessibility-e-commerce-services-and-electronic-communications-services), [business.gov.nl](https://business.gov.nl/amendments/european-accessibility-act-products-services/) (Países Bajos); [BMAS](https://www.bmas.de/SharedDocs/Downloads/DE/Teilhabe/leitlinien-barrierefreiheit.pdf?__blob=publicationFile&v=3), [Bundesfachstelle](https://www.bundesfachstelle-barrierefreiheit.de/DE/Fachwissen/Produkte-und-Dienstleistungen/Barrierefreiheitsstaerkungsgesetz/FAQ/faq_node.html) (Alemania); [NDA](https://nda.ie/news/en301549-published) (Irlanda) | criterio oficial de otro Estado |
| [Piltz Legal](https://www.piltz.legal/news/barrierefreiheitsstaerkungsgesetz-fuer-welche-apps-und-websites-gilt-das-bfsg-teil-2), [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/inclusivity-by-design-the-european-accessibility-act-as-a-new-imperative-for-e-102lu76), [WKO](https://www.wko.at/internetrecht/barrierefreiheitsgesetz-im-e-commerce-faq), [Convención Discapacidad](https://www.convenciondiscapacidad.es/2026/08/29/el-defensor-del-pueblo-requiere-a-cinco-comunidades-autonomas-para-que-designen-su-autoridad-responsable-de-accesibilidad-a-productos-y-servicios/), [Olga Carreras](https://olgacarreras.blogspot.com/2025/07/la-utac-las-autoridades-de-vigilancia.html), [Pivotal](https://www.pivotalaccessibility.com/2026/09/en-301-549-v4-1-1-is-published-what-it-means-for-digital-accessibility/), [sitebrunch](https://www.sitebrunch.com/en/facts/en-301-549) | tercero |

**No se ha podido comprobar:** el texto de EUR-Lex (bloquea desde este entorno; se usó la copia del DOUE en el BOE), la resolución del Defensor del Pueblo, el texto íntegro de las resoluciones francesas, la ficha UNE de la norma que sustituye a UNE 139803, y cada boletín autonómico número a número.
