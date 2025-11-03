<template>
    <div class="container-fluid mt-4 page">
        <h2>{{$t('about.title')}}</h2>
        <hr><br>

        <div class="card">
            <div class="card-body p-4">
                <button @click="openModalForm()" class="btn float-left"><i class="bi bi-plus-circle"></i> {{$t('about.form_new')}}</button>
            </div>
        </div><br>
  
        <div class="card mb-5">
            <div class="card-body p-4">
                <DataTableComponent
                    :data="forms"
                    :columns = "columns"
                    :actions="resultActions"
                    :items-per-page="10"
                    :marcas="marcas"
                    :negocios="negocios"
                />
            </div>
        </div>
  

        <!-- Modal para preguntar si desea guardar la consulta -->
        <ModalComponent ref="formModal" modalId="formModal" :modalTitle="editingIndex === null ? 'Nuevo Producto' : 'Editar Producto'" class="modal-xl" @modalClosed="handleCloseModal">
        <div class="modal-body">

            <div class="card mb-3">
                <div class="card-body">
                <div class="mb-3">
                    <!-- MARCAS -->
                    <label class="form-label">{{ $t('menu.brands') }}:</label>
                    <select v-model="formData.marca_id" class="form-select">
                    <option value="">Seleccione una marca</option>
                    <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                        {{ marca.name }}
                    </option>
                    </select>

                </div>
                <div class="mb-3">
                    <label class="form-label">{{ $t('menu.business-types') }}:</label>
                    <!-- NEGOCIOS -->
                    <select v-model="formData.tipo_de_negocio_id" class="form-select">
                    <option value="">Seleccione un tipo de negocio</option>
                    <option v-for="negocio in negocios" :key="negocio.id" :value="negocio.id">
                        {{ negocio.name }}
                    </option>
                    </select>
                </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">{{ $t('forms.form_img') }}:</label>

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

                            <div style="position:absolute; top:0; right: 0">
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
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">{{$t('about.form_text')}}:</label>
                        <QuillEditor
                        ref="quillEditor"
                        v-model:content="formData.text"
                        contentType="html"
                        style="height: 100px"
                        theme="snow"
                        /> 
                    </div>
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
        const marcas = ref([]);
        const negocios = ref([]);
        const formData = ref(getEmptyForm());
        const formDataAbout = ref(getEmptyFormAbout());
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
        const urlGetDataAbout = 'https://stage.powerflows.pilotcrm.io/api/about/';
        const utlUpdateAbout = 'https://stage.powerflows.pilotcrm.io/api/about/update';
        
        const columns = [
            { label: t('about.list_text'), key: 'text' },
            { label: t('about.list_image'), key: 'imageOrPath'},
            { label: 'Marca', key: 'marca_name'},
            { label: 'Negocio', key: 'tipo_de_negocio_name'}
        ];
        const resultActions = [
            { label: t('about.list_edit'), class: 'btn btn-sm', method: editForm, icon: '<i class="bi bi-pencil-square"></i>' },
            { label: t('about.list_delete'), class: 'btn btn-sm btn-danger', method: confirmDelete, icon: '<i class="bi bi-trash3"></i>' },
        ];
  
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
                console.log('forms', forms)
            } catch (err) {
                console.error('Error al obtener productos', err);
                triggerToast('Error!', t('forms.message_error'), false);
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
                await fetchForms();
                triggerToast('Ok!', t('forms.message_success'), true);
            } catch (err) {
                console.error(err);
                triggerToast('Error!', t('forms.message_error'), false);
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
            if(!editingIndex.value){
                formData.value = getEmptyForm();
                editingIndex.value = null;
            }
            formModal.value.openModal();
        };
  
        const cleanData = () => {
            editingIndex.value = null;
            formData.text = '';
        };
        
        const closeModalForm = () => {
            cleanData()
            formModal.value.closeModal();
        };
  
        const handleCloseModal = () => {
            cleanData()
            // acá hacés lo que necesites cuando el modal se cierre
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
                    fetchForms()
                    setTimeout(() => {
                        triggerToast('Ok!', t('forms.message_success'), true);
                    }, 1000)

                }

            } catch (error) {
                console.error('deleteForm', error)
                triggerToast('Error!', t('forms.message_error'), false);

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
        
        const saveFormAbout = async () => {
            isLoading.value = true;
            const dataToSend = { 
                id: formDataAbout.value.id,
                title: formDataAbout.value.title,
                description: formDataAbout.value.description,
                footer_left: formDataAbout.value.footer_left,
                footer_right: formDataAbout.value.footer_right
            };
            //console.log('dataToSend', dataToSend)

            try {
                const response = await axios.post(utlUpdateAbout,dataToSend, {
                    headers: { Authorization: `Bearer ${token.value}` },
                });
                //console.log('response', response)
                triggerToast('Ok!', t('forms.message_success'), true);

            } catch (err) {
                console.error(err);
                triggerToast('Error!', t('forms.message_error'), false);
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
                formDataAbout.value = response.data;

            } catch (err) {
                console.error('Error al obtener productos', err);
                triggerToast('Error!', t('forms.message_error'), false);
            } finally {
                isLoading.value = false;
            }
        }
        const getMarcas = async () => {

            const response = await axios.get('https://stage.powerflows.pilotcrm.io/api/2032240b-4b30-403a-8834-b843bf21ba6b', {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            console.log('response', response.data);

            if (response && response.data && Array.isArray(response.data)) {
            marcas.value = response.data; // 🔁 Carga los datos en el datatable
            }

        };

        const getTiposDeNegocios = async () => {

            const response = await axios.get('https://stage.powerflows.pilotcrm.io/api/29786bbb-1c7a-4622-8a06-8183bec1c4d7', {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            console.log('response', response.data);

            if (response && response.data && Array.isArray(response.data)) {
            negocios.value = response.data; // 🔁 Carga los datos en el datatable
            }

        };
        

        getToken();
        getMarcas();
        getTiposDeNegocios();
        onMounted(fetchForms);
        getDataAbout();

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
            saveFormAbout,
            getDataAbout,
            urlGetDataAbout,
            utlUpdateAbout,
            formDataAbout,
            handleCloseModal,
            getMarcas,
            getTiposDeNegocios,
            marcas,
            negocios
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