<template>
  <div class="container-fluid mt-4">
    <h2>Listado de Conexciones</h2>
    <button class="btn btn-primary" @click="openCreateModal">Crear Nueva Conexión</button>
    <button class="btn btn-danger" :disabled="selectedOrigins.length === 0" @click="deleteSelectedOrigins">
      Borrar Seleccionados
    </button>

    <DataTableComponent
      :data="origins"
      :columns="columns"
      :actions="tableActions"
      :items-per-page="10"
      @update:selectedRows="updateSelectedOrigins"
    />

    <ModalComponent ref="createModal" :modalTitle="modalTitle">
      <ConnectionTypeSelector @typeSelected="handleTypeSelection" />
      <component
        v-if="currentFormComponent"
        :is="currentFormComponent"
        @submit="handleFormSubmit"
      />
    </ModalComponent>

  </div>
</template>

<script>
import ModalComponent from '@/components/ModalComponent.vue';
import ConnectionTypeSelector from '@/components/ConnectionTypeSelector.vue';
import MySQLConnectionForm from '@/components/MySQLConnectionForm.vue';
import DataTableComponent from '@/components/DataTableComponent.vue';

export default {
  components: {
    DataTableComponent,
    ModalComponent,
    ConnectionTypeSelector
  },
  data() {
    return {
      modalTitle: 'Crear Nueva Conexión',
      currentFormComponent: null,
      origins: [],
      columns: [
        { label: 'ID', key: 'id' },
        { label: 'Nombre', key: 'name' }
      ],
      tableActions: [
        {
          label: 'Editar',
          class: 'btn btn-warning',
          method: this.editOrigin
        },
        {
          label: 'Borrar',
          class: 'btn btn-danger',
          method: this.deleteOrigin
        }
      ],
      selectedOrigins: []
    };
  },
  methods: {
    openCreateModal() {
      this.$refs.createModal.openModal();
    },
    handleTypeSelection(type) {
      if (type === 'mysql') {
        this.currentFormComponent = MySQLConnectionForm;
      } else {
        this.currentFormComponent = null;
      }
    },
    handleFormSubmit(data) {
      // Lógica para manejar el submit del formulario y agregar el nuevo origen
      const newOrigin = {
        id: this.origins.length + 1, // Generar un ID único
        name: data.database // Usar el nombre de la base de datos como el nombre del origen
      };
      this.origins.push(newOrigin); // Añadir el nuevo origen a la lista
      this.$refs.createModal.closeModal(); // Cerrar el modal
    },
    editOrigin(row) {
      //console.log('Editando origen con ID:', row.id);
    },
    deleteOrigin(row) {
      //console.log('Borrando origen con ID:', row.id);
      this.origins = this.origins.filter(origin => origin.id !== row.id);
    },
    deleteSelectedOrigins() {
      //console.log('Borrando orígenes seleccionados:', this.selectedOrigins);
      this.origins = this.origins.filter(origin => !this.selectedOrigins.includes(origin.id));
      this.selectedOrigins = [];
    },
    updateSelectedOrigins(selectedRows) {
      this.selectedOrigins = selectedRows;
    }
  }
};
</script>
