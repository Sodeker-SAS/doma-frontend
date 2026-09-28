# Changelog

Cambios de `sodeker/doma-frontend` por versión. Cada entrada indica si la app que actualiza
necesita alguna acción manual.

## [Sin publicar]

### Añadido

- Estructura base: `resources/` con `components/`, `composables/`, `styles/` y el punto de
  entrada `@doma`.
- Plugin de Vite (`vite.js`): alias `@doma`, resolución de las `peerDependencies` desde la app
  y, con la copia local, acceso y vigilancia de la carpeta del paquete.
