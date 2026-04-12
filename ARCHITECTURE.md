# Event Wall - Arquitectura del Sistema

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (Frontend)                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Vue 3 Browser                            │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │          EventWallView.vue Component               │    │   │
│  │  │                                                     │    │   │
│  │  │  • Selector de Eventos                             │    │   │
│  │  │  • Display de Mensajes                             │    │   │
│  │  │  • Formulario de Input                             │    │   │
│  │  │  • Estado de Conexión                              │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                         ↕                                    │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │          eventWallService.js                        │    │   │
│  │  │                                                     │    │   │
│  │  │  • Socket.io Client                                │    │   │
│  │  │  • Gestión de conexión                             │    │   │
│  │  │  • Emit/On events                                  │    │   │
│  │  │  • Listener registry                               │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↕↕↕
                    WebSocket / HTTP(S)
                               ↕↕↕
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Backend) Node.js                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      server.js                              │   │
│  │                                                              │   │
│  │  Express Server:3000                                         │   │
│  │  ├─ GET  /health                                            │   │
│  │  ├─ GET  /api/events/:id/messages                           │   │
│  │  ├─ GET  /api/events/:id/stats                              │   │
│  │  ├─ DELETE /api/events/:id/messages (admin)                │   │
│  │  └─ GET /debug/events (dev)                                │   │
│  │                                                              │   │
│  │  Socket.io Server:                                          │   │
│  │  ├─ join_event → Unir a sala                               │   │
│  │  ├─ send_message → Enviar mensaje                          │   │
│  │  ├─ get_message_history → Cargar historial                 │   │
│  │  ├─ leave_event → Abandonar sala                           │   │
│  │  ├─ typing → Usuario escribiendo                           │   │
│  │  └─ stop_typing → Usuario paró                             │   │
│  │                                                              │   │
│  │  In-Memory Storage:                                         │   │
│  │  ├─ eventMessages Map<eventId, Message[]>                  │   │
│  │  ├─ eventUsers Map<eventId, Set<socketId>>                │   │
│  │  └─ userSessions Map<socketId, Session>                   │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [OPCIONAL] Base de Datos                                          │
│  ├─ PostgreSQL / MongoDB                                           │
│  ├─ Almacena mensajes persistentes                                 │
│  ├─ Historial de eventos                                           │
│  └─ Analytics/Estadísticas                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Conexión Inicial
```
Cliente conecta → Socket.io Client crea conexión WebSocket
                          ↓
                 Servidor recibe "connect"
                          ↓
                 Registro de sesión
                          ↓
                 emit "user_joined" a otros clientes
```

### 2. Envío de Mensaje
```
Usuario escribe → Cliente valida input
                          ↓
              emit "send_message" via socket
                          ↓
       Servidor recibe y valida (length, auth, etc)
                          ↓
           Almacena en eventMessages Map
                          ↓
         io.to(event_room).emit("new_message")
                          ↓
    Todos los clientes en la sala reciben el mensaje
                          ↓
          Vue reactive → componente se actualiza
                          ↓
           Scroll automático al nuevo mensaje
```

### 3. Carga de Historial
```
Cliente join_event → Servidor obtiene historial
                          ↓
          callback({ messages: [...] })
                          ↓
      Cliente recibe y renderiza todos los mensajes
                          ↓
           Scroll al final de la lista
```

## 📡 Eventos Socket.io

### Cliente → Servidor (emit)
```
join_event(data)          → { eventId }
send_message(data)        → { eventId, username, message }
get_message_history(data) → { eventId, limit }
leave_event(data)         → { eventId }
typing(data)              → { username }
stop_typing()             → (vacío)
```

### Servidor → Cliente (broadcast)
```
new_message           → { id, username, message, timestamp }
user_joined           → { socketId, activeUsers }
user_left             → { socketId, activeUsers }
user_typing           → { socketId, username }
user_stop_typing      → { socketId }
messages_cleared      → (vacío)
connect               → (automático)
disconnect           → (automático)
error                 → { error_message }
```

## 🗄️ Estructura de Base de Datos (Recomendado)

