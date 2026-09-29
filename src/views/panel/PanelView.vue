<template>
  <main class="home-page">
    <section class="hero-card" aria-labelledby="home-title">
      <div class="hero-card__grid" aria-hidden="true"></div>
      <div class="hero-card__glow hero-card__glow--one" aria-hidden="true"></div>
      <div class="hero-card__glow hero-card__glow--two" aria-hidden="true"></div>

      <div class="hero-card__content">
        <div class="hero-copy">
          <div class="hero-eyebrow">
            <span class="hero-eyebrow__dot" aria-hidden="true"></span>
            {{ $t('home.eyebrow') }}
          </div>

          <h1 id="home-title" class="hero-title">
            {{ $t('home.title') }}
          </h1>

          <p class="hero-description">
            {{ $t('home.subtitle') }}
          </p>

          <div class="hero-actions">
            <button type="button" class="home-button home-button--primary" @click="scrollToModules">
              <span>{{ $t('home.actions.explore') }}</span>
              <i class="bi bi-arrow-down-short" aria-hidden="true"></i>
            </button>

            <button type="button" class="home-button home-button--secondary" @click="scrollToProcess">
              <i class="bi bi-play-circle" aria-hidden="true"></i>
              <span>{{ $t('home.actions.how_it_works') }}</span>
            </button>
          </div>

          <ul class="hero-benefits" aria-label="Beneficios principales">
            <li>
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <span>{{ $t('home.benefits.modular') }}</span>
            </li>
            <li>
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <span>{{ $t('home.benefits.integrated') }}</span>
            </li>
            <li>
              <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
              <span>{{ $t('home.benefits.simple') }}</span>
            </li>
          </ul>
        </div>

        <div class="platform-preview" aria-hidden="true">
          <div class="platform-preview__halo"></div>

          <div class="dashboard-window">
            <div class="dashboard-window__header">
              <div class="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div class="window-title">
                <span class="window-title__logo">V</span>
                <span>{{ $t('home.preview.title') }}</span>
              </div>

              <span class="window-status">
                <span class="window-status__dot"></span>
                {{ $t('home.preview.status') }}
              </span>
            </div>

            <div class="dashboard-window__body">
              <div class="metric-grid">
                <article class="metric-card metric-card--primary">
                  <span class="metric-card__icon">
                    <i class="bi bi-people" aria-hidden="true"></i>
                  </span>
                  <div>
                    <small>{{ $t('home.preview.leads') }}</small>
                    <strong>1.248</strong>
                  </div>
                  <span class="metric-card__trend">+18%</span>
                </article>

                <article class="metric-card">
                  <span class="metric-card__icon">
                    <i class="bi bi-calendar-check" aria-hidden="true"></i>
                  </span>
                  <div>
                    <small>{{ $t('home.preview.events') }}</small>
                    <strong>24</strong>
                  </div>
                </article>

                <article class="metric-card">
                  <span class="metric-card__icon">
                    <i class="bi bi-lightning-charge" aria-hidden="true"></i>
                  </span>
                  <div>
                    <small>{{ $t('home.preview.automations') }}</small>
                    <strong>16</strong>
                  </div>
                </article>
              </div>

              <div class="dashboard-main">
                <article class="chart-card">
                  <div class="chart-card__header">
                    <div>
                      <small>{{ $t('home.preview.performance') }}</small>
                      <strong>{{ $t('home.preview.last_days') }}</strong>
                    </div>
                    <span class="chart-card__badge">+27%</span>
                  </div>

                  <div class="bar-chart">
                    <span style="--bar-height: 36%"></span>
                    <span style="--bar-height: 54%"></span>
                    <span style="--bar-height: 46%"></span>
                    <span style="--bar-height: 70%"></span>
                    <span style="--bar-height: 61%"></span>
                    <span style="--bar-height: 88%"></span>
                    <span style="--bar-height: 76%"></span>
                  </div>

                  <div class="bar-chart__labels">
                    <span>L</span>
                    <span>M</span>
                    <span>M</span>
                    <span>J</span>
                    <span>V</span>
                    <span>S</span>
                    <span>D</span>
                  </div>
                </article>

                <article class="activity-card">
                  <div class="activity-card__header">
                    <small>{{ $t('home.preview.activity') }}</small>
                    <span></span>
                  </div>

                  <div class="activity-list">
                    <div class="activity-item">
                      <span class="activity-item__icon activity-item__icon--blue">
                        <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                      </span>
                      <div>
                        <strong>{{ $t('home.preview.new_form') }}</strong>
                        <small>{{ $t('home.preview.just_now') }}</small>
                      </div>
                    </div>

                    <div class="activity-item">
                      <span class="activity-item__icon activity-item__icon--green">
                        <i class="bi bi-stars" aria-hidden="true"></i>
                      </span>
                      <div>
                        <strong>{{ $t('home.preview.agent_query') }}</strong>
                        <small>{{ $t('home.preview.minutes_ago') }}</small>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="floating-chip floating-chip--top">
            <span class="floating-chip__icon">
              <i class="bi bi-stars" aria-hidden="true"></i>
            </span>
            <div>
              <strong>{{ $t('home.preview.ai_ready') }}</strong>
              <small>{{ $t('home.preview.ai_description') }}</small>
            </div>
          </div>

          <div class="floating-chip floating-chip--bottom">
            <span class="floating-chip__pulse"></span>
            <div>
              <strong>{{ $t('home.preview.synchronized') }}</strong>
              <small>{{ $t('home.preview.updated_now') }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-stats" aria-label="Características de la plataforma">
        <article>
          <span class="hero-stats__icon">
            <i class="bi bi-grid-1x2" aria-hidden="true"></i>
          </span>
          <div>
            <strong>{{ $t('home.stats.modules.title') }}</strong>
            <span>{{ $t('home.stats.modules.text') }}</span>
          </div>
        </article>

        <article>
          <span class="hero-stats__icon">
            <i class="bi bi-diagram-3" aria-hidden="true"></i>
          </span>
          <div>
            <strong>{{ $t('home.stats.data.title') }}</strong>
            <span>{{ $t('home.stats.data.text') }}</span>
          </div>
        </article>

        <article>
          <span class="hero-stats__icon">
            <i class="bi bi-graph-up-arrow" aria-hidden="true"></i>
          </span>
          <div>
            <strong>{{ $t('home.stats.scale.title') }}</strong>
            <span>{{ $t('home.stats.scale.text') }}</span>
          </div>
        </article>
      </div>
    </section>

    <section ref="modulesSection" class="home-section modules-section" aria-labelledby="modules-title">
      <header class="section-heading">
        <div>
          <span class="section-heading__eyebrow">{{ $t('home.modules_section.eyebrow') }}</span>
          <h2 id="modules-title">{{ $t('home.modules_section.title') }}</h2>
        </div>
        <p>{{ $t('home.modules_section.subtitle') }}</p>
      </header>

      <div class="module-grid">
        <article v-for="module in modules" :key="module.key" class="module-card">
          <span class="module-card__icon">
            <i :class="['bi', module.icon]" aria-hidden="true"></i>
          </span>

          <div class="module-card__content">
            <h3>{{ module.title }}</h3>
            <p>{{ module.description }}</p>
          </div>

          <span class="module-card__number">{{ module.number }}</span>
        </article>
      </div>
    </section>

    <section ref="processSection" class="home-section process-section" aria-labelledby="process-title">
      <div class="process-intro">
        <span class="section-heading__eyebrow">{{ $t('home.process.eyebrow') }}</span>
        <h2 id="process-title">{{ $t('home.process.title') }}</h2>
        <p>{{ $t('home.process.subtitle') }}</p>

        <div class="process-note">
          <i class="bi bi-info-circle" aria-hidden="true"></i>
          <span>{{ $t('home.process.note') }}</span>
        </div>
      </div>

      <ol class="process-steps">
        <li>
          <span class="process-steps__number">01</span>
          <div>
            <strong>{{ $t('home.process.steps.first.title') }}</strong>
            <p>{{ $t('home.process.steps.first.text') }}</p>
          </div>
        </li>

        <li>
          <span class="process-steps__number">02</span>
          <div>
            <strong>{{ $t('home.process.steps.second.title') }}</strong>
            <p>{{ $t('home.process.steps.second.text') }}</p>
          </div>
        </li>

        <li>
          <span class="process-steps__number">03</span>
          <div>
            <strong>{{ $t('home.process.steps.third.title') }}</strong>
            <p>{{ $t('home.process.steps.third.text') }}</p>
          </div>
        </li>
      </ol>
    </section>
  </main>
</template>

<script>
export default {
  name: 'HomeView',

  computed: {
    modules() {
      return [
        {
          key: 'capture',
          number: '01',
          icon: 'bi-window-stack',
          title: this.$t('home.modules.capture.title'),
          description: this.$t('home.modules.capture.text'),
        },
        {
          key: 'events',
          number: '02',
          icon: 'bi-calendar-event',
          title: this.$t('home.modules.events.title'),
          description: this.$t('home.modules.events.text'),
        },
        {
          key: 'rewards',
          number: '03',
          icon: 'bi-gift',
          title: this.$t('home.modules.rewards.title'),
          description: this.$t('home.modules.rewards.text'),
        },
        {
          key: 'data',
          number: '04',
          icon: 'bi-stars',
          title: this.$t('home.modules.data.title'),
          description: this.$t('home.modules.data.text'),
        },
      ];
    },
  },

  methods: {
    scrollToModules() {
      this.scrollToSection(this.$refs.modulesSection);
    },

    scrollToProcess() {
      this.scrollToSection(this.$refs.processSection);
    },

    scrollToSection(element) {
      if (!element) return;

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      element.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
  },
};
</script>

<style scoped>
.home-page {
  --home-primary: #007bff;
  --home-primary-dark: #0056b3;
  --home-primary-soft: #eaf4ff;
  --home-ink: #172033;
  --home-text: #526078;
  --home-line: #e4eaf2;
  --home-surface: #ffffff;
  --home-page-bg: #f5f8fc;

  width: 100%;
  min-height: calc(
    100dvh - var(--app-header-height, 72px) - var(--app-footer-height, 72px)
  );
  display: flex;
  flex-direction: column;
  gap: clamp(22px, 3vw, 34px);
  padding: clamp(14px, 2.4vw, 30px);
  color: var(--home-ink);
  background:
    radial-gradient(circle at 4% 0%, rgba(0, 123, 255, 0.08), transparent 28%),
    var(--home-page-bg);
}

.hero-card,
.home-section {
  width: min(100%, 1480px);
  margin-inline: auto;
}

.hero-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid rgba(0, 123, 255, 0.12);
  border-radius: clamp(20px, 3vw, 32px);
  background:
    linear-gradient(128deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 250, 255, 0.96) 55%, rgba(234, 244, 255, 0.96) 100%);
  box-shadow:
    0 24px 60px rgba(28, 63, 107, 0.1),
    0 4px 14px rgba(28, 63, 107, 0.06);
}

