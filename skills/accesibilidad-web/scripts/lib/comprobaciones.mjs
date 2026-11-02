// Comprobaciones que axe-core no cubre: movimiento, modales, desplegables, orden
// del foco, zoom, espaciado de texto y texto sobre imagen o vídeo.
//
// Son heurísticas. Distinguen entre `hallazgos` (síntoma claro de fallo) y
// `revisar` (sospecha que debe confirmar una persona). Si dudas al añadir una
// comprobación, mándala a `revisar`: un falso positivo cuesta confianza.
//
// Seguridad: solo se pulsan controles que declaran abrir un diálogo o un
// desplegable. Nunca se envían formularios ni se pulsan botones genéricos, porque
// la auditoría puede estar corriendo contra una web en producción.

const NOMBRE_PAUSA = /paus|deten|parar|det[eé]n|stop|pause|freeze|inmovilizar/i;

/** Funciones auxiliares que se inyectan en la página (se usan como texto). */
const AYUDANTES = `
  window.__a11yAy = window.__a11yAy || (() => {
    const selector = (n) => {
      const partes = [];
      while (n && n.nodeType === 1 && partes.length < 6) {
        if (n.id && /^[A-Za-z][\\w-]*$/.test(n.id)) { partes.unshift('#' + n.id); break; }
        let p = n.tagName.toLowerCase();
        const clase = [...n.classList].filter((c) => /^[A-Za-z][\\w-]*$/.test(c)).slice(0, 2);
        if (clase.length) p += '.' + clase.join('.');
        const padre = n.parentElement;
        if (padre) {
          const iguales = [...padre.children].filter((h) => h.tagName === n.tagName);
          if (iguales.length > 1) p += ':nth-of-type(' + (iguales.indexOf(n) + 1) + ')';
        }
        partes.unshift(p);
        n = padre;
      }
      return partes.join(' > ');
    };
    const visible = (el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const activo = () => {
      let el = document.activeElement;
      while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
      return el;
    };
    const contiene = (padre, el) => {
      for (let n = el; n; n = n.parentNode || n.host) if (n === padre) return true;
      return false;
    };
    const nombre = (el) => (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || '').replace(/\\s+/g, ' ').trim();
    // querySelectorAll que entra en los shadow DOM abiertos: los componentes web
    // también tienen diálogos y controles.
    const buscar = (sel, raiz = document) => {
      const out = [...raiz.querySelectorAll(sel)];
      for (const el of raiz.querySelectorAll('*')) if (el.shadowRoot) out.push(...buscar(sel, el.shadowRoot));
      return out;
    };
    const dialogo = () => buscar('dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]').find(visible) ?? null;
    return { selector, visible, activo, contiene, nombre, dialogo, buscar };
  })();
`;

async function ayudantes(page) {
  await page.evaluate(AYUDANTES);
}

/**
 * Movimiento automático (2.2.2). Observa la página durante `ms` (por encima de
 * los 5 s que marca el criterio) y busca animaciones sin fin, vídeos en
 * reproducción automática y carruseles que cambian solos sin control de pausa.
 */
