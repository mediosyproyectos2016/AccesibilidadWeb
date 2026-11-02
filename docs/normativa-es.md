# Normativa española y europea de accesibilidad web — guía para no juristas

> **Aviso importante.** Este documento es material divulgativo de un proyecto de código abierto. **No es asesoramiento jurídico** ni sustituye la lectura de las normas oficiales o la opinión de un profesional. Los textos consolidados del BOE son informativos y no tienen valor jurídico; lo que vale es lo publicado en el BOE y el DOUE. Cada dato lleva su fuente y fecha de consulta (tabla final). Lo que no se ha podido confirmar está marcado **[pendiente de verificar]**.
>
> Última revisión de fuentes: **30-10-2026**.

---

## Índice

1. [¿Me afecta? (tabla por tipo de entidad)](#1-me-afecta)
2. [Ley 11/2023 — sector privado (Acta Europea de Accesibilidad)](#2-ley-112023--sector-privado-acta-europea-de-accesibilidad)
3. [Real Decreto 1112/2018 — sector público](#3-real-decreto-11122018--sector-público)
4. [Otras normas relacionadas](#4-otras-normas-relacionadas)
5. [Norma técnica: EN 301 549 y WCAG](#5-norma-técnica-en-301-549-y-wcag)
6. [Obligaciones documentales](#6-obligaciones-documentales)
7. [Tabla obligación → requisito → cómo comprobarlo](#7-tabla-obligación--requisito--cómo-comprobarlo)
8. [Qué NO acredita el cumplimiento](#8-qué-no-acredita-el-cumplimiento)
9. [Fuentes](#9-fuentes)

---

## 1. ¿Me afecta?

Orientación rápida. Una misma entidad puede estar en varias filas.

| Tipo de entidad | Norma principal | ¿Desde cuándo? | Notas |
|---|---|---|---|
| Administración General del Estado, comunidades autónomas, entidades locales, sector público institucional, Administración de Justicia | **RD 1112/2018** | Webs: en vigor desde 20-09-2018 (con plazos escalonados); apps: desde 23-06-2021 | Declaración de accesibilidad, canal de comunicaciones y quejas, unidad responsable, informes anuales. |
| Empresa (no microempresa) que presta **a consumidores** alguno de los servicios del art. 2.2 de la Ley 11/2023: comercio electrónico, banca, comunicaciones electrónicas, acceso a servicios audiovisuales, determinados elementos del transporte de viajeros, libros electrónicos, determinados elementos del suministro de electricidad, agua y gas, agencias de viaje y turoperadores, redes sociales | **Ley 11/2023, Título I** | 28-06-2025 | Requisitos del anexo I, información de accesibilidad del servicio (art. 13), régimen transitorio hasta 28-06-2030 para productos ya en uso. |
| Fabricante, importador o distribuidor de los **productos** del art. 2.1 (ordenadores y sistemas operativos de consumo, terminales de autoservicio, terminales de pago, lectores electrónicos, etc.) | **Ley 11/2023, Título I** | 28-06-2025 | Fuera del alcance principal de este proyecto (que trata webs y apps), pero mismo régimen. |
| **Microempresa** que presta servicios (menos de 10 personas y volumen de negocios anual o balance general ≤ 2 millones €) | Exenta de los requisitos del Título I (art. 3.3 y anexo VII, punto 16, Ley 11/2023) | — | Sigue sujeta a las normas generales de igualdad y no discriminación (RDL 1/2013). Las administraciones deben ofrecerle orientación (DA 2.ª Ley 11/2023). |
| Empresa que solo vende a otras empresas (B2B) | El Título I se refiere a servicios **a consumidores** | — | Revisar caso por caso; puede verse afectada como proveedora de una entidad obligada o en contratación pública (art. 25). |
| Gran empresa (≥ 250 trabajadores, o volumen de negocios > 50 M€, o balance > 43 M€) que vende a consumidores, y cualquier empresa de suministros básicos, transporte, postales, comunicaciones electrónicas o servicios financieros | **Ley 10/2025** (servicios de atención a la clientela) | En vigor desde 28-12-2025; adaptación en 12 meses | Atención a la clientela universalmente accesible, lectura fácil y pictogramas, canales accesibles. |
| Empresa privada con web meramente informativa, sin venta a consumidores ni servicio del art. 2.2 | No hay obligación técnica específica de la Ley 11/2023 | — | Aplican los principios generales de accesibilidad universal del RDL 1/2013. Recomendable cumplir WCAG 2.2 AA igualmente. |

---

## 2. Ley 11/2023 — sector privado (Acta Europea de Accesibilidad)

**Ley 11/2023, de 8 de mayo**, de trasposición de Directivas de la Unión Europea en materia de accesibilidad de determinados productos y servicios, migración de personas altamente cualificadas, tributaria y digitalización de actuaciones notariales y registrales (BOE núm. 110, de 9-05-2023, ref. BOE-A-2023-11022). Su **Título I** traspone la **Directiva (UE) 2019/882** (conocida como *European Accessibility Act*, EAA).

### 2.1 Productos y servicios afectados (art. 2)

**Servicios prestados a consumidores (art. 2.2):**

| Letra | Servicio |
|---|---|
| a) | Servicios de comunicaciones electrónicas (salvo los de transmisión de máquina a máquina) |
| b) | Servicios que proporcionan acceso a servicios de comunicación audiovisual |
| c) | Determinados elementos de los servicios de transporte aéreo, de autobús regular, ferroviario y marítimo de viajeros |
| d) | Servicios bancarios para consumidores |
| e) | Libros electrónicos y sus programas especializados |
| f) | Servicios de comercio electrónico |
| g) | Determinados elementos de los servicios de suministro eléctrico, de agua y gas a consumidores |
| h) | Determinados elementos de los servicios de agencia de viajes y turoperadores |
| i) | Las redes sociales |

