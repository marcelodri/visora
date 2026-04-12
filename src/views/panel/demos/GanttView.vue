<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <div class="max-w-full mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2 flex items-center gap-2">
              <Calendar :size="32" />
              Diagrama de Gantt - Proyecto Renault
            </h1>
            <p class="text-blue-100">Integración Renault → Pilot</p>
          </div>
          <button
            @click="exportToPDF"
            class="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
          >
            <Download :size="20" />
            Exportar a PDF
          </button>
        </div>
      </div>

      <!-- Gantt Chart -->
      <div ref="chartRef" class="p-6">
        <!-- Column Headers -->
        <div class="flex mb-2">
          <div class="w-64 font-bold text-sm text-gray-700 border-r-2 border-gray-300 pr-4">
            Tarea
          </div>
          <div class="flex-1">
            <div class="flex bg-gray-800 text-white font-semibold py-2 rounded-t">
              <div
                v-for="(date, index) in dateHeaders"
                :key="index"
                class="text-xs text-center border-r border-gray-300"
                :style="{ width: `${100/totalDays}%` }"
              >
                {{ date }}
              </div>
            </div>
          </div>
        </div>

        <!-- Task Rows -->
        <div
          v-for="(task, index) in tasks"
          :key="index"
          class="flex border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <!-- Task Info -->
          <div class="w-64 p-3 border-r-2 border-gray-300 bg-gray-50">
            <div class="font-semibold text-sm text-gray-800 mb-1">{{ task.tarea }}</div>
            <div class="text-xs text-gray-600">{{ task.descripcion }}</div>
            <div class="text-xs text-blue-600 font-semibold mt-1">{{ task.duracion }} días</div>
          </div>

          <!-- Timeline -->
          <div class="flex-1 relative" style="min-height: 70px">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex">
              <div
                v-for="i in totalDays"
                :key="i"
                class="border-r border-gray-200"
                :style="{ width: `${100/totalDays}%` }"
              />
            </div>

            <!-- Task Bar -->
            <div 
              class="absolute top-1/2 transform -translate-y-1/2 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded shadow-md flex items-center justify-center text-white text-xs font-semibold"
              :style="getBarPosition(task)"
            >
              {{ task.duracion }}d
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Summary -->
      <div class="bg-gray-50 p-4 border-t border-gray-200">
        <div class="flex gap-6 text-sm text-gray-600">
          <div>📅 <strong>Inicio:</strong> {{ formatDate(minDate) }}/2025</div>
          <div>🏁 <strong>Fin:</strong> {{ formatDate(maxDate) }}/2025</div>
          <div>⏱️ <strong>Duración total:</strong> {{ totalDays }} días</div>
          <div>📋 <strong>Tareas:</strong> {{ tasks.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download, Calendar } from 'lucide-vue-next'

const chartRef = ref(null)

const tasks = [
  { semana: "Semana 1", fecha: "01/12/2025", tarea: "Relevamiento de APIs Renault", descripcion: "Leer documentación, validar endpoints y autenticación", duracion: 4, estado: "Pendiente" },
  { semana: "Semana 1", fecha: "01/12/2025", tarea: "Comparación Renault → Pilot", descripcion: "Mapeo de campos, tipos de datos y validaciones", duracion: 4, estado: "Pendiente" },
  { semana: "Semana 1", fecha: "01/12/2025", tarea: "Diseño preliminar DB", descripcion: "Estructura inicial + análisis de relaciones", duracion: 4, estado: "Pendiente" },
  { semana: "Semana 2", fecha: "05/12/2025", tarea: "Diseño final de la base de datos", descripcion: "Definición final de tablas, logs, índices", duracion: 3, estado: "Pendiente" },
  { semana: "Semana 2", fecha: "08/12/2025", tarea: "Creación de la base de datos", descripcion: "Implementación física en MySQL/PostgreSQL", duracion: 2, estado: "Pendiente" },
  { semana: "Semana 2", fecha: "08/12/2025", tarea: "Setup del entorno", descripcion: "Repositorio, estructura del proyecto, variables de entorno", duracion: 3, estado: "Pendiente" },
  { semana: "Semana 2", fecha: "09/12/2025", tarea: "Inicio del flujo de integración", descripcion: "Primeros módulos del flujo Renault → Pilot", duracion: 3, estado: "Pendiente" },
  { semana: "Semana 3", fecha: "12/12/2025", tarea: "Desarrollo completo del flujo", descripcion: "Requests, normalización, mapeo, inserción", duracion: 5, estado: "Pendiente" },
  { semana: "Semana 3", fecha: "15/12/2025", tarea: "Implementación de logs", descripcion: "Log OK, log de errores, reintentos", duracion: 3, estado: "Pendiente" },
  { semana: "Semana 3", fecha: "15/12/2025", tarea: "Manejo de errores y reintentos", descripcion: "Guardar errores, reprocesar, validaciones", duracion: 3, estado: "Pendiente" },
  { semana: "Semana 4", fecha: "19/12/2025", tarea: "Pruebas integrales", descripcion: "Unit tests + tests de integración + QA", duracion: 4, estado: "Pendiente" },
  { semana: "Semana 4", fecha: "22/12/2025", tarea: "Ajustes finales", descripcion: "Correcciones, optimizaciones", duracion: 3, estado: "Pendiente" },
  { semana: "Semana 4", fecha: "23/12/2025", tarea: "Documentación final", descripcion: "Documentación técnica, arquitectura y uso", duracion: 2, estado: "Pendiente" }
]

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/')
  return new Date(year, month - 1, day)
}

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const minDate = computed(() => new Date(Math.min(...tasks.map(t => parseDate(t.fecha)))))
const maxDate = computed(() => new Date(Math.max(...tasks.map(t => addDays(parseDate(t.fecha), t.duracion)))))
const totalDays = computed(() => Math.ceil((maxDate.value - minDate.value) / (1000 * 60 * 60 * 24)) + 1)

