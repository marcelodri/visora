<template>
  <div class="settings-container p-6 max-w-5xl mx-auto mb-5">
    <div class="header-section mb-6">
      <h2 class="main-title">Bienvenido a <span class="brand">Visora Forms</span></h2>
      <p class="subtitle">Creá formularios personalizados y asocialos a tus páginas</p>
    </div>

    <!-- Card de Configuración -->
    <div class="card info-card mb-5">
      <div class="card-header">
          <i class="bi bi-gear-fill me-2"></i>
          <span>Información de tu instancia</span>
      </div>
      <div class="card-body p-4">
          <div class="container">
          <div class="row g-4">
              <div class="col-12 col-md-3">
              <div class="form-group">
                  <label class="field-label">
                  <i class="bi bi-building me-1"></i>
                  Instancia
                  </label>
                  <input
                  type="text"
                  v-model="settings.instance_name"
                  readonly
                  class="form-control readonly-input"
                  />
              </div>
              </div>

              <div class="col-12 col-md-3">
              <div v-if="limitEventDetail" class="form-group">
                  <label class="field-label">
                  <i class="bi bi-info-circle me-1"></i>
                  Cantidad de forms permitidos
                  </label>

                  <input
                  type="text"
                  :value="limit"
                  readonly
                  class="form-control readonly-input"
                  />
              </div>
              </div>

              <div class="col-12 col-md-6">
              <div class="form-group">
                  <label class="field-label">
                  <i class="bi bi-key-fill me-1"></i>
                  AppKey
                  </label>
                  <input
                  type="text"
                  v-model="settings.appkey"
                  readonly
                  class="form-control readonly-input appkey-input"
                  />
              </div>
              </div>
          </div>
          </div>
      </div>
    </div>

    <!-- Card de Concepto Principal -->
    <div class="card concept-card mb-5">
      <div class="card-header">
        <i class="bi bi-lightbulb-fill me-2"></i>
        <span>¿Cómo funcionan los formularios?</span>
      </div>
      <div class="card-body p-4">
        <div class="concept-content">
          <p class="intro-text">
            Los formularios en Visora funcionan de manera <strong>independiente y reutilizable</strong>. 
            Esto significa que podés crear un formulario una sola vez y usarlo en múltiples páginas, 
            o crear formularios específicos para cada página según tus necesidades.
          </p>

          <div class="flow-diagram">
            <div class="flow-step">
              <div class="flow-number">1</div>
              <div class="flow-content">
                <h6>Crear Formularios</h6>
                <p>Diseñá tus formularios con los campos que necesitás</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="flow-number">2</div>
              <div class="flow-content">
                <h6>Asociar a Páginas</h6>
                <p>Desde cada página, elegí qué formulario mostrar</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="flow-number">3</div>
              <div class="flow-content">
                <h6>Listo!</h6>
                <p>El formulario se mostrará en la página seleccionada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card de Guía de Uso -->
    <div class="card guide-card mb-5">
      <div class="card-header">
        <i class="bi bi-book-fill me-2"></i>
        <span>Guía paso a paso</span>
      </div>
      <div class="card-body p-4">
        <div class="guide-list">
          <div class="guide-item">
            <div class="guide-icon">📝</div>
            <div class="guide-content">
              <h6 class="guide-title">1. Crear un formulario</h6>
              <p>
                Desde la sección de formularios, creá un nuevo formulario personalizado. 
                Podés agregar diferentes tipos de campos: texto, email, teléfono, selección múltiple, etc.
              </p>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">⚙️</div>
            <div class="guide-content">
              <h6 class="guide-title">2. Configurar campos</h6>
              <p>
                Personalizá cada campo con etiquetas, placeholders, validaciones y opciones específicas. 
                Podés marcar campos como obligatorios o opcionales según tus necesidades.
              </p>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">💾</div>
            <div class="guide-content">
              <h6 class="guide-title">3. Guardar el formulario</h6>
              <p>
                Una vez configurado, guardá el formulario. Este quedará disponible en tu biblioteca 
                de formularios para ser usado en cualquier página.
              </p>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">🔗</div>
            <div class="guide-content">
              <h6 class="guide-title">4. Asociar a una página</h6>
              <p>
                Andá a la sección de <strong>Páginas</strong>, seleccioná la página que querés editar, 
                y en la configuración elegí el formulario que acabás de crear. 
                Podés cambiar el formulario asociado en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        <div class="example-box">
          <h6 class="example-title">
            <i class="bi bi-star-fill me-2"></i>
            Ejemplos de uso
          </h6>
          
          <div class="example-item">
            <strong>Formulario único para todas las páginas:</strong>
            <p>
              Creá un formulario general de contacto y asocialo a todas tus páginas. 
              Si necesitás modificarlo, los cambios se reflejarán automáticamente en todas las páginas.
            </p>
          </div>

          <div class="example-item">
            <strong>Formularios específicos por página:</strong>
            <p>
              Creá un formulario de "Solicitud de Test Drive" para páginas de autos, 
              y otro de "Consulta de Servicio Técnico" para páginas de mantenimiento.
            </p>
          </div>

          <div class="example-item mb-0">
            <strong>Formularios por categoría:</strong>
            <p>
              Creá formularios diferentes según el tipo de negocio o marca, 
              permitiendo personalizar la experiencia de cada usuario.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card de Ventajas -->
    <div class="card benefits-card mb-5">
      <div class="card-header">
        <i class="bi bi-check-circle-fill me-2"></i>
        <span>Ventajas del sistema</span>
      </div>
      <div class="card-body p-4">
        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="benefit-icon">♻️</div>
            <div class="benefit-content">
              <h6>Reutilización</h6>
              <p>Creá un formulario y usalo en múltiples páginas sin duplicar trabajo</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">🎯</div>
            <div class="benefit-content">
              <h6>Centralización</h6>
              <p>Gestioná todos tus formularios desde un solo lugar</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">⚡</div>
            <div class="benefit-content">
              <h6>Actualización rápida</h6>
              <p>Modificá un formulario y el cambio se aplica a todas las páginas que lo usan</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">🎨</div>
            <div class="benefit-content">
              <h6>Personalización</h6>
              <p>Diseñá formularios únicos para cada necesidad específica</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">🔄</div>
            <div class="benefit-content">
              <h6>Flexibilidad</h6>
              <p>Cambiá el formulario asociado a una página cuando quieras</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">📊</div>
            <div class="benefit-content">
              <h6>Control</h6>
              <p>Visualizá qué formularios están en uso y en qué páginas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card de Recordatorio -->
    <div class="card reminder-card">
      <div class="card-header">
        <i class="bi bi-exclamation-circle-fill me-2"></i>
        <span>Importante recordar</span>
      </div>
      <div class="card-body p-4">
        <div class="reminder-list">
          <div class="reminder-item">
            <i class="bi bi-check2-circle text-success me-2"></i>
            <span>Los formularios se crean y gestionan <strong>independientemente</strong> de las páginas</span>
          </div>
          <div class="reminder-item">
            <i class="bi bi-check2-circle text-success me-2"></i>
            <span>Una página <strong>siempre debe tener un formulario asociado</strong> para funcionar correctamente</span>
          </div>
          <div class="reminder-item">
            <i class="bi bi-check2-circle text-success me-2"></i>
            <span>Podés <strong>reutilizar</strong> el mismo formulario en múltiples páginas</span>
          </div>
          <div class="reminder-item">
            <i class="bi bi-check2-circle text-success me-2"></i>
            <span>Modificar un formulario <strong>afecta a todas las páginas</strong> que lo usan</span>
          </div>
          <div class="reminder-item">
            <i class="bi bi-check2-circle text-success me-2"></i>
            <span>Podés <strong>cambiar el formulario</strong> asociado a una página en cualquier momento</span>
          </div>
        </div>

        <div class="contact-box mt-4">
          <i class="bi bi-envelope-fill me-2"></i>
          <strong>¿Necesitás ayuda con tus formularios?</strong> Escribinos a 
          <a href="mailto:team@madcoder.io">team@madcoder.io</a>
        </div>
      </div>
    </div>

    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>

