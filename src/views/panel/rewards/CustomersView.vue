<template>
    <div class="container-fluid mt-4 page">
        <!-- <div class="header-section mb-4">
            <h2>Gestión de Clientes y Referidos</h2>
            <p class="subtitle">Administra clientes, puntos y programa de referidos</p>
        </div>
 -->
        <div class="header-section mb-4">
            <div>
                <h2>Gestión de Clientes y Referidos</h2>
                <p class="subtitle">Administra clientes, puntos y programa de referidos</p>
            </div>
            <button type="button" @click="openModalCustomer()" class="btn btn-add">
                <i class="bi bi-person-plus-fill me-1"></i> Nuevo Cliente
            </button>
        </div>
        <hr class="header-divider">


        <!-- Search Card -->
        <div class="card shadow-sm mb-4 border-0">
            <div class="card-header bg-white border-0 pt-4">
                <h5 class="mb-0">
                    <i class="bi bi-search me-2"></i>
                    Buscar Clientes
                </h5>
            </div>
            <div class="card-body p-4">
                <form @submit.prevent="searchCustomers">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-3">
                            <label for="searchType" class="form-label">Buscar por</label>
                            <select v-model="searchParams.type" id="searchType" class="form-select">
                                <option value="dni">DNI</option>
                                <option value="name">Nombre / Apellido</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                        <div class="col-md-5">
                            <label for="searchValue" class="form-label">Término de búsqueda</label>
                            <input 
                                type="text" 
                                v-model="searchParams.value" 
                                id="searchValue"
                                class="form-control" 
                                placeholder="Ingrese dato a buscar..."
                            >
                        </div>
                        <div class="col-md-4">
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary flex-grow-1">
                                    <i class="bi bi-search me-1"></i> Buscar
                                </button>
                                <!-- <button type="button" class="btn btn-outline-secondary" @click="resetSearch">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button> -->
                                <!-- <button type="button" @click="openModalCustomer()" class="btn btn-success">
                                    <i class="bi bi-person-plus-fill me-1"></i> Nuevo Cliente
                                </button> -->
                            </div>
                        </div>
                    </div>
                </form>

                <!-- Quick Stats -->
                <div class="row mt-4 g-3" v-if="customers.length > 0">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-people"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ customers.length }}</div>
                                <div class="stat-label">Clientes Totales</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-trophy"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ totalPoints }}</div>
                                <div class="stat-label">Puntos Totales</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-diagram-3"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ totalReferrals }}</div>
                                <div class="stat-label">Referidos Totales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Results Table -->
        <!-- <div class="card shadow-sm border-0 mb-5">
            <div class="card-header bg-white border-0 pt-4">
                <h5 class="mb-0">
                    <i class="bi bi-list-ul me-2"></i>
                    Listado de Clientes
                </h5>
            </div>
            <div class="card-body p-4">
                <div v-if="customers.length === 0 && !isLoading" class="text-center py-5">
                    <i class="bi bi-inbox display-1 text-muted"></i>
                    <p class="text-muted mt-3">No se encontraron clientes</p>
                    <button @click="openModalCustomer()" class="btn btn-primary">
                        <i class="bi bi-person-plus-fill me-1"></i> Agregar Primer Cliente
                    </button>
                </div>
                <DataTableComponent
                    v-else
                    :data="customers"
                    :columns="columns"
                    :actions="resultActions"
                    :items-per-page="10"
                />
            </div>
        </div> -->
        <div class="card data-card">
            <div class="card-body p-0">
                <DataTableComponent
                    :data="customers"
                    :columns="columns"
                    :actions="resultActions"
                    :items-per-page="10"
                />
            </div>
        </div>

        <!-- Modal Form -->
        <ModalComponent 
            ref="formModal" 
            modalId="formModal" 
            :modalTitle="modalTitle" 
            class="modal-lg" 
            @modalClosed="handleCloseModal"
        >
            <div class="modal-body">

                <!-- Referral Alert -->
                <div v-if="isReferralMode" class="alert alert-info border-0 shadow-sm mb-4">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-info-circle-fill fs-4 me-3"></i>
                        <div>
                            <strong>Agregando Referido</strong>
                            <p class="mb-0 small">
                                Este nuevo cliente será referido por: 
                                <strong>{{ currentReferrer?.nombre }} {{ currentReferrer?.apellido }}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Form Card -->
                <div class="card form-card mb-3">
                    <div class="card-header-modal">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Información Personal
                    </div>

                    <div class="card-body">
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label">
                                    <i class="bi bi-person me-1"></i>
                                    Nombre *
                                </label>
                                <input 
                                    type="text" 
                                    v-model="customerForm.nombre" 
                                    class="form-control"
                                    :class="{'is-invalid': validationErrors.nombre}"
                                    placeholder="Ej: Juan"
                                >
                                <div v-if="validationErrors.nombre" class="invalid-feedback">
                                    {{ validationErrors.nombre }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">
                                    <i class="bi bi-person me-1"></i>
                                    Apellido *
                                </label>
                                <input 
                                    type="text" 
                                    v-model="customerForm.apellido" 
                                    class="form-control"
                                    :class="{'is-invalid': validationErrors.apellido}"
                                    placeholder="Ej: Pérez"
                                >
                                <div v-if="validationErrors.apellido" class="invalid-feedback">
                                    {{ validationErrors.apellido }}
                                </div>
                            </div>
                        </div>

                        <h6 class="text-muted mb-3 mt-4">Información de Contacto</h6>
                        <div class="row g-3 mb-3">
                            <div class="col-md-4">
                                <label class="form-label">
                                    <i class="bi bi-credit-card me-1"></i>
                                    DNI *
                                </label>
                                <input 
                                    type="text" 
                                    v-model="customerForm.dni" 
                                    class="form-control"
                                    :class="{'is-invalid': validationErrors.dni}"
                                    placeholder="Ej: 12345678"
                                    maxlength="8"
                                >
                                <div v-if="validationErrors.dni" class="invalid-feedback">
                                    {{ validationErrors.dni }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">
                                    <i class="bi bi-envelope me-1"></i>
                                    Email *
                                </label>
                                <input 
                                    type="email" 
                                    v-model="customerForm.email" 
                                    class="form-control"
                                    :class="{'is-invalid': validationErrors.email}"
                                    placeholder="cliente@email.com"
                                >
                                <div v-if="validationErrors.email" class="invalid-feedback">
                                    {{ validationErrors.email }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">
                                    <i class="bi bi-telephone me-1"></i>
                                    Teléfono
                                </label>
                                <input 
                                    type="text" 
                                    v-model="customerForm.telefono" 
                                    class="form-control"
                                    placeholder="Ej: +54 11 1234-5678"
                                >
                            </div>
                        </div>

                        <!-- Points Display (only when editing) -->
                        <div v-if="editingIndex && customerForm.puntos !== undefined" class="mt-4">
                            <h6 class="text-muted mb-3">Información de Puntos</h6>
                            <div class="points-display">
                                <i class="bi bi-trophy-fill text-warning me-2"></i>
                                <span class="fw-bold">{{ customerForm.puntos }}</span> puntos acumulados
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModalForm">
                    <i class="bi bi-x-circle me-1"></i> Cancelar
                </button>
                <button type="button" class="btn btn-primary" @click="saveCustomer">
                    <i class="bi bi-check-circle me-1"></i> 
                    {{ isReferralMode ? 'Guardar Referido' : 'Guardar Cliente' }}
                </button>
            </div>
        </ModalComponent>

        <!-- Toast Component -->
        <ToastComponent 
            :title="toastTitle" 
            :message="toastMessage" 
            :isSuccess="isSuccess" 
            :show.sync="showToastFlag"
            ref="toastComponent"
        />

        <!-- Confirm Popup -->
        <ConfirmPopup 
            ref="confirmPopup" 
            title="Confirmar Eliminación" 
            question="¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer." 
            @response="handleResponse" 
        />

        <!-- Loading Overlay -->
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

export default {
    components: {
        DataTableComponent,
        ModalComponent,
        ToastComponent,
        ConfirmPopup,
    },
    setup() {
        // --- ESTADO ---
        const customers = ref([]);
        const customerForm = ref(getEmptyCustomerForm());
        const searchParams = ref({ type: 'dni', value: '' });
        const validationErrors = ref({});
        
        // Variables de control visual
        const isLoading = ref(false);
        const editingIndex = ref(null);
        const isReferralMode = ref(false);
        const currentReferrer = ref(null);

        // Referencias a componentes
        const formModal = ref(null);
        const toastComponent = ref(null);
        const confirmPopup = ref(null);
        
        // Toast
        const showToastFlag = ref(false);
        const toastTitle = ref('');
        const toastMessage = ref('');
        const isSuccess = ref(true);

        let customerToDelete = {};

        // --- APIS ---
        const token = ref(sessionStorage.getItem('token'));
        const API_BASE = 'https://stage.powerflows.pilotcrm.io/api';
        const endpoints = {
            search: `${API_BASE}/customers/search`,
            create: `${API_BASE}/customers/create`,
            update: `${API_BASE}/customers/update`,
            delete: `${API_BASE}/customers/delete`,
            addReferral: `${API_BASE}/customers/referral`
        };

        // --- CONFIGURACIÓN TABLA ---
        const columns = [
            { label: 'Nombre Completo', key: 'nombre', render: (row) => `${row.nombre} ${row.apellido}` },
            { label: 'DNI', key: 'dni' },
            { label: 'Email', key: 'email' },
            { label: 'Teléfono', key: 'telefono' },
            { 
                label: 'Puntos', 
                key: 'puntos',
                render: (row) => `<span class="badge bg-warning text-dark fs-6"><i class="bi bi-trophy-fill me-1"></i>${row.puntos || 0}</span>`
            },
            { 
                label: 'Referidos', 
                key: 'cantidad_referidos',
                render: (row) => `<span class="badge bg-info text-dark">${row.cantidad_referidos || 0}</span>`
            }
        ];

        const resultActions = [
            { 
                label: 'Agregar Referido', 
                class: 'btn btn-sm btn-info text-white me-1', 
                method: openAddReferralModal, 
                icon: '<i class="bi bi-person-plus"></i>' 
            },
            { 
                label: 'Ver/Editar', 
                class: 'btn btn-sm btn-primary me-1', 
                method: editCustomer, 
                icon: '<i class="bi bi-pencil-square"></i>' 
            },
            { 
                label: 'Eliminar', 
                class: 'btn btn-sm btn-danger', 
                method: confirmDelete, 
                icon: '<i class="bi bi-trash3"></i>' 
            },
        ];

        // --- COMPUTED ---
        const modalTitle = computed(() => {
            if (isReferralMode.value) return '👥 Nuevo Referido';
            return editingIndex.value ? '✏️ Editar Cliente' : '➕ Nuevo Cliente';
        });

        const totalPoints = computed(() => {
            return customers.value.reduce((sum, customer) => sum + (customer.puntos || 0), 0);
        });

        const totalReferrals = computed(() => {
            return customers.value.reduce((sum, customer) => sum + (customer.cantidad_referidos || 0), 0);
        });

        // --- VALIDACIÓN ---
        const validateForm = () => {
            validationErrors.value = {};
            let isValid = true;

            if (!customerForm.value.nombre?.trim()) {
                validationErrors.value.nombre = 'El nombre es requerido';
                isValid = false;
            }

            if (!customerForm.value.apellido?.trim()) {
                validationErrors.value.apellido = 'El apellido es requerido';
                isValid = false;
            }

            if (!customerForm.value.dni?.trim()) {
                validationErrors.value.dni = 'El DNI es requerido';
                isValid = false;
            } else if (!/^\d{7,8}$/.test(customerForm.value.dni)) {
                validationErrors.value.dni = 'DNI inválido (7-8 dígitos)';
                isValid = false;
            }

            if (!customerForm.value.email?.trim()) {
                validationErrors.value.email = 'El email es requerido';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.value.email)) {
                validationErrors.value.email = 'Email inválido';
                isValid = false;
            }

            return isValid;
        };

        // --- FUNCIONES PRINCIPALES ---
        const searchCustomers = async () => {
            isLoading.value = true;
            try {
                const params = {};
                if(searchParams.value.value) {
                    params[searchParams.value.type] = searchParams.value.value;
                }

                const response = await axios.get(endpoints.search, {
                    params: params,
                    headers: { Authorization: `Bearer ${token.value}` },
                });

                customers.value = response.data.data || []; 
                
                if (customers.value.length === 0 && searchParams.value.value) {
                    triggerToast('Sin resultados', 'No se encontraron clientes con ese criterio', false);
                }
                
            } catch (err) {
                console.error(err);
                triggerToast('Error', 'No se pudieron obtener los clientes', false);
            } finally {
                isLoading.value = false;
            }
        };

        const resetSearch = () => {
            searchParams.value = { type: 'dni', value: '' };
            searchCustomers();
        };

        const openModalCustomer = () => {
            cleanData();
            formModal.value.openModal();
        };

        function openAddReferralModal(item) {
            cleanData();
            isReferralMode.value = true;
            currentReferrer.value = item;
            formModal.value.openModal();
        }

        function editCustomer(item) {
            cleanData();
            customerForm.value = { ...item }; 
            editingIndex.value = item.id;
            formModal.value.openModal();
        }

        const saveCustomer = async () => {
            if (!validateForm()) {
                triggerToast('Validación', 'Por favor complete todos los campos requeridos', false);
                return;
            }

            isLoading.value = true;
            const payload = { ...customerForm.value };
            let url = endpoints.create;

            if (isReferralMode.value) {
                payload.referrer_id = currentReferrer.value.id;
                url = endpoints.create; 
            } else if (editingIndex.value) {
                url = endpoints.update;
            }

            try {
                const response = await axios.post(url, payload, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });

                closeModalForm();
                await searchCustomers();
                
                const msg = isReferralMode.value 
                    ? '¡Referido creado exitosamente! Puntos asignados al referente.' 
                    : editingIndex.value 
                    ? 'Cliente actualizado correctamente'
                    : 'Cliente creado exitosamente';
                    
                triggerToast('¡Éxito!', msg, true);

            } catch (err) {
                console.error(err);
                const errorMsg = err.response?.data?.message || 'Hubo un problema al guardar';
                triggerToast('Error', errorMsg, false);
            } finally {
                isLoading.value = false;
            }
        };

        function confirmDelete(item) {
            customerToDelete = item;
            confirmPopup.value.showConfirmPopup();
        }

        const handleResponse = async (isConfirmed) => {
            if (isConfirmed && customerToDelete.id) {
                isLoading.value = true;
                try {
                    await axios.post(endpoints.delete, { id: customerToDelete.id }, {
                        headers: { Authorization: `Bearer ${token.value}` },
                    });
                    
                    customers.value = customers.value.filter(c => c.id !== customerToDelete.id);
                    triggerToast('Eliminado', 'Cliente eliminado correctamente', true);
                } catch (error) {
                    console.error(error);
                    triggerToast('Error', 'No se pudo eliminar el cliente', false);
                } finally {
                    isLoading.value = false;
                    customerToDelete = {};
                }
            }
        };

        // --- UTILIDADES ---
        const cleanData = () => {
            editingIndex.value = null;
            isReferralMode.value = false;
            currentReferrer.value = null;
            customerForm.value = getEmptyCustomerForm();
            validationErrors.value = {};
        };

        const closeModalForm = () => {
            cleanData();
            formModal.value.closeModal();
        };

        const handleCloseModal = () => {
            cleanData();
        };

        function getEmptyCustomerForm() {
            return {
                nombre: '',
                apellido: '',
                dni: '',
                email: '',
                telefono: '',
                referrer_id: null
            };
        }

        const triggerToast = (title, message, success) => {
            toastTitle.value = title;
            toastMessage.value = message;
            isSuccess.value = success;
            showToastFlag.value = true;
            if (toastComponent.value?.showToas) {
                toastComponent.value.showToas();
            }
        };

        // --- INICIALIZACIÓN ---
        onMounted(() => {
            searchCustomers();
        });

        return {
            // State
            customers,
            customerForm,
            searchParams,
            validationErrors,
            isLoading,
            columns,
            resultActions,
            modalTitle,
            isReferralMode,
            currentReferrer,
            totalPoints,
            totalReferrals,
            
            // Refs
            formModal,
            toastComponent,
            confirmPopup,
            showToastFlag,
            toastTitle,
            toastMessage,
            isSuccess,

            // Methods
            searchCustomers,
            resetSearch,
            openModalCustomer,
            openAddReferralModal,
            editCustomer,
            closeModalForm,
            handleCloseModal,
            saveCustomer,
            confirmDelete,
            handleResponse
        };
    }
};
</script>

<style scoped>
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
.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* .card {
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
} */

.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    padding: 0.6rem 0.75rem;
}

.form-control:focus, .form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.btn {
    border-radius: 8px;
    padding: 0.5rem 1.2rem;
    font-weight: 500;
    transition: all 0.2s;
}

/* .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
} */
.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
}

/* Stats Cards */
.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: white;
    margin-right: 1rem;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1;
    margin-bottom: 0.3rem;
}

.stat-label {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
}

/* Points Display */
.points-display {
    background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-size: 1.2rem;
    box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

/* Alert Improvements */
.alert {
    border-radius: 10px;
    border-left: 4px solid;
}

.alert-info {
    background-color: #e7f3ff;
    border-left-color: #0dcaf0;
    color: #055160;
}

/* Modal Styling */
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

/* Empty State */
.bi-inbox {
    opacity: 0.2;
}

/* Badge Styling */
.badge {
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    font-weight: 600;
}

/* Validation */
.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    display: block;
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
    .page-header h2 {
        font-size: 1.5rem;
    }
    
    .stat-value {
        font-size: 1.5rem;
    }
    
    .stat-icon {
        width: 50px;
        height: 50px;
        font-size: 1.4rem;
    }
}
.modal-footer{
  border: 0;
}
/* Modal Footer */
.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 6px;
}
</style>