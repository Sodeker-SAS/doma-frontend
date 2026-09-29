# Changelog

Cambios de `sodeker/doma-frontend` por versión. Cada entrada indica si la app que actualiza
necesita alguna acción manual.

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
