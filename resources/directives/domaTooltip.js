/**
 * Tooltip de DOMA como directiva, el mismo en todas las apps, tengan o no
 * PrimeVue. Para los elementos que el tooltip CSS (`data-doma-tooltip`) no
 * alcanza: los que están dentro de un contenedor que recorta, como el menú
 * lateral con su scroll. Se pinta en <body>, así nada lo recorta.
 *
 *     <a v-doma-tooltip:right="'Reportes'">…</a>
 *     <a v-doma-tooltip:right="menuColapsado ? 'Reportes' : ''">…</a>
 *
 * El argumento es el lado: top (por defecto), right, bottom o left. Con texto
 * vacío no se muestra, y si estaba visible se cierra. Repintar el elemento no
 * lo borra: el `v-tooltip` de PrimeVue sí, y por eso parpadeaba en el menú.
 *
 * No se muestra mientras el elemento tiene su menú abierto (aria-expanded).
 * Sale con el mismo retardo que `data-doma-tooltip`, para que todos los
 * tooltips de DOMA respondan igual.
 */
const SHOW_DELAY = 150; // el mismo transition-delay de data-doma-tooltip (tooltip.css)
const GAP = 8;
const VIEWPORT_MARGIN = 4;
const PLACEMENTS = ['top', 'right', 'bottom', 'left'];

// Un solo tooltip en pantalla, el del elemento que lo muestra, y el que está
// por mostrarse mientras corre el retardo.
let tip = null;
let owner = null;
let pending = null;
let timer = null;

function tooltipElement() {
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'doma-tooltip';
        tip.setAttribute('role', 'tooltip');
    }

    return tip;
}

function place(el) {
    const { placement } = el.$_domaTooltip;
    const target = el.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const centerTop = target.top + target.height / 2 - box.height / 2;
    const centerLeft = target.left + target.width / 2 - box.width / 2;

    const positions = {
        top: [target.top - GAP - box.height, centerLeft],
        right: [centerTop, target.right + GAP],
        bottom: [target.bottom + GAP, centerLeft],
        left: [centerTop, target.left - GAP - box.width],
    };
    const [top, left] = positions[placement];

    // Siempre dentro de la ventana.
    tip.style.top = `${Math.min(Math.max(VIEWPORT_MARGIN, top), window.innerHeight - box.height - VIEWPORT_MARGIN)}px`;
    tip.style.left = `${Math.min(Math.max(VIEWPORT_MARGIN, left), window.innerWidth - box.width - VIEWPORT_MARGIN)}px`;
}

function onKeydown(event) {
    if (event.key === 'Escape') {
        hide();
    }
}

function show(el) {
    hide();

    if (!el.$_domaTooltip.text || el.getAttribute('aria-expanded') === 'true') {
        return;
    }

    pending = el;
    timer = window.setTimeout(() => reveal(el), SHOW_DELAY);
}

function reveal(el) {
    timer = null;
    pending = null;

    const { text, placement } = el.$_domaTooltip;

    if (!text || !el.isConnected || el.getAttribute('aria-expanded') === 'true') {
        return;
    }

    const node = tooltipElement();
    node.className = `doma-tooltip doma-tooltip--${placement}`;
    node.textContent = text;

    if (!node.isConnected) {
        document.body.appendChild(node);
    }

    owner = el;
    el.setAttribute('aria-describedby', node.id);
    place(el);

    // Si algo se desplaza, el tooltip quedaría lejos de su elemento.
    window.addEventListener('scroll', hide, true);
    document.addEventListener('keydown', onKeydown);
}

function hide() {
    window.clearTimeout(timer);
    timer = null;
    pending = null;
    owner?.removeAttribute('aria-describedby');
    owner = null;
    tip?.remove();
    window.removeEventListener('scroll', hide, true);
    document.removeEventListener('keydown', onKeydown);
}

// El elemento tiene el tooltip visible o por mostrarse.
function isActive(el) {
    return owner === el || pending === el;
}

function read(binding) {
    return {
        text: typeof binding.value === 'string' ? binding.value.trim() : '',
        placement: PLACEMENTS.includes(binding.arg) ? binding.arg : 'top',
    };
}

export const vDomaTooltip = {
    mounted(el, binding) {
        el.$_domaTooltip = read(binding);
        el.$_domaTooltipEvents = {
            mouseenter: () => show(el),
            mouseleave: () => isActive(el) && hide(),
            focusin: () => el.matches(':focus-visible') && show(el),
            focusout: () => isActive(el) && hide(),
            click: () => isActive(el) && hide(),
        };

        Object.entries(el.$_domaTooltipEvents).forEach(([event, handler]) => el.addEventListener(event, handler));
    },

    updated(el, binding) {
        el.$_domaTooltip = read(binding);

        if (pending === el && !el.$_domaTooltip.text) {
            hide();
            return;
        }

        if (owner !== el) {
            return;
        }

        if (!el.$_domaTooltip.text) {
            hide();
            return;
        }

        // Solo si cambió: repintar con lo mismo no debe tocar el tooltip.
        const className = `doma-tooltip doma-tooltip--${el.$_domaTooltip.placement}`;

        if (tip.textContent !== el.$_domaTooltip.text || tip.className !== className) {
            tip.textContent = el.$_domaTooltip.text;
            tip.className = className;
            place(el);
        }
    },

    beforeUnmount(el) {
        if (isActive(el)) {
            hide();
        }

        Object.entries(el.$_domaTooltipEvents ?? {}).forEach(([event, handler]) => el.removeEventListener(event, handler));
    },
};
