<script setup>
/**
 * Encabezado del menú lateral: dice dónde está parado el usuario (en Suite,
 * "Configuración"; en cada app hija, el producto). Va arriba del menú, sobre
 * fondo gris, igual en Suite y en las apps hijas.
 *
 * Con el menú colapsado solo queda el ícono.
 */
defineProps({
    /** Dónde está el usuario, p. ej. "Configuración". */
    title: { type: String, required: true },
    /** Una línea que lo explica, p. ej. "Ajustes transversales en DOMA". */
    description: { type: String, default: '' },
    /** Ícono de Remix Icon, p. ej. "ri-settings-3-line". */
    icon: { type: String, default: '' },
    /** Menú colapsado: solo el ícono. */
    collapsed: { type: Boolean, default: false },
});
</script>

<template>
    <div class="doma-menu-header" :class="{ 'is-collapsed': collapsed }">
        <span v-if="icon" class="doma-menu-header__icon">
            <i :class="icon" aria-hidden="true"></i>
        </span>

        <span class="doma-menu-header__text">
            <strong>{{ title }}</strong>
            <small v-if="description">{{ description }}</small>
        </span>
    </div>
</template>

<style scoped>
.doma-menu-header {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--doma-border);
    background: var(--doma-surface-muted);
    font-family: var(--doma-font);
}

.doma-menu-header.is-collapsed {
    justify-content: center;
    padding: 16px 0;
}

/* Colapsado, el texto no se ve pero lo siguen leyendo los lectores de pantalla. */
.doma-menu-header.is-collapsed .doma-menu-header__text {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}

.doma-menu-header__icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--doma-radius);
    background: var(--doma-primary-soft);
    color: var(--doma-primary-ink);
    font-size: 16px;
}

.doma-menu-header__text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    line-height: 1.3;
}

.doma-menu-header__text strong,
.doma-menu-header__text small {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.doma-menu-header__text strong {
    color: var(--doma-heading);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
}

.doma-menu-header__text small {
    color: var(--doma-muted);
    font-size: 11.5px;
}
</style>
