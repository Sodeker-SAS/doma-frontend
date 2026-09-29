# sodeker/doma-frontend

Componentes Vue, estilos y tokens del rediseño de Suite y sus aplicaciones hijas.

Es un paquete Composer **sin PHP y sin build propio**: Composer solo lo entrega en `vendor/` y
cada aplicación compila su fuente con su propio Vite, igual que el resto de su `resources/js`.

## Estructura

```
resources/
├── index.js          punto de entrada público: import { … } from '@doma'
├── components/       componentes Vue (SFC con <script setup>)
├── composables/      lógica reutilizable (useAlgo)
├── utils/            funciones sin estado (moduleColor)
└── styles/
    ├── doma.css      estilos globales; la app lo importa una sola vez
    └── tokens.css    variables CSS --doma-* (color, tipografía, espaciado…)
vite.js               plugin de Vite que conecta el paquete con la app
package.json          solo declara peerDependencies; no se instala
```

## Uso desde una aplicación

```js
// resources/js/app.js — una sola vez
import '@doma/styles/doma.css';

// en cualquier componente o página
import { DomaButton } from '@doma';
import DomaButton from '@doma/components/DomaButton.vue';
```

## Componentes

### `DomaNavBar`

Barra de navegación superior, la misma en Suite y en cada app hija. No conoce el router ni
la sesión de la app: recibe los datos por props y avisa las acciones por eventos.

```vue
<DomaNavBar
    :modules="modules"            <!-- lanzador: [{ slug, name, icon, url, accessible, color? }], ya ordenados -->
    current-module="sat"          <!-- se resalta en el lanzador -->
    :home-url="homeUrl"           <!-- "Inicio" del lanzador (hub de Suite) -->
    :config-url="configUrl"       <!-- "Configuración": botón en la barra y en el lanzador -->
    :config-active="false"        <!-- resalta ese botón cuando se está en la configuración -->
    :tenant="{ id, name, caption }"
    :tenants="empresas"           <!-- [{ id, name, caption? }]: con más de una aparece el selector -->
    :tenant-switchable="true"     <!-- p. ej. solo en vistas de listado -->
    :user="{ name, caption, email, avatarUrl }"
    :logoutable="true"
    :menu-toggle="true"           <!-- botón del menú lateral, solo en pantallas angostas -->
    :brand="true"                 <!-- marca DOMA + lanzador al inicio, antes de la línea separadora -->
    :theme="null"                 <!-- 'light' | 'dark' muestra el botón de tema -->
    @select-tenant="(empresa) => …"
    @logout="…"
    @toggle-menu="…"
    @toggle-theme="…"
>
    <template #user-menu="{ close }">
        <!-- ítems extra del menú del usuario; usar la clase doma-navbar__menu-item -->
    </template>
</DomaNavBar>
```

Slots: `start` (junto al selector de empresa), `actions` (antes del usuario) y `user-menu`.
Los íconos son de Remix Icon (`ri-*`), que carga cada app. El color de cada módulo sale de
`moduleColor(slug)` si no se pasa `color`.

El lanzador pinta los productos en el orden en que llegan: el orden lo decide la app y debe ser
el mismo del hub de productos (en Suite, `ProductOrderService`). La empresa se muestra siempre
con dos letras (sin logo) y, si trae `caption`, con ese dato bajo el nombre, p. ej. su NIT.

La barra ocupa siempre todo el ancho de la pantalla, fija arriba; el menú lateral de la app va
debajo de ella. El bloque de marca y lanzador mide `--doma-navbar-brand-width` (por defecto el
ancho del menú lateral de Velzon) para que la línea separadora caiga sobre el borde del menú.

En Suite va dentro de `#page-topbar` (`resources/js/Components/SuiteNavBar.vue`).

### `DomaMenuHeader`

Encabezado del menú lateral: dónde está parado el usuario, sobre fondo gris. En Suite es
"Configuración"; en cada app hija será su producto. Con el menú colapsado solo queda el ícono.

```vue
<DomaMenuHeader
    title="Configuración"
    description="Ajustes transversales en DOMA"
    icon="ri-settings-3-line"
    :collapsed="menuColapsado"
/>
```

### Tooltip

`styles/tooltip.css` (incluido en `doma.css`): cualquier elemento con
`data-doma-tooltip="Texto"` muestra un tooltip debajo al pasar el mouse o al enfocarlo con el
teclado. No usa JavaScript ni PrimeVue (no todas las apps lo tienen); el fondo es el color
primario de la app y el texto blanco. Va en lugar del `title` del navegador.

El mismo archivo le da ese aspecto al tooltip de PrimeVue (`v-tooltip`) en las apps que lo usan,
así todos los tooltips de DOMA se ven iguales. La app no debe pintar `.p-tooltip-text` por su
cuenta; los colores salen de `--doma-tooltip-bg` y `--doma-tooltip-text`.

### Utilidades

- `moduleColor(slug)`: color de identidad de cada módulo; el mismo en todas las apps.
- `useDismiss(ancla, cerrar)`: cierra un menú al hacer clic fuera o presionar Escape.

### Tokens

`styles/tokens.css` define las variables `--doma-*`. Por ahora cada una toma el valor del tema
de la app (`--vz-*` de Velzon) con un respaldo fijo, así el paquete respeta los colores y el
modo oscuro de cada app. Cuando los colores se dinamicen, se cambia ese archivo.

