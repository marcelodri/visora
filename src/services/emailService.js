import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const mockLimits = {
  max_templates: 10,
  max_campaigns: 5,
  max_sends_per_month: 1000,
  templates_used: 3,
  campaigns_used: 2,
  sends_used_current_month: 247,
  billing_reset_day: 1
};

// ─── MOCK DATA (campaigns & clients) ─────────────────────────────────────────

let mockCampaigns = [
  {
    id: 1,
    name: 'Lanzamiento Mayo 2025',
    description: 'Campaña de lanzamiento del nuevo producto',
    template_id: 2,
    template_name: 'Promoción especial',
    status: 'sent',
    source_type: 'db',
    recipients_count: 128,
    scheduled_at: null,
    sent_at: '2025-05-03T10:00:00',
    created_at: '2025-05-01T08:00:00'
  },
  {
    id: 2,
    name: 'Newsletter Abril 2025',
    description: 'Novedades del mes',
    template_id: 3,
    template_name: 'Newsletter mensual',
    status: 'closed',
    source_type: 'excel',
    recipients_count: 342,
    scheduled_at: null,
    sent_at: '2025-04-28T09:00:00',
    created_at: '2025-04-25T15:00:00'
  }
];

let mockClients = [
  { id: 1, nombre: 'Juan Pérez', email: 'marcelodri80@gmail.com', empresa: 'ACME S.A.', telefono: '+54 11 1234-5678' }
];

let nextCampaignId = 3;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sleep(ms = 300) {
  return new Promise(r => setTimeout(r, ms));
}

function extractVariables(html) {
  const regex = /\{\{(\w+)\}\}/g;
  const vars = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) vars.add(m[1]);
  return [...vars];
}

function parseArrayResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.customers)) return data.customers;
  return [];
}

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeSchedule(schedule) {
  const parsed = safeParseJson(schedule);
  if (!parsed || typeof parsed !== 'object') return null;
  const normalized = { ...parsed };
  if (!normalized.next_run_at && normalized.next_run) {
    normalized.next_run_at = normalized.next_run;
  }
  return normalized;
}

function resolveScheduledAt(scheduledAt, schedule) {
  if (scheduledAt) return scheduledAt;
  if (schedule?.next_run_at) return schedule.next_run_at;
  if (schedule?.scheduled_at) return schedule.scheduled_at;
  return null;
}

function resolveDeliveryMode(deliveryMode, scheduledAt, schedule) {
  if (deliveryMode) return deliveryMode;
  if (schedule?.type === 'recurring') return 'recurring';
  if (schedule?.type === 'once') return 'once';
  if (scheduledAt) return 'once';
  return 'now';
}

function normalizeClientRecord(rawClient, index) {
  if (!rawClient || typeof rawClient !== 'object') return null;
  const email = String(rawClient.email || rawClient.correo || rawClient.mail || '').trim();
  if (!email) return null;

  const fullName = [rawClient.firstname, rawClient.lastname].filter(Boolean).join(' ').trim();
  const nombre = rawClient.nombre || fullName || rawClient.name || rawClient.full_name || `Cliente ${index + 1}`;
  const empresa = rawClient.empresa || rawClient.company || rawClient.business_name || rawClient.organizacion || '';
  const telefono = rawClient.telefono || rawClient.phone || rawClient.mobile || rawClient.celular || '';
  const id = rawClient.id ?? rawClient.customer_id ?? `client-${index + 1}-${email}`;

  return {
    ...rawClient,
    id,
    nombre,
    email,
    empresa,
    telefono
  };
}

