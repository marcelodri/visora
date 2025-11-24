import { createI18n } from 'vue-i18n'

// Función para cargar los archivos JSON de traducción
function loadLocaleMessages() {
  const locales = import.meta.glob('./locales/*.json', { eager: true })
  const messages = {}

  for (const path in locales) {
    const locale = path.match(/([A-Za-z0-9-_]+)\./i)[1]
    messages[locale] = locales[path].default
  }

  return messages
}

// 🔹 Leer el idioma de sessionStorage o usar 'es' como predeterminado
const savedLocale = sessionStorage.getItem('lang') || 'es'

const i18n = createI18n({
  legacy: false,            // 👈 Necesario para usar Composition API (y .value)
  locale: savedLocale,       // Idioma activo
  fallbackLocale: 'en',      // Idioma de respaldo
  messages: loadLocaleMessages(),
})

// 🔹 Función para cambiar idioma y guardar en sessionStorage
export function setLocale(locale) {
  i18n.global.locale.value = locale  // ✅ uso correcto con .value
  sessionStorage.setItem('lang', locale)
}

export default i18n
