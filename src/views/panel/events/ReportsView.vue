<template>
  <div class="container-fluid reports mt-4">
    <div class="header-section mb-4">
      <h2>{{ $t('reports.title') || 'Reportes y Análisis' }}</h2>
      <div class="d-flex gap-2">
        <button @click="refreshData" class="btn btn-outline-primary">
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
        <button @click="exportReport" class="btn btn-primary">
          <i class="bi bi-download me-2"></i>Exportar
        </button>
      </div>
    </div>
    <hr class="header-divider">

    <!-- Tip Accordion -->
    <div class="accordion mb-5" id="accordionReports">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingReports">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseReports" 
            aria-expanded="false" 
            aria-controls="collapseReports"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Analiza el rendimiento de tus eventos y optimiza tus registros.
            </div>
          </button>
        </h2>
        <div 
          id="collapseReports" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingReports" 
          data-bs-parent="#accordionReports"
        >
          <div class="accordion-body tip-expanded">
            <p>Obtén insights valiosos sobre tus eventos:</p>
            <ul>
              <li>Monitorea registros en tiempo real</li>
              <li>Identifica tendencias y patrones</li>
              <li>Optimiza la capacidad de tus eventos</li>
              <li>Analiza tasas de conversión y asistencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros de fecha -->
    <div class="card mb-5">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label"><strong>Fecha Inicio:</strong></label>
            <input v-model="filters.startDate" type="date" class="form-control">
          </div>
          <div class="col-md-3">
            <label class="form-label"><strong>Fecha Fin:</strong></label>
            <input v-model="filters.endDate" type="date" class="form-control">
          </div>
          <div class="col-md-3">
            <label class="form-label"><strong>Evento:</strong></label>
            <select v-model="filters.eventId" class="form-select">
              <option value="">Todos los eventos</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <button @click="applyFilters" class="btn btn-primary w-100">
              <i class="bi bi-funnel me-2"></i>Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row g-4 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="card kpi-card kpi-primary">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="kpi-label">Total Registros</p>
                <h3 class="kpi-value">{{ formatNumber(kpis.totalRegistrations) }}</h3>
                <span class="kpi-trend positive">
                  <i class="bi bi-arrow-up"></i> {{ kpis.registrationGrowth }}%
                </span>
              </div>
              <div class="kpi-icon bg-primary">
                <i class="bi bi-person-check-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kpi-card kpi-success">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="kpi-label">Eventos Activos</p>
                <h3 class="kpi-value">{{ kpis.activeEvents }}</h3>
                <span class="kpi-trend neutral">
                  <i class="bi bi-calendar-event"></i> En curso
                </span>
              </div>
              <div class="kpi-icon bg-success">
                <i class="bi bi-calendar-check-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kpi-card kpi-warning">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="kpi-label">Tasa Conversión</p>
                <h3 class="kpi-value">{{ kpis.conversionRate }}%</h3>
                <span class="kpi-trend positive">
                  <i class="bi bi-arrow-up"></i> +{{ kpis.conversionGrowth }}%
                </span>
              </div>
              <div class="kpi-icon bg-warning">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kpi-card kpi-info">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="kpi-label">Ocupación Media</p>
                <h3 class="kpi-value">{{ kpis.avgOccupancy }}%</h3>
                <span :class="['kpi-trend', kpis.avgOccupancy >= 80 ? 'positive' : 'neutral']">
                  <i :class="['bi', kpis.avgOccupancy >= 80 ? 'bi-check-circle' : 'bi-dash-circle']"></i>
                  {{ kpis.avgOccupancy >= 80 ? 'Óptimo' : 'Mejorable' }}
                </span>
              </div>
              <div class="kpi-icon bg-info">
                <i class="bi bi-pie-chart-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Eventos -->
    <div class="row g-4 mb-5">
      <div class="col-xl-6">
        <div class="card data-card">
          <div class="card-header bg-white">
            <i class="bi bi-trophy me-2"></i>
            <strong>Top 5 Eventos - Mayor Asistencia</strong>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Posición</th>
                    <th>Evento</th>
                    <th>Registros</th>
                    <th>Capacidad</th>
                    <th>Ocupación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(event, idx) in topEvents" :key="event.id">
                    <td>
                      <span class="badge" :class="getBadgeClass(idx)">
                        #{{ idx + 1 }}
                      </span>
                    </td>
                    <td><strong>{{ event.name }}</strong></td>
                    <td>{{ formatNumber(event.registrations) }}</td>
                    <td>{{ formatNumber(event.capacity) }}</td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div 
                          class="progress-bar" 
                          :class="getProgressClass(event.occupancy)"
                          :style="{ width: event.occupancy + '%' }"
                        >
                          {{ event.occupancy }}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas Adicionales -->
      <div class="col-xl-6">
        <div class="card data-card">
          <div class="card-header bg-white">
            <i class="bi bi-speedometer2 me-2"></i>
            <strong>Métricas Adicionales</strong>
          </div>
          <div class="card-body">
            <div class="metric-item">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span><i class="bi bi-clock-history me-2"></i>Tiempo Promedio de Registro</span>
                <strong>{{ metrics.avgRegistrationTime }} min</strong>
              </div>
              <hr>
            </div>

            <div class="metric-item">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span><i class="bi bi-people me-2"></i>Registros por Hora Pico</span>
                <strong>{{ metrics.peakHourRegistrations }}/hora</strong>
              </div>
              <hr>
            </div>

            <div class="metric-item">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span><i class="bi bi-calendar-x me-2"></i>Tasa de Cancelación</span>
                <strong class="text-danger">{{ metrics.cancellationRate }}%</strong>
              </div>
              <hr>
            </div>

            <div class="metric-item">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span><i class="bi bi-check-all me-2"></i>Tasa de Asistencia Real</span>
                <strong class="text-success">{{ metrics.attendanceRate }}%</strong>
              </div>
              <hr>
            </div>

            <div class="metric-item">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span><i class="bi bi-hourglass-split me-2"></i>Registros Pendientes</span>
                <strong class="text-warning">{{ formatNumber(metrics.pendingRegistrations) }}</strong>
              </div>
              <hr>
            </div>

            <div class="metric-item">
              <div class="d-flex justify-content-between align-items-center mb-0">
                <span><i class="bi bi-star me-2"></i>Satisfacción Promedio</span>
                <strong>{{ metrics.avgSatisfaction }}/5 ⭐</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y Tablas -->
    <div class="row g-4 mb-5">
      <!-- Registros por Día -->
      <div class="col-xl-8">
        <div class="card data-card">
          <div class="card-header bg-white">
            <i class="bi bi-bar-chart-line me-2"></i>
            <strong>Registros por Día</strong>
          </div>
          <div class="card-body">
            <canvas ref="registrationsChart" height="80"></canvas>
          </div>
        </div>
      </div>

      <!-- Distribución por Estado -->
      <div class="col-xl-4">
        <div class="card data-card">
          <div class="card-header bg-white">
            <i class="bi bi-pie-chart me-2"></i>
            <strong>Estados de Registro</strong>
          </div>
          <div class="card-body">
            <canvas ref="statusChart" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>


    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import { useI18n } from "vue-i18n";
