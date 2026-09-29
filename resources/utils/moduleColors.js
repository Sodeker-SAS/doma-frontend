/**
 * Color de identidad de cada módulo DOMA (app hija), por slug. Es el mismo en
 * el login y en el hub: un módulo se reconoce igual antes y después de
 * ingresar, y en Suite y en cada app hija. Paleta tomada del hub de Suite.
 */
const MODULE_COLORS = {
    sat: '#3b82f6',
    iris: '#6366f1',
    tut: '#8b5cf6',
    econnect: '#f97316',
    fds: '#ec4899',
    msi: '#079bac',
    sai: '#22c55e',
    sicot: '#ef4444',
    fintegra: '#ffbc0a',
};

/** Para slugs nuevos: siempre el mismo color para el mismo slug. */
const FALLBACK_COLORS = ['#079bac', '#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444', '#6366f1', '#ec4899'];

export function moduleColor(slug) {
    const key = String(slug ?? '').toLowerCase();

    if (MODULE_COLORS[key]) {
        return MODULE_COLORS[key];
    }

    const hash = [...key].reduce((total, char) => total + char.charCodeAt(0), 0);

    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}
