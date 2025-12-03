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
      class="modal-xl" 
      @modalClosed="handleCloseModal"
    >
      <div class="modal-body">
        
        <!-- Info Básica -->
        <div class="card form-card mb-3">
          <div class="card-header-modal">
            <i class="bi bi-info-circle-fill me-2"></i>
            Información Básica
          </div>
          <div class="card-body">
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
                  rows="2"
                  placeholder="Describe el objetivo de esta regla"
                ></textarea>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">
                  <i class="bi bi-star-fill me-2"></i>
                  Puntos por Venta Referida
                </label>
                <input 
                  v-model.number="formData.points_per_sale" 
                  type="number" 
                  class="form-control" 
                  placeholder="Ej: 100"
                  min="0"
                />
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
            </div>
          </div>
        </div>

        <!-- Condiciones -->
        <div class="card form-card mb-3">
          <div class="card-header-modal">
            <i class="bi bi-funnel-fill me-2"></i>
            Condiciones de Aplicación
            <button 
              class="btn btn-sm btn-light ms-auto"
              @click="addCondition"
              type="button"
            >
              <i class="bi bi-plus-circle me-1"></i> Agregar Condición
            </button>
          </div>
          <div class="card-body">
            <p class="conditions-hint">
              <i class="bi bi-lightbulb me-2"></i>
              Las ventas deben cumplir <strong>TODAS</strong> las condiciones configuradas para otorgar puntos
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
                    
                    <!-- Importe -->
                    <input 
                      v-if="condition.field === 'importe'"
                      v-model="condition.value" 
                      type="number" 
                      class="form-control form-control-sm" 
                      placeholder="Ej: 1000"
                    />
                    
                    <!-- Fecha simple -->
                    <input 
                      v-else-if="condition.field === 'date' && condition.operator !== 'between'"
                      v-model="condition.value" 
                      type="date" 
                      class="form-control form-control-sm"
                    />
                    
                    <!-- Entre fechas -->
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
                    
                    <!-- DNI simple -->
                    <input 
                      v-else-if="(condition.field === 'dni' || condition.field === 'dni_referido') && 
                                 (condition.operator === '=' || condition.operator === '!=')"
                      v-model="condition.value" 
                      type="text" 
                      class="form-control form-control-sm" 
                      placeholder="Ej: 12345678"
                    />
                    
                    <!-- DNI lista -->
                    <textarea 
                      v-else-if="(condition.field === 'dni' || condition.field === 'dni_referido') && 
                                 (condition.operator === 'in' || condition.operator === 'not_in')"
                      v-model="condition.value" 
                      class="form-control form-control-sm" 
                      rows="2"
                      placeholder="Ingresá DNIs separados por coma&#10;Ej: 12345678, 87654321, 11223344"
                    ></textarea>
                    
                    <!-- Default -->
                    <input 
                      v-else
                      v-model="condition.value" 
                      type="text" 
                      class="form-control form-control-sm" 
                      placeholder="Valor"
                    />
                  </div>
                </div>

                <!-- Descripción de la condición -->
                <div v-if="getConditionDescription(condition)" class="condition-description">
                  <i class="bi bi-arrow-right me-2"></i>
                  {{ getConditionDescription(condition) }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="saveRule">
          <i class="bi bi-floppy me-2"></i> Guardar Regla
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
          <i class="bi bi-x-circle me-2"></i> Cancelar
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

    const columns = [
      { label: 'Nombre', key: 'name' },
      { label: 'Descripción', key: 'description' },
      { label: 'Puntos', key: 'points_per_sale' },
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
          ? '<i class="bi bi-toggle-on"></i>' 
          : '<i class="bi bi-toggle-off"></i>'
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

    const getToken = async () => {
      token.value = sessionStorage.getItem('token');
    };

    const fetchRules = async () => {
      isLoading.value = true;
      try {
        // const response = await axios.get('URL_API', {
        //   headers: { Authorization: `Bearer ${token.value}` }
        // });
        // rules.value = response.data;
        
        // MOCK DATA
        rules.value = [
          {
            id: 1,
            name: 'Regla Verano 2025',
            description: 'Promoción especial para ventas de verano',
            points_per_sale: 150,
            conditions_count: 2,
            is_active: true,
            conditions: [
              { field: 'importe', operator: '>', value: 1000 },
              { field: 'date', operator: '>=', value: '2025-01-01' }
            ]
          },
          {
            id: 2,
            name: 'Regla VIP',
            description: 'Solo para clientes VIP',
            points_per_sale: 200,
            conditions_count: 1,
            is_active: false,
            conditions: [
              { field: 'importe', operator: '>=', value: 5000 }
            ]
          }
        ];
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
        points_per_sale: 100,
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
      formModal.value.openModal();
    };

    const closeModalForm = () => {
      editingIndex.value = null;
      formData.value = getEmptyForm();
      formModal.value.closeModal();
    };

    const handleCloseModal = () => {
      editingIndex.value = null;
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
        // await axios.delete(`URL_API/${ruleToDelete.id}`, {
        //   headers: { Authorization: `Bearer ${token.value}` }
        // });
        
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

      isLoading.value = true;
      try {
        const dataToSend = {
          ...formData.value,
          conditions_count: formData.value.conditions.length
        };

        if (editingIndex.value) {
          // UPDATE
          const index = rules.value.findIndex(r => r.id === editingIndex.value.id);
          if (index !== -1) {
            rules.value[index] = { ...dataToSend, id: editingIndex.value.id };
          }
          triggerToast('Éxito', 'Regla actualizada correctamente', true);
        } else {
          // CREATE
          dataToSend.id = Date.now();
          rules.value.push(dataToSend);
          triggerToast('Éxito', 'Regla creada correctamente', true);
        }

        closeModalForm();
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
/* Headers y basics ya definidos en otros componentes */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-section h2 {
  margin: 0;
  color: #1f2937;
  font-weight: 700;
}

.subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Form Cards */
.form-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.card-header-modal {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 0.875rem 1.25rem;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
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

/* Modal Footer */
.modal-footer{
  border: 0;
}
.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 6px;
}
</style>