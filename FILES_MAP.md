# 📁 Mapa de Archivos - Gestión de Usuarios

## 📝 Archivos Creados

### 1. Servicio de Usuarios
**Ruta**: `src/services/userService.js`  
**Líneas**: ~180 líneas  
**Contenido**:
- `getUsers()` - GET /api/users
- `saveUser()` - POST/PUT /api/users
- `resetUserPassword()` - POST /api/users/:id/reset-password
- `deleteUser()` - DELETE /api/users/:id
- `updateUserStatus()` - PATCH /api/users/:id/status

**Estado**: ✅ Listo | Necesita URLs reales

### 2. Vista Principal de Usuarios
**Ruta**: `src/views/panel/users/UsersView.vue`  
**Líneas**: ~800 líneas  
**Contenido**:
- Template: Tabla de usuarios
- 3 Modales: Editar, Resetear contraseña, Confirmar eliminar
- Métodos: loadUsers, saveUser, resetPassword, deleteUser, etc.
- Estilos: Tabla, avatares, acordeones

**Estado**: ✅ Listo | Totalmente funcional

---

## ✏️ Archivos Modificados

### 3. Router
**Ruta**: `src/router/index.js`  
**Cambios**: 
- Línea ~417-439: Agregada categoría 'admin'
- Ruta: `/panel/admin/users`
- Componente: UsersView.vue
- Meta: Requiere autenticación

**Antes**: Router sin sección admin  
**Después**: Router con sección admin

### 4. Login
**Ruta**: `src/views/Login.vue`  
**Cambios**:
- Línea ~165-187: Detecta si usuario es admin
- Si admin → Agrega categoría 'admin' al menú
- Auomaticamente después de obtener el menú del backend

**Antes**: No había detección de admin  
**Después**: Menú dinámico según rol

### 5. Traducciones - Español
**Ruta**: `src/locales/es.json`  
**Cambios**:
- Línea ~90: `"admin-users": "Gestión de Usuarios"`
- Línea ~91: `"users": "Usuarios"`

### 6. Traducciones - Inglés
**Ruta**: `src/locales/en.json`  
**Cambios**:
- Línea ~64: `"admin-users": "User Management"`
- Línea ~65: `"users": "Users"`

---

## 📄 Documentación Creada

### Guía Paso a Paso
**Ruta**: `STEP_BY_STEP_GUIDE.md`  
**Contenido**: Instrucciones detalladas para probar e integrar

### Guía de Setup
**Ruta**: `USERS_SETUP_GUIDE.md`  
**Contenido**: Descripción técnica y reemplazo de URLs

### Referencia de Peticiones HTTP
**Ruta**: `HTTP_REQUESTS_REFERENCE.md`  
**Contenido**: Ejemplos de todas las peticiones HTTP

### Este Mapa de Archivos
**Ruta**: `FILES_MAP.md`  
**Contenido**: Este documento

---

## 🎯 Ubicación Rápida

### Para probar ahora:
1. Abre VS Code
2. Ve a `src/views/panel/users/UsersView.vue` para ver la UI
3. Inicia sesión como admin
4. Busca "Administración" en el menú

### Para integrar backend:
1. Abre `src/services/userService.js`
2. Busca comentario "TODO: Reemplazar con URL real"
3. Hay 5 secciones que cambiar

### Para ajustar textos:
1. Abre `src/locales/es.json` o `en.json`
2. Busca "admin-users" o "users"
3. Cambia los textos

---

## 🔍 Estructura de Carpetas

```
src/
├── services/
│   └── userService.js           ← 🆕 Servicio de usuarios
├── views/panel/
│   ├── users/
│   │   └── UsersView.vue        ← 🆕 Vista principal
│   ├── PanelView.vue
│   └── ... (otras vistas)
├── router/
│   └── index.js                 ← ✏️ Agregada ruta /admin/users
├── locales/
│   ├── es.json                  ← ✏️ Traducciones español
│   └── en.json                  ← ✏️ Traducciones inglés
└── ... (otros archivos)
```

