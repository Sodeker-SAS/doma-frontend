/**
 * Punto de entrada público de doma-frontend. Cada componente o composable
 * nuevo se exporta aquí para que las apps lo importen desde '@doma':
 *
 *     import { DomaNavBar } from '@doma';
 */
export { default as DomaNavBar } from './components/DomaNavBar.vue';
export { default as DomaMenuHeader } from './components/DomaMenuHeader.vue';

export { useDismiss } from './composables/useDismiss.js';

export { moduleColor } from './utils/moduleColors.js';
