// Envoltorio de React para el panel de preferencias de accesibilidad.
// Copia también panel-accesibilidad.js en tu proyecto y ajusta la ruta de la importación.
//
//   <PanelAccesibilidad modo="en-linea" declaracion="/accesibilidad"
//     alCambiar={(preferencias) => console.log(preferencias)} />
//
// El panel es una comodidad para quien visita la web: no la hace conforme con
// ninguna norma ni sustituye arreglar el código.
// En Next.js App Router, usa este fichero desde un componente con 'use client'.
import { createElement, useEffect } from 'react';

export default function PanelAccesibilidad({ modo = 'en-linea', posicion, idioma, declaracion, alCambiar }) {
  // Se importa en el cliente: el componente necesita window y customElements.
  useEffect(() => {
    import('../panel-accesibilidad.js');
  }, []);

  useEffect(() => {
    if (!alCambiar) return undefined;
    const oyente = (e) => alCambiar(e.detail);
    document.addEventListener('panel-accesibilidad:cambio', oyente);
    return () => document.removeEventListener('panel-accesibilidad:cambio', oyente);
  }, [alCambiar]);

  return createElement('panel-accesibilidad', { modo, posicion, idioma, declaracion });
}
