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
              <div class="d-flex justify-content-between align-items-center mb-0">
                <span><i class="bi bi-hourglass-split me-2"></i>Registros Pendientes</span>
                <strong class="text-warning">{{ formatNumber(metrics.pendingRegistrations) }}</strong>
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
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useI18n } from "vue-i18n";
import Chart from 'chart.js/auto';

export default {
  name: 'ReportsView',
  setup() {
    const { t } = useI18n();
    const isLoading = ref(false);
    const token = ref(null);
    const registrationsChart = ref(null);
    const statusChart = ref(null);
    let chartInstances = { registrations: null, status: null };
    const url = 'https://apis.madautomate.cloud/webhook/1090f10d-aafd-4c67-bc72-c3365187d6df';
    const url_eventos = 'https://apis.madautomate.cloud/webhook/9ff4a876-1944-4643-b41d-37450e37e3e2';

    // Registros crudos (sin filtrar por fecha) de los eventos consultados
    const rawRegistrations = ref([]);
    const statusCounts = ref({ Creado: 0, Confirmado: 0, Asistió: 0, Anulado: 0 });
    const registrationsByDay = ref({ labels: [], data: [] });

    const filters = ref({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      eventId: ''
    });

    const events = ref([]);

    const kpis = ref({
      totalRegistrations: 0,
      registrationGrowth: 0,
      activeEvents: 0,
      conversionRate: 0,
      conversionGrowth: 0,
      avgOccupancy: 0
    });

    const topEvents = ref([]);

    const metrics = ref({
      peakHourRegistrations: 0,
      cancellationRate: 0,
      attendanceRate: 0,
      pendingRegistrations: 0
    });

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
            labels: registrationsByDay.value.labels,
            datasets: [{
              label: 'Registros',
              data: registrationsByDay.value.data,
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
            labels: Object.keys(statusCounts.value),
            datasets: [{
              data: Object.values(statusCounts.value),
              backgroundColor: [
                '#0dcaf0',
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

    const getToken = () => {
      token.value = sessionStorage.getItem('token');
    };

    // Trae el listado de eventos reales, parseando las sesiones para calcular cupos
    const loadEvents = async () => {
      const response = await axios.post(url_eventos, { action: "dataforms" }, {
        headers: { Authorization: `Bearer ${token.value}` }
      });

      events.value = (response.data || []).map(item => {
        let parsedDates = [];
        try {
          parsedDates = JSON.parse(item.event_dates || '[]') || [];
        } catch (e) {
          parsedDates = [];
        }
        const capacity = parsedDates.reduce((sum, d) => sum + (Number(d?.capacity) || 0), 0);
        return { ...item, event_dates: parsedDates, capacity };
      });
    };

    // Trae las inscripciones reales de cada evento indicado, etiquetadas con su evento
    const loadRegistrationsForEvents = async (eventList) => {
      const requests = eventList.map(ev =>
        axios.post(url, { action: "dataforms", selectedEventId: ev.id }, {
          headers: { Authorization: `Bearer ${token.value}` }
        })
          .then(res => (res.data || []).map(r => ({ ...r, event_id: ev.id, event_name: ev.name })))
          .catch(() => [])
      );
      const results = await Promise.all(requests);
      return results.flat();
    };

    const inRange = (dateStr, start, end) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (start && d < new Date(start)) return false;
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        if (d > endDate) return false;
      }
      return true;
    };

    const growth = (curr, prev) => prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;

    const computeAvgOccupancy = (list) => {
      const byEvent = {};
      list.forEach(r => { byEvent[r.event_id] = (byEvent[r.event_id] || 0) + 1; });
      const occupancies = events.value
        .filter(e => byEvent[e.id] && e.capacity > 0)
        .map(e => (byEvent[e.id] / e.capacity) * 100);
      if (!occupancies.length) return 0;
      return Number((occupancies.reduce((a, b) => a + b, 0) / occupancies.length).toFixed(1));
    };

    const computeTopEvents = (list) => {
      const byEvent = {};
      list.forEach(r => { byEvent[r.event_id] = (byEvent[r.event_id] || 0) + 1; });
      return events.value
        .filter(e => byEvent[e.id])
        .map(e => ({
          id: e.id,
          name: e.name,
          registrations: byEvent[e.id],
          capacity: e.capacity,
          occupancy: e.capacity > 0 ? Math.round((byEvent[e.id] / e.capacity) * 100) : 0
        }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5);
    };

    const computePeakHour = (list) => {
      const hourCounts = Array(24).fill(0);
      list.forEach(r => {
        if (!r.created_at) return;
        hourCounts[new Date(r.created_at).getHours()]++;
      });
      return Math.max(0, ...hourCounts);
    };

    const formatShortDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    };

    const computeRegistrationsByDay = (list) => {
      const counts = {};
      list.forEach(r => {
        if (!r.created_at) return;
        const day = r.created_at.split('T')[0].split(' ')[0];
        counts[day] = (counts[day] || 0) + 1;
      });
      const sortedDays = Object.keys(counts).sort();
      return {
        labels: sortedDays.map(formatShortDate),
        data: sortedDays.map(d => counts[d])
      };
    };

    // Calcula KPIs, top eventos, métricas y datos de gráficos a partir de las inscripciones reales
    const computeReportData = () => {
      const filtered = rawRegistrations.value.filter(r => inRange(r.created_at, filters.value.startDate, filters.value.endDate));

      let previousFiltered = [];
      if (filters.value.startDate && filters.value.endDate) {
        const start = new Date(filters.value.startDate);
        const end = new Date(filters.value.endDate);
        const rangeDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - rangeDays + 1);
        previousFiltered = rawRegistrations.value.filter(r =>
          inRange(r.created_at, prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0])
        );
      }

      const countByStatus = (list, status) => list.filter(r => r.status === status).length;

      const total = filtered.length;
      const cancelled = countByStatus(filtered, 'cancelled');
      const attended = countByStatus(filtered, 'attended');
      const confirmed = countByStatus(filtered, 'confirmed');
      const created = countByStatus(filtered, 'created');
      const activeNow = total - cancelled;
      // Las canceladas liberan el cupo, no deben contar para ocupación/top eventos
      const activeFiltered = filtered.filter(r => r.status !== 'cancelled');

      const prevTotal = previousFiltered.length;
      const prevActive = previousFiltered.filter(r => r.status !== 'cancelled').length;

      kpis.value = {
        totalRegistrations: total,
        registrationGrowth: growth(total, prevTotal),
        activeEvents: events.value.filter(e => e.status === 'published').length,
        conversionRate: total > 0 ? Number(((activeNow / total) * 100).toFixed(1)) : 0,
        conversionGrowth: growth(activeNow, prevActive),
        avgOccupancy: computeAvgOccupancy(activeFiltered)
      };

      topEvents.value = computeTopEvents(activeFiltered);

      metrics.value = {
        peakHourRegistrations: computePeakHour(filtered),
        cancellationRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
        attendanceRate: total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 0,
        pendingRegistrations: created
      };

      statusCounts.value = {
        Creado: created,
        Confirmado: confirmed,
        Asistió: attended,
        Anulado: cancelled
      };

      registrationsByDay.value = computeRegistrationsByDay(filtered);
    };

    const refreshData = async () => {
      isLoading.value = true;
      try {
        await loadEvents();

        const eventsToQuery = filters.value.eventId
          ? events.value.filter(e => e.id === filters.value.eventId)
          : events.value;

        rawRegistrations.value = await loadRegistrationsForEvents(eventsToQuery);

        computeReportData();
        await nextTick();
        initCharts();
      } catch (error) {
        console.error('Error al cargar los datos de reportes', error);
      } finally {
        isLoading.value = false;
      }
    };

    const applyFilters = () => {
      refreshData();
    };

    const exportReport = () => {
      console.log('Exportando reporte...');
      // Implementar lógica de exportación
    };

    onMounted(async () => {
      getToken();
      await refreshData();
    });

    return {
      filters,
      events,
      kpis,
      topEvents,
      metrics,
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