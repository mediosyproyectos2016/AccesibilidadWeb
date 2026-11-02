// ¿Qué norma de accesibilidad se aplica a esta web? Motor sin red y sin tipos de
// negocio: combina hechos (qué ofrece, a quién, si se contrata, quién es el titular y
// su tamaño) con los datos de lib/normativa/. Cualquier web llega a un veredicto.
//
// Tres veredictos: «aplica», «no aplica» y «dudoso». «Dudoso» significa que ni la norma
// ni un criterio oficial español zanjan el caso, o que falta un dato: se dan los dos
// argumentos y una recomendación prudente. Nunca es asesoramiento jurídico.
import { paquetePara } from './normativa/index.mjs';

export const VIGENCIA_DIAS = 180;
export const ESQUEMA = 1;

export const PREGUNTAS = [
  { id: 'pais', pregunta: '¿En qué país se ofrece el servicio?', valores: ['ES', 'código de otro país'] },
  { id: 'titular', pregunta: '¿Quién es el titular de la web?', valores: ['privado', 'publico', 'dependiente'], ayuda: 'publico: administración u organismo público. dependiente: entidad de derecho privado vinculada o dependiente de una administración, como una empresa o fundación pública.' },
  { id: 'financiacionPublica', pregunta: '¿La web recibe financiación pública para su diseño o mantenimiento?', valores: ['si', 'no'] },
  { id: 'gestionaServicioPublico', pregunta: '¿La web está vinculada a un servicio público que gestionas por concesión o contrato?', valores: ['si', 'no'] },
  { id: 'centroSostenido', pregunta: '¿Es un centro educativo o de formación privado sostenido con fondos públicos?', valores: ['si', 'no'] },
  { id: 'actividadEconomica', pregunta: '¿El titular ejerce una actividad económica de forma regular con esta web, aunque no busque lucro?', valores: ['si', 'no'], ayuda: 'Un autónomo o una asociación que vende o cobra de forma regular cuenta como actividad económica.' },
  { id: 'sector', pregunta: '¿La web o app presta alguno de estos servicios?', valores: ['comunicaciones', 'audiovisual', 'transporte', 'transporte-urbano', 'banca', 'libros', 'suministros', 'agencia-viajes', 'red-social', 'postal', 'ninguno'], lista: true, ayuda: 'Puedes dar varios separados por comas. transporte-urbano incluye suburbano y regional. postal solo cuenta para la Ley 10/2025.' },
  { id: 'destinatarios', pregunta: '¿A quién se dirige: consumidores, solo empresas o ambos?', valores: ['consumidores', 'empresas', 'ambos'], ayuda: 'Consumidor: persona física que actúa con fines ajenos a su actividad profesional.' },
  { id: 'soloEmpresasVerificado', pregunta: 'Si dices «solo empresas»: ¿impides de verdad que contrate un consumidor?', valores: ['si', 'no'], ayuda: 'Por ejemplo, comprobando el NIF de empresa antes de contratar.' },
  { id: 'contrato', pregunta: '¿Cómo llega el usuario a contratar?', valores: ['en-la-web', 'pasos-previos', 'redirige', 'no'], ayuda: 'en-la-web: compra, reserva, cita, suscripción o alta dentro de la web o app, aunque el contrato sea con otro. pasos-previos: pide presupuesto o solicita algo y el contrato se cierra fuera. redirige: envía a otra web donde se contrata. no: solo informa.' },
  { id: 'contraparte', pregunta: '¿Con quién se firma el contrato?', valores: ['titular', 'terceros', 'ambos'] },
  { id: 'remunerado', pregunta: '¿El titular cobra si el contrato llega a hacerse (comisión, afiliación, cuota por venta)?', valores: ['si', 'no'] },
  { id: 'interaccion', pregunta: '¿El usuario obtiene un resultado propio de su petición (buscar, filtrar, comparar, configurar, pedir presupuesto)?', valores: ['si', 'no'] },
  { id: 'contraprestacion', pregunta: '¿Qué paga el usuario?', valores: ['dinero', 'datos', 'gratis'] },
  { id: 'personas', pregunta: '¿Cuántas personas trabajan? (unidades de trabajo anual)', numero: true },
  { id: 'volumen', pregunta: 'Volumen de negocios anual, en euros', numero: true },
  { id: 'balance', pregunta: 'Balance general anual, en euros', numero: true },
  { id: 'grupo', pregunta: '¿Tiene empresas asociadas (25 % o más) o vinculadas (control)?', valores: ['si', 'no'] },
  { id: 'datosAgregados', pregunta: 'Si las tiene: ¿las cifras anteriores ya las suman?', valores: ['si', 'no'] },
  { id: 'controlPublico', pregunta: '¿Organismos públicos controlan el 25 % o más del capital o los votos?', valores: ['si', 'no'] },
  { id: 'productos', pregunta: '¿Fabrica, importa o distribuye productos del art. 2.1 (ordenadores, móviles, terminales de pago, lectores electrónicos)?', valores: ['si', 'no'] },
  { id: 'comunidad', pregunta: '¿En qué comunidad autónoma tiene su domicilio?', valores: ['AN', 'AR', 'AS', 'IB', 'CN', 'CB', 'CM', 'CL', 'CT', 'VC', 'EX', 'GA', 'MD', 'MC', 'NC', 'PV', 'RI', 'CE', 'ML'] },
];

