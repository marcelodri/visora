<template>
    <div class="container-fluid mt-4 page">
        <h2>{{ $t('search_view.title') }}</h2>
        <hr><br>
        <!-- Componente para el formulario de condiciones de búsqueda -->
         <div class="card">
            <div class="card-body p-4">
                <SearchConditionForm
                    :available-columns="availableColumns"
                    :query-conditions="queryConditions"
                    :add-condition="addCondition"
                    :remove-condition="removeCondition"
                />
                <button v-show="isCollapsed" @click="runQuery" class="btn mt-10 float-right"><i class="bi bi-binoculars-fill"></i> {{ $t('search_view.button_search') }}</button>
            </div>
         </div><br>
  
         <ConfirmPopup ref="noDataPopup" :title="$t('search_view.atention')" :question="$t('search_view.no_data')" cancelButtonText="Ok!" :showConfirmButton=false @response="handleResponse" />

        <!-- Modal para mostrar los resultados de la búsqueda -->
        <ModalComponent ref="dataModal" modalId="dataModal" :modalTitle="$t('search_view.modal_data')" @saveSearch="saveSearch" class="modal-xxl" :showSaveSearchButton="isNewSearch" :isFooter="true">
            <DataTableComponent
                v-if="queryResults.length > 0"
                :data="queryResults"
                :columns="resultColumns"
                :items-per-page="10"
                :actions="resultActions"
                :showDownloadButton = "true"
                :footer="true"
            />
        </ModalComponent>
  
        <!-- Modal para preguntar si desea guardar la consulta -->
        <ModalComponent ref="answerModal" modalId="answerModal" :modalTitle="$t('search_view.save_query')">
            <div class="modal-body">
                <input v-model="queryName" class="form-control" :placeholder="$t('search_view.placeholder_name_query')" />
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" @click="saveQuery">{{$t('search_view.save')}}</button>
                <button type="button" class="btn" @click="closeSaveQueryModal">{{$t('search_view.cancel')}}</button>
            </div>
        </ModalComponent>

        <!-- Segundo Modal personalizado -->
        <CustomModal ref="customModal" :modalTitle="$t('search_view.details_report')">
            <DataTableComponent
                v-if="report3Results.length > 0"
                :data="report3Results"
                :columns="report3Columns"
                :items-per-page="10"
            />
        </CustomModal>

        <br>

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

        <ConfirmPopup ref="confirmPopup" :title="$t('search_view.alert_confirm_title')" :question="$t('search_view.alert_confirm_question')" @response="handleResponse" />

        <LoadingDots :isLoading="isLoading" />

        <ToastComponent 
            :title="toastTitle" 
            :message="toastMessage" 
            :isSuccess="isSuccess" 
            :show.sync="showToastFlag"
            ref="toastComponent"
        />

    </div>
</template>
  
