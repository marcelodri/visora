<template>
  <div class="container-fluid events mt-4">
    <div class="header-section mb-4">
      <h2>{{ $t('events.title') }}</h2>
      <button @click="openModalEvent()" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> {{ $t('events.button_new') }}
      </button>
    </div>
    <hr class="header-divider">

    <!-- Tip Accordion -->
    <div class="accordion mb-5" id="accordionEvents">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingEvents">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseEvents" 
            aria-expanded="false" 
            aria-controls="collapseEvents"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Creá eventos con múltiples sesiones, cada una con su propia fecha, formulario y reglas de inscripción.
            </div>
          </button>
        </h2>
        <div 
          id="collapseEvents" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingEvents" 
          data-bs-parent="#accordionEvents"
        >
          <div class="accordion-body tip-expanded">
            <p>Esta sección te permite <strong>crear eventos con múltiples sesiones</strong>, cada una con configuración independiente de inscripciones y validaciones.</p>
            
            <h6 class="mt-3"><strong>1. Crear el Evento Principal</strong></h6>
            <ul>
              <li><strong>Nombre</strong> y descripción del evento (ejemplo: "Recital de Rock 2025")</li>
              <li><strong>Imagen</strong> del evento (una por evento)</li>
              <li><strong>Categoría</strong> del evento</li>
            </ul>

            <h6 class="mt-3"><strong>2. Configurar Sesiones (Fechas)</strong></h6>
            <p>Cada evento puede tener múltiples sesiones. Por ejemplo, un recital puede tener 2 fechas diferentes.</p>
            <ul>
              <li><strong>Fecha de publicación:</strong> Cuándo se hace visible la sesión</li>
              <li><strong>Fecha del evento:</strong> Cuándo ocurre la sesión</li>
              <li><strong>Hora</strong> y ubicación de la sesión</li>
            </ul>

            <h6 class="mt-3"><strong>3. Configuración de Inscripciones por Sesión</strong></h6>
            <ul>
              <li><strong>Formulario:</strong> Asocia un formulario existente a cada sesión (pueden ser diferentes)</li>
              <li><strong>Tipo de inscripción:</strong>
                <ul class="mt-2">
                  <li><strong>Pública:</strong> Cualquiera puede registrarse</li>
                  <li><strong>Privada:</strong> Requiere asociar un listado de contactos (crealo antes o ve a "Listado de Contactos")</li>
                </ul>
              </li>
              <li><strong>Cupos:</strong> Limitados o ilimitados por sesión</li>
            </ul>

            <h6 class="mt-3"><strong>4. Reglas y Validaciones por Sesión</strong></h6>
            <p>Configurá reglas automáticas específicas para cada sesión: edad mínima, documentación requerida, límites por usuario, etc.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="events"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
        />
      </div>
    </div>

    <!-- MODAL PRINCIPAL -->
    <ModalComponent 
      ref="eventModal" 
      modalId="eventModal" 
      :modalTitle="editingIndex === null ? 'Nuevo Evento' : 'Editar Evento'" 
      class="modal-xl" 
      @closeModal="handleCloseModal"
    >
      <div class="modal-body">
        <div class="accordion accordion-modern" id="eventAccordion">

            <!-- 1. DATOS BÁSICOS -->
            <div class="accordion-item">
            <h2 class="accordion-header" id="headingDatosBasicos">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDatosBasicos" aria-expanded="true">
                <i class="bi bi-info-circle-fill me-2"></i>
                1. Datos Básicos del Evento
                </button>
            </h2>
            <div id="collapseDatosBasicos" class="accordion-collapse collapse show">
                <div class="accordion-body">
                <div class="row g-3">
                    <div class="col-12 col-md-6">
                    <label class="form-label"><i class="bi bi-calendar-event me-2"></i>Nombre del Evento:</label>
                    <input v-model="eventData.name" type="text" class="form-control" placeholder="Ej: Maratón 2025" />
                    </div>
                    <div class="col-12 col-md-6">
                    <label class="form-label"><i class="bi bi-tag-fill me-2"></i>Categoría:</label>
                    <select v-model="eventData.category_id" class="form-select">
                        <option value="">Seleccione una categoría</option>
                        <option value="1">Capacitaciones</option>
                        <option value="2">Eventos Empresariales</option>
                        <option value="3">Maratones / Deportes</option>
                        <option value="4">Recitales</option>
                        <option value="5">Fiestas / Privados</option>
                        <option value="6">Custom</option>
                    </select>
                    </div>
                    <div class="col-12">
                    <label class="form-label"><i class="bi bi-text-paragraph me-2"></i>Descripción:</label>
                    <textarea v-model="eventData.description" class="form-control" rows="4" placeholder="Describe tu evento..."></textarea>
                    </div>
                    
                    <div class="col-12 col-md-6">
                    <label class="form-label"><i class="bi bi-geo-alt-fill me-2"></i>Dirección Física:</label>
                    <input v-model="eventData.physical_address" type="text" class="form-control" placeholder="Ej: Av. Corrientes 1234, CABA" />
                    </div>
                    <div class="col-12 col-md-6">
                    <label class="form-label"><i class="bi bi-link-45deg me-2"></i>Link Virtual (opcional):</label>
                    <input v-model="eventData.virtual_link" type="url" class="form-control" placeholder="https://..." />
                    </div>

                </div>
                </div>
                </div>
            </div>

            <!-- 2. Fechas sesiones -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingFechas">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFechas">
                    <i class="bi bi-calendar-week me-2"></i>2. Fechas/Sesiones del Evento
                    </button>
                </h2>
                <div id="collapseFechas" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <div class="row g-3">

                            <!-- FECHAS MÚLTIPLES / SESIONES -->
                            <div class="col-12">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <small class="text-muted">Configura las fechas de publicación y realización del evento con sus respectivos cupos</small>
                                    </div>
                                </div>

                                <!-- Card por cada fecha -->
                                <div v-if="Array.isArray(eventData.event_dates) && eventData.event_dates.length > 0">
                                    <div v-for="(dateItem, index) in eventData.event_dates.filter(d => d)" :key="index" class="card mb-3 shadow-sm">
                                        <div class="card-header alert-warning bg-gradient d-flex justify-content-between align-items-center">
                                            <strong><i class="bi bi-calendar-check me-2"></i>Sesión {{ index + 1 }}</strong>
                                            <button type="button" class="btn btn-danger btn-sm pt-2" @click="removeEventDate(dateItem, index)">
                                            <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-3">
                                            
                                            <!-- Fecha de publicación -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">
                                                <i class="bi bi-calendar-plus me-2"></i>
                                                <strong>Fecha de Publicación (desde):</strong>
                                                </label>
                                                <input v-model="dateItem.publication_date_start" type="datetime-local" class="form-control" />
                                                <small class="text-muted">Cuándo se abre la publicación para esta sesión</small>
                                            </div>

                                            <!-- Fecha del evento -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">
                                                <i class="bi bi-calendar-event me-2"></i>
                                                <strong>Fecha del Evento:</strong>
                                                </label>
                                                <input v-model="dateItem.event_date" type="datetime-local" class="form-control" />
                                                <small class="text-muted">(Informativo) Cuándo se realiza la sesión</small>
                                            </div>

                                            
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">
                                                <i class="bi bi-calendar-plus me-2"></i>
                                                <strong>Fecha de inscripción (desde):</strong>
                                                </label>
                                                <input v-model="dateItem.registration_start" type="datetime-local" class="form-control" />
                                                <small class="text-muted">Cuándo se abre la inscripción</small>
                                            </div>

                                            <!-- Hasta cuando se puede registrar -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">
                                                <i class="bi bi-calendar-event me-2"></i>
                                                <strong>Fecha de inscripción (hasta):</strong>
                                                </label>
                                                <input v-model="dateItem.registration_deadline" type="datetime-local" class="form-control" />
                                                <small class="text-muted">Hasta cuando se puede registrar</small>
                                            </div>

                                            <!-- Cupo -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">
                                                <i class="bi bi-people-fill me-2"></i>
                                                <strong>Cupo disponible:</strong>
                                                </label>
                                                <input v-model.number="dateItem.capacity" type="number" class="form-control" min="1" placeholder="Ej: 100" />
                                                <small class="text-muted">Cantidad máxima de inscriptos</small>
                                            </div>

                                            <!-- Descripción -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">
                                                <i class="bi bi-card-text me-2"></i>
                                                <strong>Descripción (opcional):</strong>
                                                </label>
                                                <input v-model="dateItem.description" type="text" class="form-control" placeholder="Ej: Turno mañana, Sesión especial, etc." />
                                                <small class="text-muted">Ayuda a identificar esta sesión</small>
                                            </div>

                                            <!-- Formulario -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label"><i class="bi bi-ui-checks-grid me-2"></i>Formulario Asociado:</label>
                                                <select v-model="dateItem.form_id" class="form-select">
                                                    <option value="">Seleccione un formulario</option>
                                                    <option v-for="form in forms" :key="form.id" :value="form.id">{{ form.name }}</option>
                                                </select>
                                            </div>

                                            <!-- Tipo de Inscripción -->
                                            <div class="col-12 col-md-6">
                                                <label class="form-label"><i class="bi bi-lock-fill me-2"></i>Tipo de Inscripción:</label>
                                                <select v-model="dateItem.registration_type" class="form-select" @change="() => onRegistrationTypeChange(dateItem)">
                                                    <option value="public">Pública</option>
                                                    <option value="private">Privada (validación por Excel)</option>
                                                </select>
                                            </div>

                                            <!-- Si es privada -->
                                            <div v-if="dateItem.registration_type === 'private'" class="col-12">
                                                <div class="card border-warning">
                                                  <div class="card-header bg-warning">
                                                    <i class="bi bi-shield-lock-fill me-2"></i>
                                                    <strong>Configuración de Inscripción Privada</strong>
                                                  </div>
                                                  <div class="card-body">
                                                    
                                                    <!-- Select para elegir la lista -->
                                                    <div class="mb-3">
                                                      <label class="form-label">
                                                        <i class="bi bi-list-check me-2"></i>
                                                        <strong>Seleccionar Lista de Validación:</strong>
                                                      </label>
                                                      <select 
                                                        v-model="dateItem.list_id" 
                                                        class="form-select"
                                                        @change="() => onListChange(dateItem)"
                                                      >
                                                        <option value="">Seleccione una lista</option>
                                                        <option v-for="list in availableLists" :key="list.id" :value="list.id">
                                                          {{ list.name }} ({{ list.records_count }} registros)
                                                        </option>
                                                      </select>
                                                      <small class="text-muted">
                                                        Selecciona una lista existente con los datos autorizados para inscripción
                                                      </small>
                                                    </div>

                                                    <!-- Configuración del validador (solo si hay lista seleccionada) -->
                                                    <div v-if="dateItem.list_id && dateItem.selected_columns && dateItem.selected_columns.length > 0" class="card border-primary mb-3">
                                                      <div class="card-header bg-primary text-white">
                                                        <i class="bi bi-gear-fill me-2"></i>
                                                        <strong>Configuración del Validador</strong>
                                                      </div>
                                                      <div class="card-body">
                                                        <div class="row g-3">
                                                          
                                                          <!-- Seleccionar columna validadora -->
                                                          <div class="col-12 col-md-6">
                                                            <label class="form-label">Columna a usar como validador:</label>
                                                            <select v-model="dateItem.validator_column" class="form-select" @change="() => onValidatorChange(dateItem)">
                                                              <option value="">Seleccione una columna</option>
                                                              <option v-for="col in dateItem.selected_columns" :key="col" :value="col">
                                                                {{ col }}
                                                              </option>
                                                            </select>
                                                            <small class="text-muted">Esta columna se usará para validar inscripciones</small>
                                                          </div>
                                                          
                                                          <!-- Nombre del campo (Key) -->
                                                          <div class="col-12 col-md-6">
                                                            <label class="form-label">Nombre del campo (Key):</label>
                                                            <input 
                                                              v-model="dateItem.validator_key" 
                                                              type="text" 
                                                              class="form-control" 
                                                              placeholder="Ej: DNI, Email, Código de Cliente"
                                                              @input="() => onValidatorChange(dateItem)"
                                                            />
                                                            <small class="text-muted">Este nombre se mostrará en el formulario de inscripción</small>
                                                          </div>

                                                        </div>
                                                      </div>
                                                    </div>

                                                    <!-- Preview de la lista seleccionada -->
                                                    <div v-if="dateItem.validator_column && dateItem.excel_data && dateItem.excel_data.length > 0" class="card">
                                                      <div class="card-header bg-light">
                                                        <i class="bi bi-eye me-2"></i>
                                                        <strong>Vista Previa (primeras 5 filas)</strong>
                                                      </div>
                                                      <div class="card-body p-0">
                                                        <div class="table-responsive">
                                                          <table class="table table-sm table-bordered mb-0">
                                                            <thead class="table-primary">
                                                              <tr>
                                                                <th 
                                                                  v-for="col in dateItem.selected_columns" 
                                                                  :key="col" 
                                                                  :class="{ 'table-success': col === dateItem.validator_column }"
                                                                >
                                                                  {{ col }}
                                                                  <i v-if="col === dateItem.validator_column" class="bi bi-check-circle-fill ms-1"></i>
                                                                </th>
                                                              </tr>
                                                            </thead>
                                                            <tbody>
                                                              <tr v-for="(row, idx) in dateItem.excel_data.slice(0, 5)" :key="idx">
                                                                <td 
                                                                  v-for="col in dateItem.selected_columns" 
                                                                  :key="col" 
                                                                  :class="{ 'table-success': col === dateItem.validator_column }"
                                                                >
                                                                  {{ row[col] }}
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                                                        </div>
                                                      </div>
                                                      <!-- <div class="card-footer">
                                                        <div class="alert alert-info mb-0">
                                                          <i class="bi bi-info-circle me-2"></i>
                                                          Se detectaron <strong>{{ dateItem.excel_data.length }}</strong> registros en el archivo
                                                        </div>
                                                      </div> -->
                                                    </div>

                                                    <!-- Link para crear nueva lista -->
                                                    <div class="alert alert-info mt-3 mb-0">
                                                      <i class="bi bi-info-circle me-2"></i>
                                                      ¿No encontrás la lista que necesitás? 
                                                      <router-link to="/lists" class="alert-link">
                                                        <strong>Ir a Gestión de Listas</strong>
                                                      </router-link>
                                                    </div>
                                                    
                                                  </div>
                                                </div>
                                            </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>                        

                                <!-- Mensaje sin datos -->
                                <div v-if="eventData.event_dates.length === 0" class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Importante:</strong> Debes agregar al menos una sesión para que el evento sea válido.
                                </div>
                                
                                <!-- Agregar -->
                                <div class="my-5">
                                    <button type="button" class="btn btn-sm btn-primary" @click="addEventDate">
                                        <i class="bi bi-plus-circle me-1"></i>Agregar Sesión
                                    </button>
                                </div>

                                <!-- Resumen total -->
                                <div v-if="eventData.event_dates.length > 0" class="alert alert-success">
                                    <div class="d-flex align-items-center">
                                    <i class="bi bi-check-circle-fill me-3" style="font-size: 1.5rem;"></i>
                                    <div>
                                        <strong>Resumen del Evento:</strong>
                                        <ul class="mb-0 mt-2">
                                        <li>Total de sesiones programadas: <strong>{{ eventData.event_dates.length }}</strong></li>
                                        <li>Cupo total acumulado: <strong>{{ totalCapacity }}</strong> inscriptos</li>
                                        </ul>
                                    </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. REGLAS DEL EVENTO -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseReglas">
                    <i class="bi bi-shield-check me-2"></i>
                    3. Reglas del Evento
                    </button>
                </h2>
                <div id="collapseReglas" class="accordion-collapse collapse">
                    <div class="accordion-body">
                    <h6 class="mb-3">Reglas Generales</h6>
                    <div class="row g-3 mb-4">
                        <!-- <div class="col-12 col-md-6">
                        <label class="form-label"><i class="bi bi-calendar-x me-2"></i>Fecha límite de inscripción:</label>
                        <input v-model="eventData.registration_deadline" type="date" class="form-control" />
                        </div> -->
                        <div class="col-12 col-md-6">
                        <label class="form-label"><i class="bi bi-person-badge me-2"></i>Edad mínima:</label>
                        <input v-model.number="eventData.min_age" type="number" class="form-control" min="0" placeholder="Ej: 18" />
                        </div>
                        <div class="col-12">
                        <label class="form-label"><i class="bi bi-person-check me-2"></i>Límite de inscripciones por usuario:</label>
                        <input v-model.number="eventData.registrations_per_user" type="number" class="form-control" min="1" placeholder="Ej: 1" />
                        </div>
                    </div>

                    <hr class="my-4">

                    <h6 class="mb-3">Documentación Requerida</h6>
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="eventData.requires_medical_certificate" id="reqMedical">
                            <label class="form-check-label" for="reqMedical">
                            <i class="bi bi-clipboard-pulse me-2"></i>Apto físico obligatorio
                            </label>
                        </div>
                        </div>
                        <div class="col-12 col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="eventData.requires_dni" id="reqDNI">
                            <label class="form-check-label" for="reqDNI">
                            <i class="bi bi-card-heading me-2"></i>DNI obligatorio
                            </label>
                        </div>
                        </div>
                        <div class="col-12 col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="eventData.requires_insurance" id="reqInsurance">
                            <label class="form-check-label" for="reqInsurance">
                            <i class="bi bi-shield-fill-check me-2"></i>Seguro médico
                            </label>
                        </div>
                        </div>
                        <div class="col-12 col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="eventData.requires_consent" id="reqConsent">
                            <label class="form-check-label" for="reqConsent">
                            <i class="bi bi-file-earmark-text me-2"></i>Consentimientos
                            </label>
                        </div>
                        </div>
                        <div class="col-12">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="eventData.enable_ai_validation" id="enableAI">
                            <label class="form-check-label" for="enableAI">
                            <i class="bi bi-robot me-2"></i>Habilitar validación automática con IA
                            </label>
                        </div>
                        <small class="text-muted">La IA validará automáticamente la documentación subida</small>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <!-- 4. CONFIGURACIÓN DE PAGO (OPCIONAL) -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePago">
                    <i class="bi bi-credit-card me-2"></i>
                    4. Configuración de Pago (Opcional)
                    </button>
                </h2>
                <div id="collapsePago" class="accordion-collapse collapse">
                    <div class="accordion-body">
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" v-model="eventData.requires_payment" id="reqPayment">
                        <label class="form-check-label" for="reqPayment">
                        <i class="bi bi-cash-coin me-2"></i>Este evento requiere pago
                        </label>
                    </div>

                    <div v-if="eventData.requires_payment" class="row g-3">
                        <div class="col-12 col-md-6">
                        <label class="form-label">Precio:</label>
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input v-model.number="eventData.price" type="number" class="form-control" min="0" step="0.01" />
                        </div>
                        </div>
                        <div class="col-12 col-md-6">
                        <label class="form-label">Método de pago:</label>
                        <select v-model="eventData.payment_method" class="form-select">
                            <option value="mercadopago">Mercado Pago</option>
                            <option value="transfer">Transferencia</option>
                            <option value="cash">Efectivo</option>
                        </select>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <!-- 5. IMAGEN DEL EVENTO -->
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseImagen">
                    <i class="bi bi-image-fill me-2"></i>
                    5. Imagen del Evento
                    </button>
                </h2>
                <div id="collapseImagen" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <label class="form-label"><i class="bi bi-card-image me-2"></i>Imagen de portada:</label>
                        <input type="file" class="d-none" id="eventImageInput" accept="image/*" @change="handleImageUpload" />
                        <label for="eventImageInput" class="file-input-label">
                            <i class="bi bi-cloud-upload me-2"></i>
                            {{ eventData.fileName || "Seleccionar imagen..." }}
                        </label>
                        <div v-if="eventData.image || eventData.path" class="image-preview-container mt-3">
                            <div class="image-preview">
                            <img :src="eventData.image || `https://madcoder.io/apis/images_upload/${eventData.path}`" class="preview-image" />
                            <button class="btn-remove-image" @click="removeImage" type="button">
                                <i class="bi bi-trash3"></i>
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="saveEvent">
          <i class="bi bi-floppy me-2"></i>Guardar Evento
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeModalEvent">
          <i class="bi bi-x-circle me-2"></i>Cancelar
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
      title="Confirmar eliminación" 
      question="¿Estás seguro de que deseas eliminar este evento?" 
      @response="handleResponse" 
    />

    <LoadingDots :isLoading="isLoading" />

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import { useI18n } from "vue-i18n";

