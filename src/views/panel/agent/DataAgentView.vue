<template>
  <div class="container-fluid agent-page">
    <div class="agent-shell">
      <div class="header-section">
        <div class="header-title-group align-items-center">
          <div>
            <h2>
              <i class="bi bi-robot me-2"></i>
              {{ agent_name.charAt(0).toUpperCase() + agent_name.slice(1).toLowerCase() }}
            </h2>
            <!-- <p class="agent-subtitle mb-0">{{ $t('agent_view.subtitle') }}</p> -->
            <p class="small mb-1">Límite de consultas <b>{{ query_limit }}</b>. Consultas realizadas <b>{{ queries_used }}</b></p>
            <p class="small mb-1">Te quedan <b>{{ parseInt(query_limit-queries_used) }} consultas</b></p>
          </div>
          <button
            type="button"
            class="btn btn-sync-data"
            :disabled="syncing"
            @click="syncData"
          >
            <i class="bi bi-arrow-repeat" :class="{ 'spin': syncing }"></i>
            {{ syncing ? $t('agent_view.syncing') : $t('agent_view.sync_data') }}
          </button>
        </div>
      </div>
      <hr class="header-divider" />

      <div class="agent-main-layout">
        <div class="agent-conversation">
          <div v-if="!turns.length" class="agent-empty-state">
            <i class="bi bi-chat-square-text"></i>
            <p class="agent-empty-title">{{ $t('agent_view.empty_title') }}</p>
            <p class="agent-empty-text">{{ $t('agent_view.empty_text') }}</p>
          </div>

          <div v-for="turn in turns" :key="turn.id" class="agent-turn">
            <!-- Pregunta del usuario -->
            <div class="agent-bubble agent-bubble-user">
              <div class="agent-bubble-content">
                <span class="agent-bubble-text">{{ turn.question }}</span>
                <button
                  type="button"
                  class="agent-fav-btn"
                  :class="{ active: isFavorite(turn.question) }"
                  @click="toggleFavorite(turn.question)"
                  :title="isFavorite(turn.question) ? $t('agent_view.remove_favorite') : $t('agent_view.add_favorite')"
                >
                  <i class="bi bi-star-fill"></i>
                </button>
              </div>
              <span class="agent-bubble-time">{{ formatTime(turn.timestamp) }}</span>
            </div>

            <!-- Respuesta del agente -->
            <div class="agent-bubble agent-bubble-bot">
              <div class="agent-bubble-avatar"><i class="bi bi-robot"></i></div>
              <div class="agent-bubble-body">
                <div v-if="turn.status === 'loading'" class="agent-loading">
                  <span class="agent-dot"></span>
                  <span class="agent-dot"></span>
                  <span class="agent-dot"></span>
                </div>

                <p v-else-if="turn.status === 'error'" class="agent-error">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ turn.error }}
                </p>

                <template v-else>
                  <div class="agent-answer-row">
                    <div class="agent-answer-text" v-html="formatAnswer(turn.result.text)"></div>
                    <button
                      type="button"
                      class="agent-export-btn"
                      :title="$t('agent_view.export_pdf')"
                      @click="exportTurnToPdf(turn)"
                    >
                      <i class="bi bi-file-earmark-pdf"></i>
                    </button>
                  </div>

                  <div v-if="turn.result.chart" class="agent-section agent-chart-wrapper">
                    <canvas :ref="el => setChartCanvas(el, turn.id)" height="260"></canvas>
                  </div>

                  <div v-if="turn.result.table" class="agent-section agent-table-wrapper">
                    <DataTableComponent
                      :data="turn.result.table.rows"
                      :columns="turn.result.table.columns"
                      :items-per-page="8"
                      showDownloadButton
                    />
                  </div>

                  <div v-if="turn.result.followups.length" class="agent-section agent-followups-wrapper">
                    <span class="agent-followups-label">{{ $t('agent_view.suggested_queries') }}</span>
                    <div class="agent-followups">
                      <button
                        v-for="(followup, i) in turn.result.followups"
                        :key="i"
                        type="button"
                        class="agent-followup-chip"
                        @click="askQuestion(followup)"
                      >
                        {{ followup }}
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="agent-input-bar">
          <div v-if="favorites.length" class="bar-favorites">
            <h6>{{ $t('agent_view.favorites') }}</h6>
            <div class="agent-favorites-row">
              <i class="bi bi-star-fill agent-favorites-icon"></i>
              <div class="favorites-list">
                <div v-for="(fav, index) in favorites" :key="index" class="favorite-chip">
                  <button type="button" class="favorite-chip-btn" :title="fav" @click="askQuestion(fav)">
                    {{ fav }}
                  </button>
                  <button
                    type="button"
                    class="fav-remove-btn"
                    :title="$t('agent_view.remove_favorite')"
                    @click.stop="removeFavorite(index)"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form class="agent-input-form" @submit.prevent="handleSend">
            <button
              type="button"
              class="agent-clear-btn"
              :disabled="!turns.length"
              :title="$t('agent_view.clear_conversation')"
              @click="confirmClear"
            >
              <i class="bi bi-eraser"></i>
            </button>
            <textarea
              ref="inputRef"
              v-model="question"
              rows="1"
              class="agent-input-textarea"
              :placeholder="$t('agent_view.placeholder')"
              @keydown.enter.exact.prevent="handleSend"
              @input="autoResize"
            ></textarea>
            <button
              type="submit"
              class="agent-send-btn"
              :disabled="!question.trim() || sending"
              :title="$t('agent_view.send')"
            >
              <i class="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      </div>
    </div>

    <ConfirmPopup
      ref="confirmPopup"
      :title="$t('agent_view.clear_title')"
      :question="$t('agent_view.clear_question')"
      @response="handleClearConfirm"
    />

   <ToastComponent
      ref="toastComponent"
      :title="toastTitle"
      :message="toastMessage"
      :isSuccess="isSuccess"
    />

    <!-- Loading general de la app para Sincronización -->
    <LoadingDots :isLoading="loading" />
  </div>
