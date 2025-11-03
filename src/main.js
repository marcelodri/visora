import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n'; // Importar configuración de i18n
import { createPinia } from 'pinia'; // Importa Pinia
import piniaPersistedState from 'pinia-plugin-persistedstate';
import LoadingDots from './components/LoadingComponent.vue'; // Importa el componente
import { useAuthStore } from '@/stores/auth';

// import { QuillEditor } from '@vueup/vue-quill'
// import '@vueup/vue-quill/dist/vue-quill.snow.css';

import { QuillEditor } from '@rafaeljunioxavier/vue-quill-fix';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

// Importar Bootstrap y Bootstrap-Sass personalizado
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Si no quieres usar Sass, mantén esto
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importar Vuetify y sus estilos
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Estilos de Vuetify

// Importar archivo de estilo personalizado con Bootstrap modificado (opcional)
import '@/assets/styles/custom.scss';

// Si tienes estilos propios, mantén la importación de 'main.css'
import './assets/main.css';

import AOS from 'aos';
import 'aos/dist/aos.css'; // Importa el archivo CSS de AOS


import { InstallCodeMirror } from "codemirror-editor-vue3";

const vuetify = createVuetify(); // Crear instancia de Vuetify

const app = createApp(App);

// Configura Pinia
const pinia = createPinia();
pinia.use(piniaPersistedState);
app.use(pinia); // Usa Pinia en la aplicación

// Usa Vuetify
app.use(vuetify);
app.use(i18n) // Usar i18n

//app.use(QuillEditor)

// Registro global del componente LoadingDots
app.component('LoadingDots', LoadingDots);
app.component('QuillEditor', QuillEditor);
app.use(InstallCodeMirror);
app.use(router);

app.mount('#app');

AOS.init();