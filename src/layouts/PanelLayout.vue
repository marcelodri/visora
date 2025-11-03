<template>
    <SidebarComponent :isSidebarVisible="isSidebarVisible"/>
    <ToastComponent v-if="toastMessage" :message="toastMessage" :isSuccess="isSuccess" />
    <MenuPanelComponent @toggleSidebar="toggleSidebar"/>

    <div id="main">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    
                    
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12 col-xl-10 offset-xl-2 pl-xl-10">
                                <router-view /> <!-- Renderizará las vistas hijas -->
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        </div>
        <FooterComponent />
    </div>
    
</template>

<script>
import SidebarComponent from '@/components/SidebarComponent.vue';
import MenuPanelComponent from '@/components/MenuPanelComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';

export default {
    components: {
        SidebarComponent,
        MenuPanelComponent,
        FooterComponent,
        ToastComponent
    },
    data() {
        return {
            toastMessage: '',
            isSuccess: true,
            isSidebarVisible: false
        };
    },
    provide() {
        return {
            showToast: this.showToast
        };
    },
    methods: {
        showToast(message, isSuccess = true) {
            this.toastMessage = message;
            this.isSuccess = isSuccess;
            // Automáticamente ocultar el toast después de 3 segundos
            setTimeout(() => {
                this.toastMessage = '';
            }, 3000);
        },
        toggleSidebar() {
           this.isSidebarVisible = !this.isSidebarVisible;
        }
    }
};
</script>

<style scoped lang="scss">
#main { padding-top: 100px; .container-fluid {min-height: 75vh}}

@media(max-width: 769px) {
    #main { padding-top: 60px;}
}


</style>