.hero-card__grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  opacity: 0.38;
  background-image:
    linear-gradient(rgba(0, 123, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 123, 255, 0.05) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(to right, transparent 0%, #000 46%, #000 100%);
}

.hero-card__glow {
  position: absolute;
  z-index: -2;
  border-radius: 999px;
  filter: blur(4px);
  pointer-events: none;
}

.hero-card__glow--one {
  width: 430px;
  height: 430px;
  top: -220px;
  right: -90px;
  background: rgba(0, 123, 255, 0.16);
}

.hero-card__glow--two {
  width: 260px;
  height: 260px;
  right: 34%;
  bottom: -170px;
  background: rgba(69, 155, 255, 0.13);
}

.hero-card__content {
  min-height: clamp(520px, 63vh, 680px);
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(520px, 1.08fr);
  align-items: center;
  gap: clamp(34px, 5vw, 84px);
  padding: clamp(38px, 6vw, 88px);
  padding-bottom: clamp(36px, 5vw, 62px);
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 690px;
}

.hero-eyebrow,
.section-heading__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--home-primary-dark);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-eyebrow {
  margin-bottom: 20px;
  padding: 8px 13px;
  border: 1px solid rgba(0, 123, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 7px 20px rgba(0, 86, 179, 0.06);
  backdrop-filter: blur(10px);
}

.hero-eyebrow__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--home-primary);
  box-shadow: 0 0 0 5px rgba(0, 123, 255, 0.12);
}

