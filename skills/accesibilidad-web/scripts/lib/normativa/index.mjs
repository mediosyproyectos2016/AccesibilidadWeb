// Registro de países. La Directiva es la base común; cada país añade su transposición.
// Para añadir uno: crea <pais>.mjs como es.mjs y añade aquí su entrada. Un país sin
// entrada se evalúa solo con la Directiva y el resultado lo avisa.
import {
  ARGUMENTOS_UE, CALCULO_TAMANO, FUENTES_UE, NORMA_TECNICA_UE, REVISADO_UE, SECTORES_UE, UMBRAL_MICRO,
} from './ue.mjs';
import {
  AUTORIDAD_ES, COMUNIDADES, EXCLUSIONES_ES, FUENTES_ES, IGUALDAD_ES, LEY10_ES, NORMA_TECNICA_ES,
  OBLIGACIONES_ES, PLAZOS_ES, RD1112_ES, REVISADO_ES, SANCIONES_ES, SECTORES_BASICOS_LEY10, SECTORES_ES,
  TEXTOS_DECLARACION,
} from './es.mjs';

const BASE = {
  fuentes: FUENTES_UE,
  argumentos: ARGUMENTOS_UE,
  sectores: SECTORES_UE,
  umbralMicro: UMBRAL_MICRO,
  calculoTamano: CALCULO_TAMANO,
  normaTecnica: NORMA_TECNICA_UE,
  revisado: REVISADO_UE,
};

const ES = {
  ...BASE,
  pais: 'ES',
  nombre: 'España',
  completo: true,
  fuentes: { ...FUENTES_UE, ...FUENTES_ES },
  sectores: { ...SECTORES_UE, ...SECTORES_ES },
  revisado: REVISADO_ES,
  norma: 'Título I de la Ley 11/2023',
  articuloServicio: 'art. 2.2 Ley 11/2023',
  articuloMicro: 'art. 3.3 y anexo VII, 16 Ley 11/2023',
  articuloComercio: 'art. 2.2.f y anexo VII, 32 Ley 11/2023; art. 3.30 Directiva',
  articuloConsumidor: 'art. 2.2 y anexo VII, 6 Ley 11/2023',
  urlNorma: FUENTES_ES.ley11.url,
  obligaciones: OBLIGACIONES_ES,
  plazos: PLAZOS_ES,
  exclusiones: EXCLUSIONES_ES,
  sanciones: SANCIONES_ES,
  autoridad: AUTORIDAD_ES,
  territorios: COMUNIDADES,
  sectorPublico: RD1112_ES,
  ley10: LEY10_ES,
  sectoresBasicos: SECTORES_BASICOS_LEY10,
  igualdad: IGUALDAD_ES,
  normaTecnicaNacional: NORMA_TECNICA_ES,
  textosDeclaracion: TEXTOS_DECLARACION,
};

export const PAISES = { ES };

/** Para un país sin datos propios: solo la Directiva, sin autoridades ni textos. */
function soloDirectiva(pais) {
  return {
    ...BASE,
    pais,
    nombre: pais,
    completo: false,
    norma: 'Directiva (UE) 2019/882',
    articuloServicio: 'art. 2.2 Directiva',
    articuloMicro: 'arts. 3.23 y 4.5 Directiva',
    articuloComercio: 'arts. 2.2.f y 3.30 Directiva',
    articuloConsumidor: 'arts. 2.2 y 3 Directiva',
    urlNorma: FUENTES_UE.directiva.url,
    obligaciones: [],
    plazos: [],
    exclusiones: null,
    sanciones: null,
    autoridad: null,
    territorios: {},
    sectorPublico: null,
    ley10: null,
    sectoresBasicos: [],
    igualdad: null,
    normaTecnicaNacional: [],
    textosDeclaracion: {},
  };
}

export function paquetePara(pais = 'ES') {
  const clave = String(pais).toUpperCase();
  return PAISES[clave] ?? soloDirectiva(clave);
}
