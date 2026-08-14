<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <h2>
        <!-- <i class="bi bi-car-front me-2"></i> -->
        Catálogo de Vehículos
      </h2>
    </div>

    <!-- Loading inicial elegante -->
    <div v-if="loading && !stock.length" class="text-center py-5">
      <div class="spinner-border mb-3" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <h5 class="mb-2">{{ loadingMessage || 'Importando vehículos...' }}</h5>
      <p class="text-muted small">Por favor espera mientras se cargan los datos</p>
    </div>

    <!-- Si hay vehículos cargados pero sigue cargando más -->
    <div v-if="loading && stock.length" class="alert alert-info alert-dismissible fade show mb-3" role="alert">
      <i class="bi bi-arrow-repeat me-2"></i>
      <strong>Cargando más vehículos...</strong>
      <br>
      <small>{{ loadingMessage }}</small>
    </div>

    <hr class="header-divider">

    <!-- Búsqueda y Filtros -->
    <div v-if="stock.length" class="card mb-4">
      <div class="card-body">
        <div class="row g-3 justify-content-between">
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
              <!-- <button 
                v-if="searchQuery" 
                @click="searchQuery = ''"
                class="btn btn-outline-secondary"
                type="button"
              >
                <i class="bi bi-x"></i>
              </button> -->
            </div>
          </div>
          
          <!-- Botón de limpiar filtros -->
          <div class="col-2" v-if="hasActiveFilters">
            <button 
              @click="clearFilters()"
              class="btn btn-danger btn-sm w-100 h-100"
            >
              <i class="bi bi-x-circle me-1"></i>
              Limpiar filtros
            </button>
          </div>

          <!-- Filtros dinámicos -->
          <div class="col-12">
            <div class="row g-2 align-items-end">
              <div 
                v-for="(options, filterKey) in dynamicFilters" 
                :key="filterKey"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <label class="form-label small mb-1">{{ formatFilterLabel(filterKey) }}</label>
                <select 
                  v-model="activeFilters[filterKey]"
                  class="form-select form-select-sm"
                >
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
          Mostrando {{ paginatedStock.length }} de {{ filteredStock.length }} vehículos (página {{ displayPage }}/{{ totalDisplayPages }})
          <span class="ms-3">Total cargado: {{ stock.length }} de {{ stock.length }} ({{ currentPage }}/{{ pageCount }} páginas API)</span>
        </small>
      </div>
    </div>

    <!-- Grid de vehículos -->
    <div v-if="stock.length" class="row g-3">
      <div 
        v-for="vehicle in paginatedStock"
        :key="vehicle.id"
        class="col-md-6 col-lg-4 col-xl-3"
      >
        <div class="card vehicle-card-compact">
          <!-- Imagen -->
          <div class="vehicle-image-container position-relative">
            <img 
              :src="getDesktopImages(vehicle)?.[0]?.full_path || noImage"
              :alt="`${vehicle.brand} ${vehicle.model}`"
              class="card-img-top"
              style="object-fit: cover; height: 140px; cursor: pointer;"
              @click="openVehicleModal(vehicle)"
            >
            <div class="position-absolute top-0 end-0 m-1" style="display: flex; flex-direction: column; gap: 4px;">
              <div class="badge bg-primary" style="font-size: 0.7rem;">
                <i class="bi bi-image me-1"></i>{{ getDesktopImages(vehicle)?.length || 0 }}
              </div>
              <div v-if="vehicle.business_channel" :class="['badge', getBusinessChannelColor(vehicle.business_channel)]" style="font-size: 0.7rem;">
                {{ vehicle.business_channel }}
              </div>
            </div>
          </div>

          <!-- Contenido Compacto -->
          <div class="card-body p-3">
            <h6 class="card-title mb-1" style="font-size: 0.95rem;">
              {{ vehicle.brand }} {{ vehicle.model }}
            </h6>
            
            <p class="text-muted mb-1" style="font-size: 0.75rem;">
              {{ vehicle.version || 'N/D' }}
            </p>
            
            <p class="text-muted mb-2" style="font-size: 0.8rem;">
              {{ vehicle.year || 'N/D' }} · {{ vehicle.color || 'N/D' }}
            </p>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="text-muted">
                <i class="bi bi-speedometer" style="font-size: 0.75rem;"></i>
                {{ vehicle.odometer ? (vehicle.odometer / 1000).toFixed(0) + 'k' : 'N/D' }}
              </small>
              <strong class="text-success" style="font-size: 0.9rem;">
                {{ getPrice(vehicle.prices, 'SALE_COST') || getPrice(vehicle.prices, 'PURCHASE_COST') || '—' }}
              </strong>
            </div>

            <p class="text-muted mb-2" style="font-size: 0.8rem;">
              {{ vehicle.accesories || 'N/D' }}
            </p>

            <div class="d-grid gap-2">
              <button 
                @click="shareVehicle(vehicle)"
                :disabled="loadingPDF[vehicle.id]"
                class="btn btn-sm"
                style="font-size: 0.85rem; padding: 0.35rem 0.5rem;"
              >
                <i v-if="loadingPDF[vehicle.id]" class="bi bi-hourglass-split me-1"></i>
                <i v-else class="bi bi-share me-1"></i>
                {{ loadingPDF[vehicle.id] ? 'Generando...' : 'Compartir' }}
              </button>
              <button 
                @click="downloadImages(vehicle)"
                :disabled="loadingImages[vehicle.id] || !getDesktopImages(vehicle) || getDesktopImages(vehicle).length === 0"
                class="btn btn-sm btn-outline"
                style="font-size: 0.85rem; padding: 0.35rem 0.5rem;"
                title="Descargar todas las imágenes del vehículo"
              >
                <i v-if="loadingImages[vehicle.id]" class="bi bi-hourglass-split me-1"></i>
                <i v-else class="bi bi-download me-1"></i>
                {{ loadingImages[vehicle.id] ? 'Descargando...' : 'Descargar imágenes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles de paginación del grid (20 por página) -->
    <div v-if="filteredStock.length > itemsPerPage" class="d-flex justify-content-center align-items-center gap-2 my-4 flex-wrap">
      <button 
        @click="displayPage = Math.max(1, displayPage - 1)"
        :disabled="displayPage === 1"
        class="btn btn-sm btn-outline-secondary"
      >
        <i class="bi bi-chevron-left"></i> Anterior
      </button>
      
      <div class="d-flex gap-1 flex-wrap">
        <button 
          v-for="page in totalDisplayPages"
          :key="page"
          @click="displayPage = page"
          :class="['btn btn-sm', displayPage === page ? 'btn-primary' : 'btn-outline-primary']"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="displayPage = Math.min(totalDisplayPages, displayPage + 1)"
        :disabled="displayPage === totalDisplayPages"
        class="btn btn-sm btn-outline-secondary"
      >
        Siguiente <i class="bi bi-chevron-right"></i>
      </button>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ToastComponent from '@/components/ToastComponent.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import JSZip from 'jszip'
import noImage from '@/assets/images/no-image.png'
import { stockConfig, getApiUrl, getApiCredentials } from './config/stockConfig'

// ==================== DATOS ====================
const stock = ref([])
const loading = ref(false)
const loadingPDF = ref({})  // Por vehículo: { vehicleId: true/false }
const loadingImages = ref({})  // Por vehículo: { vehicleId: true/false }
const searchQuery = ref('')
const activeFilters = ref({})

const toastTitle = ref('')
const toastMessage = ref('')
const isSuccess = ref(true)
const showToast = ref(false)
const token = ref(null)

// Paginación de API
const pageCount = ref(1)
const currentPage = ref(1)

// Paginación de vista (20 items por página)
const displayPage = ref(1)
const itemsPerPage = ref(20)

// Mensaje de progreso de carga
const loadingMessage = ref('')

// ==================== COMPUTEDS ====================
const dynamicFilters = computed(() => {
  const filters = {}
  const fieldsToFilter = stockConfig.filterFields
  
  fieldsToFilter.forEach(field => {
    const values = [...new Set(
      stock.value
        .map(v => v[field])
        .filter(v => v)
        .map(v => typeof v === 'object' && v?.name ? v.name : v)
        .map(v => String(v).trim())  // Normalizar: convertir a string y eliminar espacios
    )].sort()
    if (values.length > 0) filters[field] = values
  })
  return filters
})

const filteredStock = computed(() => {
  let filtered = stock.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(v => {
      const searchText = stockConfig.searchFields.map(field => v[field]).join(' ').toLowerCase()
      return searchText.includes(query)
    })
  }

  Object.entries(activeFilters.value).forEach(([key, value]) => {
    if (value) {
      filtered = filtered.filter(v => {
        const fieldValue = v[key]
        const vehicleValue = typeof fieldValue === 'object' && fieldValue?.name ? fieldValue.name : fieldValue
        return vehicleValue === value
      })
    }
  })

  return filtered
})

const totalDisplayPages = computed(() => {
  return Math.ceil(filteredStock.value.length / itemsPerPage.value)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || Object.values(activeFilters.value).some(v => v !== '')
})

const paginatedStock = computed(() => {
  const start = (displayPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStock.value.slice(start, end)
})

// Resetear página de visualización cuando cambian filtros o búsqueda
const debouncedResetPage = (() => {
  let timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      resetDisplayPage()
    }, 300)
  }
})()

