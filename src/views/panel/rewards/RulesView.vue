<template>
  <div class="container-fluid mt-4 page">
    <div class="header-section mb-4">
      <div>
        <h2>Reglas de Acumulación de Puntos</h2>
        <p class="subtitle">Configurá las condiciones para otorgar puntos por ventas referidas</p>
      </div>
      <button @click="openModalForm()" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle me-2"></i> Nueva Regla
      </button>
    </div>
    <hr class="header-divider">

    <!-- Info Card -->
    <div class="alert alert-info-custom mb-4">
      <i class="bi bi-info-circle-fill me-2"></i>
      <div>
        <strong>Importante:</strong> Solo puede haber una regla activa a la vez. 
        Al activar una nueva regla, la anterior se desactivará automáticamente.
      </div>
    </div>

    <!-- DataTable -->
    <div class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="rules"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
        />
      </div>
    </div>

    <!-- Modal -->
    <ModalComponent 
      ref="formModal" 
      modalId="formModal" 
      :modalTitle="editingIndex === null ? 'Nueva Regla' : 'Editar Regla'" 
      class="modal-fullscreen-fixed" 
      @modalClosed="handleCloseModal"
    >
      <div class="rules-step-modal">
        <div class="rules-step-shell">
          <div class="rules-stepper">
            <button
              v-for="(step, index) in formSteps"
              :key="step.key"
              type="button"
              class="rules-step-item"
              :class="{ active: currentStep === index, done: currentStep > index }"
              @click="goToStep(index)"
            >
              <div class="rules-step-num">
                <i v-if="currentStep > index" class="bi bi-check-lg"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="rules-step-copy">
                <span>{{ step.label }}</span>
                <small>{{ step.description }}</small>
              </div>
            </button>
          </div>

          <div class="rules-step-content">
            <div v-show="currentStep === 0" class="rules-step-panel">
              <div class="card data-card rules-card">
                <div class="rules-card-head">
                  <i class="bi bi-info-circle-fill"></i>
                  <span>Información básica</span>
                </div>
                <div class="rules-card-body">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">
                        <i class="bi bi-tag-fill me-2"></i>
                        Nombre de la Regla
                      </label>
                      <input 
                        v-model="formData.name" 
                        type="text" 
                        class="form-control" 
                        placeholder="Ej: Regla Verano 2025"
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label">
                        <i class="bi bi-text-left me-2"></i>
                        Descripción
                      </label>
                      <textarea 
                        v-model="formData.description" 
                        class="form-control" 
                        rows="3"
                        placeholder="Describe el objetivo de esta regla"
                      ></textarea>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">
                        <i class="bi bi-toggle-on me-2"></i>
                        Estado
                      </label>
                      <select v-model="formData.is_active" class="form-select">
                        <option :value="true">Activa</option>
                        <option :value="false">Inactiva</option>
                      </select>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="rules-summary-box">
                        <span class="rules-summary-label">Resumen rápido</span>
                        <strong>{{ formData.name || 'Nueva regla sin nombre' }}</strong>
                        <small>{{ formData.description || 'Todavía no agregaste una descripción para esta regla.' }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 1" class="rules-step-panel">
              <div class="card data-card rules-card">
                <div class="rules-card-head">
                  <i class="bi bi-stars"></i>
                  <span>Cálculo de puntos</span>
                </div>
                <div class="rules-card-body">
                  <div class="row g-3">
                    <div class="col-12 col-lg-7">
                      <label class="form-label">
                        <i class="bi bi-star-fill me-2"></i>
                        Tipo de Cálculo
                      </label>
                      <div class="type-selector mb-3">
                        <div 
                          class="type-option" 
                          :class="{ active: formData.points_type === 'fixed' }" 
                          @click="formData.points_type = 'fixed'"
                        >
                          <i class="bi bi-hash"></i>
                          <span>Valor fijo</span>
                        </div>
                        <div 
                          class="type-option" 
                          :class="{ active: formData.points_type === 'percentage' }" 
                          @click="formData.points_type = 'percentage'"
                        >
                          <i class="bi bi-percent"></i>
                          <span>Porcentaje</span>
                        </div>
                      </div>

                      <div v-if="formData.points_type === 'fixed'">
                        <label class="form-label-sm">Puntos por venta referida</label>
                        <input 
                          v-model.number="formData.points_per_sale" 
                          type="number" 
                          class="form-control" 
                          placeholder="Ej: 100"
                          min="0"
                        />
                      </div>

                      <div v-else>
                        <label class="form-label-sm">Porcentaje a aplicar</label>
                        <div class="input-group">
                          <input
                            v-model.number="formData.points_percentage"
                            type="number"
                            class="form-control"
                            placeholder="Ej: 10"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                          <span class="input-group-text">%</span>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-lg-5">
                      <div class="rules-summary-box rules-summary-box-accent">
                        <span class="rules-summary-label">Cómo se aplicará</span>
                        <strong v-if="formData.points_type === 'fixed'">
                          {{ formData.points_per_sale || '...' }} puntos por venta referida
                        </strong>
                        <strong v-else>
                          {{ formData.points_percentage || '...' }}% sobre la columna elegida
                        </strong>
                        <small v-if="formData.points_type === 'fixed'">
                          Podés sumar condiciones en el siguiente paso para limitar cuándo se otorgan los puntos.
                        </small>
                        <small v-else>
                          Esta regla de porcentaje no necesita condiciones adicionales al importar ventas.
                        </small>
                      </div>
                    </div>
                  </div>

                  <div v-if="formData.points_type === 'percentage'" class="alert alert-percentage mt-4 mb-0">
                    <div class="alert-percentage-icon">
                      <i class="bi bi-percent"></i>
                    </div>
                    <div>
                      <strong>Regla de porcentaje</strong>
                      <p class="mb-0 mt-1">Se aplicará el <strong>{{ formData.points_percentage || '...' }}%</strong> sobre la columna que selecciones al momento de importar las ventas en <strong>"Importar Ventas"</strong>. No se requieren condiciones adicionales.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 2" class="rules-step-panel">
              <div class="card data-card rules-card">
                <div class="rules-card-head">
                  <i class="bi bi-funnel-fill"></i>
                  <span>Condiciones de aplicación</span>
                  <button 
                    v-if="formData.points_type === 'fixed'"
                    class="btn btn-sm btn-light ms-auto"
                    @click="addCondition"
                    type="button"
                  >
                    <i class="bi bi-plus-circle me-1"></i> Agregar Condición
                  </button>
                </div>
                <div class="rules-card-body">
                  <div v-if="formData.points_type === 'percentage'" class="empty-conditions rules-empty-state">
                    <i class="bi bi-check2-circle"></i>
                    <p>No hace falta configurar condiciones</p>
                    <p class="text-muted">Las reglas por porcentaje se aplican directamente sobre la columna elegida al importar ventas.</p>
                  </div>

                  <template v-else>
                    <p class="conditions-hint">
                      <i class="bi bi-lightbulb me-2"></i>
                      Las ventas deben cumplir TODAS las condiciones para otorgar los <strong>{{ formData.points_per_sale || '...' }} puntos</strong>
                    </p>

                    <div v-if="formData.conditions.length === 0" class="empty-conditions">
                      <i class="bi bi-inbox"></i>
                      <p>No hay condiciones configuradas</p>
                      <p class="text-muted">Esta regla se aplicará a todas las ventas sin restricciones</p>
                    </div>

                    <div 
                      v-for="(condition, index) in formData.conditions" 
                      :key="index" 
                      class="condition-item"
                    >
                      <div class="condition-header">
                        <span class="condition-number">Condición {{ index + 1 }}</span>
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          @click="removeCondition(index)"
                          type="button"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>

                      <div class="condition-body">
                        <div class="row g-3">
                          <div class="col-12 col-md-4">
                            <label class="form-label-sm">Campo</label>
                            <select v-model="condition.field" class="form-select form-select-sm">
                              <option value="">Seleccionar...</option>
                              <option value="importe">Importe de Venta</option>
                              <option value="date">Fecha de Venta</option>
                              <option value="dni">DNI del Cliente</option>
                              <option value="dni_referido">DNI del Referido</option>
                            </select>
                          </div>

                          <div class="col-12 col-md-4">
                            <label class="form-label-sm">Operador</label>
                            <select v-model="condition.operator" class="form-select form-select-sm">
                              <option value="">Seleccionar...</option>
                              <template v-if="condition.field === 'importe'">
                                <option value=">">&gt; Mayor que</option>
                                <option value=">=">&gt;= Mayor o igual que</option>
                                <option value="<">&lt; Menor que</option>
                                <option value="<=">&lt;= Menor o igual que</option>
                                <option value="=">= Igual a</option>
                              </template>
                              <template v-else-if="condition.field === 'date'">
                                <option value=">=">Desde (inclusive)</option>
                                <option value="<=">Hasta (inclusive)</option>
                                <option value="=">En la fecha</option>
                                <option value="between">Entre fechas</option>
                              </template>
                              <template v-else-if="condition.field === 'dni' || condition.field === 'dni_referido'">
                                <option value="=">Igual a</option>
                                <option value="!=">Diferente de</option>
                                <option value="in">Está en la lista</option>
                                <option value="not_in">No está en la lista</option>
                              </template>
                            </select>
                          </div>

                          <div class="col-12 col-md-4">
                            <label class="form-label-sm">Valor</label>
                            <input 
                              v-if="condition.field === 'importe'"
                              v-model="condition.value" 
                              type="number" 
                              class="form-control form-control-sm" 
                              placeholder="Ej: 1000"
                            />
                            <input 
                              v-else-if="condition.field === 'date' && condition.operator !== 'between'"
                              v-model="condition.value" 
                              type="date" 
                              class="form-control form-control-sm"
                            />
                            <div v-else-if="condition.field === 'date' && condition.operator === 'between'" class="date-range">
                              <input 
                                v-model="condition.value_from" 
                                type="date" 
                                class="form-control form-control-sm mb-1" 
                                placeholder="Desde"
                              />
                              <input 
                                v-model="condition.value_to" 
                                type="date" 
                                class="form-control form-control-sm" 
                                placeholder="Hasta"
                              />
                            </div>
                            <input 
                              v-else-if="(condition.field === 'dni' || condition.field === 'dni_referido') && 
                                         (condition.operator === '=' || condition.operator === '!=')"
                              v-model="condition.value" 
                              type="text" 
                              class="form-control form-control-sm" 
                              placeholder="Ej: 12345678"
                            />
                            <textarea 
                              v-else-if="(condition.field === 'dni' || condition.field === 'dni_referido') && 
                                         (condition.operator === 'in' || condition.operator === 'not_in')"
                              v-model="condition.value" 
                              class="form-control form-control-sm" 
                              rows="2"
                              placeholder="Ingresá DNIs separados por coma&#10;Ej: 12345678, 87654321, 11223344"
                            ></textarea>
                            <input 
                              v-else
                              v-model="condition.value" 
                              type="text" 
                              class="form-control form-control-sm" 
                              placeholder="Valor"
                            />
                          </div>
                        </div>

                        <div v-if="getConditionDescription(condition)" class="condition-description">
                          <i class="bi bi-arrow-right me-2"></i>
                          {{ getConditionDescription(condition) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="rules-step-actions">
            <button type="button" class="btn btn-outline-secondary rules-step-close" @click="closeModalForm">
              <i class="bi bi-x-circle me-2"></i> Cancelar
            </button>
            <div class="rules-step-actions-right">
              <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStep">
                <i class="bi bi-arrow-left me-2"></i>Anterior
              </button>
              <button v-if="currentStep < formSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
                Siguiente<i class="bi bi-arrow-right ms-2"></i>
              </button>
              <button v-else type="button" class="btn btn-primary" @click="saveRule">
                <i class="bi bi-floppy me-2"></i> Guardar Regla
              </button>
            </div>
          </div>
        </div>
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
      title="Confirmar acción" 
      question="¿Estás seguro de que querés realizar esta acción?" 
      @response="handleResponse" 
    />

    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';

export default {
  components: {
    DataTableComponent,
    ModalComponent,
    ToastComponent,
    ConfirmPopup,
  },
  setup() {
    const rules = ref([]);
    const formData = ref(getEmptyForm());
    const editingIndex = ref(null);
    const currentStep = ref(0);
    const isLoading = ref(false);
    const showToastFlag = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const toastComponent = ref(null);
    const isSuccess = ref(true);
    const formModal = ref(null);
    const token = ref(null);
    const confirmPopup = ref(null);
    let ruleToDelete = null;
    const URL_API = "https://apis.madautomate.cloud/webhook/942395a6-0734-43bd-b43f-61072ff867aa";

    const columns = [
      { label: 'Nombre', key: 'name' },
      { label: 'Descripción', key: 'description' },
      { label: 'Tipo', key: 'points_type_label' },
      { label: 'Valor', key: 'points_display' },
      { label: 'Condiciones', key: 'conditions_count' },
      { 
        label: 'Estado', 
        key: 'is_active',
      },
    ];

    const resultActions = [
      {
        label: 'Activar/Desactivar',
        class: 'btn btn-sm btn-outline',
        method: toggleActive,
        icon: (row) => row.is_active 
          ? '<i class="bi bi-star-fill"></i>' 
          : '<i class="bi bi-star"></i>'
      },
      { 
        label: 'Editar', 
        class: 'btn btn-outline btn-sm', 
        method: editRule, 
        icon: '<i class="bi bi-pencil-square"></i>' 
      },
      { 
        label: 'Eliminar', 
        class: 'btn btn-sm btn-danger', 
        method: confirmDelete, 
        icon: '<i class="bi bi-trash3"></i>'
      },
    ];

    const formSteps = [
      { key: 'basic', label: 'Datos básicos', description: 'Nombre, descripción y estado' },
      { key: 'points', label: 'Puntos', description: 'Tipo de cálculo y valor' },
      { key: 'conditions', label: 'Condiciones', description: 'Reglas para aplicar la acumulación' },
    ];

    const getToken = async () => {
      token.value = sessionStorage.getItem('token');
    };

    // Nota: la columna para aplicar el porcentaje se selecciona desde SalesView

    const fetchRules = async () => {
      isLoading.value = true;
      try {

        const response = await axios.post(URL_API, {action: "dataRules"}, {
          headers: { Authorization: `Bearer ${token.value}` }
        });
        console.log('response', response);

        // La API puede devolver un objeto o un array dentro de response.data.data
        const raw = response.data.data || response.data;
        const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        rules.value = [];

        // Normalizar cada regla para la tabla
        rules.value = list.map(rule => ({
          ...rule,
          is_active: rule.is_active === 1 || rule.is_active === true,
          points_percentage: rule.points_percentage ? Number(rule.points_percentage) : null,
          conditions: rule.conditions ? (typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions) : [],
          conditions_count: rule.conditions_count || 0,
          points_type_label: rule.points_type === 'fixed' ? 'Fijo' : 'Porcentaje',
          points_display: rule.points_type === 'fixed'
            ? `${rule.points_per_sale} pts`
            : `${Number(rule.points_percentage)}%`
        }));

      } catch (err) {
        console.error('Error al obtener reglas', err);
        triggerToast('Error', 'No se pudieron cargar las reglas', false);
      } finally {
        isLoading.value = false;
      }
    };

    function getEmptyForm() {
      return {
        name: '',
        description: '',
        points_type: 'fixed',
        points_per_sale: 100,
        points_percentage: null,
        
        is_active: false,
        conditions: []
      };
    }

    function getEmptyCondition() {
      return {
        field: '',
        operator: '',
        value: '',
        value_from: '',
        value_to: ''
      };
    }

    const addCondition = () => {
      formData.value.conditions.push(getEmptyCondition());
    };

    const removeCondition = (index) => {
      formData.value.conditions.splice(index, 1);
    };

    const getConditionDescription = (condition) => {
      if (!condition.field || !condition.operator) return '';

      const fieldNames = {
        'importe': 'Importe',
        'date': 'Fecha',
        'dni': 'DNI Cliente',
        'dni_referido': 'DNI Referido'
      };

      const operatorNames = {
        '>': 'mayor que',
        '>=': 'mayor o igual que',
        '<': 'menor que',
        '<=': 'menor o igual que',
        '=': 'igual a',
        '!=': 'diferente de',
        'in': 'está en la lista',
        'not_in': 'no está en la lista',
        'between': 'entre'
      };

      const field = fieldNames[condition.field] || condition.field;
      const operator = operatorNames[condition.operator] || condition.operator;

      if (condition.operator === 'between' && condition.value_from && condition.value_to) {
        return `${field} ${operator} ${condition.value_from} y ${condition.value_to}`;
      }

      if (condition.value) {
        return `${field} ${operator} ${condition.value}`;
      }

      return '';
    };

    const openModalForm = () => {
      if (!editingIndex.value) {
        formData.value = getEmptyForm();
      }
      currentStep.value = 0;
      formModal.value.openModal();
    };

    const closeModalForm = () => {
      editingIndex.value = null;
      currentStep.value = 0;
      formData.value = getEmptyForm();
      formModal.value.closeModal();
    };

    const handleCloseModal = () => {
      editingIndex.value = null;
      currentStep.value = 0;
      formData.value = getEmptyForm();
    };

    function editRule(item) {
      editingIndex.value = item;
      formData.value = { 
        ...item,
        conditions: JSON.parse(JSON.stringify(item.conditions || []))
      };
      openModalForm();
    }

    const goToStep = (index) => {
      currentStep.value = index;
    };

    const nextStep = () => {
      if (currentStep.value < formSteps.length - 1) {
        currentStep.value += 1;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value -= 1;
      }
    };

    async function toggleActive(item) {
      isLoading.value = true;
      try {
        // Si se activa esta regla, desactivar todas las demás
        if (!item.is_active) {
          rules.value.forEach(rule => {
            if (rule.id !== item.id) rule.is_active = false;
          });
          item.is_active = true;
          triggerToast('Éxito', 'Regla activada correctamente', true);
        } else {
          item.is_active = false;
          triggerToast('Éxito', 'Regla desactivada correctamente', true);
        }
        
        // await axios.put(`URL_API/${item.id}/toggle`, { is_active: item.is_active }, {
        //   headers: { Authorization: `Bearer ${token.value}` }
        // });
        
      } catch (err) {
        console.error(err);
        triggerToast('Error', 'No se pudo cambiar el estado', false);
      } finally {
        isLoading.value = false;
      }
    }

    function confirmDelete(item) {
      ruleToDelete = item;
      confirmPopup.value.showConfirmPopup();
    }

    const handleResponse = async (confirmed) => {
      if (!confirmed || !ruleToDelete) return;
      
      isLoading.value = true;
      try {

        await axios.post(URL_API, {action: 'deleteRule', id: ruleToDelete.id}, {
          headers: { Authorization: `Bearer ${token.value}` }
        });
        
        const index = rules.value.findIndex(r => r.id === ruleToDelete.id);
        if (index !== -1) {
          rules.value.splice(index, 1);
        }
        
        triggerToast('Éxito', 'Regla eliminada correctamente', true);
      } catch (err) {
        console.error(err);
        triggerToast('Error', 'No se pudo eliminar la regla', false);
      } finally {
        isLoading.value = false;
        ruleToDelete = null;
      }
    };

    const saveRule = async () => {
      if (!formData.value.name) {
        triggerToast('Error', 'Debes ingresar un nombre para la regla', false);
        return;
      }

      // Validaciones para tipo de puntos
      if (formData.value.points_type === 'percentage') {
        if (!formData.value.points_percentage && formData.value.points_percentage !== 0) {
          triggerToast('Error', 'Ingresá el porcentaje para el cálculo de puntos', false);
          return;
        }
        // asegurarse que el porcentaje está en rango
        const pct = Number(formData.value.points_percentage);
        if (isNaN(pct) || pct < 0) {
          triggerToast('Error', 'El porcentaje debe ser un número válido mayor o igual a 0', false);
          return;
        }
        formData.value.points_percentage = pct;
      }

      isLoading.value = true;
      rules.value = [];

      try {
        const dataToSend = {
          action: "saveRule",
          ...formData.value,
          conditions_count: formData.value.conditions.length,
          points_type_label: formData.value.points_type === 'fixed' ? 'Fijo' : 'Porcentaje',
          points_display: formData.value.points_type === 'fixed'
            ? `${formData.value.points_per_sale} pts`
            : `${formData.value.points_percentage}%`
        };

        console.log('dataToSend', dataToSend);
          
        const response = await axios.post(URL_API, dataToSend, {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        console.log('response', response);

        if(response.data.success == true) {
          rules.value.push(dataToSend);
          triggerToast('Éxito', 'Regla creada correctamente', true);
          closeModalForm();
        }
        
      } catch (err) {
        console.error(err);
        triggerToast('Error', 'No se pudo guardar la regla', false);
      } finally {
        isLoading.value = false;
      }
    };

    const triggerToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    };

    getToken();
    onMounted(fetchRules);

    return {
      rules,
      columns,
      resultActions,
      formData,
      editingIndex,
      currentStep,
      formSteps,
      isLoading,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      formModal,
      toastComponent,
      confirmPopup,
      openModalForm,
      closeModalForm,
      handleCloseModal,
      goToStep,
      nextStep,
      prevStep,
      editRule,
      toggleActive,
      confirmDelete,
      handleResponse,
      saveRule,
      addCondition,
      removeCondition,
      getConditionDescription
    };
  }
};
</script>

<style scoped>
/* ===== REWARDS DESIGN SYSTEM ===== */
.rules-step-modal {
  height: 100%;
}

.rules-step-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1.25rem;
  gap: 1rem;
}

.rules-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.rules-step-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.95rem 1rem;
  border: 0;
  border-right: 1px solid #e9ecef;
  background: transparent;
  text-align: left;
  transition: background 0.15s ease;
}

.rules-step-item:last-child {
  border-right: 0;
}

.rules-step-item:hover:not(.active) {
  background: #f8f9fa;
}

.rules-step-item.active {
  background: #eff6ff;
}

.rules-step-item.done .rules-step-num,
.rules-step-item.active .rules-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.rules-step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #dee2e6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6c757d;
  flex-shrink: 0;
}

.rules-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rules-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.rules-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.rules-step-item.active .rules-step-copy span,
.rules-step-item.done .rules-step-copy span {
  color: #185fa5;
}

.rules-step-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
}

