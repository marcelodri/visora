<template>
  <div class="container-fluid mt-4 page">
    <h2>Programaciones</h2>
    <hr><br>

    <!-- Buscador -->
    <div class="mb-5">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Buscar publicaciones..." 
        v-model="searchText"
      />
    </div>

    <!-- Loading -->
    <LoadingDots :isLoading="isLoading" />

    <br>
  
    <!-- Listado -->
    <div v-if="!isLoading && filteredPosts.length > 0" class="d-flex flex-column gap-3">
      <div v-for="(post, index) in filteredPosts" :key="index" class="card shadow-sm border-0">
        <div class="card-body p-3">
          <div class="container">
            <div class="row">

              <div class="col-11">
                <div class="d-flex align-items-center mb-2">
                  <img width="30px" src="@/assets/images/logo_min.png" class="rounded-circle me-2" alt="Logo" />
                  <div style="line-height: 16px; margin-right: 20px;">
                    <strong>Madcoder.io</strong><br>
                    <small class="text-muted">
                      {{ post.isScheduled ? formatSchedule(post.schedule) : 'Publicado · ' + formatDate(post.createdAt) }}
                    </small><br>
                  </div>

                  <!-- Badge de programación -->
                  <div v-if="post.schedule.frequency === 'once'" class="mt-2">
                    <span class="badge bg-info">
                      <i class="bi bi-clock"></i> Una vez
                    </span>
                  </div>
                  <div v-else-if="post.schedule.frequency === 'daily'" class="mt-2">
                    <span class="badge bg-warning">
                      <i class="bi bi-clock"></i> Diario
                    </span>
                  </div>
                  <div v-else-if="post.schedule.frequency === 'weekly'" class="mt-2">
                    <span class="badge bg-primary">
                      <i class="bi bi-clock"></i> Semanal
                    </span>
                  </div>
                </div>

                <!-- Mensaje -->
                <p v-if="post.message">{{ post.message }}</p>
                <p v-else class="text-muted fst-italic">Sin mensaje...</p>

                <!-- Link -->
                <div v-if="post.link" class="mt-2">
                  <a :href="post.link" target="_blank">{{ post.link }}</a>
                </div>

                <!-- Image -->
                <div v-if="post.image" class="mt-2">
                  <img :src="post.image" alt="" style="max-height: 100px">
                </div>

                <!-- ref -->
                <small class="text-muted">
                  Ref: {{ post.ref }}
                </small>

              </div>

              <div class="col-1">
                <!-- Botón de borrar -->
                <div class="mt-3">
                  <button class="btn btn-danger btn-sm d-flex" @click="deletePost(post.id_publicacion)">
                    <i class="bi bi-trash me-1"></i> Borrar
                  </button>
                </div>
              </div>

            </div>  
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="!isLoading && filteredPosts.length === 0" class="alert alert-secondary">
      No hay publicaciones que coincidan con la búsqueda.
    </div>

    <!-- Toast -->
    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      :show.sync="showToastFlag"
      ref="toastComponent"
    />

  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import ToastComponent from "@/components/ToastComponent.vue";

export default {
  components: { ToastComponent },
  setup() {
    const posts = ref([]);
    const isLoading = ref(false);
    const searchText = ref("");
    const toastTitle = ref("");
    const toastMessage = ref("");
    const isSuccess = ref(true);
    const toastComponent = ref(null);

    // Simulación GET
    const fetchPosts = async () => {
      try {
        isLoading.value = true;

        const response = await fetch("https://hub.redooconect.com.ar/webhook/23d3265d-6db6-4156-b4fe-69e9b80a030d");
        const data = await response.json();

        posts.value = data.map((p, i) => ({
          id_publicacion: p.id_publicacion || i + 1,
          message: p.message,
          link: p.link,
          image: p.image,
          isScheduled: true,
          ref: p.ref,
          schedule: {
            frequency: JSON.parse(p.schedules)[0].frequency,
            time: JSON.parse(p.schedules)[0].time.slice(0,2) + ":" + JSON.parse(p.schedules)[0].time.slice(2,4),
            startDate: JSON.parse(p.schedules)[0].startDate
          },
          createdAt: p.created_dt
        }));
      } catch (e) {
        console.error("Error cargando publicaciones:", e);
      } finally {
        isLoading.value = false;
      }
    };

    // Simulación de borrado
    const deletePost = async (id) => {
      try {
        await fetch(`https://hub.redooconect.com.ar/webhook/c4a02d2a-3c96-4ced-a911-e63816809db3`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({id: id, method: "DELETE"})
        });

        setTimeout(() => {
          triggerToast("¡Éxito!", "Programación eliminada", true);
        }, 0)

        posts.value = posts.value.filter(post => post.id_publicacion !== id);
      } catch (err) {
        console.error(err);
        setTimeout(() => {
          triggerToast("Error", err.message, false);
        }, 0)
      }
    };

    // Filtrado por búsqueda
    const filteredPosts = computed(() => {
      if (!searchText.value) return posts.value;
      const text = searchText.value.toLowerCase();
      return posts.value.filter(post => 
        (post.message && post.message.toLowerCase().includes(text)) ||
        (post.link && post.link.toLowerCase().includes(text))
      );
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("es-ES", { 
        day: "2-digit", month: "short", year: "numeric", 
        hour: "2-digit", minute: "2-digit" 
      });
    };

    const formatSchedule = (schedule) => {
      if (!schedule) return "Programada";
      if (schedule.frequency === "once") return `Programada el ${schedule.date} a las ${schedule.time}`;
      if (schedule.frequency === "daily") return `Todos los días a las ${schedule.time}`;
      if (schedule.frequency === "weekly") return `Semanal los ${schedule.daysOfWeek?.join(", ")} a las ${schedule.time}`;
      return "Programada";
    };

    const triggerToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    };

    onMounted(fetchPosts);

    return {
      posts,
      isLoading,
      searchText,
      filteredPosts,
      formatDate,
      formatSchedule,
      deletePost,
      triggerToast,
      toastTitle,
      toastMessage,
      isSuccess,
      toastComponent
    };
  }
};
</script>
