<template>
  <div class="ig-feed-container">
    <!-- Header -->
    <div class="ig-header">
      <div class="header-content">
        <h1 class="app-title">
          <i class="bi bi-camera-fill me-2"></i>
          {{ selectedEvent?.name || 'Muro de Posts' }}
        </h1>
        <select 
          v-model="selectedEventId" 
          @change="onEventSelected"
          class="event-selector"
          :disabled="loadingEvents"
        >
          <option value="">-- Elige un evento --</option>
          <option v-for="event in events" :key="event.id" :value="event.id">
            {{ event.name }}
          </option>
        </select>
        <button 
          @click="toggleFullscreen" 
          class="fullscreen-btn-header"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
        >
          <i :class="isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"></i>
        </button>
      </div>
    </div>

    <div v-if="selectedEventId" class="ig-main" :class="{ 'fullscreen-mode': isFullscreen }">
      <!-- Feed de Posts -->
      <div class="ig-feed">
        <div v-if="messages.length === 0" class="empty-feed">
          <i class="bi bi-image"></i>
          <p>Aún no hay posts. ¡Sé el primero en compartir!</p>
        </div>

        <div v-else class="posts-container" ref="postsContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="message.id || index"
            class="ig-post"
          >
            <!-- Post Header -->
            <div class="post-header">
              <div class="user-info">
                <div class="avatar" :style="{ backgroundColor: getAvatarColor(message.username) }">
                  {{ message.username.charAt(0).toUpperCase() }}
                </div>
                <div class="user-meta">
                  <div class="username">{{ message.username }}</div>
                  <div class="post-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </div>

            <!-- Post Image (Si existe) -->
            <div v-if="message.image" class="post-image">
              <img :src="message.image" :alt="message.imageFileName" />
            </div>

            <!-- Post Content -->
            <div class="post-content">
              <p class="post-text">{{ message.message }}</p>
            </div>

            <!-- Post Actions con Reacciones -->
            <div class="post-actions">
              <!-- Me Gusta (Confetis) -->
              <button 
                class="action-btn like-btn" 
                @click="triggerLikeReaction(message.id, $event)"
                :class="{ 'has-reaction': hasReaction(message.id, 'like') }"
              >
                <i class="bi bi-heart" v-if="!hasReaction(message.id, 'like')"></i>
                <i class="bi bi-heart-fill" v-else></i>
              </button>

              <!-- No Me Gusta (Efecto Sad) -->
              <button 
                class="action-btn dislike-btn" 
                @click="triggerDislikeReaction(message.id, $event)"
                :class="{ 'has-reaction': hasReaction(message.id, 'dislike') }"
              >
                <i class="bi bi-hand-thumbs-down"></i>
              </button>

              <!-- Enojo (Efecto Rojo) -->
              <button 
                class="action-btn angry-btn" 
                @click="triggerAngryReaction(message.id, $event)"
                :class="{ 'has-reaction': hasReaction(message.id, 'angry') }"
              >
                <i class="bi bi-exclamation-circle"></i>
              </button>

              <button class="action-btn">
                <i class="bi bi-chat"></i>
              </button>
            </div>

            <!-- Reactions Counter -->
            <div class="reactions-counter" v-if="getReactionsCounts(message.id).total > 0">
              <span v-if="getReactionsCounts(message.id).like > 0" class="reaction-badge like">
                <i class="bi bi-heart-fill"></i> {{ getReactionsCounts(message.id).like }}
              </span>
              <span v-if="getReactionsCounts(message.id).dislike > 0" class="reaction-badge dislike">
                <i class="bi bi-hand-thumbs-down"></i> {{ getReactionsCounts(message.id).dislike }}
              </span>
              <span v-if="getReactionsCounts(message.id).angry > 0" class="reaction-badge angry">
                <i class="bi bi-exclamation-circle"></i> {{ getReactionsCounts(message.id).angry }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin Evento Seleccionado -->
    <div v-else class="no-event-selected-ig">
      <i class="bi bi-image"></i>
      <p>Selecciona un evento para ver los posts</p>
    </div>

    <!-- Indicador de Conexión -->
    <div class="connection-badge" :class="connectionStatus">
      <span class="status-dot"></span>
      <span class="status-text">{{ getStatusText }}</span>
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
      reactions: new Map(), // messageId -> { like: count, dislike: count, angry: count, userReaction: null }
      avatarColors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8D8EA'
      ]
    };
  },

  computed: {
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
          timestamp: new Date(data.timestamp || Date.now()),
          image: data.image,
          imageFileName: data.imageFileName
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
          timestamp: new Date(msg.timestamp || Date.now()),
          image: msg.image,
          imageFileName: msg.imageFileName
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
          timestamp: new Date(msg.timestamp || Date.now()),
          image: msg.image,
          imageFileName: msg.imageFileName
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
        return `Hace ${mins}m`;
      }

      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `Hace ${hours}h`;
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
        const container = this.$refs.postsContainer;
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
    },

    // Sistema de reacciones con efectos visuales
    triggerLikeReaction(messageId, event) {
      this.addReaction(messageId, 'like');
      this.createConfetti(event);
    },

    triggerDislikeReaction(messageId, event) {
      this.addReaction(messageId, 'dislike');
      this.createSadEffect(event);
    },

    triggerAngryReaction(messageId, event) {
      this.addReaction(messageId, 'angry');
      this.createAngryEffect(event);
    },

    addReaction(messageId, reactionType) {
      if (!this.reactions.has(messageId)) {
        this.reactions.set(messageId, { like: 0, dislike: 0, angry: 0, userReaction: null });
      }
      
      const messageReactions = this.reactions.get(messageId);
      
      // Si el usuario ya reaccionó, alternamos o cambiamos
      if (messageReactions.userReaction === reactionType) {
        messageReactions[reactionType]--;
        messageReactions.userReaction = null;
      } else {
        if (messageReactions.userReaction) {
          messageReactions[messageReactions.userReaction]--;
        }
        messageReactions[reactionType]++;
        messageReactions.userReaction = reactionType;
      }
    },

    hasReaction(messageId, reactionType) {
      if (!this.reactions.has(messageId)) return false;
      return this.reactions.get(messageId).userReaction === reactionType;
    },

    getReactionsCounts(messageId) {
      if (!this.reactions.has(messageId)) {
        return { like: 0, dislike: 0, angry: 0, total: 0 };
      }
      const r = this.reactions.get(messageId);
      return {
        like: r.like,
        dislike: r.dislike,
        angry: r.angry,
        total: r.like + r.dislike + r.angry
      };
    },

    createConfetti(event) {
      const rect = event.target.getBoundingClientRect();
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#F7DC6F'];
      
      for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = '🎉';
        confetti.style.left = rect.left + rect.width / 2 + 'px';
        confetti.style.top = rect.top + 'px';
        confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        
        // Animate
        setTimeout(() => {
          confetti.style.opacity = '0';
          confetti.style.transform = `translate(${(Math.random() - 0.5) * 200}px, -${Math.random() * 300 + 100}px) rotate(${Math.random() * 360}deg)`;
        }, 10);
        
        setTimeout(() => {
          confetti.remove();
        }, 1000);
      }
    },

    createSadEffect(event) {
      const rect = event.target.getBoundingClientRect();
      
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'sad-particle';
        particle.textContent = '😢';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => {
          particle.style.opacity = '0';
          particle.style.transform = `translate(${(Math.random() - 0.5) * 150}px, ${Math.random() * 200 + 50}px)`;
        }, 10);
        
        setTimeout(() => {
          particle.remove();
        }, 800);
      }
    },

    createAngryEffect(event) {
      const rect = event.target.getBoundingClientRect();
      
      // Efecto borde rojo en el post
      const post = event.target.closest('.ig-post');
      if (post) {
        post.style.borderColor = '#ff6b6b';
        post.style.borderWidth = '3px';
        setTimeout(() => {
          post.style.borderColor = '';
          post.style.borderWidth = '';
        }, 600);
      }
      
      // Partículas de enojo
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'angry-particle';
        particle.textContent = '😠';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => {
          particle.style.opacity = '0';
          particle.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${Math.random() * 250 + 100}px)`;
        }, 10);
        
        setTimeout(() => {
          particle.remove();
        }, 1000);
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
* {
  box-sizing: border-box;
}

.ig-feed-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  position: relative;
}

.ig-feed-container.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
}

/* Header */
.ig-header {
  background: white;
  border-bottom: 1px solid #dbdbdb;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.app-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #000;
  white-space: nowrap;
  flex: 1;
}

.event-selector {
  padding: 0.75rem 1rem;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 1rem;
  color: #262626;
  background: white;
  cursor: pointer;
  min-width: 250px;
}

.event-selector:focus {
  outline: none;
  border-color: #3939ff;
  box-shadow: 0 0 0 2px rgba(57, 57, 255, 0.1);
}

.fullscreen-btn-header {
  background: transparent;
  border: 2px solid #dbdbdb;
  color: #262626;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.fullscreen-btn-header:hover {
  border-color: #3939ff;
  color: #3939ff;
  transform: scale(1.05);
}

/* Main Content */
.ig-main {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 2rem;
  height: calc(100vh - 80px);
  overflow: hidden;
  flex: 1;
}

.ig-main.fullscreen-mode {
  padding: 1rem;
  max-width: 100%;
}

/* Feed */
.ig-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  height: 100%;
}

.empty-feed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  gap: 1rem;
}

.empty-feed i {
  font-size: 4rem;
  opacity: 0.3;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Instagram Post Card */
.ig-post {
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
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

.post-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
}

.username {
  font-weight: 600;
  font-size: 0.95rem;
  color: #262626;
}

.post-time {
  font-size: 0.8rem;
  color: #8e8e8e;
}

/* Post Image - GRANDE! */
.post-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f0f0f0;
  overflow: hidden;
  height: 200px
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Post Content */
.post-content {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
}

.post-text {
  margin: 0;
  color: #262626;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
}

/* Post Actions */
.post-actions {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #efefef;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #262626;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
}

.action-btn:hover {
  color: #8e8e8e;
  transform: scale(1.1);
}

.action-btn.like-btn {
  color: #262626;
}

.action-btn.like-btn:hover {
  color: #ed4956;
}

.action-btn.like-btn.has-reaction {
  color: #ed4956;
  animation: heartBeat 0.4s ease;
}

.action-btn.dislike-btn {
  color: #262626;
}

.action-btn.dislike-btn:hover {
  color: #666;
}

.action-btn.dislike-btn.has-reaction {
  color: #666;
  animation: thumbDown 0.4s ease;
}

.action-btn.angry-btn {
  color: #262626;
}

.action-btn.angry-btn:hover {
  color: #ff6b6b;
}

.action-btn.angry-btn.has-reaction {
  color: #ff6b6b;
  animation: angryShake 0.4s ease;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1.1); }
}

@keyframes thumbDown {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

@keyframes angryShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
}

/* Reactions Counter */
.reactions-counter {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  flex-wrap: wrap;
}

.reaction-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

.reaction-badge.like {
  background: #ffe0e6;
  color: #ed4956;
}

.reaction-badge.dislike {
  background: #e8e8e8;
  color: #666;
}

.reaction-badge.angry {
  background: #ffe0e0;
  color: #ff6b6b;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Confetti particles */
.confetti {
  position: fixed;
  font-size: 1.5rem;
  pointer-events: none;
  z-index: 10000;
  transition: all 1s ease-out;
}

.sad-particle {
  position: fixed;
  font-size: 1.5rem;
  pointer-events: none;
  z-index: 10000;
  opacity: 1;
  transition: all 0.8s ease-out;
}

.angry-particle {
  position: fixed;
  font-size: 1.5rem;
  pointer-events: none;
  z-index: 10000;
  opacity: 1;
  transition: all 1s ease-out;
}

/* Likes Count */
.likes-count {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #262626;
}

/* No Event Selected */
.no-event-selected-ig {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  gap: 1rem;
}

.no-event-selected-ig i {
  font-size: 4rem;
  opacity: 0.3;
}

/* Connection Badge */
.connection-badge {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.connection-badge.connected {
  background: #dcfce7;
  color: #166534;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Scrollbars */
.ig-feed::-webkit-scrollbar,
.posts-container::-webkit-scrollbar {
  width: 6px;
}

.ig-feed::-webkit-scrollbar-track,
.posts-container::-webkit-scrollbar-track {
  background: transparent;
}

.ig-feed::-webkit-scrollbar-thumb,
.posts-container::-webkit-scrollbar-thumb {
  background: #dbdbdb;
  border-radius: 3px;
}

.ig-feed::-webkit-scrollbar-thumb:hover,
.posts-container::-webkit-scrollbar-thumb:hover {
  background: #8e8e8e;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    gap: 1rem;
  }

  .event-selector {
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .ig-feed-container {
    height: auto;
    min-height: 100vh;
  }

  .ig-header {
    padding: 0.75rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .app-title {
    font-size: 1.3rem;
  }

  .event-selector {
    width: 100%;
  }

  .ig-main {
    padding: 1rem 0;
  }

  .connection-badge {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
