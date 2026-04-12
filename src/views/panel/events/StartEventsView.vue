<template>
  <div class="settings-container p-6 max-w-5xl mx-auto">
    <div class="header-section mb-6">
      <h2 class="main-title">Bienvenido a <span class="brand">Visora Events</span></h2>
      <p class="subtitle">Crea, gestiona y controla eventos con inscripciones, validación de asistencia y control de acceso mediante QR</p>
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

            <div class="col-12 col-md-6">
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

            <div class="col-12 col-md-6">
              <div class="form-group">
                <label class="field-label">
                  <i class="bi bi-globe me-1"></i>
                  Dominio
                </label>
                <input
                  type="text"
                  v-model="settings.domain"
                  readonly
                  class="form-control readonly-input"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div v-if="limitEventDetail" class="form-group">
                <label class="field-label">
                  <i class="bi bi-info-circle me-1"></i>
                  Cantidad de eventos permitidos
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

    <!-- Card de Guía -->
    <div class="card guide-card mb-5">
      <div class="card-header">
        <i class="bi bi-book-fill me-2"></i>
        <span>Guía de uso</span>
      </div>
      <div class="card-body p-4">
        <div class="intro-text">
          El módulo de <strong>Eventos</strong> es una solución completa para gestionar desde la promoción de tus eventos hasta la validación de asistencia. Crea eventos con múltiples sesiones, controla inscripciones, valida acceso con QR y obtén reportes de asistencia en tiempo real.
        </div>

        <div class="guide-list">
          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">📅</div>
              <div class="guide-content">
                <h6 class="guide-title">Crear Eventos</h6>
                <p>Define eventos con nombre, descripción detallada e imagen representativa. Los eventos son el contenedor principal que agrupa una o más sesiones. Puedes crear eventos para capacitaciones, conferencias, ferias, webinars y más.</p>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">🕐</div>
              <div class="guide-content">
                <h6 class="guide-title">Sesiones</h6>
                <p>Agrega múltiples sesiones a cada evento, cada una con su propia <strong>fecha, hora y ubicación</strong>. Personaliza cada sesión con:</p>
                <ul class="mb-0">
                  <li><strong>Cupo de asistentes</strong>: ilimitado o con límite máximo</li>
                  <li><strong>Modalidad pública</strong>: cualquiera con el enlace puede inscribirse</li>
                  <li><strong>Modalidad privada</strong>: solo usuarios validados en lista autorizada</li>
                  <li><strong>Descripción específica</strong>: detalla qué incluye cada sesión</li>
                </ul>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">📋</div>
              <div class="guide-content">
                <h6 class="guide-title">Listas de Validación</h6>
                <p>Para sesiones privadas, importa un archivo <strong>Excel (.xlsx)</strong> con los participantes autorizados. Especifica campos de validación como DNI, email, código de empleado, nombre o documento. Solo quienes coincidan con los datos de la lista podrán completar su inscripción.</p>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">📝</div>
              <div class="guide-content">
                <h6 class="guide-title">Asociar Formularios</h6>
                <p>Vincula un formulario de <strong>Visora Forms</strong> a tu evento para capturar información personalizada en la inscripción. Recopila datos como nombre, teléfono, empresa, preferencias y preguntas específicas. El formulario se mostrará automáticamente cuando el usuario seleccione una sesión para inscribirse.</p>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">🔗</div>
              <div class="guide-content">
                <h6 class="guide-title">Código de Inserción</h6>
                <p>Genera un código embed para integrar en tu sitio web sin necesidad de redireccionar. Muestra una <strong>galería interactiva de eventos</strong> y al seleccionar uno, despliega sus sesiones disponibles con el formulario de inscripción. Compatible con cualquier CMS o página web.</p>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">👥</div>
              <div class="guide-content">
                <h6 class="guide-title">Gestión de Inscripciones</h6>
                <p>Panel centralizado para visualizar, filtrar y gestionar todas las inscripciones. Cada inscripción tiene un estado que indica su ciclo de vida:</p>
                <ul class="mb-2">
                  <li><strong>Registrado</strong>: inscripción confirmada y válida, pendiente de escaneo QR</li>
                  <li><strong>Presente</strong>: asistencia confirmada (manual o por escaneo QR en el evento)</li>
                  <li><strong>Ausente</strong>: el evento terminó sin escanear el QR</li>
                  <li><strong>Cancelado</strong>: inscripción anulada por el usuario o administrador</li>
                </ul>
                <p class="mb-0">Cambia estados manualmente, descarga reportes y aplica acciones en lote. Las reglas automáticas pueden actualizar estados según condiciones.</p>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">📱</div>
              <div class="guide-content">
                <h6 class="guide-title">Códigos QR y Check-in</h6>
                <p>Cada inscripción genera un <strong>QR único y encriptado</strong> que se envía automáticamente por email. En el día del evento:</p>
                <ul class="mb-0">
                  <li>El participante lleva su teléfono con el QR (email o captura de pantalla)</li>
                  <li>Escanea con tu dispositivo usando el app o scanner web integrado</li>
                  <li>El estado cambia a <strong>Presente</strong> instantáneamente</li>
                  <li>Sistema antifraude: previene escaneos duplicados y registra timestamp</li>
                  <li>Funciona offline y sin conexión a internet</li>
                </ul>
              </div>
            </div>
          <!-- </a> -->

          <!-- <a href="#" class="guide-item-link"> -->
            <div class="guide-item">
              <div class="guide-icon">⚙️</div>
              <div class="guide-content">
                <h6 class="guide-title">Reglas de Validación</h6>
                <p>Automatiza procesos repetitivos con reglas personalizables que se ejecutan según condiciones:</p>
                <ul class="mb-0">
                  <li>Marcar como <strong>Ausente</strong> tras X horas de finalización del evento</li>
                  <li>Enviar <strong>recordatorios por email</strong> 24h o 1h antes</li>
                  <li><strong>Bloquear inscripciones</strong> cuando se alcance el cupo</li>
                  <li><strong>Validar datos</strong> en tiempo real contra listas de validación</li>
                  <li>Enviar <strong>confirmación automática</strong> con QR tras inscripción</li>
                  <li>Cancelar automáticamente si no completa el formulario</li>
                </ul>
              </div>
            </div>
          <!-- </a> -->
        </div>

        <div class="summary-box">
          <h6 class="summary-title">
            <i class="bi bi-lightbulb-fill me-2"></i>
            Flujo de trabajo paso a paso
          </h6>
          <ol class="mb-3">
            <li><strong>Crear el evento</strong> con nombre, descripción e imagen representativa</li>
            <li><strong>Agregar sesiones</strong> con fechas, horarios, ubicación y cupo máximo</li>
            <li><strong>Elegir modalidad</strong>: pública (abierta a todos) o privada (con validación de lista)</li>
            <li><strong>Cargar lista de validación</strong> (Excel) si es evento privado</li>
            <li><strong>Asociar formulario</strong> de Visora Forms para recopilar datos personalizados</li>
            <li><strong>Configurar reglas automáticas</strong>: recordatorios, bloqueo de cupo, cambio de estado</li>
            <li><strong>Generar código embed</strong> y publicar en tu sitio web o compartir enlace directo</li>
            <li><strong>Monitorear inscripciones</strong> en tiempo real desde el panel</li>
            <li><strong>En el evento</strong>: escanea QR de asistentes con el app mobile para registrar check-in</li>
            <li><strong>Después</strong>: descarga reportes de asistencia y ejecuta acciones de seguimiento</li>
          </ol>
          
          <p class="mb-0"><strong>Resultado:</strong> Un flujo completo y automatizado que te permite promover eventos, controlar acceso, validar asistencia en tiempo real y obtener métricas detalladas de participación.</p>
        </div>

        <div class="contact-box">
          <i class="bi bi-envelope-fill me-2"></i>
          <strong>¿Necesitas más eventos, sesiones o funcionalidades personalizadas?</strong> Contáctanos a 
          <a href="mailto:team@madcoder.io">team@madcoder.io</a>
        </div>
      </div>
    </div>

    <!-- Card de Código de Inserción -->
    <div class="card code-card mb-5" id="insercion">
      <div class="card-header">
        <i class="bi bi-code-slash me-2"></i>
        <span>Código de inserción para eventos</span>
      </div>
      <div class="card-body p-4">
        <div class="form-group">
          <label class="field-label mb-3">
            <i class="bi bi-file-earmark-code me-1"></i>
            Copia este código y pégalo en tu sitio web o CMS para mostrar la galería de eventos interactiva
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

