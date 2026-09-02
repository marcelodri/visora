<template>
  <div class="container-fluid emails-module mt-4">
    <div class="emails-header mb-4">
      <div>
        <h2>Campañas de Email</h2>
        <p class="text-muted mb-0" style="font-size:0.9rem">Creá y gestioná tus campañas de envío masivo</p>
      </div>
      <button v-if="!loading && !atLimit" class="btn btn-add" @click="openBuilderModal">
        <i class="bi bi-plus-circle me-2"></i>Nueva Campaña
      </button>
      <div v-if="!loading && atLimit" class="limit-reached-banner">
        <i class="bi bi-lock-fill me-2"></i>
        Alcanzaste el límite de <strong>{{ maxCampaigns }}</strong> campañas. Para aumentar tu plan contactá a
        <a href="mailto:team@madcoder.io">team@madcoder.io</a>
      </div>
    </div>
    <hr class="header-divider">

    <div class="accordion-item tip-banner-style mb-4">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed tip-banner-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseEmailTip"
        >
          <div class="tip-icon"><i class="bi bi-lightbulb-fill"></i></div>
          <div class="tip-text">
            <strong>Tips para crear una campaña exitosa</strong> — Destinatarios, variables, programación y más.
          </div>
        </button>
      </h2>
      <div id="collapseEmailTip" class="accordion-collapse collapse">
        <div class="accordion-body tip-expanded">
          <div class="row g-4">
            <div class="col-12 col-md-3">
              <div class="d-flex gap-3 align-items-start">
                <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-people"></i></div>
                <div>
                  <strong style="font-size:0.9rem">Dos fuentes de destinatarios</strong>
                  <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                    Podés elegir contactos directamente desde tu <strong>base de datos</strong> (con búsqueda y selección múltiple) o <strong>importar un Excel/CSV</strong> con cualquier estructura. Ambas opciones soportan variables personalizadas por destinatario.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="d-flex gap-3 align-items-start">
                <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-table"></i></div>
                <div>
                  <strong style="font-size:0.9rem">Mapeo de columnas Excel</strong>
                  <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                    Si importás un Excel, el asistente detecta las columnas y te deja asignar cada variable del template a la columna que corresponde. El campo <strong>email</strong> siempre es obligatorio. Los demás son opcionales si el template no tiene variables.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="d-flex gap-3 align-items-start">
                <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-calendar-check"></i></div>
                <div>
                  <strong style="font-size:0.9rem">Programación flexible</strong>
                  <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                    Tres modos de envío: <strong>ahora</strong> (inmediato), <strong>una vez</strong> (fecha y hora exacta) o <strong>recurrente</strong> (cada N meses, en un día y hora fijos). La próxima fecha de envío recurrente se calcula automáticamente.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="d-flex gap-3 align-items-start">
                <div style="font-size:1.6rem;color:#667eea;flex-shrink:0"><i class="bi bi-eye"></i></div>
                <div>
                  <strong style="font-size:0.9rem">Vista previa personalizada</strong>
                  <p class="text-muted mb-0 mt-1" style="font-size:0.83rem">
                    En el paso de revisión, la vista previa renderiza el email con los datos reales del <strong>primer destinatario</strong> de la lista. Así podés confirmar que las variables se están reemplazando correctamente antes de enviar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <template v-else>
      <!-- EMPTY -->
      <div v-if="!campaigns.length" class="text-center py-5 mt-5">
        <i class="bi bi-megaphone" style="font-size:3rem;color:#dee2e6"></i>
        <p class="text-muted mt-3">No tenés campañas aún.</p>
        <!-- <button class="btn btn-add mt-2" @click="openBuilderModal">
          <i class="bi bi-plus-circle me-2"></i>Crear primera campaña
        </button> -->
      </div>

      <!-- TABLE -->
      <div v-else class="card data-card">
        <div class="card-body p-0">
          <DataTableComponent
            :data="campaigns"
            :columns="columns"
            :actions="resultActions"
            :items-per-page="10"
          />
        </div>
      </div>
    </template>

    <ModalComponent
      ref="campaignBuilderModal"
      modalId="campaignBuilderModal"
      modalTitle="Nueva Campaña"
      dialogClass="modal-fullscreen-fixed"
      @modalClosed="handleBuilderModalClosed"
    >
      <CampaignBuilderView
        v-if="showBuilderModal"
        is-modal
        @close="closeBuilderModal"
        @campaign-created="handleCampaignCreated"
      />
    </ModalComponent>

    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      ref="toastComponent"
    />

    <ConfirmPopup
      ref="confirmPopup"
      title="¿Eliminar campaña?"
      :question="campaignToDelete ? `La campaña '${campaignToDelete.name}' será eliminada permanentemente.` : '¿Confirmar?'"
      @response="handleResponse"
    />
  </div>
