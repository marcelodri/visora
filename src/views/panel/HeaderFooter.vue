<template>
    <div class="container-fluid mt-4 page">
        <h2>Footer</h2>
        <hr><br>

        <div class="card mt-5">
            <div class="card-body p-4">

                <div class="mb-5">
                    <label class="form-label">Logo footer</label>

                    <!-- Input file oculto -->
                    <input 
                    type="file" 
                    class="d-none" 
                    id="fileInput" 
                    @change="handleImageUpload" 
                    />

                    <!-- Label que actúa como botón de carga -->
                    <label for="fileInput" class="form-control">
                    {{ formData.fileName || 'Archivo permitidos "jpg", "jpeg", "png", "gif", "webp"' }}
                    </label>

                    <!-- Mostrar la imagen si existe -->
                    <div v-if="formData.image || formData.path" class="mt-2 position-relative">
                        <img 
                            :src="formData.image || `https://madcoder.io/apis/images_upload/${formData.path}`" 
                            alt="Imagen" 
                            class="img-fluid" 
                        />
                        <!-- Botón para borrar la imagen -->
                        <div style="position: absolute; top:0; right: 0">
                            <button
                                v-if="formData.image || formData.path"
                                class="btn btn-danger mt-2"
                                @click="removeImage"
                            >
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>

                    </div>


                    
                </div>

                <div class="mb-5">
                    <label class="form-label">Footer Columna izquierda</label>
                    <QuillEditor
                    v-model:content="formData.footer_left"
                    contentType="html"
                    style="height: 300px"
                    theme="snow"
                    :options="editorOptions"

                    /> 
                </div>
                <div>
                    <label class="form-label">Footer Columna derecha</label>
                    <QuillEditor
                    v-model:content="formData.footer_right"
                    contentType="html"
                    style="height: 300px"
                    theme="snow"
                    :options="editorOptions"
                    />
                </div>
            </div>
        </div><br>

        <div class="mt-5">
            <button type="button" class="btn float-right" @click="saveFormFooter"><i class="bi bi-floppy"></i> {{$t('search_view.save')}}</button>
        </div>


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
    import ModalComponent from '@/components/ModalComponent.vue';
    import ToastComponent from '@/components/ToastComponent.vue';
    import ConfirmPopup from '@/components/ConfirmPopup.vue';
    import { useI18n } from "vue-i18n";
    
    export default {
      components: {
        DataTableComponent,
        ModalComponent,
        ToastComponent,
        ConfirmPopup,
      },
      setup() {
        const { t } = useI18n();
        const forms = ref([]);
        const formData = ref(getEmptyForm());
        // const formDataAbout = ref(getEmptyFormAbout());
        const editingIndex = ref(null);
        const isLoading = ref(false);
        const showToastFlag = ref(false);
        const toastTitle = ref('');
        const toastMessage = ref('');
        const toastComponent = ref(null); // Referencia del ToastComponent
        const isSuccess = ref(true);
        const formModal = ref(null);
        const token = ref(null);
        const confirmPopup = ref(null);
        let formDelete = {};
        const urlGetData = 'https://stage.powerflows.pilotcrm.io/api/about_cards/';
        const urlCreate = 'https://stage.powerflows.pilotcrm.io/api/about_cards/create';
        const utlUpdate = 'https://stage.powerflows.pilotcrm.io/api/about_cards/update';
        const urlDelete = 'https://stage.powerflows.pilotcrm.io/api/about_cards/delete';
        const urlGetDataAbout = 'https://stage.powerflows.pilotcrm.io/api/header_footer';
        const utlUpdateAbout = 'https://stage.powerflows.pilotcrm.io/api/about/update';


        const columns = [
          { label: 'Texto', key: 'text' },
          { label: 'Imagen', key: 'imageOrPath'}
        ];
        const resultActions = [
          { label: 'Editar', class: 'btn btn-sm', method: editForm },
          { label: 'Eliminar', class: 'btn btn-sm btn-danger', method: confirmDelete },
        ];
        const editorOptions = {
            modules: {
                toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                ['image', 'link'], // botón de imagen
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean'],
                ],
            },
        }

        // Cargar productos desde backend
        const fetchForms = async () => {
          isLoading.value = true;
          try {
            const response = await axios.get(urlGetData, {
              headers: {
                Authorization: `Bearer ${token.value}`,
              },
            });
            

            const data = response.data.data.map(item => ({
                ...item,
                imageOrPath: item.image || item.path
            }));
            forms.value = data;

          } catch (err) {
            console.error('Error al obtener productos', err);
            triggerToast('Error!', 'No se pudieron cargar los productos.', false);
          } finally {
            isLoading.value = false;
            
          }
        };
  
        const getToken = async () => {
          token.value = sessionStorage.getItem('token');
        };
  
        const removeImage = () => {
            formData.value.imageDelete = formData.value.fileName;
            formData.value.image = "";
            formData.value.path = "";
            formData.value.fileName = "";
        };

        // Guardar o editar producto
        const saveForm = async () => {
            isLoading.value = true;
            const dataToSend = { ...formData.value };
            let url = urlCreate;

            if (editingIndex.value !== null) {
                // editar
                forms.value[editingIndex.value] = dataToSend;
                url = utlUpdate;
            } else {
                // agregar
                forms.value.push(dataToSend);
            }

            //console.log('dataToSend', dataToSend)

            try {
                const response = await axios.post(url,dataToSend, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });
                //console.log('response', response)
                closeModalForm();
            } catch (err) {
                console.error(err);
                triggerToast('Error!', 'No se pudo guardar el producto.', false);
            } finally {
                isLoading.value = false;
            }
        };
  
        // Editar
        function editForm(item) {
            editingIndex.value = item;
            formData.value = item;
            openModalForm();
        }
  
        // Eliminar
        function confirmDelete(item, index) {
            formDelete = item;
            confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
        }
  
        // Abrir modal para nuevo
        const openModalForm = () => {
            if(!editingIndex){
                formData.value = getEmptyForm();
                editingIndex.value = null;
            }
            formModal.value.openModal();
        };
  
        const closeModalForm = () => {
            formModal.value.closeModal();
        };
  
        // Estructura base
        function getEmptyForm() {
            return {
                image: '',
                fileName: '',
                path: '',
                text: ''
            };
        }
  
        function getEmptyFormAbout() {
            return {
                title: '',
                description: '',
                footer_left: '',
                footer_right: ''
            };
        }
        const handleImageUpload = (event) => {
            const file = event.target.files[0];
            formData.value.fileName = file.name; // Guardar el nombre del archivo
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    formData.value.image = reader.result;
                };
                reader.readAsDataURL(file);
            }
        };
  
        const handleResponse = (isConfirmed) =>  {
            if (isConfirmed) {
                deleteForm(); // Llamamos a la función de eliminar solo si se confirmó
            } else {
                //console.log("El usuario canceló la acción.");
            }
        }
  
        const deleteForm = async () => {
            isLoading.value = true;

            try {

                const response = await axios.post(urlDelete,formDelete, {
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

                }

            } catch (error) {
                console.error('deleteForm', error)
                triggerToast('Error', 'Error al borrar el producto', false);
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
        
        const saveFormFooter = async () => {
            isLoading.value = true;
            //console.log('formData', formData.value)

            try {
                const response = await axios.post("https://stage.powerflows.pilotcrm.io/api/header_footer/update",formData.value, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });
                //console.log('response', response)
                triggerToast('ok!', 'Datos guardados correctamente!', true);
            } catch (err) {
                console.error(err);
                triggerToast('Error!', 'No se pudo guardar el producto.', false);
            } finally {
                isLoading.value = false;
            }
        };

        const getDataAbout = async () => {
            isLoading.value = true;

            try {
                const response = await axios.get(urlGetDataAbout, {
                    headers: {
                        Authorization: `Bearer ${token.value}`,
                    },
                });
                //console.log('response', response)
                formData.value = response.data;

            } catch (err) {
                console.error('Error al obtener productos', err);
                triggerToast('Error!', 'No se pudieron cargar los productos.', false);
            } finally {
                isLoading.value = false;
            }
        }


        getToken();
        getDataAbout();
        onMounted(fetchForms);
        

        return {
            t,
            forms,
            columns,
            resultActions,
            formData,
            editingIndex,
            openModalForm,
            closeModalForm,
            saveForm,
            isLoading,
            toastTitle,
            toastMessage,
            isSuccess,
            showToastFlag,
            formModal,
            handleImageUpload,
            getToken,
            handleResponse,
            confirmPopup,
            deleteForm,
            triggerToast,
            toastComponent,
            removeImage,
            saveFormFooter,
            getDataAbout,
            urlGetDataAbout,
            utlUpdateAbout,
            // formDataAbout,
            editorOptions
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