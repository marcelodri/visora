
<template>
  <div class="container-fluid mt-4 page">
    <h2>Templates</h2>
    <hr><br>

    <div class="accordion mb-5" id="accordionPlantillas">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingPlantillas">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapsePlantillas" 
            aria-expanded="false" 
            aria-controls="collapsePlantillas"
          >
            <div class="tip-icon">
              <i class="bi bi-layout-text-window-reverse"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Explorá las plantillas disponibles y usá el ícono del ojo para ver una simulación en vivo de cómo quedará tu landing page.
            </div>
          </button>
        </h2>
        <div 
          id="collapsePlantillas" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingPlantillas" 
          data-bs-parent="#accordionPlantillas"
        >
          <div class="accordion-body tip-expanded">
            <p>
              En esta sección podés explorar todas las <strong>plantillas disponibles</strong> para tus formularios. Cada plantilla está representada con una ilustración que muestra su estructura general y disposición visual.
            </p>
            <p>
              Al hacer clic en el <strong>ícono del ojo</strong> en cualquiera de las plantillas, vas a ver una <strong>simulación en vivo</strong> del lado derecho de la pantalla. Esta vista previa te permite entender exactamente cómo se organizarán los diferentes componentes dentro de la landing page.
            </p>
            <p>
              La simulación muestra cómo quedarán distribuidas las partes principales:
            </p>
            <ul>
              <li><strong>Menú</strong></li>
              <li><strong>Header</strong> (encabezado)</li>
              <li><strong>Formulario</strong></li>
              <li><strong>Sección 1</strong></li>
              <li><strong>Sección 2</strong></li>
              <li><strong>Footer</strong></li>
            </ul>
            <p class="mb-0">
              Utilizá esta vista previa para elegir la plantilla que mejor se adapte a la experiencia visual y funcional que querés ofrecer en tu landing page.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid">
      <div class="row">

        <div class="card col-12 col-xl-7">
          <div class="p-4">
            <div class="preview-header mb-4">
              <label>Preview: <b>{{ formData.code }}</b></label>
              <button 
                @click="replayAnimation" 
                class="btn btn-sm btn-outline-primary"
                v-if="showPreview"
              >
                <i class="bi bi-arrow-clockwise"></i> Replay
              </button>
            </div>

            <div v-if="showPreview" class="preview-container">
              <div class="landing-preview" :key="animationKey">

                <template v-for="(section, index) in getCurrentTemplateStructure()" :key="section">

                  <div 
                    v-if="section === 'menu'" 
                    class="section menu-section" 
                    :class="{ 'animate-in': animationStep >= getAnimationIndex('menu') }"
                  >
                    <div class="section-label">MENÚ</div>
                    <div class="section-content">
                      <div class="menu-item"></div>
                      <div class="menu-item"></div>
                      <div class="menu-item"></div>
                    </div>
                  </div>

                  <div 
                    v-else-if="section === 'header'"
                    class="section header-section" 
                    :class="[
                      { 'animate-in': animationStep >= getAnimationIndex('header') },
                      getHeaderClass()
                    ]"
                  >
                    <div class="section-label">HEADER</div>
                    <div class="header-content">
                      <template v-if="isClassicHeader()">
                        <div class="header-full">
                          <div class="header-image-full"></div>
                          <div class="header-text-center">
                            <div class="text-line"></div>
                            <div class="text-line short"></div>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <div class="header-split">
                          <div class="header-text">
                            <div class="text-line"></div>
                            <div class="text-line"></div>
                            <div class="text-line short"></div>
                          </div>
                          <div class="header-image"></div>
                        </div>
                      </template>
                    </div>
                  </div>

                  <div 
                    v-else-if="section === 'form'"
                    class="section form-section" 
                    :class="{ 'animate-in': animationStep >= getAnimationIndex('form') }"
                  >
                    <div class="section-label">FORMULARIO</div>
                    <div class="section-content">
                      <div class="form-field"></div>
                      <div class="form-field"></div>
                      <div class="form-field short"></div>
                      <div class="form-button"></div>
                    </div>
                  </div>

                  <div 
                    v-else-if="section === 'section1'"
                    class="section products-section" 
                    :class="{ 'animate-in': animationStep >= getAnimationIndex('section1') }"
                  >
                    <div class="section-label">SECCIÓN 1 - PRODUCTS</div>
                    <div class="section-content cards-grid">
                      <div class="card-item" v-for="n in 3" :key="'card1-' + n">
                        <div class="card-image"></div>
                        <div class="card-text"></div>
                      </div>
                    </div>
                  </div>

                  <div 
                    v-else-if="section === 'section2'"
                    class="section aboutus-section" 
                    :class="{ 'animate-in': animationStep >= getAnimationIndex('section2') }"
                  >
                    <div class="section-label">SECCIÓN 2 - ABOUT US</div>
                    <div class="section-content cards-grid">
                      <div class="card-item" v-for="n in 3" :key="'card2-' + n">
                        <div class="card-image"></div>
                        <div class="card-text"></div>
                      </div>
                    </div>
                  </div>

                  <div 
                    v-else-if="section === 'footer'"
                    class="section footer-section" 
                    :class="{ 'animate-in': animationStep >= getAnimationIndex('footer') }"
                  >
                    <div class="section-label">FOOTER</div>
                    <div class="section-content footer-grid">
                      <div class="footer-col"></div>
                      <div class="footer-col"></div>
                      <div class="footer-col"></div>
                    </div>
                  </div>

                </template>
                </div>
            </div>
          </div>
        </div>
        
        <div class="card col-12 col-xl-4 offset-xl-1">
          <div class="card-body p-4">
            <DataTableComponent
              :data="forms"
              :columns="columns"
              :actions="resultActions"
              :items-per-page="10"
            />
          </div>
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
import { ref, onMounted, computed } from 'vue'; // Importamos 'computed'
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';

