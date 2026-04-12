# 📤 ¿Cómo Enviar Mensajes en el Event Wall?

## 🎯 Resumen Rápido

El envío de mensajes se realiza mediante **Socket.io** desde `EventWallCommentView.vue` al servidor en `server.js`.

---

## 📋 Flujo Completo del Envío

### 1️⃣ Frontend: Capturar el formulario

**Archivo:** `src/views/panel/events/EventWallCommentView.vue`

```vue
<form @submit.prevent="sendComment">
  <!-- Campo de nombre -->
  <input v-model="username" placeholder="Escribe tu nombre" maxlength="50" />
  
  <!-- Campo de comentario -->
  <textarea 
    v-model="comment" 
    @keydown.enter.ctrl="sendComment"
    placeholder="Tu comentario" 
    maxlength="500"
  ></textarea>
  
  <!-- Botón enviar -->
  <button type="submit" :disabled="!comment.trim() || !username.trim()">
    Enviar Comentario
  </button>
</form>
```

**Lo que hace:**
- Captura el nombre en `username`
- Captura el comentario en `comment`
- Al hacer click o presionar Ctrl+Enter, llama a `sendComment()`

---

### 2️⃣ Método sendComment()

**Ubicación:** Script de `EventWallCommentView.vue`

```javascript
async sendComment() {
  // Validar que no esté vacío
  if (!this.comment.trim() || !this.username.trim()) {
    return;
  }

  this.isSending = true;  // Mostrar spinner

  try {
    // Preparar datos del mensaje
    const messageData = {
      eventId: this.selectedEventId,      // Evento seleccionado
      username: this.username.trim(),      // Nombre del usuario
      message: this.comment.trim(),        // Contenido del comentario
      timestamp: new Date().toISOString()  // Hora del envío
    };

    // Verificar que Socket.io está conectado
    if (this.socket && this.socket.connected) {
      // 🚀 ENVIAR POR SOCKET
      this.socket.emit('send_message', messageData, (response) => {
        if (response && response.success) {
          this.comment = '';  // Limpiar textarea
          this.scrollMessagesToBottom();
        } else {
          console.error('Error al enviar:', response?.error);
        }
        this.isSending = false;  // Quitar spinner
      });
    } else {
      console.error('Socket no conectado');
      this.connectionStatus = 'error';
      this.isSending = false;
    }
  } catch (error) {
    console.error('Error:', error);
    this.isSending = false;
  }
}
```

**Lo que hace paso a paso:**
1. Valida que nombre y comentario no estén vacíos
2. Muestra spinner de carga (`isSending = true`)
3. Prepara un objeto con los datos del mensaje
4. Emite evento `send_message` por Socket.io al servidor
5. Espera respuesta del servidor
6. Si éxito → limpia el formulario y scroll abajo
7. Si error → muestra error
8. Quita spinner (`isSending = false`)

---

### 3️⃣ Socket.io emit - Enviar al Servidor

```javascript
this.socket.emit('send_message', messageData, (response) => {
  // callback cuando el servidor responda
});
```

**Estructura del messageData:**
```javascript
{
  eventId: "1",                              // Qué evento
  username: "Juan Pérez",                    // Quién lo dice
  message: "¡Excelente conferencia!",        // Qué dice
  timestamp: "2025-12-05T10:30:00.000Z"      // Cuándo
}
```

---

## 🔌 Backend: Recibir el Mensaje

**Archivo:** `server.js`

```javascript
// Recibir el evento 'send_message'
socket.on('send_message', async (data, callback) => {
  try {
    // Validar datos
    if (!data.eventId || !data.username || !data.message) {
      return callback({ 
        success: false, 
        error: 'Datos incompletos' 
      });
    }

    // Limitar largo de mensaje
    if (data.message.length > 500) {
      return callback({ 
        success: false, 
        error: 'Mensaje muy largo' 
      });
    }

    // Generar ID único
    const messageId = crypto.randomUUID();

    // Crear objeto de mensaje
    const message = {
      id: messageId,
      eventId: data.eventId,
      username: data.username,
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
      socketId: socket.id
    };

    // Guardar en memoria
    if (!eventMessages.has(data.eventId)) {
      eventMessages.set(data.eventId, []);
    }
    const messages = eventMessages.get(data.eventId);
    messages.push(message);

    // Limitar a últimos 1000 mensajes
    if (messages.length > 1000) {
      messages.shift();
    }

    // 📢 BROADCAST: Enviar a TODOS en este evento
    io.to(`event_${data.eventId}`).emit('new_message', message);

    // ✅ Confirmar al cliente que se envió
    callback({ success: true, messageId });

  } catch (error) {
    console.error('Error sending message:', error);
    callback({ success: false, error: 'Error del servidor' });
  }
});
```

**Lo que hace el servidor:**
1. Recibe el evento `send_message`
2. Valida que los datos sean correctos
3. Genera un ID único para el mensaje
4. Guarda el mensaje en memoria
5. **Envía el mensaje a TODOS los usuarios en ese evento** usando `io.to()`
6. Responde al cliente que fue exitoso

---

## 📡 Broadcast a Todos

```javascript
io.to(`event_${data.eventId}`).emit('new_message', message);
```

Esto **envía el mensaje a TODOS los sockets conectados** en la sala `event_1`, `event_2`, etc.

**Resultado:** 
- EventWallView.vue lo recibe y lo muestra
- EventWallCommentView.vue lo recibe y lo muestra en el preview
- Aparece instantáneamente en tiempo real

