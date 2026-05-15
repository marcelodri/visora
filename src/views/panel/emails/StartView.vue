<template>
  <div class="settings-container emails-module mt-4 mb-5">
    <!-- Header -->
    <div class="header-section mb-4">
      <h2 class="main-title">Bienvenido a <span class="brand">Visora Email Campaigns</span></h2>
      <p class="subtitle">Creá y gestioná tus campañas de email masivo</p>
    </div>
    <hr class="header-divider">

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <template v-else>
      <!-- Límites card -->
      <div class="card info-card mb-4">
        <div class="card-header">
          <i class="bi bi-speedometer2 me-2"></i>
          <span>Límites de tu cuenta</span>
        </div>
        <div class="card-body p-4">
          <div class="row g-3">

            <!-- Templates -->
            <div class="col-6 col-md-3">
              <div class="stat-card">
                <div class="stat-icon purple"><i class="bi bi-file-earmark-code"></i></div>
                <div class="stat-info">
                  <div class="stat-label">Templates</div>
                  <div class="stat-value">{{ limits.templates_used }}<span style="font-size:0.9rem;color:#adb5bd"> / {{ limits.max_templates ?? '∞' }}</span></div>
                  <div class="stat-progress mt-2">
                    <div
                      class="stat-progress-bar"
                      :class="progressClass(limits.templates_used, limits.max_templates)"
                      :style="{ width: pct(limits.templates_used, limits.max_templates) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campaigns -->
            <div class="col-6 col-md-3">
              <div class="stat-card">
                <div class="stat-icon blue"><i class="bi bi-megaphone"></i></div>
                <div class="stat-info">
                  <div class="stat-label">Campañas</div>
                  <div class="stat-value">{{ limits.campaigns_used }}<span style="font-size:0.9rem;color:#adb5bd"> / {{ limits.max_campaigns ?? '∞' }}</span></div>
                  <div class="stat-progress mt-2">
                    <div
                      class="stat-progress-bar"
                      :class="progressClass(limits.campaigns_used, limits.max_campaigns)"
                      :style="{ width: pct(limits.campaigns_used, limits.max_campaigns) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Monthly sends -->
            <div class="col-6 col-md-3">
              <div class="stat-card">
                <div class="stat-icon green"><i class="bi bi-send-check"></i></div>
                <div class="stat-info">
                  <div class="stat-label">Envíos</div>
                  <div class="stat-value">{{ limits.sends_used_current_month.toLocaleString() }}<span style="font-size:0.9rem;color:#adb5bd"> / {{ limits.max_sends_per_month != null ? limits.max_sends_per_month.toLocaleString() : '∞' }}</span></div>
                  <div class="stat-progress mt-2">
                    <div
                      class="stat-progress-bar"
                      :class="progressClass(limits.sends_used_current_month, limits.max_sends_per_month)"
                      :style="{ width: pct(limits.sends_used_current_month, limits.max_sends_per_month) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reset day -->
            <div class="col-6 col-md-3">
              <div class="stat-card">
                <div class="stat-icon orange"><i class="bi bi-calendar-month"></i></div>
                <div class="stat-info">
                  <div class="stat-label">Reseteo</div>
                  <div class="stat-value">Día {{ limits.billing_reset_day }}</div>
                  <div class="stat-sub">de cada mes</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Guía de uso card -->
      <div class="card access-card mb-4">
        <div class="card-header">
          <i class="bi bi-book-fill me-2"></i>
          <span>Guía de uso</span>
        </div>
        <div class="card-body p-4">

          <!-- Flujo principal -->
          <p class="text-muted mb-4" style="font-size:0.95rem">
            El módulo de Email Campaigns te permite crear, personalizar y enviar campañas de email masivo en tres pasos simples.
            Seguí el flujo recomendado para sacarle el máximo provecho.
          </p>

          <div class="row g-4 mb-4">

            <!-- Paso 1 -->
            <div class="col-12 col-md-4">
              <div class="d-flex gap-3 align-items-start">
                <div class="guide-step-number">1</div>
                <div>
                  <h6 class="fw-bold mb-1"><i class="bi bi-file-earmark-code me-1 text-primary"></i>Creá un Template</h6>
                  <p class="text-muted mb-2" style="font-size:0.86rem">
                    Andá a <strong>Templates</strong> y creá tu plantilla HTML. Podés escribirla desde cero, pegar código existente o usar la <em>plantilla base compatible con Outlook</em> que incluye el editor.
                  </p>
                  <p class="text-muted mb-0" style="font-size:0.86rem">
                    Usá variables dinámicas como <code>{{nombre}}</code>, <code>{{empresa}}</code> o cualquier campo personalizado: el sistema detecta las variables automáticamente y las mapea a tus datos.
                  </p>
                </div>
              </div>
            </div>

            <!-- Paso 2 -->
            <div class="col-12 col-md-4">
              <div class="d-flex gap-3 align-items-start">
                <div class="guide-step-number">2</div>
                <div>
                  <h6 class="fw-bold mb-1"><i class="bi bi-megaphone me-1 text-primary"></i>Creá una Campaña</h6>
                  <p class="text-muted mb-2" style="font-size:0.86rem">
                    Andá a <strong>Campañas → Nueva campaña</strong>. El asistente guiado te lleva en 4 pasos:
                  </p>
                  <ol class="text-muted ps-3 mb-0" style="font-size:0.86rem">
                    <li class="mb-1"><strong>Información:</strong> poné nombre y descripción interna.</li>
                    <li class="mb-1"><strong>Template:</strong> elegí la plantilla que acabás de crear.</li>
                    <li class="mb-1"><strong>Destinatarios:</strong> seleccioná desde tu base de datos o importá un archivo <code>.xlsx</code> / <code>.csv</code>.</li>
                    <li><strong>Revisar y enviar:</strong> revisá el resumen, la vista previa del email y enviá.</li>
                  </ol>
                </div>
              </div>
            </div>

            <!-- Paso 3 -->
            <div class="col-12 col-md-4">
              <div class="d-flex gap-3 align-items-start">
                <div class="guide-step-number">3</div>
                <div>
                  <h6 class="fw-bold mb-1"><i class="bi bi-send-check me-1 text-primary"></i>Enviá o Programá</h6>
                  <p class="text-muted mb-2" style="font-size:0.86rem">
                    En el último paso elegís cómo enviar:
                  </p>
                  <ul class="text-muted ps-3 mb-0" style="font-size:0.86rem">
                    <li class="mb-1"><strong>Enviar ahora:</strong> el payload se despacha al instante a tu webhook n8n.</li>
                    <li class="mb-1"><strong>Programar — una vez:</strong> elegís fecha y hora exacta para el envío.</li>
                    <li><strong>Programar — recurrente:</strong> configurás cada cuántos meses, en qué día y a qué hora. Ideal para newsletters mensuales.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <hr class="my-3">

          <!-- Tips rápidos -->
          <h6 class="fw-bold mb-3"><i class="bi bi-lightbulb-fill me-2" style="color:#f0c040"></i>Tips útiles</h6>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div class="guide-tip">
                <i class="bi bi-table text-success me-2"></i>
                <span><strong>Excel con variables:</strong> si tu plantilla tiene <code>{{nombre}}</code> y <code>{{empresa}}</code>, el asistente te pide que mapees cada variable a la columna correspondiente del archivo. Siempre se requiere al menos la columna de <strong>email</strong>.</span>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="guide-tip">
                <i class="bi bi-eye text-primary me-2"></i>
                <span><strong>Vista previa en vivo:</strong> tanto en el editor de templates como en el paso de revisión podés ver cómo va a quedar el email renderizado con los datos reales del primer destinatario.</span>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="guide-tip">
                <i class="bi bi-microsoft text-warning me-2"></i>
                <span><strong>Compatibilidad Outlook:</strong> usá la <em>plantilla base</em> incluida en el editor. Está construida con tablas anidadas y VML para garantizar que el diseño se vea bien en Outlook y clientes de email corporativos.</span>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="guide-tip">
                <i class="bi bi-arrow-repeat text-info me-2"></i>
                <span><strong>Campañas recurrentes:</strong> si necesitás enviar el mismo email todos los meses (por ejemplo, un resumen mensual), usá la opción recurrente. El sistema calcula automáticamente la próxima fecha de envío.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { getTemplates, getCampaigns } from '@/services/emailService';
