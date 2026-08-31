# Visora Design System & Component Patterns

> **Referencia obligatoria** para cualquier agente que cree o modifique vistas/componentes en esta aplicación.

---

## 1. Paleta de Colores

### Colores Principales
| Color | Hex | Uso |
|-------|-----|-----|
| **Primary** | `#3939ff` | Botones primarios, enlaces activos, stepper activo, focus states |
| **Primary Gradient** | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | Headers de acordeones, banners, cards destacados |
| **Success** | `#198754` | Stepper completado, badges éxito, toast success |
| **Danger** | `#dc3545` | Botones eliminar, toast error, badges peligro |
| **Warning** | `#ffc107` | Advertencias, estados pendientes |
| **Info** | `#0dcaf0` | Información, badges info |

### Colores Neutros
| Color | Hex | Uso |
|-------|-----|-----|
| **Text Primary** | `#3a3a3a` | Texto principal |
| **Text Muted** | `#6c757d` / `#adb5bd` | Texto secundario, placeholders |
| **Border Light** | `#dee2e6` / `#e9ecef` | Bordes de inputs, tablas, divisores |
| **Background** | `#f8f8f8` | Fondo general de la app |
| **White** | `#ffffff` | Fondos de cards, modales, inputs |
| **Sidebar BG** | `#fff` | Fondo del sidebar |

### Variables CSS Globales (base.css)
```css
:root {
  --color-background: #ffffff;
  --color-background-soft: #f8f8f8;
  --color-background-mute: #f2f2f2;
  --color-border: rgba(60, 60, 60, 0.12);
  --color-border-hover: rgba(60, 60, 60, 0.29);
  --color-heading: #2c3e50;
  --color-text: #2c3e50;
}
```

---

## 2. Tipografía

| Propiedad | Valor |
|-----------|-------|
| **Font Family** | `"Nunito Sans", sans-serif` (Google Fonts) |
| **Base Size** | `16px` |
| **Line Height** | `1.6` |
| **Font Weights** | 400 (normal), 500 (medium), 600 (semibold), 700 (bold) |
| **Headings** | `font-weight: 700`, color `#1f2937` o `#2d2d2d` |

---

## 3. Espaciado y Layout

### Contenedores Principales
```css
/* Módulo estándar */
.emails-module, .events, .forms {
  padding-bottom: 2rem ~ 3rem;
}

/* Header de sección */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Divisor estándar */
.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e9ecef;
}
```

### Breakpoints (Bootstrap 5)
| Breakpoint | Ancho | Uso |
|------------|-------|-----|
| `xs` | < 576px | Mobile |
| `sm` | ≥ 576px | Mobile grande |
| `md` | ≥ 768px | Tablet |
| `lg` | ≥ 992px | Desktop |
| `xl` | ≥ 1200px | Desktop grande |
| `xxl` | ≥ 1400px | Pantallas muy anchas |

---

## 4. Componentes Reutilizables (OBLIGATORIOS)

### 4.1 ModalComponent (`src/components/ModalComponent.vue`)
**Wrapper de Bootstrap Modal** - Úsalo SIEMPRE para modales.

```vue
<ModalComponent
  ref="modalRef"
  modalId="unique-modal-id"        <!-- REQUERIDO: ID único -->
  modalTitle="Título del Modal"
  dialogClass="modal-fullscreen-fixed"  <!-- Opcional: modal-lg, modal-xl, modal-fullscreen-* -->
  @modalClosed="handleClose"
>
  <!-- Contenido via slot -->
  <MiComponenteInterno @close="closeModal" @save="handleSave" />
</ModalComponent>
```

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modalId` | String | **requerido** | ID único para el elemento DOM |
| `modalTitle` | String | `'Modal Título'` | Título del modal |
| `dialogClass` | String/Array/Object | `''` | Clases para `.modal-dialog` (ej: `modal-lg`, `modal-fullscreen-fixed`) |
| `class` | String | `'modal-sm'` | Fallback para dialogClass |
| `showSaveSearchButton` | Boolean | `false` | Muestra botón "Guardar consulta" en footer |
| `isFooter` | Boolean | `false` | Muestra footer del modal |

**Métodos expuestos (via ref):**
- `openModal()` - Abre el modal
- `closeModal()` - Cierra el modal

**Comportamiento:**
- Backdrop: `static` (no cierra al click fuera)
- Keyboard: `false` (no cierra con ESC)
- Emite `@modalClosed` al cerrarse

---

### 4.2 DataTableComponent (`src/components/DataTableComponent.vue`)
**Tabla con búsqueda, paginación, ordenación, selección y acciones** - Úsalo SIEMPRE para listados tabulares.

```vue
<DataTableComponent
  :data="items"
  :columns="columns"
  :actions="actions"
  :items-per-page="10"
  :input-all-selected="true"
  :clickable-rows="false"
  @download-excel="handleDownload"
