<template>
  <header id="menuPanel" class="app-header">
    <div class="app-header__inner">
      <div class="app-header__left">
        <button
          type="button"
          class="icon-button sidebar-trigger d-md-none"
          :class="{ 'is-active': isVisible }"
          :aria-expanded="String(isVisible)"
          aria-controls="sidebar"
          aria-label="Abrir o cerrar menú principal"
          title="Menú"
          @click="$emit('toggleSidebar')"
        >
          <i :class="isVisible ? 'bi bi-x-lg' : 'bi bi-list'" aria-hidden="true"></i>
        </button>

        <router-link
          :to="{ name: 'panelHome' }"
          class="brand"
          aria-label="Ir al inicio de Visora"
          @click="closeUserMenu"
        >
          <span class="brand__symbol" aria-hidden="true">v</span>
          <span class="brand__name">visora</span>
        </router-link>
      </div>

      <div class="app-header__right">
        <button
          type="button"
          class="icon-button theme-button"
          :aria-label="isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'"
          :title="isDarkMode ? 'Modo claro' : 'Modo oscuro'"
          @click="toggleTheme"
        >
          <i
            :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"
            aria-hidden="true"
          ></i>
        </button>

        <span class="app-header__divider" aria-hidden="true"></span>

        <div ref="userMenu" class="user-menu">
          <button
            type="button"
            class="user-trigger"
            :class="{ 'is-open': isUserMenuOpen }"
            :aria-expanded="String(isUserMenuOpen)"
            aria-haspopup="menu"
            aria-controls="user-account-menu"
            @click.stop="toggleUserMenu"
          >
            <span class="user-avatar" aria-hidden="true">
              {{ userInitials }}
              <span class="user-avatar__status"></span>
            </span>

            <span class="user-trigger__content">
              <span class="user-trigger__name">{{ userDisplayName }}</span>
              <span class="user-trigger__role">{{ userSubtitle }}</span>
            </span>

            <i class="bi bi-chevron-down user-trigger__chevron" aria-hidden="true"></i>
          </button>

          <Transition name="account-menu">
            <section
              v-if="isUserMenuOpen"
              id="user-account-menu"
              class="account-menu"
              role="menu"
              aria-label="Menú de cuenta"
              @click.stop
            >
              <div class="account-menu__profile">
                <span class="account-menu__avatar" aria-hidden="true">{{ userInitials }}</span>
                <div class="account-menu__identity">
                  <strong>{{ userDisplayName }}</strong>
                  <span v-if="user?.email">{{ user.email }}</span>
                </div>
                <span class="account-menu__badge">{{ userRole }}</span>
              </div>

              <div v-if="hasUserDetails" class="account-menu__details">
                <div v-if="user?.phone" class="detail-row">
                  <span class="detail-row__icon"><i class="bi bi-telephone"></i></span>
                  <span class="detail-row__content">
                    <small>Teléfono</small>
                    <strong>{{ user.phone }}</strong>
                  </span>
                  <button
                    type="button"
                    class="copy-button"
                    :class="{ 'is-copied': copiedField === 'phone' }"
                    :aria-label="copiedField === 'phone' ? 'Teléfono copiado' : 'Copiar teléfono'"
                    :title="copiedField === 'phone' ? 'Copiado' : 'Copiar'"
                    @click="copyValue(user.phone, 'phone')"
                  >
                    <i :class="copiedField === 'phone' ? 'bi bi-check-lg' : 'bi bi-copy'"></i>
                  </button>
                </div>

                <div v-if="user?.email" class="detail-row">
                  <span class="detail-row__icon"><i class="bi bi-envelope"></i></span>
                  <span class="detail-row__content">
                    <small>Correo</small>
                    <strong>{{ user.email }}</strong>
                  </span>
                  <button
                    type="button"
                    class="copy-button"
                    :class="{ 'is-copied': copiedField === 'email' }"
                    :aria-label="copiedField === 'email' ? 'Correo copiado' : 'Copiar correo'"
                    :title="copiedField === 'email' ? 'Copiado' : 'Copiar'"
                    @click="copyValue(user.email, 'email')"
                  >
                    <i :class="copiedField === 'email' ? 'bi bi-check-lg' : 'bi bi-copy'"></i>
                  </button>
                </div>

                <div v-if="user?.instance" class="detail-row">
                  <span class="detail-row__icon"><i class="bi bi-hdd-stack"></i></span>
                  <span class="detail-row__content">
                    <small>Instancia</small>
                    <strong>{{ user.instance }}</strong>
                  </span>
                </div>
              </div>

              <div class="account-menu__actions">
                <router-link
                  class="account-action"
                  :to="{ name: 'changePassword' }"
                  role="menuitem"
                  @click="closeUserMenu"
                >
                  <span class="account-action__icon"><i class="bi bi-shield-lock"></i></span>
                  <span>
                    <strong>{{ menuTranslation('password', 'Cambiar contraseña') }}</strong>
                    <small>Actualiza la seguridad de tu cuenta</small>
                  </span>
                  <i class="bi bi-chevron-right account-action__arrow" aria-hidden="true"></i>
                </router-link>

                <button
                  type="button"
                  class="account-action account-action--danger"
                  role="menuitem"
                  @click="handleLogout"
                >
                  <span class="account-action__icon"><i class="bi bi-box-arrow-right"></i></span>
                  <span>
                    <strong>{{ menuTranslation('logout', 'Cerrar sesión') }}</strong>
                    <small>Salir de forma segura</small>
                  </span>
                  <i class="bi bi-chevron-right account-action__arrow" aria-hidden="true"></i>
                </button>
              </div>
            </section>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

