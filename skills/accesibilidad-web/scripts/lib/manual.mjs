// Lista de comprobación manual: lo que una herramienta no puede juzgar. Es el
// registro que luego usa la declaración, así que no acepta respuestas sin autor.
// El detalle de cómo hacer cada prueba está en references/revision-manual.md.

export const ESTADOS = ['pendiente', 'ok', 'fallo', 'no-aplica'];

/** `persona`: exige que lo compruebe una persona; un agente no puede cerrarlo. */
export const COMPROBACIONES = [
  { id: 'teclado-recorrido', seccion: 1, criterios: ['2.1.1', '2.1.2'], titulo: 'Todo funciona solo con teclado: menús, formularios, compra, sin trampas.' },
  { id: 'teclado-orden', seccion: 1, criterios: ['2.4.3'], persona: true, titulo: 'El orden del foco sigue el de lectura y tiene sentido.' },
  { id: 'teclado-foco', seccion: 1, criterios: ['2.4.7', '2.4.11'], titulo: 'El foco se ve siempre y no queda tapado por cabeceras o avisos.' },
  { id: 'lector-pantalla', seccion: 2, criterios: ['1.3.1', '4.1.2', '4.1.3'], persona: true, titulo: 'Las tareas principales se completan con un lector de pantalla (NVDA, JAWS, VoiceOver o TalkBack).' },
  { id: 'textos-alternativos', seccion: 2, criterios: ['1.1.1'], persona: true, titulo: 'Los textos alternativos describen lo que la imagen aporta, no solo existen.' },
  { id: 'nombres-enlaces', seccion: 2, criterios: ['2.4.4', '2.4.6'], persona: true, titulo: 'Enlaces, botones y encabezados se entienden fuera de contexto.' },
  { id: 'estructura-sentido', seccion: 2, criterios: ['1.3.1', '1.3.2'], persona: true, titulo: 'Los encabezados y las regiones reflejan la estructura real del contenido.' },
  { id: 'contraste-revision', seccion: 3, criterios: ['1.4.1', '1.4.3', '1.4.11'], persona: true, titulo: 'Contraste sobre imágenes y degradados, de iconos y controles; nada depende solo del color.' },
  { id: 'zoom-texto', seccion: 4, criterios: ['1.4.4', '1.4.10'], titulo: 'Zoom al 200 % y ancho de 320 px en el navegador real: no se pierde contenido ni función.' },
  { id: 'espaciado', seccion: 5, criterios: ['1.4.12'], titulo: 'Con el espaciado de 1.4.12 no se pierde texto en ningún estado.' },
  { id: 'movimiento', seccion: 6, criterios: ['2.2.2', '2.3.1'], persona: true, titulo: 'Lo que se mueve o parpadea se puede parar; no hay destellos peligrosos.' },
  { id: 'formularios', seccion: 7, criterios: ['1.3.5', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.7'], titulo: 'Formularios: etiquetas, errores claros en texto, sugerencias, prevención y sin pedir dos veces lo mismo.' },
  { id: 'autenticacion', seccion: 8, criterios: ['3.3.8'], titulo: 'Se puede iniciar sesión sin pruebas cognitivas: se puede pegar y usar un gestor de contraseñas.' },
  { id: 'multimedia', seccion: 9, criterios: ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5', '1.4.2'], persona: true, titulo: 'Vídeo y audio: subtítulos correctos, audiodescripción o alternativa y control del sonido.' },
  { id: 'hover-foco', seccion: 10, criterios: ['1.4.13'], titulo: 'Lo que aparece con hover o foco se puede cerrar, recorrer y no desaparece solo.' },
  { id: 'punteros', seccion: 11, criterios: ['2.5.1', '2.5.2', '2.5.3', '2.5.4', '2.5.7', '2.5.8'], titulo: 'Gestos y arrastre con alternativa sencilla, cancelación y objetivos de tamaño suficiente.' },
  { id: 'coherencia', seccion: 12, criterios: ['2.4.5', '3.2.3', '3.2.4', '3.2.6'], titulo: 'Navegación e identificación coherentes, varias vías de acceso y ayuda en el mismo sitio.' },
  { id: 'idioma', seccion: 13, criterios: ['3.1.1', '3.1.2'], persona: true, titulo: 'El idioma de la página y de los fragmentos en otro idioma es correcto.' },
  { id: 'estados-dinamicos', seccion: 7, criterios: ['3.2.1', '3.2.2', '4.1.3'], titulo: 'Filtros, carrito, buscador y mensajes dinámicos se anuncian y no cambian el contexto sin aviso.' },
  { id: 'revisar-automatico', seccion: 0, criterios: [], persona: true, titulo: 'Se ha resuelto todo lo que la auditoría marcó como «necesita revisión manual».' },
  { id: 'personas-reales', seccion: 0, criterios: [], persona: true, titulo: 'Personas con discapacidad o usuarias habituales de productos de apoyo han probado las tareas principales.' },
];

/** Crea el registro de revisión conservando las respuestas de uno anterior. */
export function crearRevision(informe, anterior = null) {
  const previos = new Map((anterior?.comprobaciones ?? []).map((c) => [c.id, c]));
  const paginas = (informe?.paginas ?? []).filter((p) => !p.error).map((p) => p.url);
  const pendientesAuto = informe?.revisar?.length ?? 0;
  return {
    herramienta: 'AccesibilidadWeb',
    aviso: 'Una comprobación solo cuenta si tiene estado, autor y método. No marques como ok lo que no se ha probado. Los elementos con "persona": true no los puede cerrar un agente.',
    informeFecha: informe?.fecha ?? null,
    paginas,
    comprobaciones: COMPROBACIONES.map((c) => {
      const p = previos.get(c.id);
      return {
        id: c.id,
        titulo: c.titulo,
        criterios: c.criterios,
        persona: !!c.persona,
        guia: c.seccion ? `references/revision-manual.md, sección ${c.seccion}` : 'references/flujo-arreglo.md',
        estado: p?.estado ?? 'pendiente',
        comprobadoPor: p?.comprobadoPor ?? '',
        esAgente: p?.esAgente ?? false,
        metodo: p?.metodo ?? '',
        fecha: p?.fecha ?? '',
        notas: p?.notas ?? (c.id === 'revisar-automatico' && pendientesAuto ? `${pendientesAuto} elemento(s) en el informe.` : ''),
      };
    }),
  };
}

/** ¿Tiene esta comprobación una respuesta que cuente? */
export function respuestaValida(c) {
  if (!['ok', 'fallo', 'no-aplica'].includes(c.estado)) return false;
  if (!String(c.comprobadoPor ?? '').trim() || !String(c.metodo ?? '').trim()) return false;
  // Un agente puede registrar un fallo que encuentra, pero no aprobar lo que exige a una persona.
  if (c.persona && c.esAgente && c.estado !== 'fallo') return false;
  // Probar con personas no es opcional en este proceso: no admite «no aplica».
  if (c.id === 'personas-reales' && c.estado === 'no-aplica') return false;
  return true;
}

export function estadoRevision(revision) {
  const lista = revision?.comprobaciones ?? [];
  const validas = lista.filter(respuestaValida);
  const pendientes = lista.filter((c) => !respuestaValida(c));
  return {
    total: lista.length,
    respondidas: validas.length,
    ok: validas.filter((c) => c.estado === 'ok').length,
    fallos: validas.filter((c) => c.estado === 'fallo'),
    noAplica: validas.filter((c) => c.estado === 'no-aplica').length,
    pendientes,
    completa: lista.length > 0 && pendientes.length === 0,
  };
}

export function revisionMarkdown(revision) {
  const e = estadoRevision(revision);
  const L = ['# Revisión manual de accesibilidad', ''];
  L.push(`**${e.respondidas} de ${e.total} comprobaciones registradas** · ${e.ok} correctas · ${e.fallos.length} con fallo · ${e.noAplica} no aplican · ${e.pendientes.length} pendientes.`, '');
  L.push('Cómo hacer cada prueba: `references/revision-manual.md`. Para registrar: `node revision.mjs marcar revision-manual.json --id <id> --estado ok --por "Nombre" --metodo "NVDA + Firefox"`.', '');
  L.push('| Id | Comprobación | Criterios | Quién | Estado | Por | Método |', '|---|---|---|---|---|---|---|');
  const celda = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  for (const c of revision.comprobaciones) {
    const estado = respuestaValida(c) ? c.estado : (c.estado === 'pendiente' ? 'pendiente' : `pendiente (${c.estado} sin validar)`);
    L.push(`| \`${c.id}\` | ${celda(c.titulo)} | ${c.criterios.join(', ') || '—'} | ${c.persona ? 'persona' : 'persona o agente'} | ${estado} | ${celda(c.comprobadoPor)} | ${celda(c.metodo)} |`);
  }
  L.push('');
  return L.join('\n');
}
