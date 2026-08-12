
<template>
    <div class="container-fluid mt-4 page forms">

        <div class="header-section mb-4">
            <h2>{{ $t('forms.title') }}</h2>
            <button @click="openModalForm()" class="btn btn-primary btn-add">
                <i class="bi bi-plus-circle me-2"></i> {{ $t('forms.button_mas') }}
            </button>
        </div>

        <hr class="header-divider">

        <!-- Tip Accordion (sin cambios) -->
        <div class="accordion mb-5" id="accordionPages">
        <div class="accordion-item tip-banner-style">
            <h2 class="accordion-header" id="headingPages">
            <button 
                class="accordion-button collapsed tip-banner-button" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapsePages" 
                aria-expanded="false" 
                aria-controls="collapsePages"
            >
                <div class="tip-icon">
                <i class="bi bi-lightbulb-fill"></i>
                </div>
                <div class="tip-text">
                <strong>Tip:</strong> Creá páginas por modelo y negocio con imágenes (carrusel automático si hay más de una), textos personalizados y asociá un formulario de tu biblioteca.
                </div>
            </button>
            </h2>
            <div 
            id="collapsePages" 
            class="accordion-collapse collapse" 
            aria-labelledby="headingPages" 
            data-bs-parent="#accordionPages"
            >
            <div class="accordion-body tip-expanded">
                <p>Esta sección te permite <strong>crear y personalizar páginas individuales</strong> para cada combinación de modelo y negocio.</p>
                
                <h6 class="mt-3"><strong>1. Información básica</strong></h6>
                <ul>
                <li><strong>Modelo</strong>: seleccioná el modelo asociado a esta página</li>
                <li><strong>Negocio</strong>: seleccioná el tipo de negocio</li>
                <li><strong>Código de llamada (Call Code)</strong>: identificador único para integrar esta página</li>
                </ul>

                <h6 class="mt-3"><strong>2. Contenido visual</strong></h6>
                <ul>
                <li><strong>Imágenes</strong>: agregá una o varias imágenes
                    <ul>
                    <li>✨ <strong>Múltiples imágenes</strong>: se activa automáticamente un carrusel</li>
                    <li><strong>Una sola imagen</strong>: se muestra estática</li>
                    </ul>
                </li>
                </ul>

                <h6 class="mt-3"><strong>3. Textos personalizados</strong></h6>
                <ul>
                <li><strong>Título</strong> principal de la página</li>
                <li><strong>Descripción</strong> y otros textos personalizables</li>
                </ul>

                <h6 class="mt-3"><strong>4. Formulario asociado</strong></h6>
                <p>Seleccioná un <strong>formulario existente</strong> de tu biblioteca para asociarlo a esta página.</p>
                <ul>
                <li>✅ Un mismo formulario puede usarse en múltiples páginas</li>
                <li>✅ Podés cambiar el formulario asociado en cualquier momento</li>
                <li>✅ Los cambios en el formulario se reflejan automáticamente en todas las páginas que lo usan</li>
                </ul>

                <div class="alert alert-info mt-3 mb-0">
                <i class="bi bi-info-circle-fill me-2"></i>
                <strong>Recordá:</strong> Los formularios se crean y gestionan por separado en la sección "Formularios". Desde acá solo seleccionás cuál querés asociar a esta página.
                </div>
            </div>
            </div>
        </div>
        </div>

        <div class="card data-card">
        <div class="card-body p-0">
            <DataTableComponent
            :data="pages"
            :columns="columns"
            :actions="resultActions"
            :items-per-page="10"
            :marcas="marcas"
            :negocios="negocios"
            />
        </div>
        </div>

        <!-- MODAL PRINCIPAL -->
        <ModalComponent 
        ref="formModal" 
        modalId="formModal" 
        :modalTitle="editingIndex === null ? 'Nueva página' : 'Editar página'" 
        class="modal-fullscreen-fixed" 
        @modalClosed="handleCloseModal"
        >
        <div class="pages-step-modal">
            <div class="pages-step-shell">
                <!--<div class="pages-step-topbar">
                    <div>
                        <h3 class="pages-step-title">{{ editingIndex === null ? 'Nueva página' : 'Editar página' }}</h3>
                        <p class="pages-step-subtitle">Reemplazamos los acordeones por un flujo guiado en pasos, tomando como referencia el diseño de StockView.</p>
                    </div>
                    <button type="button" class="btn btn-outline-secondary pages-step-close" @click="closeModalForm">
                        <i class="bi bi-x-circle me-2"></i>{{ $t('search_view.cancel') }}
                    </button>
                </div>-->

                <div class="pages-stepper">
                    <button
                    v-for="(step, index) in formSteps"
                    :key="step.key"
                    type="button"
                    class="pages-step-item"
                    :class="{ active: currentStep === index, done: currentStep > index }"
                    @click="goToStep(index)"
                    >
                    <div class="pages-step-num">
                        <i v-if="currentStep > index" class="bi bi-check-lg"></i>
                        <span v-else>{{ index + 1 }}</span>
                    </div>
                    <div class="pages-step-copy">
                        <span>{{ step.label }}</span>
                        <small>{{ step.description }}</small>
                    </div>
                    </button>
                </div>

                <div class="pages-step-content">
                    <div v-show="currentStep === 0" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-info-circle-fill"></i>
                                <span>Datos básicos</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label"><i class="bi bi-file-text me-2"></i>{{ $t('forms.form_name') }}:</label>
                                        <input v-model="formData.name" type="text" class="form-control" />
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label"><i class="bi bi-hash me-2"></i>{{ $t('forms.form_code') }}:</label>
                                        <input v-model="formData.code" type="text" class="form-control" />
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label"><i class="bi bi-tag-fill me-2"></i>{{ $t('menu.brands') }}:</label>
                                        <select v-model="formData.marca_id" class="form-select">
                                            <option value="">Seleccione una marca</option>
                                            <option v-for="marca in marcas" :key="marca.id" :value="marca.id">{{ marca.name }}</option>
                                        </select>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label"><i class="bi bi-briefcase-fill me-2"></i>{{ $t('menu.business-types') }}:</label>
                                        <select v-model="formData.tipo_de_negocio_id" class="form-select">
                                            <option value="">Seleccione un tipo de negocio</option>
                                            <option v-for="negocio in negocios" :key="negocio.id" :value="negocio.id">{{ negocio.name }}</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="pages-toggle-box mt-4">
                                    <div class="row g-3">
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="menuVisibleSwitch"
                                                :checked="formData.menu_is_visible === 'true' || formData.menu_is_visible === true"
                                                @change="formData.menu_is_visible = $event.target.checked ? 'true' : 'false'"
                                                >
                                                <label class="form-check-label fw-bold" for="menuVisibleSwitch">
                                                Menú Visible: {{ formData.menu_is_visible === 'true' || formData.menu_is_visible === true ? 'Sí' : 'No' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.menu_is_visible === 'true' || formData.menu_is_visible === true">
                                                        <strong>Visible:</strong> El menú será mostrado en la página.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Oculto:</strong> El menú no será visible en la página.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="footerVisibleSwitch"
                                                :checked="formData.footer_is_visible === 'true' || formData.footer_is_visible === true"
                                                @change="formData.footer_is_visible = $event.target.checked ? 'true' : 'false'"
                                                >
                                                <label class="form-check-label fw-bold" for="footerVisibleSwitch">
                                                Footer Visible: {{ formData.footer_is_visible === 'true' || formData.footer_is_visible === true ? 'Sí' : 'No' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.footer_is_visible === 'true' || formData.footer_is_visible === true">
                                                        <strong>Visible:</strong> El footer será mostrado en la página.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Oculto:</strong> El footer no será visible en la página.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="stockVisibleSwitch"
                                                :checked="formData.stock_id === 1 || formData.stock_id === '1'"
                                                @change="formData.stock_id = $event.target.checked ? 1 : null"
                                                >
                                                <label class="form-check-label fw-bold" for="stockVisibleSwitch">
                                                Mostrar Stock: {{ formData.stock_id === 1 || formData.stock_id === '1' ? 'Sí' : 'No' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.stock_id === 1 || formData.stock_id === '1'">
                                                        <strong>Activo:</strong> Esta página mostrará la sección de stock.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Inactivo:</strong> Esta página no mostrará la sección de stock.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 1" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-images"></i>
                                <span>Imágenes de la página</span>
                            </div>
                            <div class="pages-card-body">
                                <label class="form-label">
                                    <i class="bi bi-card-image me-2"></i>{{ $t('forms.form_img') }}:
                                </label>

                                <input
                                type="file"
                                class="d-none"
                                id="fileInput"
                                accept="image/*"
                                multiple
                                @change="handleMultipleImageUpload"
                                />
                                <label for="fileInput" class="file-input-label">
                                    <i class="bi bi-cloud-upload me-2"></i>
                                    Seleccionar imágenes...
                                </label>

                                <div v-if="formData.images && formData.images.length > 0" class="mt-2 mb-3">
                                    <small class="text-muted">{{ formData.images.length }} imagen(es) cargada(s)</small>
                                </div>

                                <div v-if="formData.images && formData.images.length > 0" class="images-grid">
                                    <div
                                    v-for="(img, index) in formData.images"
                                    :key="index"
                                    class="image-preview-container"
                                    >
                                        <div class="image-preview">
                                            <img
                                            :src="img.data || `https://madcoder.io/apis/images_upload/${img.path}`"
                                            class="preview-image"
                                            :alt="`Imagen ${index + 1}`"
                                            />
                                            <button
                                            class="btn-remove-image"
                                            @click="removeImageByIndex(index, img)"
                                            type="button"
                                            >
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                            <div class="image-number">{{ index + 1 }}</div>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="text-center text-muted py-4">
                                    <i class="bi bi-image pages-empty-icon"></i>
                                    <p class="mt-2 mb-0">No hay imágenes cargadas</p>
                                </div>

                                <div class="pages-toggle-box mt-4">
                                    <div class="form-check form-switch">
                                        <input
                                        class="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="headerVisibleSwitch"
                                        :checked="formData.header_is_visible === 'true' || formData.header_is_visible === true"
                                        @change="formData.header_is_visible = $event.target.checked ? 'true' : 'false'"
                                        >
                                        <label class="form-check-label fw-bold" for="headerVisibleSwitch">
                                        Encabezado Visible: {{ formData.header_is_visible === 'true' || formData.header_is_visible === true ? 'Sí' : 'No' }}
                                        </label>
                                    </div>
                                    <div class="mt-2">
                                        <small class="text-muted">
                                            <i class="bi bi-info-circle me-1"></i>
                                            <span v-if="formData.header_is_visible === 'true' || formData.header_is_visible === true">
                                                <strong>Visible:</strong> El encabezado (imágenes) será mostrado en la página.
                                            </span>
                                            <span v-else>
                                                <strong>Oculto:</strong> El encabezado (imágenes) no será visible en la página.
                                            </span>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 2" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-text-left"></i>
                                <span>Encabezado de la página</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="mb-3">
                                    <label class="form-label">{{ $t('forms.form_title') }}:</label>
                                    <input v-model="formData.header_text" type="text" class="form-control" />
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">{{ $t('forms.form_subtitle') }}:</label>
                                    <input v-model="formData.header_subtext" type="text" class="form-control" />
                                </div>
                                <div class="mb-0">
                                    <label class="form-label">{{ $t('forms.form_descript') }}:</label>
                                    <textarea v-model="formData.header_descript" class="form-control" style="height:160px"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 3" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-ui-checks-grid"></i>
                                <span>Formulario</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="row g-3">
                                    <div class="col-12 col-lg-6">
                                        <label class="form-label">Selecciona un formulario:</label>
                                        <select v-model="formData.form_id" class="form-select">
                                            <option :value="0">Ninguno</option>
                                            <option v-for="form in forms" :key="form.id" :value="form.id">{{ form.name }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 4" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-grid-3x3-gap-fill"></i>
                                <span>Sección 1 (Productos)</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="row g-3 mb-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Enlace Name</label>
                                        <input v-model="formData.product_label" type="text" class="form-control" />
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Product Title</label>
                                        <input v-model="formData.product_title" type="text" class="form-control" />
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Product Descripción</label>
                                    <textarea class="form-control" v-model="formData.product_description" style="height:200px"></textarea>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Background</label>
                                        <div class="color-picker-wrapper">
                                            <input v-model="formData.product_background" type="color" class="color-input" />
                                            <input type="text" v-model="formData.product_background" class="color-value-input" />
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Color</label>
                                        <div class="color-picker-wrapper">
                                            <input v-model="formData.product_color" type="color" class="color-input" />
                                            <input type="text" v-model="formData.product_color" class="color-value-input" />
                                        </div>
                                    </div>
                                </div>

                                <div class="pages-toggle-box mt-4">
                                    <div class="row g-3">
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="productVisibleSwitch"
                                                :checked="formData.product_is_visible === 'true' || formData.product_is_visible === true"
                                                @change="formData.product_is_visible = $event.target.checked ? 'true' : 'false'"
                                                >
                                                <label class="form-check-label fw-bold" for="productVisibleSwitch">
                                                Visible: {{ formData.product_is_visible === 'true' || formData.product_is_visible === true ? 'Sí' : 'No' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.product_is_visible === 'true' || formData.product_is_visible === true">
                                                        <strong>Visible:</strong> Esta sección será mostrada en la página.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Oculto:</strong> Esta sección no será visible en la página.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="productCarouselSwitch"
                                                :checked="formData.product_carrouselcard === 1"
                                                @change="formData.product_carrouselcard = $event.target.checked ? 1 : 0"
                                                >
                                                <label class="form-check-label fw-bold" for="productCarouselSwitch">
                                                {{ formData.product_carrouselcard === 1 ? 'Carrousel Activo' : 'Carrousel Inactivo' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.product_carrouselcard === 1">
                                                        <strong>Carrusel:</strong> En desktop se mostrarán 3 cards en la primera pantalla, las demás estarán disponibles mediante navegación del carrusel. En móvil se mostrará 1 card a la vez.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Grid:</strong> Las cards se mostrarán una al lado de la otra en filas de 3. Todas las cards serán visibles sin necesidad de navegación.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 5" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-card-text"></i>
                                <span>Sección 2 (About)</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="row g-3 mb-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Enlace Name</label>
                                        <input v-model="formData.about_label" type="text" class="form-control" />
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">About Title</label>
                                        <input v-model="formData.about_title" type="text" class="form-control" />
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">About Descripción</label>
                                    <textarea class="form-control" v-model="formData.about_description" style="height:200px"></textarea>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Background</label>
                                        <div class="color-picker-wrapper">
                                            <input v-model="formData.about_background" type="color" class="color-input" />
                                            <input type="text" v-model="formData.about_background" class="color-value-input" />
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Color</label>
                                        <div class="color-picker-wrapper">
                                            <input v-model="formData.about_color" type="color" class="color-input" />
                                            <input type="text" v-model="formData.about_color" class="color-value-input" />
                                        </div>
                                    </div>
                                </div>

                                <div class="pages-toggle-box mt-4">
                                    <div class="row g-3">
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="aboutVisibleSwitch"
                                                :checked="formData.about_is_visible === 'true' || formData.about_is_visible === true"
                                                @change="formData.about_is_visible = $event.target.checked ? 'true' : 'false'"
                                                >
                                                <label class="form-check-label fw-bold" for="aboutVisibleSwitch">
                                                Visible: {{ formData.about_is_visible === 'true' || formData.about_is_visible === true ? 'Sí' : 'No' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.about_is_visible === 'true' || formData.about_is_visible === true">
                                                        <strong>Visible:</strong> Esta sección será mostrada en la página.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Oculto:</strong> Esta sección no será visible en la página.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <div class="form-check form-switch">
                                                <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="aboutCarouselSwitch"
                                                :checked="formData.about_carrouselcard === 1"
                                                @change="formData.about_carrouselcard = $event.target.checked ? 1 : 0"
                                                >
                                                <label class="form-check-label fw-bold" for="aboutCarouselSwitch">
                                                {{ formData.about_carrouselcard === 1 ? 'Carrousel Activo' : 'Carrousel Inactivo' }}
                                                </label>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    <span v-if="formData.about_carrouselcard === 1">
                                                        <strong>Carrusel:</strong> En desktop se mostrarán 3 cards en la primera pantalla, las demás estarán disponibles mediante navegación del carrusel. En móvil se mostrará 1 card a la vez.
                                                    </span>
                                                    <span v-else>
                                                        <strong>Grid:</strong> Las cards se mostrarán una al lado de la otra en filas de 3. Todas las cards serán visibles sin necesidad de navegación.
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 6" class="pages-step-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-code-square"></i>
                                <span>Contenido HTML</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="col-12">
                                    <h5 class="form-label">HTML Personalizado</h5>
                                    <textarea
                                    v-model="formData.html_content"
                                    class="form-control css-editor"
                                    rows="15"
                                    placeholder="/* Escribe tu HTML aquí */

<h1>Hello</h1>"
                                    spellcheck="false"
                                    @keydown.tab.prevent="handleTab"
                                    ></textarea>
                                    <small class="form-text text-muted">
                                        Escribe HTML. El código se aplicará automáticamente en la página.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pages-step-actions">
                    <button v-if="currentStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStep">
                        <i class="bi bi-arrow-left me-2"></i>Anterior
                    </button>
                    <div v-else></div>
                    <div class="pages-step-actions-right">
                        <!--<button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
                            Cancelar
                        </button>-->
                        <button v-if="currentStep < formSteps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
                            Siguiente <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                        <button v-else type="button" class="btn btn-primary" @click="saveForm">
                            <i class="bi bi-floppy me-2"></i>{{ $t('search_view.save') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </ModalComponent>

        <!-- MODAL ESTILOS (simplificado) -->
        <ModalComponent ref="styleModal" modalId="styleModal" :modalTitle="'Estilo de formulario'" class="modal-fullscreen-fixed">
        <div class="pages-style-modal">
            <div class="pages-style-shell">
                <!--<div class="pages-style-topbar">
                    <div>
                        <h3 class="pages-style-title">Estilo de formulario</h3>
                        <p class="pages-style-subtitle">Configurá template, paleta visual y clases personalizadas con el mismo formato guiado del resto de la vista.</p>
                    </div>
                    <button type="button" class="btn btn-outline-secondary pages-style-close" @click="closeStyleModalForm">
                        <i class="bi bi-x-circle me-2"></i>{{$t('search_view.cancel')}}
                    </button>
                </div>-->

                <div class="pages-style-stepper">
                    <button
                    v-for="(step, index) in styleSteps"
                    :key="step.key"
                    type="button"
                    class="pages-style-step-item"
                    :class="{ active: currentStyleStep === index, done: currentStyleStep > index }"
                    @click="goToStyleStep(index)"
                    >
                        <div class="pages-style-step-num">
                            <i v-if="currentStyleStep > index" class="bi bi-check-lg"></i>
                            <span v-else>{{ index + 1 }}</span>
                        </div>
                        <div class="pages-style-step-copy">
                            <span>{{ step.label }}</span>
                            <small>{{ step.description }}</small>
                        </div>
                    </button>
                </div>

                <div class="pages-style-content">
                    <div v-show="currentStyleStep === 0" class="pages-style-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-grid-1x2-fill"></i>
                                <span>{{$t('menu.templates')}}</span>
                            </div>
                            <div class="pages-card-body">
                                <label class="form-label">Template visual</label>
                                <select v-model="formData.selectedStyleOption" class="form-select mb-0">
                                    <option disabled value="">Selecciona un template</option>
                                    <option v-for="(item, index) in styleOptions" :key="index" :value="item.code">{{ item.name }}</option>
                                </select>

                                <div class="pages-style-toggle-list mt-4">
                                    <div class="pages-style-toggle-row">
                                        <div class="pages-style-toggle-info">
                                            <span>Efecto parallax en el header</span>
                                            <p>Activa o desactiva el efecto visual del encabezado para contemplarlo después en base y render.</p>
                                        </div>
                                        <label class="pages-style-switch">
                                            <input
                                                type="checkbox"
                                                :checked="formData.header_is_paralax === 1 || formData.header_is_paralax === '1' || formData.header_is_paralax === true"
                                                @change="formData.header_is_paralax = $event.target.checked ? 1 : 0"
                                            />
                                            <span class="pages-style-switch-track"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStyleStep === 1" class="pages-style-panel">
                        <div class="card data-card pages-card">
                            <div class="pages-card-head">
                                <i class="bi bi-palette-fill"></i>
                                <span>Colores</span>
                            </div>
                            <div class="pages-card-body">
                                <div v-for="(color, key) in formData.colorOptions" :key="key" class="mb-3">
                                    <label class="form-label">{{ color.label }}</label>
                                    <div class="color-picker-wrapper">
                                        <input type="color" v-model="formData.colorOptions[key].value" class="color-input">
                                        <input type="text" v-model="formData.colorOptions[key].value" class="color-value-input">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStyleStep === 2" class="pages-style-panel">
                        <div class="card data-card pages-card mb-3">
                            <div class="pages-card-head">
                                <i class="bi bi-braces"></i>
                                <span>Clase y CSS personalizado</span>
                            </div>
                            <div class="pages-card-body">
                                <div class="mb-4">
                                    <label class="form-label">ClassName</label>
                                    <input v-model="formData.className" type="text" class="form-control" />
                                </div>

                                <div class="col-12">
                                    <label class="form-label">CSS Personalizado</label>
                                    <textarea 
                                        v-model="formData.css" 
                                        class="form-control css-editor" 
                                        rows="15"
                                        placeholder="/* Escribe tu CSS aquí */
            .mi-clase {
                color: #333;
                font-size: 16px;
            }"
                                        spellcheck="false"
                                        @keydown.tab.prevent="handleTab"
                                    ></textarea>
                                    <small class="form-text text-muted">
                                        Escribe CSS sin la etiqueta &lt;style&gt;. El código se aplicará automáticamente al formulario.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pages-style-actions">
                    <button v-if="currentStyleStep > 0" type="button" class="btn btn-outline-secondary" @click="prevStyleStep">
                        <i class="bi bi-arrow-left me-2"></i>Anterior
                    </button>
                    <div v-else></div>
                    <div class="pages-style-actions-right">
                        <!--<button type="button" class="btn btn-outline-secondary" @click="closeStyleModalForm">
                            Cancelar
                        </button>-->
                        <button v-if="currentStyleStep < styleSteps.length - 1" type="button" class="btn btn-primary" @click="nextStyleStep">
                            Siguiente <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                        <button v-else type="button" class="btn btn-primary" @click="saveStyleForm">
                            <i class="bi bi-floppy me-2"></i>{{$t('search_view.save')}}
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
        :title="$t('search_view.alert_confirm_title')" 
        :question="$t('search_view.alert_confirm_question')" 
        @response="handleResponse" 
        />

        <LoadingDots :isLoading="isLoading" />

    </div>
</template>

<script>
  import { ref, getCurrentInstance, onMounted, nextTick } from 'vue';
  import axios from 'axios';
  import DataTableComponent from '@/components/DataTableComponent.vue';
  import ModalComponent from '@/components/ModalComponent.vue';
  import ToastComponent from '@/components/ToastComponent.vue'; // Asegúrate de ajustar la ruta
  import ConfirmPopup from '@/components/ConfirmPopup.vue'
  import { useI18n } from "vue-i18n";
  import { useAuthStore } from '@/stores/auth';

  export default {
    components: {
      ModalComponent,
      DataTableComponent,
      ToastComponent,
      ConfirmPopup
    },
    setup() {

        const { t } = useI18n();
        const authStore = useAuthStore();
        const instance = getCurrentInstance();
        const forms = ref([]);
        const pages = ref([]);
        const marcas = ref([]);
        const negocios = ref([]);
        const isModalOpen = ref(false);
        const editingIndex = ref(null);
        const currentStep = ref(0);
        const currentStyleStep = ref(0);
        const formSteps = ref([
            { key: 'basic', label: 'Datos básicos', description: 'Dominio, marca, negocio y visibilidad general' },
            { key: 'images', label: 'Imágenes', description: 'Galería y visibilidad del encabezado' },
            { key: 'header', label: 'Encabezado', description: 'Título, subtítulo y descripción' },
            { key: 'form', label: 'Formulario', description: 'Formulario asociado a la page' },
            { key: 'products', label: 'Sección 1', description: 'Contenido y estilo de productos' },
            { key: 'about', label: 'Sección 2', description: 'Contenido y estilo de about' },
            { key: 'html', label: 'HTML', description: 'Bloque HTML personalizado' }
        ]);
        const styleSteps = ref([
            { key: 'template', label: 'Template', description: 'Selección del estilo base' },
            { key: 'colors', label: 'Colores', description: 'Paleta del formulario' },
            { key: 'css', label: 'Clase y CSS', description: 'Ajustes avanzados de estilo' }
        ]);
        const formData = ref({ name: '', image: '', images: [], images_deleted: [], header_text: "", header_subtext: "", header_descript: "", colorOptions:{}, selectedStyleOption:"classic", status: "inactive", about_title:"",about_description:"", product_title: "", product_description: "", about_background: "#ffffff", about_color: "#0000", product_background: "#ffffff", product_color: "#0000", form_id: null, stock_id: null, html_content: "", about_carrouselcard: 0, product_carrouselcard: 0, product_is_visible: "false", about_is_visible: "false", menu_is_visible: "false", footer_is_visible: "false", header_is_visible: "false", header_is_paralax: 0, marca_id: "", marca_name: "", tipo_de_negocio_id: "", tipo_de_negocio_name: "" });
        const token = ref(null);
        const isLoading = ref(false);
        const formModal = ref(null);
        const styleModal = ref(null);
        const toastTitle = ref('');
        const toastMessage = ref('');
        const isSuccess = ref(true);
        const toastComponent = ref(null); // Referencia del ToastComponent
        const showToastFlag = ref(false);
        const confirmPopup = ref(null);
        const actionToExecute = ref(null);
        const selectedForm = ref(null);
        let formDelete = {};
        const styleOptions = ref([]);
        // const quillEditorRef1 = ref(null);
        // const quillEditorRef2 = ref(null);
        const url_forms = "https://apis.madautomate.cloud/webhook/81d62e39-5785-4ca3-8efc-735a72e05302";
        const url = "https://apis.madautomate.cloud/webhook/c535ea5e-4f73-4237-b6c6-51eef225cdd2";

        const getDomainPage = () => {
            const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
            return details.find(detail => detail.key == "domain_page")?.value || null;
        };

        onMounted(() => {
            confirmPopup.value = instance?.proxy?.$refs.confirmPopup; // Acceder a $refs en onMounted
        });

        const columns = ref([
            { label: t("forms.list_one"), key: 'name' },
            { label: t("forms.list_two"), key: 'code' },
            { label: t("menu.settings-brands"), key: 'marca_name' },
            { label: t("menu.settings-business-types"), key: 'tipo_de_negocio_name' },
            { label: t("menu.settings-templates"), key: 'selectedStyleOption' }
        ]);

        const colorOptions = ref({
            background: { label: 'Background Color', value: '#ffffff', code: "bg_form" },
            text: { label: 'Text Color', value: '#000000', code: "tx_form" }
        });
  
        const openModalForm = (index = null) => {
            editingIndex.value = index;
            currentStep.value = 0;
            if (index !== null) {
                // Clonar datos existentes
                formData.value = JSON.parse(JSON.stringify(index));
                delete formData.value.dominio;
                
                // Asegurarse de que images sea un array
                if (!Array.isArray(formData.value.images)) {
                formData.value.images = formData.value.images ? [formData.value.images] : [];
                }
            } 
            formModal.value.openModal();
        };
  
        const closeModalForm = () => {
            // Resetea los datos
            formData.value = { 
                name: '', 
                image: '', 
                images: [], // CAMBIO: de 'image' a 'images' array
                about_title: "",
                about_description: "", 
                about_background: "#ffffff",
                about_color: "#0000",
                about_label: "",
                product_title: "", 
                product_description: "",
                product_background: "#ffffff",
                product_color: "#0000",
                product_label: "",
                form_id: null,
                images_deleted: [],
                html_content: "",
                about_carrouselcard: 0, 
                product_carrouselcard: 0,
                product_is_visible: "false",
                about_is_visible: "false",
                menu_is_visible: "false",
                footer_is_visible: "false",
                stock_id: null,
                header_is_visible: "false",
                header_is_paralax: 0,
                marca_id: "",
                marca_name: "",
                tipo_de_negocio_id: "",
                tipo_de_negocio_name: ""
            };
            currentStep.value = 0;
            formModal.value.closeModal();
        };
  
        const closeStyleModalForm = () => {
            currentStyleStep.value = 0;
            styleModal.value.closeModal();
        }

        const handleCloseModal = () => {
            formData.value = {
                name: '',
                image: '',
                images: [],
                about_title: "",
                about_description: "",
                about_background: "#ffffff",
                about_color: "#0000",
                about_label: "",
                product_title: "",
                product_description: "",
                product_background: "#ffffff",
                product_color: "#0000",
                product_label: "",
                form_id: null,
                images_deleted: [],
                html_content: "",
                about_carrouselcard: 0,
                product_carrouselcard: 0,
                product_is_visible: "false",
                about_is_visible: "false",
                menu_is_visible: "false",
                footer_is_visible: "false",
                stock_id: null,
                header_is_visible: "false",
                header_is_paralax: 0,
                marca_id: "",
                marca_name: "",
                tipo_de_negocio_id: "",
                tipo_de_negocio_name: ""
            };
            editingIndex.value = null;
            currentStep.value = 0;
            currentStyleStep.value = 0;
            closeStyleModalForm();
            // acá hacés lo que necesites cuando el modal se cierre
        };

        const goToStep = (index) => {
            currentStep.value = index;
        };

        const nextStep = () => {
            if (currentStep.value < formSteps.value.length - 1) {
                currentStep.value += 1;
            }
        };

        const prevStep = () => {
            if (currentStep.value > 0) {
                currentStep.value -= 1;
            }
        };

        const goToStyleStep = (index) => {
            currentStyleStep.value = index;
        };

        const nextStyleStep = () => {
            if (currentStyleStep.value < styleSteps.value.length - 1) {
                currentStyleStep.value += 1;
            }
        };

        const prevStyleStep = () => {
            if (currentStyleStep.value > 0) {
                currentStyleStep.value -= 1;
            }
        };

        const handleTab = (event) => {
            const start = event.target.selectionStart;
            const end = event.target.selectionEnd;
            const value = event.target.value;
            event.target.value = `${value.substring(0, start)}\t${value.substring(end)}`;
            event.target.selectionStart = event.target.selectionEnd = start + 1;
            if (event.target === document.activeElement) {
                event.target.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        const handleImageUpload = (event) => {
            const file = event.target.files[0];
            formData.value.fileName = file.name; // Guardar el nombre del archivo
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                formData.value.image = reader.result;
                };
                reader.readAsDataURL(file);
            }
        };
  
        // Manejador para cargar múltiples imágenes
        const handleMultipleImageUpload = (event) => {
            const files = Array.from(event.target.files);
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                formData.value.images.push({
                    name: file.name,
                    data: reader.result, // base64
                    id: Date.now() + Math.random() // ID único temporal
                });
                };
                reader.readAsDataURL(file);
            });
        };

      
        const saveForm = () => {
            const payload = JSON.parse(JSON.stringify(formData.value));
            delete payload.dominio;
            if (editingIndex.value === null) {
                instance.proxy.createForm(payload);
            } else {
                pages.value[editingIndex.value] = payload;
                instance.proxy.updateForm(payload);
            }
            closeModalForm();
        };
  
        const duplicateForm = (index = null) => {
            const original = index;
            console.log('index', index)
            let baseName = original.name.replace(/_copy_\d+$/, '').replace(/_copy$/, '');
            let newName = baseName + '_copy';
            let baseCode = original.code.replace(/_copy_\d+$/, '').replace(/_copy$/, '');
            let newCode = baseCode + '_copy';
            let count = 1;
            while (pages.value.some((f) => f.name === newName)) {
                count++;
                newName = `${baseName}_copy_${count}`;
                newCode = `${baseCode}_copy_${count}`;
            }
            const newForm = JSON.parse(JSON.stringify(original));
            delete newForm.id;
            newForm.name = newName;
            newForm.code = newCode;
            newForm.duplicateForm = true;
            createForm(newForm);
        };
  

        const deleteForm = async () => {
            isLoading.value = true;
            formDelete.action = "deleteForm";

            try {
                const response = await axios.post(url,formDelete, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                });
                if (response.status === 200) {
                // Buscar el índice del formulario en el array por ID
                const index = pages.value.findIndex(f => f.id === formDelete.id);
                if (index !== -1) {
                    pages.value.splice(index, 1); // Eliminar el formulario del array
                }
                await getPages();

                setTimeout(() => {
                    triggerToast('Realizado!', 'Formulario eliminado!', true);
                }, 1000)
                }
            } catch (error) {
                console.error('Error al obtener las columnas:', error);
                setTimeout(() => {
                triggerToast('Error!', $t('limit_form'), false);
                }, 1000)
            } finally {
                isLoading.value = false;
            }

        };
      

        const handleResponse = (isConfirmed) => {
            if (!isConfirmed) return;

            if (actionToExecute.value === "delete") {
                deleteForm(selectedForm.value);
            }

            if (actionToExecute.value === "duplicate") {
                duplicateForm(selectedForm.value);
            }

            // limpiar acción
            actionToExecute.value = null;
            selectedForm.value = null;
        };
      
        const confirmDelete = (form) => {
            formDelete = form;
            actionToExecute.value = "delete";
            confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
        }

        const duplicateClick = (form) => {
            selectedForm.value = form;
            actionToExecute.value = "duplicate";
            confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
        }

        const selectedDefault = async (selectedForm) => {
            try {
                await setDefaultForm(selectedForm);

                pages.value.forEach(pages => {
                pages.default = (pages.id === selectedForm.id) ? true : null;
                });

            } catch (error) {
                console.error('Error al actualizar el formulario:', error);
            }
        }

        // Métodos externos (equivalentes a los de methods)
        const getToken = async () => {
            token.value = sessionStorage.getItem('token');
        };
  
        const getMarcas = async () => {

        const response = await axios.post('https://apis.madautomate.cloud/webhook/7279e62e-5ab0-4f43-9707-c1ff44e95d89', {action: 'databrands'}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (response && response.data && Array.isArray(response.data)) {
            marcas.value = response.data; // 🔁 Carga los datos en el datatable
        }

        };

        const getTiposDeNegocios = async () => {

        const response = await axios.post('https://apis.madautomate.cloud/webhook/bb230afc-9ef9-43ec-9319-58e9deda6564', {action: "databusiness"}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (response && response.data && Array.isArray(response.data)) {
            negocios.value = response.data; // 🔁 Carga los datos en el datatable
        }

        };

        const getForms = async () => {
        isLoading.value = true;

        try {
            const response = await axios.post(url_forms, {action: "dataforms"}, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
            });

            console.log('getForms', response.data);

            if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
            // Función para convertir imagen a base64
            forms.value = response.data
            }
        } catch (error) {
            console.error('Error al obtener las columnas:', error);
        } finally {
            isLoading.value = false;
        }
        };

        const getPages = async () => {
            isLoading.value = true;

            try {
                const response = await axios.post(url, {action: "dataforms"}, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                });

                console.log('getPages', response.data);

                if (response.data.length > 0 && Object.keys(response.data[0]).length > 0) {
                // Función para convertir imagen a base64
                pages.value = await Promise.all(
                    response.data.map(async (form) => {
                    return {
                        ...form,
                        images_deleted: [],
                        colorOptions: form.colorOptions ? JSON.parse(form.colorOptions) : [],
                        images: form.images ? JSON.parse(form.images) : [] // Parsear images
                    };
                    })
                );
                }
            } catch (error) {
                console.error('Error al obtener las columnas:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const createForm = async (data) => {

        // Limpiar marca y negocio si están vacíos
        if (data.marca_id === "") {
            data.marca_id = null;
            data.marca_name = null;
        }
        if (data.tipo_de_negocio_id === "") {
            data.tipo_de_negocio_id = null;
            data.tipo_de_negocio_name = null;
        }

        data.images = JSON.stringify(data.images);
        data.images_deleted = JSON.stringify(data.images_deleted);
        data.action = "saveform";
        delete data.id;

        if(!data.duplicateForm) {
            data.colorOptions = JSON.stringify(colorOptions.value);
        } else {
            data.colorOptions = JSON.stringify(data.colorOptions);
        }

        isLoading.value = true;
        
        console.log('data', data);

        try {
            const postdata = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
            },
            });

            if(postdata.status == 200) {

            data.id = postdata.data.id;
            data.colorOptions = JSON.parse(data.colorOptions)
            
            pages.value.push(JSON.parse(JSON.stringify(data)));
            closeModalForm();
            await getPages();
            setTimeout(() => {
                triggerToast('Realizado!', 'Formulario creado!', true);
            }, 1000)
            }

        } catch (error) {
            console.error('Error al guardar la consulta:', error);

            // Aseguramos que el backend devuelva algo tipo "forms.limit_form"
            const errorKey = error?.response?.data?.error || 'forms.message_error';

            // Verificamos si existe la clave
            const translated = t(errorKey) !== errorKey ? t(errorKey) : t('forms.message_error');
            setTimeout(() => {
            triggerToast('Error', translated, false);
            }, 1000);

        } finally {
            isLoading.value = false;
        }
        };

        const updateForm = async (data) => {
            console.log('updateForm', data);

            // Limpiar marca y negocio si están vacíos
            if (data.marca_id === "") {
                data.marca_id = null;
                data.marca_name = null;
            }
            if (data.tipo_de_negocio_id === "") {
                data.tipo_de_negocio_id = null;
                data.tipo_de_negocio_name = null;
            }

            data.colorOptions = JSON.stringify(data.colorOptions)
            data.images = JSON.stringify(data.images);
            data.images_deleted = JSON.stringify(data.images_deleted);
            data.action = "saveform";

            isLoading.value = true;
            try {
                const postdata = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
                },
                });
                if(postdata.status == 200) {
                await getPages();
                setTimeout(() => {
                    triggerToast('Realizado!', 'Formulario actualizado!', true);
                }, 1000)
                }
                closeStyleModalForm();
            } catch (error) {
                console.error('Error al guardar la consulta:', error);
            } finally {
                isLoading.value = false;
            }

        };

        const setDefaultForm = async (data) => {
            isLoading.value = true;
            data.action= 'setdefault';
            try {
                const postdata = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
                },
                });
            } catch (error) {
                console.error('Error al guardar la consulta:', error);
            } finally {
                isLoading.value = false;
            }

        }

        const styleForm = async (index = null) => {
            editingIndex.value = index;
            formData.value = index;
            currentStyleStep.value = 0;
            styleModal.value.openModal();
        }

        const saveStyleForm = async () => {
            // Crear una copia del formData y convertir colorOptions a string
            const formDataToSend = {
                ...formData.value,
                colorOptions: formData.value.colorOptions
            };
            instance.proxy.updateForm(formDataToSend); // Enviar la data corregida
        };
  
        const triggerToast = (title, message, success) => {
            toastTitle.value = title;
            toastMessage.value = message;
            isSuccess.value = success;
            toastComponent.value.showToas();
        };

        const removeImageByIndex = (index, img) => {
            console.log('removeImageByIndex', index)
            console.log('removeImageByIndex img:', img)

            if (!formData.value.images || index < 0 || index >= formData.value.images.length) {
                console.warn('Índice inválido')
                return
            }

            formData.value.images.splice(index, 1)

            formData.value.images_deleted.push({id: img.id})
            console.log('Imagen eliminada del front')
        }

        const enlaceClick = (row) => {
        const data = row?.__v_raw || row;
        const domainPage = getDomainPage();
        //console.log('data', data)
        try {
            // Validar que tenga código
            if (!data.code) {
            alert("El formulario no tiene un código asignado.");
            return;
            }

            if (!domainPage) {
            alert("La página no tiene configurado el campo domain_page.");
            return;
            }

            const url = `${domainPage}/${data.code}`;

            // Abrir en una nueva pestaña
            window.open(url, "_blank");
        } catch (err) {
            console.error("Error al abrir el enlace:", err);
        }
        };

        const resultActions = [
        {
            label: "Establecer como defecto",
            class: 'btn btn-sm btn-outline',
            method: selectedDefault,
            icon: (row) => row.default === true || row.default === 1
            ? '<i class="bi bi-star-fill"></i>'
            : '<i class="bi bi-star"></i>'
        },
        {
            label: t("forms.action_edit"),
            class: 'btn btn-sm btn-outline',
            method: openModalForm,
            icon: '<i class="bi bi-pencil-square"></i>'
        },
            {
            label: t("forms.action_duplicate"),
            class: 'btn btn-sm btn-outline',
            method: duplicateClick,
            icon: '<i class="bi bi-copy"></i>'
        },
        {
            label: t("forms.action_style"),
            class: 'btn btn-sm btn-style',
            method: styleForm,
            icon: '<i class="bi bi-palette"></i>'
        },
        {
            label: "Link",
            class: 'btn btn-sm btn-outline',
            method: enlaceClick,
            icon: '<i class="bi bi-box-arrow-up-right"></i>'
        },
        {
            label: t("forms.action_delete"),
            class: 'btn btn-danger btn-sm',
            method: confirmDelete,
            icon: '<i class="bi bi-trash3"></i>'
        }
        ];
        
        const getPlantillas = async () => {

            const response = await axios.post(url, {action: 'dataTemplates'}, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            if (response && response.data && Array.isArray(response.data)) {
                styleOptions.value = response.data; // 🔁 Carga los datos en el datatable
            }

            // styleOptions.value = [
            //     { id: 1, name:"Clásico", code: "classic" },
            //     { id: 2, name: "Template B", code: "template-b"  },
            //     { id: 3, name: "Landing PRO", code: "landing-pro"  }
            // ];

        }
        // Cargar las funciones al iniciar el componente
        getToken();
        getMarcas();
        getTiposDeNegocios();
        getPlantillas();
        getForms();
        getPages();
  
        return {
        forms,
        pages,
        isModalOpen,
        formData,
        editingIndex,
        currentStep,
        currentStyleStep,
        formSteps,
        styleSteps,
        openModalForm,
        closeModalForm,
        goToStep,
        nextStep,
        prevStep,
        goToStyleStep,
        nextStyleStep,
        prevStyleStep,
        handleImageUpload,
        handleTab,
        saveForm,
        duplicateForm,
        deleteForm,
        getToken,
        getForms,
        getPages,
        createForm,
        columns,
        resultActions,
        isLoading,
        formModal,
        styleModal,
        styleOptions,
        colorOptions,
        closeStyleModalForm,
        saveStyleForm,
        updateForm,
        triggerToast,
        toastComponent,
        toastTitle,
        toastMessage,
        isSuccess,
        showToastFlag,
        confirmPopup,
        handleResponse,
        confirmDelete,
        handleCloseModal,
        selectedDefault,
        setDefaultForm,
        getMarcas,
        getTiposDeNegocios,
        negocios,
        marcas,
        enlaceClick,
        duplicateClick,
        handleMultipleImageUpload,
        removeImageByIndex,
        getPlantillas

        };

    },
  };
  </script>

<style scoped>
.pages-step-modal {
  height: 100%;
}

.pages-step-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1.25rem;
  gap: 1rem;
}

.pages-step-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.pages-step-title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.pages-step-subtitle {
  margin: 0;
  color: #6c757d;
  max-width: 780px;
}

.pages-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.pages-step-item {
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

.pages-step-item:last-child {
  border-right: 0;
}

.pages-step-item:hover:not(.active) {
  background: #f8f9fa;
}

.pages-step-item.active {
  background: #eff6ff;
}

.pages-step-item.done .pages-step-num,
.pages-step-item.active .pages-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.pages-step-num {
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

.pages-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pages-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.pages-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.pages-step-item.active .pages-step-copy span,
.pages-step-item.done .pages-step-copy span {
  color: #185fa5;
}

.pages-step-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
}

.pages-step-panel {
  min-height: 100%;
}

.pages-card {
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.pages-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
  color: #212529;
}

.pages-card-head i {
  color: #185fa5;
}

.pages-card-body {
  padding: 1.25rem;
  background: #fff;
}

.pages-toggle-box {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #fafbfc;
}

.pages-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
}

.pages-step-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pages-step-close {
  white-space: nowrap;
}

.pages-empty-icon {
  font-size: 3rem;
}

.pages-style-modal {
  height: 100%;
}

.pages-style-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1.25rem;
  gap: 1rem;
}

.pages-style-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.pages-style-title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.pages-style-subtitle {
  margin: 0;
  color: #6c757d;
  max-width: 780px;
}

.pages-style-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.pages-style-step-item {
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

.pages-style-step-item:last-child { border-right: 0; }
.pages-style-step-item:hover:not(.active) { background: #f8f9fa; }
.pages-style-step-item.active { background: #eff6ff; }
.pages-style-step-item.done .pages-style-step-num,
.pages-style-step-item.active .pages-style-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.pages-style-step-num {
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

.pages-style-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pages-style-step-copy span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

.pages-style-step-copy small {
  font-size: 0.74rem;
  color: #6c757d;
}

.pages-style-step-item.active .pages-style-step-copy span,
.pages-style-step-item.done .pages-style-step-copy span {
  color: #185fa5;
}

.pages-style-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
}

.pages-style-panel {
  min-height: 100%;
}

.pages-style-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
}

.pages-style-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pages-style-close {
  white-space: nowrap;
}

.pages-style-toggle-list {
  display: flex;
  flex-direction: column;
}

.pages-style-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0 0;
  border-top: 1px solid #eef1f4;
}

.pages-style-toggle-info span {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1a2e;
}

.pages-style-toggle-info p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #6c757d;
}

.pages-style-switch {
  position: relative;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.pages-style-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.pages-style-switch-track {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: #dee2e6;
  cursor: pointer;
  transition: background 0.2s;
}

.pages-style-switch input:checked + .pages-style-switch-track {
  background: #185fa5;
}

.pages-style-switch-track::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.pages-style-switch input:checked + .pages-style-switch-track::after {
  left: 21px;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.images-grid .image-preview-container {
  margin-top: 0;
  max-width: 300px;
}

@media (max-width: 991px) {
  .pages-step-shell {
    padding: 1rem;
  }

  .pages-stepper {
    flex-direction: column;
  }

  .pages-style-stepper {
    flex-direction: column;
  }

  .pages-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .pages-step-item:last-child {
    border-bottom: 0;
  }

  .pages-style-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .pages-style-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 767px) {
  .pages-step-topbar,
  .pages-step-actions,
  .pages-step-actions-right,
  .pages-style-topbar,
  .pages-style-actions,
  .pages-style-actions-right {
    flex-direction: column;
    align-items: stretch;
  }

  .pages-step-close,
  .pages-style-close,
  .pages-step-actions .btn,
  .pages-step-actions-right .btn,
  .pages-style-actions .btn,
  .pages-style-actions-right .btn {
    width: 100%;
  }
}
</style>
