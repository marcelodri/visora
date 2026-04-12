# Event Wall - Guía de Inicio Rápido

## ⚡ 5 Pasos para Poner en Marcha

### Paso 1: Instalar Dependencia (Frontend)

```bash
npm install socket.io-client
```

### Paso 2: Crear archivo `.env.local`

En la raíz del proyecto, crear archivo `.env.local`:

```env
VITE_SOCKET_URL=http://localhost:3000
```

### Paso 3: Agregar Ruta al Router

En `src/router/index.js`, dentro del array de rutas, busca la sección de eventos y agrega:

```javascript
{
  path: 'wall',
  name: 'EventWall',
  component: () => import('@/views/panel/events/EventWallView.vue'),
  meta: { title: 'Muro de Comentarios' }
}
```

### Paso 4: Instalar Dependencias del Servidor

```bash
npm install express socket.io cors uuid dotenv
```

### Paso 5: Ejecutar el Servidor

```bash
node server.js
```

---

## 🎯 Flujo Completo de Prueba

### Terminal 1: Backend
```bash
# Asegúrate de tener Node.js 14+ instalado
node --version

# Instalar dependencias (primera vez)
npm install express socket.io cors uuid dotenv

# Ejecutar servidor
node server.js

# Deberías ver:
# ╔════════════════════════════════════════╗
# ║    Event Wall Server - Socket.io       ║
# ║    Escuchando en puerto 3000           ║
# ║    Ambiente: development               ║
# ╚════════════════════════════════════════╝
```

### Terminal 2: Frontend
```bash
# En otra terminal, en la misma carpeta
npm run dev

# Deberías ver:
#   VITE v... ready in ... ms
#   ➜  Local:   http://localhost:5173/
```

### En el Navegador
1. Ir a `http://localhost:5173`
2. Navegar a `/panel/events/wall` (o buscar en el menú)
3. Seleccionar un evento del dropdown
4. Escribir nombre y mensaje
5. Presionar "Enviar Comentario"
6. Ver el mensaje aparecer en tiempo real

---

## 🔍 Verificar Conexión

### Opción A: Desde el Navegador

1. Abrir DevTools (`F12`)
2. Ir a la pestaña `Console`
3. Buscar mensajes de conexión en azul
4. Debería decir: `Socket conectado: ...`

### Opción B: Desde el Servidor

En la terminal donde corre `node server.js` deberías ver:

```
🔌 Cliente conectado: abc123...
✅ abc123... se unió al evento 1
💬 Mensaje en 1: Juan - Excelente evento!
```

---

## 🚀 Próximos Pasos

1. **Conectar con Base de Datos Real**
   - Ver `EVENT_WALL_API_EXAMPLES.js` para ejemplos

2. **Implementar Autenticación**
   - Usar JWT en lugar de localStorage

3. **Desplegar a Producción**
   - Cambiar `VITE_SOCKET_URL` a tu dominio
   - Usar HTTPS/WSS
   - Configurar CORS correctamente

4. **Agregar Funcionalidades**
   - Typing indicators
   - Reacciones con emojis
   - Menciones de usuarios
   - Búsqueda de mensajes

---

## 🐛 Problemas Comunes

### ❌ "Socket no está conectado"

**Solución:**
- Verificar que `server.js` está corriendo
- Ver en DevTools → Network → WS
- Comprobar `VITE_SOCKET_URL` sea correcto

### ❌ "CORS error"

**Solución:**
- En `server.js`, cambiar `CORS_ORIGIN`:
```javascript
cors: {
  origin: 'http://localhost:5173', // Tu URL del frontend
  methods: ['GET', 'POST'],
  credentials: true
}
```

### ❌ "No puedo ver los eventos en el dropdown"

**Solución:**
- En `EventWallView.vue`, cambiar `fetchEvents()` para conectar con tu API
- Ver ejemplos en `EVENT_WALL_API_EXAMPLES.js`

### ❌ "Los mensajes no se guardan al recargar"

**Solución:**
- Actualmente usa almacenamiento en memoria
- Para persistencia, configurar base de datos (ver documentación completa)

---

## 📊 Verificar Estado

### Health Check
```bash
curl http://localhost:3000/health
```

### Ver Eventos Activos (desarrollo)
```bash
curl http://localhost:3000/debug/events
```

### Obtener Mensajes de un Evento
```bash
curl http://localhost:3000/api/events/1/messages?limit=10
```

---

## 💾 Guardar Configuración

Crear archivo `.env` en la raíz (si el servidor está en carpeta separada):

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_API_KEY=mi-clave-secreta-123
```

---

## 📝 Personalizar Eventos

En `EventWallView.vue`, método `fetchEvents()`:

```javascript
this.events = [
  { id: '1', name: 'Mi Evento 1', description: 'Descripción del evento' },
  { id: '2', name: 'Mi Evento 2', description: 'Otro evento' }
];
```

O conectar con API:
```javascript
const response = await fetch('/api/events');
this.events = await response.json();
```

---

## ✅ Checklist Final

- [ ] socket.io-client instalado
- [ ] .env.local creado
- [ ] Ruta agregada al router
- [ ] Dependencias del servidor instaladas
- [ ] server.js ejecutándose
- [ ] Frontend ejecutándose en localhost:5173
- [ ] Socket conectando (ver en DevTools)
- [ ] Prueba enviar un mensaje
- [ ] Mensaje aparece en tiempo real

¡Listo! Tu Event Wall está funcional 🎉
