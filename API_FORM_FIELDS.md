# Campos de Formulario con Carga desde API

## Descripción
A partir de ahora, los campos `select` en los formularios pueden cargar sus opciones dinámicamente desde un endpoint API. Esto permite:

- ✅ Cargar opciones desde un servidor remoto
- ✅ Implementar campos dependientes (ej: País → Provincia)
- ✅ Cachear resultados para evitar solicitudes repetidas
- ✅ Usar GET o POST según el endpoint
- ✅ Pasar headers personalizados (ej: tokens de autenticación)

## Configuración

### 1. Habilitar carga desde API
En el editor de formularios, al configurar un campo `select`:
1. Marca el checkbox: **"Cargar opciones desde API"**
2. Los controles cambian a modo API

### 2. Parámetros de configuración

#### URL del endpoint (requerido)
```
https://api.ejemplo.com/ciudades
```

#### Método HTTP
- **GET**: Para consultas simples
- **POST**: Para consultas con parámetro en el body

#### Parámetros de consulta (JSON)
Aquí defines los parámetros a enviar. Usa `campo_NOMBRE` para referenciar valores de otros campos:

**Ejemplo 1 - Sin dependencias:**
```json
{
  "filtro": "activo",
  "tipo": "ciudades"
}
```

**Ejemplo 2 - Con dependencia de otro campo:**
```json
{
  "pais_id": "campo_pais",
  "region_id": "campo_region"
}
```

En este ejemplo:
- `"campo_pais"` será reemplazado por el valor actual del campo con nombre `pais`
- `"campo_region"` será reemplazado por el valor actual del campo con nombre `region`

#### Mapeo de respuesta
- **Campo de etiqueta (label)**: Propiedad del JSON que se muestra al usuario
  - Ej: si la respuesta incluye `"nombre": "Buenos Aires"`, usar `nombre`
  
- **Campo de valor (value)**: Propiedad del JSON que se usa internamente
  - Ej: si la respuesta incluye `"id": "BA123"`, usar `id`

#### Headers (opcional)
Para APIs que requieren autenticación:
```json
{
  "Authorization": "Bearer token_aqui",
  "X-Custom-Header": "valor"
}
```

#### Cache
Marca el checkbox **"Cachear resultados"** para:
- Evitar solicitudes repetidas con los mismos parámetros
- Mejorar performance
- Útil para listas que cambian raramente

## Ejemplos de uso

### Ejemplo 1: Cargar ciudades de un país seleccionado

**Estructura del formulario:**
```
Campo 1: País (select, estático)
  Opciones:
  - Argentina (AR)
  - México (MX)
  - Brasil (BR)

Campo 2: Ciudad (select, desde API)
```

**Configuración del campo "Ciudad":**
```
URL: https://api.ejemplo.com/ciudades
Método: GET
Parámetros: {"pais_id": "campo_pais"}
Label key: nombre
Value key: id
```

**Respuesta esperada de la API:**
```json
[
  { "id": "BA", "nombre": "Buenos Aires" },
  { "id": "MZ", "nombre": "Mendoza" },
  { "id": "CRD", "nombre": "Córdoba" }
]
```

### Ejemplo 2: Cargar opciones con múltiples parámetros

**Configuración:**
```
URL: https://api.ejemplo.com/filtrados
Método: POST
Parámetros: {
  "pais": "campo_pais",
  "region": "campo_region",
  "tipo": "activo"
}
Label key: label
Value key: value
```

### Ejemplo 3: Con autenticación JWT

**Configuración:**
```
URL: https://api.auth.com/opciones
Método: GET
Parámetros: {"categoria": "campo_categoria"}
Label key: name
Value key: id
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
Cache: ✓ Activado
```

## Testing

En el editor de formularios, cada campo con configuración API tiene un botón:
- **"Probar cargar opciones"**: Ejecuta la llamada a la API con los parámetros actuales
- Muestra la cantidad de opciones cargadas
- Útil para validar la configuración antes de guardar

## Resolución de parámetros

El sistema reemplaza automáticamente referencias a campos en los parámetros:

```
"campo_nombredelcampo" → valor_del_campo_en_formulario
```

### Ejemplo:
Si tienes campos:
- `pais` con valor `"AR"`
- `region` con valor `"BA"`

Y un parámetro como:
```json
{
  "pais_id": "campo_pais",
  "region_id": "campo_region",
  "filtro": "activo"
}
```

Se transformará a:
```json
{
  "pais_id": "AR",
  "region_id": "BA",
  "filtro": "activo"
}
```

## Mapeo de respuesta

El sistema puede manejar dos formatos de respuesta:

### Formato 1: Array directo
```json
[
  { "id": 1, "nombre": "Opción 1" },
  { "id": 2, "nombre": "Opción 2" }
]
```

### Formato 2: Objeto con array anidado
```json
{
  "data": [
    { "id": 1, "nombre": "Opción 1" },
    { "id": 2, "nombre": "Opción 2" }
  ]
}
```

En ambos casos:
- Especifica `"nombre"` en "Campo de etiqueta"
- Especifica `"id"` en "Campo de valor"

## Tratamiento de errores

Si hay un error al cargar opciones desde la API:
- Se muestra una notificación de error
- El campo queda vacío (sin opciones)
- Se registra en la consola con detalles del error

Errores comunes:
- **CORS**: Verifica que el endpoint permita requests desde tu dominio
- **Authentication**: Valida que los headers/tokens sean correctos
- **JSON inválido**: Verifica el formato de parámetros y headers
- **Endpoint inválido**: Verifica la URL

## Casos de uso recomendados

✅ **Bueno para:**
- Listas de países, ciudades, provincias
- Categorías de productos
- Usuarios o empleados
- Opciones que cambian frecuentemente
- Campos dependientes

❌ **No recomendado para:**
- Listas muy pequeñas (< 5 opciones) - mejor usar estático
- Listas que nunca cambian - considerar estático
- Datos sensibles que no deben exponerse en cliente

## Notas importantes

- Las opciones se cargan **cada vez que el campo se renderiza** en el formulario del usuario
- Si usas cache, se reutiliza la respuesta mientras los parámetros no cambien
- El campo de valor (`valueKey`) es lo que se envía cuando el usuario envía el formulario
- El campo de etiqueta (`labelKey`) es solo lo que ve el usuario

## Limitaciones actuales

- Máximo 1 nivel de referencias (`campo_x`, no soporta `campo_campo_x`)
- Headers se envían en texto plano (considera usar HTTPS)
- No hay timeout configurable (usa 30s por defecto de axios)
- No hay fallback automático a opciones estáticas si API falla
