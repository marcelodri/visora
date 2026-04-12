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
              <!-- <li>
                <div>
                    <button v-if="this.$i18n.locale == 'es'" class="btn-menu btn-transparent" @click="changeLanguage('en')">EN</button>
                    <button v-if="this.$i18n.locale == 'en'" class="btn-menu btn-transparent" @click="changeLanguage('es')">ES</button>
                </div>
              </li> -->
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
            <div data-aos-duration="0" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" class="background-image">
              <video autoplay muted loop playsinline class="background-video">
                <source :src="video2" type="video/mp4">
              </video>
              <div class="overlay"></div>
              <h1 data-aos-duration="400" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">{{ $t('home.title') }}</h1>
              <h3 data-aos-duration="800" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">{{ $t('home.subtitle') }}</h3>
            </div>
          </div>
          
          <!-- modules section -->
          <div class="col-12 modules-section">
            <h2 data-aos-duration="400" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">Los módulos de Visora</h2>
            <p class="modules-subtitle" data-aos-duration="400" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">Soluciones completas para automatizar y potenciar tu negocio</p>
          </div>

          <!-- Module 1 -->
          <div class="col-12 col-lg-6 col-xl-4 module-card" data-aos="fade-up" data-aos-duration="600" data-aos-easing="ease-in-back" data-aos-offset="0">
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon"><i class="bi bi-puzzle"></i></div>
                <!-- <div class="pilot-badge text-end">
                  <span>integrado con</span><br>
                  <img :src="pilot" alt="Pilot" class="pilot-logo">
                </div> -->
              </div>
              <h3>Landing Pages & Formularios</h3>
              <p class="card-subtitle">Landing Pages & Formularios Inteligentes</p>
              <p class="card-description">Creá páginas y formularios reutilizables, integrados con Pilot para leads y turnos de taller. Un solo formulario, múltiples páginas, máxima flexibilidad.</p>
              <ul class="card-bullets">
                <li>Biblioteca de formularios centralizada</li>
                <li>Call Code único por página</li>
                <li>Coherencia visual + personalización</li>
                <li>Integración directa con Pilot Solution</li>
              </ul>
              <div class="card-image">
                <div class="slider">
                  <img :src="sliderImages.module1[sliderIndex.module1]" alt="Landing Pages" class="slider-image">
                  <div class="slider-dots">
                    <button 
                      v-for="(_, index) in sliderImages.module1" 
                      :key="index"
                      class="dot"
                      :class="{ active: sliderIndex.module1 === index }"
                      @click="goToSlide('module1', index)">
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Module 2 -->
          <div class="col-12 col-lg-6 col-xl-4 module-card" data-aos="fade-up" data-aos-duration="600" data-aos-delay="100" data-aos-easing="ease-in-back" data-aos-offset="0">
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon"><i class="bi bi-calendar-event"></i></div>
                <!-- <div class="pilot-badge text-end">
                  <span>integrado con</span><br>
                  <img :src="pilot" alt="Pilot" class="pilot-logo">
                </div> -->
              </div>
              <h3>Gestión de Eventos</h3>
              <p class="card-subtitle">Inscripción y Gestión de Eventos</p>
              <p class="card-description">Administrá eventos, sesiones, inscripciones y accesos con QR desde una sola plataforma. Gestión completa de eventos, de punta a punta.</p>
              <ul class="card-bullets">
                <li>Gestión de estados de asistentes</li>
                <li>Control de acceso con QR</li>
                <li>Ideal para capacitaciones, ferias y webinars</li>
                <li>Integración directa con Pilot Solution</li>
              </ul>
              <div class="card-image">
                <div class="slider">
                  <img :src="sliderImages.module2[sliderIndex.module2]" alt="Gestión de Eventos" class="slider-image">
                  <div class="slider-dots">
                    <button 
                      v-for="(_, index) in sliderImages.module2" 
                      :key="index"
                      class="dot"
                      :class="{ active: sliderIndex.module2 === index }"
                      @click="goToSlide('module2', index)">
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Module 3 -->
          <div class="col-12 col-lg-6 col-xl-4 module-card" data-aos="fade-up" data-aos-duration="600" data-aos-delay="200" data-aos-easing="ease-in-back" data-aos-offset="0">
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon"><i class="bi bi-gift"></i></div>
                <!-- <div class="pilot-badge text-end">
                  <span>integrado con</span><br>
                  <img :src="pilot" alt="Pilot" class="pilot-logo">
                </div> -->
              </div>
              <h3>Módulo de Recompensas</h3>
              <p class="card-subtitle">Automatizá recompensas y fidelizá clientes</p>
              <p class="card-description">Definí reglas de negocio que convierten ventas en puntos y beneficios para tus clientes. Reglas automáticas que potencian tu fidelización.</p>
              <ul class="card-bullets">
                <li>Reglas automáticas por venta</li>
                <li>Sistema de puntos en tiempo real</li>
                <li>Visualización de saldo para clientes</li>
                <li>Ideal para programas de fidelización</li>
                <li>Integración directa con Pilot Solution</li>
              </ul>
              <div class="card-image">
                <div class="slider">
                  <img :src="sliderImages.module3[sliderIndex.module3]" alt="Recompensas" class="slider-image">
                  <div class="slider-dots">
                    <button 
                      v-for="(_, index) in sliderImages.module3" 
                      :key="index"
                      class="dot"
                      :class="{ active: sliderIndex.module3 === index }"
                      @click="goToSlide('module3', index)">
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- end modules -->

          <div class="col-12 col-md-6 text-center box offset-md-3">
            <p data-aos="fade-zoom-in" v-html="$t('home.text3')"></p>
          </div>

          <div class="col-12 text-center cta-section">
            <p data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0">¿Querés una prueba de Visora?</p>
            <p class="cta-email" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-offset="0" data-aos-delay="100">
              Solicitálo a <a href="mailto:team@madcoder.io">team@madcoder.io</a>
            </p>
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

