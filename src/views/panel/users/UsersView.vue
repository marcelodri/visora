<template>
  <div class="container-fluid mt-4 page forms">
    <!-- HEADER -->
    <div class="header-section mb-4">
      <h2>{{ $t('menu.users') || 'Gestión de Usuarios' }}</h2>
      <button 
        @click="openModalForm()" 
        class="btn btn-add"
        :disabled="isLicenseLimitReached"
      >
        <i class="bi bi-plus-circle me-2"></i> Agregar Usuario
      </button>
    </div>

    <hr class="header-divider">

    <!-- INFORMACIÓN DE LICENCIAS -->
    <div v-if="licenseLimit > 0" class="card license-info-card mb-4">
      <div class="card-body">
        <div class="license-info-content">
          <div class="license-info-item">
            <span class="license-label">Usuarios Activos</span>
            <span class="license-value">{{ users.length }}</span>
          </div>
          <div class="license-info-divider"></div>
          <div class="license-info-item">
            <span class="license-label">Límite de Licencias</span>
            <span class="license-value">{{ licenseLimit }}</span>
          </div>
          <div class="license-info-divider"></div>
          <div class="license-info-item">
            <span class="license-label">Disponibles</span>
            <span class="license-value" :class="{ 'text-danger': isLicenseLimitReached }">
              {{ Math.max(0, licenseLimit - users.length) }}
            </span>
          </div>
          <div v-if="isLicenseLimitReached" class="license-warning">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Has alcanzado el límite de licencias
          </div>
        </div>
      </div>
    </div>

    <!-- TIP ACCORDION -->
    <!-- <div class="accordion mb-5" id="accordionUsers">
      <div class="accordion-item tip-banner-style">
        <h2 class="accordion-header" id="headingUsers">
          <button 
            class="accordion-button collapsed tip-banner-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapseUsers" 
            aria-expanded="false" 
            aria-controls="collapseUsers"
          >
            <div class="tip-icon">
              <i class="bi bi-lightbulb-fill"></i>
            </div>
            <div class="tip-text">
              <strong>Tip:</strong> Desde aquí puedes gestionar todos los usuarios de tu instancia. Crea nuevos usuarios, edita sus datos, resetea contraseñas y modifica sus permisos.
            </div>
          </button>
        </h2>
        <div 
          id="collapseUsers" 
          class="accordion-collapse collapse" 
          aria-labelledby="headingUsers" 
          data-bs-parent="#accordionUsers"
        >
          <div class="accordion-body tip-expanded">
            <p><strong>Funcionalidades disponibles:</strong></p>
            <ul>
              <li><strong>Crear usuarios</strong>: Agrega nuevos usuarios a tu instancia</li>
              <li><strong>Editar datos</strong>: Modifica nombre, email, teléfono y otros datos</li>
              <li><strong>Resetear contraseña</strong>: Genera una nueva contraseña temporal</li>
              <li><strong>Cambiar permisos</strong>: Asigna roles (admin, user, etc.)</li>
              <li><strong>Cambiar estado</strong>: Activa o desactiva usuarios</li>
            </ul>
          </div>
        </div>
      </div>
    </div> -->

    <!-- TABLA DE USUARIOS CON DATATABLE -->
    <div class="card data-card">
      <div class="card-body p-0">
        <DataTableComponent
          :data="users"
          :columns="columns"
          :actions="resultActions"
          :items-per-page="10"
          :clickableRows="true"
          @row-click="editUser"
        />
      </div>
    </div>

    <!-- MODAL PRINCIPAL CON STEPS -->
    <ModalComponent 
      ref="formModal" 
      modalId="userFormModal" 
      :modalTitle="editingUserId === null ? 'Nuevo Usuario' : 'Editar Usuario'" 
      class="modal-fullscreen-fixed"
      @modalClosed="handleCloseModal"
    >
      <div class="users-step-modal">
        <div class="users-step-shell">
          <!-- STEPPER -->
          <div class="users-stepper">
            <button
              v-for="(step, index) in formSteps"
              :key="step.key"
              type="button"
              class="users-step-item"
              :class="{ active: currentStep === index, done: currentStep > index }"
              @click="goToStep(index)"
            >
              <div class="users-step-num">
                <i v-if="currentStep > index" class="bi bi-check-lg"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="users-step-copy">
                <span>{{ step.label }}</span>
                <small>{{ step.description }}</small>
              </div>
            </button>
          </div>

          <!-- CONTENIDO DE PASOS -->
          <div class="users-step-content">
            <!-- PASO 1: DATOS BÁSICOS -->
            <div v-show="currentStep === 0" class="users-step-panel">
              <div class="card data-card users-card">
                <div class="users-card-head">
                  <i class="bi bi-person-fill"></i>
                  <span>Datos Básicos</span>
                </div>
                <div class="users-card-body">
                  <div class="row g-3">
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Nombre Completo *</label>
                      <input 
                        v-model="formData.name" 
                        type="text" 
                        class="form-control" 
                        required
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Email *</label>
                      <input 
                        v-model="formData.email" 
                        type="email" 
                        class="form-control" 
                        required
                        placeholder="usuario@empresa.com"
                      />
                      <small class="text-muted">
                        Se usará como usuario/username
                      </small>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Teléfono</label>
                      <input 
                        v-model="formData.phone" 
                        type="tel" 
                        class="form-control" 
                        placeholder="+34 123 456 789"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PASO 2: PERMISOS Y ESTADO -->
            <div v-show="currentStep === 1" class="users-step-panel">
              <div class="card data-card users-card">
                <div class="users-card-head">
                  <i class="bi bi-shield-lock"></i>
                  <span>Permisos y Estado</span>
                </div>
                <div class="users-card-body">
                  <div class="row g-3">
                    <div class="col-12 col-lg-4">
                      <label class="form-label">Rol *</label>
                      <select v-model="formData.role" class="form-select" required>
                        <option value="">Selecciona un rol</option>
                        <option value="admin">Admin</option>
                        <option value="user">Usuario</option>
                        <option value="moderator">Moderador</option>
                      </select>
                    </div>
                    <div class="col-12 col-lg-4">
                      <label class="form-label">Estado *</label>
                      <select v-model="formData.status" class="form-select" required>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div class="col-12 col-lg-4">
                      <label class="form-label">Instancia</label>
                      <input 
                        v-model="formData.instance" 
                        type="text" 
                        class="form-control" 
                        placeholder="Ej: empresa1"
                        disabled
                      />
                      <small class="text-muted">Se obtiene automáticamente del perfil</small>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="editingUserId !== null" class="card data-card users-card mt-3">
                <div class="users-card-head">
                  <i class="bi bi-info-circle"></i>
                  <span>Información de Auditoría</span>
                </div>
                <div class="users-card-body">
                  <div class="row g-3">
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Creado en</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        :value="formData.created_dt"
                        disabled
                      />
                    </div>
                    <div class="col-12 col-lg-6">
                      <label class="form-label">Última actualización</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        :value="formData.update_dt"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PASO 3: SEGURIDAD -->
            <div v-show="currentStep === 2" class="users-step-panel">
              <!-- CREAR USUARIO: Solo contraseña -->
              <template v-if="editingUserId === null">
                <div class="card data-card users-card">
                  <div class="users-card-head">
                    <i class="bi bi-lock-fill"></i>
                    <span>Contraseña Inicial</span>
                  </div>
                  <div class="users-card-body">
                    <div class="row g-3">
                      <div class="col-12 col-lg-6">
                        <label class="form-label">Contraseña *</label>
                        <div class="password-input-group">
                          <input 
                            v-model="formData.password" 
                            :type="showPassword ? 'text' : 'password'" 
                            class="form-control" 
                            required
                            placeholder="••••••••"
                          />
                          <button 
                            type="button" 
                            class="password-toggle" 
                            @click="showPassword = !showPassword"
                            tabindex="-1"
                          >
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>
                      </div>
                      <div class="col-12 col-lg-6">
                        <label class="form-label">Confirmar Contraseña *</label>
                        <div class="password-input-group">
                          <input 
                            v-model="formData.confirmPassword" 
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            class="form-control" 
                            required
                            placeholder="••••••••"
                          />
                          <button 
                            type="button" 
                            class="password-toggle" 
                            @click="showConfirmPassword = !showConfirmPassword"
                            tabindex="-1"
                          >
                            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>
                        <small class="text-danger" v-if="formData.password && formData.password !== formData.confirmPassword">
                          Las contraseñas no coinciden
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- EDITAR USUARIO: Cambiar contraseña y eliminar cuenta -->
              <template v-else>
                <!-- Cambiar Contraseña -->
                <div class="card data-card users-card">
                  <div class="users-card-head">
                    <i class="bi bi-lock-fill"></i>
                    <span>Cambiar Contraseña</span>
                  </div>
                  <div class="users-card-body">
                    <div class="row g-3">
                      <div class="col-12 col-lg-6">
                        <label class="form-label">Nueva Contraseña</label>
                        <div class="password-input-group">
                          <input 
                            v-model="formData.password" 
                            :type="showPassword ? 'text' : 'password'" 
                            class="form-control" 
                            placeholder="••••••••"
                          />
                          <button 
                            type="button" 
                            class="password-toggle" 
                            @click="showPassword = !showPassword"
                            tabindex="-1"
                          >
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>
                      </div>
                      <div class="col-12 col-lg-6">
                        <label class="form-label">Confirmar Nueva Contraseña</label>
                        <div class="password-input-group">
                          <input 
                            v-model="formData.confirmPassword" 
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            class="form-control" 
                            placeholder="••••••••"
                          />
                          <button 
                            type="button" 
                            class="password-toggle" 
                            @click="showConfirmPassword = !showConfirmPassword"
                            tabindex="-1"
                          >
                            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>
                        <small class="text-danger" v-if="formData.password && formData.password !== formData.confirmPassword">
                          Las contraseñas no coinciden
                        </small>
                      </div>
                      <div class="col-12">
                        <small class="text-muted">Dejar en blanco si no deseas cambiar la contraseña</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Eliminar Cuenta -->
                <div class="card data-card users-card mt-3">
                  <div class="users-card-head">
                    <i class="bi bi-exclamation-triangle-fill" style="color: #dc3545;"></i>
                    <span style="color: #dc3545;">Zona de Peligro - Eliminar Cuenta</span>
                  </div>
                  <div class="users-card-body">
                    <p class="text-muted mb-3">Esta acción eliminará permanentemente la cuenta de usuario y no se puede deshacer.</p>
                    <button 
                      type="button" 
                      class="btn btn-danger"
                      @click="confirmDeleteAccount"
                    >
                      <i class="bi bi-trash3 me-2"></i>Eliminar Cuenta de Usuario
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- ACCIONES DE PASOS -->
          <div class="users-step-actions">
            <button v-if="currentStep > 0" type="button" class="btn btn-secondary" @click="prevStep">
              <i class="bi bi-arrow-left me-2"></i>Anterior
            </button>
            <div v-else></div>
            <div class="users-step-actions-right">
              <button 
                v-if="currentStep < getMaxSteps() - 1" 
                type="button" 
                class="btn btn-primary" 
                @click="nextStep"
              >
                Siguiente <i class="bi bi-arrow-right ms-2"></i>
              </button>
              <button v-else type="button" class="btn btn-primary" @click="saveUser" :disabled="isSavingUser">
                <span v-if="isSavingUser">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </span>
                <span v-else>
                  <i class="bi bi-floppy me-2"></i>{{ editingUserId === null ? 'Crear Usuario' : 'Guardar Cambios' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalComponent>

    <!-- TOAST -->
    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      ref="toastComponent"
    />
  </div>
</template>

<script>
import ModalComponent from '@/components/ModalComponent.vue';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import { getUsers, saveUser, resetUserPassword, deleteUser } from '@/services/userService';
import { useAuthStore } from '@/stores/auth';

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

export default {
  name: 'UsersView',
  components: {
    ModalComponent,
    DataTableComponent,
    ToastComponent
  },
  data() {
    return {
      users: [],
      loading: false,
      isSavingUser: false,
      licenseLimit: 0,
      editingUserId: null,
      currentStep: 0,
      showPassword: false,
      showConfirmPassword: false,
      formSteps: [
        { key: 'basic', label: 'Datos Básicos', description: 'Nombre, email y teléfono' },
        { key: 'permissions', label: 'Permisos', description: 'Rol, estado e instancia' },
        { key: 'security', label: 'Seguridad', description: 'Contraseña y opciones de cuenta' }
      ],
      formData: {
        id: null,
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user',
        status: 'active',
        instance: '',
        created_dt: '',
        update_dt: '',
        token: ''
      },
      columns: [
        { label: 'Nombre', key: 'name' },
        // { label: 'Email', key: 'email' },
        { label: 'Usuario', key: 'username' },
        // { label: 'Teléfono', key: 'phone' },
        { label: 'Rol', key: 'role' },
        { label: 'Estado', key: 'status' }
      ],
      toastTitle: '',
      toastMessage: '',
      isSuccess: true
    };
  },
  computed: {
    userInstance() {
      return sessionStorage.getItem('user_company') || 'default';
    },
    resultActions() {
      return [];
    },
    isLicenseLimitReached() {
      return this.licenseLimit > 0 && this.users.length >= this.licenseLimit;
    }
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        // Obtener usuarios desde la API
        this.users = await getUsers();
        
        // Obtener límite de licencias del authStore
        const authStore = useAuthStore();
        const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
        const licenseDetail = details.find(d => d.key === 'limit_license');
        this.licenseLimit = licenseDetail !== undefined ? Number(licenseDetail.value) : 0;
      } catch (error) {
        console.error('Error loading users:', error);
        this.showToast('Error al cargar los usuarios', 'error');
      } finally {
        this.loading = false;
      }
    },

    openModalForm() {
      this.editingUserId = null;
      this.currentStep = 0;
      this.resetFormData();
      this.$refs.formModal.openModal();
    },

    closeModalForm() {
      this.$refs.formModal.closeModal();
    },

    handleCloseModal() {
      this.resetFormData();
      this.currentStep = 0;
    },

    resetFormData() {
      this.formData = {
        id: null,
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user',
        status: 'active',
        instance: this.userInstance,
        created_dt: '',
        update_dt: '',
        token: ''
      };
      this.showPassword = false;
      this.showConfirmPassword = false;
    },

    editUser(user) {
      this.editingUserId = user.id;
      this.currentStep = 0;
      this.formData = { ...user, confirmPassword: '' };
      this.$refs.formModal.openModal();
    },

    openPasswordResetModal(user) {
      this.editingUserId = user.id;
      this.currentStep = 2; // Ir directamente al paso de contraseña
      this.formData = { ...user, confirmPassword: '', password: '', password: '' };
      this.$refs.formModal.openModal();
    },

    async saveUser() {
      // Validaciones
      if (!this.formData.name || !this.formData.email) {
        this.showToast('Los campos Nombre y Email son obligatorios', 'error');
        return;
      }

      // En creación, contraseña es obligatoria
      if (this.editingUserId === null && (!this.formData.password || !this.formData.confirmPassword)) {
        this.showToast('Debes ingresar una contraseña para crear un nuevo usuario', 'error');
        return;
      }

      // Validar que las contraseñas coincidan (si se ingresa una en edición)
      if (this.editingUserId === null && this.formData.password && this.formData.password !== this.formData.confirmPassword) {
        this.showToast('Las contraseñas no coinciden', 'error');
        return;
      }

      // En edición, si ingresa contraseña, debe confirmarse
      if (this.editingUserId !== null && this.formData.password && this.formData.password !== this.formData.confirmPassword) {
        this.showToast('Las contraseñas no coinciden', 'error');
        return;
      }

      this.isSavingUser = true;
      try {
        // Usar email como username
        this.formData.username = this.formData.email;
        
        const userData = { ...this.formData };
        delete userData.confirmPassword;

        // En edición, si no hay contraseña, no enviarla
        if (this.editingUserId !== null && !userData.password) {
          delete userData.password;
        }

        const result = await saveUser(userData);
        
        if (this.editingUserId === null) {
          this.users.push(result);
        } else {
          const index = this.users.findIndex(u => u.id === result.id);
          if (index !== -1) {
            this.users.splice(index, 1, result);
          }
        }

        this.showToast(this.editingUserId === null ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente');
        this.closeModalForm();
        this.loadUsers(); // Recargar la tabla
      } catch (error) {
        console.error('Error saving user:', error);
        this.showToast('Error al guardar el usuario', 'error');
      } finally {
        this.isSavingUser = false;
      }
    },

    confirmDelete(user) {
      if (confirm(`¿Estás seguro que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`)) {
        this.deleteUserConfirmed(user);
      }
    },

    async deleteUserConfirmed(user) {
      try {
        await deleteUser(user.id);
        this.users = this.users.filter(u => u.id !== user.id);
        this.showToast('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showToast('Error al eliminar el usuario', 'error');
      }
    },

    goToStep(index) {
      this.currentStep = index;
    },

    nextStep() {
      if (this.currentStep < this.getMaxSteps() - 1) {
        this.currentStep += 1;
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep -= 1;
      }
    },

    getMaxSteps() {
      // Siempre 3 pasos, pero el Step 3 cambia según sea creación o edición
      return 3;
    },

    showToast(message, type = 'success') {
      this.toastTitle = type === 'success' ? 'Realizado!' : 'Error';
      this.toastMessage = message;
      this.isSuccess = type === 'success';
      this.$refs.toastComponent.showToas();
    },

    confirmDeleteAccount() {
      if (confirm(`¿Estás seguro que deseas eliminar la cuenta de ${this.formData.name}? Esta acción no se puede deshacer.`)) {
        this.deleteAccountConfirmed();
      }
    },

    async deleteAccountConfirmed() {
      try {
        await deleteUser(this.formData.id);
        this.users = this.users.filter(u => u.id !== this.formData.id);
        this.showToast('Cuenta de usuario eliminada exitosamente');
        this.closeModalForm();
      } catch (error) {
        console.error('Error deleting user account:', error);
        this.showToast('Error al eliminar la cuenta de usuario', 'error');
      }
    }
  }
};
</script>

<style scoped lang="scss">
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
    color: #212529;
  }
}

