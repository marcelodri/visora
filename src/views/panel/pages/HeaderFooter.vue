<template>
    <div class="container-fluid mt-4 page">
        <div class="header-section mb-4">
          <h2>Footer</h2>
          <button type="button" class="btn btn-primary btn-save" @click="saveFormFooter">
            <i class="bi bi-floppy me-2"></i> {{$t('search_view.save')}}
          </button>
        </div>
        <hr class="header-divider">

        <div class="accordion mb-5" id="accordionFooter">
            <div class="accordion-item tip-banner-style">
                <h2 class="accordion-header" id="headingFooter">
                <button 
                    class="accordion-button collapsed tip-banner-button" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapseFooter" 
                    aria-expanded="false" 
                    aria-controls="collapseFooter"
                >
                    <div class="tip-icon">
                    <i class="bi bi-lightbulb-fill"></i>
                    </div>
                    <div class="tip-text">
                    <strong>Tip:</strong> El Footer es común a todos los formularios y tiene tres columnas: imagen, texto HTML central y contenido de contacto.
                    </div>
                </button>
                </h2>
                <div 
                id="collapseFooter" 
                class="accordion-collapse collapse" 
                aria-labelledby="headingFooter" 
                data-bs-parent="#accordionFooter"
                >
                <div class="accordion-body tip-expanded">
                    <p>
                    El <strong>footer de Visora Form</strong> es un sector común que se muestra en todos los formularios, permitiendo mantener una identidad visual coherente en toda la plataforma.
                    Está compuesto por <strong>tres columnas</strong>, cada una con funciones específicas:
                    </p>

                    <ul>
                    <li>
                        <strong>Columna izquierda:</strong> permite cargar únicamente una imagen (por ejemplo, un sello institucional, un logo secundario o una marca de soporte).
                    </li>

                    <li>
                        <strong>Columna central:</strong> permite cargar texto o contenido en formato HTML, brindando flexibilidad para agregar información, enlaces o aclaraciones.
                    </li>

                    <li>
                        <strong>Columna derecha:</strong> admite texto o etiquetas HTML. Es ideal para datos de contacto o información útil, por ejemplo:<br>
                        Soporte <a href="mailto:team@madcoder.io">team@madcoder.io</a>
                    </li>
                    </ul>

                    <p class="mb-0">
                    Todo el contenido configurado en este footer se aplicará <strong>de manera uniforme</strong> a todos los formularios, asegurando una comunicación clara y una estética consistente en toda la plataforma.
                    </p>
                </div>
                </div>
            </div>
        </div>

        <div class="hf-stepper">
          <button
            v-for="(step, index) in footerSteps"
            :key="step.key"
            type="button"
            class="hf-step-item"
            :class="{ active: currentStep === index, done: currentStep > index }"
            @click="goToStep(index)"
          >
            <div class="hf-step-num">
              <i v-if="currentStep > index" class="bi bi-check-lg"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="hf-step-copy">
              <span>{{ step.label }}</span>
              <small>{{ step.description }}</small>
            </div>
          </button>
        </div>

        <div class="hf-step-content">
          <div v-show="currentStep === 0">
            <div class="footer-preview-section">
                <div class="preview-section-header">
                  <i class="bi bi-eye-fill me-2"></i>
                  Vista previa del footer
                </div>
                <div class="footer-preview" :style="{ background: formData.background, color: formData.color }">
                    <div class="footer-preview-col">
                      <img 
                        v-if="formData.image || formData.path"
                        :src="formData.image || `https://madcoder.io/apis/images_upload/${formData.path}`"
                        alt="Logo"
                        class="footer-preview-logo"
                      />
                      <div v-else class="footer-placeholder">Logo</div>
                    </div>
                    <div class="footer-preview-col">
                      <div v-if="formData.footer_left" v-html="sanitizeHtml(formData.footer_left)"></div>
                      <p v-else class="text-muted">Contenido central vacío</p>
                    </div>
                    <div class="footer-preview-col footer-right">
                      <div v-if="formData.footer_right" v-html="sanitizeHtml(formData.footer_right)"></div>
                      <p v-else class="text-muted">Contenido derecho vacío</p>
                    </div>
                </div>
            </div>
          </div>

          <div v-show="currentStep === 1">
            <div class="card settings-card mb-4">
                <div class="card-header-custom">
                  <i class="bi bi-image-fill me-2"></i>
                  Columna Izquierda - Logo del Footer
                </div>
                <div class="card-body p-4">
                    <div class="settings-group">
                        <label class="settings-label">
                          <i class="bi bi-card-image me-2"></i>
                          Logo del footer
                        </label>
                        <p class="settings-description">
                          Cargá una imagen como logo secundario, sello institucional o marca de soporte
                        </p>

                        <input 
                          type="file" 
                          class="d-none" 
                          id="fileInput" 
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          @change="handleImageUpload" 
                        />

                        <label for="fileInput" class="file-input-label">
                          <i class="bi bi-cloud-upload me-2"></i>
                          <span>{{ formData.fileName || 'Archivo permitidos: jpg, jpeg, png, gif, webp' }}</span>
                        </label>

                        <div v-if="formData.image || formData.path" class="image-preview-container">
                          <div class="image-preview">
                              <img 
                                  :src="formData.image || `https://madcoder.io/apis/images_upload/${formData.path}`" 
                                  alt="Logo Footer" 
                                  class="preview-image"
                              />
                              <button
                                  class="btn-remove-image"
                                  @click="removeImage"
                                  title="Eliminar imagen"
                                  type="button"
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
            </div>
          </div>

          <div v-show="currentStep === 2">
            <div class="card settings-card mb-4">
                <div class="card-header-custom">
                  <i class="bi bi-text-left me-2"></i>
                  Columna Central - Contenido HTML
                </div>
                <div class="card-body p-4">
                    <div class="settings-group">
                        <label class="settings-label">
                          <i class="bi bi-code-square me-2"></i>
                          Contenido central
                        </label>
                        <p class="settings-description">
                          Agregá texto, enlaces o información con formato HTML
                        </p>
                        <div class="editor-wrapper">
                          <QuillEditor
                            v-model:content="formData.footer_left"
                            contentType="html"
                            theme="snow"
                            :options="editorOptions"
                          /> 
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div v-show="currentStep === 3">
            <div class="card settings-card mb-4">
                <div class="card-header-custom">
                  <i class="bi bi-envelope-fill me-2"></i>
                  Columna Derecha - Datos de Contacto
                </div>
                <div class="card-body p-4">
                    <div class="settings-group">
                        <label class="settings-label">
                          <i class="bi bi-info-circle-fill me-2"></i>
                          Información de contacto
                        </label>
                        <p class="settings-description">
                          Ideal para emails, teléfonos, direcciones o enlaces útiles
                        </p>
                        <div class="editor-wrapper">
                          <QuillEditor
                            v-model:content="formData.footer_right"
                            contentType="html"
                            theme="snow"
                            :options="editorOptions"
                          />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div v-show="currentStep === 4">
            <div class="card settings-card mb-5">
                <div class="card-header-custom">
                  <i class="bi bi-palette-fill me-2"></i>
                  Estilos del Footer
                </div>
                <div class="card-body p-4">
                    <div class="row g-4">
                        <div class="col-12 col-md-6">
                            <div class="settings-group">
                                <label class="settings-label">
                                  <i class="bi bi-paint-bucket me-2"></i>
                                  Color de fondo
                                </label>
                                <p class="settings-description">
                                  Definí el color de fondo del footer
                                </p>
                                <div class="color-picker-wrapper">
                                  <input
                                    type="color"
                                    v-model="formData.background"
                                    class="color-input"
                                  />
                                  <input 
                                    type="text" 
                                    v-model="formData.background" 
                                    class="color-value-input"
                                    placeholder="#ffffff"
                                  />
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="settings-group">
                                <label class="settings-label">
                                  <i class="bi bi-fonts me-2"></i>
                                  Color de fuente
                                </label>
                                <p class="settings-description">
                                  Elegí el color del texto del footer
                                </p>
                                <div class="color-picker-wrapper">
                                  <input
                                    type="color"
                                    v-model="formData.color"
                                    class="color-input"
                                  />
                                  <input 
                                    type="text" 
                                    v-model="formData.color" 
                                    class="color-value-input"
                                    placeholder="#000000"
                                  />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div class="hf-step-actions">
          <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStep">
            <i class="bi bi-arrow-left me-2"></i>Anterior
          </button>
          <div v-else></div>
          <button v-if="currentStep < footerSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
            Siguiente <i class="bi bi-arrow-right ms-2"></i>
          </button>
          <button v-else type="button" class="btn btn-primary" @click="saveFormFooter">
            <i class="bi bi-floppy me-2"></i>{{$t('search_view.save')}}
          </button>
        </div>

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
        const formData = ref(getEmptyForm());
        const editingIndex = ref(null);
        const currentStep = ref(0);
        const footerSteps = ref([
            { key: 'preview', label: 'Vista previa', description: 'Cómo se verá el footer final' },
            { key: 'logo', label: 'Logo', description: 'Imagen de la columna izquierda' },
            { key: 'center', label: 'Contenido central', description: 'Texto o HTML de la columna media' },
            { key: 'right', label: 'Contacto', description: 'Contenido HTML de la columna derecha' },
            { key: 'style', label: 'Estilos', description: 'Colores de fondo y fuente' }
        ]);
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
        const urlGetDataFooter = 'https://apis.madautomate.cloud/webhook/0c997ce5-4832-4485-982b-83cd43bb7a88';

        const columns = [
          { label: 'Texto', key: 'text' },
          { label: 'Imagen', key: 'imageOrPath'}
        ];
        
        const editorOptions = {
            modules: {
                toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                ['image', 'link'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean'],
                ],
            },
        }

        const sanitizeHtml = (html) => {
            if (!html || typeof html !== 'string') return '';
            
            // Decodificar HTML escapado
            const textarea = document.createElement('textarea');
            textarea.innerHTML = html;
            let decoded = textarea.value;
            
            // Si todavía contiene caracteres escapados, decodificar de nuevo
            while (decoded !== decoded.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")) {
                decoded = decoded.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
            }
            
            return decoded;
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

        function getEmptyForm() {
            return {
                image: '',
                fileName: '',
                path: '',
                text: '',
                footer_left: '',
                footer_right: '',
                background: '#ffffff',
                color: '#000000'
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
            try {
                const response = await axios.post(urlDelete,formDelete, {
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

        const goToStep = (index) => {
            currentStep.value = index;
        };

        const nextStep = () => {
            if (currentStep.value < footerSteps.value.length - 1) {
                currentStep.value += 1;
            }
        };

        const prevStep = () => {
            if (currentStep.value > 0) {
                currentStep.value -= 1;
            }
        };
        
        const saveFormFooter = async () => {
            isLoading.value = true;
            formData.value.action = "savefooter";

            console.log('formData.value', formData.value)
            try {
                const response = await axios.post(urlGetDataFooter,formData.value, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });
                triggerToast('ok!', 'Datos guardados correctamente!', true);
            } catch (err) {
                console.error(err);
                triggerToast('Error!', 'No se pudo guardar el footer.', false);
            } finally {
                isLoading.value = false;
            }
        };

        const getDataAbout = async () => {
            isLoading.value = true;
            try {
                const response = await axios.post(urlGetDataFooter, {action: "datafooter"}, {
                    headers: {
                        Authorization: `Bearer ${token.value}`,
                    },
                });
                formData.value = response.data;
            } catch (err) {
                console.error('Error al obtener footer', err);
                triggerToast('Error!', 'No se pudo cargar el footer.', false);
            } finally {
                isLoading.value = false;
            }
        }


        getToken();
        getDataAbout();

        return {
            t,
            forms,
            columns,
            formData,
            editingIndex,
            currentStep,
            footerSteps,
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
            saveFormFooter,
            goToStep,
            nextStep,
            prevStep,
            editorOptions,
            sanitizeHtml
        };
      }
    };
</script>
   
<style scoped>
.hf-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.hf-step-item {
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

.hf-step-item:last-child { border-right: 0; }
.hf-step-item:hover:not(.active) { background: #f8f9fa; }
.hf-step-item.active { background: #eff6ff; }
.hf-step-item.done .hf-step-num,
.hf-step-item.active .hf-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.hf-step-num {
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

.hf-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hf-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.hf-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.hf-step-item.active .hf-step-copy span,
.hf-step-item.done .hf-step-copy span {
  color: #185fa5;
}

.hf-step-content {
  min-height: 420px;
}

.hf-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

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

.btn-save {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Settings Card */
.settings-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
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

/* Settings Group */
.settings-group {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.settings-group:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.settings-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.settings-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
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
  max-height: 150px;
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
  font-size: 0.9rem;
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

/* Editor Wrapper */
.editor-wrapper {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-wrapper :deep(.ql-container) {
  min-height: 300px;
  font-size: 0.95rem;
}

/* Footer Preview */
.footer-preview-section {
  width: 100%;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 2px solid #e5e7eb;
}

.preview-section-header {
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.footer-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 2rem;
  border-radius: 8px;
  min-height: 200px;
  padding-top: 80px;
}

.footer-preview-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  font-size: 0.9rem;
}

.footer-preview-logo {
  max-height: 80px;
  max-width: 150px;
  object-fit: contain;
}

.footer-placeholder {
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 992px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-save {
    width: 100%;
    justify-content: center;
  }

  .footer-preview {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .hf-stepper {
    flex-direction: column;
  }

  .hf-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .hf-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 768px) {
  .hf-step-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hf-step-actions .btn {
    width: 100%;
  }
}
</style>