import { useAuthStore } from '@/stores/auth';

export default {
  name: 'EventosGuide',
  data() {
    return {
      isLoading: false,
      copied: false,
      copying: false,
      settings: {
        instance_name: 'Mi Empresa SRL',
        domain: 'https://madcoder.io/proyectos/events/',
        details: [],
        appkey: ''
      },
      htmlContent: '',
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

      this.htmlContent = `<div id="events-container" data-appkey="${this.settings.appkey}"></div>\n<scr` +
      `ipt src="https://madcoder.io/cdn/events/iframe-loader.js"></scr` +
      `ipt>`;

      this.isLoading = false;
    },

    async copyHtml() {
      this.copying = true;
      const authStore = useAuthStore();
      const user = authStore.user;
      try {
        await navigator.clipboard.writeText(this.htmlContent);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      } finally {
        this.copying = false;
      }
    },

    limitEventDetail() {
      this.limit = this.settings.details.find(d => d.key = "limit_events").value;
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


/* Estilos heredados del componente original */
/* .settings-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
} */

/* .main-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
} */
.brand {
  color: #3939ff;
  font-weight: 800;
}


.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.card {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.card-header {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem 0.5rem 0 0;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.readonly-input {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #6b7280;
}

.intro-text {
  background: #eff6ff;
  border-left: 4px solid #2563eb;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0.25rem;
  color: #1e40af;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.guide-item-link {
  text-decoration: none;
  color: inherit;
}

.guide-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
  background: white;
}

.guide-item:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.guide-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.guide-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.guide-content p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.guide-content ul {
  color: #6b7280;
  font-size: 0.875rem;
  padding-left: 1.25rem;
}

.summary-box {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-top: 1.5rem;
}

.summary-title {
  font-weight: 600;
  color: #15803d;
  margin-bottom: 0.75rem;
}

.summary-box p,
.summary-box ul,
.summary-box ol {
  color: #166534;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.summary-box ul,
.summary-box ol {
  padding-left: 1.25rem;
}

.contact-box {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1.5rem;
  color: #92400e;
  font-size: 0.875rem;
}

.contact-box a {
  color: #1d4ed8;
  text-decoration: underline;
}

.code-container {
  position: relative;
  background: #1f2937;
  border-radius: 0.5rem;
  overflow: hidden;
}

.html-viewer {
  padding: 1.5rem;
  margin: 0;
  color: #d1d5db;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}

.copy-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
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
</style>