const THEME_STORAGE_KEY = 'isDarkMode';

export default {
  name: 'MenuPanelComponent',
  emits: ['toggleSidebar', 'themeChanged'],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isUserMenuOpen: false,
      isDarkMode: false,
      copiedField: null,
      copyResetTimer: null,
    };
  },
  computed: {
    userDisplayName() {
      const name = String(this.user?.name || '').trim();
      if (name) return name;

      const email = String(this.user?.email || '').trim();
      if (email.includes('@')) return email.split('@')[0];

      return 'Usuario';
    },
    userInitials() {
      const words = this.userDisplayName
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);

      if (!words.length) return 'U';
      if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    },
    userRole() {
      return String(this.user?.level || 'Usuario');
    },
    userSubtitle() {
      return String(this.user?.level || this.user?.instance || 'Cuenta activa');
    },
    hasUserDetails() {
      return Boolean(this.user?.phone || this.user?.email || this.user?.instance);
    },
  },
  watch: {
    '$route.fullPath'() {
      this.closeUserMenu();
    },
  },
  mounted() {
    this.loadTheme();
    document.addEventListener('pointerdown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleDocumentKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleDocumentKeydown);

    if (this.copyResetTimer) {
      window.clearTimeout(this.copyResetTimer);
    }
  },
  methods: {
    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen;
    },
    closeUserMenu() {
      this.isUserMenuOpen = false;
    },
    handleClickOutside(event) {
      const menu = this.$refs.userMenu;
      if (menu && !menu.contains(event.target)) {
        this.closeUserMenu();
      }
    },
    handleDocumentKeydown(event) {
      if (event.key === 'Escape') {
        this.closeUserMenu();
      }
    },
    menuTranslation(key, fallback) {
      const translationKey = `menu.${key}`;

      try {
        const translated = this.$t?.(translationKey);
        return translated && translated !== translationKey ? translated : fallback;
      } catch (error) {
        return fallback;
      }
    },
    loadTheme() {
      const savedMode = sessionStorage.getItem(THEME_STORAGE_KEY);
      this.isDarkMode = savedMode === 'true';
      this.applyTheme();
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      sessionStorage.setItem(THEME_STORAGE_KEY, String(this.isDarkMode));
      this.applyTheme();
      this.$emit('themeChanged', this.isDarkMode);
    },
    applyTheme() {
      document.body.classList.toggle('dark', this.isDarkMode);
    },
    async copyValue(value, field) {
      if (!value) return;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(String(value));
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = String(value);
          textArea.setAttribute('readonly', '');
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        this.copiedField = field;
        if (this.copyResetTimer) window.clearTimeout(this.copyResetTimer);
        this.copyResetTimer = window.setTimeout(() => {
          this.copiedField = null;
        }, 1600);
      } catch (error) {
        console.error('No se pudo copiar el valor:', error);
      }
    },
    async handleLogout() {
      this.closeUserMenu();
      await this.logout();
    },
  },
  setup() {
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);

    const logout = async () => {
      try {
        await authStore.logout();
      } finally {
        window.location.assign('/');
      }
    };

    return {
      user,
      logout,
    };
  },
};
</script>