.header-divider {
  border: none;
  border-top: 2px solid #e9ecef;
  margin: 1.5rem 0;
}

/* LICENSE INFO CARD */
.license-info-card {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
  border-radius: 14px;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);

  .card-body {
    padding: 1.5rem;
  }
}

.license-info-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.license-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.license-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.license-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #185fa5;
}

.license-value.text-danger {
  color: #dc3545;
}

.license-info-divider {
  width: 1px;
  height: 60px;
  background: #dee2e6;
}

.license-warning {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tip-banner-style {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.tip-banner-button {
  padding: 1rem !important;
  border-radius: 6px;
  background-color: #f8f9fa !important;
  color: #212529 !important;
  display: flex;
  align-items: center;
  gap: 1rem;

  .tip-icon {
    font-size: 1.5rem;
    color: #ffc107;
  }

  .tip-text {
    text-align: left;
  }

  &:not(.collapsed) {
    background-color: #eff6ff !important;
    color: #0056b3 !important;

    .tip-icon {
      color: #0056b3;
    }
  }
}

.tip-expanded {
  background-color: #f8f9fa;
  padding: 1rem;

  p {
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.35rem 0;
      font-size: 0.95rem;
    }
  }
}

.data-card {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
  border-radius: 14px;

  .card-body {
    padding: 1.5rem;
  }
}

.action-buttons {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;

  .btn-sm {
    padding: 0.35rem 0.65rem;
    font-size: 0.85rem;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
  }
}

/* MODAL CON STEPS - PATRÓN PAGESVIEW */
.users-step-modal {
  height: 100%;
}

.users-step-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  padding: 1.25rem;
  gap: 1rem;
}

