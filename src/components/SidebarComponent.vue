<template>
  <div>
    <div 
      v-if="isVisible" 
      class="sidebar-overlay d-md-none" 
      @click="$emit('closeSidebar')"
    ></div>
    <div id="sidebar" aria-labelledby="sidebar-title" no-header shadow :class="['sidebar', { 'show': isVisible }]">
      <div class="p-3 pl-1 d-flex flex-column justify-content-between">
        <button 
          class="btn-close d-md-none mb-3 ms-auto" 
          @click="$emit('closeSidebar')"
          aria-label="Cerrar menú"
        ></button>
        <div class="menu">
          <ul>
            <!-- HOME (siempre visible) -->
            <li>
              <router-link :to="{ name: 'panelHome' }" custom v-slot="{ href, navigate, isExactActive }">
                <a
                  :href="href"
                  class="home-link"
                  :class="{ active: isExactActive }"
                  @click="navigate"
                >
                  <span class="mr-2"><i class="bi bi-house"></i></span>
                  {{ $t('menu.home') || 'Home' }}
                </a>
              </router-link>
            </li>

            <!-- Dropdowns por categoría (filtrados por permisos) -->
            <li v-for="category in groupedMenu" :key="category.name">
              <div v-if="category.routes.length" class="dropdown">
                <a
                  :class="[
                    'dropdown-toggle flex items-center',
                    { 'dropdown-toggle--open': openDropdown === category.name }
                  ]"
                  type="button"
                  @click="toggleDropdown(category.name)"
                >
                  <span v-html="category.icon" class="mr-0"></span>
                  {{ capitalize(category.name) }}
                  <i class="bi bi-chevron-right dropdown-icon ms-auto"></i>
                </a>

                <ul
                  v-show="openDropdown === category.name"
                  class="ml-4 p-2 bg-dropdown"
                >
                  <li
                    v-for="route in category.routes"
                    :key="route.name"
                    class="mb-2"
                    :class="['/panel/pages/settings', '/panel/pages/templates', '/panel/events/start', '/panel/forms/started', '/panel/events/qr-access', '/panel/rewards/start', '/panel/rewards/MigrateCustomers', '/panel/emails/start'].includes(route.path) ? 'border-b pb-2' : ''"
                  >
                    <router-link
                      :to="route.path"
                      :class="{ active: activeRoute === route.path }"
                      @click="setActive(route.path)"
                      v-html="$t(`menu.${route.name}`) || route.name"
                    ></router-link>
                    
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "SidebarComponent",
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      groupedMenu: [],
      openDropdown: null,
      activeRoute: null,
      allowedCategories: [], // 🔥 categorías permitidas desde sessionStorage
    };
  },
  mounted() {
    this.loadPermissions();
    this.loadMenu();
  },
  methods: {
    loadPermissions() {
      // 🔥 Cargar permisos desde sessionStorage
      try {
        const menuData = sessionStorage.getItem('menu');
        if (menuData) {
          const permissions = JSON.parse(menuData);
          // Extraer solo las categorías únicas permitidas
          this.allowedCategories = [...new Set(permissions.map(p => p.category))];
        } else {
          this.allowedCategories = [];
        }
      } catch (error) {
        console.error('Error al cargar permisos del menú:', error);
        this.allowedCategories = [];
      }
    },

    loadMenu() {
      const router = useRouter();
      const allRoutes = router.getRoutes();

      // Filtramos solo rutas padre con categoría
      const parentRoutes = allRoutes.filter(
        (r) =>
          r.meta &&
          r.meta.category &&
          r.path.startsWith("/panel/") &&
          r.children?.length
      );

      // 🔥 Construimos el menú agrupado SOLO con categorías permitidas
      this.groupedMenu = parentRoutes
        .filter(parent => this.allowedCategories.includes(parent.meta.category))
        .map((parent) => ({
          name: parent.meta.category,
          icon: parent.meta.icon || '<i class="fas fa-folder"></i>',
          routes: parent.children
            .filter((child) => child.name && child.path && !child.meta?.hideInMenu)
            .map((child) => ({
              name: child.name,
              path: `${parent.path}/${child.path}`.replace(/\/+$/, ""),
            })),
        }));
    },

    toggleDropdown(name) {
      this.openDropdown = this.openDropdown === name ? null : name;
    },
    setActive(path) {
      this.activeRoute = path;
    },

    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
  setup() {
    const authStore = useAuthStore();
    const user = authStore.user;
    return { user };
  },
};
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

/* Sidebar base */
#sidebar {
  z-index: 1050;
}

@media(max-width: 769px) {
  #sidebar {
    left: -1000px;
  }
  #sidebar.show {
    top: 0
  }
}
#sidebar.show {
  transition: transform 0.3s ease-in-out;
  left: 0px!important;
}
.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.dropdown-toggle::after {
  display: none;
}

.dropdown-toggle span {
  font-size: 0.7rem;
}

.dropdown-toggle span i,
.dropdown-toggle span svg {
  font-size: 0.7rem;
}

.dropdown-icon {
  font-size: 0.8rem;
  transition: transform 0.2s ease-in-out;
  transform: rotate(0deg);
}

.dropdown-toggle--open .dropdown-icon {
  transform: rotate(90deg);
}

.dropdown ul {
  list-style: none;
  padding-left: 0.5rem;
}

.bg-dropdown {
  background: #f8f9fa;
  border-radius: 8px;
}

a.active {
  font-weight: bold;
  color: #007bff;
}

.router-link-exact-active {
  color: #007bff;
}

.router-link-active {
  color: inherit !important;
  font-weight: normal !important;
}
</style>