```sql
-- Tabla de Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  location VARCHAR(255),
  date_time TIMESTAMP,
  capacity INT,
  status ENUM('active', 'cancelled', 'finished'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Mensajes del Muro
CREATE TABLE event_messages (
  id UUID PRIMARY KEY,
  event_id UUID FOREIGN KEY REFERENCES events(id),
  username VARCHAR(50) NOT NULL,
  message TEXT(500) NOT NULL,
  socket_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX idx_event_messages_created_at ON event_messages(created_at);
```

## 🔐 Flujo de Seguridad

```
┌──────────────────────────────────────────────────────────────┐
│                    VALIDACIONES                              │
├──────────────────────────────────────────────────────────────┤
│ INPUT (Cliente)                                              │
│ ├─ Length check: username ≤ 50, message ≤ 500              │
│ ├─ Required fields validation                                │
│ └─ Sanitización (trim, etc)                                 │
│                                                              │
│ TRANSMIT (Socket.io)                                        │
│ ├─ CORS verification                                        │
│ ├─ Transporte seguro (WSS en prod)                          │
│ └─ Token verificación (próxima fase)                        │
│                                                              │
│ SERVER (Node.js)                                            │
│ ├─ Re-validar entrada                                       │
│ ├─ Verificar permisos (en future con auth)                 │
│ ├─ Rate limiting                                            │
│ ├─ Sanitización de SQL (no aplica con Map)                 │
│ └─ Logging de acciones                                      │
│                                                              │
│ DATABASE (Optional)                                         │
│ ├─ Prepared statements (si usa DB)                         │
│ ├─ Row-level security                                       │
│ └─ Audit trail                                              │
└──────────────────────────────────────────────────────────────┘
```

## 📊 Escalabilidad

### Fase 1: Desarrollo (Actual)
```
Cliente → Socket.io Server (en memoria)
Single process, máx ~1000 usuarios simultáneos
```

### Fase 2: Producción Simple
```
Cliente → Load Balancer
           ├─ Server 1 (Socket.io + Express)
           ├─ Server 2 (Socket.io + Express)
           └─ Server 3 (Socket.io + Express)
           
Conexión con Redis para sincronizar estado
Base de datos para persistencia
```

### Fase 3: Producción Escalada
```
Cliente → CDN → Load Balancer
                 ├─ Socket.io Cluster
                 ├─ API Servers
                 ├─ Redis Cache
                 ├─ Database Master-Slave
                 └─ Message Queue (opcional)
```

## 🚀 Performance Metrics

### Actual (En-Memory)
- **Latencia**: <50ms (local) / <200ms (remoto)
- **Throughput**: ~100 mensajes/segundo
- **Usuarios simultáneos**: 1000+
- **Historial**: Últimos 1000 mensajes por evento

### Con Base de Datos
- **Latencia**: <100ms (con índices)
- **Throughput**: ~50-100 mensajes/segundo
- **Storage**: Sin límite (depende del servidor)
- **Historial**: Completo y persistente

## 🔄 Ciclo de Vida de un Mensaje

```
1. INPUT
   Usuario escribe en textarea
   ↓
2. VALIDATION
   - ¿Está conectado?
   - ¿Es válido el input?
   - ¿Respeta límites de caracteres?
   ↓
3. EMIT
   socket.emit('send_message', data)
   ↓
4. SERVER_RECEIVE
   Servidor recibe en listener 'send_message'
   ↓
5. STORE
   Guardar en Map/Database
   ↓
6. BROADCAST
   io.to(room).emit('new_message', data)
   ↓
7. CLIENT_RECEIVE
   socket.on('new_message')
   ↓
8. UPDATE_STATE
   Vue actualiza messages array
   ↓
9. RENDER
   Vue re-renderiza componente
   ↓
10. SCROLL
    Scroll automático al final
    ↓
11. DISPLAY
    Usuario ve el mensaje en la pantalla
```

## 📈 Monitoreo Recomendado

```
├─ Conexiones activas (en /debug/events)
├─ Mensajes por segundo
├─ Latencia de socket
├─ Errores de conexión
├─ Uso de memoria
├─ Bytes transmitidos
├─ Eventos por usuario
└─ Tasa de desconexión
```

---

Esta arquitectura es modular, escalable y preparada para futuros upgrades.
