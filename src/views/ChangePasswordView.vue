<template>
  <div id="change-password-container">

    <!-- <h2>Cambiar Contraseña</h2> -->


    <div class="container-fluid px-0">
      <div class="row">

        <div class="col-4">

          <div class="h-100 d-flex flex-column align-items-center justify-content-center">
            
            <div class="logo h-10">
              <a href="/" style="text-decoration: none">
                <span>visora</span>
              </a>
            </div>

            <form @submit.prevent="changePassword">
              <div class="mb-3 align-items-center mt-3">
                <label class="form-label mr-5" for="newPassword">Nueva Contraseña</label>
                <input class="form-control" type="password" v-model="newPassword" required />
              </div>
              <div>
                <label class="form-label mr-5" for="confirmPassword">Confirmar Contraseña</label>
                <input class="form-control" type="password" v-model="confirmPassword" required />
              </div>
              <button type="submit" class="btn w-100 mt-5">Cambiar Contraseña</button>
              <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
            </form>

            <div class="logo-madcoder mt-5">
              <router-link :to="{ name: 'panel' }">Panel Visora</router-link>
            </div>

            <div class="logo-madcoder mt-1">
              <a href="https://madcoder.io/"><img src="" alt="">madcoder.io</a>
            </div>

          </div>

        </div>

        <div class="col-8">
          <div class="bannerLogin">
            <img class="imageLogin" :src="imageLogin" alt="">
          </div>
        </div>

      </div>
    </div>

    <LoadingDots :isLoading="isLoading" />
    <ToastComponent v-if="showSuccessToast" :title="'Bien!'" :message="'Contraseña modificada.'" :isSuccess="true"/>

  </div>
</template>
  
  <script>
  import axios from 'axios';
  import { useAuthStore } from '@/stores/auth';
  import imageLogin from '../assets/images/data1-min-min.jpg';
  import ToastComponent  from '../components/ToastComponent.vue';

  export default {
    components: {
      ToastComponent
    },
    data() {
      return {
        newPassword: '',
        confirmPassword: '',
        errorMessage: '', // Para mostrar mensajes de error
        successMessage: '', // Para mostrar mensaje de éxito
        imageLogin,
        isLoading: false,
        showSuccessToast: false
      };
    },
    methods: {
      async changePassword() {
        const authStore = useAuthStore();

        this.errorMessage = '';
        this.isLoading= true

        // Validar que las contraseñas coinciden
        if (this.newPassword !== this.confirmPassword) {
          this.isLoading= false

          this.errorMessage = 'Las contraseñas no coinciden.';
          return;
        }
  
        try {
          const token = sessionStorage.getItem('token');
  
          // Realiza una petición POST al webhook para cambiar la contraseña
          const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/1e71f470-5bd8-42a3-8c37-94a57b872931', {
            password: this.newPassword,
          }, {
            headers: {
              Authorization: `Bearer ${token}` // Añadir el token a la cabecera de autorización
            }
          });
  
          // Si todo está ok, muestra un mensaje de éxito y redirige a la home
          if (response.status === 200) {
            this.showSuccessToast = true;
            setTimeout(() => {
              authStore.logout();
              this.$router.push({ name: 'home' }); // Redirigir a la home después de 2 segundos
            }, 2000);
          }
        } catch (error) {
          this.isLoading= false
          // Si hay un error en la solicitud, muestra un mensaje de error
          this.errorMessage = 'Error al cambiar la contraseña: ' + (error.response?.data?.message || 'Verifica tu conexión.');
        }
      },
    },
  };
  </script>
  
  <style lang="scss">
  #change-password-container {
    height: 100%;

    form {
      text-align: center;
      label {
        margin-bottom: 0;
      }
    }
    
    
    .bannerLogin {
      position: relative; /* Necesario para que el ::after se posicione correctamente */
    }

    .bannerLogin::after {
      content: "";
      position: absolute; /* Asegúrate de que el pseudo-elemento esté posicionado absolutamente */
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5); /* Capa negra con opacidad */
      z-index: 1; /* Asegúrate de que esté por encima de la imagen */
    }

    .imageLogin {
      height: 100vh; /* Altura de la imagen */
      width: 100%; /* Asegúrate de que ocupe el ancho completo */
      object-fit: cover; /* Asegúrate de que la imagen se ajuste correctamente */
      z-index: 0; /* Imagen detrás de la capa negra */
      position: relative; /* Necesario para que z-index funcione */
    }

    .h-10 {
      height: 60px!important;
    }

    .logo{
      width: auto;
      span{
        font-size: 50px!important;
      }
    }

    a {
      color: #3a3a3a
    }
  }
</style>