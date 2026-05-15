<template>
    <SidebarComponent 
      :isVisible="isSidebarVisible" 
      @closeSidebar="isSidebarVisible = false"
    />
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
import { useAuthStore } from '@/stores/auth';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

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
            isSidebarVisible: false,
            inactivityTimer: null,
            inactivityEvents: ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
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
        },
        resetInactivityTimer() {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) return;

            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
            }

            this.inactivityTimer = setTimeout(() => {
                this.handleInactivityLogout();
            }, INACTIVITY_TIMEOUT_MS);
        },
        handleUserActivity() {
            this.resetInactivityTimer();
        },
        setupInactivityTracking() {
            this.inactivityEvents.forEach((eventName) => {
                window.addEventListener(eventName, this.handleUserActivity, { passive: true });
            });
            this.resetInactivityTimer();
        },
        cleanupInactivityTracking() {
            this.inactivityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, this.handleUserActivity);
            });
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
                this.inactivityTimer = null;
            }
        },
        handleInactivityLogout() {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) return;

            authStore.logout();
            this.$router.push({ name: 'login', query: { reason: 'inactive' } });
        }
    },
    mounted() {
        this.setupInactivityTracking();
    },
    beforeUnmount() {
        this.cleanupInactivityTracking();
    }
};
</script>

<style scoped lang="scss">
#main { padding-top: 80px; .container-fluid {min-height: 75vh}}

@media(max-width: 769px) {
    #main { padding-top: 60px;}
}


</style>
