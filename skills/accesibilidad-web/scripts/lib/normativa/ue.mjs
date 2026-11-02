// Base común de la Unión Europea: Directiva (UE) 2019/882 y lo que la rodea.
// Solo datos, con su fuente. La lógica está en ../aplicabilidad.mjs.
//
// Cómo actualizar: abre cada URL, corrige el dato y cambia REVISADO y `consultado`.
// Nada de memoria: lo que no se pueda comprobar queda como «no consta a <fecha>».
//
// Tipos de fuente, para no mezclar lo que es ley con lo que es opinión:
//   norma                         texto de una norma
//   criterio-oficial-ue           Comisión Europea
//   criterio-oficial-otro-estado  autoridad u organismo público de otro Estado miembro
//   resolucion-otro-estado        resolución judicial de otro Estado, citada de segunda mano
//   tercero                       despacho, cámara de comercio, prensa, blog
//   propio                        razonamiento de este proyecto: no es fuente

export const REVISADO_UE = '2026-11-02';
const C = REVISADO_UE;

export const FUENTES_UE = {
  directiva: {
    titulo: 'Directiva (UE) 2019/882 (DOUE L 151, 7-06-2019)',
    url: 'https://www.boe.es/doue/2019/151/L00070-00115.pdf',
    tipo: 'norma',
    consultado: C,
  },
  recomendacion: {
    titulo: 'Recomendación 2003/361/CE, definición de microempresa y pyme',
    url: 'https://www.boe.es/doue/2003/124/L00036-00041.pdf',
    tipo: 'norma',
    consultado: C,
    nota: 'Es una recomendación, no una norma vinculante. La Directiva la invoca en su considerando 53.',
  },
  comision: {
    titulo: 'Comisión Europea, página de la Directiva',
    url: 'https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en',
    tipo: 'criterio-oficial-ue',
    consultado: C,
    nota: 'Lista «e-commerce» sin definirlo. No enlaza guía ni preguntas frecuentes sobre el concepto.',
  },
  acm: {
    titulo: 'ACM (autoridad de Países Bajos), comercio electrónico',
    url: 'https://www.acm.nl/en/accessibility/accessibility-e-commerce-services-and-electronic-communications-services',
    tipo: 'criterio-oficial-otro-estado',
    consultado: C,
  },
  businessNl: {
    titulo: 'business.gov.nl (Gobierno de Países Bajos)',
    url: 'https://business.gov.nl/amendments/european-accessibility-act-products-services/',
    tipo: 'criterio-oficial-otro-estado',
    consultado: C,
  },
  bmas: {
    titulo: 'BMAS (ministerio alemán), Leitlinien BFSG',
    url: 'https://www.bmas.de/SharedDocs/Downloads/DE/Teilhabe/leitlinien-barrierefreiheit.pdf?__blob=publicationFile&v=3',
    tipo: 'criterio-oficial-otro-estado',
    consultado: C,
  },
  bundesfachstelle: {
    titulo: 'Bundesfachstelle Barrierefreiheit (Alemania), FAQ BFSG, estado julio de 2025',
    url: 'https://www.bundesfachstelle-barrierefreiheit.de/DE/Fachwissen/Produkte-und-Dienstleistungen/Barrierefreiheitsstaerkungsgesetz/FAQ/faq_node.html',
    tipo: 'criterio-oficial-otro-estado',
    consultado: C,
  },
  wko: {
    titulo: 'WKO (cámara de comercio de Austria), FAQ BaFG, estado 1-02-2026',
    url: 'https://www.wko.at/internetrecht/barrierefreiheitsgesetz-im-e-commerce-faq',
    tipo: 'tercero',
    consultado: C,
  },
  piltz: {
    titulo: 'Piltz Legal (despacho alemán), 28-08-2024',
    url: 'https://www.piltz.legal/news/barrierefreiheitsstaerkungsgesetz-fuer-welche-apps-und-websites-gilt-das-bfsg-teil-2',
    tipo: 'tercero',
    consultado: C,
  },
  freshfields: {
    titulo: 'Freshfields (despacho), 19-11-2025',
    url: 'https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/inclusivity-by-design-the-european-accessibility-act-as-a-new-imperative-for-e-102lu76',
    tipo: 'tercero',
    consultado: C,
  },
  caen: {
    titulo: 'TJ de Caen (Francia), référé de 4-06-2026, RG 25/00691, contado por Handicap.fr',
    url: 'https://informations.handicap.fr/a-accessibilite-web-carrefour-condamne-par-la-justice-39309.php',
    tipo: 'resolucion-otro-estado',
    consultado: C,
    nota: 'Medida cautelar en primera instancia y con la norma francesa. Texto íntegro no consultado: está tras un muro de pago.',
  },
  lille: {
    titulo: 'TJ de Lille (Francia), mayo de 2026, contado por las demandantes',
    url: 'https://droitpluriel.fr/decision-du-tribunal-judiciaire-de-lille-le-6-mai-2026apidv-et-droit-pluriel-c-auchan-e-commerce-une-interpretation-gravement-erronee-du-droit-de-laccessibilite-numerique/',
    tipo: 'resolucion-otro-estado',
    consultado: C,
    nota: 'Comunicado de la parte que perdió, que ha recurrido. Las fuentes dudan entre el 5 y el 6 de mayo.',
  },
  nda: {
    titulo: 'National Disability Authority (Irlanda), EN 301 549 V4.1.1',
    url: 'https://nda.ie/news/en301549-published',
    tipo: 'criterio-oficial-otro-estado',
    consultado: C,
  },
  pivotal: {
    titulo: 'Pivotal Accessibility, 09-2026, cita el calendario de ETSI',
    url: 'https://www.pivotalaccessibility.com/2026/09/en-301-549-v4-1-1-is-published-what-it-means-for-digital-accessibility/',
    tipo: 'tercero',
    consultado: C,
  },
  sitebrunch: {
    titulo: 'sitebrunch, versiones de EN 301 549, cita a AccessibleEU',
    url: 'https://www.sitebrunch.com/en/facts/en-301-549',
    tipo: 'tercero',
    consultado: C,
  },
};

