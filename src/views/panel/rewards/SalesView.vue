<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <div>
        <h2>Importar Ventas</h2>
        <p class="subtitle">Cargá tu archivo Excel y mapeá las columnas para importar ventas</p>
      </div>
      
      <button 
        class="btn btn-outline-secondary btn-reset"
        @click="clearFile"
        :disabled="!fileName"
        v-if="fileName"
      >
        <i class="bi bi-arrow-clockwise me-2"></i>
        Reiniciar
      </button>
      
    </div>
    <hr class="header-divider">

    <!-- Step Progress -->
    <div class="steps-container mb-5">
      <div class="step" :class="{ 'active': currentStep >= 1, 'completed': currentStep > 1 }">
        <div class="step-icon">
          <i class="bi bi-file-earmark-arrow-up"></i>
        </div>
        <div class="step-content">
          <div class="step-number">Paso 1</div>
          <div class="step-title">Cargar Archivo</div>
        </div>
      </div>

      <div class="step-connector" :class="{ 'active': currentStep >= 2 }"></div>

      <div class="step" :class="{ 'active': currentStep >= 2, 'completed': currentStep > 2 }">
        <div class="step-icon">
          <i class="bi bi-columns-gap"></i>
        </div>
        <div class="step-content">
          <div class="step-number">Paso 2</div>
          <div class="step-title">Mapear Columnas</div>
        </div>
      </div>

      <div class="step-connector" :class="{ 'active': currentStep >= 3 }"></div>

      <div class="step" :class="{ 'active': currentStep >= 3 }">
        <div class="step-icon">
          <i class="bi bi-eye"></i>
        </div>
        <div class="step-content">
          <div class="step-number">Paso 3</div>
          <div class="step-title">Vista Previa</div>
        </div>
      </div>
    </div>
    
    <!-- Paso 1: Cargar Archivo -->
    <div class="card upload-card mb-4">
      <div class="card-header-custom">
        <i class="bi bi-file-earmark-arrow-up me-2"></i>
        <span>Paso 1: Seleccionar archivo</span>
      </div>
      <div class="card-body p-4">
        <div class="upload-zone" :class="{ 'has-file': fileName }">
          <input 
            type="file" 
            ref="fileInput"
            class="d-none"
            id="fileUpload"
            accept=".xlsx,.xls,.csv"
            @change="handleFileUpload"
          >
          
          <label for="fileUpload" class="upload-label">
            <div class="upload-icon">
              <i class="bi bi-cloud-upload"></i>
            </div>
            <div class="upload-text">
              <p class="upload-title">{{ fileName || 'Arrastrá tu archivo aquí o hacé clic para seleccionar' }}</p>
              <p class="upload-subtitle">Formatos permitidos: Excel (.xlsx, .xls) o CSV (.csv)</p>
            </div>
          </label>

          <div v-if="fileName" class="file-info">
            <div class="file-badge">
              <i class="bi bi-file-earmark-spreadsheet me-2"></i>
              <span>{{ fileName }}</span>
              <span class="file-size" v-if="totalRows > 0">({{ totalRows }} registros)</span>
            </div>
            <button class="btn btn-sm btn-outline-danger" @click.prevent="clearFile">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Selector de solapa -->
          <div v-if="sheetNames.length > 1" class="sheet-selector mt-3">
            <label class="sheet-selector-label">
              <i class="bi bi-journal-bookmark me-2"></i>
              Este archivo tiene <strong>{{ sheetNames.length }}</strong> solapas. Seleccioná una:
            </label>
            <div class="sheet-tabs">
              <button
                v-for="name in sheetNames"
                :key="name"
                class="sheet-tab"
                :class="{ active: selectedSheet === name }"
                @click.prevent="selectSheet(name)"
              >
                <i class="bi bi-file-earmark-text me-1"></i>
                {{ name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paso 2: Mapeo de columnas -->
    <div v-if="availableColumns.length > 0" class="card mapping-card mb-4">
      <div class="card-header-custom">
        <i class="bi bi-columns-gap me-2"></i>
        <span>Paso 2: Asignar columnas del Excel</span>
      </div>
      <div class="card-body p-4">
        <p class="mapping-description">
          Seleccioná qué columna de tu Excel corresponde a cada campo requerido
        </p>

        <!-- Auto-match badge -->
        <div v-if="autoMatchedCount > 0" class="auto-match-badge mb-3">
          <i class="bi bi-magic me-2"></i>
          <span>Se pre-asignaron <strong>{{ autoMatchedCount }}</strong> columnas automáticamente. Verificá que sean correctas.</span>
        </div>
        
        <div class="row g-4">

          <!-- Fecha factura -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-calendar-event me-2"></i>
                Fecha de Venta
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.fecha_venta"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('fecha_venta') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>

              <!-- Indicador de formato detectado -->
              <div v-if="columnMapping.fecha_venta && dateFormatDetected" class="date-format-indicator success mt-2">
                <div class="dfi-header">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  <strong>Formato detectado: {{ dateFormatDetected.format }}</strong>
                </div>
                <div class="dfi-examples">
                  <div v-for="(example, idx) in detectedDateExamples" :key="idx" class="dfi-example">
                    <span class="dfi-original">{{ example.original }}</span>
                    <i class="bi bi-arrow-right mx-2"></i>
                    <span class="dfi-formatted">{{ example.formatted }}</span>
                  </div>
                </div>
              </div>

              <!-- Indicador de error si no se detectó -->
              <div v-else-if="columnMapping.fecha_venta && !dateFormatDetected" class="date-format-indicator warning mt-2">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>No se pudo detectar el formato automáticamente</strong>
                <p class="mt-1 mb-0 text-muted" style="font-size: 0.85rem;">
                  Formatos soportados: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY, YYYYMMDD, DD/MM/YY, Excel Serial
                </p>
              </div>
            </div>
          </div>

          <!-- Asesor -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person-workspace me-2"></i>
                Asesor
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.asesor"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('asesor') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Nro factura -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-receipt me-2"></i>
                Nro de Factura
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.nro_factura"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('nro_factura') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- DNI Cliente final -->
          <div class="col-md-4">
            <div class="mapping-field">
              <label for="dniColumn" class="mapping-label">
                <i class="bi bi-person-badge me-2"></i>
                DNI del Cliente
                <span class="required-badge">Requerido</span>
              </label>
              <select 
                id="dniColumn"
                v-model="columnMapping.dni" 
                class="form-select custom-select"
                :class="{
                  'is-invalid': showValidation && !columnMapping.dni,
                  'custom-select--missing': isMissingMapping('dni')
                }"
              >
                <option value="">-- Seleccionar columna --</option>
                <option 
                  v-for="col in getAvailableColumnsForField('dni')" 
                  :key="col" 
                  :value="col"
                >
                  {{ col }}
                </option>
              </select>
              <div v-if="showValidation && !columnMapping.dni" class="invalid-feedback">
                Debes seleccionar una columna para DNI
              </div>
            </div>
          </div>

          <!-- Nombre del cliente final -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person-fill me-2"></i>
                Nombre Cliente
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.nombre_cliente"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('nombre_cliente') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Referencia -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-upc-scan me-2"></i>
                Referencia
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.referencia"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('referencia') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Descripcion -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-card-text me-2"></i>
                Descripción
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.descripcion"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('descripcion') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Tipo producto -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-tag me-2"></i>
                Tipo Producto
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.tipo_producto"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('tipo_producto') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Cantidad -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-123 me-2"></i>
                Cantidad
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.cantidad"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('cantidad') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Importe factura -->
          <div class="col-md-4">
            <div class="mapping-field">
              <label for="importeColumn" class="mapping-label">
                <i class="bi bi-currency-dollar me-2"></i>
                Importe
                <span class="required-badge">Requerido</span>
              </label>
              <select 
                id="importeColumn"
                v-model="columnMapping.importe" 
                class="form-select custom-select"
                :class="{
                  'is-invalid': showValidation && !columnMapping.importe,
                  'custom-select--missing': isMissingMapping('importe')
                }"
              >
                <option value="">-- Seleccionar columna --</option>
                <option 
                  v-for="col in getAvailableColumnsForField('importe')" 
                  :key="col" 
                  :value="col"
                >
                  {{ col }}
                </option>
              </select>
              <div v-if="showValidation && !columnMapping.importe" class="invalid-feedback">
                Debes seleccionar una columna para Importe
              </div>
            </div>
          </div>

          <!-- DNI Cliente VIP -->
          <div class="col-md-4">
            <div class="mapping-field">
              <label for="dniReferidoColumn" class="mapping-label">
                <i class="bi bi-people me-2"></i>
                DNI Referido
                <span class="required-badge">Requerido</span>
              </label>
              <select 
                id="dniReferidoColumn"
                v-model="columnMapping.dni_referido" 
                class="form-select custom-select"
                :class="{
                  'is-invalid': showValidation && !columnMapping.dni_referido,
                  'custom-select--missing': isMissingMapping('dni_referido')
                }"
              >
                <option value="">-- Seleccionar columna --</option>
                <option 
                  v-for="col in getAvailableColumnsForField('dni_referido')" 
                  :key="col" 
                  :value="col"
                >
                  {{ col }}
                </option>
              </select>
              <div v-if="showValidation && !columnMapping.dni_referido" class="invalid-feedback">
                Debes seleccionar una columna para DNI Referido
              </div>
            </div>
          </div>

          <!-- Nombre Cliente VIP -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person me-2"></i>
                Cliente VIP (nombre)
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.nombre_referido"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('nombre_referido') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          
          <!-- Compra propia -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-check2-circle me-2"></i>
                Compra propia (SI/NO)
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.compra"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('compra') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <!-- Location / Sede -->
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-geo-alt me-2"></i>
                Sede / Location
                <span class="optional-badge">Opcional</span>
              </label>
              <select
                v-model="columnMapping.location"
                class="form-select custom-select"
                :class="{ 'custom-select--missing': isMissingMapping('location') }"
              >
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

        </div>

        <div v-if="allFieldsMapped" class="mapping-success mt-4">
          <i class="bi bi-check-circle-fill me-2"></i>
          Todas las columnas requeridas están mapeadas correctamente
        </div>

        <!-- Info regla activa (solo lectura) -->
        <div v-if="activeRule && allFieldsMapped" class="rule-info-banner mt-4">
          <div class="rule-info-header">
            <i class="bi bi-lightning-charge me-2"></i>
            <strong>Regla activa: {{ activeRule.name }}</strong>
          </div>
          <p class="rule-info-desc mb-0" v-if="activeRule.points_type === 'percentage'">
            Se calculará el <strong>{{ activeRule.points_percentage }}%</strong> sobre la columna <strong>{{ columnMapping.importe }}</strong> (Importe) para asignar puntos.
          </p>
          <p class="rule-info-desc mb-0" v-else>
            Se asignarán <strong>{{ activeRule.points_per_sale }} puntos</strong> fijos por venta
            <span v-if="activeRule.conditions && activeRule.conditions.length"> (con {{ activeRule.conditions.length }} condición{{ activeRule.conditions.length > 1 ? 'es' : '' }})</span>.
          </p>
        </div>
      </div>
    </div>

    <!-- Paso 3: Vista previa -->
    <div v-if="previewData.length > 0" class="card preview-card mb-4">
      <div class="card-header-custom">
        <i class="bi bi-eye me-2"></i>
        <span>Paso 3: Vista previa de los datos</span>
      </div>
      <div class="card-body p-4">
        <div class="preview-info mb-3">
          <div class="info-badge">
            <i class="bi bi-info-circle me-2"></i>
            Mostrando las primeras 5 filas de &nbsp;<strong>{{ totalRows }}</strong>&nbsp;registros totales
          </div>
        </div>

        <div class="table-container">
          <table class="table custom-table">
            <thead>
              <tr>
                <th v-if="columnMapping.fecha_venta"><i class="bi bi-calendar me-1"></i> Fecha</th>
                <th v-if="columnMapping.nro_factura"><i class="bi bi-receipt me-1"></i> Factura</th>
                <th><i class="bi bi-person-badge me-1"></i> CC Cliente</th>
                <th v-if="columnMapping.nombre_cliente"><i class="bi bi-person-fill me-1"></i> Cliente</th>
                <th><i class="bi bi-people me-1"></i> CC VIP</th>
                <th v-if="columnMapping.nombre_referido"><i class="bi bi-person me-1"></i> VIP</th>
                <th><i class="bi bi-currency-dollar me-1"></i> Importe</th>
                <th v-if="activeRule"><i class="bi bi-star me-1"></i> Puntos</th>
                <!-- <th v-if="columnMapping.asesor"><i class="bi bi-person-workspace me-1"></i> Asesor</th>
                <th v-if="columnMapping.referencia"><i class="bi bi-upc-scan me-1"></i> Ref.</th>
                <th v-if="columnMapping.descripcion"><i class="bi bi-card-text me-1"></i> Descripción</th>
                <th v-if="columnMapping.tipo_producto"><i class="bi bi-tag me-1"></i> Tipo</th>
                <th v-if="columnMapping.cantidad"><i class="bi bi-123 me-1"></i> Cant.</th>
                <th v-if="columnMapping.compra"><i class="bi bi-check2-circle me-1"></i> Compra</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData" :key="index">
                <td v-if="columnMapping.fecha_venta"><span class="data-cell">{{ row.fecha_venta }}</span></td>
                <td v-if="columnMapping.nro_factura"><span class="data-cell">{{ row.nro_factura }}</span></td>
                <td><span class="data-cell">{{ row.dni }}</span></td>
                <td v-if="columnMapping.nombre_cliente"><span class="data-cell">{{ row.nombre_cliente }}</span></td>
                <td><span class="data-cell">{{ row.dni_referido }}</span></td>
                <td v-if="columnMapping.nombre_referido"><span class="data-cell">{{ row.nombre_referido }}</span></td>
                <td><span class="data-cell money">{{ formatCurrency(row.importe) }}</span></td>
                <td v-if="activeRule"><span class="data-cell points">{{ row.points }}</span></td>
                <!-- <td v-if="columnMapping.asesor"><span class="data-cell">{{ row.asesor }}</span></td>
                <td v-if="columnMapping.referencia"><span class="data-cell">{{ row.referencia }}</span></td>
                <td v-if="columnMapping.descripcion"><span class="data-cell">{{ row.descripcion }}</span></td>
                <td v-if="columnMapping.tipo_producto"><span class="data-cell">{{ row.tipo_producto }}</span></td>
                <td v-if="columnMapping.cantidad"><span class="data-cell">{{ row.cantidad }}</span></td>
                <td v-if="columnMapping.compra"><span class="data-cell">{{ row.compra }}</span></td> -->
              </tr>
            </tbody>
          </table>
        </div>

        <div class="preview-footer">
          <div class="total-summary">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i>
            Total de registros a enviar:&nbsp;<strong>{{ totalRows }}</strong>
          </div>
          <button 
            class="btn btn-primary btn-submit"
            @click="submitData"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-upload me-2"></i>
            {{ isLoading ? 'Enviando datos...' : `Enviar ${totalRows} registros` }}
          </button>
        </div>
      </div>
    </div>

    <ToastComponent 
      :title="toastTitle" 
      :message="toastMessage" 
      :isSuccess="isSuccess" 
      :show.sync="showToastFlag" 
      ref="toastComponent" 
    />

    <!-- Modal de resultados de integración -->
    <ModalComponent
      ref="resultModal"
      modalId="integrationResultModal"
      modalTitle="Resultados de la Ingesta"
      class="modal-xl"
    >
      <div v-if="integrationResult" class="integration-result">

        <!-- Summary stats -->
        <div class="ir-stats">
          <div class="ir-stat ir-stat--ok">
            <i class="bi bi-check-circle-fill"></i>
            <div class="ir-stat-num">{{ integrationResult.integration_ok }}</div>
            <div class="ir-stat-label">Registros OK</div>
          </div>
          <div class="ir-stat ir-stat--err">
            <i class="bi bi-x-circle-fill"></i>
            <div class="ir-stat-num">{{ integrationResult.integration_error }}</div>
            <div class="ir-stat-label">Con error</div>
          </div>
          <div class="ir-stat ir-stat--total">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            <div class="ir-stat-num">{{ integrationResult.total_registros }}</div>
            <div class="ir-stat-label">Total</div>
          </div>
        </div>

        <!-- Error list -->
        <div v-if="integrationResult.files_error && integrationResult.files_error.length > 0" class="ir-errors">
          <div class="ir-errors-header">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Registros con errores ({{ integrationResult.files_error.length }})
          </div>
          <div class="ir-error-list">
            <div
              v-for="(err, idx) in integrationResult.files_error"
              :key="idx"
              class="ir-error-item"
            >
              <div class="ir-error-badge">{{ idx + 1 }}</div>
              <div class="ir-error-body">
                <div class="ir-error-who">
                  <span class="ir-error-name">{{ err.firstname || '—' }}</span>
                  <span class="ir-error-doc">Doc: {{ err.document || '—' }}</span>
                  <span v-if="err.invoice_number" class="ir-error-invoice">Factura: {{ err.invoice_number }}</span>
                </div>
                <div class="ir-error-msg">
                  <i class="bi bi-exclamation-circle me-1"></i>
                  {{ err.error_message || 'Error desconocido' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="ir-no-errors">
          <i class="bi bi-check-circle-fill me-2"></i>
          No hubo registros con errores
        </div>

        <!-- Footer -->
        <div class="ir-footer">
          <button class="btn btn-secondary" @click="closeResultModal">
            <i class="bi bi-x-circle me-1"></i> Cerrar
          </button>
        </div>

      </div>
    </ModalComponent>

    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import ToastComponent from '@/components/ToastComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import axios from 'axios';

export default {
  name: 'SalesView',
  components: {
    ToastComponent,
    ModalComponent
  },
  setup() {
    const fileInput = ref(null);
    const fileName = ref('');
    const availableColumns = ref([]);
    const rawData = ref([]);
    const sheetNames = ref([]);
    const selectedSheet = ref('');
    const workbookRef = ref(null);
    const columnMapping = ref({
      dni: '',
      dni_referido: '',
      importe: '',
      nombre_referido: '',
      fecha_venta: '',
      nro_factura: '',
      asesor: '',
      nombre_cliente: '',
      referencia: '',
      descripcion: '',
      tipo_producto: '',
      cantidad: '',
      compra: '',
      location: ''
    });
    const activeRule = ref(null);
    const autoMatchedCount = ref(0);
    const token = ref(sessionStorage.getItem('token'));
    const URL_API = 'https://apis.madautomate.cloud/webhook/942395a6-0734-43bd-b43f-61072ff867aa';
    const URL_API_SALES = "https://apis.madautomate.cloud/webhook/df116eef-0878-4f7a-8c5b-00a31aad6c9e";

    const showValidation = ref(false);
    const isLoading = ref(false);
    
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(false);
    const showToastFlag = ref(false);
    const toastComponent = ref(null);

    // Modal de resultados de integración
    const resultModal = ref(null);
    const integrationResult = ref(null);

    // Detección de formato de fecha
    const dateFormatDetected = ref(null);
    const detectedDateExamples = ref([]);
    const dateFormatOptions = ref([
      { format: 'EXCEL_SERIAL', pattern: /^\d{4,5}$/, regex: /^\d{4,5}$/, parse: (d) => {
        // Convertir número serial de Excel a fecha
        const num = parseInt(d);
        if (num < 1 || num > 2958465) return null; // Validar rango
        // Excel: 1 = 1900-01-01, pero Excel tiene un bug con el año 1900
        // Ajuste: 1 = 1899-12-31 en JavaScript
        const date = new Date((num - 1) * 86400000 + new Date(1899, 11, 31).getTime());
        return date;
      }},
      { format: 'DD/MM/YYYY', pattern: /^\d{1,2}\/\d{1,2}\/\d{4}$/, regex: /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[012])\/(\d{4})$/, parse: (d) => {
        const p = d.split('/');
        return new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
      }},
      { format: 'MM/DD/YYYY', pattern: /^\d{1,2}\/\d{1,2}\/\d{4}$/, regex: /^(0?[1-9]|1[012])\/(0?[1-9]|[12]\d|3[01])\/(\d{4})$/, parse: (d) => {
        const p = d.split('/');
        return new Date(parseInt(p[2]), parseInt(p[0])-1, parseInt(p[1]));
      }},
      { format: 'YYYY-MM-DD', pattern: /^\d{4}-\d{1,2}-\d{1,2}$/, regex: /^(\d{4})-(0?[1-9]|1[012])-(0?[1-9]|[12]\d|3[01])$/, parse: (d) => new Date(d) },
      { format: 'DD-MM-YYYY', pattern: /^\d{1,2}-\d{1,2}-\d{4}$/, regex: /^(0?[1-9]|[12]\d|3[01])-(0?[1-9]|1[012])-(\d{4})$/, parse: (d) => {
        const p = d.split('-');
        return new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
      }},
      { format: 'YYYYMMDD', pattern: /^\d{8}$/, regex: /^(\d{4})(0?[1-9]|1[012])(0?[1-9]|[12]\d|3[01])$/, parse: (d) => {
        return new Date(parseInt(d.substring(0,4)), parseInt(d.substring(4,6))-1, parseInt(d.substring(6,8)));
      }},
      { format: 'DD/MM/YY', pattern: /^\d{1,2}\/\d{1,2}\/\d{2}$/, regex: /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[012])\/(\d{2})$/, parse: (d) => {
        const p = d.split('/');
        const year = parseInt(p[2]) + (parseInt(p[2]) < 50 ? 2000 : 1900);
        return new Date(year, parseInt(p[1])-1, parseInt(p[0]));
      }}
    ]);
    const selectedDateFormat = ref(null);

    const currentStep = computed(() => {
      if (!fileName.value) return 1;
      if (sheetNames.value.length > 1 && !selectedSheet.value) return 1;
      if (!allFieldsMapped.value) return 2;
      return 3;
    });

    const allFieldsMapped = computed(() => {
      return columnMapping.value.dni && 
             columnMapping.value.dni_referido && 
             columnMapping.value.importe;
    });

    // --- Auto-match: keywords por campo ---
    const FIELD_KEYWORDS = {
      dni:              ['cc', 'cedula', 'cédula', 'documento', 'nit', 'dni'],
      dni_referido:     ['cc cliente vip', 'cc vip', 'cedula vip', 'documento vip', 'dni referido', 'doc referido'],
      importe:          ['valor factura', 'importe', 'total', 'monto', 'valor venta', 'valor total'],
      nombre_referido:  ['cliente vip', 'nombre vip', 'referido'],
      fecha_venta:      ['fecha'],
      nro_factura:      ['factura', 'nro factura', 'no factura', 'numero factura', 'número factura'],
      asesor:           ['asesor', 'vendedor', 'ejecutivo'],
      nombre_cliente:   ['nombre cliente', 'cliente', 'comprador', 'nombre'],
      referencia:       ['referencia', 'ref', 'codigo', 'código', 'sku'],
      descripcion:      ['descripción', 'descripcion', 'detalle'],
      tipo_producto:    ['tipo producto', 'tipo', 'categoría', 'categoria'],
      cantidad:         ['cantidad', 'cant', 'qty', 'unidades'],
      compra:           ['compra', 'venta', 'estado'],
      location:         ['location', 'sede', 'sucursal', 'tienda', 'punto de venta']
    };

    // Prioridad: más específico primero
    const FIELD_MATCH_ORDER = [
      'dni_referido', 'nombre_referido',
      'nro_factura', 'nombre_cliente', 'tipo_producto',
      'fecha_venta', 'asesor', 'referencia', 'descripcion',
      'cantidad', 'compra', 'location', 'importe', 'dni'
    ];

    const STORAGE_KEY = 'salesview_column_mapping';

    const saveMappingToStorage = () => {
      const current = { ...columnMapping.value };
      // Solo guardar si hay al menos 1 campo mapeado
      const hasMapped = Object.values(current).some(v => v !== '');
      if (hasMapped) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
    };

    const autoMatchColumns = (columns) => {
      // 1. Intentar restaurar desde localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          let matchCount = 0;
          const newMapping = {};
          for (const [field, savedCol] of Object.entries(parsed)) {
            if (savedCol && columns.includes(savedCol)) {
              newMapping[field] = savedCol;
              matchCount++;
            } else {
              newMapping[field] = '';
            }
          }
          // Si al menos los 3 requeridos matchean, usar guardado
          if (newMapping.dni && newMapping.dni_referido && newMapping.importe) {
            columnMapping.value = { ...columnMapping.value, ...newMapping };
            autoMatchedCount.value = matchCount;
            return;
          }
        } catch (e) { /* ignore parse errors */ }
      }

      // 2. Fallback: auto-match por keywords
      const lowerColumns = columns.map(c => c.toLowerCase().trim());
      const used = new Set();
      const newMapping = {};

      for (const field of FIELD_MATCH_ORDER) {
        const keywords = FIELD_KEYWORDS[field] || [];
        let bestMatch = '';
        let bestLen = 0;

        for (let i = 0; i < lowerColumns.length; i++) {
          if (used.has(i)) continue;
          const colLower = lowerColumns[i];
          for (const kw of keywords) {
            if (colLower.includes(kw) && kw.length > bestLen) {
              bestMatch = columns[i];
              bestLen = kw.length;
            }
          }
        }

        if (bestMatch) {
          newMapping[field] = bestMatch;
          used.add(columns.indexOf(bestMatch));
        } else {
          newMapping[field] = '';
        }
      }

      columnMapping.value = { ...columnMapping.value, ...newMapping };
      autoMatchedCount.value = Object.values(newMapping).filter(v => v !== '').length;
    };

    const loadSheetData = (sheetName) => {
      if (!workbookRef.value) return;
      const sheet = workbookRef.value.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (jsonData.length === 0) {
        showToast('Error', `La solapa "${sheetName}" está vacía`, false);
        rawData.value = [];
        availableColumns.value = [];
        return;
      }

      availableColumns.value = Object.keys(jsonData[0]);
      rawData.value = jsonData;

      autoMatchColumns(availableColumns.value);
      showValidation.value = false;

      showToast('Éxito', `Solapa "${sheetName}": ${jsonData.length} registros encontrados`, true);
    };

    const selectSheet = (name) => {
      selectedSheet.value = name;
      loadSheetData(name);
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileName.value = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          workbookRef.value = workbook;
          sheetNames.value = workbook.SheetNames;

          if (workbook.SheetNames.length === 1) {
            // Auto-seleccionar si hay una sola solapa
            selectedSheet.value = workbook.SheetNames[0];
            loadSheetData(workbook.SheetNames[0]);
          } else {
            // Múltiples solapas: esperar selección del usuario
            selectedSheet.value = '';
            rawData.value = [];
            availableColumns.value = [];
            showToast('Info', `El archivo tiene ${workbook.SheetNames.length} solapas. Seleccioná una para continuar.`, true);
          }
        } catch (error) {
          showToast('Error', 'Error al leer el archivo: ' + error.message, false);
        }
      };

      reader.readAsArrayBuffer(file);
    };

    const clearFile = () => {
      fileName.value = '';
      availableColumns.value = [];
      rawData.value = [];
      sheetNames.value = [];
      selectedSheet.value = '';
      workbookRef.value = null;
      columnMapping.value = {
        dni: '',
        dni_referido: '',
        importe: '',
        nombre_referido: '',
        fecha_venta: '',
        nro_factura: '',
        asesor: '',
        nombre_cliente: '',
        referencia: '',
        descripcion: '',
        tipo_producto: '',
        cantidad: '',
        compra: '',
        location: ''
      };
      autoMatchedCount.value = 0;
      showValidation.value = false;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    // --- Normalizar documentos: quitar puntos ---
    const normalizeDocument = (val) => {
      if (!val) return '';
      return String(val).replace(/\./g, '').trim();
    };

    // --- Funciones de detección y formateo de fecha ---
    const detectDateFormat = (dateString) => {
      if (!dateString) return null;
      const str = String(dateString).trim();
      
      for (const fmt of dateFormatOptions.value) {
        if (fmt.regex.test(str)) {
          return fmt;
        }
      }
      return null;
    };

    const parseDate = (dateString, format) => {
      try {
        if (!format || !dateString) return null;
        const date = format.parse(String(dateString).trim());
        if (isNaN(date.getTime())) return null;
        return date;
      } catch (e) {
        return null;
      }
    };

    const formatDateForAPI = (dateString, format) => {
      try {
        const date = parseDate(dateString, format);
        if (!date) return null;
        // Retornar en formato YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) {
        return null;
      }
    };

    const detectDateFormatInColumn = (columnName) => {
      if (!columnName || !rawData.value.length) {
        dateFormatDetected.value = null;
        detectedDateExamples.value = [];
        selectedDateFormat.value = null;
        return;
      }

      // Tomar muestras de la columna
      const samples = [];
      const detectedFormats = new Map();

      for (let i = 0; i < Math.min(20, rawData.value.length); i++) {
        const val = rawData.value[i][columnName];
        if (val) {
          samples.push(val);
          const detected = detectDateFormat(val);
          if (detected) {
            const key = detected.format;
            detectedFormats.set(key, (detectedFormats.get(key) || 0) + 1);
          }
        }
      }

      // Elegir el formato más frecuente
      let mostFrequentFormat = null;
      let maxCount = 0;

      for (const [format, count] of detectedFormats) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentFormat = dateFormatOptions.value.find(f => f.format === format);
        }
      }

      if (mostFrequentFormat) {
        dateFormatDetected.value = mostFrequentFormat;
        selectedDateFormat.value = mostFrequentFormat;
        // Mostrar ejemplos formateados
        detectedDateExamples.value = samples.slice(0, 3).map(s => ({
          original: s,
          formatted: formatDateForAPI(s, mostFrequentFormat)
        })).filter(e => e.formatted);
      } else {
        dateFormatDetected.value = null;
        selectedDateFormat.value = null;
        detectedDateExamples.value = [];
      }
    };

    // --- Evaluación de condiciones de la regla activa ---
    const getRowValueForConditionField = (row, field) => {
      const mapping = {
        'importe': columnMapping.value.importe,
        'date': columnMapping.value.fecha_venta,
        'dni': columnMapping.value.dni,
        'dni_referido': columnMapping.value.dni_referido
      };
      const col = mapping[field];
      return col ? row[col] : undefined;
    };

    const evaluateCondition = (row, condition) => {
      const rawVal = getRowValueForConditionField(row, condition.field);
      if (rawVal === undefined) return true;

      const { operator, value, value_from, value_to } = condition;

      if (condition.field === 'importe') {
        const num = Number(rawVal) || 0;
        const cmp = Number(value) || 0;
        switch (operator) {
          case '>':  return num > cmp;
          case '>=': return num >= cmp;
          case '<':  return num < cmp;
          case '<=': return num <= cmp;
          case '=':  return num === cmp;
          default:   return true;
        }
      }

      if (condition.field === 'date') {
        const d = new Date(rawVal);
        if (operator === 'between') {
          return d >= new Date(value_from) && d <= new Date(value_to);
        }
        const cmpDate = new Date(value);
        switch (operator) {
          case '>=': return d >= cmpDate;
          case '<=': return d <= cmpDate;
          case '=':  return d.toDateString() === cmpDate.toDateString();
          default:   return true;
        }
      }

      // dni / dni_referido — comparación de strings
      const str = String(rawVal).trim();
      switch (operator) {
        case '=':      return str === String(value).trim();
        case '!=':     return str !== String(value).trim();
        case 'in':     return value.split(',').map(v => v.trim()).includes(str);
        case 'not_in': return !value.split(',').map(v => v.trim()).includes(str);
        default:       return true;
      }
    };

    const calculatePoints = (row) => {
      if (!activeRule.value) return null;

      if (activeRule.value.points_type === 'percentage') {
        if (!columnMapping.value.importe) return '—';
        const base = Number(row[columnMapping.value.importe]) || 0;
        return Math.round((base * activeRule.value.points_percentage / 100) * 100) / 100;
      }

      // Tipo fijo: evaluar condiciones
      const conditions = activeRule.value.conditions || [];
      if (conditions.length === 0 || conditions.every(c => evaluateCondition(row, c))) {
        return activeRule.value.points_per_sale;
      }
      return 0;
    };

    const previewData = computed(() => {
      if (!allFieldsMapped.value) {
        return [];
      }

      return rawData.value.slice(0, 5).map(row => {
        // Formatear fecha si está mapeada y el formato fue detectado
        let fechaFormateada = '';
        if (columnMapping.value.fecha_venta && selectedDateFormat.value) {
          const rawDate = row[columnMapping.value.fecha_venta];
          fechaFormateada = formatDateForAPI(rawDate, selectedDateFormat.value) || rawDate || '';
        } else if (columnMapping.value.fecha_venta) {
          fechaFormateada = row[columnMapping.value.fecha_venta] || '';
        }

        return {
          dni: normalizeDocument(row[columnMapping.value.dni]),
          dni_referido: normalizeDocument(row[columnMapping.value.dni_referido]),
          nombre_referido: columnMapping.value.nombre_referido ? (row[columnMapping.value.nombre_referido] || '') : '',
          nombre_cliente: columnMapping.value.nombre_cliente ? (row[columnMapping.value.nombre_cliente] || '') : '',
          importe: row[columnMapping.value.importe] || 0,
          fecha_venta: fechaFormateada,
          nro_factura: columnMapping.value.nro_factura ? (row[columnMapping.value.nro_factura] || '') : '',
          asesor: columnMapping.value.asesor ? (row[columnMapping.value.asesor] || '') : '',
          referencia: columnMapping.value.referencia ? (row[columnMapping.value.referencia] || '') : '',
          descripcion: columnMapping.value.descripcion ? (row[columnMapping.value.descripcion] || '') : '',
          tipo_producto: columnMapping.value.tipo_producto ? (row[columnMapping.value.tipo_producto] || '') : '',
          cantidad: columnMapping.value.cantidad ? (row[columnMapping.value.cantidad] || '') : '',
          compra: columnMapping.value.compra ? (row[columnMapping.value.compra] || '') : '',
          location: columnMapping.value.location ? (row[columnMapping.value.location] || '') : '',
          points: calculatePoints(row)
        };
      });
    });

    const totalRows = computed(() => rawData.value.length);

    const validateMapping = () => {
      return allFieldsMapped.value;
    };

    const isMissingMapping = (fieldName) => {
      if (!availableColumns.value.length) return false;
      return !columnMapping.value[fieldName];
    };

    const submitData = async () => {
      showValidation.value = true;

      if (!validateMapping()) {
        showToast('Error', 'Debes seleccionar las tres columnas requeridas', false);
        return;
      }

      // Validar columna de porcentaje si la regla activa lo requiere
      if (activeRule.value && activeRule.value.points_type === 'percentage' && !columnMapping.value.importe) {
        showToast('Error', 'Seleccioná la columna de Importe para calcular el porcentaje', false);
        return;
      }

      // Guardar mapping para la próxima vez
      saveMappingToStorage();

      // Generar batch_id: timestamp numérico + random (ej: "17121530451234567")
      const now = Date.now();
      const rand = Math.floor(Math.random() * 10000);
      const batchId = `${now}${String(rand).padStart(4, '0')}`;

      // Armar filas en formato del stored procedure sp_register_sale
      const sales = rawData.value.map(row => {
        const pointsAwarded = Number(calculatePoints(row)) || 0;

        // nombre del Cliente VIP (va con document, es quien acumula puntos)
        const fullName = columnMapping.value.nombre_referido
          ? String(row[columnMapping.value.nombre_referido] || '').trim()
          : '';

        const optStr = (field) => columnMapping.value[field]
          ? String(row[columnMapping.value[field]] || '').trim()
          : '';

        return {
          document: normalizeDocument(row[columnMapping.value.dni_referido]),
          firstname: fullName,
          lastname: '',
          referred_document: normalizeDocument(row[columnMapping.value.dni]),
          sale_date: columnMapping.value.fecha_venta && selectedDateFormat.value
            ? (formatDateForAPI(row[columnMapping.value.fecha_venta], selectedDateFormat.value) || null)
            : null,
          sale_amount: Number(row[columnMapping.value.importe]) || 0,
          sale_currency: 'COL',
          points_awarded: pointsAwarded,
          points_rule: activeRule.value ? activeRule.value.name : '',
          invoice_number: optStr('nro_factura'),
          description: optStr('descripcion'),
          advisor: optStr('asesor'),
          buyer_name: optStr('nombre_cliente'),
          product_reference: optStr('referencia'),
          product_type: optStr('tipo_producto'),
          quantity: columnMapping.value.cantidad
            ? (Number(row[columnMapping.value.cantidad]) || 0)
            : null,
          is_purchase: columnMapping.value.compra
            ? (['SI', 'SÍ', 'YES', '1', 'TRUE'].includes(String(row[columnMapping.value.compra]).toUpperCase().trim()) ? 1 : 0)
            : 1,
          location: optStr('location'),
          batch_id: batchId
        };
      });

      isLoading.value = true;

      console.log('sales', sales)

      try {
        const response = await axios.post(URL_API_SALES, {
          action: 'importSales',
          batch_id: batchId,
          sales: sales
        }, {
          headers: { Authorization: `Bearer ${token.value}` }
        });

        console.log('response importSales', response);
        showToast('Éxito', `${sales.length} registros enviados correctamente`, true);

        const raw = Array.isArray(response.data) ? response.data[0] : response.data;
        if (raw?.success) {
          integrationResult.value = raw;
          resultModal.value.openModal();
        }

      } catch (error) {
        console.error('Error al enviar ventas:', error);
        showToast('Error', 'Error al enviar los datos: ' + (error.response?.data?.message || error.message), false);
      } finally {
        isLoading.value = false;
      }
    };

    const closeResultModal = () => {
      resultModal.value.closeModal();
      integrationResult.value = null;
      clearFile();
    };

    const showToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    };

    const getAvailableColumnsForField = (fieldName) => {
      const selectedColumns = Object.entries(columnMapping.value)
        .filter(([key, value]) => key !== fieldName && value !== '')
        .map(([key, value]) => value);

      return availableColumns.value.filter(col => !selectedColumns.includes(col));
    };

    const formatCurrency = (value) => {
      if (!value) return '-';
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(value);
    };

    const fetchActiveRule = async () => {
      try {
        const response = await axios.post(URL_API, { action: 'getActiveRule' }, {
          headers: { Authorization: `Bearer ${token.value}` }
        });
        const raw = response.data.data || response.data;
        if (raw && raw.id) {
          activeRule.value = {
            ...raw,
            is_active: raw.is_active === 1 || raw.is_active === true,
            points_percentage: raw.points_percentage ? Number(raw.points_percentage) : null,
            points_per_sale: raw.points_per_sale ? Number(raw.points_per_sale) : null,
            conditions: raw.conditions
              ? (typeof raw.conditions === 'string' ? JSON.parse(raw.conditions) : raw.conditions)
              : []
          };
        } else {
          activeRule.value = null;
        }
      } catch (err) {
        console.error('Error al cargar regla activa', err);
        activeRule.value = null;
      }
    };

    onMounted(fetchActiveRule);

    // Watcher para detectar formato de fecha cuando se selecciona la columna
    watch(
      () => columnMapping.value.fecha_venta,
      (newVal) => {
        if (newVal) {
          detectDateFormatInColumn(newVal);
        } else {
          dateFormatDetected.value = null;
          selectedDateFormat.value = null;
          detectedDateExamples.value = [];
        }
      }
    );

    return {
      fileInput,
      fileName,
      availableColumns,
      columnMapping,
      activeRule,
      autoMatchedCount,
      sheetNames,
      selectedSheet,
      previewData,
      totalRows,
      showValidation,
      isLoading,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      toastComponent,
      currentStep,
      allFieldsMapped,
      handleFileUpload,
      clearFile,
      selectSheet,
      submitData,
      getAvailableColumnsForField,
      isMissingMapping,
      formatCurrency,
      resultModal,
      integrationResult,
      closeResultModal,
      dateFormatDetected,
      detectedDateExamples,
      dateFormatOptions,
      selectedDateFormat,
      detectDateFormatInColumn,
      formatDateForAPI
    };
  }
};
</script>

