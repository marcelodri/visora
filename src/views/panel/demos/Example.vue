<template>
    <div class="container-fluid mt-4 page">
        <h2>Templates</h2>
        <hr><br>

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
    import { ref, onMounted, onUnmounted  } from 'vue';
    import axios from 'axios';
    import DataTableComponent from '@/components/DataTableComponent.vue';
    import ToastComponent from '@/components/ToastComponent.vue';
    import ConfirmPopup from '@/components/ConfirmPopup.vue';
    import { useI18n } from "vue-i18n";
    import "codemirror/mode/javascript/javascript.js";
    import Codemirror from "codemirror-editor-vue3";

    export default {
      components: {
        DataTableComponent,
        ToastComponent,
        ConfirmPopup,
        Codemirror
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
</style>