<template>
  <div>
    <div :id="modalId" class="modal fade" tabindex="-1" aria-labelledby="modalLabel" >
      <div class="modal-dialog" :class="modalDialogClass">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">{{ modalTitle }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0">
            <slot></slot>
          </div>
          <div v-if="isFooter" class="modal-footer">
            <!-- Aquí podrías agregar botones si son necesarios -->
            <button v-if="showSaveSearchButton" type="button" class="btn btn-primary" @click="saveSearch" >Guardar consulta</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';

export default {
  props: {
    modalTitle: {
      type: String,
      default: 'Modal Título'
    },
    modalId: {
      type: String,
      required: true // Aseguramos que el ID sea pasado como prop
    },
    class: {
      type: String,
      default: 'modal-sm'
    },
    dialogClass: {
      type: [String, Array, Object],
      default: ''
    },
    showSaveSearchButton: {
      type: Boolean,
      required: false // Aseguramos que el ID sea pasado como prop
    },
    isFooter: {
      type: Boolean,
      required: false // Aseguramos que el ID sea pasado como prop
    },
  },
  data() {
    return {
      modalInstance: null,
      isMobile: false
    };
  },
  computed: {
    modalDialogClass() {
      if (Array.isArray(this.dialogClass) && this.dialogClass.length) return this.dialogClass;
      if (typeof this.dialogClass === 'string' && this.dialogClass.trim()) return this.dialogClass;
      if (this.dialogClass && typeof this.dialogClass === 'object' && Object.keys(this.dialogClass).length) return this.dialogClass;
      return this.class;
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    // Escuchar el evento de cierre del modal de Bootstrap
    const modalEl = document.getElementById(this.modalId);
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', this.handleModalHidden);
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    // Limpiar el listener cuando el componente se desmonta
    const modalEl = document.getElementById(this.modalId);
    if (modalEl) {
      modalEl.removeEventListener('hidden.bs.modal', this.handleModalHidden);
    }
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    openModal() {
      this.$nextTick(() => {
        const modalEl = document.getElementById(this.modalId);
        if (modalEl) {
          const options = {
            backdrop: 'static', // Evita el cierre al hacer clic fuera del modal
            keyboard: false     // Evita el cierre al presionar "Esc"
          };
          this.modalInstance = Modal.getOrCreateInstance
            ? Modal.getOrCreateInstance(modalEl, options)
            : new Modal(modalEl, options);
          this.modalInstance.show();
          // Ocultar el scroll de la página solo en desktop
          if (!this.isMobile) {
            document.documentElement.style.overflow = 'hidden';
          }
        } else {
          console.error('No se encontró el elemento del modal con el ID:', this.modalId);
        }
      });
    },
    closeModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
        // Mostrar el scroll de la página nuevamente
        if (!this.isMobile) {
          document.documentElement.style.overflowY = 'auto';
        }
        this.$emit('modalClosed');
      }
    },
    handleModalHidden() {
      // Asegurar que el scroll se restaure si el modal se cierra de otra forma
      if (!this.isMobile) {
        document.documentElement.style.overflowY = 'auto';
      }
    },
    saveSearch() {
      this.$emit('saveSearch');
    }

  }
};
</script>
<style lang="scss">
  .modal-xxl {
    margin: 0;
    .modal-content {
      height: 100vh;
      width: 99vw;
      .modal-body {
        overflow: scroll;
      }
    }
  }

  .modal-fullscreen-fixed {
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    margin: 0;

    .modal-content {
      width: 100vw;
      height: 100vh;
      border: 0;
      border-radius: 0;
    }

    .modal-body {
      height: calc(100vh - 58px);
      overflow: hidden;
      background: #f8f9fa;
    }
  }
  
</style>
