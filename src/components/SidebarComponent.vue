<template>
  <div class="sidebar-root">
    <Transition name="sidebar-overlay">
      <button
        v-if="isVisible && isMobile"
        type="button"
        class="sidebar-backdrop"
        aria-label="Cerrar menú principal"
        @click="$emit('closeSidebar')"
      ></button>
    </Transition>

    <aside
      id="sidebar"
      ref="sidebar"
      class="sidebar"
      :class="{
        'sidebar--open': isVisible,
        'sidebar--expanded': isExpanded,
        'sidebar--pinned': isPinned,
      }"
      aria-label="Navegación principal"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focusin="handleFocusIn"
      @focusout="handleFocusOut"
      @wheel="handleSidebarWheel"
      @keydown.esc="handleEscape"
    >
      <div class="sidebar__mobile-header d-md-none">
        <div>
          <span class="sidebar__mobile-eyebrow">Navegación</span>
          <strong>Menú principal</strong>
        </div>
        <button
          type="button"
          class="sidebar__close-button"
          aria-label="Cerrar menú"
          @click="$emit('closeSidebar')"
        >
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>

      <div class="sidebar__desktop-tools d-none d-md-flex">
        <span class="sidebar__section-title">Navegación</span>
        <button
          type="button"
          class="sidebar__pin-button"
          :class="{ 'is-active': isPinned }"
          :aria-pressed="String(isPinned)"
          :aria-label="isPinned ? 'Desfijar menú lateral' : 'Fijar menú lateral abierto'"
          :title="isPinned ? 'Desfijar menú' : 'Fijar menú abierto'"
          @click="togglePinned"
        >
          <i :class="isPinned ? 'bi bi-pin-angle-fill' : 'bi bi-pin-angle'" aria-hidden="true"></i>
        </button>
      </div>

      <nav ref="navigation" class="sidebar__navigation" aria-label="Secciones de la aplicación">
        <ul class="sidebar__list">
          <!-- <li class="sidebar__item">
            <router-link
              :to="{ name: 'panelHome' }"
              class="sidebar-link"
              :class="{ active: isHomeActive }"
              :title="!isExpanded ? menuLabelText('home', 'Inicio') : null"
              @click="handleNavigation"
            >
              <span class="sidebar-link__icon">
                <i class="bi bi-house-door" aria-hidden="true"></i>
              </span>
              <span
                class="sidebar-link__label"
                v-html="menuLabelHtml('home', 'Inicio')"
              ></span>
              <span v-if="isHomeActive" class="sidebar-link__active-dot" aria-hidden="true"></span>
            </router-link>
          </li>

          <li v-if="groupedMenu.length" class="sidebar__separator" aria-hidden="true">
            <span></span>
          </li> -->

          <li
            v-for="category in groupedMenu"
            :key="category.name"
            class="sidebar__item sidebar__item--category"
          >
            <button
              type="button"
              class="sidebar-link sidebar-link--category"
              :class="{
                active: isCategoryActive(category),
                'is-open': openDropdown === category.name,
              }"
              :title="!isExpanded ? categoryLabelText(category.name) : null"
              :aria-expanded="String(openDropdown === category.name)"
              :aria-controls="categoryId(category.name)"
              @click="toggleDropdown(category.name)"
            >
              <span class="sidebar-link__icon" v-html="category.icon" aria-hidden="true"></span>
              <span
                class="sidebar-link__label"
                v-html="categoryLabelHtml(category.name)"
              ></span>
              <i class="bi bi-chevron-right sidebar-link__chevron" aria-hidden="true"></i>
              <!-- <span
                v-if="isCategoryActive(category)"
                class="sidebar-link__active-dot"
                aria-hidden="true"
              ></span> -->
            </button>

            <Transition name="sidebar-submenu">
              <ul
                v-show="openDropdown === category.name && isExpanded"
                :id="categoryId(category.name)"
                class="sidebar-submenu"
              >
                <li
                  v-for="route in category.routes"
                  :key="route.name"
                  class="sidebar-submenu__item"
                >
                  <router-link
                    :to="route.path"
                    class="sidebar-submenu__link"
                    :class="{ active: isRouteActive(route.path) }"
                    @click="handleNavigation"
                  >
                    <span class="sidebar-submenu__icon" aria-hidden="true">
                      <span v-if="route.icon" v-html="route.icon"></span>
                      <i v-else class="bi bi-dot"></i>
                    </span>
                    <span
                      class="sidebar-submenu__label"
                      v-html="menuLabelHtml(route.name, humanize(route.name))"
                    ></span>
                  </router-link>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>

        <div v-if="!groupedMenu.length" class="sidebar__empty" :class="{ 'is-visible': isExpanded }">
          <span class="sidebar__empty-icon"><i class="bi bi-shield-check"></i></span>
          <div>
            <strong>Sin módulos adicionales</strong>
            <small>Tu usuario no tiene más secciones habilitadas.</small>
          </div>
        </div>
      </nav>

      <div class="sidebar__footer">
        <div v-if="fixedAdminItem" class="sidebar-admin">
          <template v-if="fixedAdminItem.type === 'category'">
            <Transition name="sidebar-submenu">
              <ul
                v-show="openDropdown === fixedAdminItem.name && isExpanded"
                :id="categoryId(`fixed-${fixedAdminItem.name}`)"
                class="sidebar-admin-submenu"
              >
                <li
                  v-for="route in fixedAdminItem.routes"
                  :key="route.name"
                  class="sidebar-submenu__item"
                >
                  <router-link
                    :to="route.path"
                    class="sidebar-submenu__link"
                    :class="{ active: isRouteActive(route.path) }"
                    @click="handleNavigation"
                  >
                    <span class="sidebar-submenu__icon" aria-hidden="true">
                      <span v-if="route.icon" v-html="route.icon"></span>
                      <i v-else class="bi bi-dot"></i>
                    </span>
                    <span
                      class="sidebar-submenu__label"
                      v-html="menuLabelHtml(route.name, humanize(route.name))"
                    ></span>
                  </router-link>
                </li>
              </ul>
            </Transition>

            <button
              type="button"
              class="sidebar-link sidebar-link--admin"
              :class="{
                active: isCategoryActive(fixedAdminItem),
                'is-open': openDropdown === fixedAdminItem.name,
              }"
              :title="!isExpanded ? categoryLabelText(fixedAdminItem.name) : null"
              :aria-expanded="String(openDropdown === fixedAdminItem.name)"
              :aria-controls="categoryId(`fixed-${fixedAdminItem.name}`)"
              @click="toggleDropdown(fixedAdminItem.name)"
            >
              <span class="sidebar-link__icon" v-html="fixedAdminItem.icon" aria-hidden="true"></span>
              <span
                class="sidebar-link__label"
                v-html="categoryLabelHtml(fixedAdminItem.name)"
              ></span>
              <i class="bi bi-chevron-up sidebar-link__chevron" aria-hidden="true"></i>
              <!-- <span
                v-if="isCategoryActive(fixedAdminItem)"
                class="sidebar-link__active-dot"
                aria-hidden="true"
              ></span> -->
            </button>
          </template>

          <router-link
            v-else
            :to="fixedAdminItem.path"
            class="sidebar-link sidebar-link--admin"
            :class="{ active: isRouteActive(fixedAdminItem.path) }"
            :title="!isExpanded ? menuLabelText(fixedAdminItem.name, 'Admin') : null"
            @click="handleNavigation"
          >
            <span class="sidebar-link__icon" v-html="fixedAdminItem.icon" aria-hidden="true"></span>
            <span
              class="sidebar-link__label"
              v-html="menuLabelHtml(fixedAdminItem.name, 'Admin')"
            ></span>
            <span
              v-if="isRouteActive(fixedAdminItem.path)"
              class="sidebar-link__active-dot"
              aria-hidden="true"
            ></span>
          </router-link>
        </div>

        <button
          type="button"
          class="sidebar__mobile-collapse d-md-none"
          @click="$emit('closeSidebar')"
        >
          <i class="bi bi-arrow-left"></i>
          <span>Cerrar menú</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script>
