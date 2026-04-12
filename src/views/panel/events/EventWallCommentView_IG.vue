<template>
  <div class="container-fluid mt-4 page">

    <!-- Header Section -->
    <div class="header-section mb-4">
      <h2>
        <i class="bi bi-camera-fill me-2"></i>
        {{ selectedEvent?.name || 'Creador de Posts' }}
      </h2>
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
    </div>
    <hr class="header-divider">

    <!-- Tip Banner -->
    <div v-if="selectedEventId" class="accordion mb-4" id="accordionTip">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingTip">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseTip" 
            aria-expanded="false" 
            aria-controls="collapseTip"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Crea posts con estilo Instagram. Agrega una imagen cuadrada y un caption para compartir en el evento.
            </div>
          </button>
        </h2>
        <div 
          id="collapseTip" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingTip" 
          data-bs-parent="#accordionTip"
        >
          <div class="accordion-body tip-expanded">
            <p>
              Este creador te permite publicar <strong>posts estilo Instagram</strong> en tiempo real para tu evento seleccionado.
            </p>
            <p>
              Sube una imagen cuadrada (1:1), escribe un caption y compártelo. Los posts aparecerán automáticamente en el muro del evento.
            </p>
            <p class="mb-0">
              La vista previa te muestra cómo se verá tu post antes de publicarlo.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedEventId" class="row">
        <div class="col-12 col-lg-6 mb-4">
            <!-- Formulario (Izquierda) -->
            <div class="card form-card">
              <div class="card-body">
                <h5 class="form-title">
                  <i class="bi bi-pencil-square me-2"></i>Crear Post
                </h5>

                <div class="creator-form">
                  <!-- Avatar + Nombre -->
                  <div class="creator-user">
                    <div class="creator-avatar" :style="{ backgroundColor: getAvatarColor(username) }">
                      {{ username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="user-input-group">
                      <input
                        v-model="username"
                        type="text"
                        placeholder="Tu nombre de usuario"
                        maxlength="50"
                        class="creator-input-name"
                        required
                      />
                      <span class="char-counter-small">{{ username.length }}/50</span>
                    </div>
                  </div>

                  <!-- Imagen - 1:1 CUADRADA -->
                  <div v-if="!imagePreview" class="image-upload-large">
                    <button 
                      type="button" 
                      @click="$refs.imageInput.click()" 
                      class="image-upload-area"
                    >
                      <i class="bi bi-image-fill"></i>
                      <span>Agrega una foto</span>
                      <small>Preferiblemente cuadrada 1:1</small>
                    </button>
                  </div>

                  <div v-if="imagePreview" class="image-preview-large">
                    <div class="preview-remove">
                      <button 
                        type="button" 
                        @click="removeImage"
                        class="remove-image-large"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                    <img :src="imagePreview" :alt="imageFileName" />
                  </div>

                  <input 
                    ref="imageInput" 
                    type="file" 
                    accept="image/*" 
                    @change="handleImageUpload" 
                    style="display: none;"
                  />

                  <!-- Caption -->
                  <div class="caption-group">
                    <textarea
                      ref="commentTextarea"
                      v-model="comment"
                      @keydown.enter.ctrl="sendComment"
                      @keydown.meta.enter="sendComment"
                      placeholder="Escribe tu comentario..."
                      maxlength="500"
                      class="caption-textarea"
                      required
                    ></textarea>
                    <span class="char-counter">{{ comment.length }}/500</span>
                  </div>

                  <!-- Emoji Picker -->
                  <div class="emoji-toolbar">
                    <button 
                      type="button" 
                      @click="toggleEmojiPicker" 
                      class="emoji-btn-toolbar"
                    >
                      <i class="bi bi-emoji-smile"></i> Emojis
                    </button>

                    <div v-if="showEmojiPicker" class="emoji-picker-inline">
                      <button 
                        v-for="emoji in emojis" 
                        :key="emoji"
                        type="button"
                        @click="addEmoji(emoji)"
                        class="emoji-btn-inline"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>

                  <!-- Status + Botón Enviar -->
                  <div class="creator-footer">
                    <div class="connection-status-small" :class="connectionStatus">
                      <span class="status-dot"></span>
                      {{ getStatusText }}
                    </div>
                    <button 
                      type="button"
                      @click="sendComment"
                      class="post-btn"
                      :disabled="!comment.trim() || !username.trim() || isSending"
                    >
                      <i v-if="!isSending" class="bi bi-send-fill"></i>
                      <i v-else class="bi bi-hourglass-split spinning"></i>
                      {{ isSending ? 'Compartiendo...' : 'Compartir' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
        <div class="col-12 col-lg-6 mb-4">
            <!-- Vista Previa Instagram (Derecha) -->
            <div class="card preview-card">
              <div class="card-body">
                <h5 class="preview-title">
                  <i class="bi bi-instagram me-2 text-danger"></i>Vista Previa
                </h5>
                
                <div class="ig-preview-card">
                  <!-- Header estilo IG -->
                  <div class="post-header-preview">
                    <div class="avatar-preview" :style="{ backgroundColor: getAvatarColor(username) }">
                      {{ username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="user-preview">
                      <strong>{{ username || 'Tu nombre' }}</strong>
                      <small>Ahora</small>
                    </div>
                    <div class="three-dots">
                      <i class="bi bi-three-dots"></i>
                    </div>
                  </div>

                  <!-- Imagen 1:1 -->
                  <div v-if="imagePreview" class="image-preview-post">
                    <img :src="imagePreview" :alt="imageFileName" style="aspect-ratio: 1/1; object-fit: cover;" />
                  </div>
                  <div v-else class="image-placeholder">
                    <i class="bi bi-image"></i>
                    <span>Sin imagen</span>
                  </div>

                  <!-- Acciones -->
                  <div class="post-actions-preview">
                    <button type="button" class="action-preview">
                      <i class="bi bi-heart"></i>
                    </button>
                    <button type="button" class="action-preview">
                      <i class="bi bi-chat"></i>
                    </button>
                    <button type="button" class="action-preview">
                      <i class="bi bi-send"></i>
                    </button>
                    <button type="button" class="action-preview bookmark">
                      <i class="bi bi-bookmark"></i>
                    </button>
                  </div>

                  <!-- Caption -->
                  <div class="caption-preview">
                    <strong>{{ username || 'Tu nombre' }}</strong>
                    <span v-if="comment">{{ comment }}</span>
                    <span v-else class="placeholder-text">Tu comentario aparecerá aquí</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>

    <!-- Sin Evento Seleccionado -->
    <div v-else class="no-event-selected">
      <i class="bi bi-camera-video"></i>
      <p>Selecciona un evento para crear posts</p>
    </div>

  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'EventWallCommentView_IG',
  data() {
    return {
      events: [],
      selectedEventId: '',
      selectedEvent: null,
      loadingEvents: false,
      socket: null,
      connectionStatus: 'connecting',
      username: '',
      comment: '',
      isSending: false,
      showEmojiPicker: false,
      imagePreview: null,
      imageData: null,
      imageFileName: '',
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
        '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
        '😔', '😌', '😑', '😐', '😏', '🤨', '😒', '😓',
        '🎉', '🎊', '🎈', '🎁', '⭐', '✨', '🔥', '👏',
        '👏', '🙏', '👍', '👎', '❤️', '💔', '💚', '💙',
        '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️'
      ],
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

        if (!this.socket || !this.socket.connected) {
          this.initializeSocket();
        }

        this.socket.emit('join_event', { eventId: this.selectedEventId });
        this.connectionStatus = 'connecting';
      }
    },

    async sendComment() {
      if (!this.comment.trim() || !this.username.trim()) {
        return;
      }

      this.isSending = true;
      this.showEmojiPicker = false;

      try {
        const messageData = {
          eventId: this.selectedEventId,
          username: this.username.trim(),
          message: this.comment.trim(),
          timestamp: new Date().toISOString(),
          hasImage: !!this.imageData,
          imageFileName: this.imageFileName
        };

        if (this.imageData) {
          const reader = new FileReader();
          reader.onload = (e) => {
            messageData.image = e.target?.result;
            this.emitMessage(messageData);
          };
          reader.readAsDataURL(this.imageData);
        } else {
          this.emitMessage(messageData);
        }
      } catch (error) {
        console.error('Error:', error);
        this.isSending = false;
      }
    },

    emitMessage(messageData) {
      if (this.socket && this.socket.connected) {
        this.socket.emit('send_message', messageData, (response) => {
          if (response && response.success) {
            this.comment = '';
            this.removeImage();
            this.saveUsername();
          } else {
            console.error('Error al enviar:', response?.error);
          }
          this.isSending = false;
        });
      } else {
        console.error('Socket no conectado');
        this.connectionStatus = 'error';
        this.isSending = false;
      }
    },

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },

    addEmoji(emoji) {
      this.comment += emoji;
      this.$refs.commentTextarea?.focus();
    },

    handleImageUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('La imagen no puede superar 5MB');
        return;
      }

      this.imageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result;
        this.imageData = file;
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
      this.imagePreview = null;
      this.imageData = null;
      this.imageFileName = '';
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = '';
      }
    },

    getAvatarColor(username) {
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.avatarColors.length;
      return this.avatarColors[index];
    },

    saveUsername() {
      localStorage.setItem('eventWallUsername', this.username);
    },

    loadUsername() {
      const saved = localStorage.getItem('eventWallUsername');
      if (saved) {
        this.username = saved;
      }
    }
  },

  mounted() {
    this.fetchEvents();
    this.loadUsername();
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
};
</script>

