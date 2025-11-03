<template>
    <div>
      <label for="connectionType">Seleccione el tipo de conexión:</label>
      <select v-model="selectedType" @change="emitSelection" class="form-select">
        <option value="">-- Seleccione un tipo de conexión --</option>
        <option value="mysql">MySQL</option>
        <!-- Otras opciones para otros tipos de conexión -->
      </select>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        selectedType: '' // Inicialmente no se selecciona nada
      };
    },
    methods: {
      emitSelection() {
        this.$emit('typeSelected', this.selectedType);
      }
    }
  };
  </script>
  