<style scoped>
/* ===== REWARDS DESIGN SYSTEM ===== */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-section h2 {
  margin: 0;
  color: #1f2937;
  font-weight: 700;
}

.subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Steps Progress */
.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed .step-icon {
  background: #10b981;
  color: white;
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #6b7280;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  background: #3939ff;
  color: white;
  transform: scale(1.1);
}

.step-content {
  text-align: left;
}

.step-number {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-title {
  font-weight: 700;
  color: #1f2937;
}

.step-connector {
  width: 80px;
  height: 3px;
  background: #e5e7eb;
  margin: 0 1rem;
  transition: all 0.3s ease;
}

.step-connector.active {
  background: #3939ff;
}

/* Cards */
.upload-card, .mapping-card, .preview-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

.card-header-custom {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
  padding: 1rem 1.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

/* Upload Zone */
.upload-zone {
  border: 3px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.upload-zone:hover {
  border-color: #3939ff;
  background: #f3f4f6;
}

.upload-zone.has-file {
  border-color: #10b981;
  background: #ecfdf5;
}

.upload-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 4rem;
  color: #9ca3af;
}

.upload-zone:hover .upload-icon {
  color: #3939ff;
}

.upload-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-size: 1.1rem;
}

.upload-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.file-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  font-weight: 600;
}