.hero-title {
  max-width: 720px;
  margin: 0;
  color: var(--home-ink);
  font-size: clamp(2.35rem, 4.7vw, 5rem);
  font-weight: 800;
  line-height: 0.99;
  letter-spacing: -0.055em;
  text-wrap: balance;
}

.hero-title::after {
  content: '';
  display: block;
  width: 78px;
  height: 5px;
  margin-top: 24px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--home-primary), #58adff);
}

.hero-description {
  max-width: 650px;
  margin: 26px 0 0;
  color: var(--home-text);
  font-size: clamp(1.02rem, 1.35vw, 1.24rem);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.home-button {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 19px;
  border-radius: 14px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease;
}

.home-button:hover {
  transform: translateY(-2px);
}

.home-button:focus-visible {
  outline: 3px solid rgba(0, 123, 255, 0.24);
  outline-offset: 3px;
}

.home-button--primary {
  color: #fff;
  background: linear-gradient(135deg, var(--home-primary), var(--home-primary-dark));
  box-shadow: 0 12px 24px rgba(0, 123, 255, 0.22);
}

.home-button--primary:hover {
  box-shadow: 0 16px 30px rgba(0, 123, 255, 0.28);
}

.home-button--secondary {
  color: var(--home-ink);
  border-color: rgba(23, 32, 51, 0.12);
  background: rgba(255, 255, 255, 0.75);
}

.home-button--secondary:hover {
  border-color: rgba(0, 123, 255, 0.24);
  background: #fff;
}

.hero-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 22px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.hero-benefits li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #445269;
  font-size: 0.88rem;
  font-weight: 650;
}