/>
```

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `data` | Array | `[]` | Datos a mostrar |
| `columns` | Array | `[]` | Definición de columnas (ver abajo) |
| `actions` | Array | `[]` | Botones de acción por fila |
| `itemsPerPage` | Number | `10` | Items por página |
| `inputAllSelected` | Boolean | `false` | Mostrar checkbox selección múltiple |
| `clickableRows` | Boolean | `false` | Filas clickeables |
| `showDownloadButton` | Boolean | `false` | Mostrar botón descargar Excel |

**Columnas (`columns`):**
```js
columns: [
  {
    label: 'Nombre',
    key: 'name',
    render: (row) => `<div class="fw-semibold">${row.name}</div>`
  },
  {
    label: 'Estado',
    key: 'status',
    render: (row) => `<span class="status-badge badge-${row.status}">${label}</span>`
  }
]
```

**Acciones (`actions`):**
```js
actions: [
  {
    label: 'Eliminar',
    class: 'btn btn-danger btn-sm',
    icon: '<i class="bi bi-trash-fill"></i>',
    method: (row) => confirmDelete(row)
  }
]
```

**Eventos:**
- `@download-excel` - Click en botón descargar

---

### 4.3 ConfirmPopup (`src/components/ConfirmPopup.vue`)
**Confirmación con SweetAlert2** - Úsalo SIEMPRE para confirmaciones destructivas.

```vue
<ConfirmPopup
  ref="confirmPopup"
  title="¿Eliminar elemento?"
  :question="`Eliminar '${item.name}' permanentemente?`"
  @response="handleConfirm"
/>
```

**Props:**
| Prop | Tipo | Default |
|------|------|---------|
| `title` | String | - |
| `question` | String | **requerido** |
| `showConfirmButton` | Boolean | `true` |
| `showCancelButton` | Boolean | `true` |
| `cancelButtonText` | String | `'No'` |
| `icon` | String | `'warning'` |

**Método (via ref):**
- `showConfirmPopup()` - Muestra el popup

**Evento:**
- `@response` - `(isConfirmed: boolean) => void`

---

### 4.4 ToastComponent (`src/components/ToastComponent.vue`)
**Notificaciones toast (Bootstrap)** - Úsalo SIEMPRE para feedback de acciones.

```vue
<ToastComponent
  ref="toastComponent"
  :title="toastTitle"
  :message="toastMessage"
  :is-success="isSuccess"
