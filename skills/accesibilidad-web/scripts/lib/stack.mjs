// Detecta el stack de un proyecto y sus ficheros raíz. Es la versión ejecutable de
// references/deteccion-stack.md: orienta, no decide.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const STACKS = {
  next: { nombre: 'Next.js', guia: 'references/frameworks/react-next.md', raiz: ['app/layout.tsx', 'app/layout.jsx', 'app/layout.js', 'src/app/layout.tsx', 'src/app/layout.jsx', 'pages/_document.tsx', 'pages/_document.jsx', 'pages/_document.js', 'src/pages/_document.tsx'] },
  react: { nombre: 'React', guia: 'references/frameworks/react-next.md', raiz: ['index.html', 'public/index.html', 'src/App.tsx', 'src/App.jsx'] },
  nuxt: { nombre: 'Nuxt', guia: 'references/frameworks/vue-nuxt.md', raiz: ['nuxt.config.ts', 'nuxt.config.js', 'app.vue', 'layouts/default.vue'] },
  vue: { nombre: 'Vue', guia: 'references/frameworks/vue-nuxt.md', raiz: ['index.html', 'src/App.vue'] },
  astro: { nombre: 'Astro', guia: 'references/frameworks/astro.md', raiz: ['src/layouts/Layout.astro', 'src/layouts/BaseLayout.astro', 'src/layouts/Base.astro'] },
  svelte: { nombre: 'Svelte / SvelteKit', guia: 'references/frameworks/html.md', raiz: ['src/app.html', 'src/routes/+layout.svelte'] },
  angular: { nombre: 'Angular', guia: 'references/frameworks/html.md', raiz: ['src/index.html', 'src/app/app.component.html'] },
  wordpress: { nombre: 'WordPress', guia: 'references/frameworks/wordpress.md', raiz: ['header.php', 'footer.php', 'functions.php', 'theme.json'] },
  shopify: { nombre: 'Shopify', guia: 'references/frameworks/shopify.md', raiz: ['layout/theme.liquid'] },
  prestashop: { nombre: 'PrestaShop', guia: 'references/frameworks/html.md', raiz: ['templates/_partials/head.tpl', 'templates/layouts/layout-both-columns.tpl'] },
  drupal: { nombre: 'Drupal', guia: 'references/frameworks/html.md', raiz: ['templates/html.html.twig', 'templates/page.html.twig'] },
  laravel: { nombre: 'Laravel (Blade)', guia: 'references/frameworks/html.md', raiz: ['resources/views/layouts/app.blade.php', 'resources/views/app.blade.php'] },
  django: { nombre: 'Django / Flask (Jinja)', guia: 'references/frameworks/html.md', raiz: ['templates/base.html', 'templates/layout.html'] },
  symfony: { nombre: 'Symfony (Twig)', guia: 'references/frameworks/html.md', raiz: ['templates/base.html.twig'] },
  rails: { nombre: 'Rails (ERB)', guia: 'references/frameworks/html.md', raiz: ['app/views/layouts/application.html.erb'] },
  hugo: { nombre: 'Hugo', guia: 'references/frameworks/html.md', raiz: ['layouts/_default/baseof.html', 'layouts/partials/head.html'] },
  jekyll: { nombre: 'Jekyll', guia: 'references/frameworks/html.md', raiz: ['_layouts/default.html', '_includes/head.html'] },
  eleventy: { nombre: 'Eleventy', guia: 'references/frameworks/html.md', raiz: ['_includes/base.njk', '_includes/layouts/base.njk'] },
  html: { nombre: 'HTML estático', guia: 'references/frameworks/html.md', raiz: ['index.html'] },
  desconocido: { nombre: 'sin identificar', guia: 'references/frameworks/html.md', raiz: [] },
};

function dependencias(dir) {
  try {
    const p = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    return new Set(Object.keys({ ...p.dependencies, ...p.devDependencies }));
  } catch {
    return new Set();
  }
}

function hayExtension(dir, re) {
  try {
    return readdirSync(dir).some((n) => re.test(n));
  } catch {
    return false;
  }
}

/** Identificador del stack según los ficheros del proyecto. */
function identificar(dir) {
  const hay = (...r) => r.some((x) => existsSync(path.join(dir, x)));
  const dep = dependencias(dir);
  if (dep.has('next')) return 'next';
  if (dep.has('nuxt') || hay('nuxt.config.ts', 'nuxt.config.js')) return 'nuxt';
  if (dep.has('astro')) return 'astro';
  if (dep.has('svelte') || dep.has('@sveltejs/kit')) return 'svelte';
  if (dep.has('@angular/core') || hay('angular.json')) return 'angular';
  if (dep.has('vue')) return 'vue';
  if (dep.has('react')) return 'react';
  if (hay('layout/theme.liquid', 'config/settings_schema.json')) return 'shopify';
  if (hay('wp-config.php', 'wp-content') || (hay('style.css', 'functions.php') && hay('functions.php'))) return 'wordpress';
  if (hay('theme.yml', 'config/theme.yml') && hay('templates/_partials')) return 'prestashop';
  if (hay('artisan', 'resources/views')) return 'laravel';
  if (hay('app/views/layouts', 'config/routes.rb')) return 'rails';
  if (hay('manage.py')) return 'django';
  if (hay('templates/base.html.twig', 'bin/console')) return 'symfony';
  if (hay('templates/html.html.twig') || hayExtension(dir, /\.info\.yml$/)) return 'drupal';
  if (hay('_config.yml', '_layouts')) return 'jekyll';
  if (hay('.eleventy.js', 'eleventy.config.js', 'eleventy.config.mjs')) return 'eleventy';
  if (hay('hugo.toml', 'hugo.yaml', 'config.toml') && hay('layouts', 'content')) return 'hugo';
  if (hay('index.html') || hayExtension(dir, /\.html$/)) return 'html';
  return 'desconocido';
}

/** Devuelve { id, nombre, guia, ficherosRaiz } del proyecto en `dir`. */
export function detectarStack(dir) {
  const id = identificar(dir);
  const s = STACKS[id];
  return {
    id, nombre: s.nombre, guia: s.guia,
    ficherosRaiz: s.raiz.filter((r) => existsSync(path.join(dir, r))),
  };
}
