<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content-custom">
      <!-- Header -->
      <div class="modal-header-custom">
        <div>
          <h5 class="mb-0">
            {{ vehicle.brand }} {{ vehicle.model }}
            <small class="text-muted">{{ vehicle.version }}</small>
          </h5>
          <small class="text-muted">
            <i class="bi bi-geo-alt me-1"></i>
            {{ vehicle.location }}
          </small>
        </div>
        <button @click="closeModal" class="btn-close"></button>
      </div>

      <!-- Content -->
      <div class="modal-body-custom">
        <div class="row g-4">
          <!-- Column 1: Imágenes -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-images me-2"></i>
                  Imágenes ({{ selectedImages.length }}/{{ vehicle.media?.length || 0 }})
                </h6>
              </div>
              <div class="card-body">
                <!-- Main Image -->
                <div class="mb-3">
                  <img
                    :src="mainImage"
                    :alt="vehicle.brand"
                    class="img-fluid rounded mb-3"
                    style="max-height: 300px; width: 100%; object-fit: cover"
                  />
                </div>

                <!-- Image Thumbnails -->
                <div v-if="vehicle.media?.length" class="mb-3">
                  <small class="text-muted d-block mb-2">Seleccionar imágenes para incluir:</small>
                  <div class="row g-2">
                    <div
                      v-for="(image, index) in vehicle.media"
                      :key="index"
                      class="col-4"
                    >
                      <div
                        class="image-thumbnail"
                        :class="{ selected: selectedImages.includes(index) }"
                        @click="toggleImage(index)"
                      >
                        <img
                          :src="image.full_path"
                          :alt="`Imagen ${index + 1}`"
                          style="width: 100%; height: 100%; object-fit: cover"
                        />
                        <div class="image-overlay">
                          <i class="bi bi-check-circle"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Acciones de imágenes -->
                <div class="d-grid gap-2">
                  <button
                    @click="selectAllImages"
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-check-all me-1"></i>
                    Seleccionar todas
                  </button>
                  <button
                    @click="deselectAllImages"
                    class="btn btn-sm btn-outline-secondary"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    Deseleccionar todas
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2: Información -->
          <div class="col-lg-6">
            <!-- Información del Vehículo -->
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-car-front me-2"></i>
                  Información del Vehículo
                </h6>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-6">
                    <small class="text-muted">Marca</small>
                    <p class="mb-0 fw-bold">{{ vehicle.brand }}</p>
                  </div>
                  <div class="col-6">
                    <small class="text-muted">Modelo</small>
                    <p class="mb-0 fw-bold">{{ vehicle.model }}</p>
                  </div>
                  <div class="col-6">
                    <small class="text-muted">Año</small>
                    <p class="mb-0 fw-bold">{{ vehicle.year }}</p>
                  </div>
                  <div class="col-6">
                    <small class="text-muted">Combustible</small>
                    <p class="mb-0 fw-bold">{{ vehicle.fuel }}</p>
                  </div>
                  <div class="col-6">
                    <small class="text-muted">Color</small>
                    <p class="mb-0 fw-bold">{{ vehicle.color }}</p>
                  </div>
                  <div class="col-6">
                    <small class="text-muted">Km</small>
                    <p class="mb-0 fw-bold">{{ vehicle.mileage ? `${vehicle.mileage} km` : "N/D" }}</p>
                  </div>
                </div>

                <hr />

                <!-- Checkboxes de información a incluir -->
                <small class="text-muted d-block mb-2">Incluir en el PDF:</small>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="selectedInfo"
                    value="marca_modelo"
                    :id="vehicle.id + '-marca'"
                  />
                  <label class="form-check-label" :for="vehicle.id + '-marca'">
                    Marca y Modelo
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="selectedInfo"
                    value="especificaciones"
                    :id="vehicle.id + '-esp'"
                  />
                  <label class="form-check-label" :for="vehicle.id + '-esp'">
                    Especificaciones (Año, Km, Combustible, Color)
                  </label>
                </div>
              </div>
            </div>

            <!-- Información Financiera -->
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-currency-dollar me-2"></i>
                  Información Financiera
                </h6>
              </div>
              <div class="card-body">
                <div v-if="loading" class="text-center">
                  <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </div>

                <div v-else>
                  <!-- Precio -->
                  <div class="mb-3">
                    <small class="text-muted">Precio del Vehículo</small>
                    <h6 class="text-success fw-bold">
                      ${{ vehicleDetails?.financialInfo?.price?.toLocaleString() || "Consultando..." }}
                    </h6>
                  </div>

                  <!-- Mensualidad -->
                  <div class="mb-3">
                    <small class="text-muted">Mensualidad Estimada</small>
                    <h6 class="fw-bold">
                      ${{ vehicleDetails?.financialInfo?.monthlyPayment?.toLocaleString() || "Consultando..." }}
                    </h6>
                  </div>

                  <!-- Apertura -->
                  <div class="mb-3">
                    <small class="text-muted">Apertura / Enganche</small>
                    <h6 class="fw-bold">
                      ${{ vehicleDetails?.financialInfo?.downPayment?.toLocaleString() || "Consultando..." }}
                    </h6>
                  </div>

                  <hr />

                  <!-- Información adicional -->
                  <div v-if="vehicleDetails?.customInfo">
                    <small class="text-muted d-block mb-2">Información Adicional</small>
                    <div v-if="vehicleDetails.customInfo.warranty" class="small mb-2">
                      <i class="bi bi-shield-check me-1 text-info"></i>
                      {{ vehicleDetails.customInfo.warranty }}
                    </div>
                    <div v-if="vehicleDetails.customInfo.condition" class="small mb-2">
                      <i class="bi bi-star me-1 text-warning"></i>
                      {{ vehicleDetails.customInfo.condition }}
                    </div>
                    <div v-if="vehicleDetails.customInfo.features" class="small">
                      <i class="bi bi-gear me-1 text-secondary"></i>
                      {{ vehicleDetails.customInfo.features }}
                    </div>
                  </div>

                  <!-- Checkboxes de información financiera -->
                  <hr />
                  <small class="text-muted d-block mb-2">Incluir en el PDF:</small>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="selectedInfo"
                      value="precio"
                      :id="vehicle.id + '-precio'"
                    />
                    <label class="form-check-label" :for="vehicle.id + '-precio'">
                      Precio
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="selectedInfo"
                      value="mensualidad"
                      :id="vehicle.id + '-mes'"
                    />
                    <label class="form-check-label" :for="vehicle.id + '-mes'">
                      Mensualidad Estimada
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="selectedInfo"
                      value="apertura"
                      :id="vehicle.id + '-aper'"
                    />
                    <label class="form-check-label" :for="vehicle.id + '-aper'">
                      Apertura / Enganche
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="selectedInfo"
                      value="detalles_adicionales"
                      :id="vehicle.id + '-det'"
                    />
                    <label class="form-check-label" :for="vehicle.id + '-det'">
                      Detalles Adicionales
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con botones de acción -->
      <div class="modal-footer-custom">
        <button @click="closeModal" class="btn btn-secondary">
          <i class="bi bi-x me-2"></i>
          Cerrar
        </button>

        <div class="btn-group" role="group">
          <button
            @click="shareViaWhatsApp"
            :disabled="loading || selectedImages.length === 0"
            class="btn btn-success"
            title="Compartir por WhatsApp"
          >
            <i class="bi bi-whatsapp me-2"></i>
            WhatsApp
          </button>

          <button
            @click="shareViaEmail"
            :disabled="loading || selectedImages.length === 0"
            class="btn btn-info"
            title="Compartir por Email"
          >
            <i class="bi bi-envelope me-2"></i>
            Email
          </button>

          <button
            @click="downloadPDF"
            :disabled="loading || selectedImages.length === 0"
            class="btn btn-primary"
            title="Descargar PDF"
          >
            <i v-if="loading" class="bi bi-hourglass-split me-2"></i>
            <i v-else class="bi bi-download me-2"></i>
            {{ loading ? "Generando..." : "Descargar PDF" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

// Props
const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
  vehicleDetails: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(["close", "share"])

// State
const selectedImages = ref([])
const selectedInfo = ref([
  "marca_modelo",
  "especificaciones",
  "precio",
  "mensualidad",
  "apertura",
])

// Computed
const mainImage = computed(() => {
  if (selectedImages.value.length > 0) {
    const firstSelected = selectedImages.value[0]
    return props.vehicle.media?.[firstSelected]?.full_path || props.vehicle.media?.[0]?.full_path
  }
  return props.vehicle.media?.[0]?.full_path
})

// Methods
function toggleImage(index) {
  const idx = selectedImages.value.indexOf(index)
  if (idx > -1) {
    selectedImages.value.splice(idx, 1)
  } else {
    selectedImages.value.push(index)
  }
}

function selectAllImages() {
  selectedImages.value = Array.from(
    { length: props.vehicle.media?.length || 0 },
    (_, i) => i
  )
}

function deselectAllImages() {
  selectedImages.value = []
}

function closeModal() {
  emit("close")
}

function shareViaWhatsApp() {
  emit("share", {
    method: "whatsapp",
    selectedImages: selectedImages.value,
    selectedInfo: selectedInfo.value,
  })
}

function shareViaEmail() {
  emit("share", {
    method: "email",
    selectedImages: selectedImages.value,
    selectedInfo: selectedInfo.value,
  })
}

function downloadPDF() {
  emit("share", {
    method: "download",
    selectedImages: selectedImages.value,
    selectedInfo: selectedInfo.value,
  })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content-custom {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  width: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.modal-body-custom {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.image-thumbnail {
  position: relative;
  cursor: pointer;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-thumbnail:hover {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.image-thumbnail.selected {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(25, 135, 84, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-thumbnail.selected .image-overlay {
  opacity: 1;
}

.image-overlay i {
  color: white;
  font-size: 1.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
}

.btn-close:hover {
  color: #000;
}

@media (max-width: 768px) {
  .modal-content-custom {
    width: 95%;
    max-height: 95vh;
  }

  .modal-footer-custom {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}
</style>
