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
