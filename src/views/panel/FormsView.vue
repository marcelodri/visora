<template>
    <div class="container-fluid mt-4 page">
      <h2>{{ $t('forms.title') }}</h2>
      <hr><br>

      <div class="card">
        <div class="card-body p-4">
          <button @click="openModalForm()" class="btn float-left"><i class="bi bi-plus-circle"></i> {{ $t('forms.button_mas') }}</button>
        </div>
      </div><br>

      <div class="card">
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
      <ModalComponent ref="formModal" modalId="formModal" :modalTitle="editingIndex === null ? 'Nuevo Formulario' : 'Editar Formulario'" class="modal-xl" @closeModal="handleCloseModal">
        <div class="modal-body">

          <div class="card mb-3">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.form_name') }}:</label>
                <input v-model="formData.name" type="text" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.form_code') }}:</label>
                <input v-model="formData.code" type="text" class="form-control" />
              </div>
            </div>
          </div>

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
                  {{ formData.fileName || "Seleccionar archivo..." }}
                </label>

                <!-- Mostrar la imagen si existe -->
                <div v-if="formData.image || formData.path" class="mt-2 position-relative">
                  <img 
                    :src="formData.image || `https://madcoder.io/apis/images_upload/${formData.path}`" 
                    alt="Imagen" 
                    class="img-fluid" 
                  />

                  <div style="position: absolute; top: 0; right: 0">
                  <button 
                    class="btn btn-danger mt-2"
                    @click="removeImage"
                  >
                  <i class="bi bi-trash3"></i>
                  </button>
                  </div>

                </div>


                <!-- Botón para borrar la imagen -->
                
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.form_title') }}:</label>
                <input v-model="formData.header_text" type="text" class="form-control" />
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.form_subtitle') }}:</label>
                <input v-model="formData.header_subtext" type="text" class="form-control" />
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.form_descript') }}:</label>
                <textarea class="form-control" v-model="formData.header_descript" style="height:160px"></textarea>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <label class="form-label">{{ $t('forms.form_fields') }}:</label><br>
              
              <div v-for="(field, fieldIndex) in formData.fields" :key="fieldIndex" class="mb-3 border p-3 rounded">

                <div class="d-flex py-4">
                  <div class="w-50 mr-2">
                    <div class="form-check mt-2">
                      <input type="checkbox" class="form-check-input" v-model="field.hidden" id="hidden{{ fieldIndex }}" />
                      <label class="form-check-label" :for="'hidden' + fieldIndex">Hidden</label>
                    </div>
                  </div>
                  <div class="w-50 mr-2">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" v-model="field.required" id="required{{ fieldIndex }}" />
                      <label class="form-check-label" :for="'required' + fieldIndex">Requerido</label>
                    </div>
                  </div>                    
                </div>

                <div class="row py-4">
                  <div class="col-4">
                    <label class="form-label">{{ $t('forms.form_field_label') }}:</label>
                    <input v-model="field.label" class="form-control" placeholder="Etiqueta del campo" />
                  </div>
                  <div class="col-4">
                    <label class="form-label">{{ $t('forms.form_field_name') }}:</label>
                    <input v-model="field.name" class="form-control" placeholder="Nombre del campo" />
                  </div>
                  <div class="col-4">
                    <label class="form-label">{{ $t('forms.form_field_value') }}:</label>
                    <input v-model="field.value" class="form-control" placeholder="Valor por defecto" />
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label">{{ $t('forms.form_field_type') }}:</label>
                  <select v-model="field.type" class="form-select">
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="email">Email</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>

                  <div v-if="field.type === 'select'" class="my-3 bg-light p-4 rounded">
                    <h5>{{ $t('forms.form_field_options') }}</h5>
                    <div v-for="(option, optIndex) in field.options" :key="optIndex" class="d-flex gap-2 mb-2">
                      <div class="d-flex w-100">
                        <!-- Input para el texto de la opción -->
                        <div class="w-50 mr-2">
                          <input v-model="option.text" class="form-control h-100" placeholder="Texto" />
                        </div>
                        <!-- Input para el valor de la opción -->
                        <div class="w-50 ml-2">
                          <input v-model="option.value" class="form-control h-100" placeholder="Valor" />
                        </div>
                      </div>
                      <!-- Botón para eliminar la opción -->
                      <button class="btn btn-danger" @click="removeOption(fieldIndex, optIndex)">X</button>
                    </div>
                    <!-- Botón para agregar una nueva opción -->
                    <button class="btn btn-secondary mb-2" @click="addOption(fieldIndex)">
                      <i class="bi bi-node-plus"></i> {{ $t('forms.form_field_button') }}
                    </button>
                  </div>

                </div>

                <div class="text-right">
                  <button class="btn btn-danger mt-2 btn-sm" @click="removeField(fieldIndex)"><i class="bi bi-trash"></i></button>
                </div>

              </div>

              <button class="btn btn-primary my-3" @click="addField"><i class="bi bi-plus-circle"></i> Agregar Campo</button>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div>
                <label class="form-label">{{ $t('forms.form_servicie') }}:</label>
                <select class="form-select" v-model="formData.service" readonly>
                  <option value="pilot" selected >PILOT</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.message_success') }}:</label>
                <textarea class="form-control" v-model="formData.success"></textarea>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">{{ $t('forms.message_error') }}:</label>
                <textarea class="form-control" v-model="formData.error"></textarea>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body p-4">
                <div class="mb-3">
                    <label class="form-label">Product Title</label>
                    <input v-model="formData.product_title" type="text" class="form-control" placeholder="Ej: Yaris" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Product Descripción</label>
                    <!-- <QuillEditor
                    ref="quillEditorRef1"
                    v-model:content="formData.product_description"
                    contentType="html"
                    style="height: 200px"
                    theme="snow"
                    />  -->
                    <textarea class="form-control" v-model="formData.product_description" style="height: 200px"></textarea>
                </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body p-4">
                <div class="mb-3">
                    <label class="form-label">About Title</label>
                    <input v-model="formData.about_title" type="text" class="form-control" placeholder="Ej: Yaris" />
                </div>
                <div class="mb-3">
                    <label class="form-label">About Descripción</label>
                    <!-- <QuillEditor
                    ref="quillEditorRef2"
                    v-model:content="formData.about_description"
                    contentType="html"
                    style="height: 200px"
                    theme="snow"
                    />  -->
                    <textarea class="form-control" v-model="formData.about_description" style="height: 200px"></textarea>
                </div>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn" @click="saveForm" title="Guardar cambios"><i class="bi bi-floppy"></i> {{$t('search_view.save')}}</button>
          <button type="button" class="btn" @click="closeModalForm" title="Cancelar cambios"><i class="bi bi-x-circle"></i> {{$t('search_view.cancel')}}</button>
        </div>
      </ModalComponent>

      <ModalComponent ref="styleModal" modalId="styleModal" :modalTitle="'Estilo de formulario'" class="modal-xl">
        <div class="modal-body">
          
          <h5 class="mb-4">{{$t('menu.templates')}}</h5>
          <div class="card mb-4">
            <div class="card-body">
              <div class="mb-3">
                <label for="selectedStyleOption" class="form-label">{{$t('menu.styles')}}</label>
                <select
                  id="selectedStyleOption"
                  v-model="formData.selectedStyleOption"
                  class="form-select"
                >
                  <option disabled value="">Selecciona un template</option>
                  <option v-for="(item, index) in styleOptions" :key="index" :value="item.code">
                    {{ item.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <br>
          <h5 class="mb-4">Colores</h5>
          <div class="card mb-4">
            <div class="card-body">
              <div v-for="(color, key) in formData.colorOptions" :key="key" class="mb-3 row">
                <label :for="key" class="col-sm-3 col-form-label">{{ color.label }}</label>
                <div class="col-sm-3">
                  <input type="color" class="form-control form-control-color" :id="key" v-model="formData.colorOptions[key].value">
                </div>
                <div class="col-sm-6">
                  <input type="text" class="form-control" v-model="formData.colorOptions[key].value">
                </div>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn" @click="saveStyleForm" title="Guardar cambios"><i class="bi bi-floppy"></i> {{$t('search_view.save')}}</button>
          <button type="button" class="btn" @click="closeStyleModalForm" title="Cancelar cambios" ><i class="bi bi-x-circle"></i> {{$t('search_view.cancel')}}</button>
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
  import { ref, getCurrentInstance, onMounted, nextTick } from 'vue';
  import axios from 'axios';
  import DataTableComponent from '@/components/DataTableComponent.vue';
  import ModalComponent from '@/components/ModalComponent.vue';
  import ToastComponent from '@/components/ToastComponent.vue'; // Asegúrate de ajustar la ruta
  import ConfirmPopup from '@/components/ConfirmPopup.vue'
  import { useI18n } from "vue-i18n";

  export default {
    components: {
      ModalComponent,
      DataTableComponent,
      ToastComponent,
      ConfirmPopup
    },
    setup() {

      const { t } = useI18n();
      const instance = getCurrentInstance();
      const forms = ref([]);
      const marcas = ref([]);
      const negocios = ref([]);
      const formDataForm = ref({title: "", description: ""})
      const isModalOpen = ref(false);
      const editingIndex = ref(null);
      const formData = ref({ name: '', image: '', fields: [], service: "pilot", header_text: "", header_subtext: "", header_descript: "", colorOptions:{}, selectedStyleOption:"cycles", status: "inactive", about_title:"",about_description:"", product_title: "", product_description: ""  });
      const token = ref(null);
      const isLoading = ref(false);
      const formModal = ref(null);
      const styleModal = ref(null);
      const toastTitle = ref('');
      const toastMessage = ref('');
      const isSuccess = ref(true);
      const toastComponent = ref(null); // Referencia del ToastComponent
      const showToastFlag = ref(false);
      const confirmPopup = ref(null);
      let formDelete = {};
      // const quillEditorRef1 = ref(null);
      // const quillEditorRef2 = ref(null);

      onMounted(() => {
        confirmPopup.value = instance?.proxy?.$refs.confirmPopup; // Acceder a $refs en onMounted
      });

      const styleOptions = ref([
        { id: 1, name:"Clásico", image: "https://via.placeholder.com/100", code: "clasic" },
        { id: 2, name: "Moderno", image: "https://via.placeholder.com/100", code: "modern"  },
        { id: 3, name: "Elegante", image: "https://via.placeholder.com/100", code: "elegant"  },
        { id: 4, name: "Cycles", image: "https://via.placeholder.com/100", code: "cycles"  }
      ]);

      const columns = ref([
        { label: t("forms.list_one"), key: 'name' },
        { label: t("forms.list_two"), key: 'code' },
        { label: t("forms.list_three"), key: 'service' },
        { label: t("menu.brands"), key: 'marca_name' },
        { label: t("menu.business-types"), key: 'tipo_de_negocio_name' }
      ]);

      const colorOptions = ref({
        background: { label: 'Background Color', value: '#ffffff', code: "bg_form" },
        inputs: { label: 'Inputs Color', value: '#f8f9fa', code: "bg_input" },
        text: { label: 'Text Color', value: '#000000', code: "tx_form" },
        placeholder: { label: 'Placeholder Color', value: '#6c757d', code: "pl_form" },
        buttonBg: { label: 'Botón Background Color', value: '#007bff', code: "btn_bg_form" },
        buttonBorder: { label: 'Botón Border Color', value: '#007bff', code: "btn_border_form" },
        buttonText: { label: 'Botón Text Color', value: '#ffffff', code: "btn_txt_form" },
      });
  
      const openModalForm = (index = null) => {
        editingIndex.value = index;
        if (index !== null) {
          formData.value = index;
        } else {
          console.log('formData.value',formData.value);
          formData.value = { name: '', image: '', fields: "", service: "pilot", header_text: "", header_subtext: "", header_descript: "", colorOptions:colorOptions.value, selectedStyleOption:"cycles", status: "inactive", about_title:"",about_description:"", product_title: "", product_description: ""};
        }
        formModal.value.openModal();
      };
  
      const closeModalForm = () => {
        // Limpia ambos editores
        // if (quillEditorRef1.value) {
        //   quillEditorRef1.value.setHTML('');
        //   quillEditorRef1.value.setText('');
        // }
        
        // if (quillEditorRef2.value) {
        //   quillEditorRef2.value.setHTML('');
        //   quillEditorRef2.value.setText('');
        // }
        
        // Resetea los datos
        formData.value = { 
          name: '', 
          image: '', 
          fields: [], 
          about_title: "",
          about_description: "", 
          product_title: "", 
          product_description: ""
        };
        
        formModal.value.closeModal();
      };
  
      const closeStyleModalForm = () => {
        styleModal.value.closeModal();
      }

      const handleCloseModal = () => {
        closeModalForm();
        closeStyleModalForm();
        // acá hacés lo que necesites cuando el modal se cierre
      };

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
  
      const addField = () => {
        // Verificamos si fields está vacío o es una cadena vacía
        if (!formData.value.fields || formData.value.fields === "") {
          formData.value.fields = []; // Si es vacío o cadena vacía, lo transformamos en un array vacío
        }
        formData.value.fields.push({ label: '', name: '', type: 'text', hidden: false, required: false, options: [] });
      };
  
      const removeField = (index) => {
        formData.value.fields.splice(index, 1);
      };
  
      const addOption = (fieldIndex) => {
        formData.value.fields[fieldIndex].options.push({
          text: "", // Campo para el texto visible en el select
          value: "", // Campo para el valor de la opción
        });
      };
  
      const removeOption = (fieldIndex, optIndex) => {
        formData.value.fields[fieldIndex].options.splice(optIndex, 1);
      };
  
      const saveForm = () => {
        if (editingIndex.value === null) {
          instance.proxy.createForm(JSON.parse(JSON.stringify(formData.value)));
        } else {
          forms.value[editingIndex.value] = JSON.parse(JSON.stringify(formData.value));
          instance.proxy.updateForm(JSON.parse(JSON.stringify(formData.value)));
        }
        closeModalForm();
      };
  
      const duplicateForm = (index = null) => {
        const original = index;
        let baseName = original.name.replace(/_copy_\d+$/, '').replace(/_copy$/, '');
        let newName = baseName + '_copy';
        let baseCode = original.code.replace(/_copy_\d+$/, '').replace(/_copy$/, '');
        let newCode = baseCode + '_copy';
        let count = 1;
        while (forms.value.some((f) => f.name === newName)) {
          count++;
          newName = `${baseName}_copy_${count}`;
          newCode = `${baseCode}_copy_${count}`;
        }
        const newForm = JSON.parse(JSON.stringify(original));
        newForm.name = newName;
        newForm.code = newCode;
        newForm.duplicateForm = true;
        createForm(newForm);
      };
  
      const deleteForm = async () => {
        isLoading.value = true;

        try {
          const response = await axios.post('https://stage.powerflows.pilotcrm.io/api/60571f16-f90a-44c7-ad73-57fe40657859',formDelete, {
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
            await getForms();

            setTimeout(() => {
              triggerToast('Realizado!', 'Formulario eliminado!', true);
            }, 1000)
          }
        } catch (error) {
          console.error('Error al obtener las columnas:', error);
          triggerToast('Error!', 'Al querer borrar un formulario', false);
        } finally {
          isLoading.value = false;
        }

      };
      
      const handleResponse = (isConfirmed) =>  {
        if (isConfirmed) {
            //console.log("El usuario confirmó la acción.");
            deleteForm(); // Llamamos a la función de eliminar solo si se confirmó
        } else {
            //console.log("El usuario canceló la acción.");
        }
      }

      const confirmDelete = (form) => {
        form.imageDelete = formData.value.fileName;
        form.image = "";
        form.fileName = "";
        formDelete = form;
        confirmPopup.value.showConfirmPopup(); // Mostramos el popup de confirmación
      }

      const selectedDefault = async (selectedForm) => {
        try {
          await setDefaultForm(selectedForm);

          forms.value.forEach(form => {
            form.default = (form.id === selectedForm.id) ? true : null;
          });

        } catch (error) {
          console.error('Error al actualizar el formulario:', error);
        }
      }



      // Métodos externos (equivalentes a los de methods)
      const getToken = async () => {
        token.value = sessionStorage.getItem('token');
      };
  
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






      const getForms = async () => {
        isLoading.value = true;

        try {
          const response = await axios.get('https://stage.powerflows.pilotcrm.io/api/forms', {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          });

          console.log('response', response.data.data);

          if (response.data.data.length > 0 && Object.keys(response.data.data[0]).length > 0) {
            // Función para convertir imagen a base64
            forms.value = await Promise.all(
              response.data.data.map(async (form) => {
                return {
                  ...form,
                  fields: form.fields ? JSON.parse(form.fields) : [],
                  colorOptions: form.colorOptions ? JSON.parse(form.colorOptions) : []
                };
              })
            );
          }
        } catch (error) {
          console.error('Error al obtener las columnas:', error);
        } finally {
          isLoading.value = false;
        }
      };


      const createForm = async (data) => {

        data.fields = JSON.stringify(data.fields)

        if(!data.duplicateForm) {
          data.colorOptions = JSON.stringify(colorOptions.value);
        } else {
          data.colorOptions = JSON.stringify(data.colorOptions);
        }

        isLoading.value = true;
        try {
          const postdata = await axios.post('https://stage.powerflows.pilotcrm.io/api/forms/create', data, {
            headers: {
              Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
            },
          });
  
          if(postdata.status == 200) {

            data.id = postdata.data.id;
            data.fields = JSON.parse(data.fields)
            data.colorOptions = JSON.parse(data.colorOptions)
            
            forms.value.push(JSON.parse(JSON.stringify(data)));
            closeModalForm();
            await getForms();
            setTimeout(() => {
              triggerToast('Realizado!', 'Formulario creado!', true);
            }, 1000)
          }

        } catch (error) {
          console.error('Error al guardar la consulta:', error);
        } finally {
          isLoading.value = false;
        }
      };

      const updateForm = async (data) => {
        //console.log('updateForm', data);

        data.colorOptions = JSON.stringify(data.colorOptions)
        data.fields = JSON.stringify(data.fields)

        isLoading.value = true;
        try {
          const postdata = await axios.post('https://stage.powerflows.pilotcrm.io/api/dce43766-3a75-4a60-85e0-5f8e90cdb9a3', data, {
            headers: {
              Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
            },
          });
          if(postdata.status == 200) {
            await getForms();
            setTimeout(() => {
              triggerToast('Realizado!', 'Formulario actualizado!', true);
            }, 1000)
          }
          closeStyleModalForm();
        } catch (error) {
          console.error('Error al guardar la consulta:', error);
        } finally {
          isLoading.value = false;
        }



      };

      const setDefaultForm = async (data) => {
        isLoading.value = true;
        data.action= 'setdefault';
        try {
          const postdata = await axios.post('https://stage.powerflows.pilotcrm.io/api/a8340423-d251-4e12-8046-873176b04ac1', data, {
            headers: {
              Authorization: `Bearer ${token.value}`, // Añadir el token como Bearer Token
            },
          });
        } catch (error) {
          console.error('Error al guardar la consulta:', error);
        } finally {
          isLoading.value = false;
        }

      }


      const styleForm = async (index = null) => {
        editingIndex.value = index;
        formData.value = index;
        styleModal.value.openModal();
      }

      const saveStyleForm = async () => {
        // Crear una copia del formData y convertir colorOptions a string
        const formDataToSend = {
          ...formData.value,
          colorOptions: formData.value.colorOptions
        };
        instance.proxy.updateForm(formDataToSend); // Enviar la data corregida
      };

  
      const triggerToast = (title, message, success) => {
        toastTitle.value = title;
        toastMessage.value = message;
        isSuccess.value = success;
        toastComponent.value.showToas();
      };

      const removeImage = () => {
        formData.value.imageDelete = formData.value.fileName;
        formData.value.image = "";
        formData.value.path = "";
        formData.value.fileName = "";
      };

      const resultActions = [
        {
          label: "Establecer como defecto",
          class: 'btn btn-sm',
          method: selectedDefault,
          icon: (row) => row.default === true || row.default === 1
            ? '<i class="bi bi-star-fill"></i>'
            : '<i class="bi bi-star"></i>'
        },
        {
          label: t("forms.action_edit"),
          class: 'btn btn-sm',
          method: openModalForm,
          icon: '<i class="bi bi-pencil-square"></i>'
        },
          {
          label: t("forms.action_duplicate"),
          class: 'btn btn-sm',
          method: duplicateForm,
          icon: '<i class="bi bi-copy"></i>'
        },
        {
          label: t("forms.action_style"),
          class: 'btn btn-sm btn-style',
          method: styleForm,
          icon: '<i class="bi bi-image"></i>'
        },
        {
          label: t("forms.action_delete"),
          class: 'btn btn-danger btn-sm',
          method: confirmDelete,
          icon: '<i class="bi bi-trash3"></i>'
        }
      ];

      // Cargar las funciones al iniciar el componente
      getToken();
      getMarcas();
      getTiposDeNegocios();
      getForms();
  
      return {
        forms,
        isModalOpen,
        formData,
        editingIndex,
        openModalForm,
        closeModalForm,
        handleImageUpload,
        addField,
        removeField,
        addOption,
        removeOption,
        saveForm,
        duplicateForm,
        deleteForm,
        getToken,
        getForms,
        createForm,
        columns,
        resultActions,
        isLoading,
        formModal,
        styleModal,
        styleOptions,
        colorOptions,
        closeStyleModalForm,
        saveStyleForm,
        updateForm,
        triggerToast,
        toastComponent,
        toastTitle,
        toastMessage,
        isSuccess,
        showToastFlag,
        removeImage,
        confirmPopup,
        handleResponse,
        confirmDelete,
        formDataForm,
        handleCloseModal,
        selectedDefault,
        setDefaultForm,
        getMarcas,
        getTiposDeNegocios,
        negocios,
        marcas

      };

    },
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
    .btn-style {
      border-color: cadetblue;
      color: cadetblue;
    }
    .btn-style:hover {
      color: white;
      background-color: cadetblue!important;
    }
  </style>