<template>
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11">
      <div class="toast" :class="{'text-bg-success': isSuccess, 'text-bg-danger': !isSuccess}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">{{ title }}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ message }}
        </div>
      </div>
    </div>
  </template>
  
  <script>

    import { Toast } from 'bootstrap'; // Importar Modal de Bootstrap

  export default {
    props: {
      title: { type: String, required: true },
      message: { type: String, required: true },
      isSuccess: { type: Boolean, default: true },
      show: { type: Boolean, default: false },
    },
    // mounted() {
    //   const toastEl = this.$el.querySelector('.toast');
    //   const toast = new Toast(toastEl);
    //   toast.show();
    // },
    methods: {
      showToas() {
        const toastEl = this.$el.querySelector('.toast');
        const toast = new Toast(toastEl);
        toast.show();
      }
    }
  };
  </script>
  
<style>
  .toast-container {
    z-index: 10000!important;
  }
</style>