// ─── LIMITS ──────────────────────────────────────────────────────────────────

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function normalizeTableStructurePayload(payload) {
  const parsedPayload = typeof payload === 'string' ? safeParseJson(payload) || payload : payload;
  const descriptorKeys = ['Field', 'field', 'COLUMN_NAME', 'column_name', 'Column', 'column'];
  const ambiguousDescriptorKeys = ['name', 'Name'];
  const schemaHintKeys = ['Type', 'type', 'DATA_TYPE', 'data_type', 'Null', 'nullable', 'Key', 'Default', 'Extra'];
  const wrapperKeys = ['columns', 'headers', 'data', 'rows', 'result', 'results', 'schema', 'structure', 'fields', 'json', 'body'];
  const columns = [];

  const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const hasAnyKey = (object, keys) => keys.some(key => hasOwn(object, key));
  const addColumn = value => {
    const column = String(value || '').trim();
    if (column && !columns.includes(column)) columns.push(column);
  };

  const collectColumns = value => {
    const parsedValue = typeof value === 'string' ? safeParseJson(value) || value : value;

    if (Array.isArray(parsedValue)) {
      if (parsedValue.every(item => typeof item === 'string')) {
        parsedValue.forEach(addColumn);
        return;
      }
      parsedValue.forEach(collectColumns);
      return;
    }

    if (!isPlainObject(parsedValue)) return;

    const descriptorKey = descriptorKeys.find(key => hasOwn(parsedValue, key));
    if (descriptorKey) {
      addColumn(parsedValue[descriptorKey]);
      return;
    }

    const ambiguousDescriptorKey = ambiguousDescriptorKeys.find(key => hasOwn(parsedValue, key));
    if (ambiguousDescriptorKey && hasAnyKey(parsedValue, schemaHintKeys)) {
      addColumn(parsedValue[ambiguousDescriptorKey]);
      return;
    }

    const descriptorArrayKey = descriptorKeys.find(key => Array.isArray(parsedValue[key]));
    if (descriptorArrayKey) {
      parsedValue[descriptorArrayKey].forEach(addColumn);
      return;
    }

    for (const key of wrapperKeys) {
      if (hasOwn(parsedValue, key)) collectColumns(parsedValue[key]);
    }
  };

  collectColumns(parsedPayload);

  if (!columns.length) {
    const fallback = Array.isArray(parsedPayload) ? parsedPayload[0] : parsedPayload;
    if (isPlainObject(fallback)) {
      const schemaKeys = new Set([...descriptorKeys, ...ambiguousDescriptorKeys, ...schemaHintKeys]);
      Object.keys(fallback)
        .filter(key => !schemaKeys.has(key))
        .forEach(addColumn);
    }
  }

  return {
    raw: payload,
    columns
  };
}

function getDetail(key) {
  const authStore = useAuthStore();
  const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
  const found = details.find(d => d.key === key);
  return found ? Number(found.value) : null;
}

