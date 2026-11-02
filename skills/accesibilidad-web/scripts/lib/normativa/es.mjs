// España, primer país completo sobre la base común de ue.mjs. Solo datos con su fuente.
//
// Para añadir otro país: copia este fichero, rellena lo mismo con fuentes de ese país
// (lo que no se pueda comprobar, «no consta a <fecha>») y regístralo en index.mjs.
// El motor (../aplicabilidad.mjs) no tiene nada de España ni de ningún tipo de negocio.

export const REVISADO_ES = '2026-11-02';
const C = REVISADO_ES;

const LEY11 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022';
const RD143 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-4520';
const RD1112 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-12699';
const LEY10 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698';
const RDL1 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-12632';
const LEY39 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565';
const UTAC = 'https://www.rpdiscapacidad.gob.es/discriminacion/utac-accesibilidad.htm';
const CONVENCION = 'https://www.convenciondiscapacidad.es/2026/08/29/el-defensor-del-pueblo-requiere-a-cinco-comunidades-autonomas-para-que-designen-su-autoridad-responsable-de-accesibilidad-a-productos-y-servicios/';
const CARRERAS = 'https://olgacarreras.blogspot.com/2025/07/la-utac-las-autoridades-de-vigilancia.html';

export const FUENTES_ES = {
  ley11: { titulo: 'Ley 11/2023 (texto consolidado del BOE)', url: LEY11, tipo: 'norma', consultado: C },
  rd143: { titulo: 'Real Decreto 143/2026, Unidad técnica', url: RD143, tipo: 'norma', consultado: C },
  rd1112: { titulo: 'Real Decreto 1112/2018', url: RD1112, tipo: 'norma', consultado: C },
  ley10: { titulo: 'Ley 10/2025, servicios de atención a la clientela', url: LEY10, tipo: 'norma', consultado: C },
  rdl1: { titulo: 'Real Decreto Legislativo 1/2013', url: RDL1, tipo: 'norma', consultado: C },
  ley39: { titulo: 'Ley 39/2015', url: LEY39, tipo: 'norma', consultado: C },
  utac: { titulo: 'UTAC, página oficial', url: UTAC, tipo: 'criterio-oficial', consultado: C },
  infracciones: {
    titulo: 'Ministerio, infracciones y sanciones en materia de discapacidad',
    url: 'https://www.dsca.gob.es/es/derechos-sociales/discapacidad/derechos-personas-discapacidad/infracciones-y-sanciones',
    tipo: 'criterio-oficial',
    consultado: C,
  },
  convencion: { titulo: 'Convención Discapacidad (CERMI), noticia de 29-08-2026', url: CONVENCION, tipo: 'tercero', consultado: C },
  carreras: { titulo: 'Olga Carreras, blog (nota de 30-08-2026)', url: CARRERAS, tipo: 'tercero', consultado: C },
};

/**
 * Autoridad de vigilancia por territorio (art. 27.3 Ley 11/2023).
 * estado: 'no-designada' (lo dice la propia administración, según un tercero),
 *         'requerida' (el Defensor del Pueblo le pidió información, según un tercero)
 *         'no-consta' (buscado en la web y sin resultado: no prueba que no exista).
 */
const NO_CONSTA = `No consta a ${C}. Búsqueda en la web y en el boletín autonómico vía buscador, sin abrir el boletín número a número: no prueba que no exista.`;
const REQUERIDA = `No consta designada a ${C}. El Defensor del Pueblo le pidió información tras una queja del CERMI, según la noticia de 29-08-2026; no consta respuesta. Resolución original del Defensor no localizada.`;

