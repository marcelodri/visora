<template>
  <div class="min-vh-100 bg-gradient py-4">
    <!-- Header -->
    <div class="container">
      <div class="row justify-content-center mb-4">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="header-card">
            <div class="d-flex align-items-center gap-3">
              <div class="header-icon">
                <i class="bi bi-person-check-fill"></i>
              </div>
              <div>
                <h1 class="header-title mb-1">Control de Asistencia</h1>
                <p class="header-subtitle mb-0">Escanea el código QR para registrar entrada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="main-card">
            <div class="card-body p-4">
              <!-- Scanner View -->
              <div v-if="!scannedData">
                <!-- Scanner Area -->
                <div class="mb-4">
                  <div class="scanner-container">
                    <video 
                      ref="videoElement" 
                      class="scanner-video"
                      autoplay 
                      playsinline
                    ></video>
                    
                    <!-- Scanner Overlay -->
                    <div class="scanner-overlay">
                      <div class="scanner-frame">
                        <div class="scanner-corner corner-tl"></div>
                        <div class="scanner-corner corner-tr"></div>
                        <div class="scanner-corner corner-bl"></div>
                        <div class="scanner-corner corner-br"></div>
                      </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="scanner-status">
                      <div class="status-badge">
                        <div v-if="isScanning" class="d-flex align-items-center gap-2">
                          <span class="status-dot status-active"></span>
                          <span class="status-text">Escaneando...</span>
                        </div>
                        <div v-else class="d-flex align-items-center gap-2">
                          <span class="status-dot status-inactive"></span>
                          <span class="status-text">Cámara detenida</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Manual Input -->
                <div class="mb-4">
                  <button 
                    @click="showManualInput = !showManualInput"
                    class="btn-link-custom w-100"
                  >
                    ¿No puedes escanear? Ingresa el código manualmente
                  </button>
                  
                  <div v-if="showManualInput" class="input-group mt-3 input-group-modern">
                    <input 
                      v-model="manualCode"
                      @keyup.enter="searchByManualCode"
                      type="text"
                      placeholder="Ingresa el código QR"
                      class="form-control form-control-modern"
                    />
                    <button 
                      @click="searchByManualCode"
                      class="btn btn-primary btn-modern"
                    >
                      <i class="bi bi-search me-2"></i>
                      Buscar
                    </button>
                  </div>
                </div>

                <!-- Camera Controls -->
                <div class="d-flex gap-3">
                  <button 
                    @click="toggleScanning"
                    :class="isScanning ? 'btn-danger-modern' : 'btn-success-modern'"
                    class="btn-control flex-fill"
                  >
                    <i :class="isScanning ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'" class="me-2"></i>
                    {{ isScanning ? 'Pausar Cámara' : 'Iniciar Cámara' }}
                  </button>
                  <button 
                    @click="switchCamera"
                    class="btn-control btn-secondary-modern"
                  >
                    <i class="bi bi-arrow-repeat"></i>
                  </button>
                </div>
              </div>

              <!-- Registration Details View -->
              <div v-else>
                <!-- Loading State -->
                <div v-if="isLoading" class="text-center py-5">
                  <div class="spinner-modern mb-4"></div>
                  <p class="loading-text">Buscando registro...</p>
                </div>

                <!-- Registration Found -->
                <div v-else-if="currentRegistration">
                  <!-- Success Header -->
                  <div class="alert-success-modern mb-4">
                    <div class="success-icon-container mb-3">
                      <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 class="alert-title">Registro Encontrado</h2>
                  </div>

                  <!-- User Info Card -->
                  <div class="user-card mb-4">
                    <div class="mb-4">
                        <h5 class="section-title">
                        <i class="bi bi-person-circle me-2"></i>Información del Participante
                        </h5>
                        <div class="row g-3">
                            <div 
                                v-for="field in currentRegistration.fields" 
                                :key="field.field_name"
                                class="col-md-6"
                            >
                                <label class="text-muted small">{{ field.field_label }}:</label>
                                <p class="mb-0">
                                <strong>{{ field.field_value || 'No proporcionado' }}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h5 class="section-title"><i class="bi bi-calendar-event me-2"></i>Información de la Sesión</h5>
                        <div class="row g-3">
                        <div class="col-md-6">
                            <label class="text-muted small">Sesión:</label>
                            <p class="mb-0"><strong>{{ currentRegistration.session.description }}</strong></p>
                        </div>
                        <div class="col-md-6">
                            <label class="text-muted small">Fecha y Hora:</label>
                            <p class="mb-0"><strong>{{ formatDate(currentRegistration.session.event_date) }}</strong></p>
                        </div>
                        </div>
                    </div>
                </div>

                  <!-- Attendance Status -->
                  <div v-if="currentRegistration.status=='attended'" class="alert-warning-modern mb-4">
                    <i class="bi bi-exclamation-triangle-fill warning-icon mb-3"></i>
                    <p class="warning-text mb-0">Este registro ya fue marcado como asistido</p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex gap-3 justify-content-end">
                    <button 
                        v-if="currentRegistration.status!='attended'" 
                      @click="confirmAttendance"
                      :disabled="currentRegistration.attended"
                      class="btn-action flex-fill"
                      :class="currentRegistration.attended ? 'btn-disabled' : 'btn-confirm'"
                    >
                      <i class="bi bi-check-lg me-2"></i>
                      Marcar Asistencia
                    </button>
                    <button 
                      @click="resetScanner"
                      class="btn-action btn-back float-right"
                    >
                      <i class="bi bi-arrow-left"></i>
                    </button>
                  </div>
                </div>

                <!-- Registration Not Found -->
                <div v-else class="text-center py-5">
                  <div class="error-icon-container mb-4">
                    <i class="bi bi-x-circle-fill"></i>
                  </div>
                  <h2 class="error-title mb-2">Registro No Encontrado</h2>
                  <p class="error-text mb-4">El código QR "{{ scannedData }}" no existe en la base de datos</p>
                  <button 
                    @click="resetScanner"
                    class="btn-action btn-retry"
                  >
                    <i class="bi bi-arrow-left me-2"></i>
                    Intentar de Nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-container">
        <div :class="['toast-modern', toast.success ? 'toast-success' : 'toast-error']">
          <div class="toast-icon">
            {{ toast.success ? '✓' : '✕' }}
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Confirm Modal -->
    <transition name="modal">
      <div v-if="showConfirm" class="modal-backdrop-modern" @click.self="showConfirm = false">
        <div class="modal-content-modern">
          <div class="modal-header-modern">
            <h5 class="modal-title-modern">{{ confirmTitle }}</h5>
            <button type="button" class="btn-close-modern" @click="showConfirm = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body-modern">
            <p class="modal-question">{{ confirmQuestion }}</p>
          </div>
          <div class="modal-footer-modern">
            <button type="button" class="btn-modal btn-cancel" @click="showConfirm = false">
              Cancelar
            </button>
            <button type="button" class="btn-modal btn-confirm-modal" @click="executeConfirm">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/library';

