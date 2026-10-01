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
  El tooltip de los ítems sin sub-ítems va con `doma-menu-tooltip` también en las apps con
  PrimeVue, en lugar de `v-tooltip`.
- Token `--doma-on-primary`: texto sobre el primario, tomado del blanco del tema.
- Token `--doma-layout-border`: color de las líneas del layout.
- `holdDomaLayout()`, `releaseDomaLayout()` y `DOMA_LAYOUT_ATTR`: mantienen el atributo del
  layout mientras haya un layout DOMA montado. **Acción en la app:** llamarlos en el `created` y
  el `unmounted` de su layout vertical, en vez de poner y quitar el atributo directamente.

### Cambiado

- La barra, el menú lateral y el título de página van planos, sin sombra. La línea bajo la barra,
  el borde del menú y el separador de la marca son la misma: `--doma-layout-border`, el borde del
  menú del tema de la app. Se quita la línea de `#page-topbar` de la plantilla, que duplicaba la
  de la barra.
- Ningún color fijo en el paquete: el texto del tooltip y la sombra de los menús desplegables
  salen del tema de la app, con el valor de Suite como respaldo.
- Radio del tema en los ítems del menú lateral y en su panel flotante.
- El botón del usuario (el que abre su menú y el cierre de sesión) ya no marca borde al pasar el
  mouse.
- Lanzador: muestra a lo sumo 3×3 productos, siempre del mismo tamaño; si hay más, aparece
  "Ver más productos", que lleva al hub (`homeUrl`). Inicio y Configuración se reparten el ancho
  del pie, una mitad cada uno, con una línea divisoria en medio.

### Corregido

- La barra ya no se desliza desde la derecha al cambiar de módulo: el atributo del layout se
  quitaba un instante entre el layout que salía y el que entraba.
- Lo de la derecha de la barra ya no salta cuando la página gana o pierde la barra de scroll
  (al cambiar de módulo o al abrir un modal): la barra mide siempre el ancho de la ventana
  (`100vw`) y la barra de scroll se pinta encima de su borde derecho. El contenido conserva todo
  su ancho.

- El tooltip del menú colapsado ya no parpadea ni desaparece al pasar de una opción con
  sub-ítems a una sin ellos (pasaba en las apps que usaban el `v-tooltip` de PrimeVue: al
  cerrarse el panel flotante el menú se repinta y la directiva borraba el tooltip).

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