import '@/assets/styles/emails.css';

export default {
  name: 'EmailsStartView',
  data() {
    return {
      loading: true,
      limits: {
        max_templates: null,
        max_campaigns: null,
        max_sends_per_month: null,
        templates_used: 0,
        campaigns_used: 0,
        sends_used_current_month: 0,
        billing_reset_day: 1
      }
    };
  },
  async mounted() {
    try {
      const authStore = useAuthStore();
      const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
      const detail = (key) => {
        const d = details.find(d => d.key === key);
        return d !== undefined ? Number(d.value) : null;
      };

      const [templates, campaigns] = await Promise.all([getTemplates(), getCampaigns()]);

      this.limits = {
        max_templates:            detail('limit_template_emails'),
        max_campaigns:            detail('limit_campaign_emails'),
        max_sends_per_month:      detail('limit_shipping_emails'),
        templates_used:           templates.length,
        campaigns_used:           campaigns.length,
        sends_used_current_month: this.limits.sends_used_current_month,
        billing_reset_day:        1
      };
    } finally {
      this.loading = false;
    }
  },
  methods: {
    pct(used, max) {
      if (!max) return 0;
      return Math.min(100, Math.round((used / max) * 100));
    },
    progressClass(used, max) {
      const p = this.pct(used, max);
      if (p >= 90) return 'danger';
      if (p >= 70) return 'orange';
      return 'blue';
    }
  }
};
</script>

<style scoped>
.settings-container {
  max-width: 72rem;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 1.5rem;
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
</style>