> Las letras g), h) e i) **no figuran en la Directiva 2019/882**: España amplió el ámbito al trasponerla.

El Título I se aplica también a la respuesta a las comunicaciones de emergencia al **112** (art. 2.3).

**Contenidos excluidos de webs y apps (art. 2.4):** multimedia pregrabado de base temporal publicado antes del 28-06-2025; formatos ofimáticos publicados antes del 28-06-2025; mapas y servicios cartográficos en línea si la información esencial de navegación se ofrece de forma digital accesible; contenido de terceros que el operador no financia, desarrolla ni controla; contenido archivado que no se actualiza ni edita después del 28-06-2025.

### 2.2 Desde cuándo y periodos transitorios

- **Aplicación:** el Título I entra en vigor el **28 de junio de 2025** (disposición final decimoctava, apartado 2), salvo el art. 27.4, en vigor a los veinte días de la publicación.
- **Régimen transitorio (disposición transitoria única):**
  - Hasta el **28-06-2030** los prestadores pueden seguir prestando sus servicios con productos que ya usaban legalmente antes de esa fecha para servicios similares.
  - Los contratos de servicios celebrados **antes del 28-06-2025** pueden continuar sin cambios hasta su expiración, **como máximo cinco años** desde esa fecha.
  - **Terminales de autoservicio** usados legalmente antes del 28-06-2025: pueden seguir usándose hasta el final de su vida útil económica, **sin superar los diez años** desde su puesta en funcionamiento.

> **Ojo con los «20 años».** La Directiva 2019/882 (art. 32.2) *permite* a los Estados fijar hasta **20 años** para los terminales de autoservicio. **España eligió diez años** (DT única, apartado 2, Ley 11/2023). Muchos textos divulgativos citan los 20 años de la Directiva; en España no aplica.

### 2.3 Excepciones

1. **Microempresas que prestan servicios:** exentas de cumplir los requisitos de accesibilidad y de cualquier obligación relativa a ellos (art. 3.3). Definición de microempresa: menos de 10 personas y volumen de negocios anual no superior a 2 millones de euros o balance general anual no superior a 2 millones de euros (anexo VII, punto 16).
2. **Modificación sustancial y carga desproporcionada (art. 16):**
   - Solo de forma excepcional y justificada, con una **evaluación** según los criterios del **anexo V** (art. 16.1 y 16.2).
   - La evaluación se **documenta y conserva durante cinco años** desde la última comercialización del producto o la última prestación del servicio; copia a las autoridades si la piden (art. 16.3).
   - En servicios, la evaluación se **renueva** cuando cambia el servicio, cuando lo piden las autoridades y, en todo caso, **cada cinco años** (art. 16.5).
   - No puede invocar carga desproporcionada quien reciba financiación pública o privada para mejorar la accesibilidad (art. 16.6).
   - Quien se acoja a la excepción debe **informar a las autoridades de vigilancia** (art. 16.7; no aplicable a microempresas).

