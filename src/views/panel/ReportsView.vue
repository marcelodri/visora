<template>
  <div class="container-fluid mt-4">
    <h2>{{ $t(`reports.title`) }}</h2>
    <hr><br>
    <div class="card">
      <div class="card-body p-4">
        <DataTableComponent
          :data="origins"
          :columns="columns"
          :actions="tableActions"
          :items-per-page="10"
          @update:selectedRows="updateSelectedOrigins"
        />
      </div>
    </div>

    <!-- Primer Modal que contiene la tabla con los resultados del reporte -->
    <ModalComponent ref="dataModal" modalId="dataModal" :modalTitle="$t(`search_view.modal_data`)" :class="'modal-xxl'">
      <DataTableComponent
        v-if="queryResults.length > 0"
        :data="queryResults"
        :columns="resultColumns"
        :items-per-page="10"
        :showDownloadButton = "true"
      />
    </ModalComponent>

    <ModalComponent ref="dataConditions" modalId="dataConditions" :modalTitle="$t(`reports.modal_form_title`)" :class="'modal-lg'" :footer="false">
      <div class="container">
        <div class="row">
          
          <div class="col-6">
            <div class="mt-5">
              <label class="form-label" for="from-date">{{$t(`reports.modal_form_from`)}}</label>
              <input class="form-control" id="from-date" type="date" v-model="fromDate"/>
            </div>
          </div>

          <div class="col-6">
            <div class="mt-5">
              <label class="form-label" for="to-date">{{$t(`reports.modal_form_to`)}}</label>
              <input class="form-control" id="to-date" type="date" v-model="toDate"/>
            </div>
          </div>

          <div class="col-12">
            <div class="mt-10">
              <button id="generate-report" @click="generateReport" class="btn float-right">{{$t(`reports.modal_form_button`)}}</button>
            </div>
          </div>
          
        </div>
      </div>
    </ModalComponent>

    <ConfirmPopup ref="noDataPopup" :title="$t(`search_view.atention`)" :question="$t(`search_view.no_data`)" cancelButtonText="Ok!" :showConfirmButton=false @response="handleResponse" />

    <LoadingDots :isLoading="isLoading" />

  </div>
</template>

<script>
import ModalComponent from '@/components/ModalComponent.vue';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue'

import axios from 'axios';

export default {
  components: {
    DataTableComponent,
    ModalComponent,
    ConfirmPopup
  },
  data() {
    return {
      origins: [],
      columns: [
        { label: 'ID', key: 'id' },
        { label: this.$t('search_view.table_thead_name'), key: 'name' }
        ],
      resultColumns: [],
      queryResults: [],
      report3Columns: [],
      report3Results: [],
      isLoading: false,
      tableActions: [
        // {
        //   label: 'Editar',
        //   class: 'btn btn-warning',
        //   method: this.editOrigin
        // },
        // {
        //   label: 'Borrar',
        //   class: 'btn btn-danger',
        //   method: this.deleteOrigin
        // },
        {
          label: this.$t('search_view.button_visualize'),
          class: 'btn',
          method: this.visualizeOrigin,
          icon: '<i class="bi bi-cpu"></i>'
        }
      ],
      selectedOrigins: [],
      fromDate: null,
      toDate: null,
      idReport: null
    };
  },
  async mounted() {
    this.isLoading = true;
    await this.getToken();
    this.fetchReports();
    this.configDateInputs();
  },
  methods: {
    async getToken() {
                this.token = sessionStorage.getItem('token');
            },
    updateSelectedOrigins(selectedRows) {
      this.selectedOrigins = selectedRows;
    },

    visualizeOrigin(row) {
      this.visualizeReport(row.id);
    },

    async visualizeReport(id) {
      this.idReport = id;
      this.configDateInputs();
      this.$refs.dataConditions.openModal();
    },

    async generateReport() {

      // Lógica para generar el reporte basado en estas fechas
      if (this.fromDate && this.toDate) {
        this.isLoading = true

        try {
          const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/query-mysql', {
            query: this.idReport,
            toDate: this.toDate,
            fromDate: this.fromDate
          },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    });

          this.queryResults = response.data.data;

          if (this.queryResults.length > 0 && Object.keys(this.queryResults[0]).length > 0) {
            this.resultColumns = Object.keys(this.queryResults[0]).map(key => ({
              label: key,
              key: key
            }));

            this.toDate = null;
            this.fromDate = null;
            this.$refs.dataConditions.closeModal();
            this.$refs.dataModal.openModal();

          } else {
            
            this.$refs.noDataPopup.showConfirmPopup(); // Mostramos el popup de confirmación

          } 

          this.isLoading = false

        } catch (error) {
          console.error('Error al ejecutar el query:', error);
        }

      } 

    },

    async fetchReports() {
      try {
        const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/query-mysql', {
          query: '2'
        },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    });

        this.origins = response.data.data.map(report => ({
          id: report.id,
          name: report.name,
          query: report.query
        }));


        this.isLoading = false
      } catch (error) {
        console.error('Error al obtener los reportes:', error);
      }
    },

    configDateInputs() {
      const today = new Date();
      const oneMonthAgo = new Date();
      
      // Restar un mes a la fecha actual
      oneMonthAgo.setMonth(today.getMonth() - 1);

      // Formatear las fechas a 'YYYY-MM-DD' para que sean compatibles con los inputs de tipo date
      this.toDate = today.toISOString().split('T')[0];
      this.fromDate = oneMonthAgo.toISOString().split('T')[0];
    }
  }
};
</script>