const POR_ID = Object.fromEntries(PREGUNTAS.map((p) => [p.id, p]));

/** Convierte y valida. Lanza si un valor no existe, para no evaluar con una errata. */
export function normalizar(entrada = {}) {
  const r = {};
  for (const [k, v] of Object.entries(entrada)) {
    if (v === undefined || v === null || v === '') continue;
    const p = POR_ID[k];
    if (!p) throw new Error(`Respuesta desconocida: ${k}. Lista con --preguntas.`);
    if (p.numero) {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) throw new Error(`${k} debe ser un número: ${v}.`);
      r[k] = n;
    } else if (p.lista) {
      const lista = Array.isArray(v) ? v : String(v).split(',').map((s) => s.trim()).filter(Boolean);
      for (const x of lista) if (!p.valores.includes(x)) throw new Error(`${k}: valor no válido «${x}». Admite: ${p.valores.join(', ')}.`);
      r[k] = lista;
    } else if (k === 'pais') {
      r[k] = String(v).toUpperCase();
    } else {
      const s = k === 'comunidad' ? String(v).toUpperCase() : String(v);
      if (!p.valores.includes(s)) throw new Error(`${k}: valor no válido «${v}». Admite: ${p.valores.join(', ')}.`);
      r[k] = s;
    }
  }
  return r;
}

function falta(faltan, id) {
  if (!faltan.some((f) => f.id === id)) faltan.push({ id, pregunta: POR_ID[id].pregunta });
}

const arg = (A, ...claves) => claves.map((c) => A[c]);

// ——— Tamaño ———

export function evaluarTamano(r, paquete, faltan = []) {
  const u = paquete.umbralMicro;
  const notas = [];
  if (r.grupo === undefined) notas.push('No se sabe si hay empresas asociadas o vinculadas: si las hay, sus datos suman.');
  if (r.grupo === 'si' && r.datosAgregados !== 'si') {
    falta(faltan, 'datosAgregados');
    return { categoria: 'desconocido', grande: null, notas: [...notas, 'Hay empresas asociadas o vinculadas y las cifras no las suman: no se puede calcular.'] };
  }
  const grande = r.personas >= 250 || r.volumen > 50_000_000 || r.balance > 43_000_000
    ? true
    : (r.personas !== undefined && r.volumen !== undefined && r.balance !== undefined ? false : null);

  if (r.controlPublico === 'si') {
    return { categoria: 'no-micro', grande, provisional: true, notas: [...notas, 'Con el 25 % o más en manos públicas no se considera pyme (Recomendación 2003/361, art. 3.4). La ley española no lo dice: es una inferencia por el considerando 53 de la Directiva.'] };
  }
  if (r.personas !== undefined && r.personas >= u.personas) return { categoria: 'no-micro', grande, notas };
  const volOk = r.volumen !== undefined && r.volumen <= u.volumen;
  const balOk = r.balance !== undefined && r.balance <= u.balance;
  const ambosMal = r.volumen !== undefined && r.balance !== undefined && !volOk && !balOk;
  if (ambosMal) return { categoria: 'no-micro', grande, notas };
  if (r.personas === undefined) falta(faltan, 'personas');
  if (r.volumen === undefined && r.balance === undefined) { falta(faltan, 'volumen'); falta(faltan, 'balance'); }
  if (r.personas === undefined || !(volOk || balOk)) {
    if (r.personas !== undefined && !volOk && !balOk) {
      if (r.volumen === undefined) falta(faltan, 'volumen');
      if (r.balance === undefined) falta(faltan, 'balance');
    }
    return { categoria: 'desconocido', grande, notas };
  }
  return { categoria: 'micro', grande: false, provisional: r.grupo === undefined, notas };
}

// ——— Clasificación del servicio, sin mirar el tamaño ———

