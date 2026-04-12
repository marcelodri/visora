# Campo Personalizado @Custom@

## ¿Qué es?

El tipo de campo **`@Custom@`** permite crear campos completamente personalizados con HTML, CSS y JavaScript propios, sin estar limitado a los tipos predefinidos (texto, email, select, etc.).

## ¿Cuándo usarlo?

✅ **Bueno para:**
- Widgets especiales (sliders, color pickers, date range pickers)
- Campos con lógica interactiva compleja
- Integraciones con librerías externas (Flatpickr, Cropper, etc.)
- Campos que cambian dinámicamente según interacción del usuario
- UI personalizada que no se ajusta a los tipos estándar

❌ **No es necesario para:**
- Campos simples de texto, email, número
- Dropdowns/selects normales
- Textareas
- Campos checkbox/radio simples

## Configuración

### Paso 1: Seleccionar tipo @Custom@
En el editor de formularios:
1. Selecciona tipo de campo: **"🎨 Campo personalizado (@Custom@)"**
2. Se mostrarán 4 secciones de configuración

### Paso 2: HTML del campo (requerido)
Escribe el HTML que formará el campo:

```html
<div class="color-picker-custom">
  <input type="color" class="color-input" value="#FF0000" />
  <span class="color-value">#FF0000</span>
</div>
```

**Notas importantes:**
- No uses `id` globales, usa selectores de clase
- El contenedor tendrá el atributo: `data-field="nombre-del-campo"`
- Será renderizado dentro de un div con clase `form-group`

### Paso 3: JavaScript personalizado (opcional)
Código que se ejecuta cuando se renderiza el campo:

```javascript
// this = el contenedor del campo
const input = this.querySelector('input[type="color"]');
const display = this.querySelector('.color-value');

input.addEventListener('change', (e) => {
  display.textContent = e.target.value;
  // Guardar en el formulario si es necesario
  this.value = e.target.value;
});
```

**Contexto disponible:**
- `this` = contenedor del campo
- `this.value` = valor actual del campo
- `this.dataset.field` = nombre del campo
- `this.dataset.fieldIndex` = índice del campo en el formulario

### Paso 4: CSS personalizado (opcional)
Estilos específicos para este campo:

```css
.color-picker-custom {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input {
  cursor: pointer;
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.color-value {
  font-family: monospace;
  padding: 5px 10px;
  background: #f5f5f5;
  border-radius: 3px;
}
```

### Paso 5: Validación (opcional)
Si el campo requiere validación personalizada:

```javascript
// Retorna true si es válido, false si no
const input = this.querySelector('input[type="color"]');
const value = input.value;

// Ej: validar que el color no sea blanco
return value !== '#FFFFFF';
```

## Ejemplos completos

### Ejemplo 1: Color Picker

**HTML:**
```html
<div class="color-picker">
  <input type="color" class="cp-input" value="#000000" />
  <label>Color seleccionado:</label>
  <span class="cp-display">#000000</span>
</div>
```

**JavaScript:**
```javascript
const input = this.querySelector('.cp-input');
const display = this.querySelector('.cp-display');

input.addEventListener('change', (e) => {
  display.textContent = e.target.value.toUpperCase();
  this.value = e.target.value;
});
```

**CSS:**
```css
.color-picker {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cp-input {
  width: 50px;
  height: 40px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.cp-display {
  font-family: monospace;
  font-weight: bold;
}
```

---

### Ejemplo 2: Slider de rango

**HTML:**
```html
<div class="range-slider-widget">
  <div class="rs-header">
    <label>Rango de precio:</label>
    <span class="rs-values">
      <span class="rs-min">0</span> - <span class="rs-max">10000</span>
    </span>
  </div>
  <input type="range" class="rs-input-min" min="0" max="10000" value="0" />
  <input type="range" class="rs-input-max" min="0" max="10000" value="10000" />
</div>
```

**JavaScript:**
```javascript
const minInput = this.querySelector('.rs-input-min');
const maxInput = this.querySelector('.rs-input-max');
const minDisplay = this.querySelector('.rs-min');
const maxDisplay = this.querySelector('.rs-max');

const updateValues = () => {
  minDisplay.textContent = minInput.value;
  maxDisplay.textContent = maxInput.value;
  this.value = JSON.stringify({
    min: minInput.value,
    max: maxInput.value
  });
};

minInput.addEventListener('input', updateValues);
maxInput.addEventListener('input', updateValues);
```

**CSS:**
```css
.range-slider-widget {
  padding: 15px;
}

.rs-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.rs-values {
  font-weight: bold;
  color: #007bff;
}

input[type="range"] {
  width: 100%;
  margin-bottom: 10px;
}
```

---

### Ejemplo 3: File Upload personalizado

**HTML:**
```html
<div class="file-upload-widget">
  <div class="fu-zone">
    <i class="bi bi-cloud-arrow-up"></i>
    <p>Arrastra archivos aquí o haz clic</p>
    <input type="file" class="fu-input" hidden />
  </div>
  <div class="fu-preview"></div>
</div>
```

