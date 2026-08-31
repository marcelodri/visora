# Referencia de Peticiones HTTP - Gestión de Usuarios

## 📋 Tabla de Peticiones

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| getUsers | GET | `/api/users` | Obtiene lista de usuarios de la instancia |
| saveUser | POST/PUT | `/api/users` | Crea o actualiza un usuario |
| resetUserPassword | POST | `/api/users/:id/reset-password` | Resetea la contraseña |
| deleteUser | DELETE | `/api/users/:id` | Elimina un usuario |
| updateUserStatus | PATCH | `/api/users/:id/status` | Cambia estado (active/inactive) |

## 🔑 Header Requerido

Todas las peticiones DEBEN incluir:
```
Authorization: Bearer {token}
Content-Type: application/json
```

El token se obtiene automáticamente desde `sessionStorage.getItem('token')`

## 📤 Ejemplos de Peticiones

### 1. GET - Obtener todos los usuarios

**Request:**
```bash
GET /api/users
Headers: Authorization: Bearer {token}
```

**Response esperada (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Admin Principal",
    "username": "admin",
    "email": "admin@empresa.com",
    "instance": "empresa1",
    "key": "key123",
    "level": "admin",
    "status": "active",
    "token": "token_admin",
    "role": "admin",
    "created_dt": "2025-01-01 10:00:00",
    "update_dt": "2025-08-20 15:30:00",
    "phone": "+34 123 456 789"
  },
  {
    "id": 2,
    "name": "Juan Pérez",
    "username": "jperez",
    "email": "juan@empresa.com",
    "instance": "empresa1",
    "key": "key456",
    "level": "user",
    "status": "active",
    "token": "token_user1",
    "role": "user",
    "created_dt": "2025-02-15 09:00:00",
    "update_dt": "2025-08-18 11:20:00",
    "phone": "+34 987 654 321"
  }
]
```

### 2. POST - Crear nuevo usuario

**Request:**
```bash
POST /api/users
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "name": "Carlos López",
  "username": "clopez",
  "email": "carlos@empresa.com",
  "phone": "+34 555 666 777",
  "password": "SecurePassword123!",
  "role": "user",
  "level": "user",
  "status": "active",
  "key": "generated_key",
  "instance": "empresa1"
}
```

**Response esperada (201 Created):**
```json
{
  "id": 4,
  "name": "Carlos López",
  "username": "clopez",
  "email": "carlos@empresa.com",
  "phone": "+34 555 666 777",
  "role": "user",
  "level": "user",
  "status": "active",
  "key": "generated_key",
  "instance": "empresa1",
  "created_dt": "2025-08-20 16:00:00",
  "update_dt": "2025-08-20 16:00:00",
  "token": "generated_token"
}
```

### 3. PUT - Actualizar usuario existente

**Request:**
```bash
PUT /api/users
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "id": 2,
  "name": "Juan Pérez García",
  "username": "jperez",
  "email": "juan.perez@empresa.com",
  "phone": "+34 111 222 333",
  "role": "moderator",
  "level": "moderator",
  "status": "active",
  "key": "key456",
  "instance": "empresa1",
  "created_dt": "2025-02-15 09:00:00",
  "update_dt": "2025-08-20 16:05:00"
}
```

**Response esperada (200 OK):**
```json
{
  "id": 2,
  "name": "Juan Pérez García",
  "username": "jperez",
  "email": "juan.perez@empresa.com",
  "phone": "+34 111 222 333",
  "role": "moderator",
  "level": "moderator",
  "status": "active",
  "key": "key456",
  "instance": "empresa1",
  "created_dt": "2025-02-15 09:00:00",
  "update_dt": "2025-08-20 16:05:00",
  "token": "token_user1"
}
```

### 4. POST - Resetear contraseña

**Request:**
```bash
POST /api/users/2/reset-password
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "password": "NewSecurePassword456!"
}
```

**Response esperada (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada correctamente",
  "userId": 2
}
```

### 5. DELETE - Eliminar usuario

**Request:**
```bash
DELETE /api/users/4
Headers: Authorization: Bearer {token}
```

**Response esperada (200 OK):**
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente",
  "userId": 4
}
```

### 6. PATCH - Cambiar estado del usuario

**Request:**
```bash
PATCH /api/users/2/status
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "status": "inactive"
}
```

**Response esperada (200 OK):**
```json
{
  "success": true,
  "message": "Estado actualizado correctamente",
  "userId": 2,
  "status": "inactive"
}
```

## 🔒 Validaciones en Frontend

El frontend valida lo siguiente ANTES de enviar al servidor:
- ✅ Nombre no vacío
- ✅ Email válido (formato)
- ✅ Username único en el formulario (comparación local)
- ✅ Contraseña coincide con confirmación
- ✅ Teléfono (formato básico)
- ✅ Rol seleccionado (admin, user, moderator)
- ✅ Estado seleccionado (active, inactive)

## ⚠️ Códigos de Error esperados

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | Éxito | Operación completada |
| 201 | Creado | Usuario creado exitosamente |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Token expirado o inválido |
| 403 | Forbidden | No tiene permisos |
| 404 | Not Found | Usuario no existe |
| 409 | Conflict | Usuario duplicado (email/username) |
| 500 | Server Error | Error en el servidor |

## 🧪 Curl ejemplos (para pruebas)

```bash
# Obtener usuarios
curl -H "Authorization: Bearer {token}" \
  https://tu-api.com/api/users

# Crear usuario
curl -X POST https://tu-api.com/api/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test","email":"test@test.com","password":"Test123"}'

# Actualizar usuario
curl -X PUT https://tu-api.com/api/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"id":2,"name":"Updated Name",...}'

# Resetear contraseña
curl -X POST https://tu-api.com/api/users/2/reset-password \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"password":"NewPass123"}'

# Eliminar usuario
curl -X DELETE https://tu-api.com/api/users/2 \
  -H "Authorization: Bearer {token}"

# Cambiar estado
curl -X PATCH https://tu-api.com/api/users/2/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'
```

## 💡 Notas Importantes

1. **Parámetro `id`**: No se envía en GET/POST (creación), sí en PUT/PATCH/DELETE
2. **Contraseña**: Solo se envía en POST (creación) y POST reset-password
3. **Timestamps**: Se retornan en el servidor, no se envían en POST
4. **Token**: Se obtiene automáticamente desde sessionStorage
5. **Instance**: Se obtiene automáticamente del perfil del usuario autenticado
6. **Errores**: Se manejan con try/catch y se muestra alert al usuario

## 🔄 Flujo en la UI

1. Usuario hace click en "Agregar Usuario" → Se abre modal
2. Completa datos → Valida en frontend
3. Click "Crear Usuario" → Petición POST a `/api/users`
4. Si éxito → Cierra modal, actualiza tabla
5. Si error → Muestra alert con mensaje de error
