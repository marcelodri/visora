<template>
  <div>
    <div id="sidebar" aria-labelledby="sidebar-title" no-header shadow>
      <div class="p-3 pl-1 d-flex flex-column justify-content-between h-100">
        <div class="menu">
          <ul>
            <!-- HOME (siempre visible) -->
            <li>
              <!-- <router-link to="/panel" v-slot="{ navigate }"> -->
              <a href="/panel" class="home-link" >
                <span class="mr-2"><i class="bi bi-house"></i></span>
                {{ $t('menu.home') || 'Home' }}
              </a>
            <!-- </router-link> -->
            </li>

            <!-- Dropdowns por categoría (filtrados por permisos) -->
            <li v-for="category in groupedMenu" :key="category.name">
              <div v-if="category.routes.length" class="dropdown">
                <a
                  class="dropdown-toggle flex items-center"
                  type="button"
                  @click="toggleDropdown(category.name)"
                >
                  <span v-html="category.icon" class="mr-0"></span>
                  {{ capitalize(category.name) }}
                </a>

                <ul
                  v-show="openDropdown === category.name"
                  class="ml-4 p-2 bg-dropdown"
                >
                  <li
                    v-for="route in category.routes"
                    :key="route.name"
                    class="mb-2"
                    :class="['/panel/forms/settings', '/panel/forms/templates', '/panel/events/start'].includes(route.path) ? 'border-b pb-2' : ''"
                  >
                    <router-link
                      :to="route.path"
                      :class="{ active: activeRoute === route.path }"
                      @click="setActive(route.path)"
                      v-html="$t(`menu.${route.name}`) || route.name"
                    ></router-link>
                    <!-- <router-link
                      :to="route.path"
                      :class="{ active: $route.path === route.path }"
                      v-html="$t(`menu.${route.name}`) || route.name"
                    ></router-link> -->
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
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "SidebarComponent",
  data() {
    return {
      groupedMenu: [],
      openDropdown: null,
      activeRoute: "",
      allowedCategories: [], // 🔥 categorías permitidas desde sessionStorage
    };
  },
  mounted() {
    this.loadPermissions();
    this.loadMenu();
    //this.setActive(this.$route.path);
  },
  // watch: {
  //   $route(to) {
  //     this.setActive(to.path);
  //   },
  // },
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
            .filter((child) => child.name && child.path)
            .map((child) => ({
              name: child.name,
              path: `${parent.path}/${child.path}`.replace(/\/+$/, ""),
            })),
        }));

      // 👇 Abre automáticamente el primer dropdown al iniciar
      if (this.groupedMenu.length && !this.openDropdown) {
        this.openDropdown = this.groupedMenu[0].name;
      }
    },

    toggleDropdown(name) {
      this.openDropdown = this.openDropdown === name ? null : name;
    },

    setActive(path) {


      // setTimeout(() => {
      //   const activeLinks = document.querySelectorAll('a.router-link-active');
      //   console.log('activeLinks', activeLinks);

      //   activeLinks.forEach(link => {
      //     // Verifica si la única clase del elemento es "router-link-active"
      //     if (link.classList.length === 1 && link.classList.contains('router-link-active')) {
      //       link.classList.remove('router-link-active');
      //     }
      //   });
      // }, 1);

      // console.log('path', path)
      // this.activeRoute = path;


      // 🔹 Busca la categoría a la que pertenece la ruta
      // const parentCategory = this.groupedMenu.find((cat) =>
      //   cat.routes.some((r) => r.path === path)
      // );

      // 🔹 Si pertenece a una categoría, abre ese dropdown
      // if (parentCategory) {
      //   this.openDropdown = parentCategory.name;
      // } else {
      //   this.openDropdown = null; // Si no pertenece a ninguna, cerrar dropdowns
      // }


      // 🔹 Asegura que el home solo quede activo cuando estás exactamente en /panel
      // if (path !== '/panel') {
      //   // Esto hace que el home no quede "pegado" como activo
      //   const homeLink = document.querySelector('a[href="/panel"]');
      //   if (homeLink) homeLink.classList.remove('router-link-active');
      // }
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
.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
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