<template>
  <div class="container-fluid mt-4">
    <h2>Busca datos de un documento con IA</h2>
    <hr><br>

    <!-- Input para subir archivo PDF -->
    <div v-if="!fileUploaded" class="text-center">
      <label for="fileInput" class="btn btn-primary">
        <i class="bi bi-upload"></i> Subir Documento
      </label>
      <input
        type="file"
        id="fileInput"
        class="d-none"
        @change="handleFileUpload"
        accept=".pdf"
      />
    </div>

    <!-- Input para consultas a la API -->
    <div v-else>
      <div class="mb-3">
        <label for="queryInput" class="form-label">Ingresa tu consulta:</label>
        <input
          type="text"
          id="queryInput"
          class="form-control"
          placeholder="Escribe tu consulta aquí..."
          v-model="query"
        />
      </div>
      <button
        class="btn btn-success"
        @click="fetchApiData"
        :disabled="isLoading"
      >
        Consultar
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="result" class="mt-4 p-3 border rounded bg-light">
      <h5>Resultado:</h5>
      <p>{{ result }}</p>
    </div>

    <!-- Indicador de carga -->
    <LoadingDots :isLoading="isLoading" />

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
import axios from "axios";
import { ref } from "vue";
import ToastComponent from "@/components/ToastComponent.vue";

export default {
  components: { ToastComponent },
  setup() {
    const isLoading = ref(false);
    const fileUploaded = ref(false);
    const query = ref("");
    const result = ref(null);

    // --- Toast refs ---
    const toastTitle = ref("");
    const toastMessage = ref("");
    const isSuccess = ref(true);
    const showToastFlag = ref(false);
    const toastComponent = ref(null);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        fileUploaded.value = true;
      } else {
        triggerToast("Error", "Por favor, sube un archivo PDF válido.", false);
      }
    };

    const fetchApiData = async () => {
      if (!query.value) {
        triggerToast("Error", "Por favor, escribe una consulta.", false);
        return;
      }

      isLoading.value = true;
      result.value = null;

      try {
        const response = await axios.post("https://api.tuendpoint.com/query", {
          query: query.value,
        });
        result.value = response.data.result || "No se encontró información.";
        triggerToast("¡Éxito!", "Consulta realizada correctamente", true);
      } catch (error) {
        result.value =
          "Ocurrió un error al consultar la API. Por favor, inténtalo nuevamente.";
        triggerToast("Error", error.message, false);
      } finally {
        isLoading.value = false;
      }
    };

    const triggerToast = (title, message, success = true) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas && toastComponent.value.showToas();
    };

    return {
      isLoading,
      fileUploaded,
      query,
      result,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      toastComponent,
      handleFileUpload,
      fetchApiData,
      triggerToast,
    };
  },
};
</script>

<style scoped>
/* Personalización */
</style>