.hero-benefits i {
  color: var(--home-primary);
}

.platform-preview {
  position: relative;
  min-width: 0;
  padding: 42px 18px 36px 34px;
  perspective: 1100px;
}

.platform-preview__halo {
  position: absolute;
  inset: 12% 7% 6%;
  z-index: -1;
  border-radius: 50%;
  background: rgba(0, 123, 255, 0.15);
  filter: blur(42px);
}

.dashboard-window {
  position: relative;
  width: min(100%, 720px);
  margin-left: auto;
  overflow: hidden;
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 23px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 35px 80px rgba(33, 71, 120, 0.18),
    0 10px 26px rgba(33, 71, 120, 0.09);
  transform: rotateY(-5deg) rotateX(1.5deg);
  transform-origin: center;
}

.dashboard-window__header {
  min-height: 62px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 15px;
  padding: 13px 18px;
  border-bottom: 1px solid var(--home-line);
  background: rgba(252, 253, 255, 0.96);
}

.window-dots {
  display: flex;
  gap: 6px;
}

.window-dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #d7deea;
}

.window-dots span:first-child {
  background: #ff8f87;
}

.window-dots span:nth-child(2) {
  background: #ffc85f;
}

.window-dots span:last-child {
  background: #60d394;
}

.window-title {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #253149;
  font-size: 0.8rem;
  font-weight: 800;
}

.window-title__logo {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(145deg, var(--home-primary), var(--home-primary-dark));
  box-shadow: 0 7px 14px rgba(0, 123, 255, 0.2);
}

.window-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  color: #2b7254;
  background: #ebf8f1;
  font-size: 0.66rem;
  font-weight: 750;
}

.window-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2eaf72;
  box-shadow: 0 0 0 4px rgba(46, 175, 114, 0.12);
}

.dashboard-window__body {
  padding: clamp(16px, 2.5vw, 24px);
  background: #f7f9fc;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 11px;
}

.metric-card {
  min-width: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 9px;
  padding: 13px;
  border: 1px solid #e6ebf2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(32, 58, 91, 0.04);
}

.metric-card--primary {
  border-color: rgba(0, 123, 255, 0.19);
  background: linear-gradient(145deg, #ffffff, #f0f7ff);
}

.metric-card__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--home-primary);
  background: var(--home-primary-soft);
}

.metric-card div {
  min-width: 0;
}

