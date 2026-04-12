<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <div>
        <h2>Listado de Ingestas</h2>
        <p class="subtitle">Consultá y gestioná las importaciones de ventas realizadas</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-refresh" @click="fetchBatches" :disabled="isLoading">
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
        <button class="btn btn-danger btn-refresh" @click="confirmDeleteAll" :disabled="isLoading">
          <i class="bi bi-trash3 me-2"></i>Reiniciar todos los puntos
        </button>
      </div>
    </div>
    <hr class="header-divider">

    <!-- Stats -->
    <div class="stats-row mb-4" v-if="batches.length">
      <div class="stat-card">
        <div class="stat-icon bg-primary-subtle text-primary"><i class="bi bi-box-seam-fill"></i></div>
        <div>
          <div class="stat-value">{{ batches.length }}</div>
          <div class="stat-label">Ingestas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-info-subtle text-info"><i class="bi bi-bag-check-fill"></i></div>
        <div>
          <div class="stat-value">{{ formatNumber(totalVentas) }}</div>
          <div class="stat-label">Ventas totales</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-success-subtle text-success"><i class="bi bi-cash-stack"></i></div>
        <div>
          <div class="stat-value">{{ formatCurrency(totalFacturado) }}</div>
          <div class="stat-label">Total facturado</div>
        </div>
      </div>
    </div>

    <!-- DataTable de batches -->
    <div class="card sales-card">
      <div class="card-header-custom">
        <i class="bi bi-table me-2"></i>
        <span>Importaciones registradas</span>
      </div>
      <div class="card-body p-3">
        <DataTableComponent
          v-if="batches.length > 0"
          :data="batches"
          :columns="columns"
          :actions="tableActions"
          :itemsPerPage="15"
        />
        <div v-else-if="!isLoading" class="text-center py-5 text-muted">
          <i class="bi bi-inbox display-3"></i>
          <p class="mt-3">No hay ingestas registradas</p>
        </div>
      </div>
    </div>

    <!-- Detail Modal: ventas del batch -->
    <ModalComponent
      ref="detailModal"
      modalId="batchDetailModal"
      modalTitle="Detalle de Ingesta"
      class="modal-xxl"
    >
      <div v-if="selectedBatch">
        <!-- Batch header -->
        <div class="detail-header-card mb-3">
          <div class="detail-header-left">
            <span class="detail-id"><i class="bi bi-hash me-1"></i>{{ selectedBatch.batch_id }}</span>
          </div>
          <div class="detail-header-right">
            <span class="detail-badge badge-ventas">
              <i class="bi bi-bag-check me-1"></i>{{ selectedBatch.total_ventas }} ventas
            </span>
            <span class="detail-badge badge-total">
              <i class="bi bi-cash-stack me-1"></i>{{ formatCurrency(selectedBatch.total_facturado) }}
            </span>
          </div>
        </div>

        <!-- Tabla de ventas individuales -->
        <div class="batch-sales-container">
          <table class="table batch-sales-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Cliente ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th class="text-end">Importe</th>
                <th class="text-end">Puntos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sale, idx) in parsedSales" :key="sale.id">
                <td class="row-idx">{{ idx + 1 }}</td>
                <td class="fw-bold">{{ sale.id }}</td>
                <td>{{ sale.customer_id }}</td>
                <td>{{ formatDate(sale.created_at) }}</td>
                <td>
                  <span class="sale-type-pill" :class="sale.product_type === 'INSTRUMENTO' ? 'type-instrumento' : 'type-accesorio'">
                    {{ sale.product_type || '—' }}
                  </span>
                </td>
                <td>{{ sale.description }}</td>
                <td class="text-end fw-bold text-success">{{ formatCurrency(sale.sale_amount) }}</td>
                <td class="text-end">
                  <span class="sale-points"><i class="bi bi-star-fill me-1"></i>{{ formatNumber(sale.points_awarded) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="text-end mt-3">
        <button class="btn btn-secondary" @click="closeDetailModal">
          <i class="bi bi-x-circle me-1"></i>Cerrar
        </button>
      </div>
    </ModalComponent>

    <!-- Confirm Delete -->
    <ConfirmPopup
      ref="confirmPopup"
      title="Confirmar Eliminación"
      question="¿Estás seguro de eliminar esta ingesta y todas sus ventas? Esta acción no se puede deshacer."
      @response="handleDeleteResponse"
    />

    <!-- Confirm Delete All -->
    <ConfirmPopup
      ref="confirmDeleteAllPopup"
      title="⚠️ Reiniciar todos los puntos"
      question="¿Estás seguro de que querés eliminar TODAS las ventas registradas? Esto va a poner los puntos de todos los clientes en 0. Esta acción no se puede deshacer."
      @response="handleDeleteAllResponse"
    />

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
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import ToastComponent from '@/components/ToastComponent.vue';

export default {
  name: 'AllSalesView',
  components: {
    DataTableComponent,
    ModalComponent,
    ConfirmPopup,
    ToastComponent
  },
  setup() {
    const URL_API_SALES = 'https://apis.madautomate.cloud/webhook/df116eef-0878-4f7a-8c5b-00a31aad6c9e';
    const token = ref(sessionStorage.getItem('token'));

    const batches = ref([]);
    const isLoading = ref(false);
    const selectedBatch = ref(null);
    let batchToDelete = {};

    // Refs
    const detailModal = ref(null);
    const confirmPopup = ref(null);
    const confirmDeleteAllPopup = ref(null);
    const toastComponent = ref(null);

    // Toast
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    const showToastFlag = ref(false);

    // Columns for DataTable (batch level)
    const columns = [
      {
        label: 'Batch ID',
        key: 'batch_id',
        render: (row) => `<code class="batch-code-cell">${row.batch_id}</code>`
      },
      {
        label: 'Ventas',
        key: 'total_ventas',
        render: (row) => `<span class="badge bg-primary">${row.total_ventas}</span>`
      },
      {
        label: 'Total Facturado',
        key: 'total_facturado',
        render: (row) => `<span class="fw-bold text-success">${formatCurrency(row.total_facturado)}</span>`
      }
    ];

    // Actions
    const tableActions = [
      {
        label: 'Ver ventas',
        class: 'btn btn-sm btn-outline me-1',
        method: viewBatch,
        icon: '<i class="bi bi-search"></i>'
      },
      {
        label: 'Eliminar',
        class: 'btn btn-sm btn-danger',
        method: confirmDelete,
        icon: '<i class="bi bi-trash3"></i>'
      }
    ];

    // Computed
    const totalVentas = computed(() => batches.value.reduce((sum, b) => sum + (Number(b.total_ventas) || 0), 0));
    const totalFacturado = computed(() => batches.value.reduce((sum, b) => sum + (Number(b.total_facturado) || 0), 0));

    const parsedSales = computed(() => {
      if (!selectedBatch.value || !selectedBatch.value.sales) return [];
      try {
        const sales = typeof selectedBatch.value.sales === 'string'
          ? JSON.parse(selectedBatch.value.sales)
          : selectedBatch.value.sales;
        return sales.sort((a, b) => a.id - b.id);
      } catch (e) {
        return [];
      }
    });

    // Fetch batches
    async function fetchBatches() {
      isLoading.value = true;
      try {
        const response = await axios.post(URL_API_SALES, {
          action: 'getSales'
        }, {
          headers: { Authorization: `Bearer ${token.value}` }
        });

        const raw = response.data.data || response.data;
        batches.value = Array.isArray(raw) ? raw : [];
      } catch (err) {
        console.error('Error al cargar ingestas:', err);
        showToast('Error', 'No se pudieron cargar las ingestas: ' + (err.response?.data?.message || err.message), false);
      } finally {
        isLoading.value = false;
      }
    }

    // View detail
    function viewBatch(row) {
      selectedBatch.value = { ...row };
      detailModal.value.openModal();
    }

    function closeDetailModal() {
      detailModal.value.closeModal();
      selectedBatch.value = null;
    }

    // Delete
    function confirmDelete(row) {
      batchToDelete = row;
      confirmPopup.value.showConfirmPopup();
    }

    async function handleDeleteResponse(isConfirmed) {
      if (!isConfirmed || !batchToDelete.batch_id) {
        batchToDelete = {};
        return;
      }

      isLoading.value = true;
      try {
        await axios.post(URL_API_SALES, {
          action: 'deleteSale',
          batch_id: batchToDelete.batch_id
        }, {
          headers: { Authorization: `Bearer ${token.value}` }
        });

        batches.value = batches.value.filter(b => b.batch_id !== batchToDelete.batch_id);
        showToast('Eliminado', 'Ingesta eliminada correctamente', true);
      } catch (err) {
        console.error('Error al eliminar ingesta:', err);
        showToast('Error', 'No se pudo eliminar la ingesta', false);
      } finally {
        isLoading.value = false;
        batchToDelete = {};
      }
    }

    // Delete ALL
    function confirmDeleteAll() {
      confirmDeleteAllPopup.value.showConfirmPopup();
    }

    async function handleDeleteAllResponse(isConfirmed) {
      if (!isConfirmed) return;

      isLoading.value = true;
      try {
        await axios.post(URL_API_SALES, {
          action: 'deleteAllSale'
        }, {
          headers: { Authorization: `Bearer ${token.value}` }
        });

        batches.value = [];
        showToast('Puntos reiniciados', 'Se eliminaron todas las ventas y los puntos de los clientes se reiniciaron a 0', true);
      } catch (err) {
        console.error('Error al reiniciar puntos:', err);
        showToast('Error', 'No se pudieron reiniciar los puntos: ' + (err.response?.data?.message || err.message), false);
      } finally {
        isLoading.value = false;
      }
    }

    // Helpers
    function formatDate(val) {
      if (!val) return '—';
      const d = new Date(val);
      if (isNaN(d)) return val;
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function formatCurrency(val) {
      if (!val && val !== 0) return '—';
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
    }

    function formatNumber(val) {
      if (!val && val !== 0) return '0';
      return new Intl.NumberFormat('es-AR').format(val);
    }

    function showToast(title, message, success) {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    }

    onMounted(fetchBatches);

    return {
      batches,
      isLoading,
      columns,
      tableActions,
      selectedBatch,
      parsedSales,
      detailModal,
      confirmPopup,
      confirmDeleteAllPopup,
      toastComponent,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      totalVentas,
      totalFacturado,
      fetchBatches,
      viewBatch,
      closeDetailModal,
      confirmDelete,
      handleDeleteResponse,
      confirmDeleteAll,
      handleDeleteAllResponse,
      formatDate,
      formatCurrency,
      formatNumber
    };
  }
};
</script>

<style scoped>
/* ===== REWARDS DESIGN SYSTEM ===== */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* Stats */
.stats-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

/* Card */
.sales-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
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

/* Batch code in DataTable */
:deep(.batch-code-cell) {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  background: #f3f4f6;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #374151;
}

/* Detail Modal */
.detail-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid #bae6fd;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detail-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-id {
  font-weight: 800;
  font-size: 1rem;
  color: #1e40af;
  font-family: 'Courier New', monospace;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
}

.badge-ventas {
  background: #dbeafe;
  color: #1e40af;
}

.badge-total {
  background: #d1fae5;
  color: #065f46;
}

/* Sales table inside modal */
.batch-sales-container {
  max-height: 450px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.batch-sales-table {
  font-size: 0.88rem;
}

.batch-sales-table thead {
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.batch-sales-table thead th {
  font-weight: 700;
  color: #374151;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.batch-sales-table tbody tr {
  transition: background 0.15s;
}

.batch-sales-table tbody tr:hover {
  background: #f9fafb;
}

.batch-sales-table tbody td {
  padding: 0.65rem 1rem;
  vertical-align: middle;
  color: #1f2937;
}

.row-idx {
  color: #9ca3af;
  font-weight: 600;
  font-size: 0.8rem;
}

.sale-type-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.type-instrumento {
  background: #ede9fe;
  color: #6d28d9;
}

.type-accesorio {
  background: #dbeafe;
  color: #2563eb;
}

.sale-points {
  color: #d97706;
  font-weight: 700;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .detail-header-card {
    flex-direction: column;
    text-align: center;
  }

  .detail-header-left,
  .detail-header-right {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