/**
 * Condiciones de la definición de comercio electrónico (art. 3.30 y considerando 42
 * de la Directiva) con los argumentos que se usan cuando el caso no está zanjado.
 * Son hechos que el motor combina: aquí no hay tipos de negocio.
 */
export const ARGUMENTOS_UE = {
  definicion: {
    texto: '«Servicios prestados a distancia, a través de sitios web y servicios para dispositivos móviles, por medios electrónicos y a petición individual de un consumidor, al objeto de celebrar un contrato con el consumidor» (art. 3.30).',
    tipo: 'norma',
    fuente: 'directiva',
  },
  ventaLinea: {
    texto: 'El considerando 43 dice que las obligaciones se aplican «a la venta en línea de cualquier producto o servicio»; el 46 habla de que «la venta en línea» sea accesible sea público o privado el vendedor.',
    tipo: 'norma',
    fuente: 'directiva',
  },
  contratoEnLinea: {
    texto: 'La autoridad neerlandesa lo define como el servicio «where consumers can take out a contract online», incluso si la oferta ocupa una parte pequeña de la web y aunque las ofertas sean de otros vendedores.',
    tipo: 'criterio-oficial-otro-estado',
    fuente: 'acm',
  },
  datos: {
    texto: 'La misma autoridad incluye los servicios sin pago en dinero que se pagan con datos personales.',
    tipo: 'criterio-oficial-otro-estado',
    fuente: 'acm',
  },
  citas: {
    texto: 'El ministerio alemán incluye la reserva de citas en línea junto a la venta: «der Verkauf […] als auch die Buchung der Termine».',
    tipo: 'criterio-oficial-otro-estado',
    fuente: 'bmas',
  },
  presentacion: {
    texto: 'El organismo federal alemán dice que una web solo informativa o que solo anuncia productos «sollte» quedar fuera, entre otras cosas porque faltaría la «petición individual».',
    tipo: 'criterio-oficial-otro-estado',
    fuente: 'bundesfachstelle',
  },
  infoAustria: {
    texto: 'La cámara de comercio austriaca: las páginas informativas sin tienda ni posibilidad de pedido o reserva quedan fuera.',
    tipo: 'tercero',
    fuente: 'wko',
  },
  contratoConTerceros: {
    texto: 'Un despacho alemán sostiene que da igual quién firme el contrato: cita expresamente marketplaces, comparadores y servicios de intermediación, «basta» con que la plataforma quiera provocar contratos con terceros. Lo excluye si no permite ni pasos precontractuales ni contratar.',
    tipo: 'tercero',
    fuente: 'piltz',
  },
  sinCompraDirecta: {
    texto: 'Otro despacho considera «arguably» fuera un perfil con un simple enlace a la tienda o una app de información sin compra, porque no permiten contratar directamente ni se prestan a petición individual.',
    tipo: 'tercero',
    fuente: 'freshfields',
  },
  literal: {
    texto: 'La definición dice «al objeto de celebrar un contrato», no «celebrar un contrato en la web». Una web que existe y se remunera para que el usuario llegue a contratar encaja en el fin, aunque el contrato se firme en otro sitio.',
    tipo: 'propio',
  },
  restrictivo: {
    texto: 'Quien no vende ni es parte del contrato no controla la identificación ni el pago, que es lo que regula el anexo I para este servicio. Y una norma que acaba en sanción no debería extenderse más allá de su texto.',
    tipo: 'propio',
  },
  finalidad: {
    texto: 'La finalidad de la norma es que la persona con discapacidad pueda completar el proceso de contratar. Si la parte de buscar y elegir no es accesible, ese proceso se corta antes de llegar a la tienda.',
    tipo: 'propio',
  },
  actividadEconomica: {
    texto: 'La Ley 11/2023 define «servicio» como actividad económica prestada normalmente a cambio de remuneración (anexo VII, 26); la Directiva remite a la Directiva 2006/123/CE (art. 3).',
    tipo: 'norma',
    fuente: 'directiva',
  },
  noComercial: {
    texto: 'Un despacho alemán entiende que las ofertas no comerciales quedan fuera aunque se firme algún contrato al usarlas.',
    tipo: 'tercero',
    fuente: 'piltz',
  },
};

