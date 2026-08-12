<template>
  <div class="container-fluid mt-4 page forms">
    <div class="header-section mb-4">
      <h2>Formularios</h2>
      <button @click="openModalForm()" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> Nuevo formulario
      </button>
    </div>
    <hr class="header-divider">

    <!-- Link a documentación de Pilot -->
    <div class="card tip-link-card mb-5">
      <div class="card-body">
        <div class="tip-link-content">
          <div class="tip-icon">
            <i class="bi bi-box-arrow-up-right"></i>
          </div>
          <div class="tip-text-section">
            <strong>Integración con Pilot Solution:</strong> Para integrar correctamente los formularios de Pilot Solution, fíjate en los nombres de los campos en la siguiente documentación.
          </div>
          <a href="https://www.pilotsolution.net/es/como-integrarse#pilot-webhook" target="_blank" class="btn btn-sm btn-primary ms-auto">
            Ver documentación <i class="bi bi-box-arrow-up-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>

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
      class="modal-fullscreen-fixed" 
      @modalClosed="handleCloseModal"
    >
      <div class="forms-step-modal">
        <div class="forms-step-shell">
          <!--<div class="forms-step-topbar">
            <div>
              <h3 class="forms-step-title">{{ editingIndex === null ? 'Nuevo formulario' : 'Editar formulario' }}</h3>
              <p class="forms-step-subtitle">Separamos la configuración en pasos para que crear y editar formularios sea más claro y ordenado.</p>
            </div>
            <button type="button" class="btn btn-outline-secondary forms-step-close" @click="closeModalForm">
              <i class="bi bi-x-circle me-2"></i>{{ $t('search_view.cancel') }}
            </button>
          </div>-->

          <div class="forms-stepper">
            <button
              v-for="(step, index) in formSteps"
              :key="step.key"
              type="button"
              class="forms-step-item"
              :class="{ active: currentStep === index, done: currentStep > index }"
              @click="goToStep(index)"
            >
              <div class="forms-step-num">
                <i v-if="currentStep > index" class="bi bi-check-lg"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="forms-step-copy">
                <span>{{ step.label }}</span>
                <small>{{ step.description }}</small>
              </div>
            </button>
          </div>

          <div class="forms-step-content">
            <div v-show="currentStep === 0" class="forms-step-panel">
              <div class="card form-card forms-card mb-3">
                <div class="forms-card-head">
                  <i class="bi bi-card-heading"></i>
                  <span>Información del formulario</span>
                </div>
                <div class="card-body forms-card-body">
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

                  <div class="mb-3">
                    <label class="form-label">
                      <i class="bi bi-type-h1 me-2"></i>
                      Título:
                    </label>
                    <input
                      v-model="formData.form_header_text"
                      type="text"
                      class="form-control"
                      placeholder="Ingrese título del formulario (opcional)"
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">
                      <i class="bi bi-type-h1 me-2"></i>
                      SubTítulo:
                    </label>
                    <input
                      v-model="formData.form_header_subtext"
                      type="text"
                      class="form-control"
                      placeholder="Ingrese subtítulo del formulario (opcional)"
                    />
                  </div>

                  <div class="mb-0">
                    <label class="form-label">
                      <i class="bi bi-text-paragraph me-2"></i>
                      Descripción (opcional):
                    </label>
                    <textarea
                      v-model="formData.form_header_descript"
                      class="form-control"
                      rows="4"
                      placeholder="Ingrese descripción del formulario (opcional)"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 1" class="forms-step-panel">
              <div class="card form-card forms-card mb-3">
                <div class="forms-card-head">
                  <i class="bi bi-ui-checks"></i>
                  <span>Campos del formulario</span>
                </div>
                <div class="card-body forms-card-body">
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
                        <button type="button" class="btn btn-sm btn-danger" @click="removeField(fieldIndex)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>

                      <div class="field-body">
                        <div v-if="field.type !== 'title'" class="row g-3 mb-3">
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

                        <div v-if="field.type === 'title'" class="mb-3">
                          <label class="form-label">Texto del título:</label>
                          <input v-model="field.label" class="form-control" placeholder="Ej: Información de contacto" />
                        </div>

                        <div v-else class="row g-3 mb-3">
                          <div class="col-12 col-lg-3">
                            <label class="form-label">Etiqueta:</label>
                            <input v-model="field.label" class="form-control" placeholder="Ej: Nombre completo" />
                          </div>
                          <div class="col-12 col-lg-3">
                            <label class="form-label">Nombre del campo:</label>
                            <input v-model="field.name" class="form-control" placeholder="Ej: full_name" />
                          </div>
                          <div class="col-12 col-lg-3">
                            <label class="form-label">Valor por defecto:</label>
                            <input v-model="field.value" class="form-control" placeholder="Opcional" />
                          </div>
                          <div class="col-12 col-lg-3">
                            <label class="form-label">Ancho (%):</label>
                            <input v-model.number="field.width" type="number" min="1" max="100" class="form-control" placeholder="100" />
                          </div>
                        </div>

                        <div class="mb-3">
                          <label class="form-label">Tipo de campo:</label>
                          <select v-model="field.type" class="form-select">
                            <option value="title">Título</option>
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="email">Email</option>
                            <option value="textarea">Área de texto</option>
                            <option value="date">Fecha</option>
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
                            <button type="button" class="btn btn-sm btn-danger" @click="removeOption(fieldIndex, optIndex)">
                              <i class="bi bi-x-lg"></i>
                            </button>
                          </div>
                          <button type="button" class="btn btn-sm btn-secondary" @click="addOption(fieldIndex)">
                            <i class="bi bi-plus-circle me-1"></i>Agregar opción
                          </button>
                        </div>
                      </div>
                    </div>

                    <button type="button" class="btn btn-primary" @click="addField">
                      <i class="bi bi-plus-circle me-2"></i>Agregar Campo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 2" class="forms-step-panel">
              <div class="card form-card forms-card mb-3">
                <div class="forms-card-head">
                  <i class="bi bi-gear-fill"></i>
                  <span>Servicio</span>
                </div>
                <div class="card-body forms-card-body">
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
            </div>

            <div v-show="currentStep === 3" class="forms-step-panel">
              <div class="card form-card forms-card mb-3">
                <div class="forms-card-head">
                  <i class="bi bi-chat-left-text"></i>
                  <span>Mensajes</span>
                </div>
                <div class="card-body forms-card-body">
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

                  <div class="mb-0">
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
          </div>

          <div class="forms-step-actions">
            <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStep">
              <i class="bi bi-arrow-left me-2"></i>Anterior
            </button>
            <div v-else></div>
            <div class="forms-step-actions-right">
              <!--<button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
                Cancelar
              </button>-->
              <button v-if="currentStep < formSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
                Siguiente <i class="bi bi-arrow-right ms-2"></i>
              </button>
              <button v-else type="button" class="btn btn-primary" @click="saveForm">
                <i class="bi bi-floppy me-2"></i>{{ $t('search_view.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalComponent>

    <!-- MODAL ESTILOS -->
    <ModalComponent 
      ref="styleModal" 
      modalId="styleModal" 
      :modalTitle="'Estilos del formulario'" 
      class="modal-fullscreen-fixed"
    >
      <div class="forms-style-modal">
        <div class="forms-style-shell">
          <div class="forms-style-content">
            <div class="row g-4">
              <div class="col-12 col-xl-7">
                <div class="card forms-card mb-0">
                  <div class="forms-card-head">
                    <i class="bi bi-palette-fill"></i>
                    <span>Personalización de colores</span>
                  </div>
                  <div class="forms-card-body">
                    <div class="forms-style-grid">
                      <div v-for="(color, key) in formData.colorOptions" :key="key" class="forms-style-color-item">
                        <div class="forms-style-color-copy">
                          <label class="form-label mb-1">{{ color.label }}</label>
                          <small>{{ color.code }}</small>
                        </div>
                        <div class="color-picker-wrapper">
                          <input type="color" v-model="formData.colorOptions[key].value" class="color-input">
                          <input type="text" v-model="formData.colorOptions[key].value" class="color-value-input">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-xl-5">
                <div class="card forms-card mb-0">
                  <div class="forms-card-head">
                    <i class="bi bi-eye-fill"></i>
                    <span>Vista previa</span>
                  </div>
                  <div class="forms-card-body">
                    <div
                      class="forms-style-preview"
                      :style="{
                        background: formData.colorOptions.background.value,
                        color: formData.colorOptions.text.value
                      }"
                    >
                      <h4>Formulario de ejemplo</h4>
                      <p>Así se verá la base visual del formulario con los colores elegidos.</p>
                      <input
                        type="text"
                        class="forms-style-preview-input"
                        placeholder="Placeholder de ejemplo"
                        :style="{
                          background: formData.colorOptions.inputs.value,
                          color: formData.colorOptions.text.value
                        }"
                      />
                      <button
                        type="button"
                        class="forms-style-preview-button"
                        :style="{
                          background: formData.colorOptions.buttonBg.value,
                          borderColor: formData.colorOptions.buttonBorder.value,
                          color: formData.colorOptions.buttonText.value
                        }"
                      >
                        Botón principal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="forms-style-actions">
            <!--<button type="button" class="btn btn-outline-secondary forms-style-close" @click="closeStyleModalForm">
              <i class="bi bi-x-circle me-2"></i>{{ $t('search_view.cancel') }}
            </button>-->
            <div class="forms-style-actions-right">
              <button type="button" class="btn btn-primary" @click="saveStyleForm">
                <i class="bi bi-floppy me-2"></i>{{ $t('search_view.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalComponent>

    <!-- MODAL REORDENAR CAMPOS -->
    <ModalComponent 
      ref="orderFieldsModal" 
      modalId="orderFieldsModal" 
      :modalTitle="'Reordenar campos'" 
      class="modal-lg"
    >
      <div class="modal-body">
        <div class="alert alert-info mb-4">
          <i class="bi bi-info-circle-fill me-2"></i>
          Arrastra los campos para reordenarlos o usa los botones de flecha. Los cambios se guardan automáticamente.
        </div>

        <div v-if="formDataForOrdering.fields && formDataForOrdering.fields.length > 0" class="fields-order-list">
          <div 
            v-for="(field, index) in formDataForOrdering.fields" 
            :key="index"
            class="field-order-item"
            :draggable="true"
            @dragstart="dragStartField = index"
            @dragover.prevent="dragOverIndex = index"
            @drop="dropField(index)"
            @dragend="dragStartField = null; dragOverIndex = null"
            :class="{ 'dragging-over': dragOverIndex === index }"
          >
            <div class="field-order-header">
              <span class="drag-handle">
                <i class="bi bi-grip-vertical"></i>
              </span>
              <span class="field-order-number">
                {{ index + 1 }}
              </span>
              <span class="field-order-name">
                <strong>{{ field.label || field.name || 'Sin nombre' }}</strong>
                <small class="text-muted ms-2">({{ field.type }})</small>
              </span>
              <div class="field-order-actions">
                <button 
                  v-if="index > 0"
                  class="btn btn-sm btn-outline"
                  @click="moveFieldUp(index)"
                  title="Mover arriba"
                >
                  <i class="bi bi-arrow-up"></i>
                </button>
                <button 
                  v-if="index < formDataForOrdering.fields.length - 1"
                  class="btn btn-sm btn-outline"
                  @click="moveFieldDown(index)"
                  title="Mover abajo"
                >
                  <i class="bi bi-arrow-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Este formulario no tiene campos.
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="saveFieldsOrder">
          <i class="bi bi-floppy me-2"></i>Guardar orden
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeOrderFieldsModal">
          <i class="bi bi-x-circle me-2"></i>Cancelar
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
    const currentStep = ref(0);
    const formSteps = ref([
      { key: 'info', label: 'Información', description: 'Nombre, título, subtítulo y descripción' },
      { key: 'fields', label: 'Campos', description: 'Estructura y configuración del formulario' },
      { key: 'service', label: 'Servicio', description: 'Integración destino del formulario' },
      { key: 'messages', label: 'Mensajes', description: 'Textos de éxito y error' }
    ]);
    const formData = ref({ 
      name: '', 
      images: [],
      fields: [], 
      form_header_text: "",
      form_header_subtext: "",
      form_header_descript: "",
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
    const orderFieldsModal = ref(null);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    const toastComponent = ref(null);
    const showToastFlag = ref(false);
    const confirmPopup = ref(null);
    const actionToExecute = ref(null);
    const selectedForm = ref(null);
    const formDataForOrdering = ref({ fields: [] });
    const dragStartField = ref(null);
    const dragOverIndex = ref(null);
    let formDelete = {};
    
    const url = "https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302";

    onMounted(() => {
      confirmPopup.value = instance?.proxy?.$refs.confirmPopup;
    });

    const services = ref([
      { id: 1, name: "pilot_lead" },
      { id: 1, name: "pilot_service" },
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
      currentStep.value = 0;
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
        form_header_text: "",
        form_header_subtext: "",
        form_header_descript: "",
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
      editingIndex.value = null;
      currentStep.value = 0;
      formModal.value.closeModal();
    };

    const closeStyleModalForm = () => {
      styleModal.value.closeModal();
    };

    const handleCloseModal = () => {
      formData.value = { 
        name: '', 
        images: [],
        fields: [], 
        form_header_text: "",
        form_header_subtext: "",
        form_header_descript: "",
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
      editingIndex.value = null;
      currentStep.value = 0;
      closeStyleModalForm();
    };

    const goToStep = (index) => {
      currentStep.value = index;
    };

    const nextStep = () => {
      if (currentStep.value < formSteps.value.length - 1) {
        currentStep.value += 1;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value -= 1;
      }
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
        width: 100,
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

    const openOrderFieldsModal = (form) => {
      formDataForOrdering.value = JSON.parse(JSON.stringify(form));
      orderFieldsModal.value.openModal();
    };

    const closeOrderFieldsModal = () => {
      orderFieldsModal.value.closeModal();
      formDataForOrdering.value = { fields: [] };
    };

    const moveFieldUp = (index) => {
      if (index > 0) {
        const temp = formDataForOrdering.value.fields[index];
        formDataForOrdering.value.fields[index] = formDataForOrdering.value.fields[index - 1];
        formDataForOrdering.value.fields[index - 1] = temp;
      }
    };

    const moveFieldDown = (index) => {
      if (index < formDataForOrdering.value.fields.length - 1) {
        const temp = formDataForOrdering.value.fields[index];
        formDataForOrdering.value.fields[index] = formDataForOrdering.value.fields[index + 1];
        formDataForOrdering.value.fields[index + 1] = temp;
      }
    };

    const dropField = (dropIndex) => {
      if (dragStartField.value !== null && dragStartField.value !== dropIndex) {
        const draggedField = formDataForOrdering.value.fields[dragStartField.value];
        formDataForOrdering.value.fields.splice(dragStartField.value, 1);
        formDataForOrdering.value.fields.splice(dropIndex, 0, draggedField);
      }
    };

    const saveFieldsOrder = () => {
      instance.proxy.updateForm(JSON.parse(JSON.stringify(formDataForOrdering.value)));
      closeOrderFieldsModal();
      setTimeout(() => {
        triggerToast('Realizado!', 'Orden de campos actualizado!', true);
      }, 500);
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
        label: "Reordenar",
        class: 'btn btn-sm btn-outline',
        method: openOrderFieldsModal,
        icon: '<i class="bi bi-arrow-down-up"></i>'
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
      currentStep,
      formSteps,
      openModalForm,
      closeModalForm,
      goToStep,
      nextStep,
      prevStep,
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
      orderFieldsModal,
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
      styleForm,
      openOrderFieldsModal,
      closeOrderFieldsModal,
      moveFieldUp,
      moveFieldDown,
      dropField,
      saveFieldsOrder,
      formDataForOrdering,
      dragStartField,
      dragOverIndex
    };
  },
};
</script>

<style scoped>
.forms-step-modal {
  height: 100%;
}

.forms-step-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1.25rem;
  gap: 1rem;
}

.forms-step-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.forms-step-title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.forms-step-subtitle {
  margin: 0;
  color: #6c757d;
  max-width: 760px;
}

.forms-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.forms-step-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.95rem 1rem;
  border: 0;
  border-right: 1px solid #e9ecef;
  background: transparent;
  text-align: left;
  transition: background 0.15s ease;
}

.forms-step-item:last-child {
  border-right: 0;
}

.forms-step-item:hover:not(.active) {
  background: #f8f9fa;
}

.forms-step-item.active {
  background: #eff6ff;
}

.forms-step-item.done .forms-step-num,
.forms-step-item.active .forms-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.forms-step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #dee2e6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6c757d;
  flex-shrink: 0;
}

.forms-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.forms-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.forms-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.forms-step-item.active .forms-step-copy span,
.forms-step-item.done .forms-step-copy span {
  color: #185fa5;
}

.forms-step-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
}

.forms-step-panel {
  min-height: 100%;
}

.forms-card {
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.forms-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
  color: #212529;
}

.forms-card-head i {
  color: #185fa5;
}

.forms-card-body {
  padding: 1.25rem;
  background: #fff;
}

.forms-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
}

.forms-step-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.forms-step-close {
  white-space: nowrap;
}

.forms-style-modal {
  height: 100%;
}

.forms-style-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1.25rem;
  gap: 1rem;
}