### 2.4 Obligaciones del prestador de servicios (art. 13)

- Diseñar y prestar el servicio conforme a los requisitos del **anexo I** (art. 13.1).
- **Información de accesibilidad del servicio (art. 13.2 y 13.4):** incluir en las **condiciones generales o documento equivalente** cómo cumple el servicio los requisitos de accesibilidad: requisitos aplicables, descripción general del servicio, explicaciones para entender su funcionamiento y cómo la prestación y su seguimiento garantizan la conformidad. Debe estar en formatos universalmente accesibles, **por escrito y de forma oral**, y **mantenerse actualizada** mientras el servicio funcione.
- Procedimientos para mantener la conformidad ante cambios del servicio, de los requisitos o de las normas aplicadas (art. 13.5).
- Si el servicio no es conforme: medidas correctoras e **información inmediata** a las autoridades competentes (art. 13.7).
- Cooperar y aportar información ante requerimiento motivado (art. 13.8).
- Productos con los que interactúa el consumidor y subcontratas también deben cumplir (art. 14). **Formación** continua del personal (art. 15).
- **Presunción de conformidad:** cumplir normas armonizadas publicadas en el DOUE (art. 17). Ver [sección 5](#5-norma-técnica-en-301-549-y-wcag).

### 2.5 Autoridades de vigilancia

- Son **designadas por las comunidades autónomas y por Ceuta y Melilla** en su ámbito de competencias (art. 27). Verifican la conformidad de los servicios y tramitan quejas (art. 24).
- **Unidad técnica de apoyo y coordinación** (art. 28), creada por el **Real Decreto 143/2026, de 25 de febrero** (BOE núm. 52, de 27-02-2026, en vigor el 28-02-2026). La asume la **Dirección General de Derechos de las Personas con Discapacidad**. Coordina, es punto de contacto para ciudadanía y empresas y actúa como autoridad de vigilancia **solo en los ámbitos donde no se haya designado ninguna** (art. 3.h del RD).
- Qué autoridad concreta ha designado cada comunidad autónoma: **[pendiente de verificar]** — consultar el diario oficial autonómico.
- Cualquier consumidor, organismo público, asociación u organización de personas con discapacidad con interés legítimo puede acudir a órganos administrativos y tribunales (art. 29).

### 2.6 Régimen sancionador

**Art. 30 de la Ley 11/2023:** los incumplimientos se sancionan conforme a la **legislación sectorial** aplicable y, **supletoriamente**, conforme al **Título III del Real Decreto Legislativo 1/2013** (Ley General de derechos de las personas con discapacidad). La Ley 11/2023 **no fija cuantías propias**.

Cuantías del RDL 1/2013 (texto consolidado, última actualización publicada el 03-10-2026):

| Gravedad | Límites generales (art. 83) | Grados en el ámbito de la AGE (art. 96) |
|---|---|---|
| Leve | 301 € – 30.000 € | mínimo 301–6.000 €; medio 6.001–18.000 €; máximo 18.001–30.000 € |
| Grave | hasta 90.000 € | mínimo 30.001–60.000 €; medio 60.001–78.000 €; máximo 78.001–90.000 € |
| Muy grave | hasta 1.000.000 € | mínimo 90.001–300.000 €; medio 300.001–600.000 €; máximo 600.001–1.000.000 € |

- **Sanciones accesorias (art. 85):** graves, prohibición de pedir ayudas públicas en el sector hasta un año; muy graves, hasta dos años, y supresión, cancelación o suspensión de ayudas.
- **Criterios de graduación (art. 84):** intencionalidad, negligencia, fraude, reincidencia, volumen de negocio, número de personas afectadas, etc.
- **Prescripción:** infracciones leves 1 año, graves 3, muy graves 4 (art. 82); sanciones leves 1 año, graves 4, muy graves 5 (art. 87).
- Las comunidades autónomas pueden tener su propio régimen de infracciones en su normativa de accesibilidad; los grados del art. 96 son los de **competencia estatal**. Qué régimen aplicará cada autoridad autonómica a la Ley 11/2023: **[pendiente de verificar]**.

---

## 3. Real Decreto 1112/2018 — sector público

**Real Decreto 1112/2018, de 7 de septiembre**, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público (BOE núm. 227, de 19-09-2018; ref. BOE-A-2018-12699; en vigor el 20-09-2018). Traspone la Directiva (UE) 2016/2102.

> **Atención: STC 100/2019, de 18 de julio.** El Tribunal Constitucional declaró que varios preceptos (entre ellos los arts. 12.1, 12.3, 12.4, 12.6, gran parte del 13, parte del 15.3, 16.2, primera frase del 17.4 y parte del 19.3) no son básicos o son inconstitucionales. En la práctica, **comunidades autónomas y entidades locales pueden tener sus propios plazos y procedimientos**; los citados abajo se aplican con seguridad a la **Administración General del Estado**. Consultar las notas del texto consolidado.

- **Ámbito (art. 2):** AGE, comunidades autónomas, entidades locales, sector público institucional y asociaciones de entidades públicas; también la Administración de Justicia (art. 2.2).
- **Exclusiones (art. 3.4):** formatos ofimáticos publicados antes del 20-09-2018 (salvo que sean necesarios para tareas administrativas activas); multimedia pregrabado de base temporal publicado antes del 20-09-2018; multimedia en directo; mapas en línea si la información esencial es accesible; contenido de terceros no financiado, desarrollado ni controlado; reproducciones de piezas de patrimonio que no puedan hacerse accesibles; contenidos de intranets y extranets publicados antes del 23-09-2019 hasta su revisión sustancial; archivos no necesarios para tareas activas ni actualizados.
- **Requisitos (arts. 5 y 6):** perceptible, operable, comprensible y robusto; presunción de conformidad con normas armonizadas publicadas en el DOUE (hoy EN 301 549 V3.2.1, ver sección 5).
- **Carga desproporcionada (art. 7):** excepcional, con evaluación inicial documentada y **revisada al menos una vez al año**. Falta de prioridad, tiempo o conocimiento no la justifican.
- **Declaración de accesibilidad (art. 15):** detallada, clara y accesible; **actualizada al menos una vez al año** o tras cada revisión (art. 17); enlace «Accesibilidad» desde todas las páginas. Debe seguir el **modelo de la Decisión de Ejecución (UE) 2018/1523** (el RD remite a los actos de ejecución de la Comisión; art. 15.3 prevé además una orden ministerial con instrucciones **[pendiente de verificar cuál está vigente]**).
- **Comunicaciones, solicitudes y quejas (arts. 10–12):** canal electrónico (correo o formulario) y al menos otro complementario (teléfono u oficina). Respuesta en **20 días hábiles** (art. 12.3), ampliable con suspensión de hasta 10 días hábiles si se piden aclaraciones; el silencio equivale a desestimación (art. 12.6).
- **Reclamación (art. 13):** si la respuesta es desfavorable, insatisfactoria o no llega en 20 días hábiles, se reclama ante la unidad responsable de accesibilidad, que tiene **dos meses** para resolver (art. 13.4); silencio = desestimación. Después, recursos de la Ley 39/2015 (art. 14).
- **Unidad responsable de accesibilidad (art. 16):** cada entidad designa la suya (en la AGE, en cada Subsecretaría). Coordina quejas, reclamaciones, revisiones y formación.
- **Revisiones e informes (arts. 17–19):** revisiones en diseño, antes de publicar y periódicas, con informe; tres informes anuales de cada unidad antes del 1 de octubre (quejas, seguimiento, promoción y formación). Seguimiento por el ministerio competente (art. 18; el RD cita el Ministerio de Política Territorial y Función Pública, denominación de 2018).

---

## 4. Otras normas relacionadas

| Norma | Qué aporta | Estado (consulta 30-10-2026) |
|---|---|---|
| **RDL 1/2013, de 29 de noviembre** (Texto Refundido de la Ley General de derechos de las personas con discapacidad, LGDPD) | Principios de igualdad, no discriminación y accesibilidad universal; régimen sancionador supletorio de la Ley 11/2023 | Vigente; última actualización publicada el 03-10-2026 |
| **Ley 6/2022, de 31 de marzo** (BOE núm. 78, de 1-04-2022) | Modifica el RDL 1/2013 para incluir la **accesibilidad cognitiva** en la accesibilidad universal (art. 2.k), menciona expresamente la **lectura fácil** y los **pictogramas** como apoyos (art. 23.2.c) y añade el art. 29 bis | Vigente. **No cita la norma UNE 153101** |
| **UNE 153101:2018 EX** «Lectura Fácil. Pautas y recomendaciones para la elaboración de documentos» (UNE) | Norma técnica de referencia para redactar en lectura fácil. No es obligatoria por sí misma | Estado vigente según buscadores; ficha de UNE no accesible desde aquí **[pendiente de verificar]** |
| **Ley 34/2002 (LSSI), disposición adicional quinta** | Antes obligaba a webs de administraciones y de grandes empresas de «especial trascendencia económica» a un nivel de accesibilidad | **Derogada** por la disposición derogatoria única, letra c), de la Ley 11/2023 |
| **Ley 56/2007**, de Medidas de Impulso de la Sociedad de la Información, art. 2 | Obliga a las empresas de especial trascendencia económica a tener un medio de interlocución telemática. La exigencia de accesibilidad de sus webs vivía en la DA 5.ª de la LSSI (hoy derogada) | Art. 2 vigente (redacción por la DF 1.ª de la Ley 6/2020) |
| **Ley 11/2023, disposición adicional tercera** «Accesibilidad de las páginas web» | Los sitios web incluidos en el ámbito del Título I deben cumplir como mínimo el **nivel medio** de los criterios generalmente reconocidos, citando la **norma UNE 139803 «o la que la sustituya»**, sin perjuicio del RD 1112/2018 | Vigente. Qué norma sustituye hoy a UNE 139803: **[pendiente de verificar en UNE]**; en la práctica, la referencia técnica actual es UNE-EN 301549 |
| **Ley 10/2025, de 26 de diciembre**, por la que se regulan los servicios de atención a la clientela (BOE núm. 312, de 27-12-2025, ref. BOE-A-2025-26698) | Atención a la clientela **universalmente accesible** (art. 4.1); información de contacto en formatos accesibles con **lectura fácil y pictogramas** y, en webs, en la página de inicio (art. 5); mensajería instantánea y videollamada para personas con dificultades de comunicación oral o auditiva (art. 5.5); videointerpretación en lengua de signos (art. 10.5; art. 18.1); diseño con criterios de accesibilidad universal (art. 15). Respuesta a quejas en **15 días hábiles** como máximo (art. 17.1). Sanciones como infracción de consumo (art. 23) | En vigor desde 28-12-2025; **12 meses para adaptarse** (DT única). Ámbito: art. 2 (ver tabla de la sección 1). No cita WCAG ni la Ley 11/2023 |

