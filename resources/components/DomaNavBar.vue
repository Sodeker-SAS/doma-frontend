<script setup>
import { computed, ref } from 'vue';
import { useDismiss } from '../composables/useDismiss.js';
import { moduleColor } from '../utils/moduleColors.js';

/**
 * Barra de navegación superior de DOMA, la misma en Suite y en cada app hija.
 *
 * No conoce el router ni la sesión de la app: recibe los datos por props y
 * avisa las acciones por eventos. Cada app decide cómo cambiar de empresa,
 * cerrar sesión o abrir su menú lateral.
 */
const props = defineProps({
    /**
     * Productos del lanzador: [{ slug, name, icon, url, accessible, color? }].
     * Se pintan en el orden en que llegan: el orden lo decide la app, y en DOMA
     * es el mismo del hub de productos.
     */
    modules: { type: Array, default: () => [] },
    /** Slug del módulo en el que se está: se resalta en el lanzador. */
    currentModule: { type: String, default: '' },
    /** Enlace al inicio DOMA (hub de Suite). */
    homeUrl: { type: String, default: '' },
    /** Enlace a Configuración DOMA (la configuración transversal, en Suite); vacío lo oculta. */
    configUrl: { type: String, default: '' },
    /** Se está en Configuración DOMA: resalta su botón. */
    configActive: { type: Boolean, default: false },
    /** Empresa actual: { id, name, caption? }. `caption` va bajo el nombre (p. ej. el NIT). */
    tenant: { type: Object, default: null },
    /** Empresas a las que se puede cambiar: [{ id, name, caption? }]. */
    tenants: { type: Array, default: () => [] },
    /** Permite cambiar de empresa desde aquí (p. ej. solo en listados). */
    tenantSwitchable: { type: Boolean, default: true },
    /** Usuario: { name, caption?, email?, avatarUrl? }. */
    user: { type: Object, default: null },
    /** Muestra "Cerrar sesión" en el menú del usuario. */
    logoutable: { type: Boolean, default: true },
    /** Botón del menú lateral; solo aparece en pantallas angostas. */
    menuToggle: { type: Boolean, default: true },
    /** Marca DOMA al inicio, enlazada a `homeUrl`, junto al lanzador de productos. */
    brand: { type: Boolean, default: true },
    /** Tema actual ('light' | 'dark') para el botón claro/oscuro; null lo oculta. */
    theme: { type: String, default: null },
});

const emit = defineEmits(['toggle-menu', 'select-tenant', 'logout', 'toggle-theme']);

const openMenu = ref(null);
const anchors = { launcher: ref(null), tenant: ref(null), user: ref(null) };
const launcherRef = anchors.launcher;
const tenantRef = anchors.tenant;
const userRef = anchors.user;

const closeMenus = () => {
    openMenu.value = null;
};

const toggleMenu = (name) => {
    openMenu.value = openMenu.value === name ? null : name;
};

useDismiss(() => (openMenu.value ? anchors[openMenu.value].value : null), closeMenus);

const canSwitchTenant = computed(() => props.tenantSwitchable && props.tenants.length > 1);

const launcherModules = computed(() => props.modules.map((module) => ({
    ...module,
    color: module.color || moduleColor(module.slug),
    href: module.accessible !== false ? module.url || null : null,
})));

