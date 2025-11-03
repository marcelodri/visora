<template>
    <div class="container-fluid mt-4 page">
        <h2>{{ $t('menu.brands') }}</h2>
        <hr><br>

        <div class="card">
            <div class="card-body p-4">
            <button @click="openModalForm()" class="btn float-left"><i class="bi bi-plus-circle"></i> Nueva marca</button>
            </div>
        </div><br>


        <div class="card">
            <div class="card-body p-4">
                <DataTableComponent
                :data="forms"
                :columns = "columns"
                :actions="resultActions"
                :items-per-page="10"
                />
            </div>
        </div>

        <!-- Modal para preguntar si desea guardar la consulta -->
        <ModalComponent ref="formModal" modalId="formModal" :modalTitle="'Marca'" class="modal-xl" @modalClosed="handleCloseModal">
        <div class="modal-body">

            <div class="card mb-3">
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">Nombre:</label>
                        <input v-model="formData.name" type="text" class="form-control" placeholder="Ingrese la marca" />
                    </div>
                    <!-- <div class="mb-3">
                        <label class="form-label">Código:</label>
                        <input v-model="formData.code" type="text" class="form-control" placeholder="CONV" />
                    </div> -->
                </div>
            </div>


        </div>
        <div class="modal-footer">
            <button type="button" class="btn" @click="saveForm"><i class="bi bi-floppy"></i> {{$t('search_view.save')}}</button>
            <button type="button" class="btn" @click="closeModalForm"><i class="bi bi-x-circle"></i> {{$t('search_view.cancel')}}</button>
        </div>
        </ModalComponent>

        <ToastComponent 
        :title="toastTitle" 
        :message="toastMessage" 
        :isSuccess="isSuccess" 
        :show.sync="showToastFlag"
        ref="toastComponent"
        />

        <ConfirmPopup ref="confirmPopup" :title="$t('search_view.alert_confirm_title')" :question="$t('search_view.alert_confirm_question')" @response="handleResponse" />

        <LoadingDots :isLoading="isLoading" />
        
    </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DataTableComponent from '@/components/DataTableComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import ConfirmPopup from '@/components/ConfirmPopup.vue';
import { useI18n } from "vue-i18n";
import ModalComponent from '@/components/ModalComponent.vue';

export default {
  components: {
    DataTableComponent,
    ToastComponent,
    ConfirmPopup,
    ModalComponent
  },
  setup() {
    const { t } = useI18n();

    // Estado reactivo
    const forms = ref([]);
    const formData = ref({name: "", code: ""});
    const isLoading = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const isSuccess = ref(false);
    const showToastFlag = ref(false);
    const token = ref(null);
    const formModal = ref(null);
    const editingIndex = ref(null);
    const toastComponent = ref(null); // Referencia del ToastComponent
    const confirmPopup = ref(null);
    let formDelete = {}

    // Columnas para el DataTable
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: t('business_type.name') },
      { key: 'code', label: t('business_type.code') },
    ];

    // Acciones (pueden ser editar, eliminar, etc.)
    const resultActions = [
        { label: 'Editar', class: 'btn btn-sm', method: editForm, icon: '<i class="bi bi-pencil-square"></i>' },
        { label: 'Eliminar', class: 'btn btn-sm btn-danger', method: confirmDelete, icon: '<i class="bi bi-trash3"></i>'},
    ];

    // Método para traer los tipos de negocio
    const getBusinessTypes = async () => {
      isLoading.value = true;

        try {
            const response = await axios.get('https://stage.powerflows.pilotcrm.io/api/2032240b-4b30-403a-8834-b843bf21ba6b', {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            console.log('response', response.data);

            if (response && response.data && Array.isArray(response.data)) {
              forms.value = response.data; // 🔁 Carga los datos en el datatable
            }

        } catch (error) {
            console.error('getPageForms', error);
        } finally {
            isLoading.value = false;
        }
    };


    // Método ficticio para respuesta del confirm
    const handleResponse = (confirmed) => {
      //console.log('Confirmado:', confirmed);
      deleteForm()
    };

    // Editar
    function editForm(item) {
        editingIndex.value = item;
        formData.value = item;
        openModalForm();
    }

    // Abrir modal para nuevo
    const openModalForm = () => {
        //console.log('editingIndex', editingIndex)
        if(!editingIndex.value){
          cleanData();
        }
        formModal.value.openModal();
    };

    // Eliminar
    function confirmDelete(item, index) {
        formDelete = item;
        confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
    }

    const getToken = async () => {
        token.value = sessionStorage.getItem('token');
    };

    const handleCloseModal = () => {
      cleanData();
    }

    const closeModalForm = () => {
      cleanData();
      formModal.value.closeModal();
    };

    const cleanData = () => {
      editingIndex.value = null; 
      formData.value = {name: "", code: ""};
    }

    const saveForm = async () => {
        isLoading.value = true;
        formData.value.code = formData.value.name?.substring(0, 4) || '';
        const dataToSend = { ...formData.value };

        let url = 'https://stage.powerflows.pilotcrm.io/api/9e5c903c-ce0e-4636-8058-44e0f4adc2a7';

        try {
            const response = await axios.post(url,dataToSend, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
            });
            //console.log('response', response)
            await getBusinessTypes();   // 🔄 Refresca el datatable

            closeModalForm();
            triggerToast('Ok!', 'Guardado correctamente', true);
        } catch (err) {
            console.error(err);
            triggerToast('Error!', 'No se pudo guardar el producto.', false);
        } finally {
            isLoading.value = false;
        }
      };

      const triggerToast = (title, message, success) => {
        toastTitle.value = title;
        toastMessage.value = message;
        isSuccess.value = success;
        toastComponent.value.showToas();
    };

    const deleteForm = async () => {
        isLoading.value = true;

        try {

          const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/36e541ee-0b0e-4751-9f47-44408a6000d6',formDelete, {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });

          if (response.status === 200) {
            // Buscar el índice del formulario en el array por ID
            const index = forms.value.findIndex(f => f.id === formDelete.id);

            if (index !== -1) {
              forms.value.splice(index, 1); // Eliminar el formulario del array
            }

            //alert('Consulta guardada exitosamente');
            setTimeout(() => {
              triggerToast('Realizado!', 'Producto eliminado!', true);
            }, 1000)

            await getBusinessTypes();   // 🔄 Refresca el datatable

          }

        } catch (error) {
          console.error('deleteForm', error)
          triggerToast('Error', 'Error al borrar el producto', false);
        } finally {
          isLoading.value = false;
        }

      };
    // Se ejecuta al montar el componente
    onMounted(() => {
        getToken();
        getBusinessTypes();
    });

    return {
      t,
      forms,
      columns,
      resultActions,
      toastTitle,
      toastMessage,
      isSuccess,
      showToastFlag,
      isLoading,
      handleResponse,
      closeModalForm,
      formData,
      formModal,
      openModalForm,
      saveForm,
      toastComponent,
      confirmPopup,
      deleteForm,
      handleCloseModal
    };
  }
};
</script>

   
<style>
    label {
      /* color: #3939ff; */
      font-weight: bold;
    }
    label[for='fileInput'] {
      cursor: pointer;;
    }
</style>