---

## 5. Norma técnica: EN 301 549 y WCAG

### 5.1 Versión con presunción de conformidad hoy

- **EN 301 549 V3.2.1 (2021-03)** es la norma armonizada citada en el DOUE para la **Directiva 2016/2102** (sector público), por la Decisión de Ejecución (UE) 2021/1339. En España se adopta como **UNE-EN 301549:2022** (idéntica a la V3.2.1).
- Su **capítulo 9 (Web)** incorpora los criterios de **WCAG 2.1 nivel A y AA**.
- Capítulos relevantes además del 9:
  - **5** Requisitos genéricos
  - **7** TIC con capacidades de vídeo (subtítulos, audiodescripción)
  - **10** Documentos no web (PDF, ofimáticos)
  - **11** Software (incluidas apps móviles nativas)
  - **12** Documentación y servicios de apoyo (la documentación y la atención al cliente también deben ser accesibles)

### 5.2 Estado real de la EN 301 549 V4.1.1

- **Publicada por ETSI el 2-09-2026** (directorio oficial de ETSI: versión 04.01.01_60, de 2-09-2026; antes hubo borradores 04.01.00 de 12-11-2025 y 24-06-2026).
- Es la **primera versión pensada para la Directiva 2019/882**: añade un anexo que relaciona sus cláusulas con los requisitos del Acta Europea de Accesibilidad y pasa a **WCAG 2.2 nivel AA** (según la National Disability Authority de Irlanda, organismo público).
- **¿Es ya armonizada?** **No a fecha de 30-10-2026.** Publicar en ETSI no basta: la presunción de conformidad nace cuando su referencia se **publica en el DOUE**. La NDA indica que esa cita **se espera para el 16-12-2026**. Hasta entonces, la V3.2.1 sigue siendo la referencia citada (para la Directiva 2016/2102).
- Para la **Directiva 2019/882** no se ha podido confirmar en el DOUE que exista hoy **ninguna** norma armonizada citada **[pendiente de verificar en EUR-Lex]**. Mientras tanto, la referencia técnica habitual es EN 301 549 / WCAG.
- Adopción española como UNE-EN de la V4.1.1: **[pendiente de verificar]**.