function initials(text) {
    return String(text ?? '')
        .split(/[\s.@_-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

// Formas jurídicas y conectores que no distinguen a una empresa de otra.
const COMPANY_NAME_NOISE = new Set([
    'sas', 'sa', 'ltda', 'sca', 'scs', 'eu', 'eirl', 'cia', 'y', 'e',
    'de', 'del', 'la', 'las', 'los', 'el',
]);

/**
 * Siempre dos letras: las iniciales de las dos primeras palabras que
 * distinguen el nombre ("Concretos del Caribe S.A.S." → CC) o, si solo hay
 * una, sus dos primeras letras ("Develop" → DE).
 */
function companyInitials(name) {
    // Sin tildes ni puntuación: "Sódeker S.A.S." → ["Sodeker", "SAS"].
    const words = String(name ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .split(/\s+/)
        .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
        .filter(Boolean);
    const significant = words.filter((word) => !COMPANY_NAME_NOISE.has(word.toLowerCase()));
    const source = significant.length ? significant : words;

    const letters = source.length > 1
        ? source[0][0] + source[1][0]
        : (source[0] ?? '').slice(0, 2);

    return letters.toUpperCase();
}

function selectTenant(tenant) {
    closeMenus();

    if (tenant?.id !== props.tenant?.id) {
        emit('select-tenant', tenant);
    }
}

function logout() {
    closeMenus();
    emit('logout');
}
</script>

<template>
    <nav class="doma-navbar" aria-label="Navegación DOMA">
        <div class="doma-navbar__start">
            <button
                v-if="menuToggle"
                type="button"
                class="doma-navbar__icon-btn doma-navbar__menu-toggle"
                aria-label="Abrir menú"
                @click="emit('toggle-menu')"
            >
                <i class="ri-menu-2-line"></i>
            </button>

            <!-- Marca y lanzador, con la línea separadora después, como en el diseño DOMA -->
            <div
                v-if="brand || launcherModules.length || homeUrl || configUrl"
                class="doma-navbar__brand-block"
                :class="{ 'has-brand': brand }"
            >
                <a v-if="brand" :href="homeUrl || null" class="doma-navbar__brand" aria-label="Inicio DOMA">
                    <span class="doma-navbar__brand-mark">D</span>
                    <span class="doma-navbar__brand-name">DOMA</span>
                </a>

                <div v-if="launcherModules.length || homeUrl || configUrl" ref="launcherRef" class="doma-navbar__anchor">
                    <button
                        type="button"
                        class="doma-navbar__icon-btn doma-navbar__launcher"
                        :class="{ 'is-open': openMenu === 'launcher' }"
                        data-doma-tooltip="Productos"
                        aria-label="Productos DOMA"
                        aria-haspopup="true"
                        :aria-expanded="String(openMenu === 'launcher')"
                        @click="toggleMenu('launcher')"
                    >
                        <i class="ri-apps-2-line"></i>
                    </button>

                    <div v-if="openMenu === 'launcher'" class="doma-navbar__menu doma-navbar__menu--launcher">
                        <div class="doma-navbar__menu-header">
                            <strong>Productos DOMA</strong>
                            <small>Cambia de producto sin volver a iniciar sesión.</small>
                        </div>

                        <div class="doma-navbar__modules">
                            <component
                                :is="module.href ? 'a' : 'div'"
                                v-for="module in launcherModules"
                                :key="module.slug"
                                :href="module.href"
                                class="doma-navbar__module"
                                :class="{
                                    'is-locked': !module.href,
                                    'is-current': module.slug === currentModule,
                                }"
                                :style="{ '--module': module.color }"
                            >
                                <span class="doma-navbar__module-icon">
                                    <i :class="module.icon || 'ri-apps-line'"></i>
                                </span>
                                <span class="doma-navbar__module-name">{{ module.name }}</span>
                                <i v-if="!module.href" class="ri-lock-line doma-navbar__module-lock" aria-hidden="true"></i>
                            </component>
                        </div>

                        <div v-if="homeUrl || configUrl" class="doma-navbar__menu-footer">
                            <a v-if="homeUrl" :href="homeUrl" class="doma-navbar__menu-link">
                                <i class="ri-home-5-line" aria-hidden="true"></i>
                                Inicio
                            </a>
                            <a v-if="configUrl" :href="configUrl" class="doma-navbar__menu-link">
                                <i class="ri-settings-3-line" aria-hidden="true"></i>
                                Configuración
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="tenant" ref="tenantRef" class="doma-navbar__anchor">
                <button
                    type="button"
                    class="doma-navbar__chip"
                    :class="{ 'is-static': !canSwitchTenant }"
                    :aria-haspopup="canSwitchTenant ? 'listbox' : null"
                    :aria-expanded="canSwitchTenant ? String(openMenu === 'tenant') : null"
                    @click="canSwitchTenant && toggleMenu('tenant')"
                >
                    <span class="doma-navbar__tenant-mark">{{ companyInitials(tenant.name) }}</span>
                    <span class="doma-navbar__chip-text">
                        <strong>{{ tenant.name }}</strong>
                        <small v-if="tenant.caption">{{ tenant.caption }}</small>
                    </span>
                    <i v-if="canSwitchTenant" class="ri-arrow-down-s-line doma-navbar__chevron" aria-hidden="true"></i>
                </button>

                <div v-if="openMenu === 'tenant'" class="doma-navbar__menu doma-navbar__menu--tenant">
                    <div class="doma-navbar__menu-header">
                        <strong>Cambiar de empresa</strong>
                        <small>Cada empresa trabaja con su propia información.</small>
                    </div>
                    <ul class="doma-navbar__list" role="listbox">
                        <li v-for="option in tenants" :key="option.id">
                            <button
                                type="button"
                                class="doma-navbar__menu-item"
                                :class="{ 'is-active': option.id === tenant.id }"
                                role="option"
                                :aria-selected="option.id === tenant.id"
                                @click="selectTenant(option)"
                            >
                                <span class="doma-navbar__tenant-mark doma-navbar__tenant-mark--sm">{{ companyInitials(option.name) }}</span>
                                <span class="doma-navbar__menu-item-text doma-navbar__menu-item-text--stacked">
                                    <span>{{ option.name }}</span>
                                    <small v-if="option.caption">{{ option.caption }}</small>
                                </span>
                                <i v-if="option.id === tenant.id" class="ri-check-line" aria-hidden="true"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <slot name="start" />
        </div>

        <div class="doma-navbar__end">
            <slot name="actions" />

            <button
                v-if="theme"
                type="button"
                class="doma-navbar__icon-btn"
                :data-doma-tooltip="theme === 'dark' ? 'Modo claro' : 'Modo oscuro'"
                :aria-label="theme === 'dark' ? 'Modo claro' : 'Modo oscuro'"
                @click="emit('toggle-theme')"
            >
                <i :class="theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'"></i>
            </button>

            <a
                v-if="configUrl"
                :href="configUrl"
                class="doma-navbar__icon-btn"
                :class="{ 'is-active': configActive }"
                data-doma-tooltip="Configuración"
                aria-label="Configuración DOMA"
                :aria-current="configActive ? 'page' : null"
            >
                <i class="ri-settings-3-line" aria-hidden="true"></i>
            </a>

            <template v-if="user">
                <span class="doma-navbar__divider" aria-hidden="true"></span>

                <div ref="userRef" class="doma-navbar__anchor">
                    <button
                        type="button"
                        class="doma-navbar__user"
                        aria-haspopup="menu"
                        :aria-expanded="String(openMenu === 'user')"
                        @click="toggleMenu('user')"
                    >
                        <span class="doma-navbar__avatar">
                            <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" />
                            <template v-else>{{ initials(user.name) }}</template>
                        </span>
                        <span class="doma-navbar__chip-text">
                            <strong>{{ user.name }}</strong>
                            <small v-if="user.caption">{{ user.caption }}</small>
                        </span>
                        <i class="ri-arrow-down-s-line doma-navbar__chevron" aria-hidden="true"></i>
                    </button>

                    <div v-if="openMenu === 'user'" class="doma-navbar__menu doma-navbar__menu--end" role="menu">
                        <div class="doma-navbar__menu-header">
                            <strong>{{ user.name }}</strong>
                            <small v-if="user.email">{{ user.email }}</small>
                        </div>

                        <slot name="user-menu" :close="closeMenus" />

                        <button
                            v-if="logoutable"
                            type="button"
                            class="doma-navbar__menu-item doma-navbar__menu-item--danger"
                            role="menuitem"
                            @click="logout"
                        >
                            <i class="ri-logout-box-r-line" aria-hidden="true"></i>
                            <span class="doma-navbar__menu-item-text">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </nav>
</template>

<style>
/*
 * Sin `scoped`: las apps usan `doma-navbar__menu-item` en lo que pasan por el
 * slot `user-menu`. Todo queda bajo `.doma-navbar`.
 */
.doma-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    height: var(--doma-navbar-height);
    padding: 0 20px;
    border-bottom: 1px solid var(--doma-layout-border);
    background: var(--doma-surface);
    color: var(--doma-text);
    font-family: var(--doma-font);
    font-size: 14px;
}

.doma-navbar__start,
.doma-navbar__end {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

/* Alto completo para que la línea separadora del bloque de marca vaya de
   arriba abajo, como en el diseño. */
.doma-navbar__start {
    align-self: stretch;
}

.doma-navbar__anchor {
    position: relative;
    min-width: 0;
}

/* ---------- Marca ---------- */

.doma-navbar__brand-block {
    display: flex;
    flex: none;
    align-items: center;
    gap: 10px;
}

/* Con marca, el bloque mide lo mismo que el menú lateral de la app y la línea
   separadora cae sobre su borde. */
.doma-navbar__brand-block.has-brand {
    align-self: stretch;
    justify-content: space-between;
    box-sizing: border-box;
    width: var(--doma-navbar-brand-width, auto);
    margin-left: -20px;
    margin-right: 6px;
    padding: 0 16px 0 20px;
    border-right: 1px solid var(--doma-layout-border);
}

.doma-navbar__brand {
    display: flex;
    flex: none;
    align-items: center;
    gap: 10px;
    color: var(--doma-heading);
    text-decoration: none;
}

.doma-navbar__brand:hover {
    color: var(--doma-heading);
}

.doma-navbar__brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--doma-radius);
    background: var(--doma-primary);
    color: var(--doma-on-primary);
    font-size: 14px;
    font-weight: 600;
}

.doma-navbar__brand-name {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.12em;
}

/* ---------- Botones ---------- */

.doma-navbar__icon-btn {
    box-sizing: border-box;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 1px solid var(--doma-border);
    border-radius: var(--doma-radius);
    background: transparent;
    color: var(--doma-muted);
    font-size: 18px;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.doma-navbar__icon-btn:hover,
.doma-navbar__icon-btn.is-open,
.doma-navbar__icon-btn.is-active {
    border-color: var(--doma-primary-border);
    background: var(--doma-primary-soft);
    color: var(--doma-primary);
}

.doma-navbar__launcher {
    background: var(--doma-surface-muted);
    color: var(--doma-heading);
}

.doma-navbar__menu-toggle {
    display: none;
}

.doma-navbar__chip,
.doma-navbar__user {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 280px;
    min-width: 0;
    padding: 5px 10px 5px 5px;
    border: 1px solid var(--doma-border);
    border-radius: var(--doma-radius);
    background: var(--doma-surface-muted);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

/* El botón del usuario no marca borde ni al pasar el mouse: solo el anillo de
   foco con teclado. */
.doma-navbar__user {
    border-color: transparent;
    background: transparent;
}

.doma-navbar__chip:hover:not(.is-static) {
    border-color: var(--doma-primary-border);
}

.doma-navbar__chip.is-static {
    cursor: default;
}

.doma-navbar__icon-btn:focus-visible,
.doma-navbar__chip:focus-visible,
.doma-navbar__user:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--doma-primary-rgb), 0.25);
}

