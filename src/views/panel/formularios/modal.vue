<template>
    <div class="modal-body">

        <div class="card mb-3">
            <div class="card-body">
            <div class="mb-3">
                <label class="form-label">Dominio:</label>
                <input v-model="formData.dominio" type="text" class="form-control" />
            </div>
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
</template>