### 5.3 Recomendación del proyecto: WCAG 2.2 AA

Apuntar ya a **WCAG 2.2 nivel AA** (Recomendación W3C; versión vigente de 12-12-2024): cubre WCAG 2.1 AA y anticipa la V4.1.1.

Criterios nuevos de WCAG 2.2 que exige el nivel AA:

| Criterio | Nivel | En una frase |
|---|---|---|
| 2.4.11 Foco no oculto (mínimo) | AA | El elemento con foco no queda totalmente tapado (p. ej. por cabeceras fijas o banners de cookies) |
| 2.5.7 Movimientos de arrastre | AA | Todo lo que se hace arrastrando tiene alternativa con un solo puntero |
| 2.5.8 Tamaño del objetivo (mínimo) | AA | Objetivos táctiles de al menos 24×24 px CSS o con espacio suficiente |
| 3.2.6 Ayuda consistente | A | Los mecanismos de ayuda aparecen en el mismo orden relativo |
| 3.3.7 Entrada redundante | A | No pedir otra vez datos ya dados en el mismo proceso |
| 3.3.8 Autenticación accesible (mínimo) | AA | Sin pruebas cognitivas (memorizar, transcribir, resolver) para iniciar sesión, salvo alternativas |

También nuevos, nivel AAA: 2.4.12, 2.4.13 y 3.3.9. **Eliminado:** 4.1.1 Procesamiento (*Parsing*).

