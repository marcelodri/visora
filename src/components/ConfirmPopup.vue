<template>
    <div>
      <!-- Puedes usar este botón para activar el popup de confirmación -->
      <!-- <button @click="showConfirmPopup">Mostrar Confirmación</button> -->
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2'
  
  export default {
    name: 'ConfirmPopup',
    props: {
      question: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: false
      },
      showConfirmButton: {
        type: Boolean,
        required: false,
        default: true
      },
      showCancelButton: {
        type: Boolean,
        required: false,
        default: true
      },
      cancelButtonText: {
        type: String,
        required: false,
        default: "No"
      },
      icon: {
        type: String,
        required: false,
        default: "warning"
      },

    },
    methods: {
      async showConfirmPopup() {
        const result = await Swal.fire({
          title: this.title,
          text: this.question,
          icon: this.icon,
          showConfirmButton: this.showConfirmButton,
          showCancelButton: this.showCancelButton,
          confirmButtonText: 'Sí',
          cancelButtonText: this.cancelButtonText
        })
  
        if (result.isConfirmed) {
          // El usuario presionó "Sí"
          this.$emit('response', true)
        } else {
          // El usuario presionó "No" o cerró el popup
          this.$emit('response', false)
        }
      }
    }
  }
  </script>
  