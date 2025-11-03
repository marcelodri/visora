<template>
    <div class="container-fluid mt-4 position-relative">
      <h2>Busca en tu base de datos con lenguaje natural</h2>
      <hr><br>
      <div id="result" class="container-fluid">
        <div class="row">

            <!-- Iteramos sobre los resultados -->
            <div v-for="product in products" :key="product.id" class="col-6 p-2">
                <div class="product-card">
                    <div class="d-flex">
                        <img :src="product.image" alt="">
                        <div class="px-4">
                            <h3>{{ product.brand }}</h3>
                            <p>{{ product.model }} año {{ product.year }}</p>
                            <p>Color: {{ product.color }}</p>
                            <p>Motor: {{ product.engine }}</p>
                        </div>
                        <div class="ml-4">
                            <p><strong>Precio:</strong> {{ product.price }}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
      <div class="box-input">
        <!-- Input que escucha Enter -->
        <input 
          name="searchAi" 
          id="input_searchAi" 
          v-model="searchQuery" 
          @keyup.enter="fetchResults" 
          placeholder="Escribe tu búsqueda y presiona Enter"
        />
      </div>
      <LoadingDots :isLoading="isLoading" />
    </div>

    <!-- Alertas -->
    <ToastComponent 
      :title="toastTitle" 
      :message="toastMessage" 
      :isSuccess="isSuccess" 
      :show.sync="showToastFlag"
      ref="toastComponent"
    />

  </template>
  
  <script>
  import axios from 'axios';
  import ToastComponent from '@/components/ToastComponent.vue'


  // --- Toast refs ---
  const toastTitle = ref("")
  const toastMessage = ref("")
  const isSuccess = ref(true)
  const showToastFlag = ref(false)
  const toastComponent = ref(null)


  export default {
    components: {
      toastComponent
    },
    data() {
      return {
        isLoading: false,
        searchQuery: '', // Valor del input
        products: [],    // Resultados de la API
      };
    },
    methods: {
      async fetchResults() {
        if (!this.searchQuery.trim()) return; // No hacer nada si el input está vacío
  
        this.isLoading = true;
        try {
          // Reemplaza con la URL de tu API
          const response = await axios.post('https://api.tu-servidor.com/buscar', {
            query: this.searchQuery,
          });
  
          // Suponiendo que la API devuelve un array de productos
          //this.products = response.data.products || [];

          
        } catch (error) {
          console.error('Error al buscar:', error);
          this.triggerToast("Error", err.message, false)

        } finally {
          this.isLoading = false;
        }

        this.products = [
  {
    "image": "https://media.ed.edmunds-media.com/toyota/corolla/2022/oem/2022_toyota_corolla_sedan_le_fq_oem_1_1600.jpg",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2022,
    "color": "Blanco",
    "engine": "2.0L I4",
    "price": 22000
  },
  {
    "image": "https://cars.usnews.com/static/images/Auto/izmo/i159614579/2022_honda_civic_angularfront.jpg",
    "brand": "Honda",
    "model": "Civic",
    "year": 2022,
    "color": "Azul",
    "engine": "1.5L Turbo",
    "price": 23000
  },
  {
    "image": "https://cdn.motor1.com/images/mgl/nkMPx/s1/2022-chevrolet-malibu.jpg",
    "brand": "Chevrolet",
    "model": "Malibu",
    "year": 2022,
    "color": "Negro",
    "engine": "1.5L Turbo",
    "price": 24000
  },
  {
    "image": "https://media.ed.edmunds-media.com/nissan/sentra/2022/oem/2022_nissan_sentra_sedan_sr_fq_oem_3_815.jpg",
    "brand": "Nissan",
    "model": "Sentra",
    "year": 2022,
    "color": "Rojo",
    "engine": "2.0L I4",
    "price": 21000
  },
  {
    "image": "https://media.ed.edmunds-media.com/toyota/corolla/2022/oem/2022_toyota_corolla_sedan_le_fq_oem_1_1600.jpg",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2022,
    "color": "Blanco",
    "engine": "2.0L I4",
    "price": 22000
  },
  {
    "image": "https://cars.usnews.com/static/images/Auto/izmo/i159614579/2022_honda_civic_angularfront.jpg",
    "brand": "Honda",
    "model": "Civic",
    "year": 2022,
    "color": "Azul",
    "engine": "1.5L Turbo",
    "price": 23000
  },
  {
    "image": "https://cdn.motor1.com/images/mgl/nkMPx/s1/2022-chevrolet-malibu.jpg",
    "brand": "Chevrolet",
    "model": "Malibu",
    "year": 2022,
    "color": "Negro",
    "engine": "1.5L Turbo",
    "price": 24000
  },
  {
    "image": "https://media.ed.edmunds-media.com/nissan/sentra/2022/oem/2022_nissan_sentra_sedan_sr_fq_oem_3_815.jpg",
    "brand": "Nissan",
    "model": "Sentra",
    "year": 2022,
    "color": "Rojo",
    "engine": "2.0L I4",
    "price": 21000
  }
]


      },

      triggerToast(title, message, success = true) {
        toastTitle.value = title
        toastMessage.value = message
        isSuccess.value = success
        toastComponent.value.showToas && toastComponent.value.showToas()
      }

    },
  };
  </script>
  
  <style>
    .box-input {
      /* position: absolute;
      bottom: 0;
      left: 0;
      right: 0; */
      padding: 13px;
    }
    .box-input input {
      width: 100%;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 10px;
      height: 70px;
      border: 1px solid rgba(0, 0, 0, 0.3);
      /* background-color: #333; */
    }
    .box-input input:focus {
      border: 1px solid rgba(0, 0, 0, 0.3)!important;
      outline: none!important
      /* background-color: #333; */
    }
    .dark .box-input input {
        background-color: #333;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
    }
    #result {
      height: 50vh;
      overflow-y: auto;
      margin-top: -10px;
      border-radius: 10px
    }
    .product-card {
      background: white;
      color: black;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .dark .product-card {
        background: rgba(255, 255, 255, 0.1);
        color: inherit
    }
    .dark #result {
        background: rgba(0, 0, 0, 0.2);
    }
    .product-card img {
        width: 100px;
        height: auto;
        object-fit: cover;
        border-radius: 8px;
    }
    .product-card h3, .product-card p {
        margin-bottom: 0;
    }
  </style>
  