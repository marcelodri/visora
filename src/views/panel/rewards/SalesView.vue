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
                :class="{'is-invalid': showValidation && !columnMapping.dni}"
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
                :class="{'is-invalid': showValidation && !columnMapping.dni_referido}"
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
                :class="{'is-invalid': showValidation && !columnMapping.importe}"
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
        </div>

        <!-- Campos opcionales -->
        <p class="mapping-description mt-4 mb-2">
          <i class="bi bi-sliders me-2"></i>Campos opcionales (mejoran el registro)
        </p>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person me-2"></i>
                Cliente VIP (nombre)
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.nombre_referido" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-calendar-event me-2"></i>
                Fecha de Venta
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.fecha_venta" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-receipt me-2"></i>
                Nro de Factura
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.nro_factura" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person-workspace me-2"></i>
                Asesor
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.asesor" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person-fill me-2"></i>
                Nombre Cliente
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.nombre_cliente" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-upc-scan me-2"></i>
                Referencia
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.referencia" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-card-text me-2"></i>
                Descripción
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.descripcion" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-tag me-2"></i>
                Tipo Producto
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.tipo_producto" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-123 me-2"></i>
                Cantidad
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.cantidad" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-check2-circle me-2"></i>
                Compra (SI/NO)
                <span class="optional-badge">Opcional</span>
              </label>
              <select v-model="columnMapping.compra" class="form-select custom-select">
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
            Mostrando las primeras 5 filas de <strong>{{ totalRows }}</strong> registros totales
          </div>
        </div>

        <div class="table-container">
          <table class="table custom-table">
            <thead>
              <tr>
                <th><i class="bi bi-person-badge me-1"></i> CC Cliente</th>
                <th v-if="columnMapping.nombre_cliente"><i class="bi bi-person-fill me-1"></i> Cliente</th>
                <th><i class="bi bi-people me-1"></i> CC VIP</th>
                <th v-if="columnMapping.nombre_referido"><i class="bi bi-person me-1"></i> VIP</th>
                <th v-if="columnMapping.fecha_venta"><i class="bi bi-calendar me-1"></i> Fecha</th>
                <th v-if="columnMapping.nro_factura"><i class="bi bi-receipt me-1"></i> Factura</th>
                <th v-if="columnMapping.asesor"><i class="bi bi-person-workspace me-1"></i> Asesor</th>
                <th v-if="columnMapping.referencia"><i class="bi bi-upc-scan me-1"></i> Ref.</th>
                <th v-if="activeRule"><i class="bi bi-star me-1"></i> Puntos</th>
                <th v-if="columnMapping.descripcion"><i class="bi bi-card-text me-1"></i> Descripción</th>
                <th v-if="columnMapping.tipo_producto"><i class="bi bi-tag me-1"></i> Tipo</th>
                <th v-if="columnMapping.cantidad"><i class="bi bi-123 me-1"></i> Cant.</th>
                <th><i class="bi bi-currency-dollar me-1"></i> Importe</th>
                <th v-if="columnMapping.compra"><i class="bi bi-check2-circle me-1"></i> Compra</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData" :key="index">
                <td><span class="data-cell">{{ row.dni }}</span></td>
                <td v-if="columnMapping.nombre_cliente"><span class="data-cell">{{ row.nombre_cliente }}</span></td>
                <td><span class="data-cell">{{ row.dni_referido }}</span></td>
                <td v-if="columnMapping.nombre_referido"><span class="data-cell">{{ row.nombre_referido }}</span></td>
                <td v-if="columnMapping.fecha_venta"><span class="data-cell">{{ row.fecha_venta }}</span></td>
                <td v-if="columnMapping.nro_factura"><span class="data-cell">{{ row.nro_factura }}</span></td>
                <td v-if="columnMapping.asesor"><span class="data-cell">{{ row.asesor }}</span></td>
                <td v-if="columnMapping.referencia"><span class="data-cell">{{ row.referencia }}</span></td>
                <td v-if="activeRule"><span class="data-cell points">{{ row.points }}</span></td>
                <td v-if="columnMapping.descripcion"><span class="data-cell">{{ row.descripcion }}</span></td>
                <td v-if="columnMapping.tipo_producto"><span class="data-cell">{{ row.tipo_producto }}</span></td>
                <td v-if="columnMapping.cantidad"><span class="data-cell">{{ row.cantidad }}</span></td>
                <td><span class="data-cell money">{{ formatCurrency(row.importe) }}</span></td>
                <td v-if="columnMapping.compra"><span class="data-cell">{{ row.compra }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="preview-footer">
          <div class="total-summary">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i>
            Total de registros a enviar: <strong>{{ totalRows }}</strong>
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
    
    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import ToastComponent from '@/components/ToastComponent.vue';
import axios from 'axios';

export default {
  name: 'SalesView',
  components: {
    ToastComponent
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
      compra: ''
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
      compra:           ['compra', 'venta', 'estado']
    };

    // Prioridad: más específico primero
    const FIELD_MATCH_ORDER = [
      'dni_referido', 'nombre_referido',
      'nro_factura', 'nombre_cliente', 'tipo_producto',
      'fecha_venta', 'asesor', 'referencia', 'descripcion',
      'cantidad', 'compra', 'importe', 'dni'
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
        compra: ''
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
        return {
          dni: normalizeDocument(row[columnMapping.value.dni]),
          dni_referido: normalizeDocument(row[columnMapping.value.dni_referido]),
          nombre_referido: columnMapping.value.nombre_referido ? (row[columnMapping.value.nombre_referido] || '') : '',
          nombre_cliente: columnMapping.value.nombre_cliente ? (row[columnMapping.value.nombre_cliente] || '') : '',
          importe: row[columnMapping.value.importe] || 0,
          fecha_venta: columnMapping.value.fecha_venta ? (row[columnMapping.value.fecha_venta] || '') : '',
          nro_factura: columnMapping.value.nro_factura ? (row[columnMapping.value.nro_factura] || '') : '',
          asesor: columnMapping.value.asesor ? (row[columnMapping.value.asesor] || '') : '',
          referencia: columnMapping.value.referencia ? (row[columnMapping.value.referencia] || '') : '',
          descripcion: columnMapping.value.descripcion ? (row[columnMapping.value.descripcion] || '') : '',
          tipo_producto: columnMapping.value.tipo_producto ? (row[columnMapping.value.tipo_producto] || '') : '',
          cantidad: columnMapping.value.cantidad ? (row[columnMapping.value.cantidad] || '') : '',
          compra: columnMapping.value.compra ? (row[columnMapping.value.compra] || '') : '',
          points: calculatePoints(row)
        };
      });
    });

    const totalRows = computed(() => rawData.value.length);

    const validateMapping = () => {
      return allFieldsMapped.value;
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

        // Parsear nombre: intentar separar "Apellido Nombre" o usar completo como firstname
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
          referred_by: normalizeDocument(row[columnMapping.value.dni]),
          sale_date: columnMapping.value.fecha_venta
            ? (row[columnMapping.value.fecha_venta] || null)
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

        if(response.data.success){
          setTimeout(() => {
            clearFile();
          }, 2000);
        }

      } catch (error) {
        console.error('Error al enviar ventas:', error);
        showToast('Error', 'Error al enviar los datos: ' + (error.response?.data?.message || error.message), false);
      } finally {
        isLoading.value = false;
      }
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
      formatCurrency
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

.custom-select:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
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
</style>