.rules-step-panel {
  min-height: 100%;
}

.rules-card {
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.rules-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
  color: #212529;
}

.rules-card-head i {
  color: #185fa5;
}

.rules-card-body {
  padding: 1.25rem;
  background: #fff;
}

.rules-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
}

.rules-step-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rules-step-close {
  white-space: nowrap;
}

.rules-summary-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 100%;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #fafbfc;
}

.rules-summary-box strong {
  color: #212529;
  font-size: 0.98rem;
}

.rules-summary-box small {
  color: #6c757d;
  line-height: 1.5;
}

.rules-summary-box-accent {
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
  border-color: #d9e8fb;
}

.rules-summary-label {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #185fa5;
}

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

.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Alert Custom */
.alert-info-custom {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: flex-start;
  color: #1e40af;
}

/* Data Card */
.data-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.88rem;
}

.form-control, .form-select {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.6rem 0.875rem;
  font-size: 0.92rem;
  color: #1f2937;
}

.form-control:focus, .form-select:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

/* Conditions */
.conditions-hint {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #92400e;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.empty-conditions {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.rules-empty-state {
  padding-block: 4rem;
}

.empty-conditions i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.condition-item {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.condition-header {
  background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-number {
  font-weight: 700;
  color: #1e40af;
}

.condition-body {
  padding: 1rem;
}

.form-label-sm {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-control-sm, .form-select-sm {
  font-size: 0.875rem;
}

.date-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.condition-description {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  color: #059669;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* Type Selector */
.type-selector {
  display: flex;
  gap: 0.75rem;
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.type-option:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.type-option.active {
  border-color: #3939ff;
  color: #3939ff;
  background: #eef2ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

.type-option i {
  font-size: 1.2rem;
}

/* Percentage Alert */
.alert-percentage {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 10px;
  color: #166534;
  font-size: 0.925rem;
}

.alert-percentage-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

@media (max-width: 991px) {
  .rules-step-shell {
    padding: 1rem;
  }

  .rules-stepper {
    flex-direction: column;
  }

  .rules-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .rules-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 767px) {
  .rules-step-actions,
  .rules-step-actions-right,
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .rules-step-close,
  .rules-step-actions .btn,
  .rules-step-actions-right .btn,
  .btn-add {
    width: 100%;
  }
}
</style>