---

## 📊 Resumen de Cambios

| Archivo | Tipo | Lineas | Cambio |
|---------|------|--------|--------|
| userService.js | 🆕 Nuevo | ~180 | Todas las funciones |
| UsersView.vue | 🆕 Nuevo | ~800 | Componente completo |
| router/index.js | ✏️ Modificado | 417-439 | Ruta admin |
| views/Login.vue | ✏️ Modificado | 165-187 | Detectar admin |
| locales/es.json | ✏️ Modificado | 90-91 | Traducciones |
| locales/en.json | ✏️ Modificado | 64-65 | Traducciones |

**Total**: 6 archivos (2 nuevos, 4 modificados)

---

## 🚀 Flujo de Datos

```
Usuario Admin Login
    ↓
sessionStorage.setItem('user_role', 'admin')
    ↓
Login.vue detecta admin
    ↓
Agrega 'admin' al menú
    ↓
SidebarComponent carga menú
    ↓
Muestra "Administración" en el menú
    ↓
Click en "Gestión de Usuarios"
    ↓
Router redirige a /panel/admin/users
    ↓
UsersView.vue carga
    ↓
userService.getUsers() → Petición GET
    ↓
Tabla se llena con usuarios
```

---

## 🔐 Control de Acceso

```
Rol != 'admin'
    ↓
- Menú admin no aparece
- URL directa /panel/admin/users
  ↓
  Router guard bloquea
  ↓
  Redirige a /panel (home)

---

Rol == 'admin'
    ↓
- Menú admin aparece
- URL directa /panel/admin/users
  ↓
  Router permite acceso
  ↓
  Muestra UsersView.vue
```

---

## 📝 Notas Importantes

1. **userService.js**
   - Todavía usa mock data
   - Las funciones sleep(500) se deben reemplazar por axios calls
   - El header `Authorization` se incluye automáticamente

2. **UsersView.vue**
   - Importa userService
   - Abre 3 modales diferentes (editar, resetear, confirmar)
   - Maneja errores con try/catch
   - Muestra mensajes con alert (puedes personalizar)

3. **Router**
   - La categoría 'admin' se valida contra sessionStorage.getItem('menu')
   - Solo aparece si está en el array de categorías permitidas

4. **Login.vue**
   - Detecta el rol y agrega 'admin' al menú
   - Esto ocurre después de obtener el menú del backend
   - El usuario_role se guarda en sessionStorage

---

## 🆘 Si algo falla

### "No compila"
→ Verifica que tous los imports están correctos en UsersView.vue

### "Menú no aparece"
→ Verifica console.log en browser (F12 → Console)
→ Busca logs de "Acceso denegado"

### "Tabla vacía"
→ Abre DevTools (F12) → Network
→ Verifica que petición GET se hace
→ Verifica respuesta en formato correcto

### "Modal no abre"
→ Verifica que ModalComponent está importado
→ Busca errores en console

---

## ✅ Verificación Rápida

Copia esto en la consola del navegador para verificar que todo esté configurado:

```javascript
// Verificar token
console.log('Token:', sessionStorage.getItem('token'));

// Verificar role
console.log('Role:', sessionStorage.getItem('user_role'));

// Verificar menú
console.log('Menú:', JSON.parse(sessionStorage.getItem('menu')));

// Verificar si 'admin' está en el menú
const menu = JSON.parse(sessionStorage.getItem('menu') || '[]');
console.log('Tiene admin?', menu.some(m => m.category === 'admin'));
```

---

## 🎓 Siguiente Paso

Una vez que reemplaces las URLs y pruebes que funciona:

1. Pasar las URLs al desarrollador backend
2. Resolver cualquier discrepancia de datos
3. Personalizar textos/colores si es necesario
4. Agregar más funcionalidades al admin si es necesario

¡Listo! 🎉
