<template >
  <div class="home">
    <menu>
      <div class="container-fluid">
        <div class="row align-items-center">

          <div class="col-4 px-0">
            <div class="logo">
              <a href="/" style="text-decoration: none">
                <span>visora</span>
              </a>
            </div>
          </div>

          <div class="col-8 px-0">
            <ul>
              <li>
                <div>
                    <button v-if="this.$i18n.locale == 'es'" class="btn-menu btn-transparent" @click="changeLanguage('en')">EN</button>
                    <button v-if="this.$i18n.locale == 'en'" class="btn-menu btn-transparent" @click="changeLanguage('es')">ES</button>
                </div>
              </li>
              <li>
                <router-link class="btn-link px-0" :to="{ name: 'login' }">
                  <i class="bi bi-box-arrow-in-right"></i> {{ $t('home.login') }}
                </router-link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </menu>

    <main>
      <div class="container-fluid">
        <div class="row">

          <div class="col-12 text-center mb-100 px-0">
            <div  data-aos-duration="0" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" class="background-image">
              <div class="overlay"></div> <!-- Overlay oscuro -->
              <h1 data-aos-duration="400" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">{{ $t('home.title') }}</h1>
              <h3 data-aos-duration="800" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">{{ $t('home.subtitle') }}</h3>
              <h3 data-aos-duration="800" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">{{ $t('home.subtitle2') }}</h3>
            </div>
          </div>

          <div class="col-12 col-xl-6 box pl-100">
            <p class="padding-inner-right" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" v-html="$t('home.text1')"></p>
          </div>

          <div class="col-12 col-xl-6 box">
            <div class="image-container">
              <img :src="image2" alt="" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0"> 
              <div class="overlay"></div> <!-- Overlay oscuro -->
            </div>
          </div>

          <div class="col-12 col-xl-6 box">
            <div class="image-container">
              <img :src="image3" alt="" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0"> 
              <div class="overlay"></div> <!-- Overlay oscuro -->
            </div>
          </div>

          <div class="col-12 col-xl-6 box">
            <p class="padding-inner-right" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" v-html="$t('home.text2')"></p>
          </div>

          <div class="col-6 text-center box offset-3">
            <p data-aos="fade-zoom-in" v-html="$t('home.text3')"></p>
          </div>

        </div>
      </div>
    </main>

    <footer>
      <div class="container-fluid">
        <div class="row">
          
          <div class="col-6">

          </div>
          <div class="col-6 text-end">
            <a href="https://madcoder.io">madcoder.io</a>
          </div>

        </div>
      </div>
    </footer>
  </div>
</template>

<script>

import image2 from '../assets/images/data3-min-min.jpg';
import image3 from '../assets/images/data2-min-min.jpg';

export default {
  name: 'HomeComponent',
  data() {
    return {
      image2,
      image3
    };
  },
  methods: {
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      sessionStorage.setItem('lang', lang); // Guarda el idioma en sessionStorage
    }

  }
}

</script>
<style lang="scss">
.padding-inner-right{ 
  padding-right: 80px;
  @media(max-width: 768px) {
    padding-right: 0px;
  }
}
.home {

  background: #0b0b15;
  height: 100%;
  min-height: 100vw;
  color: rgba(248, 249, 250, 0.8);
  font-family: Satoshi, sans-serif;
  letter-spacing: .5px;

  menu {
    padding: 20px 80px;
    position: fixed;
    top: 0;
    z-index: 10;
    background: #0b0b15;
    width: 100%;
    box-shadow: 0 1px 15px rgba(255, 255, 255, .04);

    @media(max-width: 768px) {
      padding: 10px 20px;
    }

    ul {
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: end;
      margin-bottom: 0;
      font-size: 16px;

      li {margin-left: 10px;}
    }

    .link-login {
      text-decoration: none
    }
  }

  .background-image {
    position: relative; /* Para que el overlay se posicione correctamente */
    background: url('../assets/images/data4-min-min.jpg');
    background-size: cover;
    height: 100vh;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    padding: 80px;

    @media(max-width: 768px) {
      padding: 20px;
    }

    h1 {
      font-size: 60px;
      margin-bottom: 60px;
      margin-top: 150px;
      max-width: 35%;

      @media(max-width: 768px) {
        font-size: 45px;
        max-width: 100%;
        margin-top: 10px;
      }

    }

    h3 {
      max-width: 60%;
      font-weight: lighter;

      @media(max-width: 768px) {
        max-width: 100%;
      }

    }

  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3); /* Negro con opacidad del 50% */
    z-index: 1; /* Asegúrate de que el overlay esté detrás del texto */
  }

  h1, h3 {
    position: relative; /* Para que el texto esté sobre el overlay */
    z-index: 2; /* Asegúrate de que el texto esté por encima del overlay */
  }

  .box {
    margin-bottom: 150px;
    
    @media(max-width: 768px) {
      margin-bottom: 60px;
    }

    p {
      max-width: 700px;
      font-size: 24px;
      line-height: 40px;

      @media(max-width: 768px) {
        font-size: 16px;
        line-height: 26px;
      }

    }


    &:nth-child(odd) {
        padding-left: 40px;  /* Padding para elementos impares (1, 3, 5, ...) */
        padding-right: 0;    /* Sin padding derecho para elementos impares */
    }

    &:nth-child(even) {
        padding-left: 0;     /* Sin padding izquierdo para elementos pares (2, 4, 6, ...) */
        padding-right: 40px; /* Padding para elementos pares */
    }

    @media(max-width: 768px) {
      padding-left: 40px!important;     /* Sin padding izquierdo para elementos pares (2, 4, 6, ...) */
      padding-right: 40px!important; /* Padding para elementos pares */
    }

    &.pl-100 {
      padding-left: 100px;  /* Padding para elementos impares (1, 3, 5, ...) */

      @media(max-width: 768px) {
        padding-left: 40px!important;     /* Sin padding izquierdo para elementos pares (2, 4, 6, ...) */
      }

    }

    h5 {
      @media(max-width: 768px) {
        font-size: 12px;
        line-height: 20px;
      }
    }


  }

  button {
    color: #f8f9fa!important;
  }

  .image-container {
    position: relative; /* Para que el overlay se posicione correctamente */
  }

  .image-container img {
    width: 100%; /* Asegúrate de que la imagen ocupe el 100% del contenedor */
    height: auto; /* Mantiene la proporción de la imagen */
  }

  footer {
    border: none;
    padding: 20px 80px;
  }

  .mb-100 {
    margin-bottom: 160px;

    @media(max-width: 768px) {
      margin-bottom: 60px;
    }

  }

  .btn-link {
    color: #3939ff
  }

}
</style>