<template>
    <div class="container-fluid mt-4 page">
        <div class="header-section mb-4">
          <h2>Cards Sección 2</h2>
          <button @click="openModalForm()" class="btn btn-primary btn-add">
            <i class="bi bi-plus-circle me-2"></i> {{$t('about.form_new')}}
          </button>
        </div>
        <hr class="header-divider">

        <div class="accordion mb-5" id="accordionSeccion2Cards">
            <div class="accordion-item tip-banner-style">
                <h2 class="accordion-header" id="headingSeccion2Cards">
                <button 
                    class="accordion-button collapsed tip-banner-button" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapseSeccion2Cards" 
                    aria-expanded="false" 
                    aria-controls="collapseSeccion2Cards"
                >
                    <div class="tip-icon">
                    <i class="bi bi-lightbulb-fill"></i>
                    </div>
                    <div class="tip-text">
                    <strong>Tip:</strong> Las Cards de Sección 2 son bloques informativos con imagen, título y texto, sin links, ideales para reforzar beneficios.
                    </div>
                </button>
                </h2>

                <div 
                id="collapseSeccion2Cards" 
                class="accordion-collapse collapse" 
                aria-labelledby="headingSeccion2Cards" 
                data-bs-parent="#accordionSeccion2Cards"
                >
                <div class="accordion-body tip-expanded">
                    <p>
                    Las <strong>cards de la Sección 2</strong> están pensadas para agregar bloques informativos o visuales que complementan la parte inferior del formulario o landing.
                    </p>

                    <ul>
                    <li><strong>Imagen:</strong> cada card permite cargar una imagen principal que funciona como elemento visual destacado.</li>
                    <li><strong>Título y texto:</strong> podés agregar contenido informativo, beneficios o descripciones breves.</li>
                    <li><strong>Sin links:</strong> estas cards no tienen botones ni redirecciones; su función es puramente informativa.</li>
                    <li><strong>Segmentación por Marca y Tipo de Negocio:</strong> podés definir qué cards se muestran según la marca seleccionada y el tipo de negocio asociado.</li>
                    <li><strong>Estilos visuales:</strong> desde el ícono de <em>Styles</em> podés configurar el <strong>color de fondo</strong> y el <strong>color de la fuente</strong> para diseñarlas según la estética de tu marca.</li>
                    </ul>

                    <p class="mb-0">
                    Estas cards son ideales para reforzar información, mostrar beneficios, características o cualquier contenido visual que complemente la propuesta del formulario.
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
        <ModalComponent ref="formModal" modalId="formModal" :modalTitle="editingIndex === null ? 'Nueva Card' : 'Editar Card'" class="modal-xl" @modalClosed="handleCloseModal">
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
                    Imagen de la card
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

            <!-- Contenido -->
            <div class="card form-card mb-3">
                <div class="card-header-modal">
                    <i class="bi bi-text-paragraph me-2"></i>
                    Contenido de la card
                </div>
                <div class="card-body">
                    <label class="form-label">
                        <i class="bi bi-file-text-fill me-2"></i>
                        {{$t('about.form_text')}}:
                    </label>
                    <div class="editor-wrapper">
                        <QuillEditor
                            ref="quillEditor"
                            v-model:content="formData.text"
                            contentType="html"
                            theme="snow"
                        /> 
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
        const formDataAbout = ref(getEmptyFormAbout());
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
        const utlUpdateAbout = 'https://apis.madautomate.cloud/webhook/5a9ab897-444f-4abc-aa8c-f4ea2150e103';
        
        const columns = [
            { label: t('about.list_text'), key: 'text' },
            { label: t('about.list_image'), key: 'imageOrPath'},
            { label: 'Marca', key: 'marca_name'},
            { label: 'Negocio', key: 'tipo_de_negocio_name'}
        ];
        
        const resultActions = [
            { label: t('about.list_edit'), class: 'btn btn-outline btn-sm', method: editForm, icon: '<i class="bi bi-pencil-square"></i>' },
            { label: t('about.list_delete'), class: 'btn btn-sm btn-danger', method: confirmDelete, icon: '<i class="bi bi-trash3"></i>' },
        ];
  
        const fetchForms = async () => {
            isLoading.value = true;
            try {
                const response = await axios.post(utlUpdateAbout, {action: "datacards"}, {
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
                triggerToast('Error!', t('forms.message_error'), false);
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
            dataToSend.action= "savecards"
            
            if (editingIndex.value !== null) {
                forms.value[editingIndex.value] = dataToSend;
            } else {
                forms.value.push(dataToSend);
            }

            try {
                const response = await axios.post(utlUpdateAbout,dataToSend, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });
                closeModalForm();
                await fetchForms();
                triggerToast('Ok!', t('forms.message_success'), true);
            } catch (err) {
                console.error(err);
                triggerToast('Error!', t('forms.message_error'), false);
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
            formData.text = '';
        };
        
        const closeModalForm = () => {
            cleanData()
            formModal.value.closeModal();
        };
  
        const handleCloseModal = () => {
            cleanData()
        };

        function getEmptyForm() {
            return {
                image: '',
                fileName: '',
                path: '',
                text: '',
                background: '#ffffff',
                color: '#000000'
            };
        }
  
        function getEmptyFormAbout() {
            return {
                title: '',
                description: '',
                footer_left: '',
                footer_right: ''
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
                const response = await axios.post(utlUpdateAbout,formDelete, {
                    headers: {
                        Authorization: `Bearer ${token.value}`,
                    },
                });

                if (response.status === 200) {
                    const index = forms.value.findIndex(f => f.id === formDelete.id);
                    if (index !== -1) {
                        forms.value.splice(index, 1);
                    }
                    fetchForms()
                    setTimeout(() => {
                        triggerToast('Ok!', t('forms.message_success'), true);
                    }, 1000)
                }
            } catch (error) {
                console.error('deleteForm', error)
                triggerToast('Error!', t('forms.message_error'), false);
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
            utlUpdateAbout,
            formDataAbout,
            handleCloseModal,
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

/* Editor Wrapper */
.editor-wrapper {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-wrapper :deep(.ql-container) {
  min-height: 200px;
  font-size: 0.95rem;
}

.editor-wrapper :deep(.ql-toolbar) {
  border-bottom: 2px solid #e5e7eb;
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