<template>
  <div id="app-whatsapp">
    <ConnectionScreen
      v-if="!connected"
      :qrCode="qrCode"
      :loading="loading"
      @connect="connectWhatsApp"
    />

    <ChatInterface
      v-else
      :chats="chats"
      :selectedChat="selectedChat"
      :messages="messages"
      :newMessage="newMessage"
      @selectChat="selectChat"
      @sendMessage="sendMessage"
      @updateNewMessage="val => newMessage = val"
      :formatTime="formatTime"
    />
  </div>
</template>

<script>
import ConnectionScreen from '@/components/ConnectionScreen.vue'
import ChatInterface from '@/components/ChatInterface.vue'

export default {
  name: 'ConversationAgent',
  components: { ConnectionScreen, ChatInterface },

  data() {
    return {
      connected: false,
      qrCode: '',
      loading: false,
      chats: [],
      selectedChat: null,
      messages: [],
      newMessage: '',
      ws: null,
    }
  },

  mounted() {
    const wasConnected = localStorage.getItem('whatsapp_connected') === 'true'
    this.connected = wasConnected
    this.initWebSocket()
  },

  watch: {
    connected(newVal) {
      localStorage.setItem('whatsapp_connected', newVal)
    },
  },

  beforeUnmount() {
    if (this.ws) this.ws.close()
  },

  methods: {
    initWebSocket() {
      this.ws = new WebSocket('ws://localhost:3001')
      this.ws.onopen = () => console.log('WebSocket conectado')

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'waiting':
            this.connected = false
            break
          case 'qr':
            this.qrCode = data.qr
            this.loading = false
            break
          case 'ready':
            this.connected = true
            this.qrCode = ''
            this.loadChats()
            break
          case 'chats':
            //this.chats = data.chats
            this.chats = data.chats.map(c => ({ ...c, aiEnabled: false }));
            break
          case 'messages': // 👈 ESTE BLOQUE ES CLAVE
            //console.log('📜 Mensajes recibidos:', data.messages);
            this.messages = data.messages || [];
            this.$nextTick(this.scrollToBottom);
            break;
          case 'message':
            const msg = data.message;

            // Mostrar el mensaje si es del chat seleccionado
            if (this.selectedChat && msg.from === this.selectedChat.id) {
              this.messages.push(msg);
              this.$nextTick(this.scrollToBottom);
            }

            // Actualizar preview
            this.updateChatPreview(msg);

            // ✅ Solo responder con IA si el chat tiene la opción activada
            const chat = this.chats.find(c => c.id === msg.from);
            if (chat?.aiEnabled && !msg.fromMe) {
              this.handleAssistantResponse(msg);
            }
            break;

        }
      }

      this.ws.onclose = () => {
        console.warn('WebSocket cerrado. Reintentando...')
        setTimeout(this.initWebSocket, 3000)
      }
    },

    connectWhatsApp() {
      this.loading = true
      if (this.ws?.readyState === WebSocket.OPEN)
        this.ws.send(JSON.stringify({ action: 'initialize' }))
    },

    loadChats() {
      if (this.ws?.readyState === WebSocket.OPEN)
        this.ws.send(JSON.stringify({ action: 'getChats' }))
    },

    selectChat(chat) {
      console.log('chat', chat)
      this.selectedChat = chat
      if (this.ws?.readyState === WebSocket.OPEN)
        this.ws.send(JSON.stringify({ action: 'getMessages', chatId: chat.id }))
    },

    sendMessage() {
      if (!this.newMessage.trim() || !this.selectedChat) return
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            action: 'sendMessage',
            chatId: this.selectedChat.id,
            message: this.newMessage,
          })
        )

        const msg = {
          id: Date.now().toString(),
          body: this.newMessage,
          fromMe: true,
          timestamp: Date.now() / 1000,
          ack: 1,
        }
        this.messages.push(msg)
        this.newMessage = ''
        this.$nextTick(this.scrollToBottom)
      }
    },

    updateChatPreview(message) {
      this.chats = this.chats.map((c) =>
        c.id === message.from ? { ...c, lastMessage: message.body, timestamp: message.timestamp } : c
      )
    },

    formatTime(ts) {
      const date = new Date(ts * 1000)
      return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) container.scrollTop = container.scrollHeight
    },

    async handleAssistantResponse(message) {
      console.log('message', message)
      try {
        const r = await fetch('https://hub.redooconect.com.ar/webhook/ef2567e5-011c-492b-9a75-02b3c285d17a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage: message.body, chatId: message.from }),
        })
        const data = await r.json()
        this.newMessage = data.response
        this.selectedChat = {id: message.chatId}
        this.sendMessage()
      } catch (e) {
        console.error('Error al procesar respuesta:', e)
      }
    },
  },
}
</script>
