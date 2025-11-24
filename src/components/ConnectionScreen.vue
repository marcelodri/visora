<template>
  <div class="connection-screen">
    <div class="connection-card">
      <div class="logo-container">
        <div class="logo-whatsapp">
          <svg viewBox="0 0 24 24" fill="white">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."
            />
          </svg>
        </div>
        <h1>Conectar WhatsApp</h1>
        <p>Escanea el código QR con tu teléfono</p>
      </div>

      <button v-if="!qrCode && !loading" @click="$emit('connect')" class="connect-btn">
        Generar Código QR
      </button>

      <div v-if="loading && !qrCode" class="loading">
        <div class="spinner"></div>
        <p>Generando código QR...</p>
      </div>

      <div v-if="qrCode" class="qr-container">
        <div class="qr-box">
          <img :src="qrCode" alt="QR Code" />
        </div>
        <div class="instructions">
          <p>1. Abre WhatsApp en tu teléfono</p>
          <p>2. Ve a “Dispositivos vinculados”</p>
          <p>3. Toca “Vincular un dispositivo”</p>
          <p>4. Escanea este código</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConnectionScreen',
  props: {
    qrCode: String,
    loading: Boolean,
  },
}
</script>
