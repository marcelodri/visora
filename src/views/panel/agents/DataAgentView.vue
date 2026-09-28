<template>
  <div class="agent-page">
    <div class="agent-shell">

      <div class="header-section">
        <div class="header-title-group align-items-center">
          <div>
            <h2>
              <i class="bi bi-robot me-2"></i>
              {{ formattedAgentName }}
            </h2>
            <p class="agent-subtitle mb-0">{{ $t('agent_view.subtitle') }}</p>
          </div>
        </div>
      </div>

      <hr class="header-divider" />

      <div class="agent-main-layout">
        <div class="agent-conversation" :class="{ show: favorites.length > 0 }">
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
          <div class="bar-favorites" :class="{ show: favorites.length > 0 }">
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

    <!-- Acceso fijo a la configuración del agente -->
    <button
      type="button"
      class="agent-controls-trigger"
      :class="{ active: agentControlsOpen }"
      :aria-expanded="agentControlsOpen ? 'true' : 'false'"
      aria-controls="agent-controls-panel"
      title="Abrir configuración del agente"
      @click="toggleAgentControls"
    >
      <span class="agent-controls-trigger-icon">
        <i class="bi bi-sliders2"></i>
      </span>
      <span class="agent-controls-trigger-copy">
        <strong>Agente</strong>
        <small>{{ Number(query_limit) <= 0 ? 'Ver configuración' : (isQueryLimitReached ? 'Límite alcanzado' : `${remainingQueries} consultas disponibles`) }}</small>
      </span>
      <span
        v-if="Number(query_limit) > 0"
        class="agent-controls-trigger-badge"
        :class="quotaStatusClass"
      >
        {{ remainingQueries }}
      </span>
    </button>

    <Transition name="agent-backdrop">
      <div
        v-if="agentControlsOpen"
        class="agent-controls-backdrop"
        aria-hidden="true"
        @click="closeAgentControls"
      ></div>
    </Transition>

    <Transition name="agent-drawer">
      <aside
        v-if="agentControlsOpen"
        id="agent-controls-panel"
        class="agent-controls"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-controls-title"
      >
        <header class="agent-controls-header">
          <div class="agent-controls-identity">
            <span class="agent-controls-avatar">{{ agentInitials }}</span>
            <div>
              <div class="agent-controls-eyebrow">
                <span class="agent-live-dot"></span>
                Agente activo
              </div>
              <h3 id="agent-controls-title">Configuración del agente</h3>
              <p>{{ formattedAgentName }}</p>
            </div>
          </div>
          <button
            ref="agentControlsClose"
            type="button"
            class="agent-controls-close"
            aria-label="Cerrar configuración del agente"
            @click="closeAgentControls"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </header>

        <div class="agent-controls-body">
          <section class="agent-panel-card agent-usage-card" :class="quotaStatusClass">
            <div class="agent-panel-card-heading">
              <div>
                <span class="agent-panel-kicker">Consumo</span>
                <h4>Consultas disponibles</h4>
              </div>
              <button
                type="button"
                class="agent-icon-button"
                :disabled="loading"
                title="Actualizar consumo"
                @click="loadAgent()"
              >
                <i class="bi bi-arrow-clockwise" :class="{ spin: loading }"></i>
              </button>
            </div>

            <div class="agent-usage-summary">
              <div
                class="agent-usage-ring"
                :style="{ '--usage-progress': `${queryUsagePercent}%` }"
                role="progressbar"
                :aria-valuenow="queryUsagePercent"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div class="agent-usage-ring-inner">
                  <strong>{{ Number(query_limit) > 0 ? remainingQueries : '—' }}</strong>
                  <span>restantes</span>
                </div>
              </div>

              <div class="agent-usage-details">
                <div>
                  <span>Utilizadas</span>
                  <strong>{{ Number(queries_used) || 0 }}</strong>
                </div>
                <div>
                  <span>Límite total</span>
                  <strong>{{ Number(query_limit) || '—' }}</strong>
                </div>
                <div>
                  <span>Consumo</span>
                  <strong>{{ queryUsagePercent }}%</strong>
                </div>
              </div>
            </div>

            <div class="agent-progress-track" aria-hidden="true">
              <span :style="{ width: `${queryUsagePercent}%` }"></span>
            </div>

            <p
              v-if="showQueryWarnings && isQueryUsageWarning"
              class="agent-usage-warning"
            >
              <i class="bi bi-exclamation-triangle"></i>
              {{ isQueryLimitReached
                ? 'Alcanzaste el límite de consultas disponible.'
                : `Te quedan ${remainingQueries} consultas. Considerá administrar el uso del agente.`
              }}
            </p>
          </section>

          <section class="agent-panel-card">
            <div class="agent-panel-card-heading">
              <div>
                <span class="agent-panel-kicker">Preferencias</span>
                <h4>Personalización</h4>
              </div>
              <i class="bi bi-gear agent-section-icon"></i>
            </div>

            <label class="agent-field-label" for="agent-alias">Nombre visible</label>
            <div class="agent-text-field">
              <i class="bi bi-robot"></i>
              <input
                id="agent-alias"
                v-model.trim="agentAlias"
                type="text"
                maxlength="50"
                :placeholder="agent_name || 'Agente de datos'"
                @change="saveAgentPanelSettings"
              />
            </div>
            <p class="agent-field-help">Este nombre se guarda sólo en este navegador.</p>

            <label class="agent-switch-row">
              <span>
                <strong>Cerrar al elegir una conversación</strong>
                <small>Oculta el panel al abrir un elemento del historial.</small>
              </span>
              <input
                v-model="autoCloseAgentPanel"
                type="checkbox"
                @change="saveAgentPanelSettings"
              />
              <span class="agent-switch" aria-hidden="true"></span>
            </label>

            <label class="agent-switch-row">
              <span>
                <strong>Alertas de consumo</strong>
                <small>Muestra avisos cuando quedan pocas consultas.</small>
              </span>
              <input
                v-model="showQueryWarnings"
                type="checkbox"
                @change="saveAgentPanelSettings"
              />
              <span class="agent-switch" aria-hidden="true"></span>
            </label>
          </section>

          <section class="agent-panel-card agent-sync-card">
            <div class="agent-panel-card-heading">
              <div>
                <span class="agent-panel-kicker">Datos</span>
                <h4>Sincronización</h4>
              </div>
              <span class="agent-sync-status" :class="{ syncing }">
                <span></span>
                {{ syncing ? 'Sincronizando' : 'Disponible' }}
              </span>
            </div>
            <p>Actualizá la información que utiliza el agente para responder tus consultas.</p>
            <button
              type="button"
              class="agent-primary-action"
              :disabled="syncing"
              @click="syncData"
            >
              <i class="bi bi-arrow-repeat" :class="{ spin: syncing }"></i>
              {{ syncing ? 'Sincronizando datos…' : 'Sincronizar datos ahora' }}
            </button>
            <small class="agent-last-sync">
              <i class="bi bi-clock-history"></i>
              {{ lastSyncAt ? `Última sincronización: ${formatDateTime(lastSyncAt)}` : 'Todavía no se registró una sincronización.' }}
            </small>
          </section>

          <section class="agent-panel-card agent-history-panel">
            <div class="agent-panel-card-heading agent-history-heading">
              <div>
                <span class="agent-panel-kicker">Actividad</span>
                <h4>Historial</h4>
              </div>
              <button type="button" class="agent-new-chat" @click="startNewConversation">
                <i class="bi bi-plus-lg"></i>
                Nueva
              </button>
            </div>

            <div class="agent-history-search">
              <i class="bi bi-search"></i>
              <input
                v-model.trim="historySearch"
                type="search"
                placeholder="Buscar en conversaciones"
                aria-label="Buscar en conversaciones anteriores"
              />
              <button
                v-if="historySearch"
                type="button"
                aria-label="Limpiar búsqueda"
                @click="historySearch = ''"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>

            <div v-if="!filteredConversations.length" class="agent-history-empty">
              <i class="bi bi-chat-square-text"></i>
              <strong>{{ historySearch ? 'No encontramos coincidencias' : 'Sin conversaciones guardadas' }}</strong>
              <span>{{ historySearch ? 'Probá con otra búsqueda.' : 'Tus próximas consultas aparecerán acá.' }}</span>
            </div>

            <div v-else class="agent-history-list">
              <button
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                type="button"
                class="agent-history-item"
                :class="{ active: conversation.id === currentConversationId }"
                @click="openConversation(conversation.id)"
              >
                <span class="agent-history-icon">
                  <i class="bi bi-chat-left-text"></i>
                </span>
                <span class="agent-history-item-main">
                  <strong>{{ conversationTitle(conversation) }}</strong>
                  <small>{{ formatDateTime(conversation.updatedAt || conversation.createdAt) }}</small>
                </span>
                <span class="agent-history-count">{{ conversation.turns?.length || 0 }}</span>
                <i class="bi bi-chevron-right agent-history-arrow"></i>
              </button>
            </div>
          </section>
        </div>

        <footer class="agent-controls-footer">
          <i class="bi bi-shield-check"></i>
          <span>Las preferencias del panel se guardan localmente.</span>
        </footer>
      </aside>
    </Transition>

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
    <!-- <LoadingDots :isLoading="syncing" /> -->
  </div>
