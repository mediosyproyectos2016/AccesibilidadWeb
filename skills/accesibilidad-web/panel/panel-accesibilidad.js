/*!
 * Panel de preferencias de accesibilidad · AccesibilidadWeb · MIT
 * https://github.com/mediosyproyectos2016/AccesibilidadWeb
 *
 * Una COMODIDAD para quien visita la web, no una forma de cumplir la normativa:
 * no corrige el código de la web ni la hace conforme con WCAG, EN 301 549, la
 * Ley 11/2023 ni el RD 1112/2018. Los fallos se arreglan en el código.
 *
 * Sin dependencias, sin rastreo y sin peticiones de red. Solo guarda en
 * localStorage las preferencias que la persona cambia, y solo cuando las cambia.
 *
 * Uso: <script src="panel-accesibilidad.js" defer></script>
 *   añade un botón flotante. Mejor, si tienes sitio en el pie o la cabecera:
 *   <panel-accesibilidad modo="en-linea" declaracion="/accesibilidad"></panel-accesibilidad>
 *   <script src="panel-accesibilidad.js" data-sin-boton defer></script>
 *
 * Atributos: modo="flotante|en-linea", posicion="derecha|izquierda",
 * idioma="es|en", declaracion="<url>".
 * API: panel.abrir(), panel.cerrar(), panel.preferencias, panel.restablecer().
 * Evento en document: "panel-accesibilidad:cambio", con detail = preferencias.
 */
