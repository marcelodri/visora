<template>
  <div class="container-fluid">

    <div class="header-section mb-5">
      <h2 class="main-title">Bienvenido a <span class="brand"><strong>Rewards</strong></span></h2>
      <p class="subtitle">Programa de puntos por compras para tus clientes</p>
    </div>

    <!-- Concepto principal -->
    <div class="card concept-card mb-4">
      <div class="card-header">
        <i class="bi bi-lightbulb-fill me-2"></i>
        <span>¿Cómo funciona el módulo?</span>
      </div>
      <div class="card-body p-4">
        <p class="intro-text mb-4">
          <strong>Rewards</strong> te permite acumular y gestionar puntos para tus clientes en función de sus compras.
          Cada venta genera puntos automáticamente según la regla activa que hayas configurado.
          Los clientes se crean solos al importar ventas, y podés consultar su historial en cualquier momento.
        </p>

        <div class="flow-diagram">
          <div class="flow-step">
            <div class="flow-number">1</div>
            <div class="flow-content">
              <h6>Crear una Regla</h6>
              <p>Definí cómo se calculan los puntos por compra</p>
            </div>
          </div>
          <div class="flow-arrow"><i class="bi bi-arrow-right"></i></div>
          <div class="flow-step">
            <div class="flow-number">2</div>
            <div class="flow-content">
              <h6>Importar Ventas</h6>
              <p>Subí un Excel y mapeá las columnas</p>
            </div>
          </div>
          <div class="flow-arrow"><i class="bi bi-arrow-right"></i></div>
          <div class="flow-step">
            <div class="flow-number">3</div>
            <div class="flow-content">
              <h6>Puntos Generados</h6>
              <p>Cada cliente acumula puntos automáticamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Guía de secciones -->
    <div class="card guide-card mb-4">
      <div class="card-header">
        <i class="bi bi-book-fill me-2"></i>
        <span>Secciones del módulo</span>
      </div>
      <div class="card-body p-4">
        <div class="guide-list">

          <div class="guide-item">
            <div class="guide-icon">⚡</div>
            <div class="guide-content">
              <h6>Reglas de Puntos</h6>
              <p>
                Configurá la regla activa que determina cuántos puntos genera cada venta.
                Solo puede haber <strong>una regla activa</strong> a la vez. Podés elegir entre dos modos:
              </p>
              <ul class="guide-sublist">
                <li><strong>Porcentaje:</strong> un % del importe de la compra se convierte en puntos (ej: 5% de $2.000 → 100 puntos).</li>
                <li><strong>Puntos fijos:</strong> se asigna una cantidad fija de puntos por venta, con condiciones opcionales (ej: compras mayores a $1.000).</li>
              </ul>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">📤</div>
            <div class="guide-content">
              <h6>Importar Ventas</h6>
              <p>
                Subí un archivo Excel o CSV con tus ventas. Mapeá las columnas del archivo a los campos del sistema
                (documento, nombre, importe, fecha, etc.). Al importar:
              </p>
              <ul class="guide-sublist">
                <li>Si el cliente <strong>ya existe</strong>, se suman los puntos a su cuenta.</li>
                <li>Si el cliente <strong>no existe</strong>, se crea automáticamente con sus datos.</li>
              </ul>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">👥</div>
            <div class="guide-content">
              <h6>Clientes</h6>
              <p>
                Visualizá todos los clientes con sus datos personales, puntos acumulados, cantidad de ventas y
                total facturado. Podés buscarlos por documento, nombre o email, crear nuevos manualmente o editarlos.
              </p>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">📋</div>
            <div class="guide-content">
              <h6>Listado de Ventas</h6>
              <p>
                Consultá el historial completo de todas las importaciones realizadas: fechas, cantidades, detalle
                por ingesta. También podés <strong>eliminar ingestas</strong> individuales o
                <strong>reiniciar todo</strong> el módulo (borra todas las ingestas y puntos generados).
              </p>
            </div>
          </div>

          <div class="guide-item">
            <div class="guide-icon">🔄</div>
            <div class="guide-content">
              <h6>Migrar Clientes</h6>
              <p>
                Importá una base de clientes desde un Excel sin necesidad de ventas. Útil para cargar tu base
                existente al inicio. Mapeá columnas como documento, nombre, apellido, teléfono, email, dirección,
                fecha de nacimiento, género y código de vendedor.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="card tips-card mb-4">
      <div class="card-header">
        <i class="bi bi-info-circle-fill me-2"></i>
        <span>Tips importantes</span>
      </div>
      <div class="card-body p-4">
        <div class="tips-grid">
          <div class="tip-item">
            <i class="bi bi-check-circle-fill text-success me-2"></i>
            Creá siempre la <strong>regla activa antes</strong> de importar ventas.
          </div>
          <div class="tip-item">
            <i class="bi bi-check-circle-fill text-success me-2"></i>
            Solo puede existir <strong>una regla activa</strong> a la vez. Cambiá la regla cuando lo necesites.
          </div>
          <div class="tip-item">
            <i class="bi bi-check-circle-fill text-success me-2"></i>
            Los clientes se crean automáticamente al <strong>importar ventas</strong>; no hace falta cargarlos antes.
          </div>
          <div class="tip-item">
            <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
            El <strong>reinicio total</strong> borra todas las ingestas e historial de puntos. Usalo con cuidado.
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'RewardsStartView'
};
</script>

<style scoped>
.start-container {
  max-width: 860px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.4rem;
}

.brand {
  color: #3939ff;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Cards */
.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #3939ff 0%, #5757ff 100%);
  color: white;
  padding: 0.9rem 1.4rem;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  border: none;
}

.intro-text {
  color: #374151;
  font-size: 0.97rem;
  line-height: 1.7;
}

/* Flow diagram */
.flow-diagram {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  flex: 1;
  min-width: 160px;
}

.flow-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3939ff;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-content h6 {
  margin: 0 0 0.2rem;
  font-weight: 700;
  color: #1f2937;
  font-size: 0.9rem;
}

.flow-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.82rem;
  line-height: 1.4;
}

.flow-arrow {
  color: #9ca3af;
  font-size: 1.3rem;
  flex-shrink: 0;
}

/* Guide list */
.guide-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.guide-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.guide-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.guide-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  width: 40px;
  text-align: center;
}

.guide-content h6 {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.3rem;
  font-size: 0.97rem;
}

.guide-content p {
  color: #4b5563;
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 0.4rem;
}

.guide-sublist {
  color: #4b5563;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0;
  padding-left: 1.2rem;
}

/* Tips */
.tips-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 640px) {
  .flow-diagram {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }

  .flow-step {
    width: 100%;
  }
}
</style>
