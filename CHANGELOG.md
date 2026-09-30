# Changelog

Cambios de `sodeker/doma-frontend` por versión. Cada entrada indica si la app que actualiza
necesita alguna acción manual.

## [0.2.0] - 2026-09-30

### Añadido

- Layout del rediseño sobre la plantilla Velzon (`styles/layout.css`): barra a todo el ancho,
  menú lateral debajo de ella que se colapsa solo con click, botón redondo de colapsar, vista en
  celular y contenido sin footer. **Acción en la app:** marcar `<html>` con `data-doma-layout`
  (en vez de su atributo propio), el menú con `doma-app-menu` y el botón con
  `doma-sidebar-toggle`, y quitar ese bloque de su `custom.scss`.
- Ítems del menú lateral (`styles/menu.css`): tamaños, espacios y estados; panel flotante
  (`doma-menu-flyout`) y tooltip (`doma-menu-tooltip`) del menú colapsado. **Acción en la app:**
  quitar esos estilos de su `menu.vue` y de su `custom.scss`, y usar las clases `doma-menu-*`.
- Token `--doma-on-primary`: texto sobre el primario, tomado del blanco del tema.

### Cambiado

- La barra, el menú lateral y el título de página van planos: sin sombra y sin la línea bajo la
  barra.
- Ningún color fijo en el paquete: el texto del tooltip y la sombra de los menús desplegables
  salen del tema de la app, con el valor de Suite como respaldo.
- Radio del tema en los ítems del menú lateral y en su panel flotante.

### Eliminado

- Token `--doma-shadow`: la barra ya no lleva sombra.

## [0.1.0] - 2026-09-29

### Añadido

- `DomaNavBar`: barra de navegación superior unificada para Suite y las apps hijas (lanzador
  de productos, selector de empresa, Configuración DOMA, menú del usuario y botón del menú
  lateral).
- `DomaMenuHeader`: encabezado del menú lateral (ícono, título y descripción).
- Tooltip sin JavaScript con `data-doma-tooltip` (`styles/tooltip.css`, incluido en `doma.css`),
  que también unifica el tooltip de PrimeVue. **Acción en la app:** quitar sus estilos propios
  de `.p-tooltip` y el `tooltip` de su preset de PrimeVue, si los tiene.
- `moduleColor(slug)` y `useDismiss()`.
- Tokens `--doma-*` en `styles/tokens.css`, tomados del tema de la app (`--vz-*`).
  **Acción en la app:** importar `@doma/styles/doma.css` una vez en su `app.js`.
- Estructura base: `resources/` con `components/`, `composables/`, `styles/` y el punto de
  entrada `@doma`.
- Plugin de Vite (`vite.js`): alias `@doma`, resolución de las `peerDependencies` desde la app
  y, con la copia local, acceso y vigilancia de la carpeta del paquete.
