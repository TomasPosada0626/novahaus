# NovaHaus — Brand Assets & Sitio

Identidad de marca de NovaHaus (arquitectura e interiorismo): logotipo en 6
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
index.html            la página de brand guidelines (mini brand book interno)

home/
  index.html          home pública de NovaHaus (hero, servicios, IA, proceso,
                       proyectos, equipo, contacto)
  css/home.css        estilos de la home (CSS plano, mobile-first)
  js/home.js          toggle del menú móvil
  assets/
    hero-bg.jpg / .webp     render del hero, optimizado (~90KB)
    hero-bg-source.png      render original sin comprimir (fuente)

scripts/
  generate-logos.mjs        genera los 6 SVG del logo a partir del monograma
                             maestro y los outlines reales de Manrope
  generate-icons.mjs        genera el paquete de favicon desde logo-icon-only.svg
  build-wordmark-paths.mjs  utilidad para inspeccionar los paths de texto generados
  generate-hero-illustration.mjs  ilustración wireframe alternativa (no usada
                             actualmente en home/, queda como opción de respaldo)
```

## Pendiente en `home/`

Las secciones **Proyectos** y **Equipo** usan arte/avatares placeholder
(gradientes de marca e iniciales) porque aún no hay fotos reales de proyectos
terminados. Para reemplazarlos:

- **Equipo**: cambia el `<div class="team-avatar">AR</div>` (y las otras dos)
  por una foto real; ver `home/index.html`, sección `#nosotros`.
- **Proyectos**: cambia el `<div class="project-art project-art--N">` por un
  `<img>` con la foto del proyecto; ver `home/index.html`, sección `#proyectos`.

El copy de la sección "Proceso" es un borrador razonable (el sitio original
no tenía uno) — confírmalo o ajústalo antes de publicar.

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
de código.

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
sitio publicado (`index.html`, `css/`, `js/`, `assets/`) es HTML/CSS/JS plano,
sin build step ni dependencias en producción.

## Servir localmente

```bash
npm run serve
```

o simplemente abre `index.html` en el navegador.

## Paleta

| Color | Hex | Uso |
|---|---|---|
| Fondo oscuro | `#131210` | Fondo principal |
| Acento dorado (sobre oscuro) | `#C7A468` | Ícono / detalles sobre fondo oscuro |
| Texto sobre oscuro | `#F2EDE4` | Texto principal sobre fondo oscuro |
| Subtítulo sobre oscuro | `#9A9186` | Subtítulo, uppercase, tracking amplio |
| Fondo claro | `#F3EEE6` | Fondo alternativo |
| Acento dorado (sobre claro) | `#A9793B` | Ícono / títulos grandes sobre fondo claro (ver nota de contraste) |
| Texto sobre claro | `#1A1815` | Texto principal sobre fondo claro |

**Nota de contraste**: `#A9793B` sobre `#F3EEE6` da ~3.3:1 — cumple WCAG AA
solo para texto grande (≥24px) o elementos gráficos, no para texto de cuerpo.
Usa siempre `#1A1815` para párrafos sobre fondo claro. Detalle completo en la
sección "Reglas de uso" de `index.html`.

## Licencia de uso

Estos assets son propiedad de NovaHaus. Uso interno y de partners
autorizados para materiales de marca; no redistribuir ni modificar el
monograma o la paleta sin aprobación.