.doma-navbar__chip-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;
}

.doma-navbar__chip-text strong {
    overflow: hidden;
    color: var(--doma-heading);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.doma-navbar__chip-text small {
    overflow: hidden;
    color: var(--doma-muted);
    font-size: 11.5px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.doma-navbar__chevron {
    flex: none;
    color: var(--doma-muted);
    font-size: 18px;
}

.doma-navbar__tenant-mark,
.doma-navbar__avatar {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
}

.doma-navbar__tenant-mark {
    width: 32px;
    height: 32px;
    border-radius: var(--doma-radius);
    background: var(--doma-primary-soft);
    color: var(--doma-primary-ink);
}

.doma-navbar__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.doma-navbar__tenant-mark--sm {
    width: 28px;
    height: 28px;
    border-radius: var(--doma-radius);
    font-size: 11px;
}

.doma-navbar__avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--doma-primary);
    color: var(--doma-on-primary);
}

.doma-navbar__divider {
    width: 1px;
    height: 28px;
    background: var(--doma-border);
}

/* ---------- Menús ---------- */

.doma-navbar__menu {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 1010;
    min-width: 280px;
    padding: 6px;
    border: 1px solid var(--doma-border);
    border-radius: var(--doma-radius-lg);
    background: var(--doma-surface);
    box-shadow: var(--doma-shadow-menu);
}