---

## 🎯 Recibir el Mensaje en Frontend

**EventWallCommentView.vue escucha:**

```javascript
this.socket.on('new_message', (data) => {
  // Nuevo mensaje llegó del servidor
  this.messages.push({
    id: data.id || Date.now(),
    username: data.username,
    message: data.message,
    timestamp: new Date(data.timestamp || Date.now())
  });
  this.scrollMessagesToBottom();  // Scroll automático
});
```

**EventWallView.vue también escucha lo mismo:**

```javascript
this.socket.on('new_message', (data) => {
  // Recibe el mensaje y lo muestra
  this.messages.push({
    id: data.id || Date.now(),
    username: data.username,
    message: data.message,
    timestamp: new Date(data.timestamp || Date.now())
  });
  this.scrollToBottom();
});
```

---

## 🔄 Diagrama Completo del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario escribe en EventWallCommentView                 │
│    - Nombre: "Juan"                                         │
│    - Comentario: "¡Excelente!"                             │
│    - Click en "Enviar" o Ctrl+Enter                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ 2. sendComment() valida   │
         │    y prepara messageData  │
         └────────────┬──────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │ 3. socket.emit('send_message')│
        │    Envía al servidor         │
        └────────────┬─────────────────┘
                     │
                     │ (WebSocket)
                     │ ═══════════════════════════════════
                     │
                     ▼
    ┌────────────────────────────────────┐
    │ 4. server.js recibe send_message    │
    │    - Valida datos                  │
    │    - Genera ID único               │
    │    - Guarda en memoria             │
    └────────────┬───────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────┐
    │ 5. io.to('event_1').emit('new_message')│
    │    📢 BROADCAST A TODOS            │
    │    (EventWallView + EventWallComment)│
    └────────────┬───────────────────────┘
                 │
    ┌────────────┴──────────────────────┐
    │ (WebSocket)                       │
    ▼                                   ▼
┌──────────────────────┐         ┌──────────────────────┐
│ EventWallView.vue    │         │ EventWallComment...  │
│ - Recibe mensaje     │         │ - Recibe mensaje     │
│ - Lo agrega a lista  │         │ - Lo agrega a lista  │
│ - Scroll automático  │         │ - Scroll automático  │
│ - Lo muestra!        │         │ - Lo muestra!        │
└──────────────────────┘         └──────────────────────┘
    │                                 │
    └─────────────────┬───────────────┘
                      │
                      ▼
            👀 Usuario ve el mensaje
               en ambas vistas
               simultáneamente
```

---

## 🚀 Condiciones para Enviar

1. ✅ **Socket conectado** - `this.socket.connected === true`
2. ✅ **Nombre no vacío** - `username.trim().length > 0`
3. ✅ **Comentario no vacío** - `comment.trim().length > 0`
4. ✅ **Evento seleccionado** - `selectedEventId !== ''`
5. ✅ **No está en proceso de envío** - `isSending === false`

Si falta cualquiera → **El botón queda deshabilitado**

---

## 🔍 Cómo Verificar que Funciona

### En el Navegador (DevTools)

**1. Console (F12 > Console):**
```javascript
// Verás mensajes como:
// "Socket conectado: abc123..."
// "Mensaje recibido: Juan - ¡Hola!"
```

**2. Network > WS (WebSocket):**
- Verás una conexión `ws://localhost:3000`
- Los mensajes aparecerán como frames en tiempo real

**3. Local Storage:**
```javascript
// Verás guardado:
eventWallUsername: "Tu nombre"
```

### En Terminal (donde corre server.js)

```bash
💬 Mensaje en 1: Juan - ¡Excelente evento!
```

---

## 📊 Estructura de Datos

### En Cliente
```javascript
{
  id: "uuid-abc123",
  username: "Juan Pérez",
  message: "¡Excelente conferencia!",
  timestamp: Date object
}
```

### En Servidor (en memoria)
```javascript
Map {
  '1' => [
    {
      id: "uuid-abc123",
      eventId: "1",
      username: "Juan Pérez",
      message: "¡Excelente conferencia!",
      timestamp: "2025-12-05T10:30:00.000Z",
      socketId: "socket-123"
    }
  ]
}
```

---

## ❌ Si No Funciona

| Problema | Verificar |
|---|---|
| No se envía | ¿Socket conectado? (check status color) |
| Botón deshabilitado | ¿Rellenaste nombre y comentario? |
| Mensaje no aparece | ¿Server.js está corriendo? |
| Error en console | Mira `server.js` en terminal del servidor |
| No guarda nombre | Revisa si localStorage está habilitado |

---

## 🎯 En Resumen

**POST del Mensaje = Socket.io emit + callback:**

```javascript
// 1. Cliente prepara datos
const messageData = {
  eventId: "1",
  username: "Juan",
  message: "¡Hola!",
  timestamp: "2025-12-05T10:30:00.000Z"
};

// 2. Cliente emite (es como un POST)
socket.emit('send_message', messageData, (response) => {
  if (response.success) {
    console.log("✅ Mensaje enviado!");
  }
});

// 3. Servidor recibe y procesa
socket.on('send_message', (data, callback) => {
  // valida, guarda, broadcast
  callback({ success: true });
});

// 4. Todos reciben el nuevo_message
io.to(`event_${eventId}`).emit('new_message', message);

// 5. Clientes escuchan y actualizan
socket.on('new_message', (data) => {
  this.messages.push(data);  // Aparece al instante
});
```

¡Eso es todo! 🎉
