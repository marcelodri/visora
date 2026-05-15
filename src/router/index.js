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
        // pages
        {
          path: 'pages',
          name: 'pages',
          redirect: '/panel/pages/pages', // redirige al primero del grupo
          meta: { category: 'pages', icon: '<i class="bi bi-filetype-html"></i>' },
          children: [
            {
              path: 'settings',
              name: 'settings-general',
              component: () => import('@/views/panel/pages/SettingsView.vue'),
              meta: { requiresAuth: true, category: 'pages', label: 'Marcas' }
            },
            {
              path: 'brands',
              name: 'settings-brands',
              component: () => import('@/views/panel/pages/BrandsView.vue'),
              meta: { requiresAuth: true, category: 'pages', label: 'Marcas' }
            },
            {
              path: 'business-types',
              name: 'settings-business-types',
              component: () => import('@/views/panel/pages/BusinessTypesView.vue'),
              meta: { requiresAuth: true, category: 'pages', label: 'Tipos de negocio' }
            },
            {
              path: 'templates',
              name: 'forms-templates',
              component: () => import('@/views/panel/pages/TemplatesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'pages'
              }
            },
            {
              path: 'menu',
              name: 'settings-menu',
              component: () => import('@/views/panel/pages/MenuView.vue'),
              meta: { requiresAuth: true, category: 'pages', label: 'Marcas' }
            },
            {
              path: 'pages',
              name: 'pages-main',
              component: () => import('@/views/panel/pages/PagesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'pages'
              }
            },
            {
              path: 'products',
              name: 'forms-products',
              component: () => import('@/views/panel/pages/ProductsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'pages'
              }
            },
            {
              path: 'aboutus',
              name: 'forms-aboutus',
              component: () => import('@/views/panel/pages/AboutUsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'pages'
              }
            },
            {
              path: 'header_footer',
              name: 'forms-header_footer',
              component: () => import('@/views/panel/pages/HeaderFooter.vue'),
              meta: {
                requiresAuth: true,
                category: 'pages'
              }
            }
          ]
        },

        // Forms
        {
          path: 'forms',
          name: 'forms',
          redirect: '/panel/forms/started', // redirige al primero del grupo
          meta: { category: 'forms', icon: '<i class="bi bi-ui-checks"></i>' },
          children: [
            {
              path: 'started',
              name: 'forms-start',
              component: () => import('@/views/panel/formularios/StartView.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            },
            {
              path: 'forms',
              name: 'forms-main',
              component: () => import('@/views/panel/formularios/FormsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'forms'
              }
            }
          ]
        },

        // Events
        {
          path: 'events',
          name: 'events',
          redirect: '/panel/events/events', // redirige al primero del grupo
          meta: { category: 'events', icon: '<i class="bi bi-calendar-event"></i>' },
          children: [
            {
              path: 'start',
              name: 'events-main',
              component: () => import('@/views/panel/events/StartEventsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'events'
              }
            },
            {
              path: 'lists',
              name: 'lists-main',
              component: () => import('@/views/panel/events/ListasView.vue'),
              meta: {
                requiresAuth: true,
                category: 'events'
              }
            },
            {
              path: 'events',
              name: 'events-list',
              component: () => import('@/views/panel/events/EventsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'events'
              }
            },
            {
              path: 'registrations',
              name: 'registrations-main',
              component: () => import('@/views/panel/events/RegistrationsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'events'
              }
            },
            {
              path: 'reports',
              name: 'reports',
              component: () => import('@/views/panel/events/ReportsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'events'
              }
            },
            {
              path: 'qr-access',
              name: 'qr-access',
              component: () => import('@/views/panel/events/QRAccessView.vue'),
              meta: {
                requiresAuth: true,
                category: 'events'
              }
            }
            // {
            //   path: 'wall',
            //   name: 'EventWall',
            //   component: () => import('@/views/panel/events/EventWallView_IG.vue'),
            //   meta: { title: 'Muro de Comentarios', category: 'events' }
            // },
            // {
            //   path: 'wallComment',
            //   name: 'EventWallComment',
            //   component: () => import('@/views/panel/events/EventWallCommentView_IG.vue'),
            //   meta: { title: 'Muro de Comentarios', category: 'events' }
            // }
            
          ]
        },

        // Social
        // {
        //   path: 'social',
        //   name: 'social',
        //   meta: {
        //     requiresAuth: true,
        //     category: 'social',
        //     icon: '<i class="bi bi-phone"></i>'
        //   },
        //   children: [
        //     {
        //       path: 'pilotpost',
        //       name: 'social-pilotpost',
        //       component: () => import('@/views/panel/social/PilotPostView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'social',
        //         label: 'Pilot Post'
        //       }
        //     },
        //     {
        //       path: 'facebookpost',
        //       name: 'social-facebookpost',
        //       component: () => import('@/views/panel/social/MultiPostView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'social',
        //         label: 'Publicar en Facebook'
        //       }
        //     },
        //     {
        //       path: 'listpost',
        //       name: 'social-listpost',
        //       component: () => import('@/views/panel/social/ListPostView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'social',
        //         label: 'Lista de Publicaciones'
        //       }
        //     },
        //     {
        //       path: 'facebookmuro',
        //       name: 'social-facebookmuro',
        //       component: () => import('@/views/panel/social/FacebookMuroView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'social',
        //         label: 'Muro de Facebook'
        //       }
        //     },
        //     {
        //       path: 'igmuro',
        //       name: 'social-igmuro',
        //       component: () => import('@/views/panel/social/IGMuroView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'social',
        //         label: 'Muro de Facebook'
        //       }
        //     }
        //   ]
        // },

        // Emails
        {
          path: 'emails',
          name: 'emails',
          redirect: '/panel/emails/start',
          meta: { category: 'emails', icon: '<i class="bi bi-envelope-paper"></i>' },
          children: [
            {
              path: 'start',
              name: 'emails-start',
              component: () => import('@/views/panel/emails/StartView.vue'),
              meta: { requiresAuth: true, category: 'emails' }
            },
            {
              path: 'templates',
              name: 'emails-templates',
              component: () => import('@/views/panel/emails/TemplatesView.vue'),
              meta: { requiresAuth: true, category: 'emails' }
            },
            {
              path: 'campaigns',
              name: 'emails-campaigns',
              component: () => import('@/views/panel/emails/CampaignsView.vue'),
              meta: { requiresAuth: true, category: 'emails' }
            },
            {
              path: 'builder',
              name: 'emails-builder',
              component: () => import('@/views/panel/emails/CampaignBuilderView.vue'),
              meta: { requiresAuth: true, category: 'emails', hideInMenu: true }
            }
          ]
        },

        // Ventas (Incolmotos)
        {
          path: 'rewards',
          name: 'rewards',
          meta: {
            requiresAuth: true,
            category: 'rewards',
            icon: '<i class="bi bi-coin"></i>'
          },
          children: [
            {
              path: 'start',
              name: 'rewards-start',
              component: () => import('@/views/panel/rewards/StartView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Comenzar'
              }
            },
            {
              path: 'rules',
              name: 'rewards-rules',
              component: () => import('@/views/panel/rewards/RulesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Pilot Post'
              }
            },
            {
              path: 'rewards',
              name: 'rewards-import',
              component: () => import('@/views/panel/rewards/SalesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Pilot Post'
              }
            },
            {
              path: 'sales',
              name: 'rewards-sales',
              component: () => import('@/views/panel/rewards/AllSalesView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Pilot Post'
              }
            },
            {
              path: 'customers',
              name: 'rewards-customers',
              component: () => import('@/views/panel/rewards/CustomersView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Pilot Post'
              }
            },
            
            {
              path: 'MigrateCustomers',
              name: 'migrate-customers',
              component: () => import('@/views/panel/rewards/MigrateCustomersView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Pilot Post'
              }
            },
            {
              path: 'logs',
              name: 'rewards-logs',
              component: () => import('@/views/panel/rewards/LogsView.vue'),
              meta: {
                requiresAuth: true,
                category: 'rewards',
                label: 'Pilot Post'
              }
            }

            
          ]
        },
        
        // Demos
        // {
        //   path: 'demos',
        //   name: 'demos',
        //   redirect: '/panel/demos/connections',
        //   meta: { category: 'demos', icon: '<i class="bi bi-lightning-charge"></i>' },
        //   children: [
        //     // {
        //     //   path: 'connections',
        //     //   name: 'demos-connections',
        //     //   component: () => import('@/views/panel/ConnectionsView.vue'),
        //     //   meta: {
        //     //     requiresAuth: true,
        //     //     category: 'demos'
        //     //   }
        //     // },
        //     {
        //       path: 'advancedSearch',
        //       name: 'demos-advancedSearch',
        //       component: () => import('@/views/panel/demos/AdvancedSearchView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'demos'
        //       }
        //     },
        //     {
        //       path: 'reports',
        //       name: 'demos-reports',
        //       component: () => import('@/views/panel/demos/ReportsView.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'demos'
        //       }
        //     },
        //     // {
        //     //   path: 'search_ai',
        //     //   name: 'demos-search_ai',
        //     //   component: () => import('@/views/panel/demos/SearchAiView.vue'),
        //     //   meta: {
        //     //     requiresAuth: true,
        //     //     category: 'demos'
        //     //   }
        //     // },
        //     // {
        //     //   path: 'doc_search_ai',
        //     //   name: 'demos-doc_search_ai',
        //     //   component: () => import('@/views/panel/demos/DocSearchView.vue'),
        //     //   meta: {
        //     //     requiresAuth: true,
        //     //     category: 'demos'
        //     //   }
        //     // },
        //     // {
        //     //   path: 'templates',
        //     //   name: 'demos-templates',
        //     //   component: () => import('@/views/panel/TemplatesView.vue'),
        //     //   meta: {
        //     //     requiresAuth: true,
        //     //     category: 'demos'
        //     //   }
        //     // },
        //     {
        //       path: 'myagent',
        //       name: 'demos-myagent',
        //       component: () => import('@/views/panel/demos/ConversationsAgent.vue'),
        //       meta: {
        //         requiresAuth: true,
        //         category: 'demos'
        //       }
        //     }
        //     // ,
        //     // {
        //     //   path: 'gantt',
        //     //   name: 'demos-gantt',
        //     //   component: () => import('@/views/panel/demos/GanttView.vue'),
        //     //   meta: {
        //     //     requiresAuth: true,
        //     //     category: 'demos'
        //     //   }
        //     // }
        //   ]
        // }

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
  ],
  scrollBehavior(to, from, savedPosition) {
    // Si hay una posición guardada (por ejemplo, al usar el botón "atrás" del navegador)
    if (savedPosition) {
      return savedPosition
    } else {
      // Siempre volver al top
      return { top: 0 }
    }
  }
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