<style scoped>
/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-section h2 {
  margin: 0;
  color: #1f2937;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.event-selector {
  padding: 0.625rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #262626;
  background: white;
  cursor: pointer;
  min-width: 250px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.event-selector:focus {
  outline: none;
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

.event-selector:hover {
  border-color: #3939ff;
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Tip Banner */
.tip-banner-style {
  border: 2px solid #fef3c7;
  border-radius: 12px;
  overflow: hidden;
  background: #fffbeb;
}

.tip-banner-button {
  background: #fffbeb;
  border: none;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.tip-banner-button:not(.collapsed) {
  background: #fef3c7;
}

.tip-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tip-text {
  color: #78350f;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: left;
  flex: 1;
}

.tip-text strong {
  color: #92400e;
}

.tip-expanded {
  background: white;
  border-top: 2px solid #fef3c7;
  color: #78350f;
  line-height: 1.6;
}

.tip-expanded p {
  margin-bottom: 0.75rem;
}

/* Cards */
.form-card,
.preview-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  transition: box-shadow 0.3s ease;
}

.form-card:hover,
.preview-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.form-title,
.preview-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
}

/* FORM STYLES */
.creator-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* User Section */
.creator-user {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.creator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
}

.creator-input-name {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #262626;
  font-weight: 500;
  background: white;
  transition: all 0.2s ease;
}

.creator-input-name:focus {
  outline: none;
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

.char-counter-small {
  font-size: 0.7rem;
  color: #8e8e8e;
  text-align: right;
}

/* Image Upload */
.image-upload-large {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0;
  transition: all 0.2s ease;
}

.image-upload-large:hover {
  border-color: #3939ff;
  background: #f0f0ff;
}

.image-upload-area {
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #8e8e8e;
  transition: all 0.2s ease;
}

.image-upload-area:hover {
  color: #3939ff;
}

.image-upload-area i {
  font-size: 2.5rem;
}

.image-upload-area span {
  font-weight: 500;
  font-size: 1rem;
  color: #262626;
}

.image-upload-area small {
  font-size: 0.85rem;
  color: #8e8e8e;
}

/* Image Preview */
.image-preview-large {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
  margin: 0.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.image-preview-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}

.remove-image-large {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.remove-image-large:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Caption */
.caption-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.caption-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #262626;
  background: white;
  resize: none;
  max-height: 150px;
  transition: all 0.2s ease;
}

.caption-textarea:focus {
  outline: none;
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

.char-counter {
  font-size: 0.75rem;
  color: #8e8e8e;
  text-align: right;
}

/* Emoji Toolbar */
.emoji-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emoji-btn-toolbar {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.625rem;
  color: #262626;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.emoji-btn-toolbar:hover {
  border-color: #3939ff;
  color: #3939ff;
  background: #f0f0ff;
}

.emoji-picker-inline {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 0.4rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  max-height: 120px;
  overflow-y: auto;
}

.emoji-btn-inline {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.4rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn-inline:hover {
  background: #f0f0ff;
  transform: scale(1.2);
  border-color: #3939ff;
}

/* Footer */
.creator-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 2px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
}

.connection-status-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
  border-radius: 3px;
  background: #fef3c7;
  color: #92400e;
}

.connection-status-small.connected {
  background: #dcfce7;
  color: #166534;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.post-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3939ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
}

.post-btn:hover:not(:disabled) {
  background: #2323cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.post-btn:disabled {
  background: #c4c4c4;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
  transform: none;
}

i.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* IG Preview Card */
.ig-preview-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Header del Post */
.post-header-preview {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.avatar-preview {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.user-preview {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.user-preview strong {
  font-size: 0.9rem;
  color: #262626;
  display: block;
}

.user-preview small {
  font-size: 0.7rem;
  color: #8e8e8e;
  display: block;
}

.three-dots {
  color: #262626;
  font-size: 1rem;
  cursor: pointer;
}

/* Imagen */
.image-preview-post {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f0f0f0;
  overflow: hidden;
}

.image-preview-post img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: 0.5rem;
  border: 2px dashed #e5e7eb;
}

.image-placeholder i {
  font-size: 2rem;
}

.image-placeholder span {
  font-size: 0.85rem;
}

/* Post Actions */
.post-actions-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.action-preview {
  background: none;
  border: none;
  color: #262626;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.action-preview:hover {
  color: #ed4956;
  transform: scale(1.15);
}

.action-preview.bookmark {
  margin-left: auto;
}

/* Caption */
.caption-preview {
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #262626;
  line-height: 1.5;
  word-wrap: break-word;
}

.caption-preview strong {
  font-weight: 600;
  display: inline;
  margin-right: 0.25rem;
}

.placeholder-text {
  color: #9ca3af;
}

/* No Event Selected */
.no-event-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin: 2rem auto;
  max-width: 500px;
}

.no-event-selected i {
  font-size: 4rem;
  opacity: 0.4;
}

.no-event-selected p {
  font-size: 1.1rem;
  margin: 0;
}

/* Scrollbars */
.emoji-picker-inline::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker-inline::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-picker-inline::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.emoji-picker-inline::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive */
@media (max-width: 992px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .event-selector {
    width: 100%;
  }

  .ig-preview-card {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .header-section h2 {
    font-size: 1.5rem;
  }

  .form-card,
  .preview-card {
    border-radius: 8px;
  }

  .tip-banner-button {
    padding: 0.75rem 1rem;
  }

  .tip-icon {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }

  .tip-text {
    font-size: 0.875rem;
  }
}
</style>