watch(searchQuery, debouncedResetPage)
watch(activeFilters, debouncedResetPage, { deep: true })

// ==================== MÉTODOS ====================
function showToastMsg(title, message, success = true) {
  toastTitle.value = title
  toastMessage.value = message
  isSuccess.value = success
  showToast.value = true
}

function getToken() {
  token.value = sessionStorage.getItem('token')
}

function resetDisplayPage() {
  displayPage.value = 1
}

function clearFilters() {
  searchQuery.value = ''
  activeFilters.value = {}
  resetDisplayPage()
}

function formatFilterLabel(key) {
  const labels = { brand: 'Marca', model: 'Modelo', fuel: 'Combustible', color: 'Color', year: 'Año', business_channel: 'Canal de Negocio' }
  return labels[key] || key
}

function getBusinessChannelColor(channel) {
  const colors = {
    'B2B': 'bg-info',           // Azul
    'B2C': 'bg-success',        // Verde
    // Agregar más canales según sea necesario
  }
  return colors[channel] || 'bg-secondary'
}

function getPrice(prices, type) {
  const price = prices?.find(p => p.type === type)
  return price?.value ? `$${price.value.toLocaleString()}` : null
}

function getDesktopImages(vehicle) {
  return vehicle?.media?.filter(m => m.size === 'desktop') || []
}

