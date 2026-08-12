<template>
  <div class="container-fluid emails-module mt-4">
    <div class="emails-header mb-4">
      <div>
        <h2>Templates de Email</h2>
        <p class="text-muted mb-0" style="font-size:0.9rem">Diseñá y gestioná tus plantillas de email con variables dinámicas</p>
      </div>
      <button v-if="!loading && !atLimit" class="btn btn-add" @click="openCreate">
        <i class="bi bi-plus-circle me-2"></i>Nuevo Template
      </button>
      <div v-if="!loading && atLimit" class="limit-reached-banner">
        <i class="bi bi-lock-fill me-2"></i>
        Alcanzaste el límite de <strong>{{ maxTemplates }}</strong> templates. Para aumentar tu plan contactá a
        <a href="mailto:team@madcoder.io">team@madcoder.io</a>
      </div>
    </div>
    <hr class="header-divider">

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    
    <template v-else>
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
                      Insertá <code>{{nombre}}</code>, <code>{{empresa}}</code>, <code>{{email}}</code> o cualquier clave personalizada en el HTML. El sistema las detecta solas y las muestra al armar la campaña para que las mapees a tus columnas de datos.
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
                      El campo <em>Asunto</em> también acepta variables. Por ejemplo: <code>Hola {{nombre}}, novedades de {{empresa}}</code>. Personalizar el asunto mejora notablemente la tasa de apertura del email.
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
        <!-- ADD NEW card -->
        <!-- <div class="template-card d-flex flex-column align-items-center justify-content-center new-template" style="min-height:240px;border-style:dashed;" @click="openCreate">
          <i class="bi bi-plus-circle" style="font-size:2.5rem;color:#adb5bd"></i>
          <p class="text-muted mt-2 mb-0" style="font-size:0.88rem">Nuevo template</p>
        </div> -->

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
    </template>

    <!-- ═══ MODAL CREATE / EDIT ═══ -->
    <ModalComponent
      ref="templateModal"
      modalId="templateModal"
      :modalTitle="editing ? 'Editar Template' : 'Nuevo Template'"
      dialogClass="modal-fullscreen-fixed"
      @modalClosed="handleTemplateModalClosed"
    >
      <div class="p-4">
        <div class="row g-3 mb-3">
          <!-- Name -->
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold"><i class="bi bi-tag me-1"></i>Nombre del template *</label>
            <input v-model="form.name" type="text" class="form-control" placeholder="Ej: Bienvenida a nuevos clientes" />
          </div>
          <!-- Subject -->
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold"><i class="bi bi-envelope me-1"></i>Asunto del email *</label>
            <input v-model="form.subject" type="text" class="form-control" placeholder="Ej: Bienvenido/a, {{nombre}}!" />
          </div>
        </div>

        <!-- Import HTML -->
        <div class="mb-3 d-flex align-items-center gap-3 flex-wrap">
          <label class="form-label fw-semibold mb-0"><i class="bi bi-code-slash me-1"></i>HTML</label>
          <label class="btn btn-outline">
            <i class="bi bi-upload me-1"></i>Importar .html
            <input type="file" accept=".html,.htm" class="d-none" @change="importHtml" />
          </label>
          <button type="button" class="btn btn-outline" @click="insertBaseTemplate">
            <i class="bi bi-layout-text-window me-1"></i>Plantilla base
          </button>
          <span class="text-muted" style="font-size:0.8rem">Usá <code>&#123;&#123;variable&#125;&#125;</code> para datos dinámicos</span>
        </div>

        <!-- Variables detected -->
        <div v-if="detectedVars.length" class="mb-3">
          <span class="text-muted" style="font-size:0.82rem">Variables detectadas:</span>
          <span v-for="v in detectedVars" :key="v" class="variable-tag ms-1" v-text="varLabel(v)"></span>
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
      <div class="modal-footer">
        <button class="btn btn-outline" :disabled="saving || !canSave" @click="saveTemplate">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-check-circle me-2"></i>
          {{ editing ? 'Guardar cambios' : 'Crear template' }}
        </button>
      </div>
    </ModalComponent>

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
  deleteTemplate as deleteTemplateSvc,
  extractVariables
} from '@/services/emailService';
import { useAuthStore } from '@/stores/auth';
import ToastComponent from '@/components/ToastComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import '@/assets/styles/emails.css';