.doma-navbar__menu--end {
    right: 0;
    left: auto;
}

.doma-navbar__menu-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 4px;
    padding: 8px 10px 10px;
    border-bottom: 1px solid var(--doma-border);
    line-height: 1.35;
}

.doma-navbar__menu-header strong {
    color: var(--doma-heading);
    font-size: 13.5px;
    font-weight: 600;
}

.doma-navbar__menu-header small {
    color: var(--doma-muted);
    font-size: 12px;
}

.doma-navbar__list {
    max-height: 320px;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
}

.doma-navbar__menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: var(--doma-radius);
    background: transparent;
    color: var(--doma-text);
    font: inherit;
    font-size: 13.5px;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
}

.doma-navbar__menu-item:hover {
    background: var(--doma-surface-muted);
    color: var(--doma-text);
}

.doma-navbar__menu-item.is-active {
    background: var(--doma-primary-soft);
    color: var(--doma-primary-ink);
    font-weight: 600;
}

.doma-navbar__menu-item i {
    font-size: 16px;
}

.doma-navbar__menu-item--danger,
.doma-navbar__menu-item--danger:hover {
    color: var(--doma-danger);
}

.doma-navbar__menu-item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* Nombre y, debajo, un dato que lo acompaña (p. ej. el NIT de la empresa). */
.doma-navbar__menu-item-text--stacked {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
}