async function getIdentityToken() {
  try {
    const credentials = getApiCredentials()
    const res = await fetch(`${getApiUrl('/users/auth.php')}?username=${credentials.username}&password=${credentials.password}`)
    if (!res.ok) throw new Error("Error al obtener token")
    const data = await res.json()
    //return data.result.entitydata.accounts[1].token
    // console.log('credentials', credentials)
    // console.log('data.result.entitydata:', data.result)
    return data.result.entitydata
    
  } catch (err) {
    console.error('Error:', err)
    throw err
  }
}

async function getAccessToken(identityToken) {
  try {
    const res = await fetch(`${getApiUrl('/users/authorization.php')}?identity_token=${identityToken}`)
    if (!res.ok) throw new Error("Error al obtener access_token")
    const data = await res.json()
    return data.result.entitydata.session.identityToken
  } catch (err) {
    console.error('Error:', err)
    throw err
  }
}

async function getStock() {
  loading.value = true
  stock.value = []
  currentPage.value = 1
  loadingMessage.value = 'Cargando...'
  
  try {
    const identityToken = await getIdentityToken()
    const accessToken = identityToken;
    const defaultFilters = stockConfig.defaultFilters

    // Carga la primera página
    let page = 1
    const body = {
      data: {
        filters: [{ field: "availability_status_code", operation: "=", value: defaultFilters.availabilityStatus }],
        sort: [{ field: defaultFilters.sortBy, order: defaultFilters.sortOrder }],
        show_media: true,
        limit: defaultFilters.limit,
        page: page
      },
      header: {
        FlowName: "stock_list",
        SequenceId: 2,
        TimeStamp: Date.now(),
        TrackingId: crypto.randomUUID(),
        access_token: accessToken
      }
    }

    const res = await fetch(`${getApiUrl('/stock/list.php')}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error("Error al obtener stock")
    let data = await res.json()

    stock.value = data.result?.entitydata ?? []
    pageCount.value = data.result?.aditional_data?.page_count || 1
    
    loadingMessage.value = `Importando 1 de ${pageCount.value}`
    // console.log('✅ Primera página cargada. Total páginas:', pageCount.value)

    // Loop para cargar todas las páginas restantes
    for (page = 2; page <= pageCount.value; page++) {
      // Actualizar mensaje de progreso
      loadingMessage.value = `Importando ${page} de ${pageCount.value}`
      
      // Crear body para la siguiente página
      const nextBody = {
        data: {
          filters: [{ field: "availability_status_code", operation: "=", value: defaultFilters.availabilityStatus }],
          sort: [{ field: defaultFilters.sortBy, order: defaultFilters.sortOrder }],
          show_media: true,
          limit: defaultFilters.limit,
          page: page
        },
        header: {
          FlowName: "stock_list",
          SequenceId: 2,
          TimeStamp: Date.now(),
          TrackingId: crypto.randomUUID(),
          access_token: accessToken
        }
      }

      // Hacer fetch de la siguiente página
      const nextRes = await fetch(`${getApiUrl('/stock/list.php')}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextBody)
      })

      if (!nextRes.ok) throw new Error(`Error al obtener página ${page}`)
      data = await nextRes.json()

      // Concatenar los vehículos
      stock.value = [...stock.value, ...(data.result?.entitydata ?? [])]
      
      // console.log(`✅ Página ${page} cargada. Total vehículos: ${stock.value.length}`)
      
      // Pequeña pausa para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    currentPage.value = pageCount.value
    //console.log('stock', stock)
    showToastMsg("Éxito", `Se cargaron ${stock.value.length} vehículos en total`)
  } catch (err) {
    console.error('Error:', err)
    showToastMsg("Error", err.message, false)
  } finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

