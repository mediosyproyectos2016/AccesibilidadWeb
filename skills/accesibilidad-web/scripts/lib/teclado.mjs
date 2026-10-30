// Comprobaciones automatizables de teclado y diseño adaptable.
// Son heurísticas: detectan síntomas claros, no sustituyen la revisión manual
// (references/revision-manual.md).

/** Información del elemento activo (atraviesa shadow DOM). Se ejecuta en la página. */
function infoFocoEnPagina() {
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;

  const selector = (n) => {
    if (n.id && /^[A-Za-z][\w-]*$/.test(n.id) && document.querySelectorAll(`#${n.id}`).length === 1) return `#${n.id}`;
    const partes = [];
    while (n && n.nodeType === 1 && n !== document.body && partes.length < 5) {
      let p = n.tagName.toLowerCase();
      if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) { partes.unshift(`#${n.id}`); break; }
      const padre = n.parentElement;
      if (padre) {
        const hermanos = [...padre.children].filter((h) => h.tagName === n.tagName);
        if (hermanos.length > 1) p += `:nth-of-type(${hermanos.indexOf(n) + 1})`;
      }
      partes.unshift(p);
      n = padre;
    }
    return partes.join(' > ');
  };

  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const texto = (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || el.getAttribute('alt') || '')
    .replace(/\s+/g, ' ').trim().slice(0, 70);

  // ¿Lo tapa algo (cabecera fija, banner de cookies)? Muestreo de 5 puntos.
  let puntosVisibles = 0;
  const puntos = [
    [r.left + r.width / 2, r.top + r.height / 2],
    [r.left + 2, r.top + 2], [r.right - 2, r.top + 2],
    [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2],
  ];
  for (const [x, y] of puntos) {
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
    const arriba = document.elementFromPoint(x, y);
    if (arriba && (arriba === el || el.contains(arriba) || arriba.contains(el))) puntosVisibles++;
  }

  // Zona de comparación: el elemento y hasta 3 antepasados de tamaño razonable
  // (tarjetas con enlace estirado o :focus-within pintan el foco en el contenedor).
  let zona = { l: r.left, t: r.top, r: r.right, b: r.bottom };
  let anc = el.parentElement;
  for (let i = 0; i < 3 && anc && anc !== document.body; i++, anc = anc.parentElement) {
    const ar = anc.getBoundingClientRect();
    if (ar.width * ar.height > innerWidth * innerHeight * 0.4) break;
    zona = { l: Math.min(zona.l, ar.left), t: Math.min(zona.t, ar.top), r: Math.max(zona.r, ar.right), b: Math.max(zona.b, ar.bottom) };
  }

  return {
    zona,
    selector: selector(el),
    etiqueta: el.tagName.toLowerCase(),
    rol: el.getAttribute('role') || '',
    texto,
    href: el.getAttribute('href') || '',
    rect: { x: r.left, y: r.top + scrollY, ancho: r.width, alto: r.height, top: r.top },
    tamañoCero: r.width < 1 || r.height < 1,
    transparente: Number(cs.opacity) === 0 || cs.visibility === 'hidden',
    fueraDeVista: r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth,
    puntosVisibles,
  };
}

/**
 * Recorre la página con Tab y detecta: foco sin indicador visible (2.4.7),
 * foco oculto o tapado (2.4.11), trampa de foco (2.1.2) y ausencia de enlace
 * «saltar al contenido» (2.4.1, aviso). Devuelve { pasos, hallazgos }.
 */