export default {
  name: 'EventsManagement',
  components: {
    ModalComponent,
    DataTableComponent,
    ToastComponent,
    ConfirmPopup
  },
  setup() {
    const { t } = useI18n();
    
    // State
    const events = ref([]);
    const forms = ref([]);
    const availableLists = ref([]);
    const editingIndex = ref(null);
    const eventModal = ref(null);
    const toastComponent = ref(null);
    const confirmPopup = ref(null);
    const showToastFlag = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(true);
    const token = ref(null);
    const isLoading = ref(false);

    // URLs
    const url = "https://apis.madautomate.cloud/webhook/9ff4a876-1944-4643-b41d-37450e37e3e2";
    const url_forms = "https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302";
    const url_lists = "https://apis.madautomate.cloud/webhook/9ff4a876-1944-4643-b41d-37450e37e3e2";

    // Event data
    const eventData = ref({
      name: '',
      description: '',
      category_id: 1,
      event_dates: [],
      event_dates_delete: [],
      physical_address: '',
      virtual_link: '',
      // registration_deadline: '2010-01-01T00:00:00',
      min_age: null,
      registrations_per_user: 1,
      requires_medical_certificate: false,
      requires_dni: false,
      requires_insurance: false,
      requires_consent: false,
      enable_ai_validation: false,
      requires_payment: false,
      price: 0,
      payment_method: 'mercadopago',
      image: '',
      path: '',
      fileName: '',
      status: 'draft'
    });

    // Columns for DataTable
    const columns = [
      { key: 'name', label: 'Nombre del Evento' },
      { key: 'category', label: 'Categoría' },
      { key: 'sessions_count', label: 'Sesiones' },
      { key: 'status', label: 'Estado' }
    ];

    // Computed
    const totalCapacity = computed(() => {
      return eventData.value.event_dates.reduce((sum, date) => sum + (date.capacity || 0), 0);
    });

    // ============================================
    // FUNCIONES PARA GESTIÓN DE LISTAS
    // ============================================

    const loadLists = async () => {
      try {
        const response = await axios.post(url_lists, { action: "getlists" }, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        availableLists.value = response.data.map(item => ({
          ...item,
          excel_data: item.excel_data ? JSON.parse(item.excel_data) : [],
          selected_columns: item.selected_columns ? JSON.parse(item.selected_columns) : []
        }));

      } catch (err) {
        console.error('Error al obtener listas', err);
      }
    };

    const onListChange = (dateItem) => {
      const selectedList = availableLists.value.find(list => list.id == dateItem.list_id);
      
      if (selectedList) {
        // Cargar datos de la lista seleccionada
        dateItem.excel_data = selectedList.excel_data || [];
        dateItem.selected_columns = selectedList.selected_columns || [];
        
        // Resetear validador al cambiar de lista
        dateItem.validator_column = '';
        dateItem.validator_key = '';

        console.log('Lista seleccionada:', {
          list_id: selectedList.id,
          records: dateItem.excel_data.length,
          columns: dateItem.selected_columns
        });
      } else {
        // Limpiar si no hay lista
        dateItem.excel_data = [];
        dateItem.selected_columns = [];
        dateItem.validator_column = '';
        dateItem.validator_key = '';
      }
    };

    const onValidatorChange = (dateItem) => {
      console.log('Validador configurado:', {
        list_id: dateItem.list_id,
        validator_column: dateItem.validator_column,
        validator_key: dateItem.validator_key
      });
    };

    // ============================================
    // FUNCIONES PARA GESTIÓN DE EVENTOS
    // ============================================

    const openModalEvent = (event = null) => {
      if (event) {
        editingIndex.value = events.value.findIndex(e => e.id === event.id);
        eventData.value = { ...event };
      } else {
        editingIndex.value = null;
        resetEventData();
      }
      eventModal.value.openModal();
    };

    const closeModalEvent = () => {
      eventModal.value.closeModal();
      resetEventData();
    };

    const resetEventData = () => {
      eventData.value = {
        name: '',
        description: '',
        category_id: 1,
        event_dates: [],
        event_dates_delete: [],
        physical_address: '',
        virtual_link: '',
        // registration_deadline: '2010-01-01T00:00:00',
        min_age: null,
        registrations_per_user: 1,
        requires_medical_certificate: 0,
        requires_dni: 0,
        requires_insurance: 0,
        requires_consent: 0,
        enable_ai_validation: 0,
        requires_payment: 0,
        price: 0,
        payment_method: 'mercadopago',
        image: '',
        path: '',
        fileName: '',
        status: 'draft'
      };
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        eventData.value.fileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          eventData.value.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const removeImage = () => {
      eventData.value.image = '';
      eventData.value.path = '';
      eventData.value.fileName = '';
    };

    const saveEvent = async () => {
      isLoading.value = true;

      const dataToSend = { ...eventData.value };
      dataToSend.action = "saveform";

      // Convertir booleans a 1/0
      const booleanFields = [
        'requires_medical_certificate',
        'requires_dni',
        'requires_insurance',
        'requires_consent',
        'enable_ai_validation',
        'requires_payment'
      ];

      booleanFields.forEach(field => {
        if (field in dataToSend) {
          dataToSend[field] = dataToSend[field] ? 1 : 0;
        }
      });

      // Preparar event_dates para envío
      const preparedDates = dataToSend.event_dates.map(date => ({
        ...date,
        // Convertir arrays/objetos a JSON strings
        excel_data: date.excel_data ? JSON.stringify(date.excel_data) : '[]',
        selected_columns: date.selected_columns ? JSON.stringify(date.selected_columns) : '[]'
      }));

      dataToSend.event_dates = JSON.stringify(preparedDates);

      console.log('Datos a enviar:', dataToSend);

      try {
        const response = await axios.post(url, dataToSend, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        await loadEvents();
        showToast('Ok!', t('forms.message_success'), true);

      } catch (err) {
        console.error(err);
        showToast('Error!', t('forms.message_error'), false);

      } finally {
        closeModalEvent();
        isLoading.value = false;
      }
    };

    const loadEvents = async () => {
      isLoading.value = true;
      try {
        const response = await axios.post(url, { action: "dataforms" }, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        const data = response.data.map(item => {
          // Convertir 1/0 a true/false
          const booleanFields = [
            'requires_medical_certificate',
            'requires_dni',
            'requires_insurance',
            'requires_consent',
            'enable_ai_validation',
            'requires_payment'
          ];

          booleanFields.forEach(field => {
            if (field in item) {
              item[field] = item[field] == 1;
            }
          });

          // Procesar event_dates
          const parsedDates = (JSON.parse(item.event_dates || '[]') || [])
          .filter(d => d)
          .map(date => {
            
            // Si tiene list_data, procesarlo
            let selected_columns = [];
            let excel_data = [];

            if (date.list_data) {

              // Config
              date.list_id = date.list_data.id;


              try {
                selected_columns = date.list_data.selected_columns 
                  ? JSON.parse(date.list_data.selected_columns) 
                  : [];
              } catch { selected_columns = []; }

              try {
                excel_data = date.list_data.excel_data 
                  ? JSON.parse(date.list_data.excel_data) 
                  : [];
              } catch { excel_data = []; }
            }

            return {
              ...date,
              selected_columns,
              excel_data
            };
          });


          return {
            ...item,
            event_dates: parsedDates,
            event_dates_delete: [],
            sessions_count: parsedDates.length
          };
        });

        events.value = data;

      } catch (err) {
        console.error('Error al obtener eventos', err);
      } finally {
        isLoading.value = false;
      }
    };

    const changeStatusForm = async (item) => {
      isLoading.value = true;
      const dataToSend = { ...item };
      dataToSend.action = "setstatus";

      if (dataToSend.status == "draft") {
        dataToSend.new_status = "published";
      } else {
        dataToSend.new_status = "draft";
      }

      try {
        await axios.post(url, dataToSend, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        await loadEvents();
        showToast('Ok!', t('forms.message_success'), true);

      } catch (err) {
        console.error(err);
        showToast('Error!', t('forms.message_error'), false);
      } finally {
        isLoading.value = false;
      }
    };

    const archivaForm = async (item) => {
      isLoading.value = true;
      const dataToSend = { ...item };
      dataToSend.new_status = "draft";
      dataToSend.action = "setstatus";

      try {
        await axios.post(url, dataToSend, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        await loadEvents();
        showToast('Ok!', t('forms.message_success'), true);

      } catch (err) {
        console.error(err);
        showToast('Error!', t('forms.message_error'), false);
      } finally {
        isLoading.value = false;
      }
    };

    function editForm(item) {
      editingIndex.value = item.id;
      eventData.value = { ...item };
      console.log('item', item)
      openModalEvent(item);
    }

    // ============================================
    // FUNCIONES PARA FECHAS/SESIONES
    // ============================================

    const addEventDate = () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      const dateString = `${yyyy}-${mm}-${dd} 00:00:00`;

      eventData.value.event_dates.push({
        publication_date_start: dateString,
        registration_start: dateString,
        event_date: dateString,
        capacity: null,
        description: '',
        status: 'open',
        form_id: 0,
        registration_type: 'public',
        list_id: null,
        validator_column: '',
        validator_key: '',
        excel_data: [],
        selected_columns: [],
        registration_deadline: dateString
      });
    };


    const removeEventDate = (dateItem, index) => {
      eventData.value.event_dates.splice(index, 1);
      if (dateItem.id) {
        eventData.value.event_dates_delete.push(dateItem);
      }
    };

    // ============================================
    // FUNCIONES PARA FORMULARIOS
    // ============================================

    const getForms = async () => {
      isLoading.value = true;

      try {
        const response = await axios.post(url_forms, { action: "dataforms" }, {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
          forms.value = await Promise.all(
            response.data.map(async (form) => {
              return {
                ...form,
                fields: form.fields ? JSON.parse(form.fields) : [],
                colorOptions: form.colorOptions ? JSON.parse(form.colorOptions) : [],
                images: form.images ? JSON.parse(form.images) : []
              };
            })
          );
        }
      } catch (error) {
        console.error('Error al obtener formularios:', error);
      } finally {
        isLoading.value = false;
      }
    };

    // ============================================
    // UTILIDADES
    // ============================================

    const showToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      showToastFlag.value = true;
    };

    const handleCloseModal = () => {
      resetEventData();
    };

    const handleResponse = (response) => {
      if (response) {
        // Confirmar eliminación
      }
    };

    const getToken = async () => {
      token.value = sessionStorage.getItem('token');
    };

    const onRegistrationTypeChange = (dateItem) => {
      if (dateItem.registration_type === "public") {
        dateItem.list_id = null;
        dateItem.validator_column = "";
        dateItem.validator_key = "";

        // Limpio el objeto completo
        dateItem.list_data = {
          id: null,
          selected_columns: [],
          excel_data: [],
          validator_column: "",
          validator_key: ""
        };
      }
    };

    // Actions for DataTable
    const resultActions = [
      { 
        label: t('events.list_edit'),
        class: 'btn btn-outline btn-sm',
        method: editForm,
        icon: () => '<i class="bi bi-pencil-square"></i>' 
      },
      { 
        label: t('events.list_status'),
        class: 'btn btn-outline btn-sm',
        method: changeStatusForm,
        icon: (item) => 
          item.status === 'published'
            ? '<i class="bi bi-cloud-check-fill"></i>'
            : '<i class="bi bi-cloud-arrow-up"></i>',
        show: (item) => item.status !== 'published'
      },
      { 
        label: t('events.list_archive'),
        class: 'btn btn-danger btn-sm',
        method: archivaForm,
        icon: (item) => 
          item.status === 'draft'
            ? '<i class="bi bi-cloud-minus-fill"></i>'
            : '<i class="bi bi-cloud-download"></i>',
        show: (item) => item.status === 'published'
      }
    ];


    // ============================================
    // LIFECYCLE
    // ============================================

    onMounted(async () => {
      await getToken();
      await loadLists();
      await getForms();
      await loadEvents();
    });

    // ============================================
    // RETURN
    // ============================================

    return {
      // State
      events,
      forms,
      availableLists,
      eventData,
      columns,
      resultActions,
      editingIndex,
      eventModal,
      toastComponent,
      confirmPopup,
      showToastFlag,
      toastTitle,
      toastMessage,
      isSuccess,
      isLoading,
      totalCapacity,
      token,
      
      // Funciones de eventos
      openModalEvent,
      closeModalEvent,
      saveEvent,
      editForm,
      changeStatusForm,
      archivaForm,
      
      // Funciones de sesiones
      addEventDate,
      removeEventDate,
      
      // Funciones de listas
      onListChange,
      onValidatorChange,
      
      // Funciones de imágenes
      handleImageUpload,
      removeImage,
      
      // Utilidades
      handleCloseModal,
      handleResponse,
      onRegistrationTypeChange,
      // i18n
      t
    };
  }
};
</script>