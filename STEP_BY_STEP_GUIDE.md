# 🚀 Guía Paso a Paso - Gestión de Usuarios

## ✅ Lo que se ha implementado

### Frontend Completamente Funcional ✅
- ✅ Vista de usuarios con tabla
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes  
- ✅ Resetear contraseña de usuarios
- ✅ Eliminar usuarios
- ✅ Cambiar estado (activo/inactivo)
- ✅ Menú solo visible para admin
- ✅ Sistema de permisos basado en rol
- ✅ Validaciones de formulario
- ✅ Modales personalizados
- ✅ Traducciones (español e inglés)
- ✅ Mock data para pruebas

### Backend - En Espera de URLs ⏳
El backend está listo pero con mock data. Solo necesita:
1. URLs reales de API
2. Endpoints que retornen datos en formato esperado
3. Token en headers

---

## 🎯 Paso 1: Probar con Mock Data (Ahora)

Sin cambios en el código, puedes probar el flujo completo:

1. **Inicia sesión** como admin
   - Email: `admin@empresa.com` (o el que uses)
   - El sistema debe detectar que eres admin

2. **Abre el menú lateral** → Verás "Administración" con un icono de escudo
   - Esto solo aparece si tu role es "admin"

3. **Click en "Gestión de Usuarios"**
   - Verás tabla con 3 usuarios mock

4. **Prueba las funciones:**
   - ✅ Click verde (lápiz) → Edita usuario
   - ✅ Click amarillo (llave) → Resetea contraseña
   - ✅ Click rojo (papelera) → Elimina usuario
   - ✅ Botón "Agregar Usuario" → Crea usuario

**IMPORTANTE**: Estos cambios no se guardan (solo mock data)

---

## 🔌 Paso 2: Integrar Backend Real

### 2.1. Obtén las URLs de tu API

Necesitas 5 URLs:

```
GET    /api/users                    → Listar usuarios
POST   /api/users                    → Crear usuario
PUT    /api/users                    → Actualizar usuario
POST   /api/users/{id}/reset-password → Resetear contraseña
DELETE /api/users/{id}               → Eliminar usuario
```

### 2.2. Abre el archivo de servicio

**Archivo**: `src/services/userService.js`

### 2.3. Reemplaza las URLs

Busca estas 5 funciones y reemplaza las URLs mock:

#### Función 1: `getUsers()` (línea ~33)

**Antes:**
```javascript
// TODO: Reemplazar con URL real del backend
// const response = await axios.get(`${API_BASE}/users`, {
await sleep(500);
return [...]
```

**Después:**
```javascript
const response = await axios.get(`${API_BASE}/users`, {
  headers: getAuthHeaders()
});
return response.data;
```

#### Función 2: `saveUser(userData)` (línea ~83)

**Antes:**
```javascript
await sleep(500);
if (userData.id) {
  console.log('✏️ Actualizando usuario:', userData);
} else {
  console.log('✨ Creando usuario:', userData);
  // ...
}
return userData;
```

**Después:**
```javascript
const response = await axios.post(`${API_BASE}/users`, userData, {
  headers: getAuthHeaders()
});
return response.data;
```

#### Función 3: `resetUserPassword()` (línea ~110)

**Antes:**
```javascript
await sleep(500);
console.log(`🔑 Reseteando contraseña...`);
return { success: true, ... }
```

**Después:**
```javascript
const response = await axios.post(
  `${API_BASE}/users/${userId}/reset-password`,
  { password: newPassword },
  { headers: getAuthHeaders() }
);
return response.data;
```

#### Función 4: `deleteUser()` (línea ~135)

**Antes:**
```javascript
await sleep(500);
return { success: true, ... }
```

**Después:**
```javascript
const response = await axios.delete(
  `${API_BASE}/users/${userId}`,
  { headers: getAuthHeaders() }
);
return response.data;
```

#### Función 5: `updateUserStatus()` (línea ~157)

**Antes:**
```javascript
await sleep(500);
return { success: true, ... }
```

**Después:**
```javascript
const response = await axios.patch(
  `${API_BASE}/users/${userId}/status`,
  { status },
  { headers: getAuthHeaders() }
);
return response.data;
```

---

## 📊 Paso 3: Formato de Datos Esperado

Tu API debe retornar/aceptar datos en este formato:

### Usuario (GET response)
```json
{
  "id": 1,
  "name": "Nombre Completo",
  "username": "usuario",
  "email": "correo@empresa.com",
  "phone": "+34 123 456 789",
  "role": "admin",
  "level": "admin",
  "status": "active",
  "key": "api_key",
  "instance": "empresa1",
  "created_dt": "2025-01-01 10:00:00",
  "update_dt": "2025-08-20 15:30:00",
  "token": "token123"
}
```