const SIDEBAR_PIN_STORAGE_KEY = 'visora.sidebar.pinned';
const MOBILE_BREAKPOINT = '(max-width: 767.98px)';
const DEFAULT_ADMIN_ICON = '<i class="bi bi-shield-lock"></i>';

function sanitizeMenuMarkup(value) {
  let html = String(value ?? '');

  html = html.replace(
    /<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    '',
  );
  html = html.replace(/<(?!\/?(?:b|strong|em|i|small|span|br)\b)[^>]*>/gi, '');
  html = html.replace(/<(b|strong|em|i|small|span)\b[^>]*>/gi, '<$1>');
  html = html.replace(/<br\b[^>]*\/?>/gi, '<br>');
  html = html.replace(/<\/(b|strong|em|i|small|span)\s*>/gi, '</$1>');

  return html;
}

function menuMarkupToText(value) {
  const html = sanitizeMenuMarkup(value);

  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  const element = document.createElement('div');
  element.innerHTML = html;
  return String(element.textContent || '').trim();
}

export default {
  name: 'SidebarComponent',
  emits: ['closeSidebar'],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      groupedMenu: [],
      fixedAdminItem: null,
      openDropdown: null,
      allowedCategories: [],
      permissionsConfigured: false,
      isPinned: false,
      isHovering: false,
      hasKeyboardFocus: false,
      isMobile: false,
      mediaQuery: null,
      previousBodyOverflow: '',
    };
  },
  computed: {
    isExpanded() {
      return this.isMobile || this.isPinned || this.isHovering || this.hasKeyboardFocus;
    },
    isHomeActive() {
      return this.$route?.name === 'panelHome';
    },
  },
  watch: {
    isVisible() {
      this.syncBodyScroll();
    },
    '$route.fullPath'() {
      this.syncActiveCategory();

      if (this.isMobile && this.isVisible) {
        this.$emit('closeSidebar');
      } else if (!this.isPinned && !this.isHovering) {
        this.hasKeyboardFocus = false;
      }
    },
  },
  mounted() {
    this.setupResponsiveState();
    this.loadPinnedState();
    this.loadPermissions();
    this.loadMenu();
    this.syncActiveCategory();
    this.syncBodyScroll();
  },
  beforeUnmount() {
    this.teardownResponsiveState();
    this.restoreBodyScroll();
  },
  methods: {
    setupResponsiveState() {
      this.mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
      this.isMobile = this.mediaQuery.matches;

      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.handleBreakpointChange);
      } else {
        this.mediaQuery.addListener(this.handleBreakpointChange);
      }
    },
    teardownResponsiveState() {
      if (!this.mediaQuery) return;

      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.handleBreakpointChange);
      } else {
        this.mediaQuery.removeListener(this.handleBreakpointChange);
      }
    },
    handleBreakpointChange(event) {
      this.isMobile = event.matches;
      this.isHovering = false;
      this.hasKeyboardFocus = false;

      if (!this.isMobile && this.isVisible) {
        this.$emit('closeSidebar');
      }

      //this.syncBodyScroll();
    },
    loadPinnedState() {
      try {
        this.isPinned = localStorage.getItem(SIDEBAR_PIN_STORAGE_KEY) === 'true';
      } catch (error) {
        this.isPinned = false;
      }
    },
    togglePinned() {
      this.isPinned = !this.isPinned;

      try {
        localStorage.setItem(SIDEBAR_PIN_STORAGE_KEY, String(this.isPinned));
      } catch (error) {
        console.warn('No se pudo guardar el estado del sidebar:', error);
      }
    },
    handleMouseEnter() {
      if (!this.isMobile) this.isHovering = true;
    },
    handleMouseLeave() {
      if (this.isMobile) return;

      this.isHovering = false;

      if (!this.isPinned) {
        this.hasKeyboardFocus = false;
        this.blurFocusedSidebarElement();
      }
    },
    handleFocusIn() {
      if (!this.isMobile) this.hasKeyboardFocus = true;
    },
    handleFocusOut(event) {
      if (this.isMobile) return;

      const nextElement = event.relatedTarget;
      if (!nextElement || !this.$refs.sidebar?.contains(nextElement)) {
        this.hasKeyboardFocus = false;
      }
    },
    handleEscape() {
      if (this.isMobile && this.isVisible) {
        this.$emit('closeSidebar');
        return;
      }

      this.isHovering = false;
      this.hasKeyboardFocus = false;
      this.blurFocusedSidebarElement();
    },
    blurFocusedSidebarElement() {
      const activeElement = document.activeElement;

      if (
        activeElement &&
        this.$refs.sidebar?.contains(activeElement) &&
        typeof activeElement.blur === 'function'
      ) {
        activeElement.blur();
      }
    },
    handleSidebarWheel(event) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const adminSubmenu = event.target?.closest?.('.sidebar-admin-submenu');
      const scrollContainer =
        adminSubmenu && adminSubmenu.scrollHeight > adminSubmenu.clientHeight
          ? adminSubmenu
          : this.$refs.navigation;

      if (!scrollContainer) return;

      const multiplier =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? scrollContainer.clientHeight
            : 1;
      const delta = event.deltaY * multiplier;

      if (!delta) return;

      scrollContainer.scrollTop += delta;
      event.preventDefault();
    },
    syncBodyScroll() {
      if (this.isMobile && this.isVisible) {
        if (document.body.style.overflow !== 'hidden') {
          this.previousBodyOverflow = document.body.style.overflow;
        }
        document.body.style.overflow = 'hidden';
      } else {
        this.restoreBodyScroll();
      }
    },
    restoreBodyScroll() {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = this.previousBodyOverflow || '';
      }
    },
    loadPermissions() {
      try {
        const menuData = sessionStorage.getItem('menu');
        this.permissionsConfigured = Boolean(menuData);

        if (!menuData) {
          this.allowedCategories = [];
          return;
        }

        const permissions = JSON.parse(menuData);
        if (!Array.isArray(permissions)) {
          this.allowedCategories = [];
          return;
        }

        this.allowedCategories = [
          ...new Set(
            permissions
              .map((permission) => this.normalizeCategory(permission?.category))
              .filter(Boolean),
          ),
        ];
      } catch (error) {
        console.error('Error al cargar permisos del menú:', error);
        this.allowedCategories = [];
        this.permissionsConfigured = true;
      }
    },
    loadMenu() {
      const allRoutes = this.$router.getRoutes();

      const parentRoutes = allRoutes.filter(
        (route) =>
          route.meta?.category &&
          route.path.startsWith('/panel/') &&
          Array.isArray(route.children) &&
          route.children.length > 0,
      );

      const categories = parentRoutes
        .filter((parent) =>
          this.allowedCategories.includes(this.normalizeCategory(parent.meta.category)),
        )
        .map((parent) => ({
          name: String(parent.meta.category),
          routeName: String(parent.name || ''),
          icon: parent.meta.icon || '<i class="bi bi-folder"></i>',
          routes: parent.children
            .filter((child) => child.name && child.path && !child.meta?.hideInMenu)
            .map((child) => ({
              name: String(child.name),
              path: this.resolveChildPath(parent.path, child.path),
              icon: child.meta?.icon || null,
            })),
        }))
        .filter((category) => category.routes.length > 0);

      this.fixedAdminItem = this.extractFixedAdminItem(categories);
      this.groupedMenu = categories.filter((category) => category.routes.length > 0);
    },
    extractFixedAdminItem(categories) {
      const categoryIndex = categories.findIndex(
        (category) =>
          this.isAdminMenuName(category.name) || this.isAdminMenuName(category.routeName),
      );

      if (categoryIndex >= 0) {
        const [category] = categories.splice(categoryIndex, 1);
        return {
          ...category,
          type: 'category',
          icon: category.icon || DEFAULT_ADMIN_ICON,
        };
      }

      for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
        const category = categories[categoryIndex];
        const routeIndex = category.routes.findIndex(
          (route) =>
            this.isAdminMenuName(route.name) ||
            this.isAdminMenuName(String(route.path).split('/').filter(Boolean).pop()),
        );

        if (routeIndex < 0) continue;

        const [route] = category.routes.splice(routeIndex, 1);

        if (!category.routes.length) {
          categories.splice(categoryIndex, 1);
        }

        return {
          ...route,
          type: 'route',
          icon: route.icon || DEFAULT_ADMIN_ICON,
        };
      }

      return null;
    },
    isAdminMenuName(value) {
      const normalized = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, '');

      return (
        normalized === 'admin' ||
        normalized === 'amin' ||
        normalized === 'administracion' ||
        normalized === 'administration' ||
        normalized.endsWith('admin')
      );
    },
    resolveChildPath(parentPath, childPath) {
      if (String(childPath).startsWith('/')) return String(childPath);

      const parent = String(parentPath).replace(/\/+$/, '');
      const child = String(childPath).replace(/^\/+/, '');
      return `${parent}/${child}`;
    },
    normalizeCategory(value) {
      return String(value || '').trim().toLocaleLowerCase();
    },
    categoryLabelHtml(categoryName) {
      return this.menuLabelHtml(categoryName, this.humanize(categoryName));
    },
    categoryLabelText(categoryName) {
      return this.menuLabelText(categoryName, this.humanize(categoryName));
    },
    menuLabel(key, fallback) {
      const translationKey = `menu.${key}`;

      try {
        const translated = this.$t?.(translationKey);
        const value = translated && translated !== translationKey ? translated : fallback;
        return String(value ?? fallback ?? '');
      } catch (error) {
        return String(fallback ?? '');
      }
    },
    menuLabelHtml(key, fallback) {
      return sanitizeMenuMarkup(this.menuLabel(key, fallback));
    },
    menuLabelText(key, fallback) {
      return menuMarkupToText(this.menuLabel(key, fallback));
    },
    humanize(value) {
      return String(value || '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/^./, (letter) => letter.toUpperCase());
    },
    categoryId(name) {
      const normalized = String(name)
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      return `sidebar-category-${normalized || 'menu'}`;
    },
    toggleDropdown(name) {
      this.openDropdown = this.openDropdown === name ? null : name;
    },
    isRouteActive(path) {
      const currentPath = String(this.$route?.path || '').replace(/\/+$/, '');
      const routePath = String(path || '').replace(/\/+$/, '');

      return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
    },
    isCategoryActive(category) {
      return category.routes.some((route) => this.isRouteActive(route.path));
    },
    syncActiveCategory() {
      const categories = [...this.groupedMenu];

      if (this.fixedAdminItem?.type === 'category') {
        categories.push(this.fixedAdminItem);
      }

      const activeCategory = categories.find((category) => this.isCategoryActive(category));
      if (activeCategory) {
        this.openDropdown = activeCategory.name;
      }
    },
    handleNavigation() {
      if (this.isMobile) {
        this.$emit('closeSidebar');
        return;
      }

      if (!this.isPinned) {
        this.hasKeyboardFocus = false;

        window.requestAnimationFrame(() => {
          this.blurFocusedSidebarElement();
        });
      }
    },
  },
};
</script>