export async function revisarMovimiento(page, { ms = 5500 } = {}) {
  await ayudantes(page);
  await page.evaluate(() => {
    const cambios = new Map();
    const obs = new MutationObserver((lista) => {
      const ahora = performance.now();
      for (const m of lista) {
        const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (!el) continue;
        if (!cambios.has(el)) cambios.set(el, []);
        cambios.get(el).push(ahora);
      }
    });
    obs.observe(document.documentElement, {
      subtree: true, attributes: true, attributeFilter: ['class', 'style', 'aria-hidden', 'hidden'],
      childList: true, characterData: true,
    });
    window.__a11yMov = { obs, cambios, inicio: performance.now() };
  });
  await page.waitForTimeout(ms);
  const r = await page.evaluate(({ patron }) => {
    const ay = window.__a11yAy;
    const reNombre = new RegExp(patron, 'i');
    const { obs, cambios } = window.__a11yMov;
    obs.disconnect();
    delete window.__a11yMov;

    const hayPausaCerca = (el) => {
      let n = el;
      // Hasta <body> sin incluirlo: un botón de pausa de otra zona no para esto. Un
      // control dentro de aria-hidden tampoco cuenta: el lector de pantalla no lo ve.
      for (let i = 0; n && n !== document.body && n !== document.documentElement && i < 6; i++, n = n.parentElement) {
        const controles = n.querySelectorAll('button, [role="button"], input[type="button"], input[type="checkbox"], a[href]');
        if ([...controles].some((c) => ay.visible(c) && !c.closest('[aria-hidden="true"]') && reNombre.test(ay.nombre(c)))) return true;
      }
      return false;
    };
    const area = (el) => { const b = el.getBoundingClientRect(); return b.width * b.height; };

    const hallazgos = [];
    const revisar = [];
    const vistos = new Set();

    // Animaciones CSS y Web Animations que no acaban.
    for (const an of document.getAnimations()) {
      const el = an.effect?.target;
      if (!el || an.playState !== 'running' || vistos.has(el)) continue;
      const t = an.effect.getComputedTiming();
      const largas = t.iterations === Infinity || t.endTime > 5000;
      if (!largas || !ay.visible(el) || area(el) < 64) continue;
      // Un spinner de carga pequeño no suele mover información; se deja a revisión.
      vistos.add(el);
      if (hayPausaCerca(el)) continue;
      (area(el) < 2500 ? revisar : hallazgos).push({
        regla: 'movimiento-sin-pausa', selector: ay.selector(el),
        detalle: `Animación ${t.iterations === Infinity ? 'infinita' : 'de más de 5 s'} sin control para pausarla${area(el) < 2500 ? ' (elemento pequeño: comprueba si transmite información o es decorativa).' : '.'}`,
      });
    }
    // Vídeos automáticos.
    for (const v of document.querySelectorAll('video')) {
      if (v.paused || !ay.visible(v) || area(v) < 64) continue;
      if (v.controls || hayPausaCerca(v)) continue;
      const dura = v.loop || !Number.isFinite(v.duration) || v.duration > 5;
      if (dura) hallazgos.push({ regla: 'movimiento-sin-pausa', selector: ay.selector(v), detalle: 'Vídeo en reproducción automática sin controles ni botón de pausa.' });
    }
    for (const m of document.querySelectorAll('marquee, blink')) {
      if (ay.visible(m)) hallazgos.push({ regla: 'movimiento-sin-pausa', selector: ay.selector(m), detalle: `Elemento <${m.tagName.toLowerCase()}> en movimiento.` });
    }
    // Contenido movido por JavaScript: carruseles y similares.
    const esCarrusel = (el) => el.closest('[aria-roledescription="carousel" i], [class*="carousel" i], [class*="carrusel" i], [class*="slider" i], [class*="swiper" i], [class*="slick" i], [class*="splide" i], [data-carousel], [data-slider]');
    const grupos = new Map();
    for (const [el, tiempos] of cambios) {
      if (!el.isConnected || el.closest('video, [aria-live]')) continue;
      const clave = esCarrusel(el) ?? el.parentElement;
      if (!clave || clave === document.documentElement || clave === document.body) continue;
      const g = grupos.get(clave) ?? [];
      g.push(...tiempos);
      grupos.set(clave, g);
    }
    for (const [el, tiempos] of grupos) {
      if (vistos.has(el) || !ay.visible(el) || area(el) < 2500) continue;
      tiempos.sort((a, b) => a - b);
      if (tiempos.length < 2 || tiempos[tiempos.length - 1] - tiempos[0] < 2000) continue;
      if (hayPausaCerca(el)) continue;
      vistos.add(el);
      if (esCarrusel(el)) hallazgos.push({ regla: 'movimiento-sin-pausa', selector: ay.selector(el), detalle: 'Carrusel que cambia solo sin botón de pausa.' });
      else revisar.push({ regla: 'movimiento-sin-pausa', selector: ay.selector(el), detalle: 'Contenido que cambia solo con el tiempo: si se mueve o se actualiza más de 5 s, necesita pausa (o es esencial).' });
    }
    return { hallazgos, revisar };
  }, { patron: NOMBRE_PAUSA.source });
  return {
    hallazgos: r.hallazgos.map((h) => ({ ...h, impacto: 'serious' })),
    revisar: r.revisar,
  };
}

/**
 * Carga de nuevo la página con prefers-reduced-motion: reduce y busca lo que
 * sigue moviéndose. 2.3.3 es de nivel AAA, pero ignorar esta preferencia puede
 * provocar mareos: se informa como buena práctica, sin criterio AA asociado.
 */
