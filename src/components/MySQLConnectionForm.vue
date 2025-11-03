<template>
  <div>
    <!-- Formulario MySQL -->
    <div class="mb-3">
      <label for="hostname" class="form-label">Hostname</label>
      <input type="text" class="form-control" v-model="form.hostname" required />
    </div>
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <input type="text" class="form-control" v-model="form.username" required />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" v-model="form.password" required />
    </div>
    <div class="mb-3">
      <label for="database" class="form-label">Database</label>
      <input type="text" class="form-control" v-model="form.database" required />
    </div>
    <div class="mb-3">
      <label for="port" class="form-label">Port</label>
      <input type="text" class="form-control" v-model="form.port" required />
    </div>

    <!-- Botón de prueba de conexión -->
    <button type="button" class="btn btn-success" @click="testConnection">Probar Conexión</button>

    <!-- Botón de guardar habilitado/deshabilitado según el estado de la conexión -->
    <button 
      type="button" 
      class="btn btn-primary" 
      @click="submitForm" 
      :disabled="!connectionSuccessful"
    >
      Guardar
    </button>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  inject: ['showToast'],
  data() {
    return {
      form: {
        hostname: '',
        username: '',
        password: '',
        database: '',
        port: ''
      },
      connectionSuccessful: false // Nueva propiedad para controlar el estado de la conexión
    };
  },
  methods: {
    async testConnection() {
      const payload = {
        hostname: this.form.hostname,
        username: this.form.username,
        password: this.form.password,
        database: this.form.database,
        port: this.form.port
      };

      try {
        const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/test-mysql-connection', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.status === 200) {
          this.showToast('Conexión exitosa', true);
          this.connectionSuccessful = true; // Habilitar el botón de guardar
        } else {
          this.showToast('Error en la conexión', false);
          this.connectionSuccessful = false; // Deshabilitar el botón de guardar
        }
      } catch (error) {
        this.showToast('Error en la conexión', false);
        this.connectionSuccessful = false; // Deshabilitar el botón de guardar en caso de error
        console.error(error);
      }
    },
    submitForm() {
      // Llama a la función que envía los datos del formulario al padre
      this.$emit('submit', this.form);
    }
  }
};

</script>