<style scoped>
.app-header {
  --header-primary: #007bff;
  --header-primary-dark: #0056b3;
  --header-text: #1f2937;
  --header-muted: #6b7280;
  --header-border: #e5e7eb;
  --header-surface: rgba(255, 255, 255, 0.96);

  position: fixed;
  inset: 0 0 auto 0;
  z-index: 590;
  height: 72px;
  color: var(--header-text);
  background: var(--header-surface);
  border-bottom: 1px solid var(--header-border);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.app-header__inner {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.app-header__left,
.app-header__right {
  min-width: 0;
  display: flex;
  align-items: center;
}

.app-header__left {
  gap: 12px;
}

.app-header__right {
  justify-content: flex-end;
  gap: 10px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--header-text);
  text-decoration: none;
  border-radius: 12px;
  outline: none;
}

.brand:focus-visible {
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.16);
}

.brand__symbol {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #fff;
  background: linear-gradient(145deg, var(--header-primary), var(--header-primary-dark));
  border-radius: 10px;
  font-size: 19px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 7px 16px rgba(0, 123, 255, 0.22);
}

.brand__name {
  font-size: 21px;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.icon-button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  color: #4b5563;
  background: #f8fafc;
  border: 1px solid #e6eaf0;
  border-radius: 12px;
  cursor: pointer;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.icon-button i {
  font-size: 18px;
  line-height: 1;
}

.icon-button:hover,
.icon-button.is-active {
  color: var(--header-primary);
  background: #eef6ff;
  border-color: rgba(0, 123, 255, 0.24);
  box-shadow: 0 6px 14px rgba(0, 123, 255, 0.1);
}

.icon-button:active {
  transform: scale(0.96);
}

.icon-button:focus-visible,
.user-trigger:focus-visible,
.copy-button:focus-visible,
.account-action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.16);
}

.app-header__divider {
  width: 1px;
  height: 30px;
  background: var(--header-border);
}

.user-menu {
  position: relative;
}