export default {
  name: 'EmailTemplatesView',
  components: { ToastComponent, ModalComponent },
  data() {
    return {
      loading: true,
      saving: false,
      templates: [],
      maxTemplates: null,
      showDeleteConfirm: false,
      editing: null,
      templateToDelete: null,
      form: { name: '', subject: '', html_content: '' },
      detectedVars: [],
      toastTitle: '',
      toastMessage: '',
      isSuccess: true,
      previewPlaceholder: '<p style="color:#adb5bd;text-align:center;margin-top:60px">El preview aparecerá aquí</p>'
    };
  },
  computed: {
    canSave() {
      return !!this.form.name.trim() && !!this.form.subject.trim() && !!this.form.html_content.trim();
    },
    atLimit() {
      return this.maxTemplates !== null && this.templates.length >= this.maxTemplates;
    }
  },
  async mounted() {
    await this.loadTemplates();
  },
  methods: {
    async loadTemplates() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
        const d = details.find(d => d.key === 'limit_template_emails');
        this.maxTemplates = d !== undefined ? Number(d.value) : null;
        this.templates = await getTemplates();
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.editing = null;
      this.form = { name: '', subject: '', html_content: '' };
      this.detectedVars = [];
      this.$nextTick(() => {
        this.$refs.templateModal.openModal();
      });
    },
    openEdit(tmpl) {
      this.editing = tmpl;
      this.form = { name: tmpl.name, subject: tmpl.subject, html_content: tmpl.html_content };
      this.detectedVars = extractVariables(tmpl.html_content);
      this.$nextTick(() => {
        this.$refs.templateModal.openModal();
      });
    },
    handleTemplateModalClosed() {
      this.editing = null;
      this.form = { name: '', subject: '', html_content: '' };
      this.detectedVars = [];
    },
    onHtmlInput() {
      this.detectedVars = extractVariables(this.form.html_content);
      console.log('onHtmlInput', this.detectedVars);
    },
    importHtml(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        this.form.html_content = ev.target.result;
        this.detectedVars = extractVariables(this.form.html_content);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    async saveTemplate() {
      if (!this.form.name.trim() || !this.form.subject.trim()) {
        this.showToast('Completá nombre y asunto', 'error');
        return;
      }
      if (!this.form.html_content.trim()) {
        this.showToast('El HTML no puede estar vacío', 'error');
        return;
      }
      this.saving = true;
      try {
        if (this.editing) {
          await updateTemplate(this.editing.id, this.form);
          this.showToast('Template actualizado correctamente');
        } else {
          await createTemplate(this.form);
          this.showToast('Template creado correctamente');
        }
        this.$refs.templateModal.closeModal();
        await this.loadTemplates();
      } catch (err) {
        this.showToast(err.message || 'Error al guardar', 'error');
      } finally {
        this.saving = false;
      }
    },
    confirmDelete(tmpl) {
      this.templateToDelete = tmpl;
      this.showDeleteConfirm = true;
    },
    async deleteTemplate() {
      this.saving = true;
      try {
        await deleteTemplateSvc(this.templateToDelete.id);
        this.showToast('Template eliminado');
        this.showDeleteConfirm = false;
        await this.loadTemplates();
      } catch (err) {
        this.showToast(err.message || 'Error al eliminar', 'error');
      } finally {
        this.saving = false;
      }
    },
    showToast(message, type = 'success') {
      this.toastTitle = type === 'success' ? 'Realizado!' : 'Error';
      this.toastMessage = message;
      this.isSuccess = type === 'success';
      this.$refs.toastComponent.showToas();
    },
    varLabel(v) {
      return '{{' + v + '}}';
    },
    insertBaseTemplate() {
      this.form.html_content = this.getBaseTemplateHtml();
      this.detectedVars = extractVariables(this.form.html_content);
    },
    getBaseTemplateHtml() {
      return `<!DOCTYPE html>
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
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;color:#ffffff;line-height:32px;">T\u00edtulo del email</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#555555;">
              <p style="margin:0 0 16px 0;">Hola <strong>{{nombre}}</strong>,</p>
              <p style="margin:0 0 16px 0;">Escrib\u00ed aqu\u00ed el contenido principal del email.</p>
              <p style="margin:0;">Saludos,<br><strong>{{empresa}}</strong></p>
            </td>
          </tr>

          <!-- CTA BUTTON (compatible Outlook via VML) -->
          <tr>
            <td align="center" style="padding:0 30px 30px 30px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="0%" stroke="f" fillcolor="#5c5ce6">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Llamada a la acci\u00f3n</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="#" style="background-color:#5c5ce6;color:#ffffff;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;line-height:44px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;">Llamada a la acci\u00f3n</a>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" bgcolor="#f8f9fa" style="padding:20px;background-color:#f8f9fa;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999999;">
              &copy; 2025 {{empresa}} &mdash; Todos los derechos reservados<br>
              <a href="#" style="color:#999999;text-decoration:underline;">Cancelar suscripci\u00f3n</a>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
    }
  }
};
</script>

<style>


.template-card {
  cursor: inherit;
}
.new-template {
    cursor: pointer;
}
.template-card:hover {
  border-color: transparent;
  transform: translateY(0px);
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

.limit-reached-banner {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.88rem;
}
.limit-reached-banner a {
  color: #9a3412;
  font-weight: 600;
}
</style>