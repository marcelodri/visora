<template>
  <div class="datatable-wrapper">

    <!-- Botón de descarga de Excel -->
    <button v-if="showDownloadButton" class="btn btn-excel" @click="downloadExcel">
      <i class="bi bi-file-earmark-excel me-2"></i> {{ $t('download') }}
    </button>
    
    <!-- Campo de búsqueda -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <i class="bi bi-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="'Buscar...'" 
          class="form-control search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="btn-clear">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table custom-table">
        <thead>
          <tr>
            <th v-if="inputAllSelected" class="checkbox-col">
              <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" class="custom-checkbox">
            </th>
            <th v-for="column in columns" :key="column.label" scope="col">
              {{ column.label }}
            </th>
            <th v-if="actions.length > 0" class="actions-col">
              {{ $t('search_view.table_thead_actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredData.length === 0" class="empty-row">
            <td :colspan="columnsCount" class="text-center">
              <div class="empty-state">
                <div>
                  <i class="bi bi-inbox empty-icon"></i>
                </div>
                <p class="empty-text">
                  {{ searchQuery ? 'No se encontraron resultados' : 'No hay datos disponibles' }}
                </p>
              </div>
            </td>
          </tr>
          <tr v-for="row in paginatedData" :key="row.id" class="data-row">
            <td v-if="inputAllSelected" class="checkbox-col">
              <input type="checkbox" :value="row.id" v-model="selectedRows" class="custom-checkbox">
            </td>

            <td v-for="column in columns" :key="column.key" v-html="formatCell(row[column.key], row, column.key)" :class="getColumnClass(column)"></td>

            <td v-if="actions.length > 0" class="actions-col">
              <div class="action-buttons">
                <button
                  v-for="(action, index) in actions"
                  :key="index"
                  :class="action.class"
                  @click="action.method(row)"
                  :title="action.label"
                >
                  <span v-if="action.icon" v-html="typeof action.icon === 'function' ? action.icon(row) : action.icon"></span>
                  <span v-else>{{ action.label }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Información de registros y paginación -->
    <div class="pagination-container">
      <div class="pagination-info">
        <i class="bi bi-info-circle me-2"></i>
        Mostrando <strong>{{ startRecord }}</strong>&nbsp;a&nbsp;<strong>{{ endRecord }}</strong>&nbsp;de&nbsp;<strong>{{ totalRecords }}</strong>&nbsp;registros
        <span v-if="searchQuery" class="filtered-info">
          (filtrados de {{ data.length }} totales)
        </span>
      </div>
      
      <nav>
        <ul class="pagination custom-pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="prevPage">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li class="page-item active">
            <span class="page-link page-current">
              {{ currentPage }} / {{ totalPages }}
            </span>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="nextPage">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
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
      default: false
    },
    inputAllSelected: {
      type: Boolean,
      default: false
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
      selectedRows: [],
      searchQuery: ''
    };
  },
  computed: {
    filteredData() {
      if (!this.searchQuery) {
        return this.data;
      }

      const query = this.searchQuery.toLowerCase().trim();
      
      return this.data.filter(row => {
        return this.columns.some(column => {
          const value = row[column.key];
          
          if (value === null || value === undefined) {
            return false;
          }
          
          return String(value).toLowerCase().includes(query);
        });
      });
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
    allSelected() {
      return this.paginatedData.length > 0 && this.paginatedData.every(row => this.selectedRows.includes(row.id));
    },
    totalRecords() {
      return this.filteredData.length;
    },
    startRecord() {
      if (this.filteredData.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endRecord() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.totalRecords ? this.totalRecords : end;
    },
    columnsCount() {
      let count = this.columns.length;
      if (this.inputAllSelected) count++;
      if (this.actions.length > 0) count++;
      return count;
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
        this.selectedRows = [];
      } else {
        const pageRowIds = this.paginatedData.map(row => row.id);
        this.selectedRows = [...new Set([...this.selectedRows, ...pageRowIds])];
      }
    },
    async downloadExcel() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Datos');

      worksheet.addRow(this.columns.map(col => col.label));

      const dataToExport = this.searchQuery ? this.filteredData : this.data;
      
      dataToExport.forEach(row => {
        worksheet.addRow(this.columns.map(col => row[col.key]));
      });

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
      if (key === 'imageOrPath') {
        const src = row.image || row.path;
        if (row.image) {
          return `<img src="${src}" alt="Imagen" class="table-image" />`;
        }
        if (row.path) {
          return `<img src="https://madcoder.io/apis/images_upload/${src}" alt="Imagen" class="table-image" />`;
        }
        return '—';
      }

      if (key === 'name' && (row.default === true || row.default === 1)) {
        return `${value} <span class="badge bg-primary ms-2">default</span>`;
      }

      if (typeof value === 'string') {
        return value.replace(/\n/g, '<br>');
      }

      return value ?? '—';
    },
    getColumnClass(column) {
      if (column === this.columns[0]) {
        return 'truncate-text';
      }
      return '';
    }
  },
  watch: {
    selectedRows(newSelectedRows) {
      this.$emit('update:selectedRows', newSelectedRows);
    },
    searchQuery() {
      this.currentPage = 1;
    }
  }
};
</script>

<style scoped>
.datatable-wrapper {
  padding: 1.5rem;
}

/* Search Container */
.search-container {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 1.1rem;
}

.search-input {
  padding: 0.75rem 3rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
  outline: none;
}

.btn-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Table Container */
.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Custom Table */
.custom-table {
  margin: 0;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.custom-table thead tr {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.custom-table thead th {
  padding: 1rem 1.25rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.custom-table tbody tr.data-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

/* .custom-table tbody tr.data-row:hover {
  background: #f9fafb;
  transform: scale(1.001);
} */

.custom-table tbody td {
  padding: 1rem 1.25rem;
  color: #1f2937;
  font-size: 0.9rem;
  vertical-align: middle;
}

/* Checkbox Column */
.checkbox-col {
  width: 50px;
  text-align: center;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3939ff;
}

/* Actions Column */
.actions-col {
  text-align: right;
  white-space: nowrap;
}

.action-buttons {
  display: inline-flex;
  gap: 0.5rem;
}

.action-buttons .btn {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

/* .action-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
} */

/* Empty State */
.empty-row td {
  padding: 3rem 1rem;
}

.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  align-self: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

/* Table Image */
:deep(.table-image) {
  max-height: 60px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Truncate Text */
.truncate-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pagination Container */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.pagination-info strong {
  color: #1f2937;
  font-weight: 600;
}

.filtered-info {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

/* Custom Pagination */
.custom-pagination {
  margin: 0;
  display: flex;
  gap: 0.5rem;
}

.custom-pagination .page-item {
  list-style: none;
}

.custom-pagination .page-link {
  padding: 0.5rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.custom-pagination .page-link:hover {
  background: #f9fafb;
  border-color: #3939ff;
  color: #3939ff;
}

.custom-pagination .page-item.active .page-link {
  background: #3939ff;
  border-color: #3939ff;
  color: white;
  cursor: default;
}

.custom-pagination .page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.page-current {
  font-weight: 600;
}

/* Excel Button */
.btn-excel {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.btn-excel:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .datatable-wrapper {
    padding: 1rem;
  }

  .search-input-wrapper {
    max-width: 100%;
  }

  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pagination-info {
    order: 2;
    text-align: center;
  }

  .custom-table thead th {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }

  .custom-table tbody td {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>