// ==================== TEMPLATE EVALUATION ====================
/**
 * Evalúa un template con variables y fórmulas dinámicas
 * Soporta: #sym:price, #sym:mileage, #sym:year, etc.
 * Ejemplo: "Mensualidad: 2 * #sym:price / 100"
 * Resultado: "Mensualidad: 1000" (si price es 50000)
 */
function evaluateTemplate(template, vehicle, userData = {}) {
  if (!template) return ''
  
  // Crear contexto con variables disponibles del vehículo
  const salePrice = getPrice(vehicle.prices, 'SALE_COST') || getPrice(vehicle.prices, 'PURCHASE_COST') || 0
  // Preservar el punto decimal al extraer el precio (mantener dígitos y puntos, eliminar todo lo demás)
  const priceValue = salePrice ? parseFloat(salePrice.replace(/[^0-9.]/g, '')) : 0
  
  const context = {
    price: priceValue,
    mileage: vehicle.mileage || 0,
    year: vehicle.year || new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    color: vehicle.color || '',
    version: vehicle.version || '',
    // Variables del usuario
    user_name: userData.name || userData.fullName || '',
    user_email: userData.email || '',
    user_phone: userData.phone || userData.phoneNumber || '',
    user_company: userData.company || '',
    // Funciones útiles
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    parseInt: parseInt,
    parseFloat: parseFloat
  }
  
  let result = template
  
  // Reemplazar variables #sym:name con sus valores
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'number' || typeof value === 'string') {
      const regex = new RegExp(`#sym:${key}`, 'g')
      result = result.replace(regex, value)
    }
  }
  
  // Detectar y evaluar expresiones matemáticas
  // Reemplazar Math.XXX(...) con sus valores
  result = result.replace(/Math\.(round|floor|ceil|abs|pow|sqrt)\(([\d\.\s\+\-\*\/()]+)\)/g, (match, func, expr) => {
    try {
      const func_ref = Math[func]
      const value = new Function('return (' + expr + ')')()
      return func_ref(value)
    } catch {
      return match
    }
  })
  
  // Evaluar líneas con cálculos (después de los reemplazos de variables)
  // Buscar patrones como "Mensualidad: $ 95000 * 0.02" o similares
  result = result.split('\n').map(line => {
    // Buscar líneas con formato: label: cualquier_cosa
    const colonMatch = line.match(/([^:]*?):\s*(.*)$/)
    
    if (colonMatch) {
      const prefix = colonMatch[1].trim()
      const valueStr = colonMatch[2].trim()
      
      // Extraer la expresión matemática (números y operadores)
      // Permitir caracteres especiales como $ antes de la expresión
      const exprMatch = valueStr.match(/([^\d]*?)([\d.]+\s*[\*\/\+\-\s().\d]*)/)
      
      if (exprMatch) {
        const beforeExpr = exprMatch[1] // Símbolos como $, espacios, etc
        const expression = exprMatch[2].trim() // La expresión matemática
        const afterExpr = valueStr.substring(beforeExpr.length + expression.length) // Resto
        
        try {
          // Validar que solo contiene caracteres seguros para evaluar
          if (/^[0-9\s\*\/\+\-().]*$/.test(expression)) {
            const calculated = new Function('return (' + expression + ')')()
            if (!isNaN(calculated)) {
              // Formatear el número con separadores de miles
              const formatted = typeof calculated === 'number' 
                ? calculated.toLocaleString('es-CO', { maximumFractionDigits: 2 })
                : calculated
              return `${prefix}: ${beforeExpr}${formatted}${afterExpr}`
            }
          }
        } catch {
          // Si falla la evaluación, devolver la línea original
          return line
        }
      }
    }
    return line
  }).join('\n')
  
  return result
}

// ==================== PDF ====================
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 24, g: 95, b: 165 }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
  }
  return { r: 24, g: 95, b: 165 }
}

async function urlToBase64(url) {
  const N8N_WEBHOOK = 'https://apis.madautomate.cloud/webhook/47494734-2f38-4e43-b79f-4f4dca4244db'
  
  try {
    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    if (!response.ok) throw new Error(`Webhook error: ${response.status}`)
    
    const data = await response.json()
    if (data.base64) return data.base64
    
    throw new Error('Respuesta sin campo base64')
  } catch (error) {
    console.warn('Error cargando imagen via n8n:', error)
    return null
  }
}

/**
 * Descarga múltiples imágenes en paralelo (máximo 5 simultáneas)
 * Retorna array con resultado de cada imagen: { url, base64, error }
 */
