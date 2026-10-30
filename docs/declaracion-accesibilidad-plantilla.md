# Plantilla: declaración de accesibilidad e información de accesibilidad del servicio

> **Cómo usar esta plantilla**
>
> - Basada en el **modelo de declaración de accesibilidad** del anexo de la **Decisión de Ejecución (UE) 2018/1523** de la Comisión, de 11 de octubre de 2018 (DOUE L 256, de 12-10-2018, p. 103), obligatorio para el sector público según el **Real Decreto 1112/2018** (art. 15).
> - Adaptada para servir también como **información de accesibilidad del servicio** del **art. 13 de la Ley 11/2023** (sector privado). Esa información debe estar en las **condiciones generales o en un documento equivalente**, en formatos accesibles, **por escrito y de forma oral**, y **mantenerse actualizada**.
> - Sustituye cada `{{MARCADOR}}`. Borra las notas entre `<!-- -->` y los bloques que no apliquen (marcados **[SECTOR PÚBLICO]** o **[SECTOR PRIVADO]**).
> - Es una plantilla de un proyecto de código abierto; **no es asesoramiento jurídico**. Fuentes y fechas en [normativa-es.md](normativa-es.md).
> - La declaración debe ser **accesible** y, cuando proceda, legible por máquina (Decisión 2018/1523, art. 2).

---

## Dónde publicarla

- **Web:** en una página propia, enlazada desde **todas las páginas** (normalmente el pie) con el texto «Accesibilidad» o equivalente (RD 1112/2018, art. 15). Se puede usar una URL fija, p. ej. `{{DOMINIO}}/accesibilidad`.
- **App móvil:** en la web del desarrollador junto al enlace de descarga, o con la información de la ficha de descarga en la tienda; también puede estar dentro de la app.
- **[SECTOR PRIVADO]** Además, incorpora o enlaza este texto en las **condiciones generales** del servicio (Ley 11/2023, art. 13.2) y ofrece una vía **oral** para obtenerlo (p. ej. teléfono de atención), según el art. 13.4.
- **Revisión:** al menos **una vez al año** o tras cada revisión de accesibilidad (RD 1112/2018, art. 15); en el sector privado, siempre que cambie el servicio (Ley 11/2023, art. 13.4–13.5).

---

<!-- ======== INICIO DEL TEXTO PUBLICABLE ======== -->

# Declaración de accesibilidad

{{NOMBRE_ENTIDAD}} se ha comprometido a hacer accesible {{su sitio web | su aplicación | sus sitios web y aplicaciones}}, de conformidad con
<!-- Elige uno o ambos -->
- **[SECTOR PÚBLICO]** el Real Decreto 1112/2018, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público.
- **[SECTOR PRIVADO]** el Título I de la Ley 11/2023, de 8 de mayo, que traspone la Directiva (UE) 2019/882 sobre los requisitos de accesibilidad de los productos y servicios.

La presente declaración se aplica a: {{URL_O_NOMBRE_APP_Y_VERSIÓN}}.

## Situación de cumplimiento

<!-- Elige UNA de las tres opciones. «Plenamente conforme» solo si se cumplen TODOS los requisitos, sin excepciones. -->

- **Plenamente conforme:** {{este sitio web | esta aplicación}} es plenamente conforme con {{NORMA_DE_REFERENCIA}}.
- **Parcialmente conforme:** {{este sitio web | esta aplicación}} es parcialmente conforme con {{NORMA_DE_REFERENCIA}} debido a {{las excepciones | la falta de conformidad | las excepciones y la falta de conformidad}} que se indican a continuación.
- **No conforme:** {{este sitio web | esta aplicación}} no es conforme con {{NORMA_DE_REFERENCIA}}. Las excepciones y la falta de conformidad se indican a continuación.

<!-- NORMA_DE_REFERENCIA recomendada: «la norma UNE-EN 301549:2022 (EN 301 549 V3.2.1), que incorpora las WCAG 2.1 nivel AA». Si además se cumple WCAG 2.2 AA, indícalo. Actualiza a la EN 301 549 V4.1.1 cuando se cite en el DOUE. -->

## Contenido no accesible

<!-- Borra esta sección si es plenamente conforme. Describe los problemas en lenguaje no técnico y, si quieres, añade el criterio WCAG entre paréntesis. -->