.users-stepper {
  display: flex;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.users-step-item {
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
  cursor: pointer;
}

.users-step-item:last-child {
  border-right: 0;
}

.users-step-item:hover:not(.active) {
  background: #f8f9fa;
}

.users-step-item.active {
  background: #eff6ff;
}

.users-step-item.done .users-step-num,
.users-step-item.active .users-step-num {
  background: #185fa5;
  border-color: #185fa5;
  color: #fff;
}

.users-step-num {
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

.users-step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  span {
    font-size: 0.85rem;
    font-weight: 600;
    color: #212529;
  }

  small {
    font-size: 0.74rem;
    color: #6c757d;
  }
}

.users-step-item.active .users-step-copy span,
.users-step-item.done .users-step-copy span {
  color: #185fa5;
}

.users-step-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 0.25rem;
}

.users-step-panel {
  min-height: 100%;
  padding: 0.5rem 0;
}

.users-card {
  border: 1px solid #dee2e6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
  margin-bottom: 0.5rem;

  .users-card-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.9rem 1.1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-weight: 700;
    color: #212529;

    i {
      color: #185fa5;
      font-size: 1rem;
    }
  }

  .users-card-body {
    padding: 1.25rem;
    background: #fff;
  }
}

.users-step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
  border-top: 1px solid #dee2e6;
  margin-top: 0.5rem;
}