---

## 6. Obligaciones documentales

| Documento | Sector público (RD 1112/2018) | Sector privado (Ley 11/2023) |
|---|---|---|
| **Declaración de accesibilidad** | Obligatoria, modelo Decisión 2018/1523, revisión anual (art. 15) | No se llama así, pero la **información de accesibilidad del servicio** (art. 13.2) cumple el mismo papel. La plantilla [declaracion-accesibilidad-plantilla.md](declaracion-accesibilidad-plantilla.md) sirve para ambas |
| **Canal de comunicaciones y quejas** | Obligatorio, electrónico + complementario; 20 días hábiles (AGE) | Las autoridades tramitan quejas (art. 24 y 29). Recomendable un canal propio. Si aplica la Ley 10/2025: canales accesibles y respuesta en 15 días hábiles |
| **Información del servicio** | — | En condiciones generales o documento equivalente, por escrito y oral, formatos accesibles y actualizada (art. 13) |
| **Evaluación de carga desproporcionada** | Inicial y documentada, revisión anual (art. 7) | Documentada, conservada 5 años, renovada como máximo cada 5 años en servicios, y comunicada a la autoridad (art. 16) |
| **Revisiones** | En diseño, antes de publicar y periódicas, con informe (art. 17); informes anuales (art. 19) | Procedimientos para mantener la conformidad ante cambios (art. 13.5); poder demostrarla (art. 13.6) |

---

## 7. Tabla obligación → requisito → cómo comprobarlo

| Obligación | Requisito técnico o documental | Cómo comprobarlo |
|---|---|---|
| Web/app accesible (Ley 11/2023 anexo I; RD 1112/2018 arts. 5–6) | EN 301 549 cap. 9 (WCAG 2.1 AA); recomendado WCAG 2.2 AA | Herramienta automática como primer filtro, más revisión manual con teclado, lector de pantalla (NVDA, VoiceOver), zoom 200–400 %, contraste y pruebas con usuarios |
| Documentos descargables accesibles | EN 301 549 cap. 10 | Comprobador de accesibilidad de PDF u ofimática + revisión manual de etiquetas, orden de lectura y textos alternativos |
| App nativa accesible | EN 301 549 cap. 11 | Escáner de accesibilidad del sistema operativo + TalkBack/VoiceOver + tamaño de texto del sistema |
| Vídeo accesible | EN 301 549 cap. 7 y WCAG 1.2.x | Subtítulos sincronizados, audiodescripción o alternativa, reproductor operable con teclado |
| Documentación y soporte accesibles | EN 301 549 cap. 12; Ley 10/2025 si aplica | Revisar ayudas, FAQ y canales de atención: formatos accesibles, alternativa a la voz (chat, videollamada) |
| Información de accesibilidad del servicio (Ley 11/2023 art. 13) | Texto en condiciones generales o página equivalente, accesible, actualizado, también oral | Comprobar que existe, está enlazado, es accesible y tiene fecha de revisión |
| Declaración de accesibilidad (RD 1112/2018 art. 15) | Modelo Decisión 2018/1523, enlace «Accesibilidad» en todas las páginas | Revisar enlace en pie de página, fecha de revisión < 12 meses y secciones obligatorias |
| Canal de quejas y reclamaciones | RD 1112/2018 arts. 10–13; Ley 10/2025 si aplica | Enviar una consulta de prueba y medir el plazo de respuesta; comprobar que el formulario es accesible |
| Carga desproporcionada | Ley 11/2023 art. 16 y anexo V; RD 1112/2018 art. 7 | Que exista un documento fechado con criterios, conservado y comunicado a la autoridad (sector privado) |
| Lectura fácil (opcional salvo Ley 10/2025 para la información de contacto) | UNE 153101 EX | Validación con personas con dificultades de comprensión (UNE 153102 EX la describe) |
| Formación del personal (Ley 11/2023 art. 15) | Plan de formación | Registro de formaciones |

