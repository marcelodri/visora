<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <div>
        <h2>Logs del Sistema</h2>
        <p class="subtitle">Consulta de eventos del modulo de recompensas</p>
      </div>
      <button class="btn btn-primary btn-refresh" @click="fetchLogs" :disabled="isLoading">
        <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
      </button>
    </div>
    <hr class="header-divider" />

    <div class="alert alert-info-custom mb-4">
      <i class="bi bi-info-circle-fill me-2"></i>
      <div>
        Se muestran los ultimos <strong>100 logs</strong> disponibles. Hace click en una fila para inspeccionar
        el payload completo.
      </div>
    </div>

    <div class="row g-3 mb-4" v-if="logs.length">
      <div class="col-md-3 col-sm-6">
        <div class="stat-card-box">
          <div class="stat-card-icon bg-primary">
            <i class="bi bi-journal-richtext"></i>
          </div>
          <div class="stat-card-content">
            <div class="stat-card-value">{{ logs.length }}</div>
            <div class="stat-card-label">Registros Cargados</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stat-card-box">
          <div class="stat-card-icon bg-success">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="stat-card-content">
            <div class="stat-card-value">{{ uniqueUsersCount }}</div>
            <div class="stat-card-label">Usuarios</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stat-card-box">
          <div class="stat-card-icon bg-warning">
            <i class="bi bi-grid-fill"></i>
          </div>
          <div class="stat-card-content">
            <div class="stat-card-value">{{ uniqueModulesCount }}</div>
            <div class="stat-card-label">Modulos</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="stat-card-box">
          <div class="stat-card-icon bg-info">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="stat-card-content">
            <div class="stat-card-value stat-card-value-sm">{{ latestLogDateLabel }}</div>
            <div class="stat-card-label">Ultimo Evento</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card logs-card">
      <div class="card-header-custom">
        <i class="bi bi-journal-text me-2"></i>
        <span>Registros del sistema</span>
      </div>
      <div class="list-mode-header">
        <div class="list-mode-left">
          <div class="list-mode-badge">
            <i class="bi bi-filter-circle-fill"></i>
          </div>
          <div>
            <div class="list-mode-title">Ultimos 100 registros</div>
            <div class="list-mode-subtitle">
              {{ logs.length }} log{{ logs.length !== 1 ? "s" : "" }} disponibles para busqueda y filtro
            </div>
          </div>
        </div>
        <div class="last-sync-chip">
          <i class="bi bi-arrow-repeat me-1"></i>
          Ultima actualizacion: {{ formattedLastSync }}
        </div>
      </div>
      <div class="card-body p-0">
        <DataTableComponent
          :data="logs"
          :columns="columns"
          :clickableRows="true"
          :itemsPerPage="10"
          @row-click="viewLog"
        />
      </div>
    </div>

    <ModalComponent
      ref="detailModal"
      modalId="logsDetailModal"
      :modalTitle="modalTitle"
      class="modal-xl"
      @modalClosed="selectedLog = null"
    >
      <div v-if="selectedLog" class="modal-body log-detail p-4">
        <div class="detail-header-card mb-3">
          <div class="detail-header-left">
            <span class="detail-id"><i class="bi bi-hash me-1"></i>{{ selectedLog.id }}</span>
            <span class="detail-chip chip-user">
              <i class="bi bi-person-circle me-1"></i>{{ selectedLog.user_username || "-" }}
            </span>
          </div>
          <div class="detail-header-right">
            <span class="detail-chip chip-module">{{ selectedLog.module || "-" }}</span>
            <span class="detail-chip chip-event">{{ selectedLog.event || "-" }}</span>
            <span class="detail-chip chip-action">{{ selectedLog.action || "-" }}</span>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Fecha</span>
            <span class="detail-value">{{ formatDateTime(selectedLog.created_dt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Usuario</span>
            <span class="detail-value">{{ selectedLog.user_username || "-" }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">User ID</span>
            <span class="detail-value">{{ selectedLog.user_id ?? "-" }}</span>
          </div>
        </div>

        <div class="payload-card mt-3">
          <div class="payload-title">
            <i class="bi bi-code-slash me-2"></i>Payload
          </div>
          <pre class="payload-content">{{ formattedPayload }}</pre>
        </div>
      </div>

      <div class="modal-footer text-end mt-3">
        <button class="btn btn-secondary" @click="closeDetailModal">
          <i class="bi bi-x-circle me-1"></i>Cerrar
        </button>
      </div>
    </ModalComponent>

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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';

export default {
  name: 'LogsView',
  components: {
    DataTableComponent,
    ModalComponent,
    ToastComponent
  },
  setup() {
    const URL_API_LOGS = 'https://apis.madautomate.cloud/webhook/5e8136e8-8512-494f-b1c1-24f0e77adfaa';
    const token = ref(sessionStorage.getItem('token'));

    const logs = ref([]);
    const isLoading = ref(false);
    const selectedLog = ref(null);
    const lastSyncAt = ref(null);
    const detailModal = ref(null);
    const toastComponent = ref(null);

    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    const showToastFlag = ref(false);

    const modalTitle = computed(() => {
      if (!selectedLog.value) return 'Detalle de log';
      return `Detalle de log #${selectedLog.value.id}`;
    });

    const uniqueUsersCount = computed(() => {
      const users = logs.value
        .map((log) => log.user_username)
        .filter((user) => user && user !== '-');
      return new Set(users).size;
    });

    const uniqueModulesCount = computed(() => {
      const modules = logs.value
        .map((log) => log.module)
        .filter((module) => module && module !== '-');
      return new Set(modules).size;
    });

    const latestLogDateLabel = computed(() => {
      if (!logs.value.length) return '-';
      return formatDateShort(logs.value[0].created_dt);
    });

    const formattedLastSync = computed(() => {
      if (!lastSyncAt.value) return '-';
      return lastSyncAt.value.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    function escapeHtml(value) {
      const htmlMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return String(value ?? '').replace(/[&<>"']/g, (char) => htmlMap[char]);
    }

    function truncateText(value, max = 90) {
      const text = String(value ?? '').replace(/\s+/g, ' ').trim();
      if (text.length <= max) return text;
      return `${text.slice(0, max)}...`;
    }

    function parsePayload(payload) {
      if (payload === null || payload === undefined) return null;

      if (typeof payload === 'object') return payload;

      const text = String(payload).trim();
      if (!text) return null;

      try {
        return JSON.parse(text);
      } catch (error) {
        return null;
      }
    }

    function getPayloadText(payload, parsedPayload) {
      if (parsedPayload && typeof parsedPayload === 'object') {
        try {
          return JSON.stringify(parsedPayload);
        } catch (error) {
          return String(payload ?? '');
        }
      }
      return String(payload ?? '');
    }

    function getTimestamp(dateValue) {
      if (!dateValue) return 0;
      const normalized = String(dateValue).replace(' ', 'T');
      const timestamp = new Date(normalized).getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    function normalizeLog(item, index) {
      const parsedPayload = parsePayload(item.payload);
      const payloadText = getPayloadText(item.payload, parsedPayload);

      return {
        ...item,
        id: item.id ?? index + 1,
        user_username: item.user_username || '-',
        module: item.module || '-',
        event: item.event || '-',
        action: item.action || '-',
        instance: item.instance || '-',
        created_dt: item.created_dt || item.created_at || '',
        payload_parsed: parsedPayload,
        payload_text: payloadText,
        payload_preview: truncateText(payloadText)
      };
    }

    function parseResponseList(data) {
      const raw = data?.data ?? data;

      if (Array.isArray(raw)) return raw;

      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }

      if (raw && Array.isArray(raw.logs)) return raw.logs;

      return [];
    }

    function formatDateTime(value) {
      if (!value) return '-';
      const normalized = String(value).replace(' ', 'T');
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    function formatDateShort(value) {
      if (!value) return '-';
      const normalized = String(value).replace(' ', 'T');
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }

    function renderTag(value, className) {
      const raw = String(value ?? '-');
      const short = truncateText(raw, 24);
      return `<span class="tag-chip ${className}" title="${escapeHtml(raw)}">${escapeHtml(short)}</span>`;
    }

    const columns = [
      {
        label: 'Fecha',
        key: 'created_dt',
        render: (row) => `<span class="date-cell">${escapeHtml(formatDateTime(row.created_dt))}</span>`
      },
      {
        label: 'Payload',
        key: 'payload_preview',
        render: (row) =>
          `<span class="payload-preview" title="${escapeHtml(row.payload_text)}">${escapeHtml(row.payload_preview)}</span>`
      },
      {
        label: 'Usuario',
        key: 'user_username',
        render: (row) =>
          `<span class="user-cell"><i class="bi bi-person-circle me-1"></i>${escapeHtml(row.user_username)}</span>`
      },
      {
        label: 'Modulo',
        key: 'module',
        render: (row) => renderTag(row.module, 'tag-module')
      },
      {
        label: 'Evento',
        key: 'event',
        render: (row) => renderTag(row.event, 'tag-event')
      },
      {
        label: 'Accion',
        key: 'action',
        render: (row) => renderTag(row.action, 'tag-action')
      }
    ];

    const formattedPayload = computed(() => {
      if (!selectedLog.value) return '';

      const parsed = selectedLog.value.payload_parsed;
      if (parsed && typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2);
      }

      const raw = selectedLog.value.payload_text || selectedLog.value.payload || '';
      return raw || 'Sin payload';
    });

    function showToast(title, message, success) {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    }

    function viewLog(row) {
      selectedLog.value = row;
      detailModal.value.openModal();
    }

    function closeDetailModal() {
      detailModal.value.closeModal();
      selectedLog.value = null;
    }

    async function fetchLogs() {
      isLoading.value = true;
      try {
        const headers = {};
        if (token.value) {
          headers.Authorization = `Bearer ${token.value}`;
        }

        const response = await axios.get(URL_API_LOGS, { headers });
        const list = parseResponseList(response.data);

        logs.value = list
          .map((item, index) => normalizeLog(item, index))
          .sort((a, b) => {
            const diff = getTimestamp(b.created_dt) - getTimestamp(a.created_dt);
            if (diff !== 0) return diff;
            return Number(b.id) - Number(a.id);
          })
          .slice(0, 100);

        lastSyncAt.value = new Date();
      } catch (error) {
        console.error('Error al cargar logs:', error);
        showToast(
          'Error',
          `No se pudieron cargar los logs: ${error.response?.data?.message || error.message}`,
          false
        );
      } finally {
        isLoading.value = false;
      }
    }

    onMounted(fetchLogs);

    return {
      logs,
      columns,
      isLoading,
      selectedLog,
      detailModal,
      modalTitle,
      formattedPayload,
      uniqueUsersCount,
      uniqueModulesCount,
      latestLogDateLabel,
      formattedLastSync,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      toastComponent,
      fetchLogs,
      viewLog,
      closeDetailModal,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-section h2 {
  margin: 0;
  color: #1f2937;
  font-weight: 700;
}

.subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
}

.alert-info-custom {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: flex-start;
  color: #1e40af;
}

.stat-card-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 1.1rem 1.2rem;
  height: 100%;
}

.stat-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #fff;
  flex-shrink: 0;
}

.stat-card-icon.bg-primary {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%) !important;
}

.stat-card-icon.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

.stat-card-icon.bg-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
}

.stat-card-icon.bg-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
}

.stat-card-content {
  min-width: 0;
}

.stat-card-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.1;
}

.stat-card-value-sm {
  font-size: 1.05rem;
}

.stat-card-label {
  font-size: 0.76rem;
  color: #6b7280;
  font-weight: 600;
  margin-top: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.logs-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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

.list-mode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #f3f4f6;
  background: #fafafa;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.list-mode-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.list-mode-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #3939ff;
  background: rgba(57, 57, 255, 0.1);
  flex-shrink: 0;
}

.list-mode-title {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.97rem;
  line-height: 1.2;
}

.list-mode-subtitle {
  font-size: 0.79rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.last-sync-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.76rem;
  color: #4b5563;
  font-weight: 700;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
}

:deep(.id-cell) {
  font-weight: 700;
  color: #1f2937;
}

:deep(.date-cell) {
  white-space: nowrap;
  color: #374151;
}

:deep(.user-cell) {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

:deep(.tag-chip) {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  border: 1px solid transparent;
  white-space: nowrap;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

:deep(.tag-module) {
  background: #ede9fe;
  color: #5b21b6;
  border-color: #ddd6fe;
}

:deep(.tag-event) {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

:deep(.tag-action) {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

:deep(.payload-preview) {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: #374151;
  display: inline-block;
  max-width: 360px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-detail {
  padding: 0.25rem 0;
}

.detail-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 1rem 1.1rem;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detail-header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.detail-header-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.detail-id {
  font-weight: 800;
  font-size: 1rem;
  color: #1e3a8a;
  font-family: 'Courier New', monospace;
}

.detail-chip {
  display: inline-block;
  border-radius: 999px;
  padding: 0.26rem 0.7rem;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  white-space: nowrap;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-user {
  background: #e0e7ff;
  color: #3730a3;
}

.chip-module {
  background: #ede9fe;
  color: #6d28d9;
}

.chip-event {
  background: #dbeafe;
  color: #1d4ed8;
}

.chip-action {
  background: #dcfce7;
  color: #166534;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  background: #fafafa;
}

.detail-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.detail-value {
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 600;
  word-break: break-word;
}

.payload-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.payload-title {
  background: #f3f4f6;
  color: #1f2937;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  border-bottom: 1px solid #e5e7eb;
}

.payload-content {
  margin: 0;
  padding: 1rem;
  max-height: 420px;
  overflow: auto;
  background: #111827;
  color: #e5e7eb;
  font-size: 0.78rem;
  line-height: 1.45;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .detail-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-header-right {
    width: 100%;
  }

  .stat-card-value-sm {
    font-size: 0.92rem;
  }
}
</style>