export async function revisarTeclado(page, { maxTabs = 40 } = {}) {
  const hallazgos = [];
  const pasos = [];
  // Si al cargar hay un diálogo modal abierto (promoción, cookies), se intenta
  // cerrar con Esc para recorrer la página; si no se cierra, se recorre el diálogo.
  const avisos = [];
  const hayModal = () => page.evaluate(() => [...document.querySelectorAll('dialog[open], [aria-modal="true"]')]
    .some((d) => { const r = d.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(d).visibility !== 'hidden'; }));
  if (await hayModal().catch(() => false)) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    if (await hayModal().catch(() => false)) avisos.push('Hay un diálogo modal abierto al cargar que no se cierra con Esc; el recorrido se hace dentro del diálogo.');
    else avisos.push('Había un diálogo modal abierto al cargar; se cerró con Esc antes del recorrido.');
  }

  // Punto de partida: el inicio del documento (como al cargar la página).
  await page.evaluate(() => {
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    window.scrollTo(0, 0);
    const b = document.body;
    const previo = b.getAttribute('tabindex');
    b.setAttribute('tabindex', '-1');
    b.focus({ preventScroll: true });
    if (previo === null) b.removeAttribute('tabindex'); else b.setAttribute('tabindex', previo);
  });

  let anterior = null;
  let repeticiones = 0;
  const vistos = new Set();

  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    const info = await page.evaluate(infoFocoEnPagina).catch(() => null);
    if (!info) break; // el foco salió del documento: fin del recorrido
    const clave = info.selector;
    if (clave === anterior) {
      repeticiones++;
      if (repeticiones >= 2) {
        hallazgos.push({ regla: 'trampa-foco', impacto: 'critical', selector: clave, detalle: 'Tab no saca el foco de este elemento.' });
        break;
      }
      continue;
    }
    repeticiones = 0;
    if (vistos.has(clave)) break; // dio la vuelta al documento
    vistos.add(clave);
    anterior = clave;

    // Foco visible: compara el recorte con foco y sin foco.
    let focoVisible = null;
    if (!info.tamañoCero && !info.fueraDeVista && !info.transparente) {
      const vp = page.viewportSize();
      const m = 6;
      const z = info.zona;
      const clip = {
        x: Math.max(0, z.l - m),
        y: Math.max(0, z.t - m),
        width: Math.min(vp.width, z.r - z.l + 2 * m),
        height: Math.min(vp.height, z.b - z.t + 2 * m),
      };
      clip.width = Math.min(clip.width, vp.width - clip.x);
      clip.height = Math.min(clip.height, vp.height - clip.y);
      if (clip.width >= 2 && clip.height >= 2) {
        try {
          const conFoco = await page.screenshot({ clip, animations: 'disabled', caret: 'initial' });
          const handle = await page.evaluateHandle(() => {
            let el = document.activeElement;
            while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
            el.blur();
            return el;
          });
          const sinFoco = await page.screenshot({ clip, animations: 'disabled', caret: 'initial' });
          await handle.evaluate((el) => el.focus({ preventScroll: true }));
          await handle.dispose();
          focoVisible = !conFoco.equals(sinFoco);
        } catch {
          focoVisible = null;
        }
      }
    }

    const paso = { orden: pasos.length + 1, ...info, focoVisible };
    pasos.push(paso);

    if (info.tamañoCero || info.transparente || info.fueraDeVista) {
      hallazgos.push({
        regla: 'foco-oculto', impacto: 'serious', selector: clave, texto: info.texto,
        detalle: info.tamañoCero ? 'Recibe foco pero mide 0 px.' : info.transparente ? 'Recibe foco pero es invisible (opacity/visibility).' : 'Recibe foco fuera de la zona visible.',
      });
    } else if (info.puntosVisibles === 0) {
      hallazgos.push({ regla: 'foco-oculto', impacto: 'serious', selector: clave, texto: info.texto, detalle: 'Recibe foco pero otro elemento lo tapa por completo (cabecera fija, banner…).' });
    } else if (focoVisible === false) {
      hallazgos.push({ regla: 'foco-no-visible', impacto: 'serious', selector: clave, texto: info.texto, detalle: 'Sin cambio visual al recibir el foco.' });
    }
  }

  const primero = pasos[0];
  const esSaltar = primero && primero.etiqueta === 'a' && primero.href.startsWith('#') &&
    /saltar|ir al (contenido|principal)|skip|contenido principal/i.test(primero.texto);
  if (pasos.length > 3 && !esSaltar) {
    hallazgos.push({ regla: 'sin-enlace-saltar', impacto: 'moderate', selector: primero.selector, texto: primero.texto, detalle: 'El primer Tab no lleva a un enlace «Saltar al contenido» (recomendado para 2.4.1).' });
  }
  return { pasos, hallazgos, avisos };
}

/** Reflow (1.4.10): a 320 px CSS de ancho no debe haber desplazamiento horizontal. */
export async function revisarReflow(page) {
  const original = page.viewportSize();
  await page.setViewportSize({ width: 320, height: original.height });
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const ancho = document.documentElement.clientWidth;
    const desborde = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
    const culpables = [];
    if (desborde > ancho + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const rr = el.getBoundingClientRect();
        if (rr.right > ancho + 1 && rr.width > 0 && getComputedStyle(el).position !== 'fixed') {
          // Quédate con el elemento más externo que desborda.
          if (!culpables.some((c) => c.contains(el))) culpables.push(el);
          if (culpables.length >= 5) break;
        }
      }
    }
    const sel = (n) => n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? '.' + [...n.classList].slice(0, 2).join('.') : '');
    return { ancho, desborde, culpables: culpables.map(sel) };
  });
  await page.setViewportSize(original);
  if (r.desborde <= r.ancho + 1) return [];
  return [{
    regla: 'reflow-320', impacto: 'serious',
    selector: r.culpables[0] || 'html',
    detalle: `A 320 px el contenido mide ${r.desborde} px de ancho (scroll horizontal). Elementos que desbordan: ${r.culpables.join(', ') || 'sin identificar'}.`,
  }];
}