## Probar sin publicar

El `vite.config.js` de la aplicación usa la **primera copia del paquete que exista**:

| Orden | Ruta | Cuándo aplica |
|---|---|---|
| 1 | `DOMA_FRONTEND_PATH` | Variable de entorno opcional para forzar otra copia |
| 2 | `../doma-frontend` | **Modo local**: la carpeta de trabajo, hermana de las apps |
| 3 | `vendor/sodeker/doma-frontend` | **Modo publicado**: la versión que instaló Composer |

En modo local cada archivo que se guarda en `doma-frontend` llega al navegador por HMR, igual
que un archivo de la propia app: **sin commit, sin tag y sin tocar Composer**. En el servidor
`../doma-frontend` no existe y se usa la copia de `vendor/` sin cambiar nada.

No se usa un *path repository* de Composer (como en `doma-composer`) porque quien consume el
paquete es Vite, no PHP: así el `composer.json` y el `composer.lock` de la app no cambian
durante el desarrollo y no hay un lock apuntando a una carpeta local que rompa un despliegue.

### Conectar una aplicación (una sola vez)

**1. `vite.config.js`** — elegir la copia y registrar el plugin:

```js
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// doma-frontend (componentes del rediseño). Se prefiere la carpeta hermana
// ../doma-frontend, montada en el contenedor node, para probar sin publicar;
// si no existe, la copia que instaló Composer. DOMA_FRONTEND_PATH fuerza otra.
const domaFrontendRoot = [process.env.DOMA_FRONTEND_PATH, '../doma-frontend', 'vendor/sodeker/doma-frontend']
    .filter(Boolean)
    .map((path) => resolve(path))
    .find((path) => existsSync(resolve(path, 'vite.js')));
const domaFrontend = domaFrontendRoot
    ? (await import(pathToFileURL(resolve(domaFrontendRoot, 'vite.js')).href)).default
    : () => null;

// …y en plugins: [laravel(…), vue(…), domaFrontend()]
```

**2. `docker-compose.yml`** — montar el paquete en el servicio `node`:

```yaml
      # doma-frontend en vivo: vite.config.js lo prefiere a vendor/. Si la
      # carpeta no existe en el Mac, Docker monta una vacía y se usa vendor/.
      - ../doma-frontend:/var/doma-frontend:ro
```

La ruta `/var/doma-frontend` no es arbitraria: la app vive en `/var/www`, así que
`../doma-frontend` desde ahí es `/var/doma-frontend`.

**3. Recrear el contenedor** — los volúmenes solo se aplican al crearlo:

```bash
docker compose up -d --no-deps --force-recreate node
```

**4. `jsconfig.json`** (opcional) — para que el editor resuelva `@doma`:

```json
"@doma": ["../doma-frontend/resources/index.js", "vendor/sodeker/doma-frontend/resources/index.js"],
"@doma/*": ["../doma-frontend/resources/*", "vendor/sodeker/doma-frontend/resources/*"]
```

**Verificación:** el log de Vite debe decir qué copia usa.

```bash
docker logs node_suite 2>&1 | grep doma-frontend
```

```
doma-frontend: usando la copia local /var/doma-frontend
```

Si no aparece la línea, se está usando `vendor/` (o el paquete no está en ninguna de las rutas).

### Reglas del modo local

- **Dependencias npm.** Todo paquete npm que importe un componente se declara en
  `peerDependencies` y debe estar en el `package.json` de cada app. En modo local se resuelve
  siempre desde `node_modules` de la app: si allí no está, falla en local igual que fallaría en
  producción, que es justo lo que se quiere.
- **Cambios en `vite.js` o `package.json` del paquete** exigen reiniciar el contenedor:
  `docker restart node_suite`. El resto de archivos se refleja al guardar.
- **Nada que importe `@doma` llega a `develop`** antes de que el paquete tenga un tag y la app
  lo instale por Composer: en el servidor no existe `../doma-frontend`.
- **`vite build` con la copia local** muestra un aviso: esa build lleva código sin publicar.

## Publicar una versión

1. Registrar los cambios en `CHANGELOG.md` y crear el tag (`v0.x.y` mientras se define el diseño).
2. En cada app, declarar el repositorio e instalar:

   ```json
   "repositories": [
       { "type": "vcs", "url": "git@github.com:Sodeker-SAS/doma-frontend.git", "no-api": true }
   ]
   ```

   ```bash
   docker compose exec php composer require sodeker/doma-frontend:^0.1
   ```

3. Para probar en local la versión publicada en lugar de la carpeta de trabajo, definir
   `DOMA_FRONTEND_PATH=vendor/sodeker/doma-frontend` en el servicio `node` y reiniciarlo.

## Convenciones

- Vue 3 con `<script setup>`, en JavaScript, como en las apps.
- Componentes con prefijo `Doma` (`DomaButton.vue`): conviven con los componentes actuales de
  cada app durante la migración y un `grep Doma` muestra qué pantallas ya usan el rediseño.
- Estilos de cada componente en `<style scoped>` y a partir de los tokens `var(--doma-…)`.
- Cada componente o composable público se exporta en `resources/index.js`.
- Código, comentarios y documentación en español.
