<template>
  <div id="login">
    
    <div class="container-fluid px-0">
      <div class="row">

        <div class="col-12 col-sm-4 p-5 p-sm-0">

          <div class="h-100 d-flex flex-column align-items-center justify-content-center">
            
            <div class="logo h-10">
              <a href="/" style="text-decoration: none">
                <span>visora</span>
              </a>
            </div>

            <form @submit.prevent="login">

              <div class="form-floating mb-3 mt-5">
                <input class="form-control" id="username" placeholder="name@example.com" type="text" v-model="username" required>
                <label for="username">Email</label>
              </div>

              <div class="form-floating mb-5">
                <input type="password" class="form-control" id="password" v-model="password" required>
                <label for="password">Password</label>
              </div>

              <button type="submit" class="btn w-100 mt-3">Login</button>
              <p v-if="showErrorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
            </form>

            <div class="logo-madcoder mt-4">
              <a href="https://madcoder.io/"><img src="" alt="">madcoder.io</a>
            </div>

          </div>

        </div>

        <div class="col-12 col-sm-8">
          <div class="bannerLogin">
            <img class="imageLogin" :src="imageLogin" alt="">
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
import ToastComponent  from '../components/ToastComponent.vue';
import router from '@/router';

export default {
  components: {
    ToastComponent
  }, 
  data() {
    return {
      username: '',
      password: '',
      // errorMessage: '', // Para mostrar mensajes de error
      imageLogin,
      isLoading: true,
      showErrorMessage: false,
      errorMessage: ''
    };
  },
  methods: {
    async login() {

      this.isLoading= true;

      try {
        const authStore = useAuthStore();

        // Realiza una petición POST al webhook con las credenciales
        const response = await axios.post('https://apis.madautomate.cloud/webhook/6892bbc7-ce41-4bf2-98da-63e321a6fc74', {
          username: this.username,
          password: this.password,
        });
        
        console.log('response', response)


        //Si la respuesta contiene un access_token, guárdalo en sessionStorage
        if (response.data.token) {
          sessionStorage.setItem('token', response.data.token);
          // 1. Guarda la información del usuario en el store de autenticación
          const userData = {
            username: response.data.username,
            email: response.data.email,
            level: response.data.level,
            instance: response.data.instance,
            appkey: response.data.appkey,
            details: response.data.details
          }
          authStore.login(userData);
          
          console.log(' Obtener el menú usando el token')
          // 2. Obtener el menú usando el token
          const menuResponse = await axios.get(
            'https://apis.madautomate.cloud/webhook/06e5d47d-62f0-4a24-bc5c-d6ef1d853438',
            {
              headers: {
                Authorization: `Bearer ${response.data.token}`
              }
            }
          );
          console.log('menuResponse', menuResponse)

          const menuData = menuResponse.data;
          //console.log('menuData', menuData)
          // Guardar menú en store o sessionStorage
          sessionStorage.setItem('menu', JSON.stringify(menuData));
          authStore.setMenu(menuData); // Método que deberías agregar en tu store
          
          // Construir rutas dinámicas
          // console.log('Construir rutas dinámicas')
          // const dynamicRoutes = await this.buildRoutesFromMenu(menuResponse.data);
          // console.log('buildRoutesFromMenu', dynamicRoutes)

          // // // Agregar children a /panel 
          // dynamicRoutes.forEach(r => {
          //   this.$router.addRoute('panel', r);
          // });
          
          // 3.Redirige al panel de usuario
          this.$router.push({ name: 'panelHome' });

        } else {
          // Si no se recibe el token, muestra un mensaje de error
          this.isLoading= false;
          this.showErrorMessage = true;
          this.errorMessage='Credenciales inválidas';
        }
      } catch (error) {
        this.isLoading= false;
        // Si hay un error en la solicitud, muestra un mensaje de error
        // this.errorMessage = 'Verifica tus credenciales';
        this.showErrorMessage = true;
        this.errorMessage='Credenciales inválidas';

      }
    },
    checkIfLoggedIn() {
      const token = sessionStorage.getItem('token');
      console.log('token', token)
      if (token) {
        // Redirige al panel por path en lugar de nombre
        this.$router.push('/panel');
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 1000)
    },
    // async buildRoutesFromMenu(menu) {
    //   return menu
    //     .map(item => {
    //       if (item.link) {
    //         return {
    //           path: item.link,
    //           name: item.name,
    //           component: () => import(`@/views/panel/${item.component}.vue`),
    //           meta: { requiresAuth: true }
    //         };
    //       }
    //       return null; // 👈 este queda pero después lo filtramos
    //     })
    //     .filter(route => route !== null);
    // }
  },
  mounted() {
    // Al cargar el componente, verifica si ya está logueado
    this.checkIfLoggedIn();
  },
};
</script>

<style lang="scss">
  #login {
    height: 100%;

    form {
      text-align: center;
      label {
        margin-bottom: 0;
      }
      input {
        width: 300px;
        
        &:focus {
          box-shadow: none;
          border: 1px solid #3939ff;
        }

      }
      button {
        padding: 12px;
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