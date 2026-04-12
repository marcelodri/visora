<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <div>
        <h2>Migrar Clientes</h2>
        <p class="subtitle">Cargá tu archivo Excel y mapeá las columnas para importar clientes</p>
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
          Asigná las columnas de tu archivo a los campos del cliente. Todos son opcionales.
        </p>

        <!-- Auto-match badge -->
        <div v-if="autoMatchedCount > 0" class="auto-match-badge mb-3">
          <i class="bi bi-magic me-2"></i>
          <span>Se pre-asignaron <strong>{{ autoMatchedCount }}</strong> columnas automáticamente. Verificá que sean correctas.</span>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person-badge me-2"></i>Documento
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.document" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('document')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person me-2"></i>Nombre
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.firstname" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('firstname')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person me-2"></i>Apellido
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.lastname" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('lastname')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-telephone me-2"></i>Teléfono
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.phone" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('phone')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-envelope me-2"></i>Email
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.email" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('email')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-geo-alt me-2"></i>Dirección
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.address" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('address')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-calendar-event me-2"></i>Fecha de Nacimiento
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.birth_date" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('birth_date')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-gender-ambiguous me-2"></i>Género
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.gender" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('gender')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-person-workspace me-2"></i>Código Vendedor
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.salesperson_code" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('salesperson_code')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mapping-field optional">
              <label class="mapping-label">
                <i class="bi bi-hash me-2"></i>ID Interno
                <span class="optional-badge ms-2">Opcional</span>
              </label>
              <select v-model="columnMapping.internal_id" class="form-select custom-select">
                <option value="">-- Sin asignar --</option>
                <option v-for="col in getAvailableColumnsForField('internal_id')" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="allFieldsMapped" class="mapping-success mt-4">
          <i class="bi bi-check-circle-fill me-2"></i>
          Columnas asignadas. Revisá la vista previa antes de enviar.
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
                <th v-if="columnMapping.document"><i class="bi bi-person-badge me-1"></i> Documento</th>
                <th v-if="columnMapping.firstname"><i class="bi bi-person me-1"></i> Nombre</th>
                <th v-if="columnMapping.lastname"><i class="bi bi-person me-1"></i> Apellido</th>
                <th v-if="columnMapping.phone"><i class="bi bi-telephone me-1"></i> Teléfono</th>
                <th v-if="columnMapping.email"><i class="bi bi-envelope me-1"></i> Email</th>
                <th v-if="columnMapping.address"><i class="bi bi-geo-alt me-1"></i> Dirección</th>
                <th v-if="columnMapping.birth_date"><i class="bi bi-calendar-event me-1"></i> Fecha Nacim.</th>
                <th v-if="columnMapping.gender"><i class="bi bi-gender-ambiguous me-1"></i> Género</th>
                <th v-if="columnMapping.salesperson_code"><i class="bi bi-person-workspace me-1"></i> Vendedor</th>
                <th v-if="columnMapping.internal_id"><i class="bi bi-hash me-1"></i> ID Interno</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData" :key="index">
                <td v-if="columnMapping.document"><span class="data-cell">{{ row.document }}</span></td>
                <td v-if="columnMapping.firstname"><span class="data-cell">{{ row.firstname }}</span></td>
                <td v-if="columnMapping.lastname"><span class="data-cell">{{ row.lastname }}</span></td>
                <td v-if="columnMapping.phone"><span class="data-cell">{{ row.phone }}</span></td>
                <td v-if="columnMapping.email"><span class="data-cell">{{ row.email }}</span></td>
                <td v-if="columnMapping.address"><span class="data-cell">{{ row.address }}</span></td>
                <td v-if="columnMapping.birth_date"><span class="data-cell">{{ row.birth_date }}</span></td>
                <td v-if="columnMapping.gender"><span class="data-cell">{{ row.gender }}</span></td>
                <td v-if="columnMapping.salesperson_code"><span class="data-cell">{{ row.salesperson_code }}</span></td>
                <td v-if="columnMapping.internal_id"><span class="data-cell">{{ row.internal_id }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="preview-footer">
          <div class="total-summary">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i>
            Total de clientes a migrar: <strong>{{ totalRows }}</strong>
          </div>
          <button 
            class="btn btn-primary btn-submit"
            @click="submitData"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-upload me-2"></i>
            {{ isLoading ? 'Migrando clientes...' : `Migrar ${totalRows} clientes` }}
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
      document: '',
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
      address: '',
      birth_date: '',
      gender: '',
      salesperson_code: '',
      internal_id: ''
    });
    const autoMatchedCount = ref(0);
    const token = ref(sessionStorage.getItem('token'));
    const URL_API_CUSTOMERS = 'https://apis.madautomate.cloud/webhook/ab007c4d-b051-44b6-8c1e-fb8cfb518ca3';

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
      return Object.values(columnMapping.value).some(v => v !== '');
    });

    // --- Auto-match: keywords por campo ---
    const FIELD_KEYWORDS = {
      document:         ['num documento', 'documento', 'cedula', 'cédula', 'cc', 'nit', 'dni'],
      firstname:        ['nombre cliente', 'nombre'],
      lastname:         ['apellido'],
      phone:            ['# de contacto', 'de contacto', 'contacto', 'celular', 'telefono', 'teléfono'],
      email:            ['email cliente', 'email', 'correo'],
      address:          ['direccion cliente', 'dirección cliente', 'direccion', 'dirección', 'domicilio'],
      birth_date:       ['fecha nacimiento', 'nacimiento', 'fecha de nacimiento'],
      gender:           ['genero cliente', 'género cliente', 'genero', 'género', 'sexo'],
      salesperson_code: ['cod vendedor', 'código vendedor', 'vendedor', 'asesor', 'ejecutivo'],
      internal_id:      ['internal id', 'id interno', 'interno']
    };

    // Prioridad: más específico primero
    const FIELD_MATCH_ORDER = [
      'phone', 'email', 'address', 'birth_date', 'gender',
      'salesperson_code', 'internal_id', 'document', 'firstname', 'lastname'
    ];

    const STORAGE_KEY = 'migrate_customers_column_mapping';

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
          // Si al menos 1 campo matchea, usar guardado
          if (Object.values(newMapping).some(v => v !== '')) {
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

      availableColumns.value = Object.keys(jsonData[0]).filter(col => col.toLowerCase().trim() !== 'id');
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
        document: '',
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        address: '',
        birth_date: '',
        gender: '',
        salesperson_code: '',
        internal_id: ''
      };
      autoMatchedCount.value = 0;
      showValidation.value = false;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const parseBirthDate = (val) => {
      if (val === null || val === undefined || val === '') return null;
      // Already yyyy-mm-dd
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return isNaN(new Date(val).getTime()) ? null : val;
      }
      // Excel serial number → JS Date
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        const date = new Date(Math.round((num - 25569) * 86400 * 1000));
        if (isNaN(date.getTime())) return null;
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      // Any other parseable date string
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      return `${y}-${mo}-${dy}`;
    };

    const buildCustomerRow = (row) => {
      const customer = {};
      for (const [field, col] of Object.entries(columnMapping.value)) {
        if (!col) continue;
        if (field === 'birth_date') {
          customer[field] = parseBirthDate(row[col]);
        } else {
          customer[field] = String(row[col] ?? '').trim() || null;
        }
      }
      return customer;
    };

    const previewData = computed(() => {
      if (!allFieldsMapped.value) return [];
      return rawData.value.slice(0, 5).map(row => buildCustomerRow(row));
    });

    const totalRows = computed(() => rawData.value.length);

    const submitData = async () => {
      if (!allFieldsMapped.value) {
        showToast('Aviso', 'Mapeá al menos una columna antes de enviar', false);
        return;
      }

      saveMappingToStorage();

      const now = Date.now();
      const rand = Math.floor(Math.random() * 10000);
      const batchId = `${now}${String(rand).padStart(4, '0')}`;

      const customers = rawData.value.map(row => buildCustomerRow(row));

      isLoading.value = true;

      try {
        const response = await axios.post(URL_API_CUSTOMERS, {
          action: 'migrateCustomers',
          batch_id: batchId,
          customers
        }, {
          headers: { Authorization: `Bearer ${token.value}` }
        });

        if (response.data?.success) {
          showToast('Éxito', `${customers.length} clientes migrados correctamente`, true);
          setTimeout(() => { clearFile(); }, 2000);
        } else {
          showToast('Error', response.data?.message || 'La migración no fue exitosa', false);
        }
      } catch (error) {
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

    onMounted(() => {});

    return {
      fileInput,
      fileName,
      availableColumns,
      columnMapping,
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