.doma-navbar__menu-item-text--stacked > * {
    overflow: hidden;
    text-overflow: ellipsis;
}

.doma-navbar__menu-item-text--stacked small {
    color: var(--doma-muted);
    font-size: 11.5px;
    font-weight: 400;
}

.doma-navbar__menu--tenant {
    width: 340px;
    max-width: calc(100vw - 24px);
}

/* ---------- Lanzador de módulos ---------- */

.doma-navbar__menu--launcher {
    width: 380px;
}

.doma-navbar__modules {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
}

.doma-navbar__module {
    --module-ink: color-mix(in srgb, var(--module) 80%, var(--vz-black, #000));

    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 6px 10px;
    border-radius: var(--doma-radius);
    color: var(--doma-heading);
    text-align: center;
    text-decoration: none;
    transition: background-color 0.15s ease;
}

a.doma-navbar__module:hover {
    background: var(--doma-surface-muted);
    color: var(--doma-heading);
}

.doma-navbar__module.is-current {
    background: color-mix(in srgb, var(--module) 10%, transparent);
}

.doma-navbar__module-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--doma-radius);
    background: color-mix(in srgb, var(--module) 14%, transparent);
    color: var(--module-ink);
    font-size: 19px;
}

.doma-navbar__module-name {
    display: -webkit-box;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.doma-navbar__module.is-locked {
    color: var(--doma-muted);
    cursor: default;
}

.doma-navbar__module.is-locked .doma-navbar__module-icon {
    opacity: 0.45;
}

.doma-navbar__module-lock {
    position: absolute;
    top: 8px;
    right: 10px;
    color: var(--doma-muted);
    font-size: 12px;
}

.doma-navbar__menu-footer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 12px;
    margin-top: 4px;
    padding: 6px 4px 2px;
    border-top: 1px solid var(--doma-border);
}

.doma-navbar__menu-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 8px;
    border-radius: var(--doma-radius);
    color: var(--doma-heading);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.doma-navbar__menu-link i {
    color: var(--doma-muted);
    font-size: 16px;
    transition: color 0.15s ease;
}

.doma-navbar__menu-link:hover {
    background: var(--doma-surface-muted);
    color: var(--doma-primary);
}

.doma-navbar__menu-link:hover i {
    color: var(--doma-primary);
}

[data-bs-theme="dark"] .doma-navbar__module {
    --module-ink: color-mix(in srgb, var(--module) 70%, var(--vz-white, #fff));
}

/* ---------- Pantallas angostas ---------- */

@media (max-width: 767.98px) {
    .doma-navbar {
        padding: 0 12px;
    }

    .doma-navbar__menu-toggle {
        display: inline-flex;
    }

    .doma-navbar__chip-text,
    .doma-navbar__user .doma-navbar__chevron,
    .doma-navbar__divider,
    .doma-navbar__brand-name {
        display: none;
    }

    .doma-navbar__brand-block.has-brand {
        width: auto;
        margin-left: 0;
        margin-right: 0;
        padding: 0 10px 0 0;
    }

    .doma-navbar__menu--launcher {
        width: min(380px, calc(100vw - 24px));
    }
}
</style>
