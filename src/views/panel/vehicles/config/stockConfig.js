/**
 * Configuración de Stock
 * Define credenciales y configuración de conexión con Pilot Solution API
 */

import { useAuthStore } from '@/stores/auth';

export const stockConfig = {
  // Credenciales de API - se cargan desde los detalles del usuario
  api: {
    baseUrl: 'https://api.pilotsolution.net/v1'
  },

  // Filtros por defecto
  defaultFilters: {
    availabilityStatus: '1', // 1 = disponible
    limit: 100,
    page: 1,
    sortBy: 'updated',
    sortOrder: 'DESC'
  },

  // Campos a mostrar en el stock
  displayFields: {
    brand: true,
    model: true,
    version: true,
    year: true,
    color: true,
    fuel: true,
    mileage: true,
    price: true,
    location: true,
    availability: true
  },

  // Campos para filtros dinámicos
  filterFields: ['brand', 'model', 'fuel', 'color', 'year', 'business_channel'],

  // Campos para mostrar en detalles
  detailFields: [
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'version', label: 'Versión' },
    { key: 'year', label: 'Año' },
    { key: 'color', label: 'Color' },
    { key: 'fuel', label: 'Combustible' },
    { key: 'mileage', label: 'Kilometraje' },
    { key: 'price', label: 'Precio' },
    { key: 'location', label: 'Ubicación' }
  ],

  // Campos financieros
  financialFields: [
    { key: 'price', label: 'Precio' },
    { key: 'monthlyPayment', label: 'Mensualidad' },
    { key: 'downPayment', label: 'Enganche/Apertura' },
    { key: 'term', label: 'Plazo' }
  ],

  // Mock data para información financiera (temporal)
  mockFinancialDatabase: {
    1: {
      vehicleId: 1,
      price: '$100,000',
      monthlyPayment: '$2,000',
      downPayment: '$7,800',
      term: '60 meses'
    },
    2: {
      vehicleId: 2,
      price: '$85,000',
      monthlyPayment: '$1,700',
      downPayment: '$6,375',
      term: '48 meses'
    }
  },

  // Configuración de imágenes
  imageSettings: {
    defaultImage: 'no-image.png',
    showCount: true
  },

  // Campos de búsqueda
  searchFields: ['brand', 'model', 'version', 'color', 'location']
}

/**
 * Obtener URL de API completa
 */
export function getApiUrl(endpoint) {
  return `${stockConfig.api.baseUrl}${endpoint}`
}

/**
 * Obtener credenciales de API desde los detalles del usuario
 */
export function getApiCredentials() {
  const authStore = useAuthStore();
  const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
  
  const username = details.find(d => d.key === 'user_pilot')?.value;
  const password = details.find(d => d.key === 'user_password')?.value;
  
  if (!username || !password) {
    console.warn('[stockConfig] Credenciales de Pilot Solution no configuradas en los detalles del usuario');
    return {
      username: null,
      password: null
    };
  }
  
  return {
    username,
    password
  };
}

/**
 * Obtener información financiera mock
 */
export function getMockFinancialInfo(vehicleId) {
  return stockConfig.mockFinancialDatabase[vehicleId] || null
}
