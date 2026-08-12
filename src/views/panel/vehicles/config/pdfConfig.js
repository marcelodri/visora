/**
 * Configuración global para generación de PDFs
 * Define logo de empresa, estilos y datos generales del PDF
 */

export const pdfConfig = {
  // Información de la empresa
  company: {
    name: 'Mi Empresa',
    logo: null, // Se puede actualizar desde la UI
    logoPath: null, // Ruta de imagen por defecto
    website: 'www.miempresa.com',
    phone: '+1234567890',
    email: 'info@miempresa.com'
  },

  // Estilos del PDF
  styles: {
    // Colores
    primaryColor: '#0066CC',
    accentColor: '#FF6B35',
    backgroundColor: '#F5F5F5',
    textColor: '#333333',
    lightText: '#666666',

    // Fuentes
    fontSizeTitle: 20,
    fontSizeSubtitle: 14,
    fontSizeBody: 10,
    fontSizeSmall: 8,

    // Márgenes
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 15,
    marginRight: 15,

    // Espaciado
    lineHeight: 6,
    sectionSpacing: 10
  },

  // Configuración de secciones del PDF
  sections: {
    includeHeader: true,
    includeFooter: true,
    includeImages: true,
    includeDetails: true,
    includeFinancial: true,
    includeMessage: true
  },

  // Imagen de vehículos máximas
  imageSettings: {
    maxImages: 6,
    imagesPerRow: 2,
    imageHeight: 50,
    imageSpacing: 5
  },

  // Plantilla de mensaje por defecto
  defaultMessage: 'Le presentamos este vehículo de nuestro catálogo. Para más información, no dude en contactarnos.',

  // Formatos de datos
  formats: {
    currency: '$',
    currencyPosition: 'before', // 'before' o 'after'
    numberSeparator: ',',
    decimalSeparator: '.'
  }
}

/**
 * Actualizar configuración en tiempo de ejecución
 * @param {Object} newConfig - Nuevos valores de configuración
 */
export function updatePdfConfig(newConfig) {
  Object.assign(pdfConfig, newConfig)
}

/**
 * Actualizar logo de empresa
 * @param {String} logoDataUrl - Logo en formato data URL
 */
export function setCompanyLogo(logoDataUrl) {
  pdfConfig.company.logo = logoDataUrl
}

/**
 * Obtener configuración actual
 */
export function getPdfConfig() {
  return pdfConfig
}