import { useAuthStore } from '@/stores/auth';

export default {
  name: "FormsWelcomeView",
  data() {
    return {
      isLoading: false,
      settings: {
        instance_name: 'Mi Empresa SRL',
        domain: 'https://madcoder.io/proyectos/events/',
        details: [],
        appkey: ''
      },
      limit: 0
    };
  },
  methods: {

    async fetchSettings() {
      const authStore = useAuthStore();
      const user = authStore.user;

      this.settings = {
        instance_name: user.instance || "Sin nombre",
        appkey: user.appkey || "N/A",
        details: Array.isArray(user.details) ? user.details : [],
        domain: "https://madcoder.io/proyectos/forms/?code=events"
      };

      this.isLoading = false;
    },

    limitEventDetail() {
      this.limit = this.settings.details.find(d => d.key = "limit_forms").value;
    }

  },

  mounted() {
    this.fetchSettings();
    this.limitEventDetail();
  },
};
</script>

<style scoped>
/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.brand {
  color: #3939ff;
  font-weight: 800;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Cards */
.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

/* Concept Card */
.concept-content {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
}

.intro-text {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.flow-step {
  flex: 1;
  min-width: 200px;
  background: white;
  border: 2px solid #3939ff;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.flow-step:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.2);
}

.flow-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 auto 1rem;
}

.flow-content h6 {
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.flow-content p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.flow-arrow {
  font-size: 2rem;
  color: #3939ff;
  font-weight: 700;
}

/* Guide Card */
.guide-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.guide-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.guide-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.15);
}

.guide-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.guide-title {
  color: #3939ff;
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0 0 0.5rem 0;
}

.guide-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Example Box */
.example-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  padding: 1.5rem;
  border-radius: 8px;
}

.example-title {
  color: #1e40af;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.example-item {
  margin-bottom: 1.5rem;
}

.example-item strong {
  color: #1e40af;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.example-item p {
  color: #1e3a8a;
  margin: 0;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* Benefits Card */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.benefit-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.benefit-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.benefit-content h6 {
  color: #1f2937;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.benefit-content p {
  color: #6b7280;
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Reminder Card */
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reminder-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #374151;
}

.reminder-item i {
  font-size: 1.2rem;
  margin-top: 2px;
}

.contact-box {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #92400e;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.contact-box a {
  color: #3939ff !important;
  font-weight: 600;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.5rem;
  }

  .flow-diagram {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }

  .guide-item {
    flex-direction: column;
    text-align: center;
  }

  .guide-icon {
    font-size: 2rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>