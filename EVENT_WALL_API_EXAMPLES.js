/**
 * Ejemplo de integración del Event Wall con API real
 * 
 * Este archivo muestra cómo conectar el componente EventWallView
 * con una API real para cargar eventos desde la base de datos
 */

// Opción 1: Usar un servicio API separado

// src/services/eventService.js
import axios from 'axios';

export const eventService = {
  // Obtener todos los eventos
  async getEvents() {
    try {
      const response = await axios.get('/api/events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  },

  // Obtener evento por ID
  async getEventById(id) {
    try {
      const response = await axios.get(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener evento:', error);
      throw error;
    }
  },

  // Obtener eventos del usuario autenticado
  async getUserEvents() {
    try {
      const response = await axios.get('/api/me/events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener eventos del usuario:', error);
      throw error;
    }
  }
};

// =====================================================

// Opción 2: Modificar EventWallView.vue para usar la API

// En EventWallView.vue, cambiar el método fetchEvents():

/*
async fetchEvents() {
  this.loadingEvents = true;
  try {
    const authStore = useAuthStore();
    
    // Opción A: Obtener todos los eventos
    const response = await fetch('/api/events', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    if (response.ok) {
      this.events = await response.json();
    }
    
    // Opción B: Usar el servicio
    // import { eventService } from '@/services/eventService';
    // this.events = await eventService.getEvents();
    
  } catch (error) {
    console.error('Error al cargar eventos:', error);
  } finally {
    this.loadingEvents = false;
  }
}
*/

// =====================================================

// Opción 3: Crear un composable para reutilizar lógica

// src/composables/useEventWall.js
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

export function useEventWall() {
  const authStore = useAuthStore();
  const events = ref([]);
  const selectedEventId = ref('');
  const loading = ref(false);
  const error = ref(null);

  const selectedEvent = computed(() => {
    return events.value.find(e => e.id === selectedEventId.value);
  });

  const fetchEvents = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener eventos');
      }

      events.value = await response.json();
    } catch (err) {
      error.value = err.message;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const selectEvent = (eventId) => {
    selectedEventId.value = eventId;
  };

  return {
    events,
    selectedEventId,
    selectedEvent,
    loading,
    error,
    fetchEvents,
    selectEvent
  };
}

// =====================================================

// Opción 4: API Response esperada (formato de ejemplo)

/*
GET /api/events
Respuesta:
{
  "success": true,
  "data": [
    {
      "id": "evt-001",
      "name": "Conferencia Tech 2025",
      "description": "La conferencia anual de tecnología más importante del año",
      "image": "https://..../conference.jpg",
      "location": "Buenos Aires, Argentina",
      "date": "2025-12-15T09:00:00Z",
      "status": "active", // active, cancelled, finished
      "sessions": 3,
      "capacity": 500,
      "registered": 234,
      "createdBy": "user-123",
      "createdAt": "2025-12-01T10:00:00Z"
    },
    {
      "id": "evt-002",
      "name": "Workshop Vue.js",
      "description": "Aprende Vue 3 desde cero hasta nivel avanzado",
      "image": "https://..../workshop.jpg",
      "location": "Online",
      "date": "2025-12-20T14:00:00Z",
      "status": "active",
      "sessions": 1,
      "capacity": 100,
      "registered": 87,
      "createdBy": "user-456",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ]
}
*/

// =====================================================

// Opción 5: Función para limpiar mensajes en base de datos

export async function clearEventMessages(eventId, adminKey) {
  try {
    const response = await fetch(`/api/events/${eventId}/messages`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': adminKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Error al limpiar mensajes');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// =====================================================

// Opción 6: Exportar estadísticas a base de datos

export async function saveMessageStats(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/stats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error al guardar estadísticas:', error);
  }
}

// =====================================================

// Opción 7: Integración con Pinia store

// src/stores/eventWall.js
import { defineStore } from 'pinia';

export const useEventWallStore = defineStore('eventWall', {
  state: () => ({
    events: [],
    selectedEventId: '',
    messages: [],
    loading: false,
    error: null
  }),

  getters: {
    selectedEvent: (state) => {
      return state.events.find(e => e.id === state.selectedEventId);
    },

    activeEvents: (state) => {
      return state.events.filter(e => e.status === 'active');
    }
  },

  actions: {
    async fetchEvents() {
      this.loading = true;
      try {
        const response = await fetch('/api/events');
        this.events = await response.json();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    selectEvent(eventId) {
      this.selectedEventId = eventId;
    },

    addMessage(message) {
      this.messages.push(message);
    },

    async clearMessages() {
      this.messages = [];
    }
  }
});

// =====================================================

// Opción 8: TypeScript (si quieres usar tipos)

/*
// src/types/event.ts
export interface Event {
  id: string;
  name: string;
  description: string;
  image?: string;
  location?: string;
  date: Date;
  status: 'active' | 'cancelled' | 'finished';
  capacity: number;
  registered: number;
}

export interface Message {
  id: string;
  eventId: string;
  username: string;
  message: string;
  timestamp: Date;
  socketId: string;
}

// src/services/eventService.ts
import { Event, Message } from '@/types/event';

export class EventService {
  async getEvents(): Promise<Event[]> {
    const response = await fetch('/api/events');
    return response.json();
  }

  async getMessages(eventId: string): Promise<Message[]> {
    const response = await fetch(`/api/events/${eventId}/messages`);
    return response.json();
  }
}
*/
