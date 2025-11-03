<template>
  <div>

    <!-- Botón de descarga de Excel -->
    <button v-if="showDownloadButton" class="btn btn-excel" @click="downloadExcel"><i class="bi bi-file-earmark-excel"></i> {{ $t('download') }}</button>
    
    <div class="table-responsive">
      <table class="table b-table">
        <thead>
          <tr>
            <th v-if="inputAllSelected">
              <input type="checkbox" @change="toggleSelectAll" :checked="allSelected">
            </th>
            <th v-for="column in columns" :key="column.label" scope="col">{{ column.label }}</th>
            <th v-if="actions.length > 0">{{ $t('search_view.table_thead_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.id">
            <td v-if="inputAllSelected">
              <input type="checkbox" :value="row.id" v-model="selectedRows">
            </td>

            <td v-for="column in columns" :key="column.key" v-html="formatCell(row[column.key], row, column.key)"></td>

            <td v-if="actions.length > 0">
              <button
                v-for="(action, index) in actions"
                :key="index"
                class="btn btn-sm"
                :class="action.class"
                @click="action.method(row)"
                :title="action.label"
              >
                <span v-if="action.icon" v-html="typeof action.icon === 'function' ? action.icon(row) : action.icon"></span>
                <span v-else>{{ action.label }}</span>
              </button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>


    <!-- Paginación -->
    <nav>
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="prevPage"><i class="bi bi-chevron-left"></i></a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="nextPage"><i class="bi bi-chevron-right"></i></a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import ExcelJS from 'exceljs';

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    actions: {
      type: Array,
      default: () => []
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    showDownloadButton: {
      type: Boolean,
      default: false // Controla la visibilidad del botón de descarga
    },
    inputAllSelected: {
      type: Boolean,
      default: false // Controla la visibilidad del botón de descarga
    },
     marcas: {
      type: Array,
      default: () => []
    },
    negocios: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentPage: 1,
      selectedRows: [] // Arreglo que almacena las filas seleccionadas
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.data.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.data.length / this.itemsPerPage);
    },
    allSelected() {
      // Verifica si todas las filas están seleccionadas
      return this.paginatedData.length > 0 && this.paginatedData.every(row => this.selectedRows.includes(row.id));
    }
  },
  methods: {
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    toggleSelectAll() {
      if (this.allSelected) {
        // Si todas las filas están seleccionadas, desmarcar todas
        this.selectedRows = [];
      } else {
        // Si no, marcar todas las filas visibles en la página actual
        const pageRowIds = this.paginatedData.map(row => row.id);
        this.selectedRows = [...new Set([...this.selectedRows, ...pageRowIds])];
      }
    },
    async downloadExcel() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Datos');

      // Agrega encabezados
      worksheet.addRow(this.columns.map(col => col.label));

      // Agrega los datos
      this.data.forEach(row => {
        worksheet.addRow(this.columns.map(col => row[col.key]));
      });

      // Establecer el tipo de contenido y el nombre del archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'datos.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    formatCell(value, row, key) {
      // Mostrar imagen o path
      if (key === 'imageOrPath') {
        const src = row.image || row.path;
        if (row.image) {
          return `<img src="${src}" alt="Imagen" style="max-height: 60px;" />`;
        }
        if (row.path) {
          return `<img src="https://madcoder.io/apis/images_upload/${src}" alt="Imagen" style="max-height: 60px;" />`;
        }
        return '—';
      }

      // Agregar etiqueta "default" visualmente si el campo es "name" y es default
      if (key === 'name' && (row.default === true || row.default === 1)) {
        return `${value} <span class="badge bg-primary ms-2">default</span>`;
      }

      // // Mostrar nombre de marca
      // if (key === 'marca_id') {
      //   const marca = this.marcas.find(m => m.id === value);
      //   return marca ? marca.name : '—';
      // }

      // // // Mostrar nombre del negocio
      // if (key === 'tipo_de_negocio_id') {
      //   const negocio = this.negocios.find(n => n.id === value);
      //   return negocio ? negocio.name : '—';
      // }

      // Reemplazar saltos de línea por <br>
      if (typeof value === 'string') {
        return value.replace(/\n/g, '<br>');
      }

      // Valor por defecto
      return value ?? '';
    }


  },
  watch: {
    selectedRows(newSelectedRows) {
      this.$emit('update:selectedRows', newSelectedRows); // Emitir un evento cuando cambie la selección
    }
  }
};
</script>

<style scoped>
.table {
  margin-top: 20px;
}
.pagination {
  justify-content: center;
}

.table thead tr th{
      /* color: #3939ff; */
      font-weight: bold;
  }
</style>


