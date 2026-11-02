// Servidor local para los tests. Fuera de `test/` para que `node --test` no lo tome
// por un fichero de pruebas.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml', '.css': 'text/css' };

/** rutas: { '/': '<fichero>' | { texto, tipo } }. Se puede cambiar en caliente. */
export async function servir(rutas) {
  const estado = { rutas, peticiones: [] };
  const srv = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    estado.peticiones.push(url.pathname);
    const r = estado.rutas[url.pathname];
    if (!r) { res.writeHead(404); res.end('no'); return; }
    if (typeof r === 'function') { r(req, res); return; }
    if (typeof r === 'string') {
      res.writeHead(200, { 'content-type': TIPOS[path.extname(r)] ?? 'application/octet-stream' });
      res.end(readFileSync(r));
    } else {
      res.writeHead(200, { 'content-type': r.tipo ?? 'text/html; charset=utf-8' });
      res.end(r.texto);
    }
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${srv.address().port}`;
  return { base, estado, cerrar: () => new Promise((ok) => { srv.close(ok); srv.closeAllConnections(); }) };
}
