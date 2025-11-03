<template>
    <div>
      <!-- Este botón es solo para demostración, puedes eliminarlo -->
      <button @click="showAlertPopup('success', 'Operación exitosa!')">Mostrar Éxito</button>
      <button @click="showAlertPopup('error', 'Ocurrió un error!')">Mostrar Error</button>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2'
  
  export default {
    name: 'AlertPopup',
    props: {
      type: {
        type: String,
        required: true,
        validator: (value) => ['success', 'error'].includes(value) // Solo permite 'success' o 'error'
      },
      message: {
        type: String,
        required: true
      }
    },
    methods: {
      showAlertPopup(type, message) {
        Swal.fire({
          title: type === 'success' ? '¡Éxito!' : '¡Error!',
          text: message,
          icon: type,
          confirmButtonText: 'Aceptar'
        })
      }
    },
    mounted() {
      // Muestra la alerta automáticamente cuando el componente se monta
      this.showAlertPopup(this.type, this.message)
    }
  }
  </script>
  