const formatDate = (date) => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

const dateHeaders = computed(() => {
  const headers = []
  let currentDate = new Date(minDate.value)
  
  for (let i = 0; i < totalDays.value; i++) {
    headers.push(formatDate(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  return headers
})

const getBarPosition = (task) => {
  const startDate = parseDate(task.fecha)
  const daysSinceStart = Math.floor((startDate - minDate.value) / (1000 * 60 * 60 * 24))
  const left = (daysSinceStart / totalDays.value) * 100
  const width = (task.duracion / totalDays.value) * 100
  return { left: `${left}%`, width: `${width}%` }
}

const exportToPDF = () => {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Diagrama de Gantt - Renault</title>
      <style>
        @page { size: landscape; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          background: white;
        }
        h1 { 
          text-align: center; 
          color: #1e40af; 
          margin-bottom: 10px;
          font-size: 24px;
        }
        .subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .gantt-row {
          display: flex;
          margin: 2px 0;
          align-items: center;
        }
        .task-name {
          width: 250px;
          padding: 8px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          font-size: 10px;
          font-weight: bold;
        }
        .task-bar-container {
          flex: 1;
          height: 30px;
          border: 1px solid #d1d5db;
          position: relative;
          background: white;
        }
        .task-bar {
          position: absolute;
          height: 100%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 9px;
          font-weight: bold;
        }
        .date-labels {
          display: flex;
          margin-left: 250px;
          background: #374151;
          color: white;
          padding: 5px 0;
          margin-bottom: 5px;
        }
        .date-label {
          flex: 1;
          text-align: center;
          font-size: 8px;
          border-right: 1px solid #4b5563;
        }
        .summary {
          margin-top: 20px;
          padding: 10px;
          background: #f9fafb;
          border: 1px solid #d1d5db;
          font-size: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
          font-size: 10px;
        }
        th {
          background: #1e40af;
          color: white;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>📊 Diagrama de Gantt - Proyecto Integración Renault</h1>
      <div class="subtitle">Integración Renault → Pilot | Período: ${formatDate(minDate.value)} - ${formatDate(maxDate.value)}/2025</div>
      
      <div class="date-labels">
        ${dateHeaders.value.map(date => `<div class="date-label">${date}</div>`).join('')}
      </div>

      ${tasks.map(task => {
        const pos = getBarPosition(task)
        return `
          <div class="gantt-row">
            <div class="task-name">
              <strong>${task.tarea}</strong><br>
              <span style="font-size: 8px; color: #6b7280;">${task.descripcion}</span><br>
              <span style="color: #2563eb; font-size: 8px;">${task.duracion} días | ${task.fecha}</span>
            </div>
            <div class="task-bar-container">
              <div class="task-bar" style="left: ${pos.left}; width: ${pos.width}">
                ${task.duracion}d
              </div>
            </div>
          </div>
        `
      }).join('')}

      <div class="summary">
        <strong>Resumen del Proyecto:</strong> ${tasks.length} tareas | Duración total: ${totalDays.value} días | 
        Inicio: ${formatDate(minDate.value)}/2025 | Fin: ${formatDate(maxDate.value)}/2025
      </div>

      <table>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Fecha</th>
            <th>Tarea</th>
            <th>Descripción</th>
            <th>Duración</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => `
            <tr>
              <td>${task.semana}</td>
              <td>${task.fecha}</td>
              <td><strong>${task.tarea}</strong></td>
              <td>${task.descripcion}</td>
              <td>${task.duracion} días</td>
              <td>${task.estado}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  printWindow.document.write(printContent)
  printWindow.document.close()
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
</script>