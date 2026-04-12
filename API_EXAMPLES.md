# Ejemplos de APIs públicas para probar

## APIs Recomendadas (gratuitas y sin autenticación)

### 1. Países y ciudades
**Endpoint:** `https://restcountries.com/v3.1/all`
**Método:** GET
**Respuesta:**
```json
[
  {
    "name": { "common": "Argentina", "official": "Argentine Republic" },
    "cca2": "AR",
    "region": "Americas"
  },
  ...
]
```

### 2. Ciudades de países
**Endpoint:** `https://api.weatherapi.com/v1.1/current.json`
**Método:** GET
**Parámetros:**
```json
{
  "key": "demo",
  "q": "London"
}
```

### 3. Provincias/Estados por país
**Endpoint:** `https://www.universal-tutorial.com/api/countries`
**Método:** GET
**Nota:** Requiere header de autenticación

### 4. Pokémon (para pruebas simples)
**Endpoint:** `https://pokeapi.co/api/v2/pokemon?limit=10`
**Método:** GET
**Respuesta:**
```json
{
  "results": [
    { "name": "bulbasaur", "url": "..." },
    { "name": "ivysaur", "url": "..." }
  ]
}
```

## Configuración para pruebas rápidas

### Test 1: Lista de Pokémon
```
URL: https://pokeapi.co/api/v2/pokemon?limit=20
Método: GET
Parámetros: {}
Label key: name
Value key: name
Cache: ✓
```

### Test 2: Países del mundo
```
URL: https://restcountries.com/v3.1/all
Método: GET
Parámetros: {}
Label key: name.common
Value key: cca2
Cache: ✓
```

### Test 3: JSON simulado (usando JSONPlaceholder)
```
URL: https://jsonplaceholder.typicode.com/users
Método: GET
Parámetros: {}
Label key: name
Value key: id
Cache: ✓
```

## Tu propia API local

Crear un endpoint simple en Express para pruebas:

```javascript
app.get('/api/ciudades', (req, res) => {
  const pais = req.query.pais_id;
  
  const ciudades = {
    'AR': [
      { id: 'BA', nombre: 'Buenos Aires' },
      { id: 'MZ', nombre: 'Mendoza' }
    ],
    'MX': [
      { id: 'MX1', nombre: 'Ciudad de México' },
      { id: 'MX2', nombre: 'Guadalajara' }
    ]
  };
  
  res.json(ciudades[pais] || []);
});
```

**Configuración en el formulario:**
```
URL: http://localhost:3000/api/ciudades
Método: GET
Parámetros: {"pais_id": "campo_pais"}
Label key: nombre
Value key: id
```

## APIs con autenticación

### OpenWeather
```
URL: https://api.openweathermap.org/data/2.5/find?q=London
Headers: { "Authorization": "Bearer YOUR_API_KEY" }
```

### GitHub API
```
URL: https://api.github.com/users
Headers: { "Accept": "application/vnd.github.v3+json" }
```

## Debugging

Si la API no funciona:

1. **Prueba el endpoint en el navegador:**
   ```
   https://pokeapi.co/api/v2/pokemon?limit=5
   ```

2. **Verifica formato JSON:**
   - Las respuestas deben ser JSON válido
   - Copia/pega en https://jsonlint.com/

3. **Revisa CORS:**
   - Si ves error de CORS en consola, el endpoint no permite requests desde el navegador
   - Solución: usar un proxy CORS
   ```
   URL: https://cors-anywhere.herokuapp.com/https://api.ejemplo.com/endpoint
   ```

4. **Valida parámetros:**
   - Verifica que los nombres de campos coincidan con los que usas en el formulario
   - Usa el botón "Probar cargar opciones" para ver errores

## Solución de CORS

Si encuentras problemas de CORS, puedes:

1. **Usar un proxy CORS público:**
   ```
   https://cors-anywhere.herokuapp.com/[URL_ORIGINAL]
   ```

2. **Configura CORS en tu servidor:**
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```

3. **Usa Server-Side Rendering:**
   - Hacer el request en backend (Node.js/Express)
   - Devolver los datos en una API propia que SÍ permita CORS

## Tips de performance

- **Usa cache** siempre que sea posible
- **Limita la cantidad de opciones** (< 100 idealmente)
- **Pagina los resultados** si tienes muchas opciones
- **Lazy-load** las opciones solo cuando el usuario abre el select

## Monitoreo

Para ver qué se está pidiendo a la API:

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Haz clic en "Probar cargar opciones"
4. Verás la request HTTP que se envió

Datos que verás:
- **Headers**: Todo lo que se envió (Authorization, etc.)
- **Query String**: Los parámetros GET
- **Request Body**: Los parámetros POST
- **Response**: Lo que devolvió la API
- **Status**: 200 (OK), 404 (no encontrado), 401 (no autorizado), etc.
