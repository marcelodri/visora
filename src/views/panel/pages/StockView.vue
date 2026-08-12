<template>
  <div class="container-fluid mt-4 page forms ">

    <!-- Header -->
    <div class="header-section mb-4 sc-header">
      <div class="sc-header-left">
        <h2 class="sc-title">Configuración de Stock</h2>
        <p class="sc-subtitle">Diseñá cómo se verá la sección de vehículos en tu landing page</p>
      </div>
      <button type="button" class="btn btn-primary btn-add sc-btn sc-btn-primary" @click="saveForm" :disabled="saving">
        <i class="bi me-2" :class="saving ? 'bi-arrow-clockwise sc-spin' : 'bi-floppy'"></i>
        {{ saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar configuración' }}
      </button>
    </div>

    <hr class="header-divider sc-divider" />

    <!-- Stepper -->
    <div class="sc-stepper">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="sc-step"
        :class="{ active: currentStep === i, done: currentStep > i }"
        @click="goStep(i)"
      >
        <div class="sc-step-num">
          <i v-if="currentStep > i" class="bi bi-check-lg"></i>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div class="sc-step-label">{{ step }}</div>
      </div>
    </div>

    <!-- Step 0: Landing -->
    <div v-show="currentStep === 0">
      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-window-stack"></i>
          <span>Contenido principal</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-grid-2">
            <div class="sc-field">
              <label>Título visible</label>
              <input v-model="formData.stock_title" type="text" placeholder="Ej: Vehículos en Stock" />
            </div>
            <div class="sc-field">
              <label>Subtítulo</label>
              <input v-model="formData.stock_subtitle" type="text" placeholder="Ej: Encontrá tu próximo vehículo" />
            </div>
            <div class="sc-field sc-full">
              <label>Descripción</label>
              <textarea v-model="formData.stock_description" rows="2" placeholder="Texto introductorio para la landing del stock"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-palette-fill"></i>
          <span>Colores</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-grid-3">
            <div class="sc-field" v-for="col in colorFields" :key="col.key">
              <label>{{ col.label }}</label>
              <div class="sc-color-row">
                <div class="sc-swatch" :style="{ background: formData[col.key] }" @click="triggerColor(col.key)">
                  <input :ref="'picker-' + col.key" type="color" :value="formData[col.key]" @input="formData[col.key] = $event.target.value" />
                </div>
                <input type="text" :value="formData[col.key]" @input="formData[col.key] = $event.target.value" class="sc-color-text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-card-image"></i>
          <span>Tarjeta de vehículo</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-grid-3 mb-16">
            <div class="sc-field">
              <label>Columnas en grilla</label>
              <select v-model.number="formData.grid_columns">
                <option :value="2">2 columnas</option>
                <option :value="3">3 columnas</option>
                <option :value="4">4 columnas</option>
              </select>
            </div>
            <div class="sc-field">
              <label>Tarjetas por página</label>
              <input v-model.number="formData.items_per_page" type="number" min="4" max="48" step="4" />
            </div>
            <div class="sc-field">
              <label>Altura de imagen</label>
              <select v-model="formData.image_height">
                <option value="160px">Compacta (160px)</option>
                <option value="220px">Normal (220px)</option>
                <option value="300px">Grande (300px)</option>
              </select>
            </div>
          </div>
          <div class="sc-toggle-list">
            <div class="sc-toggle-row" v-for="tog in cardToggles" :key="tog.key">
              <div class="sc-toggle-info">
                <span>{{ tog.label }}</span>
                <p>{{ tog.desc }}</p>
              </div>
              <label class="sc-switch">
                <input type="checkbox" v-model="formData[tog.key]" />
                <span class="sc-switch-track"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: Detalle del vehículo -->
    <div v-show="currentStep === 1">
      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-ui-checks-grid"></i>
          <span>Formulario y detalle del vehículo</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-grid-2 mb-16">
            <div class="sc-field">
              <label>Formulario a mostrar</label>
              <select v-model="formData.landing_form_id">
                <option value="">Sin formulario</option>
                <option v-for="form in forms" :key="form.id" :value="form.id">{{ form.name }}</option>
              </select>
              <small>Se carga desde la biblioteca de formularios, igual que en PagesView</small>
            </div>
            <div class="sc-field">
              <label>Posición del formulario</label>
              <select v-model="formData.form_position">
                <option value="sidebar">Lateral / sidebar</option>
                <option value="below">Debajo del detalle</option>
                <option value="modal">Abrir en modal</option>
              </select>
            </div>
          </div>

          <div class="sc-toggle-list">
            <div class="sc-toggle-row" v-for="tog in productLandingToggles" :key="tog.key">
              <div class="sc-toggle-info">
                <span>{{ tog.label }}</span>
                <p>{{ tog.desc }}</p>
              </div>
              <label class="sc-switch">
                <input type="checkbox" v-model="formData[tog.key]" />
                <span class="sc-switch-track"></span>
              </label>
            </div>
          </div>

          <hr class="sc-divider-sm" />

          <div class="sc-field">
            <label>Datos del vehículo a mostrar</label>
            <div class="sc-pill-group">
              <button
                type="button"
                v-for="detail in vehicleDetailOptions"
                :key="detail.key"
                class="sc-pill"
                :class="{ active: formData.vehicle_detail_fields.includes(detail.key) }"
                @click="toggleVehicleDetail(detail.key)"
              >{{ detail.label }}</button>
            </div>
            <small>Estos campos salen del producto que recibe la landing</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Filtros dinámicos -->
    <div v-show="currentStep === 2">
      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-funnel-fill"></i>
          <span>
            Filtros dinámicos
            <span v-if="formData.filters.length" class="sc-badge">{{ formData.filters.length }}</span>
          </span>
          <div class="sc-card-head-actions">
            <span class="sc-hint">Las opciones se cargan automáticamente desde los datos del stock</span>
          </div>
        </div>
        <div class="card-body sc-card-body">

          <!-- Vacío -->
          <div v-if="!formData.filters.length" class="sc-empty">
            <i class="bi bi-funnel"></i>
            <p>Todavía no hay filtros. Agregá uno abajo.</p>
          </div>

          <!-- Lista de filtros -->
          <div v-if="formData.filters.length">
            <div
              v-for="(filter, fi) in formData.filters"
              :key="filter._id"
              class="sc-filter-item"
            >
              <div class="sc-filter-header">
                <i class="bi bi-grip-vertical sc-drag-handle"></i>
                <span class="sc-filter-badge">{{ filterMeta[filter.field]?.label || filter.field }}</span>
                <code class="sc-filter-key">{{ filter.json_key }}</code>
                <div class="sc-filter-controls">
                  <!-- Rango: solo muestra el tipo, sin selección de valores -->
                  <template v-if="filter.type === 'range'">
                    <span class="sc-type-badge sc-type-range">
                      <i class="bi bi-sliders"></i> Rango
                    </span>
                  </template>
                  <!-- Lista: permite single o multi -->
                  <template v-else>
                    <span class="sc-type-badge sc-type-list">
                      <i class="bi bi-list-ul"></i> Lista dinámica
                    </span>
                    <select v-model="filter.selection_type" class="sc-select-sm">
                      <option value="single">Selección única</option>
                      <option value="multi">Múltiple</option>
                    </select>
                  </template>
                  <select v-model="filter.display" class="sc-select-sm">
                    <option value="visible">Visible</option>
                    <option value="collapsed">Colapsado</option>
                    <option value="hidden">Oculto</option>
                  </select>
                  <button type="button" class="sc-icon-btn danger" @click="removeFilter(fi)" title="Eliminar filtro">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <!-- Info sobre comportamiento -->
              <div class="sc-filter-info">
                <i class="bi bi-info-circle"></i>
                <span v-if="filter.type === 'range'">
                  El front calcula automáticamente el mínimo y máximo desde los datos del stock usando <code>{{ filter.json_key }}</code>
                </span>
                <span v-else>
                  El front genera las opciones leyendo los valores únicos de <code>{{ filter.json_key }}</code> en el stock
                </span>
              </div>
            </div>
          </div>

          <hr class="sc-divider-sm" />

          <!-- Agregar filtro -->
          <div class="sc-add-filter-bar">
            <select v-model="newFilterField" class="sc-select-grow">
              <option value="" disabled>Seleccioná un campo para filtrar...</option>
              <option
                v-for="(meta, key) in filterMeta"
                :key="key"
                :value="key"
                :disabled="formData.filters.some(f => f.field === key)"
              >
                {{ meta.label }} — {{ meta.json_key }}
                {{ formData.filters.some(f => f.field === key) ? '(ya agregado)' : meta.type === 'range' ? '· rango' : '· lista' }}
              </option>
            </select>
            <button type="button" class="sc-btn sc-btn-primary" @click="addFilter" :disabled="!newFilterField">
              <i class="bi bi-plus-lg"></i> Agregar filtro
            </button>
          </div>

        </div>
      </div>

      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-sort-down"></i>
          <span>Orden por defecto</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-grid-2">
            <div class="sc-field">
              <label>Ordenar por</label>
              <select v-model="formData.default_sort">
                <option value="updated_desc">Más recientes primero</option>
                <option value="price_asc">Precio ascendente</option>
                <option value="price_desc">Precio descendente</option>
                <option value="brand_az">Marca A-Z</option>
                <option value="year_desc">Año más nuevo</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Búsqueda -->
    <div v-show="currentStep === 3">
      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-search"></i>
          <span>Buscador de texto</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-toggle-list">
            <div class="sc-toggle-row">
              <div class="sc-toggle-info">
                <span>Habilitar buscador</span>
                <p>Permite buscar por texto libre en los vehículos</p>
              </div>
              <label class="sc-switch">
                <input type="checkbox" v-model="formData.search_enabled" />
                <span class="sc-switch-track"></span>
              </label>
            </div>
          </div>
          <transition name="sc-fade">
            <div v-if="formData.search_enabled" class="sc-search-cfg">
              <hr class="sc-divider-sm" />
              <div class="sc-grid-2">
                <div class="sc-field sc-full">
                  <label>Placeholder del buscador</label>
                  <input v-model="formData.search_placeholder" type="text" placeholder="Buscar por marca, modelo, color..." />
                </div>
                <div class="sc-field">
                  <label>Buscar en campos</label>
                  <div class="sc-pill-group mt-4">
                    <button
                      type="button"
                      v-for="f in searchFields"
                      :key="f.key"
                      class="sc-pill"
                      :class="{ active: formData.search_fields.includes(f.key) }"
                      @click="toggleSearchField(f.key)"
                    >{{ f.label }}</button>
                  </div>
                </div>
                <div class="sc-field">
                  <label>Modo de búsqueda</label>
                  <div class="sc-pill-group mt-4">
                    <button type="button" class="sc-pill" :class="{ active: formData.search_realtime }" @click="formData.search_realtime = true">
                      En tiempo real
                    </button>
                    <button type="button" class="sc-pill" :class="{ active: !formData.search_realtime }" @click="formData.search_realtime = false">
                      Al presionar Enter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-eye-fill"></i>
          <span>Visibilidad y comportamiento</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-toggle-list">
            <div class="sc-toggle-row" v-for="tog in visibilityToggles" :key="tog.key">
              <div class="sc-toggle-info">
                <span>{{ tog.label }}</span>
                <p>{{ tog.desc }}</p>
              </div>
              <label class="sc-switch">
                <input type="checkbox" v-model="formData[tog.key]" />
                <span class="sc-switch-track"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Vista previa -->
    <div v-show="currentStep === 4">
      <!-- Resumen -->
      <div class="card data-card sc-card">
        <div class="card-header sc-card-head">
          <i class="bi bi-list-check"></i>
          <span>Resumen de configuración</span>
        </div>
        <div class="card-body sc-card-body">
          <div class="sc-grid-2">
            <div>
              <label class="sc-summary-label">Landing del producto</label>
              <div class="sc-chips">
                <span class="sc-chip blue">{{ formData.stock_title || 'Sin título' }}</span>
                <span class="sc-chip">{{ layoutLabel }}</span>
                <span class="sc-chip">{{ selectedFormName || 'Sin formulario' }}</span>
              </div>
            </div>
            <div>
              <label class="sc-summary-label">Filtros configurados ({{ formData.filters.length }})</label>
              <div class="sc-chips">
                <span v-if="!formData.filters.length" class="sc-chip">Sin filtros</span>
                <span
                  v-for="f in formData.filters"
                  :key="f._id"
                  class="sc-chip"
                  :class="f.type === 'range' ? 'amber' : 'blue'"
                >
                  <i class="bi" :class="f.type === 'range' ? 'bi-sliders' : 'bi-list-ul'"></i>
                  {{ filterMeta[f.field]?.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview visual -->
      <div class="sc-preview-panel">
        <div class="sc-preview-header">
          <span class="sc-preview-dot"></span>
          <span>Vista previa — así verán los usuarios la sección</span>
        </div>
        <div class="sc-preview-body" :style="{ background: formData.stock_background }">
          <h3 class="sc-prev-title" :style="{ color: formData.stock_text_color }">
            {{ formData.stock_title || 'Vehículos en Stock' }}
          </h3>
          <p class="sc-prev-sub" :style="{ color: formData.stock_text_color, opacity: 0.7 }">
            {{ formData.stock_subtitle }}
          </p>

          <div v-if="selectedFormName" class="sc-prev-landing-meta">
            <span
              class="sc-prev-chip"
              :style="{ borderColor: formData.stock_accent_color, color: formData.stock_accent_color, background: formData.stock_accent_color + '15' }"
            >
              Formulario: {{ selectedFormName }}
            </span>
          </div>

          <!-- Buscador preview -->
          <div v-if="formData.search_enabled" class="sc-prev-search" :style="{ borderColor: formData.stock_accent_color + '44' }">
            <i class="bi bi-search" :style="{ color: formData.stock_accent_color }"></i>
            <span :style="{ color: formData.stock_text_color, opacity: 0.4 }">
              {{ formData.search_placeholder || 'Buscar...' }}
            </span>
          </div>

          <!-- Filtros preview -->
          <div v-if="formData.filters.length" class="sc-prev-filters">
            <span
              class="sc-prev-chip"
              :style="{ borderColor: formData.stock_accent_color, color: formData.stock_accent_color, background: formData.stock_accent_color + '15' }"
            >Todos</span>
            <span
              v-for="f in formData.filters.slice(0, 4)"
              :key="f._id"
              class="sc-prev-chip"
              :style="{ borderColor: formData.stock_text_color + '33', color: formData.stock_text_color }"
            >{{ filterMeta[f.field]?.label }}</span>
          </div>

          <!-- Cards preview -->
          <div class="sc-prev-cards" :class="'cols-' + Math.min(formData.grid_columns, 3)">
            <div v-for="n in 3" :key="n" class="sc-prev-card">
              <div
                class="sc-prev-card-img"
                :style="{ height: formData.image_height, background: formData.stock_text_color + '0a' }"
              >
                <i class="bi bi-car-front" :style="{ color: formData.stock_text_color, opacity: 0.2 }"></i>
              </div>
              <div class="sc-prev-card-body">
                <p :style="{ color: formData.stock_text_color }">
                  {{ ['Toyota Corolla 2024','Honda Civic 2023','Ford Ranger 2024'][n-1] }}
                </p>
                <span v-if="formData.show_price" :style="{ color: formData.stock_accent_color }">
                  {{ ['$28.500','$25.000','$45.000'][n-1] }}
                </span>
                <div v-if="formData.show_location" class="sc-prev-loc" :style="{ color: formData.stock_text_color, opacity: 0.5 }">
                  <i class="bi bi-geo-alt-fill"></i> Buenos Aires
                </div>
                <button
                  v-if="formData.show_contact_btn"
                  class="sc-prev-btn"
                  :style="{ background: formData.stock_accent_color, color: '#fff' }"
                >Consultar</button>
              </div>
            </div>
          </div>

          <div v-if="formData.vehicle_detail_fields.length" class="sc-prev-details">
            <p :style="{ color: formData.stock_text_color }">Detalle del vehículo</p>
            <div class="sc-chips">
              <span
                v-for="field in selectedVehicleDetailLabels"
                :key="field"
                class="sc-chip"
              >{{ field }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación inferior -->
    <div class="sc-bottom-nav">
      <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary sc-btn" @click="prevStep">
        <i class="bi bi-arrow-left me-2"></i> Anterior
      </button>
      <div v-else></div>
      <button v-if="currentStep < steps.length - 1" type="button" class="btn btn-primary sc-btn sc-btn-primary" @click="nextStep">
        Siguiente <i class="bi bi-arrow-right ms-2"></i>
      </button>
      <button v-else type="button" class="btn btn-primary sc-btn sc-btn-primary" @click="saveForm" :disabled="saving">
        <i class="bi me-2" :class="saving ? 'bi-arrow-clockwise sc-spin' : 'bi-floppy'"></i>
        {{ saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar configuración' }}
      </button>
    </div>

    <!-- Toast -->
    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      :show.sync="showToastFlag"
      ref="toastComponent"
    />

  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import axios from 'axios'
import ToastComponent from '@/components/ToastComponent.vue'

const WEBHOOK_URL = 'https://apis.madautomate.cloud/webhook/6e89d000-f697-46a2-ba81-618901c9e240'
const FORMS_URL = 'https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302'

let _idCounter = 0
function uid() { return ++_idCounter }

function parseMaybeJSON(value, fallback) {
  if (value == null || value === '') return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function toNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default {
  name: 'StockConfigView',
  components: { ToastComponent },

  setup() {
    const instance = getCurrentInstance()

    // ── Stepper ─────────────────────────────────────────────────────────────
    const steps = ['Contenido y diseño', 'Detalle del vehículo', 'Filtros dinámicos', 'Búsqueda', 'Vista previa']
    const currentStep = ref(0)

    // ── Datos externos ───────────────────────────────────────────────────────
    const forms = ref([])
    const token = ref(null)
    const saving = ref(false)
    const editingId = ref(null)

    // ── Toast ────────────────────────────────────────────────────────────────
    const toastTitle = ref('')
    const toastMessage = ref('')
    const isSuccess = ref(true)
    const showToastFlag = ref(false)
    const toastComponent = ref(null)

    // ── Formulario ───────────────────────────────────────────────────────────
    const defaultForm = () => ({
      stock_title: 'Vehículos en Stock',
      stock_subtitle: '',
      stock_description: '',
      landing_show_menu: true,
      landing_show_footer: true,
      landing_show_breadcrumb: false,
      landing_form_id: '',
      landing_form_name: '',
      form_position: 'sidebar',
      show_gallery: true,
      show_accessories: true,
      show_comments: true,
      show_availability: true,
      show_pdf: true,
      vehicle_detail_fields: ['brand', 'model', 'version', 'year', 'odometer', 'color', 'location', 'price'],
      // Colores
      stock_background: '#ffffff',
      stock_text_color: '#1a1a1a',
      stock_accent_color: '#185FA5',
      // Layout
      layout_type: 'grid',
      grid_columns: 3,
      image_height: '220px',
      // Toggles tarjeta
      show_price: true,
      show_status_badge: true,
      show_location: true,
      show_mileage: false,
      show_contact_btn: true,
      filter_business_channel: true,
      // Filtros — sin valores, solo metadatos del campo
      filters: [],
      default_sort: 'updated_desc',
      items_per_page: 12,
      // Búsqueda
      search_enabled: true,
      search_placeholder: 'Buscar por marca, modelo, color, ubicación...',
      search_fields: ['brand', 'model', 'color', 'location'],
      search_realtime: true,
      // Visibilidad
      stock_is_visible: true,
      show_results_count: true,
      pagination_enabled: true,
      lazy_images: true
    })

    const formData = ref(defaultForm())

    // ── Metadatos de filtros ─────────────────────────────────────────────────
    // json_key: ruta exacta al campo en el objeto vehículo del API
    // type: 'list' (valores únicos) | 'range' (min/max numérico)
    // El front lee los datos del stock y construye las opciones dinámicamente
    const filterMeta = {
      brand:               { label: 'Marca',          json_key: 'brand',                    type: 'list' },
      model:               { label: 'Modelo',          json_key: 'model',                    type: 'list' },
      version:             { label: 'Versión',         json_key: 'version',                  type: 'list' },
      year:                { label: 'Año',             json_key: 'year',                     type: 'range' },
      color:               { label: 'Color',           json_key: 'color',                    type: 'list' },
      fuel:                { label: 'Combustible',     json_key: 'fuel.name',                type: 'list' },
      transmission:        { label: 'Transmisión',     json_key: 'transmission',             type: 'list' },
      odometer:            { label: 'Kilometraje',     json_key: 'odometer',                 type: 'range' },
      price:               { label: 'Precio',          json_key: 'prices[SALE_COST].value',  type: 'range' },
      availability_status: { label: 'Disponibilidad',  json_key: 'availability_status.name', type: 'list' },
      type:                { label: '0km o Usado',json_key: 'type.name',                type: 'list' },
      location:            { label: 'Ubicación',       json_key: 'location',                 type: 'list' },
      body:                { label: 'Carrocería',      json_key: 'body',                     type: 'list' },
      doors:               { label: 'Puertas',         json_key: 'doors',                    type: 'list' },
      business_channel:    { label: 'Tipo de negocio', json_key: 'business_channel',         type: 'list' },
      saving_plan:         { label: 'Tipo de vehículo'   , json_key: 'saving_plan.saving_plan_order',              type: 'list' },
    }

    const newFilterField = ref('')

    // ── UI ───────────────────────────────────────────────────────────────────
    const layoutOpts = [
      { value: 'grid',     icon: 'bi-grid-3x3-gap', label: 'Grilla',   desc: 'Tarjetas en columnas' },
      { value: 'list',     icon: 'bi-list-ul',       label: 'Lista',    desc: 'Una por fila' },
      { value: 'carousel', icon: 'bi-collection',    label: 'Carrusel', desc: 'Deslizable horizontal' }
    ]

    const colorFields = [
      { key: 'stock_background',  label: 'Color de fondo' },
      { key: 'stock_text_color',  label: 'Color de texto' },
      { key: 'stock_accent_color',label: 'Color de acento' }
    ]

    const cardToggles = [
      { key: 'show_price',        label: 'Mostrar precio',           desc: 'Precio de venta o consulta' },
      { key: 'show_status_badge', label: 'Badge de estado',          desc: 'Disponible / Reservado / Vendido' },
      { key: 'show_location',     label: 'Mostrar ubicación',        desc: 'Sucursal o localidad del vehículo' },
      { key: 'show_mileage',      label: 'Mostrar kilometraje',      desc: 'Solo aplica para usados' },
      { key: 'show_contact_btn',  label: 'Botón de contacto rápido', desc: 'Ver detalles' },
      { key: 'filter_business_channel', label: 'Filtro de Canal de Negocio', desc: 'Muestra el filtro B2B/B2C' }
    ]

    const productLandingToggles = [
      { key: 'show_gallery',      label: 'Galería del vehículo',        desc: 'Muestra fotos del array media del producto' },
      { key: 'show_accessories',  label: 'Accesorios',                  desc: 'Lista el contenido de accesories' },
      { key: 'show_comments',     label: 'Comentarios',                 desc: 'Muestra el campo comments si existe' },
      { key: 'show_availability', label: 'Estado de disponibilidad',    desc: 'Usa availability_status.name en la ficha' },
      { key: 'show_pdf',          label: 'Muestra PDF',                 desc: 'Permite descargar o visualizar PDF del vehículo' }
    ]

    const visibilityToggles = [
      { key: 'stock_is_visible',   label: 'Sección visible',           desc: 'Se mostrará en la landing page' },
      { key: 'show_results_count', label: 'Contador de resultados',     desc: 'Ej: "Mostrando 12 de 48 vehículos"' },
      { key: 'pagination_enabled', label: 'Paginación',                 desc: 'Botones anterior / siguiente' },
      { key: 'lazy_images',        label: 'Lazy loading de imágenes',   desc: 'Carga imágenes al hacer scroll' }
    ]

    const searchFields = [
      { key: 'brand',    label: 'Marca' },
      { key: 'model',    label: 'Modelo' },
      { key: 'color',    label: 'Color' },
      { key: 'location', label: 'Ubicación' },
      { key: 'version',  label: 'Versión' },
      { key: 'year',     label: 'Año' }
    ]

    const vehicleDetailOptions = [
      { key: 'brand', label: 'Marca' },
      { key: 'model', label: 'Modelo' },
      { key: 'version', label: 'Versión' },
      { key: 'year', label: 'Año' },
      { key: 'odometer', label: 'Kilometraje' },
      { key: 'color', label: 'Color' },
      { key: 'location', label: 'Ubicación' },
      { key: 'type', label: 'Tipo de vehículo' },
      { key: 'business_channel', label: 'Canal de negocio' },
      { key: 'availability_status', label: 'Disponibilidad' },
      { key: 'price', label: 'Precio' },
      { key: 'accesories', label: 'Accesorios' }
      
    ]

    // ── Computed ─────────────────────────────────────────────────────────────
    const layoutLabel = computed(() => layoutOpts.find(o => o.value === formData.value.layout_type)?.label || '')
    const selectedFormName = computed(() => {
      const selected = forms.value.find(form => String(form.id) === String(formData.value.landing_form_id))
      return selected?.name || formData.value.landing_form_name || ''
    })
    const selectedVehicleDetailLabels = computed(() =>
      vehicleDetailOptions
        .filter(detail => formData.value.vehicle_detail_fields.includes(detail.key))
        .map(detail => detail.label)
    )

    // ── Navegación ────────────────────────────────────────────────────────────
    function goStep(i) { currentStep.value = i }
    function nextStep() { if (currentStep.value < steps.length - 1) currentStep.value++ }
    function prevStep() { if (currentStep.value > 0) currentStep.value-- }

    // ── Filtros ───────────────────────────────────────────────────────────────
    // Agrega un filtro solo con metadatos del campo — sin valores hardcodeados.
    // El front de la landing lee json_key sobre los datos del stock para construir
    // las opciones (lista de valores únicos) o el rango (min/max) dinámicamente.
    function addFilter() {
      if (!newFilterField.value) return
      const meta = filterMeta[newFilterField.value]
      if (!meta) return
      formData.value.filters.push({
        _id: uid(),
        field: newFilterField.value,
        label: meta.label,
        json_key: meta.json_key,
        type: meta.type,
        // 'range' para numéricos, 'single'/'multi' para listas
        selection_type: meta.type === 'range' ? 'range' : 'single',
        display: 'visible'
      })
      newFilterField.value = ''
    }

    function removeFilter(index) {
      formData.value.filters.splice(index, 1)
    }

    // ── Búsqueda ──────────────────────────────────────────────────────────────
    function toggleSearchField(key) {
      const arr = formData.value.search_fields
      const i = arr.indexOf(key)
      i === -1 ? arr.push(key) : arr.splice(i, 1)
    }

    function toggleVehicleDetail(key) {
      const arr = formData.value.vehicle_detail_fields
      const i = arr.indexOf(key)
      i === -1 ? arr.push(key) : arr.splice(i, 1)
    }

    // ── Color picker ──────────────────────────────────────────────────────────
    function triggerColor(key) {
      const refs = instance.proxy.$refs
      const picker = refs['picker-' + key]
      if (picker) {
        const el = Array.isArray(picker) ? picker[0] : picker
        el.click()
      }
    }

    // ── Toast ─────────────────────────────────────────────────────────────────
    function triggerToast(title, message, success = true) {
      toastTitle.value = title
      toastMessage.value = message
      isSuccess.value = success
      toastComponent.value?.showToas?.()
    }

    // ── API ───────────────────────────────────────────────────────────────────
    async function getToken() {
      token.value = sessionStorage.getItem('token')
    }

    async function getForms() {
      try {
        const res = await axios.post(
          FORMS_URL,
          { action: 'dataforms' },
          { headers: { Authorization: `Bearer ${token.value}` } }
        )
        if (Array.isArray(res.data)) {
          forms.value = res.data.map(form => ({
            ...form,
            id: String(form.id)
          }))
        }
      } catch (e) { console.error('Error cargando formularios:', e) }
    }

    function normalizeConfig(config) {
      const base = defaultForm()
      const restored = JSON.parse(JSON.stringify(config || {}))

      const filters = parseMaybeJSON(restored.filters, [])
      const vehicleDetailFields = parseMaybeJSON(restored.vehicle_detail_fields, base.vehicle_detail_fields)
      const searchFieldsValue = parseMaybeJSON(restored.search_fields, base.search_fields)

      return {
        ...base,
        ...restored,
        id: restored.id ?? restored.stock_id ?? null,
        landing_show_menu: toBoolean(restored.landing_show_menu, base.landing_show_menu),
        landing_show_footer: toBoolean(restored.landing_show_footer, base.landing_show_footer),
        landing_show_breadcrumb: toBoolean(restored.landing_show_breadcrumb, base.landing_show_breadcrumb),
        show_gallery: toBoolean(restored.show_gallery, base.show_gallery),
        show_accessories: toBoolean(restored.show_accessories, base.show_accessories),
        show_comments: toBoolean(restored.show_comments, base.show_comments),
        show_availability: toBoolean(restored.show_availability, base.show_availability),
        show_pdf: toBoolean(restored.show_pdf, base.show_pdf),
        show_price: toBoolean(restored.show_price, base.show_price),
        show_status_badge: toBoolean(restored.show_status_badge, base.show_status_badge),
        show_location: toBoolean(restored.show_location, base.show_location),
        show_mileage: toBoolean(restored.show_mileage, base.show_mileage),
        show_contact_btn: toBoolean(restored.show_contact_btn, base.show_contact_btn),
        filter_business_channel: toBoolean(restored.filter_business_channel, base.filter_business_channel),
        search_enabled: toBoolean(restored.search_enabled, base.search_enabled),
        search_realtime: toBoolean(restored.search_realtime, base.search_realtime),
        stock_is_visible: toBoolean(restored.stock_is_visible, base.stock_is_visible),
        show_results_count: toBoolean(restored.show_results_count, base.show_results_count),
        pagination_enabled: toBoolean(restored.pagination_enabled, base.pagination_enabled),
        lazy_images: toBoolean(restored.lazy_images, base.lazy_images),
        grid_columns: toNumber(restored.grid_columns, base.grid_columns),
        items_per_page: toNumber(restored.items_per_page, base.items_per_page),
        landing_form_id: restored.landing_form_id ? String(restored.landing_form_id) : '',
        landing_form_name: restored.landing_form_name || '',
        filters: Array.isArray(filters) ? filters.map(f => ({ 
          ...f, 
          _id: uid(),
          label: f.label || filterMeta[f.field]?.label || ''
        })) : [],
        vehicle_detail_fields: Array.isArray(vehicleDetailFields) ? vehicleDetailFields : base.vehicle_detail_fields,
        search_fields: Array.isArray(searchFieldsValue) ? searchFieldsValue : base.search_fields
      }
    }

    async function getStockConfig() {
      try {
        const res = await axios.post(
          WEBHOOK_URL,
          { action: 'datastock' },
          { headers: { Authorization: `Bearer ${token.value}` } }
        )

        const payload = Array.isArray(res.data) ? res.data[0] : res.data
        if (!payload || typeof payload !== 'object') return

        const normalized = normalizeConfig(payload)
        editingId.value = normalized.id
        formData.value = normalized
      } catch (e) {
        console.error('Error cargando configuración de stock:', e)
      }
    }

    async function saveForm() {
      saving.value = true
      try {
        // Limpiamos _id interno antes de enviar
        const payload = JSON.parse(JSON.stringify(formData.value))
        payload.filters = payload.filters.map(({ _id, ...rest }) => rest)
        payload.landing_form_name = selectedFormName.value || ''
        payload.action = 'savestock'
        if (editingId.value) payload.id = editingId.value
        else delete payload.id
        
        const res = await axios.post(WEBHOOK_URL, payload, {
          headers: { Authorization: `Bearer ${token.value}` }
        })

        if (res.status === 200) {
          if (!editingId.value && res.data?.id) {
            editingId.value = res.data.id
            formData.value.id = res.data.id
          }
          triggerToast('¡Listo!', editingId.value ? 'Configuración actualizada' : 'Configuración creada', true)
        }
      } catch (e) {
        console.error(e)
        triggerToast('Error', 'No se pudo guardar la configuración', false)
      } finally {
        saving.value = false
      }
    }

    // Cargar config existente desde el listado
    function loadConfig(config) {
      const normalized = normalizeConfig(config)
      editingId.value = normalized.id
      formData.value = normalized
      currentStep.value = 0
    }

    function resetForm() {
      editingId.value = null
      formData.value = defaultForm()
      currentStep.value = 0
    }

    onMounted(async () => {
      await getToken()
      await getForms()
      await getStockConfig()
    })

    return {
      steps, currentStep, goStep, nextStep, prevStep,
      forms,
      formData, editingId, saving,
      newFilterField, filterMeta,
      layoutOpts, colorFields, cardToggles, productLandingToggles, visibilityToggles, searchFields, vehicleDetailOptions,
      layoutLabel, selectedFormName, selectedVehicleDetailLabels,
      addFilter, removeFilter,
      toggleSearchField, toggleVehicleDetail, triggerColor,
      saveForm, loadConfig, resetForm,
      toastTitle, toastMessage, isSuccess, showToastFlag, toastComponent
    }
  }
}
</script>

<style scoped>
/* ── Reset y base ─────────────────────────────────────────────────────────── */
.sc-page {
  padding: 0 0 5rem;
  max-width: 1120px;
  margin: 0 auto;
  font-family: var(--bs-body-font-family, inherit);
  color: #212529;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.sc-title {
  /* font-size: 1.75rem */
  font-weight: 700;
  color: #212529;
  margin: 0 0 4px;
  line-height: 1.2;
}
.sc-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0;
}
.sc-divider { border: none; border-top: 1px solid #dee2e6; margin: 0 0 1.5rem; }
.sc-divider-sm { border: none; border-top: 1px solid #e9ecef; margin: 1rem 0; }

/* ── Botones ─────────────────────────────────────────────────────────────── */
.sc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}
.sc-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.sc-btn-primary { box-shadow: none; }
.sc-btn-sm { font-size: 0.8rem; }
.sc-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
  color: #6c757d;
  font-size: 0.85rem;
}
.sc-icon-btn:hover { background: #f8f9fa; }
.sc-icon-btn.danger { border-color: #f5c2c7; color: #842029; }
.sc-icon-btn.danger:hover { background: #f8d7da; }

/* ── Stepper ─────────────────────────────────────────────────────────────── */
.sc-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}
.sc-step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  cursor: pointer;
  border-right: 1px solid #e9ecef;
  transition: background 0.15s;
}
.sc-step:last-child { border-right: none; }
.sc-step:hover:not(.active) { background: #f8f9fa; }
.sc-step.active { background: #EFF6FF; }
.sc-step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  flex-shrink: 0;
  transition: all 0.2s;
}
.sc-step.active .sc-step-num,
.sc-step.done .sc-step-num { background: #185FA5; border-color: #185FA5; color: #fff; }
.sc-step-label { font-size: 0.82rem; color: #6c757d; line-height: 1.3; }
.sc-step.active .sc-step-label { color: #185FA5; font-weight: 600; }
.sc-step.done .sc-step-label { color: #185FA5; }

/* ── Cards ───────────────────────────────────────────────────────────────── */
.sc-card {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}
.sc-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.9rem;
  font-weight: 600;
  color: #212529;
}
.sc-card-head i { color: #185FA5; font-size: 1rem; }
.sc-card-head-actions { margin-left: auto; }
.sc-hint { font-size: 0.78rem; color: #6c757d; font-weight: 400; }
.sc-card-body { padding: 1.25rem 1.35rem; }
.sc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 20px;
  background: #185FA5;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0 6px;
}

/* ── Grillas de campos ───────────────────────────────────────────────────── */
.sc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.sc-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
@media (max-width: 640px) {
  .sc-grid-2, .sc-grid-3 { grid-template-columns: 1fr; }
  .sc-stepper { flex-direction: column; }
  .sc-step { border-right: none; border-bottom: 1px solid #e9ecef; }
  .sc-step:last-child { border-bottom: none; }
}
.sc-field { display: flex; flex-direction: column; gap: 5px; }
.sc-full { grid-column: 1 / -1; }
.sc-field label { font-size: 0.78rem; font-weight: 600; color: #495057; }
.sc-field small { font-size: 0.75rem; color: #6c757d; }
.sc-field input[type="text"],
.sc-field input[type="number"],
.sc-field select,
.sc-field textarea {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #212529;
  background: #fff;
  transition: border-color 0.15s;
  width: 100%;
  font-family: var(--bs-body-font-family, inherit);
}
.sc-field input:focus,
.sc-field select:focus,
.sc-field textarea:focus { outline: none; border-color: #185FA5; box-shadow: 0 0 0 3px #185FA520; }
.sc-field textarea { resize: vertical; }
.mb-16 { margin-bottom: 1rem; }
.mt-4 { margin-top: 4px; }

/* ── Pills ───────────────────────────────────────────────────────────────── */
.sc-pill-group { display: flex; flex-wrap: wrap; gap: 6px; }
.sc-pill {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #dee2e6;
  background: #fff;
  color: #495057;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--bs-body-font-family, inherit);
}
.sc-pill:hover { border-color: #185FA5; color: #185FA5; }
.sc-pill.active { background: #EFF6FF; border-color: #185FA5; color: #185FA5; font-weight: 600; }

/* ── Layout opts ─────────────────────────────────────────────────────────── */
.sc-layout-opts { display: flex; gap: 10px; }
.sc-layout-opt {
  flex: 1;
  border: 1.5px solid #dee2e6;
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.sc-layout-opt:hover { border-color: #185FA5; background: #f8fbff; }
.sc-layout-opt.active { border-color: #185FA5; background: #EFF6FF; }
.sc-layout-opt i { font-size: 1.5rem; color: #6c757d; }
.sc-layout-opt.active i { color: #185FA5; }
.sc-layout-opt span { font-size: 0.85rem; font-weight: 600; color: #495057; }
.sc-layout-opt.active span { color: #185FA5; }
.sc-layout-opt small { font-size: 0.72rem; color: #6c757d; }

/* ── Color picker ────────────────────────────────────────────────────────── */
.sc-color-row { display: flex; gap: 8px; align-items: center; }
.sc-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.sc-swatch input[type="color"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: none;
  padding: 0;
}
.sc-color-text { flex: 1; }

/* ── Toggles ─────────────────────────────────────────────────────────────── */
.sc-toggle-list { display: flex; flex-direction: column; }
.sc-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f5;
  gap: 1rem;
}
.sc-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
.sc-toggle-info span { font-size: 0.88rem; font-weight: 600; color: #1a1a2e; }
.sc-toggle-info p { font-size: 0.78rem; color: #6c757d; margin: 2px 0 0; }
.sc-switch { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
.sc-switch input { opacity: 0; width: 0; height: 0; }
.sc-switch-track {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: #dee2e6;
  cursor: pointer;
  transition: background 0.2s;
}
.sc-switch input:checked + .sc-switch-track { background: #185FA5; }
.sc-switch-track::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.sc-switch input:checked + .sc-switch-track::after { left: 21px; }

/* ── Filtros ─────────────────────────────────────────────────────────────── */
.sc-empty {
  text-align: center;
  padding: 2rem;
  border: 1.5px dashed #dee2e6;
  border-radius: 10px;
  color: #6c757d;
  background: #f8f9fa;
}
.sc-empty i { font-size: 2rem; display: block; margin-bottom: 8px; }
.sc-empty p { font-size: 0.85rem; margin: 0; }

.sc-filter-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}
.sc-filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.sc-drag-handle { color: #adb5bd; cursor: grab; font-size: 1rem; }
.sc-filter-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: #EFF6FF;
  color: #185FA5;
  border: 1px solid #B5D4F4;
  white-space: nowrap;
}
.sc-filter-key {
  font-size: 0.72rem;
  font-family: monospace;
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 2px 8px;
  border-radius: 4px;
  color: #495057;
}
.sc-filter-controls { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-wrap: wrap; }
.sc-select-sm {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.78rem;
  color: #495057;
  background: #fff;
  cursor: pointer;
}
.sc-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.sc-type-list { background: #EAF3DE; color: #3B6D11; border: 1px solid #C0DD97; }
.sc-type-range { background: #FAEEDA; color: #854F0B; border: 1px solid #FAC775; }

.sc-filter-info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #6c757d;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 7px 10px;
}
.sc-filter-info i { color: #185FA5; font-size: 0.85rem; flex-shrink: 0; margin-top: 1px; }
.sc-filter-info code {
  font-family: monospace;
  font-size: 0.72rem;
  background: #f1f3f5;
  padding: 1px 5px;
  border-radius: 3px;
  color: #185FA5;
}

.sc-add-filter-bar {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #dee2e6;
}
.sc-select-grow {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #495057;
  background: #fff;
}

/* ── Resumen chips ───────────────────────────────────────────────────────── */
.sc-summary-label { font-size: 0.78rem; font-weight: 600; color: #495057; display: block; margin-bottom: 8px; }
.sc-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sc-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}
.sc-chip.blue { background: #EFF6FF; color: #185FA5; border-color: #B5D4F4; }
.sc-chip.amber { background: #FAEEDA; color: #854F0B; border-color: #FAC775; }

/* ── Preview ─────────────────────────────────────────────────────────────── */
.sc-preview-panel { border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04); }
.sc-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.82rem;
  color: #495057;
  font-weight: 500;
}
.sc-preview-dot { width: 8px; height: 8px; border-radius: 50%; background: #28a745; flex-shrink: 0; }
.sc-preview-body { padding: 1.5rem; transition: background 0.3s; }
.sc-prev-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; transition: color 0.3s; }
.sc-prev-sub { font-size: 0.9rem; margin: 0 0 1rem; transition: color 0.3s; }
.sc-prev-landing-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.sc-prev-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1.5px solid;
  border-radius: 10px;
  margin-bottom: 12px;
  background: rgba(255,255,255,0.5);
}
.sc-prev-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem; }
.sc-prev-chip { padding: 5px 14px; border-radius: 20px; border: 1.5px solid; font-size: 0.8rem; font-weight: 500; }
.sc-prev-cards { display: grid; gap: 12px; }
.sc-prev-cards.cols-2 { grid-template-columns: repeat(2, 1fr); }
.sc-prev-cards.cols-3 { grid-template-columns: repeat(3, 1fr); }
.sc-prev-card { border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.7); }
.sc-prev-card-img { display: flex; align-items: center; justify-content: center; transition: height 0.3s; }
.sc-prev-card-img i { font-size: 2rem; }
.sc-prev-card-body { padding: 10px; }
.sc-prev-card-body p { font-size: 0.82rem; font-weight: 600; margin: 0 0 3px; }
.sc-prev-card-body span { font-size: 0.88rem; font-weight: 700; }
.sc-prev-loc { font-size: 0.72rem; margin-top: 4px; display: flex; align-items: center; gap: 3px; }
.sc-prev-btn {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 6px;
  border-radius: 6px;
  border: none;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: default;
}
.sc-prev-details { margin-top: 1rem; }
.sc-prev-details p { font-size: 0.85rem; font-weight: 600; margin: 0 0 8px; }

/* ── Navegación inferior ─────────────────────────────────────────────────── */
.sc-bottom-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* ── Animaciones ─────────────────────────────────────────────────────────── */
.sc-fade-enter-active, .sc-fade-leave-active { transition: all 0.2s ease; }
.sc-fade-enter-from, .sc-fade-leave-to { opacity: 0; transform: translateY(-6px); }
@keyframes sc-spin { to { transform: rotate(360deg); } }
.sc-spin { display: inline-block; animation: sc-spin 0.8s linear infinite; }
</style>