function evaluarServicio(r, P, faltan) {
  const A = P.argumentos;
  const sectores = (r.sector ?? []).filter((s) => s !== 'ninguno');
  const base = (texto, tipo = 'norma', url = P.urlNorma) => ({ texto, tipo, url });

  // A quién se dirige.
  if (r.destinatarios === undefined) falta(faltan, 'destinatarios');
  if (r.destinatarios === 'empresas') {
    const verificado = r.soloEmpresasVerificado === 'si';
    if (r.soloEmpresasVerificado === 'no') {
      return {
        veredicto: 'dudoso', certeza: 'media', como: 'comercio',
        resumen: 'Dice dirigirse solo a empresas, pero un consumidor puede contratar: la ley mira a quién se presta el servicio, no a quién se dirige la publicidad.',
        base: [base(`El Título I se aplica a los servicios «que se presten a los consumidores» (${P.articuloConsumidor}).`)],
        aFavor: [{ texto: 'Si un consumidor puede contratar de hecho, se le presta el servicio a él.', tipo: 'propio' }],
        enContra: [{ texto: 'El organismo alemán entiende que los servicios exclusivamente B2B no estarían afectados.', tipo: 'criterio-oficial-otro-estado', fuente: 'bundesfachstelle' }],
        recomendacion: 'Comprueba la condición de empresa antes de contratar y se resuelve el problema. Si no, trata esa parte como dirigida a consumidores.',
      };
    }
    if (!verificado) falta(faltan, 'soloEmpresasVerificado');
    return {
      veredicto: 'no aplica', certeza: verificado ? 'alta' : 'media', como: 'b2b',
      resumen: 'Servicio solo para empresas: el Título I se refiere a los servicios prestados a consumidores.',
      base: [base(`Se aplica a los servicios «que se presten a los consumidores»; consumidor es la persona física que actúa con fines ajenos a su actividad (${P.articuloConsumidor}).`)],
      recomendacion: 'Puede afectarte por contrato si tu cliente está obligado, o en compra pública (art. 25). Una cuenta de autónomo actuando como tal es profesional, no consumidor.',
    };
  }

  // Sector con mención propia: no hace falta analizar el contrato.
  const propios = sectores.filter((s) => P.sectores[s]);
  if (propios.length) {
    const nombres = propios.map((s) => P.sectores[s]);
    const notas = nombres.map((n) => n.nota).filter(Boolean);
    return {
      veredicto: 'aplica', certeza: notas.length ? 'media' : 'alta', como: 'sector',
      resumen: `Servicio citado expresamente: ${nombres.map((n) => n.nombre).join('; ')}.`,
      base: nombres.map((n) => base(`${n.articulo}: ${n.nombre}.`)),
      recomendacion: notas.join(' ') || 'Comprueba qué elementos del servicio cita el artículo y su definición en el anexo.',
    };
  }

  const urbano = sectores.includes('transporte-urbano');
  if (urbano && r.contrato !== 'en-la-web') {
    if (r.contrato === undefined) falta(faltan, 'contrato');
    return {
      veredicto: 'no aplica', certeza: 'media', como: 'transporte-urbano',
      resumen: 'Transporte urbano, suburbano o regional: de ese artículo solo se aplican los terminales interactivos, no la web. Si vende billetes en línea, sería comercio electrónico.',
      base: [base('art. 2.2.c Ley 11/2023: solo el inciso de terminales para transporte urbano, suburbano y regional. Considerando 35 de la Directiva: la web queda cubierta al vender billetes en línea.')],
      recomendacion: 'Si es un operador público, mira el RD 1112/2018.',
    };
  }

  // Comercio electrónico: se decide por los hechos.
  const definicion = base(`Definición: «servicios prestados a distancia, a través de sitios web y servicios para dispositivos móviles, por medios electrónicos y a petición individual de un consumidor, al objeto de celebrar un contrato con el consumidor» (${P.articuloComercio}).`);

  if (r.contrato === undefined) {
    falta(faltan, 'contrato');
    return {
      veredicto: 'dudoso', certeza: 'baja', como: 'comercio',
      resumen: 'Falta saber si en la web se puede contratar: es lo que decide el caso.',
      base: [definicion], aFavor: [], enContra: [],
      recomendacion: 'Responde a la pregunta del contrato y repite.',
    };
  }

  if (r.actividadEconomica === 'no' && r.contrato !== 'no') {
    return {
      veredicto: 'dudoso', certeza: 'baja', como: 'comercio',
      resumen: 'Sin actividad económica no está claro que haya «servicio», aunque se pueda contratar o donar.',
      base: [definicion, base('«Servicio»: actividad económica por cuenta propia, prestada normalmente a cambio de remuneración (anexo VII, 26 Ley 11/2023).')],
      aFavor: [
        { texto: 'Una asociación que ejerce una actividad económica regular se considera empresa (Recomendación 2003/361, art. 1). Si vende o cobra de forma regular, entra.', tipo: 'norma', fuente: 'recomendacion' },
        { texto: 'Hay un contrato con un consumidor en la web, que es lo que busca la definición.', tipo: 'propio' },
      ],
      enContra: [
        ...arg(A, 'actividadEconomica', 'noComercial'),
        { texto: 'Una donación no es la compra de un producto o servicio de la que hablan los considerandos 43 y 46.', tipo: 'propio' },
      ],
      recomendacion: 'Si cobras de forma regular, trátalo como comercio electrónico. Si solo informas o recibes donaciones sueltas, lo razonable es que no aplique, pero cumplir WCAG 2.2 AA te cubre igual.',
    };
  }

  if (r.contrato === 'en-la-web') {
    if (r.contraprestacion === 'gratis') {
      return {
        veredicto: 'dudoso', certeza: 'baja', como: 'comercio',
        resumen: 'Se contrata en la web, pero sin pago ni datos a cambio: dudoso que sea servicio remunerado.',
        base: [definicion],
        aFavor: [{ texto: 'La definición no exige precio; el servicio se presta «normalmente» a cambio de remuneración, no siempre.', tipo: 'propio' }],
        enContra: arg(A, 'actividadEconomica', 'noComercial'),
        recomendacion: 'Si el usuario paga con datos o el servicio se financia con él, trátalo como comercio electrónico.',
      };
    }
    const conTerceros = r.contraparte === 'terceros';
    if (r.contraparte === undefined) falta(faltan, 'contraparte');
    const conDatos = r.contraprestacion === 'datos';
    return {
      veredicto: 'aplica',
      certeza: conTerceros || conDatos ? 'media' : 'alta',
      como: 'comercio',
      resumen: conTerceros
        ? 'Se contrata dentro de la web aunque el contrato sea con terceros: es comercio electrónico.'
        : 'Se contrata dentro de la web: es comercio electrónico, venda lo que venda.',
      base: [
        definicion,
        base('Considerando 43: se aplica «a la venta en línea de cualquier producto o servicio».', 'norma', P.fuentes.directiva.url),
        ...(conTerceros ? [base('Autoridad de Países Bajos: también si las ofertas son de otros vendedores en una plataforma. En España no consta criterio oficial a 2-11-2026.', 'criterio-oficial-otro-estado', P.fuentes.acm.url)] : []),
        ...(conDatos ? [base('Autoridad de Países Bajos: incluye servicios pagados con datos personales. En España no consta criterio oficial a 2-11-2026.', 'criterio-oficial-otro-estado', P.fuentes.acm.url)] : []),
        ...(!conTerceros && !conDatos ? [base('Ministerio alemán: incluye la reserva de citas en línea.', 'criterio-oficial-otro-estado', P.fuentes.bmas.url)] : []),
      ],
      recomendacion: 'Aplica a toda la ruta que lleva al contrato. Un despacho alemán sostiene que pueden quedar fuera las partes ajenas (noticias de un club con tienda); el ministerio alemán dice en su ejemplo «toda la web». Revisa la web entera.',
    };
  }

  if (r.contrato === 'pasos-previos') {
    return {
      veredicto: 'dudoso', certeza: 'baja', como: 'comercio',
      resumen: 'Se piden presupuestos o se solicitan cosas en la web, pero el contrato se cierra fuera.',
      base: [definicion],
      aFavor: [
        A.literal,
        { texto: 'Un despacho alemán solo excluye las webs donde no quepan ni pasos precontractuales ni contratar.', tipo: 'tercero', fuente: 'piltz' },
        { texto: 'La cámara de comercio austriaca recoge una postura «muy estricta» según la cual basta un formulario de contacto, porque por él podría llegar una petición de compra.', tipo: 'tercero', fuente: 'wko' },
      ],
      enContra: [
        A.contratoEnLinea, A.presentacion, A.sinCompraDirecta,
        { texto: 'La misma cámara recoge la postura contraria: un simple formulario no basta, porque la petición se tramita después a mano y no lleva a un contrato inmediato.', tipo: 'tercero', fuente: 'wko' },
      ],
      recomendacion: 'Prudencia: trátalo como si aplicara en el proceso de solicitud, que es lo que el usuario usa para contratar. Si el formulario es solo de contacto general, el riesgo baja mucho.',
    };
  }

  if (r.contrato === 'redirige') {
    if (r.remunerado === undefined) falta(faltan, 'remunerado');
    if (r.interaccion === undefined) falta(faltan, 'interaccion');
    const cobra = r.remunerado === 'si';
    const peticion = r.interaccion === 'si';
    if (!cobra && !peticion) {
      return {
        veredicto: 'no aplica', certeza: 'media', como: 'informativa',
        resumen: 'Enlaza a otra web donde se contrata, sin cobrar por ello ni atender peticiones individuales: no presta el servicio de la definición.',
        base: [definicion],
        recomendacion: 'Si el enlace lleva a una tienda tuya, esa tienda sí es comercio electrónico: analízala.',
      };
    }
    const fuerte = cobra && peticion;
    return {
      veredicto: 'dudoso',
      certeza: fuerte ? 'media' : 'baja',
      como: 'comercio',
      resumen: fuerte
        ? 'El usuario pide algo, la web le da un resultado y lo envía a contratar a otro sitio cobrando si contrata. Ni la norma ni un criterio oficial lo resuelven: tiene los elementos de la definición salvo que el contrato no se firma en la web.'
        : 'Envía a contratar a otro sitio, pero falta parte de lo que acerca el caso a la definición: cobrar por el contrato o atender una petición individual.',
      base: [
        definicion,
        base('Ninguna guía de la Comisión ni criterio oficial español o de otro Estado de los consultados trata esta situación a 2-11-2026.', 'propio', null),
      ],
      aFavor: [
        A.literal,
        ...(cobra ? [{ texto: 'Cobrar solo si hay contrato muestra que la web existe para que se celebre.', tipo: 'propio' }] : []),
        A.contratoConTerceros,
        ...(peticion ? [{ texto: 'Hay «petición individual»: el resultado depende de lo que pide el usuario, que es lo que falta en una web de mera presentación según el organismo alemán.', tipo: 'propio' }] : []),
        A.finalidad,
      ],
      enContra: [A.contratoEnLinea, A.ventaLinea, A.sinCompraDirecta, A.infoAustria, A.restrictivo],
      recomendacion: fuerte
        ? 'Mejor respuesta razonada, no certeza: trátalo como si aplicara. Si aplica y no cumples, te expones a una sanción; si no aplica y cumples, lo que has hecho es una web accesible. Publica el texto prudente, sin afirmar que la ley te obliga ni que no.'
        : 'Mejor respuesta razonada, no certeza: es más probable que no aplique. Hacer accesible la web sigue siendo lo recomendable, y no afirmes que la ley te obliga.',
      tendencia: fuerte ? 'aplica' : 'no aplica',
    };
  }

  // contrato === 'no'
  return {
    veredicto: 'no aplica',
    certeza: r.interaccion === 'si' ? 'media' : 'alta',
    como: 'informativa',
    resumen: 'En la web no se contrata ni se llega a contratar: no es comercio electrónico. La publicidad no cambia eso.',
    base: [
      definicion,
      base('Organismo federal alemán: una web solo informativa o que solo anuncia no debería entrar, entre otras cosas porque falta la petición individual. En España no consta criterio oficial a 2-11-2026.', 'criterio-oficial-otro-estado', P.fuentes.bundesfachstelle.url),
    ],
    recomendacion: r.interaccion === 'si'
      ? 'Tiene buscador o herramienta, pero sin contrato no hay comercio electrónico. Si añades venta, reserva o suscripción de pago, repite el análisis.'
      : 'Si añades venta, reserva o suscripción de pago, repite el análisis. Un formulario de contacto general es zona gris: hay una postura muy estricta que lo incluye y otra que no.',
  };
}

