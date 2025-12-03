<template>
  <div class="container-fluid mt-4 page registrations">
    <div class="header-section mb-4">
      <h2>Gestión de Inscripciones</h2>
      <button class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> {{ $t('events.button_new') }}
      </button>
    </div>
    <hr class="header-divider">

    <!-- Tip Accordion -->
    <div class="accordion mb-5" id="accordionRegistrations">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingRegistrations">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseRegistrations" 
            aria-expanded="false" 
            aria-controls="collapseRegistrations"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Gestiona las inscripciones de tus eventos, controla asistencias y administra participantes.
            </div>
          </button>
        </h2>
        <div 
          id="collapseRegistrations" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingRegistrations" 
          data-bs-parent="#accordionRegistrations"
        >
          <div class="accordion-body tip-expanded">
            <p>Esta sección te permite <strong>administrar todas las inscripciones</strong> de tus eventos.</p>
            <h6 class="mt-3"><strong>Funcionalidades disponibles:</strong></h6>
            <ul>
              <li><strong>Ver QR:</strong> Visualiza el código QR único de cada inscripción</li>
              <li><strong>Marcar asistencia:</strong> Registra cuando un participante se presenta</li>
              <li><strong>Anular inscripción:</strong> Cancela una inscripción y libera el cupo</li>
              <li><strong>Reenviar email:</strong> Envía nuevamente el email de confirmación</li>
            </ul>
            <p class="mt-3"><strong>💡 Consejo:</strong> Usa los filtros para encontrar inscripciones específicas rápidamente.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtro de Evento -->
    <div class="card filter-card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-6">
            <label class="form-label">
              <i class="bi bi-calendar-event me-2"></i>
              <strong>Seleccionar Evento:</strong>
            </label>
            <select v-model="selectedEventId" class="form-select" @change="loadRegistrations">
              <option value="">-- Seleccione un evento --</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.name }} ({{ event.event_dates?.length || 0 }} sesiones)
              </option>
            </select>
          </div>
          
          <div class="col-12 col-md-3" v-if="selectedEventId">
            <label class="form-label">
              <i class="bi bi-filter me-2"></i>
              <strong>Filtrar por estado:</strong>
            </label>
            <select v-model="statusFilter" class="form-select" @change="filterRegistrations">
              <option value="">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="attended">Asistieron</option>
              <option value="cancelled">Anulados</option>
            </select>
          </div>

          <div class="col-12 col-md-3" v-if="selectedEventId">
            <button @click="exportToExcel" class="btn btn-success w-100">
              <i class="bi bi-file-earmark-excel me-2"></i>Exportar Excel
            </button>
          </div>
        </div>

        <!-- Resumen del evento seleccionado -->
        <div v-if="selectedEvent" class="mt-4 p-3 bg-light rounded">
          <div class="row g-3">
            <div class="col-6 col-md-3 text-center">
              <div class="stat-box">
                <i class="bi bi-people-fill text-primary" style="font-size: 2rem;"></i>
                <h4 class="mb-0 mt-2">{{ registrations.length }}</h4>
                <small class="text-muted">Total Inscriptos</small>
              </div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="stat-box">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 2rem;"></i>
                <h4 class="mb-0 mt-2">{{ confirmedCount }}</h4>
                <small class="text-muted">Confirmados</small>
              </div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="stat-box">
                <i class="bi bi-calendar-check-fill text-info" style="font-size: 2rem;"></i>
                <h4 class="mb-0 mt-2">{{ attendedCount }}</h4>
                <small class="text-muted">Asistieron</small>
              </div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="stat-box">
                <i class="bi bi-x-circle-fill text-danger" style="font-size: 2rem;"></i>
                <h4 class="mb-0 mt-2">{{ cancelledCount }}</h4>
                <small class="text-muted">Anulados</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Inscripciones -->
    <div v-if="selectedEventId" class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="filteredRegistrations"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
        />
      </div>
    </div>

    <!-- Mensaje cuando no hay evento seleccionado -->
    <div v-else class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-calendar-x" style="font-size: 4rem; color: #ccc;"></i>
        <h5 class="mt-3 text-muted">Selecciona un evento para ver las inscripciones</h5>
      </div>
    </div>

    <!-- MODAL VER QR -->
    <ModalComponent 
      ref="qrModal" 
      modalId="qrModal" 
      modalTitle="Código QR de Inscripción"
      class="modal-lg"
    >
      <div class="modal-body text-center">
        <div v-if="selectedRegistration">
          <h5 class="mb-3">{{ selectedRegistration.participant_name }}</h5>
          <p class="text-muted mb-4">{{ selectedRegistration.participant_email }}</p>
          
          <!-- QR Code -->
          <div class="qr-container mb-4">
            <img 
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedRegistration.qr_code}`" 
              alt="QR Code"
              class="img-fluid"
            />
          </div>

          <div class="alert alert-info">
            <strong>Código:</strong> {{ selectedRegistration.qr_code }}
          </div>

          <div class="registration-details mt-4 text-start">
            <h6><strong>Detalles de la Inscripción:</strong></h6>
            <ul class="list-unstyled">
              <li><i class="bi bi-calendar-event me-2"></i><strong>Evento:</strong> {{ selectedEvent?.name }}</li>
              <li><i class="bi bi-clock me-2"></i><strong>Sesión:</strong> {{ selectedRegistration.session_description }}</li>
              <li><i class="bi bi-calendar3 me-2"></i><strong>Fecha:</strong> {{ formatDate(selectedRegistration.session_date) }}</li>
              <li><i class="bi bi-shield-check me-2"></i><strong>Estado:</strong> 
                <span :class="getStatusBadgeClass(selectedRegistration.status)">
                  {{ getStatusLabel(selectedRegistration.status) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="downloadQR">
          <i class="bi bi-download me-2"></i>Descargar QR
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeQRModal">
          <i class="bi bi-x-circle me-2"></i>Cerrar
        </button>
      </div>
    </ModalComponent>

    <!-- MODAL DETALLES DE INSCRIPCIÓN -->
    <ModalComponent 
      ref="detailsModal" 
      modalId="detailsModal" 
      modalTitle="Detalles de la Inscripción"
      class="modal-xl"
    >
      <div class="modal-body">
        <div v-if="selectedRegistration">
          <!-- Información del Participante -->
          <div class="section-card mb-4">
            <h5 class="section-title"><i class="bi bi-person-circle me-2"></i>Información del Participante</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="text-muted small">Nombre Completo:</label>
                <p class="mb-0"><strong>{{ selectedRegistration.participant_name }}</strong></p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Email:</label>
                <p class="mb-0"><strong>{{ selectedRegistration.participant_email }}</strong></p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">DNI:</label>
                <p class="mb-0"><strong>{{ selectedRegistration.participant_dni || 'No proporcionado' }}</strong></p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Teléfono:</label>
                <p class="mb-0"><strong>{{ selectedRegistration.participant_phone || 'No proporcionado' }}</strong></p>
              </div>
            </div>
          </div>

          <!-- Información de la Sesión -->
          <div class="section-card mb-4">
            <h5 class="section-title"><i class="bi bi-calendar-event me-2"></i>Información de la Sesión</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="text-muted small">Sesión:</label>
                <p class="mb-0"><strong>{{ selectedRegistration.session_description }}</strong></p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Fecha y Hora:</label>
                <p class="mb-0"><strong>{{ formatDate(selectedRegistration.session_date) }}</strong></p>
              </div>
            </div>
          </div>

          <!-- Estado y Timeline -->
          <div class="section-card mb-4">
            <h5 class="section-title"><i class="bi bi-clock-history me-2"></i>Estado y Timeline</h5>
            <div class="timeline">
              <div class="timeline-item completed">
                <div class="timeline-marker"><i class="bi bi-check-circle-fill"></i></div>
                <div class="timeline-content">
                  <strong>Inscripción realizada</strong>
                  <p class="text-muted small mb-0">{{ formatDate(selectedRegistration.registered_at) }}</p>
                </div>
              </div>
              <div class="timeline-item" :class="{ completed: selectedRegistration.status === 'attended' }">
                <div class="timeline-marker">
                  <i :class="selectedRegistration.status === 'attended' ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                </div>
                <div class="timeline-content">
                  <strong>Asistencia confirmada</strong>
                  <p class="text-muted small mb-0" v-if="selectedRegistration.attended_at">
                    {{ formatDate(selectedRegistration.attended_at) }}
                  </p>
                  <p class="text-muted small mb-0" v-else>Pendiente</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Documentos Adjuntos -->
          <div class="section-card" v-if="selectedRegistration.documents && selectedRegistration.documents.length > 0">
            <h5 class="section-title"><i class="bi bi-file-earmark-text me-2"></i>Documentos Adjuntos</h5>
            <div class="documents-list">
              <div v-for="doc in selectedRegistration.documents" :key="doc.id" class="document-item">
                <i class="bi bi-file-pdf text-danger me-2"></i>
                <span>{{ doc.name }}</span>
                <button class="btn btn-sm btn-outline-primary ms-auto" @click="downloadDocument(doc)">
                  <i class="bi bi-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" @click="closeDetailsModal">
          <i class="bi bi-x-circle me-2"></i>Cerrar
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

    <ConfirmPopup 
      ref="confirmPopup" 
      :title="confirmTitle"
      :question="confirmQuestion"
      @response="handleConfirmResponse" 
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
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import { useI18n } from "vue-i18n";

export default {
  name: 'RegistrationsManagement',
  components: {
    ModalComponent,
    DataTableComponent,
    ToastComponent,
    ConfirmPopup
  },
  setup() {
    const { t } = useI18n();
    const events = ref([]);
    const registrations = ref([]);
    const filteredRegistrations = ref([]);
    const selectedEventId = ref('');
    const selectedEvent = ref(null);
    const selectedRegistration = ref(null);
    const statusFilter = ref('');
    const isLoading = ref(false);
    
    const qrModal = ref(null);
    const detailsModal = ref(null);
    const toastComponent = ref(null);
    const confirmPopup = ref(null);
    
    const showToastFlag = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    
    const confirmTitle = ref('');
    const confirmQuestion = ref('');
    const pendingAction = ref(null);

    const columns = [
      { key: 'participant_name', label: 'Participante' },
      { key: 'participant_email', label: 'Email' },
      { key: 'session_description', label: 'Sesión' },
      { key: 'registered_at', label: 'Fecha Inscripción', format: 'date' },
      { key: 'status', label: 'Estado', format: 'badge' }
    ];

    
    // const resultActions = [
    //   { label: 'Ver QR', icon: 'bi-qr-code', variant: 'primary', action: 'qr' },
    //   { label: 'Ver Detalles', icon: 'bi-eye', variant: 'info', action: 'details' },
    //   { label: 'Marcar Asistencia', icon: 'bi-check-circle', variant: 'success', action: 'attend', condition: (item) => item.status !== 'attended' && item.status !== 'cancelled' },
    //   { label: 'Reenviar Email', icon: 'bi-envelope', variant: 'secondary', action: 'resend' },
    //   { label: 'Anular', icon: 'bi-x-circle', variant: 'danger', action: 'cancel', condition: (item) => item.status !== 'cancelled' }
    // ];

    const resultActions = [
        { label: t('events.list_status'), class: 'btn btn-outline btn-sm', icon: '<i class="bi bi-play-circle"></i>' },
        { label: t('events.list_edit'), class: 'btn btn-outline btn-sm', icon: '<i class="bi bi-pencil-square"></i>' },
        { label: t('events.list_delete'), class: 'btn btn-danger btn-sm', icon: '<i class="bi bi-trash3"></i>' },
    ];

    // Computed properties para estadísticas
    const confirmedCount = computed(() => 
      registrations.value.filter(r => r.status === 'confirmed').length
    );

    const attendedCount = computed(() => 
      registrations.value.filter(r => r.status === 'attended').length
    );

    const cancelledCount = computed(() => 
      registrations.value.filter(r => r.status === 'cancelled').length
    );

    // Cargar eventos disponibles
    const loadEvents = async () => {
      try {
        isLoading.value = true;
        // Aquí iría tu llamada al API
        // const response = await axios.get('/api/events');
        // events.value = response.data;
        
        // Datos de ejemplo
        events.value = [
          {
            id: 'evt_001',
            name: 'Maratón Buenos Aires 2025',
            event_dates: [
              { id: 'session_001', description: '42K Elite' },
              { id: 'session_002', description: '21K' }
            ]
          },
          {
            id: 'evt_002',
            name: 'Evento Corporativo Anual',
            event_dates: [
              { id: 'session_003', description: 'Cena de Gala' }
            ]
          }
        ];
      } catch (error) {
        showToast('Error', 'No se pudieron cargar los eventos', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Cargar inscripciones del evento seleccionado
    const loadRegistrations = async () => {
      if (!selectedEventId.value) {
        registrations.value = [];
        filteredRegistrations.value = [];
        selectedEvent.value = null;
        return;
      }

      try {
        isLoading.value = true;
        selectedEvent.value = events.value.find(e => e.id === selectedEventId.value);
        
        // Aquí iría tu llamada al API
        // const response = await axios.get(`/api/events/${selectedEventId.value}/registrations`);
        // registrations.value = response.data;

        // Datos de ejemplo
        registrations.value = [
          {
            id: 'reg_001',
            event_id: selectedEventId.value,
            participant_name: 'Juan Pérez',
            participant_email: 'juan.perez@email.com',
            participant_dni: '12345678',
            participant_phone: '+54 11 1234-5678',
            session_id: 'session_001',
            session_description: '42K Elite',
            session_date: '2025-12-15T07:00:00',
            status: 'confirmed',
            qr_code: 'REG001-EVT001-SES001',
            registered_at: '2025-10-15T10:30:00',
            attended_at: null,
            documents: [
              { id: 'doc_001', name: 'Apto Médico.pdf', url: '/documents/apto_001.pdf' }
            ]
          },
          {
            id: 'reg_002',
            event_id: selectedEventId.value,
            participant_name: 'María González',
            participant_email: 'maria.gonzalez@email.com',
            participant_dni: '87654321',
            participant_phone: '+54 11 8765-4321',
            session_id: 'session_001',
            session_description: '42K Elite',
            session_date: '2025-12-15T07:00:00',
            status: 'attended',
            qr_code: 'REG002-EVT001-SES001',
            registered_at: '2025-10-20T14:20:00',
            attended_at: '2025-12-15T06:45:00',
            documents: []
          },
          {
            id: 'reg_003',
            event_id: selectedEventId.value,
            participant_name: 'Carlos Rodríguez',
            participant_email: 'carlos.rodriguez@email.com',
            participant_dni: '11223344',
            participant_phone: '+54 11 1122-3344',
            session_id: 'session_002',
            session_description: '21K',
            session_date: '2025-12-15T07:15:00',
            status: 'cancelled',
            qr_code: 'REG003-EVT001-SES002',
            registered_at: '2025-11-01T09:15:00',
            attended_at: null,
            documents: []
          }
        ];

        filterRegistrations();
      } catch (error) {
        showToast('Error', 'No se pudieron cargar las inscripciones', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Filtrar inscripciones por estado
    const filterRegistrations = () => {
      if (!statusFilter.value) {
        filteredRegistrations.value = registrations.value;
      } else {
        filteredRegistrations.value = registrations.value.filter(
          r => r.status === statusFilter.value
        );
      }
    };

    // Ver QR
    const showQR = (registration) => {
      selectedRegistration.value = registration;
      qrModal.value.openModal();
    };

    const closeQRModal = () => {
      qrModal.value.closeModal();
      selectedRegistration.value = null;
    };

    const downloadQR = () => {
      if (!selectedRegistration.value) return;
      
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${selectedRegistration.value.qr_code}`;
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `QR_${selectedRegistration.value.qr_code}.png`;
      link.click();
      
      showToast('Éxito', 'QR descargado correctamente', true);
    };

    // Ver detalles
    const showDetails = (registration) => {
      selectedRegistration.value = registration;
      detailsModal.value.openModal();
    };

    const closeDetailsModal = () => {
      detailsModal.value.closeModal();
      selectedRegistration.value = null;
    };

    // Marcar asistencia
    const markAttendance = (registration) => {
      confirmTitle.value = 'Confirmar Asistencia';
      confirmQuestion.value = `¿Confirmar que ${registration.participant_name} asistió al evento?`;
      pendingAction.value = { action: 'attend', data: registration };
      confirmPopup.value.openModal();
    };

    const executeMarkAttendance = async (registration) => {
      try {
        isLoading.value = true;
        // Aquí iría tu llamada al API
        // await axios.post(`/api/registrations/${registration.id}/attend`);

        // Actualizar localmente
        const index = registrations.value.findIndex(r => r.id === registration.id);
        if (index !== -1) {
          registrations.value[index].status = 'attended';
          registrations.value[index].attended_at = new Date().toISOString();
        }

        filterRegistrations();
        showToast('Éxito', 'Asistencia registrada correctamente', true);
      } catch (error) {
        showToast('Error', 'No se pudo registrar la asistencia', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Anular inscripción
    const cancelRegistration = (registration) => {
      confirmTitle.value = 'Anular Inscripción';
      confirmQuestion.value = `¿Está seguro de anular la inscripción de ${registration.participant_name}? Esta acción liberará el cupo.`;
      pendingAction.value = { action: 'cancel', data: registration };
      confirmPopup.value.openModal();
    };

    const executeCancelRegistration = async (registration) => {
      try {
        isLoading.value = true;
        // Aquí iría tu llamada al API
        // await axios.post(`/api/registrations/${registration.id}/cancel`);

        // Actualizar localmente
        const index = registrations.value.findIndex(r => r.id === registration.id);
        if (index !== -1) {
          registrations.value[index].status = 'cancelled';
        }

        filterRegistrations();
        showToast('Éxito', 'Inscripción anulada correctamente', true);
      } catch (error) {
        showToast('Error', 'No se pudo anular la inscripción', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Reenviar email
    const resendEmail = async (registration) => {
      try {
        isLoading.value = true;
        // Aquí iría tu llamada al API
        // await axios.post(`/api/registrations/${registration.id}/resend-email`);

        showToast('Éxito', `Email reenviado a ${registration.participant_email}`, true);
      } catch (error) {
        showToast('Error', 'No se pudo reenviar el email', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Exportar a Excel
    const exportToExcel = () => {
      showToast('Info', 'Exportando a Excel...', true);
      // Aquí iría la lógica para exportar
    };

    // Manejar acciones desde DataTable
    const handleAction = (action, item) => {
      switch (action) {
        case 'qr':
          showQR(item);
          break;
        case 'details':
          showDetails(item);
          break;
        case 'attend':
          markAttendance(item);
          break;
        case 'resend':
          resendEmail(item);
          break;
        case 'cancel':
          cancelRegistration(item);
          break;
      }
    };

    // Manejar respuesta del confirm popup
    const handleConfirmResponse = (confirmed) => {
      if (confirmed && pendingAction.value) {
        const { action, data } = pendingAction.value;
        
        if (action === 'attend') {
          executeMarkAttendance(data);
        } else if (action === 'cancel') {
          executeCancelRegistration(data);
        }
      }
      
      pendingAction.value = null;
    };

    // Utilidades
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusLabel = (status) => {
      const labels = {
        confirmed: 'Confirmado',
        attended: 'Asistió',
        cancelled: 'Anulado'
      };
      return labels[status] || status;
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        confirmed: 'badge bg-success',
        attended: 'badge bg-info',
        cancelled: 'badge bg-danger'
      };
      return classes[status] || 'badge bg-secondary';
    };

    const downloadDocument = (doc) => {
      window.open(doc.url, '_blank');
    };

    const showToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      showToastFlag.value = true;
      toastComponent.value?.showToast();
    };

    onMounted(async () => {
      await loadEvents();
    });

    return {
      events,
      registrations,
      filteredRegistrations,
      selectedEventId,
      selectedEvent,
      selectedRegistration,
      statusFilter,
      isLoading,
      columns,
      resultActions,
      confirmedCount,
      attendedCount,
      cancelledCount,
      qrModal,
      detailsModal,
      toastComponent,
      confirmPopup,
      showToastFlag,
      toastTitle,
      toastMessage,
      isSuccess,
      confirmTitle,
      confirmQuestion,
      loadRegistrations,
      filterRegistrations,
      showQR,
      closeQRModal,
      downloadQR,
      showDetails,
      closeDetailsModal,
      exportToExcel,
      formatDate,
      getStatusLabel,
      getStatusBadgeClass,
      downloadDocument,
      handleAction,
      handleConfirmResponse,
      t
    };
  }
};
</script>