(() => {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || customElements.get('panel-accesibilidad')) return;

  const CLAVE = 'panel-accesibilidad:v1';
  const POR_DEFECTO = Object.freeze({
    texto: 100, contraste: 'normal', espaciado: false, subrayado: false, animaciones: false, fuente: false,
  });
  const TAMANOS = [100, 115, 130, 150, 175, 200];

  const TEXTOS = {
    es: {
      abrir: 'Preferencias de visualización',
      titulo: 'Preferencias de visualización',
      intro: 'Ajusta cómo ves esta web en este navegador. Se guarda solo aquí y no se envía a ningún sitio.',
      texto: 'Tamaño del texto',
      contraste: 'Contraste',
      contrasteNormal: 'El de la web',
      contrasteClaro: 'Alto, fondo claro',
      contrasteOscuro: 'Alto, fondo oscuro',
      espaciado: 'Más espacio entre líneas, letras y palabras',
      subrayado: 'Subrayar los enlaces',
      animaciones: 'Parar animaciones y vídeos automáticos',
      fuente: 'Usar una fuente sencilla del sistema',
      restablecer: 'Restablecer',
      cerrar: 'Cerrar',
      aviso: 'Estos ajustes son una comodidad: no hacen accesible la web ni sustituyen a los de tu sistema, tu navegador o tu lector de pantalla, que siguen funcionando igual.',
      declaracion: 'Declaración de accesibilidad',
      aplicado: 'Preferencia aplicada.',
      restablecido: 'Preferencias restablecidas.',
    },
    en: {
      abrir: 'Display preferences',
      titulo: 'Display preferences',
      intro: 'Adjust how you see this website in this browser. Saved only here and never sent anywhere.',
      texto: 'Text size',
      contraste: 'Contrast',
      contrasteNormal: 'Website default',
      contrasteClaro: 'High, light background',
      contrasteOscuro: 'High, dark background',
      espaciado: 'More space between lines, letters and words',
      subrayado: 'Underline links',
      animaciones: 'Stop animations and autoplaying videos',
      fuente: 'Use a plain system font',
      restablecer: 'Reset',
      cerrar: 'Close',
      aviso: 'These settings are a convenience: they do not make the website accessible and do not replace those of your system, browser or screen reader, which keep working as usual.',
      declaracion: 'Accessibility statement',
      aplicado: 'Preference applied.',
      restablecido: 'Preferences reset.',
    },
  };

  /* Estilos que se aplican a la página. Cada grupo depende de un atributo en <html>. */
  const SIN_ICONOS = ':not(i):not(svg):not(svg *):not([class*="icon" i]):not([class*="fa-"]):not([class*="material-symbols"])';
  const CSS_PAGINA = `
html[data-pa-espaciado] body *:not(svg):not(svg *) {
  line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important;
}
html[data-pa-espaciado] body p { margin-bottom: 2em !important; }
html[data-pa-subrayado] body a[href] { text-decoration: underline !important; text-underline-offset: .15em; }
html[data-pa-fuente] body, html[data-pa-fuente] body *${SIN_ICONOS} {
  font-family: Verdana, Tahoma, "Segoe UI", Arial, sans-serif !important;
}
html[data-pa-animaciones] *, html[data-pa-animaciones] *::before, html[data-pa-animaciones] *::after {
  animation-duration: .001ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important;
  transition-duration: .001ms !important; transition-delay: 0s !important; scroll-behavior: auto !important;
}
html[data-pa-contraste] body, html[data-pa-contraste] body *:not(img):not(video):not(canvas):not(picture):not(iframe):not(svg):not(svg *) {
  background-color: var(--pa-fondo) !important; background-image: none !important;
  color: var(--pa-texto) !important; border-color: var(--pa-texto) !important;
  text-shadow: none !important; box-shadow: none !important;
}
html[data-pa-contraste] body a[href], html[data-pa-contraste] body a[href] * {
  color: var(--pa-enlace) !important; text-decoration: underline !important;
}
html[data-pa-contraste] body :focus-visible { outline: 3px solid var(--pa-enlace) !important; outline-offset: 2px !important; }
html[data-pa-contraste="claro"] { --pa-fondo: #fff; --pa-texto: #000; --pa-enlace: #00339a; }
html[data-pa-contraste="oscuro"] { --pa-fondo: #000; --pa-texto: #fff; --pa-enlace: #ffeb3b; }
`;

  const CSS_COMPONENTE = `
:host { all: initial; display: inline-block; font-size: 16px; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a1a; line-height: 1.4; }
:host([modo="flotante"]) { position: fixed; bottom: 1rem; inset-inline-end: 1rem; z-index: 2147483000; }
:host([modo="flotante"][posicion="izquierda"]) { inset-inline-end: auto; inset-inline-start: 1rem; }
*, *::before, *::after { box-sizing: border-box; }
button, select { font: inherit; }
.abrir, .accion {
  display: inline-flex; align-items: center; justify-content: center; gap: .4em; min-height: 44px; min-width: 44px;
  padding: .5em .8em; border: 2px solid #1a1a1a; border-radius: 8px; background: #fff; color: #1a1a1a; cursor: pointer;
}
.abrir:hover, .accion:hover { background: #e8e8e8; }
:host([modo="flotante"]) .abrir { padding: .5em; border-radius: 50%; width: 48px; height: 48px; background: #1a1a1a; border-color: #fff; color: #fff; box-shadow: 0 2px 8px rgb(0 0 0 / .35); }
:host([modo="flotante"]) .abrir:hover { background: #3a3a3a; }
:focus-visible { outline: 3px solid #0b57d0; outline-offset: 2px; }
.abrir svg { width: 24px; height: 24px; flex: none; }
.oculto { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
dialog {
  width: min(26rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); overflow: auto;
  padding: 1rem 1.25rem 1.25rem; border: 2px solid #1a1a1a; border-radius: 12px; background: #fff; color: #1a1a1a;
}
dialog::backdrop { background: rgb(0 0 0 / .45); }
h2 { margin: 0 0 .5rem; font-size: 1.25em; line-height: 1.25; }
p { margin: 0 0 .75rem; }
.cabecera { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; }
.grupo { margin: 0 0 1rem; padding: 0; border: 0; }
.etiqueta, legend { display: block; margin-bottom: .35rem; padding: 0; font-weight: 600; }
select { width: 100%; min-height: 44px; padding: .4em; border: 2px solid #1a1a1a; border-radius: 8px; background: #fff; color: #1a1a1a; }
.opcion { display: flex; align-items: center; gap: .6rem; min-height: 44px; padding: .15rem 0; cursor: pointer; }
.opcion input { width: 24px; height: 24px; margin: 0; flex: none; accent-color: #0b57d0; }
.acciones { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: .75rem; }
.aviso { font-size: .875em; color: #3d3d3d; }
.aviso a { color: #0b57d0; }
@media (prefers-color-scheme: dark) {
  dialog, select, .abrir, .accion { background: #1e1e1e; color: #f2f2f2; border-color: #f2f2f2; }
  .abrir:hover, .accion:hover { background: #383838; }
  :host([modo="flotante"]) .abrir { background: #f2f2f2; color: #1e1e1e; border-color: #1e1e1e; }
  :host([modo="flotante"]) .abrir:hover { background: #d0d0d0; }
  .aviso { color: #d0d0d0; }
  .aviso a { color: #9dc1ff; }
  :focus-visible { outline-color: #9dc1ff; }
  .opcion input { accent-color: #9dc1ff; }
}
@media (forced-colors: active) {
  .abrir, .accion, dialog, select { border-color: ButtonText; }
  :focus-visible { outline-color: Highlight; }
}
@media (prefers-reduced-motion: no-preference) {
  .abrir, .accion { transition: background-color .12s; }
}
`;

  /* ---------- Almacenamiento: tolera modos privados y bloqueos ---------- */
  /* Sin nada guardado se parte de lo que pide el sistema, que no se guarda. */
  const pideReducir = () => !!window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base = () => ({ ...POR_DEFECTO, animaciones: pideReducir() });
  const leer = () => {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return base();
      const d = JSON.parse(crudo);
      return {
        texto: TAMANOS.includes(d.texto) ? d.texto : 100,
        contraste: ['normal', 'claro', 'oscuro'].includes(d.contraste) ? d.contraste : 'normal',
        espaciado: d.espaciado === true,
        subrayado: d.subrayado === true,
        animaciones: d.animaciones === true,
        fuente: d.fuente === true,
      };
    } catch {
      return base();
    }
  };
  const esDefecto = (p) => { const b = base(); return Object.keys(b).every((k) => p[k] === b[k]); };
  const guardar = (p) => {
    try {
      // Sin preferencias no se deja nada en el navegador.
      if (esDefecto(p)) localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, JSON.stringify(p));
    } catch { /* sin almacenamiento: los ajustes duran solo esta página */ }
  };

  /* ---------- Aplicar a la página ---------- */
  let estiloPuesto = false;
  const ponerEstilo = () => {
    if (estiloPuesto || document.getElementById('panel-accesibilidad-estilos')) { estiloPuesto = true; return; }
    const s = document.createElement('style');
    s.id = 'panel-accesibilidad-estilos';
    s.textContent = CSS_PAGINA;
    (document.head || document.documentElement).appendChild(s);
    estiloPuesto = true;
  };
  const marca = (raiz, nombre, valor) => {
    if (valor) raiz.setAttribute(`data-pa-${nombre}`, valor === true ? '' : valor);
    else raiz.removeAttribute(`data-pa-${nombre}`);
  };

  /* Vídeos que paró el panel, para reanudar solo esos. */
  const pausados = new WeakSet();
  const aplicarVideos = (parar) => {
    for (const v of document.querySelectorAll('video')) {
      if (parar && !v.paused && (v.autoplay || v.loop || v.muted)) {
        v.pause();
        pausados.add(v);
      } else if (!parar && pausados.has(v)) {
        pausados.delete(v);
        v.play().catch(() => {});
      }
    }
  };

  /* El tamaño se aplica en <html> para que escalen las medidas en rem. Si la web usa
     px y el texto no cambia, se recurre a `zoom`, que amplía todo. */
  const aplicarTexto = (raiz, valor) => {
    raiz.style.removeProperty('zoom');
    raiz.style.removeProperty('font-size');
    if (!raiz.getAttribute('style')) raiz.removeAttribute('style');
    if (valor === 100) return;
    const objetivo = document.body || raiz;
    const antes = parseFloat(getComputedStyle(objetivo).fontSize);
    raiz.style.setProperty('font-size', `${valor}%`);
    const despues = parseFloat(getComputedStyle(objetivo).fontSize);
    if (document.body && Math.abs(despues - antes) < 0.5) {
      raiz.style.removeProperty('font-size');
      raiz.style.setProperty('zoom', `${valor}%`);
    }
  };

  const aplicar = (p) => {
    ponerEstilo();
    const raiz = document.documentElement;
    aplicarTexto(raiz, p.texto);
    marca(raiz, 'espaciado', p.espaciado);
    marca(raiz, 'subrayado', p.subrayado);
    marca(raiz, 'fuente', p.fuente);
    marca(raiz, 'animaciones', p.animaciones);
    marca(raiz, 'contraste', p.contraste === 'normal' ? false : p.contraste);
    if (document.body) aplicarVideos(p.animaciones);
  };

  /* Aplica lo guardado cuanto antes para que la página no parpadee al cargar. */
  const inicial = leer();
  if (!esDefecto(inicial)) aplicar(inicial);

  let contador = 0;

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* Solo direcciones web o relativas: nada de javascript: ni data:. */
  const urlSegura = (u) => {
    if (!u) return null;
    try {
      return ['http:', 'https:'].includes(new URL(u, location.href).protocol) ? u : null;
    } catch {
      return null;
    }
  };

  class PanelAccesibilidad extends HTMLElement {
    constructor() {
      super();
      this.preferencias = leer();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      if (this.shadowRoot.childElementCount) return;
      if (!this.hasAttribute('modo')) this.setAttribute('modo', 'flotante');
      const idioma = (this.getAttribute('idioma') || document.documentElement.lang || 'es').slice(0, 2).toLowerCase();
      const textos = { ...(TEXTOS[idioma] || TEXTOS.es), ...(window.panelAccesibilidadTextos || {}) };
      this.t = textos;
      const t = Object.fromEntries(Object.entries(textos).map(([k, v]) => [k, esc(v)]));
      const id = `pa-${++contador}`;
      const decl = urlSegura(this.getAttribute('declaracion'));
      const opcion = (clave) => `
        <label class="opcion"><input type="checkbox" name="${clave}"><span>${t[clave]}</span></label>`;

      this.shadowRoot.innerHTML = `
<style>${CSS_COMPONENTE}</style>
<button type="button" class="abrir" aria-haspopup="dialog" part="boton">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>
  </svg>
  <span class="${this.getAttribute('modo') === 'flotante' ? 'oculto' : ''}">${t.abrir}</span>
</button>
<dialog aria-labelledby="${id}-titulo" part="dialogo">
  <div class="cabecera">
    <h2 id="${id}-titulo">${t.titulo}</h2>
    <button type="button" class="accion" data-accion="cerrar">${t.cerrar}</button>
  </div>
  <p>${t.intro}</p>
  <form method="dialog" novalidate>
    <div class="grupo">
      <label class="etiqueta" for="${id}-texto">${t.texto}</label>
      <select id="${id}-texto" name="texto">
        ${TAMANOS.map((n) => `<option value="${n}">${n} %</option>`).join('')}
      </select>
    </div>
    <div class="grupo">
      <label class="etiqueta" for="${id}-contraste">${t.contraste}</label>
      <select id="${id}-contraste" name="contraste">
        <option value="normal">${t.contrasteNormal}</option>
        <option value="claro">${t.contrasteClaro}</option>
        <option value="oscuro">${t.contrasteOscuro}</option>
      </select>
    </div>
    <div class="grupo">
      ${['espaciado', 'subrayado', 'animaciones', 'fuente'].map(opcion).join('')}
    </div>
    <div class="acciones">
      <button type="button" class="accion" data-accion="restablecer">${t.restablecer}</button>
    </div>
  </form>
  <p class="oculto" role="status" data-estado></p>
  <p class="aviso">${t.aviso}${decl ? ` <a href="${esc(decl)}">${t.declaracion}</a>` : ''}</p>
</dialog>`;

      const raiz = this.shadowRoot;
      this.dialogo = raiz.querySelector('dialog');
      this.boton = raiz.querySelector('.abrir');
      this.formulario = raiz.querySelector('form');
      this.estado = raiz.querySelector('[data-estado]');

      this.boton.addEventListener('click', () => this.abrir());
      raiz.querySelector('[data-accion="cerrar"]').addEventListener('click', () => this.cerrar());
      raiz.querySelector('[data-accion="restablecer"]').addEventListener('click', () => this.restablecer());
      this.dialogo.addEventListener('close', () => this.boton.focus());
      this.dialogo.addEventListener('click', (e) => { if (e.target === this.dialogo) this.cerrar(); });
      this.formulario.addEventListener('submit', (e) => e.preventDefault());
      this.formulario.addEventListener('change', () => this.leerFormulario());

      this.pintarFormulario();
      aplicar(this.preferencias);
      this.ajustarTamano();
    }

    /* El panel crece con el texto. Va en px porque muchas webs cambian el tamaño
       raíz (62,5 %) y el panel se quedaría ilegible; con zoom ya escala solo. */
    ajustarTamano() {
      const conZoom = !!document.documentElement.style.getPropertyValue('zoom');
      this.style.fontSize = conZoom ? '16px' : `${(16 * this.preferencias.texto) / 100}px`;
    }

    pintarFormulario() {
      const el = this.formulario.elements;
      el.texto.value = String(this.preferencias.texto);
      el.contraste.value = this.preferencias.contraste;
      for (const k of ['espaciado', 'subrayado', 'animaciones', 'fuente']) el[k].checked = this.preferencias[k];
    }

    leerFormulario() {
      const el = this.formulario.elements;
      this.cambiar({
        texto: Number(el.texto.value),
        contraste: el.contraste.value,
        espaciado: el.espaciado.checked,
        subrayado: el.subrayado.checked,
        animaciones: el.animaciones.checked,
        fuente: el.fuente.checked,
      }, this.t.aplicado);
    }

    cambiar(p, mensaje) {
      this.preferencias = p;
      guardar(p);
      aplicar(p);
      this.ajustarTamano();
      // Se vacía antes de escribir para que el lector anuncie mensajes repetidos.
      this.estado.textContent = '';
      setTimeout(() => { if (this.estado) this.estado.textContent = mensaje; }, 60);
      document.dispatchEvent(new CustomEvent('panel-accesibilidad:cambio', { detail: { ...p } }));
    }

    restablecer() {
      this.cambiar(base(), this.t.restablecido);
      this.pintarFormulario();
    }

    abrir() {
      if (!this.dialogo.open) this.dialogo.showModal();
    }

    cerrar() {
      if (this.dialogo.open) this.dialogo.close();
    }
  }

  customElements.define('panel-accesibilidad', PanelAccesibilidad);

  /* Instalación automática: basta con el <script>, salvo que la página ya tenga el
     elemento o el script lleve data-sin-boton. */
  const script = document.currentScript;
  const sinBoton = !!script && script.hasAttribute('data-sin-boton');
  const instalar = () => {
    if (sinBoton || document.querySelector('panel-accesibilidad')) return;
    const panel = document.createElement('panel-accesibilidad');
    for (const a of ['modo', 'idioma', 'posicion', 'declaracion']) {
      const v = script && script.getAttribute(`data-${a}`);
      if (v) panel.setAttribute(a, v);
    }
    document.body.appendChild(panel);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', instalar);
  else instalar();
})();