// ——— Sector público ———

function evaluarSectorPublico(r, P, faltan) {
  const S = P.sectorPublico;
  if (!S) return { veredicto: 'desconocido', certeza: 'baja', resumen: 'Sin datos nacionales de sector público para este país. Directiva (UE) 2016/2102.' };
  if (r.titular === undefined) falta(faltan, 'titular');
  if (r.titular === 'publico') {
    return { veredicto: 'aplica', certeza: 'alta', via: 'titular', resumen: 'Administración u organismo público: RD 1112/2018.', detalle: [S.sujetos, S.aviso], url: S.url };
  }
  if (r.titular === 'dependiente') {
    return {
      veredicto: 'aplica', certeza: 'media', via: 'titular',
      resumen: 'Entidad de derecho privado vinculada o dependiente de una administración: entra en el sector público institucional, RD 1112/2018.',
      detalle: [S.institucional, 'Si dudas de que lo sea, la clave es el control de la administración: mayoría de votos, de órgano de gobierno o de financiación. El RD no fija porcentaje.', S.aviso],
      url: S.url,
    };
  }
  const via = ['financiacionPublica', 'gestionaServicioPublico', 'centroSostenido'].filter((k) => r[k] === 'si');
  if (via.length) {
    return {
      veredicto: 'aplica', certeza: 'media', via: 'financiacion',
      resumen: 'Web privada con financiación pública o vinculada a un servicio público: los criterios técnicos de los arts. 5 y 6 del RD 1112/2018 se exigen por la DA 1.ª. No todo el régimen del sector público.',
      detalle: [S.financiacion], url: S.url,
    };
  }
  return { veredicto: 'no aplica', certeza: r.titular === 'privado' ? 'alta' : 'media', via: null, resumen: 'Titular privado sin financiación pública de la web: no entra en el RD 1112/2018.', url: S.url };
}

