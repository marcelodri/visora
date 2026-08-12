<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h2>
            <i class="bi bi-car-front me-2"></i>
            Catálogo de Vehículos - Compartir por WhatsApp
          </h2>
          <button
            @click="getStock"
            class="btn btn-primary d-flex align-items-center py-2 px-4"
            :disabled="loading"
          >
            <i v-if="loading" class="bi bi-download me-2"></i>
            <span v-if="loading">Cargando...</span>
            <template v-else>
              <i class="bi bi-plus me-2"></i>
              Importar Stock
            </template>
          </button>
        </div>

        <hr />

        <!-- Búsqueda y Filtros -->
        <div v-if="stock.length" class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <!-- Búsqueda -->
              <div class="col-12 col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Buscar vehículo..."
                    v-model="searchQuery"
                  >
                  <button 
                    v-if="searchQuery" 
                    @click="searchQuery = ''"
                    class="btn btn-outline-secondary"
                    type="button"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>

              <!-- Filtros dinámicos -->
              <div class="col-12">
                <div class="row g-2">
                  <div 
                    v-for="(options, filterKey) in dynamicFilters" 
                    :key="filterKey"
                    class="col-12 col-sm-6 col-md-4 col-lg-3"
                  >
                    <select 
                      v-model="activeFilters[filterKey]"
                      class="form-select form-select-sm"
                    >
                      <option value="">{{ formatFilterLabel(filterKey) }}</option>
                      <option 
                        v-for="option in options"
                        :key="option"
                        :value="option"
                      >
                        {{ option || 'N/D' }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen -->
            <small class="text-muted d-block mt-3">
              <i class="bi bi-info-circle me-1"></i>
              Mostrando {{ filteredStock.length }} de {{ stock.length }} vehículos
            </small>
          </div>
        </div>

        <!-- Grid de vehículos -->
        <div v-if="stock.length" class="row g-4">
          <div 
            v-for="vehicle in filteredStock"
            :key="vehicle.id"
            class="col-xl-4 col-lg-6 col-md-12"
          >
            <div class="card h-100 shadow-sm vehicle-card">
              <!-- Imagen -->
              <div class="vehicle-image-container position-relative">
                <img 
                  :src="vehicle.media?.[0]?.full_path || noImage"
                  :alt="`${vehicle.brand} ${vehicle.model}`"
                  class="card-img-top"
                  style="object-fit: cover; height: 220px; cursor: pointer;"
                  @click="openVehicleModal(vehicle)"
                >
                <div class="badge bg-primary position-absolute top-0 end-0 m-2">
                  {{ vehicle.media?.length || 0 }} fotos
                </div>
              </div>

              <!-- Contenido -->
              <div class="card-body">
                <!-- Marca y Modelo -->
                <h5 class="card-title mb-2">
                  {{ vehicle.brand }} {{ vehicle.model }}
                </h5>
                
                <!-- Versión -->
                <p class="text-muted small mb-2">
                  {{ vehicle.version || 'N/D' }}
                </p>

                <!-- Info básica -->
                <div class="small mb-3">
                  <div class="mb-1">
                    <i class="bi bi-palette text-secondary me-1"></i>
                    <strong>Color:</strong> {{ vehicle.color || 'N/D' }}
                  </div>
                  <div class="mb-1">
                    <i class="bi bi-fuel-pump text-secondary me-1"></i>
                    <strong>Combustible:</strong> {{ vehicle.fuel || 'N/D' }}
                  </div>
                  <div class="mb-1">
                    <i class="bi bi-calendar text-secondary me-1"></i>
                    <strong>Año:</strong> {{ vehicle.year || 'N/D' }}
                  </div>
                  <div class="mb-1">
                    <i class="bi bi-speedometer text-secondary me-1"></i>
                    <strong>Km:</strong> {{ vehicle.mileage ? vehicle.mileage.toLocaleString() : 'N/D' }}
                  </div>
                </div>

                <!-- Precio -->
                <div class="alert alert-info py-2 px-3 mb-3">
                  <strong class="d-block">Precio</strong>
                  <h6 class="mb-0 text-success">
                    {{ getPrice(vehicle.prices, 'SALE_COST') || getPrice(vehicle.prices, 'PURCHASE_COST') || 'Consultar' }}
                  </h6>
                </div>

                <!-- Estado -->
                <div class="mb-3">
                  <span class="badge bg-success">
                    {{ vehicle.availability_status?.name || 'Disponible' }}
                  </span>
                  <span class="badge bg-secondary ms-2">
                    {{ vehicle.location || 'Ubicación N/D' }}
                  </span>
                </div>

                <!-- Botón de compartir -->
                <button 
                  @click="openVehicleModal(vehicle)"
                  class="btn btn-primary w-100"
                >
                  <i class="bi bi-share me-2"></i>
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-if="!loading && !stock.length" class="text-center py-5">
          <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-3">No hay vehículos. Importa stock para comenzar.</p>
        </div>

        <!-- MODAL DE COMPARTIR VEHÍCULO -->
        <div 
          v-if="selectedVehicle" 
          class="modal d-block" 
          style="background: rgba(0,0,0,0.5);"
        >
          <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
              <!-- Header -->
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ selectedVehicle.brand }} {{ selectedVehicle.model }}
                </h5>
                <button 
                  @click="selectedVehicle = null"
                  type="button" 
                  class="btn-close"
                ></button>
              </div>

              <!-- Body -->
              <div class="modal-body">
                <!-- Tabs -->
                <ul class="nav nav-tabs mb-4" role="tablist">
                  <li class="nav-item">
                    <a 
                      @click="activeTab = 'images'"
                      :class="['nav-link', { active: activeTab === 'images' }]"
                      href="#"
                      role="tab"
                    >
                      <i class="bi bi-images me-2"></i>Imágenes
                    </a>
                  </li>
                  <li class="nav-item">
                    <a 
                      @click="activeTab = 'details'"
                      :class="['nav-link', { active: activeTab === 'details' }]"
                      href="#"
                      role="tab"
                    >
                      <i class="bi bi-info-circle me-2"></i>Detalles
                    </a>
                  </li>
                  <li class="nav-item">
                    <a 
                      @click="activeTab = 'financial'"
                      :class="['nav-link', { active: activeTab === 'financial' }]"
                      href="#"
                      role="tab"
                    >
                      <i class="bi bi-cash-coin me-2"></i>Financiero
                    </a>
                  </li>
                  <li class="nav-item">
                    <a 
                      @click="activeTab = 'pdf'"
                      :class="['nav-link', { active: activeTab === 'pdf' }]"
                      href="#"
                      role="tab"
                    >
                      <i class="bi bi-file-pdf me-2"></i>PDF
                    </a>
                  </li>
                </ul>

                <!-- TAB: IMÁGENES -->
                <div v-if="activeTab === 'images'" class="tab-content">
                  <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6>Seleccionar imágenes</h6>
                      <small class="text-muted">
                        {{ selectedImages.length }} de {{ selectedVehicle.media?.length || 0 }} seleccionadas
                      </small>
                    </div>

                    <!-- Botones rápidos -->
                    <div class="btn-group btn-group-sm mb-3" role="group">
                      <button 
                        @click="selectedImages = selectedVehicle.media?.map(m => m.id) || []"
                        type="button"
                        class="btn btn-outline-secondary"
                      >
                        Seleccionar todas
                      </button>
                      <button 
                        @click="selectedImages = []"
                        type="button"
                        class="btn btn-outline-secondary"
                      >
                        Deseleccionar
                      </button>
                    </div>

                    <!-- Grid de imágenes -->
                    <div class="row g-2">
                      <div 
                        v-for="image in selectedVehicle.media"
                        :key="image.id"
                        class="col-6 col-md-4"
                      >
                        <div 
                          @click="toggleImage(image.id)"
                          :class="['image-selector', { selected: selectedImages.includes(image.id) }]"
                        >
                          <img 
                            :src="image.full_path"
                            :alt="`Foto ${image.id}`"
                            style="width: 100%; height: 120px; object-fit: cover; border-radius: 0.5rem;"
                          >
                          <div class="check-overlay">
                            <i class="bi bi-check-circle-fill"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB: DETALLES -->
                <div v-if="activeTab === 'details'" class="tab-content">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Marca</small>
                      <p class="fw-bold">{{ selectedVehicle.brand }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Modelo</small>
                      <p class="fw-bold">{{ selectedVehicle.model }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Versión</small>
                      <p class="fw-bold">{{ selectedVehicle.version || 'N/D' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Año</small>
                      <p class="fw-bold">{{ selectedVehicle.year || 'N/D' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Color</small>
                      <p class="fw-bold">{{ selectedVehicle.color || 'N/D' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Combustible</small>
                      <p class="fw-bold">{{ selectedVehicle.fuel || 'N/D' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Kilometraje</small>
                      <p class="fw-bold">{{ selectedVehicle.mileage ? selectedVehicle.mileage.toLocaleString() : 'N/D' }} km</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Ubicación</small>
                      <p class="fw-bold">{{ selectedVehicle.location || 'N/D' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Estado</small>
                      <p class="fw-bold">{{ selectedVehicle.availability_status?.name || 'Disponible' }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <small class="text-muted">Precio</small>
                      <p class="fw-bold text-success">
                        {{ getPrice(selectedVehicle.prices, 'SALE_COST') || getPrice(selectedVehicle.prices, 'PURCHASE_COST') || 'Consultar' }}
                      </p>
                    </div>
                  </div>

                  <!-- Checkboxes para incluir en PDF -->
                  <hr class="my-4">
                  <h6 class="mb-3">Incluir en el PDF</h6>
                  <div class="row">
                    <div class="col-6" v-for="field in detailFields" :key="field.key">
                      <div class="form-check">
                        <input 
                          type="checkbox"
                          class="form-check-input"
                          :id="`field-${field.key}`"
                          v-model="selectedFields"
                          :value="field.key"
                        >
                        <label class="form-check-label" :for="`field-${field.key}`">
                          {{ field.label }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB: INFORMACIÓN FINANCIERA -->
                <div v-if="activeTab === 'financial'" class="tab-content">
                  <div v-if="loadingFinancial" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>

                  <div v-else-if="financialInfo">
                    <div class="row mb-4">
                      <div class="col-md-6 mb-3">
                        <div class="card">
                          <div class="card-body">
                            <small class="text-muted d-block mb-1">Precio</small>
                            <h5 class="text-success mb-0">{{ financialInfo.price }}</h5>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <div class="card">
                          <div class="card-body">
                            <small class="text-muted d-block mb-1">Mensualidad</small>
                            <h5 class="text-primary mb-0">{{ financialInfo.monthlyPayment }}</h5>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <div class="card">
                          <div class="card-body">
                            <small class="text-muted d-block mb-1">Enganche/Apertura</small>
                            <h5 class="text-warning mb-0">{{ financialInfo.downPayment }}</h5>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <div class="card">
                          <div class="card-body">
                            <small class="text-muted d-block mb-1">Plazo</small>
                            <h5 class="text-info mb-0">{{ financialInfo.term }}</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Checkboxes para incluir en PDF -->
                    <hr class="my-4">
                    <h6 class="mb-3">Incluir en el PDF</h6>
                    <div class="row">
                      <div class="col-6" v-for="field in financialFields" :key="field.key">
                        <div class="form-check">
                          <input 
                            type="checkbox"
                            class="form-check-input"
                            :id="`fin-${field.key}`"
                            v-model="selectedFinancialFields"
                            :value="field.key"
                          >
                          <label class="form-check-label" :for="`fin-${field.key}`">
                            {{ field.label }}
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Editor de información financiera -->
                    <hr class="my-4">
                    <h6 class="mb-3">Editar información</h6>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small">Precio</label>
                        <input 
                          type="text"
                          class="form-control"
                          v-model="financialInfo.price"
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small">Mensualidad</label>
                        <input 
                          type="text"
                          class="form-control"
                          v-model="financialInfo.monthlyPayment"
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small">Enganche</label>
                        <input 
                          type="text"
                          class="form-control"
                          v-model="financialInfo.downPayment"
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small">Plazo (meses)</label>
                        <input 
                          type="text"
                          class="form-control"
                          v-model="financialInfo.term"
                        >
                      </div>
                      <div class="col-12">
                        <button 
                          @click="saveFinancialInfo"
                          class="btn btn-sm btn-success w-100"
                        >
                          <i class="bi bi-check-circle me-2"></i>Guardar cambios
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay información financiera disponible.
                  </div>
                </div>

                <!-- TAB: CONFIGURACIÓN PDF -->
                <div v-if="activeTab === 'pdf'" class="tab-content">
                  <div class="mb-3">
                    <h6 class="mb-3">Mensaje personalizado</h6>
                    <textarea 
                      v-model="pdfMessage"
                      class="form-control"
                      rows="4"
                      placeholder="Mensaje personalizado para incluir en el PDF..."
                    ></textarea>
                    <small class="text-muted d-block mt-1">
                      Deja en blanco para usar un mensaje por defecto.
                    </small>
                  </div>

                  <div class="mb-3">
                    <h6 class="mb-3">Incluir logo (opcional)</h6>
                    <input 
                      type="file"
                      class="form-control"
                      accept="image/*"
                      @change="onLogoSelected"
                    >
                  </div>

                  <hr class="my-4">

                  <h6 class="mb-3">Vista previa de contenido</h6>
                  <div class="alert alert-light border">
                    <small>
                      <strong>Imágenes:</strong> {{ selectedImages.length }}<br>
                      <strong>Detalles:</strong> {{ selectedFields.join(', ') || 'Ninguno' }}<br>
                      <strong>Financiero:</strong> {{ selectedFinancialFields.join(', ') || 'Ninguno' }}
                    </small>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="modal-footer">
                <button 
                  @click="selectedVehicle = null"
                  type="button" 
                  class="btn btn-secondary"
                >
                  Cerrar
                </button>
                <button 
                  @click="downloadPDF"
                  :disabled="loadingPDF"
                  type="button" 
                  class="btn btn-outline-primary"
                >
                  <i class="bi bi-download me-2"></i>
                  {{ loadingPDF ? 'Generando...' : 'Descargar PDF' }}
                </button>
                <button 
                  @click="shareViaWhatsApp"
                  :disabled="loadingPDF || selectedImages.length === 0"
                  type="button" 
                  class="btn btn-success"
                >
                  <i class="bi bi-whatsapp me-2"></i>
                  {{ loadingPDF ? 'Generando...' : 'Compartir WhatsApp' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Toast -->
        <ToastComponent 
          :title="toastTitle"
          :message="toastMessage"
          :isSuccess="isSuccess"
          :show.sync="showToast"
          ref="toastComponent"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ToastComponent from '@/components/ToastComponent.vue'
import jsPDF from 'jspdf'
import noImage from '@/assets/images/no-image.png'

// ==================== DATOS PRINCIPALES ====================
const stock = ref([])
const selectedVehicle = ref(null)
const loading = ref(false)
const loadingFinancial = ref(false)
const loadingPDF = ref(false)

// ==================== BÚSQUEDA Y FILTROS ====================
const searchQuery = ref('')
const activeFilters = ref({})
const dynamicFilters = computed(() => {
  const filters = {}
  const fieldsToFilter = ['brand', 'model', 'fuel', 'color', 'year']
  
  fieldsToFilter.forEach(field => {
    const values = [...new Set(stock.value
      .map(v => v[field])
      .filter(v => v)
    )].sort()
    if (values.length > 0) {
      filters[field] = values
    }
  })
  
  return filters
})

// ==================== MODAL Y TABS ====================
const activeTab = ref('images')
const selectedImages = ref([])
const selectedFields = ref(['brand', 'model', 'color', 'year', 'fuel', 'price'])
const selectedFinancialFields = ref(['price', 'monthlyPayment', 'downPayment'])

const detailFields = [
  { key: 'brand', label: 'Marca' },
  { key: 'model', label: 'Modelo' },
  { key: 'version', label: 'Versión' },
  { key: 'year', label: 'Año' },
  { key: 'color', label: 'Color' },
  { key: 'fuel', label: 'Combustible' },
  { key: 'mileage', label: 'Kilometraje' },
  { key: 'price', label: 'Precio' },
  { key: 'location', label: 'Ubicación' }
]

const financialFields = [
  { key: 'price', label: 'Precio' },
  { key: 'monthlyPayment', label: 'Mensualidad' },
  { key: 'downPayment', label: 'Enganche/Apertura' },
  { key: 'term', label: 'Plazo' }
]

// ==================== INFORMACIÓN FINANCIERA ====================
const financialInfo = ref(null)

// ==================== PDF ====================
const pdfMessage = ref('')
const pdfLogo = ref(null)

// ==================== TOAST ====================
const toastTitle = ref('')
const toastMessage = ref('')
const isSuccess = ref(true)
const showToast = ref(false)
const toastComponent = ref(null)

// ==================== API CONFIGURATION ====================
const username = "m.dri@madcoder.io"
const password = "Marcedri1452/"
const API_URL = "https://api.pilotsolution.net/v1"

// ==================== MOCK DATA PARA INFORMACIÓN FINANCIERA ====================
const mockFinancialDatabase = {
  1: {
    vehicleId: 1,
    price: '$100,000',
    monthlyPayment: '$2,000',
    downPayment: '$7,800',
    term: '60 meses'
  },
  2: {
    vehicleId: 2,
    price: '$85,000',
    monthlyPayment: '$1,700',
    downPayment: '$6,375',
    term: '48 meses'
  }
}

// ==================== COMPUTEDS ====================
const filteredStock = computed(() => {
  let filtered = stock.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(v => {
      const searchText = [v.brand, v.model, v.version, v.color, v.location]
        .join(' ')
        .toLowerCase()
      return searchText.includes(query)
    })
  }

  Object.entries(activeFilters.value).forEach(([key, value]) => {
    if (value) {
      filtered = filtered.filter(v => v[key] === value)
    }
  })

  return filtered
})

// ==================== MÉTODOS - UTILIDADES ====================
function formatFilterLabel(key) {
  const labels = {
    brand: 'Marca',
    model: 'Modelo',
    fuel: 'Combustible',
    color: 'Color',
    year: 'Año'
  }
  return labels[key] || key
}

function getPrice(prices, type) {
  const price = prices?.find(p => p.type === type)
  return price?.value ? `$${price.value.toLocaleString()}` : null
}

function showToastMsg(title, message, success = true) {
  toastTitle.value = title
  toastMessage.value = message
  isSuccess.value = success
  showToast.value = true
  if (toastComponent.value?.showToas) {
    toastComponent.value.showToas()
  }
}

// ==================== MÉTODOS - IMÁGENES ====================
function toggleImage(imageId) {
  const index = selectedImages.value.indexOf(imageId)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(imageId)
  }
}

function onLogoSelected(event) {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      pdfLogo.value = e.target?.result
    }
    reader.readAsDataURL(file)
  }
}

// ==================== MÉTODOS - MODAL ====================
async function openVehicleModal(vehicle) {
  selectedVehicle.value = vehicle
  activeTab.value = 'images'
  
  selectedImages.value = vehicle.media?.slice(0, 2).map(m => m.id) || []
  selectedFields.value = ['brand', 'model', 'color', 'year', 'fuel', 'price']
  selectedFinancialFields.value = ['price', 'monthlyPayment', 'downPayment']
  pdfMessage.value = ''
  pdfLogo.value = null
  
  await fetchFinancialInfo(vehicle.id)
}

// ==================== MÉTODOS - API ====================
async function getIdentityToken() {
  try {
    const res = await fetch(
      `${API_URL}/users/authentication.php?username=${username}&password=${password}`
    )
    if (!res.ok) throw new Error("Error al obtener identity_token")
    const data = await res.json()
    return data.result.entitydata.accounts[1].token
  } catch (err) {
    console.error('Error en getIdentityToken:', err)
    throw err
  }
}

async function getAccessToken(identityToken) {
  try {
    const res = await fetch(
      `${API_URL}/users/authorization.php?identity_token=${identityToken}`
    )
    if (!res.ok) throw new Error("Error al obtener access_token")
    const data = await res.json()
    return data.result.entitydata.session.identityToken
  } catch (err) {
    console.error('Error en getAccessToken:', err)
    throw err
  }
}

async function getStock() {
  loading.value = true
  stock.value = []
  
  try {
    const identityToken = await getIdentityToken()
    const accessToken = await getAccessToken(identityToken)

    const body = {
      data: {
        filters: [
          { field: "availability_status_code", operation: "=", value: "1" }
        ],
        sort: [{ field: "updated", order: "DESC" }],
        show_media: true,
        limit: 50,
        page: 1
      },
      header: {
        FlowName: "stock_list",
        SequenceId: 2,
        TimeStamp: Date.now(),
        TrackingId: crypto.randomUUID(),
        access_token: accessToken
      }
    }

    const res = await fetch(`${API_URL}/stock/list.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error("Error al obtener stock")
    const data = await res.json()

    stock.value = data?.result.entitydata ?? []
    showToastMsg("Éxito", `Se cargaron ${stock.value.length} vehículos`)
  } catch (err) {
    console.error('Error en getStock:', err)
    showToastMsg("Error", err.message, false)
  } finally {
    loading.value = false
  }
}

// ==================== MÉTODOS - INFORMACIÓN FINANCIERA ====================
async function fetchFinancialInfo(vehicleId) {
  loadingFinancial.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    if (mockFinancialDatabase[vehicleId]) {
      financialInfo.value = { ...mockFinancialDatabase[vehicleId] }
    } else {
      const defaultPrice = getPrice(selectedVehicle.value.prices, 'SALE_COST') 
        || getPrice(selectedVehicle.value.prices, 'PURCHASE_COST') 
        || 'Consultar'
      
      financialInfo.value = {
        vehicleId: vehicleId,
        price: defaultPrice,
        monthlyPayment: 'Consultar',
        downPayment: 'Consultar',
        term: '60 meses'
      }
    }
  } catch (err) {
    console.warn('Error cargando financiera:', err)
    financialInfo.value = {
      vehicleId: vehicleId,
      price: getPrice(selectedVehicle.value.prices, 'SALE_COST') || 'Consultar',
      monthlyPayment: 'Consultar',
      downPayment: 'Consultar',
      term: '60 meses'
    }
  } finally {
    loadingFinancial.value = false
  }
}

async function saveFinancialInfo() {
  try {
    mockFinancialDatabase[selectedVehicle.value.id] = {
      vehicleId: selectedVehicle.value.id,
      ...financialInfo.value
    }

    await new Promise(resolve => setTimeout(resolve, 300))

    showToastMsg("Éxito", "Información financiera guardada correctamente")
  } catch (err) {
    console.error('Error al guardar:', err)
    showToastMsg("Error", "No se pudo guardar la información", false)
  }
}

// ==================== MÉTODOS - PDF ====================
async function downloadPDF() {
  if (!selectedVehicle.value) return
  
  loadingPDF.value = true
  
  try {
    const doc = new jsPDF()
    const vehicle = selectedVehicle.value
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 15

    const marginLeft = 15
    const marginRight = 15
    const contentWidth = pageWidth - marginLeft - marginRight

    if (pdfLogo.value) {
      doc.addImage(pdfLogo.value, 'JPEG', marginLeft, yPosition, 30, 20)
    }
    
    doc.setFontSize(20)
    doc.text(
      `${vehicle.brand} ${vehicle.model}`,
      marginLeft + (pdfLogo.value ? 35 : 0),
      yPosition + 7
    )
    
    yPosition += pdfLogo.value ? 25 : 15

    if (selectedImages.value.length > 0) {
      doc.setFontSize(12)
      doc.text('Fotografías del Vehículo', marginLeft, yPosition)
      yPosition += 8

      const imagesToShow = vehicle.media
        ?.filter(m => selectedImages.value.includes(m.id))
        .slice(0, 6)

      for (let i = 0; i < imagesToShow.length; i++) {
        const image = imagesToShow[i]
        const imgWidth = (contentWidth - 5) / 2
        const imgHeight = 50

        const colIndex = i % 2
        const rowIndex = Math.floor(i / 2)

        const xPos = marginLeft + colIndex * (imgWidth + 5)
        const yPos = yPosition + rowIndex * (imgHeight + 5)

        if (yPos + imgHeight > pageHeight - 20) {
          doc.addPage()
          yPosition = 15
        }

        doc.addImage(image.full_path, 'JPEG', xPos, yPos, imgWidth, imgHeight)
      }

      yPosition += Math.ceil(imagesToShow.length / 2) * (50 + 5) + 10
    }

    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = 15
    }

    if (selectedFields.value.length > 0) {
      doc.setFontSize(12)
      doc.text('Detalles del Vehículo', marginLeft, yPosition)
      yPosition += 8

      const fieldLabels = {
        brand: 'Marca',
        model: 'Modelo',
        version: 'Versión',
        year: 'Año',
        color: 'Color',
        fuel: 'Combustible',
        mileage: 'Kilometraje',
        price: 'Precio',
        location: 'Ubicación'
      }

      doc.setFontSize(10)
      selectedFields.value.forEach(field => {
        let value = vehicle[field]
        
        if (field === 'price') {
          value = getPrice(vehicle.prices, 'SALE_COST') || getPrice(vehicle.prices, 'PURCHASE_COST') || 'N/D'
        } else if (field === 'mileage') {
          value = vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/D'
        }

        const label = fieldLabels[field] || field
        doc.text(`${label}: ${value || 'N/D'}`, marginLeft, yPosition)
        yPosition += 6

        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 15
        }
      })

      yPosition += 5
    }

    if (selectedFinancialFields.value.length > 0 && financialInfo.value) {
      doc.setFontSize(12)
      doc.text('Información Financiera', marginLeft, yPosition)
      yPosition += 8

      const financeLabels = {
        price: 'Precio',
        monthlyPayment: 'Mensualidad',
        downPayment: 'Enganche/Apertura',
        term: 'Plazo'
      }

      doc.setFontSize(10)
      selectedFinancialFields.value.forEach(field => {
        const value = financialInfo.value[field] || 'N/D'
        const label = financeLabels[field] || field
        doc.text(`${label}: ${value}`, marginLeft, yPosition)
        yPosition += 6

        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 15
        }
      })

      yPosition += 5
    }

    if (pdfMessage.value) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 15
      }

      doc.setFontSize(10)
      doc.setTextColor(100)
      
      const splitText = doc.splitTextToSize(pdfMessage.value, contentWidth)
      doc.text(splitText, marginLeft, yPosition)
    }

    doc.save(`${vehicle.brand}_${vehicle.model}_${Date.now()}.pdf`)
    showToastMsg("Éxito", "PDF descargado correctamente")
  } catch (err) {
    console.error('Error al generar PDF:', err)
    showToastMsg("Error", "No se pudo generar el PDF", false)
  } finally {
    loadingPDF.value = false
  }
}

async function shareViaWhatsApp() {
  if (!selectedVehicle.value || selectedImages.value.length === 0) {
    showToastMsg("Error", "Selecciona al menos una imagen", false)
    return
  }

  loadingPDF.value = true

  try {
    const doc = new jsPDF()
    const vehicle = selectedVehicle.value
    let yPosition = 15

    doc.setFontSize(16)
    doc.text(`${vehicle.brand} ${vehicle.model}`, 15, yPosition)
    yPosition += 15

    const imagesToShow = vehicle.media
      ?.filter(m => selectedImages.value.includes(m.id))
      .slice(0, 3)

    for (let i = 0; i < imagesToShow.length; i++) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 15
      }
      doc.addImage(imagesToShow[i].full_path, 'JPEG', 15, yPosition, 180, 60)
      yPosition += 65
    }

    if (selectedFields.value.length > 0) {
      yPosition += 5
      doc.setFontSize(12)
      doc.text('Detalles', 15, yPosition)
      yPosition += 8

      selectedFields.value.slice(0, 5).forEach(field => {
        let value = vehicle[field]
        if (field === 'price') {
          value = getPrice(vehicle.prices, 'SALE_COST') || 'Consultar'
        }
        doc.setFontSize(9)
        doc.text(`${field}: ${value}`, 15, yPosition)
        yPosition += 5
      })
    }

    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    const mensaje = `Te envío la información de este vehículo: ${vehicle.brand} ${vehicle.model}`
    const mensajeEncoded = encodeURIComponent(mensaje)

    const whatsappUrl = `https://wa.me/?text=${mensajeEncoded}`
    
    window.open(whatsappUrl, '_blank')

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${vehicle.brand}_${vehicle.model}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToastMsg("Éxito", "Se abrió WhatsApp y se descargó el PDF. Comparte el archivo en el chat.")
  } catch (err) {
    console.error('Error al compartir:', err)
    showToastMsg("Error", "No se pudo generar el compartible", false)
  } finally {
    loadingPDF.value = false
  }
}
</script>

<style scoped>
.vehicle-card {
  transition: all 0.3s ease;
}

.vehicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.vehicle-image-container {
  overflow: hidden;
}

.image-selector {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.image-selector:hover {
  border-color: #0d6efd;
}

.image-selector.selected {
  border-color: #198754;
}

.image-selector .check-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 1.5rem;
}

.image-selector.selected .check-overlay {
  opacity: 1;
  background: rgba(25, 135, 84, 0.5);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 3rem;
}

.nav-link {
  cursor: pointer;
  color: #6c757d;
}

.nav-link:hover {
  color: #0d6efd;
}

.nav-link.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd !important;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
