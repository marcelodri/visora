<template>
  <div class="event-wall-container">
    <!-- Selector de Evento -->
    <div class="event-selector-section">
      <div class="selector-wrapper">
        <label class="selector-label">
          <i class="bi bi-calendar-event me-2"></i>
          Selecciona un evento para ver el muro de comentarios
        </label>
        <div class="select-container">
          <select 
            v-model="selectedEventId" 
            @change="onEventSelected"
            class="event-select"
            :disabled="loadingEvents"
          >
            <option value="">-- Elige un evento --</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.name }}
            </option>
          </select>
          <i class="bi bi-chevron-down select-icon"></i>
        </div>
      </div>
    </div>

    <!-- Muro de Comentarios (Solo Lectura) -->
    <div v-if="selectedEventId" class="wall-section" :class="{ 'fullscreen-mode': isFullscreen }">
      <div class="wall-header">
        <div class="event-info">
          <h3 class="event-name">{{ selectedEvent?.name }}</h3>
          <p class="event-description">{{ selectedEvent?.description }}</p>
          <span class="message-count">
            <i class="bi bi-chat-dots me-1"></i>
            {{ messages.length }} comentarios
          </span>
        </div>
        <button 
          @click="toggleFullscreen" 
          class="fullscreen-btn"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
        >
          <i :class="isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"></i>
        </button>
      </div>

      <!-- Zona de Mensajes (Solo Lectura) -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <i class="bi bi-chat-left-text"></i>
          <p>No hay comentarios aún. ¡Sé el primero en comentar en la sección "Enviar Comentario"!</p>
        </div>

        <div v-else class="messages-list">
          <div 
            v-for="(message, index) in messages" 
            :key="message.id || index"
            class="message-item"
          >
            <div class="message-avatar">
              <div class="avatar" :style="{ backgroundColor: getAvatarColor(message.username) }">
                {{ message.username.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="username">{{ message.username }}</span>
                <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-body">
                {{ message.message }}
              </div>
              <div v-if="message.image" class="message-image">
                <img :src="message.image" :alt="message.imageFileName" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicador de Conexión -->
      <div class="connection-status" :class="connectionStatus">
        <i :class="getStatusIcon"></i>
        <span>{{ getStatusText }}</span>
      </div>
    </div>

    <!-- Estado Sin Seleccionar -->
    <div v-else class="no-selection-state">
      <i class="bi bi-chat-quote"></i>
      <p>Selecciona un evento para ver el muro de comentarios</p>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'EventWallView',
  data() {
    return {
      events: [],
      selectedEventId: '',
      selectedEvent: null,
      loadingEvents: false,
      messages: [],
      socket: null,
      connectionStatus: 'connecting',
      isFullscreen: false,
      avatarColors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8D8EA'
      ]
    };
  },

  computed: {
    getStatusIcon() {
      const icons = {
        'connecting': 'bi bi-hourglass-split spinning',
        'connected': 'bi bi-check-circle-fill',
        'disconnected': 'bi bi-exclamation-circle-fill',
        'error': 'bi bi-x-circle-fill'
      };
      return icons[this.connectionStatus] || 'bi bi-question-circle';
    },

    getStatusText() {
      const texts = {
        'connecting': 'Conectando...',
        'connected': 'Conectado',
        'disconnected': 'Desconectado',
        'error': 'Error de conexión'
      };
      return texts[this.connectionStatus] || 'Desconocido';
    }
  },

  methods: {
    initializeSocket() {
      if (this.socket) return;

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
      this.socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        this.connectionStatus = 'connected';
        if (this.selectedEventId) {
          this.socket.emit('join_event', { eventId: this.selectedEventId });
        }
      });

      this.socket.on('disconnect', () => {
        this.connectionStatus = 'disconnected';
      });

      this.socket.on('connect_error', () => {
        this.connectionStatus = 'error';
      });

      this.socket.on('new_message', (data) => {
        this.messages.push({
          id: data.id || Date.now(),
          username: data.username,
          message: data.message,
          timestamp: new Date(data.timestamp || Date.now())
        });
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.socket.on('message_history', (data) => {
        this.messages = data.map(msg => ({
          id: msg.id || Date.now(),
          username: msg.username,
          message: msg.message,
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.socket.on('load_messages', (data) => {
        this.messages = data.messages.map(msg => ({
          id: msg.id || Date.now(),
          username: msg.username,
          message: msg.message,
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.connectionStatus = 'connecting';
    },

    async fetchEvents() {
      this.loadingEvents = true;
      try {
        this.events = [
          { id: '1', name: 'Conferencia Tech 2025', description: 'Conferencia anual de tecnología' },
          { id: '2', name: 'Workshop Vue.js', description: 'Aprende Vue 3 desde cero' },
          { id: '3', name: 'Webinar Seguridad', description: 'Mejores prácticas de seguridad' }
        ];
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        this.loadingEvents = false;
      }
    },

    onEventSelected() {
      if (this.selectedEventId) {
        this.selectedEvent = this.events.find(e => e.id === this.selectedEventId);
        this.messages = [];

        if (!this.socket || !this.socket.connected) {
          this.initializeSocket();
        }

        this.socket.emit('join_event', { eventId: this.selectedEventId });
        this.connectionStatus = 'connecting';
      }
    },

    formatTime(date) {
      if (!date) return '';
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) {
        return 'Hace unos segundos';
      }

      if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `Hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
      }

      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      }

      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getAvatarColor(username) {
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.avatarColors.length;
      return this.avatarColors[index];
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 0);
        }
      });
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },

  mounted() {
    this.fetchEvents();
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
.event-wall-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
  padding: 1.5rem;
  gap: 1rem;
}

.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  padding: 0;
  gap: 0;
  z-index: 9999;
  border-radius: 0;
}

.event-wall-container.fullscreen-mode .event-selector-section {
  display: none;
}

.wall-section.fullscreen-mode {
  border-radius: 0;
  box-shadow: none;
}

.event-selector-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selector-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
}

.select-container {
  position: relative;
  display: flex;
}

.event-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #374151;
  background: white;
  cursor: pointer;
  appearance: none;
  padding-right: 2.5rem;
  transition: all 0.3s ease;
}

.event-select:hover:not(:disabled) {
  border-color: #3939ff;
}

.event-select:focus {
  outline: none;
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

.event-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.wall-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wall-header {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.event-info {
  flex: 1;
}

.fullscreen-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.fullscreen-btn:active {
  transform: scale(0.95);
}

.event-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.event-description {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0 0 0.75rem 0;
}

.message-count {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  text-align: center;
  gap: 1rem;
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  gap: 1rem;
  animation: slideIn 0.3s ease-out;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3939ff;
  transition: all 0.2s ease;
}

.message-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.username {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.timestamp {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-body {
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
}

.message-image {
  margin-top: 0.75rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
}

.message-image img {
  max-width: 100%;
  max-height: 250px;
  display: block;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.message-image img:hover {
  transform: scale(1.02);
}

.connection-status {
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
}

.connection-status.connected {
  background: #ecfdf5;
  color: #065f46;
}

.connection-status.connecting {
  background: #fef3c7;
  color: #92400e;
}

.connection-status i.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.no-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  gap: 1rem;
  text-align: center;
}

.no-selection-state i {
  font-size: 4rem;
  opacity: 0.4;
}

.no-selection-state p {
  font-size: 1.1rem;
  margin: 0;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .event-wall-container {
    height: auto;
    min-height: 100vh;
  }

  .wall-section {
    min-height: 600px;
  }

  .messages-container {
    min-height: 300px;
  }

  .message-item {
    padding: 0.75rem;
  }

  .fullscreen-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .wall-header {
    flex-direction: column;
  }
}
</style>
