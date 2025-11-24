<template>
  <div class="settings-container p-6 max-w-5xl mx-auto">
    <div class="header-section mb-6">
      <h2 class="main-title">Bienvenido a <span class="brand">Visora Forms</span></h2>
      <p class="subtitle">Configurá y gestioná tus formularios de manera simple y profesional</p>
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
              <div 
                v-for="(detail, index) in settings.details"
                :key="detail.id || index"
                class="form-group">
                <label class="field-label">
                  <i class="bi bi-info-circle me-1"></i>
                  {{ $t(detail.key) }}
                </label>
                <input
                  type="text"
                  :value="detail.value"
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

    <!-- Card de Guía -->
    <div class="card guide-card mb-5">
      <div class="card-header">
        <i class="bi bi-book-fill me-2"></i>
        <span>Guía de uso</span>
      </div>
      <div class="card-body p-4">
        <div class="intro-text" v-html="$t('forms.welcome_1')"></div>

        <div class="guide-list">
          <router-link :to="{ name: 'settings-menu' }" class="guide-item-link">
            <div class="guide-item">
              <div class="guide-icon">🧭</div>
              <div class="guide-content">
                <h6 class="guide-title">Menú</h6>
                <p>El menú es <strong>global</strong> — es el mismo para todas las landings y se configura una sola vez.</p>
              </div>
            </div>
          </router-link>

          <router-link :to="{ name: 'forms-main' }" class="guide-item-link">
            <div class="guide-item">
              <div class="guide-icon">📨</div>
              <div class="guide-content">
                <h6 class="guide-title">Header + Formulario</h6>
                <p>Cada <strong>formulario</strong> tiene su propia imagen de header, textos y formulario de contacto. Además, cada formulario cuenta con un <strong>código de llamada</strong> (Call Code) que lo identifica y permite integrarlo fácilmente en cualquier sitio web o página externa.</p>
              </div>
            </div>
          </router-link>

          <router-link :to="{ name: 'forms-products' }" class="guide-item-link">
            <div class="guide-item">
              <div class="guide-icon">🧱</div>
              <div class="guide-content">
                <h6 class="guide-title">Sección 1</h6>
                <p>Crea cards para la Sección 1 y asociálas a un formulario. Cada card tiene la opción de incluir su propio <strong>Call Code</strong>, lo que permite generar un enlace directo a otro formulario dentro de la misma plataforma.</p>
              </div>
            </div>
          </router-link>

          <router-link :to="{ name: 'forms-aboutus' }" class="guide-item-link">
            <div class="guide-item">
              <div class="guide-icon">💬</div>
              <div class="guide-content">
                <h6 class="guide-title">Sección 2</h6>
                <p>Crea cards para la Sección 2 y asociálas a un formulario. Las cards se cargan desde el enlace específico de "cards Sección 2".</p>
              </div>
            </div>
          </router-link>

          <router-link :to="{ name: 'forms-header_footer' }" class="guide-item-link">
            <div class="guide-item">
              <div class="guide-icon">⚓</div>
              <div class="guide-content">
                <h6 class="guide-title">Footer</h6>
                <p>El footer también es <strong>global</strong> y se aplica a todas las landings.</p>
              </div>
            </div>
          </router-link>
        </div>

        <div class="summary-box">
          <h6 class="summary-title">
            <i class="bi bi-lightbulb-fill me-2"></i>
            Resumen
          </h6>
          <p>Una vez creado y configurado tu formulario, <strong>copiá el <a href="#insercion">código de inserción</a></strong> que genera el sistema y <strong>pegalo en tu sitio web</strong> donde quieras que aparezca. También podés acceder al mismo formulario mediante una <em>URL con código de referencia</em>.</p>
          
          <p>En resumen: cada formulario controla su propio <strong>header</strong> y sus dos secciones principales (con sus respectivas cards). El <strong>menú</strong> y el <strong>footer</strong> son compartidos entre todas las landings.</p>
          
          <p class="mb-0">Esto permite tener múltiples landings (cada una con su formulario y contenido personalizado) manteniendo una identidad visual coherente y una estructura común.</p>
        </div>

        <div class="contact-box">
          <i class="bi bi-envelope-fill me-2"></i>
          <strong>¿Necesitás más formularios?</strong> Escribinos a 
          <a href="mailto:team@madcoder.io">team@madcoder.io</a>
        </div>
      </div>
    </div>

    <!-- Card de Código de Inserción -->
    <div class="card code-card mb-5" id="insercion">
      <div class="card-header">
        <i class="bi bi-code-slash me-2"></i>
        <span>Código de inserción</span>
      </div>
      <div class="card-body p-4">
        <div class="form-group">
          <label class="field-label mb-3">
            <i class="bi bi-file-earmark-code me-1"></i>
            Copiá este código y pegalo en tu sitio web
          </label>
          <div class="code-container">
            <pre class="html-viewer"><code>{{ htmlContent }}</code></pre>

            <div class="copy-overlay">
              <button
                :disabled="copying"
                @click="copyHtml"
                class="copy-btn"
                :class="{ 'copied': copied }"
              >
                <span v-if="!copied" class="icon">
                  <i class="bi bi-clipboard"></i>
                </span>
                <span v-else class="icon">
                  <i class="bi bi-check-lg"></i>
                </span>
                <span class="btn-text">
                  {{ copied ? 'Copiado!' : (copying ? 'Copiando...' : 'Copiar código') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from '@/stores/auth';

export default {
  name: "SettingsView",
  data() {
    return {
      token: null,
      settings: {
        appkey: "",
        instance_name: "",
        details: [],
      },
      htmlContent: "",
      copying: false,
      copied: false,
      copyTimeoutId: null,
      isLoading: {value: true}
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
      };

      this.htmlContent = `<div id="form-container" data-appkey="${this.settings.appkey}"></div>\n<scr` +
        `ipt src="https://madcoder.io/cdn/form/iframe-loader.js"></scr` +
        `ipt>`;

      this.isLoading = false;
    },

    async copyHtml() {
      if (this.copying) return;
      this.copying = true;
      this.copied = false;

      try {
        const htmlToCopy = this.htmlContent.trim();
        await navigator.clipboard.writeText(htmlToCopy);
        this.copied = true;
        clearTimeout(this.copyTimeoutId);
        this.copyTimeoutId = setTimeout(() => (this.copied = false), 2500);
      } catch (err) {
        console.error("Error copiando HTML:", err);
      } finally {
        this.copying = false;
      }
    },
  },
  mounted() {
    this.fetchSettings();
  },
  beforeUnmount() {
    clearTimeout(this.copyTimeoutId);
  }
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

/* Info Card */
.info-card .card-body {
  background: #f9fafb;
}

.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.readonly-input {
  background: white !important;
  border: 2px solid #e5e7eb;
  color: #1f2937;
  font-weight: 500;
  cursor: default;
  transition: border-color 0.2s ease;
}

.readonly-input:focus {
  border-color: #3939ff;
  outline: none;
}

.appkey-input {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

/* Guide Card */
.guide-card .intro-text {
  margin-bottom: 1.5rem;
  color: #4b5563;
  line-height: 1.6;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.guide-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.guide-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  /* border-left: 4px solid #3939ff; */
  transition: all 0.3s ease;
  cursor: pointer;
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
  margin: 0 0 0.25rem 0;
}

.guide-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.summary-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.summary-title {
  color: #1e40af;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.summary-box p {
  color: #1e3a8a;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.summary-box a {
  color: #3939ff !important;
  font-weight: 600;
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

/* Code Card */
.code-container {
  position: relative;
}

.html-viewer {
  background: #1f2937;
  color: #10b981;
  border: 2px solid #374151;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  overflow-x: auto;
  margin: 0;
  line-height: 1.6;
}

.copy-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #3939ff;
  color: #3939ff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
  transition: all 0.3s ease;
}

.copy-btn:hover:not(:disabled) {
  background: #3939ff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.copy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.copy-btn.copied {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.copy-btn .icon {
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.btn-text {
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.5rem;
  }

  .guide-item {
    flex-direction: column;
    text-align: center;
  }

  .guide-icon {
    font-size: 2rem;
  }

  .copy-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}
</style>