### Usuario (POST/PUT request)
```json
{
  "name": "Nombre",
  "username": "usuario",
  "email": "correo@empresa.com",
  "phone": "+34 123 456 789",
  "password": "contraseña123",  ← Solo en POST (creación)
  "role": "user",
  "level": "user",
  "status": "active",
  "key": "api_key",
  "instance": "empresa1"
}
```

---

## 🧪 Paso 4: Pruebas de Integración

### Test 1: Obtener usuarios

1. Abre DevTools (F12 → Network)
2. Ve a la sección de usuarios
3. Verifica que se hace petición GET
4. Respuesta debe ser array de usuarios

### Test 2: Crear usuario

1. Click "Agregar Usuario"
2. Completa datos:
   - Nombre: "Test User"
   - Email: "test@empresa.com"
   - Usuario: "testuser"
   - Contraseña: "Test123!"
   - Rol: "user"

3. Click "Crear Usuario"
4. Verifica en DevTools:
   - Petición POST a `/api/users`
   - Headers incluyen `Authorization: Bearer {token}`
   - Body contiene todos los datos

### Test 3: Editar usuario

1. Click en icono de lápiz de un usuario
2. Cambia el nombre
3. Click "Guardar Cambios"
4. Verifica petición PUT

### Test 4: Resetear contraseña

1. Click en icono de llave
2. Ingresa nueva contraseña
3. Click "Resetear Contraseña"
4. Verifica petición POST a `/reset-password`

---

## 🔐 Paso 5: Verificar Autenticación

### El token se envía automáticamente

El código maneja esto por ti:
```javascript
function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}
```

**Verifica en DevTools:**
- Network → Click petición
- Headers → Authorization debe estar ahí

---

## 📱 Paso 6: Verificar Control de Acceso

### Solo admin ve el menú

1. **Inicia como admin** → Verás "Administración"
2. **Inicia como user** → No verás "Administración"
3. **Si intentas acceder directamente a la URL:**
   - `/panel/admin/users` como user
   - Router te redirige a `/panel` (home)

---

## ⚠️ Paso 7: Manejo de Errores

El código maneja errores automáticamente:

```javascript
try {
  // Petición
  const result = await saveUser(userData);
  // Éxito
  alert('Usuario creado exitosamente');
} catch (error) {
  // Error
  console.error('Error:', error);
  alert('Error al guardar el usuario');
}
```

**Respuestas esperadas del servidor:**
- ✅ 200/201 → Éxito
- ❌ 400 → Datos inválidos
- ❌ 401 → Token expirado
- ❌ 404 → Usuario no encontrado
- ❌ 409 → Duplicado (email/username)

---

## 🛠️ Paso 8: Personalizaciones

### Cambiar textos del modal

**Archivo**: `src/views/panel/users/UsersView.vue`

```vue
<!-- Línea ~40: Título del acordeón -->
<strong>Tip:</strong> Desde aquí puedes gestionar...
```

### Cambiar campos del formulario

Abre `UsersView.vue` y busca `formData`, agrega los campos que necesites

### Cambiar iconos del menú

**Archivo**: `src/router/index.js` (línea ~417)

```javascript
meta: { category: 'admin', icon: '<i class="bi bi-shield-lock"></i>' }
// Cambia a:
meta: { category: 'admin', icon: '<i class="bi bi-people"></i>' }
```

---

## 📋 Checklist Final

- [ ] Probé con mock data (flujo completo)
- [ ] Obtuve URLs del backend
- [ ] Reemplacé las 5 URLs en `userService.js`
- [ ] Mi API retorna datos en el formato esperado
- [ ] Probé crear usuario
- [ ] Probé editar usuario
- [ ] Probé resetear contraseña
- [ ] Probé eliminar usuario
- [ ] Verifico que token se envía en headers
- [ ] Solo admin ve el menú

---

## 🆘 Problemas Comunes

### "No veo el menú de usuarios"
→ Verifica que `user_role === "admin"` en sessionStorage

### "No se guardan los cambios"
→ Aún está usando mock data, reemplaza las URLs

### "Error 401 en peticiones"
→ Token expirado o no se incluye en headers

### "Error 400 en POST"
→ Tu API espera otro formato de datos

### "No aparecen los usuarios"
→ Verifica que la respuesta es un array

---

## 💬 Resumen

**Ahora mismo** → Todo funciona con mock data  
**Después de pasar URLs** → Todo funciona con tu backend  
**Tiempo estimado** → 15 minutos de integración

¡Listo para usar! 🎉
