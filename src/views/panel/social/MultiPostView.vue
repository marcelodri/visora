<template>
  <div class="container-fluid mt-4 page">
    <h2>Nueva Publicación</h2>
    <hr><br>

    <div class="container-fluid">
      <div class="row">
        
        <!-- Columna izquierda: formulario -->
        <div class="col-12 col-md-4 px-0">
          <div class="card">
            <div class="card-body">
              <!-- Texto -->
              <div class="mb-3">
                <label class="form-label">Mensaje</label>
                <textarea v-model="formData.message" class="form-control" rows="4"></textarea>
              </div>

              <!-- Imagen -->
              <div class="mb-3">
                <label class="form-label">Imagen <span v-if="formData.platforms.instagram" class="text-danger">*</span></label>
                <input 
                  type="file" 
                  class="form-control" 
                  accept="image/*" 
                  @change="onImageUpload"
                >
                <small v-if="formData.platforms.instagram" class="text-muted">
                  <i class="bi bi-info-circle"></i> La imagen es obligatoria para Instagram
                </small>
              </div>

              <!-- Link -->
              <div class="mb-3">
                <label class="form-label">Link (opcional)</label>
                <input 
                  type="text" 
                  v-model="formData.link" 
                  class="form-control" 
                  placeholder="https://"
                  @input="formData.image = ''"
                >
              </div>

              <!-- Plataformas -->
              <div class="mb-3">
                <label class="form-label">Publicar en:</label>
                <div class="d-flex gap-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="formData.platforms.facebook"
                      id="platformFB"
                    >
                    <label class="form-check-label" for="platformFB">
                      <i class="bi bi-facebook text-primary"></i> Facebook
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="formData.platforms.instagram"
                      id="platformIG"
                    >
                    <label class="form-check-label" for="platformIG">
                      <i class="bi bi-instagram text-danger"></i> Instagram
                    </label>
                  </div>
                </div>
              </div>

              <!-- Opción de programar -->
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    v-model="formData.isScheduled"
                    id="scheduleCheck"
                  >
                  <label class="form-check-label" for="scheduleCheck">
                    Programar publicación
                  </label>
                </div>
              </div>

              <!-- Configuración de programación -->
              <div v-if="formData.isScheduled" class="mb-3">
                <h6 class="mt-5 mb-5">
                  <i class="bi bi-clock"></i> Configuración de programación
                </h6>
                    
                <!-- Frecuencia -->
                <div class="mb-3">
                  <label class="form-label">Frecuencia</label>
                  <select v-model="formData.schedule.frequency" class="form-select">
                    <option value="daily">Todos los días</option>
                    <option value="weekly">Semanal</option>
                    <option value="once">Una vez</option>
                  </select>
                </div>

                <!-- Horario -->
                <div class="mb-3">
                  <label class="form-label">Horario</label>
                  <input 
                    type="time" 
                    v-model="formData.schedule.time" 
                    class="form-control"
                  >
                </div>

                <!-- Días de la semana (solo semanal) -->
                <div v-if="formData.schedule.frequency === 'weekly'" class="mb-3">
                  <label class="form-label">Días de la semana</label>
                  <div class="row">
                    <div class="col-4" v-for="day in daysOfWeek" :key="day.value">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :value="day.value"
                          v-model="formData.schedule.daysOfWeek"
                          :id="'day-' + day.value"
                        >
                        <label class="form-check-label" :for="'day-' + day.value">
                          {{ day.label }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fecha específica (una vez) -->
                <div v-if="formData.schedule.frequency === 'once'" class="mb-3">
                  <label class="form-label">Fecha</label>
                  <input 
                    type="date" 
                    v-model="formData.schedule.date" 
                    class="form-control"
                    :min="today"
                  >
                </div>

                <!-- Fecha inicio (daily/weekly) -->
                <div v-if="formData.schedule.frequency !== 'once'" class="mb-3">
                  <label class="form-label">Fecha de inicio</label>
                  <input 
                    type="date" 
                    v-model="formData.schedule.startDate" 
                    class="form-control"
                    :min="today"
                  >
                </div>

                <!-- Fecha fin (daily/weekly opcional) -->
                <div v-if="formData.schedule.frequency !== 'once'" class="mb-3">
                  <label class="form-label">Fecha de fin (opcional)</label>
                  <input 
                    type="date" 
                    v-model="formData.schedule.endDate" 
                    class="form-control"
                    :min="formData.schedule.startDate || today"
                  >
                </div>
              </div>
            </div>
          </div> 
        </div>

        <!-- Columna derecha: vistas previas -->
        <div class="col-12 col-md-7 offset-md-1 mt-5 mt-md-0">
          <div class="row">
            <!-- Vista previa Facebook -->
            <div v-if="formData.platforms.facebook" :class="formData.platforms.instagram ? 'col-12 col-lg-6 mb-4' : 'col-12'">
              <h6 class="mb-3"><i class="bi bi-facebook text-primary"></i> Vista previa Facebook</h6>
              <div class="card shadow-md border-0">
                <div class="card-body p-3">
                  <div class="d-flex align-items-center mb-2">
                    <img width="30px" src="@/assets/images/logo_min.png" class="rounded-circle me-2" alt="Logo" />
                    <div style="line-height: 16px;">
                      <strong>Madcoder.io</strong><br>
                      <small class="text-muted">
                        {{ formData.isScheduled ? getSchedulePreview() : 'Publicado por ti · Ahora' }}
                      </small>
                    </div>
                  </div>

                  <!-- Mensaje -->
                  <p v-if="formData.message" class="mb-2">{{ formData.message }}</p>
                  <p v-else class="text-muted fst-italic mb-2">Tu mensaje aparecerá aquí...</p>

                  <!-- Imagen si hay -->
                  <div v-if="formData.image" class="mt-2">
                    <img :src="formData.image" class="img-fluid rounded" alt="Vista previa imagen">
                  </div>

                  <!-- Link si no hay imagen -->
                  <div v-else-if="formData.link" class="mt-2">
                    <a :href="formData.link" target="_blank" class="small">{{ formData.link }}</a>
                  </div>

                  <!-- Badge de programación -->
                  <div v-if="formData.isScheduled && isValidSchedule()" class="mt-2">
                    <span class="badge bg-info">
                      <i class="bi bi-clock"></i> Programada
                    </span>
                  </div>
                </div>
                <div class="card-footer border-none bg-white">
                  <div class="d-flex justify-content-around">
                    <p class="text-grey mb-0 small"><i class="bi bi-hand-thumbs-up"></i> Me gusta</p>
                    <p class="text-grey mb-0 small"><i class="bi bi-chat"></i> Comentar</p>
                    <p class="text-grey mb-0 small"><span class="forward"><i class="bi bi-reply"></i></span> Compartir</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vista previa Instagram -->
            <div v-if="formData.platforms.instagram" :class="formData.platforms.facebook ? 'col-12 col-lg-6 mb-4' : 'col-12'">
              <h6 class="mb-3"><i class="bi bi-instagram text-danger"></i> Vista previa Instagram</h6>
              <div class="card shadow-md border-0" style="max-width: 400px;">
                <!-- Header estilo IG -->
                <div class="card-header bg-white border-0 p-2">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <img width="32px" src="@/assets/images/logo_min.png" class="rounded-circle me-2" alt="Logo" />
                      <strong style="font-size: 14px;">madcoder.io</strong>
                    </div>
                    <i class="bi bi-three-dots"></i>
                  </div>
                </div>

                <!-- Imagen (obligatoria en IG) -->
                <div class="ig-image-container">
                  <img 
                    v-if="formData.image" 
                    :src="formData.image" 
                    class="img-fluid w-100" 
                    alt="Vista previa Instagram"
                    style="aspect-ratio: 1/1; object-fit: cover;"
                  >
                  <div v-else class="bg-light d-flex align-items-center justify-content-center text-muted" style="aspect-ratio: 1/1;">
                    <div class="text-center">
                      <i class="bi bi-image" style="font-size: 48px;"></i>
                      <p class="mt-2 small">Agrega una imagen</p>
                    </div>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between mb-2">
                    <div class="d-flex gap-3">
                      <i class="bi bi-heart" style="font-size: 24px;"></i>
                      <i class="bi bi-chat" style="font-size: 24px;"></i>
                      <i class="bi bi-send" style="font-size: 24px;"></i>
                    </div>
                    <i class="bi bi-bookmark" style="font-size: 24px;"></i>
                  </div>

                  <!-- Caption -->
                  <div v-if="formData.message" style="font-size: 14px;">
                    <strong>madcoder.io</strong> {{ formData.message }}
                  </div>
                  <div v-else class="text-muted fst-italic" style="font-size: 14px;">
                    Tu mensaje aparecerá aquí...
                  </div>

                  <!-- Link (si hay) -->
                  <div v-if="formData.link" class="mt-2">
                    <a :href="formData.link" target="_blank" class="small text-primary">
                      🔗 {{ formData.link.substring(0, 40) }}{{ formData.link.length > 40 ? '...' : '' }}
                    </a>
                  </div>

                  <!-- Badge de programación -->
                  <div v-if="formData.isScheduled && isValidSchedule()" class="mt-2">
                    <span class="badge bg-info">
                      <i class="bi bi-clock"></i> Programada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen de programación -->
          <div v-if="formData.isScheduled && isValidSchedule()" class="card mt-3 border-info">
            <div class="card-body">
              <h6 class="card-title text-info">
                <i class="bi bi-info-circle"></i> Resumen de programación
              </h6>
              <p class="card-text small mb-0">{{ getScheduleSummary() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="d-flex gap-2 mt-5">
      <button type="button" class="btn" @click="saveForm" :disabled="!isFormValid()">
        <i class="bi bi-floppy"></i> {{ formData.isScheduled ? 'Programar' : 'Publicar' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="resetForm">
        <i class="bi bi-x-circle"></i> Cancelar
      </button>
    </div>

    <!-- Toast -->
    <ToastComponent
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
      :show.sync="showToastFlag"
      ref="toastComponent"
    />

    <!-- Loading -->
    <LoadingDots :isLoading="isLoading" />
  </div>
</template>

<script>
import { ref, computed } from "vue";
import ToastComponent from "@/components/ToastComponent.vue";
import FacebookMuro from "@/components/FacebookMuro.vue";

export default {
  components: { ToastComponent, FacebookMuro },
  setup() {
    const formData = ref(getEmptyForm());

    const isLoading = ref(false);
    const toastTitle = ref("");
    const toastMessage = ref("");
    const isSuccess = ref(true);
    const showToastFlag = ref(false);
    const toastComponent = ref(null);
    let token = null;

    const daysOfWeek = [
      { value: 1, label: 'Lunes' },
      { value: 2, label: 'Martes' },
      { value: 3, label: 'Miércoles' },
      { value: 4, label: 'Jueves' },
      { value: 5, label: 'Viernes' },
      { value: 6, label: 'Sábado' },
      { value: 0, label: 'Domingo' }
    ];

    const today = computed(() => new Date().toISOString().split('T')[0]);

    const triggerToast = (title, message, success) => {
      toastTitle.value = title;
      toastMessage.value = message;
      isSuccess.value = success;
      toastComponent.value.showToas();
    };

    const isValidSchedule = () => {
      if (!formData.value.isScheduled) return true;
      
      const schedule = formData.value.schedule;
      if (!schedule.time) return false;
      
      if (schedule.frequency === 'once') return !!schedule.date;
      if (schedule.frequency === 'weekly') return schedule.daysOfWeek.length > 0 && !!schedule.startDate;
      if (schedule.frequency === 'daily') return !!schedule.startDate;
      
      return false;
    };

    const isFormValid = () => {
      const hasAtLeastOnePlatform = formData.value.platforms.facebook || formData.value.platforms.instagram;
      const hasImageForIG = !formData.value.platforms.instagram || formData.value.image;
      return formData.value.message && hasAtLeastOnePlatform && hasImageForIG && isValidSchedule();
    };

    const getSchedulePreview = () => {
      if (!isValidSchedule()) return 'Configurar programación';
      const s = formData.value.schedule;
      if (s.frequency === 'once') return `Programado para ${s.date} a las ${s.time}`;
      if (s.frequency === 'daily') return `Programado todos los días a las ${s.time}`;
      if (s.frequency === 'weekly') return `Programado ${s.daysOfWeek.join(', ')} a las ${s.time}`;
      return 'Publicación programada';
    };

    const getScheduleSummary = () => {
      const s = formData.value.schedule;
      if (s.frequency === 'once') return `Se enviará el ${s.date} a las ${s.time}.`;
      if (s.frequency === 'daily') return `Se enviará todos los días a las ${s.time}, desde ${s.startDate} ${s.endDate ? 'hasta ' + s.endDate : ''}.`;
      if (s.frequency === 'weekly') return `Se enviará los días ${s.daysOfWeek.join(', ')} a las ${s.time}, desde ${s.startDate} ${s.endDate ? 'hasta ' + s.endDate : ''}.`;
      return '';
    };

    async function saveForm() {
      try {
        isLoading.value = true;

        token = sessionStorage.getItem("token");
        if (!token) throw new Error("Token no encontrado");

        // Generar la programación en formato array
        const scheduleArray = buildScheduleArray(formData.value.schedule);

        // Construir payload final
        const payload = {
          message: formData.value.message,
          link: formData.value.link,
          image: formData.value.image,
          platforms: {
            facebook: formData.value.platforms.facebook,
            instagram: formData.value.platforms.instagram
          },
          isScheduled: formData.value.isScheduled,
          schedule: scheduleArray,
          action: "schedule"
        };

        const response = await fetch("https://stage.powerflows.pilotcrm.io/api/e45236e2-83c3-47a5-b0ea-39377418e892", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Error en la solicitud: " + response.statusText);
        }

        setTimeout(() => {
          triggerToast("¡Éxito!", "Publicación guardada", true);
        }, 100)
        resetForm();

      } catch (e) {
        setTimeout(() => {
          triggerToast("Error", e.message, false);
        }, 100)
      } finally {
        isLoading.value = false;
      }
    }

    const dayNames = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday"
    };

    function buildScheduleArray(schedule) {
      const arr = [];

      if (schedule.frequency === "once") {
        arr.push({
          frequency: "once",
          time: schedule.time.replace(":", ""),
          startDate: schedule.date,
          endDate: schedule.date,
          dayOfWeek: getDayName(schedule.date)
        });
      }

      if (schedule.frequency === "daily") {
        Object.keys(dayNames).forEach(key => {
          arr.push({
            frequency: "daily",
            time: schedule.time.replace(":", ""),
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            dayOfWeek: dayNames[key]
          });
        });
      }

      if (schedule.frequency === "weekly") {
        schedule.daysOfWeek.forEach(day => {
          arr.push({
            frequency: "weekly",
            time: schedule.time.replace(":", ""),
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            dayOfWeek: dayNames[day]
          });
        });
      }

      return arr;
    }

    function getDayName(dateStr) {
      const date = new Date(dateStr);
      const argentinaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      return days[argentinaDate.getDay()];
    }

    function resetForm() {
      formData.value = getEmptyForm();
    }

    function getEmptyForm() {
      return { 
        message: "", 
        link: "",
        image: "",
        platforms: {
          facebook: true,
          instagram: false
        },
        isScheduled: false,
        schedule: {
          frequency: 'now',
          time: '',
          date: '',
          startDate: '',
          endDate: '',
          daysOfWeek: []
        }
      };
    }

    function onImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          formData.value.image = reader.result;
          formData.value.link = "";
        };
        reader.readAsDataURL(file);
      }
    }

    return {
      formData,
      isLoading,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      toastComponent,
      daysOfWeek,
      today,
      saveForm,
      resetForm,
      isValidSchedule,
      isFormValid,
      getSchedulePreview,
      getScheduleSummary,
      onImageUpload
    };
  }
};
</script>

<style scoped>
.forward i {
  display: inline-block;
  transform: scaleX(-1);
}
</style>