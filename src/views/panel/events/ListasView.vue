<template>
  <div class="container-fluid lists mt-4">
    <div class="header-section mb-4">
      <h2>{{ $t('lists.title') }}</h2>
      <button @click="openModalList()" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> {{ $t('lists.button_new') }}
      </button>
    </div>
    <hr class="header-divider">

    <!-- Tip Accordion -->
    <div class="accordion mb-5" id="accordionLists">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingLists">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseLists" 
            aria-expanded="false" 
            aria-controls="collapseLists"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Carga listas de Excel y selecciona hasta 3 columnas para validar inscripciones.
            </div>
          </button>
        </h2>
        <div 
          id="collapseLists" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingLists" 
          data-bs-parent="#accordionLists"
        >
          <div class="accordion-body tip-expanded">
            <p>Gestiona tus <strong>listas de validación</strong> para eventos privados.</p>
            <ul>
              <li>Carga archivos Excel (.xlsx, .xls, .csv)</li>
              <li>Selecciona hasta 3 columnas relevantes</li>
              <li>Reutiliza listas en múltiples eventos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="lists"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
        />
      </div>
    </div>

    <!-- MODAL PARA CREAR/EDITAR LISTA -->
    <ModalComponent 
      ref="listModal" 
      modalId="listModal" 
      :modalTitle="editingIndex === null ? 'Nueva Lista' : 'Editar Lista'" 
      class="modal-xl" 
      @closeModal="handleCloseModal"
    >
      <div class="modal-body">
        <div class="row g-4">
          
          <!-- Nombre de la lista -->
          <div class="col-12">
            <label class="form-label">
              <i class="bi bi-card-heading me-2"></i>
              <strong>Nombre de la lista:</strong>
            </label>
            <input 
              v-model="listData.name" 
              type="text" 
              class="form-control" 
              placeholder="Ej: Lista de invitados VIP 2025"
            />
            <small class="text-muted">Dale un nombre descriptivo para identificarla fácilmente</small>
          </div>

          <!-- Descripción -->
          <div class="col-12">
            <label class="form-label">
              <i class="bi bi-text-paragraph me-2"></i>
              <strong>Descripción (opcional):</strong>
            </label>
            <textarea 
              v-model="listData.description" 
              class="form-control" 
              rows="3"
              placeholder="Describe para qué sirve esta lista..."
            ></textarea>
          </div>

          <!-- Subir archivo Excel -->
          <div class="col-12">
            <label class="form-label">
              <i class="bi bi-file-earmark-excel me-2"></i>
              <strong>Archivo Excel:</strong>
            </label>
            <input 
              type="file" 
              class="form-control" 
              accept=".xlsx,.xls,.csv" 
              @change="handleExcelUpload" 
              ref="excelInput"
            />
            <small class="text-muted">Formatos soportados: .xlsx, .xls, .csv</small>
          </div>

          <!-- Selección de columnas (máximo 3) -->
          <div v-if="excelColumns.length > 0" class="col-12">
            <div class="card border-primary">
              <div class="card-header bg-primary text-white">
                <i class="bi bi-table me-2"></i>
                <strong>Seleccionar Columnas (máximo 3)</strong>
              </div>
              <div class="card-body">
                <p class="text-muted mb-3">
                  <i class="bi bi-info-circle me-2"></i>
                  Selecciona hasta 3 columnas del Excel que quieras guardar. Solo estas columnas estarán disponibles para validación.
                </p>
                
                <div class="row g-3">
                  <div v-for="(col, index) in excelColumns" :key="col" class="col-12 col-md-4">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :id="'col-' + index"
                        :value="col"
                        v-model="selectedColumns"
                        :disabled="selectedColumns.length >= 3 && !selectedColumns.includes(col)"
                      />
                      <label class="form-check-label" :for="'col-' + index">
                        <strong>{{ col }}</strong>
                        <span v-if="selectedColumns.includes(col)" class="badge bg-success ms-2">
                          <i class="bi bi-check-circle"></i>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="alert alert-info mt-3 mb-0">
                  <i class="bi bi-check-circle me-2"></i>
                  Columnas seleccionadas: <strong>{{ selectedColumns.length }}/3</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview de datos con columnas seleccionadas -->
          <div v-if="selectedColumns.length > 0 && excelPreview.length > 0" class="col-12">
            <div class="card mb-4">
              <div class="card-header bg-light">
                <i class="bi bi-eye me-2"></i>
                <strong>Vista previa con columnas seleccionadas (primeras 5 filas)</strong>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-sm table-hover mb-0">
                    <thead class="table-success">
                      <tr>
                        <th v-for="col in selectedColumns" :key="col">
                          {{ col }}
                          <i class="bi bi-check-circle-fill ms-1"></i>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in excelPreview.slice(0, 5)" :key="idx">
                        <td v-for="col in selectedColumns" :key="col">
                          {{ row[col] }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div class="alert alert-success mb-0">
                <i class="bi bi-check-circle me-2"></i>
                Se guardarán <strong>{{ excelPreview.length }}</strong> registros con <strong>{{ selectedColumns.length }}</strong> columnas
            </div>
            
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="saveList"
          :disabled="!isFormValid"
        >
          <i class="bi bi-floppy me-2"></i>Guardar Lista
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeModalList">
          <i class="bi bi-x-circle me-2"></i>Cancelar
        </button>
      </div>
      
    </ModalComponent>

    <ToastComponent 
      :title="toastTitle" 
      :message="toastMessage" 
      :isSuccess="isSuccess" 
      :show.sync="showToastFlag"
      ref="toastComponent"
    />

    <ConfirmPopup 
      ref="confirmPopup" 
      title="Confirmar eliminación" 
      question="¿Estás seguro de que deseas eliminar esta lista?" 
      @response="handleDeleteResponse" 
    />

    <LoadingDots :isLoading="isLoading" />

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import { useI18n } from "vue-i18n";
import * as XLSX from 'xlsx';

export default {
  name: 'ListView',
  components: {
    ModalComponent,
    DataTableComponent,
    ToastComponent,
    ConfirmPopup
  },
  setup() {
    const { t } = useI18n();
    const lists = ref([]);
    const editingIndex = ref(null);
    const listModal = ref(null);
    const toastComponent = ref(null);
    const confirmPopup = ref(null);
    const showToastFlag = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    const token = ref(null);
    const excelColumns = ref([]);
    const excelPreview = ref([]);
    const selectedColumns = ref([]);
    const excelInput = ref(null);
    const isLoading = ref(false);
    let listToDelete = null;

    const url = "https://apis.madautomate.cloud/webhook/9ff4a876-1944-4643-b41d-37450e37e3e2";

    const listData = ref({
      name: '',
      description: '',
      selected_columns: [],
      excel_data: [],
      records_count: 0,
      status: 'active'
    });

    const columns = [
      { key: 'name', label: 'Nombre de la Lista' },
      { key: 'selected_columns', label: 'Columnas' },
      { key: 'records_count', label: 'Registros' },
      { key: 'created_at', label: 'Fecha de Creación' },
      { key: 'status', label: 'Estado' }
    ];

    const resultActions = [
      { 
        label: 'Editar',
        class: 'btn btn-outline btn-sm',
        method: editList,
        icon: () => '<i class="bi bi-pencil-square"></i>' 
      },
      { 
        label: 'Eliminar',
        class: 'btn btn-danger btn-sm',
        method: confirmDelete,
        icon: () => '<i class="bi bi-trash"></i>'
      }
    ];

    const isFormValid = computed(() => {
      return listData.value.name.trim() !== '' 
        && selectedColumns.value.length > 0
        && selectedColumns.value.length <= 3
        && excelPreview.value.length > 0;
    });

    const openModalList = (list = null) => {
      if (list) {
        editingIndex.value = list.id;
        listData.value = { ...list };
        if (list.excel_data) {
          const parsedData = JSON.parse(list.excel_data);
          excelPreview.value = parsedData;
          // Obtener columnas del primer registro
          if (parsedData.length > 0) {
            excelColumns.value = Object.keys(parsedData[0]);
          }
        }
        if (list.selected_columns) {
          selectedColumns.value = JSON.parse(list.selected_columns);
        }
      } else {
        editingIndex.value = null;
        resetListData();
      }
      listModal.value.openModal();
    };

    const closeModalList = () => {
      listModal.value.closeModal();
      resetListData();
    };

    const resetListData = () => {
      listData.value = {
        name: '',
        description: '',
        selected_columns: [],
        excel_data: [],
        records_count: 0,
        status: 'active'
      };
      excelColumns.value = [];
      excelPreview.value = [];
      selectedColumns.value = [];
      if (excelInput.value) {
        excelInput.value.value = '';
      }
    };

    const handleExcelUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          showToast('Error', 'El archivo está vacío o no tiene el formato correcto', false);
          return;
        }

        excelColumns.value = Object.keys(jsonData[0]);
        excelPreview.value = jsonData;
        selectedColumns.value = []; // Resetear selección al subir nuevo archivo

        showToast('Éxito', `Archivo cargado correctamente. ${jsonData.length} registros encontrados. Ahora selecciona hasta 3 columnas.`, true);
      } catch (error) {
        console.error('Error al procesar Excel:', error);
        showToast('Error', 'No se pudo procesar el archivo Excel', false);
      }
    };

    const saveList = async () => {
      if (!isFormValid.value) {
        showToast('Error', 'Por favor completa todos los campos y selecciona entre 1 y 3 columnas', false);
        return;
      }

      isLoading.value = true;

      // Filtrar solo las columnas seleccionadas del Excel
      const filteredData = excelPreview.value.map(row => {
        const filteredRow = {};
        selectedColumns.value.forEach(col => {
          filteredRow[col] = row[col];
        });
        return filteredRow;
      });

      const dataToSend = {
        action: "updatelist",
        name: listData.value.name,
        description: listData.value.description,
        records_count: filteredData.length,
        selected_columns: JSON.stringify(selectedColumns.value),
        excel_data: JSON.stringify(filteredData),
        status: listData.value.status
      };

      if (editingIndex.value) {
        dataToSend.id = editingIndex.value;
      }

      console.log('Datos a enviar:', dataToSend);

      try {
        const response = await axios.post(url, dataToSend, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        
        showToast('Ok!', 'Lista guardada correctamente', true);
        
        await loadLists();
        
        closeModalList();

      } catch (err) {
        console.error(err);
        showToast('Error!', 'No se pudo guardar la lista', false);
      } finally {
        isLoading.value = false;
      }
    };

    const loadLists = async () => {
      isLoading.value = true;
      try {
        const response = await axios.post(url, { action: "getlists" }, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        lists.value = response.data.map(item => ({
          ...item,
          excel_data: item.excel_data || '[]',
          selected_columns: item.selected_columns || '[]'
        }));

      } catch (err) {
        console.error('Error al obtener listas', err);
      } finally {
        isLoading.value = false;
      }
    };

    function editList(item) {
      openModalList(item);
    }

    function confirmDelete(item) {
      listToDelete = item;
      confirmPopup.value.showConfirmPopup();
    }

    const handleDeleteResponse = async (response) => {
      if (response && listToDelete) {
        isLoading.value = true;
        try {
          await axios.post(url, {
            action: "deletelist",
            id: listToDelete.id
          }, {
            headers: { Authorization: `Bearer ${token.value}` },
          });

          await loadLists();
          showToast('Ok!', 'Lista eliminada correctamente', true);
        } catch (err) {
          console.error(err);
          showToast('Error!', 'No se pudo eliminar la lista', false);
        } finally {
          isLoading.value = false;
          listToDelete = null;
        }
      }
    };

    const showToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      showToastFlag.value = true;
    };

    const handleCloseModal = () => {
      resetListData();
    };

    const getToken = async () => {
      token.value = sessionStorage.getItem('token');
    };

    onMounted(async () => {
      await getToken();
      await loadLists();
    });

    return {
      lists,
      listData,
      columns,
      resultActions,
      editingIndex,
      listModal,
      toastComponent,
      confirmPopup,
      showToastFlag,
      toastTitle,
      toastMessage,
      isSuccess,
      excelColumns,
      excelPreview,
      selectedColumns,
      excelInput,
      isLoading,
      isFormValid,
      openModalList,
      closeModalList,
      saveList,
      handleExcelUpload,
      handleCloseModal,
      handleDeleteResponse,
      editList,
      confirmDelete,
      t
    };
  }
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-banner-style {
  border-left: 4px solid #0d6efd;
}

.tip-banner-button {
  background-color: #f8f9fa;
}



.data-card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-check-input:disabled {
  cursor: not-allowed;
}

.form-check-label {
  cursor: pointer;
}
</style>