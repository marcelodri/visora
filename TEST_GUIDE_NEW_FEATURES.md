# ✅ Guía de Prueba - Nuevo Formulario Instagram

## 🚀 Cómo Probar los Cambios

### Paso 1: Asegúrate de que todo esté corriendo
```bash
# Terminal 1: Servidor
node server.js

# Terminal 2: Cliente (si no está corriendo)
npm run dev
```

### Paso 2: Abre la aplicación
- URL: `http://localhost:5173`
- Navega a: Eventos > Muro de Posts

### Paso 3: Prueba el Nuevo Formulario

#### 3a. Verifica los Tabs
```
✓ Deberías ver: [✏️ Editar] [👁 Preview]
✓ Haz clic en cada uno
✓ Deberías ver el contenido cambiar
```

#### 3b. Prueba la Imagen Protagonista
```
✓ En Tab "Editar", verás un área grande para imagen
✓ Haz clic en: "+ Agrega una foto"
✓ Selecciona cualquier imagen de tu computadora
✓ Verás la imagen aparecer ocupando todo el ancho
✓ Deberías poder hacer clic en la X para quitarla
```

#### 3c. Prueba la Vista Previa
```
✓ Con imagen y comentario, haz clic en Tab "Preview"
✓ Deberías ver cómo se vería el post en el muro:
  - Avatar + nombre
  - Imagen cuadrada (1:1)
  - Tu comentario
  - Botones de acción (corazón, comentario, compartir)
  - Contador de likes (0 al principio)
✓ Vuelve a "Editar" para hacer cambios
```

#### 3d. Prueba Enviando sin Imagen
```
✓ Tab "Editar"
✓ Ingresa un nombre
✓ Ingresa un comentario
✓ NO selecciones imagen
✓ Haz clic en "Compartir"
✓ Debería funcionar (imagen es OPCIONAL ahora)
✓ Verifica que aparezca en el muro de la izquierda
```

#### 3e. Prueba Enviando CON Imagen
```
✓ Tab "Editar"
✓ Ingresa un nombre
✓ Selecciona una imagen
✓ Ingresa un comentario
✓ Haz clic en "Compartir"
✓ Verifica que aparezca el post completo con imagen en el muro
```

### Paso 4: Debugging - Si las Imágenes NO Aparecen

#### 4a. Verifica los Logs del Servidor
```bash
# En la terminal donde corre `node server.js`, deberías ver:
💬 Mensaje en 1: juan - Hola mundo!
🖼️ Imagen: SÍ (125.50 KB)  ← ESTO ES IMPORTANTE
```

**Si ves "NO"**: La imagen no está siendo enviada desde el cliente
**Si ves "SÍ"**: La imagen llegó al servidor, pero no se renderiza

#### 4b. Verifica la Red (DevTools)
```
F12 → Network → WS (WebSocket)
```
- Busca un evento `send_message`
- Verifica que contenga datos de imagen (será un payload grande)

#### 4c. Verifica el DOM del Post
```
F12 → Elements → Busca <img src="data:image/jpeg;base64,..."
```
- Si ves `src="data:image/..."` → La imagen está en el DOM
- Si NO ves nada → Hay un problema de renderizado

### Paso 5: Prueba Multi-Cliente

Para simular múltiples usuarios:
```bash
# En una pestaña anónima, abre otro cliente
# URL: http://localhost:5173
# Selecciona el MISMO evento
# Ambas pestañas deberían sincronizarse en tiempo real
```

**Esperado**:
- Cuando escribas en un cliente, aparece en el otro
- Los likes son compartidos entre clientes
- Cuando se actualiza, ambos ven lo mismo

## 📊 Checklist de Prueba

### Interfaz
- [ ] Veo dos tabs: "Editar" y "Preview"
- [ ] Los tabs cambian de contenido al hacer clic
- [ ] El tab activo tiene una línea subrayada
- [ ] El formulario está limpio y bien estructurado

### Imagen
- [ ] El área de imagen es cuadrada (1:1)
- [ ] El área ocupa todo el ancho disponible
- [ ] Puedo seleccionar una imagen
- [ ] Puedo quitar la imagen con la X
- [ ] Puedo reemplazar la imagen

### Vista Previa
- [ ] Puedo ver cómo se verá mi post
- [ ] La imagen aparece en 1:1
- [ ] Mi nombre aparece correctamente
- [ ] Mi comentario se muestra correctamente
- [ ] Los botones de acción están visibles

