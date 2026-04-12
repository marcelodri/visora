# 🎬 INICIO RÁPIDO - Cómo Probar Ahora

## ⚡ En 3 Pasos

### 1️⃣ Abre 2 Terminales

**Terminal A (Servidor)**:
```bash
cd c:\Users\marce\OneDrive\Escritorio\JS\Vue\visora
node server.js
```

Deberías ver:
```
⚡ Server escuchando en puerto 3000
✓ Socket.IO listo
👂 Esperando conexiones...
```

**Terminal B (Cliente)**:
```bash
cd c:\Users\marce\OneDrive\Escritorio\JS\Vue\visora
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### 2️⃣ Abre el Navegador

- **URL**: http://localhost:5173
- **Navega a**: Eventos → Muro de Posts
- **Selecciona un evento**

Deberías ver:
```
┌─────────────────────────┬──────────────────┐
│ Feed de Posts           │ Nuevo Formulario │
│ (izquierda, vacío)      │ (derecha)        │
│                         │                  │
│                         │ [✏️ Editar] [👁] │
│                         │                  │
│                         │ Formulario...    │
└─────────────────────────┴──────────────────┘
```

### 3️⃣ Prueba el Formulario

**A. Verifica los Tabs**:
- Haz clic en `✏️ Editar` → Deberías ver el formulario
- Haz clic en `👁 Preview` → Deberías ver vista previa vacía
- Vuelve a `✏️ Editar` → Deberías volver al formulario

**B. Agrega una Imagen**:
- Haz clic en el área grande de imagen
- Selecciona una foto de tu computadora
- Deberías ver la imagen aparecer (1:1 aspect ratio)

**C. Completa el Formulario**:
- Ingresa tu nombre (ej: "Juan")
- Ingresa un comentario (ej: "¡Hola mundo!")
- La imagen es OPCIONAL

**D. Vista Previa**:
- Haz clic en `👁 Preview`
- Deberías ver exactamente cómo se verá el post
- El avatar, nombre, imagen y comentario

**E. Envía el Post**:
- Vuelve a `✏️ Editar`
- Haz clic en `Compartir`
- Deberías ver el post aparecer en el lado IZQUIERDO (feed)

---

## 🔍 Verificación de Logs

### En la Terminal A (Servidor)

Cuando envíes un post, deberías ver:

```
💬 Mensaje en 1: juan - ¡Hola mundo!
🖼️ Imagen: SÍ (245.67 KB)
```

**Significa**: 
- ✅ El post llegó al servidor
- ✅ La imagen también llegó (pesa 246 KB)
- ✅ Se va a enviar a todos los clientes

**Si dice "NO"**:
```
💬 Mensaje en 1: juan - ¡Hola mundo!
🖼️ Imagen: NO
```
- Significa: Enviaste un post SIN imagen (¡es OK! imagen es opcional)

---

## 🎯 Test Completo (5 minutos)

### Escenario 1: Post CON Imagen
```
1. [✏️ Editar]
2. Nombre: "María"
3. Imagen: Seleccionar foto.jpg
4. Comentario: "¡Esto es genial!"
5. [Compartir]
6. ✅ Verifica que aparezca en la izquierda CON imagen
7. ✅ Verifica log del servidor: "🖼️ Imagen: SÍ"
```

### Escenario 2: Post SIN Imagen
```
1. [✏️ Editar]
2. Nombre: "Pedro"
3. (No seleccionar imagen)
4. Comentario: "Solo texto"
5. [Compartir]
6. ✅ Verifica que aparezca en la izquierda SIN imagen
7. ✅ Verifica log del servidor: "🖼️ Imagen: NO"
```

### Escenario 3: Vista Previa
```
1. [✏️ Editar]
2. Completa nombre + imagen + comentario
3. [👁 Preview]
4. ✅ Verifica que se vea exactamente como en el feed
5. Vuelve a [✏️ Editar]
6. Haz cambios
7. [👁 Preview] de nuevo
8. ✅ Verifica que se actualice
```

---

## 🐛 Troubleshooting

### ❌ "No aparece el formulario nuevo (sin tabs)"

**Posible Causa**: Estás en EventWallCommentView (viejo), no EventWallCommentView_IG (nuevo)

**Solución**:
1. Verifica la URL: debe tener ruta a `/events`
2. Recarga: F5 (hard refresh)
3. Limpia caché: Ctrl+Shift+Delete en DevTools

### ❌ "La imagen no aparece en el lado izquierdo (feed)"

**Posible Causa**: El servidor recibió la imagen pero no se renderiza

**Solución**:
1. Abre DevTools: F12 → Console
2. Busca si hay errores rojos
3. Verifica que en Terminal A diga: "🖼️ Imagen: SÍ"
4. Si dice "SÍ" pero no aparece, recarga (F5)

### ❌ "El botón Compartir está deshabilitado (gris)"

**Posible Causa**: Faltan campos obligatorios

**Solución**:
- Verifica que hayas ingresado:
  - ✅ Nombre (no vacío)
  - ✅ Comentario (no vacío)
  - ⚠️ Imagen (OPCIONAL, no es requisito)

### ❌ "No veo los tabs"

**Posible Causa**: JavaScript no se cargó correctamente

**Solución**:
1. Recarga: F5
2. Si persiste, reinicia: `npm run dev`
3. Verifica en DevTools (F12 → Console) que no hay errores

### ❌ "El servidor no inicia"

**Posible Causa**: Puerto 3000 en uso

**Solución**:
```bash
# En PowerShell:
netstat -ano | Select-String 3000  # Ver qué usa el puerto
taskkill /PID <número> /F           # Matar el proceso
node server.js                      # Reintentar
```

---

## ✨ Qué Esperar Ver

### Pantalla Inicial
```
┌─────────────────────────────────────────┐
│ Eventos - Muro de Posts                 │
│ [Selector de evento]                    │
├─────────────────────────────────────────┤
│ Evento seleccionado                     │
│                                         │
│ ┌───────────────────┬──────────────┐    │
│ │ Feed              │ Creador      │    │
│ │ (vacío)           │ [✏️] [👁]   │    │
│ │                   │              │    │
│ │ Aún no hay posts  │ Nombre: ___  │    │
│ │ ¡Sé el primero!   │ Imagen: [ ]  │    │
│ │                   │ Comentario   │    │
│ │                   │ Emojis       │    │
│ │                   │ [Compartir]  │    │
│ └───────────────────┴──────────────┘    │
└─────────────────────────────────────────┘
```

### Después de Enviar
```
┌─────────────────────────────────────────┐
│                                         │
│ ┌───────────────────┬──────────────┐    │
│ │ ┌──────────────┐  │ [✏️] [👁]   │    │
│ │ │ Tu Post!     │  │              │    │
│ │ │ 🔵 Juan      │  │ Nombre: Juan │    │
│ │ │ Hace 5 seg   │  │ Imagen: ✓    │    │
│ │ ├──────────────┤  │ Tu comentario │    │
│ │ │ [Tu Imagen]  │  │ 👍 💬 📤    │    │
│ │ │ 1:1 aspect   │  │              │    │
│ │ ├──────────────┤  │ [Compartir]  │    │
│ │ │ ❤️ 💬 📤     │  │              │    │
│ │ │ 0 personas   │  │              │    │
│ │ │ Tu comentario│  │              │    │
│ │ └──────────────┘  │              │    │
│ └───────────────────┴──────────────┘    │
└─────────────────────────────────────────┘
```

---

## 📊 Checklist Final

Antes de dar por terminado, verifica:

- [ ] Terminal A (servidor) muestra "⚡ Server escuchando"
- [ ] Terminal B (cliente) muestra "ready in X ms"
- [ ] http://localhost:5173 carga sin errores
- [ ] Puedo seleccionar un evento
- [ ] Veo dos tabs: [✏️ Editar] y [👁 Preview]
- [ ] El área de imagen es cuadrada (1:1)
- [ ] Puedo seleccionar una imagen
- [ ] La imagen aparece en preview
- [ ] Puedo escribir comentario
- [ ] El botón se habilita con nombre + comentario
- [ ] Hago clic en Compartir
- [ ] El post aparece en el lado izquierdo
- [ ] La imagen aparece en el post (si la había)
- [ ] En Terminal A veo: "💬 Mensaje..." y "🖼️ Imagen: SÍ"

Si todo está ✅ → **¡Implementación exitosa!**

---

## 🎓 Próximos Pasos (Opcional)

1. **Multi-cliente**: Abre http://localhost:5173 en otra pestaña
   - Ambas deberían sincronizar en tiempo real

2. **Likes**: Haz clic en corazón en uno, verás cambiar en el otro

3. **Emojis**: Haz clic en emoji picker y agrega emojis al comentario

4. **Recarga**: Recarga la página (F5)
   - Los posts deberían aparecer de nuevo (se guardan en servidor)

---

**¡Listo para probar! 🚀**

Si necesitas ayuda:
1. Revisa los logs en Terminal A
2. Abre DevTools (F12) en el navegador
3. Verifica que no haya errores rojos en la consola
4. Recarga todo (servidor, cliente, navegador)