export default {
  components: { DataTableComponent, ToastComponent},
  setup() {
    const forms = ref([]);
    const formData = ref({ name: "", code: "", data: "" });
    // ⭐ NUEVA VARIABLE PARA EL ESTADO ACTIVO ⭐
    const activeTemplateCode = ref(null); 
    const isLoading = ref(false);
    const showToastFlag = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const toastComponent = ref(null);
    const isSuccess = ref(true);
    const token = ref(null);
    const showPreview = ref(false);
    const animationStep = ref(0);
    const animationKey = ref(0);

    const urlGetData = 'https://apis.madautomate.cloud/webhook/34d8c928-6746-40c4-88e9-f3c8e4f03bea';

    const columns = [{ label: 'Nombre', key: 'name'}];

    // ⭐ COMPUTED PROPERTY PARA LAS ACCIONES DE LA TABLA ⭐
    // Esto permite que el botón tenga una clase dinámica basada en el estado.
    const resultActions = computed(() => [
      { 
        label: 'Ver', 
        // Usamos una función para determinar las clases del botón
        class: (item) => ({
          'btn': true,
          'btn-sm': true,
          'btn-outline-primary': activeTemplateCode.value !== item.code, // outline si NO es el activo
          'btn-primary': activeTemplateCode.value === item.code,          // primary si ES el activo (esto hace de 'active')
          // 'active' puede ser opcional si el estilo btn-primary ya es suficiente
          'active': activeTemplateCode.value === item.code, 
        }),
        method: viewPreview, 
        icon: '<i class="bi bi-eye"></i>' 
      },
    ]);

    // ⭐ CONFIGURACIÓN CENTRALIZADA DE LAS ESTRUCTURAS DE PLANTILLAS (SIN CAMBIOS) ⭐
    const templateStructures = {
      'default': ['menu', 'header', 'form', 'section1', 'section2', 'footer'],
      'template-b': ['menu', 'header', 'form', 'section2', 'section1', 'footer'],
      'classic': ['menu', 'header', 'section1', 'section2', 'form', 'footer'],
      'landing-pro': ['menu', 'header', 'form', 'section1', 'section2', 'footer'],
    };

    function getCurrentTemplateStructure() {
      const code = formData.value.code?.toLowerCase() || 'default';
      for (const key in templateStructures) {
        if (code.includes(key.toLowerCase())) {
          return templateStructures[key];
        }
      }
      return templateStructures['default'];
    }

    function getAnimationIndex(sectionName) {
      return getCurrentTemplateStructure().indexOf(sectionName) + 1;
    }

    const getToken = async () => {
      token.value = sessionStorage.getItem('token');
    };

    const fetchForms = async () => {
      isLoading.value = true;
      try {
        const response = await axios.get(urlGetData, {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        forms.value = response.data;
        if (forms.value.length > 0) {
          viewPreview(forms.value[0]);
        }
      } catch (err) {
        triggerToast('Error!', 'No se pudieron cargar los templates.', false);
      } finally {
        isLoading.value = false;
      }
    };

    function startAnimation() {
      animationStep.value = 0;
      const structureLength = getCurrentTemplateStructure().length; 
      const delays = Array.from({ length: structureLength }, (_, i) => 100 + i * 200);
      
      delays.forEach((delay, index) => {
        setTimeout(() => {
          animationStep.value = index + 1;
        }, delay);
      });
    }

    // ⭐ FUNCIÓN viewPreview MODIFICADA ⭐
    function viewPreview(item) {
      formData.value = item;
      activeTemplateCode.value = item.code; // <-- ¡Aquí guardamos el código activo!
      showPreview.value = true;
      startAnimation();
    }

    function replayAnimation() {
      animationKey.value++; 
      startAnimation();
    }

    function isClassicHeader() {
      return formData.value.code?.toLowerCase().includes('classic');
    }

    function getHeaderClass() {
      return isClassicHeader() ? 'header-classic' : 'header-split-layout';
    }

    const triggerToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      if (toastComponent.value) {
        toastComponent.value.showToas();
      }
    };

    getToken();
    onMounted(fetchForms);

    return {
      forms,
      columns,
      resultActions, // Usamos la propiedad computada
      formData,
      isLoading,
      showPreview,
      animationStep,
      animationKey,
      showToastFlag,
      toastTitle,
      toastMessage,
      isSuccess,
      toastComponent,
      viewPreview,
      replayAnimation,
      isClassicHeader,
      getHeaderClass,
      getCurrentTemplateStructure,
      getAnimationIndex,
      activeTemplateCode // Exportamos la variable activa
    };
  }
};
</script>


<style scoped>
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-container {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 20px;
  min-height: 600px;
  overflow: auto;
}

/* ⭐ Importante: flex-direction: column y gap manejan el orden basado en la iteración ⭐ */
.landing-preview {
  display: flex;
  flex-direction: column;
  gap: 16px; 
  overflow-y: hidden;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.section.animate-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.section-label {
  font-weight: 700;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-content {
  min-height: 60px;
}

/* MENÚ */
.menu-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-left: 6px solid #5a67d8;
}

.menu-section .section-label {
  color: white;
}

.menu-section .section-content {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

.menu-item {
  height: 30px;
  width: 80px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.menu-item:nth-child(2) { animation-delay: 0.2s; }
.menu-item:nth-child(3) { animation-delay: 0.4s; }

/* HEADER */
.header-section {
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  border-left: 6px solid #00acc1;
  min-height: 180px;
}

.header-section .section-label {
  color: #00695c;
}

/* Header Clásico (100% ancho) */
.header-full {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.header-image-full {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%);
  border-radius: 8px;
  animation: shimmer 2s ease-in-out infinite;
}

.header-text-center {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 70%;
}

/* Header Split (texto izq, imagen der) */
.header-split {
  display: flex;
  gap: 16px;
  align-items: center;
}

.header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-image {
  flex: 1;
  height: 120px;
  background: linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%);
  border-radius: 8px;
  animation: shimmer 2s ease-in-out infinite;
}

.text-line {
  height: 16px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  width: 100%;
}

.text-line.short {
  width: 60%;
}

/* FORMULARIO */
.form-section {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
  border-left: 6px solid #fdd835;
}

.form-section .section-label {
  color: #f57f17;
}

.form-field {
  height: 40px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  margin-bottom: 10px;
  animation: fadeIn 0.5s ease-in-out;
}

.form-field.short {
  width: 50%;
}

.form-button {
  height: 45px;
  background: #fbc02d;
  border-radius: 6px;
  width: 150px;
  margin-top: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* PRODUCTS */
.products-section {
  background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
  border-left: 6px solid #7cb342;
}

.products-section .section-label {
  color: #558b2f;
}

/* ABOUT US */
.aboutus-section {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-left: 6px solid #8e24aa;
}

.aboutus-section .section-label {
  color: #6a1b9a;
}

/* CARDS GRID */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.card-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: cardPop 0.4s ease-out;
}

.card-item:nth-child(2) { animation-delay: 0.1s; }
.card-item:nth-child(3) { animation-delay: 0.2s; }

.card-image {
  height: 80px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.card-text {
  height: 12px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  width: 80%;
}

/* FOOTER */
.footer-section {
  background: linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%);
  border-left: 6px solid #9e9e9e;
}

.footer-section .section-label {
  color: #424242;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.footer-col {
  height: 60px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 6px;
}

/* ANIMACIONES */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes cardPop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* RESPONSIVE */
@media(max-width: 769px){
  .ml-10 {
    margin-left: 0!important;
    margin-top: 40px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .header-split {
    flex-direction: column;
  }
}
</style>