# 📋 Event Wall - Separado en Lectura y Escritura

## 🎯 Nueva Estructura

El muro de comentarios se divide en **dos componentes independientes**:

### 1. **EventWallView.vue** - Muro de LECTURA
- **Propósito**: Ver comentarios en tiempo real
- **Ubicación**: `src/views/panel/events/EventWallView.vue`
- **Ruta**: `/panel/events/wall`
- **Features**:
  - Selector de evento
  - Visualización de comentarios
  - Scroll automático
  - Estado de conexión en vivo
  - **NO PERMITE ENVIAR COMENTARIOS**

### 2. **EventWallCommentView.vue** - Formulario de ESCRITURA
- **Propósito**: Enviar comentarios + ver muro en vivo
- **Ubicación**: `src/views/panel/events/EventWallCommentView.vue`
- **Ruta**: `/panel/events/comment`
- **Features**:
  - Selector de evento
  - Vista previa del muro (izquierda)
  - Formulario de comentario (derecha)
  - Sincronización en tiempo real
  - Nombre guardado en localStorage
  - **PERMITE ENVIAR Y VER COMENTARIOS**

---

## 🚀 Instalación

### 1. Instalar dependencia
```bash
npm install socket.io-client
```

### 2. Crear `.env.local`
```env
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Agregar rutas en `src/router/index.js`

En tu configuración de rutas, busca la sección de eventos y agrega:

```javascript
{
  path: 'events',
  children: [
    // Ruta para ver muro (solo lectura)
    {
      path: 'wall',
      name: 'EventWall',
      component: () => import('@/views/panel/events/EventWallView.vue'),
      meta: { title: 'Muro de Comentarios' }
    },
    
    // Ruta para enviar comentarios
    {
      path: 'comment',
      name: 'EventWallComment',
      component: () => import('@/views/panel/events/EventWallCommentView.vue'),
      meta: { title: 'Enviar Comentario' }
    },
    
    // ... otras rutas
  ]
}
```

### 4. Instalar y ejecutar servidor Node.js

```bash
npm install express socket.io cors uuid dotenv
node server.js
```

### 5. Ejecutar frontend

```bash
npm run dev
```

---

## 📊 Diferencias entre Componentes

| Característica | EventWallView | EventWallCommentView |
|---|---|---|
| **Ver comentarios** | ✅ Sí | ✅ Sí |
| **Enviar comentarios** | ❌ No | ✅ Sí |
| **Selector de evento** | ✅ Sí | ✅ Sí |
| **Scroll automático** | ✅ Sí | ✅ Sí |
| **Layout** | Full screen | Split (izq/der) |
| **Guardar nombre** | ❌ No | ✅ Sí |
| **Formulario** | ❌ No | ✅ Sí |

---

## 🎨 Layout del Comentario

```
┌─────────────────────────────────────────────────┐
│        Selector de Evento (Toda la altura)      │
└─────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────┐
│                  │    Encabezado del Evento     │
│  MURO EN VIVO    ├──────────────────────────────┤
│  (Izquierda)     │  FORMULARIO DE COMENTARIO    │
│                  │  (Derecha)                   │
│  • Mensajes      │  • Campo Nombre              │
│  • Scroll auto   │  • Área de Texto             │
│  • Estado conexión│  • Botón Enviar              │
│                  │  • Keyboard shortcuts        │
└──────────────────┴──────────────────────────────┘
```

---

## 💻 Uso

### Ver solo comentarios (EventWallView)
1. Ir a `/panel/events/wall`
2. Seleccionar evento del dropdown
3. Ver comentarios en tiempo real
4. Los comentarios se actualizan automáticamente

### Enviar comentarios (EventWallCommentView)
1. Ir a `/panel/events/comment`
2. Seleccionar evento
3. **Izquierda**: Ver muro en vivo
4. **Derecha**: Escribir comentario
5. Tu nombre se guarda automáticamente
6. Presionar botón o `Ctrl+Enter` para enviar
7. Ver tu comentario aparecer en el muro (izquierda)

---

## 🔌 Socket.io Events

### Eventos que se usan en ambos componentes:

#### `join_event`
```javascript
socket.emit('join_event', { eventId: '123' })
```

#### `new_message` (recibe)
```javascript
socket.on('new_message', (data) => {
  // { id, username, message, timestamp }
})
```

#### `send_message` (solo comentario)
```javascript
socket.emit('send_message', {
  eventId: '123',
  username: 'Juan',
  message: 'Excelente evento!',
  timestamp: new Date().toISOString()
})
```

---

## 💾 Almacenamiento Local

**EventWallCommentView** guarda el nombre del usuario en `localStorage`:
```javascript
localStorage.setItem('eventWallUsername', nombreDelUsuario);
```

Se recupera automáticamente al cargar el componente.

---

## 🎯 Casos de Uso

### Escenario 1: Dashboard de Moderador
```
Usar EventWallView en una pantalla grande
para monitorear comentarios en tiempo real
```

### Escenario 2: Participante Comentando
```
Usar EventWallCommentView para ver y participar
simultáneamente en el muro
```

### Escenario 3: Dos Pantallas
```
Pantalla 1: EventWallView (muro grande)
Pantalla 2: EventWallCommentView (enviar comentario)
```

---

## ✨ Próximas Mejoras

- [ ] Typing indicators (usuario escribiendo...)
- [ ] Reacciones con emojis
- [ ] Menciones @usuario
- [ ] Edición de comentarios
- [ ] Eliminación de comentarios
- [ ] Búsqueda de comentarios
- [ ] Moderación de contenido
- [ ] Bloqueo de usuarios
- [ ] Temas personalizados

---

## 🐛 Troubleshooting

### Los comentarios no aparecen
1. Verificar que `node server.js` está corriendo
2. Verificar `VITE_SOCKET_URL` en `.env.local`
3. Ver DevTools → Console para errores

### Socket no conecta
1. Asegurar puerto 3000 disponible
2. Verificar CORS_ORIGIN en `.env` del servidor
3. Revisar logs del servidor

### El nombre no se guarda
1. Verificar localStorage habilitado en el navegador
2. Comprobar en DevTools → Storage → Local Storage

---

## 📞 Archivos Relacionados

- `EVENT_WALL_README.md` - Documentación completa anterior
- `QUICK_START.md` - Inicio rápido
- `EVENT_WALL_API_EXAMPLES.js` - Ejemplos de API
- `server.js` - Servidor Node.js backend
- `ARCHITECTURE.md` - Diagrama de arquitectura

---

**¡Listo!** Ahora tienes dos componentes separados: uno para ver y otro para comentar. 🎉