</template>

<script>
import { reactive } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import DataTableComponent from '@/components/DataTableComponent.vue'
import ConfirmPopup from '@/components/ConfirmPopup.vue'
import ToastComponent from '@/components/ToastComponent.vue'

const AGENT_URL = 'https://apis.madautomate.cloud/webhook/bigquery-agent'
const CHART_PALETTE = ['#3939ff', '#764ba2', '#198754', '#0dcaf0', '#ffc107', '#dc3545', '#6f42c1', '#20c997']

export default {
  name: 'DataAgentView',
  components: { DataTableComponent, ConfirmPopup, ToastComponent },
  data() {
    return {
      question: '',
      loading: false,
      sending: false,
      syncing: false,
      turns: [],
      favorites: [],
      chartInstances: {},
      chartCanvases: {},
      token: '',
      // Toast
      toastTitle: '',
      toastMessage: '',
      isSuccess: true,
      showToastFlag: false,
      query_limit: 0, 
      queries_used: 0,
      agent_name: ""
    }
  },
  mounted() {
    this.loadToken()
    this.loadAgent()
    this.loadFavorites()
  },
  beforeUnmount() {
    Object.values(this.chartInstances).forEach(chart => chart.destroy())
  },
  methods: {
    /**
     * Muestra un toast. ToastComponent se encarga de inicializar
     * la instancia de Bootstrap Toast y reaccionar a show=true.
     */
    triggerToast(title, message, success = true) {
      this.toastTitle = title
      this.toastMessage = message
      this.isSuccess = success

      this.$nextTick(() => {
        if (
          this.$refs.toastComponent &&
          typeof this.$refs.toastComponent.showToas === 'function'
        ) {
          this.$refs.toastComponent.showToas()
        }
      })
    },

    loadToken() {
      this.token = sessionStorage.getItem('token') || ''
    },

    // Convierte el texto de respuesta del agente (con sintaxis markdown simple:
    // #/##/### para títulos, *texto* para negrita, "1. " para listas) a HTML.
    // Se escapa el texto original antes de transformarlo para evitar inyectar
    // HTML arbitrario que venga en la respuesta.
    formatAnswer(text) {
      if (!text) return ''

      const escapeHtml = (str) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      const applyInline = (str) => escapeHtml(str)
        .replace(/\*(.+?)\*/g, '<strong>$1</strong>') 

      const lines = text.split('\n')
      const html = []
      let listBuffer = []

      const flushList = () => {
        if (listBuffer.length) {
          html.push(`<ol class="agent-answer-list">${listBuffer.join('')}</ol>`) 
          listBuffer = []
        }
      }

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) {
          flushList()
          continue
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.*)/)
        if (headingMatch) {
          flushList()
          const level = headingMatch[1].length
          const tag = `h${level + 3}` // # -> h4, ## -> h5, ### -> h6
          html.push(`<${tag} class="agent-answer-heading agent-answer-heading-${level}">${applyInline(headingMatch[2])}</${tag}>`)
          continue
        }

        const listMatch = line.match(/^\d+[.)]\s+(.*)/)
        if (listMatch) {
          listBuffer.push(`<li>${applyInline(listMatch[1])}</li>`)
          continue
        }

        flushList()
        html.push(`<p class="agent-answer-paragraph">${applyInline(line)}</p>`)
      }
      flushList()

      return html.join('')
    },

    formatTime(ts) {
      return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    },

    autoResize(event) {
      const el = event.target
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`
    },

    scrollToBottom() {
      this.$nextTick(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
      })
    },

    isFavorite(question) {
      return this.favorites.includes(question)
    },

    // Marca/desmarca una pregunta como favorita. Al marcarla queda guardada
    // en localStorage (persiste siempre, incluso si recargás la página) y
    // aparece como chip clickeable en la barra de favoritos.
    toggleFavorite(question) {
      const index = this.favorites.indexOf(question)
      if (index > -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.push(question)
      }
      this.saveFavorites()
    },

    removeFavorite(index) {
      this.favorites.splice(index, 1)
      this.saveFavorites()
    },

    saveFavorites() {
      localStorage.setItem('agent_favorites', JSON.stringify(this.favorites))
    },

    loadFavorites() {
      const saved = localStorage.getItem('agent_favorites')
      if (saved) {
        this.favorites = JSON.parse(saved)
      }
    },

    async loadAgent() {
      this.loading = true
      try {
        const response = await axios.post(
          'https://apis.madautomate.cloud/webhook/sync-bigquery-leads',
          {action: "get_agents"},
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        const data = response.data;
        this.agent_name = data[0].name;
        this.query_limit=data[0].query_limit;
        this.queries_used=data[0].queries_used;

      } catch (error) {
        console.error('Error sincronizando datos:', error)
        this.triggerToast('Error', 'Error al sincronizar datos', false)
      } finally {
        this.loading = false
      }

    },

    async syncData() {
      this.syncing = true
      try {
        const response = await axios.post(
          'https://apis.madautomate.cloud/webhook/sync-bigquery-leads',
          {action: "sync_data"},
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        const data = response.data;
        this.triggerToast(
          'Realizado!',
          `Se han actualizado ${data.rows_updated} ${
            data.rows_updated == 1 ? 'registro' : 'registros'
          }`,
          true
        )
                

      } catch (error) {
        console.error('Error sincronizando datos:', error)
        this.triggerToast('Error', 'Error al sincronizar datos', false)
      } finally {
        this.syncing = false
      }
    },

    askQuestion(text) {
      this.question = text
      this.handleSend()
    },

    async handleSend() {
      const questionText = this.question.trim()
      if (!questionText || this.sending) return

      this.sending = true
      this.question = ''
      this.$nextTick(() => {
        if (this.$refs.inputRef) this.$refs.inputRef.style.height = 'auto'
      })

      // reactive() asegura que las mutaciones posteriores (status, result, error) disparen el re-render
      const turn = reactive({
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        question: questionText,
        timestamp: Date.now(),
        status: 'loading',
        showSql: false,
        error: '',
        result: null
      })
      this.turns.push(turn)
      this.scrollToBottom()

      try {
        const { data } = await axios.post(
          AGENT_URL,
          { question: questionText },
          { headers: { Authorization: `Bearer ${this.token}` }, timeout: 60000 }
        )
        turn.result = this.parseAgentResponse(data)
        turn.status = 'done'
        await this.$nextTick()
        this.renderChartForTurn(turn)
        this.query_limit=data[0].query_limit;
        this.queries_used=data[0].queries_used;

      } catch (error) {
        console.error('Error al consultar al agente:', error)
        turn.status = 'error'
        turn.error = this.$t('agent_view.error')
      } finally {
        this.sending = false
        this.scrollToBottom()
      }
    },

    // Interpreta el arreglo de eventos que devuelve el agente (texto, SQL, tabla y gráfico)
    parseAgentResponse(payload) {
      const result = { text: '', sql: '', table: null, chart: null, followups: [] }
      let events = payload

      if (!Array.isArray(events)) {
        if (typeof events === 'string') {
          result.text = events
          return result
        }
        if (events && Array.isArray(events.data)) {
          events = events.data
        } else if (events && typeof events === 'object') {
          result.text = events.response || events.answer || events.message || this.$t('agent_view.no_response')
          return result
        } else {
          result.text = String(events ?? '')
          return result
        }
      }

      for (const event of events) {
        const sm = event?.systemMessage
        if (!sm) continue

        if (sm.text?.textType === 'FINAL_RESPONSE') {
          result.text = (sm.text.parts || []).join('\n')
        } else if (sm.text?.textType === 'FOLLOWUP_QUESTIONS') {
          result.followups = sm.text.parts || []
        }

        if (sm.data?.generatedSql && !result.sql) {
          result.sql = sm.data.generatedSql
        }

        if (sm.data?.result?.data && !result.table) {
          const rows = sm.data.result.data
          const fields = sm.data.result.schema?.fields || Object.keys(rows[0] || {}).map(name => ({ name }))
          result.table = {
            columns: fields.map(field => ({ label: field.name, key: field.name })),
            rows
          }
        }

        if (sm.chart?.result?.vegaConfig && !result.chart) {
          result.chart = sm.chart.result.vegaConfig
        }
      }

      if (!result.text) {
        result.text = this.$t('agent_view.no_response')
      }

      return result
    },

    setChartCanvas(el, turnId) {
      if (el) this.chartCanvases[turnId] = el
    },

    renderChartForTurn(turn) {
      const canvas = this.chartCanvases[turn.id]
      if (!turn.result?.chart || !canvas) return

      if (this.chartInstances[turn.id]) {
        this.chartInstances[turn.id].destroy()
      }

      const config = this.buildChartJsConfig(turn.result.chart)
      this.chartInstances[turn.id] = new Chart(canvas.getContext('2d'), config)
    },

    // Traduce la config de Vega-Lite que devuelve el agente a una config de Chart.js
    buildChartJsConfig(vegaConfig) {
      const values = vegaConfig?.data?.values || []
      const encoding = vegaConfig?.encoding || {}
      const mark = typeof vegaConfig?.mark === 'string' ? vegaConfig.mark : vegaConfig?.mark?.type

      const quantEntry = Object.entries(encoding).find(([, e]) => e?.type === 'quantitative')
      const nominalEntry = Object.entries(encoding).find(([, e]) => e?.type === 'nominal')
      const quantField = quantEntry?.[1]?.field
      const nominalField = nominalEntry?.[1]?.field

      const labels = values.map(row => (nominalField ? row[nominalField] : ''))
      const dataValues = values.map(row => (quantField ? Number(row[quantField]) || 0 : 0))
      const title = vegaConfig?.title || ''

      if (mark === 'arc') {
        return {
          type: 'doughnut',
          data: { labels, datasets: [{ data: dataValues, backgroundColor: CHART_PALETTE }] },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' }, title: { display: !!title, text: title } }
          }
        }
      }

      if (mark === 'line') {
        return {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: quantEntry?.[1]?.title || quantField,
              data: dataValues,
              borderColor: '#3939ff',
              backgroundColor: 'rgba(57, 57, 255, 0.1)',
              tension: 0.35,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, title: { display: !!title, text: title } },
            scales: { y: { beginAtZero: true } }
          }
        }
      }

      // Barra (por defecto). Si el valor cuantitativo está en el eje X, se muestra horizontal.
      const horizontal = quantEntry?.[0] === 'x'
      return {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: quantEntry?.[1]?.title || quantField,
            data: dataValues,
            backgroundColor: '#3939ff',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: horizontal ? 'y' : 'x',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: !!title, text: title } },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      }
    },

    confirmClear() {
      if (!this.turns.length) return
      this.$refs.confirmPopup.showConfirmPopup()
    },

    handleClearConfirm(isConfirmed) {
      if (!isConfirmed) return
      Object.values(this.chartInstances).forEach(chart => chart.destroy())
      this.chartInstances = {}
      this.chartCanvases = {}
      this.turns = []
    },

    // Divide el texto de la respuesta (mismo markdown simple que formatAnswer)
    // en bloques estructurados para poder dibujarlos en el PDF.
    parseAnswerBlocks(text) {
      const blocks = []
      let listBuffer = []
      const flushList = () => {
        if (listBuffer.length) {
          blocks.push({ type: 'list', items: listBuffer })
          listBuffer = []
        }
      }

      ;(text || '').split('\n').forEach(rawLine => {
        const line = rawLine.trim()
        if (!line) {
          flushList()
          return
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.*)/)
        if (headingMatch) {
          flushList()
          blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
          return
        }

        const listMatch = line.match(/^\d+[.)]\s+(.*)/)
        if (listMatch) {
          listBuffer.push(listMatch[1])
          return
        }

        flushList()
        blocks.push({ type: 'paragraph', text: line })
      })
      flushList()

      return blocks
    },

    // Separa un string con *negrita* en segmentos { text, bold }
    splitInlineSegments(str) {
      const segments = []
      const regex = /\*(.+?)\*/g
      let lastIndex = 0
      let match
      while ((match = regex.exec(str))) {
        if (match.index > lastIndex) segments.push({ text: str.slice(lastIndex, match.index), bold: false })
        segments.push({ text: match[1], bold: true })
        lastIndex = regex.lastIndex
      }
      if (lastIndex < str.length) segments.push({ text: str.slice(lastIndex), bold: false })
      return segments
    },

    // Dibuja segmentos con partes normales/negrita haciendo wrap palabra por palabra
    // (jsPDF no soporta mezclar estilos dentro de una misma línea de texto).
    writeRichSegments(doc, segments, x, y, maxWidth, lineHeight, pageHeight, fontSize) {
      const words = []
      segments.forEach(seg => {
        seg.text.split(/(\s+)/).forEach(part => {
          if (part) words.push({ text: part, bold: seg.bold })
        })
      })

      let cursorX = x
      let cursorY = y
      doc.setFontSize(fontSize)

      words.forEach(word => {
        const isSpace = /^\s+$/.test(word.text)
        doc.setFont(undefined, word.bold ? 'bold' : 'normal')
        const wWidth = doc.getTextWidth(word.text)

        if (!isSpace && cursorX + wWidth > x + maxWidth) {
          cursorX = x
          cursorY += lineHeight
          if (cursorY > pageHeight - 20) {
            doc.addPage()
            cursorY = 15
          }
        }

        if (!(isSpace && cursorX === x)) {
          doc.text(word.text, cursorX, cursorY)
          cursorX += wWidth
        }
      })

      return cursorY + lineHeight
    },

    // Dibuja los bloques de la respuesta (títulos, párrafos, lista numerada) en el PDF
    renderAnswerBlocks(doc, text, x, y, maxWidth, pageHeight) {
      const blocks = this.parseAnswerBlocks(text)
      let cursorY = y

      blocks.forEach(block => {
        if (cursorY > pageHeight - 25) {
          doc.addPage()
          cursorY = 15
        }

        if (block.type === 'heading') {
          const fontSize = { 1: 13, 2: 12, 3: 11.5 }[block.level] || 12
          doc.setTextColor(28, 29, 33)
          cursorY = this.writeRichSegments(
            doc, this.splitInlineSegments(block.text), x, cursorY, maxWidth, 6, pageHeight, fontSize
          )
          cursorY += 1
        } else if (block.type === 'paragraph') {
          doc.setTextColor(60, 60, 60)
          cursorY = this.writeRichSegments(
            doc, this.splitInlineSegments(block.text), x, cursorY, maxWidth, 5.5, pageHeight, 10.5
          )
          cursorY += 2
        } else if (block.type === 'list') {
          doc.setTextColor(60, 60, 60)
          block.items.forEach((item, i) => {
            const prefix = `${i + 1}. `
            doc.setFont(undefined, 'normal')
            doc.setFontSize(10.5)
            doc.text(prefix, x, cursorY)
            const prefixWidth = doc.getTextWidth(prefix)
            cursorY = this.writeRichSegments(
              doc, this.splitInlineSegments(item), x + prefixWidth, cursorY,
              maxWidth - prefixWidth, 5.5, pageHeight, 10.5
            )
            cursorY += 1.5
          })
          cursorY += 1.5
        }
      })

      return cursorY
    },

    exportTurnToPdf(turn) {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let y = 15

      doc.setFontSize(16)
      doc.setTextColor(57, 57, 255)
      doc.setFont(undefined, 'bold')
      doc.text(this.$t('agent_view.title'), 15, y)
      y += 6

      doc.setDrawColor(222, 226, 230)
      doc.line(15, y, pageWidth - 15, y)
      y += 8

      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      doc.setFont(undefined, 'bold')
      doc.text('Pregunta:', 15, y)
      y += 6
      doc.setFont(undefined, 'normal')
      const questionLines = doc.splitTextToSize(turn.question, pageWidth - 30)
      doc.text(questionLines, 15, y)
      y += questionLines.length * 5 + 8

      doc.setFont(undefined, 'bold')
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      doc.text('Respuesta:', 15, y)
      y += 6
      y = this.renderAnswerBlocks(doc, turn.result?.text || '', 15, y, pageWidth - 30, pageHeight)
      y += 4

      const chartInstance = this.chartInstances[turn.id]
      if (chartInstance) {
        try {
          const imgWidth = pageWidth - 30
          const imgHeight = 80
          if (y + imgHeight > pageHeight - 20) {
            doc.addPage()
            y = 15
          }
          doc.addImage(chartInstance.toBase64Image(), 'PNG', 15, y, imgWidth, imgHeight)
          y += imgHeight + 10
        } catch (error) {
          console.error('No se pudo incluir el gráfico en el PDF:', error)
        }
      }

      if (turn.result?.table?.rows?.length) {
        if (y > pageHeight - 40) {
          doc.addPage()
          y = 15
        }
        autoTable(doc, {
          startY: y,
          head: [turn.result.table.columns.map(col => col.label)],
          body: turn.result.table.rows.map(row => turn.result.table.columns.map(col => row[col.key] ?? '')),
          theme: 'striped',
          headStyles: { fillColor: [57, 57, 255], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 15, right: 15 }
        })
      }

      doc.save(`respuesta-agente-${turn.id}.pdf`)
    }
  }
}
</script>

<style scoped>
/* ============================================================
   TOKENS
   Paleta reducida a lo esencial: un acento (el azul de marca),
   una escala de grises para texto/bordes, y una sola escala de
   radios y espaciados. Todo el resto del archivo se apoya en
   estas variables para que cambiar el look sea cuestión de tocar
   un solo lugar.
============================================================ */
.agent-page {
  --agent-accent: #3939ff;
  --agent-accent-hover: #2d2de0;
  --agent-accent-soft: #eef0ff;
  --agent-ink: #16171b;
  --agent-ink-muted: #75767f;
  --agent-ink-faint: #a8a9b3;
  --agent-border: #e6e6ec;
  --agent-surface: #ffffff;
  --agent-surface-sunken: #fafafc;
  --agent-danger: #dc3545;
  --agent-warning: #ffc107;

  --agent-radius-sm: 8px;
  --agent-radius-md: 12px;
  --agent-radius-lg: 16px;

  --agent-space-1: 0.375rem;
  --agent-space-2: 0.625rem;
  --agent-space-3: 1rem;
  --agent-space-4: 1.5rem;

  color: var(--agent-ink);
  padding-bottom: 1.5rem;
}

/* Contenedor centrado: da a header, conversación y barra de entrada
   exactamente el mismo ancho. Esto es lo que resuelve el desalineado
   original (la barra de entrada tenía su propio ancho fijo con float). */
.agent-shell {
  /* max-width: 880px;
  margin: 0 auto; */
  width: 100%;
}

/* ---------- header ---------- */
.header-section {
  padding-top: 0.5rem;
}

.header-title-group {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--agent-space-3);
}

.header-title-group h2 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: var(--agent-ink);
}

.header-title-group h2 i {
  color: var(--agent-accent);
}

.agent-subtitle {
  color: var(--agent-ink-muted);
  font-size: 0.9rem;
}

.header-divider {
  border: none;
  border-top: 1px solid var(--agent-border);
  margin: var(--agent-space-3) 0 var(--agent-space-4);
}

.btn-sync-data {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--agent-border);
  color: var(--agent-ink-muted);
  border-radius: var(--agent-radius-sm);
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.btn-sync-data:hover:not(:disabled) {
  color: white;
  border-color: var(--agent-accent);
  background: var(--agent-accent-soft);
}

.btn-sync-data:disabled {
  opacity: 0.6;
}

.btn-sync-data .spin {
  animation: agent-spin 0.9s linear infinite;
}

@keyframes agent-spin {
  to { transform: rotate(360deg); }
}

/* ---------- layout principal: conversación + barra de entrada,
   apiladas en una sola columna, mismo ancho siempre ---------- */
.agent-main-layout {
  display: flex;
  flex-direction: column;
  gap: var(--agent-space-4);
}

.agent-conversation {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  gap: var(--agent-space-4);
}

/* ---------- estado vacío ---------- */
.agent-empty-state {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--agent-ink-muted);
}

.agent-empty-state i {
  font-size: 1.75rem;
  color: var(--agent-accent-soft);
  filter: saturate(1.4);
  color: #c4c5ff;
}

.agent-empty-title {
  font-weight: 600;
  color: var(--agent-ink);
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.agent-empty-text {
  max-width: 380px;
  margin: 0 auto;
  font-size: 0.9rem;
}

/* ---------- turno de conversación ---------- */
.agent-turn {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.agent-bubble-user {
  align-self: flex-end;
  max-width: 80%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.agent-bubble-user .agent-bubble-content {
  background: var(--agent-accent);
  color: #fff;
  border-radius: var(--agent-radius-md) var(--agent-radius-md) 2px var(--agent-radius-md);
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.agent-bubble-text {
  flex: 1;
  min-width: 0;
  font-size: 0.92rem;
  line-height: 1.45;
}

.agent-fav-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  padding: 0;
  line-height: 1;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
}

.agent-fav-btn:hover {
  color: rgba(255, 255, 255, 0.85);
  transform: scale(1.1);
}

/* Favorita guardada: la estrella queda siempre dorada para que sea
   evidente de un vistazo, sin depender del hover. */
.agent-fav-btn.active {
  color: var(--agent-warning);
}

.agent-fav-btn.active:hover {
  color: #ffca2c;
}

.agent-bubble-time {
  font-size: 0.72rem;
  color: var(--agent-ink-faint);
  margin-top: 0.3rem;
}

.agent-bubble-bot {
  align-self: stretch;
  display: flex;
  gap: 0.65rem;
  width: 100%;
}

.agent-bubble-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--agent-accent-soft);
  color: var(--agent-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  margin-top: 0.1rem;
}

.agent-bubble-body {
  background: var(--agent-surface);
  border: 1px solid var(--agent-border);
  border-radius: 2px var(--agent-radius-lg) var(--agent-radius-lg) var(--agent-radius-lg);
  padding: 1.1rem 1.25rem;
  flex: 1;
  min-width: 0;
}

.agent-error {
  color: var(--agent-danger);
  margin: 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* ---------- respuesta ---------- */
.agent-answer-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.agent-answer-text {
  flex: 1;
  min-width: 0;
  color: var(--agent-ink);
  font-size: 0.94rem;
}

.agent-answer-text > *:first-child {
  margin-top: 0;
}
.agent-answer-text > *:last-child {
  margin-bottom: 0;
}

.agent-answer-heading {
  margin: 0 0 0.5rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--agent-ink);
}
.agent-answer-heading-1 { font-size: 1.05rem; }
.agent-answer-heading-2 { font-size: 0.98rem; }
.agent-answer-heading-3 { font-size: 0.92rem; }

.agent-answer-paragraph {
  margin: 0 0 0.75rem;
  line-height: 1.6;
}

.agent-answer-list {
  list-style: none;
  counter-reset: agent-list;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  padding: 0;
}

.agent-answer-list li {
  position: relative;
  padding-left: 1.5rem;
  line-height: 1.6;
  counter-increment: agent-list;
}

.agent-answer-list li::before {
  content: counter(agent-list) '.';
  position: absolute;
  left: 0;
  color: var(--agent-accent);
  font-weight: 600;
}

.agent-answer-text strong {
  font-weight: 600;
}

.agent-export-btn {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--agent-radius-sm);
  border: 1px solid var(--agent-border);
  background: transparent;
  color: var(--agent-ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.agent-export-btn:hover {
  color: var(--agent-accent);
  border-color: var(--agent-accent);
  background: var(--agent-accent-soft);
}

/* Cada bloque adicional (gráfico, tabla, sugeridas) queda separado por
   una línea fina en vez de tarjetas anidadas con su propio borde/sombra. */
.agent-section {
  margin-top: 1.1rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--agent-border);
}

.agent-chart-wrapper {
  height: 280px;
  position: relative;
}

.agent-table-wrapper {
  margin-top: 1.1rem;
}
.datatable-wrapper {
  padding-left: 0;
  padding-right: 0;
}

/* ---------- consultas sugeridas ---------- */
.agent-followups-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.agent-followups-label {
  font-size: 0.78rem;
  color: var(--agent-ink-muted);
}

.agent-followups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.agent-followup-chip {
  background: transparent;
  color: var(--agent-accent);
  border: 1px solid var(--agent-border);
  border-radius: var(--agent-radius-sm);
  padding: 0.4rem 0.75rem;
  font-size: 0.82rem;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.agent-followup-chip:hover {
  border-color: var(--agent-accent);
  background: var(--agent-accent-soft);
}

/* ============================================================
   BARRA DE ENTRADA
   Antes tenía "float: right; width: 96.5%", lo que la desalineaba
   respecto del resto del contenido. Ahora es un bloque más dentro
   de la misma columna (.agent-main-layout), con el mismo ancho que
   la conversación de arriba.
============================================================ */
.agent-input-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  /* gap: var(--agent-space-2); */
  /* background: var(--agent-surface); */
  padding-top: var(--agent-space-2);
}

.agent-favorites-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.agent-favorites-icon {
  flex-shrink: 0;
  color: var(--agent-warning);
  font-size: 0.8rem;
}

.favorites-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.favorite-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  background: var(--agent-surface-sunken);
  border: 1px solid var(--agent-border);
  border-radius: 999px;
  padding: 0.3rem 0.4rem 0.3rem 0.75rem;
}

.favorite-chip-btn {
  max-width: 220px;
  background: transparent;
  color: var(--agent-ink);
  border: none;
  padding: 0;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-chip-btn:hover {
  color: var(--agent-accent);
}

.fav-remove-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--agent-ink-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: color 0.15s ease, background 0.15s ease;
}

.fav-remove-btn:hover {
  color: var(--agent-danger);
  background: rgba(220, 53, 69, 0.08);
}

.agent-input-form {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  background: var(--agent-surface);
  border: 1px solid var(--agent-border);
  border-radius: 0px 0px 16px 16px;
  padding: 0.5rem 0.5rem 0.5rem 0.6rem;
  box-shadow: 0 2px 10px rgba(22, 23, 27, 0.06);
}

.agent-input-form:focus-within {
  border-color: var(--agent-accent);
}

.agent-clear-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid transparent;
  color: var(--agent-ink-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.agent-clear-btn:hover:not(:disabled) {
  color: var(--agent-danger);
  border-color: var(--agent-border);
  background: rgba(220, 53, 69, 0.06);
}

.agent-clear-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.agent-input-textarea {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  resize: none;
  max-height: 140px;
  padding: 0.5rem 0.25rem;
  background: transparent;
  font-size: 0.92rem;
  color: var(--agent-ink);
  font-family: inherit;
}

.agent-input-textarea::placeholder {
  color: var(--agent-ink-faint);
}

.agent-send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--agent-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  font-size: 0.9rem;
  transition: background 0.15s ease, transform 0.1s ease;
}

.agent-send-btn:hover:not(:disabled) {
  background: var(--agent-accent-hover);
}

.agent-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ---------- estado de carga (turnos) ---------- */
.agent-loading {
  display: flex;
  gap: 6px;
  padding: 0.25rem 0;
}

.agent-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--agent-accent);
  opacity: 0.35;
  animation: agent-dot-bounce 1.2s infinite ease-in-out;
}

.bar-favorites {
  border-radius: 16px 16px 0px 0px;
  background: white;
  border: 1px solid var(--agent-border);
  border-bottom: none;
  padding: 1rem;
  transition: 0.35 all
}

.agent-dot:nth-child(2) { animation-delay: 0.15s; }
.agent-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes agent-dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
  40% { transform: scale(1); opacity: 1; }
}

@media (max-width: 769px) {
  .agent-bubble-user,
  .agent-bubble-bot {
    max-width: 100%;
  }

  .agent-shell {
    max-width: 100%;
  }
}
</style>