**JavaScript:**
```javascript
const zone = this.querySelector('.fu-zone');
const input = this.querySelector('.fu-input');
const preview = this.querySelector('.fu-preview');

zone.addEventListener('click', () => input.click());

input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      preview.innerHTML = `
        <div class="fu-file">
          <strong>${file.name}</strong>
          <small>${(file.size / 1024).toFixed(2)} KB</small>
        </div>
      `;
      this.value = event.target.result; // Base64
    };
    reader.readAsDataURL(file);
  }
});

zone.addEventListener('dragover', (e) => {
  e.preventDefault();
  zone.classList.add('dragover');
});

zone.addEventListener('dragleave', () => {
  zone.classList.remove('dragover');
});

zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.classList.remove('dragover');
  input.files = e.dataTransfer.files;
  input.dispatchEvent(new Event('change'));
});
```

**CSS:**
```css
.file-upload-widget {
  padding: 15px;
}

.fu-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.fu-zone:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.fu-zone.dragover {
  border-color: #007bff;
  background: #e7f1ff;
}

.fu-preview {
  margin-top: 15px;
}

.fu-file {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}
```

---

### Ejemplo 4: Date Range Picker

**HTML:**
```html
<div class="date-range-widget">
  <div class="dr-inputs">
    <div class="dr-group">
      <label>Desde:</label>
      <input type="date" class="dr-from" />
    </div>
    <div class="dr-group">
      <label>Hasta:</label>
      <input type="date" class="dr-to" />
    </div>
  </div>
  <div class="dr-display"></div>
</div>
```

**JavaScript:**
```javascript
const fromInput = this.querySelector('.dr-from');
const toInput = this.querySelector('.dr-to');
const display = this.querySelector('.dr-display');

const updateDisplay = () => {
  const from = fromInput.value;
  const to = toInput.value;
  
  if (from && to) {
    display.textContent = `${from} a ${to}`;
    this.value = JSON.stringify({ from, to });
  }
};

fromInput.addEventListener('change', updateDisplay);
toInput.addEventListener('change', updateDisplay);

// Set today as default
const today = new Date().toISOString().split('T')[0];
fromInput.value = today;
```

**CSS:**
```css
.date-range-widget {
  padding: 15px;
}

.dr-inputs {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.dr-group {
  flex: 1;
}

.dr-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.dr-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dr-display {
  font-size: 0.9em;
  color: #666;
  font-style: italic;
}
```

---

## Acceso a datos

### Dentro del JavaScript del campo

```javascript
// Obtener el valor del campo
const value = this.value;

// Obtener el nombre del campo
const fieldName = this.dataset.field;

// Obtener el índice
const fieldIndex = this.dataset.fieldIndex;

// Acceder a otros campos del formulario (si están disponibles)
const formContainer = this.closest('.form-container');
const otherFields = formContainer.querySelectorAll('[data-field]');
```

### Guardar valores

El campo debe almacenar su valor en `this.value`:

```javascript
// Texto simple
this.value = "valor";

// Objeto complejo (será convertido a JSON)
this.value = JSON.stringify({ min: 10, max: 100 });

// Array
this.value = JSON.stringify(['opción1', 'opción2']);
```

## Validación personalizada

Si marcas "Este campo requiere validación personalizada":

```javascript
// Retorna true si es válido
// Retorna false si hay error

const input = this.querySelector('input');
const value = input.value;

// Validación: no puede estar vacío
if (!value) {
  console.warn('Campo requerido');
  return false;
}

// Validación: debe tener más de 3 caracteres
if (value.length < 3) {
  console.warn('Mínimo 3 caracteres');
  return false;
}

return true;
```

## Debugging

Si algo no funciona:

1. **Abre DevTools** (F12)
2. **Ve a Console**
3. **Busca errores** en rojo
4. **Usa console.log** en tu JavaScript:

```javascript
console.log('this:', this);
console.log('value:', this.value);
console.log('field name:', this.dataset.field);
```

5. **Prueba el CSS** manualmente en DevTools
6. **Valida el HTML** que escribiste

## Limitaciones

- No puedes usar `id` (usa clases en su lugar)
- JavaScript tiene acceso limitado a contexto externo (usa `this` para el contenedor)
- CSS es local (no afecta otros elementos)
- No hay acceso directo a Vue reactivity

## Tips de performance

- ✅ Usa event delegation (`.closest()` en lugar de `.querySelector()`)
- ✅ Cachea selectores en variables
- ✅ Usa `data-*` attributes en lugar de clases para datos
- ❌ Evita setInterval/setTimeout si no es necesario
- ❌ No hagas requests HTTP en el JavaScript del campo

## Seguridad

- ⚠️ El HTML/JS/CSS se ejecuta directamente
- ⚠️ No uses `eval()` ni `innerHTML` con datos de usuarios
- ✅ Usa `textContent` en lugar de `innerHTML` cuando sea posible
- ✅ Sanitiza datos antes de mostrarlos

## Integraciones comunes

### Con Flatpickr (Date picker)
```html
<input type="text" class="datepicker" />
```

```javascript
// Necesita Flatpickr cargado en la página
flatpickr(this.querySelector('.datepicker'), {
  enableTime: true,
  dateFormat: 'Y-m-d H:i',
  onChange: (selectedDates) => {
    this.value = selectedDates[0].toISOString();
  }
});
```

### Con Select2 (Select avanzado)
```html
<select class="select2-field" multiple>
  <option>Opción 1</option>
  <option>Opción 2</option>
</select>
```

```javascript
// Necesita Select2 cargado
$(this.querySelector('.select2-field')).select2({
  theme: 'bootstrap-5'
});
```

---

¡Usa tu imaginación y crea campos que se adapten perfectamente a tu necesidades! 🚀
