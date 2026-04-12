# 🔄 Flujo de Funcionamiento - Event Wall Split

## 📈 Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN FRONTEND                       │
│                     Vue 3 + Socket.io                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────┐    ┌──────────┐    ┌──────────┐
   │ Router │    │ Store    │    │ Services │
   │        │    │ (Pinia)  │    │          │
   └────────┘    └──────────┘    └──────────┘
        │              │              │
        ├──────────────┼──────────────┤
        │              │              │
        ▼              ▼              ▼
   ┌─────────────────────────────────────┐
   │  EventWallView (Lectura)            │
   │  EventWallCommentView (Escritura)   │
   │  eventWallService.js (Socket)       │
   └──────────────────┬──────────────────┘
                      │
             WebSocket (Socket.io)
                      │
        ┌─────────────▼──────────────┐
        │                            │
        ▼                            ▼
   ┌─────────────┐            ┌──────────────┐
   │ Express.js  │            │ Socket.io    │
   │ Backend     │            │ Server       │
   └──────┬──────┘            └──────┬───────┘
          │                          │
          ▼                          ▼
   ┌──────────────────────────────────────┐
   │   En-Memory Storage                  │
   │   • eventMessages (Map)              │
   │   • eventUsers (Map)                 │
   │   • userSessions (Map)               │
   │                                      │
   │   [OPCIONAL] Base de Datos           │
   │   • PostgreSQL / MongoDB             │
   └──────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de Componentes

### A. Usuario abre EventWallView (Lectura)

```
1. Componente Mounted
   ↓
2. fetchEvents()
   ├─ Obtiene lista de eventos
   └─ Renderiza dropdown
   ↓
3. Usuario selecciona evento
   ↓
4. onEventSelected()
   ├─ Encuentra evento en lista
   ├─ initializeSocket() si no existe
   └─ emit('join_event', eventId)
   ↓
5. Socket conecta
   ├─ Estado: connecting → connected
   └─ Servidor agrega usuario a sala
   ↓
6. Socket recibe historial
   ├─ Renderiza comentarios
   └─ Scroll al final
   ↓
7. Usuario recibe new_message en tiempo real
   ├─ Actualiza array messages
   ├─ Vue re-renderiza
   └─ Scroll automático
```

### B. Usuario abre EventWallCommentView (Escritura)

```
1. Componente Mounted
   ├─ loadUsername() desde localStorage
   ├─ fetchEvents()
   └─ Renderiza UI split screen
   ↓
2. Usuario selecciona evento
   ↓
3. onEventSelected()
   ├─ initializeSocket()
   ├─ join_event
   └─ Muro previa comienza a recibir mensajes
   ↓
4. Usuario escribe comentario
   ├─ Validation (trim, maxlength)
   └─ send_button habilitado
   ↓
5. Usuario presiona "Enviar" o Ctrl+Enter
   ├─ Validación final
   ├─ emit('send_message')
   └─ isSending = true (mostrar spinner)
   ↓
6. Servidor recibe mensaje
   ├─ Valida datos
   ├─ Almacena en memory/BD
   ├─ Emite 'new_message' a toda la sala
   └─ Devuelve success callback
   ↓
7. Cliente recibe success
   ├─ Limpia textarea
   ├─ Muestra en muro preview
   ├─ saveUsername()
   └─ isSending = false (quitar spinner)
   ↓
8. Socket recibe 'new_message'
   ├─ Agrega a messages array
   ├─ Vue re-renderiza
   └─ Scroll automático en preview
```

---

## 📡 Flujo de Socket.io

### Conexión Inicial

```
Cliente                           Servidor
  │                                  │
  ├─────── connect() ───────────────>│
  │                                  │
  │<──────── ACK (connect) ──────────┤
  │                                  │
  │  connectionStatus =              │
  │  'connected'                     │
```

### Unirse a Evento

```
Cliente                           Servidor
  │                                  │
  ├─ join_event ─────────────────────>│
  │  { eventId: '1' }                │
  │                                  │ Obtiene historial
  │                                  │ Agrega a sala
  │                                  │
  │<─ callback({ messages, ... }) ──┤
  │                                  │
  │ Renderiza mensajes               │
```

### Enviar Mensaje

```
Cliente                           Servidor
  │                                  │
  ├─ send_message ───────────────────>│
  │ { eventId, username,             │
  │   message, timestamp }           │
  │                                  │ Valida
  │                                  │ Almacena
  │                                  │ Emite a sala
  │<─ callback({ success }) ────────┤
  │                                  │
  │<─ new_message (broadcast) ───────┤
  │ (todos en la sala reciben)       │
```

### Recibir Mensaje en Vivo

```
Servidor                          Clientes en Sala
  │                                  │
  ├─ new_message ─────────────────────>│ EventWallView
  │ { id, username, message... }     │ (actualiza array)
  │                                  │
  ├─ new_message ─────────────────────>│ EventWallCommentView
  │                                  │ (actualiza preview)
  │                                  │
  │                                  │ Ambos re-renderizan
```

---

## 🔀 Diferencias en Flujos

### EventWallView (Solo Lectura)

