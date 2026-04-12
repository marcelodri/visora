<template>
  <div class="container-fluid mt-4 page registrations">
    <div class="header-section mb-4">
      <h2>Gestión de Inscripciones</h2>
      <!-- <button class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> {{ $t('events.button_new') }}
      </button> -->
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
              <option value="Creado">Creados</option>
              <option value="Asistió">Asistieron</option>
              <option value="Anulado">Anulados</option>
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

          <h5 class="mb-3">{{ selectedRegistration.first_name }}</h5>
          <p class="text-muted mb-4">{{ selectedRegistration.participant_email }}</p>
          
          <!-- QR Code -->
          <div class="qr-container mb-4">
            <img 
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedRegistration.guid}`" 
              alt="QR Code"
              class="img-fluid"
            />
          </div>

          <div class="alert alert-info">
            <strong>Código:</strong> {{ selectedRegistration.code }}
          </div>

          <div class="registration-details mt-4 text-start">
            <h6><strong>Detalles de la Inscripción:</strong></h6>
            <ul class="list-unstyled">
              <li><i class="bi bi-calendar-event me-2"></i><strong>Evento:</strong> {{ selectedEvent?.name }}</li>
              <li><i class="bi bi-clock me-2"></i><strong>Sesión:</strong> {{ selectedRegistration.session.description }}</li>
              <li><i class="bi bi-calendar3 me-2"></i><strong>Fecha:</strong> {{ formatDate(selectedRegistration.session.event_date) }}</li>
              <li><i class="bi bi-shield-check me-2"></i><strong>Estado: </strong> 
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
            <h5 class="section-title">
              <i class="bi bi-person-circle me-2"></i>Información del Participante
            </h5>
            <div class="row g-3">
              <div 
                v-for="field in selectedRegistration.fields" 
                :key="field.field_name"
                class="col-md-6"
              >
                <label class="text-muted small">{{ field.field_label }}:</label>
                <p class="mb-0">
                  <strong>{{ field.field_value || 'No proporcionado' }}</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Información de la Sesión -->
          <div class="section-card mb-4">
            <h5 class="section-title"><i class="bi bi-calendar-event me-2"></i>Información de la Sesión</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="text-muted small">Sesión:</label>
                <p class="mb-0"><strong>{{ selectedRegistration.session.description }}</strong></p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Fecha y Hora:</label>
                <p class="mb-0"><strong>{{ formatDate(selectedRegistration.session.event_date) }}</strong></p>
              </div>
            </div>
          </div>

          <!-- Estado y Timeline -->
          <div class="section-card mb-4">
            <h5 class="section-title"><i class="bi bi-clock-history me-2"></i>Estado y Timeline</h5>
            <div class="timeline">

              <!-- Creado -->
              <div class="timeline-item completed">
                <div class="timeline-marker"><i class="bi bi-check-circle-fill"></i></div>
                <div class="timeline-content">
                  <strong>Inscripción realizada</strong>
                  <p class="text-muted small mb-0">{{ formatDate(selectedRegistration.registered_at) }}</p>
                </div>
              </div>

              <!-- Atendido -->
              <div class="timeline-item" :class="{ completed: selectedRegistration.status === 'Asistió' }">
                <div class="timeline-marker">
                  <i :class="selectedRegistration.status === 'Asistió' ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                </div>
                <div class="timeline-content">
                  <strong>Asistencia confirmada</strong>
                  <p class="text-muted small mb-0" v-if="selectedRegistration.attended_at">
                    {{ formatDate(selectedRegistration.attended_at) }}
                  </p>
                  <p class="text-muted small mb-0" v-else>Pendiente</p>
                </div>
              </div>

              <!-- Anulados -->
              <div class="timeline-item" :class="{ completed: selectedRegistration.status === 'Anulado' }">
                <div class="timeline-marker">
                  <i :class="selectedRegistration.status === 'Anulado' ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
                </div>
                <div class="timeline-content">
                  <strong>Asistencia Anulada</strong>
                  <p class="text-muted small mb-0" v-if="selectedRegistration.cancelled_at">
                    {{ formatDate(selectedRegistration.cancelled_at) }}
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
import { ref, computed, onMounted, nextTick } from 'vue';
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
    
    const confirmTitle = ref("");
    const confirmQuestion = ref("");
    const pendingAction = ref(null);
    const token = ref("")

    let columns = [];

    const url = 'https://apis.madautomate.cloud/webhook/1090f10d-aafd-4c67-bc72-c3365187d6df';

    // Computed properties para estadísticas
    const confirmedCount = computed(() => 
      registrations.value.filter(r => r.status === 'Creado').length
    );

    const attendedCount = computed(() => 
      registrations.value.filter(r => r.status === 'Asistió').length
    );

    const cancelledCount = computed(() => 
      registrations.value.filter(r => r.status === 'Anulado').length
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
            id: 1,
            name: 'Maratón Buenos Aires 2025',
            event_dates: [
              { id: 'session_001', description: '42K Elite' },
              { id: 'session_002', description: '21K' }
            ]
          },
          {
            id: 2,
            name: 'Evento Corporativo Anual',
            event_dates: [
              { id: 'session_003', description: 'Cena de Gala' }
            ]
          }
        ];
      } catch (error) {
        triggerToast('Error', 'No se pudieron cargar los eventos', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Cargar inscripciones del evento seleccionado
    const loadRegistrations = async () => {

        // ❗ limpiar columnas correctamente
        columns.splice(0, columns.length);

        try {
            isLoading.value = true;

            selectedEvent.value = events.value.find(e => e.id === selectedEventId.value);

            const response = await axios.post(url, {
                action: "dataforms",
                selectedEventId: selectedEvent.value.id
            }, {
                headers: { Authorization: `Bearer ${token.value}` }
            });

            // Crear columnas dinámicas
            const dynamicCols = await getForm(response.data[0]);
            dynamicCols.push({key: "status", label: "Estado"})

            // ❗ agregar las columnas
            columns.push(...dynamicCols);

            // Procesar registros
            registrations.value = response.data.map(registration => {
              let parsedFields = [];

              try {
                parsedFields = JSON.parse(registration.fields);
              } catch (e) {
                parsedFields = [];
              }

              const flatFields = parsedFields.reduce((acc, f) => {
                  acc[f.field_name] = f.field_value;
                  return acc;
              }, {});

              return {
                ...registration,
                ...flatFields,
                fields: JSON.parse(registration.fields),
                registered_at: registration.created_at,
                session: JSON.parse(registration.session),
                event: JSON.parse(registration.event),
                status: getStatusLabel(registration.status)
              };
            });

            filterRegistrations();

        } catch (error) {
            triggerToast('Error', 'No se pudieron cargar las inscripciones', false);
        } finally {
            isLoading.value = false;
        }
    };

    const getToken = async () => {
        token.value = sessionStorage.getItem('token');
    };
  
    // Filtrar inscripciones por estado
    const filterRegistrations = () => {

      console.log('filterRegistrations statusFilter', statusFilter.value);
      
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
      
      triggerToast('Éxito', 'QR descargado correctamente', true);
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
    const markAttendance = async (registration) => {

      confirmTitle.value = 'Confirmar Asistencia';
      confirmQuestion.value = `¿Confirmar que ${registration.first_name} asistió al evento?`;
      pendingAction.value = { action: 'attend_registration', data: registration };
      
      // Esperar a que Vue actualice los props
      await nextTick();

      confirmPopup.value.showConfirmPopup();
    };

    const executeMarkAttendance = async (registration) => {
      console.log('executeMarkAttendance', pendingAction.value.data.registration_id)
      try {
        isLoading.value = true;
        // Aquí iría tu llamada al API
        

        const response = await axios.post(url, {
            action: "changeregistration",
            registration_id: pendingAction.value.data.registration_id,
            pendingAction: pendingAction.value.action
        }, {
            headers: { Authorization: `Bearer ${token.value}` }
        });

        loadRegistrations();
        
        triggerToast('Éxito', 'Asistencia registrada correctamente', true);
      } catch (error) {
        triggerToast('Error', 'No se pudo registrar la asistencia', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Anular inscripción
    const cancelRegistration = async (registration) => {
      confirmTitle.value = 'Anular Inscripción';
      confirmQuestion.value = `¿Está seguro de anular la inscripción de ${registration.first_name }? Esta acción liberará el cupo.`;
      pendingAction.value = { action: 'cancel_registration', data: registration };

      // Esperar a que Vue actualice los props
      await nextTick();

      confirmPopup.value.showConfirmPopup();
    };

    const executeCancelRegistration = async (registration) => {
      try {
        isLoading.value = true;
        // Aquí iría tu llamada al API
        const response = await axios.post(url, {
            action: "changeregistration",
            registration_id: pendingAction.value.data.registration_id,
            pendingAction: pendingAction.value.action
        }, {
            headers: { Authorization: `Bearer ${token.value}` }
        });

        // Actualizar localmente
        loadRegistrations();

        triggerToast('Éxito', 'Inscripción anulada correctamente', true);
      } catch (error) {
        triggerToast('Error', 'No se pudo anular la inscripción', false);
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

        triggerToast('Éxito', `Email reenviado a ${registration.email}`, true);
      } catch (error) {
        triggerToast('Error', 'No se pudo reenviar el email', false);
      } finally {
        isLoading.value = false;
      }
    };

    // Exportar a Excel
    const exportToExcel = () => {
      triggerToast('Info', 'Exportando a Excel...', true);
      // Aquí iría la lógica para exportar
    };


    // Manejar respuesta del confirm popup
    const handleConfirmResponse = (confirmed) => {
      console.log('confirmed', confirmed);
      console.log('pendingAction', pendingAction.value);

      if (confirmed && pendingAction.value) {
        const { action, data } = pendingAction.value;
        
        if (action === "attend_registration") {
          executeMarkAttendance(data);
        } else if (action === "cancel_registration") {
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
        created: 'Creado',
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

    const triggerToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      //showToastFlag.value = true;
      toastComponent.value.showToas();
    };


    // función para agregar 3 columnas dinámicas
    async function getForm(register) {

      const response = await axios.post("https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302", {
          action: "dataForm",
          form_id: register.form_id
      }, {
          headers: { Authorization: `Bearer ${token.value}` }
      });

      // ⚠️ copiar sin tocar "data"
      let fieldsParsed = [];

      try {
        fieldsParsed = JSON.parse(response.data.fields);
      } catch (e) {
        console.error("Error al parsear fields para columnas:", e);
        return [];
      }

      // Asegurar array real
      const fieldsArray = Array.isArray(fieldsParsed) ? fieldsParsed : [];

      // Filtrar válidos
      const validFields = fieldsArray.filter(
        f => f?.name && f?.label
      );

      // Primeros 3
      const firstThree = validFields.slice(0, 3);

      // Crear columnas dinámicas
      return firstThree.map(f => ({
        key: f.name,
        label: f.label
      }));
    }

    const resultActions = [
      { 
        label: 'Ver QR', 
        icon: '<i class="bi bi-qr-code"></i>', 
        variant: 'primary', 
        class: 'btn btn-outline btn-sm',
        method: showQR 
      },
      { 
        label: 'Ver Detalles', 
        icon: '<i class="bi bi-eye"></i>', 
        variant: 'info', 
        class: 'btn btn-outline btn-sm',
        method: showDetails 
      },
      { 
        label: 'Reenviar Email', 
        icon: '<i class="bi bi-envelope"></i>', 
        variant: 'secondary', 
        class: 'btn btn-warning btn-sm',
        action: 'resend', 
        method: resendEmail 
      },
      { 
        label: 'Marcar Asistencia', 
        icon: '<i class="bi bi-check-circle"></i>', 
        variant: 'success', 
        class: 'btn btn-style btn-sm',
        method: markAttendance,
        show: (item) => item.status !== 'Asistió'
      },
      { 
        label: 'Anular', 
        icon: '<i class="bi bi-x-circle"></i>', 
        variant: 'danger', 
        class: 'btn btn-danger btn-sm',
        action: 'cancel', 
        method: cancelRegistration,
        show: (item) => item.status === 'Asistió'
      }
    ];






    onMounted(async () => {
      await loadEvents();
      await getToken();
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
      handleConfirmResponse,
      t,
      getToken,
      token,
      getForm,
      pendingAction,
      triggerToast
    };
  }
};
</script>