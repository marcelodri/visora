<template>
  <div class="container-fluid emails-module mt-4" :class="{ 'campaign-builder-modal-mode': isModal }">
    
    <!-- HEADER -->
    <div v-if="!isModal" class="emails-header mb-4">
      <div>
        <h2>Crear Campaña</h2>
        <p class="text-muted mb-0" style="font-size:0.9rem">Seguí los pasos para armar y enviar tu campaña</p>
      </div>
      <!-- <button class="btn btn-link text-secondary" @click="$router.push('/panel/emails/campaigns')">
        <i class="bi bi-arrow-left me-1"></i>Volver
      </button> -->
    </div>

    <hr v-if="!isModal" class="header-divider">

    <div v-if="!isModal" class="accordion mb-4" id="accordionEmailTip">
      <!-- <div class="accordion-item tip-banner-style">
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
      </div> -->
    </div>

    <!-- WIZARD CONTAINER -->
    <div class="wizard-container">

      <!-- STEP BAR -->
      <div class="wizard-steps-bar">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="wizard-step-item"
          :class="{ active: currentStep === i, done: currentStep > i }"
        >
          <div class="step-circle">
            <i v-if="currentStep > i" class="bi bi-check-lg"></i>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="step-label">{{ step }}</span>
          <div class="step-connector"></div>
        </div>
      </div>

      <!-- ══ STEP 0: CAMPAIGN INFO ══ -->
      <div ref="wizardBody" v-if="currentStep === 0" class="wizard-body">
        <h5 class="fw-bold mb-4"><i class="bi bi-info-circle me-2 text-primary"></i>Información de la campaña</h5>
        <div class="row g-3">
          <div class="col-12 col-md-8">
            <label class="form-label fw-semibold">Nombre de la campaña *</label>
            <input
              v-model="campaign.name"
              type="text"
              class="form-control form-control-lg"
              :class="{ 'is-invalid': campaign.name.trim().length === 0 }"
              placeholder="Ej: Newsletter Mayo 2025"
            />
            <div class="invalid-feedback">El nombre es obligatorio para continuar</div>
            <small v-if="campaign.name.trim().length > 0" class="text-success"><i class="bi bi-check-circle me-1"></i>Listo, hacé click en <strong>Siguiente</strong></small>
            <small v-else class="text-muted">Un nombre interno para identificar la campaña</small>
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold">Descripción <span class="text-muted fw-normal">(opcional)</span></label>
            <textarea
              v-model="campaign.description"
              class="form-control"
              rows="3"
              placeholder="Descripción o notas internas de esta campaña..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- ══ STEP 1: TEMPLATE ══ -->
      <div ref="wizardBody" v-else-if="currentStep === 1" class="wizard-body">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0"><i class="bi bi-file-earmark-code me-2 text-primary"></i>Seleccioná un template</h5>
          <!-- <div class="d-flex gap-2">
            <button class="btn btn-outline" @click="openCreateTemplate">
              <i class="bi bi-plus-circle me-1"></i>Crear nuevo
            </button>
            <label class="btn btn-outline">
              <i class="bi bi-upload me-1"></i>Importar HTML
              <input type="file" accept=".html,.htm" class="d-none" @change="importTemplateHtml" />
            </label>
          </div> -->
        </div>

        <!-- Template loading -->
        <div v-if="loadingTemplates" class="text-center py-4">
          <div class="spinner-border text-primary spinner-border-sm"></div>
          <span class="ms-2 text-muted">Cargando templates...</span>
        </div>

        <!-- No templates -->
        <div v-else-if="!templates.length" class="text-center py-5">
          <i class="bi bi-file-earmark-x" style="font-size:2.5rem;color:#dee2e6"></i>
          <p class="text-muted mt-2">No tenés templates. Creá uno nuevo o importá un HTML.</p>
        </div>

        <!-- Template grid -->
        <div v-else class="template-grid">
          <div
            v-for="tmpl in templates"
            :key="tmpl.id"
            class="template-card"
            :class="{ selected: campaign.template_id === tmpl.id }"
            @click="selectTemplate(tmpl)"
          >
            <div v-if="campaign.template_id === tmpl.id" class="template-selected-check">
              <i class="bi bi-check-lg"></i>
            </div>
            <div class="template-preview">
              <iframe :srcdoc="tmpl.html_content" sandbox="" title="preview"></iframe>
            </div>
            <div class="template-meta">
              <h6>{{ tmpl.name }}</h6>
              <p class="subject">{{ tmpl.subject }}</p>
              <div class="template-vars mt-1">
                <span v-for="v in tmpl.variables" :key="v" class="var-chip" v-text="varLabel(v)"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Inline template creation form -->
        <div v-if="showInlineTemplateForm" class="card mt-4 border-primary" style="border-radius:12px">
          <div class="card-header" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:11px 11px 0 0">
            <h6 class="mb-0"><i class="bi bi-plus-circle me-2"></i>Nuevo Template</h6>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Nombre *</label>
                <input v-model="inlineTemplate.name" type="text" class="form-control" placeholder="Nombre del template" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Asunto *</label>
                <input v-model="inlineTemplate.subject" type="text" class="form-control" placeholder="Asunto del email" />
              </div>
            </div>
            <div v-if="inlineDetectedVars.length" class="mb-2">
              <span class="text-muted" style="font-size:0.82rem">Variables detectadas:</span>
              <span v-for="v in inlineDetectedVars" :key="v" class="variable-tag ms-1" v-text="varLabel(v)"></span>
            </div>
            <div class="mb-2">
              <button type="button" class="btn btn-sm" style="background:#e9ecef;color:#495057;border-radius:8px" @click="insertInlineBaseTemplate">
                <i class="bi bi-layout-text-window me-1"></i>Insertar plantilla base (compatible Outlook)
              </button>
            </div>
            <div class="html-editor-container">
              <div class="html-editor-pane">
                <div class="pane-header"><i class="bi bi-code me-1"></i>Editor HTML</div>
                <textarea
                  v-model="inlineTemplate.html_content"
                  class="html-textarea"
                  spellcheck="false"
                  @input="onInlineHtmlInput"
                  placeholder="Pegá tu HTML aquí..."
                ></textarea>
              </div>
              <div class="html-preview-pane">
                <div class="pane-header"><i class="bi bi-eye me-1"></i>Vista previa</div>
                <iframe
                  :srcdoc="inlineTemplate.html_content || previewPlaceholder"
                  sandbox=""
                  class="html-preview-frame"
                  title="preview"
                ></iframe>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button class="btn btn-outline" @click="showInlineTemplateForm = false">Cancelar</button>
              <button class="btn btn-outline" :disabled="savingTemplate" @click="saveInlineTemplate">
                <span v-if="savingTemplate" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-circle me-2"></i>
                Guardar y usar este template
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ STEP 2: RECIPIENTS ══ -->
      <div ref="wizardBody" v-else-if="currentStep === 2" class="wizard-body">
        <div class="d-flex justify-content-between align-items-start mb-4">
          <h5 class="fw-bold mb-0"><i class="bi bi-people me-2 text-primary"></i>Elegí los destinatarios</h5>
          <button v-if="scheduleMode !== null" class="btn btn-outline" @click="scheduleMode = null; campaign.source_type = null; selectedClientIds = []; selectedViewName = null">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Cambiar tipo de envío
          </button>
        </div>

        <!-- INITIAL QUESTION: Schedule mode -->
        <div v-if="scheduleMode === null" class="mb-4">
          <p class="text-muted fw-semibold mb-3 pt-2">¿Cuál será el tipo de envío?</p>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div
                class="source-option"
                @click="scheduleMode = 'once'"
              >
                <div class="source-icon"><i class="bi bi-calendar-check text-primary"></i></div>
                <h6>Ahora o una vez</h6>
                <p>Envío inmediato o programado <br>para una fecha específica</p>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div
                class="source-option"
                @click="scheduleMode = 'recurring'"
              >
                <div class="source-icon"><i class="bi bi-arrow-repeat text-success"></i></div>
                <h6>Recurrente</h6>
                <p>Se repite cada N meses con base dinámica <br>(nuevos clientes se incluyen automáticamente)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ORIGEN DE DATOS: Siempre se muestran 3 opciones -->
        <template v-if="scheduleMode !== null">
          <div class="mb-4">
            <p class="text-muted fw-semibold mb-3">¿Dónde se encuentran tus datos?</p>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <div
                  class="source-option"
                  :class="{ selected: campaign.source_type === 'db' }"
                  @click="selectSourceDb"
                >
                  <div class="source-icon"><i class="bi bi-people-fill text-primary"></i></div>
                  <h6>Clientes</h6>
                  <p>Seleccioná de tu lista de clientes</p>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div
                  class="source-option"
                  :class="{ selected: campaign.source_type === 'excel' }"
                  @click="selectSourceExcel"
                >
                  <div class="source-icon"><i class="bi bi-file-earmark-excel-fill text-success"></i></div>
                  <h6>Excel</h6>
                  <p>Importá un archivo .xlsx o .csv</p>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div
                  class="source-option"
                  :class="{ selected: campaign.source_type === 'views' }"
                  @click="campaign.source_type = 'views'; loadViews()"
                >
                  <div class="source-icon"><i class="bi bi-database text-info"></i></div>
                  <h6>Vistas</h6>
                  <p>Seleccioná una vista MySQL</p>
                </div>
              </div>
            </div>
          </div>

          <!-- DB MODE: Clientes -->
          <template v-if="campaign.source_type === 'db'">
            <div v-if="loadingClients" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span class="ms-2 text-muted">Cargando clientes...</span>
            </div>
            <template v-else>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="form-check mb-0">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="selectAllClients"
                      :checked="clients.length > 0 && selectedClientIds.length === clients.length"
                      @change="toggleSelectAll"
                    />
                    <label class="form-check-label fw-semibold" for="selectAllClients">Seleccionar todos</label>
                  </div>
                  <span class="selected-count-badge">{{ selectedClientIds.length }} seleccionados</span>
                </div>
                <div>
                  <input
                    v-model="clientSearch"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Buscar..."
                    style="width:220px"
                  />
                </div>
              </div>
              <div class="recipients-table-wrapper">
                <table class="table recipients-table">
                  <thead>
                    <tr>
                      <th style="width:40px"></th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Empresa</th>
                      <th>Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="client in filteredClients" :key="client.id">
                      <td>
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :value="client.id"
                          v-model="selectedClientIds"
                        />
                      </td>
                      <td>{{ client.nombre }}</td>
                      <td><a :href="`mailto:${client.email}`" class="text-muted">{{ client.email }}</a></td>
                      <td>{{ client.empresa }}</td>
                      <td class="text-muted">{{ client.telefono }}</td>
                    </tr>
                    <tr v-if="!filteredClients.length">
                      <td colspan="5" class="text-center text-muted py-3">No se encontraron clientes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="campaignTemplate?.variables?.length && dbColumns.length" class="mb-4 mt-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-link me-2 text-primary"></i>Mapea los campos a las variables del template</h6>
                <table class="table column-mapping-table">
                  <thead>
                    <tr>
                      <th>Variable del template</th>
                      <th>Campo</th>
                      <th>Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="variable in campaignTemplate.variables" :key="variable">
                      <td><span class="variable-tag" v-text="varLabel(variable)"></span></td>
                      <td>
                        <select v-model="dbVariableMapping[variable]" class="form-select form-select-sm">
                          <option value="">-- seleccionar campo --</option>
                          <option v-for="col in dbColumns" :key="col" :value="col">{{ col }}</option>
                        </select>
                      </td>
                      <td class="text-muted" style="font-size:0.82rem">
                        {{ getMappedExample(dbVariableMapping, variable, selectedClients[0] || clients[0]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </template>

          <!-- EXCEL MODE -->
          <template v-if="campaign.source_type === 'excel'">
            <!-- Drop zone -->
            <div
              v-if="!excelData.rows.length"
              class="drop-zone"
              :class="{ 'drag-over': dragging }"
              @click="$refs.excelInput.click()"
              @dragover.prevent="dragging = true"
              @dragleave="dragging = false"
              @drop.prevent="handleDrop"
            >
              <div class="drop-icon"><i class="bi bi-file-earmark-arrow-up"></i></div>
              <h5 class="text-muted">Arrastrá tu archivo aquí</h5>
              <p class="text-muted mb-3">o hacé click para seleccionar</p>
              <span style="background:#f0f0f0;border-radius:8px;padding:4px 12px;font-size:0.82rem;color:#6c757d">
                .xlsx · .xls · .csv
              </span>
              <input ref="excelInput" type="file" accept=".xlsx,.xls,.csv" class="d-none" @change="loadExcel" />
            </div>

            <!-- Excel loaded: mapping -->
            <div v-else>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <strong>{{ excelData.rows.length }}</strong> filas cargadas desde
                  <span class="badge bg-light text-dark border ms-1"><i class="bi bi-file-earmark-excel me-1"></i>{{ excelData.filename }}</span>
                </div>
                <button class="btn btn-sm btn-danger" @click="clearExcel">
                  <i class="bi bi-x-circle me-1"></i>Cambiar archivo
                </button>
              </div>

              <!-- Variable mapping -->
              <div v-if="campaignTemplate && campaignTemplate.variables.length" class="mb-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-link me-2 text-primary"></i>Mapeá las columnas del Excel a las variables del template</h6>
                <table class="table column-mapping-table">
                  <thead>
                    <tr>
                      <th>Variable del template</th>
                      <th>Columna del Excel</th>
                      <th>Ejemplo (primera fila)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="variable in campaignTemplate.variables" :key="variable">
                      <td><span class="variable-tag" v-text="varLabel(variable)"></span></td>
                      <td>
                        <select v-model="columnMapping[variable]" class="form-select form-select-sm">
                          <option value="">— seleccionar columna —</option>
                          <option v-for="col in excelData.headers" :key="col" :value="col">{{ col }}</option>
                        </select>
                      </td>
                      <td class="text-muted" style="font-size:0.82rem">
                        {{ columnMapping[variable] && excelData.rows[0] ? excelData.rows[0][columnMapping[variable]] : '—' }}
                      </td>
                    </tr>
                    <!-- email column is always required -->
                    <tr>
                      <td><span class="variable-tag" style="background:rgba(220,53,69,.1);color:#dc3545">email *</span></td>
                      <td>
                        <select v-model="columnMapping['__email']" class="form-select form-select-sm border-danger">
                          <option value="">— seleccionar columna email —</option>
                          <option v-for="col in excelData.headers" :key="col" :value="col">{{ col }}</option>
                        </select>
                      </td>
                      <td class="text-muted" style="font-size:0.82rem">
                        {{ columnMapping['__email'] && excelData.rows[0] ? excelData.rows[0][columnMapping['__email']] : '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="mb-4">
                <h6 class="fw-bold mb-2"><i class="bi bi-link me-2 text-primary"></i>Columna de email</h6>
                <div class="row">
                  <div class="col-md-4">
                    <select v-model="columnMapping['__email']" class="form-select border-danger">
                      <option value="">— seleccionar columna email *—</option>
                      <option v-for="col in excelData.headers" :key="col" :value="col">{{ col }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Preview rows -->
              <div class="recipients-table-wrapper">
                <table class="table recipients-table">
                  <thead>
                    <tr>
                      <th v-for="h in excelData.headers" :key="h">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in excelData.rows.slice(0, 8)" :key="i">
                      <td v-for="h in excelData.headers" :key="h">{{ row[h] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-if="excelData.rows.length > 8" class="text-muted mt-1" style="font-size:0.82rem">
                Mostrando 8 de {{ excelData.rows.length }} filas
              </p>
            </div>
          </template>

          <!-- VIEWS MODE (formerly Query) -->
          <template v-if="campaign.source_type === 'views'">
            <div class="mb-4">
              <label class="form-label fw-semibold">Seleccioná una vista MySQL *</label>
              <div v-if="loadingViews" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary"></div>
                <span class="ms-2 text-muted">Cargando vistas...</span>
              </div>
              <template v-else>
                <select v-model="selectedViewName" @change="executeView(selectedViewName)" class="form-select form-select-lg" :disabled="availableViews.length === 0">
                  <option value="">— Seleccionar vista —</option>
                  <option v-for="view in availableViews" :key="view" :value="view">
                    {{ view }}
                  </option>
                </select>
                <small v-if="availableViews.length === 0" class="text-danger">
                  No hay vistas disponibles. Verifica tu conexión a la base de datos.
                </small>
                <small v-else-if="selectedViewName && !loadingViewStructure && !viewExecuted" class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>Seleccionaste la vista <strong>{{ selectedViewName }}</strong>. Hace click en Ejecutar vista para ver la vista previa.
                </small>
              </template>
            </div>

            <!-- View Results -->
            <template v-if="viewExecuted && viewResults.length > 0">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div v-if="campaign.source_type !== 'views'" class="d-flex align-items-center gap-3">
                  <div class="form-check mb-0">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="selectAllView"
                      :checked="selectedViewResultIds.length === viewResults.length"
                      @change="e => {
                        if (e.target.checked) {
                          selectedViewResultIds = viewResults.map((r, idx) => idx);
                        } else {
                          selectedViewResultIds = [];
                        }
                      }"
                    />
                    <label class="form-check-label fw-semibold" for="selectAllView">Seleccionar todos</label>
                  </div>
                  <span class="selected-count-badge">{{ selectedViewResultIds.length }} seleccionados</span>
                </div>
              </div>

              <div class="recipients-table-wrapper">
                <table class="table recipients-table">
                  <thead>
                    <tr>
                      <th v-if="campaign.source_type !== 'views'" style="width:40px"></th>
                      <th v-for="col in Object.keys(viewResults[0] || {})" :key="col">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in viewResults" :key="idx">
                      <td v-if="campaign.source_type !== 'views'">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :value="idx"
                          v-model="selectedViewResultIds"
                        />
                      </td>
                      <td v-for="col in Object.keys(viewResults[0] || {})" :key="col">
                        {{ row[col] }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="campaignTemplate?.variables?.length && viewResults.length" class="mb-4 mt-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-link me-2 text-primary"></i>Mapea los campos del resultado a las variables del template</h6>
                <table class="table column-mapping-table">
                  <thead>
                    <tr>
                      <th>Variable del template</th>
                      <th>Campo del resultado</th>
                      <th>Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="variable in campaignTemplate.variables" :key="variable">
                      <td><span class="variable-tag" v-text="varLabel(variable)"></span></td>
                      <td>
                        <select v-model="dbVariableMapping[variable]" class="form-select form-select-sm">
                          <option value="">-- seleccionar campo --</option>
                          <option v-for="col in Object.keys(viewResults[0] || {})" :key="col" :value="col">{{ col }}</option>
                        </select>
                      </td>
                      <td class="text-muted" style="font-size:0.82rem">
                        {{ viewResults[0] ? viewResults[0][dbVariableMapping[variable]] || '—' : '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-else-if="viewExecuted && viewResults.length === 0">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-1"></i>
                La vista no devolvió resultados. Verificá la configuración.
              </div>
            </template>
          </template>
        </template>
      </div>
 
      <!-- ══ STEP 3: REVIEW & SEND ══ -->
      <div ref="wizardBody" v-else-if="currentStep === 3" class="wizard-body">
        <h5 class="fw-bold mb-4"><i class="bi bi-check2-all me-2 text-primary"></i>Revisá y enviá tu campaña</h5>

        <div class="row g-3 mb-4">
          <!-- Summary -->
          <div class="col-12 col-lg-7">
            <div class="review-section">
              <h6>Resumen de la campaña</h6>
              <div class="review-item">
                <span class="review-label"><i class="bi bi-tag me-1"></i>Nombre</span>
                <span class="review-value">{{ campaign.name }}</span>
              </div>
              <div class="review-item">
                <span class="review-label"><i class="bi bi-file-earmark-code me-1"></i>Template</span>
                <span class="review-value">{{ campaignTemplate?.name || '—' }}</span>
              </div>
              <div class="review-item">
                <span class="review-label"><i class="bi bi-envelope me-1"></i>Asunto</span>
                <span class="review-value">{{ campaignTemplate?.subject || '—' }}</span>
              </div>
              <div class="review-item">
                <span class="review-label"><i class="bi bi-people me-1"></i>Destinatarios</span>
                <span class="review-value" style="color:#198754">
                  <template v-if="campaign.recipient_mode === 'dynamic'">
                    <i class="bi bi-lightning-charge-fill me-1"></i>Base dinámica ({{ selectedViewName }})
                  </template>
                  <template v-else>
                    <i class="bi bi-person-check-fill me-1"></i>{{ finalRecipients.length }} contactos
                  </template>
                </span>
              </div>
              <div class="review-item">
                <span class="review-label"><i class="bi bi-database me-1"></i>Fuente</span>
                <span class="review-value">{{ 
                  campaign.source_type === 'db' 
                    ? 'Base de datos' 
                    : campaign.source_type === 'excel'
                      ? 'Excel importado'
                      : 'Vista'
                }}</span>
              </div>
            </div>

            <!-- Variables preview -->
            <div v-if="campaignTemplate?.variables?.length && campaign.recipient_mode !== 'dynamic'" class="review-section">
              <h6>Variables del template</h6>
              <div v-if="finalRecipients.length" class="table-responsive">
                <table class="table table-sm" style="font-size:0.82rem">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th v-for="v in campaignTemplate.variables" :key="v">{{ v }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in finalRecipients.slice(0, 3)" :key="i">
                      <td>{{ r.email }}</td>
                      <td v-for="v in campaignTemplate.variables" :key="v">
                        <span v-if="r.variables?.[v]">{{ r.variables[v] }}</span>
                        <span v-else class="text-muted">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="finalRecipients.length > 3" class="text-muted" style="font-size:0.78rem">
                  + {{ finalRecipients.length - 3 }} más...
                </p>
              </div>
            </div>
          </div>

          <!-- Preview template -->
          <div class="col-12 col-lg-5">
            <div class="review-section" style="height:340px;padding:0;overflow:hidden;border-radius:10px">
              <h6 style="padding:0.8rem 1rem;margin:0;border-bottom:1px solid #e9ecef">Vista previa del email</h6>
              <iframe
                v-if="campaignTemplate"
                :srcdoc="previewHtml"
                sandbox=""
                style="width:100%;height:290px;border:none"
                title="preview"
              ></iframe>
            </div>
          </div>
        </div>

        <!-- TEST EMAIL SECTION (Step 3 only) -->
        <div v-if="currentStep === 3" class="review-section mb-4 p-3" style="background:#f8f9fa;border-radius:10px;border:1px solid #e9ecef">
          <div class="mb-3">
            <h6 class="mb-3 fw-semibold"><i class="bi bi-flask me-1"></i>Envío de prueba (opcional)</h6>
            <div class="d-flex flex-wrap gap-2 align-items-center flex-1" style="max-width:500px">
              <input
                v-model="testEmail"
                type="email"
                class="form-control form-control-sm"
                placeholder="correo@ejemplo.com"
                style="max-width:280px"
                :disabled="sendingTest"
              />
              <button
                class="btn btn-sm btn-outline-primary"
                :disabled="!testEmail || sendingTest || !campaignTemplate"
                @click="sendTestEmail"
              >
                <span v-if="sendingTest" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-send me-1"></i>Enviar prueba
              </button>
            </div>
            <div v-if="testResult" class="d-flex align-items-center gap-2" :class="testResult.success ? 'text-success' : 'text-danger'">
              <i class="bi" :class="testResult.success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
              <small>{{ testResult.message }}</small>
            </div>
          </div>
          <p class="text-muted small mb-0 mt-2">
            <i class="bi bi-info-circle me-1"></i>
            Envía un email de prueba a una dirección para verificar el diseño y variables antes de crear la campaña. 
            No guarda la campaña ni programa envíos.
          </p>
        </div>

        <!-- SCHEDULE SECTION -->
        <div v-if="scheduling" class="review-section mb-4">
          <div class="mb-3">
            <h6 class="mb-0"><i class="bi bi-clock me-1"></i>Programar envío</h6>
          </div>

          <!-- Una vez -->
          <div v-if="scheduleMode === 'once'" class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Fecha y hora de envío *</label>
              <input v-model="scheduledAt" type="datetime-local" class="form-control" :min="minDatetime" />
            </div>
          </div>

          <!-- Recurrente -->
          <div v-if="scheduleMode === 'recurring'" class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold">¿Cómo se define el día de envío?</label>
              <div class="btn-group d-flex flex-wrap" role="group">
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="recurringAnchorType === 'day_of_month' ? 'btn-primary' : 'btn-outline'"
                  @click="recurringAnchorType = 'day_of_month'"
                >
                  Día fijo de cada mes
                </button>
                <!-- <button
                  type="button"
                  class="btn btn-sm"
                  :class="recurringAnchorType === 'specific_date' ? 'btn-primary' : 'btn-outline-secondary'"
                  @click="recurringAnchorType = 'specific_date'"
                >
                  Fecha de inicio específica
                </button> -->
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="recurringAnchorType === 'daily' ? 'btn-primary' : 'btn-outline'"
                  @click="recurringAnchorType = 'daily'"
                >
                  Todos los días
                </button>
              </div>
            </div>

            <div v-if="recurringAnchorType === 'day_of_month'" class="col-6 col-md-3">
              <label class="form-label fw-semibold">Día del mes</label>
              <select v-model="recurringDay" class="form-select">
                <option v-for="d in 28" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div v-else-if="recurringAnchorType === 'specific_date'" class="col-6 col-md-4">
              <label class="form-label fw-semibold">Fecha de inicio *</label>
              <input v-model="recurringDate" type="date" class="form-control" :min="minRecurringDate" />
            </div>

            <div class="col-6 col-md-3">
              <label class="form-label fw-semibold">Hora</label>
              <input v-model="recurringTime" type="time" class="form-control" />
            </div>

            <div v-if="recurringAnchorType !== 'daily'" class="col-6 col-md-3">
              <label class="form-label fw-semibold">Repetir cada</label>
              <select v-model.number="recurringEveryMonths" class="form-select">
                <option v-for="n in 12" :key="n" :value="n">{{ n }} {{ n === 1 ? 'mes' : 'meses' }}</option>
              </select>
            </div>

            <div class="col-12">
              <div class="alert alert-info py-2 px-3 mb-0" style="font-size:0.84rem">
                <i class="bi bi-info-circle me-1"></i>
                <span v-if="recurringAnchorType === 'day_of_month'">
                  Se enviará el <strong>día {{ recurringDay }}</strong> de cada mes, <strong>{{ recurringIntervalLabel }}</strong>
                </span>
                <span v-else-if="recurringAnchorType === 'specific_date'">
                  Se enviará a partir de la fecha elegida y luego <strong>{{ recurringIntervalLabel }}</strong>
                </span>
                <span v-else>
                  Se enviará <strong>todos los días</strong>
                </span>
                a las <strong>{{ recurringTime }}</strong>.
                Próximo envío: <strong>{{ nextRecurringDate }}</strong>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <!-- WIZARD FOOTER -->
      <div class="wizard-footer">
        <button
          v-if="currentStep > 0"
          class="btn btn-outline"
          @click="prevStep"
        >
          <i class="bi bi-arrow-left me-1"></i>Anterior
        </button>
        <div v-else></div>

        <!-- Step 3 send actions (always visible in footer) -->
        <div v-if="currentStep === 3" class="d-flex gap-2 align-items-center">
          <template v-if="scheduling">
            <button class="btn btn-outline" @click="scheduling = false">Cancelar</button>
            <button
              class="btn btn-schedule"
              :disabled="(!finalRecipients.length && campaign.source_type !== 'views') || sending"
              @click="send(true)"
            >
              <i class="bi bi-clock me-2"></i>Confirmar programación
            </button>
          </template>
          <template v-else>
            <button
              class="btn btn-schedule"
              :disabled="(!finalRecipients.length && campaign.source_type !== 'views') || sending"
              @click="startScheduling"
            >
              <i class="bi bi-clock me-2"></i>Programar envío
            </button>
            <button
              v-if="scheduleMode !== 'recurring'"
              class="btn btn-send-now"
              @click="send(false)"
            >
              <i class="bi bi-send-fill me-2"></i>Enviar ahora
            </button>
          </template>
        </div>

        <button
          v-if="currentStep < steps.length - 1"
          class="btn btn-outline"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Siguiente <i class="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>

    <!-- SENDING OVERLAY -->
    <div v-if="sending" class="sending-overlay">
      <div class="spinner-border text-light"></div>
      <h5>Generando compaña...</h5>
      <!-- <p class="text-white-50" style="font-size:0.9rem">Generando compaña</p> -->
    </div>

    <!-- SUCCESS MODAL -->
    <div v-if="showSuccess" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content h-100" style="border-radius:14px">
          <div class="modal-header" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:14px 14px 0 0">
            <h5 class="modal-title mb-0">
              Campañas
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="goToCampaigns()"></button>
          </div>
          <div class="modal-body text-center p-5" style="height:fit-content">
            <div style="font-size:4rem;color:#198754"><i class="bi bi-check-circle-fill"></i></div>
            <h4 class="mt-3 fw-bold">
              {{ lastDeliveryMode === 'now' ? '¡Campaña enviada!' : '¡Campaña programada!' }}
            </h4>
            <p class="text-muted">
              <strong>{{ campaign.name }}</strong> fue
              <span v-if="lastDeliveryMode === 'recurring'">
                programada de forma recurrente
                <span v-if="recurringAnchorType === 'day_of_month'">el día <strong>{{ recurringDay }}</strong> de cada mes</span>
                <span v-else>a partir del <strong>{{ recurringDate }}</strong></span>,
                <strong>{{ recurringIntervalLabel }}</strong> a las <strong>{{ recurringTime }}</strong>.
                Próximo envío: {{ nextRecurringDate }}
              </span>
              <span v-else-if="lastDeliveryMode === 'daily'">
                programada para enviarse <strong>todos los días</strong> a las <strong>{{ recurringTime }}</strong>.
                Próximo envío: {{ nextRecurringDate }}
              </span>
              <span v-else-if="lastDeliveryMode === 'once'">programada para el {{ formatDate(scheduledAt) }}</span>
              <span v-else>enviada a {{ finalRecipients.length }} destinatarios</span>
              y el payload fue despachado a n8n.
            </p>
            <!-- <button class="btn btn-add mt-2" @click="goToCampaigns">
              <i class="bi bi-megaphone me-2"></i>Ver mis campañas
            </button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      ref="toastComponent"
    />

    <!-- CONFIRM POPUP -->
    <ConfirmPopup
      ref="confirmPopup"
      :title="confirmTitle"
      :question="confirmQuestion"
      @response="handleResponse"
    />
  </div>
</template>

<script>
import {
  getTemplates,
  getClients,
  getTables,
  getCampaigns,
  getTableStructure,
  createTemplate,
  createCampaign,
  extractVariables,
  executeView,
  sendEmailTest
} from '@/services/emailService';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import '@/assets/styles/emails.css';
import * as XLSX from 'xlsx';

export default {
  name: 'CampaignBuilderView',
  components: { ToastComponent, ConfirmPopup },
  props: {
    isModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      steps: ['Información', 'Template', 'Destinatarios', 'Revisar y enviar'],
      currentStep: 0,

      // campaign
      campaign: { name: '', description: '', source_type: null, template_id: null, recipient_mode: 'manual', selected_table: null },

      // templates
      templates: [],
      loadingTemplates: false,
      showInlineTemplateForm: false,
      savingTemplate: false,
      inlineTemplate: { name: '', subject: '', html_content: '' },
      inlineDetectedVars: [],

      // clients (DB mode)
      clients: [],
      loadingClients: false,
      selectedClientIds: [],
      clientSearch: '',
      dbVariableMapping: {},

      // views mode (formerly query)
      selectedViewName: '',
      availableViews: [],
      loadingViews: false,
      viewResults: [],
      loadingView: false,
      viewExecuted: false,
      selectedViewResultIds: [],

      // excel mode
      dragging: false,
      excelData: { filename: '', headers: [], rows: [] },
      columnMapping: {},

      // send & schedule
      scheduling: false,
      scheduleMode: null,        // null | 'once' | 'recurring' (pregunta early en Step 2)
      scheduledAt: '',
      recurringAnchorType: 'day_of_month', // 'day_of_month' | 'specific_date'
      recurringDay: 5,
      recurringDate: '',
      recurringEveryMonths: 1,
      recurringTime: '15:00',
      sending: false,
      showSuccess: false,

      // test email
      testEmail: '',
      sendingTest: false,
      testResult: null,

      toastTitle: '',
      toastMessage: '',
      isSuccess: true,
      previewPlaceholder: '<p style="color:#adb5bd;text-align:center;margin-top:60px">Preview aparecerá aquí</p>',

      // confirm popup
      confirmTitle: '',
      confirmQuestion: '',
      pendingSendIsScheduled: false,
      lastDeliveryMode: 'now'
    };
  },
  computed: {
    canProceed() {
      if (this.currentStep === 0) return this.campaign.name.trim().length > 0;
      if (this.currentStep === 1) return !!this.campaign.template_id;
      if (this.currentStep === 2) {
        if (this.scheduleMode === null) return false;
        if (!this.campaign.source_type) return false;
        if (this.campaign.source_type !== 'views' && this.finalRecipients.length === 0) return false;
        if (this.campaign.source_type === 'db') return this.dbMappingComplete;
        if (this.campaign.source_type === 'views') return this.dbMappingComplete;
        if (this.campaign.source_type === 'excel') return !!this.columnMapping['__email'] && this.excelMappingComplete;
        return true;
      }
      return true;
    },
    campaignTemplate() {
      return this.templates.find(t => t.id === this.campaign.template_id) || null;
    },
    templateVariables() {
      return this.campaignTemplate?.variables || [];
    },
    dbColumns() {
      return this.extractRecordColumns(this.clients);
    },
    dbMappingComplete() {
      return this.areVariablesMapped(this.dbVariableMapping);
    },
    excelMappingComplete() {
      return this.areVariablesMapped(this.columnMapping);
    },
    filteredClients() {
      if (!this.clientSearch.trim()) return this.clients;
      const q = this.clientSearch.toLowerCase();
      return this.clients.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.empresa.toLowerCase().includes(q)
      );
    },
    selectedClients() {
      return this.clients.filter(c => this.selectedClientIds.includes(c.id));
    },
    selectedViewResults() {
      return this.viewResults.filter((r, idx) => this.selectedViewResultIds.includes(idx));
    },
    finalRecipients() {
      if (this.campaign.source_type === 'db') {
        return this.selectedClients.map(c => ({
          email: c.email,
          variables: this.buildVariablesFromMapping(c, this.dbVariableMapping)
        }));
      } else if (this.campaign.source_type === 'views') {
        return this.selectedViewResults.map(r => ({
          email: r.email || r.correo || r.EMAIL || r.mail || '',
          variables: this.buildVariablesFromMapping(r, this.dbVariableMapping)
        }));
      } else {
        // Excel mode
        const emailCol = this.columnMapping['__email'];
        if (!emailCol || !this.excelData.rows.length) return [];

        return this.excelData.rows
          .filter(row => row[emailCol])
          .map(row => {
            const vars = {};
            if (this.campaignTemplate) {
              this.campaignTemplate.variables.forEach(v => {
                vars[v] = this.columnMapping[v] ? row[this.columnMapping[v]] || '' : '';
              });
            }
            if (!Object.prototype.hasOwnProperty.call(vars, 'email')) {
              vars.email = row[emailCol];
            }
            return { email: row[emailCol], variables: vars };
          });
      }
    },
    previewHtml() {
      if (!this.campaignTemplate) return '';
      const r = this.finalRecipients[0];
      if (!r) return this.campaignTemplate.html_content;
      let html = this.campaignTemplate.html_content;
      Object.entries(r.variables || {}).forEach(([k, v]) => {
        html = html.replaceAll(`{{${k}}}`, v || `{{${k}}}`);
      });
      return html;
    },
    nextRecurringDate() {
      const candidate = this.getNextRecurringCandidate();
      return candidate ? this.formatDate(candidate) : '';
    },
    nextRecurringAt() {
      const candidate = this.getNextRecurringCandidate();
      return candidate ? this.toDateTimeLocal(candidate) : null;
    },
    minDatetime() {
      const d = new Date(Date.now() + 5 * 60 * 1000);
      return this.toDateTimeLocal(d);
    },
    minRecurringDate() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },
    recurringIntervalLabel() {
      const n = Number(this.recurringEveryMonths) || 1;
      return n === 1 ? 'cada mes' : `cada ${n} meses`;
    }
  },
  async mounted() {
    await this.loadTemplates();
  },
  methods: {
    areVariablesMapped(mapping) {
      if (!this.templateVariables.length) return true;
      return this.templateVariables.every(variable => !!mapping?.[variable]);
    },

    extractRecordColumns(records) {
      if (!Array.isArray(records) || !records.length) return [];

      const columns = [];
      records.forEach(record => {
        if (!record || typeof record !== 'object') return;
        Object.entries(record).forEach(([key, value]) => {
          if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) return;
          if (!columns.includes(key)) columns.push(key);
        });
      });

      return columns;
    },

    buildVariablesFromMapping(record, mapping) {
      const variables = {};
      this.templateVariables.forEach(variable => {
        const column = mapping?.[variable];
        variables[variable] = column ? record?.[column] ?? '' : '';
      });
      if (!Object.prototype.hasOwnProperty.call(variables, 'email')) {
        variables.email = record?.email || '';
      }
      return variables;
    },

    getMappedExample(mapping, variable, sampleRecord) {
      const column = mapping?.[variable];
      if (!column || !sampleRecord) return '—';
      return sampleRecord[column] ?? '—';
    },

    currentMappingComplete() {
      if (this.campaign.source_type === 'db') return this.dbMappingComplete;
      if (this.campaign.source_type === 'excel') return this.excelMappingComplete;
      if (this.campaign.source_type === 'views') return this.dbMappingComplete;
      return true;
    },

    async loadTemplates() {
      this.loadingTemplates = true;
      try {
        this.templates = await getTemplates();
      } finally {
        this.loadingTemplates = false;
      }
    },

    async loadClients() {
      this.loadingClients = true;
      try {
        this.clients = await getClients();
        this.initializeDbVariableMapping();
      } finally {
        this.loadingClients = false;
      }
    },

    initializeDbVariableMapping() {
      this.dbVariableMapping = this.campaignTemplate?.variables?.length
        ? Object.fromEntries(this.campaignTemplate.variables.map(v => [v, '']))
        : {};
    },

    async loadViews() {
      this.loadingViews = true;
      try {
        this.availableViews = await getTables();
      } finally {
        this.loadingViews = false;
      }
    },

    getRowId(row) {
      return row.email || row.correo || row.EMAIL || row.mail || JSON.stringify(row);
    },

    async executeView(viewName) {
      if (!this.selectedViewName) {
        this.showToast('Seleccioná una vista', 'error');
        return;
      }

      this.loadingView = true;

      try {
        this.viewResults = await executeView(viewName);
        this.viewExecuted = true;
      } catch (err) {
        this.showToast(err.message || 'Error al ejecutar la vista', 'error');
        this.viewResults = [];
        this.viewExecuted = false;
      } finally {
        this.loadingView = false;
      }
    },

    clearView() {
      this.selectedViewName = '';
      this.viewResults = [];
      this.selectedViewResultIds = [];
      this.viewExecuted = false;
      this.campaign.source_type = null;
    },

    async nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        await this.$nextTick();
        if (this.$refs.wizardBody) this.$refs.wizardBody.scrollTop = 0;
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.$nextTick(() => {
          if (this.$refs.wizardBody) this.$refs.wizardBody.scrollTop = 0;
        });
      }
    },

    startScheduling() {
      this.scheduling = true;
      this.$nextTick(() => {
        if (this.$refs.wizardBody) {
          this.$refs.wizardBody.scrollTop = this.$refs.wizardBody.scrollHeight;
        }
      });
    },

    async selectSourceDb() {
      this.campaign.source_type = 'db';
      this.selectedClientIds = [];

      const mapping = this.campaignTemplate?.variables?.length
        ? Object.fromEntries(this.campaignTemplate.variables.map(v => [v, '']))
        : {};
      this.dbVariableMapping = { ...mapping };

      if (!this.clients.length) {
        await this.loadClients();
      }
    },

    selectSourceExcel() {
      this.campaign.source_type = 'excel';
      const templateVariables = this.campaignTemplate?.variables || [];
      const newMapping = templateVariables.length
        ? Object.fromEntries(templateVariables.map(v => [v, '']))
        : {};

      // Preserve existing mappings for variables that exist in the current template
      const preservedColumnMapping = { ...this.columnMapping };
      templateVariables.forEach(v => {
        if (preservedColumnMapping[v] === undefined) {
          preservedColumnMapping[v] = '';
        }
      });
      // Ensure __email is always present
      if (preservedColumnMapping['__email'] === undefined) {
        preservedColumnMapping['__email'] = '';
      }
      // Remove mappings for variables that no longer exist in the template
      Object.keys(preservedColumnMapping).forEach(key => {
        if (key !== '__email' && !templateVariables.includes(key)) {
          delete preservedColumnMapping[key];
        }
      });

      this.columnMapping = preservedColumnMapping;
    },

    selectTemplate(tmpl) {
      this.campaign.template_id = tmpl.id;
      this.showInlineTemplateForm = false;

      const newVariables = tmpl.variables || [];
      const newMapping = newVariables.length
        ? Object.fromEntries(newVariables.map(v => [v, '']))
        : {};

      // Preserve existing mappings for variables that exist in both old and new template
      const preservedColumnMapping = { ...this.columnMapping };
      newVariables.forEach(v => {
        if (preservedColumnMapping[v] === undefined) {
          preservedColumnMapping[v] = '';
        }
      });
      // Ensure __email is always present
      if (preservedColumnMapping['__email'] === undefined) {
        preservedColumnMapping['__email'] = '';
      }
      // Remove mappings for variables that no longer exist in the new template
      Object.keys(preservedColumnMapping).forEach(key => {
        if (key !== '__email' && !newVariables.includes(key)) {
          delete preservedColumnMapping[key];
        }
      });

      this.dbVariableMapping = { ...newMapping };
      this.columnMapping = preservedColumnMapping;
    },

    openCreateTemplate() {
      this.inlineTemplate = { name: '', subject: '', html_content: '' };
      this.inlineDetectedVars = [];
      this.showInlineTemplateForm = true;
      this.campaign.template_id = null;
    },

    onInlineHtmlInput() {
      this.inlineDetectedVars = extractVariables(this.inlineTemplate.html_content);
    },

    importTemplateHtml(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        this.inlineTemplate.html_content = ev.target.result;
        this.inlineDetectedVars = extractVariables(this.inlineTemplate.html_content);
        this.showInlineTemplateForm = true;
      };
      reader.readAsText(file);
      e.target.value = '';
    },

    async saveInlineTemplate() {
      if (!this.inlineTemplate.name.trim() || !this.inlineTemplate.subject.trim()) {
        this.showToast('Completá nombre y asunto', 'error');
        return;
      }
      if (!this.inlineTemplate.html_content.trim()) {
        this.showToast('El HTML no puede estar vacío', 'error');
        return;
      }
      this.savingTemplate = true;
      try {
        const created = await createTemplate(this.inlineTemplate);
        await this.loadTemplates();
        this.campaign.template_id = created.id;
        this.showInlineTemplateForm = false;
        this.showToast('Template creado y seleccionado');
      } catch (err) {
        this.showToast(err.message || 'Error al crear template', 'error');
      } finally {
        this.savingTemplate = false;
      }
    },

    toggleSelectAll(e) {
      if (e.target.checked) {
        const toAdd = this.filteredClients.map(c => c.id);
        this.selectedClientIds = [...new Set([...this.selectedClientIds, ...toAdd])];
      } else {
        const toRemove = new Set(this.filteredClients.map(c => c.id));
        this.selectedClientIds = this.selectedClientIds.filter(id => !toRemove.has(id));
      }
    },

    handleDrop(e) {
      this.dragging = false;
      const file = e.dataTransfer.files[0];
      if (file) this.parseExcelFile(file);
    },

    loadExcel(e) {
      const file = e.target.files[0];
      if (file) this.parseExcelFile(file);
      e.target.value = '';
    },

    parseExcelFile(file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!rows.length) {
          this.showToast('El archivo no tiene datos', 'error');
          return;
        }
        this.excelData = {
          filename: file.name,
          headers: Object.keys(rows[0]),
          rows
        };
        // Vue 3: asignación directa es reactiva
        const templateVariables = this.campaignTemplate?.variables || [];
        const newMapping = templateVariables.length
          ? Object.fromEntries(templateVariables.map(v => [v, '']))
          : {};

        // Preserve existing mappings for variables that exist in the current template
        const preservedColumnMapping = { ...this.columnMapping };
        templateVariables.forEach(v => {
          if (preservedColumnMapping[v] === undefined) {
            preservedColumnMapping[v] = '';
          }
        });
        // Ensure __email is always present
        if (preservedColumnMapping['__email'] === undefined) {
          preservedColumnMapping['__email'] = '';
        }
        // Remove mappings for variables that no longer exist in the template
        Object.keys(preservedColumnMapping).forEach(key => {
          if (key !== '__email' && !templateVariables.includes(key)) {
            delete preservedColumnMapping[key];
          }
        });

        this.columnMapping = preservedColumnMapping;
      };
      reader.readAsArrayBuffer(file);
    },

    clearExcel() {
      this.excelData = { filename: '', headers: [], rows: [] };
      this.columnMapping = {};
    },

    toMysqlDatetime(dateTimeLocal) {
      if (!dateTimeLocal) return null;
      // dateTimeLocal es un string de datetime-local: "2025-05-15T21:30"
      // Parsearlo como fecha local (no UTC)
      const [datePart, timePart] = dateTimeLocal.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      // Crear fecha en timezone local
      const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Convertir a MySQL format (YYYY-MM-DD HH:mm:ss)
      const pad = n => String(n).padStart(2, '0');
      return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:00`;
    },

    toDateTimeLocal(value) {
      const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    getNextRecurringCandidate() {
      const [h, m] = (this.recurringTime || '15:00').split(':').map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

      const now = new Date();

      if (this.recurringAnchorType === 'daily') {
        const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        if (candidate <= now) {
          candidate.setDate(candidate.getDate() + 1);
        }
        return candidate;
      }

      const everyMonths = Math.max(1, Number(this.recurringEveryMonths) || 1);

      if (this.recurringAnchorType === 'specific_date') {
        if (!this.recurringDate) return null;
        const [y, mo, d] = this.recurringDate.split('-').map(Number);
        if (![y, mo, d].every(Number.isFinite)) return null;

        const candidate = new Date(y, mo - 1, d, h, m, 0, 0);
        while (candidate <= now) {
          candidate.setMonth(candidate.getMonth() + everyMonths);
        }
        return candidate;
      }

      const day = Number(this.recurringDay) || 1;
      const candidate = new Date(now.getFullYear(), now.getMonth(), day, h, m, 0, 0);
      if (candidate <= now) {
        candidate.setMonth(candidate.getMonth() + everyMonths);
      }
      return candidate;
    },

    async send(isScheduled) {
      if (isScheduled) {
        if (this.scheduleMode === 'once' && !this.scheduledAt) {
          this.showToast('Selecioná una fecha y hora para programar el envío', 'error');
          return;
        }
        if (this.scheduleMode === 'once') {
          const scheduledDate = new Date(this.scheduledAt);
          if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
            this.showToast('La fecha de programación debe ser futura', 'error');
            return;
          }
        }
        if (this.scheduleMode === 'recurring' && !this.recurringTime) {
          this.showToast('Selecioná la hora de envío recurrente', 'error');
          return;
        }
        if (this.scheduleMode === 'recurring' && this.recurringAnchorType === 'specific_date' && !this.recurringDate) {
          this.showToast('Selecioná la fecha de inicio de la recurrencia', 'error');
          return;
        }
        if (this.scheduleMode === 'recurring' && this.recurringAnchorType !== 'daily' && (!Number.isFinite(Number(this.recurringEveryMonths)) || Number(this.recurringEveryMonths) < 1)) {
          this.showToast('El intervalo de repetición debe ser de al menos 1 mes', 'error');
          return;
        }
      }
      if (!this.campaignTemplate) {
        this.showToast('No hay template seleccionado', 'error');
        return;
      }

      if (!this.currentMappingComplete()) {
        this.showToast('Mapeá todas las variables del template antes de continuar', 'error');
        return;
      }

      const isDynamicRecurring = this.campaign.source_type === 'views';
      if (!isDynamicRecurring && !this.finalRecipients.length) {
        this.showToast('No hay destinatarios seleccionados', 'error');
        return;
      }

      if (isDynamicRecurring) {
        this.campaign.recipient_mode = 'dynamic';
        this.campaign.selected_table = this.selectedViewName;
      } else {
        this.campaign.recipient_mode = 'manual';
      }

      const recipientsCount = this.finalRecipients.length;
      const recipientLabel = isDynamicRecurring
        ? 'todos los clientes actuales de la tabla'
        : `${recipientsCount} destinatario${recipientsCount !== 1 ? 's' : ''}`;

      const actionLabel = isScheduled
        ? (this.scheduleMode === 'recurring'
            ? (this.recurringAnchorType === 'daily'
                ? `programar de forma diaria (próximo envío ${this.nextRecurringDate})`
                : `programar de forma recurrente (próximo envío ${this.nextRecurringDate})`)
            : `programar para el ${this.formatDate(this.scheduledAt)}`)
        : 'enviar ahora';

      this.confirmTitle = isScheduled ? '¿Programar campaña?' : '¿Enviar campaña?';
      this.confirmQuestion = `Vas a ${actionLabel} "${this.campaign.name}" a ${recipientLabel}. ¿Confirmás?`;
      this.pendingSendIsScheduled = isScheduled;
      await this.$nextTick();
      this.$refs.confirmPopup.showConfirmPopup();
    },

    async handleResponse(confirmed) {
      if (!confirmed) return;

      const isScheduled = this.pendingSendIsScheduled;
      this.sending = true;
      try {
        const deliveryMode = isScheduled
          ? (this.scheduleMode === 'recurring' ? (this.recurringAnchorType === 'daily' ? 'daily' : 'recurring') : 'once')
          : 'now';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Argentina/Buenos_Aires';
        const schedulePayload = isScheduled
          ? this.scheduleMode === 'recurring'
            ? this.recurringAnchorType === 'daily'
              ? {
                  type: 'daily',
                  time: this.recurringTime,
                  next_run_at: this.toMysqlDatetime(this.nextRecurringAt),
                  next_run: this.toMysqlDatetime(this.nextRecurringAt),
                  timezone
                }
              : {
                  type: 'recurring',
                  anchor_type: this.recurringAnchorType,
                  every_months: Number(this.recurringEveryMonths) || 1,
                  day_of_month: this.recurringAnchorType === 'day_of_month' ? Number(this.recurringDay) : null,
                  start_date: this.recurringAnchorType === 'specific_date' ? this.recurringDate : null,
                  time: this.recurringTime,
                  next_run_at: this.toMysqlDatetime(this.nextRecurringAt),
                  next_run: this.toMysqlDatetime(this.nextRecurringAt),
                  timezone
                }
            : { type: 'once', scheduled_at: this.toMysqlDatetime(this.scheduledAt), timezone }
          : null;

        const scheduledAtValue = deliveryMode === 'now'
          ? this.toMysqlDatetime(new Date().toISOString())
          : deliveryMode === 'once'
            ? this.toMysqlDatetime(this.scheduledAt)
            : (deliveryMode === 'recurring' || deliveryMode === 'daily')
              ? this.toMysqlDatetime(this.nextRecurringAt)
              : null;

        const payload = {
          campaign: {
            name: this.campaign.name,
            description: this.campaign.description,
            template_id: this.campaign.template_id,
            template_name: this.campaignTemplate.name,
            source_type: this.campaign.source_type,
            recipient_mode: this.campaign.recipient_mode,
            selected_table: this.campaign.selected_table,
            selected_view_name: this.selectedViewName,
            table_variable_mapping: this.dbVariableMapping || this.columnMapping,
            scheduled_at: scheduledAtValue
          },
          template: this.campaignTemplate,
          scheduledAt: scheduledAtValue,
          schedule: schedulePayload,
          deliveryMode
        };

        // Envía los recipients SIEMPRE, SALVO cuando la fuente es 'views'
        if (this.campaign.source_type !== 'views') {
          payload.recipients = this.finalRecipients;
        }

        // console.log('Campaign payload:', payload);

        await createCampaign(payload);

        this.lastDeliveryMode = deliveryMode;
        this.showSuccess = true;
        this.$emit('campaign-created', { deliveryMode });
      } catch (err) {
        this.showToast(err.message || 'Error al enviar la campaña', 'error');
      } finally {
        this.sending = false;
      }
    },

    async sendTestEmail() {
      if (!this.testEmail || !this.campaignTemplate) {
        this.showToast('Completá el email de prueba y seleccioná un template', 'error');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.testEmail)) {
        this.showToast('El email de prueba no tiene un formato válido', 'error');
        return;
      }

      if (!this.currentMappingComplete()) {
        this.showToast('Mapeá todas las variables del template antes de enviar la prueba', 'error');
        return;
      }

      this.sendingTest = true;
      this.testResult = null;

      try {

        // Preparar un recipient de prueba con las variables mapeadas
        const testRecipient = {
          email: this.testEmail,
          variables: {}
        };

        // Llenar variables con valores de ejemplo o mapeados
        if (this.campaignTemplate.variables?.length) {
          this.campaignTemplate.variables.forEach(v => {
            const mapping = this.dbVariableMapping || this.columnMapping;
            if (mapping[v]) {
              // Usar el valor mapeado del primer recipient como ejemplo
              const firstRecipient = this.finalRecipients[0];
              testRecipient.variables[v] = firstRecipient?.variables?.[mapping[v]] || `{{${v}}}`;
            } else {
              testRecipient.variables[v] = `{{${v}}}`;
            }
          });
        }

        const payload = {
          action: 'sendTestEmail',
          campaign: {
            name: this.campaign.name || 'Campaña de prueba',
            description: this.campaign.description,
            template_id: this.campaign.template_id,
            template_name: this.campaignTemplate.name,
            source_type: this.campaign.source_type,
            recipient_mode: 'manual',
            table_variable_mapping: this.dbVariableMapping || this.columnMapping,
          },
          template: this.campaignTemplate,
          recipients: [testRecipient],
          deliveryMode: 'test'
        };

        //console.log('Test email payload:', payload);

        // Llamar al webhook con action: sendTestEmail usando axios con token de autenticación
        const response = await sendEmailTest(payload);

        //console.log('Test email response:', response.data);
        if(response) {
          this.testResult = {
            success: true,
            message: `Email de prueba enviado correctamente a ${this.testEmail}`
          };
          this.showToast(`Email de prueba enviado a ${this.testEmail}`, 'success');
        }
        
      } catch (err) {
        console.error('Error sending test email:', err);
        this.testResult = {
          success: false,
          message: err.message || 'Error al enviar email de prueba'
        };
        this.showToast(err.message || 'Error al enviar email de prueba', 'error');
      } finally {
        this.sendingTest = false;
      }
    },

    async goToCampaigns () {
      if (this.isModal) {
        await getCampaigns();
        this.$emit('close');
        return;
      }

      this.$router.push('/panel/emails/campaigns');
    },

    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
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

    insertInlineBaseTemplate() {
      this.inlineTemplate.html_content = this.getBaseTemplateHtml();
      this.inlineDetectedVars = extractVariables(this.inlineTemplate.html_content);
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
</html>`;
    }
  }
};
</script>


<style>
.campaign-builder-modal-mode {
  height: 100%;
  margin-top: 0 !important;
  padding: 1rem;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.campaign-builder-modal-mode .wizard-container {
  flex: 1;
  min-height: 0;
  height: auto;
  border-radius: 12px;
}

.campaign-builder-modal-mode .wizard-body {
  padding: 1.5rem;
}

.campaign-builder-modal-mode .wizard-footer {
  padding: 1rem 1.5rem;
}

.template-card {
  cursor: pointer!important;
}

.template-card:hover {
  border-color: #3939ff;
  box-shadow: 0 4px 16px rgba(57, 57, 255, 0.15);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.2);
}

.source-option {
  min-height: 140px;
  display: flex;
  flex-direction: column;
}
</style>