---

## 8. Qué NO acredita el cumplimiento

### 8.1 Superposiciones o «overlays»

Los *overlays* son scripts de terceros (a menudo un botón o widget) que prometen hacer accesible una web automáticamente.

- **Overlay Fact Sheet** (overlayfactsheet.com, unas 1.048 firmas de profesionales y personas con discapacidad a 30-10-2026): «*No overlay product on the market can cause a website to become fully compliant with any existing accessibility standard*» (ningún overlay hace que una web cumpla por completo una norma de accesibilidad).
- **European Disability Forum (EDF) e IAAP**, declaración conjunta de **17-05-2023**: «*Overlays do not make the website accessible or compliant with European accessibility legislation*» y no son «*an acceptable alternative or a substitute for fixing the website itself*». Enlace: <https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/>.
- **FTC (Estados Unidos) — accessiBe:** el **22-04-2025** la Federal Trade Commission aprobó por 3 votos a 0 la orden definitiva que obliga a accessiBe a pagar **1.000.000 de dólares**. Le acusaba de afirmar falsamente que su plug-in accessWidget podía hacer cualquier web conforme a WCAG y de presentar reseñas como independientes sin revelar su relación con los autores. La propuesta de orden se anunció el 3-01-2025. La orden le prohíbe afirmar sin pruebas que su producto automatizado hace o mantiene una web conforme a WCAG.

### 8.2 Límites de los tests automáticos

- **W3C/WAI:** «*Tools cannot check all accessibility aspects automatically. Human judgement is required.*» y las herramientas «*can not determine accessibility, they can only assist*».
- **GOV.UK (Government Digital Service), 24-02-2017:** de 10 herramientas probadas sobre una página con 143 barreras conocidas, la mejor detectó el **41 %** de ellas y 42 no las detectó ninguna.
- **Deque (fabricante de axe-core):** con datos de sus propias auditorías, estima que sus pruebas automáticas identifican el **57,38 %** de las incidencias por volumen. Cuenta incidencias y no criterios, y es el fabricante quien lo mide.

### 8.3 Tests gratuitos en línea

