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

        <div v-if="allFieldsMapped" class="mapping-success mt-4">
          <i class="bi bi-check-circle-fill me-2"></i>
          Todas las columnas están mapeadas correctamente
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
                <th>
                  <i class="bi bi-person-badge me-1"></i>
                  DNI
                </th>
                <th>
                  <i class="bi bi-people me-1"></i>
                  DNI Referido
                </th>
                <th>
                  <i class="bi bi-currency-dollar me-1"></i>
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData" :key="index">
                <td><span class="data-cell">{{ row.dni }}</span></td>
                <td><span class="data-cell">{{ row.dni_referido }}</span></td>
                <td><span class="data-cell money">{{ formatCurrency(row.importe) }}</span></td>
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
import { ref, computed } from 'vue';
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
    const columnMapping = ref({
      dni: '',
      dni_referido: '',
      importe: ''
    });
    const showValidation = ref(false);
    const isLoading = ref(false);
    
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(false);
    const showToastFlag = ref(false);
    const toastComponent = ref(null);

    const currentStep = computed(() => {
      if (!fileName.value) return 1;
      if (!allFieldsMapped.value) return 2;
      return 3;
    });

    const allFieldsMapped = computed(() => {
      return columnMapping.value.dni && 
             columnMapping.value.dni_referido && 
             columnMapping.value.importe;
    });

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileName.value = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (jsonData.length === 0) {
            showToast('Error', 'El archivo está vacío', false);
            return;
          }

          availableColumns.value = Object.keys(jsonData[0]);
          rawData.value = jsonData;
          
          columnMapping.value = {
            dni: '',
            dni_referido: '',
            importe: ''
          };
          showValidation.value = false;

          showToast('Éxito', `Archivo cargado: ${jsonData.length} registros encontrados`, true);
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
      columnMapping.value = {
        dni: '',
        dni_referido: '',
        importe: ''
      };
      showValidation.value = false;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const previewData = computed(() => {
      if (!allFieldsMapped.value) {
        return [];
      }

      return rawData.value.slice(0, 5).map(row => ({
        dni: row[columnMapping.value.dni] || '',
        dni_referido: row[columnMapping.value.dni_referido] || '',
        importe: row[columnMapping.value.importe] || ''
      }));
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

      const dataToSend = rawData.value.map(row => ({
        dni: row[columnMapping.value.dni],
        dni_referido: row[columnMapping.value.dni_referido],
        importe: row[columnMapping.value.importe]
      }));

      isLoading.value = true;

      try {
        // const response = await axios.post('URL_AQUI', dataToSend);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Datos a enviar:', dataToSend);
        showToast('Éxito', `${dataToSend.length} registros enviados correctamente`, true);
        
        setTimeout(() => {
          clearFile();
        }, 2000);
        
      } catch (error) {
        showToast('Error', 'Error al enviar los datos: ' + error.message, false);
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

    return {
      fileInput,
      fileName,
      availableColumns,
      columnMapping,
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
      submitData,
      getAvailableColumnsForField,
      formatCurrency
    };
  }
};
</script>

<style scoped>
/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
</style>