/>
```

**Props:**
| Prop | Tipo | Default |
|------|------|---------|
| `title` | String | **requerido** |
| `message` | String | **requerido** |
| `isSuccess` | Boolean | `true` |
| `show` | Boolean | `false` |

**Método (via ref):**
- `showToas()` - Muestra el toast (nota: typo en nombre original)

**Estilos (main.css):**
- Success: fondo blanco, borde izquierdo verde 6px
- Danger: fondo blanco, borde izquierdo rojo 6px

---

### 4.5 SidebarComponent (`src/components/SidebarComponent.vue`)
**Menú lateral responsive** - Ya integrado en `PanelLayout.vue`.

**Props:**
| Prop | Tipo | Default |
|------|------|---------|
| `isVisible` | Boolean | `false` |

**Comportamiento:**
- Se alimenta de `sessionStorage.getItem('menu')` para permisos
- Categorías colapsables (NO auto-abre la primera)
- Iconos: Bootstrap Icons (`bi-*`) o FontAwesome (`fas fa-*`)

---

### 4.6 LoadingComponent (`src/components/LoadingComponent.vue`)
**Spinner de carga estándar.**

```vue
<LoadingComponent v-if="loading" />
```

---

### 4.7 AlertComponent (`src/components/AlertComponent.vue`)
**Alertas dismissibles** - Para mensajes inline.

---

## 5. Patrones de Diseño Establecidos

### 5.1 Wizard / Stepper (Multi-step Forms)
**Usado en:** `CampaignBuilderView.vue`

**Estructura HTML:**
```vue
<div class="wizard-container">
  <!-- Step Bar -->
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

  <!-- Step Body -->
  <div ref="wizardBody" v-if="currentStep === 0" class="wizard-body">
    <!-- Contenido del paso -->
  </div>

  <!-- Footer con navegación -->
  <div class="wizard-footer">
    <button v-if="currentStep > 0" class="btn btn-outline-secondary" @click="prevStep">
      <i class="bi bi-chevron-left me-1"></i> Anterior
    </button>
    <button v-if="currentStep < steps.length - 1" class="btn btn-add" @click="nextStep">
      Siguiente <i class="bi bi-chevron-right ms-1"></i>
    </button>
    <button v-else class="btn btn-add" @click="submit">
      <i class="bi bi-send-fill me-1"></i> Enviar
    </button>
  </div>
</div>
```

**Estados visuales (emails.css):**
- **Pendiente:** Círculo gris (`#adb5bd`), borde gris, label gris
- **Activo:** Círculo primary (`#3939ff`), sombra `0 0 0 4px rgba(57,57,255,0.2)`, label primary bold
- **Completado:** Círculo success (`#198754`), check verde, label success, conector verde

---

### 5.2 Cards Estándar

**Data Card (listados):**
```vue
<div class="card data-card">
  <div class="card-body p-0">
    <DataTableComponent ... />
  </div>
</div>
```
```css
.data-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
```

**Stat Card (KPIs):**
```vue
<div class="stat-card">
  <div class="stat-icon blue"><i class="bi bi-people"></i></div>
  <div>
    <p class="stat-value">{{ count }}</p>
    <p class="stat-label">Campañas</p>
  </div>
</div>
```

---

### 5.3 Formularios Estándar (forms.css)

```css
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
  transition: all 0.2s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}
```

**Validación visual:**
```vue
<input
  v-model="field"
  class="form-control form-control-lg"
  :class="{ 'is-invalid': !field.trim() }"
/>
<div class="invalid-feedback">Mensaje de error</div>
<small v-if="field.trim()" class="text-success">
  <i class="bi bi-check-circle me-1"></i>Listo
</small>
```

---

### 5.4 Botones Estándar (custom.css + forms.css)

| Clase | Uso | Estilo |
|-------|-----|--------|
| `.btn-add` | Acción principal (crear, siguiente, enviar) | Primary gradient, shadow, hover lift |
| `.btn-save` | Guardar | Igual que btn-add, position fixed right |
| `.btn-outline` | Acciones secundarias | Border primary, texto primary |
| `.btn-outline-secondary` | Navegación (anterior) | Border gris, texto gris |
| `.btn-danger` | Eliminar | Border rojo, texto rojo, hover rojo/blanco |
| `.btn-link` | Enlaces estilo botón | Transparente, underline hover |

```css
.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
  transition: all 0.3s ease;
}
.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}
```

---

### 5.5 Tip Banner / Accordion Informativo
**Usado en:** CampaignsView, EventsView, CampaignBuilderView

```vue
<div class="accordion-item tip-banner-style">
  <h2 class="accordion-header">
    <button class="accordion-button collapsed tip-banner-button" data-bs-toggle="collapse" data-bs-target="#collapseId">
      <div class="tip-icon"><i class="bi bi-lightbulb-fill"></i></div>
      <div class="tip-text"><strong>Título</strong> — Descripción corta.</div>
    </button>
  </h2>
  <div id="collapseId" class="accordion-collapse collapse">
    <div class="accordion-body tip-expanded">
      <!-- Contenido expandido -->
    </div>
  </div>
</div>
```