.user-trigger {
  min-width: 190px;
  height: 48px;
  padding: 5px 10px 5px 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--header-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.user-trigger:hover,
.user-trigger.is-open {
  background: #f8fafc;
  border-color: #e6eaf0;
}

.user-avatar,
.account-menu__avatar {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #fff;
  background: linear-gradient(145deg, var(--header-primary), var(--header-primary-dark));
  font-weight: 750;
  text-transform: uppercase;
  box-shadow: 0 7px 16px rgba(0, 123, 255, 0.18);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  font-size: 12px;
}

.user-avatar__status {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border: 2px solid #fff;
  border-radius: 50%;
}

.user-trigger__content {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-trigger__name,
.user-trigger__role {
  max-width: 125px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-trigger__name {
  font-size: 13px;
  font-weight: 700;
}

.user-trigger__role {
  margin-top: 3px;
  color: var(--header-muted);
  font-size: 11px;
}

.user-trigger__chevron {
  color: #94a3b8;
  font-size: 12px;
  transition: transform 200ms ease;
}

.user-trigger.is-open .user-trigger__chevron {
  transform: rotate(180deg);
}

.account-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: min(380px, calc(100vw - 28px));
  overflow: hidden;
  color: var(--header-text);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow:
    0 24px 55px rgba(15, 23, 42, 0.16),
    0 4px 12px rgba(15, 23, 42, 0.06);
  transform-origin: top right;
}

.account-menu__profile {
  padding: 18px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  background: linear-gradient(145deg, #f7fbff, #eef6ff);
  border-bottom: 1px solid #e4eef9;
}

.account-menu__avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  font-size: 14px;
}

.account-menu__identity {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.account-menu__identity strong,
.account-menu__identity span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu__identity strong {
  font-size: 14px;
}

.account-menu__identity span {
  margin-top: 4px;
  color: var(--header-muted);
  font-size: 12px;
}

.account-menu__badge {
  max-width: 100px;
  padding: 5px 8px;
  overflow: hidden;
  color: var(--header-primary-dark);
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(0, 123, 255, 0.14);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.account-menu__details {
  padding: 10px 12px;
  border-bottom: 1px solid #edf0f4;
}

.detail-row {
  min-height: 52px;
  padding: 8px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  border-radius: 12px;
}

.detail-row:hover {
  background: #f8fafc;
}

.detail-row__icon,
.account-action__icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: var(--header-primary);
  background: #eef6ff;
  border-radius: 10px;
}

.detail-row__icon {
  width: 34px;
  height: 34px;
}

.detail-row__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.detail-row__content small,
.detail-row__content strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-row__content small {
  color: var(--header-muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-row__content strong {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 650;
}

.copy-button {
  width: 31px;
  height: 31px;
  padding: 0;
  display: grid;
  place-items: center;
  color: #64748b;
  background: transparent;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease;
}

.copy-button:hover {
  color: var(--header-primary);
  background: #eaf4ff;
}

.copy-button.is-copied {
  color: #15803d;
  background: #ecfdf3;
}

.account-menu__actions {
  padding: 8px;
}

.account-action {
  width: 100%;
  min-height: 58px;
  padding: 9px 10px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  color: var(--header-text);
  background: transparent;
  border: 0;
  border-radius: 12px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}

.account-action:hover {
  color: var(--header-primary-dark);
  background: #f1f7ff;
}

.account-action__icon {
  width: 36px;
  height: 36px;
}

.account-action > span:nth-child(2) {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.account-action strong {
  font-size: 12px;
}

.account-action small {
  margin-top: 3px;
  color: var(--header-muted);
  font-size: 10px;
}

.account-action__arrow {
  color: #a3afbf;
  font-size: 11px;
}

.account-action--danger:hover {
  color: #b42318;
  background: #fff5f4;
}

.account-action--danger .account-action__icon {
  color: #dc2626;
  background: #fff1f1;
}

.account-menu-enter-active,
.account-menu-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.account-menu-enter-from,
.account-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

:global(body.dark) .app-header {
  --header-text: #f3f4f6;
  --header-muted: #a6b0be;
  --header-border: #293241;
  --header-surface: rgba(18, 24, 33, 0.96);

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

:global(body.dark) .icon-button,
:global(body.dark) .user-trigger:hover,
:global(body.dark) .user-trigger.is-open {
  color: #d7dee8;
  background: #1e2936;
  border-color: #303b4a;
}

:global(body.dark) .account-menu {
  color: #eef2f7;
  background: #18212c;
  border-color: #303b4a;
}

:global(body.dark) .account-menu__profile {
  background: linear-gradient(145deg, #182739, #162130);
  border-color: #2b3b4f;
}

:global(body.dark) .account-menu__details,
:global(body.dark) .detail-row,
:global(body.dark) .account-menu__actions {
  border-color: #2a3441;
}

:global(body.dark) .detail-row:hover,
:global(body.dark) .account-action:hover {
  background: #202c39;
}

:global(body.dark) .user-avatar__status {
  border-color: #121821;
}

@media (max-width: 767.98px) {
  .app-header {
    height: 64px;
  }

  .app-header__inner {
    padding: 0 14px;
    gap: 12px;
  }

  .brand {
    gap: 7px;
  }

  .brand__symbol {
    width: 29px;
    height: 29px;
    border-radius: 9px;
    font-size: 17px;
  }

  .brand__name {
    font-size: 19px;
  }

  .theme-button {
    width: 38px;
    height: 38px;
  }

  .app-header__divider,
  .user-trigger__content,
  .user-trigger__chevron {
    display: none;
  }

  .user-trigger {
    min-width: auto;
    width: 42px;
    height: 42px;
    padding: 3px;
    justify-content: center;
    border-radius: 12px;
  }

  .user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .account-menu {
    position: fixed;
    top: 74px;
    right: 12px;
    left: 12px;
    width: auto;
    max-height: calc(100dvh - 88px);
    overflow-y: auto;
    transform-origin: top center;
  }
}

.router-link-active.brand{
  border: none!important;
}

@media (max-width: 389px) {
  .app-header__right {
    gap: 6px;
  }

  .brand__name {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header *,
  .app-header *::before,
  .app-header *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
