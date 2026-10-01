/**
 * Atributo de <html> con el que se aplica el layout DOMA (styles/layout.css).
 * La app lo pone antes de montar Vue, en el script de su app.blade.php, para
 * que el menú no salte al cargar.
 */
export const DOMA_LAYOUT_ATTR = 'data-doma-layout';

let holders = 0;

/**
 * Marca <html> con el layout DOMA mientras el layout de la app esté montado.
 * Se llama al crearlo; `releaseDomaLayout()`, al desmontarlo.
 *
 * Al cambiar de módulo, Inertia monta el layout de la página nueva antes de
 * desmontar el de la anterior. Si el atributo se quitara al desmontar, la
 * barra nueva tomaría por un instante la posición de la plantilla (250 px a la
 * derecha) y se deslizaría de vuelta. Por eso solo se quita cuando ya no queda
 * ningún layout DOMA montado (por ejemplo, al pasar al inicio de sesión).
 */
export function holdDomaLayout() {
    holders += 1;
    document.documentElement.setAttribute(DOMA_LAYOUT_ATTR, 'true');
}

export function releaseDomaLayout() {
    holders = Math.max(0, holders - 1);

    if (holders === 0) {
        document.documentElement.removeAttribute(DOMA_LAYOUT_ATTR);
    }
}