async function downloadImagesInParallel(imageUrls, maxConcurrent = 5) {
  const results = []
  const executing = []
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]
    
    const promise = urlToBase64(url).then(base64 => ({
      url,
      base64,
      index: i,
      error: !base64
    })).catch(err => ({
      url,
      base64: null,
      index: i,
      error: true,
      errorMsg: err.message
    }))
    
    results[i] = promise
    
    if (imageUrls.length >= maxConcurrent) {
      executing.push(promise)
      
      if (executing.length >= maxConcurrent) {
        await Promise.race(executing)
        executing.splice(executing.findIndex(p => p === promise), 1)
      }
    }
  }
  
  // Esperar a que todas se completen
  return Promise.all(results)
}

async function convertImageToCompatibleFormat(imageData) {
  // Si ya es base64 con prefijo de formato compatible, devolver como está
  if (imageData.includes('data:image/jpeg') || imageData.includes('data:image/png')) {
    return imageData
  }
  
  // Si es .avif o formato no compatible, convertir usando canvas
  if (imageData.includes('data:image/avif') || imageData.includes('.avif')) {
    return await convertAvifToPng(imageData)
  }
  
  return imageData
}

async function convertAvifToPng(imageData) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      // Convertir a PNG en base64
      const pngData = canvas.toDataURL('image/png')
      resolve(pngData)
    }
    
    img.onerror = () => {
      console.warn('No se pudo convertir imagen AVIF, usando original')
      resolve(imageData) // Devolver original como fallback
    }
    
    // Permitir CORS para cargar la imagen
    img.crossOrigin = 'anonymous'
    img.src = imageData
  })
}

async function loadPdfConfig() {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token.value && { 'Authorization': `Bearer ${token.value}` })
    }

    const response = await fetch(
      'https://apis.madautomate.cloud/webhook/6e89d000-f697-46a2-ba81-618901c9e240',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'getConfigPdf' })
      }
    )
    if (!response.ok) throw new Error("Error al cargar configuración")
    const data = await response.json()
    return data.config || {}
  } catch (error) {
    console.warn('Error cargando config:', error)
    return {}
  }
}

