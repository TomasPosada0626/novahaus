# RenovHaus — Brand Assets & Sitio

Identidad de marca de RenovHaus (arquitectura e interiorismo): logotipo en 6
variantes SVG, paquete de favicon/PWA, una página de brand guidelines
(`index.html`), y la home pública del sitio (`home/index.html`).

## Estructura

```
assets/
  logo/               6 variantes del logotipo (SVG, paths reales)
  favicon/            favicon.ico, favicon.svg, apple-touch-icon.png,
                       icon-192.png, icon-512.png, site.webmanifest
css/styles.css        estilos de la página de guidelines (CSS plano)
js/main.js            copiar hex al portapapeles en la sección de paleta
index.html            la página de brand guidelines (mini brand book interno,
                       tema oscuro)

home/
  index.html          home pública (hero, filosofía, servicios, IA, proceso,
                       equipo, contacto) -- tema claro
  css/home.css        estilos de la home (CSS plano, mobile-first)
  js/home.js          toggle del menú móvil
  assets/
    hero-sketch.jpg / .webp   sketch arquitectónico usado como fondo del hero
    team/andres.jpg, margarita.jpg, mery.jpg (+ .webp)   fotos reales del equipo
    *-source.png        originales sin comprimir de cada foto activa

scripts/
  generate-logos.mjs        genera los 6 SVG del logo a partir del monograma
                             maestro (la "R") y los outlines reales de Manrope
  generate-icons.mjs        genera el paquete de favicon desde logo-icon-only.svg
  build-wordmark-paths.mjs  utilidad para inspeccionar los paths de texto generados
  generate-hero-illustration.mjs  ilustración wireframe alternativa (no usada
                             actualmente, queda como opción de respaldo)
```

**Archivos huérfanos**: `home/assets/hero-bg.*` (el hero fotográfico oscuro
original), `home/assets/philosophy.*` y `home/assets/services/*` (fotos que
se quitaron de Filosofía y Servicios) ya no están referenciados desde
`home/index.html`, pero se dejaron en el repo por si se quieren reusar.
Bórralos si prefieres mantener `assets/` limpio.

## Paleta: fondo claro + acento verde oliva

Ambas páginas usan el lado claro de la paleta como base (`#F3EEE6` de fondo,
`#1A1815` de texto), con bandas oscuras puntuales (hero y footer del brand
book). El acento ya no es dorado — es **verde oliva** (`#556B2F` sobre fondo
claro, `#9CAD5E` sobre fondo oscuro).

**Regla de contraste**: el verde oliva sobre fondo claro da ~5.15:1, que
cumple WCAG AA incluso para texto de cuerpo (mejor que el dorado original,
que solo llegaba a ~3.3:1). Aun así, en `home.css` los enlaces/labels
pequeños siguen usando tinta oscura + subrayado en verde oliva, en vez de
texto de color, por consistencia con ese patrón ya establecido.

## Variantes del logo

| Archivo | Uso |
|---|---|
| `logo-primary-dark.svg` | Lockup completo (ícono + wordmark + subtítulo), fondos oscuros |
| `logo-primary-light.svg` | Igual, para fondos claros |
| `logo-icon-only.svg` | Solo el monograma — favicon, avatar |
| `logo-compact.svg` | Ícono + wordmark sin subtítulo — footer, firma de correo |
| `logo-monochrome-white.svg` | Un solo color (blanco), sin fondo — superposición sobre fotos/color |
| `logo-monochrome-black.svg` | Un solo color (negro) — impresión a una tinta |

Todos son SVG con paths reales (no `<text>`, no imágenes rasterizadas), así
que se abren y editan directamente en Figma, Illustrator o cualquier editor
de código. El monograma es una "R" geométrica (barra + ojal rectangular +
diagonal de salida) construida en la misma grilla de 100 unidades que el
diseño original: margen 18%, trazo 12%, radio de esquina 8%.

## Regenerar los assets

Los SVG del logo y el favicon no se escriben a mano — se generan desde
`scripts/`, para que cualquier ajuste futuro al monograma o al wordmark se
propague de forma consistente a las 6 variantes y al favicon.

```bash
npm install
npm run generate-icons      # favicon.ico, favicon.svg, apple-touch-icon.png, icon-192/512.png
node scripts/generate-logos.mjs   # regenera los 6 SVG del logo
```

`node_modules` y las dependencias de npm (`sharp`, `png-to-ico`, `fontkit`,
`@fontsource/manrope`) solo se usan en build time para estos scripts — el
sitio publicado (`index.html`, `home/`, `css/`, `js/`, `assets/`) es
HTML/CSS/JS plano, sin build step ni dependencias en producción.

## Servir localmente

```bash
npm run serve
```

y abre `index.html` (brand book) o `home/index.html` (home pública) en el
navegador.

## Paleta

| Color | Hex | Uso |
|---|---|---|
| Fondo oscuro | `#131210` | Hero y footer del brand book |
| Acento verde oliva (sobre oscuro) | `#9CAD5E` | Ícono / detalles sobre fondo oscuro |
| Texto sobre oscuro | `#F2EDE4` | Texto principal sobre fondo oscuro |
| Subtítulo sobre oscuro | `#9A9186` | Subtítulo, uppercase, tracking amplio |
| Fondo claro | `#F3EEE6` | Fondo principal de ambas páginas |
| Acento verde oliva (sobre claro) | `#556B2F` | Ícono / títulos grandes sobre fondo claro (ver nota de contraste) |
| Texto sobre claro | `#1A1815` | Texto principal sobre fondo claro |

**Nota de contraste**: `#556B2F` sobre `#F3EEE6` da ~5.15:1 — cumple WCAG AA
incluso para texto de cuerpo. Detalle completo en la sección "Reglas de uso"
de `index.html`.

## Licencia de uso

Estos assets son propiedad de RenovHaus. Uso interno y de partners
autorizados para materiales de marca; no redistribuir ni modificar el
monograma o la paleta sin aprobación.
