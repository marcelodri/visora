import { createI18n } from 'vue-i18n';

// Función para cargar los archivos JSON de traducción
function loadLocaleMessages() {
  const locales = import.meta.glob('./locales/*.json', { eager: true });
  const messages = {};

  for (const path in locales) {
    const locale = path.match(/([A-Za-z0-9-_]+)\./i)[1];
    messages[locale] = locales[path].default;
  }

  return messages;
}

// Leer el idioma de sessionStorage o usar 'en' como predeterminado
const savedLocale = sessionStorage.getItem('lang') || 'en';

const i18n = createI18n({
  locale: savedLocale, // Idioma predeterminado (desde sessionStorage)
  fallbackLocale: 'en', // Idioma de respaldo
  messages: loadLocaleMessages() // Cargar los mensajes desde los JSON
});

// Método para cambiar el idioma y guardarlo en sessionStorage
export function setLocale(locale) {
  i18n.global.locale = locale; // Cambia el idioma en i18n
  sessionStorage.setItem('lang', locale); // Guarda el idioma en sessionStorage
}

export default i18n;
