// Comprobaciones automatizables de teclado y diseño adaptable.
// Son heurísticas: detectan síntomas claros, no sustituyen la revisión manual
// (references/revision-manual.md).

/** Información del elemento activo (atraviesa shadow DOM). Se ejecuta en la página. */
function infoFocoEnPagina() {
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;

  // Dentro de shadow DOM el selector incluye la ruta hasta el anfitrión: dos
  // componentes con el mismo botón interno no son «el mismo elemento».
  const selectorEnRaiz = (n) => {
    const raiz = n.getRootNode();
    if (n.id && /^[A-Za-z][\w-]*$/.test(n.id) && raiz.querySelectorAll(`#${n.id}`).length === 1) return `#${n.id}`;
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
  const selector = (n) => {
    const tramos = [selectorEnRaiz(n)];
    for (let raiz = n.getRootNode(); raiz.host; raiz = raiz.host.getRootNode()) tramos.unshift(selectorEnRaiz(raiz.host));
    return tramos.join(' >>> ');
  };

  // Identidad real del elemento: dos enlaces con la misma ruta de selector (tarjetas
  // iguales, ruta cortada a 5 niveles) no son «el mismo» para detectar repeticiones.
  const registro = (window.__a11yFocoId ||= { ids: new WeakMap(), n: 0 });
  let id = registro.ids.get(el);
  if (!id) { id = ++registro.n; registro.ids.set(el, id); }

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
  // elementFromPoint se detiene en el anfitrión de un shadow DOM y contains no cruza
  // esa frontera: hay que bajar y subir a mano o todo componente web parecería tapado.
  const enPunto = (x, y) => {
    let e = document.elementFromPoint(x, y);
    while (e && e.shadowRoot) {
      const dentro = e.shadowRoot.elementFromPoint(x, y);
      if (!dentro || dentro === e) break;
      e = dentro;
    }
    return e;
  };
  const contieneCruzando = (padre, hijo) => {
    for (let n = hijo; n; n = n.parentNode || n.host) if (n === padre) return true;
    return false;
  };
  for (const [x, y] of puntos) {
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
    const arriba = enPunto(x, y);
    if (arriba && (contieneCruzando(el, arriba) || contieneCruzando(arriba, el))) puntosVisibles++;
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
    id,
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
 * Estilos del elemento enfocado, de hasta 3 antepasados y de sus ::before y ::after,
 * más la caja de cada pseudo-elemento y el recorte de los `overflow` que lo rodean.
 * Se ejecuta en la página, con el elemento enfocado y sin foco.
 */
function instantaneaFoco(el) {
  const PROPS = ['outline-style', 'outline-width', 'outline-color', 'outline-offset', 'box-shadow', 'border-top-style',
    'border-top-width', 'border-top-color', 'background-color', 'background-image', 'opacity', 'transform', 'content',
    'width', 'height', 'color', 'filter', 'text-decoration-line'];
  const leer = (n, pseudo) => {
    const cs = getComputedStyle(n, pseudo);
    return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
  };
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

  const cadena = [];
  let a = el;
  for (let i = 0; i < 4 && a && a !== document.body && a !== document.documentElement; i++, a = a.parentElement) cadena.push(JSON.stringify(leer(a)));

  const esContenedor = (n) => {
    const cs = getComputedStyle(n);
    return cs.position !== 'static' || cs.transform !== 'none' || cs.filter !== 'none' || /layout|paint|strict|content/.test(cs.contain || '');
  };
  let cb = el;
  while (cb && cb !== document.body && !esContenedor(cb)) cb = cb.parentElement;
  if (!cb || cb === document.body) cb = null;

  // Recorte de los antepasados con overflow. Un pseudo absoluto solo lo recortan su
  // bloque contenedor y los antepasados de este.
  const recorteDe = (abs) => {
    const c = { l: -Infinity, t: -Infinity, r: Infinity, b: Infinity };
    let contando = !abs;
    for (let n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      if (abs && n === cb) contando = true;
      if (!contando) continue;
      const cs = getComputedStyle(n);
      if (cs.display === 'inline') continue;
      const ox = cs.overflowX !== 'visible';
      const oy = cs.overflowY !== 'visible';
      if (!ox && !oy) continue;
      const r = n.getBoundingClientRect();
      const l = r.left + n.clientLeft;
      const t = r.top + n.clientTop;
      if (ox) { c.l = Math.max(c.l, l); c.r = Math.min(c.r, l + n.clientWidth); }
      if (oy) { c.t = Math.max(c.t, t); c.b = Math.min(c.b, t + n.clientHeight); }
    }
    return c;
  };

  const pseudos = {};
  for (const ps of ['::before', '::after']) {
    const cs = getComputedStyle(el, ps);
    if (cs.content === 'none' || cs.content === 'normal' || cs.display === 'none') continue;
    const abs = cs.position === 'absolute';
    let caja = null;
    if (abs && cb) {
      const rb = cb.getBoundingClientRect();
      const bl = rb.left + cb.clientLeft;
      const bt = rb.top + cb.clientTop;
      const br = bl + cb.clientWidth;
      const bb = bt + cb.clientHeight;
      let w = num(cs.width);
      let h = num(cs.height);
      if (cs.boxSizing === 'content-box' && w !== null && h !== null) {
        w += num(cs.paddingLeft) + num(cs.paddingRight) + num(cs.borderLeftWidth) + num(cs.borderRightWidth);
        h += num(cs.paddingTop) + num(cs.paddingBottom) + num(cs.borderTopWidth) + num(cs.borderBottomWidth);
      }
      const L = num(cs.left); const T = num(cs.top); const R = num(cs.right); const B = num(cs.bottom);
      const x = L !== null ? bl + L : R !== null && w !== null ? br - R - w : null;
      const y = T !== null ? bt + T : B !== null && h !== null ? bb - B - h : null;
      if (x !== null && y !== null && w !== null && h !== null) caja = { l: x, t: y, r: x + w, b: y + h };
    } else if (!abs) {
      const r = el.getBoundingClientRect();
      caja = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    }
    pseudos[ps] = { props: leer(el, ps), caja, recorte: recorteDe(abs) };
  }
  return { cadena, pseudos };
}

/**
 * Compara el estado con foco y sin foco de los pseudo-elementos. Devuelve
 * { cambia, recortado, elementoCambia, pseudo }: si algún ::before/::after cambia al
 * enfocar, si el anillo que dibuja (contorno, borde o sombra) queda del todo fuera
 * del recorte de un `overflow` (2.4.7: un anillo recortado no se ve) y si cambia
 * algo más en el elemento o sus antepasados cercanos.
 */
export function analizarAnillo(con, sin) {
  const px = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);
  // Cambios que no se pueden juzgar sin ver los píxeles: un relleno, un color o un filtro.
  const RELLENO = new Set(['background-color', 'background-image', 'color', 'filter', 'content', 'text-decoration-line']);
  let cambia = false;
  let otros = false;
  const anillos = [];
  for (const [ps, c] of Object.entries(con.pseudos)) {
    const s = sin.pseudos[ps];
    if (!s) { cambia = true; otros = true; continue; } // el pseudo solo existe con foco
    const distintas = Object.keys(c.props).filter((k) => c.props[k] !== s.props[k]);
    if (!distintas.length) continue;
    cambia = true;
    if (distintas.some((k) => RELLENO.has(k))) otros = true;
    if (!c.caja) { anillos.push({ ps, desconocido: true }); continue; }
    const k = c.caja;
    const ampliada = (m, g) => ({ caja: { l: k.l - m, t: k.t - m, r: k.r + m, b: k.b + m }, g, recorte: c.recorte });
    // Anillos que el pseudo dibuja con foco (aparezcan por opacidad, transformación o color).
    if (c.props['outline-style'] !== 'none' && px(c.props['outline-width']) > 0) {
      const g = Math.max(px(c.props['outline-width']), 1);
      anillos.push({ ps, ...ampliada(px(c.props['outline-offset']) + g, g) });
    }
    if (c.props['border-top-style'] !== 'none' && px(c.props['border-top-width']) > 0) {
      anillos.push({ ps, ...ampliada(0, px(c.props['border-top-width'])) });
    }
    if (c.props['box-shadow'] !== 'none') {
      const medidas = [...c.props['box-shadow'].matchAll(/(-?\d*\.?\d+)px/g)].map((m) => parseFloat(m[1]));
      const spread = Math.max(medidas[3] ?? 0, 0);
      anillos.push({ ps, ...ampliada(spread, Math.max(spread, medidas[2] ?? 0, 1)) });
    }
  }
  // Cada lado del anillo es una banda de grosor g pegada al borde exterior: se ve
  // si esa banda cae, aunque sea en parte, dentro del recorte.
  const oculto = (a) => {
    if (a.desconocido) return false;
    const { caja: o, g, recorte: r } = a;
    const fuera = o.r <= r.l || o.l >= r.r || o.b <= r.t || o.t >= r.b;
    return fuera || (o.l + g <= r.l && o.r - g >= r.r && o.t + g <= r.t && o.b - g >= r.b);
  };
  const recortado = anillos.length > 0 && !otros && anillos.every(oculto);
  const elementoCambia = con.cadena.join('|') !== sin.cadena.join('|');
  return { cambia, recortado, elementoCambia, pseudo: anillos[0]?.ps ?? null };
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
  const hayModal = () => page.evaluate(() => {
    const buscar = (raiz) => [
      ...raiz.querySelectorAll('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"]'),
      ...[...raiz.querySelectorAll('*')].flatMap((e) => (e.shadowRoot ? buscar(e.shadowRoot) : [])),
    ];
    return buscar(document).some((d) => {
      const r = d.getBoundingClientRect();
      const cs = getComputedStyle(d);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    });
  });
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

  await page.evaluate(() => { delete window.__a11yFocoId; }).catch(() => {});
  let anterior = null;
  let repeticiones = 0;
  let enIframe = 0;
  const vistos = new Set();

  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    const info = await page.evaluate(infoFocoEnPagina).catch(() => null);
    if (!info) break; // el foco salió del documento: fin del recorrido
    // Repeticiones y ciclos se miden por identidad del elemento, no por su selector,
    // que puede coincidir entre elementos distintos (tarjetas iguales).
    const clave = `#${info.id}`;
    // Un iframe conserva el foco mientras se recorre su interior: Tab repetido en
    // el mismo iframe no es una trampa. Su contenido se revisa aparte o a mano.
    if (clave === anterior && info.etiqueta === 'iframe') {
      if (++enIframe > 60) break;
      continue;
    }
    if (clave === anterior) {
      repeticiones++;
      if (repeticiones >= 2) {
        // Un diálogo con un solo control retiene el foco en él a propósito.
        if (!(await hayModal().catch(() => false))) {
          hallazgos.push({ regla: 'trampa-foco', impacto: 'critical', selector: info.selector, detalle: 'Tab no saca el foco de este elemento.' });
        }
        break;
      }
      continue;
    }
    repeticiones = 0;
    if (vistos.has(clave)) {
      // En Chromium, tras el último elemento el foco pasa por la interfaz del
      // navegador (activeElement = body) y ahí acaba el recorrido. Volver a un
      // elemento ya visitado sin haber salido es un ciclo: la página retiene el foco.
      // Dentro de un diálogo modal ese ciclo es justo lo que debe pasar.
      if (!(await hayModal().catch(() => false))) {
        hallazgos.push({ regla: 'trampa-foco', impacto: 'critical', selector: info.selector, texto: info.texto, detalle: `Tab vuelve a este elemento tras ${pasos.length} paradas sin salir del ciclo: no se llega al resto de la página ni se sale de ella.` });
      }
      break;
    }
    vistos.add(clave);
    anterior = clave;

    // Foco visible: compara el recorte con foco y sin foco.
    let focoVisible = null;
    let anillo = null;
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
            return el;
          });
          const estCon = await handle.evaluate(instantaneaFoco).catch(() => null);
          await handle.evaluate((el) => el.blur());
          const sinFoco = await page.screenshot({ clip, animations: 'disabled', caret: 'initial' });
          const estSin = await handle.evaluate(instantaneaFoco).catch(() => null);
          await handle.evaluate((el) => el.focus({ preventScroll: true }));
          await handle.dispose();
          focoVisible = !conFoco.equals(sinFoco);
          if (estCon && estSin) anillo = analizarAnillo(estCon, estSin);
        } catch {
          focoVisible = null;
        }
      }
    }

    const paso = { orden: pasos.length + 1, ...info, focoVisible };
    pasos.push(paso);

    if (info.tamañoCero || info.transparente || info.fueraDeVista) {
      hallazgos.push({
        regla: 'foco-oculto', impacto: 'serious', selector: info.selector, texto: info.texto,
        detalle: info.tamañoCero ? 'Recibe foco pero mide 0 px.' : info.transparente ? 'Recibe foco pero es invisible (opacity/visibility).' : 'Recibe foco fuera de la zona visible.',
      });
    } else if (info.puntosVisibles === 0) {
      hallazgos.push({ regla: 'foco-oculto', impacto: 'serious', selector: info.selector, texto: info.texto, detalle: 'Recibe foco pero otro elemento lo tapa por completo (cabecera fija, banner…).' });
    } else if (anillo?.recortado && (focoVisible === false || !anillo.elementoCambia)) {
      // El anillo se pinta en ::before/::after y un `overflow` ajeno lo recorta del todo.
      hallazgos.push({
        regla: 'foco-no-visible', impacto: 'serious', selector: info.selector, texto: info.texto,
        detalle: `El anillo de foco se pinta en ${anillo.pseudo} pero lo recorta el overflow de un antepasado: no se ve (2.4.7). Mueve el anillo hacia dentro o quita el recorte.`,
      });
    } else if (focoVisible === false && anillo?.cambia) {
      // Los píxeles no cambian dentro de la zona medida, pero un ::before/::after sí
      // cambia al enfocar y no está recortado: el anillo cae fuera de la captura.
      paso.focoVisible = true;
    } else if (focoVisible === false) {
      hallazgos.push({ regla: 'foco-no-visible', impacto: 'serious', selector: info.selector, texto: info.texto, detalle: 'Sin cambio visual al recibir el foco.' });
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
    // ¿Lo recorta un antepasado? Un elemento absoluto solo lo recortan su bloque
    // contenedor y los antepasados de este: sin antepasado posicionado, escapa de un
    // overflow y es el que da el scroll de la página.
    const recortado = (el) => {
      let buscandoBloque = getComputedStyle(el).position === 'absolute';
      for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (buscandoBloque) {
          if (cs.position === 'static' && cs.transform === 'none') continue;
          buscandoBloque = false;
        }
        if (cs.overflowX !== 'visible') return true;
      }
      return false;
    };
    const soloLector = [];
    if (desborde > ancho + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const rr = el.getBoundingClientRect();
        if (rr.right > ancho + 1 && rr.width > 0 && getComputedStyle(el).position !== 'fixed' && !recortado(el)) {
          // Quédate con el elemento más externo que desborda.
          if (!culpables.some((c) => c.contains(el))) culpables.push(el);
          if (rr.width <= 2 && rr.height <= 2 && getComputedStyle(el).position === 'absolute') soloLector.push(el);
          if (culpables.length >= 5) break;
        }
      }
    }
    const sel = (n) => n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? '.' + [...n.classList].slice(0, 2).join('.') : '');
    return { ancho, desborde, culpables: culpables.map(sel), soloLector: soloLector.map(sel) };
  });
  await page.setViewportSize(original);
  if (r.desborde <= r.ancho + 1) return [];
  return [{
    regla: 'reflow-320', impacto: 'serious',
    selector: r.culpables[0] || 'html',
    detalle: `A 320 px el contenido mide ${r.desborde} px de ancho (scroll horizontal). Elementos que desbordan: ${r.culpables.join(', ') || 'sin identificar'}.${r.soloLector.length ? ` Texto solo para lectores de pantalla que escapa de su contenedor (${r.soloLector.join(', ')}): pon position: relative en el contenedor con overflow.` : ''}`,
  }];
}
