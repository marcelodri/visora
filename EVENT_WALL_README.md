# Event Wall - Muro de Comentarios en Tiempo Real

## 📋 Descripción

Sistema completo de muro de comentarios para eventos en tiempo real usando Socket.io. Permite a los usuarios comentar sobre eventos, ver comentarios de otros usuarios en vivo, con soporte para:

- ✅ Comentarios en tiempo real
- ✅ Scroll automático al nuevo comentario
- ✅ Selector visual de eventos
- ✅ Contador de comentarios activos
- ✅ Estado de conexión en vivo
- ✅ Avatares personalizados por usuario
- ✅ Timestamps relativos (hace X minutos, etc.)
- ✅ Límites de caracteres en mensajes
- ✅ Soporte para Ctrl+Enter para enviar

## 🚀 Instalación

### Frontend (Vue 3)

1. **Instalar dependencia:**
```bash
npm install socket.io-client
```

2. **Configurar variables de entorno** (`.env` o `.env.local`):
```env
VITE_SOCKET_URL=http://localhost:3000
```

3. **Agregar la ruta en el router:**
```javascript
// src/router/index.js
{
  path: 'event-wall',
  name: 'EventWall',
  component: () => import('@/views/panel/events/EventWallView.vue')
}
```

### Backend (Node.js)

1. **Crear carpeta del servidor** (opcional, puede estar en el mismo proyecto):
```bash
mkdir server
cd server
npm init -y
```

2. **Instalar dependencias:**
```bash
npm install express socket.io cors uuid dotenv
```

3. **Crear archivo `.env`:**
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_API_KEY=your-secret-key-here
```

4. **Copiar `server.js` a la carpeta raíz o server/**

5. **Ejecutar servidor:**
```bash
node server.js
```

## 📁 Estructura de Archivos

```
src/
├── views/panel/events/
│   └── EventWallView.vue           # Componente principal del muro
├── services/
│   └── eventWallService.js         # Servicio de Socket.io
└── router/
    └── index.js                    # Incluir ruta

server.js                           # Backend con Express + Socket.io
.env.example                        # Variables de entorno de ejemplo
package.json                        # Dependencias del proyecto
```

## 🔧 Configuración

### Variables de Entorno - Frontend

```env
# URL del servidor Socket.io
VITE_SOCKET_URL=http://localhost:3000
```

### Variables de Entorno - Backend

```env
# Puerto del servidor
PORT=3000

# Ambiente (development, staging, production)
NODE_ENV=development

# URL del frontend para CORS
CORS_ORIGIN=http://localhost:5173

# API Key para acciones administrativas
ADMIN_API_KEY=your-secret-key
```

## 📱 Uso

### Para Usuarios

1. Selecciona un evento del dropdown
2. Escribe tu nombre de usuario (se guarda en localStorage)
3. Escribe tu comentario en el textarea
4. Presiona "Enviar Comentario" o `Ctrl+Enter`
5. Ve los comentarios de otros usuarios en tiempo real

### Para Desarrolladores

#### Importar el Servicio:
```javascript
import eventWallService from '@/services/eventWallService';

// Conectar
await eventWallService.connect();

// Unirse a evento
await eventWallService.joinEvent('event-123');

// Enviar mensaje
await eventWallService.sendMessage({
  eventId: 'event-123',
  username: 'Juan Pérez',
  message: 'Excelente evento!',
  timestamp: new Date().toISOString()
});

// Escuchar nuevos mensajes
eventWallService.on('new_message', (message) => {
  console.log('Nuevo mensaje:', message);
});

// Abandonar evento
eventWallService.leaveEvent('event-123');

