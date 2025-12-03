<template>
  <div class="container-fluid mt-4 page forms">
    <div class="header-section mb-4">
      <h2>Formularios</h2>
      <button @click="openModalForm()" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> Nuevo formulario
      </button>
    </div>
    <hr class="header-divider">

    <!-- Tip Accordion -->
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
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Creá formularios reutilizables con campos personalizados, estilos y mensajes. Un mismo formulario puede usarse en múltiples páginas.
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
            <p>Esta sección te permite <strong>crear y gestionar tu biblioteca de formularios</strong>. Los formularios se crean de forma independiente y luego se asocian a las páginas desde la configuración de cada página.</p>
            
            <h6 class="mt-3"><strong>1. Información del formulario</strong></h6>
            <ul>
              <li><strong>Nombre del formulario</strong>: identificador interno para reconocerlo fácilmente</li>
              <li><strong>Título</strong>: el título que verán los usuarios</li>
              <li><strong>Descripción</strong>: texto introductorio del formulario</li>
            </ul>

            <h6 class="mt-3"><strong>2. Campos personalizados</strong></h6>
            <p>Agregá y configurá los campos que el usuario deberá completar:</p>
            <ul>
              <li><strong>Tipos disponibles</strong>: texto, email, teléfono, select, textarea, checkbox, etc.</li>
              <li><strong>Validaciones</strong>: campos obligatorios, formato de email, longitud, etc.</li>
              <li><strong>Orden</strong>: organizá los campos en el orden que prefieras</li>
            </ul>

            <h6 class="mt-3"><strong>3. Configuración y servicios</strong></h6>
            <ul>
              <li><strong>Servicio asociado</strong>: seleccioná el servicio que procesará los datos</li>
              <li><strong>Mensajes de confirmación</strong>: personalizá mensajes de éxito y error</li>
              <li><strong>Estilos</strong>: ajustá colores, botones y apariencia general</li>
            </ul>

            <div class="alert alert-success mt-3">
              <i class="bi bi-star-fill me-2"></i>
              <strong>Ventajas de la gestión independiente:</strong>
              <ul class="mb-0 mt-2">
                <li>✅ <strong>Reutilización</strong>: usá el mismo formulario en múltiples páginas</li>
                <li>✅ <strong>Mantenimiento centralizado</strong>: modificá una vez, se actualiza en todas las páginas</li>
                <li>✅ <strong>Organización</strong>: mantené todos tus formularios en un solo lugar</li>
                <li>✅ <strong>Flexibilidad</strong>: creá formularios específicos o genéricos según necesites</li>
              </ul>
            </div>

            <div class="alert alert-info mt-3 mb-0">
              <i class="bi bi-info-circle-fill me-2"></i>
              <strong>¿Cómo usar los formularios?</strong> Una vez creado tu formulario, andá a la sección "Páginas" y asocialo a la página que quieras desde el selector de formularios.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de datos -->
    <div class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="forms"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
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
        <!-- Nombre del formulario -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-card-heading me-2"></i>
                Nombre:
              </label>
              <input 
                v-model="formData.name" 
                type="text" 
                class="form-control" 
                placeholder="Ingrese el nombre del formulario" 
              />
            </div>
          </div>
        </div>

        <!-- Título del formulario -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-type-h1 me-2"></i>
                Título:
              </label>
              <input 
                v-model="formData.header_text" 
                type="text" 
                class="form-control" 
                placeholder="Ingrese título del formulario (opcional)" 
              />
            </div>
          </div>
        </div>
        
        <!-- Descripción -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-text-paragraph me-2"></i>
                Descripción (opcional):
              </label>
              <textarea 
                v-model="formData.header_descript" 
                class="form-control" 
                rows="4" 
                placeholder="Ingrese descripción del formulario (opcional)"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Campos del formulario -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-ui-checks me-2"></i>
                Campos del formulario:
              </label>
              
              <div v-for="(field, fieldIndex) in formData.fields" :key="fieldIndex" class="field-item mb-4">
                <div class="field-header">
                  <span class="field-number">
                    <i class="bi bi-input-cursor-text me-1"></i>
                    Campo {{ fieldIndex + 1 }}
                  </span>
                  <button class="btn btn-sm btn-danger" @click="removeField(fieldIndex)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                
                <div class="field-body">
                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" v-model="field.hidden" :id="'hidden' + fieldIndex" />
                        <label class="form-check-label" :for="'hidden' + fieldIndex">
                          <i class="bi bi-eye-slash me-1"></i>
                          Campo oculto
                        </label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" v-model="field.required" :id="'required' + fieldIndex" />
                        <label class="form-check-label" :for="'required' + fieldIndex">
                          <i class="bi bi-asterisk me-1"></i>
                          Requerido
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label">Etiqueta:</label>
                      <input v-model="field.label" class="form-control" placeholder="Ej: Nombre completo" />
                    </div>
                    <div class="col-4">
                      <label class="form-label">Nombre del campo:</label>
                      <input v-model="field.name" class="form-control" placeholder="Ej: full_name" />
                    </div>
                    <div class="col-4">
                      <label class="form-label">Valor por defecto:</label>
                      <input v-model="field.value" class="form-control" placeholder="Opcional" />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Tipo de campo:</label>
                    <select v-model="field.type" class="form-select">
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="email">Email</option>
                      <option value="textarea">Área de texto</option>
                      <option value="select">Lista desplegable</option>
                    </select>
                  </div>

                  <div v-if="field.type === 'select'" class="options-section">
                    <h6>
                      <i class="bi bi-list-ul me-1"></i>
                      Opciones del select
                    </h6>
                    <div v-for="(option, optIndex) in field.options" :key="optIndex" class="option-item mb-2">
                      <input v-model="option.text" class="form-control" placeholder="Texto visible" />
                      <input v-model="option.value" class="form-control" placeholder="Valor" />
                      <button class="btn btn-sm btn-danger" @click="removeOption(fieldIndex, optIndex)">
                        <i class="bi bi-x-lg"></i>
                      </button>
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

        <!-- Servicios -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-gear-fill me-2"></i>
                Servicio:
              </label>
              <select v-model="formData.service" class="form-select">
                <option disabled value="">Selecciona un servicio</option>
                <option v-for="(item, index) in services" :key="index" :value="item.name">
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mensaje de éxito -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-check-circle me-2"></i>
                Mensaje de éxito:
              </label>
              <textarea 
                v-model="formData.success" 
                class="form-control" 
                rows="4" 
                placeholder="Mensaje que verá el usuario al enviar correctamente el formulario"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div class="card form-card mb-3">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Mensaje de error:
              </label>
              <textarea 
                v-model="formData.error" 
                class="form-control" 
                rows="4" 
                placeholder="Mensaje que verá el usuario si ocurre un error"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="saveForm">
          <i class="bi bi-floppy me-2"></i>{{ $t('search_view.save') }}
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
          <i class="bi bi-x-circle me-2"></i>{{ $t('search_view.cancel') }}
        </button>
      </div>
    </ModalComponent>

    <!-- MODAL ESTILOS -->
    <ModalComponent 
      ref="styleModal" 
      modalId="styleModal" 
      :modalTitle="'Estilos del formulario'" 
      class="modal-xl"
    >
      <div class="modal-body">
        <h5 class="mb-3">
          <i class="bi bi-palette me-2"></i>
          Personalización de colores
        </h5>
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
          <i class="bi bi-floppy me-2"></i>{{ $t('search_view.save') }}
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeStyleModalForm">
          <i class="bi bi-x-circle me-2"></i>{{ $t('search_view.cancel') }}
        </button>
      </div>
    </ModalComponent>

    <!-- Componentes auxiliares -->
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
import { ref, getCurrentInstance, onMounted } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
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
    const editingIndex = ref(null);
    const formData = ref({ 
      name: '', 
      images: [],
      fields: [], 
      header_text: "",
      header_subtext: "",
      header_descript: "",
      success: "",
      error: "",
      service: "",
      status: "draft",
      colorOptions: {
      background: { label: 'Color de fondo', value: '#ffffff', code: "bg_form" },
      inputs: { label: 'Color de inputs', value: '#f8f9fa', code: "bg_input" },
      text: { label: 'Color de texto', value: '#000000', code: "tx_form" },
      placeholder: { label: 'Color de placeholder', value: '#6c757d', code: "pl_form" },
      buttonBg: { label: 'Color de fondo del botón', value: '#007bff', code: "btn_bg_form" },
      buttonBorder: { label: 'Color de borde del botón', value: '#007bff', code: "btn_border_form" },
      buttonText: { label: 'Color de texto del botón', value: '#ffffff', code: "btn_txt_form" },
    },
      appkey_pilot: ""
    });
    const token = ref(null);
    const isLoading = ref(false);
    const formModal = ref(null);
    const styleModal = ref(null);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    const toastComponent = ref(null);
    const showToastFlag = ref(false);
    const confirmPopup = ref(null);
    const actionToExecute = ref(null);
    const selectedForm = ref(null);
    let formDelete = {};
    
    const url = "https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302";

    onMounted(() => {
      confirmPopup.value = instance?.proxy?.$refs.confirmPopup;
    });

    const services = ref([
      { id: 1, name: "pilot" },
      { id: 2, name: "event" }
    ]);

    const columns = ref([
      { label: t("forms.list_one"), key: 'name' },
      { label: t("forms.list_three"), key: 'service' }
    ]);

    const colorOptions = ref({
      background: { label: 'Color de fondo', value: '#ffffff', code: "bg_form" },
      inputs: { label: 'Color de inputs', value: '#f8f9fa', code: "bg_input" },
      text: { label: 'Color de texto', value: '#000000', code: "tx_form" },
      placeholder: { label: 'Color de placeholder', value: '#6c757d', code: "pl_form" },
      buttonBg: { label: 'Color de fondo del botón', value: '#007bff', code: "btn_bg_form" },
      buttonBorder: { label: 'Color de borde del botón', value: '#007bff', code: "btn_border_form" },
      buttonText: { label: 'Color de texto del botón', value: '#ffffff', code: "btn_txt_form" },
    });

    const openModalForm = (index = null) => {
      editingIndex.value = index;
      if (index !== null) {
        formData.value = JSON.parse(JSON.stringify(index));
        if (!Array.isArray(formData.value.images)) {
          formData.value.images = formData.value.images ? [formData.value.images] : [];
        }
      }
      formModal.value.openModal();
    };

    const closeModalForm = () => {
      formData.value = { 
        name: '', 
        images: [],
        fields: [], 
        header_text: "",
        header_subtext: "",
        header_descript: "",
        success: "",
        error: "",
        service: "",
        status: "draft",
        colorOptions: {
      background: { label: 'Color de fondo', value: '#ffffff', code: "bg_form" },
      inputs: { label: 'Color de inputs', value: '#f8f9fa', code: "bg_input" },
      text: { label: 'Color de texto', value: '#000000', code: "tx_form" },
      placeholder: { label: 'Color de placeholder', value: '#6c757d', code: "pl_form" },
      buttonBg: { label: 'Color de fondo del botón', value: '#007bff', code: "btn_bg_form" },
      buttonBorder: { label: 'Color de borde del botón', value: '#007bff', code: "btn_border_form" },
      buttonText: { label: 'Color de texto del botón', value: '#ffffff', code: "btn_txt_form" },
    },
        appkey_pilot: ""
      };
      formModal.value.closeModal();
    };

    const closeStyleModalForm = () => {
      styleModal.value.closeModal();
    };

    const handleCloseModal = () => {
      closeModalForm();
      closeStyleModalForm();
    };

    const addField = () => {
      if (!formData.value.fields || formData.value.fields === "") {
        formData.value.fields = [];
      }
      formData.value.fields.push({ 
        label: '', 
        name: '', 
        type: 'text', 
        hidden: false, 
        required: false, 
        options: [] 
      });
    };

    const removeField = (index) => {
      formData.value.fields.splice(index, 1);
    };

    const addOption = (fieldIndex) => {
      formData.value.fields[fieldIndex].options.push({
        text: "",
        value: "",
      });
    };

    const removeOption = (fieldIndex, optIndex) => {
      formData.value.fields[fieldIndex].options.splice(optIndex, optIndex);
    };

    const saveForm = () => {
      if (editingIndex.value === null) {
        instance.proxy.createForm(JSON.parse(JSON.stringify(formData.value)));
      } else {
        instance.proxy.updateForm(JSON.parse(JSON.stringify(formData.value)));
      }
      closeModalForm();
    };

    const deleteForm = async () => {
      isLoading.value = true;
      formDelete.action = "deleteForm";

      try {
        const response = await axios.post(url, formDelete, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });
        
        if (response.status === 200) {
          const index = forms.value.findIndex(f => f.id === formDelete.id);
          if (index !== -1) {
            forms.value.splice(index, 1);
          }
          await getForms();
          setTimeout(() => {
            triggerToast('Realizado!', 'Formulario eliminado!', true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error al eliminar el formulario:', error);
        setTimeout(() => {
          triggerToast('Error!', 'No se pudo eliminar el formulario', false);
        }, 1000);
      } finally {
        isLoading.value = false;
      }
    };

    const handleResponse = (isConfirmed) => {
      if (!isConfirmed) return;

      if (actionToExecute.value === "delete") {
        deleteForm(selectedForm.value);
      }

      actionToExecute.value = null;
      selectedForm.value = null;
    };

    const confirmDelete = (form) => {
      formDelete = form;
      actionToExecute.value = "delete";
      confirmPopup.value.showConfirmPopup();
    };

    const duplicateClick = (form) => {
      selectedForm.value = form;
      actionToExecute.value = "duplicate";
      confirmPopup.value.showConfirmPopup();
    };

    const getToken = async () => {
      token.value = sessionStorage.getItem('token');
    };

    const getForms = async () => {
      isLoading.value = true;

      try {
        const response = await axios.post(url, { action: "dataforms" }, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });

        if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
          forms.value = await Promise.all(
            response.data.map(async (form) => {
              return {
                ...form,
                fields: form.fields ? JSON.parse(form.fields) : [],
                colorOptions: form.colorOptions ? JSON.parse(form.colorOptions) : [],
                images: form.images ? JSON.parse(form.images) : []
              };
            })
          );
        }
      } catch (error) {
        console.error('Error al obtener los formularios:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const createForm = async (data) => {
      data.fields = JSON.stringify(data.fields);
      data.images = JSON.stringify(data.images);
      data.colorOptions = JSON.stringify(data.colorOptions);
      data.action = "saveform";
      delete data.id;

      isLoading.value = true;

      try {
        const postdata = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });

        if (postdata.status == 200) {
          data.id = postdata.data.id;
          data.fields = JSON.parse(data.fields);
          data.colorOptions = JSON.parse(data.colorOptions);
          
          forms.value.push(JSON.parse(JSON.stringify(data)));
          closeModalForm();
          await getForms();
          setTimeout(() => {
            triggerToast('Realizado!', 'Formulario creado!', true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error al guardar la consulta:', error);
        const errorKey = error?.response?.data?.error || 'forms.message_error';
        const translated = t(errorKey) !== errorKey ? t(errorKey) : t('forms.message_error');
        setTimeout(() => {
          triggerToast('Error', translated, false);
        }, 1000);
      } finally {
        isLoading.value = false;
      }
    };

    const updateForm = async (data) => {
      data.colorOptions = JSON.stringify(data.colorOptions);
      data.fields = JSON.stringify(data.fields);
      data.images = JSON.stringify(data.images);
      data.action = "saveform";

      isLoading.value = true;
      
      try {
        const postdata = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });
        
        if (postdata.status == 200) {
          await getForms();
          setTimeout(() => {
            triggerToast('Realizado!', 'Formulario actualizado!', true);
          }, 1000);
        }
        closeStyleModalForm();
      } catch (error) {
        console.error('Error al guardar la consulta:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const styleForm = async (index = null) => {
      editingIndex.value = index;
      formData.value = index;
      styleModal.value.openModal();
    };

    const saveStyleForm = async () => {
      const formDataToSend = {
        ...formData.value,
        colorOptions: formData.value.colorOptions
      };
      instance.proxy.updateForm(formDataToSend);
    };

    const triggerToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    };

    const resultActions = [
      {
        label: t("forms.action_edit"),
        class: 'btn btn-sm btn-outline',
        method: openModalForm,
        icon: '<i class="bi bi-pencil-square"></i>'
      },
      {
        label: t("forms.action_style"),
        class: 'btn btn-sm btn-style',
        method: styleForm,
        icon: '<i class="bi bi-palette"></i>'
      },
      {
        label: t("forms.action_delete"),
        class: 'btn btn-danger btn-sm',
        method: confirmDelete,
        icon: '<i class="bi bi-trash3"></i>'
      }
    ];

    // Inicialización
    getToken();
    getForms();

    return {
      forms,
      formData,
      editingIndex,
      openModalForm,
      closeModalForm,
      addField,
      removeField,
      addOption,
      removeOption,
      saveForm,
      deleteForm,
      getForms,
      createForm,
      columns,
      resultActions,
      isLoading,
      formModal,
      styleModal,
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
      duplicateClick,
      services,
      styleForm
    };
  },
};
</script>