El contenido que se recoge a continuación no es accesible por lo siguiente:

**a) Falta de conformidad con la normativa aplicable**

- {{DESCRIPCIÓN_PROBLEMA_1}} ({{CRITERIO_WCAG_1}}). {{PLAZO_O_PLAN_DE_CORRECCIÓN_1}}
- {{DESCRIPCIÓN_PROBLEMA_2}} ({{CRITERIO_WCAG_2}}). {{PLAZO_O_PLAN_DE_CORRECCIÓN_2}}

**b) Carga desproporcionada**

<!-- Solo si existe una evaluación documentada (RD 1112/2018 art. 7; Ley 11/2023 art. 16 y anexo V). En el sector privado hay que comunicarla a la autoridad de vigilancia (art. 16.7). -->

- {{CONTENIDO_SECCIÓN_O_FUNCIONALIDAD}}: se invoca temporalmente la excepción por carga desproporcionada. Evaluación de {{FECHA_EVALUACIÓN}}, próxima revisión {{FECHA_REVISIÓN}}.

**c) El contenido no entra dentro del ámbito de la legislación aplicable**

- {{CONTENIDO_EXCLUIDO}} — {{MOTIVO}}
  <!-- Ejemplos: documentos ofimáticos o vídeos pregrabados publicados antes de {{20-09-2018 (RD 1112/2018) | 28-06-2025 (Ley 11/2023)}}; contenido de terceros no financiado, desarrollado ni controlado por nosotros; mapas cuya información esencial se ofrece de forma accesible; contenido archivado. -->

**Alternativas accesibles:** {{ALTERNATIVAS}} <!-- p. ej. «Puede pedir este documento en formato accesible en {{CONTACTO}}». -->

## Preparación de la presente declaración

- Fecha de preparación: {{FECHA_PREPARACIÓN}}
- Método empleado: {{una autoevaluación realizada por {{NOMBRE_ENTIDAD}} | una evaluación realizada por un tercero: {{NOMBRE_TERCERO}} | una certificación de {{ENTIDAD_CERTIFICADORA}}}} <!-- Decisión 2018/1523, art. 3 -->
- Herramientas y técnicas utilizadas: {{HERRAMIENTAS}} <!-- p. ej. análisis automático como primer filtro + revisión manual con teclado y lector de pantalla. Un test automático por sí solo no basta. -->
- Última revisión de la declaración: {{FECHA_ÚLTIMA_REVISIÓN}} <!-- Máximo 12 meses de antigüedad. -->
- Informe de evaluación: {{ENLACE_INFORME}} <!-- Opcional; recomendable si es «plenamente conforme». -->

## Información de accesibilidad del servicio

<!-- [SECTOR PRIVADO] Obligatoria según la Ley 11/2023, art. 13.2. En el sector público es opcional pero útil. -->

- **Descripción general del servicio:** {{DESCRIPCIÓN_SERVICIO}}
- **Cómo funciona, explicado de forma comprensible:** {{EXPLICACIÓN_FUNCIONAMIENTO}}
- **Requisitos de accesibilidad aplicados:** anexo I de la Ley 11/2023; como referencia técnica, {{NORMA_DE_REFERENCIA}}.
- **Cómo cumple el servicio esos requisitos:**
  - Navegación con teclado: {{DETALLE}}
  - Compatibilidad con lectores de pantalla y otros productos de apoyo: {{DETALLE}}
  - Textos alternativos, subtítulos y contraste: {{DETALLE}}
  - Proceso de compra o contratación (formularios, pago, autenticación): {{DETALLE}}
  - Atención al cliente y documentación accesibles: {{DETALLE}}
- **Cómo garantizamos que sigue cumpliendo:** {{PROCESO_REVISIÓN}} <!-- revisiones en cada cambio importante, formación del personal (art. 15), proveedores y subcontratas (art. 14). -->
- **Otros formatos:** puede pedir esta información en {{FORMATOS_ALTERNATIVOS}} y de forma oral en {{TELÉFONO_O_CANAL_ORAL}}.

## Observaciones y datos de contacto

Puede comunicarnos cualquier problema de accesibilidad, o pedir información sobre contenido no accesible, por estas vías:

- Formulario: {{URL_FORMULARIO_ACCESIBLE}}
- Correo electrónico: {{CORREO_ACCESIBILIDAD}}
- Teléfono: {{TELÉFONO}} <!-- [SECTOR PÚBLICO] además del canal electrónico, al menos un canal complementario (RD 1112/2018 art. 11). -->
- Responsable: {{UNIDAD_O_PERSONA_RESPONSABLE}} <!-- [SECTOR PÚBLICO] la unidad responsable de accesibilidad (art. 16). -->

**Plazo de respuesta:** {{PLAZO_RESPUESTA}}
<!--
[SECTOR PÚBLICO — AGE] 20 días hábiles (RD 1112/2018, art. 12.3). Comunidades autónomas y entidades locales: comprobar su normativa propia (STC 100/2019).
[SECTOR PRIVADO] Si la empresa está en el ámbito de la Ley 10/2025 de servicios de atención a la clientela: máximo 15 días hábiles (art. 17.1). Si no, fija y cumple un plazo razonable.
-->

## Procedimiento de aplicación

<!-- Elige el bloque que corresponda. -->

**[SECTOR PÚBLICO]**
Si, una vez realizada una solicitud de información accesible o una queja, esta hubiera sido desestimada, no estuviera de acuerdo con la decisión adoptada o la respuesta no cumpliera los requisitos, puede presentar una **reclamación** ante {{UNIDAD_RESPONSABLE_ACCESIBILIDAD}} en {{URL_O_SEDE_RECLAMACIONES}}. Plazo de resolución: {{dos meses (RD 1112/2018, art. 13.4) | plazo de la normativa autonómica o local}}. Contra su resolución caben los recursos de la Ley 39/2015.

**[SECTOR PRIVADO]**
Si no está satisfecho con nuestra respuesta, puede dirigirse a la **autoridad de vigilancia del mercado en materia de accesibilidad** de {{COMUNIDAD_AUTÓNOMA}}: {{NOMBRE_Y_CONTACTO_AUTORIDAD}} (Ley 11/2023, arts. 24, 27 y 29). También puede acudir a los servicios de consumo de su comunidad o al sistema arbitral correspondiente.
<!-- Si la comunidad no ha designado autoridad, actúa la Unidad técnica de apoyo y coordinación (Dirección General de Derechos de las Personas con Discapacidad, RD 143/2026). Comprueba el dato antes de publicar. -->

## Contenido opcional

- **Compromiso:** {{COMPROMISO_Y_CALENDARIO_DE_MEJORAS}} <!-- p. ej. «Aspiramos a WCAG 2.2 AA; corregiremos los puntos del apartado a) antes de {{FECHA}}». -->
- **Aprobación formal:** esta declaración ha sido aprobada por {{ÓRGANO_O_CARGO}} el {{FECHA_APROBACIÓN}}.
- **Fecha de publicación del sitio o la app:** {{FECHA_PUBLICACIÓN}}
- **Última revisión sustancial del contenido:** {{FECHA_ÚLTIMA_REVISIÓN_SUSTANCIAL}}
- **Asistencia adicional:** atención telefónica o presencial para personas con discapacidad: {{DETALLE_ASISTENCIA}}
- **Resumen en lectura fácil:** {{ENLACE_O_TEXTO_LECTURA_FÁCIL}} <!-- Recomendado; pautas de UNE 153101 EX y validación con personas usuarias. No forma parte del modelo europeo; es un añadido de este proyecto. -->

<!-- ======== FIN DEL TEXTO PUBLICABLE ======== -->

---

## Lista de comprobación antes de publicar

- [ ] Se ha elegido una única situación de cumplimiento y es coherente con la evaluación.
- [ ] Todos los `{{MARCADORES}}` están sustituidos y no quedan comentarios.
- [ ] La página es accesible (encabezados, enlaces descriptivos, contraste) y está enlazada desde todas las páginas.
- [ ] El canal de contacto funciona y es accesible (se ha enviado un mensaje de prueba).
- [ ] [SECTOR PRIVADO] El texto está en las condiciones generales o enlazado desde ellas y hay vía oral.
- [ ] [SECTOR PRIVADO] Si se invoca carga desproporcionada: evaluación documentada, conservada 5 años y comunicada a la autoridad.
- [ ] Hay fecha de revisión y un recordatorio para revisarla antes de 12 meses.