</template>

<script>
import { reactive, markRaw } from 'vue'
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
      sending: false,
      syncing: false,
      loading: false,
      turns: [],
      favorites: [],
      conversationHistory: [],
      currentConversationId: '',
      // showHistory: false,
      conversationStorageKey: 'agent_conversation_history',
      currentConversationStorageKey: 'agent_current_conversation_id',
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
      agent_name: '',
      agentControlsOpen: false,
      historySearch: '',
      agentAlias: '',
      autoCloseAgentPanel: true,
      showQueryWarnings: true,
      agentPanelSettingsKey: 'agent_panel_settings',
      lastSyncStorageKey: 'agent_last_sync_at',
      lastSyncAt: null,
      previousBodyOverflow: ''
    }
  },
  mounted() {
    this.loadToken()
    this.loadAgentPanelSettings()
    this.lastSyncAt = Number(localStorage.getItem(this.lastSyncStorageKey)) || null
    this.loadAgent()
    this.loadFavorites()
    this.loadConversationHistory()
    window.addEventListener('keydown', this.handleAgentControlsKeydown)
  },
  beforeUnmount() {
    Object.values(this.chartInstances).forEach(chart => chart.destroy())
    window.removeEventListener('keydown', this.handleAgentControlsKeydown)
    if (this.agentControlsOpen) {
      document.body.style.overflow = this.previousBodyOverflow
    }
  },
  computed: {
    formattedAgentName() {
      const rawName = this.agentAlias || this.agent_name || 'Agente de datos'
      return String(rawName)
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },

    agentInitials() {
      const words = this.formattedAgentName.split(/\s+/).filter(Boolean)
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() || 'AI'
    },

    remainingQueries() {
      const limit = Math.max(0, Number(this.query_limit) || 0)
      const used = Math.max(0, Number(this.queries_used) || 0)
      return Math.max(0, limit - used)
    },

    queryUsagePercent() {
      const limit = Number(this.query_limit) || 0
      const used = Number(this.queries_used) || 0
      if (limit <= 0) return 0
      return Math.min(100, Math.max(0, Math.round((used / limit) * 100)))
    },

    isQueryLimitReached() {
      return Number(this.query_limit) > 0 && this.remainingQueries <= 0
    },

    isQueryUsageWarning() {
      const limit = Number(this.query_limit) || 0
      if (limit <= 0) return false
      return this.remainingQueries <= Math.max(3, Math.ceil(limit * 0.2))
    },

    quotaStatusClass() {
      if (this.isQueryLimitReached) return 'quota-danger'
      if (this.isQueryUsageWarning) return 'quota-warning'
      return 'quota-ok'
    },

    sortedConversations() {
      return [...this.conversationHistory].sort((a, b) =>
        (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      )
    },

    filteredConversations() {
      const search = this.historySearch.trim().toLocaleLowerCase('es')
      if (!search) return this.sortedConversations

      return this.sortedConversations.filter(conversation => {
        const title = this.conversationTitle(conversation).toLocaleLowerCase('es')
        const questions = (conversation.turns || [])
          .map(turn => turn.question || '')
          .join(' ')
          .toLocaleLowerCase('es')
        return title.includes(search) || questions.includes(search)
      })
    }
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

    loadAgentPanelSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.agentPanelSettingsKey) || '{}')
        this.agentAlias = typeof saved.agentAlias === 'string' ? saved.agentAlias : ''
        this.autoCloseAgentPanel = saved.autoCloseAgentPanel !== false
        this.showQueryWarnings = saved.showQueryWarnings !== false
      } catch (error) {
        console.warn('No se pudieron recuperar las preferencias del agente:', error)
      }
    },

    saveAgentPanelSettings() {
      localStorage.setItem(this.agentPanelSettingsKey, JSON.stringify({
        agentAlias: this.agentAlias,
        autoCloseAgentPanel: this.autoCloseAgentPanel,
        showQueryWarnings: this.showQueryWarnings
      }))
    },

    toggleAgentControls() {
      if (this.agentControlsOpen) this.closeAgentControls()
      else this.openAgentControls()
    },

    openAgentControls() {
      if (this.agentControlsOpen) return
      this.previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      this.agentControlsOpen = true
      this.$nextTick(() => this.$refs.agentControlsClose?.focus())
    },

    closeAgentControls() {
      if (!this.agentControlsOpen) return
      this.agentControlsOpen = false
      document.body.style.overflow = this.previousBodyOverflow
      this.previousBodyOverflow = ''
    },

    handleAgentControlsKeydown(event) {
      if (event.key === 'Escape' && this.agentControlsOpen) {
        this.closeAgentControls()
      }
    },

    startNewConversation() {
      this.saveConversationHistory()

      if (this.turns.length) {
        Object.values(this.chartInstances).forEach(chart => chart.destroy())
        this.chartInstances = {}
        this.chartCanvases = {}
        this.createConversation()
      }

      this.question = ''
      this.closeAgentControls()
      this.$nextTick(() => this.$refs.inputRef?.focus())
    },

    // Convierte el texto de respuesta del agente (con sintaxis markdown simple:
    // #/##/### para títulos, *texto* para negrita, "1. " para listas) a HTML.
    // Se escapa el texto original antes de transformarlo para evitar inyectar
    // HTML arbitrario que venga en la respuesta.
    formatAnswer(text) {
      if (!text) return ''

      const normalizeMarkdown = (value) => String(value)
        .replace(/\\([*_`#-])/g, '$1')
        .replace(/\\([\[\]\(\)])/g, '$1')

      const escapeHtml = (str) => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

      const applyInline = (value) => {
        let html = escapeHtml(normalizeMarkdown(value))
        html = html.replace(/`([^`]+)`/g, '<code class="agent-inline-code">$1</code>')
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
        html = html.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3')
        return html
      }

      const lines = String(text).replace(/\r\n?/g, '\n').split('\n')
      const html = []
      let listBuffer = []
      let listType = null

      const flushList = () => {
        if (!listBuffer.length) return
        const tag = listType === 'ul' ? 'ul' : 'ol'
        html.push(`<${tag} class="agent-answer-list">${listBuffer.join('')}</${tag}>`)
        listBuffer = []
        listType = null
      }

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) {
          flushList()
          continue
        }
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
        if (headingMatch) {
          flushList()
          const level = headingMatch[1].length
          const tag = `h${level}`
          html.push(`<${tag} class="agent-answer-heading agent-answer-heading-${level}">${applyInline(headingMatch[2])}</${tag}>`)
          continue
        }
        const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/)
        if (orderedMatch) {
          if (listType && listType !== 'ol') flushList()
          listType = 'ol'
          listBuffer.push(`<li>${applyInline(orderedMatch[1])}</li>`)
          continue
        }
        const unorderedMatch = line.match(/^[-*+]\s+(.+)$/)
        if (unorderedMatch) {
          if (listType && listType !== 'ul') flushList()
          listType = 'ul'
          listBuffer.push(`<li>${applyInline(unorderedMatch[1])}</li>`)
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
        window.scrollTo({
          top: window.scrollY + 100,
          behavior: 'smooth'
        })
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

    makeConversationId() {
      return `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    },

    createConversation() {
      const conversation = {
        id: this.makeConversationId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        turns: []
      }
      this.currentConversationId = conversation.id
      this.conversationHistory.push(conversation)
      this.turns = []
      this.saveConversationHistory()
      return conversation
    },

    loadConversationHistory() {
      try {
        const saved = sessionStorage.getItem(this.conversationStorageKey)
        const parsed = saved ? JSON.parse(saved) : []
        this.conversationHistory = Array.isArray(parsed) ? parsed : []

        const savedCurrentId = sessionStorage.getItem(this.currentConversationStorageKey)
        let current = this.conversationHistory.find(item => item.id === savedCurrentId)

        if (!current) {
          current = [...this.conversationHistory].sort((a, b) =>
            (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
          )[0]
        }

        if (!current) {
          this.createConversation()
          return
        }

        this.currentConversationId = current.id
        this.turns = Array.isArray(current.turns) ? current.turns : []

        this.$nextTick(() => {
          this.turns.forEach(turn => {
            if (turn.status === 'done' && turn.result?.chart) this.renderChartForTurn(turn)
          })
          this.scrollToBottom()
        })

        this.saveConversationHistory()
      } catch (error) {
        console.error('No se pudo recuperar el historial de conversaciones:', error)
        this.conversationHistory = []
        this.createConversation()
      }
    },

    serializeTurn(turn) {
      return {
        id: turn.id,
        question: turn.question,
        timestamp: turn.timestamp,
        status: turn.status,
        showSql: !!turn.showSql,
        error: turn.error || '',
        result: turn.result ? JSON.parse(JSON.stringify(turn.result)) : null
      }
    },

    saveConversationHistory() {
      try {
        if (!this.currentConversationId) return
        const current = this.conversationHistory.find(item => item.id === this.currentConversationId)
        if (!current) return
        current.turns = this.turns.map(turn => this.serializeTurn(turn))
        current.updatedAt = Date.now()
        sessionStorage.setItem(this.conversationStorageKey, JSON.stringify(this.conversationHistory))
        sessionStorage.setItem(this.currentConversationStorageKey, this.currentConversationId)
      } catch (error) {
        console.error('No se pudo guardar el historial de conversaciones:', error)
      }
    },

    conversationTitle(conversation) {
      const firstTurn = conversation.turns?.[0]
      if (!firstTurn?.question) return 'Nueva conversación'
      return firstTurn.question.length > 55
        ? `${firstTurn.question.slice(0, 55)}…`
        : firstTurn.question
    },

    formatDateTime(ts) {
      if (!ts) return ''
      return new Date(ts).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    openConversation(conversationId) {
      const conversation = this.conversationHistory.find(item => item.id === conversationId)
      if (!conversation) return

      this.saveConversationHistory()
      Object.values(this.chartInstances).forEach(chart => chart.destroy())
      this.chartInstances = {}
      this.chartCanvases = {}

      this.currentConversationId = conversation.id
      this.turns = Array.isArray(conversation.turns) ? JSON.parse(JSON.stringify(conversation.turns)) : []
      // this.showHistory = false
      sessionStorage.setItem(this.currentConversationStorageKey, this.currentConversationId)

      if (this.autoCloseAgentPanel) this.closeAgentControls()

      this.$nextTick(() => {
        this.turns.forEach(turn => {
          if (turn.status === 'done' && turn.result?.chart) this.renderChartForTurn(turn)
        })
        this.scrollToBottom()
      })
    },

    async loadAgent({ silent = false } = {}) {
      this.loading = true
      try {
        const response = await axios.post(
          'https://apis.madautomate.cloud/webhook/sync-bigquery-leads',
          { action: 'get_agents' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        const payload = Array.isArray(response.data) ? response.data[0] : response.data
        if (!payload) throw new Error('La API no devolvió información del agente')

        this.agent_name = payload.name || this.agent_name || 'Agente de datos'
        this.query_limit = Math.max(0, Number(payload.query_limit) || 0)
        this.queries_used = Math.max(0, Number(payload.queries_used) || 0)
      } catch (error) {
        console.error('Error cargando información del agente:', error)
        if (!silent) {
          this.triggerToast('Error', 'No se pudo actualizar la información del agente', false)
        }
      } finally {
        this.loading = false
      }
    },

    async syncData() {
      if (this.syncing) return
      this.syncing = true
      try {
        const response = await axios.post(
          'https://apis.madautomate.cloud/webhook/sync-bigquery-leads',
          { action: 'sync_data' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        const data = response.data || {}
        const rowsUpdated = Number(data.rows_updated) || 0
        this.lastSyncAt = Date.now()
        localStorage.setItem(this.lastSyncStorageKey, String(this.lastSyncAt))

        this.triggerToast(
          'Sincronización completa',
          `Se ${rowsUpdated === 1 ? 'actualizó' : 'actualizaron'} ${rowsUpdated} ${
            rowsUpdated === 1 ? 'registro' : 'registros'
          }`,
          true
        )

        await this.loadAgent({ silent: true })
      } catch (error) {
        console.error('Error sincronizando datos:', error)
        this.triggerToast('Error', 'No se pudieron sincronizar los datos', false)
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

      if (this.isQueryLimitReached) {
        this.openAgentControls()
        this.triggerToast(
          'Límite alcanzado',
          'No quedan consultas disponibles para este agente.',
          false
        )
        return
      }

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
      this.saveConversationHistory()
      this.scrollToBottom()

      try {
        const { data } = await axios.post(
          AGENT_URL,
          { question: questionText },
          { headers: { Authorization: `Bearer ${this.token}` }, timeout: 60000 }
        )

        turn.result = this.parseAgentResponse(data)
        turn.status = 'done'

        if (Number(this.query_limit) > 0) {
          this.queries_used = Math.min(
            Number(this.query_limit),
            (Number(this.queries_used) || 0) + 1
          )
        }

        this.saveConversationHistory()

        await this.$nextTick()
        this.renderChartForTurn(turn)
      } catch (error) {
        console.error('Error al consultar al agente:', error)
        turn.status = 'error'
        turn.error = this.$t('agent_view.error')
        this.saveConversationHistory()
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

    renderChartForTurn(turn, attempt = 0) {
      if (!turn.result?.chart) return

      const canvas = this.chartCanvases[turn.id]

      // El canvas puede no estar montado todavía: reintenta unas pocas veces.
      if (!canvas) {
        if (attempt < 5) setTimeout(() => this.renderChartForTurn(turn, attempt + 1), 60)
        return
      }

      if (this.chartInstances[turn.id]) {
        this.chartInstances[turn.id].destroy()
        delete this.chartInstances[turn.id]
      }

      try {
        const config = this.buildChartJsConfig(turn.result.chart)
        // markRaw evita que Vue convierta la instancia de Chart.js en un Proxy reactivo,
        // lo que provoca fallos intermitentes de renderizado.
        this.chartInstances[turn.id] = markRaw(new Chart(canvas.getContext('2d'), config))
      } catch (error) {
        console.error('No se pudo dibujar el gráfico:', error, turn.result.chart)
      }
    },

    // Traduce la config de Vega-Lite que devuelve el agente a una config de Chart.js.
    // Es tolerante a distintas formas de encoding:
    // - x/y nominal, ordinal, temporal o quantitative (en barras detecta cuál eje es la medida)
    // - color como serie (si el color es el mismo campo que la categoría, solo colorea barras)
    // - sort: "-x", "-y", "ascending", "descending", objeto {field, order} o arreglo
    // - data.values o filas inferidas
    // - mark string u objeto; line, bar, area, point, arc/pie/donut y variantes
    // - si el encoding no produce datos válidos, infiere desde los campos numéricos
    buildChartJsConfig(vegaConfig) {
      const self = this

      const title = typeof vegaConfig?.title === 'string'
        ? vegaConfig.title
        : (vegaConfig?.title?.text || '')

      const getRows = (config) => {
        if (Array.isArray(config?.data?.values)) return config.data.values
        if (Array.isArray(config?.values)) return config.values
        if (Array.isArray(config?.data)) return config.data
        return []
      }

      const rows = getRows(vegaConfig)

      const markType = (mark) => {
        if (typeof mark === 'string') return mark.toLowerCase()
        return String(mark?.type || '').toLowerCase()
      }

      const normalizeEntry = (entry, channel) => {
        if (!entry) return null
        const value = Array.isArray(entry) ? entry[1] : entry
        if (!value || typeof value !== 'object') return null
        return {
          channel,
          field: value.field || value.aggregate?.field || null,
          type: String(value.type || '').toLowerCase(),
          title: value.title || value.axis?.title || value.legend?.title || null,
          aggregate: value.aggregate || null,
          stack: value.stack,
          sort: value.sort,
          scale: value.scale,
          raw: value
        }
      }

      const encoding = (vegaConfig?.encoding && typeof vegaConfig.encoding === 'object')
        ? vegaConfig.encoding
        : {}

      const channelNames = ['x', 'y', 'x2', 'y2', 'color', 'fill', 'stroke', 'size', 'shape', 'opacity', 'theta', 'radius', 'detail', 'text', 'tooltip', 'row', 'column']

      const entries = channelNames
        .map(channel => normalizeEntry(encoding[channel], channel))
        .filter(Boolean)

      const byChannel = Object.fromEntries(entries.map(entry => [entry.channel, entry]))

      const isNumeric = (value) => {
        if (value === null || value === undefined || value === '') return false
        if (typeof value === 'number') return Number.isFinite(value)
        const normalized = String(value).trim().replace(',', '.')
        if (!normalized) return false
        return Number.isFinite(Number(normalized))
      }

      const toNumberOrNull = (value) => {
        if (value === null || value === undefined || value === '') return null
        if (typeof value === 'number') return Number.isFinite(value) ? value : null
        const normalized = String(value).trim().replace(',', '.')
        if (!normalized) return null
        const n = Number(normalized)
        return Number.isFinite(n) ? n : null
      }

      const looksLikeDate = (value) => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) return true
        if (typeof value !== 'string') return false
        const v = value.trim()
        if (!v) return false
        // ISO / SQL / DD-MM / DD/MM y timestamps habituales.
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) return true
        if (/^\d{4}\/\d{2}\/\d{2}/.test(v)) return true
        if (/^\d{2}[\/-]\d{2}[\/-]\d{4}/.test(v)) return true
        if (/^\d{4}-\d{2}/.test(v)) return true
        return false
      }

      const fieldValues = (field) => {
        if (!field || !rows.length) return []
        return rows.map(row => row?.[field]).filter(value => value !== null && value !== undefined && value !== '')
      }

      const allFields = rows.length
        ? [...new Set(rows.flatMap(row => Object.keys(row || {})))]
        : []

      const aggregateLikeFields = new Set([
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly',
        'count', 'count_distinct', 'sum', 'avg', 'average', 'min', 'max',
        'lead_count', 'total_leads', 'value', 'values', 'metric', 'measure'
      ])

      const inferFieldByType = (type, preferred = []) => {
        const candidates = [...preferred, ...allFields.filter(field => !preferred.includes(field))]
        return candidates.find(field => {
          const values = fieldValues(field)
          if (!values.length) return false
          if (type === 'temporal') return values.some(looksLikeDate)
          if (type === 'quantitative') return values.every(isNumeric)
          if (type === 'nominal' || type === 'ordinal') return values.some(v => !isNumeric(v) && !looksLikeDate(v))
          return false
        }) || null
      }

      const preferredTemporal = [
        byChannel.x?.field,
        'date', 'created_day', 'created', 'fecha', 'timestamp', 'datetime',
        'time', 'day', 'month', 'year'
      ].filter(Boolean)

      const preferredMeasure = [
        byChannel.y?.field,
        byChannel.x?.type === 'quantitative' ? byChannel.x?.field : null,
        'lead_count', 'count', 'total', 'total_leads', 'amount', 'value', 'metric',
        ...allFields.filter(field => aggregateLikeFields.has(String(field).toLowerCase()))
      ].filter(Boolean)

      // Vega-Lite tiene prioridad explícita. Solo inferimos cuando el encoding no alcanza.
      let xEntry = byChannel.x || null
      let yEntry = byChannel.y || null

      if (!xEntry) {
        const field = inferFieldByType('temporal', preferredTemporal) ||
          inferFieldByType('nominal', []) ||
          inferFieldByType('ordinal', [])
        if (field) {
          xEntry = {
            channel: 'x',
            field,
            type: fieldValues(field).some(looksLikeDate) ? 'temporal' : 'nominal',
            title: field,
            raw: {}
          }
        }
      }

      if (!yEntry) {
        const inferredMeasure = inferFieldByType('quantitative', preferredMeasure)
        if (inferredMeasure) {
          yEntry = {
            channel: 'y',
            field: inferredMeasure,
            type: 'quantitative',
            title: inferredMeasure,
            raw: {}
          }
        }
      }

      // Para gráficos tipo pie/donut, theta/radius tiene prioridad sobre x/y.
      const categoricalEntry = byChannel.color || byChannel.fill || byChannel.x || byChannel.row || byChannel.column
      const measureEntry = byChannel.theta || byChannel.radius || yEntry || byChannel.x

      const getValue = (row, entry) => (entry?.field ? row?.[entry.field] : null)

      const formatCategory = (value) => {
        if (value === null || value === undefined) return ''
        if (value instanceof Date) return value.toLocaleDateString('es-AR')
        const str = String(value)
        // Evita mostrar el timestamp completo cuando viene con 00:00:00.
        if (/^\d{4}-\d{2}-\d{2} 00:00:00$/.test(str)) return str.slice(0, 10)
        return str
      }

      const mark = markType(vegaConfig?.mark)

      // Soporte para Vega-Lite layer: cada capa se convierte en dataset si es posible.
      // Hereda encoding y data del nivel superior y descarta capas puramente decorativas.
      if (Array.isArray(vegaConfig?.layer) && vegaConfig.layer.length) {
        const layerConfigs = vegaConfig.layer
          .filter(layer => !['text', 'rule', 'tick'].includes(markType(layer?.mark)))
          .map(layer => self.buildChartJsConfig({
            ...layer,
            data: layer?.data || vegaConfig.data,
            encoding: { ...(vegaConfig.encoding || {}), ...(layer?.encoding || {}) },
            title: layer?.title || vegaConfig.title
          }))
          .filter(Boolean)

        if (layerConfigs.length) {
          const base = layerConfigs[0]
          const datasets = layerConfigs.flatMap((config, index) => (config?.data?.datasets || []).map(ds => ({
            ...ds,
            label: ds.label || `Serie ${index + 1}`
          })))
          return {
            ...base,
            data: {
              ...(base.data || {}),
              datasets
            }
          }
        }
      }

      // =============================
      // ARC / PIE / DONUT
      // =============================
      if (['arc', 'pie', 'doughnut', 'donut'].includes(mark)) {
        let labelEntry = categoricalEntry
        let valueEntry = measureEntry

        if (!labelEntry?.field) {
          const candidate = inferFieldByType('nominal', [])
          if (candidate) labelEntry = { field: candidate, type: 'nominal', title: candidate }
        }

        if (!valueEntry?.field) {
          const candidate = inferFieldByType('quantitative', preferredMeasure)
          if (candidate) valueEntry = { field: candidate, type: 'quantitative', title: candidate }
        }

        const pieRows = rows.filter(Boolean)
        const pieLabels = pieRows.map(row => formatCategory(getValue(row, labelEntry)))
        const pieValues = pieRows.map(row => toNumberOrNull(getValue(row, valueEntry)) ?? 0)

        return {
          type: 'doughnut',
          data: {
            labels: pieLabels,
            datasets: [{
              label: valueEntry?.title || valueEntry?.field || 'Valor',
              data: pieValues,
              backgroundColor: pieLabels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              title: { display: !!title, text: title }
            }
          }
        }
      }

      // =============================
      // ORDEN DE LAS CATEGORÍAS
      // =============================
      const sortRows = (inputRows, catEntry, valEntry) => {
        if (!catEntry?.field) return inputRows.filter(Boolean)
        const field = catEntry.field
        const valid = inputRows.filter(row => row && row[field] !== null && row[field] !== undefined)
        if (!valid.length) return []

        if (catEntry.type === 'temporal' || valid.every(row => looksLikeDate(row[field]))) {
          return [...valid].sort((a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime())
        }

        const sort = catEntry.sort
        if (!sort) return valid

        if (Array.isArray(sort)) {
          const order = sort.map(String)
          const idx = (v) => {
            const i = order.indexOf(String(v))
            return i < 0 ? Infinity : i
          }
          return [...valid].sort((a, b) => idx(a[field]) - idx(b[field]))
        }

        let dir = 1
        let alphabetical = false
        let measureField = null

        if (typeof sort === 'string') {
          const m = sort.match(/^(-?)(x|y)$/)
          if (m) {
            dir = m[1] ? -1 : 1
            // "-x" en el eje y significa: ordenar por el valor del eje x.
            if (m[2] !== catEntry.channel) measureField = valEntry?.field
            else alphabetical = true
          } else if (sort === 'descending') {
            dir = -1
            alphabetical = true
          } else if (sort === 'ascending') {
            alphabetical = true
          } else {
            return valid
          }
        } else if (typeof sort === 'object') {
          dir = sort.order === 'descending' ? -1 : 1
          if (sort.field || sort.encoding) measureField = sort.field || valEntry?.field
          else alphabetical = true
        }

        if (alphabetical || !measureField) {
          return [...valid].sort((a, b) => dir * String(a[field]).localeCompare(String(b[field])))
        }

        const totals = new Map()
        valid.forEach(row => {
          const key = String(row[field])
          totals.set(key, (totals.get(key) || 0) + (toNumberOrNull(row[measureField]) ?? 0))
        })
        return [...valid].sort((a, b) => dir * (totals.get(String(a[field])) - totals.get(String(b[field]))))
      }

      // =============================
      // CONSTRUCCIÓN DE SERIES (categoría -> medida)
      // =============================
      const seriesEntry = byChannel.color || byChannel.fill || null

      const buildSeries = (catEntry, valEntry, { agg = 'last', sort = true, group = true } = {}) => {
        const sorted = sort ? sortRows(rows, catEntry, valEntry) : rows.filter(Boolean)
        const keyOf = (row) => (
          catEntry?.field ? formatCategory(row?.[catEntry.field]) : String(sorted.indexOf(row) + 1)
        )
        const labels = [...new Set(sorted.map(keyOf))]

        // El color solo crea series si es un campo distinto de la categoría y de la medida.
        // Si coincide con la categoría (caso típico: color = sucursal), solo pinta cada barra.
        const sf = seriesEntry?.field
        const groupField = group && sf && sf !== catEntry?.field && sf !== valEntry?.field ? sf : null

        const groups = groupField
          ? [...new Set(sorted
            .map(row => row?.[groupField])
            .filter(value => value !== null && value !== undefined && value !== '')
            .map(String))]
          : [null]

        const datasets = groups.map((g, i) => {
          const subset = g === null ? sorted : sorted.filter(row => String(row?.[groupField]) === g)
          const map = new Map()
          subset.forEach(row => {
            const key = keyOf(row)
            const value = toNumberOrNull(row?.[valEntry.field])
            if (value === null) {
              if (!map.has(key)) map.set(key, null)
              return
            }
            const prev = map.get(key)
            map.set(key, agg === 'sum' && prev !== null && prev !== undefined ? prev + value : value)
          })
          return {
            label: g !== null ? formatCategory(g) : (valEntry.title || valEntry.field || `Serie ${i + 1}`),
            data: labels.map(label => (map.has(label) ? map.get(label) : null))
          }
        })

        return { labels, datasets, grouped: !!groupField }
      }

      const isLineLike = ['line', 'area', 'point', 'circle', 'trail'].includes(mark)
      const isBar = !isLineLike

      const isQuantEntry = (entry) => {
        if (!entry?.field) return false
        if (entry.type === 'quantitative') return true
        if (entry.type) return false
        const values = fieldValues(entry.field)
        return values.length > 0 && values.every(isNumeric)
      }

      let catEntry = xEntry
      let valEntry = yEntry
      let horizontal = false

      // En barras, la medida puede estar en x (barras horizontales) o en y (verticales).
      if (isBar && xEntry?.field && yEntry?.field && isQuantEntry(xEntry) && !isQuantEntry(yEntry)) {
        catEntry = yEntry
        valEntry = xEntry
        horizontal = true
      }

      let labels = []
      let datasets = []
      let grouped = false

      if (catEntry?.field && valEntry?.field) {
        ({ labels, datasets, grouped } = buildSeries(catEntry, valEntry, { agg: isBar ? 'sum' : 'last' }))
      }

      const hasData = datasets.some(ds => ds.data.some(v => v !== null))

      // =============================
      // FALLBACK ROBUSTO: el encoding no produjo datos válidos.
      // Se busca un campo de categoría y se grafican los campos totalmente numéricos.
      // =============================
      if (!hasData && rows.length) {
        const isCategoryField = (field) => fieldValues(field).some(v => !isNumeric(v) || looksLikeDate(v))
        const catField = [catEntry?.field, ...allFields].find(field => field && isCategoryField(field)) || allFields[0]
        const numericFields = allFields.filter(field => {
          if (field === catField) return false
          const values = fieldValues(field)
          return values.length > 0 && values.every(isNumeric)
        })

        if (catField && numericFields.length) {
          const fallbackCat = {
            channel: 'x',
            field: catField,
            type: fieldValues(catField).some(looksLikeDate) ? 'temporal' : 'nominal',
            title: catField
          }
          const built = numericFields.slice(0, 8).map(field => buildSeries(
            fallbackCat,
            { field, title: field, type: 'quantitative' },
            { agg: isBar ? 'sum' : 'last', sort: false, group: false }
          ))
          labels = built[0].labels
          datasets = built.flatMap(item => item.datasets)
          grouped = false
          horizontal = false
          catEntry = fallbackCat
          valEntry = numericFields.length === 1 ? { field: numericFields[0], title: numericFields[0] } : null
        }
      }

      // =============================
      // LINE / AREA / POINT
      // =============================
      if (isLineLike) {
        const styled = datasets.map((ds, index) => ({
          ...ds,
          borderColor: CHART_PALETTE[index % CHART_PALETTE.length],
          backgroundColor: `${CHART_PALETTE[index % CHART_PALETTE.length]}1A`,
          borderWidth: 2,
          pointRadius: mark === 'line' || mark === 'point' ? 2.5 : 0,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: mark === 'area'
        }))

        return {
          type: 'line',
          data: { labels, datasets: styled },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: { display: styled.length > 1, position: 'bottom' },
              title: { display: !!title, text: title },
              tooltip: {
                callbacks: {
                  label(context) {
                    const value = context?.parsed?.y
                    const datasetLabel = context?.dataset?.label || ''
                    return `${datasetLabel}: ${value ?? '-'}`
                  }
                }
              }
            },
            scales: {
              x: {
                type: 'category',
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 12,
                  maxRotation: 45,
                  minRotation: 0
                },
                title: {
                  display: !!(catEntry?.title || catEntry?.field),
                  text: catEntry?.title || catEntry?.field || ''
                }
              },
              y: {
                beginAtZero: false,
                title: {
                  display: !!(valEntry?.title || valEntry?.field),
                  text: valEntry?.title || valEntry?.field || ''
                }
              }
            }
          }
        }
      }

      // =============================
      // BAR
      // =============================
      const single = datasets.length === 1
      const barDatasets = datasets.map((ds, index) => {
        const color = single
          ? ds.data.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length])
          : CHART_PALETTE[index % CHART_PALETTE.length]
        return {
          label: ds.label,
          data: ds.data,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4
        }
      })

      const stacked = grouped && valEntry?.stack !== null && valEntry?.stack !== false

      const categoryAxis = {
        stacked,
        title: {
          display: !!(catEntry?.title || catEntry?.field),
          text: catEntry?.title || catEntry?.field || ''
        }
      }

      const valueAxis = {
        stacked,
        beginAtZero: true,
        title: {
          display: !!(valEntry?.title || valEntry?.field),
          text: valEntry?.title || valEntry?.field || ''
        }
      }

      return {
        type: 'bar',
        data: { labels, datasets: barDatasets },
        options: {
          indexAxis: horizontal ? 'y' : 'x',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: barDatasets.length > 1, position: 'bottom' },
            title: { display: !!title, text: title }
          },
          scales: horizontal
            ? { x: valueAxis, y: categoryAxis }
            : { x: categoryAxis, y: valueAxis }
        }
      }
    },

    confirmClear() {
      if (!this.turns.length) return
      this.$refs.confirmPopup.showConfirmPopup()
    },

    handleClearConfirm(isConfirmed) {
      if (!isConfirmed) return

      // La conversación actual queda guardada en conversationHistory.
      this.saveConversationHistory()

      Object.values(this.chartInstances).forEach(chart => chart.destroy())
      this.chartInstances = {}
      this.chartCanvases = {}

      this.createConversation()
      // this.showHistory = false
    },

    // Divide el texto de la respuesta (mismo markdown simple que formatAnswer)
    // en bloques estructurados para poder dibujarlos en el PDF.
    parseAnswerBlocks(text) {
      const normalizeMarkdown = (value) => String(value)
        .replace(/\\([*_`#-])/g, '$1')
        .replace(/\\([\[\]\(\)])/g, '$1')

      const blocks = []
      let listBuffer = []
      let listType = null

      const flushList = () => {
        if (listBuffer.length) {
          blocks.push({ type: 'list', listType, items: listBuffer })
          listBuffer = []
          listType = null
        }
      }

      ;(text || '').replace(/\r\n?/g, '\n').split('\n').forEach(rawLine => {
        const line = rawLine.trim()
        if (!line) {
          flushList()
          return
        }

        const normalized = normalizeMarkdown(line)

        const headingMatch = normalized.match(/^(#{1,6})\s+(.+)$/)
        if (headingMatch) {
          flushList()
          blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
          return
        }

        const orderedMatch = normalized.match(/^\d+[.)]\s+(.+)$/)
        if (orderedMatch) {
          if (listType && listType !== 'ol') flushList()
          listType = 'ol'
          listBuffer.push(orderedMatch[1])
          return
        }

        const unorderedMatch = normalized.match(/^[-*+]\s+(.+)$/)
        if (unorderedMatch) {
          if (listType && listType !== 'ul') flushList()
          listType = 'ul'
          listBuffer.push(unorderedMatch[1])
          return
        }

        flushList()
        blocks.push({ type: 'paragraph', text: normalized })
      })

      flushList()
      return blocks
    },

    splitInlineSegments(str) {
      const normalized = String(str)
        .replace(/\\([*_`#-])/g, '$1')
        .replace(/\\([\[\]\(\)])/g, '$1')

      const segments = []
      const regex = /\*\*(.+?)\*\*|__(.+?)__/g
      let lastIndex = 0
      let match

      while ((match = regex.exec(normalized))) {
        if (match.index > lastIndex) {
          segments.push({ text: normalized.slice(lastIndex, match.index), bold: false })
        }
        segments.push({ text: match[1] || match[2], bold: true })
        lastIndex = regex.lastIndex
      }

      if (lastIndex < normalized.length) {
        segments.push({ text: normalized.slice(lastIndex), bold: false })
      }

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
            const prefix = block.listType === 'ul' ? '• ' : `${i + 1}. `
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
  bottom: 10px;
  display: flex;
  flex-direction: column;
  /* gap: var(--agent-space-2); */
  /* background: var(--agent-surface); */
  padding-top: var(--agent-space-2);
  z-index: 100;
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
  z-index: 2;
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

  position: absolute;
  width: 100%;
  top: 0;
  opacity: 0;

  transition:
    top 0.3s ease,
    opacity 0.3s ease 0.15s;
}

.bar-favorites.show {
  top: -80px;
  opacity: 1;
}

.agent-conversation.show {
  margin-bottom: 100px;
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

/* ---------- historial de conversaciones ---------- */
.btn-history {
  border: 1px solid var(--agent-border);
  background: #fff;
  color: var(--agent-text, #343a40);
  margin-left: 0.5rem;
}
.btn-history:hover {
  background: #f8f9fa;
}
.agent-history-panel {
  margin: 0 0 1rem;
  padding: 0.9rem;
  /* border: 1px solid var(--agent-border);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,.06); */
}
.agent-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .6rem;
}
.agent-history-close {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: .25rem .4rem;
}
.agent-history-list {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  max-height: 260px;
  overflow-y: auto;
}
.agent-history-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: .65rem .75rem;
  background: #f8f9fa;
  cursor: pointer;
}
.agent-history-item:hover,
.agent-history-item.active {
  border-color: var(--agent-accent);
  background: rgba(57,57,255,.05);
}
.agent-history-item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: .15rem;
}
.agent-history-item-main strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agent-history-item-main small {
  opacity: .65;
}
.agent-history-count {
  flex: 0 0 auto;
  min-width: 1.7rem;
  text-align: center;
  border-radius: 999px;
  padding: .15rem .45rem;
  background: #e9ecef;
  font-size: .75rem;
}
.agent-history-empty {
  color: #6c757d;
  font-size: .9rem;
}

/* ---------- Markdown de respuestas ---------- */
.agent-answer-text {
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.agent-answer-text strong {
  font-weight: 700;
}
.agent-answer-heading {
  margin: 0.9rem 0 0.45rem;
  line-height: 1.25;
  font-weight: 700;
}
.agent-answer-heading-1 { font-size: 1.35rem; }
.agent-answer-heading-2 { font-size: 1.25rem; }
.agent-answer-heading-3 { font-size: 1.15rem; }
.agent-answer-heading-4 { font-size: 1.08rem; }
.agent-answer-heading-5 { font-size: 1rem; }
.agent-answer-heading-6 { font-size: .95rem; }
.agent-answer-paragraph {
  margin: 0 0 .65rem;
}
.agent-answer-list {
  margin: .25rem 0 .75rem 1.25rem;
  padding-left: 1rem;
}
.agent-answer-list li {
  margin: .3rem 0;
  padding-left: .15rem;
}
.agent-inline-code {
  padding: .12rem .35rem;
  border-radius: 5px;
  background: #f1f3f5;
  border: 1px solid #e9ecef;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: .9em;
}
/* ============================================================
   CONFIGURACION DEL AGENTE: boton flotante + drawer lateral
   ============================================================ */
.agent-controls-trigger {
  position: fixed;
  right: 24px;
  top: 80px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 58px;
  padding: 0.55rem 0.65rem 0.55rem 0.58rem;
  border: 1px solid rgba(57, 57, 255, 0.22);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  color: var(--agent-ink);
  box-shadow: 0 16px 40px rgba(28, 31, 72, 0.18), 0 3px 10px rgba(28, 31, 72, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.agent-controls-trigger:hover {
  transform: translateY(-3px);
  border-color: rgba(57, 57, 255, 0.42);
  box-shadow: 0 20px 46px rgba(28, 31, 72, 0.23), 0 4px 12px rgba(28, 31, 72, 0.1);
}
.agent-controls-trigger:focus-visible {
  outline: 3px solid rgba(57, 57, 255, 0.22);
  outline-offset: 3px;
}
.agent-controls-trigger.active {
  transform: translateY(2px) scale(0.98);
}
.agent-controls-trigger-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: linear-gradient(145deg, #5151ff 0%, #3434e8 100%);
  color: #fff;
  font-size: 1.1rem;
  box-shadow: 0 8px 18px rgba(57, 57, 255, 0.28);
}
.agent-controls-trigger-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}
.agent-controls-trigger-copy strong {
  font-size: 0.88rem;
  font-weight: 700;
}
.agent-controls-trigger-copy small {
  max-width: 180px;
  margin-top: 0.22rem;
  color: var(--agent-ink-muted);
  font-size: 0.72rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agent-controls-trigger-badge {
  min-width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  padding: 0 0.42rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.agent-controls-trigger-badge.quota-ok {
  background: #e8f7ef;
  color: #147a46;
}
.agent-controls-trigger-badge.quota-warning {
  background: #fff5d9;
  color: #9a6500;
}
.agent-controls-trigger-badge.quota-danger {
  background: #ffebee;
  color: #c6283b;
}

.agent-controls-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2070;
  background: rgba(14, 17, 28, 0.42);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.agent-controls {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2080;
  width: min(440px, calc(100vw - 18px));
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(21, 23, 36, 0.08);
  background: #f6f7fb;
  color: var(--agent-ink);
  box-shadow: -28px 0 70px rgba(16, 20, 41, 0.22);
  overflow: hidden;
}
.agent-controls-header {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 1.25rem 1.15rem;
  background:
    radial-gradient(circle at 10% 0%, rgba(100, 100, 255, 0.24), transparent 42%),
    linear-gradient(135deg, #20213b 0%, #292b52 58%, #34356a 100%);
  color: #fff;
  overflow: hidden;
}
.agent-controls-header::after {
  content: '';
  position: absolute;
  right: -70px;
  bottom: -90px;
  width: 210px;
  height: 210px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 0 0 28px rgba(255, 255, 255, 0.035), 0 0 0 58px rgba(255, 255, 255, 0.025);
  pointer-events: none;
}
.agent-controls-identity {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}
.agent-controls-avatar {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.agent-controls-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  margin-bottom: 0.28rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.agent-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #61e79b;
  box-shadow: 0 0 0 4px rgba(97, 231, 155, 0.14);
}
.agent-controls-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 750;
  letter-spacing: -0.015em;
}
.agent-controls-header p {
  margin: 0.22rem 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.82rem;
}
.agent-controls-close {
  position: relative;
  z-index: 2;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}
.agent-controls-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(4deg);
}
.agent-controls-close:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.25);
  outline-offset: 2px;
}

.agent-controls-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #cfd1dd transparent;
}
.agent-controls-body::-webkit-scrollbar {
  width: 8px;
}
.agent-controls-body::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: #cfd1dd;
  background-clip: padding-box;
}
.agent-panel-card {
  flex: 0 0 auto;
  padding: 1rem;
  border: 1px solid #e6e7ef;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 5px 18px rgba(33, 37, 65, 0.045);
}
.agent-panel-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}
.agent-panel-kicker {
  display: block;
  margin-bottom: 0.18rem;
  color: #8b8d9a;
  font-size: 0.65rem;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.agent-panel-card h4 {
  margin: 0;
  color: #222330;
  font-size: 0.96rem;
  font-weight: 750;
  letter-spacing: -0.012em;
}
.agent-section-icon {
  color: #9a9cad;
  font-size: 1rem;
}
.agent-icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid #e5e6ee;
  border-radius: 10px;
  background: #fafafe;
  color: #676978;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.agent-icon-button:hover:not(:disabled) {
  border-color: rgba(57, 57, 255, 0.28);
  background: #f0f1ff;
  color: var(--agent-accent);
}
.agent-icon-button:disabled {
  cursor: wait;
  opacity: 0.55;
}
.spin {
  display: inline-block;
  animation: agent-spin 0.9s linear infinite;
}

.agent-usage-card {
  --usage-color: #2aa56a;
  border-color: rgba(42, 165, 106, 0.18);
  background: linear-gradient(145deg, #ffffff 0%, #fbfffd 100%);
}
.agent-usage-card.quota-warning {
  --usage-color: #e5a11a;
  border-color: rgba(229, 161, 26, 0.24);
  background: linear-gradient(145deg, #ffffff 0%, #fffdf7 100%);
}
.agent-usage-card.quota-danger {
  --usage-color: #d94a5d;
  border-color: rgba(217, 74, 93, 0.22);
  background: linear-gradient(145deg, #ffffff 0%, #fffafb 100%);
}
.agent-usage-summary {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
}
.agent-usage-ring {
  width: 108px;
  height: 108px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(var(--usage-color) var(--usage-progress), #eceef4 0);
  box-shadow: inset 0 0 0 1px rgba(30, 33, 52, 0.03);
}
.agent-usage-ring-inner {
  width: 82px;
  height: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 5px 14px rgba(34, 37, 58, 0.08);
}
.agent-usage-ring-inner strong {
  color: #242632;
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.agent-usage-ring-inner span {
  margin-top: 0.28rem;
  color: #8b8d99;
  font-size: 0.63rem;
  font-weight: 650;
}
.agent-usage-details {
  display: flex;
  flex-direction: column;
  gap: 0.52rem;
}
.agent-usage-details > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px dashed #ececf2;
}
.agent-usage-details > div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.agent-usage-details span {
  color: #777988;
  font-size: 0.76rem;
}
.agent-usage-details strong {
  color: #2a2b36;
  font-size: 0.82rem;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.agent-progress-track {
  height: 7px;
  margin-top: 0.9rem;
  border-radius: 999px;
  background: #eceef4;
  overflow: hidden;
}
.agent-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--usage-color);
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease;
}
.agent-usage-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.48rem;
  margin: 0.8rem 0 0;
  padding: 0.62rem 0.68rem;
  border-radius: 11px;
  background: color-mix(in srgb, var(--usage-color) 9%, white);
  color: #5e4b2b;
  font-size: 0.72rem;
  line-height: 1.45;
}
.agent-usage-card.quota-danger .agent-usage-warning {
  color: #8d3040;
}
.agent-usage-warning i {
  margin-top: 0.08rem;
  color: var(--usage-color);
}

.agent-field-label {
  display: block;
  margin-bottom: 0.42rem;
  color: #555764;
  font-size: 0.75rem;
  font-weight: 700;
}
.agent-text-field {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 43px;
  padding: 0 0.72rem;
  border: 1px solid #e2e3eb;
  border-radius: 12px;
  background: #fafafe;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.agent-text-field:focus-within {
  border-color: rgba(57, 57, 255, 0.45);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.1);
}
.agent-text-field i {
  color: #9698a7;
}
.agent-text-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #292a35;
  font-size: 0.82rem;
}
.agent-field-help {
  margin: 0.38rem 0 0.9rem;
  color: #9698a5;
  font-size: 0.67rem;
}
.agent-switch-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.72rem 0;
  border-top: 1px solid #eff0f4;
  cursor: pointer;
}
.agent-switch-row > span:first-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}
.agent-switch-row strong {
  color: #343642;
  font-size: 0.78rem;
  font-weight: 700;
}
.agent-switch-row small {
  color: #9294a1;
  font-size: 0.67rem;
  line-height: 1.35;
}
.agent-switch-row input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.agent-switch {
  position: relative;
  width: 42px;
  height: 24px;
  flex: 0 0 42px;
  border-radius: 999px;
  background: #d9dbe4;
  transition: background 0.2s ease;
}
.agent-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(31, 34, 52, 0.2);
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.agent-switch-row input:checked + .agent-switch {
  background: var(--agent-accent);
}
.agent-switch-row input:checked + .agent-switch::after {
  transform: translateX(18px);
}
.agent-switch-row input:focus-visible + .agent-switch {
  outline: 3px solid rgba(57, 57, 255, 0.16);
  outline-offset: 2px;
}

.agent-sync-card > p {
  margin: -0.1rem 0 0.85rem;
  color: #7b7d8a;
  font-size: 0.74rem;
  line-height: 1.5;
}
.agent-sync-status {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.28rem 0.5rem;
  border-radius: 999px;
  background: #eef8f2;
  color: #39815c;
  font-size: 0.64rem;
  font-weight: 700;
}
.agent-sync-status span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #45bd79;
}
.agent-sync-status.syncing {
  background: #f0f1ff;
  color: #4a4bd0;
}
.agent-sync-status.syncing span {
  background: #5a5cff;
  animation: agent-pulse 1s ease-in-out infinite;
}
@keyframes agent-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}
.agent-primary-action {
  width: 100%;
  min-height: 43px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #4848ff 0%, #3434df 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(57, 57, 255, 0.22);
  font-size: 0.8rem;
  font-weight: 720;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}
.agent-primary-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 11px 22px rgba(57, 57, 255, 0.28);
}
.agent-primary-action:disabled {
  cursor: wait;
  opacity: 0.68;
}
.agent-last-sync {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  margin-top: 0.68rem;
  color: #999ba8;
  font-size: 0.66rem;
}

.agent-history-panel {
  margin: 0;
  padding: 1rem;
}
.agent-history-heading {
  align-items: center;
}
.agent-new-chat {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.62rem;
  border: 1px solid rgba(57, 57, 255, 0.2);
  border-radius: 10px;
  background: #f1f2ff;
  color: #4243cc;
  font-size: 0.7rem;
  font-weight: 750;
  cursor: pointer;
}
.agent-new-chat:hover {
  border-color: rgba(57, 57, 255, 0.36);
  background: #e9eaff;
}
.agent-history-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  margin-bottom: 0.7rem;
  padding: 0 0.68rem;
  border: 1px solid #e3e4ec;
  border-radius: 11px;
  background: #fafafe;
}
.agent-history-search:focus-within {
  border-color: rgba(57, 57, 255, 0.42);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(57, 57, 255, 0.08);
}
.agent-history-search > i {
  color: #999ba8;
  font-size: 0.82rem;
}
.agent-history-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #30313c;
  font-size: 0.76rem;
}
.agent-history-search button {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #858795;
  cursor: pointer;
}
.agent-history-list {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  max-height: 330px;
  padding-right: 0.14rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.agent-history-item {
  width: 100%;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto 14px;
  align-items: center;
  gap: 0.62rem;
  padding: 0.66rem;
  border: 1px solid transparent;
  border-radius: 13px;
  background: #f8f8fb;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}
.agent-history-item:hover {
  transform: translateX(-2px);
  border-color: #dedfea;
  background: #f4f4f9;
}
.agent-history-item.active {
  border-color: rgba(57, 57, 255, 0.27);
  background: #f0f1ff;
}
.agent-history-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #ececf3;
  color: #777987;
  font-size: 0.78rem;
}
.agent-history-item.active .agent-history-icon {
  background: #dedfff;
  color: #4647d7;
}
.agent-history-item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.agent-history-item-main strong {
  overflow: hidden;
  color: #343541;
  font-size: 0.75rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agent-history-item-main small {
  overflow: hidden;
  color: #999ba7;
  font-size: 0.63rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agent-history-count {
  min-width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: #e9eaf0;
  color: #717381;
  font-size: 0.64rem;
  font-weight: 750;
}
.agent-history-item.active .agent-history-count {
  background: #dedfff;
  color: #4647d7;
}
.agent-history-arrow {
  color: #b3b4bf;
  font-size: 0.66rem;
}
.agent-history-empty {
  min-height: 138px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px dashed #dedfe7;
  border-radius: 13px;
  background: #fafafe;
  color: #999ba8;
  text-align: center;
}
.agent-history-empty i {
  margin-bottom: 0.25rem;
  color: #babcc8;
  font-size: 1.25rem;
}
.agent-history-empty strong {
  color: #666875;
  font-size: 0.76rem;
}
.agent-history-empty span {
  font-size: 0.67rem;
}

.agent-controls-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 47px;
  padding: 0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom));
  border-top: 1px solid #e5e6ed;
  background: rgba(255, 255, 255, 0.92);
  color: #8d8f9c;
  font-size: 0.66rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.agent-controls-footer i {
  color: #5d9d79;
}

.agent-drawer-enter-active,
.agent-drawer-leave-active {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}
.agent-drawer-enter-from,
.agent-drawer-leave-to {
  transform: translateX(104%);
  opacity: 0.72;
}
.agent-backdrop-enter-active,
.agent-backdrop-leave-active {
  transition: opacity 0.26s ease;
}
.agent-backdrop-enter-from,
.agent-backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .agent-controls-trigger {
    right: 14px;
    bottom: 84px;
    min-height: 52px;
    border-radius: 16px;
  }
  .agent-controls-trigger-icon {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }
  .agent-controls-trigger-copy {
    display: none;
  }
  .agent-controls {
    width: 100vw;
    border-left: 0;
  }
  .agent-controls-header {
    padding-top: calc(1rem + env(safe-area-inset-top));
  }
  .agent-controls-body {
    padding: 0.78rem;
  }
  .agent-panel-card {
    border-radius: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-controls-trigger,
  .agent-controls-close,
  .agent-history-item,
  .agent-primary-action,
  .agent-drawer-enter-active,
  .agent-drawer-leave-active,
  .agent-backdrop-enter-active,
  .agent-backdrop-leave-active {
    transition: none !important;
  }
  .spin,
  .agent-sync-status.syncing span {
    animation: none !important;
  }
}
</style>