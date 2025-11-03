<template>
    <div class="custom-modal" v-if="isVisible">
      <div class="custom-modal-content">
        <div class="custom-modal-header">
          <h5>{{ modalTitle }}</h5>
          <button @click="closeModal">Cerrar</button>
        </div>
        <div class="custom-modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      modalTitle: {
        type: String,
        default: 'Modal Título'
      }
    },
    data() {
      return {
        isVisible: false
      };
    },
    methods: {
      openModal() {
        this.isVisible = true;
      },
      closeModal() {
        this.isVisible = false;
      }
    }
  };
  </script>
  
  <style scoped>
  .custom-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  
  .custom-modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 300px;
    max-width: 90vw;
  }
  
  .custom-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .custom-modal-body {
    margin-top: 10px;
  }
  </style>
  