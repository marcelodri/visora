<template>
    <div v-if="isLoading" id="loading">
        <div class="loading-dots">
        <span class="dot" :class="{ active: activeDot === 1 }"></span>
        <span class="dot" :class="{ active: activeDot === 2 }"></span>
        <span class="dot" :class="{ active: activeDot === 3 }"></span>
        </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoadingDots',
    props: {
      isLoading: {
        type: Boolean,
        required: true,
        default: false // Por defecto, el componente está oculto
      }
    },
    data() {
      return {
        activeDot: 1 // Controla cuál de los puntos está "activo"
      };
    },
    mounted() {
      this.startLoadingAnimation();
    },
    methods: {
      startLoadingAnimation() {
        setInterval(() => {
          this.activeDot = (this.activeDot % 3) + 1; // Cambia el punto activo de 1 a 3
        }, 300); // Cambia de punto cada 300ms
      }
    }
  }
  </script>
  
  <style scoped>
  #loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .loading-dots {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .dot {
    width: 12px;
    height: 12px;
    margin: 0 5px;
    border-radius: 50%;
    background-color: #ccc;
    opacity: 0.3;
    transition: opacity 0.3s ease-in-out;
  }
  
  .dot.active {
    opacity: 1;
    background-color: #3939ff; /* Color del punto activo */
  }
  </style>
  