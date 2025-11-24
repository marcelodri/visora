<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-12">
        <h2>Programador de Publicaciones 
          <img 
            src="@/assets/images/logo-pilot-solution-3.svg" 
            alt="Pilot" 
            class="ms-2" 
            style="height: 30px;"
          /></h2>
        <hr><br>

        <div class="container-fluid">
          <div class="row">
            <div class="col-12 col-md-9 px-0">
              <!-- Buscador -->
              <div v-if="stock.length" class="row mb-4">
                <div class="col-12 col-md-8">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Buscar por marca, modelo, color, ubicación..."
                      v-model="searchQuery"
                    >
                    <button 
                      class="btn"
                      type="button"
                      @click="clearSearch"
                      v-if="searchQuery"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <small class="text-muted d-block mt-1">
                    Mostrando {{ filteredStock.length }} de {{ stock.length }} vehículos
                  </small>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-3 mb-5 px-0">
              <!-- Botones principales -->
              <button
                @click="getStock"
                class="btn d-flex align-items-center float-end py-2 px-4"
                :disabled="loading"
              >
                <i v-if="loading" class="bi bi-download me-2"></i>
                <span v-if="loading">Cargando...</span>
                
                <template v-else>
                  Importar desde 
                  <img 
                    src="@/assets/images/logo-pilot-solution-3.svg" 
                    alt="Pilot" 
                    class="ms-2 pilot-button" 
                    style="height: 20px;"
                  />
                </template>
              </button>

            </div>
          </div>
        </div>

        <br>

        <!-- Stock Grid -->
        <div v-if="stock.length" class="row">
          <hr>
          <div class="col-12 mt-4">
            <h5 class="mb-4">
              <i class="bi bi-car-front me-2"></i>
              Vehículos en Stock ({{ filteredStock.length }}{{ searchQuery ? ` de ${stock.length}` : '' }})
            </h5>

            <br>

            <transition-group
              name="fade-card"
              tag="div"
              class="row g-4"
            >
              <div class="row g-4">
                <div
                  v-for="auto in filteredStock"
                  :key="auto.id"
                  class="col-xl-6 col-lg-12"
                >
                  <div 
                    class="card h-100 shadow mb-6"
                    :class="getScheduleCardClass(auto.id)"
                  >
                    <!-- Header del vehículo -->
                    <div class="card-header" :class="getScheduleHeaderClass(auto.id)">
                      <div class="row align-items-center">
                        <div class="col">
                          <h6 class="mb-0">
                            <i class="fas fa-car me-2"></i>
                            {{ auto.brand }} {{ auto.model }} - {{ auto.version }}
                          </h6>
                        </div>
                        <div class="col-auto">
                          <span 
                            class="badge"
                            :class="getScheduleBadgeClass(auto.id)"
                          >
                            {{ getScheduleStatusText(auto.id) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Info del vehículo -->
                    <img 
                        :src="auto.media?.[0]?.full_path || noImage" 
                        alt="Imagen del vehículo"
                        class="card-img-top"
                        style="object-fit: cover; max-height: 220px;"
                      />

                    <div class="card-body">
                      <div class="row mb-3">
                        <div class="col-md-6">
                          <div class="mb-2">
                            <i class="bi bi-palette me-2 text-muted"></i>
                            <strong>Color:</strong> {{ auto.color }}
                          </div>
                          <div class="mb-2">
                            <i class="bi bi-geo-alt me-2 text-muted"></i>
                            <strong>Ubicación:</strong> {{ auto.location }}
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-2">
                            <i class="bi bi-info-circle me-2 text-muted"></i>
                            <strong>Estado:</strong> {{ auto.availability_status?.name }}
                          </div>
                          <div class="mb-2">
                            <i class="bi bi-currency-dollar me-2"></i>
                            <strong>Precio: </strong> 
                            <span class="text-success fw-bold">
                              {{
                                getPrice(auto.prices, "SALE_COST") ??
                                getPrice(auto.prices, "PURCHASE_COST") ??
                                "N/D"
                              }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr>

                      <!-- Programador de publicación MEJORADO -->
                      <div>
                        <h6 class="mb-3">
                          <i class="bi bi-calendar-check me-2"></i>
                          Programar Publicación
                        </h6>
                        
                        <!-- Switch principal -->
                        <div class="form-check form-switch mb-3">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :id="'switch-' + auto.id"
                            v-model="scheduledPublications[auto.id].enabled"
                            @change="updateScheduleStatus(auto.id)"
                          >
                          <label class="form-check-label" :for="'switch-' + auto.id">
                            <strong>Habilitar programación</strong>
                          </label>
                        </div>

                        <!-- Configuración completa de programación -->
                        <div v-if="scheduledPublications[auto.id].enabled">
                          
                          <!-- Campos para el mensaje -->
                          <div class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-card-checklist me-1"></i>
                              Campos a incluir en el mensaje
                            </label>
                            <div class="row">
                              <div class="col-6" v-for="field in messageFields" :key="field.key">
                                <div class="form-check">
                                  <!-- NOTE: usamos :checked + @change en lugar de v-model para evitar que se compartan arrays -->
                                  <input
                                    class="form-check-input"
                                    type="checkbox"
                                    :value="field.key"
                                    :checked="(selectedFieldsByAuto[auto.id] || []).includes(field.key)"
                                    @change="onFieldToggle(auto.id, field.key, $event)"
                                    :id="auto.id + '-field-' + field.key"
                                  >
                                  <label class="form-check-label small" :for="auto.id + '-field-' + field.key" style="cursor: pointer;">
                                    {{ field.label }}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Mensaje personalizado -->
                          <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                              <label class="form-label mb-0">
                                <i class="bi bi-chat-text me-1"></i>
                                Mensaje personalizado
                              </label>
                              <div class="btn-group btn-group-sm" role="group">
                                <button 
                                  type="button" 
                                  class="btn btn-outline-secondary"
                                  @click="updateAutoMessage(auto.id)"
                                  title="Regenerar mensaje automático"
                                >
                                  <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                <button 
                                  type="button" 
                                  class="btn btn-outline-secondary"
                                  @click="clearMessage(auto.id)"
                                  title="Limpiar mensaje"
                                >
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                            <textarea 
                              v-model="scheduledPublications[auto.id].message" 
                              class="form-control" 
                              rows="4"
                              placeholder="Escribe tu mensaje personalizado o usa los campos seleccionados arriba para generar uno automático..."
                            ></textarea>
                            <small class="text-muted">
                              💡 Selecciona los campos arriba y presiona el botón de regenerar para crear un mensaje automático. También al marcar un campo se añadirá su valor al textarea.
                            </small>
                          </div>

                          <!-- Frecuencia -->
                          <div class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-arrow-repeat me-1"></i>
                              Frecuencia
                            </label>
                            <select v-model="scheduledPublications[auto.id].frequency" class="form-select">
                              <option value="daily">Todos los días</option>
                              <option value="weekly">Semanal</option>
                              <option value="once">Una vez</option>
                            </select>
                          </div>

                          <!-- Horario -->
                          <div class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-clock me-1"></i>
                              Horario
                            </label>
                            <input
                              type="time"
                              v-model="scheduledPublications[auto.id].time"
                              class="form-control"
                            />
                          </div>

                          <!-- Días de la semana (solo para weekly) -->
                          <div v-if="scheduledPublications[auto.id].frequency === 'weekly'" class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-calendar-week me-1"></i>
                              Días de la semana
                            </label>
                            <div class="row">
                              <div class="col-4" v-for="day in weekDays" :key="day.value">
                                <div class="form-check">
                                  <input
                                    class="form-check-input"
                                    type="checkbox"
                                    :value="day.value"
                                    v-model="scheduledPublications[auto.id].daysOfWeek"
                                    :id="auto.id + '-day-' + day.value"
                                  >
                                  <label class="form-check-label small" :for="auto.id + '-day-' + day.value">
                                    {{ day.label }}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Fecha específica (para 'once') -->
                          <div v-if="scheduledPublications[auto.id].frequency === 'once'" class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-calendar-date me-1"></i>
                              Fecha
                            </label>
                            <input 
                              type="date" 
                              v-model="scheduledPublications[auto.id].date" 
                              class="form-control"
                              :min="today"
                            >
                          </div>

                          <!-- Fecha inicio (daily/weekly) -->
                          <div v-if="scheduledPublications[auto.id].frequency !== 'once'" class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-calendar-plus me-1"></i>
                              Fecha de inicio
                            </label>
                            <input 
                              type="date" 
                              v-model="scheduledPublications[auto.id].startDate" 
                              class="form-control"
                              :min="today"
                            >
                          </div>

                          <!-- Fecha fin (daily/weekly opcional) -->
                          <div v-if="scheduledPublications[auto.id].frequency !== 'once'" class="mb-3">
                            <label class="form-label">
                              <i class="bi bi-calendar-x me-1"></i>
                              Fecha de fin (opcional)
                            </label>
                            <input 
                              type="date" 
                              v-model="scheduledPublications[auto.id].endDate" 
                              class="form-control"
                              :min="scheduledPublications[auto.id].startDate || today"
                            >
                          </div>

                          <!-- Vista previa del cronograma -->
                          <div v-if="isValidSchedule(auto.id)" class="alert alert-info">
                            <small>
                              <i class="bi bi-info-circle me-2"></i>
                              <strong>Programación:</strong> {{ getSchedulePreview(auto.id) }}
                            </small>
                          </div>

                        </div>
                      </div>
                    </div>

                    <!-- Footer con última actualización -->
                    <div class="card-footer text-muted small">
                      <i class="bi bi-arrow-clockwise me-1"></i>
                      Última actualización: {{ new Date(auto.updated.dt).toLocaleDateString('es-AR') }}
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
            
          </div>
        </div>

        <!-- Alertas -->
        <ToastComponent 
          :title="toastTitle" 
          :message="toastMessage" 
          :isSuccess="isSuccess" 
          :show.sync="showToastFlag"
          ref="toastComponent"
        />

        <!-- Botón flotante de guardar -->
        <div 
          v-if="hasValidScheduledItems" 
          class="position-fixed bottom-0 end-0 p-3"
          style="z-index: 1050;"
        >
          <button
            @click="saveAllScheduledPublications"
            :disabled="saving"
            class="btn btn-lg rounded-circle shadow-lg"
            style="width: 60px; height: 60px;"
            data-bs-toggle="tooltip"
            data-bs-placement="left"
            :title="`Guardar ${validScheduledCount} programaciones`"
          >
            <i class="bi" :class="saving ? 'bi-arrow-clockwise' : 'bi-floppy'"></i>
          </button>
        </div>

        <!-- Panel de resumen flotante -->
        <div 
          v-if="hasValidScheduledItems" 
          class="position-fixed bottom-0 start-0 p-3"
          style="z-index: 1040; max-width: 300px;"
        >
          <div class="card shadow">
            <div class="card-body">
              <h6 class="card-title">
                <i class="bi bi-list-check me-2"></i>
                Resumen
              </h6>
              <p class="card-text small mb-1">
                <strong>{{ validScheduledCount }}</strong> vehículos programados
              </p>
              <p class="card-text small mb-0">
                Total de publicaciones: <strong>{{ totalPublicationsCount }}</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <br><br>

    <!-- Loading -->
    <LoadingDots :isLoading="isLoading" />

  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import ToastComponent from '@/components/ToastComponent.vue'
import noImage from '@/assets/images/no-image.png'

const stock = ref([])
const loading = ref(false)
const error = ref(null)
const saving = ref(false)
const scheduledPublications = ref({})
const searchQuery = ref("")
const isLoading = ref(false);

// Nuevo: arrays de campos seleccionados por cada auto (evita compartir referencias)
const selectedFieldsByAuto = ref({})

const username = "m.dri@madcoder.io"
const password = "Pilot1234"
const API_URL = "https://api.pilotsolution.net/v1"

// --- Toast refs ---
const toastTitle = ref("")
const toastMessage = ref("")
const isSuccess = ref(true)
const showToastFlag = ref(false)
const toastComponent = ref(null)

// Días de la semana (usando valores numéricos como en el archivo 1)
const weekDays = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

// Mapeo de nombres de días
const dayNames = {
  0: "Sunday",
  1: "Monday", 
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday"
}

// Computed para fecha actual
const today = computed(() => new Date().toISOString().split('T')[0])

// Campos seleccionables disponibles
const messageFields = [
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modelo" },
  { key: "version", label: "Versión" },
  { key: "accessories", label: "Accesorios" },
  { key: "color", label: "Color" },
  { key: "price", label: "Precio" },
  { key: "location", label: "Ubicación" },
  { key: "year", label: "Año" },
  { key: "mileage", label: "Kilometraje" },
  { key: "fuel", label: "Combustible" },
  { key: "status", label: "Estado" }
]

// Computeds
const hasValidScheduledItems = computed(() => {
  return Object.values(scheduledPublications.value).some(schedule => 
    schedule.enabled && isValidSchedule(schedule.stockId)
  )
})

const validScheduledCount = computed(() => {
  return Object.values(scheduledPublications.value).filter(schedule => 
    schedule.enabled && isValidSchedule(schedule.stockId)
  ).length
})

const totalPublicationsCount = computed(() => {
  return Object.values(scheduledPublications.value)
    .filter(schedule => schedule.enabled && isValidSchedule(schedule.stockId))
    .reduce((total, schedule) => {
      return total + buildScheduleArray(schedule).length
    }, 0)
})

// Stock filtrado
const filteredStock = computed(() => {
  if (!searchQuery.value.trim()) {
    return stock.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return stock.value.filter(auto => {
    const searchableText = [
      auto.brand,
      auto.model,
      auto.version,
      auto.color,
      auto.location,
      auto.availability_status?.name,
      getPrice(auto.prices, "SALE_COST"),
      getPrice(auto.prices, "PURCHASE_COST")
    ].join(' ').toLowerCase()
    
    return searchableText.includes(query)
  })
})

function triggerToast(title, message, success = true) {
  toastTitle.value = title
  toastMessage.value = message
  isSuccess.value = success
  toastComponent.value.showToas && toastComponent.value.showToas()
}

// Helpers para estilos
function getScheduleCardClass(autoId) {
  const schedule = scheduledPublications.value[autoId]
  return (schedule && schedule.enabled && isValidSchedule(autoId)) ? 'border-success' : 'border-light'
}

function getScheduleHeaderClass(autoId) {
  const schedule = scheduledPublications.value[autoId]
  return (schedule && schedule.enabled && isValidSchedule(autoId)) ? 'bg-success text-white' : 'bg-light'
}

function getScheduleBadgeClass(autoId) {
  const schedule = scheduledPublications.value[autoId]
  return (schedule && schedule.enabled && isValidSchedule(autoId)) ? 'bg-light text-dark' : 'bg-secondary'
}

function getScheduleStatusText(autoId) {
  const schedule = scheduledPublications.value[autoId]
  if (!schedule || !schedule.enabled) return 'Sin programar'
  return isValidSchedule(autoId) ? 'Programado' : 'Config. incompleta'
}

// Helpers originales
function getPrice(prices, type) {
  const price = prices?.find((p) => p.type === type)
  return price?.value ? `$${price.value.toLocaleString()}` : null
}

// Inicializa schedule y el array de campos seleccionados para ese auto
function initializeSchedule(autoId) {
  if (!scheduledPublications.value[autoId]) {
    const defaultSelected = ["brand","model","version","price","location"]
    scheduledPublications.value[autoId] = {
      enabled: false,
      message: '',
      selectedFields: defaultSelected.slice(), // mantener por compatibilidad
      frequency: 'weekly',
      time: '12:00',
      daysOfWeek: [],
      date: '',
      startDate: '',
      endDate: '',
      stockId: autoId,
      ref: autoId
    }
    // crear entrada independiente para checkboxes (evita compartir referencias)
    selectedFieldsByAuto.value[autoId] = defaultSelected.slice()

    updateAutoMessage(autoId)
  }
}

function updateScheduleStatus(autoId) {
  if (!scheduledPublications.value[autoId].enabled) {
    // Limpiar configuración cuando se deshabilita
    const schedule = scheduledPublications.value[autoId]
    schedule.message = ''
    schedule.frequency = 'weekly'
    schedule.time = '12:00'
    schedule.daysOfWeek = []
    schedule.date = ''
    schedule.startDate = ''
    schedule.endDate = ''
    schedule.selectedFields = []
    selectedFieldsByAuto.value[autoId] = []
  }
}

// Obtiene el valor del campo para ese auto
function getFieldValue(auto, key) {
  if (!auto) return ''
  switch (key) {
    case 'brand': return auto.brand ?? ''
    case 'model': return auto.model ?? ''
    case 'version': return auto.version ?? ''
    case 'accessories': return (Array.isArray(auto.accessories) ? auto.accessories.join(", ") : auto.accessories) ?? ''
    case 'color': return auto.color ?? ''
    case 'price': return getPrice(auto.prices, "SALE_COST") ?? getPrice(auto.prices, "PURCHASE_COST") ?? ''
    case 'location': return auto.location ?? ''
    case 'year': return auto.year ?? ''
    case 'mileage': return auto.mileage ? `${auto.mileage} km` : ''
    case 'fuel': return auto.fuel ?? ''
    case 'status': return auto.availability_status?.name ?? ''
    default: return auto[key] ?? ''
  }
}

// Al marcar/desmarcar un checkbox: actualizamos array y editamos el textarea
function onFieldToggle(autoId, fieldKey, event) {
  const checked = event.target.checked
  const schedule = scheduledPublications.value[autoId]
  if (!schedule) return

  // asegurar array por auto
  if (!selectedFieldsByAuto.value[autoId]) selectedFieldsByAuto.value[autoId] = []

  const arr = selectedFieldsByAuto.value[autoId]

  const auto = stock.value.find(a => a.id === autoId)
  const label = messageFields.find(m => m.key === fieldKey)?.label ?? fieldKey
  const value = getFieldValue(auto, fieldKey) || "N/D"
  const line = `${label}: ${value}`

  if (checked) {
    // agregar al array si no está
    if (!arr.includes(fieldKey)) arr.push(fieldKey)
    // agregar la línea al textarea si no está
    if (!schedule.message.includes(line)) {
      schedule.message = schedule.message ? schedule.message + "\n" + line : line
    }
  } else {
    // sacar del array
    const idx = arr.indexOf(fieldKey)
    if (idx > -1) arr.splice(idx, 1)
    // eliminar la línea exacta del mensaje (primera ocurrencia)
    const lines = schedule.message.split('\n').map(l => l.trim())
    const filtered = lines.filter(l => l !== line.trim())
    schedule.message = filtered.join('\n')
  }

  // mantener sincronía con scheduledPublications.selectedFields (por compatibilidad)
  schedule.selectedFields = arr.slice()
}

// Generar mensaje por defecto usando los campos seleccionados actuales
function updateAutoMessage(autoId) {
  const schedule = scheduledPublications.value[autoId]
  const auto = stock.value.find(a => a.id === autoId)
  if (!schedule || !auto) return

  const selected = selectedFieldsByAuto.value[autoId] && selectedFieldsByAuto.value[autoId].length
    ? selectedFieldsByAuto.value[autoId]
    : (schedule.selectedFields || [])

  const parts = selected.map(key => {
    const label = messageFields.find(m => m.key === key)?.label ?? key
    const value = getFieldValue(auto, key) || "N/D"
    return `${label}: ${value}`
  })

  // poner encabezado + partes
  schedule.message = `🚗 ${auto.brand || ''} ${auto.model || ''} ${auto.version ? '- ' + auto.version : ''}\n${parts.join('\n')}\n\n¡Consultanos por este vehículo!`
}

// Limpiar mensaje
function clearMessage(autoId) {
  const schedule = scheduledPublications.value[autoId]
  if (schedule) {
    schedule.message = ""
    // opcional: no limpiamos selected fields automáticamente para que el usuario pueda seguir marcando
  }
}

// Validación de programación (igual que archivo 1)
function isValidSchedule(autoId) {
  const schedule = scheduledPublications.value[autoId]
  if (!schedule || !schedule.enabled) return false
  
  if (!schedule.time) return false
  
  if (schedule.frequency === 'once') return !!schedule.date
  if (schedule.frequency === 'weekly') return schedule.daysOfWeek.length > 0 && !!schedule.startDate
  if (schedule.frequency === 'daily') return !!schedule.startDate
  
  return false
}

// Vista previa de programación
function getSchedulePreview(autoId) {
  if (!isValidSchedule(autoId)) return 'Configurar programación'
  
  const s = scheduledPublications.value[autoId]
  if (s.frequency === 'once') return `${s.date} a las ${s.time}`
  if (s.frequency === 'daily') return `Todos los días a las ${s.time} desde ${s.startDate}`
  if (s.frequency === 'weekly') {
    const dayLabels = s.daysOfWeek.map(dayNum => 
      weekDays.find(day => day.value === dayNum)?.label
    ).join(', ')
    return `${dayLabels} a las ${s.time} desde ${s.startDate}`
  }
  return 'Programación configurada'
}

// Construir array de programación (igual que archivo 1)
function buildScheduleArray(schedule) {
  const arr = []

  if (schedule.frequency === "once") {
    arr.push({
      frequency: "once",
      time: schedule.time.replace(":", ""),
      startDate: schedule.date,
      endDate: schedule.date,
      dayOfWeek: getDayName(schedule.date)
    })
  }

  if (schedule.frequency === "daily") {
    Object.keys(dayNames).forEach(key => {
      arr.push({
        frequency: "daily",
        time: schedule.time.replace(":", ""),
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        dayOfWeek: dayNames[key]
      })
    })
  }

  if (schedule.frequency === "weekly") {
    schedule.daysOfWeek.forEach(day => {
      arr.push({
        frequency: "weekly",
        time: schedule.time.replace(":", ""),
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        dayOfWeek: dayNames[day]
      })
    })
  }

  return arr
}

function getDayName(dateStr) {
  const date = new Date(dateStr)
  const argentinaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}))
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  return days[argentinaDate.getDay()]
}

// Limpiar búsqueda
function clearSearch() {
  searchQuery.value = ""
}

// API calls
async function getIdentityToken() {
  const res = await fetch(
    `${API_URL}/users/authentication.php?username=${username}&password=${password}`
  )
  if (!res.ok) throw new Error("Error al obtener identity_token")
  const data = await res.json()
  return data.result.entitydata.accounts[1].token
}

async function getAccessToken(identityToken) {
  const res = await fetch(
    `${API_URL}/users/authorization.php?identity_token=${identityToken}`
  )
  if (!res.ok) throw new Error("Error al obtener access_token")
  const data = await res.json()
  return data.result.entitydata.session.identityToken
}

async function getStock() {
  loading.value = true
  error.value = null
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
        limit: 10,
        page: 1,
      },
      header: {
        FlowName: "stock_list",
        SequenceId: 2,
        TimeStamp: Date.now(),
        TrackingId: crypto.randomUUID(),
        access_token: accessToken,
      },
    }

    const res = await fetch(`${API_URL}/stock/list.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error("Error al obtener stock")
    const data = await res.json()

    stock.value = data?.result.entitydata ?? []
    
    stock.value.forEach(auto => {
      initializeSchedule(auto.id)
    })

    triggerToast("Éxito", `Se cargaron ${stock.value.length} vehículos`, true)

  } catch (err) {
    error.value = err.message
    triggerToast("Error", err.message, false)
  } finally {
    loading.value = false
  }
}

// Guardar todas las programaciones
async function saveAllScheduledPublications() {
  isLoading.value = true;
  saving.value = true
  
  try {
    const validSchedules = Object.values(scheduledPublications.value)
      .filter(schedule => schedule.enabled && isValidSchedule(schedule.stockId))

    if (validSchedules.length === 0) {
      triggerToast("Error", "No hay programaciones válidas para guardar", false)
      return
    }

    // Procesar cada programación válida
    const allPublications = []
    
    for (const schedule of validSchedules) {
      const auto = stock.value.find(a => a.id === schedule.stockId)
      if (!auto) continue

      // sincronizar selectedFields
      schedule.selectedFields = selectedFieldsByAuto.value[schedule.stockId] || schedule.selectedFields || []

      const scheduleArray = buildScheduleArray(schedule)
      
      const publicationData = {
        message: schedule.message || generateDefaultMessage(auto),
        link: '', // Podrías agregar link si es necesario
        image: auto.media[0]?.full_path || '',
        stockId: schedule.stockId,
        ref: schedule.stockId,
        vehicleInfo: {
          brand: auto.brand,
          model: auto.model,
          version: auto.version,
          color: auto.color,
          price: getPrice(auto.prices, "SALE_COST") ?? getPrice(auto.prices, "PURCHASE_COST"),
          location: auto.location
        },
        isScheduled: true,
        schedule: scheduleArray,
        selectedFields: schedule.selectedFields
      }

      allPublications.push(publicationData)
    }

    // Enviar al webhook
    for (const publication of allPublications) {
      const response = await fetch("https://hub.redooconect.com.ar/webhook/e45236e2-83c3-47a5-b0ea-39377418e892", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(publication)
      })

      if (!response.ok) {
        throw new Error(`Error al guardar programación para vehículo ${publication.stockId}: ${response.statusText}`)
      }
    }

    triggerToast("¡Éxito!", `Se guardaron ${allPublications.length} programaciones correctamente`, true)
    
    // Limpiar programaciones guardadas (si querés)
    Object.values(scheduledPublications.value).forEach(schedule => {
      if (schedule.enabled && isValidSchedule(schedule.stockId)) {
        schedule.enabled = false
        updateScheduleStatus(schedule.stockId)
      }
    })

  } catch (err) {
    triggerToast("Error", err.message, false)
    console.error("❌ Error saving scheduled publications:", err)
  } finally {
    saving.value = false
    isLoading.value = false;
  }
}

// Mensaje por defecto (si no hay uno personalizado)
function generateDefaultMessage(auto) {
  const price = getPrice(auto.prices, "SALE_COST") ?? getPrice(auto.prices, "PURCHASE_COST") ?? "Consultar precio"
  return `🚗 ${auto.brand} ${auto.model} ${auto.version}
💰 ${price}
🎨 Color: ${auto.color}
📍 ${auto.location}

¡Consultanos por este increíble vehículo!
#Auto #${auto.brand} #Venta`
}
</script>

<style>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.bi-arrow-clockwise {
  animation: spin 1s linear infinite;
}

.gap-3 {
  gap: 1rem !important;
}

.gap-2 {
  gap: 0.5rem !important;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.col-xl-6 {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}

/* .card img {
  height: 300px;
  object-fit: contain;
} */

.card {
  transition: all 0.3s ease;
}

.border-success {
  border-color: #198754 !important;
  border-width: 2px !important;
}
/* Animación de entrada/salida */
.fade-card-enter-active,
.fade-card-leave-active {
  transition: all 0.6s ease;
}

.fade-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-card-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-card-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-card-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

</style>
