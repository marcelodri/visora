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
            <button type="button" @click="openModalCustomer()" class="btn btn-primary btn-add">
                <i class="bi bi-plus-circle me-2"></i> Nuevo Cliente
            </button>
        </div>
        <hr class="header-divider">

        <!-- Stats Cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="stat-card-box">
                    <div class="stat-card-icon bg-primary">
                        <i class="bi bi-people-fill"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">{{ customerStats.cantidad_clientes_totales ?? '—' }}</div>
                        <div class="stat-card-label">Clientes Totales</div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card-box">
                    <div class="stat-card-icon bg-warning">
                        <i class="bi bi-envelope-x-fill"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">{{ customerStats.cantidad_clientes_sin_email ?? '—' }}</div>
                        <div class="stat-card-label">Sin Email</div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card-box">
                    <div class="stat-card-icon bg-success">
                        <i class="bi bi-calendar-check-fill"></i>
                    </div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">{{ customerStats.fecha_del_ultimo_cliente_ingresado ? formatDate(customerStats.fecha_del_ultimo_cliente_ingresado) : '—' }}</div>
                        <div class="stat-card-label">Último Cliente Ingresado</div>
                    </div>
                </div>
            </div>
        </div>

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
                                <option value="document">Documento</option>
                                <option value="firstname">Nombre / Apellido</option>
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
                                :disabled="searchParams.empty"
                            >
                        </div>
                        <div class="col-md-4">
                            <div class="d-flex gap-2 align-items-center">
                                <button type="submit" class="btn btn-outline flex-grow-1">
                                    <i class="bi bi-search me-1"></i> Buscar
                                </button>
                                <button type="button" class="btn btn-danger" @click="resetSearch" title="Limpiar búsqueda">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="searchParams.empty" id="searchEmpty" @change="onEmptyToggle">
                            <label class="form-check-label text-muted" for="searchEmpty" style="font-size: 0.85rem;">
                                <i class="bi bi-funnel me-1"></i> Buscar campos vacíos (clientes sin valor en el campo seleccionado)
                            </label>
                        </div>
                    </div>
                </form>

                <!-- Quick Stats -->
                <!-- <div class="row mt-4 g-3" v-if="customers.length > 0">
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
                </div> -->
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
            <!-- Dual-mode header -->
            <div class="list-mode-header">
                <div class="list-mode-left">
                    <div class="list-mode-badge" :class="listMode === 'top' ? 'badge-top' : 'badge-search'">
                        <i :class="listMode === 'top' ? 'bi bi-trophy-fill' : 'bi bi-search'"></i>
                    </div>
                    <div>
                        <div class="list-mode-title">
                            {{ listMode === 'top' ? 'Top 10 · Mayor Puntaje' : 'Resultados de búsqueda' }}
                        </div>
                        <div class="list-mode-subtitle" v-if="listMode === 'top'">
                            Los clientes con más puntos acumulados
                        </div>
                        <div class="list-mode-subtitle" v-else>
                            {{ customers.length }} cliente{{ customers.length !== 1 ? 's' : '' }} encontrado{{ customers.length !== 1 ? 's' : '' }}
                        </div>
                    </div>
                </div>
                <button v-if="listMode === 'search'" @click="resetSearch" class="btn-back-top">
                    <i class="bi bi-trophy-fill me-1"></i> Ver ranking
                </button>
            </div>

            <div class="card-body p-0">
                <DataTableComponent
                    :data="customers"
                    :columns="columns"
                    :actions="resultActions"
                    :items-per-page="10"
                />
            </div>
        </div>

        <!-- Detail Modal (Edit - Datos Personales) -->
        <ModalComponent
            ref="detailModal"
            modalId="detailModal"
            :modalTitle="detailCustomer && detailCustomer.id ? '✏️ Editar Datos Personales' : '➕ Nuevo Cliente'"
            class="modal-lg"
            @modalClosed="detailCustomer = null"
        >
            <div class="edit-modal-content" v-if="detailCustomer">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label"><i class="bi bi-person me-1"></i>Nombre / Apellido *</label>
                        <input type="text" v-model="detailCustomer.firstname" class="form-control"
                            :class="{'is-invalid': validationErrors.firstname}" placeholder="Ej: Juan">
                        <div v-if="validationErrors.firstname" class="invalid-feedback">{{ validationErrors.firstname }}</div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label"><i class="bi bi-envelope me-1"></i>Email *</label>
                        <input type="email" v-model="detailCustomer.email" class="form-control"
                            :class="{'is-invalid': validationErrors.email}" placeholder="cliente@email.com">
                        <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email }}</div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label"><i class="bi bi-credit-card me-1"></i>Documento *</label>
                        <input type="text" v-model="detailCustomer.document" class="form-control"
                            :class="{'is-invalid': validationErrors.document}" placeholder="Ej: 12345678">
                        <div v-if="validationErrors.document" class="invalid-feedback">{{ validationErrors.document }}</div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label"><i class="bi bi-telephone me-1"></i>Teléfono</label>
                        <input type="text" v-model="detailCustomer.phone" class="form-control" placeholder="Ej: +54 11 1234-5678">
                    </div>
                    <div class="col-md-12">
                        <label class="form-label"><i class="bi bi-geo-alt me-1"></i>Dirección</label>
                        <input type="text" v-model="detailCustomer.address" class="form-control" placeholder="Ej: Av. Corrientes 1234, CABA">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label"><i class="bi bi-calendar-event me-1"></i>Fecha de Nacimiento</label>
                        <input type="date" v-model="detailCustomer.birth_date" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label"><i class="bi bi-gender-ambiguous me-1"></i>Género</label>
                        <select v-model="detailCustomer.gender" class="form-select">
                            <option value="">Seleccionar...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>
                </div>
                <div class="edit-modal-actions mt-4 pt-4">
                    <button type="button" class="btn btn-primary" @click="saveDetailCustomer">
                        <i class="bi bi-check-circle me-1"></i> {{ detailCustomer.id ? 'Guardar Cambios' : 'Crear Cliente' }}
                    </button>
                </div>
            </div>
        </ModalComponent>

        <!-- Commercial Modal (View - Información Comercial) -->
        <ModalComponent
            ref="commercialModal"
            modalId="commercialModal"
            :modalTitle="commercialCustomer ? `📊 Información Comercial - ${commercialCustomer.firstname}` : ''"
            class="modal-xxl"
            @modalClosed="commercialCustomer = null"
        >
            <div class="commercial-modal-content" v-if="commercialCustomer">
                <!-- LEFT: Profile + Stats -->
                <div class="commercial-left">
                    <div class="commercial-profile">
                        <div class="commercial-avatar">
                            <span>{{ (commercialCustomer.firstname || '?')[0] }}</span>
                        </div>
                        <span class="commercial-doc"><i class="bi bi-credit-card me-1"></i>{{ commercialCustomer.document }}</span>
                        <span class="commercial-since">Cliente desde {{ formatDate(commercialCustomer.created_dt) }}</span>
                    </div>

                    <div class="commercial-stats-vertical" v-if="commercialCustomer.id">
                        <div class="commercial-stat-row stat-points">
                            <div class="commercial-stat-icon"><i class="bi bi-trophy-fill"></i></div>
                            <div class="commercial-stat-info">
                                <div class="commercial-stat-value">{{ formatNumber(commercialCustomer.total_puntos) }}</div>
                                <div class="commercial-stat-label">Puntos</div>
                            </div>
                        </div>
                        <div class="commercial-stat-row stat-sales">
                            <div class="commercial-stat-icon"><i class="bi bi-bag-check-fill"></i></div>
                            <div class="commercial-stat-info">
                                <div class="commercial-stat-value">{{ commercialCustomer.total_ventas || 0 }}</div>
                                <div class="commercial-stat-label">Ventas</div>
                            </div>
                        </div>
                        <div class="commercial-stat-row stat-total">
                            <div class="commercial-stat-icon"><i class="bi bi-cash-stack"></i></div>
                            <div class="commercial-stat-info">
                                <div class="commercial-stat-value">{{ formatCurrency(commercialCustomer.total_facturado) }}</div>
                                <div class="commercial-stat-label">Facturado</div>
                            </div>
                        </div>
                        <div class="commercial-stat-row stat-avg">
                            <div class="commercial-stat-icon"><i class="bi bi-graph-up-arrow"></i></div>
                            <div class="commercial-stat-info">
                                <div class="commercial-stat-value">{{ formatCurrency(averageSaleCommercial) }}</div>
                                <div class="commercial-stat-label">Promedio</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: Tabs + Content -->
                <div class="commercial-right">
                    <div class="commercial-tabs">
                        
                        <button 
                            v-if="commercialCustomer.id && commercialCustomer.validaciones"
                            class="commercial-tab"
                            :class="{ active: commercialTab === 'validaciones' }"
                            @click="commercialTab = 'validaciones'"
                        >
                            <i class="bi bi-shield-check me-1"></i> Condiciones
                            <span class="commercial-tab-badge commercial-tab-badge-val" v-if="parsedValidacionesCommercial.filter(v => v.cumple).length">
                                {{ parsedValidacionesCommercial.filter(v => v.cumple).length }}/{{ parsedValidacionesCommercial.length }}
                            </span>
                        </button>
                        <button 
                            class="commercial-tab"
                            :class="{ active: commercialTab === 'ventas' }"
                            @click="commercialTab = 'ventas'"
                        >
                            <i class="bi bi-receipt-cutoff me-1"></i> Ventas
                            <span class="commercial-tab-badge" v-if="parsedSalesCommercial.length">{{ parsedSalesCommercial.length }}</span>
                        </button>
                    </div>

                    <!-- Tab: Ventas -->
                    <div v-if="commercialTab === 'ventas'" class="commercial-sales-section">
                        <div v-if="parsedSalesCommercial.length === 0" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox display-4"></i>
                            <p class="mt-2">Este cliente no tiene ventas registradas</p>
                        </div>
                        <div v-else class="sales-table-container">
                            <table class="table sales-table mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Referido</th>
                                        <th>Detalle</th>
                                        <th class="text-end">Importe</th>
                                        <th class="text-end">Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(sale, idx) in parsedSalesCommercial" :key="sale.id">
                                        <td class="sale-idx">{{ idx + 1 }}</td>
                                        <td>{{ formatDate(sale.created_at) }}</td>
                                        <td>
                                            <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start">
                                                <span class="sale-type-badge" :class="sale.product_type === 'INSTRUMENTO' ? 'type-instrumento' : 'type-accesorio'">
                                                    {{ sale.product_type }}
                                                </span>
                                                <span v-if="sale.is_purchase == 1" class="sale-propia-badge">
                                                    <i class="bi bi-person-fill"></i> propia
                                                </span>
                                                <span v-else class="sale-referida-badge">
                                                    <i class="bi bi-person-up"></i> referida
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="sale-referido-cell">
                                                <span class="sale-referido-dni">{{ sale.referred_document }}</span>
                                                <span class="sale-referido-nombre">{{ sale.buyer_name }}</span>
                                            </div>
                                        </td>
                                        <td>{{ sale.description }}</td>
                                        <td class="text-end fw-bold">{{ formatCurrency(sale.sale_amount) }}</td>
                                        <td class="text-end">
                                            <span class="sale-points"><i class="bi bi-star-fill me-1"></i>{{ formatNumber(sale.points_awarded) }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tab: Condiciones -->
                    <div v-if="commercialTab === 'validaciones'" class="commercial-validaciones-section">
                        <div v-if="parsedValidacionesCommercial.length === 0" class="text-center py-5 text-muted">
                            <i class="bi bi-shield-x display-4"></i>
                            <p class="mt-2">No hay validaciones disponibles</p>
                        </div>
                        <div v-else class="val-list">
                            <div v-for="val in parsedValidacionesCommercial" :key="val.key" class="val-card" :class="val.cumple ? 'val-ok' : 'val-fail'">
                                <!-- Header -->
                                <div class="val-header">
                                    <div class="val-icon-wrap" :class="val.cumple ? 'val-icon-ok' : 'val-icon-fail'">
                                        <i :class="`bi ${val.icono}`"></i>
                                    </div>
                                    <div class="val-title-wrap">
                                        <div class="val-title">{{ val.nombre }}</div>
                                        <div class="val-desc">{{ val.descripcion }}</div>
                                    </div>
                                    <div class="val-status" :class="val.cumple ? 'val-status-ok' : 'val-status-fail'">
                                        <i :class="val.cumple ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                                        {{ val.cumple ? 'CUMPLIDO' : 'NO CUMPLIDO' }}
                                    </div>
                                </div>
                                <!-- Métricas con barras de progreso -->
                                <div class="val-metrics">
                                    <div v-for="m in val.metricas" :key="m.label" class="val-metric-row">
                                        <div class="val-metric-label">{{ m.label }}</div>
                                        <div class="val-metric-bar-wrap">
                                            <div class="val-metric-bar"
                                                :class="m.calc >= m.des ? 'bar-ok' : 'bar-fail'"
                                                :style="{ width: m.des > 0 ? Math.min(100, Math.round(m.calc / m.des * 100)) + '%' : '0%' }">
                                            </div>
                                        </div>
                                        <div class="val-metric-nums" :class="m.calc >= m.des ? 'nums-ok' : 'nums-fail'">
                                            {{ m.calc }} / {{ m.des }}
                                        </div>
                                    </div>
                                </div>
                                <!-- Detalle de referidos -->
                                <div v-if="val.detalle && val.detalle.length" class="val-detail-wrap">
                                    <div class="val-detail-title">
                                        <i class="bi bi-people me-1"></i> Detalle de Referidos
                                    </div>
                                    <table class="val-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Documento</th>
                                                <th class="text-center">Compras</th>
                                                <th class="text-center">Instrumento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="ref in val.detalle" :key="ref.referred_document">
                                                <td>{{ ref.buyer_name }}</td>
                                                <td class="text-muted">{{ ref.referred_document }}</td>
                                                <td class="text-center">{{ ref.total_compras }}</td>
                                                <td class="text-center">
                                                    <span :class="ref.tiene_instrumento ? 'ref-badge-ok' : 'ref-badge-fail'">
                                                        <i :class="ref.tiene_instrumento ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
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
        const topCustomers = ref([]);
        const listMode = ref('top'); // 'top' | 'search'
        const searchParams = ref({ type: 'document', value: '', empty: false });
        const validationErrors = ref({});
        const customerStats = ref({});
        
        // Variables de control visual
        const isLoading = ref(false);

        // Referencias a componentes
        const detailModal = ref(null);
        const detailCustomer = ref(null);
        const detailTab = ref('persona');
        const commercialModal = ref(null);
        const commercialCustomer = ref(null);
        const commercialTab = ref('ventas');
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
        const API_BASE = 'https://apis.madautomate.cloud/webhook/ab007c4d-b051-44b6-8c1e-fb8cfb518ca3';
        // const endpoints = {
        //     search: `${API_BASE}/customers/search`,
        //     create: `${API_BASE}/customers/create`,
        //     update: `${API_BASE}/customers/update`,
        //     delete: `${API_BASE}/customers/delete`,
        //     addReferral: `${API_BASE}/customers/referral`
        // };

        // --- CONFIGURACIÓN TABLA ---
        const columns = [
            { label: 'Nombre Completo', key: 'firstname', render: (row) => `${row.firstname}` },
            { label: 'Documento', key: 'document' },
            { label: 'Email', key: 'email', render: (row) => row.email ? (row.email.length > 30 ? row.email.slice(0, 30) + '…' : row.email) : '—' },
            { 
                label: 'Puntos', 
                key: 'total_puntos',
                render: (row) => `<span class="puntos-clickeable" style="display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;font-weight:700;font-size:0.85rem;padding:4px 10px;border-radius:20px;box-shadow:0 2px 8px rgba(239,68,68,0.35);letter-spacing:0.3px;cursor:pointer"><i class="bi bi-trophy-fill" style="font-size:0.8rem"></i>${Number(row.total_puntos||0).toLocaleString('es-AR')}</span>`,
                action: openCommercialModal,
                actionTitle: 'Ver información comercial'
            },
            {
                label: 'Condiciones',
                key: 'validaciones',
                render: (row) => {
                    const v = row.validaciones;
                    if (!v || typeof v !== 'object') return '<span style="color:#9ca3af;font-size:0.8rem">—</span>';
                    const items = [
                        { key: 'validacion_compras_anuales', short: 'Compras' },
                        { key: 'validacion_referidos_anuales', short: 'Referidos' },
                        { key: 'validacion_mixta', short: 'Mixta' },
                    ];
                    return `<div style="display:flex;flex-direction:column;gap:4px">${items.map(i => {
                        const item = v[i.key];
                        if (!item) return '';
                        const ok = item.cumple;
                        const c = ok ? '#059669' : '#dc2626';
                        const bg = ok ? '#ecfdf5' : '#fef2f2';
                        const border = ok ? '#d1fae5' : '#fee2e2';
                        const icon = ok ? '✓' : '✗';
                        return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:${c};font-weight:700;font-size:0.71rem;padding:2px 8px;border-radius:10px;border:1px solid ${border}">${icon} ${i.short}</span>`;
                    }).join('')}</div>`;
                }
            },
            // { 
            //     label: 'Referidos', 
            //     key: 'cantidad_referidos',
            //     render: (row) => `<span class="badge bg-info text-dark">${row.cantidad_referidos || 0}</span>`
            // }
        ];

        const resultActions = [
            // { 
            //     label: 'Agregar Referido', 
            //     class: 'btn btn-sm btn-info text-white me-1', 
            //     method: openAddReferralModal, 
            //     icon: '<i class="bi bi-person-plus"></i>' 
            // },
            { 
                label: 'Ver/Editar', 
                class: 'btn btn-sm btn-outline me-1', 
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
        const totalPoints = computed(() => {
            return customers.value.reduce((sum, customer) => sum + (customer.puntos || 0), 0);
        });

        const totalReferrals = computed(() => {
            return customers.value.reduce((sum, customer) => sum + (customer.cantidad_referidos || 0), 0);
        });

        const averageSale = computed(() => {
            const totalFacturado = Number(detailCustomer.value?.total_facturado) || 0;
            const totalVentas = Number(detailCustomer.value?.total_ventas) || 0;
            return totalVentas > 0 ? totalFacturado / totalVentas : 0;
        });

        const averageSaleCommercial = computed(() => {
            const totalFacturado = Number(commercialCustomer.value?.total_facturado) || 0;
            const totalVentas = Number(commercialCustomer.value?.total_ventas) || 0;
            return totalVentas > 0 ? totalFacturado / totalVentas : 0;
        });

        // --- VALIDACIÓN ---
        const validateDetailForm = () => {
            validationErrors.value = {};
            let isValid = true;

            if (!detailCustomer.value.firstname?.trim()) {
                validationErrors.value.firstname = 'El nombre es requerido';
                isValid = false;
            }

            if (!detailCustomer.value.document?.trim()) {
                validationErrors.value.document = 'El documento es requerido';
                isValid = false;
            }

            if (!detailCustomer.value.email?.trim()) {
                validationErrors.value.email = 'El email es requerido';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detailCustomer.value.email)) {
                validationErrors.value.email = 'Email inválido';
                isValid = false;
            }

            return isValid;
        };

        // --- FUNCIONES PRINCIPALES ---
        const fetchTopCustomers = async () => {
            isLoading.value = true;
            try {
                const response = await axios.post(API_BASE, { action: 'topCustomers' }, {
                    headers: { Authorization: `Bearer ${token.value}` }
                });
                console.log('Top clientes obtenidos:', response);
                // Handle both raw array and wrapped formats
                let data = response.data;
                if (!Array.isArray(data)) {
                    data = Array.isArray(data?.data) ? data.data
                         : Array.isArray(data?.customers) ? data.customers
                         : [];
                }
                topCustomers.value = data;
                customers.value = [...data];
                listMode.value = 'top';


                // console.log('customers', customers.value);

            } catch (err) {
                console.error('Error al obtener top clientes:', err);
                triggerToast('Error', 'No se pudo obtener el ranking de clientes', false);
            } finally {
                isLoading.value = false;
            }
        };

        const searchCustomers = async () => {
            isLoading.value = true;
            try {
                const params = {};
                if (searchParams.value.empty) {
                    params.key = searchParams.value.type;
                    params.value = '';
                    params.empty = true;
                } else if(searchParams.value.value) {
                    params.key = searchParams.value.type;
                    params.value = searchParams.value.value;
                }

                params.action = 'getCustomer';

                const response = await axios.post(API_BASE, params, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });

                let result = response.data;
                if (!Array.isArray(result)) {
                    result = Array.isArray(result?.data) ? result.data : [];
                }
                customers.value = [...result];
                listMode.value = 'search';

                if (customers.value.length === 0 && (searchParams.value.value || searchParams.value.empty)) {
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
            searchParams.value = { type: 'document', value: '', empty: false };
            customers.value = topCustomers.value;
            listMode.value = 'top';
        };

        const refreshList = () => {
            if (listMode.value === 'top') {
                fetchTopCustomers();
            } else {
                searchCustomers();
            }
        };

        const onEmptyToggle = () => {
            if (searchParams.value.empty) {
                searchParams.value.value = '';
            }
        };

        const openModalCustomer = () => {
            validationErrors.value = {};
            detailCustomer.value = {
                firstname: '',
                lastname: '',
                document: '',
                email: '',
                phone: '',
                address: '',
                birth_date: '',
                gender: '',
                total_puntos: 0,
                total_ventas: 0,
                total_facturado: 0,
                promedio_venta: 0
            };
            detailTab.value = 'persona';
            detailModal.value.openModal();
        };

        function openAddReferralModal(item) {
            openModalCustomer();
        }

        const parsedSales = computed(() => {
            if (!detailCustomer.value || !detailCustomer.value.sales) return [];
            try {
                const sales = typeof detailCustomer.value.sales === 'string'
                    ? JSON.parse(detailCustomer.value.sales)
                    : detailCustomer.value.sales;
                return sales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } catch (e) {
                return [];
            }
        });

        const parsedSalesCommercial = computed(() => {
            if (!commercialCustomer.value || !commercialCustomer.value.sales) return [];
            try {
                const sales = typeof commercialCustomer.value.sales === 'string'
                    ? JSON.parse(commercialCustomer.value.sales)
                    : commercialCustomer.value.sales;
                return sales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } catch (e) {
                return [];
            }
        });

        const parsedValidaciones = computed(() => {
            if (!detailCustomer.value?.validaciones) return [];
            const v = detailCustomer.value.validaciones;
            const cfg = [
                {
                    key: 'validacion_compras_anuales',
                    nombre: 'Compras Anuales',
                    icono: 'bi-bag-check-fill',
                    metricas: (d) => [
                        { label: 'Compras realizadas', calc: d.valor_calculado.total_compras, des: d.valor_deseado.total_compras },
                        { label: 'Instrumentos comprados', calc: d.valor_calculado.instrumentos, des: d.valor_deseado.instrumentos_minimos },
                    ],
                    detalleKey: null,
                },
                {
                    key: 'validacion_referidos_anuales',
                    nombre: 'Referidos Anuales',
                    icono: 'bi-people-fill',
                    metricas: (d) => [
                        { label: 'Referidos totales', calc: d.valor_calculado.total_referidos, des: d.valor_deseado.total_referidos },
                        { label: 'Con instrumento', calc: d.valor_calculado.referidos_con_instrumento, des: d.valor_deseado.total_referidos },
                    ],
                    detalleKey: 'detalle',
                },
                {
                    key: 'validacion_mixta',
                    nombre: 'Validación Mixta',
                    icono: 'bi-intersect',
                    metricas: (d) => [
                        { label: 'Instrumentos propios', calc: d.valor_calculado.instrumentos_propios, des: d.valor_deseado.instrumentos_propios },
                        { label: 'Referidos con instrumento', calc: d.valor_calculado.referidos_con_instrumento, des: d.valor_deseado.referidos_con_instrumento },
                    ],
                    detalleKey: 'detalle_referidos',
                },
            ];
            return cfg
                .filter(c => v[c.key])
                .map(c => {
                    const data = v[c.key];
                    return {
                        key: c.key,
                        nombre: c.nombre,
                        icono: c.icono,
                        descripcion: data.descripcion,
                        cumple: data.cumple,
                        metricas: c.metricas(data),
                        detalle: c.detalleKey ? (data.valor_calculado?.[c.detalleKey] || []) : [],
                    };
                });
        });

        const parsedValidacionesCommercial = computed(() => {
            if (!commercialCustomer.value?.validaciones) return [];
            const v = commercialCustomer.value.validaciones;
            const cfg = [
                {
                    key: 'validacion_compras_anuales',
                    nombre: 'Compras Anuales',
                    icono: 'bi-bag-check-fill',
                    metricas: (d) => [
                        { label: 'Compras realizadas', calc: d.valor_calculado.total_compras, des: d.valor_deseado.total_compras },
                        { label: 'Instrumentos comprados', calc: d.valor_calculado.instrumentos, des: d.valor_deseado.instrumentos_minimos },
                    ],
                    detalleKey: null,
                },
                {
                    key: 'validacion_referidos_anuales',
                    nombre: 'Referidos Anuales',
                    icono: 'bi-people-fill',
                    metricas: (d) => [
                        { label: 'Referidos totales', calc: d.valor_calculado.total_referidos, des: d.valor_deseado.total_referidos },
                        { label: 'Con instrumento', calc: d.valor_calculado.referidos_con_instrumento, des: d.valor_deseado.total_referidos },
                    ],
                    detalleKey: 'detalle',
                },
                {
                    key: 'validacion_mixta',
                    nombre: 'Validación Mixta',
                    icono: 'bi-intersect',
                    metricas: (d) => [
                        { label: 'Instrumentos propios', calc: d.valor_calculado.instrumentos_propios, des: d.valor_deseado.instrumentos_propios },
                        { label: 'Referidos con instrumento', calc: d.valor_calculado.referidos_con_instrumento, des: d.valor_deseado.referidos_con_instrumento },
                    ],
                    detalleKey: 'detalle_referidos',
                },
            ];
            return cfg
                .filter(c => v[c.key])
                .map(c => {
                    const data = v[c.key];
                    return {
                        key: c.key,
                        nombre: c.nombre,
                        icono: c.icono,
                        descripcion: data.descripcion,
                        cumple: data.cumple,
                        metricas: c.metricas(data),
                        detalle: c.detalleKey ? (data.valor_calculado?.[c.detalleKey] || []) : [],
                    };
                });
        });

        function editCustomer(item) {
            console.log('customer', item);
            validationErrors.value = {};
            detailCustomer.value = { ...item };
            detailTab.value = 'persona';
            detailModal.value.openModal();
        }

        function openCommercialModal(item) {
            commercialCustomer.value = { ...item };
            commercialTab.value = 'ventas';
            commercialModal.value.openModal();
        }

        const closeDetailModal = () => {
            detailCustomer.value = null;
            detailModal.value.closeModal();
        };

        const saveDetailCustomer = async () => {
            if (!detailCustomer.value) return;
            if (!validateDetailForm()) {
                triggerToast('Validación', 'Por favor complete los campos requeridos', false);
                return;
            }
            isLoading.value = true;
            try {
                const payload = {
                    action: 'setCustomer',
                    firstname: detailCustomer.value.firstname,
                    document: String(detailCustomer.value.document || '').replace(/[.,]/g, '').trim(),
                    email: detailCustomer.value.email || '',
                    phone: detailCustomer.value.phone || '',
                    address: detailCustomer.value.address || '',
                    birth_date: detailCustomer.value.birth_date || '',
                    gender: detailCustomer.value.gender || ''
                };
                if (detailCustomer.value.id) {
                    payload.id = detailCustomer.value.id;
                }
                await axios.post(API_BASE, payload, {
                    headers: { Authorization: `Bearer ${token.value}` }
                });
                const msg = detailCustomer.value.id ? 'Cliente actualizado correctamente' : 'Cliente creado exitosamente';
                triggerToast('¡Éxito!', msg, true);
                closeDetailModal();
                await refreshList();
            } catch (err) {
                console.error(err);
                triggerToast('Error', err.response?.data?.message || 'No se pudo guardar el cliente', false);
            } finally {
                isLoading.value = false;
            }
        };

        const formatDate = (dateStr) => {
            if (!dateStr) return '—';
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-AR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        };

        const formatNumber = (val) => {
            return new Intl.NumberFormat('es-AR').format(Number(val) || 0);
        };

        const formatCurrency = (val) => {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(val) || 0);
        };

        function confirmDelete(item) {
            customerToDelete = item;
            confirmPopup.value.showConfirmPopup();
        }

        const handleResponse = async (isConfirmed) => {
            if (isConfirmed && customerToDelete.id) {
                isLoading.value = true;
                try {
                    await axios.post(API_BASE, { action: 'deleteCustomer', id: customerToDelete.id }, {
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
        const fetchCustomerStats = async () => {
            try {
                const response = await axios.post(API_BASE, { action: 'dataCustomers' }, {
                    headers: { Authorization: `Bearer ${token.value}` }
                });
                customerStats.value = response.data?.[0] || response.data || {};
            } catch (err) {
                console.error('Error al obtener estadísticas:', err);
            }
        };

        onMounted(() => {
            fetchCustomerStats();
            fetchTopCustomers();
        });

        return {
            // State
            customers,
            topCustomers,
            listMode,
            searchParams,
            validationErrors,
            customerStats,
            isLoading,
            columns,
            resultActions,
            totalPoints,
            totalReferrals,
            averageSale,
            averageSaleCommercial,
            
            // Refs
            detailModal,
            detailCustomer,
            detailTab,
            commercialModal,
            commercialCustomer,
            commercialTab,
            parsedSales,
            parsedSalesCommercial,
            parsedValidaciones,
            parsedValidacionesCommercial,
            toastComponent,
            confirmPopup,
            showToastFlag,
            toastTitle,
            toastMessage,
            isSuccess,

            // Methods
            fetchTopCustomers,
            searchCustomers,
            resetSearch,
            onEmptyToggle,
            openModalCustomer,
            editCustomer,
            openCommercialModal,
            closeDetailModal,
            saveDetailCustomer,
            confirmDelete,
            handleResponse,
            formatDate,
            formatNumber,
            formatCurrency
        };
    }
};
</script>

<style scoped>
/* ===== REWARDS DESIGN SYSTEM ===== */
/* Shared tokens: #1f2937 (text), #6b7280 (muted), #e5e7eb (border), #3939ff (primary), #f9fafb (bg-light) */

/* Stat Cards */
.stat-card-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 1.25rem 1.5rem;
}

.stat-card-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  flex-shrink: 0;
}

.stat-card-content {
  min-width: 0;
}

.stat-card-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
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

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem!important;
  border-radius: 8px;
}

/* Search Card */
.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

/* Form */
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

.btn {
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  font-size: 0.92rem;
  transition: all 0.2s;
}

/* DataTable Card */
.data-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* Dual-mode list header */
.list-mode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #f3f4f6;
  background: #fafafa;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.list-mode-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.list-mode-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.badge-top {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.badge-search {
  background: rgba(57, 57, 255, 0.1);
  color: #3939ff;
}

.list-mode-title {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.97rem;
  line-height: 1.2;
}

.list-mode-subtitle {
  font-size: 0.79rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.btn-back-top {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}

.btn-back-top:hover {
  border-color: #d97706;
  color: #d97706;
  background: rgba(245, 158, 11, 0.06);
}

/* Form Modal */
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
  font-size: 0.92rem;
}

/* Points Display */
.points-display {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 1.1rem;
}

/* Modal Footer */
.modal-footer {
  border: 0;
}

.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 8px;
}

/* Validation */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* Puntos Clickeable */
.puntos-clickeable {
  transition: all 0.2s ease;
}

.puntos-clickeable:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45) !important;
}

/* Detail Modal */
.detail-horizontal {
    min-height: 0;
    height: calc(100vh - 58px);
    max-height: calc(100vh - 58px);
    overflow: hidden;
}

/* EDIT MODAL (Datos Personales) */
.edit-modal-content {
  padding: 1.5rem;
}

.edit-modal-actions {
  display: flex;
  justify-content: flex-end;
}

/* ModalComponent owns the dialog markup, so these overrides must cross the scoped boundary. */
:deep(.modal-lg) {
    width: auto;
    max-width: 600px;
}

:deep(.modal-lg .modal-content) {
    height: auto;
}

:deep(.modal-lg .modal-body) {
    padding: 0;
}

/* COMMERCIAL MODAL (Información Comercial) */
.commercial-modal-content {
  display: flex;
  align-items: stretch;
  height: calc(100vh - 58px);
  max-height: calc(100vh - 58px);
  overflow: hidden;
}

:deep(.modal-xxl) {
    width: 99vw;
    max-width: 1600px;
    height: 100vh;
    margin: 0 auto;
}

:deep(.modal-xxl .modal-content) {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
}

:deep(.modal-xxl .modal-header) {
    min-height: 58px;
    flex-shrink: 0;
    padding: 0.85rem 1.25rem;
}

:deep(.modal-xxl .modal-body) {
    min-height: 0;
    height: calc(100vh - 58px);
    overflow: hidden;
    padding: 0;
}

.commercial-left {
  width: 230px;
  min-width: 230px;
    min-height: 0;
  background: linear-gradient(180deg, #3939ff 0%, #5b21b6 100%);
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

.commercial-profile {
  text-align: center;
  padding: 2rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.commercial-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border: 3px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.commercial-doc {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  font-weight: 500;
}

.commercial-since {
  color: rgba(255,255,255,0.55);
  font-size: 0.75rem;
}

/* Stats vertical */
.commercial-stats-vertical {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.commercial-stat-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.12);
  transition: background 0.15s;
}

.commercial-stat-row:hover {
  background: rgba(255,255,255,0.08);
}

.commercial-stat-icon {
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.commercial-stat-info {
  flex: 1;
  min-width: 0;
}

.commercial-stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.commercial-stat-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.55);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Right panel */
.commercial-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
    min-height: 0;
}

/* Tabs */
.commercial-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
    overflow-x: auto;
}

.commercial-tab {
  flex: 1;
  padding: 0.85rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.commercial-tab:hover {
  color: #374151;
  background: #f3f4f6;
}

.commercial-tab.active {
  color: #3939ff;
  border-bottom-color: #3939ff;
  background: white;
}

.commercial-tab-badge {
  background: #3939ff;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

.commercial-tab-badge-val {
  background: #10b981;
}

/* Sales and Validations Sections */
.commercial-sales-section {
  flex: 1;
    min-height: 0;
  overflow-y: auto;
}

.commercial-validaciones-section {
  flex: 1;
    min-height: 0;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-horizontal {
  display: flex;
    align-items: stretch;
}

.detail-left {
  width: 230px;
  min-width: 230px;
    min-height: 0;
  background: linear-gradient(180deg, #3939ff 0%, #5b21b6 100%);
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

.detail-profile {
  text-align: center;
  padding: 2rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border: 3px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.detail-name {
  color: white;
  font-weight: 800;
  font-size: 1.15rem;
  margin: 0;
  line-height: 1.3;
}

.detail-doc {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  font-weight: 500;
}

.detail-since {
  color: rgba(255,255,255,0.55);
  font-size: 0.75rem;
}

/* Stats vertical */
.detail-stats-vertical {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.detail-stat-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.12);
  transition: background 0.15s;
}

.detail-stat-row:hover {
  background: rgba(255,255,255,0.08);
}

.detail-stat-icon {
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-points .detail-stat-icon { background: rgba(245,158,11,0.2); color: #fbbf24; }
.stat-sales .detail-stat-icon { background: rgba(59,130,246,0.2); color: #60a5fa; }
.stat-total .detail-stat-icon { background: rgba(16,185,129,0.2); color: #34d399; }
.stat-avg .detail-stat-icon { background: rgba(139,92,246,0.2); color: #a78bfa; }

.detail-stat-info {
  flex: 1;
  min-width: 0;
}

.detail-stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-stat-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.55);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Right panel */
.detail-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
    min-height: 0;
}

/* Tabs */
.detail-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
    overflow-x: auto;
}

.detail-tab {
  flex: 1;
  padding: 0.85rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.detail-tab:hover {
  color: #374151;
  background: #f3f4f6;
}

.detail-tab.active {
  color: #3939ff;
  border-bottom-color: #3939ff;
  background: white;
}

.detail-tab-badge {
  background: #3939ff;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

/* Edit Section */
.detail-edit-section {
  padding: 1.5rem;
  flex: 1;
    min-height: 0;
  overflow-y: auto;
}

.detail-edit-actions {
  display: flex;
  justify-content: flex-end;
}

/* Sales Table */
.detail-sales-section {
  flex: 1;
    min-height: 0;
  overflow-y: auto;
}

.sales-table-container {
  overflow-x: auto;
}

.sales-table {
  font-size: 0.88rem;
}

.sales-table thead {
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.sales-table thead th {
  font-weight: 700;
  color: #374151;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sales-table tbody tr {
  transition: background 0.15s;
}

.sales-table tbody tr:hover {
  background: #f9fafb;
}

.sales-table tbody td {
  padding: 0.65rem 1rem;
  vertical-align: middle;
  color: #1f2937;
}

.sale-idx {
  color: #9ca3af;
  font-weight: 600;
  font-size: 0.8rem;
}

.sale-type-badge {
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

.sale-propia-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  border: 1px solid #fde68a;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.sale-referida-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  border: 1px solid #ddd6fe;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.sale-referido-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sale-referido-dni {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1f2937;
}

.sale-referido-nombre {
  font-size: 0.74rem;
  color: #6b7280;
}

.sale-points {
  color: #d97706;
  font-weight: 700;
}

/* ===== VALIDACIONES ===== */
.detail-validaciones-section {
  flex: 1;
    min-height: 0;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.val-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.val-card {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid;
}

.val-ok {
  border-color: #d1fae5;
  background: #f0fdf4;
}

.val-fail {
  border-color: #fee2e2;
  background: #fff5f5;
}

.val-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.val-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.val-icon-ok {
  background: rgba(16,185,129,0.15);
  color: #059669;
}

.val-icon-fail {
  background: rgba(239,68,68,0.12);
  color: #dc2626;
}

.val-title-wrap {
  flex: 1;
  min-width: 0;
}

.val-title {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.92rem;
}

.val-desc {
  font-size: 0.77rem;
  color: #6b7280;
  margin-top: 0.1rem;
}

.val-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.val-status-ok {
  background: #d1fae5;
  color: #065f46;
}

.val-status-fail {
  background: #fee2e2;
  color: #991b1b;
}

/* Progress metrics */
.val-metrics {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.val-metric-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.val-metric-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  width: 170px;
  flex-shrink: 0;
}

.val-metric-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(0,0,0,0.08);
  border-radius: 4px;
  overflow: hidden;
}

.val-metric-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
  min-width: 4px;
}

.bar-ok {
  background: linear-gradient(90deg, #10b981, #059669);
}

.bar-fail {
  background: linear-gradient(90deg, #f87171, #dc2626);
}

.val-metric-nums {
  font-size: 0.82rem;
  font-weight: 700;
  width: 46px;
  text-align: right;
  flex-shrink: 0;
}

.nums-ok {
  color: #059669;
}

.nums-fail {
  color: #dc2626;
}

/* Referidos detail table */
.val-detail-wrap {
  border-top: 1px solid rgba(0,0,0,0.07);
  padding: 0.75rem 1rem;
}

.val-detail-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 0.5rem;
}

.val-detail-table {
  width: 100%;
  font-size: 0.8rem;
  border-collapse: collapse;
}

.val-detail-table thead th {
  padding: 0.4rem 0.6rem;
  color: #6b7280;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}

.val-detail-table tbody td {
  padding: 0.45rem 0.6rem;
  color: #1f2937;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  vertical-align: middle;
}

.val-detail-table tbody tr:last-child td {
  border-bottom: none;
}

.ref-badge-ok {
  color: #059669;
  font-size: 1rem;
}

.ref-badge-fail {
  color: #dc2626;
  font-size: 1rem;
}

.val-tab-badge {
  background: #10b981 !important;
}

/* Responsive */
@media (max-width: 768px) {
    :deep(.modal-xxl) {
        width: 100vw;
        max-width: 100vw;
        margin: 0;
    }

    :deep(.modal-xxl .modal-content) {
        height: auto;
        min-height: 100vh;
        max-height: none;
    }

    :deep(.modal-xxl .modal-body) {
        height: auto;
        min-height: calc(100vh - 58px);
        max-height: none;
        overflow-y: auto;
    }

  .detail-horizontal {
    flex-direction: column;
        height: auto;
        max-height: none;
        overflow: visible;
  }

  .detail-left {
    width: 100%;
    min-width: auto;
        flex-shrink: 0;
  }

  .detail-stats-vertical {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .detail-stat-row {
    flex: 1;
    min-width: 50%;
    border-top: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
  }

    .detail-edit-section,
    .detail-sales-section,
    .detail-validaciones-section {
        max-height: none;
        overflow: visible;
    }

    .detail-tabs {
        flex-wrap: nowrap;
    }

    .detail-tab {
        flex: 0 0 auto;
        min-width: 150px;
    }
}
</style>
