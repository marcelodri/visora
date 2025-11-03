import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/panel',
      name: 'panel',
      component: () => import('@/layouts/PanelLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'panelHome',
          component: () => import('@/views/panel/PanelView.vue')
        },
        {
          path: 'connections',
          name: 'Connections',
          component: () => import('@/views/panel/ConnectionsView.vue')
        },
        {
          path: 'advancedSearch',
          name: 'advancedSearch',
          component: () => import('@/views/panel/AdvancedSearchView.vue')
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/panel/ReportsView.vue')
        },
        {
          path: 'search_ai',
          name: 'search_ai',
          component: () => import('@/views/panel/SearchAiView.vue')
        },
        {
          path: 'doc_search_ai',
          name: 'doc_search_ai',
          component: () => import('@/views/panel/DocSearchView.vue')
        },
        {
          path: 'forms',
          name: 'forms',
          component: () => import('@/views/panel/FormsView.vue')
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/panel/ProductsView.vue')
        },
        {
          path: 'aboutus',
          name: 'aboutus',
          component: () => import('@/views/panel/AboutUsView.vue')
        },
        {
          path: 'header_footer',
          name: 'header_footer',
          component: () => import('@/views/panel/HeaderFooter.vue')
        },
        {
          path: 'templates',
          name: 'templates',
          component: () => import('@/views/panel/TemplatesView.vue')
        },
        {
          path: 'settings/brands',
          name: 'settings-brands',
          component: () => import('@/views/panel/settings/BrandsView.vue')
        },
        {
          path: 'settings/business-types',
          name: 'settings-business-types',
          component: () => import('@/views/panel/settings/BusinessTypesView.vue')
        },
        {
          path: 'pilotpost',
          name: 'pilotpost',
          component: () => import('@/views/panel/PilotPostView.vue')
        },
        {
          path: 'facebookpost',
          name: 'facebookpost',
          component: () => import('@/views/panel/MultiPostView.vue')
        },
        {
          path: 'listpost',
          name: 'listpost',
          component: () => import('@/views/panel/ListPostView.vue')
        },
        {
          path: 'facebookmuro',
          name: 'facebookmuro',
          component: () => import('@/views/panel/FacebookMuroView.vue')
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@/views/panel/SalesView.vue')
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/views/panel/CustomersView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/panel'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/changePassword',
      name: 'changePassword',
      component: () => import('@/views/ChangePasswordView.vue'),
      meta: {
        requiresAuth: true,
      }
    }
  ]
});

// Función helper para verificar acceso al menú
function hasMenuAccess(routePath) {
  try {
    const menuString = sessionStorage.getItem('menu');
    if (!menuString) return false;
    
    const menu = JSON.parse(menuString);
    
    // Verificar si la ruta existe en el menú (incluyendo children)
    return menu.some(item => {
      // Verificar en el nivel principal
      if (item.link === routePath) {
        return true;
      }
      
      // Verificar en los children si existen
      if (item.children && Array.isArray(item.children)) {
        return item.children.some(child => child.link === routePath);
      }
      
      return false;
    });
  } catch (error) {
    console.error('Error al verificar acceso al menú:', error);
    return false;
  }
}

// Guard de navegación para rutas protegidas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Verificar autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' });
  }

  // Si está autenticado y va a una ruta del panel (excepto el home del panel)
  if (authStore.isAuthenticated && to.path.startsWith('/panel') && to.path !== '/panel') {
    // Verificar si tiene acceso según el menú en sessionStorage
    if (!hasMenuAccess(to.path)) {
      console.warn(`Acceso denegado a: ${to.path}`);
      // Redirigir al home del panel si no tiene acceso
      return next({ name: 'panelHome' });
    }
  }

  // Permitir acceso
  next();
});

export default router;