</template>

<script>
import { getCampaigns, deleteCampaign as deleteCampaignSvc, updateCampaignStatus } from '@/services/emailService';
import { useAuthStore } from '@/stores/auth';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import CampaignBuilderView from '@/views/panel/emails/CampaignBuilderView.vue';
import '@/assets/styles/emails.css';

export default {
  name: 'EmailCampaignsView',
  components: { DataTableComponent, ToastComponent, ConfirmPopup, ModalComponent, CampaignBuilderView },
  data() {
    return {
      loading: true,
      deleting: false,
      showBuilderModal: false,
      campaigns: [],
      campaignToDelete: null,
      actionToExecute: null,
      maxCampaigns: null,
      toastTitle: '',
      toastMessage: '',
      isSuccess: true,
      columns: [
        {
          label: 'Nombre',
          key: 'name',
          render: (row) => `<div class="fw-semibold">${row.name}</div>${row.description ? `<div class="text-muted" style="font-size:0.8rem">${row.description}</div>` : ''}`
        },
        {
          label: 'Template',
          key: 'template_name',
          render: (row) => row.template_name
            ? `<span><i class="bi bi-file-earmark-code me-1 text-primary"></i>${row.template_name}</span>`
            : '<span class="text-muted">—</span>'
        },
        {
          label: 'Fuente',
          key: 'source_type',
          render: (row) => row.source_type === 'db'
            ? '<span class="badge bg-light text-dark border"><i class="bi bi-database me-1"></i>Base de datos</span>'
            : row.source_type === 'excel'
              ? '<span class="badge bg-light text-dark border"><i class="bi bi-file-earmark-excel me-1"></i>Excel</span>'
              : '<span class="badge bg-light text-dark border"><i class="bi bi-database me-1"></i>Vista</span>'
        },
        {
          label: 'Estado',
          key: 'status',
          render: (row) => {
            const map = { draft:'Borrador', scheduled:'Programada', sending:'Enviando', sent:'Enviada', closed:'Cerrada' };
            const icons = { draft:'bi-pencil', scheduled:'bi-clock', sending:'bi-send', sent:'bi-check-circle-fill', closed:'bi-lock-fill' };
            return `<span class="status-badge badge-${row.status}">${map[row.status] || row.status}</span>`;
          }
        },
        {
          label: 'Tipo envío',
          key: 'delivery_mode',
          render: (row) => this.renderDeliveryMode(row)
        },
        {
          label: 'Activa',
          key: 'is_active',
          action: (row) => this.toggleActive(row),
          actionTitle: 'Activar / Desactivar campaña',
          render: (row) => this.renderActiveSwitch(row)
        },
        {
          label: 'Fecha envío',
          key: 'sent_at',
          render: (row) => this.renderCampaignDate(row)
        }
      ],
      resultActions: [
        {
          label: 'Eliminar',
          class: 'btn btn-danger btn-sm',
          icon: '<i class="bi bi-trash-fill"></i>',
          method: (row) => this.confirmDelete(row)
        }
      ]
    };
  },
  computed: {
    atLimit() {
      return this.maxCampaigns !== null && this.campaigns.length >= this.maxCampaigns;
    }
  },
  async mounted() {
    await this.loadCampaigns();
  },
  methods: {
    parseSchedule(row) {
      if (!row?.schedule) return null;
      if (typeof row.schedule === 'object') return row.schedule;
      if (typeof row.schedule !== 'string') return null;
      try {
        return JSON.parse(row.schedule);
      } catch {
        return null;
      }
    },
    getDeliveryMode(row) {
      const schedule = this.parseSchedule(row);
      if (row?.delivery_mode) return row.delivery_mode;
      if (schedule?.type === 'daily') return 'daily';
      if (schedule?.type === 'recurring') return 'recurring';
      if (row?.scheduled_at || schedule?.type === 'once') return 'once';
      return 'now';
    },
    getScheduledAt(row) {
      const schedule = this.parseSchedule(row);
      return row?.scheduled_at || schedule?.next_run_at || schedule?.scheduled_at || schedule?.next_run || null;
    },
    renderDeliveryMode(row) {
      const mode = this.getDeliveryMode(row);
      const labels = {
        now: 'Enviar ahora',
        once: 'Programada',
        recurring: 'Recurrente',
        daily: 'Diario'
      };
      const icons = {
        now: 'bi-send-fill',
        once: 'bi-calendar-check',
        recurring: 'bi-arrow-repeat',
        daily: 'bi-calendar2-range'
      };
      return `<span class="badge bg-light text-dark border"><i class="bi ${icons[mode] || 'bi-circle'} me-1"></i>${labels[mode] || mode}</span>`;
    },
    isCampaignActive(row) {
      return row?.is_active !== false;
    },
    renderActiveSwitch(row) {
      const mode = this.getDeliveryMode(row);
      if (mode !== 'recurring' && mode !== 'daily') {
        return '<span class="text-muted">—</span>';
      }
      const active = this.isCampaignActive(row);
      return `
        <div class="form-check form-switch mb-0" style="pointer-events:none">
          <input class="form-check-input" type="checkbox" ${active ? 'checked' : ''} readonly>
          <label class="form-check-label small ${active ? 'text-success' : 'text-muted'}">${active ? 'Activa' : 'Desactivada'}</label>
        </div>
      `;
    },
    renderCampaignDate(row) {
      const mode = this.getDeliveryMode(row);
      const scheduledAt = this.getScheduledAt(row);
      if ((mode === 'recurring' || mode === 'daily') && scheduledAt) {
        return `<i class="bi bi-arrow-repeat me-1"></i>${this.formatDate(scheduledAt)}`;
      }
      if (scheduledAt) {
        return `<i class="bi bi-clock me-1"></i>${this.formatDate(scheduledAt)}`;
      }
      if (row?.sent_at) {
        return this.formatDate(row.sent_at);
      }
      return '<span class="text-muted">—</span>';
    },
    async loadCampaigns() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
        const d = details.find(d => d.key === 'limit_campaign_emails');
        this.maxCampaigns = d !== undefined ? Number(d.value) : null;
        this.campaigns = await getCampaigns();
      } finally {
        this.loading = false;
      }
    },
    openBuilderModal() {
      this.showBuilderModal = true;
      this.$nextTick(() => {
        this.$refs.campaignBuilderModal.openModal();
      });
    },
    closeBuilderModal() {
      this.$refs.campaignBuilderModal.closeModal();
    },
    handleBuilderModalClosed() {
      this.showBuilderModal = false;
    },
    async handleCampaignCreated() {
      await this.loadCampaigns();
    },
    confirmDelete(c) {
      this.campaignToDelete = c;
      this.actionToExecute = 'delete';
      this.$refs.confirmPopup.showConfirmPopup();
    },
    handleResponse(isConfirmed) {
      if (!isConfirmed) return;
      if (this.actionToExecute === 'delete') {
        this.deleteCampaign();
      }
      this.actionToExecute = null;
    },
    async deleteCampaign() {
      this.deleting = true;
      try {
        await deleteCampaignSvc(this.campaignToDelete.campana_GUID);
        this.triggerToast('Realizado!', 'Campaña eliminada correctamente', true);
        await this.loadCampaigns();
      } catch (err) {
        this.triggerToast('Error', err.message || 'No se pudo eliminar la campaña', false);
      } finally {
        this.deleting = false;
        this.campaignToDelete = null;
      }
    },
    async toggleActive(row) {
      const mode = this.getDeliveryMode(row);
      if (mode !== 'recurring' && mode !== 'daily') return;
      const newStatus = !this.isCampaignActive(row);
      try {
        await updateCampaignStatus(row.campana_GUID, newStatus);
        row.is_active = newStatus;
        this.triggerToast('Realizado!', `Campaña ${newStatus ? 'activada' : 'desactivada'} correctamente`, true);
      } catch (err) {
        this.triggerToast('Error', err.message || 'No se pudo actualizar el estado de la campaña', false);
      }
    },
    formatDate(d) {
      if (!d) return '';
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return String(d);
      return date.toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    },
    triggerToast(title, message, success) {
      this.toastTitle = title;
      this.toastMessage = message;
      this.isSuccess = success;
      this.$refs.toastComponent.showToas();
    }
  }
};
</script>