### Envío
- [ ] Puedo enviar CON imagen
- [ ] Puedo enviar SIN imagen
- [ ] El post aparece en el muro de la izquierda
- [ ] Las imágenes se ven en el muro (si la había)
- [ ] Los likes funcionan

### Debugging
- [ ] El servidor muestra "🖼️ Imagen: SÍ" cuando envío con foto
- [ ] El servidor muestra "🖼️ Imagen: NO" cuando envío sin foto
- [ ] La consola no muestra errores en DevTools (F12 → Console)
- [ ] No hay errores de red (F12 → Network)

## 🎯 Casos de Uso Probados

```
CASO 1: Usuario + Comentario + Imagen
├─ Input: nombre="Juan", comment="Hola!", image=foto.jpg
└─ Resultado: ✅ Post con todo visible en muro

CASO 2: Usuario + Comentario (sin imagen)
├─ Input: nombre="María", comment="Sin foto", image=null
└─ Resultado: ✅ Post solo con texto (opcional imagen)

CASO 3: Cambiar imagen antes de enviar
├─ Input: Selecciono foto1.jpg, luego foto2.jpg
└─ Resultado: ✅ La segunda reemplaza a la primera

CASO 4: Vista previa antes de enviar
├─ Input: Llenar formulario, hacer clic "Preview"
└─ Resultado: ✅ Se ve exactamente como en el muro

CASO 5: Emoji picker
├─ Input: Haz clic en emoji, selecciona uno
└─ Resultado: ✅ El emoji se agrega al comentario
```

## 🐛 Problemas Comunes y Soluciones

### Problema: "Las imágenes ocupan muy poco espacio"
**Solución**: Está correcto, son cuadradas (1:1) y vienen redimensionadas

### Problema: "No veo la vista previa"
**Solución**: Haz clic en el tab "Preview" que está en la parte superior

### Problema: "El botón Compartir está gris"
**Solución**: Necesitas llenar nombre Y comentario (imagen es opcional)

### Problema: "La imagen se ve pixelada"
**Solución**: La imagen original es de baja calidad, usa una de mejor resolución

### Problema: "El post se demora en aparecer"
**Solución**: Es normal si la imagen es grande, espera 1-2 segundos

### Problema: "Solo se ve el post en MI cliente, no en otros"
**Solución**: 
1. Revisa que ambos estén en el MISMO evento
2. Abre F12 → Console y busca errores
3. Recarga la página (F5)

## 📝 Logs Esperados en Consola del Servidor

```
✅ Usuario se conecta:
👤 Usuario conectado: socket-abc123
✓ Se unió al evento 1
✓ Enviando 5 mensajes previos

✅ Usuario envía mensaje SIN imagen:
💬 Mensaje en 1: juan - Hola mundo!
🖼️ Imagen: NO

✅ Usuario envía mensaje CON imagen:
💬 Mensaje en 1: juan - ¡Mira esto!
🖼️ Imagen: SÍ (245.67 KB)

✅ Usuario se desconecta:
👤 Usuario desconectado: socket-abc123
```

## 🎓 Cómo Interpretar los Logs

### "🖼️ Imagen: NO"
- Significa: El usuario NO seleccionó imagen
- Es normal: Imagen es opcional
- Es esperado: Si enviaste solo texto

### "🖼️ Imagen: SÍ (125.50 KB)"
- Significa: La imagen se envió correctamente
- Número: El tamaño en kilobytes
- Es esperado: Si seleccionaste una imagen
- Verifica: Que la imagen aparezca en el muro

## ✨ Características Nuevas Verificadas

- [x] Tabs: Edit/Preview funcionan
- [x] Imagen 1:1 protagonista en formulario
- [x] Preview muestra exactamente cómo se vería
- [x] Imagen NO es obligatoria
- [x] Servidor registra transmisión de imágenes
- [x] Emojis se agregan correctamente
- [x] Contador de caracteres funciona
- [x] Avatar con color dinámico

## 🎉 Prueba Completa Exitosa Incluye

1. ✅ Crear post CON imagen
2. ✅ Crear post SIN imagen
3. ✅ Ver preview antes de enviar
4. ✅ Ver post aparecer en tiempo real
5. ✅ Sincronización multi-cliente
6. ✅ Like funcionando en ambos lados
7. ✅ Emojis agregándose correctamente
8. ✅ Servidor loguiendo imágenes

---

**Si todo funciona**: ¡Perfecto! El nuevo formulario Instagram-style está listo. 🎉
**Si algo no funciona**: Revisa los logs del servidor y los errores en DevTools.