**Estilos:**
- Header: Gradient primary (`#667eea → #764ba2`), texto blanco
- Body expandido: Fondo blanco, texto oscuro, border-radius solo abajo

---

### 5.6 Empty State
```vue
<div v-if="!items.length" class="text-center py-5 mt-5">
  <i class="bi bi-inbox" style="font-size:3rem;color:#dee2e6"></i>
  <p class="text-muted mt-3">No hay datos aún.</p>
  <button class="btn btn-add mt-2" @click="createNew">Crear primero</button>
</div>
```

---

### 5.7 Badges de Estado
```vue
<span class="status-badge badge-{{ status }}">{{ label }}</span>
```
Estados comunes: `draft`, `scheduled`, `sending`, `sent`, `closed`, `active`, `inactive`, `pending`

---

## 6. Iconografía

**Sistema:** Bootstrap Icons (`bi-*`) - **Usar siempre este set**

| Icono | Clase | Uso Común |
|-------|-------|-----------|
| Casa | `bi-house` | Home/Inicio |
| Más | `bi-plus-circle` | Crear nuevo |
| Buscar | `bi-search` | Búsqueda |
| Editar | `bi-pencil` | Editar |
| Eliminar | `bi-trash-fill` | Eliminar |
| Ver | `bi-eye` | Vista previa |
| Descargar | `bi-file-earmark-excel` | Exportar Excel |
| Subir | `bi-upload` | Importar |
| Config | `bi-gear` | Configuración |
| Usuario | `bi-person` | Perfil/Usuario |
| Email | `bi-envelope` | Email |
| Calendario | `bi-calendar-check` | Programado |
| Repetir | `bi-arrow-repeat` | Recurrente |
| Enviar | `bi-send-fill` | Enviar ahora |
| Check | `bi-check-lg` / `bi-check-circle-fill` | Completado/Éxito |
| Chevron | `bi-chevron-right` / `bi-chevron-down` | Dropdowns |
| Alerta | `bi-exclamation-triangle` | Warning |
| Info | `bi-info-circle` | Información |

---

## 7. Arquitectura CSS

### Archivos de Estilos (importados en main.css)
```
src/assets/
├── base.css          # Variables globales, reset, tipografía base
├── main.css          # Importa todos + overrides globales (toast)
└── styles/
    ├── custom.css    # Botones base, sidebar, utilidades globales
    ├── forms.css     # Formularios, headers, cards, accordions base
    ├── emails.css    # Módulo emails: wizard, templates, campaigns
    ├── events.css    # Módulo eventos: formularios, previews
    └── whatsapp.css  # Módulo WhatsApp: connection screen
```

### Convenciones de Clases
- **Módulo-prefijo:** `.emails-module`, `.events`, `.forms`
- **BEM-like:** `.wizard-step-item`, `.step-circle`, `.step-label`
- **Utilidades:** `.text-muted`, `.fw-semibold`, `.d-flex`, `.gap-3` (Bootstrap)

---

## 8. Patrones de Vista (Page Layout)

### Estructura Estándar de Vista
```vue
<template>
  <div class="container-fluid modulo-nombre mt-4">
    <!-- HEADER -->
    <div class="header-section mb-4">
      <div>
        <h2>Título de la Página</h2>
        <p class="text-muted mb-0" style="font-size:0.9rem">Descripción corta</p>
      </div>
      <button v-if="canCreate" class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle me-2"></i>Nuevo Item
      </button>
    </div>
    <hr class="header-divider">

    <!-- TIP BANNER (opcional) -->
    <div class="accordion-item tip-banner-style mb-4">...</div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- CONTENIDO -->
    <template v-else>
      <!-- EMPTY STATE -->
      <div v-if="!items.length" class="text-center py-5 mt-5">...</div>

      <!-- TABLA / GRID -->
      <div v-else class="card data-card">
        <div class="card-body p-0">
          <DataTableComponent ... />
        </div>
      </div>
    </template>

    <!-- MODALES (al final) -->
    <ModalComponent ref="modalRef" ...>
      <ComponenteInterno @close="closeModal" @saved="reload" />
    </ModalComponent>

    <!-- TOAST Y CONFIRM -->
    <ToastComponent ref="toastComponent" ... />
    <ConfirmPopup ref="confirmPopup" ... />
  </div>
</template>
```