.metric-card small,
.chart-card small,
.activity-card small {
  display: block;
  overflow: hidden;
  color: #7b879b;
  font-size: 0.62rem;
  font-weight: 650;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.metric-card strong {
  display: block;
  margin-top: 2px;
  color: #223049;
  font-size: 1rem;
}

.metric-card__trend {
  color: #27865c;
  font-size: 0.62rem;
  font-weight: 800;
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(150px, 0.65fr);
  gap: 12px;
  margin-top: 12px;
}

.chart-card,
.activity-card {
  min-width: 0;
  padding: 15px;
  border: 1px solid #e6ebf2;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(32, 58, 91, 0.04);
}

.chart-card__header,
.activity-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chart-card__header strong {
  display: block;
  margin-top: 3px;
  color: #26334a;
  font-size: 0.78rem;
}

.chart-card__badge {
  padding: 5px 8px;
  border-radius: 999px;
  color: #237d56;
  background: #ecf8f2;
  font-size: 0.58rem;
  font-weight: 800;
}

.bar-chart {
  height: 116px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: end;
  gap: 8px;
  margin-top: 16px;
  padding: 0 5px;
  border-bottom: 1px solid #edf1f6;
  background-image: linear-gradient(#f0f3f8 1px, transparent 1px);
  background-size: 100% 29px;
}

.bar-chart span {
  height: var(--bar-height);
  min-height: 12px;
  border-radius: 6px 6px 2px 2px;
  background: linear-gradient(180deg, #50a9ff, var(--home-primary));
  box-shadow: 0 6px 12px rgba(0, 123, 255, 0.14);
}

.bar-chart span:nth-child(2n) {
  background: linear-gradient(180deg, #86c5ff, #3d99f4);
}

.bar-chart__labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 7px;
  color: #9aa4b5;
  font-size: 0.52rem;
  text-align: center;
}

.activity-card__header > span {
  width: 22px;
  height: 7px;
  margin-top: 3px;
  border-radius: 999px;
  background: #e9eef5;
}

.activity-list {
  display: grid;
  gap: 14px;
  margin-top: 17px;
}

.activity-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 9px;
}

.activity-item__icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  font-size: 0.72rem;
}

.activity-item__icon--blue {
  color: #0878e8;
  background: #eaf4ff;
}

.activity-item__icon--green {
  color: #23855a;
  background: #eaf8f1;
}

.activity-item div {
  min-width: 0;
}

.activity-item strong {
  display: block;
  overflow: hidden;
  color: #344159;
  font-size: 0.65rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.activity-item small {
  margin-top: 3px;
  font-size: 0.55rem;
}

.floating-chip {
  position: absolute;
  z-index: 4;
  min-width: 200px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 34px rgba(28, 63, 107, 0.15);
  backdrop-filter: blur(14px);
}

.floating-chip--top {
  top: 0;
  right: -8px;
}

.floating-chip--bottom {
  left: 4px;
  bottom: 0;
}

.floating-chip__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(145deg, var(--home-primary), var(--home-primary-dark));
}

.floating-chip__pulse {
  width: 12px;
  height: 12px;
  margin: 11px;
  border-radius: 50%;
  background: #2eb572;
  box-shadow: 0 0 0 7px rgba(46, 181, 114, 0.12);
}

.floating-chip strong,
.floating-chip small {
  display: block;
}

.floating-chip strong {
  color: #26344c;
  font-size: 0.72rem;
}

.floating-chip small {
  margin-top: 2px;
  color: #7b879b;
  font-size: 0.6rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid rgba(0, 123, 255, 0.11);
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(12px);
}

.hero-stats article {
  min-width: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 13px;
  padding: 20px clamp(20px, 3vw, 38px);
}

.hero-stats article + article {
  border-left: 1px solid rgba(0, 123, 255, 0.11);
}

.hero-stats__icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: var(--home-primary);
  background: var(--home-primary-soft);
}

.hero-stats strong,
.hero-stats span {
  display: block;
}

.hero-stats strong {
  color: #26344c;
  font-size: 0.88rem;
}

.hero-stats article div > span {
  margin-top: 3px;
  color: #738097;
  font-size: 0.74rem;
  line-height: 1.35;
}

.home-section {
  scroll-margin-top: calc(var(--app-header-height, 72px) + 18px);
  padding: clamp(26px, 4vw, 54px);
  border: 1px solid var(--home-line);
  border-radius: clamp(20px, 3vw, 28px);
  background: var(--home-surface);
  box-shadow: 0 14px 38px rgba(28, 63, 107, 0.065);
}