Servicios como el **test gratuito de Eye-Able** (<https://eye-able.com/es/test-gratuito-de-accesibilidad-web>), que analiza una URL frente a pautas WCAG y entrega un informe, **sirven como primer filtro** para detectar errores frecuentes. Como cualquier análisis automático, **no acreditan el cumplimiento** de la Ley 11/2023 ni del RD 1112/2018: hace falta revisión manual, la información o declaración de accesibilidad y, en su caso, la evaluación documentada.

---

## 9. Fuentes

Todas consultadas el **30-10-2026**.

| Fuente | URL | Qué se ha verificado |
|---|---|---|
| Ley 11/2023 (BOE-A-2023-11022), texto consolidado | https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022 | Arts. 2, 3.3, 13–17, 24, 27–30; DA 2.ª y 3.ª; DT única; derogatoria c); DF 18.ª; anexo VII.16 |
| Directiva (UE) 2019/882, art. 32 | https://www.legislation.gov.uk/eudr/2019/882/article/32/adopted (copia del DOUE); oficial: https://eur-lex.europa.eu/eli/dir/2019/882/oj | Transitorio 2030 y hasta 20 años para terminales |
| RDL 1/2013 (BOE-A-2013-12632) | https://www.boe.es/buscar/act.php?id=BOE-A-2013-12632 | Arts. 81–87, 95, 96, 105; última actualización 03-10-2026 |
| Real Decreto 143/2026 (BOE-A-2026-4520) | https://www.boe.es/buscar/act.php?id=BOE-A-2026-4520 | Unidad técnica, adscripción, funciones |
| Real Decreto 1112/2018 (BOE-A-2018-12699) | https://www.boe.es/buscar/act.php?id=BOE-A-2018-12699 | Arts. 2–7, 10–20; STC 100/2019 |
| Decisión de Ejecución (UE) 2018/1523 (DOUE L 256, 12-10-2018, p. 103) | https://eur-lex.europa.eu/eli/dec_impl/2018/1523/oj (oficial); copia legible: https://legislation.gov.uk/eudn/2018/1523/annex/adopted | Estructura del modelo de declaración; art. 3 (método) |
| Ley 6/2022 (BOE-A-2022-5140) | https://www.boe.es/buscar/act.php?id=BOE-A-2022-5140 | Accesibilidad cognitiva, lectura fácil |
| Ley 34/2002 LSSI (BOE-A-2002-13758) | https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758 | DA 5.ª derogada por Ley 11/2023 |
| Ley 56/2007 (BOE-A-2007-22440) | https://www.boe.es/buscar/act.php?id=BOE-A-2007-22440 | Art. 2 vigente |
| Ley 10/2025 (BOE-A-2025-26698) | https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698 | Arts. 2, 4, 5, 15, 17, 23; DT única; entrada en vigor |
| Decisión de Ejecución (UE) 2021/1339 | https://eur-lex.europa.eu/eli/dec_impl/2021/1339/oj | EN 301 549 V3.2.1 armonizada (Directiva 2016/2102) |
| ETSI, directorio EN 301 549 | https://www.etsi.org/deliver/etsi_en/301500_301599/301549/ | Versiones y fechas (V4.1.1: 2-09-2026) |
| National Disability Authority (Irlanda) | https://nda.ie/news/en301549-published | V4.1.1: WCAG 2.2 AA, anexo EAA, cita en DOUE prevista 16-12-2026 |
| UNE, ficha UNE-EN 301549:2022 | https://www.en.une.org/encuentra-tu-norma/busca-tu-norma/norma?c=N0068037 | Identidad con V3.2.1 (vista solo en buscador: la ficha devolvió 403) |
| UNE, ficha UNE 153101:2018 EX | https://www.en.une.org/encuentra-tu-norma/busca-tu-norma/norma?c=N0060036 | Título (vista solo en buscador: la ficha devolvió 403) |
| W3C, WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Criterios nuevos, 4.1.1 eliminado, versión de 12-12-2024 |
| W3C/WAI, selección de herramientas | https://www.w3.org/WAI/test-evaluate/tools/selecting/ | Límites de las herramientas automáticas |
| GOV.UK Accessibility blog | https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/ | 41 % de barreras detectadas |
| Deque, informe de cobertura | https://www.deque.com/automated-accessibility-testing-coverage/ | 57,38 % por volumen de incidencias |
| FTC, nota de prensa | https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million | 22-04-2025, 1 M$, 3-0 |
| FTC, expediente accessiBe | https://www.ftc.gov/legal-library/browse/cases-proceedings/2223156-accessibe-inc | Expediente 222-3156 |
| EDF, declaración sobre overlays | https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/ | 17-05-2023, con IAAP |
| Overlay Fact Sheet | https://overlayfactsheet.com/en/ | Postura y número de firmas |
| Eye-Able, test gratuito | https://eye-able.com/es/test-gratuito-de-accesibilidad-web | Qué ofrece el test |

### Pendiente de verificar

- Autoridad de vigilancia designada por cada comunidad autónoma y régimen sancionador sectorial o autonómico que aplicará.
- Que exista hoy en el DOUE alguna norma armonizada para la Directiva 2019/882, y la fecha real de cita de la EN 301 549 V4.1.1 (prevista para el 16-12-2026).
- Adopción española (UNE-EN) de la V4.1.1; estado vigente de UNE 153101 EX y qué norma sustituye a UNE 139803 (las fichas de UNE devolvieron error 403).
- Orden ministerial vigente prevista en el art. 15.3 del RD 1112/2018 sobre la declaración.