.forms-style-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
  overflow-x: hidden;
  padding-bottom: 1rem;
}

.forms-style-grid {
  display: grid;
  gap: 1rem;
}

.forms-style-color-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e8edf3;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.forms-style-color-copy {
  min-width: 0;
}

.forms-style-color-copy small {
  color: #6c757d;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.forms-style-preview {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.5rem;
  min-height: 320px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
}

.forms-style-preview h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.forms-style-preview p {
  margin: 0;
  color: inherit;
  opacity: 0.8;
  line-height: 1.5;
}

.forms-style-preview-input {
  width: 100%;
  border: 1px solid #d9dee5;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  outline: 0;
}

.forms-style-preview-input::placeholder {
  color: v-bind('formData.colorOptions.placeholder.value');
  opacity: 1;
}

.forms-style-preview-button {
  align-self: flex-start;
  border: 1px solid;
  border-radius: 12px;
  padding: 0.8rem 1.1rem;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(24, 95, 165, 0.14);
}

.forms-style-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.forms-style-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.forms-style-close {
  white-space: nowrap;
}

.tip-link-card {
  border: 1px solid #e8f4f8;
  background: linear-gradient(135deg, #f0f9fc 0%, #ffffff 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.05);
}

.tip-link-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  color: white;
  font-size: 1.3em;
  flex-shrink: 0;
}

