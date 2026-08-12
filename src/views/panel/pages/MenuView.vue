<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <h2>Configuración del Menú</h2>
      <button
        type="button"
        class="btn btn-primary btn-save"
        @click="saveMenuSettings"
        :disabled="isLoading"
      >
        <i class="bi bi-floppy me-2"></i> Guardar
      </button>
    </div>
    <hr class="header-divider">

    <div class="accordion mb-5" id="accordionVisoraForm">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingVisoraForm">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseVisoraForm" 
            aria-expanded="false" 
            aria-controls="collapseVisoraForm"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Desde esta sección podés personalizar el logo, color de fondo y color de fuente del menú que aparecerá en todos tus formularios.
            </div>
          </button>
        </h2>
        <div 
          id="collapseVisoraForm" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingVisoraForm" 
          data-bs-parent="#accordionVisoraForm"
        >
          <div class="accordion-body tip-expanded">
            <p>
              <strong>Visora Form</strong> es la herramienta que te permite crear, personalizar y administrar los formularios que utilizás en tu sitio web.
              Todos los formularios comparten un <strong>menú único</strong>, que se repite en cada uno para mantener una experiencia uniforme y profesional.
            </p>

            <p>
              Desde esta sección podés configurar los elementos visuales principales del encabezado del formulario:
            </p>

            <ul>
              <li><strong>Logo:</strong> seleccioná la imagen que aparecerá en el margen superior izquierdo.</li>
              <li><strong>Color de fondo:</strong> definí el color que tendrá la barra superior del formulario.</li>
              <li><strong>Color de fuente del menú:</strong> elegí el color del texto del menú para asegurar buena visibilidad y coherencia con tu marca.</li>
            </ul>

            <p class="mb-0">
              Estas configuraciones se aplican automáticamente a todos los formularios que crees, manteniendo una estética homogénea y alineada con la identidad de tu empresa.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-stepper">
      <button
        v-for="(step, index) in menuSteps"
        :key="step.key"
        type="button"
        class="menu-step-item"
        :class="{ active: currentStep === index, done: currentStep > index }"
        @click="goToStep(index)"
      >
        <div class="menu-step-num">
          <i v-if="currentStep > index" class="bi bi-check-lg"></i>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="menu-step-copy">
          <span>{{ step.label }}</span>
          <small>{{ step.description }}</small>
        </div>
      </button>
    </div>

    <div class="menu-step-content">
      <div v-show="currentStep === 0">
        <div class="preview-section-fixed">
          <div class="preview-section">
            <h5 class="preview-title">
              <i class="bi bi-eye-fill me-2"></i>
              Vista previa
            </h5>
            <div class="menu-preview" :style="{ background: formData.background, color: formData.menuColor }">
              <div class="preview-logo">
                <img 
                  v-if="formData.image || formData.path"
                  :src="formData.image || `${baseUrl}${formData.path}`"
                  alt="Logo preview"
                  class="preview-logo-img"
                />
                <span v-else class="preview-logo-placeholder">Logo</span>
              </div>
              <div class="preview-menu-items">
                <span v-for="(item, index) in formData.extra_items" :key="index">
                  {{ item.label }}
                </span>
                <span>Acerca de</span>
                <span>Contacto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentStep === 1">
        <div class="card settings-card mb-4">
          <div class="card-body p-4">
            <div class="settings-group">
              <label class="settings-label">
                <i class="bi bi-image-fill me-2"></i>
                Logo del menú
              </label>
              <p class="settings-description">
                Cargá el logo que aparecerá en la parte superior izquierda de todos tus formularios
              </p>

              <input
                type="file"
                class="d-none"
                id="fileLogo"
                accept="image/png, image/jpeg, image/webp, image/gif"
                @change="handleImageUpload"
              />

              <label for="fileLogo" class="file-input-label">
                <i class="bi bi-cloud-upload me-2"></i>
                <span>{{ formData.fileName || 'Seleccionar imagen (jpg, png, webp, gif)' }}</span>
              </label>

              <div v-if="formData.image || formData.path" class="image-preview-container">
                <div class="image-preview">
                  <img
                    :src="formData.image || `${baseUrl}${formData.path}`"
                    alt="Logo"
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
          <div class="card-body p-4">
            <div class="row g-4">
              <div class="col-12 col-lg-6">
                <div class="settings-group">
                  <label class="settings-label">
                    <i class="bi bi-palette-fill me-2"></i>
                    Color de fondo
                  </label>
                  <p class="settings-description">
                    Definí el color de fondo de la barra del menú
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

              <div class="col-12 col-lg-6">
                <div class="settings-group">
                  <label class="settings-label">
                    <i class="bi bi-fonts me-2"></i>
                    Color de fuente del menú
                  </label>
                  <p class="settings-description">
                    Elegí el color del texto para asegurar buena visibilidad
                  </p>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="formData.menuColor"
                      class="color-input"
                    />
                    <input 
                      type="text" 
                      v-model="formData.menuColor" 
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

      <div v-show="currentStep === 3">
        <div class="card settings-card">
          <div class="card-body p-4">
            <div class="settings-group">
              <label class="settings-label">
                <i class="bi bi-link-45deg me-2"></i>
                Items del Menú Personalizados
              </label>
              <p class="settings-description">
                Agregá hasta 2 items personalizados al menú (máximo 5)
              </p>

              <div class="custom-items-container">
                <div 
                  v-for="(item, index) in formData.extra_items" 
                  :key="index"
                  class="custom-item-card mb-3"
                >
                  <div class="custom-item-header">
                    <h6 class="mb-0">Item {{ index + 1 }}</h6>
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      @click="removeCustomItem(index)"
                    >
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>

                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Label</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="item.label"
                        placeholder="Ej: Mi Sitio Web"
                        maxlength="50"
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label">URL</label>
                      <input
                        type="url"
                        class="form-control"
                        v-model="item.link"
                        placeholder="Ej: https://miwebsite.com"
                      />
                    </div>

                    <div class="col-12">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input ml-1"
                          :id="`blank-${index}`"
                          v-model="item.blank"
                        />
                        <label class="form-check-label" :for="`blank-${index}`">
                          Abrir en nueva pestaña
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  v-if="formData.extra_items.length < 5"
                  type="button"
                  class="btn btn-outline"
                  @click="addCustomItem"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                  Agregar Item
                </button>
                <p v-else class="text-muted mt-2">
                  <i class="bi bi-info-circle me-1"></i>
                  Límite máximo de 2 items alcanzado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-step-actions">
      <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStep">
        <i class="bi bi-arrow-left me-2"></i>Anterior
      </button>
      <div v-else></div>
      <button v-if="currentStep < menuSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
        Siguiente <i class="bi bi-arrow-right ms-2"></i>
      </button>
      <button v-else type="button" class="btn btn-primary" @click="saveMenuSettings" :disabled="isLoading">
        <i class="bi bi-floppy me-2"></i>Guardar
      </button>
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
import { ref, onMounted } from "vue";
import axios from "axios";
import ToastComponent from "@/components/ToastComponent.vue";

