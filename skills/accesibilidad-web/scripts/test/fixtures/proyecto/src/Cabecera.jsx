export default function Cabecera() {
  return (
    <header>
      <button className="abrir-carrito" tabIndex={3} aria-label="Abrir carrito">
        <svg width="16" height="16" />
      </button>
      <img className="logo-marca" src="/logo-mi-tienda.png" />
      <a href="/ofertas-de-temporada" className="tarjeta-oferta">Ver todas las ofertas</a>
    </header>
  );
}