// ——— Ley 10/2025 ———

function evaluarAtencionClientela(r, P, tam) {
  const L = P.ley10;
  if (!L) return null;
  const basico = (r.sector ?? []).filter((s) => P.sectoresBasicos.includes(s));
  const base = { url: L.url, plazo: L.plazo, obligaciones: L.obligaciones, aclaracion: L.aclaracion };
  if (r.titular === 'publico') {
    return { ...base, veredicto: 'dudoso', certeza: 'baja', resumen: 'Aplica a la Administración General del Estado y sus organismos y empresas dependientes (art. 2.7). Comprueba si eres una de ellas.' };
  }
  if (basico.length) {
    return { ...base, veredicto: 'aplica', certeza: 'alta', resumen: `Servicio básico de interés general (art. 2.1): se aplica sea cual sea el tamaño. Banca y comunicaciones, con preferencia de su normativa sectorial.` };
  }
  if (r.destinatarios === 'empresas') return { ...base, veredicto: 'no aplica', certeza: 'alta', resumen: 'No se dirige principalmente a consumidores (art. 2.2).' };
  if (tam.grande === false) return { ...base, veredicto: 'no aplica', certeza: tam.provisional ? 'media' : 'alta', resumen: 'No llega a ninguno de los umbrales del art. 2.2: 250 personas, 50 M€ de volumen o 43 M€ de balance, con su grupo.' };
  if (tam.grande === null) return { ...base, veredicto: 'dudoso', certeza: 'baja', resumen: 'Depende del tamaño: basta uno de los umbrales del art. 2.2 (250 personas, 50 M€ de volumen o 43 M€ de balance), con su grupo.' };
  if (r.contraprestacion === 'gratis' || r.contrato === 'redirige' || r.contrato === 'no') {
    return { ...base, veredicto: 'dudoso', certeza: 'media', resumen: 'Es grande, pero el usuario no contrata con ella a cambio de un precio: el art. 2.8 limita la ley a la oferta onerosa y el art. 3.1 define clientela por quien compró o contrató.' };
  }
  return { ...base, veredicto: 'aplica', certeza: 'alta', resumen: 'Gran empresa que vende a consumidores (art. 2.2).' };
}