export const COMUNIDADES = {
  AN: { nombre: 'Andalucía', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  AR: { nombre: 'Aragón', estado: 'requerida', detalle: REQUERIDA, fuente: CONVENCION },
  AS: {
    nombre: 'Principado de Asturias',
    estado: 'no-designada',
    detalle: 'No designada a 29-08-2026. La consejería dijo al Defensor del Pueblo que no se ha designado porque considera que la administración autonómica no tiene competencia; el Defensor anunció ampliar actuaciones. Fuente: tercero, sin resolución original.',
    fuente: CONVENCION,
  },
  IB: { nombre: 'Illes Balears', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  CN: { nombre: 'Canarias', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  CB: { nombre: 'Cantabria', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  CM: { nombre: 'Castilla-La Mancha', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  CL: { nombre: 'Castilla y León', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  CT: { nombre: 'Cataluña', estado: 'requerida', detalle: REQUERIDA, fuente: CONVENCION },
  VC: {
    nombre: 'Comunitat Valenciana',
    estado: 'no-designada',
    detalle: 'No designada a 29-08-2026. La Generalitat dijo al Defensor del Pueblo que está en análisis entre departamentos y que baraja integrarla en las estructuras de vigilancia de mercado. Búsqueda en el DOGV vía buscador a 2-11-2026 sin norma de designación. Fuente: tercero, sin resolución original.',
    fuente: CONVENCION,
  },
  EX: { nombre: 'Extremadura', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  GA: { nombre: 'Galicia', estado: 'requerida', detalle: REQUERIDA, fuente: CONVENCION },
  MD: { nombre: 'Comunidad de Madrid', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  MC: { nombre: 'Región de Murcia', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  NC: { nombre: 'Comunidad Foral de Navarra', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  PV: { nombre: 'País Vasco', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  RI: { nombre: 'La Rioja', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  CE: { nombre: 'Ceuta', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
  ML: { nombre: 'Melilla', estado: 'no-consta', detalle: NO_CONSTA, fuente: null },
};

export const AUTORIDAD_ES = {
  unidad: {
    nombre: 'Unidad técnica de apoyo y coordinación (UTAC), en la Dirección General de Derechos de las Personas con Discapacidad',
    correo: 'utac@dsca.gob.es',
    url: UTAC,
    papel: 'Punto de contacto para ciudadanía y empresas y receptora de denuncias (art. 3.g RD 143/2026). Autoridad de vigilancia donde no se haya designado ninguna (art. 3.h). Las denuncias van por ahora por la página de infracciones del ministerio; el procedimiento en sede electrónica está anunciado sin fecha.',
    fuente: RD143,
  },
  lista: `Nadie publica un listado oficial por comunidad: ni la página de la UTAC ni la Ley. Una entrevista de 24-06-2025 citada por un blog decía que ocho comunidades habían designado autoridad, sin nombrarlas; no se ha podido confirmar. Pedir la lista a utac@dsca.gob.es es la vía más directa.`,
  domicilioOUsuario: {
    veredicto: 'dudoso',
    texto: 'Ninguna norma dice si manda el domicilio del prestador o el del usuario. El art. 27.3 solo dice «en el ámbito de sus competencias». El art. 13.7 obliga a informar a las autoridades de los Estados donde se presta el servicio, sin hablar de comunidades. El ministerio, para las infracciones del RDL 1/2013, dice que si la conducta supera el ámbito de una comunidad compete a la Administración General del Estado; no consta que eso se haya aplicado a la Ley 11/2023.',
    recomendacion: 'Razonamiento propio: una web se ve en toda España, así que nombra a la autoridad de la comunidad del domicilio si existe y añade siempre la UTAC. Si un usuario denuncia, puede hacerlo también en su comunidad y serán las administraciones quienes lo resuelvan.',
  },
  datosContrapuestos: 'Un despacho (Fieldfisher, visto solo en el extracto del buscador) dice que la autoridad nacional sería la Dirección General de Consumo. No coincide con el art. 27 de la Ley ni con el RD 143/2026, que prevalecen.',
};

export const SECTORES_ES = {
  suministros: { nombre: 'suministro de electricidad, agua o gas a consumidores (web y apps)', articulo: 'art. 2.2.g Ley 11/2023', soloEspana: true },
  'agencia-viajes': { nombre: 'agencia de viajes o turoperador (web y apps)', articulo: 'art. 2.2.h Ley 11/2023', soloEspana: true },
  'red-social': { nombre: 'red social', articulo: 'art. 2.2.i Ley 11/2023', soloEspana: true, nota: 'La ley no define «red social» en el anexo VII: en un foro o comunidad pequeña es dudoso.' },
};

/** Sectores de la Ley 10/2025 art. 2.1: se aplica sea cual sea el tamaño. */
export const SECTORES_BASICOS_LEY10 = ['suministros', 'transporte', 'postal', 'comunicaciones', 'banca'];

export const OBLIGACIONES_ES = [
  { articulo: 'art. 13.1 y anexo I', url: LEY11, texto: 'Diseñar y prestar el servicio conforme a los requisitos de accesibilidad.' },
  { articulo: 'anexo I, sec. IV, g)', url: LEY11, soloComercio: true, texto: 'Comercio electrónico: dar la información de accesibilidad de lo que se vende cuando el responsable la proporcione, y hacer accesibles identificación, seguridad y pago.' },
  { articulo: 'DA 3.ª', url: LEY11, texto: 'Sitios web: como mínimo el nivel medio de los criterios generalmente reconocidos; la ley cita UNE 139803 «o aquella que la sustituya». Qué norma la sustituye no consta a 2-11-2026.' },
  { articulo: 'art. 13.2', url: LEY11, texto: 'Incluir en las condiciones generales o documento equivalente la información que evalúe cómo cumple el servicio los requisitos: los requisitos aplicables, descripción general, explicaciones de funcionamiento y cómo la prestación y su seguimiento garantizan la conformidad.' },
  { articulo: 'art. 13.4', url: LEY11, texto: 'Poner esa información a disposición del público por escrito y de forma oral, accesible, y mantenerla actualizada mientras el servicio funcione.' },
  { articulo: 'art. 13.5 y 13.6', url: LEY11, texto: 'Tener procedimientos para seguir conforme ante cambios y poder demostrarlo.' },
  { articulo: 'art. 13.7', url: LEY11, texto: 'Si no es conforme: adoptar medidas correctoras e informar inmediatamente a las autoridades de los Estados donde se presta el servicio, con detalle del incumplimiento y de las medidas.' },
  { articulo: 'art. 13.8', url: LEY11, texto: 'Dar información y cooperar ante solicitud motivada de la autoridad.' },
  { articulo: 'art. 14', url: LEY11, texto: 'Los productos usados para prestar el servicio y lo subcontratado también deben cumplir.' },
  { articulo: 'art. 15', url: LEY11, texto: 'Formación adecuada y continua del personal.' },
  { articulo: 'art. 16 y anexo V', url: LEY11, texto: 'Solo si se invoca: evaluación documentada de modificación sustancial o carga desproporcionada, conservada 5 años, renovada al cambiar el servicio, si lo pide la autoridad y cada 5 años, y comunicada a la autoridad. No cabe alegar carga si se recibe financiación para mejorar la accesibilidad.' },
];

export const PLAZOS_ES = [
  { texto: 'Título I en vigor desde el 28-06-2025 (DF 18.ª).', url: LEY11 },
  { texto: 'Hasta el 28-06-2030 se puede seguir prestando el servicio con productos que ya se usaban legalmente (DT única, 1). No es un periodo de gracia para la web: es para productos y contratos.', url: LEY11 },
  { texto: 'Contratos de servicios celebrados antes del 28-06-2025: sin cambios hasta su expiración, 5 años como máximo (DT única, 1).', url: LEY11 },
  { texto: 'Terminales de autoservicio: hasta el fin de su vida útil, 10 años como máximo (DT única, 2).', url: LEY11 },
];

export const EXCLUSIONES_ES = {
  articulo: 'art. 2.4 Ley 11/2023',
  url: LEY11,
  texto: 'Quedan fuera aunque el servicio esté dentro: multimedia pregrabado y ofimática publicados antes del 28-06-2025; mapas si la información esencial es accesible; contenido de terceros no financiado, desarrollado ni controlado; archivos que no se editan desde esa fecha.',
};

export const SANCIONES_ES = {
  url: RDL1,
  resumen: [
    'La Ley 11/2023 no fija cuantías. Remite a la legislación sectorial y, en lo no previsto, al título III del RDL 1/2013 (art. 30).',
    'RDL 1/2013: de 301 € a 1.000.000 €. Leves hasta 30.000 €, graves hasta 90.000 € (art. 83). Son graves los incumplimientos de las exigencias de accesibilidad (art. 81.3.b) y leves los de obligaciones meramente formales (art. 81.2), «sin perjuicio» de la legislación autonómica.',
    'Las autoridades de vigilancia aplican el régimen (art. 27.3.c). Qué régimen aplicará cada comunidad no consta a 2-11-2026.',
    'También pueden reclamar ante la administración y los tribunales consumidores, asociaciones y entidades del sector de la discapacidad (art. 29.2). No consta a 2-11-2026 ninguna sanción ni sentencia española sobre la Ley 11/2023.',
  ],
};

export const NORMA_TECNICA_ES = [
  'La Ley 11/2023 no cita EN 301 549. Exige los requisitos del anexo I y da presunción a la norma armonizada citada en el DOUE (art. 17). La DA 3.ª cita UNE 139803 «o aquella que la sustituya».',
  'RD 1112/2018: remite a las normas armonizadas citadas en el DOUE (art. 6), hoy V3.2.1, adoptada en España como UNE-EN 301549:2022.',
];

export const RD1112_ES = {
  url: RD1112,
  sujetos: 'Administraciones del Estado, autonómicas y locales, sector público institucional, asociaciones de entidades públicas y Administración de Justicia (art. 2).',
  institucional: 'Sector público institucional: organismos públicos y entidades de derecho público; entidades de derecho privado vinculadas o dependientes de las administraciones; universidades públicas (art. 2.2 Ley 39/2015, al que remite el art. 2.1.d).',
  financiacion: 'DA 1.ª: las administraciones «exigirán» los criterios de los arts. 5 y 6 a las webs y apps que reciban financiación pública para su diseño o mantenimiento; a las vinculadas a servicios públicos de empresas que los gestionen por concesión o contrato; y a las de centros educativos privados sostenidos con fondos públicos.',
  organos: 'DA 2.ª: órganos constitucionales y parlamentos autonómicos, con su normativa propia.',
  aviso: 'La STC 100/2019 declaró no básicos o inconstitucionales varios preceptos: comunidades y entidades locales pueden tener plazos y procedimientos propios.',
  fechaDecision: 'Decisión de Ejecución (UE) 2018/1523: modelo de declaración, obligatorio para este régimen.',
};

export const LEY10_ES = {
  url: LEY10,
  plazo: 'En vigor el 28-12-2025. Doce meses para adaptarse (DT única, 1): hasta el 28-12-2026.',
  obligaciones: [
    'Atención a la clientela universalmente accesible (art. 4.1) e información de contacto en formatos accesibles (art. 5).',
    'Resolver consultas, quejas e incidencias en 15 días hábiles como máximo, salvo normativa sectorial (art. 17.1). Cobros indebidos: 5 días (art. 17.3).',
    'Incumplir es infracción de consumo (art. 23).',
  ],
  aclaracion: 'Ámbito distinto al de la Ley 11/2023: no exime la microempresa, sino el tamaño de su art. 2.2. Cuenta el grupo del art. 42 del Código de Comercio y basta uno de los tres umbrales.',
};

export const IGUALDAD_ES = {
  articulo: 'art. 29 RDL 1/2013',
  url: RDL1,
  texto: 'Quien suministre bienes o servicios al público, en el sector público o privado, debe respetar la igualdad de oportunidades de las personas con discapacidad, sea cual sea su tamaño. No fija requisitos técnicos de web y deja las condiciones básicas a su desarrollo reglamentario.',
};

/**
 * Textos de la declaración según el veredicto. {ENTIDAD} y {NORMA} los rellena declaracion.mjs.
 * Ninguno afirma conformidad: eso depende de la evaluación, no de la ley que se aplique.
 */
export const TEXTOS_DECLARACION = {
  'sector-publico': {
    sector: 'publico',
    introduccion: '{ENTIDAD} se ha comprometido a hacer accesible su sitio web, de conformidad con el Real Decreto 1112/2018, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público.',
    parcial: 'Este sitio web es parcialmente conforme con {NORMA} debido a la falta de conformidad que se indica a continuación.',
    noConforme: 'Este sitio web no es conforme con {NORMA}. La falta de conformidad se indica a continuación.',
    exigeInformacionServicio: false,
    procedimiento: 'publico',
    avisos: ['Modelo obligatorio: Decisión de Ejecución (UE) 2018/1523. Enlace «Accesibilidad» en todas las páginas (art. 15 RD 1112/2018). Revisa también tu normativa autonómica o local (STC 100/2019).'],
  },
  'financiacion-publica': {
    sector: 'privado',
    introduccion: '{ENTIDAD} se ha comprometido a hacer accesible su sitio web aplicando los criterios de accesibilidad de los artículos 5 y 6 del Real Decreto 1112/2018, que la disposición adicional primera prevé para sitios web con financiación pública o vinculados a la gestión de servicios públicos.',
    parcial: 'Este sitio web cumple parcialmente {NORMA} debido a la falta de conformidad que se indica a continuación.',
    noConforme: 'Este sitio web no cumple {NORMA}. La falta de conformidad se indica a continuación.',
    exigeInformacionServicio: false,
    procedimiento: 'propio',
    avisos: ['Comprueba qué exige la subvención o el contrato: la DA 1.ª impone a la administración exigir los criterios, no detalla la declaración.'],
  },
  obligado: {
    sector: 'privado',
    introduccion: '{ENTIDAD} presta un servicio incluido en el Título I de la Ley 11/2023, de 8 de mayo, que traspone la Directiva (UE) 2019/882, y publica esta información de accesibilidad conforme a su artículo 13.',
    parcial: 'Este sitio web es parcialmente conforme con {NORMA} debido a la falta de conformidad que se indica a continuación. Las medidas correctoras y sus fechas se indican en cada punto.',
    noConforme: 'Este sitio web no es conforme con {NORMA}. La falta de conformidad y las medidas correctoras se indican a continuación.',
    exigeInformacionServicio: true,
    procedimiento: 'autoridad',
    avisos: [
      'Art. 13.2 y 13.4: este texto debe estar en las condiciones generales o documento equivalente, accesible, por escrito y de forma oral.',
      'Publicar «parcialmente conforme» no te protege: reconoce públicamente que el servicio no es conforme. El art. 13.7 exige medidas correctoras y avisar de inmediato a la autoridad. El término viene del modelo del sector público; la Ley 11/2023 no lo usa. En Francia, un juez rechazó en cautelares que un 71 % bastara por ser una obligación de resultado (TJ Caen, 4-06-2026, norma francesa, no vincula en España). Valora decidir el aviso del art. 13.7 con un abogado.',
    ],
  },
  prudente: {
    sector: 'privado',
    introduccion: '{ENTIDAD} toma como referencia los requisitos de accesibilidad del Título I de la Ley 11/2023, de 8 de mayo, y publica esta información de forma voluntaria, sin prejuzgar si esa ley es exigible a este servicio.',
    parcial: 'Este sitio web cumple parcialmente {NORMA}, que usamos como referencia, debido a la falta de conformidad que se indica a continuación.',
    noConforme: 'Este sitio web no cumple {NORMA}, que usamos como referencia. La falta de conformidad se indica a continuación.',
    exigeInformacionServicio: true,
    procedimiento: 'autoridad',
    avisos: [
      'Veredicto dudoso: el texto no afirma que la ley te obligue ni que no. Decide con un abogado si quieres afirmar una de las dos cosas.',
      'Si la ley resultara aplicable, el art. 13.7 exigiría avisar a la autoridad de lo que aquí se declara como no conforme. Trátalo con asesoramiento antes de publicar.',
      'Incorpora o enlaza este texto en las condiciones generales: no cuesta y cubre el art. 13.2 si resulta aplicable.',
    ],
  },
  'voluntaria-micro': {
    sector: 'privado',
    introduccion: '{ENTIDAD} presta sus servicios como microempresa, que el artículo 3.3 de la Ley 11/2023 exime de los requisitos de accesibilidad. Aun así, se ha comprometido a hacer accesible su sitio web y publica esta declaración de forma voluntaria.',
    parcial: 'Este sitio web cumple parcialmente {NORMA}, que usamos como referencia voluntaria, debido a los problemas que se indican a continuación.',
    noConforme: 'Este sitio web no cumple {NORMA}, que usamos como referencia voluntaria. Los problemas se indican a continuación.',
    exigeInformacionServicio: false,
    procedimiento: 'propio',
    avisos: [
      'Ninguna norma te obliga a publicar esto ni a decir que eres microempresa: si no quieres revelar tu tamaño, usa el texto genérico y borra esa frase. Revisa el dato cada ejercicio.',
      'Evita «de conformidad con la Ley 11/2023»: sería afirmar que te obliga.',
    ],
  },
  voluntaria: {
    sector: 'privado',
    introduccion: '{ENTIDAD} se ha comprometido a hacer accesible su sitio web y publica esta declaración de forma voluntaria.',
    parcial: 'Este sitio web cumple parcialmente {NORMA}, que usamos como referencia voluntaria, debido a los problemas que se indican a continuación.',
    noConforme: 'Este sitio web no cumple {NORMA}, que usamos como referencia voluntaria. Los problemas se indican a continuación.',
    exigeInformacionServicio: false,
    procedimiento: 'propio',
    avisos: ['Evita «de conformidad con la Ley 11/2023»: sería afirmar que te obliga. Si cambias el servicio y empiezas a vender o reservar, repite este análisis.'],
  },
};
