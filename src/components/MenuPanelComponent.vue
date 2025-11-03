<template>
  <div id="menuPanel">
    <div class="container-fluid px-5">
      <div class="row">

        <div class="col-4 ">
          <div class="d-flex">

            <!-- Botón hamburguesa solo visible en móvil -->
            <button class="btn-outline-secondary d-md-none me-4 pt-2" @click="$emit('toggleSidebar')">
              <i class="bi bi-list"></i>
            </button>

            <div class="logo">
              <a href="/" style="text-decoration: none">
                <span>visora</span>
              </a>
            </div>

          </div>
        </div>

        <div class="col-8 text-end">
          <nav>

            <div>
              <button v-if="this.$i18n.locale == 'es'" class="btn-menu btn-transparent" @click="changeLanguage('en')">EN</button>
              <button v-if="this.$i18n.locale == 'en'" class="btn-menu btn-transparent" @click="changeLanguage('es')">ES</button>
            </div>

            <button class="btn-menu btn-transparent" @click="changeBg">
              <span v-if="isDarkMode" class="bi bi-lightbulb-off-fill"></span>
              <span v-else class="bi bi-lightbulb-fill"></span>
            </button>
            <!-- Dropdown 1 -->
            <div class="link dropdown text-start">
              <button class="btn-menu user" @click="toggleDropdown('dropdown1')">{{ user?.username?.charAt(0) }}</button>
              <div class="menuitem" v-if="openDropdown === 'dropdown1'">
                <!-- <p>{{ user?.username }} ({{ user?.level }})</p> -->
                <p><b>{{ user?.email }}</b></p>
                <p>{{ user?.level }}</p>
                <p>{{ user?.instance }}</p><hr>
                <router-link class="btn-link px-0" :to="{ name: 'changePassword' }">
                  <i class="bi bi-pencil-square"></i> {{ $t(`menu.password`) }}
                </router-link><br>
                <button class="btn-link px-0" @click="logout">
                  <div class="div"><i class="bi bi-box-arrow-left"></i> {{ $t(`menu.logout`) }}</div>
                </button>
              </div>
            </div>
          </nav>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import Avatar from 'vue-avatar';

export default {
  name: 'MenuPanelComponent',
  components: {
    Avatar
  },
  data() {
    return {
      openDropdown: null, // Variable para rastrear qué dropdown está abierto
      isDarkMode: false, // Variable para rastrear el estado del modo oscuro
      userAvatar: 'https://example.com/avatar.jpg' // URL de la imagen del avatar
    };
  },
  methods: {
    toggleDropdown(dropdownId) {
      this.openDropdown = this.openDropdown === dropdownId ? null : dropdownId;
    },
    handleClickOutside(event) {
      const click = event.target;
      if (click.classList.contains('btn-menu') && click.classList.contains('user')) {
        return;
      }
      this.openDropdown = null;
    },
    changeBg() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.body.classList.add('dark');
        sessionStorage.setItem('isDarkMode', 'true');
      } else {
        document.body.classList.remove('dark');
        sessionStorage.setItem('isDarkMode', 'false');
      }
    },
    loadDarkMode() {
      const savedMode = sessionStorage.getItem('isDarkMode');
      if (savedMode === 'true') {
        this.isDarkMode = true;
        document.body.classList.add('dark');
      } else {
        this.isDarkMode = false;
        document.body.classList.remove('dark');
      }
    },
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      sessionStorage.setItem('lang', lang); // Guarda el idioma en sessionStorage
    },
  },
  mounted() {
    this.loadDarkMode();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  setup() {
    const authStore = useAuthStore();
    const user = authStore.user;

    const logout = () => {
      authStore.logout();
      window.location.href = '/';

    };

    return {
      logout,
      user,
    };
  },
};
</script>

<style lang="scss">
#sidebar .menu {
  overflow: auto;
}
nav {
  padding: 10px 0px;
  display: flex;
  justify-content: end;
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .menuitem {
    display: block;
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 20px;
    width: fit-content;
    top: 40px;
    z-index: 1000;
    right: 0;
    border-radius: 8px;
    a {
      i {
        margin-right: 10px;
      }
    }

    button {
      i {
        margin-right: 10px;
      }
    }

    
  }

  button {
    background-color: #007bff;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
  }
  
  .btn-menu {
    font-size: 16px;
  }


  button:hover {
    background-color: #0056b3;
  }

  .link {
    margin-left: 20px;
  }

  .user {
    width: 34px;
    text-transform: uppercase;
    padding: 0;
    line-height: 30px;
  }
}

/* Estilos para el modo oscuro */

#menuPanel {
  position: fixed;
  width: 100%;
}
#sidebar.show {
  left: 0px!important;
  z-index: 1000;
}

</style>