async function shareVehicle(vehicle) {
  if (!vehicle || getDesktopImages(vehicle).length === 0) {
    showToastMsg('Error', 'El vehículo no tiene imágenes', false)
    return
  }

  loadingPDF.value[vehicle.id] = true
  try {
    const config = await loadPdfConfig()
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const colorRgb = hexToRgb(config.styles?.primaryColor || '#0066CC')
    
    // Debug: Datos del usuario
    const userData = {
      name: sessionStorage.getItem('user_name') || '',
      email: sessionStorage.getItem('user_email') || '',
      phone: sessionStorage.getItem('user_phone') || '',
      company: sessionStorage.getItem('user_company') || ''
    }
    console.log('📄 Generando PDF con userData:', userData)
    console.log('📋 Configuración empresa:', config.company)
    let y = 15

    // ===== ENCABEZADO EN 3 COLUMNAS =====
    const columnWidth = (pageWidth - 30) / 3
    const lineHeight = 5 // Altura aproximada de una línea de texto
    
    // Columna 2: Marca, modelo, versión y año (centrada)
    const titleText = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ' ' + vehicle.version : ''} ${vehicle.year || ''}`
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    const col2X = 15 + columnWidth
    const titleLines = doc.splitTextToSize(titleText.trim(), columnWidth - 4)
    
    // Obtener dimensiones del logo para calcular la altura total del encabezado
    const logoHeight = config.company?.logoHeight || 12
    const logoWidth = config.company?.logoWidth || 50
    
    // Calcular altura total del encabezado (máximo entre logo y texto)
    const totalHeaderHeight = Math.max(logoHeight, titleLines.length * lineHeight + 5)
    const centerY = y + totalHeaderHeight / 2
    
    // Columna 1: "COTIZACIÓN" (alineado al centro vertical)
    doc.setFontSize(16)
    doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b)
    doc.setFont(undefined, 'bold')
    doc.text('COTIZACIÓN', 15, centerY, { align: 'left' })
    
    // Columna 2: Título multilínea (alineado al centro vertical)
    doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b)
    const titleStartY = centerY - (titleLines.length - 1) * lineHeight / 2
    doc.text(titleLines, col2X + columnWidth / 2, titleStartY, { align: 'center' })
    
    // Columna 3: Logo (alineado al centro vertical)
    if (config.company?.logo) {
      try {
        const logoData = await convertImageToCompatibleFormat(config.company.logo)
        const col3X = 15 + columnWidth * 2
        const logoY = centerY - logoHeight / 2
        
        let imageFormat = 'JPEG'
        if (logoData.includes('image/png')) {
          imageFormat = 'PNG'
        } else if (logoData.includes('image/webp')) {
          imageFormat = 'WEBP'
        }
        
        doc.addImage(logoData, imageFormat, col3X + columnWidth / 2 - logoWidth / 2, logoY, logoWidth, logoHeight)
      } catch (logoErr) {
        console.warn('Error insertando logo:', logoErr)
      }
    }
    
    // Ajustar Y para el siguiente contenido
    y += totalHeaderHeight + 5

    // Nombre de la empresa
    try {
      const processedCompanyName = evaluateTemplate(config.company?.name || '', vehicle, userData)
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.setFont(undefined, 'normal')
      doc.text(processedCompanyName, 15, y)
    } catch (e) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(config.company?.name || 'Empresa', 15, y)
    }
    y += 8

    // Línea separadora
    doc.setDrawColor(220, 220, 220)
    doc.line(15, y, pageWidth - 15, y)
    y += 8

    // Detalles del vehículo
    const detailRows = [
      ['Marca', vehicle.brand],
      ['Modelo', vehicle.model],
      ['Año', vehicle.year || 'N/D'],
      ['Color', vehicle.color || 'N/D'],
      ['Combustible', typeof vehicle.fuel === 'object' && vehicle.fuel?.name ? vehicle.fuel.name : vehicle.fuel || 'N/D'],
      ['Accesorios', vehicle.accesories || 'N/D'],
      ['Precio', getPrice(vehicle.prices, 'SALE_COST') || getPrice(vehicle.prices, 'PURCHASE_COST') || 'Consultar']
    ]

    autoTable(doc, {
      startY: y,
      head: [['Detalles', '']],
      body: detailRows,
      theme: 'striped',
      headStyles: { fillColor: [colorRgb.r, colorRgb.g, colorRgb.b], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { textColor: [80, 80, 80] } },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 15, right: 15, bottom: 35 }
    })

    y = doc.lastAutoTable.finalY + 8

    // Cotización Financiera
    if (config.company?.financialInfo) {
      try {
        doc.setFontSize(11)
        doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b)
        doc.text('Cotización Financiera', 15, y)
        y += 6

        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        // Evaluar el template con variables dinámicas del vehículo y usuario
        const processedInfo = evaluateTemplate(config.company.financialInfo, vehicle, userData)
        const lines = doc.splitTextToSize(processedInfo, pageWidth - 30)
        doc.text(lines, 15, y)
      } catch (e) {
        console.warn('Error procesando información financiera:', e)
      }
    }

    y += 15

    // Imágenes - mostrar TODAS las imágenes AL FINAL
    const images = getDesktopImages(vehicle)
    if (images.length > 0) {
      // Descargar TODAS las imágenes en paralelo ANTES de insertarlas
      const imageUrls = images.map(img => img.full_path)
      const downloadedImages = await downloadImagesInParallel(imageUrls)
      
      const imgW = (pageWidth - 35) / 2
      const imgH = 60
      let currentPageImages = 0  // Contador de imágenes en página actual
      let isFirstImage = true

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        // Encabezado de fotografías
        if (isFirstImage) {
          doc.setFontSize(13)
          doc.setTextColor(50, 50, 50)
          doc.text('Fotografías', 15, y)
          y += 6
          isFirstImage = false
        }

        // Calcular posición en la grilla
        const col = currentPageImages % 2
        const row = Math.floor(currentPageImages / 2)
        const xImg = 15 + col * (imgW + 5)
        let yImg = y + row * (imgH + 3)

        // Si no cabe en la página actual, crear nueva página
        if (yImg + imgH > pageHeight - 30) {
          doc.addPage()
          y = 15
          currentPageImages = 0
          
          // Encabezado en la nueva página
          doc.setFontSize(12)
          doc.setTextColor(50, 50, 50)
          doc.text('Fotografías (continuación)', 15, y)
          y += 8
          
          yImg = y
        }

        // Insertar imagen (ya descargada en paralelo)
        try {
          const b64 = downloadedImages[imageIndex].base64
          if (b64) {
            doc.addImage(b64, 'JPEG', xImg, yImg, imgW, imgH)
          } else {
            doc.setFillColor(220, 220, 220)
            doc.rect(xImg, yImg, imgW, imgH, 'F')
            doc.setFontSize(7)
            doc.setTextColor(150, 150, 150)
            doc.text('Sin imagen', xImg + imgW / 2, yImg + imgH / 2, { align: 'center' })
          }
        } catch {
          doc.setFillColor(220, 220, 220)
          doc.rect(xImg, yImg, imgW, imgH, 'F')
        }

        currentPageImages++
      }

      // Actualizar Y para el siguiente contenido (en la última página)
      y = y + Math.ceil(currentPageImages / 2) * (imgH + 3) + 8
    }

    // Pie
    const totalPages = doc.internal.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      try {
        doc.setPage(p)
        doc.setFontSize(8)
        doc.setTextColor(160, 160, 160)
        doc.line(15, pageHeight - 22, pageWidth - 15, pageHeight - 22)
        
        // Procesar teléfono y email con variables dinámicas
        const processedPhone = evaluateTemplate(config.company?.phone || '', vehicle, userData)
        const processedEmail = evaluateTemplate(config.company?.email || '', vehicle, userData)
        
        doc.text(`Tel: ${processedPhone} | Email: ${processedEmail}`, 15, pageHeight - 16)
        doc.text(config.footerText || '', 15, pageHeight - 10)
        doc.text(`${p} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' })
      } catch (e) {
        console.warn('Error en pie de página:', e)
        doc.setPage(p)
        doc.setFontSize(8)
        doc.setTextColor(160, 160, 160)
        doc.line(15, pageHeight - 22, pageWidth - 15, pageHeight - 22)
        doc.text(`Tel: ${config.company?.phone || ''} | Email: ${config.company?.email || ''}`, 15, pageHeight - 16)
        doc.text(config.footerText || '', 15, pageHeight - 10)
        doc.text(`${p} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' })
      }
    }

    doc.save(`${vehicle.brand}_${vehicle.model}_${vehicle.version}.pdf`)
    showToastMsg('Éxito', 'PDF descargado correctamente')
  } catch (err) {
    console.error('Error:', err)
    showToastMsg('Error', 'No se pudo generar el PDF', false)
  } finally {
    loadingPDF.value[vehicle.id] = false
  }
}

/**
 * Descargar todas las imágenes de un vehículo en un archivo ZIP
 */
async function downloadImages(vehicle) {
  const images = getDesktopImages(vehicle)
  
  if (!images || images.length === 0) {
    showToastMsg('Información', 'No hay imágenes disponibles para descargar')
    return
  }

  // Usar Object.assign para asegurar reactividad
  Object.assign(loadingImages.value, { [vehicle.id]: true })
  let successCount = 0
  let failCount = 0

  try {
    // Extraer todas las URLs
    const imageUrls = images.map(img => img.full_path || img.src || img.url || img.link).filter(url => url)
    
    // Validar URLs
    if (imageUrls.length === 0) {
      showToastMsg('Error', 'No hay URLs de imágenes válidas')
      return
    }
    
    // Descargar TODAS las imágenes en paralelo (máximo 5 simultáneas)
    const downloadedImages = await downloadImagesInParallel(imageUrls)
    
    const zip = new JSZip()

    for (let i = 0; i < downloadedImages.length; i++) {
      const result = downloadedImages[i]
      
      if (!result.base64) {
        console.error(`Imagen ${i + 1} no se descargó:`, result.errorMsg)
        failCount++
        continue
      }
      
      try {
        // Extraer el base64 puro (eliminar prefijo data:image/jpeg;base64,)
        let base64String = result.base64
        if (result.base64.includes('base64,')) {
          base64String = result.base64.split('base64,')[1]
        }
        
        // Convertir base64 a blob
        const byteCharacters = atob(base64String)
        const byteNumbers = new Array(byteCharacters.length)
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j)
        }
        const byteArray = new Uint8Array(byteNumbers)
        
        // Agregar imagen al ZIP
        const fileName = `${vehicle.brand}_${vehicle.model}_${i + 1}.jpg`
        zip.file(fileName, byteArray)
        
        successCount++
      } catch (imgError) {
        console.error(`Error procesando imagen ${i + 1}:`, imgError)
        failCount++
      }
    }
    
    if (successCount > 0) {
      // Generar el archivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      
      // Crear y ejecutar descarga del ZIP
      const link = document.createElement('a')
      link.href = zipUrl
      link.download = `IMG_${vehicle.brand}_${vehicle.model}_${vehicle.version || 'v'}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar URL temporal
      setTimeout(() => URL.revokeObjectURL(zipUrl), 100)
      
      const msg = failCount > 0 
        ? `Se comprimieron ${successCount} de ${images.length} imagen(es) en ZIP`
        : `Se descargó ZIP con ${successCount} imagen(es) correctamente`
      showToastMsg('Éxito', msg)
    } else {
      showToastMsg('Error', 'No se pudieron descargar las imágenes')
    }
  } catch (error) {
    console.error('Error en proceso de descargas:', error)
    showToastMsg('Error', 'Ocurrió un error durante las descargas')
  } finally {
    Object.assign(loadingImages.value, { [vehicle.id]: false })
  }
}

