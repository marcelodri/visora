<template>
  <div class="container mt-4" style="max-width: 600px;">
    <div v-for="(post, i) in posts" :key="i" class="card shadow-sm mb-4 border-0">

      <!-- Header -->
      <div class="card-body pb-2">
        <div class="d-flex align-items-center mb-2">
          <img 
            src="@/assets/images/logo_min.png" 
            class="rounded-circle me-2" 
            width="40" height="40" 
            alt="Logo"
          />
          <div>
            <strong>Madcoder.io</strong><br>
            <small class="text-muted">Publicado · {{ formatDate(post.created_time) }}</small>
          </div>
          <div class="ms-auto">
            <i class="bi bi-three-dots"></i>
          </div>
        </div>

        <!-- Texto -->
        <p v-if="post.message" class="mb-2">{{ post.message }}</p>
      </div>

      <!-- Imagen -->
      <div v-if="post.full_picture" class="text-center">
        <img 
          :src="post.full_picture" 
          class="img-fluid fade" 
          :class="{ loaded: post.imageLoaded }"
          @load="post.imageLoaded = true"
          style="max-height: 400px; object-fit: cover; width: 100%;"
          alt="imagen post"
        />
      </div>

      <!-- Footer con link preview -->
      <!-- <div v-if="post.permalink_url" class="px-3 py-2 border-top">
        <a :href="post.permalink_url" target="_blank" class="text-decoration-none text-dark">
          <div class="border rounded p-2">
            <small class="text-muted">{{ new URL(post.permalink_url).hostname }}</small>
            <div><strong>{{ post.title || "Título de la publicación" }}</strong></div>
            <div class="text-muted">{{ post.description || "Descripción del enlace compartido." }}</div>
          </div>
        </a>
      </div>
 -->
      <!-- Reacciones -->
      <div class="px-3 py-2 d-flex justify-content-between align-items-center border-top">
        <div class="d-flex gap-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-hand-thumbs-up me-1"></i> {{ post.likes || 0 }}
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-chat me-1"></i> {{ post.comments || 0 }}
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-share me-1"></i> {{ post.shares || 0 }}
          </div>
        </div>
      </div>

    </div>
  </div>
  
  <br><br>

</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const posts = ref([]);
    let token = null
    const isLoading = ref(false);
    
    isLoading.value = true;

    const fetchPosts = async () => {

      token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado");

      const payload = {action: "fb-muro"};

      const response = await fetch("https://stage.powerflows.pilotcrm.io/api/e45236e2-83c3-47a5-b0ea-39377418e892", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      console.log('data', data)
      posts.value = data.data.map(p => ({
        ...p,
        likes: Math.floor(Math.random() * 1000), // Simulación
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        imageLoaded: false // 👈 nuevo campo
      }));

      isLoading.value = false;
    };
    

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    };

    onMounted(fetchPosts);

    return { posts, formatDate };
  }
};
</script>
<style scoped>
.card {
  border-radius: 12px;
  max-width: 700px!important;
  margin: auto;
  margin-bottom: 30px;
}
img.fade {
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}
img.fade.loaded {
  opacity: 1;
}
</style>