.file-size {
  color: #6b7280;
  font-weight: 400;
}

/* Sheet selector */
.sheet-selector {
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.sheet-selector-label {
  display: block;
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.sheet-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sheet-tab {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sheet-tab:hover {
  border-color: #6366f1;
  background: #eef2ff;
  color: #4f46e5;
}

.sheet-tab.active {
  border-color: #6366f1;
  background: #6366f1;
  color: white;
}

/* Mapping */
.mapping-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.mapping-field {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.mapping-field:hover {
  border-color: #d1d5db;
}

.mapping-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.required-badge {
  margin-left: auto;
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.optional-badge {
  margin-left: auto;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.mapping-field.optional .custom-select {
  border-style: dashed;
}

.custom-select {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  font-weight: 500;
}

.custom-select--missing {
  border-color: #f87171;
  background: #fff7f7;
}

.custom-select:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

.custom-select--missing:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
}

.mapping-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* Preview */
.preview-info {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

.info-badge {
  color: #1e40af;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.table-container {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.custom-table {
  margin: 0;
}

.custom-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.custom-table thead th {
  font-weight: 700;
  color: #374151;
  padding: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.custom-table tbody tr {
  transition: background 0.2s ease;
}

.custom-table tbody tr:hover {
  background: #f9fafb;
}

.custom-table tbody td {
  padding: 1rem;
  color: #1f2937;
}

.data-cell {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.data-cell.money {
  color: #059669;
  font-weight: 700;
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.total-summary {
  color: #6b7280;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.btn-submit {
  padding: 0.75rem 2rem;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(57, 57, 255, 0.4);
}

/* Responsive */
@media (max-width: 992px) {
  .steps-container {
    flex-direction: column;
  }

  .step-connector {
    width: 3px;
    height: 40px;
    margin: 0.5rem 0;
  }

  .preview-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-submit {
    width: 100%;
  }
}

/* Auto-match Badge */
.auto-match-badge {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  color: #1e40af;
  font-size: 0.88rem;
}

.auto-match-badge i {
  font-size: 1.1rem;
  color: #3b82f6;
}

/* Rule Info Banner */
.rule-info-banner {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.rule-info-header {
  display: flex;
  align-items: center;
  color: #166534;
  font-size: 1rem;
  margin-bottom: 0.35rem;
}

.rule-info-header i {
  font-size: 1.2rem;
}

.rule-info-desc {
  color: #166534;
  font-size: 0.88rem;
}

.data-cell.points {
  color: #7c3aed;
  font-weight: 700;
}

/* ===== INTEGRATION RESULT MODAL ===== */
.integration-result {
  padding: 1rem;
}

.ir-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ir-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.1rem;
  border-radius: 12px;
}

.ir-stat--ok    { background: #d1fae5; color: #065f46; }
.ir-stat--err   { background: #fee2e2; color: #991b1b; }
.ir-stat--total { background: #eff6ff; color: #1e40af; }

.ir-stat-num   { font-size: 1.8rem; font-weight: 800; line-height: 1; }
.ir-stat-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

.ir-errors-header {
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.ir-error-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
}

.ir-error-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
}

.ir-error-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ir-error-body { flex: 1; min-width: 0; }

.ir-error-who {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  align-items: center;
}

.ir-error-name    { font-weight: 700; color: #1f2937; font-size: 0.87rem; }
.ir-error-doc     { font-size: 0.78rem; color: #6b7280; background: #f3f4f6; padding: 1px 7px; border-radius: 4px; }
.ir-error-invoice { font-size: 0.78rem; color: #6b7280; background: #f3f4f6; padding: 1px 7px; border-radius: 4px; }

.ir-error-msg {
  font-size: 0.83rem;
  color: #dc2626;
  font-weight: 500;
}

.ir-no-errors {
  text-align: center;
  padding: 1.5rem;
  color: #065f46;
  background: #d1fae5;
  border-radius: 10px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.ir-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* ===== DATE FORMAT DETECTION ===== */
.date-format-indicator {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-format-indicator.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #86efac;
  color: #065f46;
}

.date-format-indicator.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fcd34d;
  color: #92400e;
}

.dfi-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.dfi-header i {
  font-size: 1rem;
}

.dfi-examples {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.dfi-example {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

.dfi-original {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
}

.dfi-formatted {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #059669;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
}

.date-format-indicator.warning .dfi-formatted {
  color: #92400e;
}
</style>
