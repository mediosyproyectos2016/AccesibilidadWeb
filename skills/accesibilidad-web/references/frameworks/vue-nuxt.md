# Vue y Nuxt

## Plantilla raíz

- **Vue con Vite:** `index.html` (`lang`, viewport) y `src/App.vue` (enlace de salto y regiones).
- **Nuxt:** `nuxt.config.ts` para los valores comunes y `app.vue` o `layouts/default.vue` para la estructura.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: { head: { htmlAttrs: { lang: 'es' }, titleTemplate: '%s – Mi Tienda' } },
});
```

```vue
<!-- layouts/default.vue -->
<template>
  <a class="saltar" href="#principal">Saltar al contenido</a>
  <Cabecera />
  <main id="principal" tabindex="-1"><slot /></main>
  <Pie />
</template>
```

Título por página: `useHead({ title: 'Ofertas' })` o `useSeoMeta`.

## Fallos típicos

```vue
<script setup>
const id = useId(); // Vue 3.5 o posterior; antes, una prop o un contador
</script>

<template>
  <!-- Botón de icono -->
  <button type="button" aria-label="Cerrar carrito" @click="cerrar">
    <IconoCerrar aria-hidden="true" />
  </button>

  <!-- Etiqueta y error -->
  <label :for="id">Correo electrónico</label>
  <input :id="id" v-model="correo" type="email" autocomplete="email"
    :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined">
  <p v-if="error" :id="`${id}-error`">{{ error }}</p>

  <!-- Desplegable: aria-expanded debe seguir al estado -->
  <button type="button" :aria-expanded="abierto" aria-controls="menu" @click="abierto = !abierto">Menú</button>
  <ul id="menu" v-show="abierto">…</ul>
</template>
```

`v-html` no te libra: el contenido que inserta debe ser accesible. Con atributos booleanos ARIA, pasa cadenas o usa `String(valor)` donde hagan falta: `aria-expanded` debe valer `"true"` o `"false"`, no desaparecer.

## Diálogos

Usa `<dialog>` con `showModal()` en un `ref`. Si usas `<Teleport>`, comprueba el orden del foco y devuélvelo al disparador al cerrar.

## Navegación en cliente

Vue Router no mueve el foco. Nuxt ofrece `<NuxtRouteAnnouncer>` en versiones recientes; compruébalo con un lector. Sin él, usa `router.afterEach` para enfocar `<main>` y actualizar el título.

## Proteger lo arreglado

`eslint-plugin-vuejs-accessibility` en el editor, `vitest-axe` en componentes y `auditar.mjs --linea-base` en la CI.