.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(300px, 0.7fr);
  align-items: end;
  gap: 36px;
}

.section-heading h2,
.process-intro h2 {
  margin: 10px 0 0;
  color: var(--home-ink);
  font-size: clamp(1.85rem, 3vw, 3rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.section-heading > p,
.process-intro > p {
  margin: 0;
  color: var(--home-text);
  font-size: 1rem;
  line-height: 1.7;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 34px;
}

.module-card {
  position: relative;
  min-height: 235px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border: 1px solid var(--home-line);
  border-radius: 19px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(249, 251, 254, 0.98));
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.module-card::before {
  content: '';
  position: absolute;
  width: 130px;
  height: 130px;
  right: -68px;
  bottom: -70px;
  border-radius: 50%;
  background: rgba(0, 123, 255, 0.06);
  transition: transform 220ms ease;
}

.module-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 123, 255, 0.2);
  box-shadow: 0 17px 34px rgba(28, 63, 107, 0.1);
}

.module-card:hover::before {
  transform: scale(1.3);
}

.module-card__icon {
  width: 49px;
  height: 49px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(145deg, var(--home-primary), var(--home-primary-dark));
  box-shadow: 0 10px 20px rgba(0, 123, 255, 0.19);
  font-size: 1.2rem;
}

.module-card__content {
  position: relative;
  z-index: 1;
}

.module-card h3 {
  margin: 0;
  color: #26344c;
  font-size: 1.08rem;
  font-weight: 800;
}

.module-card p {
  margin: 11px 0 0;
  color: #68768d;
  font-size: 0.91rem;
  line-height: 1.65;
}

.module-card__number {
  position: absolute;
  top: 20px;
  right: 20px;
  color: rgba(0, 86, 179, 0.14);
  font-size: 2.15rem;
  font-weight: 900;
  letter-spacing: -0.08em;
}

.process-section {
  display: grid;
  grid-template-columns: minmax(300px, 0.78fr) minmax(0, 1.22fr);
  align-items: center;
  gap: clamp(34px, 6vw, 90px);
  margin-bottom: clamp(8px, 2vw, 24px);
  background:
    radial-gradient(circle at 95% 0%, rgba(0, 123, 255, 0.08), transparent 30%),
    #fff;
}

.process-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 24px;
  padding: 14px 15px;
  border: 1px solid rgba(0, 123, 255, 0.14);
  border-radius: 13px;
  color: #496078;
  background: #f2f8ff;
  font-size: 0.85rem;
  line-height: 1.5;
}

.process-note i {
  margin-top: 1px;
  color: var(--home-primary);
}