// Desconectar
eventWallService.disconnect();
```

## 🔌 API de Socket.io

### Eventos del Cliente → Servidor

#### `join_event`
Se une a un evento
```javascript
socket.emit('join_event', { eventId: '123' }, (response) => {
  // response.success: boolean
  // response.messages: array de mensajes previos
  // response.activeUsers: número de usuarios activos
});
```

#### `send_message`
Envía un mensaje
```javascript
socket.emit('send_message', {
  eventId: '123',
  username: 'Juan',
  message: 'Hola a todos!',
  timestamp: new Date().toISOString()
}, (response) => {
  // response.success: boolean
  // response.messageId: string
});
```

#### `get_message_history`
Obtiene el historial de mensajes
```javascript
socket.emit('get_message_history', {
  eventId: '123',
  limit: 50
}, (response) => {
  // response.messages: array de mensajes
  // response.total: número total de mensajes
});
```

#### `leave_event`
Abandona un evento
```javascript
socket.emit('leave_event', { eventId: '123' });
```

### Eventos del Servidor → Cliente

#### `new_message`
Nuevo mensaje recibido
```javascript
socket.on('new_message', (data) => {
  // data.id: string
  // data.username: string
  // data.message: string
  // data.timestamp: ISO string
  // data.socketId: string
});
```

#### `user_joined`
Un usuario se unió
```javascript
socket.on('user_joined', (data) => {
  // data.socketId: string
  // data.activeUsers: number
  // data.timestamp: ISO string
});
```

#### `user_left`
Un usuario abandonó
```javascript
socket.on('user_left', (data) => {
  // data.socketId: string
  // data.activeUsers: number
});
```

#### `connect`, `disconnect`, `error`
Eventos de conexión
```javascript
socket.on('connect', () => { /* conectado */ });
socket.on('disconnect', () => { /* desconectado */ });
socket.on('error', (error) => { /* error */ });
```

## 🌐 Rutas HTTP

### GET `/health`
Health check del servidor
```bash
curl http://localhost:3000/health
```
Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

### GET `/api/events/:eventId/messages`
Obtener mensajes de un evento
```bash
curl http://localhost:3000/api/events/123/messages?limit=50
```
Respuesta:
```json
{
  "success": true,
  "eventId": "123",
  "messages": [...],
  "total": 150
}
```

### GET `/api/events/:eventId/stats`
Obtener estadísticas de un evento
```bash
curl http://localhost:3000/api/events/123/stats
```

### DELETE `/api/events/:eventId/messages`
Limpiar mensajes (requiere admin API key)
```bash
curl -X DELETE \
  -H "X-API-Key: your-secret-key" \
  http://localhost:3000/api/events/123/messages
```

### GET `/debug/events` (solo en desarrollo)
Ver todos los eventos activos
```bash
curl http://localhost:3000/debug/events
```

## 🎨 Personalización

### Colores de Avatares
Edita en `EventWallView.vue`:
```javascript
avatarColors: [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8D8EA'
]
```

### Límites de Caracteres
En el componente:
```javascript
maxlength="50"   // Nombre de usuario
maxlength="500"  // Mensaje
```

### Estilo CSS
Todos los estilos están en el `<style scoped>` del componente. Puedes personalizarlos según tu tema.

## 🔐 Seguridad

### Recomendaciones para Producción

1. **Autenticación**: Implementar JWT o sesiones
```javascript
// En server.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (verifyToken(token)) {
    next();
  } else {
    next(new Error('Autenticación fallida'));
  }
});
```

2. **Base de datos**: Cambiar almacenamiento en memoria a BD
```javascript
// Usar MongoDB, PostgreSQL, etc.
const db = require('./database');
eventMessages.get(eventId) // → db.query()
```

3. **Validación**: Implementar sanitización de inputs
```bash
npm install express-validator
```

4. **Rate Limiting**: Prevenir spam
```bash
npm install express-rate-limit
```

5. **HTTPS/WSS**: En producción usar SSL
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const server = https.createServer(options, app);
```

## 🐛 Troubleshooting

### Socket no conecta
- Verificar que el servidor está corriendo: `node server.js`
- Verificar CORS_ORIGIN en `.env`
- Revisar consola del navegador para errores
- Verificar que `VITE_SOCKET_URL` está correcto

### Mensajes no aparecen
- Verificar que se emitió `join_event` correctamente
- Ver si la sala existe: `GET /debug/events`
- Revisar logs del servidor

### Nombre de usuario no se guarda
- Verificar localStorage en DevTools
- Comprobar que el navegador permite localStorage
- Revisar permisos de cookies/storage

## 📊 Monitoreo

Ver eventos activos en desarrollo:
```
curl http://localhost:3000/debug/events
```

Salida:
```json
{
  "event-123": {
    "messagesCount": 45,
    "activeUsers": 3
  },
  "event-456": {
    "messagesCount": 12,
    "activeUsers": 1
  }
}
```

## 📝 Próximas Mejoras

- [ ] Persistencia en base de datos
- [ ] Autenticación de usuarios
- [ ] Reacciones a mensajes (emojis)
- [ ] Menciones de usuarios (@usuario)
- [ ] Typing indicators (escribiendo...)
- [ ] Edición y eliminación de mensajes
- [ ] Búsqueda de mensajes
- [ ] Moderación de contenido
- [ ] Bloqueo de usuarios
- [ ] Temas oscuros

## 📞 Soporte

Para problemas o preguntas, contacta a: team@madcoder.io