<script>
    import ModalComponent from '@/components/ModalComponent.vue';
    import DataTableComponent from '@/components/DataTableComponent.vue';
    import SearchConditionForm from '@/components/SearchConditionForm.vue'; // Importa el nuevo componente
    import CustomModal from '@/components/CustomModalComponent.vue';
    import ConfirmPopup from '@/components/ConfirmPopup.vue'
    import axios from 'axios';
    import { ref } from 'vue';
    import ToastComponent from '@/components/ToastComponent.vue'; // Asegúrate de ajustar la ruta

    export default {
        components: {
            ModalComponent,
            DataTableComponent,
            CustomModal,
            SearchConditionForm,
            ConfirmPopup,
            ToastComponent
        },
        data() {
            return {

                origins: [],
                columns: [
                    { label: 'ID', key: 'id' },
                    { label: this.$t('search_view.table_thead_name'), key: 'name' },
                    { label: this.$t('search_view.table_thead_value'), key: 'value' }
                ],
                tableActions: [
                    // {
                    //     label: 'Editar',
                    //     class: 'btn btn-warning',
                    //     method: this.editOrigin
                    // },
                    {
                        label: this.$t('search_view.button_visualize'),
                        class: 'btn',
                        method: this.visualizeOrigin,
                        icon: '<i class="bi bi-cpu"></i>'
                    },
                    {
                        label: this.$t('search_view.button_delete'),
                        class: 'btn btn-danger',
                        method: this.confirmDelete,
                        icon: '<i class="bi bi-trash-fill"></i>'
                    }

                ],
                availableColumns: [],
                queryConditions: [],
                queryResults: [],
                resultColumns: [],
                queryName: '',
                queryExists: false,
                resultActions: [
                    {
                        label: this.$t('search_view.button_history'),
                        class: 'btn',
                        method: this.showMoreDetails
                    }
                ],
                rowToDelete: null, // Aquí almacenamos la fila que se va a eliminar
                isLoading: false,
                isCollapsed: false,
                isNewSearch: false,
                showToastFlag: false,
                token: null
            };
        },

        async mounted() {
            await this.getToken();
            this.fetchColumns();
            this.fetchFilters();
        },

        methods: {
            async getToken() {
                this.token = sessionStorage.getItem('token');
            },
            addCondition() {
                //this.ref.collapse.show()
                this.isCollapsed = true
                
                this.queryConditions.push({ column: '', operator: '=', value: '' });
            },
            removeCondition(index) {
                this.queryConditions.splice(index, 1);
                if(this.queryConditions == 0) {
                    this.isCollapsed = false
                }
            },
            async fetchColumns() {

                this.isLoading = true;
                try {
                    const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/query-mysql', {
                        query: '4'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    }
                );
                    this.availableColumns = response.data.data.map((ele) => ele.COLUMN_NAME);
                    this.isLoading = false;

                } catch (error) {
                    console.error('Error al obtener las columnas:', error);
                }
            },
            async fetchFilters() {
                this.isLoading = true;
                this.origins = []

                try {
                    const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/query-mysql', {
                        query: '5'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    }
                
                );

                    //console.log('response.data.data', response.data.data);
                    if (Object.keys(response.data.data[0]).length > 0) {
                        this.origins = response.data.data;
                    } 

                    //console.log('this.origins', this.origins);

                    this.isLoading = false;
                    this.isNewSearch = false;

                } catch (error) {
                    console.error('Error al obtener las columnas:', error);
                }
            },
            async runQuery() {

                const query = this.buildQuery();

                if(query){
                    this.isLoading = true;
                    this.queryExists = false

                    try {
                        const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/customquery-mysql', {
                            query
                        },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    }
                    
                    );
                        this.queryResults = response.data.data;
                        this.isNewSearch = true;

                        if (this.queryResults.length > 0 && Object.keys(this.queryResults[0]).length > 0) {

                            this.resultColumns = Object.keys(this.queryResults[0]).map(key => ({
                            label: key,
                            key: key
                            }));

                            this.$refs.dataModal.openModal();
                            this.isLoading = false;

                        } else {
                            this.isLoading = false;
                            this.$refs.noDataPopup.showConfirmPopup(); // Mostramos el popup de confirmación

                        } 

                    } catch (error) {
                        console.error('Error al ejecutar la consulta:', error);
                    }
                }

            },
            buildQuery() {
                // console.log('this.queryConditions', this.queryConditions[0]);

                // Verifica si alguna condición tiene 'column' o 'value' vacíos
                const hasEmptyFields = this.queryConditions.some(
                    (cond) => !cond.column || !cond.value
                );

                // Si alguna tiene campos vacíos, retorna y no avanza
                if (hasEmptyFields) {
                    console.error("Hay condiciones con 'column' o 'value' vacíos. No se puede continuar.");
                    return null;
                }

                // Si todas las condiciones son válidas, construye la consulta
                const conditions = this.queryConditions.map(
                    (cond) => `${cond.column} ${cond.operator} '${cond.value}'`
                );

                return `WHERE ${conditions.join(' AND ')}`;
            },

            onModalClosed() {
                // Cuando se cierra el primer modal, abre el segundo
                this.isLoading = true;
                if(!this.queryExists) {
                    setTimeout(() => {
                        this.$refs.answerModal.openModal();
                        this.isLoading = false;
                    }, 500);
                }
            },
            closeSaveQueryModal() {
                this.$refs.answerModal.closeModal();
                this.queryName = '';
            },
            async saveQuery() {
                this.isLoading = true;
                
                // Crear una cadena de condiciones SQL
                const queryConditions = this.queryConditions.map(condition => {
                    const escapedValue = this.escapeSQL(condition.value); // Escapar el valor
                    return `${condition.column} ${condition.operator} '${escapedValue}'`;
                }).join(' AND ');

                //console.log('queryConditions', queryConditions);

                try {
                    await axios.post('https://stage.powerflows.pilotcrm.io/api/save-query-mysql', {
                        name: this.queryName,
                        conditions: queryConditions
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    }
                );
                    
                    this.fetchFilters();
                    
                    //alert('Consulta guardada exitosamente');
                    setTimeout(() => {
                        this.closeSaveQueryModal();
                        this.triggerToast('Realizado!', 'Búsqueda guardada', true);
                    }, 1000)

                    //this.isLoading = false;
                } catch (error) {
                    console.error('Error al guardar la consulta:', error);
                    this.triggerToast('Error', `in saveQuery: ${error}`, false);
                    this.isLoading = false;

                }
            },
            escapeSQL(value) {
                // Reemplaza cada instancia de un solo apóstrofo con dos apóstrofos
                return value.replace(/'/g, "''");
            },
            async visualizeOrigin(row) {

                this.isLoading = true
                this.queryExists = true
                this.isNewSearch = false;

                const query = 'WHERE '+row.value;

                try {


                    const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/customquery-mysql', {
                        query

                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    }
                );

                    this.queryResults = response.data.data;

                    if (this.queryResults.length > 0) {
                        
                        this.resultColumns = Object.keys(this.queryResults[0]).map((key) => ({
                            label: key,
                            key: key,
                        }));

                        this.$refs.dataModal.openModal();

                        this.isLoading = false
                    }

                } catch (error) {
                    console.error('Error al ejecutar la consulta:', error);
                }

                
            },
            updateSelectedOrigins(selectedRows) {
                this.selectedOrigins = selectedRows;
            },
            async showMoreDetails(row) {
                this.isLoading = true

                try {
                    const response = await axios.post(`https://stage.powerflows.pilotcrm.io/api/query-mysql?lead_id=${row.lead_pilot}`, {
                        query: "3"
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    });

                    this.report3Results = response.data.data;

                    // if (this.report3Results.length > 0) {
                    //     this.report3Columns = Object.keys(this.report3Results[0]).map(key => ({
                    //         label: key,
                    //         key: key
                    //     }));

                    //     // Abrir el segundo modal sin cerrar el primero
                    //     this.$refs.customModal.openModal();

                    //     this.isLoading = false
                    // }

                    if (this.report3Results.length > 0 && Object.keys(this.report3Results[0]).length > 0) {
                        this.report3Columns = Object.keys(this.report3Results[0]).map(key => ({
                            label: key,
                            key: key
                        }));

                        this.$refs.customModal.openModal();
                        this.isLoading = false

                    } else {
                        
                        this.isLoading = false
                        this.$refs.noDataPopup.showConfirmPopup(); // Mostramos el popup de confirmación

                    } 
                    
                } catch (error) {
                    console.error('Error al ejecutar el reporte 3:', error);
                }
            },
            async confirmDelete(row) {
                this.rowToDelete = row; // Guardamos la fila que se quiere eliminar
                this.$refs.confirmPopup.showConfirmPopup(); // Mostramos el popup de confirmación
            },

            async deleteOrigin(row) {
                //console.log('deleteOrigin')

                //this.handleResponse();
                //this.$refs.confirmPopup.showConfirmPopup()
                this.isLoading = true
                try {

                    // Realizar la solicitud GET con el token en la cabecera Authorization
                    const response = await axios.get(`https://stage.powerflows.pilotcrm.io/api/filters/delete?filter_id=${row.id}`, {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Añadir el token como Bearer Token
                        }
                    });

                    this.triggerToast('Realizado!', 'Búsqueda borrada', true);

                    // Vuelve a obtener los filtros después de la eliminación
                    this.fetchFilters();
                    // this.isLoading = false
                } catch (error) {
                    this.triggerToast('Error!', 'No se pudo borrar', false);

                    console.error('Error al eliminar el origen:', error);
                }
            },

            async handleResponse(isConfirmed) {
                if (isConfirmed && this.rowToDelete) {
                    //console.log("El usuario confirmó la acción.");
                    await this.deleteOrigin(this.rowToDelete); // Llamamos a la función de eliminar solo si se confirmó
                } else {
                    //console.log("El usuario canceló la acción.");
                }
            },

            saveSearch(){
                this.onModalClosed()
            }

        },

        setup() {
            const toastTitle = ref('');
            const toastMessage = ref('');
            const isSuccess = ref(true);
            const toastComponent = ref(null); // Referencia del ToastComponent

            // Método para mostrar el Toast
            const triggerToast = (title, message, success) => {
                toastTitle.value = title;
                toastMessage.value = message;
                isSuccess.value = success;
                
                // Llamar al método showToast() en el ToastComponent
                toastComponent.value.showToas();
            };

            return { toastTitle, toastMessage, isSuccess, triggerToast, toastComponent };
        }

    };
</script>
  