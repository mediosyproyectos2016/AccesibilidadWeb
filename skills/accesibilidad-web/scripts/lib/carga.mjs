// Navegar con un reintento. Va aparte para poder probarlo sin navegador ni reloj.

const ES_FALLO_DE_RED = /Timeout|net::ERR_/;

/**
 * Un reintento ante tiempos agotados y errores de red, que suelen ser pasajeros.
 * Una respuesta HTTP (403, 500…) no llega aquí como error y no se reintenta: un
 * bloqueo no se rodea.
 */
export async function irConReintento(page, url, opciones, { pausa = 1000 } = {}) {
  try {
    return await page.goto(url, opciones);
  } catch (e) {
    if (!ES_FALLO_DE_RED.test(e.message)) throw e;
    await page.waitForTimeout(pausa);
    return page.goto(url, opciones);
  }
}
