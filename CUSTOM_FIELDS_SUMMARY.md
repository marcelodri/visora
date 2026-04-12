# ✨ Nuevo: Campos Personalizados @Custom@

**Fecha:** 15 de Enero, 2026
**Cambio:** Agregado nuevo tipo de campo completamente personalizable

---

## 🎯 ¿Qué cambió?

Ahora puedes crear campos `@Custom@` (personalizados) que permiten:
- ✅ HTML personalizado
- ✅ JavaScript personalizado (con contexto `this` del contenedor)
- ✅ CSS personalizado para estilos únicos
- ✅ Validación personalizada
- ✅ Guardado de valores complejos (JSON)

---

## 📝 Cambios técnicos

### En FormsView.vue

1. **Agregado tipo de campo:** `@Custom@` en el select de tipos
   ```vue
   <option value="@Custom@">🎨 Campo personalizado (@Custom@)</option>
   ```

2. **Nueva sección en el editor:** "Sección CUSTOM"
   - HTML textarea (requerido)
   - JavaScript textarea (opcional)
   - CSS textarea (opcional)
   - Validación personalizada (opcional)

3. **Estructura de datos extendida:**
   ```javascript
   field: {
     // ... propiedades existentes ...
     customHTML: '',
     customJS: '',
     customCSS: '',
     customRequiresValidation: false,
     customValidation: ''
   }
   ```

4. **Función addField() actualizada**
   - Incluye todas las propiedades custom por defecto

---

## 🚀 Cómo usar

### Paso 1: Crear un campo
1. En el editor de formularios, click en "Agregar Campo"
2. Selecciona tipo: **"🎨 Campo personalizado (@Custom@)"**

### Paso 2: Escribir el HTML
```html
<div class="my-widget">
  <input type="text" class="input-field" placeholder="Texto aquí" />
  <button class="btn-action">Acción</button>
</div>
```

### Paso 3: Agregar JavaScript (si es necesario)
```javascript
// this = contenedor del campo
const input = this.querySelector('.input-field');
const btn = this.querySelector('.btn-action');

btn.addEventListener('click', () => {
  console.log('Valor:', input.value);
  this.value = input.value; // Guardar en el formulario
});
```

### Paso 4: Estilos CSS (opcional)
```css
.my-widget {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.input-field {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

### Paso 5: Validación (opcional)
Marca checkbox "Este campo requiere validación personalizada"
```javascript
// Debe retornar true (válido) o false (inválido)
const input = this.querySelector('.input-field');
return input.value.length > 0;
```

---

## 📊 Comparación

### Antes
```
Tipos de campo disponibles:
- Texto
- Número
- Email
- Textarea
- Select (con opciones fijas)
```

### Después
```
Tipos de campo disponibles:
- Texto
- Número
- Email
- Textarea
- Select (con opciones fijas)
- 🎨 @Custom@ (¡NUEVO!) - Completamente personalizable
```

---

## 💡 Casos de uso

### Widget de color picker
```
HTML: Input de tipo color + display
JS: Sincronizar valor al cambiar color
CSS: Estilos personalizados para el picker
```

### Slider de rango
```
HTML: Dos inputs range
JS: Actualizar displays y valor
CSS: Estilos para el slider dual
```

### File uploader
```
HTML: Drop zone + input file
JS: Drag & drop + file preview
CSS: Estilos atractivos para upload
```

### Date range picker
```
HTML: Dos inputs date
JS: Validar rango válido
CSS: Layout lado a lado
```

---

## 🔧 APIs disponibles

Dentro del JavaScript del campo tienes acceso a:

```javascript
// El contenedor del campo
this

// Guardar el valor
this.value = "algo";

// Nombre del campo
this.dataset.field

// Índice del campo
this.dataset.fieldIndex

// Buscar en el formulario
this.closest('.form-container')
```

---

## 📚 Documentación completa

Ver archivo: **CUSTOM_FIELDS.md**

Incluye:
- Ejemplos completos y funcionales
- Color picker
- Slider de rango
- File upload
- Date range picker
- Tips de debugging
- Integraciones con librerías

---

## ⚠️ Importante

- ✅ No uses `id` globales, usa clases
- ✅ El HTML se ejecuta en el contexto del formulario
- ⚠️ Si algo no funciona, abre DevTools (F12) → Console
- 💾 Los valores complejos se guardan como JSON

---

## 🎨 Ejemplos rápidos

### Color picker en 3 líneas
```html
<input type="color" class="cp-input" />
```

```javascript
this.querySelector('.cp-input').addEventListener('change', (e) => {
  this.value = e.target.value;
});
```

### Botón interactivo
```html
<button class="btn">Click me</button>
```

```javascript
this.querySelector('.btn').addEventListener('click', () => {
  this.value = 'Clickeado!';
});
```

---

¡Ahora tienes libertad total para crear los campos que necesites! 🚀
