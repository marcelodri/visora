<template>
  <div class="whatsapp-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="avatar"></div>
      </div>

      <div class="search-container">
        <div class="search-box">
          <input type="text" placeholder="Buscar o iniciar chat" />
        </div>
      </div>

      <div class="chats-list">
        <div v-if="!chats.length" class="no-chats">No hay chats disponibles</div>
        <!-- <div
          v-for="chat in chats"
          :key="chat.id"
          class="chat-item"
          :class="{ active: selectedChat?.id === chat.id }"
          @click="$emit('selectChat', chat)"
        >
          <div class="chat-info">
            <h3>{{ chat.name }}</h3>
            <p>{{ chat.lastMessage || 'Sin mensajes' }}</p>
          </div>
        </div> -->
        <div
            v-for="chat in chats"
            :key="chat.id"
            class="chat-item d-flex align-items-center justify-content-between border-bottom px-3 py-2 chat-row"
            @click="$emit('selectChat', chat)"
            >
            <!-- Info del chat -->
            <div class="d-flex flex-column overflow-hidden">
                <strong class="text-truncate">{{ chat.name }}</strong>
                <small class="text-muted text-truncate">{{ chat.lastMessage }}</small>
            </div>

            <!-- Switch IA -->
            <div class="form-check form-switch ms-auto" @click.stop>
                <input
                class="form-check-input"
                type="checkbox"
                v-model="chat.aiEnabled"
                :id="'switch-' + chat.id"
                />
                <label class="form-check-label small text-muted" :for="'switch-' + chat.id">
                IA
                </label>
            </div>
        </div>

      </div>
    </div>

    <!-- Chat Area -->
    <div class="chat-area">
      <div v-if="selectedChat">
        <div class="chat-header-bar">
          <h2>{{ selectedChat.name }}</h2>
        </div>

        <div class="messages-container">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['message-wrapper', msg.fromMe ? 'sent' : 'received']"
          >
            <div class="message-bubble">
              <p>{{ msg.body }}</p>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div class="input-container">
          <input
            type="text"
            v-model="localMessage"
            @input="$emit('updateNewMessage', localMessage)"
            @keypress.enter="$emit('sendMessage')"
            placeholder="Escribe un mensaje"
          />
          <button @click="$emit('sendMessage')">Enviar</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Selecciona un chat para comenzar</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInterface',
  props: {
    chats: Array,
    selectedChat: Object,
    messages: Array,
    newMessage: String,
    formatTime: Function,
  },
  data() {
    return { localMessage: this.newMessage }
  },
  watch: {
    newMessage(val) {
      this.localMessage = val
    },
  },
}
</script>
