# React y Next.js

El HTML se genera: un selector de `informe.json` no es un fichero. Usa `priorizar.mjs --proyecto .` para llegar al componente, y arregla el componente compartido, no cada uso.

## Plantilla raíz

- **Next App Router:** `app/layout.tsx`.

  ```tsx
  export const metadata = { title: { default: 'Mi Tienda', template: '%s – Mi Tienda' } };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="es">
        <body>
          <a className="saltar" href="#principal">Saltar al contenido</a>
          <Cabecera />
          <main id="principal" tabIndex={-1}>{children}</main>
          <Pie />
        </body>
      </html>
    );
  }
  ```

- **Next Pages Router:** `<Html lang="es">` en `pages/_document.tsx`.
- **Vite o CRA:** `index.html` para `lang`; el título, con `<title>` en React 19 o `document.title` por ruta.

## Fallos típicos

```tsx
// Botón de icono: nombre accesible y svg oculto
<button type="button" aria-label="Cerrar carrito" onClick={cerrar}>
  <IconoCerrar aria-hidden="true" focusable="false" />
</button>

// Etiqueta asociada, sin id duplicados si el componente se repite
function Campo({ etiqueta, error, ...props }: CampoProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <p id={`${id}-error`}>{error}</p>}
    </>
  );
}

// next/image: alt siempre, vacío si es decorativa
<Image src={foto} alt={producto.alt ?? ''} width={400} height={300} />
```

## Diálogos

Usa `<dialog>` nativo: gestiona foco, `Esc` e inertes.

```tsx
const ref = useRef<HTMLDialogElement>(null);
useEffect(() => {
  const d = ref.current;
  if (abierto && !d?.open) d?.showModal();
  if (!abierto && d?.open) d.close();
}, [abierto]);
return <dialog ref={ref} aria-labelledby={idTitulo} onClose={alCerrar}>…</dialog>;
```

`showModal()` devuelve el foco por sí solo si el disparador sigue en el DOM; compruébalo. Si tu componente se desmonta al cerrar, guarda el disparador y devuélvele el foco tú.

## Navegación en cliente

Next App Router incluye un anunciador de rutas; comprueba con un lector de pantalla que se anuncia y dónde queda el foco. En otros routers, mueve el foco al `h1` o a `<main>` tras cambiar de ruta y da un título por ruta.

## Componentes de terceros

Antes de reinventar, usa una biblioteca cuidada (por ejemplo, Radix UI o React Aria) y compruébalo igualmente: una biblioteca buena mal usada falla igual.

## Hidratación

Un `aria-expanded` o un `id` que cambia entre servidor y cliente da fallos intermitentes. Usa `useId()` y audita la página ya hidratada, que es lo que hace `auditar.mjs`.

## Proteger lo arreglado

- `eslint-plugin-jsx-a11y` en el editor; `eslint-config-next` incluye una parte.
- `jest-axe` o `vitest-axe` en los tests de componentes; no ven color ni foco.
- `auditar.mjs --linea-base` en la CI.
