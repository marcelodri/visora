<template>
  <div id="change-password-container">
    <div class="container-fluid page-shell">
      <div class="row g-0 page-grid">
        <div class="col-12 col-lg-5 form-column">
          <div class="form-wrapper">
            <div class="brand-block">
              <div class="logo">
                <a href="/" class="brand-link">visora</a>
              </div>
              <h1>Cambiar contrasena</h1>
              <p class="subtitle">
                Elegi una clave nueva para proteger tu cuenta.
              </p>
            </div>

            <form @submit.prevent="changePassword" class="password-form">
              <div class="field-group">
                <label class="form-label" for="newPassword">Nueva contrasena</label>
                <div class="password-input-wrapper">
                  <input
                    id="newPassword"
                    class="form-control"
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model.trim="newPassword"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-visibility"
                    @click="togglePassword('new')"
                    :aria-label="showNewPassword ? 'Ocultar nueva contrasena' : 'Mostrar nueva contrasena'"
                  >
                    <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="field-group">
                <label class="form-label" for="confirmPassword">Confirmar contrasena</label>
                <div class="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    class="form-control"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model.trim="confirmPassword"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-visibility"
                    @click="togglePassword('confirm')"
                    :aria-label="showConfirmPassword ? 'Ocultar confirmacion de contrasena' : 'Mostrar confirmacion de contrasena'"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <p
                  class="match-feedback"
                  :class="{
                    'is-valid': confirmPassword && passwordsMatch,
                    'is-invalid': confirmPassword && !passwordsMatch,
                    'is-placeholder': !confirmPassword
                  }"
                  aria-live="polite"
                >
                  {{ confirmPassword ? (passwordsMatch ? 'Las contrasenas coinciden.' : 'Las contrasenas no coinciden.') : 'Las contrasenas no coinciden.' }}
                </p>
              </div>

              <p class="helper-text">Sugerencia: usa al menos 8 caracteres con letras y numeros.</p>

              <button type="submit" class="btn-submit" :disabled="isLoading">
                {{ isLoading ? 'Guardando...' : 'Cambiar contrasena' }}
              </button>

              <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            </form>

            <div class="footer-links">
              <router-link :to="{ name: 'panelHome' }">Volver al panel</router-link>
              <a href="https://madcoder.io/" target="_blank" rel="noopener noreferrer">madcoder.io</a>
            </div>
          </div>
        </div>

        <div class="col-lg-7 d-none d-lg-block banner-column">
          <div class="banner-login">
            <img class="image-login" :src="imageLogin" alt="Imagen de fondo" />
            <div class="banner-overlay"></div>
            <div class="banner-copy">
              <h2>Seguridad primero</h2>
              <p>
                Despues de cambiar tu contrasena vamos a cerrar la sesion para que vuelvas a entrar con la nueva clave.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoadingDots :isLoading="isLoading" />
    <ToastComponent
      v-if="showSuccessToast"
      :title="'Bien!'"
      :message="'Contrasena modificada.'"
      :isSuccess="true"
    />
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import imageLogin from '../assets/images/data1-min-min.jpg';
import ToastComponent from '../components/ToastComponent.vue';

