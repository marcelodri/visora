/**
 * Ejemplo de cómo agregar la ruta del Event Wall al router
 * 
 * Agregar este código a src/router/index.js en el array de rutas
 * dentro de la ruta principal (probablemente "panel")
 */

// Dentro del objeto de rutas principales, en la sección de "events":
{
  path: 'events',
  children: [
    {
      path: 'start',
      name: 'StartEvents',
      component: () => import('@/views/panel/events/StartEventsView.vue'),
      meta: { title: 'Inicio de Eventos' }
    },
    // Agregar esta ruta para el Event Wall:
    {
      path: 'wall',
      name: 'EventWall',
      component: () => import('@/views/panel/events/EventWallView.vue'),
      meta: { title: 'Muro de Comentarios' }
    },
    {
      path: 'registrations',
      name: 'RegistrationsEvents',
      component: () => import('@/views/panel/events/RegistrationsView.vue'),
      meta: { title: 'Inscripciones' }
    },
    // ... otras rutas de eventos
  ]
}

/**
 * Resultado final en el menú:
 * /panel/events/start         → Inicio de Eventos
 * /panel/events/wall          → Muro de Comentarios (NUEVO)
 * /panel/events/registrations → Inscripciones
 */

// Si quieres acceder a la ruta desde el código:
// this.$router.push({ name: 'EventWall' });
// o
// router.push('/panel/events/wall');
