<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <h2>Cards Sección 1</h2>
      <button @click="openModalForm()" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> Nuevo producto
      </button>
    </div>
    <hr class="header-divider">

    <div class="accordion mb-5" id="accordionSeccion1Cards">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingSeccion1Cards">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseSeccion1Cards" 
            aria-expanded="false" 
            aria-controls="collapseSeccion1Cards"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Las Cards de Sección 1 te permiten agregar bloques de contenido con título, descripción e imagen, y conectarlas con otros formularios.
            </div>
          </button>
        </h2>

        <div 
          id="collapseSeccion1Cards" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingSeccion1Cards" 
          data-bs-parent="#accordionSeccion1Cards"
        >
          <div class="accordion-body tip-expanded">
            <p>
              Las <strong>cards de la Sección 1</strong> te permiten agregar bloques de contenido visual o informativo que aparecerán en la parte superior del formulario o landing.
            </p>

            <ul>
              <li><strong>Título y descripción:</strong> cada card puede mostrar información relevante para el usuario.</li>
              <li><strong>Imagen opcional:</strong> podés cargar una imagen para complementar el contenido.</li>
              <li>
                <strong>Código de llamada:</strong> este campo es clave para el botón 
                <em>"Más info"</em>.  
                Cuando lo completes, la card podrá enlazar a <strong>otro formulario</strong> usando ese código,
                permitiendo crear flujos entre múltiples formularios.
              </li>
              <li><strong>Segmentación:</strong> recordá que las cards pueden estar asociadas a una <strong>marca</strong> y a un <strong>tipo de negocio</strong>, lo que permite mostrar contenidos específicos según cada segmento.</li>
            </ul>

            <p class="mb-0">
              Usá estas cards para destacar modelos, productos, beneficios o información clave, y conectarlas con otros formularios mediante el código de llamada.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="forms"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
          :marcas="marcas"
          :negocios="negocios"
        />
      </div>
    </div>

    <!-- Modal -->
    <ModalComponent ref="formModal" modalId="formModal" :modalTitle="editingIndex === null ? 'Nuevo Producto' : 'Editar Producto'" class="modal-xl" @modalClosed="handleCloseModal">
      <div class="modal-body">

        <!-- Segmentación -->
        <div class="card form-card mb-3">
          <div class="card-header-modal">
            <i class="bi bi-funnel-fill me-2"></i>
            Segmentación
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-tag-fill me-2"></i>
                  {{ $t('menu.brands') }}:
                </label>
                <select v-model="formData.marca_id" class="form-select custom-select">
                  <option value="">Seleccione una marca</option>
                  <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                    {{ marca.name }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-briefcase-fill me-2"></i>
                  {{ $t('menu.business-types') }}:
                </label>
                <select v-model="formData.tipo_de_negocio_id" class="form-select custom-select">
                  <option value="">Seleccione un tipo de negocio</option>
                  <option v-for="negocio in negocios" :key="negocio.id" :value="negocio.id">
                    {{ negocio.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Imagen -->
        <div class="card form-card mb-3">
          <div class="card-header-modal">
            <i class="bi bi-image-fill me-2"></i>
            Imagen del producto
          </div>
          <div class="card-body">
            <label class="form-label">
              <i class="bi bi-card-image me-2"></i>
              {{ $t('forms.form_img') }}:
            </label>

            <input 
              type="file" 
              class="d-none" 
              id="fileInput"
              accept="image/png, image/jpeg, image/webp, image/gif"
              @change="handleImageUpload" 
            />

            <label for="fileInput" class="file-input-label">
              <i class="bi bi-cloud-upload me-2"></i>
              <span>{{ formData.fileName || 'Archivos permitidos: jpg, jpeg, png, gif, webp' }}</span>
            </label>

            <div v-if="formData.image || formData.path" class="image-preview-container">
              <div class="image-preview">
                <img 
                  :src="formData.image || `https://madcoder.io/apis/images_upload/${formData.path}`" 
                  alt="Imagen" 
                  class="preview-image"
                />
                <button 
                  class="btn-remove-image"
                  @click="removeImage"
                  title="Eliminar imagen"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
              <p class="image-info">
                <i class="bi bi-check-circle-fill text-success me-1"></i>
                Imagen cargada correctamente
              </p>
            </div>
          </div>
        </div>

        <!-- Información del Producto -->
        <div class="card form-card mb-3">
          <div class="card-header-modal">
            <i class="bi bi-info-circle-fill me-2"></i>
            Información del producto
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-car-front me-2"></i>
                  Modelo:
                </label>
                <input v-model="formData.model" type="text" class="form-control" placeholder="Ej: Yaris" />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-gear-fill me-2"></i>
                  Versión:
                </label>
                <input v-model="formData.version" type="text" class="form-control" placeholder="Ej: XS 1.5 CVT" />
              </div>

              <div class="col-12">
                <label class="form-label">
                  <i class="bi bi-link-45deg me-2"></i>
                  Call Code:
                  <span class="badge bg-warning text-dark ms-2">
                    <i class="bi bi-lightbulb-fill me-1"></i>
                    Genera un link en la card para llamar a otro formulario
                  </span>
                </label>
                <input
                  v-model="formData.code"
                  type="text"
                  class="form-control"
                  placeholder="Ej: 123456"
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-file-text me-2"></i>
                  Plan:
                </label>
                <input v-model="formData.plan" type="text" class="form-control" placeholder="Ej: Plan 70/30" />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-calendar-range me-2"></i>
                  Plazo:
                </label>
                <input v-model="formData.plazo" type="text" class="form-control" placeholder="Ej: Plazo 96 meses" />
              </div>

              <div class="col-12">
                <label class="form-label">
                  <i class="bi bi-currency-dollar me-2"></i>
                  Importe:
                </label>
                <input v-model="formData.precio" type="text" class="form-control" placeholder="Ej: Cuotas desde $239.246" />
              </div>
            </div>
          </div>
        </div>

        <!-- Estilos CSS -->
        <div class="card form-card mb-3">
          <div class="card-header-modal">
            <i class="bi bi-palette-fill me-2"></i>
            Estilos de la card
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-paint-bucket me-2"></i>
                  Background
                </label>
                <div class="color-picker-wrapper">
                  <input v-model="formData.background" type="color" class="color-input" />
                  <!-- <div class="color-preview" :style="{ background: formData.background }"></div> -->
                  <input type="text" v-model="formData.background" class="color-value-input" placeholder="#ffffff" />
                </div>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-fonts me-2"></i>
                  Color
                </label>
                <div class="color-picker-wrapper">
                  <input v-model="formData.color" type="color" class="color-input" />
                  <!-- <div class="color-preview" :style="{ background: formData.color }"></div> -->
                  <input type="text" v-model="formData.color" class="color-value-input" placeholder="#000000" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="saveForm">
          <i class="bi bi-floppy me-2"></i> {{$t('search_view.save')}}
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
          <i class="bi bi-x-circle me-2"></i> {{$t('search_view.cancel')}}
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
      :title="$t('search_view.alert_confirm_title')" 
      :question="$t('search_view.alert_confirm_question')" 
      @response="handleResponse" 
    />

    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import DataTableComponent from '@/components/DataTableComponent.vue';
  import ModalComponent from '@/components/ModalComponent.vue';
  import ToastComponent from '@/components/ToastComponent.vue';
  import ConfirmPopup from '@/components/ConfirmPopup.vue';
  import { useI18n } from "vue-i18n";
 
  export default {
    components: {
      DataTableComponent,
      ModalComponent,
      ToastComponent,
      ConfirmPopup,
    },
    setup() {
      const { t } = useI18n();
      const forms = ref([]);
      const marcas = ref([]);
      const negocios = ref([]);
      const formData = ref(getEmptyForm());
      const formDataProduct = ref(getEmptyFormProduct());
      const editingIndex = ref(null);
      const isLoading = ref(false);
      const showToastFlag = ref(false);
      const toastTitle = ref('');
      const toastMessage = ref('');
      const toastComponent = ref(null);
      const isSuccess = ref(true);
      const formModal = ref(null);
      const token = ref(null);
      const confirmPopup = ref(null);
      let formDelete = {};

      const columns = [
        { label: 'Modelo', key: 'model' },
        { label: 'Versión', key: 'version' },
        { label: 'Imagen', key: 'imageOrPath'},
        { label: 'Marca', key: 'marca_name'},
        { label: 'Negocio', key: 'tipo_de_negocio_name'}
      ];
      
      const resultActions = [
        { label: 'Editar', class: 'btn btn-sm btn-outline', method: editForm, icon: '<i class="bi bi-pencil-square"></i>' },
        { label: 'Eliminar', class: 'btn btn-sm btn-danger', method: confirmDelete, icon: '<i class="bi bi-trash3"></i>'},
      ];

      const fetchForms = async () => {
        isLoading.value = true;
        try {
          const response = await axios.post('https://apis.madautomate.cloud/webhook/0345108c-9058-4517-bf14-358ab4e52b2c', {action: "datacards"}, {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });
          
          const data = response.data.map(item => ({
                ...item,
                imageOrPath: item.image || item.path
          }));
          forms.value = data;

        } catch (err) {
          console.error('Error al obtener productos', err);
          triggerToast('Error!', 'No se pudieron cargar los productos.', false);
        } finally {
          isLoading.value = false;
        }
      };

      const getToken = async () => {
        token.value = sessionStorage.getItem('token');
      };

      const removeImage = () => {
        formData.value.imageDelete = formData.value.fileName;
        formData.value.image = "";
        formData.value.path = "";
        formData.value.fileName = "";
      };

      const saveForm = async () => {
        isLoading.value = true;
        const dataToSend = { ...formData.value };
        dataToSend.action = "savecards";

        let url = 'https://apis.madautomate.cloud/webhook/0345108c-9058-4517-bf14-358ab4e52b2c';

        if (editingIndex.value !== null) {
          forms.value[editingIndex.value] = dataToSend;
        } else {
          forms.value.push(dataToSend);
        }

        try {
          const response = await axios.post(url,dataToSend, {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });
          await fetchForms();
          closeModalForm();
        } catch (err) {
          console.error(err);
          triggerToast('Error!', 'No se pudo guardar el producto.', false);
        } finally {
          isLoading.value = false;
        }
      };

      function editForm(item) {
        editingIndex.value = item;
        formData.value = item;
        openModalForm();
      }

      function confirmDelete(item, index) {
        formDelete = item;
        confirmPopup.value.showConfirmPopup();
      }

      const openModalForm = () => {
        if(!editingIndex.value){
          formData.value = getEmptyForm();
          editingIndex.value = null; 
        }
        formModal.value.openModal();
      };

      const cleanData = () => {
        editingIndex.value = null; 
      }

      const closeModalForm = () => {
        cleanData();
        formModal.value.closeModal();
      };

      const handleCloseModal = () => {
        cleanData();
      };

      function getEmptyForm() {
        return {
          model: '',
          version: '',
          code: '',
          image: '',
          fileName: '',
          path: '',
          plan: '',
          plazo: '',
          precio: '',
          published: true,
          background: "#ffffff",
          color: "#000000"
        };
      }

      function getEmptyFormProduct() {
        return {
          title: '',
          description: ''
        };
      }

      const handleImageUpload = (event) => {
        const file = event.target.files[0];
        formData.value.fileName = file.name;
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            formData.value.image = reader.result;
          };
          reader.readAsDataURL(file);
        }
      };

      const handleResponse = (isConfirmed) =>  {
        if (isConfirmed) {
          deleteForm();
        }
      }

      const deleteForm = async () => {
        isLoading.value = true;
        formDelete.action = "delete";

        try {
          const response = await axios.post('https://apis.madautomate.cloud/webhook/0345108c-9058-4517-bf14-358ab4e52b2c',formDelete, {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });

          if (response.status === 200) {
            const index = forms.value.findIndex(f => f.id === formDelete.id);
            if (index !== -1) {
              forms.value.splice(index, 1);
            }
            setTimeout(() => {
              triggerToast('Realizado!', 'Producto eliminado!', true);
            }, 1000)
          }
        } catch (error) {
          console.error('deleteForm', error)
          triggerToast('Error', 'Error al borrar el producto', false);
        } finally {
          isLoading.value = false;
        }
      };

      const triggerToast = (title, message, success) => {
        toastTitle.value = title;
        toastMessage.value = message;
        isSuccess.value = success;
        toastComponent.value.showToas();
      };

      const getMarcas = async () => {
        const response = await axios.post('https://apis.madautomate.cloud/webhook/7279e62e-5ab0-4f43-9707-c1ff44e95d89', {action: 'databrands'}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (response && response.data && Array.isArray(response.data)) {
          marcas.value = response.data;
        }
      };

      const getTiposDeNegocios = async () => {
        const response = await axios.post('https://apis.madautomate.cloud/webhook/bb230afc-9ef9-43ec-9319-58e9deda6564', {action: "databusiness"}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (response && response.data && Array.isArray(response.data)) {
          negocios.value = response.data;
        }
      };

      getToken();
      getMarcas();
      getTiposDeNegocios();
      onMounted(fetchForms);

      return {
        t,
        forms,
        columns,
        resultActions,
        formData,
        formDataProduct,
        editingIndex,
        openModalForm,
        closeModalForm,
        saveForm,
        isLoading,
        toastTitle,
        toastMessage,
        isSuccess,
        showToastFlag,
        formModal,
        handleImageUpload,
        getToken,
        handleResponse,
        confirmPopup,
        deleteForm,
        triggerToast,
        toastComponent,
        removeImage,
        handleCloseModal,
        cleanData,
        getMarcas,
        getTiposDeNegocios,
        marcas,
        negocios
      };
    }
  };
</script>
 
<style scoped>
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

.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Data Card */
.data-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Form Card in Modal */
.form-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.card-header-modal {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 0.875rem 1.25rem;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.form-card .card-body {
  padding: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control, .custom-select {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  transition: all 0.2s ease;
}

.form-control:focus, .custom-select:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
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
  max-height: 200px;
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

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Modal Footer Buttons */
.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-footer .btn-primary {
  background: #3939ff;
  border-color: #3939ff;
}

.modal-footer .btn-primary:hover {
  background: #2323cc;
  border-color: #2323cc;
  transform: translateY(-1px);
}

.modal-footer .btn-outline-secondary:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

/* Badge */
.badge {
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }
}
</style>