export async function revisarMovimientoReducido(context, url, cargar, carga) {
  const page = await context.newPage();
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await cargar(page, url, carga);
    await ayudantes(page);
    return await page.evaluate(() => {
      const ay = window.__a11yAy;
      const out = [];
      const vistos = new Set();
      for (const an of document.getAnimations()) {
        const el = an.effect?.target;
        if (!el || an.playState !== 'running' || vistos.has(el)) continue;
        const t = an.effect.getComputedTiming();
        const b = el.getBoundingClientRect();
        if ((t.iterations === Infinity || t.endTime > 5000) && ay.visible(el) && b.width * b.height >= 2500) {
          vistos.add(el);
          out.push({ regla: 'movimiento-reducido-ignorado', impacto: 'moderate', selector: ay.selector(el), detalle: 'Sigue animado aunque el usuario pide reducir el movimiento.' });
        }
      }
      for (const v of document.querySelectorAll('video')) {
        if (!v.paused && ay.visible(v)) out.push({ regla: 'movimiento-reducido-ignorado', impacto: 'moderate', selector: ay.selector(v), detalle: 'El vídeo se reproduce solo aunque el usuario pide reducir el movimiento.' });
      }
      return out;
    });
  } catch {
    return [];
  } finally {
    await page.close();
  }
}

const SELECTOR_ABRE_DIALOGO = [
  '[aria-haspopup="dialog"]', '[data-bs-toggle="modal"]', '[data-toggle="modal"]',
  '[data-modal-target]', '[data-dialog-target]', '[data-a11y-dialog-show]',
  '[command="show-modal"]', 'button[aria-controls]',
].join(', ');

/** Candidatos seguros a abrir un diálogo: lo declaran y no navegan ni envían. */
async function disparadoresDeDialogo(page, max) {
  return page.evaluate(({ sel, max }) => {
    const ay = window.__a11yAy;
    const out = [];
    let i = 0;
    for (const el of ay.buscar(sel)) {
      if (el.disabled || !ay.visible(el)) continue;
      if (el.matches('a[href]:not([href^="#"]), [type="submit"]')) continue;
      if (el.tagName === 'BUTTON' && el.type === 'submit' && el.closest('form')) continue;
      if (el.matches('button[aria-controls]') && !el.matches('[aria-haspopup="dialog"], [data-bs-toggle="modal"], [data-toggle="modal"]')) {
        const destino = el.getRootNode().getElementById(el.getAttribute('aria-controls'));
        if (!destino?.matches('dialog, [role="dialog"], [role="alertdialog"], [aria-modal="true"]')) continue;
      }
      el.setAttribute('data-a11y-disparador', String(i));
      out.push({ i, selector: ay.selector(el), texto: ay.nombre(el).slice(0, 60) });
      i++;
      if (out.length >= max) break;
    }
    return out;
  }, { sel: SELECTOR_ABRE_DIALOGO, max });
}