// Refs
const videoElement = ref(null);
const isScanning = ref(false);
const scannedData = ref(null);
const currentRegistration = ref(null);
const isLoading = ref(false);
const showManualInput = ref(false);
const manualCode = ref('');
const useFrontCamera = ref(false);
const token = ref(null);
const url = "https://apis.madautomate.cloud/webhook/1090f10d-aafd-4c67-bc72-c3365187d6df";

// Toast
const toast = ref({
  show: false,
  title: '',
  message: '',
  success: true
});

// Confirm Dialog
const showConfirm = ref(false);
const confirmTitle = ref('');
const confirmQuestion = ref('');
const pendingAction = ref(null);

// Scanner
let codeReader = null;
let currentStream = null;

// Initialize scanner
onMounted(() => {
  codeReader = new BrowserMultiFormatReader();
  getToken();
  startScanning();
});

onUnmounted(() => {
  stopScanning();
});

const startScanning = async () => {
  try {
    isScanning.value = true;
    
    const constraints = {
      video: {
        facingMode: useFrontCamera.value ? 'user' : 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.value.srcObject = currentStream;

    codeReader.decodeFromVideoDevice(null, videoElement.value, (result, err) => {
      if (result) {
        handleScan(result.text);
      }
    });
  } catch (error) {
    triggerToast('Error de Cámara', 'No se pudo acceder a la cámara', false);
    isScanning.value = false;
  }
};

const stopScanning = () => {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  if (codeReader) {
    codeReader.reset();
  }
  isScanning.value = false;
};

const toggleScanning = () => {
  if (isScanning.value) {
    stopScanning();
  } else {
    startScanning();
  }
};

const switchCamera = async () => {
  useFrontCamera.value = !useFrontCamera.value;
  stopScanning();
  await new Promise(resolve => setTimeout(resolve, 300));
  await startScanning();
};

const handleScan = async (qrCode) => {
  if (scannedData.value) return;
  
  scannedData.value = qrCode;
  stopScanning();
  await searchRegistration(qrCode);
};

const searchByManualCode = async () => {
  if (!manualCode.value.trim()) {
    triggerToast('Error', 'Ingresa un código válido', false);
    return;
  }
  
  scannedData.value = manualCode.value.trim();
  await searchRegistrationByCode(manualCode.value.trim());
};

const searchRegistration = async (qrCode) => {
  isLoading.value = true;
  
  try {
    const response = await axios.post(url, {action: "dataregister", guid: qrCode}, {
        headers: {
            Authorization: `Bearer ${token.value}`,
        },
    });
    
    const data = response.data;
    data.fields = JSON.parse(data.fields),
    data.session = JSON.parse(data.session),
    data.event = JSON.parse(data.event)
    currentRegistration.value = data;
    
  } catch (error) {
    triggerToast('Error', 'No se pudo buscar el registro', false);
    currentRegistration.value = null;
  } finally {
    isLoading.value = false;
  }
};

const searchRegistrationByCode = async (code) => {
  isLoading.value = true;
  
  try {
    const response = await axios.post(url, {action: "dataregister_code", code: code}, {
        headers: {
            Authorization: `Bearer ${token.value}`,
        },
    });
    
    const data = response.data;
    data.fields = JSON.parse(data.fields),
    data.session = JSON.parse(data.session),
    data.event = JSON.parse(data.event)

    currentRegistration.value = data;
    
  } catch (error) {
    triggerToast('Error', 'No se pudo buscar el registro', false);
    currentRegistration.value = null;
  } finally {
    isLoading.value = false;
  }
};

const confirmAttendance = () => {
  confirmTitle.value = 'Confirmar Asistencia';
  confirmQuestion.value = `¿Confirmar que ${currentRegistration.value.name} asistió al evento?`;
  pendingAction.value = { action: 'attend_registration', data: currentRegistration.value };
  showConfirm.value = true;
};

const executeConfirm = async () => {
  showConfirm.value = false;
  
  try {
    isLoading.value = true;
    
    // AQUÍ VA TU LLAMADA A LA API PARA MARCAR ASISTENCIA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await axios.post(url, {
        action: "changeregistration",
        registration_id: currentRegistration.value.registration_id,
        pendingAction: "attend_registration"
    }, {
        headers: { Authorization: `Bearer ${token.value}` }
    });

    triggerToast('¡Éxito!', 'Asistencia registrada correctamente', true);
    currentRegistration.value.attended = true;
    
    setTimeout(() => {
      resetScanner();
    }, 2000);
    
  } catch (error) {
    triggerToast('Error', 'No se pudo registrar la asistencia', false);
  } finally {
    isLoading.value = false;
  }
};