.users-step-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #212529;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.65rem;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #185fa5;
    box-shadow: 0 0 0 0.2rem rgba(24, 95, 165, 0.15);
  }

  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }
}

.text-muted {
  color: #6c757d;
  font-size: 0.85rem;
}

.text-danger {
  color: #dc3545;
  font-size: 0.85rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;

  &.bg-danger { background-color: #dc3545 !important; }
  &.bg-warning { background-color: #ffc107 !important; color: #000 !important; }
  &.bg-info { background-color: #17a2b8 !important; }
  &.bg-success { background-color: #28a745 !important; }
  &.bg-secondary { background-color: #6c757d !important; }
}

.btn {
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;

//   &.btn-primary {
//     background: linear-gradient(135deg, #185fa5 0%, #0d3a7a 100%);
//     border: none;

//     &:hover:not(:disabled) {
//       transform: translateY(-1px);
//       box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);
//     }
//   }

  &.btn-outline-secondary {
    border: 1px solid #dee2e6;
    color: #6c757d;

    &:hover {
      background-color: #f8f9fa;
      border-color: #adb5bd;
    }
  }

  &.btn-add {
    border-radius: 6px;
  }
}

/* PASSWORD INPUT GROUP */
.password-input-group {
  position: relative;
  display: flex;
  align-items: center;

  .form-control {
    padding-right: 2.5rem;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;

    &:hover {
      color: #185fa5;
    }

    i {
      font-size: 1rem;
    }
  }
}

/* SCROLLBAR */
.users-step-content::-webkit-scrollbar {
  width: 6px;
}

.users-step-content::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 3px;
}

.users-step-content::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 3px;

  &:hover {
    background: #868e96;
  }
}

/* RESPONSIVE */
@media (max-width: 991px) {
  .users-step-shell {
    padding: 1rem;
  }

  .users-stepper {
    flex-direction: column;
  }

  .users-step-item {
    border-right: 0;
    border-bottom: 1px solid #e9ecef;
  }

  .users-step-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 767px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    h2 {
      font-size: 1.5rem;
    }
  }

  .users-step-actions,
  .users-step-actions-right {
    flex-direction: column;
    align-items: stretch;
  }

  .users-step-actions .btn,
  .users-step-actions-right .btn {
    width: 100%;
  }

  .row.g-3 {
    .col-12 {
      margin-bottom: 0;
    }
  }
}
</style>