<style scoped>
.sidebar-root {
  --sidebar-primary: #007bff;
  --sidebar-primary-dark: #0056b3;
  --sidebar-rail-width: 90px;
  --sidebar-expanded-width: 288px;
  --sidebar-header-height: 72px;
  --sidebar-surface: #ffffff;
  --sidebar-text: #374151;
  --sidebar-muted: #788596;
  --sidebar-border: #e5e7eb;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 500;
  width: 100%;
  height: 100%;
  padding: 0;
  background: rgba(15, 23, 42, 0.48);
  border: 0;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.sidebar {
  position: fixed;
  top: var(--sidebar-header-height);
  bottom: 0;
  left: 0;
  z-index: 510;
  width: var(--sidebar-rail-width);
  display: flex;
  flex-direction: column;
  color: var(--sidebar-text);
  background: var(--sidebar-surface);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: 8px 0 28px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  overscroll-behavior: contain;
  touch-action: pan-y;
  transition:
    width 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 260ms ease,
    transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.sidebar.sidebar--expanded {
  width: var(--sidebar-expanded-width);
  box-shadow: 14px 0 34px rgba(15, 23, 42, 0.11);
}

.sidebar__desktop-tools {
  min-height: 54px;
  padding: 9px 14px;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  border-bottom: 1px solid #edf0f4;
}

.sidebar__section-title {
  min-width: 0;
  overflow: hidden;
  color: #98a2b3;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 160ms ease 60ms, transform 160ms ease 60ms;
}

.sidebar--expanded .sidebar__section-title {
  opacity: 1;
  transform: translateX(0);
}

.sidebar__pin-button,
.sidebar__close-button,
.sidebar__mobile-collapse {
  padding: 0;
  border: 0;
  cursor: pointer;
}

.sidebar__pin-button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #7b8797;
  background: #f6f8fb;
  border: 1px solid #e7ebf0;
  border-radius: 11px;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.sidebar:not(.sidebar--expanded) .sidebar__pin-button {
  margin: 0 auto;
}

.sidebar__pin-button:hover,
.sidebar__pin-button.is-active {
  color: var(--sidebar-primary);
  background: #eef6ff;
  border-color: rgba(0, 123, 255, 0.24);
}

.sidebar__pin-button:active {
  transform: scale(0.95);
}

.sidebar__navigation {
  min-height: 0;
  padding: 10px;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #d4dae2 transparent;
}

.sidebar__navigation::-webkit-scrollbar {
  width: 5px;
}

.sidebar__navigation::-webkit-scrollbar-thumb {
  background: #d4dae2;
  border-radius: 999px;
}

.sidebar__list,
.sidebar-submenu {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__item {
  margin-bottom: 5px;
}

.sidebar__separator {
  height: 15px;
  padding: 7px 8px;
}

.sidebar__separator span {
  display: block;
  height: 1px;
  background: #edf0f4;
}

.sidebar-link {
  position: relative;
  width: 100%;
  min-height: 50px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 11px;
  overflow: hidden;
  color: var(--sidebar-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 13px;
  text-align: left;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 170ms ease,
    background-color 170ms ease,
    border-color 170ms ease,
    box-shadow 170ms ease;
}

.sidebar-link:hover {
  color: var(--sidebar-primary-dark);
  background: #f3f8ff;
  border-color: #e1efff;
}

.sidebar-link.active {
  color: var(--sidebar-primary-dark);
  background: linear-gradient(135deg, #edf6ff, #f5f9ff);
  border-color: rgba(0, 123, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55);
}

.sidebar-link:focus-visible,
.sidebar-submenu__link:focus-visible,
.sidebar__pin-button:focus-visible,
.sidebar__close-button:focus-visible,
.sidebar__mobile-collapse:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.16);
}

.sidebar-link__icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  color: #667386;
  background: #f6f8fb;
  border: 1px solid #e9edf2;
  border-radius: 12px;
  font-size: 17px;
  line-height: 1;
  transition:
    color 170ms ease,
    background-color 170ms ease,
    border-color 170ms ease,
    transform 170ms ease;
}

.sidebar-link:hover .sidebar-link__icon,
.sidebar-link.active .sidebar-link__icon {
  color: #fff;
  background: linear-gradient(145deg, var(--sidebar-primary), var(--sidebar-primary-dark));
  border-color: transparent;
  box-shadow: 0 7px 14px rgba(0, 123, 255, 0.2);
  transform: translateY(-1px);
}

.sidebar-link__icon :deep(i),
.sidebar-link__icon :deep(svg) {
  display: block;
  font-size: 17px;
  line-height: 1;
}

.sidebar-link__label {
  min-width: 0;
  overflow: hidden;
  flex: 1;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateX(-8px);
  transition:
    opacity 150ms ease,
    transform 180ms ease;
}

.sidebar--expanded .sidebar-link__label {
  opacity: 1;
  transform: translateX(0);
  transition-delay: 55ms;
}

.sidebar-link__chevron {
  margin-right: 3px;
  color: #9aa5b4;
  font-size: 11px;
  opacity: 0;
  transform: translateX(-4px) rotate(0deg);
  transition:
    opacity 140ms ease,
    transform 180ms ease;
}

.sidebar--expanded .sidebar-link__chevron {
  opacity: 1;
  transform: translateX(0) rotate(0deg);
  transition-delay: 55ms;
}

.sidebar-link.is-open .sidebar-link__chevron {
  transform: rotate(90deg);
}

.sidebar-link__active-dot {
  position: absolute;
  top: 50%;
  right: 5px;
  width: 4px;
  height: 20px;
  background: var(--sidebar-primary);
  border-radius: 999px;
  transform: translateY(-50%);
}

.sidebar--expanded .sidebar-link__active-dot {
  right: 1px;
}

.sidebar-submenu {
  margin: 5px 4px 8px 20px;
  padding: 6px 7px 6px 22px;
  border-left: 1px solid #dce5ef;
}

.sidebar-submenu__item + .sidebar-submenu__item {
  margin-top: 3px;
}

.sidebar-submenu__link {
  min-height: 38px;
  padding: 7px 9px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #596579;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 550;
  line-height: 1.25;
  text-decoration: none;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
}

.sidebar-submenu__link:hover {
  color: var(--sidebar-primary-dark);
  background: #f1f7ff;
  transform: translateX(2px);
}

.sidebar-submenu__link.active {
  color: var(--sidebar-primary-dark);
  background: #e9f4ff;
  font-weight: 700;
}

.sidebar-submenu__icon {
  width: 18px;
  display: grid;
  place-items: center;
  flex: 0 0 18px;
  color: #8da0b7;
}

.sidebar-submenu__icon :deep(i),
.sidebar-submenu__icon :deep(svg) {
  font-size: 12px;
}

.sidebar__empty {
  margin-top: 12px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  overflow: hidden;
  color: #667386;
  background: #f8fafc;
  border: 1px dashed #dce3eb;
  border-radius: 13px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
}

.sidebar__empty.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.sidebar__empty-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: var(--sidebar-primary);
  background: #eaf4ff;
  border-radius: 10px;
}

.sidebar__empty div {
  min-width: 185px;
  display: flex;
  flex-direction: column;
}

.sidebar__empty strong {
  color: #445064;
  font-size: 12px;
}

.sidebar__empty small {
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.45;
}

.sidebar__footer {
  padding: 10px;
  flex: 0 0 auto;
  background: rgba(248, 250, 252, 0.92);
  border-top: 1px solid #e9edf2;
  backdrop-filter: blur(10px);
}

.sidebar-admin {
  min-width: 0;
}

.sidebar-link--admin {
  margin: 0;
}

.sidebar-admin-submenu {
  max-height: min(42vh, 330px);
  margin: 0 3px 8px;
  padding: 7px;
  overflow-x: hidden;
  overflow-y: auto;
  list-style: none;
  background: #f8fafc;
  border: 1px solid #e7ebf0;
  border-radius: 12px;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #d4dae2 transparent;
}

.sidebar-admin-submenu::-webkit-scrollbar {
  width: 5px;
}

.sidebar-admin-submenu::-webkit-scrollbar-thumb {
  background: #d4dae2;
  border-radius: 999px;
}

.sidebar-link__label :deep(b),
.sidebar-link__label :deep(strong),
.sidebar-submenu__label :deep(b),
.sidebar-submenu__label :deep(strong) {
  font-weight: 800;
}

.sidebar-link__label :deep(em),
.sidebar-link__label :deep(i),
.sidebar-submenu__label :deep(em),
.sidebar-submenu__label :deep(i) {
  font-style: italic;
}

.sidebar-submenu__label {
  min-width: 0;
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
}

.sidebar-submenu-enter-active,
.sidebar-submenu-leave-active {
  transition:
    opacity 170ms ease,
    transform 190ms ease;
}

.sidebar-submenu-enter-from,
.sidebar-submenu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 220ms ease;
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

:global(body.dark) .sidebar {
  --sidebar-surface: #151d27;
  --sidebar-text: #e6ebf1;
  --sidebar-muted: #9ba7b6;
  --sidebar-border: #2b3542;

  box-shadow: 10px 0 28px rgba(0, 0, 0, 0.24);
}

:global(body.dark) .sidebar__desktop-tools,
:global(body.dark) .sidebar__footer,
:global(body.dark) .sidebar__separator span {
  background-color: #151d27;
  border-color: #2b3542;
}

:global(body.dark) .sidebar-link__icon,
:global(body.dark) .sidebar__pin-button {
  color: #b7c1ce;
  background: #202a36;
  border-color: #303c4b;
}

:global(body.dark) .sidebar-link:hover,
:global(body.dark) .sidebar-submenu__link:hover,
:global(body.dark) .sidebar-submenu__link.active {
  background: #1f2b38;
}

:global(body.dark) .sidebar__empty {
  color: #aab4c1;
  background: #1a2430;
  border-color: #354151;
}

:global(body.dark) .sidebar-admin-submenu {
  background: #1a2430;
  border-color: #354151;
}

@media (max-width: 767.98px) {
  .sidebar-root {
    --sidebar-header-height: 64px;
  }

  .sidebar {
    top: 0;
    z-index: 1120;
    width: min(88vw, 326px);
    max-width: 326px;
    height: 100dvh;
    border-right: 0;
    border-radius: 0 18px 18px 0;
    box-shadow: 18px 0 50px rgba(15, 23, 42, 0.22);
    transform: translateX(-105%);
  }

  .sidebar.sidebar--expanded {
    width: min(88vw, 326px);
  }

  .sidebar.sidebar--open {
    transform: translateX(0);
  }

  .sidebar__mobile-header {
    min-height: 72px;
    padding: 14px 14px 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid #e9edf2;
  }

  .sidebar__mobile-header > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .sidebar__mobile-eyebrow {
    margin-bottom: 3px;
    color: var(--sidebar-primary);
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .sidebar__mobile-header strong {
    font-size: 15px;
  }

  .sidebar__close-button {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    color: #5f6c7d;
    background: #f5f7fa;
    border: 1px solid #e5e9ef;
    border-radius: 11px;
  }

  .sidebar__navigation {
    padding: 12px;
  }

  .sidebar-link {
    min-height: 52px;
  }

  .sidebar-link__label,
  .sidebar-link__chevron {
    opacity: 1;
    transform: none;
  }

  .sidebar__footer {
    padding: 10px 12px 14px;
  }

  .sidebar__mobile-collapse {
    width: 100%;
    min-height: 43px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #5d6979;
    background: #fff;
    border: 1px solid #dfe5ec;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 650;
  }

  :global(body.dark) .sidebar__mobile-header {
    border-color: #2b3542;
  }

  :global(body.dark) .sidebar__close-button,
  :global(body.dark) .sidebar__mobile-collapse {
    color: #d3dae4;
    background: #202a36;
    border-color: #34404f;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-root *,
  .sidebar-root *::before,
  .sidebar-root *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