onMounted(() => {
  getToken();
  getStock();
})
</script>

<style scoped>
.header-section {
  display: flex;
}

/* Loading Spinner Mejorado */
.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
  color: #185fa5;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
  animation: slideDown 0.3s ease-out;
}

.alert-info .bi {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card compacta de vehículos */
.vehicle-card-compact {
  transition: all 0.3s ease;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.vehicle-card-compact:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  /*transform: translateY(-4px);*/
}

.vehicle-image-container {
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
}

.vehicle-image-container img {
  transition: transform 0.3s ease;
}

.vehicle-card-compact:hover .vehicle-image-container img {
  transform: scale(1.05);
}

/* Modal Content */
.vehicle-modal-content {
  display: flex;
  flex-direction: column;
  /* max-height: calc(100vh - 100px); */
  padding: 0;
  height: 100vh;
}

.hf-stepper-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  margin-bottom: 0;
}

.hf-steps-scroll {
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem;
  padding-bottom: 5rem;
}

.hf-steps-scroll::-webkit-scrollbar {
  width: 8px;
}

.hf-steps-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.hf-steps-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.hf-steps-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Stepper Styles */
.hf-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  /* border-radius: 14px; */
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.hf-step-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.95rem 1rem;
  border: 0;
  border-right: 1px solid #e9ecef;
  background: transparent;
  text-align: left;
  transition: background 0.15s ease;
}

