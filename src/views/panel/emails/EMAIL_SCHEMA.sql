-- ═══════════════════════════════════════════════════════════════
--  EMAIL CAMPAIGNS MODULE — MySQL Schema
--  Modulo: Campañas de Email Masivo
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. ACCOUNT EMAIL LIMITS ──────────────────────────────────
--  Una fila por cuenta. Configurada desde el back-end/admin.
--  Controla cuántos templates, campañas y envíos mensuales puede usar.

-- CREATE TABLE IF NOT EXISTS account_email_limits (
--  id                     INT           NOT NULL AUTO_INCREMENT,
-- account_id             INT           NOT NULL,
-- max_templates          INT           NOT NULL DEFAULT 10
--                         COMMENT 'Máximo de templates activos permitidos',
--  max_campaigns          INT           NOT NULL DEFAULT 5
-- COMMENT 'Máximo de campañas activas simultaneas',
-- max_sends_per_month    INT           NOT NULL DEFAULT 1000
-- COMMENT 'Envíos individuales permitidos por mes',
-- sends_used_current_month INT         NOT NULL DEFAULT 0,
-- billing_reset_day      TINYINT       NOT NULL DEFAULT 1
-- COMMENT 'Día del mes en que se resetea el contador',
-- updated_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ON UPDATE CURRENT_TIMESTAMP,
--  PRIMARY KEY (id),
-- UNIQUE KEY uq_account (account_id),
-- CONSTRAINT fk_ael_account FOREIGN KEY (account_id)
-- REFERENCES accounts (id) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 2. EMAIL TEMPLATES ───────────────────────────────────────
--  Templates HTML reutilizables con variables dinámicas {{variable}}.

CREATE TABLE IF NOT EXISTS email_templates (
  id           INT           NOT NULL AUTO_INCREMENT,
  account_id   INT           NOT NULL,
  name         VARCHAR(255)  NOT NULL
               COMMENT 'Nombre interno para identificar el template',
  subject      VARCHAR(500)  NOT NULL
               COMMENT 'Asunto del email. Puede contener variables: {{nombre}}',
  html_content LONGTEXT      NOT NULL
               COMMENT 'HTML completo del email con variables {{var}}',
  variables    JSON          NULL
               COMMENT 'Array de variables detectadas. Ej: ["nombre","empresa"]',
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_et_account (account_id),
  CONSTRAINT fk_et_account FOREIGN KEY (account_id)
    REFERENCES accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 3. EMAIL CAMPAIGNS ───────────────────────────────────────
--  Cada campaña = un envío masivo con un template y un conjunto
--  de destinatarios. Puede ser inmediata o programada.

CREATE TABLE IF NOT EXISTS email_campaigns (
  id               INT           NOT NULL AUTO_INCREMENT,
  account_id       INT           NOT NULL,
  name             VARCHAR(255)  NOT NULL
                   COMMENT 'Nombre identificatorio de la campaña',
  description      TEXT          NULL,
  template_id      INT           NULL
                   COMMENT 'Template usado. NULL si fue eliminado.',
  status           ENUM(
                     'draft',       -- borrador, en construcción
                     'scheduled',   -- programada para envío futuro
                     'sending',     -- enviando en este momento
                     'sent',        -- enviada exitosamente
                     'closed'       -- cerrada manualmente
                   ) NOT NULL DEFAULT 'draft',
  source_type      ENUM('db', 'excel') NOT NULL DEFAULT 'db'
                   COMMENT 'db = clientes de la BD, excel = importado',
  recipients_count INT           NOT NULL DEFAULT 0
                   COMMENT 'Total de destinatarios al momento del envío',
  webhook_url      VARCHAR(1000) NULL
                   COMMENT 'URL del webhook n8n. NULL = usar global de cuenta',
  scheduled_at     DATETIME      NULL
                   COMMENT 'Fecha/hora programada para el envío',
  sent_at          DATETIME      NULL
                   COMMENT 'Fecha/hora real del envío',
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ec_account   (account_id),
  KEY idx_ec_status    (status),
  KEY idx_ec_scheduled (scheduled_at),
  CONSTRAINT fk_ec_account  FOREIGN KEY (account_id)
    REFERENCES accounts (id) ON DELETE CASCADE,
  CONSTRAINT fk_ec_template FOREIGN KEY (template_id)
    REFERENCES email_templates (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 4. CAMPAIGN RECIPIENTS SNAPSHOT ─────────────────────────
--  Una sola fila por campaña. Guarda el snapshot completo de
--  destinatarios como JSON — exactamente como se despachó a n8n.
--
--  Diseño intencionalmente desnormalizado:
--    • La tabla email_campaigns queda liviana para listados/filtros.
--    • Los destinatarios se cargan solo cuando se consultan.
--    • MySQL JSON soporta sin problema listas de miles de contactos
--      (10k destinatarios ≈ 500 KB — muy por debajo del límite).
--    • El snapshot es inmutable: refleja exactamente quién estaba
--      en la lista al momento del envío (audit trail).
--
--  Si en el futuro necesitás tracking por destinatario (bounces,
--  aperturas, etc.) podés agregar una tabla campaign_delivery_events
--  separada y alimentarla desde n8n via webhook de retorno.
--
--  Estructura del JSON en `recipients`:
--  [
--    { "email": "juan@gmail.com", "variables": { "nombre": "Juan", "empresa": "ACME" } },
--    { "email": "ana@outlook.com", "variables": { "nombre": "Ana",  "empresa": "XYZ"  } },
--    ...
--  ]

CREATE TABLE IF NOT EXISTS campaign_recipients_snapshot (
  id           INT           NOT NULL AUTO_INCREMENT,
  campaign_id  INT           NOT NULL,
  recipients   JSON          NOT NULL
               COMMENT 'Snapshot completo: [{email, variables}] al momento del envío',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_crs_campaign (campaign_id),
  CONSTRAINT fk_crs_campaign FOREIGN KEY (campaign_id)
    REFERENCES email_campaigns (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 5. CAMPAIGN SCHEDULES ────────────────────────────────────
--  Tabla para el proceso de envío programado (cron job / n8n trigger).
--  El cron job lee aquí qué campañas están pendientes de despachar.

CREATE TABLE IF NOT EXISTS campaign_schedules (
  id              INT      NOT NULL AUTO_INCREMENT,
  campaign_id     INT      NOT NULL,
  scheduled_at    DATETIME NOT NULL,
  timezone        VARCHAR(60) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  is_processed    TINYINT(1)  NOT NULL DEFAULT 0,
  processed_at    DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cs_campaign (campaign_id),
  KEY idx_cs_pending (is_processed, scheduled_at),
  CONSTRAINT fk_cs_campaign FOREIGN KEY (campaign_id)
    REFERENCES email_campaigns (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ═══════════════════════════════════════════════════════════════
--  DATOS DE EJEMPLO (seed)
-- ═══════════════════════════════════════════════════════════════

-- Límites para cuenta demo (account_id = 1)
INSERT IGNORE INTO account_email_limits
  (account_id, max_templates, max_campaigns, max_sends_per_month, billing_reset_day)
VALUES
  (1, 10, 5, 1000, 1);

-- Template de bienvenida
INSERT IGNORE INTO email_templates (id, account_id, name, subject, html_content, variables)
VALUES (
  1, 1,
  'Bienvenida',
  'Bienvenido/a, {{nombre}}!',
  '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden"><div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px 30px;text-align:center"><h1 style="color:#fff;margin:0">Bienvenido/a, {{nombre}}!</h1></div><div style="padding:30px"><p>Hola <strong>{{nombre}}</strong>, gracias por unirte a <strong>{{empresa}}</strong>.</p></div></div></body></html>',
  JSON_ARRAY('nombre', 'empresa')
);


-- ═══════════════════════════════════════════════════════════════
--  NOTAS DE INTEGRACIÓN CON n8n
-- ═══════════════════════════════════════════════════════════════
--
--  PAYLOAD que el front envía al webhook n8n:
--  POST {VITE_N8N_WEBHOOK_URL}
--  Content-Type: application/json
--
--  {
--    "campaign_id": 1,
--    "campaign_name": "Lanzamiento Mayo 2025",
--    "template_subject": "Bienvenido/a, {{nombre}}!",
--    "scheduled_at": null,                   -- null = enviar ahora
--    "recipients": [
--      {
--        "email": "juan@gmail.com",
--        "variables": { "nombre": "Juan", "empresa": "ACME" },
--        "html": "<h1>Bienvenido/a, Juan!</h1>..."
--      },
--      ...
--    ]
--  }
--
--  En n8n: Webhook → Split In Batches → Send Email (SMTP/SendGrid/etc.)
--
--  VARIABLES DE ENTORNO requeridas en .env:
--    VITE_N8N_WEBHOOK_URL=https://n8n.midominio.com/webhook/email-campaign
--
-- ═══════════════════════════════════════════════════════════════