export default {
  components: {
    ToastComponent
  },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      imageLogin,
      isLoading: false,
      showSuccessToast: false,
      showNewPassword: false,
      showConfirmPassword: false
    };
  },
  computed: {
    passwordsMatch() {
      return this.newPassword === this.confirmPassword;
    }
  },
  methods: {
    togglePassword(field) {
      if (field === 'new') {
        this.showNewPassword = !this.showNewPassword;
        return;
      }
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    async changePassword() {
      const authStore = useAuthStore();
      const token = sessionStorage.getItem('token');
      const userEmail = authStore.user?.email || '';

      this.errorMessage = '';
      this.isLoading = true;

      if (!token) {
        this.isLoading = false;
        this.errorMessage = 'No encontramos tu sesion. Inicia sesion nuevamente.';
        return;
      }

      if (!userEmail) {
        this.isLoading = false;
        this.errorMessage = 'No encontramos tu email de usuario.';
        return;
      }

      if (this.newPassword.length < 8) {
        this.isLoading = false;
        this.errorMessage = 'La contrasena debe tener al menos 8 caracteres.';
        return;
      }

      if (!this.passwordsMatch) {
        this.isLoading = false;
        this.errorMessage = 'Las contrasenas no coinciden.';
        return;
      }

      try {
        const response = await axios.post(
          'https://apis.madautomate.cloud/webhook/b6b2190a-4d8c-477d-97f5-f763252f3de9',
          {
            email: userEmail,
            password: this.newPassword,
            username: userEmail
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          this.isLoading = false;
          this.showSuccessToast = true;
          setTimeout(() => {
            authStore.logout();
            this.$router.push({ name: 'home' });
          }, 2000);
          return;
        }

        this.isLoading = false;
        this.errorMessage = 'No se pudo cambiar la contrasena. Intenta nuevamente.';
      } catch (error) {
        this.isLoading = false;
        this.errorMessage = `Error al cambiar la contrasena: ${error.response?.data?.message || 'Verifica tu conexion.'}`;
      }
    }
  }
};
</script>

<style lang="scss">
#change-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f8ff 0%, #e8f0ff 55%, #f8fbff 100%);

  .page-shell {
    padding: 17px;
  }

  .page-grid {
    min-height: calc(100vh - 48px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(20, 45, 95, 0.12);
    background: #ffffff;
  }

  .form-column {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
  }

  .form-wrapper {
    width: 100%;
    max-width: 440px;
    padding: 36px 32px;
  }

  .brand-block {
    margin-bottom: 28px;
  }

  .logo {
    margin-bottom: 10px;
  }

  .brand-link {
    text-decoration: none;
    font-size: 40px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -1px;
    color: #3939ff;
  }

  h1 {
    margin: 0 0 6px;
    color: #1d2738;
    font-size: 30px;
    font-weight: 700;
  }

  .subtitle {
    margin: 0;
    color: #5f6b7e;
    font-size: 15px;
  }

  .password-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    margin: 0;
    font-size: 13px;
    color: #334056;
    font-weight: 600;
  }

  .password-input-wrapper {
    position: relative;
  }

  .form-control {
    border-radius: 12px;
    border: 1px solid #d4dbe7;
    padding: 12px 46px 12px 14px;
    min-height: 46px;
    box-shadow: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .form-control:focus {
    border-color: #2f66ff;
    box-shadow: 0 0 0 4px rgba(47, 102, 255, 0.15);
  }

  .toggle-visibility {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: #63708a;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .toggle-visibility:hover {
    background-color: #eef3ff;
    color: #2f66ff;
  }

  .toggle-visibility:focus-visible {
    outline: 2px solid #2f66ff;
    outline-offset: 1px;
  }

  .match-feedback {
    margin: 0;
    min-height: 18px;
    font-size: 12px;
    font-weight: 600;
    visibility: hidden;
  }

  .match-feedback.is-valid {
    color: #0f8a4b;
    visibility: visible;
  }

  .match-feedback.is-invalid {
    color: #d33333;
    visibility: visible;
  }

  .match-feedback.is-placeholder {
    visibility: hidden;
  }

  .helper-text {
    margin: 2px 0 0;
    font-size: 12px;
    color: #5f6b7e;
  }

  .btn-submit {
    margin-top: 8px;
    width: 100%;
    border: none;
    border-radius: 12px;
    min-height: 48px;
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(90deg, #1c5cff 0%, #0d7aea 100%);
    box-shadow: 0 12px 24px rgba(28, 92, 255, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }

  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(28, 92, 255, 0.35);
  }

  .btn-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error-text {
    margin: 8px 0 0;
    color: #c72828;
    font-size: 13px;
    font-weight: 500;
  }

  .footer-links {
    margin-top: 24px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .footer-links a {
    color: #2f66ff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
  }

  .footer-links a:hover {
    text-decoration: underline;
  }

  .banner-column {
    background: #0e2f66;
  }

  .banner-login {
    height: 100%;
    min-height: calc(100vh - 48px);
    position: relative;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(165deg, rgba(8, 18, 42, 0.18) 0%, rgba(8, 18, 42, 0.72) 80%);
    z-index: 1;
  }

  .image-login {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-copy {
    position: absolute;
    left: 36px;
    right: 36px;
    bottom: 36px;
    color: #ffffff;
    z-index: 2;
  }

  .banner-copy h2 {
    margin: 0 0 8px;
    font-size: 30px;
    font-weight: 700;
  }

  .banner-copy p {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 991px) {
  #change-password-container {
    .page-shell {
      padding: 14px;
    }

    .page-grid {
      min-height: auto;
      border-radius: 16px;
    }

    .form-wrapper {
      max-width: 100%;
      padding: 28px 20px;
    }

    .brand-link {
      font-size: 34px;
    }
  }
}
</style>