.tip-text-section {
  flex: 1;
  font-size: 0.95em;
  color: #333;
}

.fields-order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-order-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  transition: all 0.2s;
  cursor: move;
}

.field-order-item:hover {
  background: #fff;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.field-order-item.dragging-over {
  background: #e7f1ff;
  border-color: #007bff;
  border-width: 2px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2), inset 0 0 0 1px #007bff;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #999;
  cursor: grab;
  font-size: 1.2em;
}

.drag-handle:active {
  cursor: grabbing;
}

.field-order-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.field-order-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9em;
}

.field-order-name {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-order-actions {
  display: flex;
  gap: 8px;
}

.field-order-actions .btn {
  padding: 6px 12px;
  font-size: 0.85em;
}

@media (max-width: 991px) {
  .forms-step-shell {
    padding: 1rem;
  }

  .forms-style-shell {
    padding: 1rem;
  }

  .forms-stepper {
    flex-direction: column;
  }

  .forms-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .forms-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 768px) {
  .forms-step-topbar,
  .forms-step-actions,
  .forms-step-actions-right,
  .forms-style-actions,
  .forms-style-actions-right,
  .tip-link-content {
    flex-direction: column;
    align-items: stretch;
  }

  .forms-step-close,
  .forms-step-actions .btn,
  .forms-step-actions-right .btn,
  .forms-style-close,
  .forms-style-actions .btn,
  .forms-style-actions-right .btn,
  .tip-link-content .btn {
    width: 100%;
  }

  .forms-style-color-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