.process-steps {
  display: grid;
  gap: 13px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.process-steps li {
  min-width: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: flex-start;
  gap: 18px;
  padding: 19px;
  border: 1px solid var(--home-line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 7px 20px rgba(28, 63, 107, 0.04);
}

.process-steps__number {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--home-primary-dark);
  background: var(--home-primary-soft);
  font-size: 0.75rem;
  font-weight: 900;
}

.process-steps strong {
  display: block;
  color: #29364d;
  font-size: 0.98rem;
}

.process-steps p {
  margin: 6px 0 0;
  color: #6d798d;
  font-size: 0.87rem;
  line-height: 1.55;
}

:global(body.dark) .home-page {
  --home-ink: #eef4ff;
  --home-text: #aebbd0;
  --home-line: rgba(255, 255, 255, 0.1);
  --home-surface: #151c28;
  --home-page-bg: #0f151f;
  --home-primary-soft: rgba(0, 123, 255, 0.15);

  background:
    radial-gradient(circle at 4% 0%, rgba(0, 123, 255, 0.12), transparent 30%),
    var(--home-page-bg);
}

:global(body.dark) .hero-card {
  border-color: rgba(84, 165, 255, 0.16);
  background: linear-gradient(130deg, #171f2c 0%, #111925 58%, #14253a 100%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
}

:global(body.dark) .hero-eyebrow,
:global(body.dark) .home-button--secondary,
:global(body.dark) .floating-chip {
  background: rgba(26, 35, 49, 0.86);
}

:global(body.dark) .home-button--secondary,
:global(body.dark) .hero-benefits li,
:global(body.dark) .floating-chip strong,
:global(body.dark) .hero-stats strong,
:global(body.dark) .module-card h3,
:global(body.dark) .process-steps strong {
  color: #e8effa;
}

:global(body.dark) .dashboard-window,
:global(body.dark) .metric-card,
:global(body.dark) .chart-card,
:global(body.dark) .activity-card,
:global(body.dark) .module-card,
:global(body.dark) .process-steps li {
  border-color: rgba(255, 255, 255, 0.09);
  background: #18212e;
}

:global(body.dark) .dashboard-window__header,
:global(body.dark) .dashboard-window__body {
  border-color: rgba(255, 255, 255, 0.08);
  background: #121a25;
}

:global(body.dark) .window-title,
:global(body.dark) .metric-card strong,
:global(body.dark) .chart-card__header strong,
:global(body.dark) .activity-item strong {
  color: #e7eef9;
}

:global(body.dark) .hero-stats {
  background: rgba(10, 17, 26, 0.42);
}

:global(body.dark) .process-section {
  background:
    radial-gradient(circle at 95% 0%, rgba(0, 123, 255, 0.12), transparent 30%),
    #151c28;
}

@media (max-width: 1180px) {
  .hero-card__content {
    grid-template-columns: minmax(0, 1fr) minmax(430px, 0.9fr);
    gap: 34px;
    padding-inline: clamp(30px, 4vw, 54px);
  }

  .platform-preview {
    padding-left: 10px;
  }

  .floating-chip--top {
    right: -12px;
  }

  .floating-chip--bottom {
    left: -12px;
  }

  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 940px) {
  .hero-card__content {
    min-height: auto;
    grid-template-columns: 1fr;
    padding-bottom: 52px;
  }

  .hero-copy {
    max-width: 760px;
  }

  .platform-preview {
    width: min(100%, 760px);
    margin-inline: auto;
    padding: 34px 24px;
  }

  .dashboard-window {
    margin-inline: auto;
    transform: none;
  }

  .hero-stats,
  .section-heading,
  .process-section {
    grid-template-columns: 1fr;
  }

  .hero-stats article + article {
    border-left: 0;
    border-top: 1px solid rgba(0, 123, 255, 0.11);
  }

  .section-heading {
    align-items: start;
    gap: 16px;
  }

  .section-heading > p {
    max-width: 760px;
  }

  .process-section {
    gap: 30px;
  }
}

@media (max-width: 680px) {
  .home-page {
    gap: 18px;
    padding: 10px;
  }

  .hero-card {
    border-radius: 20px;
  }

  .hero-card__content {
    gap: 18px;
    padding: 30px 20px 34px;
  }

  .hero-title {
    font-size: clamp(2.15rem, 12vw, 3.5rem);
    line-height: 1.01;
  }

  .hero-description {
    font-size: 0.98rem;
    line-height: 1.62;
  }

  .hero-actions,
  .home-button {
    width: 100%;
  }

  .hero-benefits {
    display: grid;
    gap: 10px;
  }

  .platform-preview {
    margin-top: 4px;
    padding: 22px 0 44px;
  }

  .dashboard-window__header {
    grid-template-columns: auto 1fr;
  }

  .window-status {
    display: none;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    grid-template-columns: auto 1fr auto;
  }

  .dashboard-main {
    grid-template-columns: 1fr;
  }

  .activity-card {
    display: none;
  }

  .floating-chip {
    min-width: 0;
    max-width: 82%;
  }

  .floating-chip--top {
    top: 4px;
    right: -7px;
  }

  .floating-chip--bottom {
    left: 8px;
    bottom: 0;
  }

  .hero-stats article {
    padding: 17px 20px;
  }

  .home-section {
    padding: 27px 20px;
    border-radius: 20px;
  }

  .module-grid {
    grid-template-columns: 1fr;
    margin-top: 25px;
  }

  .module-card {
    min-height: 0;
  }

  .process-steps li {
    gap: 13px;
    padding: 16px;
  }
}

@media (max-width: 410px) {
  .hero-eyebrow {
    font-size: 0.68rem;
  }

  .dashboard-window__body {
    padding: 12px;
  }

  .floating-chip--top {
    display: none;
  }

  .floating-chip--bottom {
    max-width: 92%;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