// ——— Declaración ———

function elegirVariante(eaa, publico, P) {
  if (publico?.veredicto === 'aplica' && publico.via === 'titular') return 'sector-publico';
  if (eaa.veredicto === 'aplica') return 'obligado';
  if (eaa.veredicto === 'dudoso') return 'prudente';
  if (publico?.veredicto === 'aplica' && publico.via === 'financiacion') return 'financiacion-publica';
  if (eaa.exenta && !eaa.exenta.provisional) return 'voluntaria-micro';
  return P.textosDeclaracion.voluntaria ? 'voluntaria' : null;
}

function bloqueDeclaracion(variante, P, autoridad, eaa) {
  const t = P.textosDeclaracion[variante];
  if (!t) {
    return {
      variante: null,
      avisos: [`Sin textos para ${P.nombre}: usa el modelo de la Decisión 2018/1523 solo como referencia y comprueba la transposición nacional.`],
    };
  }
  const avisos = [...t.avisos];
  if (eaa.exenta?.provisional) {
    avisos.unshift('La exención de microempresa está sin confirmar (faltan datos de empresas asociadas o vinculadas): por eso el texto no la menciona.');
  }
  return {
    variante,
    sector: t.sector,
    introduccion: t.introduccion,
    parcial: t.parcial,
    noConforme: t.noConforme,
    exigeInformacionServicio: t.exigeInformacionServicio,
    procedimiento: t.procedimiento,
    autoridad: t.procedimiento === 'autoridad' ? autoridad?.textoDeclaracion ?? null : null,
    avisos,
  };
}

function bloqueAutoridad(r, P, faltan) {
  const A = P.autoridad;
  if (!A) return null;
  if (!r.comunidad) falta(faltan, 'comunidad');
  const c = r.comunidad ? P.territorios[r.comunidad] : null;
  return {
    comunidad: c?.nombre ?? null,
    estado: c?.estado ?? 'sin-indicar',
    detalle: c?.detalle ?? 'Indica la comunidad del domicilio con --comunidad.',
    fuente: c?.fuente ?? null,
    unidadTecnica: A.unidad,
    domicilioOUsuario: A.domicilioOUsuario,
    listado: A.lista,
    contrapuesto: A.datosContrapuestos,
    textoDeclaracion: c?.autoridad
      ? `puede dirigirse a ${c.autoridad}, en ${c.nombre}.`
      : c
      ? `puede dirigirse a la Unidad técnica de apoyo y coordinación de las autoridades de vigilancia (Real Decreto 143/2026): ${A.unidad.correo}. En ${c.nombre} no nos consta autoridad de vigilancia designada a ${P.revisado}.`
      : `puede dirigirse a la autoridad de su comunidad autónoma, si está designada, o a la Unidad técnica de apoyo y coordinación de las autoridades de vigilancia (Real Decreto 143/2026): ${A.unidad.correo}.`,
  };
}

// ——— Punto de entrada ———

function aplicarTamano(servicio, tam, P) {
  if (servicio.veredicto === 'no aplica') return { ...servicio };
  if (tam.categoria === 'micro') {
    return {
      ...servicio,
      veredicto: 'no aplica',
      certeza: tam.provisional ? 'media' : 'alta',
      resumen: `Microempresa que presta servicios: exenta de los requisitos y de «cualquier obligación relativa al cumplimiento» (${P.articuloMicro}). Sin la exención, el resultado sería: ${servicio.veredicto}.`,
      base: [{ texto: `${P.articuloMicro}: menos de 10 personas y volumen de negocios o balance de hasta 2 M€. La exención cubre solo servicios, no productos.`, tipo: 'norma', url: P.urlNorma }],
      aFavor: undefined,
      enContra: undefined,
      tendencia: undefined,
      exenta: { provisional: Boolean(tam.provisional), sinExencion: servicio.veredicto },
      recomendacion: 'Sigue valiendo el art. 29 del RDL 1/2013 (igualdad, sin requisitos técnicos). Vuelve a comprobarlo cada ejercicio: el cambio cuenta si se repite dos seguidos. Hacer la web accesible es voluntario, no obligado.',
    };
  }
  return { ...servicio };
}

const CERTEZAS = ['alta', 'media', 'baja'];