---

## 9. Flujo de Datos Típico (Composition API / Options API)

### Stores (Pinia)
- `useAuthStore()` - Usuario, permisos, details (límites)
- Stores en `src/stores/`

### Servicios
- `emailService.js` - `getCampaigns()`, `deleteCampaign()`, `createCampaign()`, `sendCampaign()`
- `eventWallService.js` - Eventos
- `userService.js` - Usuarios
- Servicios en `src/services/`

### Router
- Rutas definidas en `src/router/index.js`
- Navegación: `this.$router.push('/panel/emails/campaigns')` o `router.push()`

---

## 10. Checklist para Nuevas Vistas/Componentes

- [ ] **Usa `ModalComponent`** para modales (no `<dialog>` ni SweetAlert para formularios)
- [ ] **Usa `DataTableComponent`** para tablas con datos
- [ ] **Usa `ConfirmPopup`** para confirmar eliminaciones/acciones destructivas
- [ ] **Usa `ToastComponent`** para feedback de éxito/error
- [ ] **Usa `LoadingComponent`** para estados de carga
- [ ] **Sigue layout estándar** (header → divider → tip banner → contenido)
- [ ] **Usa clases de botones estándar** (`.btn-add`, `.btn-danger`, `.btn-outline`)
- [ ] **Usa iconos Bootstrap Icons** (`bi-*`)
- [ ] **Respeta paleta de colores** (primary `#3939ff`, gradient `#667eea/#764ba2`)
- [ ] **Formularios con validación visual** (`.is-invalid`, `.invalid-feedback`, success check)
- [ ] **Wizard/Stepper** para flujos multi-paso (copiar patrón de CampaignBuilderView)
- [ ] **Responsive:** mobile-first, testear en `< 768px` (sidebar overlay)
- [ ] **i18n:** Usar `$t('key')` para textos, definir en `src/locales/es.json` y `en.json`

---

## 11. Archivos de Referencia Rápida

| Archivo | Qué Contiene |
|---------|--------------|
| `src/components/ModalComponent.vue` | Modal base |
| `src/components/DataTableComponent.vue` | Tabla base |
| `src/components/ConfirmPopup.vue` | Confirmación |
| `src/components/ToastComponent.vue` | Toast |
| `src/views/panel/emails/CampaignBuilderView.vue` | Wizard/Stepper completo |
| `src/views/panel/emails/CampaignsView.vue` | Vista listado + modal + toast + confirm |
| `src/assets/styles/emails.css` | Estilos wizard, templates, campaigns |
| `src/assets/styles/forms.css` | Formularios, cards, headers base |
| `src/assets/styles/custom.css` | Botones, sidebar, utilidades |
| `src/assets/base.css` | Variables CSS, tipografía, reset |

---

## 12. Anti-Patrones (NO HACER)

| ❌ No Hacer | ✅ Hacer |
|-------------|----------|
| Crear `<div class="modal">` manual | Usar `<ModalComponent>` |
| Hacer `<table>` a mano | Usar `<DataTableComponent>` |
| `alert()` o `confirm()` nativo | Usar `<ConfirmPopup>` (SweetAlert2) |
| `console.log` para feedback usuario | Usar `<ToastComponent>` |
| Colores hardcodeados (`#123456`) | Usar variables o clases existentes |
| FontAwesome + Bootstrap Icons mezclados | Solo **Bootstrap Icons** (`bi-*`) |
| CSS inline en componentes | Clases en archivos `.css` del módulo |
| Modal sin `modalId` único | Siempre `modalId="unique-id"` |
| Abrir primera categoría sidebar auto | **Todas cerradas** (ver SidebarComponent fix) |

---

> **Nota para agentes:** Este documento es la **fuente de verdad** del diseño. Antes de crear cualquier vista o componente, consulta esta guía y reutiliza los componentes y patrones aquí documentados.