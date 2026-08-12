<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <h2>
        <i class="bi bi-gear me-2"></i>
        Configuración del PDF general
      </h2>
      <button type="button" class="btn btn-primary btn-save" @click="saveConfig" :disabled="loading">
        <i class="bi me-2" :class="loading ? 'bi-arrow-clockwise sc-spin' : 'bi-floppy'"></i>{{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
    <hr class="header-divider">

    <div class="hf-stepper">
      <button
        v-for="(step, index) in configSteps"
        :key="step.key"
        type="button"
        class="hf-step-item"
        :class="{ active: currentStep === index, done: currentStep > index }"
        @click="goToStep(index)"
      >
        <div class="hf-step-num">
          <i v-if="currentStep > index" class="bi bi-check-lg"></i>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="hf-step-copy">
          <span>{{ step.label }}</span>
          <small>{{ step.description }}</small>
        </div>
      </button>
    </div>

    <div class="hf-step-content">
      <!-- STEP 1: LOGO -->
      <div v-show="currentStep === 0">
        <div class="card settings-card mb-4">
          <div class="pages-card-head">
            <i class="bi bi-image-fill me-2"></i>
            <span>Logo de la Empresa</span>
          </div>
          <div class="card-body p-4">
            <div class="settings-group">
              <label class="settings-label">
                <i class="bi bi-cloud-upload me-2"></i>
                Cargar Logo
              </label>
              <p class="settings-description">
                Cargá una imagen como logo de tu empresa
              </p>

              <input
                type="file"
                class="d-none"
                id="logoInput"
                accept="image/png, image/jpeg, image/webp"
                @change="onLogoSelected"
              />

              <label for="logoInput" class="file-input-label">
                <i class="bi bi-cloud-upload me-2"></i>
                <span>{{ logoFileName || 'PNG, JPG, WEBP permitidos' }}</span>
              </label>

              <div class="row g-3 mt-3">
                <div class="col-md-6">
                  <label class="settings-label">
                    <i class="bi bi-aspect-ratio me-2"></i>
                    Ancho del Logo (mm)
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="config.company.logoWidth"
                    min="30"
                    max="150"
                    step="1"
                  />
                </div>
                <div class="col-md-6">
                  <label class="settings-label">
                    <i class="bi bi-aspect-ratio me-2"></i>
                    Altura del Logo (mm)
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="config.company.logoHeight"
                    min="10"
                    max="50"
                    step="1"
                  />
                </div>
              </div>

              <div v-if="logoPreview" class="image-preview-container">
                <div class="image-preview">
                  <img
                    :src="logoPreview"
                    alt="Logo Preview"
                    class="preview-image"
                  />
                  <button
                    class="btn-remove-image"
                    @click="removeLogo"
                    title="Eliminar imagen"
                    type="button"
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
                <p class="image-info">
                  <i class="bi bi-check-circle-fill text-success me-1"></i>
                  Logo cargado correctamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: DATOS DE EMPRESA -->
      <div v-show="currentStep === 1">
        <div class="card settings-card mb-4">
          <div class="pages-card-head">
            <i class="bi bi-building me-2"></i>
            <span>Datos de la Empresa</span>
          </div>
          <div class="card-body p-4">

            <div class="container">
              <div class="row">
                <div class="col-6">
                  <div class="settings-group">
                    <label class="settings-label">Nombre de Empresa</label>
                    <p class="settings-description">Nombre que aparecerá en los PDFs</p>
                    <input
                      type="text"
                      class="form-control"
                      v-model="config.company.name"
                      placeholder="Mi Empresa S.A."
                    />
                  </div>
                </div>

                <div class="col-6">
                  <div class="settings-group">
                    <label class="settings-label">Teléfono</label>
                    <p class="settings-description">Número de contacto</p>
                    <input
                      type="text"
                      class="form-control"
                      v-model="config.company.phone"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div class="col-6">
                  <div class="settings-group mt-3">
                    <label class="settings-label">Email</label>
                    <p class="settings-description">Correo de contacto</p>
                    <input
                      type="email"
                      class="form-control"
                      v-model="config.company.email"
                      placeholder="info@miempresa.com"
                    />
                  </div>
                </div>

                <div class="col-6">
                  <div class="settings-group mt-3">
                    <label class="settings-label">Sitio Web</label>
                    <p class="settings-description">URL de tu sitio web</p>
                    <input
                      type="text"
                      class="form-control"
                      v-model="config.company.website"
                      placeholder="www.miempresa.com"
                    />
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- STEP 3: INFORMACIÓN FINANCIERA -->
      <div v-show="currentStep === 2">
        <div class="card settings-card mb-4">
          <div class="pages-card-head">
            <i class="bi bi-bank me-2"></i>
            <span>Información Financiera</span>
          </div>
          <div class="card-body p-4">
            <div class="settings-group">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="settings-label mb-0">
                  <i class="bi bi-cash-coin me-2"></i>
                  Información Financiera / Bancaria
                </label>
                <button 
                  type="button"
                  class="text-info m-0"
                  @click="showPdfHelpModal = true"
                  title="Ver ayuda sobre variables dinámicas"
                >
                  <i class="bi bi-question-circle me-1"></i>
                  Ayuda
                </button>
              </div>
              <p class="settings-description">
                Agregá los datos financieros o bancarios que desees incluir en los PDFs
              </p>
              <textarea
                class="form-control"
                v-model="config.company.financialInfo"
                rows="5"
                placeholder="Ej:&#10;Banco: Nombre del Banco&#10;Cuenta: 123-456-789&#10;SWIFT: SWIFTCODE&#10;NIT: 123.456.789-0&#10;&#10;O cualquier otra información financiera que desees incluir..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: TEXTOS PERSONALIZADOS -->
      <div v-show="currentStep === 3">
        <div class="card settings-card mb-4">
          <div class="pages-card-head">
            <i class="bi bi-text-paragraph me-2"></i>
            <span>Textos Personalizados</span>
          </div>
          <div class="card-body p-4">
            <div class="settings-group">
              <label class="settings-label">
                <i class="bi bi-chat-dots me-2"></i>
                Mensaje por Defecto
              </label>
              <p class="settings-description">
                Mensaje que aparecerá automáticamente en los PDFs
              </p>
              <textarea
                class="form-control"
                v-model="config.defaultMessage"
                rows="3"
                placeholder="Mensaje que aparecerá en los PDFs..."
              ></textarea>
            </div>

            <div class="settings-group mt-3">
              <label class="settings-label">
                <i class="bi bi-file-earmark-text me-2"></i>
                Pie de Página
              </label>
              <p class="settings-description">
                Texto que aparecerá al final de cada PDF
              </p>
              <textarea
                class="form-control"
                v-model="config.footerText"
                rows="2"
                placeholder="Texto que aparecerá al final de cada PDF..."
              ></textarea>
            </div>

            <div class="settings-group mt-3">
              <label class="settings-label">
                <i class="bi bi-file-earmark-check me-2"></i>
                Términos y Condiciones (opcional)
              </label>
              <p class="settings-description">
                Términos que aparecerán en los PDFs
              </p>
              <textarea
                class="form-control"
                v-model="config.termsText"
                rows="2"
                placeholder="Términos que aparecerán en los PDFs..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 5: ESTILOS -->
      <div v-show="currentStep === 4">
        <div class="card settings-card mb-4">
          <div class="pages-card-head">
            <i class="bi bi-palette-fill me-2"></i>
            <span>Estilos del PDF</span>
          </div>
          <div class="card-body p-4">
            <div class="row g-4">
              <div class="col-12 col-md-6">
                <div class="settings-group">
                  <label class="settings-label">
                    <i class="bi bi-paint-bucket me-2"></i>
                    Color Principal
                  </label>
                  <p class="settings-description">
                    Color primario para encabezados y acentos
                  </p>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="config.styles.primaryColor"
                      class="color-input"
                    />
                    <input 
                      type="text" 
                      v-model="config.styles.primaryColor" 
                      class="color-value-input"
                      placeholder="#0066CC"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="settings-group">
                  <label class="settings-label">
                    <i class="bi bi-paint-bucket me-2"></i>
                    Color Secundario
                  </label>
                  <p class="settings-description">
                    Color de acento secundario
                  </p>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="config.styles.accentColor"
                      class="color-input"
                    />
                    <input 
                      type="text" 
                      v-model="config.styles.accentColor" 
                      class="color-value-input"
                      placeholder="#FF6B35"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="settings-group">
                  <label class="settings-label">
                    <i class="bi bi-fonts me-2"></i>
                    Color de Texto
                  </label>
                  <p class="settings-description">
                    Color del texto principal
                  </p>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="config.styles.textColor"
                      class="color-input"
                    />
                    <input 
                      type="text" 
                      v-model="config.styles.textColor" 
                      class="color-value-input"
                      placeholder="#333333"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="settings-group">
                  <label class="settings-label">
                    <i class="bi bi-paint-bucket me-2"></i>
                    Color de Fondo
                  </label>
                  <p class="settings-description">
                    Color del fondo del PDF
                  </p>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="config.styles.backgroundColor"
                      class="color-input"
                    />
                    <input 
                      type="text" 
                      v-model="config.styles.backgroundColor" 
                      class="color-value-input"
                      placeholder="#F5F5F5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 6: VISTA PREVIA FINAL -->
      <div v-show="currentStep === 5">
        <div class="footer-preview-section">
          <div class="preview-section-header">
            <i class="bi bi-eye-fill me-2"></i>
            Vista previa del PDF
          </div>
          <div 
            class="footer-preview" 
            :style="{ 
              background: config.styles.backgroundColor, 
              color: config.styles.textColor 
            }"
          >
            <!-- Logo arriba a la izquierda -->
            <div class="footer-preview-top">
              <div class="footer-preview-logo-section">
                <img 
                  v-if="logoPreview"
                  :src="logoPreview"
                  alt="Logo"
                  class="footer-preview-logo"
                />
                <div v-else class="footer-placeholder">Logo</div>
              </div>
            </div>

            <!-- Contenido debajo -->
            <div class="footer-preview-content">
              <!-- Empresa Info -->
              <div class="footer-preview-col">
                <h4 :style="{ color: config.styles.primaryColor }">{{ config.company.name || 'Nombre Empresa' }}</h4>
                <p style="font-size: 0.85rem; margin: 0.5rem 0;">{{ config.company.phone || '+1234567890' }}</p>
                <p style="font-size: 0.85rem; margin: 0.5rem 0;">{{ config.company.email || 'info@empresa.com' }}</p>
                <p style="font-size: 0.85rem; margin: 0.5rem 0;">{{ config.company.website || 'www.empresa.com' }}</p>
              </div>

              <!-- Bank Info -->
              <div class="footer-preview-col">
                <div v-if="config.company.financialInfo" style="margin-bottom: 1rem;">
                  <p style="font-size: 0.75rem; margin: 0.3rem 0; font-weight: 600;">Información Financiera:</p>
                  <p style="font-size: 0.75rem; margin: 0.3rem 0; white-space: pre-wrap;">{{ config.company.financialInfo }}</p>
                </div>
                <div v-if="config.defaultMessage" style="margin-bottom: 0.5rem;">
                  <p style="font-size: 0.8rem; margin: 0; font-style: italic;">{{ config.defaultMessage }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje y Pie -->
          <div style="margin-top: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 8px;">
            <div v-if="config.defaultMessage" style="margin-bottom: 1rem;">
              <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Mensaje:</p>
              <p style="font-size: 0.85rem; color: #6b7280; margin: 0;">{{ config.defaultMessage }}</p>
            </div>
            <div v-if="config.footerText">
              <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Pie de página:</p>
              <p style="font-size: 0.8rem; color: #9ca3af; text-align: center; margin: 0;">{{ config.footerText }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hf-step-actions">
      <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStep">
        <i class="bi bi-arrow-left me-2"></i>Anterior
      </button>
      <div v-else></div>
      <button v-if="currentStep < configSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
        Siguiente <i class="bi bi-arrow-right ms-2"></i>
      </button>
      <button v-else type="button" class="btn btn-primary" @click="saveConfig" :disabled="loading">
        <i class="bi me-2" :class="loading ? 'bi-arrow-clockwise sc-spin' : 'bi-floppy'"></i>{{ loading ? 'Guardando...' : 'Guardar' }}
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

    <!-- Modal de Ayuda: Variables PDF -->
    <div class="modal" :class="{ show: showPdfHelpModal }" :style="{ display: showPdfHelpModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-question-circle me-2"></i>
              Ayuda: Variables Dinámicas para PDF
            </h5>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              @click="showPdfHelpModal = false"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <h6 class="fw-bold text-primary mb-3">📋 Variables Disponibles</h6>
              <div class="table-responsive">
                <table class="table table-sm table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>Variable</th>
                      <th>Descripción</th>
                      <th>Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>#sym:price</code></td>
                      <td>Precio de venta del vehículo</td>
                      <td>50000</td>
                    </tr>
                    <tr>
                      <td><code>#sym:mileage</code></td>
                      <td>Kilometraje del vehículo</td>
                      <td>45000</td>
                    </tr>
                    <tr>
                      <td><code>#sym:year</code></td>
                      <td>Año del vehículo</td>
                      <td>2022</td>
                    </tr>
                    <tr>
                      <td><code>#sym:month</code></td>
                      <td>Mes actual</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td><code>#sym:brand</code></td>
                      <td>Marca del vehículo</td>
                      <td>Toyota</td>
                    </tr>
                    <tr>
                      <td><code>#sym:model</code></td>
                      <td>Modelo del vehículo</td>
                      <td>Corolla</td>
                    </tr>
                    <tr>
                      <td><code>#sym:color</code></td>
                      <td>Color del vehículo</td>
                      <td>Blanco</td>
                    </tr>
                    <tr>
                      <td><code>#sym:version</code></td>
                      <td>Versión del vehículo</td>
                      <td>XLE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-primary mb-3">🧮 Operadores y Funciones</h6>
              <div class="bg-light p-3 rounded mb-2">
                <p class="mb-2"><strong>Operadores matemáticos:</strong></p>
                <p><code>+ - * / ( )</code></p>
              </div>
              <div class="bg-light p-3 rounded">
                <p class="mb-2"><strong>Funciones disponibles:</strong></p>
                <ul class="mb-0 ps-3">
                  <li><code>Math.round()</code> - Redondea a número entero</li>
                  <li><code>Math.floor()</code> - Redondea hacia abajo</li>
                  <li><code>Math.ceil()</code> - Redondea hacia arriba</li>
                  <li><code>Math.abs()</code> - Valor absoluto</li>
                  <li><code>Math.pow(base, exp)</code> - Potencia</li>
                  <li><code>Math.sqrt()</code> - Raíz cuadrada</li>
                </ul>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-primary mb-3">📝 Ejemplos de Uso</h6>
              <div class="bg-light p-3 rounded mb-3">
                <p class="mb-2"><strong>Ejemplo 1: Mensualidad simple</strong></p>
                <code>Mensualidad a 60 meses: #sym:price * 0.02</code>
                <p class="text-muted small mt-1">Resultado: "Mensualidad a 60 meses: 1,000.00"</p>
              </div>
              <div class="bg-light p-3 rounded mb-3">
                <p class="mb-2"><strong>Ejemplo 2: Con función Math</strong></p>
                <code>Cuota mensual: Math.round(#sym:price * 0.025)</code>
                <p class="text-muted small mt-1">Resultado: "Cuota mensual: 1,250"</p>
              </div>
              <div class="bg-light p-3 rounded mb-3">
                <p class="mb-2"><strong>Ejemplo 3: Múltiples líneas</strong></p>
                <code style="white-space: pre-line">Mensualidad: #sym:price * 0.02
Apertura: #sym:price * 0.02 + 5000
Seguro: Math.round(#sym:price * 0.005)</code>
                <p class="text-muted small mt-1">Resultado: Cada línea se calcula por separado</p>
              </div>
              <div class="bg-light p-3 rounded">
                <p class="mb-2"><strong>Ejemplo 4: Información estática</strong></p>
                <code>Tasa de interés anual: 2.5%</code>
                <p class="text-muted small mt-1">Las líneas sin variables se mantienen igual</p>
              </div>
            </div>

            <div class="alert alert-info mb-0">
              <i class="bi bi-lightbulb me-2"></i>
              <strong>Consejo:</strong> Las líneas que contienen un signo ":" se evalúan automáticamente. 
              Si incluyen operaciones matemáticas, se calcularán y se formatearán con separadores de miles.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPdfHelpModal = false">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fondo del modal -->
    <div 
      class="modal-backdrop fade" 
      :class="{ show: showPdfHelpModal }"
      :style="{ display: showPdfHelpModal ? 'block' : 'none' }"
      @click="showPdfHelpModal = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ToastComponent from '@/components/ToastComponent.vue'

const loading = ref(false)
const logoPreview = ref(null)
const logoFileName = ref('')
const currentStep = ref(0)
const token = ref(null)
const showPdfHelpModal = ref(false)  // Modal de ayuda para variables PDF

// Configuración de pasos (stepper)
const configSteps = [
  { key: 'logo', label: 'Logo', description: 'Cargá el logo' },
  { key: 'empresa', label: 'Empresa', description: 'Datos de empresa' },
  { key: 'financiero', label: 'Financiero', description: 'Datos bancarios' },
  { key: 'textos', label: 'Textos', description: 'Mensajes y textos' },
  { key: 'estilos', label: 'Estilos', description: 'Colores y estilos' },
  { key: 'preview', label: 'Vista Previa', description: 'Cómo se verá el PDF' }
]

// Estado inicial de la configuración
const initialConfig = {
  company: {
    name: 'Mi Empresa',
    phone: '+1234567890',
    email: 'info@miempresa.com',
    website: 'www.miempresa.com',
    financialInfo: '',
    logo: null,
    logoHeight: 20,
    logoWidth: 60
  },
  styles: {
    primaryColor: '#0066CC',
    accentColor: '#FF6B35',
    backgroundColor: '#F5F5F5',
    textColor: '#333333'
  },
  defaultMessage: 'Le presentamos este vehículo de nuestro catálogo. Para más información, no dude en contactarnos.',
  footerText: '© 2024 Mi Empresa. Todos los derechos reservados.',
  termsText: ''
}

const config = ref({ ...initialConfig })

// Toast
const toastTitle = ref('')
const toastMessage = ref('')
const isSuccess = ref(true)
const showToast = ref(false)
const toastComponent = ref(null)

function showToastMsg(title, message, success = true) {
  toastTitle.value = title
  toastMessage.value = message
  isSuccess.value = success
  showToast.value = true
}

// Obtener token de sessionStorage
function getToken() {
  token.value = sessionStorage.getItem('token')
}

// Métodos del Stepper
function goToStep(index) {
  currentStep.value = index
}

function nextStep() {
  if (currentStep.value < configSteps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Cargar logo
function onLogoSelected(event) {
  const file = event.target.files?.[0]
  if (file) {
    logoFileName.value = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result
      config.value.company.logo = logoPreview.value
    }
    reader.readAsDataURL(file)
  }
}

// Remover logo
function removeLogo() {
  logoPreview.value = null
  logoFileName.value = ''
  config.value.company.logo = null
}

// Cargar configuración existente desde API
async function loadConfig() {
  loading.value = true
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

    if (!response.ok) {
      throw new Error(`Error en API: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.config) {
      config.value = { ...initialConfig, ...data.config }
      if (config.value.company.logo) {
        logoPreview.value = config.value.company.logo
      }
      console.log('Configuración cargada desde API:', config.value)
    }
  } catch (error) {
    console.error('Error cargando configuración desde API:', error)
    // Si falla la API, usar localStorage como respaldo
    try {
      const saved = localStorage.getItem('vehiclesPdfConfig')
      if (saved) {
        const parsed = JSON.parse(saved)
        config.value = { ...initialConfig, ...parsed }
        if (config.value.company.logo) {
          logoPreview.value = config.value.company.logo
        }
      }
    } catch (localError) {
      console.error('Error cargando configuración local:', localError)
    }
  } finally {
    loading.value = false
  }
}

// Guardar configuración en API
async function saveConfig() {
  loading.value = true
  try {
    // Preparar el payload para enviar a la API
    const payload = {
      action: 'setConfigPdf',
      config: config.value
    }

    // Log de lo que se va a guardar en la DB
    console.log('Guardando configuración en BD:', JSON.stringify(payload, null, 2))

    const headers = {
      'Content-Type': 'application/json',
      ...(token.value && { 'Authorization': `Bearer ${token.value}` })
    }

    const response = await fetch(
      'https://apis.madautomate.cloud/webhook/6e89d000-f697-46a2-ba81-618901c9e240',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }
    )

    if (!response.ok) {
      throw new Error(`Error en API: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API:', data)

    showToastMsg('Éxito', 'Configuración guardada correctamente en la base de datos')
    if (toastComponent.value) {
      toastComponent.value.showToas()
    }
  } catch (error) {
    console.error('Error guardando configuración:', error)
    showToastMsg('Error', 'No se pudo guardar la configuración', false)
    if (toastComponent.value) {
      toastComponent.value.showToas()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getToken()
  loadConfig()
})
</script>

<style scoped>
/* Stepper Styles */
.hf-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1.5rem;
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
  margin-top: 1rem;
  margin-bottom: 2rem;
}

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
}


.btn-save {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Settings Card */
.settings-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
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

/* File Input */
.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #374151;
}

.file-input-label:hover {
  border-color: #3939ff;
  background: #f9fafb;
  color: #3939ff;
}

/* Image Preview */
.image-preview-container {
  margin-top: 1rem;
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-image {
  max-height: 150px;
  display: block;
  border-radius: 8px;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-remove-image:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.image-info {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

/* Color Picker */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.color-input {
  width: 60px;
  height: 50px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-value-input {
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  transition: all 0.2s ease;
}

.color-value-input:focus {
  outline: none;
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

/* Footer Preview */
.footer-preview-section {
  width: 100%;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 2px solid #e5e7eb;
}

.preview-section-header {
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.footer-preview {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border-radius: 8px;
  min-height: 200px;
}

.footer-preview-top {
  margin-bottom: 1.5rem;
}

.footer-preview-logo-section {
  display: flex;
  align-items: flex-start;
}

.footer-preview-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.footer-preview-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  font-size: 0.9rem;
}

.footer-preview-logo {
  max-height: 80px;
  max-width: 150px;
  object-fit: contain;
}

.footer-placeholder {
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 992px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-save {
    width: 100%;
    justify-content: center;
  }

  .footer-preview {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .hf-stepper {
    flex-direction: column;
  }

  .hf-step-item {
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .hf-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 768px) {
  .hf-step-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hf-step-actions .btn {
    width: 100%;
  }
}

/* Spin animation for loading */
@keyframes sc-spin {
  to { transform: rotate(360deg); }
}

.sc-spin {
  display: inline-block;
  animation: sc-spin 0.8s linear infinite;
}
</style>