```
┌─ Inicializa Socket
├─ Join Event
├─ Recibe historial
└─ Loop: Recibe new_message → Actualiza → Renderiza
```

**No emite nunca `send_message`**

### EventWallCommentView (Lectura + Escritura)

```
┌─ Inicializa Socket
├─ Join Event
├─ Recibe historial (en preview)
├─ Loop: Recibe new_message → Actualiza preview
└─ [Usuario acciona]
   └─ Emit send_message
      └─ Servidor broadcast new_message
         └─ Todos reciben, incluyendo el preview
```

**Permite envío de mensajes**

---

## 💾 Flujo de Datos

### Estructura del Mensaje

```javascript
// Cliente envía
{
  eventId: "1",
  username: "Juan",
  message: "Excelente evento!",
  timestamp: "2025-12-05T10:30:00.000Z"
}

// Servidor almacena
{
  id: "uuid-xxx",  // Agregado por servidor
  eventId: "1",
  username: "Juan",
  message: "Excelente evento!",
  timestamp: "2025-12-05T10:30:00.000Z",
  socketId: "abc123"  // Agregado por servidor
}

// Cliente renderiza
{
  id: "uuid-xxx",
  username: "Juan",
  message: "Excelente evento!",
  timestamp: Date object
}
```

---

## 🎯 Estados de Conexión

```
┌──────────┐
│ connecting│  (Intentando conectar)
└────┬─────┘
     │
     ├─ ✅ Éxito
     │  ↓
     │ ┌─────────┐
     │ │connected│  (Conectado y listo)
     │ └────┬────┘
     │      │
     │      ├─ Envío/Recibe mensajes OK
     │      │
     │      ├─ ❌ Desconexión
     │      │  ↓
     │      │ ┌──────────────┐
     │      │ │disconnected │  (Perdió conexión)
     │      │ └──────┬───────┘
     │      │        │
     │      │        └─ Reintentar (reconnection)
     │      │           ↓ connecting
     │
     ├─ ❌ Error
        ↓
     ┌──────┐
     │error│  (Error de conexión)
     └──────┘
```

---

## 📊 Sincronización en Tiempo Real

### Escenario: Dos usuarios comentando

```
Usuario A (EventWallView)          Usuario B (EventWallCommentView)
    │                                   │
    │                                   ├─ Escribe comentario
    │                                   │
    │<─── new_message ────────────────┤
    │ (Socket server broadcast)       ├─ Envía comentario
    │                                   │
    ├─ Renderiza comentario              │
    │ de Usuario B                        │
    │                                   │<─── callback success
    │                                   │
    │                                   ├─ Renderiza en preview
    ├─ Escribe comentario              │
    │                                   │
    │─── send_message ──────────────────>│
    │                                   │
    │                                   ├─ Recibe new_message
    │                                   │ (su propio mensaje)
    │                                   │
    │<──── callback success ────────────┤
    │                                   ├─ Renderiza en preview
    │<─── new_message ────────────────┤
    │ (su propio mensaje de ida)      │
    │                                   │
    ├─ Renderiza su comentario          │
```

---

## 🔐 Validaciones en Flujo

```
┌─ Cliente: Valida antes de enviar
│  ├─ ¿Username no vacío?
│  ├─ ¿Message no vacío?
│  ├─ ¿Longitud correcta?
│  └─ ¿Socket conectado?
│
├─ Servidor: Valida al recibir
│  ├─ ¿EventId válido?
│  ├─ ¿Usuario en sala correcta?
│  ├─ ¿Datos de tipo correcto?
│  ├─ ¿Longitud dentro de límites?
│  └─ ¿No es spam?
│
└─ Broadcast: Envía si todo OK
   └─ new_message a sala
```

---

## 🚀 Optimizaciones

### Lazy Loading
```
1. Componente monta
2. Solo carga último mensaje
3. Usuario scrollea → Carga más (si implementa)
```

### Scroll Automático
```
1. Nuevo mensaje llega
2. Vue.nextTick()
3. Scroll a messagesList.scrollHeight
```

### Almacenamiento en localStorage
```
1. Usuario escribe nombre
2. Se guarda en localStorage
3. Al recargar, se recupera automáticamente
```

### Socket Reconexión
```
1. Desconexión inesperada
2. Socket.io reinenta automáticamente
3. Se reune a la sala
4. Continúa recibiendo mensajes
```

---

## 📈 Escalabilidad Futura

### De En-Memory a Base de Datos

```
Actual (En-Memory):
  Client → Socket.io → Map/Array → Nueva mensaje

Futuro (Con BD):
  Client → Socket.io → DB Query → Nueva mensaje
  
Ventajas:
  ✅ Persistencia
  ✅ Historial completo
  ✅ Múltiples servidores
  ✅ Analytics
```

### De Single Server a Cluster

```
Actual:
  Clientes → 1 Socket.io Server

Futuro:
  Clientes → Load Balancer
             ├─ Socket Server 1
             ├─ Socket Server 2
             └─ Socket Server 3
             (Sincronizados con Redis)
```

---

Este diagrama muestra cómo ambos componentes se comunican en tiempo real de forma sincronizada. ✨
