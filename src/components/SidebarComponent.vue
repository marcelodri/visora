<template>
  <div>
    <!-- Sidebar -->
    <div id="sidebar" aria-labelledby="sidebar-title" no-header shadow>
      <div class="p-3 pl-1 d-flex flex-column justify-content-between h-100">
        <div class="menu">
          <ul>
            <li v-for="item in menuItems" :key="item.name">
              
              <!-- Caso: con hijos (Dropdown) -->
              <div v-if="item.children && item.children.length" class="dropdown">
                <a
                  class="dropdown-toggle flex items-center"
                  type="button"
                  @click="toggleDropdown(item.name)"
                >
                  <span v-html="item.icon"></span>
                  {{ $t(`menu.${item.name}`) }}
              </a>
                
                <ul v-show="openDropdown === item.name" class="ml-4 p-2 bg-dropdown">
                  <li v-for="child in item.children" :key="child.name" class="mb-2">
                    <router-link
                      :to="child.link"
                      active-class="link-active"
                      exact-active-class="link-exact"
                    >
                      {{ $t(`menu.${child.name}`) }}
                    </router-link>
                  </li>
                </ul>
              </div>

              <!-- Caso: sin hijos -->
              <router-link
                v-else
                :to="item.link"
                active-class="link-active"
                exact-active-class="link-exact"
              >
                <span v-html="item.icon"></span>
                {{ $t(`menu.${item.name}`) }}
              </router-link>

            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'SidebarComponent',
  data() {
    return {
      menuItems: [],
      openDropdown: null, // Guarda qué dropdown está abierto
    };
  },
  mounted() {
    const menu = sessionStorage.getItem("menu");
    if (menu) {
      try {
        this.menuItems = JSON.parse(menu);
      } catch (e) {
        console.error("Error al parsear el menú desde sessionStorage:", e);
      }
    }
  },
  methods: {
    toggleDropdown(name) {
      // Si ya está abierto, lo cierro, si no lo abro
      this.openDropdown = this.openDropdown === name ? null : name;
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
.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
}
.dropdown ul {
  list-style: none;
  padding-left: 0.5rem;
}
.bg-dropdown {
  background: #f3f3f3;
  border-radius: 0px 0px 8px 8px;
}
</style>
