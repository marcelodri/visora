<template>
  <div id="login-container">
    <div class="container-fluid page-shell">
      <div class="row g-0 page-grid">
        <div class="col-12 col-lg-5 form-column">
          <div class="form-wrapper">
            <div class="brand-block">
              <p class="micro-badge">VISORA HUB</p>
              <div class="logo">
                <a href="/" class="brand-link">visora</a>
              </div>
              <h1>Bienvenido de nuevo</h1>
              <p class="subtitle">
                Inicia sesion para entrar al panel y gestionar tu contenido.
              </p>
            </div>

            <form @submit.prevent="login" class="login-form">
              <div class="field-group">
                <label class="form-label" for="username">Email</label>
                <input
                  id="username"
                  class="form-control"
                  type="email"
                  placeholder="tuemail@empresa.com"
                  autocomplete="email"
                  v-model.trim="username"
                  required
                />
              </div>

              <div class="field-group">
                <label class="form-label" for="password">Contrasena</label>
                <div class="password-input-wrapper">
                  <input
                    id="password"
                    class="form-control"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Escribe tu contrasena"
                    autocomplete="current-password"
                    v-model="password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-visibility"
                    @click="togglePassword"
                    :aria-label="showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <p class="helper-text">
                Tu sesion se cerrara automaticamente tras 15 minutos de inactividad.
              </p>

              <button type="submit" class="btn-submit" :disabled="isLoading">
                {{ isLoading ? 'Ingresando...' : 'Entrar al panel' }}
              </button>

              <p class="error-text" :class="{ visible: showErrorMessage }" aria-live="polite">
                {{ showErrorMessage ? errorMessage : 'Credenciales invalidas' }}
              </p>
            </form>

            <div class="footer-links">
              <router-link :to="{ name: 'home' }">Ir al inicio</router-link>
              <a href="https://madcoder.io/" target="_blank" rel="noopener noreferrer">madcoder.io</a>
            </div>
          </div>
        </div>

        <div class="col-lg-7 d-none d-lg-block banner-column">
          <div class="banner-login">
            <img class="image-login" :src="imageLogin" alt="Imagen de fondo" />
            <div class="banner-overlay"></div>
            <div class="banner-copy">
              <h2>Haz que tus ideas sucedan</h2>
              <p>
                Centraliza campanas, paginas y formularios con una experiencia rapida y visual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import imageLogin from '../assets/images/data1-min-min.jpg';

export default {
  data() {
    return {
      username: '',
      password: '',
      imageLogin,
      isLoading: false,
      showErrorMessage: false,
      errorMessage: '',
      showPassword: false
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async login() {
      this.isLoading = true;
      this.showErrorMessage = false;
      this.errorMessage = '';

      try {
        const authStore = useAuthStore();

        const response = await axios.post(
          'https://apis.madautomate.cloud/webhook/6892bbc7-ce41-4bf2-98da-63e321a6fc74',
          {
            username: this.username,
            password: this.password
          }
        );

        if (!response.data?.token) {
          this.isLoading = false;
          this.showErrorMessage = true;
          this.errorMessage = 'Credenciales invalidas';
          return;
        }

        const token = response.data.token;
        sessionStorage.setItem('token', token);

        // Guardar datos del usuario para usar en PDFs y otras vistas
        sessionStorage.setItem('user_name', response.data.username || response.data.name || '');
        sessionStorage.setItem('user_email', response.data.email || '');
        sessionStorage.setItem('user_phone', response.data.phone || response.data.phoneNumber || response.data.telefono || response.data.phone_number || '');
        sessionStorage.setItem('user_company', response.data.company || response.data.instance || '');
        
        // Debug: mostrar qué se guardó
        console.log('📱 Datos guardados en sessionStorage:', {
          user_name: sessionStorage.getItem('user_name'),
          user_email: sessionStorage.getItem('user_email'),
          user_phone: sessionStorage.getItem('user_phone'),
          user_company: sessionStorage.getItem('user_company')
        });

        const userData = {
          username: response.data.username,
          email: response.data.email,
          level: response.data.level,
          instance: response.data.instance,
          appkey: response.data.appkey,
          details: response.data.details,
          phone: response.data.phone,
          name: response.data.name  
        };
        authStore.login(userData);

        const menuResponse = await axios.get(
          'https://apis.madautomate.cloud/webhook/06e5d47d-62f0-4a24-bc5c-d6ef1d853438',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const menuData = menuResponse.data;
        sessionStorage.setItem('menu', JSON.stringify(menuData));
        authStore.setMenu(menuData);

        this.$router.push({ name: 'panelHome' });
      } catch (error) {
        this.isLoading = false;
        this.showErrorMessage = true;
        this.errorMessage = 'No pudimos iniciar sesion. Revisa tus datos e intenta nuevamente.';
      }
    },
    checkIfLoggedIn() {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.$router.push({ name: 'panelHome' });
        return;
      }

      this.isLoading = false;
    }
  },
  mounted() {
    if (this.$route.query.reason === 'inactive') {
      this.showErrorMessage = true;
      this.errorMessage = 'Sesion cerrada por inactividad.';
    }
    this.checkIfLoggedIn();
  }
};
</script>

<style lang="scss">
#login-container {
  height: 100vh;
  min-height: 100vh;
  padding: 14px;
  background:
    radial-gradient(circle at 12% 15%, rgba(12, 179, 206, 0.14) 0, rgba(12, 179, 206, 0) 38%),
    radial-gradient(circle at 90% 86%, rgba(53, 78, 255, 0.12) 0, rgba(53, 78, 255, 0) 42%),
    linear-gradient(135deg, #f3f8ff 0%, #e8f0ff 50%, #f8fbff 100%);

  .page-shell {
    height: 100%;
    box-sizing: border-box;
  }

  .page-grid {
    height: 100%;
    min-height: 100%;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 55px rgba(19, 43, 91, 0.12);
    background: #ffffff;
  }

  .form-column {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    height: 100%;
  }

  .form-wrapper {
    width: 100%;
    max-width: 450px;
    padding: 36px 32px;
  }

  .brand-block {
    margin-bottom: 26px;
  }

  .micro-badge {
    margin: 0 0 10px;
    width: fit-content;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #1f63ff;
    background: #ecf2ff;
  }

  .logo {
    margin-bottom: 10px;
  }

  .brand-link {
    text-decoration: none;
    font-size: 42px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -1px;
    color: #3939ff;
  }

  h1 {
    margin: 0 0 6px;
    color: #1b2537;
    font-size: 31px;
    font-weight: 700;
  }

  .subtitle {
    margin: 0;
    color: #5f6b7e;
    font-size: 15px;
  }

  .login-form {
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

  .form-control::placeholder {
    color: #97a2b7;
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
    min-height: 20px;
    color: #c72828;
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transform: translateY(-2px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .error-text.visible {
    opacity: 1;
    transform: translateY(0);
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
    min-height: 100%;
    position: relative;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(165deg, rgba(8, 18, 42, 0.14) 0%, rgba(8, 18, 42, 0.74) 80%);
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
    font-size: 31px;
    font-weight: 700;
  }

  .banner-copy p {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 991px) {
  #login-container {
    .page-shell {
      padding: 10px;
    }

    .page-grid {
      height: 100%;
      min-height: 100%;
      border-radius: 16px;
    }

    .form-wrapper {
      max-width: 100%;
      padding: 22px 18px;
    }

    .brand-link {
      font-size: 35px;
    }
  }
}
</style>
