import { onBeforeUnmount, onMounted } from 'vue';

/**
 * Cierra un menú desplegable al hacer clic fuera de su contenedor o al
 * presionar Escape.
 *
 *     const anchor = ref(null);
 *     useDismiss(anchor, () => { open.value = false; });
 *
 * @param {import('vue').Ref<HTMLElement|null>|(() => HTMLElement|null)} target
 *        contenedor del botón y su menú; una función si cambia (varios menús)
 * @param {() => void} close
 */
export function useDismiss(target, close) {
    const element = () => (typeof target === 'function' ? target() : target.value);

    const onClick = (event) => {
        const anchor = element();

        if (anchor && !anchor.contains(event.target)) {
            close();
        }
    };

    const onKeydown = (event) => {
        if (event.key === 'Escape') {
            close();
        }
    };

    onMounted(() => {
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKeydown);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', onClick);
        document.removeEventListener('keydown', onKeydown);
    });
}