export default {
  components: { ToastComponent },
  setup() {
    const baseUrl = "https://madcoder.io/apis/images_upload/";
    const urlAPI = "https://apis.madautomate.cloud/webhook/a33863b9-0a93-42d8-9a37-1484e72e9be3";

    const token = ref(null);
    const isLoading = ref(false);
    const showToastFlag = ref(false);
    const toastTitle = ref("");
    const toastMessage = ref("");
    const toastComponent = ref(null);
    const isSuccess = ref(true);
    const currentStep = ref(0);
    const menuSteps = ref([
      { key: 'preview', label: 'Vista previa', description: 'Cómo se verá el menú final' },
      { key: 'logo', label: 'Logo', description: 'Imagen principal del menú' },
      { key: 'colors', label: 'Colores', description: 'Fondo y color del texto' },
      { key: 'items', label: 'Items', description: 'Links personalizados del menú' }
    ]);

    const formData = ref({
      image: "",
      fileName: "",
      path: "",
      background: "#ffffff",
      menuColor: "#000000",
      extra_items: [],
    });

    const getToken = () => {
      token.value = sessionStorage.getItem("token");
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        formData.value.image = reader.result;
        formData.value.fileName = file.name;
        formData.value.path = "";
      };
      reader.readAsDataURL(file);
    };

    const removeImage = () => {
      formData.value.imageDelete = formData.value.fileName;
      formData.value.image = "";
      formData.value.fileName = "";
      formData.value.path = "";
    };

    const addCustomItem = () => {
      if (formData.value.extra_items.length < 5) {
        formData.value.extra_items.push({
          label: "",
          link: "",
          blank: false,
        });
      }
    };

    const removeCustomItem = (index) => {
      formData.value.extra_items.splice(index, 1);
    };

    const saveMenuSettings = async () => {
      isLoading.value = true;

      const payload = {
        action: "savemenusettings",
        image: formData.value.image,
        fileName: formData.value.fileName,
        path: formData.value.path,
        background: formData.value.background || "#ffffff",
        menuColor: formData.value.menuColor || "#000000",
        imageDelete: formData.value.imageDelete,
        extra_items: JSON.stringify(formData.value.extra_items),
      };

      try {
        await axios.post(urlAPI, payload, {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        triggerToast("✅ Éxito", "Configuración guardada correctamente", true);
      } catch (error) {
        console.error(error);
        triggerToast("❌ Error", "No se pudo guardar la configuración", false);
      } finally {
        isLoading.value = false;
      }
    };

    const getMenuSettings = async () => {
      isLoading.value = true;
      try {
        const { data } = await axios.post(
          urlAPI,
          { action: "getmenusettings" },
          { headers: { Authorization: `Bearer ${token.value}` } }
        );

        if (data && typeof data === "object") {
          if (typeof data.extra_items === 'string' && data.extra_items.trim()) {
            try {
              data.extra_items = JSON.parse(data.extra_items);
            } catch (e) {
              console.error("Error parsing extra_items:", e);
              data.extra_items = [];
            }
          } else if (!data.extra_items) {
            data.extra_items = [];
          }
          formData.value = {
            ...formData.value,
            ...Object.fromEntries(
              Object.entries(data).map(([key, val]) => [key, val ?? formData.value[key]])
            ),
          };
        }
      } catch (err) {
        console.error("Error al obtener configuración", err);
        triggerToast("Error", "No se pudo cargar la configuración", false);
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
      if (currentStep.value < menuSteps.value.length - 1) {
        currentStep.value += 1;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value -= 1;
      }
    };

    onMounted(() => {
      getToken();
      getMenuSettings();
    });

    return {
      formData,
      baseUrl,
      currentStep,
      menuSteps,
      handleImageUpload,
      removeImage,
      addCustomItem,
      removeCustomItem,
      saveMenuSettings,
      goToStep,
      nextStep,
      prevStep,
      isLoading,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      toastComponent,
    };
  },
};
</script>

<style scoped>
.menu-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.menu-step-item {
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

.menu-step-item:last-child { border-right: 0; }
.menu-step-item:hover:not(.active) { background: #f8f9fa; }
.menu-step-item.active { background: #eff6ff; }
.menu-step-item.done .menu-step-num,
.menu-step-item.active .menu-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.menu-step-num {
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

.menu-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.menu-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.menu-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.menu-step-item.active .menu-step-copy span,
.menu-step-item.done .menu-step-copy span {
  color: #185fa5;
}

.menu-step-content {
  min-height: 420px;
}

.menu-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
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

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  transition: box-shadow 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Settings Group */
.settings-group {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
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

/* Preview Section */
.preview-section-fixed {
  width: 100%;
  margin-bottom: 2rem;
}

.preview-section {
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 2px solid #e5e7eb;
}

.preview-title {
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.menu-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-logo {
  display: flex;
  align-items: center;
}

.preview-logo-img {
  max-height: 50px;
  max-width: 150px;
  object-fit: contain;
}

.preview-logo-placeholder {
  font-weight: 700;
  font-size: 1.25rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.preview-menu-items {
  display: flex;
  gap: 2rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.preview-menu-items span {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

/* Custom Items */
.custom-items-container {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.custom-item-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.custom-item-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.custom-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.custom-item-header h6 {
  color: #1f2937;
  font-weight: 700;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.form-check {
  padding-left: 0;
  margin-top: 0.5rem;
}

.form-check-input {
  margin-right: 0.5rem;
  cursor: pointer;
  border-color: #d1d5db;
  accent-color: #3939ff;
}

.form-check-label {
  cursor: pointer;
  color: #374151;
  font-weight: 500;
}

.btn-outline-primary {
  color: #3939ff;
  border-color: #3939ff;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  background: #3939ff;
  border-color: #3939ff;
  color: white;
}

.custom-preview-item {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
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

  .menu-preview {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .preview-menu-items {
    flex-direction: column;
    gap: 0.75rem;
  }

  .menu-stepper {
    flex-direction: column;
  }

  .menu-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .menu-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 768px) {
  .menu-step-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .menu-step-actions .btn {
    width: 100%;
  }
}
</style>