import image1 from '../assets/images/formulario.jpg';
import image1b from '../assets/images/landing1.png';
import image1c from '../assets/images/landing2.png';

import image2 from '../assets/images/qr.png';
import image2b from '../assets/images/eventos1.png';
import image2c from '../assets/images/eventos2.png';

import image3 from '../assets/images/recompensa.png';
import image3b from '../assets/images/reco1.png';
import image3c from '../assets/images/reco2.png';

import video2 from '../assets/images/video3.mp4';

import pilot from '../assets/images/pilot.png';

export default {
  name: 'HomeComponent',
  data() {
    return {
      image1,
      image2,
      image3,
      pilot,
      video2,
      sliderIndex: {
        module1: 0,
        module2: 0,
        module3: 0
      },
      sliderImages: {
        module1: [image1, image1b, image1c],
        module2: [image2, image2b, image2c],
        module3: [image3, image3b, image3c]
      }
    };
  },
  methods: {
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      sessionStorage.setItem('lang', lang);
    },
    nextSlide(module) {
      const maxIndex = this.sliderImages[module].length - 1;
      this.sliderIndex[module] = this.sliderIndex[module] === maxIndex ? 0 : this.sliderIndex[module] + 1;
    },
    prevSlide(module) {
      const maxIndex = this.sliderImages[module].length - 1;
      this.sliderIndex[module] = this.sliderIndex[module] === 0 ? maxIndex : this.sliderIndex[module] - 1;
    },
    goToSlide(module, index) {
      this.sliderIndex[module] = index;
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
  text-shadow: #000 0px 0px 2px;

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
    position: relative;
    height: 100vh;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    padding: 80px;
    overflow: hidden;

    @media(max-width: 768px) {
      padding: 20px;
    }

    .background-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    h1 {
      font-size: 60px;
      margin-bottom: 60px;
      margin-top: 150px;
      max-width: 48%;
      position: relative;
      z-index: 2;

      @media(max-width: 768px) {
        font-size: 45px;
        max-width: 100%;
        margin-top: 10px;
      }
    }

    h3 {
      max-width: 60%;
      font-weight: lighter;
      position: relative;
      z-index: 2;

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

  /* Module Cards Styles */
  .modules-section {
    margin-bottom: 100px;
    text-align: center;
    padding: 0 40px;

    @media(max-width: 768px) {
      padding: 0 20px;
      margin-bottom: 60px;
    }

    h2 {
      font-size: 48px;
      margin-bottom: 20px;
      font-weight: 600;

      @media(max-width: 768px) {
        font-size: 32px;
      }
    }

    .modules-subtitle {
      font-size: 20px;
      color: rgba(248, 249, 250, 0.6);
      margin-bottom: 0;

      @media(max-width: 768px) {
        font-size: 16px;
      }
    }
  }

  .module-card {
    margin-bottom: 40px;
    padding: 0 20px;

    @media(max-width: 768px) {
      padding: 0 20px;
      margin-bottom: 30px;
    }

    .card-content {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px 30px;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;

      @media(max-width: 768px) {
        padding: 30px 20px;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #3939ff, transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        border-color: rgba(57, 57, 255, 0.3);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
        box-shadow: 0 8px 32px rgba(57, 57, 255, 0.1);
        transform: translateY(-8px);

        &::before {
          opacity: 1;
        }
      }

      .card-icon {
        font-size: 48px;
        margin-bottom: 20px;
        display: block;

        i {
          font-size: 48px;
          color: #ffffff;
          // text-shadow: 
          //   -1.5px -1.5px 0 rgba(255, 255, 255, 0.3),
          //   1.5px -1.5px 0 rgba(255, 255, 255, 0.3),
          //   -1.5px 1.5px 0 rgba(255, 255, 255, 0.3),
          //   1.5px 1.5px 0 rgba(255, 255, 255, 0.3),
          //   -2px 0 0 rgba(255, 255, 255, 0.3),
          //   2px 0 0 rgba(255, 255, 255, 0.3),
          //   0 -2px 0 rgba(255, 255, 255, 0.3),
          //   0 2px 0 rgba(255, 255, 255, 0.3);
          // filter: contrast(1.2);
        }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        gap: 16px;
      }

      h3 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 10px;
        color: #f8f9fa;

        @media(max-width: 768px) {
          font-size: 20px;
        }
      }

      .card-subtitle {
        font-size: 14px;
        color: #3939ff;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 15px;
        display: block;
      }

      .card-description {
        font-size: 16px;
        line-height: 24px;
        color: rgba(248, 249, 250, 0.8);
        margin-bottom: 25px;
        flex-grow: 1;

        @media(max-width: 768px) {
          font-size: 14px;
          line-height: 22px;
        }
      }

      .card-bullets {
        list-style: none;
        padding: 0;
        margin: 0 0 30px 0;

        li {
          font-size: 14px;
          color: rgba(248, 249, 250, 0.7);
          padding-left: 24px;
          margin-bottom: 10px;
          position: relative;
          line-height: 20px;

          &::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #3939ff;
            font-weight: bold;
            font-size: 16px;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .card-image {
        border-radius: 12px;
        overflow: hidden;
        margin-top: auto;
        position: relative;

        .slider {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;

          .slider-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            display: block;
            transition: opacity 0.6s ease;
          }

          .slider-dots {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 10;
            background: rgba(0, 0, 0, 0.4);
            padding: 12px 20px;
            border-radius: 20px;
            backdrop-filter: blur(8px);

            .dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.6);
              border: none;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

              &:hover {
                background: rgba(255, 255, 255, 0.9);
              }

              &.active {
                background: #3939ff;
                width: 28px;
                border-radius: 5px;
                box-shadow: 0 2px 8px rgba(57, 57, 255, 0.6);
              }
            }
          }
        }

        .pilot-badge {
          position: static;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;

          span {
            font-size: 11px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.8);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .pilot-logo {
            width: 50px;
            height: auto;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .pilot-logo {
    max-width: 60px;
  }

  /* CTA Section */
  .cta-section {
    margin-top: 80px;
    margin-bottom: 100px;
    padding: 0 40px;

    @media(max-width: 768px) {
      margin-top: 60px;
      margin-bottom: 60px;
      padding: 0 20px;
    }

    p {
      margin-bottom: 15px;
      font-size: 24px;
      font-weight: 600;
      color: #f8f9fa;

      @media(max-width: 768px) {
        font-size: 18px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .cta-email {
      font-size: 18px;
      font-weight: 500;
      color: rgba(248, 249, 250, 0.8);

      @media(max-width: 768px) {
        font-size: 16px;
      }

      a {
        color: #3939ff;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
          color: #5555ff;
          text-decoration: underline;
        }
      }
    }
  }

}
</style>