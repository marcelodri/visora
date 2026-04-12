/**
 * Socket.io Event Service
 * Maneja la conexión y comunicación de eventos en tiempo real
 */

import { io } from 'socket.io-client';

class EventWallService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  }

  /**
   * Inicializa la conexión con el servidor de socket.io
   */
  connect() {
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.socketUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          autoConnect: true
        });

        this.socket.on('connect', () => {
          console.log('Socket conectado:', this.socket.id);
          this.emit('connect');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Socket desconectado');
          this.emit('disconnect');
        });

        this.socket.on('error', (error) => {
          console.error('Error en socket:', error);
          this.emit('error', error);
          reject(error);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Error de conexión:', error);
          this.emit('connect_error', error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desconecta el socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Se une a una sala de evento
   * @param {string} eventId - ID del evento
   */
  joinEvent(eventId) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket no conectado');
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('join_event', { eventId }, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Error al unirse al evento');
        }
      });
    });
  }

  /**
   * Abandona una sala de evento
   * @param {string} eventId - ID del evento
   */
  leaveEvent(eventId) {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('leave_event', { eventId });
  }

  /**
   * Envía un mensaje a la sala del evento
   * @param {Object} messageData - Datos del mensaje
   * @returns {Promise}
   */
  sendMessage(messageData) {
    if (!this.socket || !this.socket.connected) {
      return Promise.reject('Socket no conectado');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send_message', messageData, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Error al enviar mensaje');
        }
      });
    });
  }

  /**
   * Carga el historial de mensajes de un evento
   * @param {string} eventId - ID del evento
   * @param {number} limit - Número de mensajes a cargar
   */
  loadMessageHistory(eventId, limit = 50) {
    if (!this.socket || !this.socket.connected) {
      return Promise.reject('Socket no conectado');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get_message_history', { eventId, limit }, (response) => {
        if (response && response.success) {
          resolve(response.messages);
        } else {
          reject(response?.error || 'Error al cargar historial');
        }
      });
    });
  }

  /**
   * Registra un listener para eventos del socket
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a ejecutar
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // También registra en socket si está conectado
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Emite un evento a los listeners locales
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos del evento
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Obtiene el estado de conexión del socket
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }

  /**
   * Obtiene el ID de sesión del socket
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  /**
   * Reintenta la conexión
   */
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      return this.connect();
    }
  }
}

// Exportar como singleton
export default new EventWallService();