export function evaluar(entrada = {}, { ahora = new Date() } = {}) {
  const r = normalizar(entrada);
  const pais = r.pais ?? 'ES';
  const P = paquetePara(pais);
  const faltan = [];
  const avisos = [];

  if (!P.completo) {
    avisos.push(`${pais} no tiene datos propios aquí: se ha evaluado solo con la Directiva. La transposición puede cambiar el ámbito. En Francia, por ejemplo, un juez aplicó un umbral de 250 M€ de otra ley, en una decisión recurrida. Revisa la ley de ${pais}.`);
  }
  if ((r.sector ?? []).some((s) => P.sectores[s] === undefined && !['ninguno', 'postal', 'transporte-urbano'].includes(s))) {
    avisos.push(`Este sector no está en la Directiva y ${pais} no tiene datos propios aquí: compruébalo en su transposición. España sí lo incluye.`);
  }
  const dias = Math.floor((ahora.getTime() - new Date(P.revisado).getTime()) / 86_400_000);
  if (dias > VIGENCIA_DIAS) {
    avisos.push(`Estos datos se revisaron el ${P.revisado}, hace ${dias} días. Comprueba las autoridades designadas y la cita de EN 301 549 antes de fiarte.`);
  }

  const tam = evaluarTamano(r, P, faltan);
  const servicio = evaluarServicio(r, P, faltan);
  if (servicio.veredicto === 'aplica' && r.destinatarios === undefined) {
    servicio.veredicto = 'dudoso';
    servicio.certeza = 'baja';
    servicio.resumen = `Falta saber si se presta a consumidores: si es solo a empresas, no aplica. ${servicio.resumen}`;
  }
  const publico = P.sectorPublico ? evaluarSectorPublico(r, P, faltan) : null;
  const esPublico = publico?.via === 'titular';
  const eaa = esPublico && servicio.veredicto !== 'no aplica'
    ? { ...servicio, nota: 'Considerando 46: la actividad comercial de un organismo público también debe cumplir esta norma. Microempresa no aplica a un organismo público.' }
    : (esPublico ? { ...servicio } : aplicarTamano(servicio, tam, P));

  // Sin saber el tamaño, se dan los dos escenarios.
  let escenarios = null;
  if (!esPublico && tam.categoria === 'desconocido' && servicio.veredicto !== 'no aplica') {
    const micro = aplicarTamano(servicio, { categoria: 'micro' }, P);
    escenarios = [
      { tamano: 'microempresa', condicion: 'menos de 10 personas y volumen o balance de hasta 2 M€, contando empresas asociadas o vinculadas', veredicto: micro.veredicto, certeza: micro.certeza, resumen: micro.resumen },
      { tamano: 'no microempresa', condicion: '10 personas o más, o volumen y balance por encima de 2 M€', veredicto: servicio.veredicto, certeza: servicio.certeza, resumen: servicio.resumen },
    ];
    eaa.veredicto = 'dudoso';
    eaa.certeza = 'baja';
    eaa.exenta = undefined;
    eaa.resumen = `Depende del tamaño, que no se conoce. ${servicio.resumen}`;
  }

  // El veredicto global es sobre obligaciones de accesibilidad de la web.
  const clave = [eaa, publico].filter(Boolean);
  const decisiva = clave.find((n) => n.veredicto === 'aplica') ?? clave.find((n) => n.veredicto === 'dudoso') ?? eaa;
  const veredicto = decisiva.veredicto === 'desconocido' ? eaa.veredicto : decisiva.veredicto;
  let certeza = CERTEZAS.includes(decisiva.certeza) ? (P.completo ? decisiva.certeza : 'baja') : 'baja';
  if (r.titular === undefined && certeza === 'alta') certeza = 'media';

  const autoridad = bloqueAutoridad(r, P, faltan);
  const clientela = evaluarAtencionClientela(r, P, tam);
  const variante = elegirVariante(eaa, publico, P);
  const declaracion = bloqueDeclaracion(variante, P, autoridad, eaa);

  const obligaciones = eaa.veredicto === 'no aplica'
    ? []
    : P.obligaciones
      .filter((o) => !o.soloComercio || eaa.como === 'comercio')
      .map(({ articulo, texto, url }) => ({ articulo, texto, url }));

  const conArgumentos = eaa.aFavor || eaa.enContra;
  const fuenteDe = (a) => (a.fuente ? { ...a, url: P.fuentes[a.fuente]?.url, fuente: P.fuentes[a.fuente]?.titulo } : a);

  return {
    esquema: ESQUEMA,
    pais: P.pais,
    paisNombre: P.nombre,
    datosNacionales: P.completo,
    revisado: P.revisado,
    aviso: 'Orientación con fuentes, no asesoramiento jurídico. Distingue norma, criterio oficial, opinión de terceros y razonamiento propio.',
    veredicto,
    certeza,
    resumen: decisiva === publico ? publico.resumen : eaa.resumen,
    base: eaa.base ?? [],
    argumentos: conArgumentos && eaa.veredicto !== 'no aplica'
      ? { aFavor: (eaa.aFavor ?? []).map(fuenteDe), enContra: (eaa.enContra ?? []).map(fuenteDe) }
      : null,
    tendencia: eaa.tendencia ?? null,
    recomendacion: eaa.recomendacion ?? null,
    escenarios,
    tamano: { categoria: tam.categoria, provisional: Boolean(tam.provisional), grande: tam.grande, notas: tam.notas, calculo: P.calculoTamano },
    normas: {
      productosYServicios: { norma: P.norma, veredicto: eaa.veredicto, certeza: eaa.certeza, resumen: eaa.resumen, nota: eaa.nota ?? null },
      sectorPublico: publico,
      atencionClientela: clientela,
      igualdad: P.igualdad,
      productos: r.productos === 'si'
        ? { veredicto: 'aplica', resumen: 'Como fabricante, importador o distribuidor de esos productos tienes obligaciones propias aunque seas microempresa: la exención solo cubre servicios (arts. 3.3, 7 a 12 y 16.4 Ley 11/2023). Esta skill no las analiza.' }
        : null,
    },
    obligaciones,
    exclusiones: P.exclusiones,
    plazos: P.plazos,
    sanciones: P.sanciones,
    autoridad,
    normaTecnica: { ...P.normaTecnica, nacional: P.normaTecnicaNacional },
    declaracion,
    faltan,
    avisos,
    fuentes: P.fuentes,
    respuestas: r,
  };
}

