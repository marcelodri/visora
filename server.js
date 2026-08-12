/**
 * Event Wall Server
 * Servidor Node.js con Express y Socket.io para manejar comentarios de eventos en tiempo real
 * 
 * Instalación:
 * npm install express socket.io cors uuid dotenv
 * 
 * Uso:
 * node server.js
 * 
 * Variables de entorno (.env):
 * PORT=3000
 * NODE_ENV=development
 * CORS_ORIGIN=http://localhost:5173
 */

const express = require('express');
const http = require('http');
const https = require('https');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento en memoria (reemplazar con base de datos en producción)
const eventMessages = new Map(); // eventId -> [messages]
const eventUsers = new Map();    // eventId -> Set(socketIds)
const userSessions = new Map();   // socketId -> { username, eventId }

/**
 * Rutas HTTP
 */

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Proxy para descargar imágenes (evita CORS)
app.get('/api/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'URL no proporcionada' });
  }
  
  try {
    const protocol = imageUrl.startsWith('https') ? https : http;
    
    protocol.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).send('Error descargando imagen');
      }
      
      // Headers CORS
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=3600');
      
      // Pipe de la imagen descargada
      response.pipe(res);
    }).on('error', (error) => {
      console.error('Error en proxy descargando imagen:', error);
      res.status(500).json({ error: 'Error descargando imagen' });
    });
  } catch (error) {
    console.error('Error en proxy-image:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener mensajes de un evento
app.get('/api/events/:eventId/messages', (req, res) => {
  const { eventId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const messages = eventMessages.get(eventId) || [];
  const paginatedMessages = messages.slice(-limit);

  res.json({
    success: true,
    eventId,
    messages: paginatedMessages,
    total: messages.length
  });
});

// Limpiar mensajes de un evento (admin)
app.delete('/api/events/:eventId/messages', (req, res) => {
  const { eventId } = req.params;
  const apiKey = req.headers['x-api-key'];

  // Validar API key (implementar seguridad real)
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  eventMessages.delete(eventId);
  io.to(`event_${eventId}`).emit('messages_cleared');

  res.json({ success: true, message: 'Mensajes eliminados' });
});

// Obtener estadísticas de un evento
app.get('/api/events/:eventId/stats', (req, res) => {
  const { eventId } = req.params;
  const messages = eventMessages.get(eventId) || [];
  const users = eventUsers.get(eventId) || new Set();

  res.json({
    success: true,
    eventId,
    totalMessages: messages.length,
    activeUsers: users.size,
    messages
  });
});

/**
 * Manejo de Socket.io
 */

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  /**
   * Evento: join_event
   * Usuario se une a un evento
   */
  socket.on('join_event', (data, callback) => {
    try {
      const { eventId } = data;

      if (!eventId) {
        return callback({ success: false, error: 'eventId requerido' });
      }

      // Salir de otros eventos
      const currentSession = userSessions.get(socket.id);
      if (currentSession) {
        socket.leave(`event_${currentSession.eventId}`);
        const users = eventUsers.get(currentSession.eventId);
        if (users) users.delete(socket.id);
      }

      // Unirse al nuevo evento
      socket.join(`event_${eventId}`);

      // Registrar sesión
      userSessions.set(socket.id, { eventId });

      // Actualizar usuarios activos
      if (!eventUsers.has(eventId)) {
        eventUsers.set(eventId, new Set());
      }
      eventUsers.get(eventId).add(socket.id);

      // Cargar historial de mensajes
      const messages = eventMessages.get(eventId) || [];

      console.log(`✅ ${socket.id} se unió al evento ${eventId}`);

      // Notificar a otros usuarios
      io.to(`event_${eventId}`).emit('user_joined', {
        socketId: socket.id,
        activeUsers: eventUsers.get(eventId).size,
        timestamp: new Date().toISOString()
      });

      callback({
        success: true,
        messages,
        activeUsers: eventUsers.get(eventId).size
      });
    } catch (error) {
      console.error('Error en join_event:', error);
      callback({ success: false, error: error.message });
    }
  });

  /**
   * Evento: send_message
   * Usuario envía un mensaje
   */
  socket.on('send_message', (data, callback) => {
    try {
      const { eventId, username, message } = data;
      const session = userSessions.get(socket.id);

      if (!session || session.eventId !== eventId) {
        return callback({ success: false, error: 'No autorizado para este evento' });
      }

      if (!message || !message.trim()) {
        return callback({ success: false, error: 'Mensaje vacío' });
      }

      if (!username || !username.trim()) {
        return callback({ success: false, error: 'Nombre de usuario requerido' });
      }

      // Crear mensaje
      const messageData = {
        id: uuidv4(),
        eventId,
        username: username.substring(0, 50).trim(),
        message: message.substring(0, 500).trim(),
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        image: data.image || null,
        imageFileName: data.imageFileName || null
      };

      // Guardar mensaje
      if (!eventMessages.has(eventId)) {
        eventMessages.set(eventId, []);
      }
      eventMessages.get(eventId).push(messageData);

      // Limitar historial a 1000 mensajes
      const messages = eventMessages.get(eventId);
      if (messages.length > 1000) {
        messages.shift();
      }

      console.log(`💬 Mensaje en ${eventId}: ${username} - ${message.substring(0, 30)}...`);
      console.log(`🖼️ Imagen: ${data.image ? 'SÍ (' + (data.image.length / 1024).toFixed(2) + ' KB)' : 'NO'}`);

      // Emitir a todos en la sala
      io.to(`event_${eventId}`).emit('new_message', messageData);

      callback({ success: true, messageId: messageData.id });
    } catch (error) {
      console.error('Error en send_message:', error);
      callback({ success: false, error: error.message });
    }
  });

  /**
   * Evento: get_message_history
   * Solicitar historial de mensajes
   */
  socket.on('get_message_history', (data, callback) => {
    try {
      const { eventId, limit = 50 } = data;

      if (!eventId) {
        return callback({ success: false, error: 'eventId requerido' });
      }

      const allMessages = eventMessages.get(eventId) || [];
      const messages = allMessages.slice(-limit);

      callback({
        success: true,
        eventId,
        messages,
        total: allMessages.length
      });
    } catch (error) {
      console.error('Error en get_message_history:', error);
      callback({ success: false, error: error.message });
    }
  });

  /**
   * Evento: leave_event
   * Usuario abandona un evento
   */
  socket.on('leave_event', (data) => {
    try {
      const { eventId } = data;
      const session = userSessions.get(socket.id);

      if (session && session.eventId === eventId) {
        socket.leave(`event_${eventId}`);

        const users = eventUsers.get(eventId);
        if (users) {
          users.delete(socket.id);
        }

        // Notificar a otros
        io.to(`event_${eventId}`).emit('user_left', {
          socketId: socket.id,
          activeUsers: users ? users.size : 0
        });

        userSessions.delete(socket.id);
        console.log(`👋 ${socket.id} abandonó el evento ${eventId}`);
      }
    } catch (error) {
      console.error('Error en leave_event:', error);
    }
  });

  /**
   * Evento: typing
   * Usuario está escribiendo
   */
  socket.on('typing', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (session) {
        socket.to(`event_${session.eventId}`).emit('user_typing', {
          socketId: socket.id,
          username: data.username
        });
      }
    } catch (error) {
      console.error('Error en typing:', error);
    }
  });

  /**
   * Evento: stop_typing
   * Usuario dejó de escribir
   */
  socket.on('stop_typing', () => {
    try {
      const session = userSessions.get(socket.id);
      if (session) {
        socket.to(`event_${session.eventId}`).emit('user_stop_typing', {
          socketId: socket.id
        });
      }
    } catch (error) {
      console.error('Error en stop_typing:', error);
    }
  });

  /**
   * Evento: disconnect
   * Cliente desconectado
   */
  socket.on('disconnect', () => {
    try {
      const session = userSessions.get(socket.id);

      if (session) {
        const { eventId } = session;
        const users = eventUsers.get(eventId);

        if (users) {
          users.delete(socket.id);

          // Notificar desconexión
          io.to(`event_${eventId}`).emit('user_left', {
            socketId: socket.id,
            activeUsers: users.size
          });
        }
      }

      userSessions.delete(socket.id);
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    } catch (error) {
      console.error('Error en disconnect:', error);
    }
  });

  /**
   * Evento: error
   * Manejar errores
   */
  socket.on('error', (error) => {
    console.error(`❗ Error en socket ${socket.id}:`, error);
  });
});

/**
 * Rutas de depuración (solo en desarrollo)
 */
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/events', (req, res) => {
    const events = {};
    eventMessages.forEach((messages, eventId) => {
      events[eventId] = {
        messagesCount: messages.length,
        activeUsers: eventUsers.get(eventId)?.size || 0
      };
    });
    res.json(events);
  });
}

/**
 * Manejo de errores
 */
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rechazada no manejada:', reason);
});

/**
 * Iniciar servidor
 */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║    Event Wall Server - Socket.io       ║');
  console.log(`║    Escuchando en puerto ${PORT}              ║`);
  console.log(`║    Ambiente: ${process.env.NODE_ENV || 'development'}            ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
