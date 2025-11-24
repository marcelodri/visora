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
        // Forms
        {
          path: 'forms',
          name: 'forms',
          redirect: '/panel/forms/forms', // redirige al primero del grupo
          meta: { category: 'forms', icon: '<i class="bi bi-ui-checks"></i>' },
          children: [
            {
              path: 'settings',
              name: 'settings-general',
              component: () => import('@/views/panel/formularios/SettingsView.vue'),
              meta: { requiresAuth: true, category: 'forms', label: 'Marcas' }
            },
            {
              path: 'brands',
              name: 'settings-brands',
              component: () => import('@/views/panel/formularios/BrandsView.vue'),
              meta: { requiresAuth: true, category: 'forms', label: 'Marcas' }
            },
            {
              path: 'business-types',
              name: 'settings-business-types',
              component: () => import('@/views/panel/formularios/BusinessTypesView.vue'),
              meta: { requiresAuth: true, category: 'forms', label: 'Tipos de negocio' }
            },
            {
              path: 'templates',
              name: 'forms-templates',
              component: () => import('@/views/panel/formularios/TemplatesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            },
            {
              path: 'menu',
              name: 'settings-menu',
              component: () => import('@/views/panel/formularios/MenuView.vue'),
              meta: { requiresAuth: true, category: 'forms', label: 'Marcas' }
            },
            {
              path: 'forms',
              name: 'forms-main',
              component: () => import('@/views/panel/formularios/FormsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            },
            {
              path: 'products',
              name: 'forms-products',
              component: () => import('@/views/panel/formularios/ProductsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            },
            {
              path: 'aboutus',
              name: 'forms-aboutus',
              component: () => import('@/views/panel/formularios/AboutUsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            },
            {
              path: 'header_footer',
              name: 'forms-header_footer',
              component: () => import('@/views/panel/formularios/HeaderFooter.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            }
          ]
        },

        // Social
        {
          path: 'social',
          name: 'social',
          meta: {
            requiresAuth: true,
            category: 'social',
            icon: '<i class="bi bi-phone"></i>'
          },
          children: [
            {
              path: 'pilotpost',
              name: 'social-pilotpost',
              component: () => import('@/views/panel/social/PilotPostView.vue'),
              meta: {
                requiresAuth: true,
                category: 'social',
                label: 'Pilot Post'
              }
            },
            {
              path: 'facebookpost',
              name: 'social-facebookpost',
              component: () => import('@/views/panel/social/MultiPostView.vue'),
              meta: {
                requiresAuth: true,
                category: 'social',
                label: 'Publicar en Facebook'
              }
            },
            {
              path: 'listpost',
              name: 'social-listpost',
              component: () => import('@/views/panel/social/ListPostView.vue'),
              meta: {
                requiresAuth: true,
                category: 'social',
                label: 'Lista de Publicaciones'
              }
            },
            {
              path: 'facebookmuro',
              name: 'social-facebookmuro',
              component: () => import('@/views/panel/social/FacebookMuroView.vue'),
              meta: {
                requiresAuth: true,
                category: 'social',
                label: 'Muro de Facebook'
              }
            },
            {
              path: 'igmuro',
              name: 'social-igmuro',
              component: () => import('@/views/panel/social/IGMuroView.vue'),
              meta: {
                requiresAuth: true,
                category: 'social',
                label: 'Muro de Facebook'
              }
            }
          ]
        },

        // Incolmotos
        {
          path: 'incolmotos',
          name: 'incolmotos',
          meta: {
            requiresAuth: true,
            category: 'incolmotos',
            icon: '<i class="bi bi-coin"></i>'
          },
          children: [
            {
              path: 'sales',
              name: 'incolmotos-import',
              component: () => import('@/views/panel/incolmotos/SalesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'incolmotos',
                label: 'Pilot Post'
              }
            },
            {
              path: 'customers',
              name: 'incolmotos-customers',
              component: () => import('@/views/panel/incolmotos/SalesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'incolmotos',
                label: 'Pilot Post'
              }
            }
          ]
        },
        
        // Demos
        {
          path: 'demos',
          name: 'demos',
          redirect: '/panel/demos/connections',
          meta: { category: 'demos', icon: '<i class="bi bi-lightning-charge"></i>' },
          children: [
            // {
            //   path: 'connections',
            //   name: 'demos-connections',
            //   component: () => import('@/views/panel/ConnectionsView.vue'),
            //   meta: {
            //     requiresAuth: true,
            //     category: 'demos'
            //   }
            // },
            {
              path: 'advancedSearch',
              name: 'demos-advancedSearch',
              component: () => import('@/views/panel/demos/AdvancedSearchView.vue'),
              meta: {
                requiresAuth: true,
                category: 'demos'
              }
            },
            {
              path: 'reports',
              name: 'demos-reports',
              component: () => import('@/views/panel/demos/ReportsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'demos'
              }
            },
            // {
            //   path: 'search_ai',
            //   name: 'demos-search_ai',
            //   component: () => import('@/views/panel/demos/SearchAiView.vue'),
            //   meta: {
            //     requiresAuth: true,
            //     category: 'demos'
            //   }
            // },
            // {
            //   path: 'doc_search_ai',
            //   name: 'demos-doc_search_ai',
            //   component: () => import('@/views/panel/demos/DocSearchView.vue'),
            //   meta: {
            //     requiresAuth: true,
            //     category: 'demos'
            //   }
            // },
            // {
            //   path: 'templates',
            //   name: 'demos-templates',
            //   component: () => import('@/views/panel/TemplatesView.vue'),
            //   meta: {
            //     requiresAuth: true,
            //     category: 'demos'
            //   }
            // },
            {
              path: 'myagent',
              name: 'demos-myagent',
              component: () => import('@/views/panel/demos/ConversationsAgent.vue'),
              meta: {
                requiresAuth: true,
                category: 'demos'
              }
            }
          ]
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
function hasMenuAccess(routeCategory) {
  try {
    const menuString = sessionStorage.getItem('menu');
    if (!menuString) return false;
    
    const menu = JSON.parse(menuString);

    // Verifica si alguna categoría del menú coincide con la de la ruta
    return menu.some(item => item.category === routeCategory);
  } catch (error) {
    console.error('Error al verificar acceso por categoría:', error);
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

  //console.log(to);

  // Si está autenticado y va a una ruta del panel (excepto el home del panel)
  if (authStore.isAuthenticated && to.path.startsWith('/panel') && to.path !== '/panel') {
  //   // Verificar si tiene acceso según el menú en sessionStorage
    // if (!hasMenuAccess(to.path)) {
    //   console.warn(`Acceso denegado a: ${to.path}`);
    //   // Redirigir al home del panel si no tiene acceso
    //   return next({ name: 'panelHome' });
    // }

    if (!hasMenuAccess(to.meta.category)) {
      console.warn(`Acceso denegado a categoría: ${to.meta.category}`);
      return next({ name: 'panelHome' });
    }
  }

  // Permitir acceso
  next();
});

export default router;