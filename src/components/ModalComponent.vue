<template>
  <div>
    <div :id="modalId" class="modal fade" tabindex="-1" aria-labelledby="modalLabel" >
      <div class="modal-dialog" :class="class">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">{{ modalTitle }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
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
      modalInstance: null
    };
  },
  methods: {
    openModal() {
      this.$nextTick(() => {
        const modalEl = document.getElementById(this.modalId);
        if (modalEl) {
          this.modalInstance = new Modal(modalEl, {
            backdrop: 'static', // Evita el cierre al hacer clic fuera del modal
            keyboard: false     // Evita el cierre al presionar "Esc"
          });
          this.modalInstance.show();
        } else {
          console.error('No se encontró el elemento del modal con el ID:', this.modalId);
        }
      });
    },
    closeModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
        this.$emit('modalClosed');
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
  
</style>