export async function getAccountLimits() {
  await sleep();
  const maxTemplates   = getDetail('limit_template_emails')  ?? mockLimits.max_templates;
  const maxCampaigns   = getDetail('limit_campaign_emails')  ?? mockLimits.max_campaigns;
  const maxSends       = getDetail('limit_shipping_emails')  ?? mockLimits.max_sends_per_month;
  return {
    max_templates:            maxTemplates,
    max_campaigns:            maxCampaigns,
    max_sends_per_month:      maxSends,
    templates_used:           mockLimits.templates_used,
    campaigns_used:           mockLimits.campaigns_used,
    sends_used_current_month: mockLimits.sends_used_current_month,
    billing_reset_day:        mockLimits.billing_reset_day
  };
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

const WEBHOOK_EMAILS = 'https://apis.madautomate.cloud/webhook/b43f61d6-92a9-422b-935e-7e2ac527d4c7';

export async function getTemplates() {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(
    WEBHOOK_EMAILS,
    { action: 'getTemplates' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.map(t => ({
    ...t,
    variables: typeof t.variables === 'string' ? JSON.parse(t.variables) : (t.variables ?? [])
  }));
}

export async function getTemplate(id) {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(
    WEBHOOK_EMAILS,
    { action: 'getTemplate', id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function createTemplate(data) {
  const token = sessionStorage.getItem('token');
  const variables = JSON.stringify(extractVariables(data.html_content));
  const html_content = data.html_content.replace(/\n/g, ' ').replace(/\r/g, '');
  const response = await axios.post(
    WEBHOOK_EMAILS,
    { action: 'createTemplate', type: 'custom', ...data, html_content, variables },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function updateTemplate(id, data) {
  const token = sessionStorage.getItem('token');
  const variables = JSON.stringify(extractVariables(data.html_content));
  const html_content = data.html_content.replace(/\n/g, ' ').replace(/\r/g, '');
  const response = await axios.post(
    WEBHOOK_EMAILS,
    { action: 'updateTemplate', id, type: 'custom', ...data, html_content, variables },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteTemplate(id) {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(
    WEBHOOK_EMAILS,
    { action: 'deleteTemplate', id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

const WEBHOOK_CAMPAIGNS = 'https://apis.madautomate.cloud/webhook/b2d86800-c53f-4f71-9df3-22ffdbc60e80';
const WEBHOOK_CUSTOMERS = 'https://apis.madautomate.cloud/webhook/ab007c4d-b051-44b6-8c1e-fb8cfb518ca3';

export async function getCampaigns() {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(
    WEBHOOK_CAMPAIGNS,
    { action: 'getCampaigns' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const rows = parseArrayResponse(response.data);
  return rows.map(row => {
    const schedule = normalizeSchedule(row.schedule);
    const scheduled_at = resolveScheduledAt(row.scheduled_at, schedule);
    const delivery_mode = resolveDeliveryMode(row.delivery_mode, scheduled_at, schedule);
    return {
      ...row,
      schedule,
      scheduled_at,
      delivery_mode
    };
  });
}

export async function getCampaign(id) {
  await sleep();
  const c = mockCampaigns.find(c => c.id === id);
  if (!c) throw new Error('Campaña no encontrada');
  return { ...c };
}

export async function createCampaign({ campaign, template, recipients, scheduledAt, schedule, deliveryMode }) {
  const token = sessionStorage.getItem('token');
  const normalizedSchedule = normalizeSchedule(schedule);
  const resolvedScheduledAt = resolveScheduledAt(scheduledAt, normalizedSchedule);
  const resolvedDeliveryMode = resolveDeliveryMode(deliveryMode, resolvedScheduledAt, normalizedSchedule);

  let recipient_mode = campaign.recipient_mode || 'manual';
  let segment_filter = campaign.segment_filter || null;
  let renderedRecipients = [];

  // recipients puede venir undefined si es recurrente/programado sin lista fija
  const safeRecipients = recipients || [];

  if (resolvedDeliveryMode === 'recurring' && recipient_mode === 'dynamic') {
    renderedRecipients = [];
  } else if (safeRecipients.length > 0) {
    renderedRecipients = safeRecipients.map(r => {
      let html = template.html_content;
      const vars = r.variables || {};
      Object.entries(vars).forEach(([key, val]) => {
        html = html.replaceAll(`{{${key}}}`, val || '');
      });
      return { email: r.email, variables: vars, html };
    });
  }

  const payload = {
    action: 'createCampaign',
    name: campaign.name,
    description: campaign.description || '',
    template_id: campaign.template_id,
    template_name: campaign.template_name || '',
    source_type: campaign.source_type || 'db',
    // Incluir info de la vista si aplica
    selected_view_name: campaign.selected_view_name || null,
    template_subject: template.subject,
    recipients_count: safeRecipients.length,
    scheduled_at: resolvedScheduledAt,
    schedule: normalizedSchedule,
    delivery_mode: resolvedDeliveryMode,
    recipient_mode,
    segment_filter,
    selected_table: campaign.selected_table || null,
    table_variable_mapping: campaign.table_variable_mapping || {},
    recipients: renderedRecipients
  };

  const response = await axios.post(
    WEBHOOK_CAMPAIGNS,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteCampaign(id) {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(
    WEBHOOK_CAMPAIGNS,
    { action: 'deleteCampaign', id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ─── CLIENTS (DB) ────────────────────────────────────────────────────────────

export async function getClients() {
  const token = sessionStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await axios.post(
      WEBHOOK_CUSTOMERS,
      { action: 'getCustomer' },
      { headers }
    );

    let customers = parseArrayResponse(response.data);
    if (!customers.length) {
      const topResponse = await axios.post(
        WEBHOOK_CUSTOMERS,
        { action: 'topCustomers' },
        { headers }
      );
      customers = parseArrayResponse(topResponse.data);
    }

    const normalized = customers
      .map((c, index) => normalizeClientRecord(c, index))
      .filter(Boolean);

    if (normalized.length) return normalized;
  } catch (error) {
    console.warn('[emailService] No se pudo cargar clientes desde la base real:', error?.message || error);
  }

  await sleep();
  return [...mockClients];
}

// ─── TABLES (Dynamic DB) ──────────────────────────────────────────────────────

export async function getTables() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.warn('[emailService] No token available for getTables');
    return [];
  }

  try {
    const response = await axios.post(
      'https://apis.madautomate.cloud/webhook/7bd92d1d-e4c3-482d-b102-014daf9c06ef',
      { action: 'getTables' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Parse response: array of objects with table names
    // Format: [{ "Tables_in_ff6da5_incolmotos_visora": "table_name" }, ...]
    const rawTables = Array.isArray(response.data) ? response.data : [];
    const tables = rawTables
      .map(obj => {
        const key = Object.keys(obj)[0];
        return obj[key];
      })
      .filter(Boolean);

    return tables;
  } catch (error) {
    console.warn('[emailService] Error fetching tables:', error?.message || error);
    return [];
  }
}

export async function getTableStructure(tableName) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.warn('[emailService] No token available for getTableStructure');
    return null;
  }

  try {
    const response = await axios.post(
      'https://apis.madautomate.cloud/webhook/7bd92d1d-e4c3-482d-b102-014daf9c06ef',
      { action: 'showTable', table: tableName },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('response.data', response.data);

    return normalizeTableStructurePayload(response.data);
  } catch (error) {
    console.warn('[emailService] Error fetching table structure:', error?.message || error);
    return null;
  }
}

export async function executeView(view) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.warn('[executeView] No token available for getTableStructure');
    return null;
  }

  try {
    const response = await axios.post(
      'https://apis.madautomate.cloud/webhook/7bd92d1d-e4c3-482d-b102-014daf9c06ef',
      { action: 'executeView', view: view },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.warn('[emailService] Error fetching table structure:', error?.message || error);
    return null;
  }
}
// ─── SEND ─────────────────────────────────────────────────────────────────────

/**
 * Build the payload for n8n and POST to webhook.
 * Each recipient gets the HTML with variables replaced.
 */
export async function sendCampaign({ campaign, template, recipients, scheduledAt, schedule, deliveryMode }) {
  const authStore = useAuthStore();
  const details = Array.isArray(authStore.user?.details) ? authStore.user.details : [];
  const postUrl = details.find(d => d.key === 'url_post_emails')?.value;
  const normalizedSchedule = normalizeSchedule(schedule);
  const resolvedScheduledAt = resolveScheduledAt(scheduledAt, normalizedSchedule);
  const resolvedDeliveryMode = resolveDeliveryMode(deliveryMode, resolvedScheduledAt, normalizedSchedule);

  // Validar límite de envíos
  const maxSends = getDetail('limit_shipping_emails');
  if (maxSends !== null) {
    const used = mockLimits.sends_used_current_month;
    const remaining = maxSends - used;
    if (recipients.length > remaining) {
      throw new Error(`Límite de envíos mensuales insuficiente. Podés enviar ${remaining} emails más este mes (límite: ${maxSends}).`);
    }
  }

  // Render HTML per recipient
  const renderedRecipients = recipients.map(r => {
    let html = template.html_content;
    const vars = r.variables || {};
    Object.entries(vars).forEach(([key, val]) => {
      html = html.replaceAll(`{{${key}}}`, val || '');
    });
    return {
      email: r.email,
      variables: vars,
      html
    };
  });

  const payload = {
    campaign_id: campaign.id || null,
    campaign_name: campaign.name,
    template_subject: template.subject,
    scheduled_at: resolvedScheduledAt,
    schedule: normalizedSchedule,
    delivery_mode: resolvedDeliveryMode,
    recipients: renderedRecipients
  };

  if (!postUrl) {
    console.warn('[emailService] URL_POST_EMAILS no configurada en el usuario');
  } else {
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Error al enviar campaña: ${res.status} ${res.statusText}`);
  }

  console.log('[emailService] Payload:', payload);

  // Update mock campaign status
  const idx = mockCampaigns.findIndex(c => c.id === campaign.id);
  if (idx !== -1) {
    mockCampaigns[idx].recipients_count = recipients.length;
    mockCampaigns[idx].status = resolvedScheduledAt ? 'scheduled' : 'sent';
    mockCampaigns[idx].sent_at = resolvedScheduledAt ? null : new Date().toISOString();
    mockCampaigns[idx].scheduled_at = resolvedScheduledAt;
    mockLimits.sends_used_current_month += recipients.length;
  }

  return { success: true, payload };
}

export { extractVariables };
