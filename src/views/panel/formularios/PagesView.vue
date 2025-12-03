
<template>
    <div class="container-fluid mt-4 page forms">

        <div class="header-section mb-4">
            <h2>{{ $t('forms.title') }}</h2>
            <button @click="openModalForm()" class="btn btn-primary btn-add">
                <i class="bi bi-plus-circle me-2"></i> {{ $t('forms.button_mas') }}
            </button>
        </div>

        <hr class="header-divider">

        <!-- Tip Accordion (sin cambios) -->
        <div class="accordion mb-5" id="accordionPages">
        <div class="accordion-item tip-banner-style">
            <h2 class="accordion-header" id="headingPages">
            <button 
                class="accordion-button collapsed tip-banner-button" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapsePages" 
                aria-expanded="false" 
                aria-controls="collapsePages"
            >
                <div class="tip-icon">
                <i class="bi bi-lightbulb-fill"></i>
                </div>
                <div class="tip-text">
                <strong>Tip:</strong> Creá páginas por modelo y negocio con imágenes (carrusel automático si hay más de una), textos personalizados y asociá un formulario de tu biblioteca.
                </div>
            </button>
            </h2>
            <div 
            id="collapsePages" 
            class="accordion-collapse collapse" 
            aria-labelledby="headingPages" 
            data-bs-parent="#accordionPages"
            >
            <div class="accordion-body tip-expanded">
                <p>Esta sección te permite <strong>crear y personalizar páginas individuales</strong> para cada combinación de modelo y negocio.</p>
                
                <h6 class="mt-3"><strong>1. Información básica</strong></h6>
                <ul>
                <li><strong>Modelo</strong>: seleccioná el modelo asociado a esta página</li>
                <li><strong>Negocio</strong>: seleccioná el tipo de negocio</li>
                <li><strong>Código de llamada (Call Code)</strong>: identificador único para integrar esta página</li>
                </ul>

                <h6 class="mt-3"><strong>2. Contenido visual</strong></h6>
                <ul>
                <li><strong>Imágenes</strong>: agregá una o varias imágenes
                    <ul>
                    <li>✨ <strong>Múltiples imágenes</strong>: se activa automáticamente un carrusel</li>
                    <li><strong>Una sola imagen</strong>: se muestra estática</li>
                    </ul>
                </li>
                </ul>

                <h6 class="mt-3"><strong>3. Textos personalizados</strong></h6>
                <ul>
                <li><strong>Título</strong> principal de la página</li>
                <li><strong>Descripción</strong> y otros textos personalizables</li>
                </ul>

                <h6 class="mt-3"><strong>4. Formulario asociado</strong></h6>
                <p>Seleccioná un <strong>formulario existente</strong> de tu biblioteca para asociarlo a esta página.</p>
                <ul>
                <li>✅ Un mismo formulario puede usarse en múltiples páginas</li>
                <li>✅ Podés cambiar el formulario asociado en cualquier momento</li>
                <li>✅ Los cambios en el formulario se reflejan automáticamente en todas las páginas que lo usan</li>
                </ul>

                <div class="alert alert-info mt-3 mb-0">
                <i class="bi bi-info-circle-fill me-2"></i>
                <strong>Recordá:</strong> Los formularios se crean y gestionan por separado en la sección "Formularios". Desde acá solo seleccionás cuál querés asociar a esta página.
                </div>
            </div>
            </div>
        </div>
        </div>

        <div class="card data-card">
        <div class="card-body p-0">
            <DataTableComponent
            :data="pages"
            :columns="columns"
            :actions="resultActions"
            :items-per-page="10"
            :marcas="marcas"
            :negocios="negocios"
            />
        </div>
        </div>

        <!-- MODAL PRINCIPAL -->
        <ModalComponent 
        ref="formModal" 
        modalId="formModal" 
        :modalTitle="editingIndex === null ? 'Nueva página' : 'Editar página'" 
        class="modal-xl" 
        @closeModal="handleCloseModal"
        >
        <div class="modal-body">
            <div class="accordion accordion-modern" id="formAccordion">

            <!-- 1. DATOS BÁSICOS -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingDatosBasicos">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDatosBasicos" aria-expanded="true">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    1. Datos Básicos
                </button>
                </h2>
                <div id="collapseDatosBasicos" class="accordion-collapse collapse show">
                <div class="accordion-body">
                    <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label"><i class="bi bi-globe me-2"></i>Dominio:</label>
                        <input v-model="formData.dominio" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label"><i class="bi bi-file-text me-2"></i>{{ $t('forms.form_name') }}:</label>
                        <input v-model="formData.name" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label"><i class="bi bi-hash me-2"></i>{{ $t('forms.form_code') }}:</label>
                        <input v-model="formData.code" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label"><i class="bi bi-tag-fill me-2"></i>{{ $t('menu.brands') }}:</label>
                        <select v-model="formData.marca_id" class="form-select">
                        <option value="">Seleccione una marca</option>
                        <option v-for="marca in marcas" :key="marca.id" :value="marca.id">{{ marca.name }}</option>
                        </select>
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label"><i class="bi bi-briefcase-fill me-2"></i>{{ $t('menu.business-types') }}:</label>
                        <select v-model="formData.tipo_de_negocio_id" class="form-select">
                        <option value="">Seleccione un tipo de negocio</option>
                        <option v-for="negocio in negocios" :key="negocio.id" :value="negocio.id">{{ negocio.name }}</option>
                        </select>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- 2. IMÁGENES (MÚLTIPLES) -->
            <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseImagen">
                <i class="bi bi-images me-2"></i>
                2. Imágenes de la página
                </button>
            </h2>
            <div id="collapseImagen" class="accordion-collapse collapse">
                <div class="accordion-body">
                <label class="form-label">
                    <i class="bi bi-card-image me-2"></i>{{ $t('forms.form_img') }}:
                </label>
                
                <!-- Input para múltiples archivos -->
                <input 
                    type="file" 
                    class="d-none" 
                    id="fileInput" 
                    accept="image/*" 
                    multiple
                    @change="handleMultipleImageUpload" 
                />
                <label for="fileInput" class="file-input-label">
                    <i class="bi bi-cloud-upload me-2"></i>
                    Seleccionar imágenes...
                </label>

                <!-- Contador de imágenes -->
                <div v-if="formData.images && formData.images.length > 0" class="mt-2 mb-3">
                    <small class="text-muted">
                    {{ formData.images.length }} imagen(es) cargada(s)
                    </small>
                </div>

                <!-- Grid de imágenes -->
                <div v-if="formData.images && formData.images.length > 0" class="images-grid">
                    <div 
                    v-for="(img, index) in formData.images" 
                    :key="index" 
                    class="image-preview-container"
                    >
                    <div class="image-preview">
                        <img 
                        :src="img.data || `https://madcoder.io/apis/images_upload/${img.path}`" 
                        class="preview-image" 
                        :alt="`Imagen ${index + 1}`"
                        />
                        <button 
                        class="btn-remove-image" 
                        @click="removeImageByIndex(index, img)"
                        type="button"
                        >
                        <i class="bi bi-trash3"></i>
                        </button>
                        <div class="image-number">{{ index + 1 }}</div>
                    </div>
                    </div>
                </div>

                <!-- Mensaje cuando no hay imágenes -->
                <div v-else class="text-center text-muted py-4">
                    <i class="bi bi-image" style="font-size: 3rem;"></i>
                    <p class="mt-2">No hay imágenes cargadas</p>
                </div>
                </div>
            </div>
            </div>

            <!-- 3. ENCABEZADO -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEncabezado">
                    <i class="bi bi-text-left me-2"></i>
                    3. Encabezado de la página
                </button>
                </h2>
                <div id="collapseEncabezado" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="mb-3">
                    <label class="form-label">{{ $t('forms.form_title') }}:</label>
                    <input v-model="formData.header_text" type="text" class="form-control" />
                    </div>
                    <div class="mb-3">
                    <label class="form-label">{{ $t('forms.form_subtitle') }}:</label>
                    <input v-model="formData.header_subtext" type="text" class="form-control" />
                    </div>
                    <div class="mb-3">
                    <label class="form-label">{{ $t('forms.form_descript') }}:</label>
                    <textarea v-model="formData.header_descript" class="form-control" style="height:160px"></textarea>
                    </div>
                </div>
                </div>
            </div>

            <!-- 4. CAMPOS (mantener funcionalidad completa) -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCampos">
                    <i class="bi bi-ui-checks-grid me-2"></i>
                    4. Formulario
                </button>
                </h2>
                <div id="collapseCampos" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="col-12 col-md-6">
                    <label class="form-label">Selecciona un formulario:</label>
                    <select v-model="formData.form_id" class="form-select">
                        <option value=0>Ninguno</option>
                        <option v-for="form in forms" :key="form.id" :value="form.id">{{ form.name }}</option>
                    </select>
                    </div>
                    <!-- <div v-for="(field, fieldIndex) in formData.fields" :key="fieldIndex" class="field-item mb-4">
                    <div class="field-header">
                        <span class="field-number">Campo {{ fieldIndex + 1 }}</span>
                        <button class="btn btn-sm btn-danger" @click="removeField(fieldIndex)">
                        <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    
                    <div class="field-body">
                        <div class="row g-3 mb-3">
                        <div class="col-6">
                            <div class="form-check">
                            <input type="checkbox" class="form-check-input" v-model="field.hidden" :id="'hidden' + fieldIndex" />
                            <label class="form-check-label" :for="'hidden' + fieldIndex">Hidden</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                            <input type="checkbox" class="form-check-input" v-model="field.required" :id="'required' + fieldIndex" />
                            <label class="form-check-label" :for="'required' + fieldIndex">Requerido</label>
                            </div>
                        </div>
                        </div>

                        <div class="row g-3 mb-3">
                        <div class="col-4">
                            <label class="form-label">{{ $t('forms.form_field_label') }}:</label>
                            <input v-model="field.label" class="form-control" placeholder="Etiqueta" />
                        </div>
                        <div class="col-4">
                            <label class="form-label">{{ $t('forms.form_field_name') }}:</label>
                            <input v-model="field.name" class="form-control" placeholder="Nombre" />
                        </div>
                        <div class="col-4">
                            <label class="form-label">{{ $t('forms.form_field_value') }}:</label>
                            <input v-model="field.value" class="form-control" placeholder="Valor" />
                        </div>
                        </div>

                        <div class="mb-3">
                        <label class="form-label">{{ $t('forms.form_field_type') }}:</label>
                        <select v-model="field.type" class="form-select">
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="email">Email</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                        </select>
                        </div>

                        <div v-if="field.type === 'select'" class="options-section">
                        <h6>{{ $t('forms.form_field_options') }}</h6>
                        <div v-for="(option, optIndex) in field.options" :key="optIndex" class="option-item mb-2">
                            <input v-model="option.text" class="form-control" placeholder="Texto" />
                            <input v-model="option.value" class="form-control" placeholder="Valor" />
                            <button class="btn btn-sm btn-danger" @click="removeOption(fieldIndex, optIndex)">×</button>
                        </div>
                        <button class="btn btn-sm btn-secondary" @click="addOption(fieldIndex)">
                            <i class="bi bi-plus-circle me-1"></i>Agregar opción
                        </button>
                        </div>
                    </div>
                    </div>
                    <button class="btn btn-primary" @click="addField">
                    <i class="bi bi-plus-circle me-2"></i>Agregar Campo
                    </button> -->
                </div>
                </div>
            </div>

            <!-- 5. SECCIÓN 1 -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseProducto">
                    <i class="bi bi-grid-3x3-gap-fill me-2"></i>
                    5. Sección 1 (Productos)
                </button>
                </h2>
                <div id="collapseProducto" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="row g-3 mb-3">
                    <div class="col-12 col-md-6">
                        <label class="form-label">Enlace Name</label>
                        <input v-model="formData.product_label" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label">Product Title</label>
                        <input v-model="formData.product_title" type="text" class="form-control" />
                    </div>
                    </div>
                    <div class="mb-3">
                    <label class="form-label">Product Descripción</label>
                    <textarea class="form-control" v-model="formData.product_description" style="height:200px"></textarea>
                    </div>
                    <div class="row g-3">
                    <div class="col-6">
                        <label class="form-label">Background</label>
                        <div class="color-picker-wrapper">
                        <input v-model="formData.product_background" type="color" class="color-input" />
                        <input type="text" v-model="formData.product_background" class="color-value-input" />
                        </div>
                    </div>
                    <div class="col-6">
                        <label class="form-label">Color</label>
                        <div class="color-picker-wrapper">
                        <input v-model="formData.product_color" type="color" class="color-input" />
                        <input type="text" v-model="formData.product_color" class="color-value-input" />
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- 6. SECCIÓN 2 -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAbout">
                    <i class="bi bi-card-text me-2"></i>
                    6. Sección 2 (About)
                </button>
                </h2>
                <div id="collapseAbout" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="row g-3 mb-3">
                    <div class="col-12 col-md-6">
                        <label class="form-label">Enlace Name</label>
                        <input v-model="formData.about_label" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label">About Title</label>
                        <input v-model="formData.about_title" type="text" class="form-control" />
                    </div>
                    </div>
                    <div class="mb-3">
                    <label class="form-label">About Descripción</label>
                    <textarea class="form-control" v-model="formData.about_description" style="height:200px"></textarea>
                    </div>
                    <div class="row g-3">
                    <div class="col-6">
                        <label class="form-label">Background</label>
                        <div class="color-picker-wrapper">
                        <input v-model="formData.about_background" type="color" class="color-input" />
                        <input type="text" v-model="formData.about_background" class="color-value-input" />
                        </div>
                    </div>
                    <div class="col-6">
                        <label class="form-label">Color</label>
                        <div class="color-picker-wrapper">
                        <input v-model="formData.about_color" type="color" class="color-input" />
                        <input type="text" v-model="formData.about_color" class="color-value-input" />
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveForm">
            <i class="bi bi-floppy me-2"></i>{{$t('search_view.save')}}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
            <i class="bi bi-x-circle me-2"></i>{{$t('search_view.cancel')}}
            </button>
        </div>
        </ModalComponent>

        <!-- MODAL ESTILOS (simplificado) -->
        <ModalComponent ref="styleModal" modalId="styleModal" :modalTitle="'Estilo de formulario'" class="modal-xl">
        <div class="modal-body">
            <div class="mb-5">
            <h5 class="mb-3">{{$t('menu.templates')}}</h5>
            <select v-model="formData.selectedStyleOption" class="form-select mb-4">
            <option disabled value="">Selecciona un template</option>
            <option v-for="(item, index) in styleOptions" :key="index" :value="item.code">{{ item.name }}</option>
            </select>
            </div>

            <div class="mb-5">
            <h5 class="mb-3">Colores</h5>
            <div v-for="(color, key) in formData.colorOptions" :key="key" class="mb-3">
            <label class="form-label">{{ color.label }}</label>
            <div class="color-picker-wrapper">
                <input type="color" v-model="formData.colorOptions[key].value" class="color-input">
                <input type="text" v-model="formData.colorOptions[key].value" class="color-value-input">
            </div>
            </div>
            </div>

            <div class="mb-5">
            <div class="col-12">
                <h5 class="form-label">ClassName</h5>
                <input v-model="formData.className" type="text" class="form-control" />
            </div>
            </div>

            <div class="mb-5">
                <div class="col-12">
                    <h5 class="form-label">CSS Personalizado</h5>
                    <textarea 
                        v-model="formData.css" 
                        class="form-control css-editor" 
                        rows="15"
                        placeholder="/* Escribe tu CSS aquí */
            .mi-clase {
                color: #333;
                font-size: 16px;
            }"
                        spellcheck="false"
                        @keydown.tab.prevent="handleTab"
                    ></textarea>
                    <small class="form-text text-muted">
                        Escribe CSS sin la etiqueta &lt;style&gt;. El código se aplicará automáticamente al formulario.
                    </small>
                </div>
            </div>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveStyleForm">
            <i class="bi bi-floppy me-2"></i>{{$t('search_view.save')}}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="closeStyleModalForm">
            <i class="bi bi-x-circle me-2"></i>{{$t('search_view.cancel')}}
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
  import { ref, getCurrentInstance, onMounted, nextTick } from 'vue';
  import axios from 'axios';
  import DataTableComponent from '@/components/DataTableComponent.vue';
  import ModalComponent from '@/components/ModalComponent.vue';
  import ToastComponent from '@/components/ToastComponent.vue'; // Asegúrate de ajustar la ruta
  import ConfirmPopup from '@/components/ConfirmPopup.vue'
  import { useI18n } from "vue-i18n";

  export default {
    components: {
      ModalComponent,
      DataTableComponent,
      ToastComponent,
      ConfirmPopup
    },
    setup() {

        const { t } = useI18n();
        const instance = getCurrentInstance();
        const forms = ref([]);
        const pages = ref([]);
        const marcas = ref([]);
        const negocios = ref([]);
        const isModalOpen = ref(false);
        const editingIndex = ref(null);
        const formData = ref({ name: '', image: '', images: [], images_deleted: [], header_text: "", header_subtext: "", header_descript: "", colorOptions:{}, selectedStyleOption:"classic", status: "inactive", about_title:"",about_description:"", product_title: "", product_description: "", about_background: "#ffffff", about_color: "#0000", product_background: "#ffffff", product_color: "#0000", form_id: null });
        const token = ref(null);
        const isLoading = ref(false);
        const formModal = ref(null);
        const styleModal = ref(null);
        const toastTitle = ref('');
        const toastMessage = ref('');
        const isSuccess = ref(true);
        const toastComponent = ref(null); // Referencia del ToastComponent
        const showToastFlag = ref(false);
        const confirmPopup = ref(null);
        const actionToExecute = ref(null);
        const selectedForm = ref(null);
        let formDelete = {};
        const styleOptions = ref([]);
        // const quillEditorRef1 = ref(null);
        // const quillEditorRef2 = ref(null);
        const url_forms = "https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302";
        const url = "https://apis.madautomate.cloud/webhook/c535ea5e-4f73-4237-b6c6-51eef225cdd2";

        onMounted(() => {
            confirmPopup.value = instance?.proxy?.$refs.confirmPopup; // Acceder a $refs en onMounted
        });

        const columns = ref([
            { label: t("forms.list_one"), key: 'name' },
            { label: t("forms.list_two"), key: 'code' },
            { label: t("menu.settings-brands"), key: 'marca_name' },
            { label: t("menu.settings-business-types"), key: 'tipo_de_negocio_name' },
            { label: t("menu.settings-templates"), key: 'selectedStyleOption' }
        ]);

        const colorOptions = ref({
            background: { label: 'Background Color', value: '#ffffff', code: "bg_form" },
            text: { label: 'Text Color', value: '#000000', code: "tx_form" }
        });
  
        const openModalForm = (index = null) => {
            editingIndex.value = index;
            if (index !== null) {
                // Clonar datos existentes
                formData.value = JSON.parse(JSON.stringify(index));
                
                // Asegurarse de que images sea un array
                if (!Array.isArray(formData.value.images)) {
                formData.value.images = formData.value.images ? [formData.value.images] : [];
                }
            } 
            formModal.value.openModal();
        };
  
        const closeModalForm = () => {
            // Resetea los datos
            formData.value = { 
                name: '', 
                image: '', 
                images: [], // CAMBIO: de 'image' a 'images' array
                about_title: "",
                about_description: "", 
                about_background: "#ffffff",
                about_color: "#0000",
                about_label: "",
                product_title: "", 
                product_description: "",
                product_background: "#ffffff",
                product_color: "#0000",
                product_label: "",
                form_id: null,
                images_deleted: []
            };
            formModal.value.closeModal();
        };
  
        const closeStyleModalForm = () => {
            styleModal.value.closeModal();
        }

        const handleCloseModal = () => {
            closeModalForm();
            closeStyleModalForm();
            // acá hacés lo que necesites cuando el modal se cierre
        };

        const handleImageUpload = (event) => {
            const file = event.target.files[0];
            formData.value.fileName = file.name; // Guardar el nombre del archivo
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                formData.value.image = reader.result;
                };
                reader.readAsDataURL(file);
            }
        };
  
        // Manejador para cargar múltiples imágenes
        const handleMultipleImageUpload = (event) => {
            const files = Array.from(event.target.files);
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                formData.value.images.push({
                    name: file.name,
                    data: reader.result, // base64
                    id: Date.now() + Math.random() // ID único temporal
                });
                };
                reader.readAsDataURL(file);
            });
        };

      
        const saveForm = () => {
            if (editingIndex.value === null) {
                instance.proxy.createForm(JSON.parse(JSON.stringify(formData.value)));
            } else {
                pages.value[editingIndex.value] = JSON.parse(JSON.stringify(formData.value));
                instance.proxy.updateForm(JSON.parse(JSON.stringify(formData.value)));
            }
            closeModalForm();
        };
  
        const duplicateForm = (index = null) => {
            const original = index;
            console.log('index', index)
            let baseName = original.name.replace(/_copy_\d+$/, '').replace(/_copy$/, '');
            let newName = baseName + '_copy';
            let baseCode = original.code.replace(/_copy_\d+$/, '').replace(/_copy$/, '');
            let newCode = baseCode + '_copy';
            let count = 1;
            while (pages.value.some((f) => f.name === newName)) {
                count++;
                newName = `${baseName}_copy_${count}`;
                newCode = `${baseCode}_copy_${count}`;
            }
            const newForm = JSON.parse(JSON.stringify(original));
            delete newForm.id;
            newForm.name = newName;
            newForm.code = newCode;
            newForm.duplicateForm = true;
            createForm(newForm);
        };
  

        const deleteForm = async () => {
            isLoading.value = true;
            formDelete.action = "deleteForm";

            try {
                const response = await axios.post(url,formDelete, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                });
                if (response.status === 200) {
                // Buscar el índice del formulario en el array por ID
                const index = pages.value.findIndex(f => f.id === formDelete.id);
                if (index !== -1) {
                    pages.value.splice(index, 1); // Eliminar el formulario del array
                }
                await getPages();

                setTimeout(() => {
                    triggerToast('Realizado!', 'Formulario eliminado!', true);
                }, 1000)
                }
            } catch (error) {
                console.error('Error al obtener las columnas:', error);
                setTimeout(() => {
                triggerToast('Error!', $t('limit_form'), false);
                }, 1000)
            } finally {
                isLoading.value = false;
            }

        };
      

        const handleResponse = (isConfirmed) => {
            if (!isConfirmed) return;

            if (actionToExecute.value === "delete") {
                deleteForm(selectedForm.value);
            }

            if (actionToExecute.value === "duplicate") {
                duplicateForm(selectedForm.value);
            }

            // limpiar acción
            actionToExecute.value = null;
            selectedForm.value = null;
        };
      
        const confirmDelete = (form) => {
            formDelete = form;
            actionToExecute.value = "delete";
            confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
        }

        const duplicateClick = (form) => {
            selectedForm.value = form;
            actionToExecute.value = "duplicate";
            confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
        }

        const selectedDefault = async (selectedForm) => {
            try {
                await setDefaultForm(selectedForm);

                pages.value.forEach(pages => {
                pages.default = (pages.id === selectedForm.id) ? true : null;
                });

            } catch (error) {
                console.error('Error al actualizar el formulario:', error);
            }
        }

        // Métodos externos (equivalentes a los de methods)
        const getToken = async () => {
            token.value = sessionStorage.getItem('token');
        };
  
        const getMarcas = async () => {

        const response = await axios.post('https://apis.madautomate.cloud/webhook/7279e62e-5ab0-4f43-9707-c1ff44e95d89', {action: 'databrands'}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (response && response.data && Array.isArray(response.data)) {
            marcas.value = response.data; // 🔁 Carga los datos en el datatable
        }

        };

        const getTiposDeNegocios = async () => {

        const response = await axios.post('https://apis.madautomate.cloud/webhook/bb230afc-9ef9-43ec-9319-58e9deda6564', {action: "databusiness"}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (response && response.data && Array.isArray(response.data)) {
            negocios.value = response.data; // 🔁 Carga los datos en el datatable
        }

        };

        const getForms = async () => {
        isLoading.value = true;

        try {
            const response = await axios.post(url_forms, {action: "dataforms"}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
            });

            console.log('getForms', response.data);

            if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
            // Función para convertir imagen a base64
            forms.value = response.data
            }
        } catch (error) {
            console.error('Error al obtener las columnas:', error);
        } finally {
            isLoading.value = false;
        }
        };

        const getPages = async () => {
            isLoading.value = true;

            try {
                const response = await axios.post(url, {action: "dataforms"}, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                });

                console.log('getPages', response.data);

                if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
                // Función para convertir imagen a base64
                pages.value = await Promise.all(
                    response.data.map(async (form) => {
                    return {
                        ...form,
                        images_deleted: [],
                        colorOptions: form.colorOptions ? JSON.parse(form.colorOptions) : [],
                        images: form.images ? JSON.parse(form.images) : [] // Parsear images
                    };
                    })
                );
                }
            } catch (error) {
                console.error('Error al obtener las columnas:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const createForm = async (data) => {

        data.images = JSON.stringify(data.images);
        data.images_deleted = JSON.stringify(data.images_deleted);
        data.action = "saveform";
        delete data.id;

        if(!data.duplicateForm) {
            data.colorOptions = JSON.stringify(colorOptions.value);
        } else {
            data.colorOptions = JSON.stringify(data.colorOptions);
        }

        isLoading.value = true;
        
        console.log('data', data);

        try {
            const postdata = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
            },
            });

            if(postdata.status == 200) {

            data.id = postdata.data.id;
            data.colorOptions = JSON.parse(data.colorOptions)
            
            pages.value.push(JSON.parse(JSON.stringify(data)));
            closeModalForm();
            await getPages();
            setTimeout(() => {
                triggerToast('Realizado!', 'Formulario creado!', true);
            }, 1000)
            }

        } catch (error) {
            console.error('Error al guardar la consulta:', error);

            // Aseguramos que el backend devuelva algo tipo "forms.limit_form"
            const errorKey = error?.response?.data?.error || 'forms.message_error';

            // Verificamos si existe la clave
            const translated = t(errorKey) !== errorKey ? t(errorKey) : t('forms.message_error');
            setTimeout(() => {
            triggerToast('Error', translated, false);
            }, 1000);

        } finally {
            isLoading.value = false;
        }
        };

        const updateForm = async (data) => {
            console.log('updateForm', data);

            data.colorOptions = JSON.stringify(data.colorOptions)
            data.images = JSON.stringify(data.images);
            data.images_deleted = JSON.stringify(data.images_deleted);
            data.action = "saveform";

            isLoading.value = true;
            try {
                const postdata = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
                },
                });
                if(postdata.status == 200) {
                await getPages();
                setTimeout(() => {
                    triggerToast('Realizado!', 'Formulario actualizado!', true);
                }, 1000)
                }
                closeStyleModalForm();
            } catch (error) {
                console.error('Error al guardar la consulta:', error);
            } finally {
                isLoading.value = false;
            }

        };

        const setDefaultForm = async (data) => {
            isLoading.value = true;
            data.action= 'setdefault';
            try {
                const postdata = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
                },
                });
            } catch (error) {
                console.error('Error al guardar la consulta:', error);
            } finally {
                isLoading.value = false;
            }

        }

        const styleForm = async (index = null) => {
            editingIndex.value = index;
            formData.value = index;
            styleModal.value.openModal();
        }

        const saveStyleForm = async () => {
            // Crear una copia del formData y convertir colorOptions a string
            const formDataToSend = {
                ...formData.value,
                colorOptions: formData.value.colorOptions
            };
            instance.proxy.updateForm(formDataToSend); // Enviar la data corregida
        };
  
        const triggerToast = (title, message, success) => {
            toastTitle.value = title;
            toastMessage.value = message;
            isSuccess.value = success;
            toastComponent.value.showToas();
        };

        const removeImageByIndex = (index, img) => {
            console.log('removeImageByIndex', index)
            console.log('removeImageByIndex img:', img)

            if (!formData.value.images || index < 0 || index >= formData.value.images.length) {
                console.warn('Índice inválido')
                return
            }

            formData.value.images.splice(index, 1)

            formData.value.images_deleted.push({id: img.id})
            console.log('Imagen eliminada del front')
        }

        const enlaceClick = (row) => {
        const data = row?.__v_raw || row;
        //console.log('data', data)
        try {
            // Dominio base (podés reemplazar por el tuyo o tomarlo de la instancia)
            const dominio = data.dominio; 

            // Validar que tenga código
            if (!data.code) {
            alert("El formulario no tiene un código asignado.");
            return;
            }

            // Construir la URL final
            const url = `${dominio}?code=${data.code}`;

            // Abrir en una nueva pestaña
            window.open(url, "_blank");
        } catch (err) {
            console.error("Error al abrir el enlace:", err);
        }
        };

        const resultActions = [
        {
            label: "Establecer como defecto",
            class: 'btn btn-sm btn-outline',
            method: selectedDefault,
            icon: (row) => row.default === true || row.default === 1
            ? '<i class="bi bi-star-fill"></i>'
            : '<i class="bi bi-star"></i>'
        },
        {
            label: t("forms.action_edit"),
            class: 'btn btn-sm btn-outline',
            method: openModalForm,
            icon: '<i class="bi bi-pencil-square"></i>'
        },
            {
            label: t("forms.action_duplicate"),
            class: 'btn btn-sm btn-outline',
            method: duplicateClick,
            icon: '<i class="bi bi-copy"></i>'
        },
        {
            label: t("forms.action_style"),
            class: 'btn btn-sm btn-style',
            method: styleForm,
            icon: '<i class="bi bi-palette"></i>'
        },
        {
            label: "Link",
            class: 'btn btn-sm btn-outline',
            method: enlaceClick,
            icon: '<i class="bi bi-box-arrow-up-right"></i>'
        },
        {
            label: t("forms.action_delete"),
            class: 'btn btn-danger btn-sm',
            method: confirmDelete,
            icon: '<i class="bi bi-trash3"></i>'
        }
        ];
        
        const getPlantillas = async () => {

            const response = await axios.post(url, {action: 'dataTemplates'}, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            if (response && response.data && Array.isArray(response.data)) {
                styleOptions.value = response.data; // 🔁 Carga los datos en el datatable
            }

            // styleOptions.value = [
            //     { id: 1, name:"Clásico", code: "classic" },
            //     { id: 2, name: "Template B", code: "template-b"  },
            //     { id: 3, name: "Landing PRO", code: "landing-pro"  }
            // ];

        }
        // Cargar las funciones al iniciar el componente
        getToken();
        getMarcas();
        getTiposDeNegocios();
        getPlantillas();
        getForms();
        getPages();
  
        return {
        forms,
        pages,
        isModalOpen,
        formData,
        editingIndex,
        openModalForm,
        closeModalForm,
        handleImageUpload,
        saveForm,
        duplicateForm,
        deleteForm,
        getToken,
        getForms,
        getPages,
        createForm,
        columns,
        resultActions,
        isLoading,
        formModal,
        styleModal,
        styleOptions,
        colorOptions,
        closeStyleModalForm,
        saveStyleForm,
        updateForm,
        triggerToast,
        toastComponent,
        toastTitle,
        toastMessage,
        isSuccess,
        showToastFlag,
        confirmPopup,
        handleResponse,
        confirmDelete,
        handleCloseModal,
        selectedDefault,
        setDefaultForm,
        getMarcas,
        getTiposDeNegocios,
        negocios,
        marcas,
        enlaceClick,
        duplicateClick,
        handleMultipleImageUpload,
        removeImageByIndex,
        getPlantillas

        };

    },
  };
  </script>

