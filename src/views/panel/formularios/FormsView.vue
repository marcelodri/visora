
  <template>
    <div class="container-fluid mt-4 page">
      <div class="header-section mb-4">
        <h2>{{ $t('forms.title') }}</h2>
        <button @click="openModalForm()" class="btn btn-primary btn-add">
          <i class="bi bi-plus-circle me-2"></i> {{ $t('forms.button_mas') }}
        </button>
      </div>
      <hr class="header-divider">

      <!-- Tip Accordion (sin cambios) -->
      <div class="accordion mb-5" id="accordionForms">
        <div class="accordion-item tip-banner-style">
          <h2 class="accordion-header" id="headingForms">
            <button 
              class="accordion-button collapsed tip-banner-button" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseForms" 
              aria-expanded="false" 
              aria-controls="collapseForms"
            >
              <div class="tip-icon">
                <i class="bi bi-ui-checks-grid"></i>
              </div>
              <div class="tip-text">
                <strong>Tip:</strong> Creá y personalizá tus formularios configurando encabezado, campos, secciones, estilos y mensajes de confirmación.
              </div>
            </button>
          </h2>
          <div 
            id="collapseForms" 
            class="accordion-collapse collapse" 
            aria-labelledby="headingForms" 
            data-bs-parent="#accordionForms"
          >
            <div class="accordion-body tip-expanded">
              <!-- Contenido del tip sin cambios -->
              <p>Esta sección te permite <strong>crear y personalizar los formularios</strong> que luego vas a insertar en tu sitio web.</p>
              <h6 class="mt-3"><strong>1. Encabezado del formulario</strong></h6>
              <ul>
                <li><strong>Título</strong> del formulario</li>
                <li><strong>Descripción</strong> introductoria</li>
                <li><strong>Imagen de cabecera</strong></li>
              </ul>
              <h6 class="mt-3"><strong>2. Campos del formulario</strong></h6>
              <p>Acá agregás los campos que el usuario deberá completar.</p>
              <h6 class="mt-3"><strong>3. Código de llamada</strong></h6>
              <p>👉 <strong>Recordá: cada formulario necesita un código de llamada único.</strong></p>
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

      <!-- MODAL PRINCIPAL -->
      <ModalComponent 
        ref="formModal" 
        modalId="formModal" 
        :modalTitle="editingIndex === null ? 'Nuevo Formulario' : 'Editar Formulario'" 
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

            <!-- 2. IMAGEN -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseImagen">
                  <i class="bi bi-image-fill me-2"></i>
                  2. Imagen del Formulario
                </button>
              </h2>
              <div id="collapseImagen" class="accordion-collapse collapse">
                <div class="accordion-body">
                  <label class="form-label"><i class="bi bi-card-image me-2"></i>{{ $t('forms.form_img') }}:</label>
                  <input type="file" class="d-none" id="fileInput" accept="image/*" @change="handleImageUpload" />
                  <label for="fileInput" class="file-input-label">
                    <i class="bi bi-cloud-upload me-2"></i>
                    {{ formData.fileName || "Seleccionar archivo..." }}
                  </label>
                  <div v-if="formData.image || formData.path" class="image-preview-container">
                    <div class="image-preview">
                      <img :src="formData.image || `https://madcoder.io/apis/images_upload/${formData.path}`" class="preview-image" />
                      <button class="btn-remove-image" @click="removeImage">
                        <i class="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. ENCABEZADO -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEncabezado">
                  <i class="bi bi-text-left me-2"></i>
                  3. Encabezado del Formulario
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
                  4. Campos del Formulario
                </button>
              </h2>
              <div id="collapseCampos" class="accordion-collapse collapse">
                <div class="accordion-body">
                  <div v-for="(field, fieldIndex) in formData.fields" :key="fieldIndex" class="field-item mb-4">
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
                  </button>
                </div>
              </div>
            </div>

            <!-- 5. MENSAJES -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseMensajes">
                  <i class="bi bi-chat-dots-fill me-2"></i>
                  5. Mensajes del Formulario
                </button>
              </h2>
              <div id="collapseMensajes" class="accordion-collapse collapse">
                <div class="accordion-body">
                  <div class="mb-3">
                    <label class="form-label">{{ $t('forms.message_success') }}:</label>
                    <textarea class="form-control" v-model="formData.success"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ $t('forms.message_error') }}:</label>
                    <textarea class="form-control" v-model="formData.error"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- 6. SECCIÓN 1 -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseProducto">
                  <i class="bi bi-grid-3x3-gap-fill me-2"></i>
                  6. Sección 1 (Productos)
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

            <!-- 7. SECCIÓN 2 -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAbout">
                  <i class="bi bi-card-text me-2"></i>
                  7. Sección 2 (About)
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
          <h5 class="mb-3">{{$t('menu.templates')}}</h5>
          <select v-model="formData.selectedStyleOption" class="form-select mb-4">
            <option disabled value="">Selecciona un template</option>
            <option v-for="(item, index) in styleOptions" :key="index" :value="item.code">{{ item.name }}</option>
          </select>

          <h5 class="mb-3">Colores</h5>
          <div v-for="(color, key) in formData.colorOptions" :key="key" class="mb-3">
            <label class="form-label">{{ color.label }}</label>
            <div class="color-picker-wrapper">
              <input type="color" v-model="formData.colorOptions[key].value" class="color-input">
              <input type="text" v-model="formData.colorOptions[key].value" class="color-value-input">
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
      const marcas = ref([]);
      const negocios = ref([]);
      const formDataForm = ref({title: "", description: ""})
      const isModalOpen = ref(false);
      const editingIndex = ref(null);
      const formData = ref({ name: '', image: '', fields: [], service: "pilot", header_text: "", header_subtext: "", header_descript: "", colorOptions:{}, selectedStyleOption:"classic", status: "inactive", about_title:"",about_description:"", product_title: "", product_description: "", about_background: "#ffffff", about_color: "#0000", product_background: "#ffffff", product_color: "#0000" });
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
      // const quillEditorRef1 = ref(null);
      // const quillEditorRef2 = ref(null);
      const url = "https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302";

      onMounted(() => {
        confirmPopup.value = instance?.proxy?.$refs.confirmPopup; // Acceder a $refs en onMounted
      });

      const styleOptions = ref([
        { id: 1, name:"Clásico", image: "https://via.placeholder.com/100", code: "classic" },
        { id: 2, name: "Template B", image: "https://via.placeholder.com/100", code: "template-b"  },
        { id: 3, name: "Landing PRO", image: "https://via.placeholder.com/100", code: "landing-pro"  }
      ]);

      const columns = ref([
        { label: t("forms.list_one"), key: 'name' },
        { label: t("forms.list_two"), key: 'code' },
        { label: t("forms.list_three"), key: 'service' },
        { label: t("menu.settings-brands"), key: 'marca_name' },
        { label: t("menu.settings-business-types"), key: 'tipo_de_negocio_name' }
      ]);

      const colorOptions = ref({
        background: { label: 'Background Color', value: '#ffffff', code: "bg_form" },
        inputs: { label: 'Inputs Color', value: '#f8f9fa', code: "bg_input" },
        text: { label: 'Text Color', value: '#000000', code: "tx_form" },
        placeholder: { label: 'Placeholder Color', value: '#6c757d', code: "pl_form" },
        buttonBg: { label: 'Botón Background Color', value: '#007bff', code: "btn_bg_form" },
        buttonBorder: { label: 'Botón Border Color', value: '#007bff', code: "btn_border_form" },
        buttonText: { label: 'Botón Text Color', value: '#ffffff', code: "btn_txt_form" },
      });
  
      const openModalForm = (index = null) => {
        editingIndex.value = index;
        if (index !== null) {
          formData.value = index;
        } else {
          console.log('formData.value',formData.value);
          formData.value = { name: '', image: '', fields: "", service: "pilot", header_text: "", header_subtext: "", header_descript: "", colorOptions:colorOptions.value, selectedStyleOption:"classic", status: "inactive", about_title:"",about_description:"", product_title: "", product_description: "", about_background: "#ffffff", about_color: "#0000", product_background: "#ffffff", product_color: "#0000" };
        }
        formModal.value.openModal();
      };
  
      const closeModalForm = () => {
        // Limpia ambos editores
        // if (quillEditorRef1.value) {
        //   quillEditorRef1.value.setHTML('');
        //   quillEditorRef1.value.setText('');
        // }
        
        // if (quillEditorRef2.value) {
        //   quillEditorRef2.value.setHTML('');
        //   quillEditorRef2.value.setText('');
        // }
        
        // Resetea los datos
        formData.value = { 
          name: '', 
          image: '', 
          fields: [], 
          about_title: "",
          about_description: "", 
          about_background: "#ffffff",
          about_color: "#0000",
          about_label: "",
          product_title: "", 
          product_description: "",
          product_background: "#ffffff",
          product_color: "#0000",
          product_label: ""
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
  
      const addField = () => {
        // Verificamos si fields está vacío o es una cadena vacía
        if (!formData.value.fields || formData.value.fields === "") {
          formData.value.fields = []; // Si es vacío o cadena vacía, lo transformamos en un array vacío
        }
        formData.value.fields.push({ label: '', name: '', type: 'text', hidden: false, required: false, options: [] });
      };
  
      const removeField = (index) => {
        formData.value.fields.splice(index, 1);
      };
  
      const addOption = (fieldIndex) => {
        formData.value.fields[fieldIndex].options.push({
          text: "", // Campo para el texto visible en el select
          value: "", // Campo para el valor de la opción
        });
      };
  
      const removeOption = (fieldIndex, optIndex) => {
        formData.value.fields[fieldIndex].options.splice(optIndex, 1);
      };
  
      const saveForm = () => {
        if (editingIndex.value === null) {
          instance.proxy.createForm(JSON.parse(JSON.stringify(formData.value)));
        } else {
          forms.value[editingIndex.value] = JSON.parse(JSON.stringify(formData.value));
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
        while (forms.value.some((f) => f.name === newName)) {
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
            const index = forms.value.findIndex(f => f.id === formDelete.id);
            if (index !== -1) {
              forms.value.splice(index, 1); // Eliminar el formulario del array
            }
            await getForms();

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
        form.imageDelete = formData.value.fileName;
        form.image = "";
        form.fileName = "";
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

          forms.value.forEach(form => {
            form.default = (form.id === selectedForm.id) ? true : null;
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
          const response = await axios.post(url, {action: "dataforms"}, {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });

          console.log('response', response.data);

          if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
            // Función para convertir imagen a base64
            forms.value = await Promise.all(
              response.data.map(async (form) => {
                return {
                  ...form,
                  fields: form.fields ? JSON.parse(form.fields) : [],
                  colorOptions: form.colorOptions ? JSON.parse(form.colorOptions) : []
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

        data.fields = JSON.stringify(data.fields);
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
            data.fields = JSON.parse(data.fields)
            data.colorOptions = JSON.parse(data.colorOptions)
            
            forms.value.push(JSON.parse(JSON.stringify(data)));
            closeModalForm();
            await getForms();
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
        //console.log('updateForm', data);

        data.colorOptions = JSON.stringify(data.colorOptions)
        data.fields = JSON.stringify(data.fields)
        data.action = "saveform";

        isLoading.value = true;
        try {
          const postdata = await axios.post(url, data, {
            headers: {
              Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
            },
          });
          if(postdata.status == 200) {
            await getForms();
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

      const removeImage = () => {
        formData.value.imageDelete = formData.value.fileName;
        formData.value.image = "";
        formData.value.path = "";
        formData.value.fileName = "";
      };

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
          icon: '<i class="bi bi-image"></i>'
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

      // Cargar las funciones al iniciar el componente
      getToken();
      getMarcas();
      getTiposDeNegocios();
      getForms();
  
      return {
        forms,
        isModalOpen,
        formData,
        editingIndex,
        openModalForm,
        closeModalForm,
        handleImageUpload,
        addField,
        removeField,
        addOption,
        removeOption,
        saveForm,
        duplicateForm,
        deleteForm,
        getToken,
        getForms,
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
        removeImage,
        confirmPopup,
        handleResponse,
        confirmDelete,
        formDataForm,
        handleCloseModal,
        selectedDefault,
        setDefaultForm,
        getMarcas,
        getTiposDeNegocios,
        negocios,
        marcas,
        enlaceClick,
        duplicateClick

      };

    },
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
}

/* Accordion Modern */
.accordion-modern .accordion-item {
  border: 2px solid #e5e7eb;
  border-radius: 8px !important;
  margin-bottom: 1rem;
  overflow: hidden;
}

.accordion-modern .accordion-button {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  font-weight: 700;
  color: #1f2937;
  padding: 1rem 1.25rem;
}

.accordion-modern .accordion-button:not(.collapsed) {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
}

.accordion-modern .accordion-body {
  padding: 1.5rem;
}

/* Forms */
.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  transition: all 0.2s ease;
}

.form-control:focus, .form-select:focus {
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
}

/* Field Item */
.field-item {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.field-header {
  background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-number {
  font-weight: 700;
  color: #1e40af;
}

.field-body {
  padding: 1rem;
}

/* Options Section */
.options-section {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.option-item {
  display: flex;
  gap: 0.5rem;
}

/* Color Picker */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.color-input {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-value-input {
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem;
  font-family: 'Courier New', monospace;
}

/* Modal Footer */
.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 6px;
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