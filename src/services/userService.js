import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper para obtener el token del sessionStorage
function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Helper para dormir (simulaciones)
function sleep(ms = 300) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * OBTENER TODOS LOS USUARIOS DE LA INSTANCIA
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getUsers() {
  try {
    const WEBHOOK_URL = 'https://apis.madautomate.cloud/webhook/d46b94c6-ace8-4e18-9bea-293fc49b61b9';

    console.log('getAuthHeaders', getAuthHeaders())

    const response = await axios.post(WEBHOOK_URL, {
      action: 'getUsers'
    }, {
      headers: getAuthHeaders()
    });
    
    // La respuesta debe ser un array de usuarios
    // console.log('response', response)
    return Array.isArray(response.data) ? response.data : response.data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * CREAR O ACTUALIZAR UN USUARIO
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado/actualizado
 */
export async function saveUser(userData) {
  try {
    const WEBHOOK_URL = 'https://apis.madautomate.cloud/webhook/d46b94c6-ace8-4e18-9bea-293fc49b61b9';
    
    const payload = {
      action: 'updateUser',
      ...userData
    };
    
    console.log('payload', payload)

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: getAuthHeaders()
    });
    
    // Asegurar que la respuesta tenga los campos esperados
    const savedUser = response.data;
    savedUser.update_dt = savedUser.update_dt || new Date().toLocaleString();
    
    return savedUser;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

/**
 * RESETEAR CONTRASEÑA DE UN USUARIO
 * @param {number} userId - ID del usuario
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function resetUserPassword(userId, newPassword) {
  try {
    // TODO: Reemplazar con URL real del backend
    // const response = await axios.post(
    //   `${API_BASE}/users/${userId}/reset-password`,
    //   { password: newPassword },
    //   { headers: getAuthHeaders() }
    // );

    // Por ahora: simulación
    await sleep(500);
    
    console.log(`🔑 Reseteando contraseña para usuario ${userId}:`, newPassword);
    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
      userId
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * ELIMINAR UN USUARIO
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteUser(userId) {
  try {
    const WEBHOOK_URL = 'https://apis.madautomate.cloud/webhook/d46b94c6-ace8-4e18-9bea-293fc49b61b9';

    const response = await axios.post(WEBHOOK_URL, {
      action: 'deleteUser',
      id: userId
    }, {
      headers: getAuthHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * CAMBIAR ESTADO DE UN USUARIO
 * @param {number} userId - ID del usuario
 * @param {string} status - Nuevo estado (active/inactive)
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function updateUserStatus(userId, status) {
  try {
    // TODO: Reemplazar con URL real del backend
    // const response = await axios.patch(
    //   `${API_BASE}/users/${userId}/status`,
    //   { status },
    //   { headers: getAuthHeaders() }
    // );

    // Por ahora: simulación
    await sleep(500);
    
    console.log(`📊 Cambiando estado de usuario ${userId} a: ${status}`);
    return {
      success: true,
      message: 'Estado actualizado correctamente',
      userId,
      status
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}