const resetScanner = () => {
  scannedData.value = null;
  currentRegistration.value = null;
  manualCode.value = '';
  showManualInput.value = false;
  startScanning();
};

const triggerToast = (title, message, success) => {
  toast.value = { show: true, title, message, success };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const getToken = async () => {
    token.value = sessionStorage.getItem('token');
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
    });
};
</script>

<style scoped>
/* Background & Layout */
.bg-gradient {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

/* Header Card */
.header-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  border-bottom: 4px solid #3b82f6;
  transition: transform 0.3s ease;
}

.header-card:hover {
  transform: translateY(-2px);
}

.header-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-subtitle {
  color: #64748b;
  font-size: 1rem;
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Scanner Container */
.scanner-container {
  position: relative;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 1/1;
  max-width: 500px;
  margin: 0 auto;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  position: relative;
  width: 250px;
  height: 250px;
  border: 4px solid white;
  border-radius: 20px;
  animation: pulse-border 2s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.scanner-corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border: 4px solid #3b82f6;
}

.corner-tl {
  top: -4px;
  left: -4px;
  border-right: none;
  border-bottom: none;
  border-radius: 20px 0 0 0;
}

.corner-tr {
  top: -4px;
  right: -4px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 20px 0 0;
}

.corner-bl {
  bottom: -4px;
  left: -4px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 20px;
}

.corner-br {
  bottom: -4px;
  right: -4px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 20px 0;
}

/* Status Badge */
.scanner-status {
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.status-badge {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 0.5rem 1rem;
}

.status-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-active {
  background: #10b981;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.status-inactive {
  background: #fbbf24;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Manual Input */
.btn-link-custom {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  padding: 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-link-custom:hover {
  color: #2563eb;
}

.input-group-modern {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-control-modern {
  border: 2px solid #e5e7eb;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control-modern:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.btn-modern {
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

/* Control Buttons */
.btn-control {
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-control:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-success-modern {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-danger-modern {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-secondary-modern {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  color: white;
  flex-shrink: 0;
}

/* Loading Spinner */
.spinner-modern {
  width: 64px;
  height: 64px;
  border: 5px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #64748b;
  font-weight: 600;
  font-size: 1.125rem;
}

/* Success Alert */
.alert-success-modern {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.success-icon-container {
  width: 80px;
  height: 80px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  font-size: 3rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.alert-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #065f46;
  margin: 0;
}

/* User Card */
.user-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #3b82f6;
  border-radius: 16px;
  padding: 1.5rem;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.user-email {
  color: #64748b;
  font-size: 1rem;
}

.badge-modern {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-primary {
  background: #3b82f6;
  color: white;
}

.badge-secondary {
  background: #64748b;
  color: white;
}

/* Info Card */
.info-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  color: #475569;
  font-weight: 500;
  padding: 0.5rem 0;
}

.info-item i {
  color: #3b82f6;
  font-size: 1.25rem;
}

/* Warning Alert */
.alert-warning-modern {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  color: #d97706;
  font-size: 3rem;
  display: block;
}

.warning-text {
  font-weight: 700;
  color: #92400e;
  font-size: 1rem;
}

/* Action Buttons */
.btn-action {
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-back {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  flex-shrink: 0;
}

/* Error State */
.error-icon-container {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #ef4444;
  font-size: 4rem;
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #dc2626;
}

.error-text {
  color: #64748b;
  font-size: 1rem;
}

.btn-retry {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem 2rem;
  display: inline-flex;
}

/* Toast */
.toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

.toast-modern {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 320px;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast-error .toast-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 700;
  font-size: 1.125rem;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.toast-message {
  color: #64748b;
  font-size: 0.875rem;
}

/* Toast Animation */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translate(-50%, 100px);
  opacity: 0;
}

.toast-leave-to {
  transform: translate(-50%, 100px);
  opacity: 0;
}

/* Modal */
.modal-backdrop-modern {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content-modern {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
}

.modal-header-modern {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-modern {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.btn-close-modern {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close-modern:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body-modern {
  padding: 2rem;
}

.modal-question {
  color: #475569;
  font-size: 1.125rem;
  margin: 0;
}

.modal-footer-modern {
  background: #f8fafc;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-modal {
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal:hover {
  transform: translateY(-2px);
}

.btn-cancel {
  background: #e5e7eb;
  color: #475569;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-confirm-modal {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* Modal Animation */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content-modern,
.modal-leave-to .modal-content-modern {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .header-title {
    font-size: 1.1rem;
  }
  
  .header-subtitle {
    font-size: 0.7rem;
  }
  
  .scanner-frame {
    width: 200px;
    height: 200px;
  }
  
  .btn-control {
    font-size: 0.875rem;
    padding: 0.875rem;
  }
  .header-icon {
    height: 30px;
    width: 30px;
  }
  .header-card {
    padding: 0.8rem;
  }
  .input-group-modern {
    display: flex;
    flex-direction: column;
    box-shadow: none
  }
  .input-group-modern input, 
  .input-group-modern button {
    width: 100%;
  }
  .input-group-modern input {
    padding: 10px 20px;
    margin-bottom: 10px;
  }

}
</style>