.hf-step-item:last-child { border-right: 0; }
.hf-step-item:hover:not(.active) { background: #f8f9fa; }
.hf-step-item.active { background: #eff6ff; }
.hf-step-item.done .hf-step-num,
.hf-step-item.active .hf-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.hf-step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #dee2e6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6c757d;
  flex-shrink: 0;
}

.hf-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hf-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.hf-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.hf-step-item.active .hf-step-copy span,
.hf-step-item.done .hf-step-copy span {
  color: #185fa5;
}

.hf-step-content {
  min-height: 420px;
}

.hf-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 2rem;
  background: #fff;
  border-top: 1px solid #dee2e6;
  position: sticky;
  bottom: 0;
  flex-shrink: 0;
  z-index: 99;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}
/* Settings Card */
.settings-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  margin-bottom: 1.5rem;
}

.settings-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Card Head - Using PagesView Design */
.pages-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
  color: #212529;
}

.pages-card-head i {
  color: #185fa5;
}

.pages-card-head span {
  font-size: 1rem;
}

/* Settings Group */
.settings-group {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.settings-group:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.settings-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.settings-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

/* Image Selector */
.image-selector {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.image-selector:hover {
  border-color: #3939ff;
}

.image-selector.selected {
  border-color: #059669;
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
  background: rgba(5, 150, 105, 0.5);
}

/* Responsive */
@media (max-width: 992px) {
  .hf-stepper {
    flex-direction: column;
  }

  .hf-step-item {
    min-width: 100%;
  }

  .hf-step-actions {
    flex-direction: column;
    padding: 1rem;
  }

  .hf-step-actions button {
    width: 100%;
  }

  .vehicle-modal-content {
    height: calc(100vh - 60px);
  }

  .hf-steps-scroll {
    padding: 1.5rem;
  }
}

/* PDF Preview Styles */
.pdf-preview-container {
  background: #f0f0f0;
  padding: 2rem 1rem;
  border-radius: 8px;
  /* max-height: 70vh; */
  /* overflow-y: auto; */
}

.pdf-page {
  background: white;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

.pdf-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 2px solid #ddd;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.pdf-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.pdf-logo {
  max-width: 80px;
  max-height: 60px;
  object-fit: contain;
}

.pdf-header-text {
  flex: 1;
}

.pdf-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #185fa5;
  line-height: 1.2;
}

.pdf-company {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.pdf-section {
  margin-bottom: 1.5rem;
}

.pdf-section-title {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.pdf-images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pdf-image-container {
  background: #f9f9f9;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1;
}

.pdf-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdf-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pdf-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.pdf-detail-label {
  font-weight: 600;
  color: #333;
}

.pdf-detail-value {
  color: #666;
  text-align: right;
}

.pdf-message {
  background: #f9f9f9;
  padding: 1rem;
  border-left: 4px solid #185fa5;
  font-style: italic;
  color: #555;
  margin: 0;
  border-radius: 4px;
}

.pdf-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #ddd;
  text-align: center;
}

.pdf-footer-text {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #999;
}

@media (max-width: 768px) {
  .vehicle-modal-content {
    padding: 1rem;
    padding-bottom: 6rem;
  }

  .hf-stepper {
    gap: 0.25rem;
  }

  .hf-step-item {
    padding: 0.75rem;
    min-width: 140px;
  }

  .hf-step-copy span {
    font-size: 0.75rem;
  }

  .hf-step-copy small {
    font-size: 0.65rem;
  }

  /* PDF Preview Mobile */
  .pdf-preview-container {
    padding: 1rem 0.5rem;
    max-height: calc(100vh - 350px);
  }

  .pdf-page {
    padding: 1rem;
  }

  .pdf-logo {
    max-width: 60px;
    max-height: 45px;
  }

  .pdf-title {
    font-size: 1.4rem;
  }

  .pdf-section-title {
    font-size: 1rem;
  }

  .pdf-images-grid {
    grid-template-columns: 1fr;
  }

  .pdf-detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .pdf-detail-value {
    text-align: left;
  }
}
</style>
