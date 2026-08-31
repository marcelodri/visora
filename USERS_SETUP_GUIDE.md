# Gestión de Usuarios - Instrucciones de Integración Backend

## 📋 Resumen

Se ha implementado un módulo completo de gestión de usuarios solo para administradores:
- ✅ Vista de usuarios con tabla y acciones
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Resetear contraseña
- ✅ Eliminar usuarios
- ✅ Cambiar estado (activo/inactivo)
- ✅ Sistema de permisos basado en rol "admin"

## 🔧 Archivos Creados/Modificados

### Nuevos archivos:
1. **`src/services/userService.js`** - Servicio con peticiones HTTP
2. **`src/views/panel/users/UsersView.vue`** - Vista principal de usuarios

### Archivos modificados:
1. **`src/router/index.js`** - Agregada ruta `/panel/admin/users`
2. **`src/views/Login.vue`** - Detecta admin y agrega categoría al menú
3. **`src/locales/es.json`** - Traducciones en español
4. **`src/locales/en.json`** - Traducciones en inglés

## 🔌 Integración con Backend

El archivo `src/services/userService.js` tiene 5 funciones que necesitan URLs reales:

### 1. Obtener usuarios
**Función**: `getUsers()`  
**Ubicación en archivo**: Línea ~33  
**Cambiar**:
```javascript
// Antes (mock)
await sleep(500);
return [...]

// Después (URL real)
const response = await axios.get(`${API_BASE}/your-actual-users-endpoint`, {
  headers: getAuthHeaders()
});
return response.data;
```

### 2. Crear/Actualizar usuario
**Función**: `saveUser(userData)`  
**Ubicación en archivo**: Línea ~83  
**Cambiar**:
```javascript
// Antes (mock)
await sleep(500);
// ...return userData

// Después (URL real)
const response = await axios.post(`${API_BASE}/your-actual-users-endpoint`, userData, {
  headers: getAuthHeaders()
});
return response.data;
```

### 3. Resetear contraseña
**Función**: `resetUserPassword(userId, newPassword)`  
**Ubicación en archivo**: Línea ~110  
**Cambiar**:
```javascript
// Antes (mock)
await sleep(500);
return { success: true, ... }

// Después (URL real)
const response = await axios.post(
  `${API_BASE}/your-actual-users-endpoint/${userId}/reset-password`,
  { password: newPassword },
  { headers: getAuthHeaders() }
);
return response.data;
```

### 4. Eliminar usuario
**Función**: `deleteUser(userId)`  
**Ubicación en archivo**: Línea ~135  
**Cambiar**:
```javascript
// Antes (mock)
await sleep(500);
return { success: true, ... }

// Después (URL real)
const response = await axios.delete(
  `${API_BASE}/your-actual-users-endpoint/${userId}`,
  { headers: getAuthHeaders() }
);
return response.data;
```

### 5. Cambiar estado usuario
**Función**: `updateUserStatus(userId, status)`  
**Ubicación en archivo**: Línea ~157  
**Cambiar**:
```javascript
// Antes (mock)
await sleep(500);
return { success: true, ... }

// Después (URL real)
const response = await axios.patch(
  `${API_BASE}/your-actual-users-endpoint/${userId}/status`,
  { status },
  { headers: getAuthHeaders() }
);
return response.data;
```

## 📊 Estructura de datos esperada

### Objeto Usuario (GET)
El endpoint de GET debe retornar un array de objetos con esta estructura:
```javascript
{
  id: 1,
  name: "Juan Pérez",
  username: "jperez",
  email: "juan@empresa.com",
  instance: "empresa1",
  key: "api_key_123",
  level: "user",
  status: "active", // "active" o "inactive"
  token: "token_123",
  role: "user", // "admin", "user", "moderator"
  created_dt: "2025-01-01 10:00:00",
  update_dt: "2025-08-20 15:30:00",
  phone: "+34 123 456 789"
}
```

### Objeto Usuario (POST/PUT)
El endpoint debe aceptar y retornar:
```javascript
{
  id: 1, // null si es creación
  name: "Juan Pérez",
  username: "jperez",
  email: "juan@empresa.com",
  phone: "+34 123 456 789",
  role: "user",
  level: "user",
  status: "active",
  key: "api_key_123",
  instance: "empresa1",
  password: "new_password_123", // Solo en creación
  created_dt: "2025-01-01 10:00:00", // No enviar en POST
  update_dt: "2025-08-20 15:30:00" // No enviar en POST
}
```

## 🔐 Autenticación

Todas las peticiones incluyen el header:
```javascript
Authorization: `Bearer ${sessionStorage.getItem('token')}`
Content-Type: application/json
```

El token se obtiene automáticamente desde `sessionStorage`.

## 🎛️ Control de Acceso

El módulo de usuarios es visible solo para usuarios con `user_role === "admin"`:

1. **En el menú**: Se agrega la categoría 'admin' al menú si el usuario es admin
2. **En las rutas**: Solo admin puede acceder a `/panel/admin/users` (validado por el guard de router)
3. **En sessionStorage**: Se guarda `user_role` en el login

## 🧪 Datos Mock de Prueba

Mientras no tengas URLs reales, el sistema usa mock data con 3 usuarios de prueba:
- Admin Principal (role: admin)
- Juan Pérez (role: user)
- María García (role: user)

## 📝 Próximos pasos

1. Obtén las URLs reales del backend para:
   - Listar usuarios
   - Crear usuario
   - Actualizar usuario
   - Resetear contraseña
   - Eliminar usuario

2. Reemplaza las URLs en `src/services/userService.js`

3. Prueba el flujo completo:
   - Crear usuario
   - Editar usuario
   - Resetear contraseña
   - Eliminar usuario

4. Ajusta la estructura de datos si es necesario

## 🐛 Notas importantes

- Asegúrate de que el backend retorne la estructura de datos correcta
- Todos los endpoints deben validar el token enviado en el header
- Los errores se manejan con try/catch y alertas (puedes personalizarlas)
- La tabla se actualiza automáticamente después de cada operación
- Las validaciones de contraseña ocurren en el frontend (confirmar contraseña)
