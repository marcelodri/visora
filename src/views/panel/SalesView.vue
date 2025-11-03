<template>
  <div class="container-fluid mt-4 page">
    <h2>Importar Ventas</h2>
    <hr><br>
    
    <div class="card">
      <div class="card-body p-4">
        <!-- Sección de carga de archivo -->
        <div class="mb-5">
          <h5 class="mb-3">1. Seleccionar archivo</h5>
          <div class="input-group">
            <input 
              type="file" 
              ref="fileInput"
              class="form-control" 
              accept=".xlsx,.xls,.csv"
              @change="handleFileUpload"
            >
            <button 
              class="btn btn-secondary ml-4" 
              type="button"
              @click="clearFile"
              :disabled="!fileName"
            >
              Limpiar
            </button>
          </div>
          <small class="form-text text-muted">
            Formatos permitidos: Excel (.xlsx, .xls) o CSV (.csv)
          </small>
          <div v-if="fileName" class="mt-2">
            <span class="badge bg-success">{{ fileName }}</span>
          </div>
        </div>

        <!-- Sección de mapeo de columnas -->
        <div v-if="availableColumns.length > 0" class="mb-5">
          <h5 class="mb-3">2. Asignar columnas</h5>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label for="dniColumn" class="form-label">DNI</label>
              <select 
                id="dniColumn"
                v-model="columnMapping.dni" 
                class="form-select"
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

            <div class="col-md-4">
              <label for="dniReferidoColumn" class="form-label">DNI Referido</label>
              <select 
                id="dniReferidoColumn"
                v-model="columnMapping.dni_referido" 
                class="form-select"
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

            <div class="col-md-4">
              <label for="importeColumn" class="form-label">Importe</label>
              <select 
                id="importeColumn"
                v-model="columnMapping.importe" 
                class="form-select"
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

        <!-- Vista previa de datos -->
        <div v-if="previewData.length > 0" class="mb-5">
          <h5 class="mb-3">3. Vista previa (primeras 5 filas)</h5>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>DNI</th>
                  <th>DNI Referido</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in previewData" :key="index">
                  <td>{{ row.dni }}</td>
                  <td>{{ row.dni_referido }}</td>
                  <td>{{ row.importe }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted mb-0">
            Total de registros a enviar: <strong>{{ totalRows }}</strong>
          </p>
        </div>

        <!-- Botón de envío -->
        <div v-if="availableColumns.length > 0" class="d-grid gap-2">
          <button 
            class="btn btn-primary btn-lg p-2"
            @click="submitData"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'Enviando...' : 'Enviar Datos' }}
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
    
    // Toast
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(false);
    const showToastFlag = ref(false);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileName.value = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obtener la primera hoja
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (jsonData.length === 0) {
            showToast('Error', 'El archivo está vacío', false);
            return;
          }

          // Obtener columnas disponibles
          availableColumns.value = Object.keys(jsonData[0]);
          rawData.value = jsonData;
          
          // Resetear mapeo y validación
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
      if (!columnMapping.value.dni || !columnMapping.value.dni_referido || !columnMapping.value.importe) {
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
      return columnMapping.value.dni && 
             columnMapping.value.dni_referido && 
             columnMapping.value.importe;
    };

    const submitData = async () => {
      showValidation.value = true;

      if (!validateMapping()) {
        showToast('Error', 'Debes seleccionar las tres columnas requeridas', false);
        return;
      }

      // Preparar datos para enviar
      const dataToSend = rawData.value.map(row => ({
        dni: row[columnMapping.value.dni],
        dni_referido: row[columnMapping.value.dni_referido],
        importe: row[columnMapping.value.importe]
      }));

      isLoading.value = true;

      try {
        // Aquí irá el POST cuando me des la URL
        // const response = await axios.post('URL_AQUI', dataToSend);
        
        // Simulación temporal
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Datos a enviar:', dataToSend);
        showToast('Éxito', `${dataToSend.length} registros enviados correctamente`, true);
        
        // Limpiar después del envío exitoso
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
      showToastFlag.value = true;
    };

    const getAvailableColumnsForField = (fieldName) => {
      // Obtener las columnas ya seleccionadas en otros campos
      const selectedColumns = Object.entries(columnMapping.value)
        .filter(([key, value]) => key !== fieldName && value !== '')
        .map(([key, value]) => value);

      // Filtrar las columnas disponibles excluyendo las ya seleccionadas
      return availableColumns.value.filter(col => !selectedColumns.includes(col));
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
      handleFileUpload,
      clearFile,
      submitData,
      getAvailableColumnsForField
    };
  }
};
</script>

<style scoped>
label {
  font-weight: bold;
}

.table-responsive {
  max-height: 300px;
  overflow-y: auto;
}

.badge {
  font-size: 0.9rem;
}
</style>