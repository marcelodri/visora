<template >
    <div>
        <!-- Novedad con imagen y enlace -->
        <div v-if="loading">Cargando novedad...</div>
        <div v-else class="novelty-item" v-if="novelty">
            <img :src="novelty.image" alt="Novedad" class="novelty-image" />
            <h3>{{ novelty.title }}</h3>
            <p>{{ novelty.description }}</p>
            <a :href="novelty.link" target="_blank">Leer más</a>
        </div>
    </div>
</template>

<script>
export default {
    name: "NoveltyComponent",
    data() {
      return {
        novelty: null, // Almacena la novedad
        loading: true, // Estado de carga
      };
    },
    created() {
      this.fetchNovelty(); // Llamar a la función al crear el componente
    },
    methods: {
      async fetchNovelty() {
        // Simular una llamada a una API
        // Reemplaza esto con la URL de tu API
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        //console.log('fetchNovelty', data)
        // Ejemplo de estructura de novedad
        this.novelty = {
          title: data.title,
          description: data.body,
          image: 'https://via.placeholder.com/150', // Reemplaza con tu URL de imagen
          link: 'https://example.com/posts/' + data.id, // Enlace a la novedad
        };
        
        this.loading = false; // Cambia el estado de carga
      },
    },
  };
  </script>

<style scoped>
    .novelty-item {
        border: 1px solid #ddd;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
    }

    .novelty-image {
        max-width: 100%; /* Asegura que la imagen no se desborde */
        height: auto;
    }
</style>
