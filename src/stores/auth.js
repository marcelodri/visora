import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false, // Estado de autenticación
    user: null, // Para almacenar los datos del usuario
  }),
  actions: {
    login(userData) {
      this.isAuthenticated = true;
      this.user = userData; // Guardar los datos del usuario
    },
    setMenu(menuData) {
      this.menu = menuData;
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null; // Limpiar los datos del usuario al cerrar sesión
    },
  },
  persist: true // Puedes usar pinia-plugin-persistedstate si necesitas persistir el estado
});
