<template>
    <div class="container-fluid mt-4 page">
        <div class="header-section mb-4">
          <h2>{{ $t('menu.brands') }}</h2>
          <button @click="openModalForm()" class="btn btn-primary btn-add">
            <i class="bi bi-plus-circle me-2"></i> Nueva marca
          </button>
        </div>
        <hr class="header-divider">

        <div class="accordion mb-5" id="accordionMarcas">
          <div class="accordion-item tip-banner-style">
            <h2 class="accordion-header" id="headingMarcas">
              <button 
                class="accordion-button collapsed tip-banner-button" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapseMarcas" 
                aria-expanded="false" 
                aria-controls="collapseMarcas"
              >
                <div class="tip-icon">
                  <i class="bi bi-lightbulb-fill"></i>
                </div>
                <div class="tip-text">
                  <strong>Tip:</strong> Las marcas te permiten organizar y clasificar formularios y cards dentro de Visora Form para manejar diferentes líneas de negocio o sucursales.
                </div>
              </button>
            </h2>
            <div 
              id="collapseMarcas" 
              class="accordion-collapse collapse" 
              aria-labelledby="headingMarcas" 
              data-bs-parent="#accordionMarcas"
            >
              <div class="accordion-body tip-expanded">
                <p>
                  Las <strong>marcas</strong> te permiten organizar y clasificar tanto los formularios como las cards dentro de Visora Form.
                  Una vez creadas, podrás seleccionarlas dentro de cada formulario y en las distintas secciones del contenido para mostrar información asociada a una marca específica.
                </p>

                <p>
                  Esto es ideal para manejar diferentes líneas de negocio, sucursales o variantes visualas dentro de una misma plataforma, manteniendo todo ordenado y fácil de gestionar.
                </p>

                <p class="mb-0">
                  Usá esta sección para crear, editar o eliminar marcas según tus necesidades.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card data-card">
            <div class="card-body p-0">
              <DataTableComponent
                :data="forms"
                :columns="columns"
                :actions="resultActions"
                :items-per-page="10"
              />
            </div>
        </div>

        <!-- Modal -->
        <ModalComponent ref="formModal" modalId="formModal" :modalTitle="'Marca'" class="modal-xl" @modalClosed="handleCloseModal">
          <div class="modal-body">
            <div class="card form-card mb-3">
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="bi bi-tag-fill me-2"></i>
                    Nombre:
                  </label>
                  <input 
                    v-model="formData.name" 
                    type="text" 
                    class="form-control" 
                    placeholder="Ingrese el nombre de la marca" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveForm">
              <i class="bi bi-floppy me-2"></i> {{$t('search_view.save')}}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="closeModalForm">
              <i class="bi bi-x-circle me-2"></i> {{$t('search_view.cancel')}}
            </button>
          </div>
        </ModalComponent>

        <ToastComponent 
          :title="toastTitle" 
          :message="toastMessage" 
          :isSuccess="isSuccess" 
          :show.sync="showToastFlag"
          ref="toastComponent"
        />

        <ConfirmPopup 
          ref="confirmPopup" 
          :title="$t('search_view.alert_confirm_title')" 
          :question="$t('search_view.alert_confirm_question')" 
          @response="handleResponse" 
        />

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
    const toastComponent = ref(null);
    const confirmPopup = ref(null);
    let formDelete = {}

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: t('business_type.name') },
      { key: 'code', label: t('business_type.code') },
    ];

    const resultActions = [
        { label: 'Editar', class: 'btn btn-outline btn-sm', method: editForm, icon: '<i class="bi bi-pencil-square"></i>' },
        { label: 'Eliminar', class: 'btn btn-sm btn-danger', method: confirmDelete, icon: '<i class="bi bi-trash3"></i>'},
    ];

    const getBusinessTypes = async () => {
      isLoading.value = true;
        try {
            const response = await axios.post('https://apis.madautomate.cloud/webhook/7279e62e-5ab0-4f43-9707-c1ff44e95d89', {action: "databrands"}, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            if (response && response.data && Array.isArray(response.data)) {
              forms.value = response.data;
            }
        } catch (error) {
            console.error('getPageForms', error);
        } finally {
            isLoading.value = false;
        }
    };

    const handleResponse = (confirmed) => {
      deleteForm()
    };

    function editForm(item) {
        editingIndex.value = item;
        formData.value = item;
        openModalForm();
    }

    const openModalForm = () => {
        if(!editingIndex.value){
          cleanData();
        }
        formModal.value.openModal();
    };

    function confirmDelete(item, index) {
        formDelete = item;
        confirmPopup.value.showConfirmPopup();
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
        dataToSend.action = "savebrand";

        let url = 'https://apis.madautomate.cloud/webhook/7279e62e-5ab0-4f43-9707-c1ff44e95d89';

        try {
            const response = await axios.post(url,dataToSend, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
            });
            await getBusinessTypes();
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
        formDelete.action = "deletebrand";
        try {
          const response = await axios.post('https://apis.madautomate.cloud/webhook/7279e62e-5ab0-4f43-9707-c1ff44e95d89',formDelete, {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });

          if (response.status === 200) {
            const index = forms.value.findIndex(f => f.id === formDelete.id);
            if (index !== -1) {
              forms.value.splice(index, 1);
            }
            setTimeout(() => {
              triggerToast('Realizado!', 'Producto eliminado!', true);
            }, 1000)
            await getBusinessTypes();
          }
        } catch (error) {
          console.error('deleteForm', error)
          triggerToast('Error', 'Error al borrar el producto', false);
        } finally {
          isLoading.value = false;
        }
      };

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

<style scoped>
/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-section h2 {
  margin: 0;
  color: #1f2937;
  font-weight: 700;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(57, 57, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 57, 255, 0.3);
}

.header-divider {
  margin: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
}

/* Data Card */
.data-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Form Card dentro del Modal */
.form-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.form-card .form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-card .form-control {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  transition: all 0.2s ease;
}

.form-card .form-control:focus {
  border-color: #3939ff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}

/* Modal Footer Buttons */
.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-footer .btn-primary {
  background: #3939ff;
  border-color: #3939ff;
}

.modal-footer .btn-primary:hover {
  background: #2323cc;
  border-color: #2323cc;
  transform: translateY(-1px);
}

.modal-footer .btn-outline-secondary:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }
}
</style>