/** Sectores propios de la Directiva, comunes a todos los Estados miembros (art. 2.2). */
export const SECTORES_UE = {
  comunicaciones: { nombre: 'comunicaciones electrónicas', articulo: 'art. 2.2.a Directiva' },
  audiovisual: { nombre: 'acceso a servicios de comunicación audiovisual', articulo: 'art. 2.2.b Directiva' },
  transporte: { nombre: 'transporte de viajeros aéreo, en autobús, ferroviario o por vías navegables', articulo: 'art. 2.2.c Directiva' },
  banca: { nombre: 'servicios bancarios para consumidores', articulo: 'art. 2.2.d Directiva' },
  libros: { nombre: 'libros electrónicos', articulo: 'art. 2.2.e Directiva' },
};

export const UMBRAL_MICRO = { personas: 10, volumen: 2_000_000, balance: 2_000_000 };

/** Reglas de cálculo de la Recomendación 2003/361/CE, para explicar el resultado. */
export const CALCULO_TAMANO = {
  efectivos: 'Se cuentan unidades de trabajo anual: asalariados, propietarios que dirigen la empresa y socios con actividad regular y ventajas financieras. Tiempo parcial y temporada, en fracciones. Sin aprendices (art. 5).',
  asociadas: 'Empresa asociada: 25 % o más del capital o los votos, sin llegar a control. Se suma en proporción a la participación (arts. 3.2 y 6.2).',
  vinculadas: 'Empresa vinculada: mayoría de votos, derecho a nombrar a la mayoría del órgano de administración o influencia dominante. Se suma el 100 % (arts. 3.3 y 6.2). También por medio de personas físicas que actúen de común acuerdo, si operan en el mismo mercado o en uno contiguo.',
  publico: 'Con el 25 % o más del capital o los votos en manos de organismos públicos, no se considera pyme, salvo los inversores que lista el art. 3.2 (art. 3.4).',
  ejercicios: 'Pasar el umbral solo cambia la categoría si ocurre dos ejercicios seguidos (art. 4.2). Empresas nuevas: estimación fiable (art. 4.3).',
  aviso: 'La Ley 11/2023 da la cifra (anexo VII, 16) pero no estas reglas. Se aplican por el considerando 53 de la Directiva: es una inferencia razonable, no un texto expreso de la ley española.',
};

export const NORMA_TECNICA_UE = {
  fecha: REVISADO_UE,
  resumen: [
    'Ni la Directiva ni la Ley 11/2023 exigen una versión de EN 301 549. Fijan requisitos y dan presunción de conformidad a quien cumpla una norma armonizada citada en el DOUE (art. 15 Directiva).',
    'EN 301 549 V3.2.1 es la citada en el DOUE (Decisión 2021/1339), pero para la Directiva 2016/2102, de sector público. Es WCAG 2.1 AA.',
    'EN 301 549 V4.1.1, publicada por ETSI el 2-09-2026, es WCAG 2.2 AA y tiene anexo para la Directiva 2019/882. No consta citada en el DOUE a 2-11-2026.',
    'Para la Directiva 2019/882 no consta hoy ninguna norma con presunción de conformidad. Usar EN 301 549 sirve de referencia técnica, pero no da esa presunción.',
    'Fecha prevista de la cita, fuentes contrapuestas: 16-12-2026 según la NDA irlandesa; 30-11-2026 en el calendario de ETSI según un tercero; AccessibleEU no anuncia fecha según otro tercero. No se ha podido abrir EUR-Lex desde este entorno.',
    'Recomendación del proyecto: apuntar a WCAG 2.2 AA y decir en la declaración con qué versión se evaluó.',
  ],
  fuentes: ['directiva', 'nda', 'pivotal', 'sitebrunch'],
};
