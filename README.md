# VisoraHub

This template should help get you started developing with Vue 3 in Vite.

## 🚗 NUEVO: Compartir Vehículos (Vehicle Share)

### Pasos de Setup Rápido:

**1. Instalar librerías necesarias:**
```bash
npm install jspdf html2canvas
```

**2. Agregar ruta al router** (`src/router/index.js`):

En la sección `// demos`, dentro de `children:` agrega:
```javascript
{
  path: 'vehicle-share',
  name: 'demos-vehicle-share',
  component: () => import('@/views/panel/demos/VehicleShareView.vue'),
  meta: {
    requiresAuth: true,
    category: 'demos',
    label: 'Compartir Vehículos'
  }
}
```

**3. Acceder a:**
`http://localhost:5173/panel/demos/vehicle-share`

### Características:
✅ Importar stock desde Pilot Solution  
✅ Búsqueda y filtros dinámicos  
✅ Modal con 4 tabs (Imágenes, Detalles, Info Financiera, PDF)  
✅ Generación de PDF con jsPDF  
✅ Integración con WhatsApp  
✅ Información financiera mockada (reemplazar con endpoint n8n)  

### Información Financiera - Backend n8n:

Archivo: `src/views/panel/demos/VehicleShareView.vue`

Busca `fetchFinancialInfo()` y `saveFinancialInfo()` - reemplaza con tus endpoints:
- **GET** `/api/vehicles/{vehicleId}/financial`
- **POST** `/api/vehicles/{vehicleId}/financial`

Estructura esperada:
```json
{
  "vehicleId": 123,
  "price": "$100,000",
  "monthlyPayment": "$2,000",
  "downPayment": "$7,800",
  "term": "60 meses"
}
```

---

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