import Chart from 'chart.js/auto';

export default {
  name: 'ReportsView',
  components: {
    DataTableComponent
  },
  setup() {
    const { t } = useI18n();
    const isLoading = ref(false);
    const token = ref(null);
    const registrationsChart = ref(null);
    const statusChart = ref(null);
    let chartInstances = { registrations: null, status: null };
    const url = "";
    const url_eventos = "";

    const filters = ref({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      eventId: ''
    });

    const events = ref([]);

    const kpis = ref({
      totalRegistrations: 1247,
      registrationGrowth: 12.5,
      activeEvents: 8,
      conversionRate: 68.5,
      conversionGrowth: 5.2,
      avgOccupancy: 78
    });

    const topEvents = ref([
      { id: 1, name: 'Conferencia Tech 2025', registrations: 450, capacity: 500, occupancy: 90 },
      { id: 2, name: 'Workshop IA', registrations: 280, capacity: 300, occupancy: 93 },
      { id: 3, name: 'Networking Empresarial', registrations: 195, capacity: 250, occupancy: 78 },
      { id: 4, name: 'Seminario Marketing', registrations: 167, capacity: 200, occupancy: 84 },
      { id: 5, name: 'Hackathon 48h', registrations: 155, capacity: 300, occupancy: 52 }
    ]);

    const metrics = ref({
      avgRegistrationTime: 3.5,
      peakHourRegistrations: 45,
      cancellationRate: 8.2,
      attendanceRate: 87.5,
      pendingRegistrations: 23,
      avgSatisfaction: 4.6
    });

    const detailColumns = [
      { key: 'name', label: 'Evento' },
      { key: 'date', label: 'Fecha' },
      { key: 'registrations', label: 'Registros' },
      { key: 'capacity', label: 'Capacidad' },
      { key: 'occupancy', label: 'Ocupación' },
      { key: 'revenue', label: 'Ingresos' },
      { key: 'status', label: 'Estado' }
    ];

    const eventsDetail = ref([
      { 
        id: 1, 
        name: 'Conferencia Tech 2025', 
        date: '2025-01-15', 
        registrations: 450, 
        capacity: 500, 
        occupancy: '90%',
        revenue: '$22,500',
        status: 'Activo'
      },
      { 
        id: 2, 
        name: 'Workshop IA', 
        date: '2025-01-20', 
        registrations: 280, 
        capacity: 300, 
        occupancy: '93%',
        revenue: '$8,400',
        status: 'Activo'
      }
    ]);

    const formatNumber = (num) => {
      return new Intl.NumberFormat('es-AR').format(num);
    };

    const getBadgeClass = (index) => {
      const classes = ['bg-warning', 'bg-secondary', 'bg-success'];
      return classes[index] || 'bg-primary';
    };

    const getProgressClass = (occupancy) => {
      if (occupancy >= 90) return 'bg-danger';
      if (occupancy >= 75) return 'bg-warning';
      return 'bg-success';
    };

    const initCharts = () => {
      // Gráfico de Registros por Día
      if (registrationsChart.value) {
        if (chartInstances.registrations) {
          chartInstances.registrations.destroy();
        }
        
        const ctx = registrationsChart.value.getContext('2d');
        chartInstances.registrations = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
              label: 'Registros',
              data: [45, 52, 38, 65, 72, 58, 49],
              borderColor: '#0d6efd',
              backgroundColor: 'rgba(13, 110, 253, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

      // Gráfico de Estados
      if (statusChart.value) {
        if (chartInstances.status) {
          chartInstances.status.destroy();
        }
        
        const ctx = statusChart.value.getContext('2d');
        chartInstances.status = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Confirmados', 'Pendientes', 'Cancelados'],
            datasets: [{
              data: [856, 312, 79],
              backgroundColor: [
                '#198754',
                '#ffc107',
                '#dc3545'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    };

    const refreshData = async () => {
      isLoading.value = true;
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Aquí iría la llamada real a la API
      } finally {
        isLoading.value = false;
      }
    };

    const applyFilters = () => {
      console.log('Aplicando filtros:', filters.value);
      refreshData();
    };

    const exportReport = () => {
      console.log('Exportando reporte...');
      // Implementar lógica de exportación
    };

    const getToken = () => {
      token.value = sessionStorage.getItem('token');
    };

    onMounted(async () => {
      await getToken();
      await refreshData();
      setTimeout(() => {
        initCharts();
      }, 100);
    });

    return {
      filters,
      events,
      kpis,
      topEvents,
      metrics,
      detailColumns,
      eventsDetail,
      isLoading,
      registrationsChart,
      statusChart,
      formatNumber,
      getBadgeClass,
      getProgressClass,
      refreshData,
      applyFilters,
      exportReport,
      t
    };
  }
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-banner-style {
  border-left: 4px solid #0d6efd;
}

.tip-banner-button {
  background-color: #f8f9fa;
}

.kpi-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.kpi-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #212529;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.kpi-trend {
  font-size: 0.875rem;
  font-weight: 600;
}

.kpi-trend.positive {
  color: #198754;
}

.kpi-trend.negative {
  color: #dc3545;
}

.kpi-trend.neutral {
  color: #6c757d;
}

.data-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-item {
  font-size: 0.95rem;
}

.metric-item hr {
  margin: 0;
  opacity: 0.1;
}

.progress {
  border-radius: 8px;
}

.progress-bar {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}
</style>