/** Examina el diálogo abierto: foco dentro, Tab no escapa. Devuelve hallazgos y su estado. */
export async function revisarDialogoAbierto(page, { tabs = 25 } = {}) {
  await ayudantes(page);
  const info = await page.evaluate(() => {
    const ay = window.__a11yAy;
    const d = ay.dialogo();
    if (!d) return null;
    d.setAttribute('data-a11y-dialogo', '1');
    const modal = d.matches('dialog:modal') || d.getAttribute('aria-modal') === 'true';
    const enfocables = [...d.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(ay.visible);
    return { modal, selector: ay.selector(d), enfocables: enfocables.length, focoDentro: ay.contiene(d, ay.activo()) };
  });
  if (!info) return null;

  const hallazgos = [];
  if (!info.focoDentro) {
    hallazgos.push({ regla: 'modal-sin-foco', impacto: 'serious', selector: info.selector, detalle: 'Al abrirse el diálogo, el foco del teclado se queda fuera.' });
  }
  if (info.modal) {
    const pulsaciones = Math.min(tabs, info.enfocables + 3);
    for (let i = 0; i < pulsaciones; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(30);
      const fuera = await page.evaluate(() => {
        const ay = window.__a11yAy;
        const el = ay.activo();
        if (!el || el === document.body || el === document.documentElement) return null; // salió a la interfaz del navegador
        const d = ay.buscar('[data-a11y-dialogo]')[0];
        return d && !ay.contiene(d, el) ? ay.selector(el) : null;
      });
      if (fuera) {
        hallazgos.push({ regla: 'modal-foco-escapa', impacto: 'serious', selector: info.selector, detalle: `Con el diálogo abierto, Tab lleva el foco a la página de detrás (${fuera}).` });
        break;
      }
    }
  }
  return { ...info, hallazgos };
}

/** Abre cada diálogo declarado y comprueba foco, Esc y devolución del foco. */
export async function revisarModales(page, { max = 4, recargar, alAbrir } = {}) {
  const hallazgos = [];
  await ayudantes(page);
  const disparadores = await disparadoresDeDialogo(page, max);
  for (const d of disparadores) {
    const loc = page.locator(`[data-a11y-disparador="${d.i}"]`).first();
    try {
      await loc.focus({ timeout: 1500 });
      await loc.click({ timeout: 2000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(350);
    const estado = await revisarDialogoAbierto(page).catch(() => null);
    if (!estado) continue;
    hallazgos.push(...estado.hallazgos);
    if (alAbrir) await alAbrir(d, estado);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const sigueAbierto = await page.evaluate(() => {
      const el = window.__a11yAy.buscar('[data-a11y-dialogo]')[0];
      if (!el) return false;
      const abierto = window.__a11yAy.visible(el) && !(el.tagName === 'DIALOG' && !el.open);
      if (!abierto) el.removeAttribute('data-a11y-dialogo');
      return abierto;
    });
    if (sigueAbierto) {
      if (estado.enfocables === 0) {
        hallazgos.push({ regla: 'trampa-foco', impacto: 'critical', selector: estado.selector, detalle: 'El diálogo no se cierra con Esc y no tiene ningún control enfocable: no hay salida con teclado.' });
      } else {
        hallazgos.push({ regla: 'modal-esc', impacto: 'moderate', selector: estado.selector, detalle: 'Esc no cierra el diálogo (patrón recomendado por la WAI-ARIA APG).' });
      }
      if (!recargar) break;
      await recargar();
      await ayudantes(page);
      await disparadoresDeDialogo(page, max);
      continue;
    }
    const vuelve = await page.evaluate((i) => {
      const ay = window.__a11yAy;
      const el = ay.activo();
      const disparador = ay.buscar(`[data-a11y-disparador="${i}"]`)[0];
      return !!disparador && ay.contiene(disparador, el);
    }, d.i);
    if (!vuelve) {
      hallazgos.push({ regla: 'modal-foco-no-vuelve', impacto: 'moderate', selector: d.selector, texto: d.texto, detalle: 'Al cerrar el diálogo, el foco no vuelve al control que lo abrió.' });
    }
  }
  return { hallazgos, abiertos: disparadores.length };
}

/** Desplegables con aria-expanded: al pulsar, el estado debe cambiar de verdad. */
export async function revisarDesplegables(page, { max = 5, alAbrir } = {}) {
  await ayudantes(page);
  const hallazgos = [];
  const lista = await page.evaluate((max) => {
    const ay = window.__a11yAy;
    const out = [];
    let i = 0;
    for (const el of ay.buscar('button[aria-expanded="false"], [role="button"][aria-expanded="false"], summary')) {
      if (el.disabled || !ay.visible(el)) continue;
      if (el.tagName === 'BUTTON' && el.type === 'submit' && el.closest('form')) continue;
      el.setAttribute('data-a11y-despl', String(i));
      out.push({ i, selector: ay.selector(el), texto: ay.nombre(el).slice(0, 60), summary: el.tagName === 'SUMMARY' });
      i++;
      if (out.length >= max) break;
    }
    return out;
  }, max);
  for (const d of lista) {
    const loc = page.locator(`[data-a11y-despl="${d.i}"]`).first();
    try {
      await loc.click({ timeout: 2000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(250);
    if (!d.summary) {
      const expandido = await loc.getAttribute('aria-expanded').catch(() => null);
      if (expandido === 'false') {
        hallazgos.push({ regla: 'desplegable-sin-estado', impacto: 'serious', selector: d.selector, texto: d.texto, detalle: 'Tras pulsar el control, aria-expanded sigue en «false»: el lector de pantalla no sabrá que se ha abierto.' });
      }
    }
    if (alAbrir) await alAbrir(d);
    await loc.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(150);
  }
  return { hallazgos, abiertos: lista.length };
}

/** tabindex positivo y saltos grandes hacia atrás en el recorrido (2.4.3). */
export async function revisarOrdenFoco(page, pasos = []) {
  await ayudantes(page);
  const positivos = await page.evaluate(() => {
    const ay = window.__a11yAy;
    return [...document.querySelectorAll('[tabindex]')]
      .filter((el) => parseInt(el.getAttribute('tabindex'), 10) > 0)
      .slice(0, 20)
      .map((el) => ({ selector: ay.selector(el), valor: el.getAttribute('tabindex') }));
  });
  const hallazgos = positivos.map((p) => ({
    regla: 'tabindex-positivo', impacto: 'moderate', selector: p.selector,
    detalle: `tabindex="${p.valor}" altera el orden de tabulación de toda la página.`,
  }));
  const alto = page.viewportSize()?.height ?? 800;
  const revisar = [];
  for (let i = 1; i < pasos.length; i++) {
    const a = pasos[i - 1].rect;
    const b = pasos[i].rect;
    if (a && b && a.y - b.y > alto * 0.75) {
      revisar.push({ regla: 'orden-foco-sospechoso', selector: pasos[i].selector, detalle: `El foco salta ${Math.round(a.y - b.y)} px hacia arriba desde ${pasos[i - 1].selector}. Puede ser legítimo (columnas, menú al final del DOM): comprueba si sigue el orden de lectura.` });
    }
  }
  return { hallazgos, revisar };
}

const RECORTADOS_EN_PAGINA = () => {
  const ay = window.__a11yAy;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (!/hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY)) continue;
    if (!ay.visible(el) || !(el.innerText || '').trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue; // texto solo para lectores de pantalla
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') continue;
    if (el.scrollHeight > el.clientHeight + 3 || el.scrollWidth > el.clientWidth + 3) out.push(ay.selector(el));
    if (out.length > 200) break;
  }
  return out;
};

/**
 * Espaciado de texto (1.4.12): aplica los valores del criterio y busca texto
 * que queda recortado y antes no lo estaba.
 */
export async function revisarEspaciado(page) {
  await ayudantes(page);
  const antes = new Set(await page.evaluate(RECORTADOS_EN_PAGINA));
  const estilo = await page.addStyleTag({
    content: `*:not(svg *) { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
      p { margin-bottom: 2em !important; }`,
  });
  await page.waitForTimeout(150);
  const despues = await page.evaluate(RECORTADOS_EN_PAGINA);
  await estilo.evaluate((n) => n.remove());
  return despues.filter((s) => !antes.has(s)).slice(0, 8).map((selector) => ({
    regla: 'espaciado-recorta', impacto: 'serious', selector,
    detalle: 'Con el espaciado de texto de 1.4.12, este contenedor recorta su contenido (altura fija u overflow:hidden).',
  }));
}

/**
 * Zoom al 200 % (1.4.4). En una pantalla de 1280×800, el navegador al 200 % deja
 * una ventana de 640×400 px CSS; se simula con ese tamaño. No equivale a ampliar
 * solo el texto: eso sigue en la revisión manual.
 */
export async function revisarZoom200(page) {
  await ayudantes(page);
  const original = page.viewportSize();
  await page.setViewportSize({ width: Math.round(original.width / 2), height: Math.round(original.height / 2) });
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const ay = window.__a11yAy;
    const ancho = document.documentElement.clientWidth;
    const desborde = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0);
    const alto = innerHeight;
    let tapado = 0;
    const fijos = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      if (!ay.visible(el)) continue;
      const b = el.getBoundingClientRect();
      if (b.width < ancho * 0.6) continue;
      const visible = Math.min(b.bottom, alto) - Math.max(b.top, 0);
      if (visible > 0) { tapado += visible; fijos.push(ay.selector(el)); }
    }
    return { ancho, desborde, alto, tapado, fijos: fijos.slice(0, 3) };
  });
  await page.setViewportSize(original);
  const hallazgos = [];
  const revisar = [];
  if (r.desborde > r.ancho + 1) {
    hallazgos.push({ regla: 'zoom-200-desborde', impacto: 'serious', selector: 'html', detalle: `Al 200 % (ventana de ${r.ancho} px) el contenido mide ${r.desborde} px: aparece scroll horizontal.` });
  }
  if (r.tapado > r.alto * 0.4) {
    revisar.push({ regla: 'zoom-200-cabecera', selector: r.fijos[0] ?? 'html', detalle: `Al 200 %, los elementos fijos (${r.fijos.join(', ')}) ocupan ${Math.round((100 * r.tapado) / r.alto)} % de la altura de la ventana y dejan poco espacio al contenido.` });
  }
  return { hallazgos, revisar };
}

const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminancia = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
/** Relación de contraste WCAG entre dos colores [r, g, b]. */
export function relacionContraste(a, b) {
  const la = luminancia(...a);
  const lb = luminancia(...b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Fracción de píxeles RGBA que no llegan al mínimo de contraste con `color`. */
export function fraccionSinContraste(pixeles, color, minimo) {
  let malos = 0;
  let total = 0;
  for (let i = 0; i + 3 < pixeles.length; i += 4 * 3) { // uno de cada tres píxeles basta
    total++;
    if (relacionContraste(color, [pixeles[i], pixeles[i + 1], pixeles[i + 2]]) < minimo) malos++;
  }
  return total ? malos / total : 0;
}

/**
 * Texto sobre imagen o vídeo (1.4.3). axe no puede decidir estos casos y los deja
 * como «incompletos». Aquí se fotografía el fondo sin el texto y se mide el
 * contraste real, píxel a píxel, en varios instantes si hay vídeo.
 */
export async function revisarTextoSobreMedia(page, { max = 10 } = {}) {
  await ayudantes(page);
  const candidatos = await page.evaluate((max) => {
    const ay = window.__a11yAy;
    const out = [];
    const textos = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, span, li, label, figcaption, blockquote, strong, em, small, div')];
    const conTexto = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    const parseColor = (s) => {
      const m = s.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?/);
      if (!m) return null;
      return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a: m[4] === undefined ? 1 : parseFloat(m[4]) / (m[4].endsWith('%') ? 100 : 1) };
    };
    let i = 0;
    for (const el of textos) {
      if (!conTexto(el) || !ay.visible(el)) continue;
      const b = el.getBoundingClientRect();
      if (b.width < 8 || b.height < 8) continue;
      const cs = getComputedStyle(el);
      const color = parseColor(cs.color);
      if (!color || color.a < 0.99) continue; // color translúcido: lo mira axe o la revisión manual

      // ¿Hay fondo opaco antes de llegar a una imagen?
      let media = null;
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const ncs = getComputedStyle(n);
        if (ncs.backgroundImage !== 'none' && /url\(/.test(ncs.backgroundImage)) { media = 'imagen de fondo'; break; }
        const fondo = parseColor(ncs.backgroundColor);
        if (fondo && fondo.a > 0.99) break;
      }
      let esVideo = false;
      const cx = b.left + b.width / 2 + scrollX;
      const cy = b.top + b.height / 2 + scrollY;
      if (!media) {
        window.scrollTo(0, Math.max(0, cy - innerHeight / 2));
        const pila = document.elementsFromPoint(cx - scrollX, cy - scrollY);
        const idx = pila.indexOf(el);
        for (const n of idx >= 0 ? pila.slice(idx + 1) : []) {
          if (['IMG', 'VIDEO', 'CANVAS', 'PICTURE'].includes(n.tagName)) { media = n.tagName === 'VIDEO' ? 'vídeo' : 'imagen'; esVideo = n.tagName === 'VIDEO'; break; }
          const f = parseColor(getComputedStyle(n).backgroundColor);
          if (f && f.a > 0.99) break;
        }
      }
      if (!media) continue;
      el.setAttribute('data-a11y-media', String(i));
      const tam = parseFloat(cs.fontSize);
      const negrita = parseInt(cs.fontWeight, 10) >= 700;
      out.push({
        i, selector: ay.selector(el), media, esVideo, color: color.rgb,
        texto: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60),
        grande: tam >= 24 || (tam >= 18.66 && negrita),
        conSombra: cs.textShadow !== 'none' || (cs.webkitTextStrokeWidth && parseFloat(cs.webkitTextStrokeWidth) > 0),
      });
      i++;
      if (out.length >= max) break;
    }
    window.scrollTo(0, 0);
    return out;
  }, max);

  const hallazgos = [];
  const revisar = [];
  for (const c of candidatos) {
    const loc = page.locator(`[data-a11y-media="${c.i}"]`).first();
    const fracciones = [];
    try {
      await loc.scrollIntoViewIfNeeded({ timeout: 1500 });
      const estilo = await page.addStyleTag({ content: `[data-a11y-media="${c.i}"] { color: transparent !important; text-shadow: none !important; -webkit-text-stroke: 0 !important; caret-color: transparent !important; }` });
      for (let n = 0; n < (c.esVideo ? 3 : 1); n++) {
        if (n) await page.waitForTimeout(600);
        const png = await loc.screenshot({ timeout: 2500 });
        const pixeles = await decodificar(page, png);
        if (pixeles) fracciones.push(fraccionSinContraste(pixeles, c.color, c.grande ? 3 : 4.5));
      }
      await estilo.evaluate((n) => n.remove());
    } catch {
      continue;
    }
    if (!fracciones.length) continue;
    const peor = Math.max(...fracciones);
    const min = c.grande ? '3:1' : '4,5:1';
    const pct = Math.round(peor * 100);
    if (pct < 5) continue;
    const base = `Texto sobre ${c.media}: el ${pct} % del fondo no llega a ${min} con el color del texto`;
    if (pct >= 50 && !c.conSombra) {
      hallazgos.push({ regla: 'texto-sobre-media', impacto: 'serious', selector: c.selector, texto: c.texto, detalle: `${base}.` });
    } else {
      revisar.push({ regla: 'texto-sobre-media', selector: c.selector, detalle: `${base}${c.conSombra ? ' (tiene sombra o borde, que no se mide)' : ''}. «${c.texto}»` });
    }
  }
  return { hallazgos, revisar };
}

/** Decodifica un PNG en la propia página, sin dependencias. Devuelve píxeles RGBA. */
async function decodificar(page, png) {
  return page.evaluate(async (b64) => {
    try {
      const bin = atob(b64);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      const lienzo = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = lienzo.getContext('2d');
      ctx.drawImage(bmp, 0, 0);
      return Array.from(ctx.getImageData(0, 0, bmp.width, bmp.height).data);
    } catch {
      return null;
    }
  }, png.toString('base64'));
}

/**
 * Ejecuta los pasos de un estado interactivo definido por el usuario.
 * Pasos: { clic }, { pasar }, { foco }, { escribir: [sel, texto] }, { tecla }, { esperar }.
 */
export async function ejecutarPasos(page, pasos = []) {
  for (const p of pasos) {
    if (p.clic) await page.locator(p.clic).first().click({ timeout: 5000 });
    else if (p.pasar) await page.locator(p.pasar).first().hover({ timeout: 5000 });
    else if (p.foco) await page.locator(p.foco).first().focus({ timeout: 5000 });
    else if (p.escribir) await page.locator(p.escribir[0]).first().fill(p.escribir[1], { timeout: 5000 });
    else if (p.tecla) await page.keyboard.press(p.tecla);
    else if (p.esperar) await page.waitForTimeout(p.esperar);
    else throw new Error(`Paso desconocido: ${JSON.stringify(p)}`);
    await page.waitForTimeout(120);
  }
}

/** Valida el fichero de --estados. */
export function validarEstados(datos) {
  if (!Array.isArray(datos)) throw new Error('El fichero de estados debe ser una lista JSON.');
  for (const e of datos) {
    if (!e.nombre || !Array.isArray(e.pasos)) throw new Error('Cada estado necesita «nombre» y «pasos».');
    for (const p of e.pasos) {
      if (!['clic', 'pasar', 'foco', 'escribir', 'tecla', 'esperar'].some((k) => k in p)) {
        throw new Error(`Paso desconocido en «${e.nombre}»: ${JSON.stringify(p)}`);
      }
    }
  }
  return datos;
}

/** URLs de un sitemap (o índice de sitemaps), repartidas entre secciones. */
export function urlsDeSitemap(xml) {
  return [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'));
}

export function esIndiceSitemap(xml) {
  return /<sitemapindex[\s>]/i.test(String(xml));
}

/**
 * Elige hasta `max` URLs repartidas por primera sección de la ruta: una muestra
 * de 20 URLs no debería ser 20 fichas de producto.
 */
export function muestraPorSecciones(urls, max) {
  const secciones = new Map();
  for (const u of urls) {
    let clave = '/';
    try { clave = new URL(u).pathname.split('/')[1] ?? '/'; } catch { /* se deja en la raíz */ }
    if (!secciones.has(clave)) secciones.set(clave, []);
    secciones.get(clave).push(u);
  }
  const colas = [...secciones.values()];
  const out = [];
  while (out.length < max && colas.some((c) => c.length)) {
    for (const c of colas) {
      if (c.length && out.length < max) out.push(c.shift());
    }
  }
  return out;
}
