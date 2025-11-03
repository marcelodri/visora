<template>
    <div class="container-fluid mt-4 page">
        <h2>Templates</h2>
        <hr><br>
        
        <div class="row">
            <div class="card col-12 col-xl-3">
                <div class="card-body p-4">
                    <DataTableComponent
                        :data="forms"
                        :columns="columns"
                        :actions="resultActions"
                        :items-per-page="10"
                    />
                </div>
            </div>
            <div class="card col-12 col-xl-8 ml-10">
                <div class="p-4">
                <label class="mb-4" for="">Código: <b>{{ formData.code }}</b></label>
                <Codemirror
                    v-if="showCodemirror"
                    v-model:value="formData.data"
                    :options="cmOptions"
                    border
                    ref="cmRef"
                    height="400"
                    width="100%"
                    @change="onChange"
                    @input="onInput"
                    @ready="onReady"
                />
                </div>
            </div>
        </div>

        <ToastComponent 
        :title="toastTitle" 
        :message="toastMessage" 
        :isSuccess="isSuccess" 
        :show.sync="showToastFlag"
        ref="toastComponent"
        />

        <LoadingDots :isLoading="isLoading" />

    </div>
</template>
<script>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import { useI18n } from "vue-i18n";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import { html } from 'js-beautify';

export default {
    components: {
        DataTableComponent,
        ModalComponent,
        ToastComponent,
        ConfirmPopup,
        Codemirror
    },
    setup() {
        const { t } = useI18n();
        const forms = ref([]);
        const formData = ref({code: "", data: ""});
        const editingIndex = ref(null);
        const showCodemirror = ref(true);  // Controlar la creación de Codemirror
        const isLoading = ref(false);
        const showToastFlag = ref(false);
        const toastTitle = ref('');
        const toastMessage = ref('');
        const toastComponent = ref(null); // Referencia del ToastComponent
        const isSuccess = ref(true);
        const formModal = ref(null);
        const token = ref(null);
        //const confirmPopup = ref(null);
        let formDelete = {};


        const urlGetData = 'https://stage.powerflows.pilotcrm.io/api/f63436dd-cc9a-4c6f-8f97-67d1d73f4dad';

        const columns = [
          { label: 'Código', key: 'code' }
        ];

        const resultActions = [
          { label: 'Editar', class: 'btn btn-sm', method: editForm, icon: '<i class="bi bi-pencil-square"></i>' },
        //   { label: 'Eliminar', class: 'btn btn-sm btn-danger', method: confirmDelete, icon: '<i class="bi bi-trash3"></i>' },
        ];

        const cmOptions = {
            mode: "text/javascript", // Language mode
            theme: "dracula", // Theme
        };

        async function openModalForm () {
            if (!editingIndex.value) {
                formData.value = {coder: "", data: ""};
                editingIndex.value = null;
            }
            formModal.value.openModal();

            // Asegurarse de que Codemirror se renderice solo una vez
            await nextTick(() => {
                showCodemirror.value = true;  // Activar Codemirror solo cuando se abre el modal
            });
        };

        const getToken = async () => {
          token.value = sessionStorage.getItem('token');
        };
  
        // Cargar productos desde backend
        const fetchForms = async () => {
            isLoading.value = true;
            try {
                const response = await axios.get(urlGetData, {
                    headers: {
                    Authorization: `Bearer ${token.value}`,
                    },
                });

                console.log('data', response.data);

                const data = response.data
                forms.value = data;
            } catch (err) {
                console.error('Error al obtener productos', err);
                triggerToast('Error!', 'No se pudieron cargar los productos.', false);
            } finally {
                isLoading.value = false;
            }
        };

        function editForm(item) {
            editingIndex.value = item;
            formData.value = item;
            formData.value.data = addLineBreaksToHtml(formData.value.data);
            openModalForm();
        };

        const closeModalForm = () => {
            formModal.value.closeModal();
        };

        function confirmDelete(item) {
            formDelete = item;
         //   confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
        }

        function addLineBreaksToHtml(htmlString) {
            return html(htmlString, {
                indent_size: 1,  // Tamaño de la indentación (1 para un tab)
                indent_char: '\t',  // Usar un tab como caracter de indentación
                preserve_newlines: true,  // Mantener saltos de línea
                max_preserve_newlines: 1,  // Limitar la cantidad de saltos de línea
            });
        }

        const triggerToast = (title, message, success) => {
            toastTitle.value = title;
            toastMessage.value = message;
            isSuccess.value = success;
            toastComponent.value.showToas();
        };

        // Otras funciones como guardar, eliminar, etc.
        getToken();
        onMounted(fetchForms);

        return {
            t,
            forms,
            columns,
            resultActions,
            formData,
            formModal,
            editingIndex,
            showCodemirror, // Asegurarse de retornar la variable para controlarla en el template
            openModalForm,
            closeModalForm,
            //saveForm,
            cmOptions,
            fetchForms,
            formDelete,
            triggerToast,
            showToastFlag,
            toastTitle,
            toastMessage,
            isSuccess,
            isLoading
            // Otros métodos y variables que usas
        };
    }
};
</script>
<style>
/* Para los datos (celdas) */
.table.b-table td:first-child {
    text-align: left;
}

.table.b-table td:nth-child(2) {
    text-align: right;
}

/* Para los encabezados (thead) */
.table.b-table th:first-child {
    text-align: left;
}

.table.b-table th:nth-child(2) {
    text-align: right;
    padding-right: 20px;
}
@media(max-width: 769px){

    .ml-10 {
        margin-left: 0!important;
        margin-top: 40px;
    }
}

</style>