// ——— Informe legible ———

const CERT = { alta: 'alta', media: 'media', baja: 'baja' };

export function aMarkdown(x) {
  const L = [];
  const lista = (a) => a.forEach((t) => L.push(`- ${t}`));
  const cita = (a) => `${a.texto}${a.tipo ? ` *(${a.tipo})*` : ''}${a.url ? ` ${a.url}` : ''}`;
  L.push(`# Aplicabilidad de la normativa de accesibilidad: ${x.paisNombre}`, '');
  L.push(`> ${x.aviso} Información revisada el ${x.revisado}.`, '');
  L.push(`**Veredicto: ${x.veredicto.toUpperCase()}.** Certeza: ${CERT[x.certeza]}.`, '');
  L.push(x.resumen, '');
  if (x.recomendacion) L.push(`**Recomendación:** ${x.recomendacion}`, '');
  if (x.escenarios) {
    L.push('## Por escenario de tamaño', '', '| Tamaño | Condición | Veredicto | Certeza |', '|---|---|---|---|');
    for (const e of x.escenarios) L.push(`| ${e.tamano} | ${e.condicion} | ${e.veredicto} | ${e.certeza} |`);
    L.push('');
  }
  if (x.base.length) { L.push('## Base', ''); lista(x.base.map(cita)); L.push(''); }
  if (x.argumentos) {
    L.push('## A favor de que aplique', ''); lista(x.argumentos.aFavor.map(cita)); L.push('');
    L.push('## En contra', ''); lista(x.argumentos.enContra.map(cita)); L.push('');
  }
  L.push('## Otras normas', '');
  const { sectorPublico: sp, atencionClientela: ac, igualdad: ig, productos: pr } = x.normas;
  if (sp) L.push(`- **Sector público (RD 1112/2018):** ${sp.veredicto}. ${sp.resumen}${sp.url ? ` ${sp.url}` : ''}`);
  if (ac) L.push(`- **Atención a la clientela (Ley 10/2025):** ${ac.veredicto}. ${ac.resumen} ${ac.plazo} ${ac.url}`);
  if (ig) L.push(`- **Igualdad (${ig.articulo}):** ${ig.texto} ${ig.url}`);
  if (pr) L.push(`- **Productos:** ${pr.resumen}`);
  L.push('');
  if (x.obligaciones.length) {
    L.push('## Obligaciones si aplica', '');
    lista(x.obligaciones.map((o) => `**${o.articulo}:** ${o.texto} ${o.url}`));
    L.push('');
    if (x.exclusiones) L.push(`Contenido excluido (${x.exclusiones.articulo}): ${x.exclusiones.texto}`, '');
    if (x.plazos.length) { L.push('### Plazos', ''); lista(x.plazos.map((p) => p.texto)); L.push(''); }
    if (x.sanciones) { L.push('### Sanciones', ''); lista(x.sanciones.resumen); L.push(''); }
  }
  if (x.autoridad) {
    const a = x.autoridad;
    L.push('## Autoridad', '');
    L.push(`- **${a.comunidad ?? 'Comunidad sin indicar'}:** ${a.detalle}${a.fuente ? ` ${a.fuente}` : ''}`);
    L.push(`- **Unidad técnica:** ${a.unidadTecnica.correo}. ${a.unidadTecnica.papel} ${a.unidadTecnica.fuente}`);
    L.push(`- **¿Domicilio o usuario?** Dudoso. ${a.domicilioOUsuario.texto} ${a.domicilioOUsuario.recomendacion}`);
    L.push(`- ${a.listado}`, '');
  }
  L.push('## Norma técnica', ''); lista([...x.normaTecnica.resumen, ...x.normaTecnica.nacional]); L.push('');
  L.push('## Qué texto usar en la declaración', '');
  const d = x.declaracion;
  if (d.variante) {
    L.push(`Variante: \`${d.variante}\`. Pásale este resultado a \`declaracion.mjs --aplicabilidad\`.`, '');
    L.push(`> ${d.introduccion}`, '');
    L.push(`Si hay fallos, situación parcial: «${d.parcial}»`, '');
  }
  lista(d.avisos); L.push('');
  if (x.tamano.notas.length || x.tamano.categoria !== 'no-micro') {
    L.push('## Cómo contar el tamaño', '');
    lista([...x.tamano.notas, ...Object.values(x.tamano.calculo)]);
    L.push('');
  }
  if (x.faltan.length) { L.push('## Datos que cambiarían el resultado', ''); lista(x.faltan.map((f) => f.pregunta)); L.push(''); }
  if (x.avisos.length) { L.push('## Avisos', ''); lista(x.avisos); L.push(''); }
  return L.join('\n');
}
