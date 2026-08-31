<template>
  <div class="container-fluid emails-module mt-4">
    <div class="emails-header mb-4">
      <div>
        <h2>Templates de Email</h2>
        <p class="text-muted mb-0" style="font-size:0.9rem">Diseñá y gestioná tus plantillas de email con variables dinámicas</p>
      </div>
      <button v-if="!loading && !atLimit" class="btn btn-primary btn-add" @click="openCreate">
        <i class="bi bi-plus-circle me-2"></i>Nuevo Template
      </button>
      <div v-if="!loading && atLimit" class="limit-reached-banner">
        <i class="bi bi-lock-fill me-2"></i>
        Alcanzaste el límite de <strong>{{ maxTemplates }}</strong> templates. Para aumentar tu plan contactá a
        <a href="mailto:team@madcoder.io">team@madcoder.io</a>
      </div>
    </div>
    <hr class="header-divider" />

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- LISTADO DE TEMPLATES (Modo visualización) -->
    <div v-else>
      <!-- Tip -->
      <div class="accordion mb-4" id="accordionEmailTip">
        <div class="accordion-item tip-banner-style">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed tip-banner-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseEmailTip"
            >
              <div class="tip-icon"><i class="bi bi-lightbulb-fill"></i></div>
              <div class="tip-text">
                <strong>Tips para crear templates efectivos</strong> — Variables dinámicas, compatibilidad Outlook y vista previa en vivo.
              </div>
            </button>
          </h2>
          <div id="collapseEmailTip" class="accordion-collapse collapse">
            <div class="accordion-body tip-expanded">
              <div class="row g-4">
                <div class="col-12 col-md-3">
                  <div class="d-flex gap-3 align-items-start">
                    <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-braces"></i></div>
                    <div>
                      <strong style="font-size:0.9rem">Variables dinámicas</strong>
                      <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                        Insertá <code v-pre>{{nombre}}</code>, <code v-pre>{{empresa}}</code>, <code v-pre>{{email}}</code> o cualquier clave personalizada en el HTML. El sistema las detecta solas y las muestra al armar la campaña para que las mapees a tus columnas de datos.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="d-flex gap-3 align-items-start">
                    <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-microsoft"></i></div>
                    <div>
                      <strong style="font-size:0.9rem">Compatibilidad Outlook</strong>
                      <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                        Outlook no soporta CSS moderno. Usá el botón <em>"Insertar plantilla base"</em> en el editor: incluye estructura de tablas anidadas y VML para botones, probada en Outlook 2016/2019 y Microsoft 365.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="d-flex gap-3 align-items-start">
                    <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-eye"></i></div>
                    <div>
                      <strong style="font-size:0.9rem">Vista previa en vivo</strong>
                      <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                        El editor divide la pantalla en dos: código HTML a la izquierda y renderizado a la derecha en tiempo real. Así ves exactamente cómo va a quedar el email antes de guardarlo.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="d-flex gap-3 align-items-start">
                    <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-envelope-at"></i></div>
                    <div>
                      <strong style="font-size:0.9rem">Asunto con variables</strong>
                      <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                        El campo <em>Asunto</em> también acepta variables. Por ejemplo: <code v-pre>Hola {{nombre}}, novedades de {{empresa}}</code>. Personalizar el asunto mejora notablemente la tasa de apertura del email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!templates.length" class="text-center py-5">
        <i class="bi bi-file-earmark-x" style="font-size:3rem;color:#dee2e6"></i>
        <p class="text-muted mt-3">No tenés templates aún. Creá uno nuevo.</p>
      </div>

      <!-- GRID -->
      <div v-else class="template-grid">
        <div
          v-for="tmpl in templates"
          :key="tmpl.id"
          class="template-card"
        >
          <!-- Preview -->
          <div class="template-preview">
            <iframe
              :srcdoc="tmpl.html_content"
              sandbox=""
              title="preview"
            ></iframe>
          </div>
          <!-- Meta -->
          <div class="template-meta">
            <div class="d-flex align-items-center gap-2 mb-1">
              <h6 class="mb-0">{{ tmpl.name }}</h6>
              <span
                class="type-badge"
                :class="tmpl.type === 'custom' ? 'type-badge--custom' : 'type-badge--default'"
              >{{ tmpl.type === 'custom' ? 'Custom' : 'Default' }}</span>
            </div>
            <p class="subject">📧 {{ tmpl.subject }}</p>
            <div class="template-vars">
              <span v-for="v in tmpl.variables" :key="v" class="var-chip" v-text="varLabel(v)"></span>
            </div>
            <div class="d-flex gap-2 mt-2 justify-content-end align-items-bottom">
              <button class="btn btn-sm btn-outline mx-0" @click="openEdit(tmpl)">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(tmpl)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM DELETE ═══ -->
    <div v-if="showDeleteConfirm" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)">
      <div class="modal-dialog modal-md">
        <div class="modal-content" style="border-radius:14px">
          <div class="modal-body text-center p-4">
            <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size:2.5rem"></i>
            <h5 class="mt-3">¿Eliminar template?</h5>
            <p class="text-muted">Esta acción no se puede deshacer. El template <strong>{{ templateToDelete?.name }}</strong> será eliminado.</p>
          </div>
          <div class="modal-footer justify-content-center border-0 text-end">
            <button class="btn btn-outline" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="btn btn-danger" :disabled="saving" @click="deleteTemplate">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL PRINCIPAL CON STEPS ═══ -->
    <ModalComponent 
      ref="templateModal" 
      modalId="templateModal" 
      :modalTitle="editing ? 'Editar Template' : 'Nuevo Template'" 
      class="modal-fullscreen-fixed" 
      @modalClosed="handleCloseModal"
    >
      <div class="pages-step-modal">
        <div class="pages-step-shell">
          <!-- STEPPER -->
          <div class="pages-stepper">
            <button
              v-for="(step, index) in formSteps"
              :key="step.key"
              type="button"
              class="pages-step-item"
              :class="{ active: currentStep === index, done: currentStep > index }"
              @click="goToStep(index)"
            >
              <div class="pages-step-num">
                <i v-if="currentStep > index" class="bi bi-check-lg"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="pages-step-copy">
                <span>{{ step.label }}</span>
                <small>{{ step.description }}</small>
              </div>
            </button>
          </div>

          <!-- CONTENT -->
          <div class="pages-step-content">
            <!-- PASO 1: Datos Básicos -->
            <div v-show="currentStep === 0" class="pages-step-panel">
              <div class="card data-card pages-card">
                <div class="pages-card-head">
                  <i class="bi bi-info-circle-fill"></i>
                  <span>Datos básicos del template</span>
                </div>
                <div class="pages-card-body">
                  <p class="step-description">Ingresá el nombre y asunto del email. Podés usar variables como <code v-pre>{{nombre}}</code>, <code v-pre>{{empresa}}</code>, etc.</p>
                  
                  <div class="row g-3 mb-4">
                    <!-- Name -->
                    <div class="col-12">
                      <label class="form-label fw-semibold"><i class="bi bi-tag me-2"></i>Nombre del template *</label>
                      <input 
                        v-model="form.name" 
                        type="text" 
                        class="form-control" 
                        :class="{ 'is-invalid': step1Submitted && !form.name.trim() }"
                        placeholder="Ej: Bienvenida a nuevos clientes" 
                      />
                      <div v-if="step1Submitted && !form.name.trim()" class="invalid-feedback">
                        El nombre es requerido
                      </div>
                    </div>

                    <!-- Subject -->
                    <div class="col-12">
                      <label class="form-label fw-semibold"><i class="bi bi-envelope me-2"></i>Asunto del email *</label>
                      <input 
                        v-model="form.subject" 
                        type="text" 
                        class="form-control" 
                        :class="{ 'is-invalid': step1Submitted && !form.subject.trim() }"
                        placeholder="Ej: Bienvenido/a, {{nombre}}!" 
                      />
                      <div v-if="step1Submitted && !form.subject.trim()" class="invalid-feedback">
                        El asunto es requerido
                      </div>
                      <small class="text-muted">Tip: Incluí variables en el asunto para personalizar el email</small>
                    </div>
                  </div>

                  <!-- Tip Box -->
                  <div class="pages-toggle-box">
                    <i class="bi bi-lightbulb-fill me-2"></i>
                    <div>
                      <strong>Consejo:</strong> Las variables como <code v-pre>{{nombre}}</code>, <code v-pre>{{empresa}}</code>, <code v-pre>{{email}}</code> se detectan automáticamente. Podés usarlas en el asunto y en el HTML.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PASO 2: HTML y Vista Previa -->
            <div v-show="currentStep === 1" class="pages-step-panel">
              <div class="card data-card pages-card">
                <div class="pages-card-head">
                  <i class="bi bi-code-slash"></i>
                  <span>HTML y Vista Previa</span>
                </div>
                <div class="pages-card-body">
                  <p class="step-description">Ingresá el código HTML o importá un archivo. La vista previa aparecerá en tiempo real a la derecha.</p>

                  <!-- Import + Buttons -->
                  <div class="mb-3 d-flex align-items-center gap-3 flex-wrap">
                    <label class="btn btn-outline btn-sm">
                      <i class="bi bi-upload me-1"></i>Importar .html
                      <input type="file" accept=".html,.htm" class="d-none" @change="importHtml" />
                    </label>
                    <button type="button" class="btn btn-outline btn-sm" @click="insertBaseTemplate">
                      <i class="bi bi-layout-text-window me-1"></i>Plantilla base
                    </button>
                  </div>

                  <!-- Variables detected -->
                  <div v-if="detectedVars.length" class="detected-vars mb-3">
                    <span style="font-size:0.85rem">📌 Variables detectadas:</span>
                    <span v-for="v in detectedVars" :key="v" class="variable-tag ms-1">{{varLabel(v)}}</span>
                  </div>

                  <!-- HTML Validation -->
                  <div v-if="step2Submitted && !form.html_content.trim()" class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    El HTML es requerido
                  </div>

                  <!-- Editor + Preview split -->
                  <div class="html-editor-container">
                    <div class="html-editor-pane">
                      <div class="pane-header"><i class="bi bi-code me-1"></i>Editor HTML</div>
                      <textarea
                        v-model="form.html_content"
                        class="html-textarea"
                        spellcheck="false"
                        @input="onHtmlInput"
                        placeholder="Pegá o escribí tu HTML aquí..."
                      ></textarea>
                    </div>
                    <div class="html-preview-pane">
                      <div class="pane-header"><i class="bi bi-eye me-1"></i>Vista previa</div>
                      <iframe
                        :srcdoc="form.html_content || previewPlaceholder"
                        sandbox=""
                        class="html-preview-frame"
                        title="preview"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PASO 3: Confirmación y Guardar -->
            <div v-show="currentStep === 2" class="pages-step-panel">
              <div class="card data-card pages-card">
                <div class="pages-card-head">
                  <i class="bi bi-check-circle"></i>
                  <span>Revisar y Guardar</span>
                </div>
                <div class="pages-card-body">
                  <p class="step-description">Revisá los datos del template antes de guardarlo. Una vez guardado, podrás usarlo en tus campañas de email.</p>

                  <!-- Summary -->
                  <div class="summary-section">
                    <div class="summary-item">
                      <span class="summary-label"><i class="bi bi-tag me-2"></i>Nombre:</span>
                      <span class="summary-value">{{ form.name }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label"><i class="bi bi-envelope me-2"></i>Asunto:</span>
                      <span class="summary-value">{{ form.subject }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label"><i class="bi bi-braces me-2"></i>Variables:</span>
                      <div class="summary-value">
                        <span v-if="detectedVars.length === 0" class="text-muted">Sin variables</span>
                        <span v-else>
                          <span v-for="v in detectedVars" :key="v" class="variable-tag ms-1">{{varLabel(v)}}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- HTML Preview Final -->
                  <div class="final-preview mt-4">
                    <div class="pane-header mb-2"><i class="bi bi-eye me-1"></i>Vista previa final</div>
                    <div class="preview-frame-final">
                      <iframe
                        :srcdoc="form.html_content"
                        sandbox=""
                        title="preview"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="pages-step-actions">
            <button v-if="currentStep > 0" type="button" class="btn btn-outline" @click="prevStep">
              <i class="bi bi-arrow-left me-2"></i>Anterior
            </button>
            <div v-else></div>
            <div class="pages-step-actions-right">
              <button v-if="currentStep < formSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
                Siguiente <i class="bi bi-arrow-right ms-2"></i>
              </button>
              <button v-else type="button" class="btn btn-primary" @click="saveTemplate" :disabled="saving">
                <span v-if="saving">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </span>
                <span v-else>
                  <i class="bi bi-floppy me-2"></i>
                  {{ editing ? 'Guardar cambios' : 'Crear template' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalComponent>

    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      ref="toastComponent"
    />
  </div>
</template>

<script>
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate as deleteTemplateSvc
} from '@/services/emailService';
import ToastComponent from '@/components/ToastComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';

export default {
  components: {
    ToastComponent,
    ModalComponent
  },
  data() {
    return {
      templates: [],
      loading: true,
      editing: null,
      currentStep: 0,
      step1Submitted: false,
      step2Submitted: false,
      saving: false,
      showDeleteConfirm: false,
      templateToDelete: null,
      toastTitle: '',
      toastMessage: '',
      isSuccess: false,
      maxTemplates: 15,
      detectedVars: [],
      form: {
        name: '',
        subject: '',
        html_content: ''
      },
      formSteps: [
        {
          key: 'basic',
          label: 'Datos Básicos',
          description: 'Nombre y asunto'
        },
        {
          key: 'html',
          label: 'HTML y Preview',
          description: 'Código y vista previa'
        },
        {
          key: 'review',
          label: 'Confirmación',
          description: 'Revisar y guardar'
        }
      ],
      baseEmailTemplate: `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;">

          <!-- HEADER -->
          <tr>
            <td align="center" bgcolor="#5c5ce6" style="padding:40px 30px;background-color:#5c5ce6;">
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;color:#ffffff;line-height:32px;">Título del email</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#555555;">
              <p style="margin:0 0 16px 0;">Hola <strong>{{nombre}}</strong>,</p>
              <p style="margin:0 0 16px 0;">Escribí aquí el contenido principal del email.</p>
              <p style="margin:0;">Saludos,<br><strong>{{empresa}}</strong></p>
            </td>
          </tr>

          <!-- CTA BUTTON (compatible Outlook via VML) -->
          <tr>
            <td align="center" style="padding:0 30px 30px 30px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="0%" stroke="f" fillcolor="#5c5ce6">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Llamada a la acción</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="#" style="background-color:#5c5ce6;color:#ffffff;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;line-height:44px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;">Llamada a la acción</a>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" bgcolor="#f8f9fa" style="padding:20px;background-color:#f8f9fa;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999999;">
              &copy; 2025 {{empresa}} &mdash; Todos los derechos reservados<br>
              <a href="#" style="color:#999999;text-decoration:underline;">Cancelar suscripción</a>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`,
      previewPlaceholder: '<p style="padding:20px;text-align:center;color:#999;">La vista previa aparecerá aquí...</p>'
    };
  },
  computed: {
    atLimit() {
      return this.templates.length >= this.maxTemplates;
    }
  },
  methods: {
    openCreate() {
      this.editing = null;
      this.currentStep = 0;
      this.form = { name: '', subject: '', html_content: '' };
      this.step1Submitted = false;
      this.step2Submitted = false;
      this.detectedVars = [];
      this.$refs.templateModal?.openModal();
    },
    openEdit(template) {
      this.editing = template;
      this.currentStep = 0;
      this.form = {
        name: template.name,
        subject: template.subject,
        html_content: template.html_content
      };
      this.detectVariables();
      this.$refs.templateModal?.openModal();
    },
    handleCloseModal() {
      this.editing = null;
      this.form = { name: '', subject: '', html_content: '' };
      this.detectedVars = [];
      this.currentStep = 0;
      this.step1Submitted = false;
      this.step2Submitted = false;
    },
    goToStep(index) {
      this.currentStep = index;
    },
    nextStep() {
      if (this.currentStep === 0) {
        this.step1Submitted = true;
        if (this.form.name.trim() && this.form.subject.trim()) {
          this.currentStep = 1;
          this.detectVariables();
        }
      } else if (this.currentStep === 1) {
        this.step2Submitted = true;
        if (this.form.html_content.trim()) {
          this.currentStep = 2;
        }
      }
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    },
    insertBaseTemplate() {
      this.form.html_content = this.baseEmailTemplate;
      this.detectVariables();
    },
    importHtml(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.form.html_content = evt.target?.result || '';
        this.detectVariables();
      };
      reader.readAsText(file);
    },
    onHtmlInput() {
      this.detectVariables();
    },
    detectVariables() {
      const regex = /\{\{(\w+)\}\}/g;
      const vars = new Set();
      let match;
      [this.form.name, this.form.subject, this.form.html_content].forEach(text => {
        regex.lastIndex = 0;
        while ((match = regex.exec(text)) !== null) {
          vars.add(match[1]);
        }
      });
      this.detectedVars = Array.from(vars).sort();
    },
    varLabel(v) {
      return `{{${v}}}`;
    },
    async loadTemplates() {
      this.loading = true;
      try {
        this.templates = await getTemplates();
      } catch (err) {
        this.showToast(err.message || 'Error al cargar templates', 'error');
      } finally {
        this.loading = false;
      }
      
    },
    showToast(message, type = 'success') {
      this.toastTitle = type === 'success' ? 'Éxito' : 'Error';
      this.toastMessage = message;
      this.isSuccess = type === 'success';
      this.$refs.toastComponent?.showToas?.();
    },
    async saveTemplate() {
      if (this.saving) return;
      if (!this.form.name.trim() || !this.form.subject.trim()) {
        this.step1Submitted = true;
        this.currentStep = 0;
        this.showToast('Completá nombre y asunto', 'error');
        return;
      }
      if (!this.form.html_content.trim()) {
        this.step2Submitted = true;
        this.currentStep = 1;
        this.showToast('El HTML no puede estar vacío', 'error');
        return;
      }

      this.saving = true;
      await this.$nextTick();
      try {
        if (this.editing) {
          await updateTemplate(this.editing.id, this.form);
        } else {
          await createTemplate(this.form);
        }
        this.showToast(this.editing ? 'Template actualizado correctamente' : 'Template creado correctamente');
        this.$refs.templateModal?.closeModal();
        await this.loadTemplates();
      } catch (err) {
        this.showToast(err.message || 'Error al guardar el template', 'error');
      } finally {
        this.saving = false;
      }
    },
    confirmDelete(template) {
      this.templateToDelete = template;
      this.showDeleteConfirm = true;
    },
    async deleteTemplate() {
      if (this.saving) return;
      const deletedTemplateId = this.templateToDelete?.id;
      this.saving = true;
      try {
        await deleteTemplateSvc(deletedTemplateId);
        this.templates = this.templates.filter(template => template.id !== deletedTemplateId);
        this.showToast('Template eliminado');
        this.showDeleteConfirm = false;
        await this.loadTemplates();
      } catch (err) {
        this.showToast(err.message || 'Error al eliminar el template', 'error');
      } finally {
        this.saving = false;
      }
    }
  },
  async mounted() {
    await this.loadTemplates();
  }
};
</script>

<style scoped>
.emails-module {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.emails-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.btn-add {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  border: none;
  white-space: nowrap;
}

.btn-add:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.limit-reached-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.88rem;
  flex: 1;
}

.limit-reached-banner a {
  color: #9a3412;
  font-weight: 600;
}

.header-divider {
  border-top: 1px solid #e5e7eb;
  margin: 1rem 0 2rem 0;
}

.tip-banner-style {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fcd34d;
}

.tip-banner-button {
  background: transparent;
  border: none;
}

.tip-banner-button:not(.collapsed) {
  background: transparent;
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  /* background: #fcd34d; */
  border-radius: 50%;
  /* color: #b45309; */
  /* font-size: 1.2rem; */
  flex-shrink: 0;
}

.tip-text {
  flex: 1;
  text-align: left;
}

.tip-expanded {
  background: #fffbeb;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.template-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.template-preview {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.template-preview iframe {
  /* width: 100%;
  height: 100%; */
  border: none;
}

.template-meta {
  padding: 1rem;
}

.template-meta h6 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subject {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.type-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.type-badge--custom {
  background-color: #ede9fe;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}

.type-badge--default {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.template-vars {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.var-chip {
  display: inline-block;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
}

/* ═══ MODAL STYLES (from PagesView) ═══ */
.pages-step-modal {
  height: 100%;
}

.pages-step-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1rem;
  gap: 1rem;
}

.pages-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  /* border-radius: 14px; */
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.pages-step-item {
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

.pages-step-item:last-child {
  border-right: 0;
}

.pages-step-item:hover:not(.active) {
  background: #f8f9fa;
}

.pages-step-item.active {
  background: #eff6ff;
}

.pages-step-item.done .pages-step-num,
.pages-step-item.active .pages-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.pages-step-num {
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

.pages-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pages-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.pages-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.pages-step-item.active .pages-step-copy span,
.pages-step-item.done .pages-step-copy span {
  color: #185fa5;
}

.pages-step-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
}

.pages-step-content::-webkit-scrollbar {
  width: 8px;
}

.pages-step-content::-webkit-scrollbar-track {
  background: transparent;
}

.pages-step-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.pages-step-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.pages-step-panel {
  min-height: 100%;
}

.pages-card {
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.pages-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
  color: #212529;
}

.pages-card-head i {
  color: #185fa5;
}

.pages-card-body {
  padding: 1.25rem;
  background: #fff;
}

.step-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.pages-toggle-box {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #fafbfc;
  display: flex;
  gap: 0.75rem;
}

.pages-toggle-box > div {
  display: block;
  flex-direction: initial;
  gap: 0;
}

.pages-toggle-box strong {
  color: #1f2937;
}

.pages-toggle-box code {
  display: inline;
  background: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.detected-vars {
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: #0369a1;
  font-size: 0.85rem;
}

.variable-tag {
  display: inline-block;
  background: white;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: monospace;
  margin-left: 0.5rem;
}

.html-editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  min-height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.html-editor-pane,
.html-preview-pane {
  display: flex;
  flex-direction: column;
  background: white;
}

.pane-header {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  color: #374151;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.html-textarea {
  flex: 1;
  border: none;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  resize: none;
  color: #1f2937;
  background: white;
}

.html-textarea:focus {
  outline: none;
  background: #fafbfc;
}

.html-preview-frame {
  flex: 1;
  border: none;
  width: 100%;
  height: 100%;
}

@media (max-width: 991px) {
  .html-editor-container {
    grid-template-columns: 1fr;
    min-height: 300px;
  }

  .html-preview-pane {
    min-height: 400px;
  }

  .pages-stepper {
    flex-direction: column;
  }

  .pages-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .pages-step-item:last-child {
    border-bottom: 0;
  }
}

.summary-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 1.5rem;
}

.summary-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(132, 204, 22, 0.3);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 700;
  color: #166534;
  min-width: 120px;
  display: flex;
  align-items: center;
}

.summary-value {
  color: #065f46;
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.final-preview {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.preview-frame-final {
  min-height: 400px;
  background: white;
}

.preview-frame-final iframe {
  width: 100%;
  height: 100vh;
  border: none;
}

.pages-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
  flex-shrink: 0;
}

.pages-step-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pages-step-actions .btn {
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* .btn-outline-secondary {
  border-color: #d1d5db;
  color: #4b5563;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
} */

@media (max-width: 767px) {
  .pages-step-actions,
  .pages-step-actions-right {
    flex-direction: column;
    align-items: stretch;
  }

  .pages-step-actions .btn,
  .pages-step-actions-right .btn {
    width: 100%;
  }
}
</style>
