<template>
  <div class="transparency-container">

    <!-- Hero -->
    <header class="hero-section">
      <div class="hero-badge">Chile · Política de Datos</div>
      <h1 class="page-title">Transparencia y <span class="accent">Origen</span></h1>
      <p class="page-subtitle">
        Nuestra política de acceso, veracidad y origen de la información pública.
      </p>
    </header>

    <!-- Intro -->
    <div class="intro-card">
      <div class="intro-icon">🔍</div>
      <p>
        En <strong>Expedientes C</strong>, nuestro compromiso es fortalecer la probidad y el acceso
        a la información pública. Esta plataforma consolida y democratiza el acceso a datos que son,
        por su naturaleza, de carácter público.
      </p>
    </div>

    <!-- Secciones -->
    <main class="content-body">

      <section class="info-card">
        <div class="section-header">
          <span class="section-number">01</span>
          <h2 class="section-title">Carácter Público de la Información</h2>
        </div>
        <p class="section-text">
          Toda la información contenida y visualizada en esta plataforma proviene
          <strong>exclusivamente de fuentes de acceso público</strong>. Esto incluye, pero no se limita a:
        </p>
        <ul class="source-list">
          <li>
            <span class="source-icon">⚖️</span>
            <div>
              <strong>Poder Judicial de Chile (PJUD)</strong>
              <span>Registros oficiales de causas, resoluciones y sentencias.</span>
            </div>
          </li>
          <li>
            <span class="source-icon">🏛️</span>
            <div>
              <strong>Congreso Nacional</strong>
              <span>Publicaciones de transparencia activa del Senado y la Cámara de Diputadas y Diputados.</span>
            </div>
          </li>
          <li>
            <span class="source-icon">📰</span>
            <div>
              <strong>Medios de comunicación nacionales</strong>
              <span>Cobertura pública acreditada de causas judiciales y antecedentes de interés nacional.</span>
            </div>
          </li>
          <li>
            <span class="source-icon">🔎</span>
            <div>
              <strong>Organismos contralores y autónomos</strong>
              <span>Documentación oficial de la Contraloría General, el INDH, el Ministerio Público y otros.</span>
            </div>
          </li>
        </ul>
      </section>

      <section class="info-card">
        <div class="section-header">
          <span class="section-number">02</span>
          <h2 class="section-title">Integridad y Veracidad</h2>
        </div>
        <p class="section-text">
          Expedientes C <strong>no genera información ni emite juicios de valor</strong>. Toda la data
          presentada ha sido recopilada de manera fidedigna, reflejando el estado de las causas según
          lo informado por los canales oficiales o reportajes periodísticos debidamente acreditados.
        </p>
        <div class="pillars-grid">
          <div class="pillar-card">
            <span class="pillar-icon">✅</span>
            <strong>Sin información clasificada</strong>
            <span>No accedemos a datos reservados ni a documentación restringida.</span>
          </div>
          <div class="pillar-card">
            <span class="pillar-icon">🔗</span>
            <strong>Trazabilidad total</strong>
            <span>Cada perfil indica su fuente original para que cualquier usuario pueda verificarla.</span>
          </div>
          <div class="pillar-card">
            <span class="pillar-icon">🚫</span>
            <strong>Sin distorsión</strong>
            <span>No existe información tergiversada; los hechos se presentan tal como fueron reportados.</span>
          </div>
        </div>
      </section>

      <section class="info-card">
        <div class="section-header">
          <span class="section-number">03</span>
          <h2 class="section-title">Marco Legal — Ley N° 20.285</h2>
        </div>
        <p class="section-text">
          Nuestra plataforma se rige bajo los principios establecidos en la
          <strong>Ley N° 20.285 sobre Acceso a la Información Pública</strong>, la cual establece
          que el acceso a la información de los organismos del Estado es un derecho ciudadano.
          Entendemos la transparencia como un pilar fundamental para:
        </p>
        <div class="legal-items">
          <div class="legal-item">
            <span class="legal-bullet">&#8594;</span>
            <span>Promover el <strong>control social</strong> sobre el actuar de las autoridades y actores públicos.</span>
          </div>
          <div class="legal-item">
            <span class="legal-bullet">&#8594;</span>
            <span>Facilitar la <strong>fiscalización ciudadana</strong> sobre la probidad en la administración de recursos y el ejercicio de cargos de representación.</span>
          </div>
          <div class="legal-item">
            <span class="legal-bullet">&#8594;</span>
            <span>Garantizar que el registro de autoridades e instituciones sea un ejercicio de <strong>puertas abiertas</strong>.</span>
          </div>
        </div>
        
        <a  href="https://www.bcn.cl/leychile/navegar?idNorma=276363" target="_blank" rel="noopener noreferrer" class="law-link">
          📄 Ver texto completo de la Ley N° 20.285
        </a>
      </section>

      <section class="info-card">
        <div class="section-header">
          <span class="section-number">04</span>
          <h2 class="section-title">Compromiso de Rectificación</h2>
        </div>
        <p class="section-text">
          Si usted considera que existe algún error en la carga de datos —siempre basándonos en
          registros oficiales—, estamos comprometidos a <strong>revisar y actualizar</strong> dicha
          información con la mayor celeridad. Nuestra intención es mantener un registro preciso y
          actualizado que sirva a la comunidad como una herramienta legítima de consulta.
        </p>
      </section>

    </main>

    <!-- Box reporte -->
    <div class="report-box">
      <div class="report-icon">⚠️</div>
      <h3 class="report-title">¿Encontraste un error o información desactualizada?</h3>
      <p class="report-text">
        La precisión es nuestro objetivo. Si detectas información que no refleja el estado actual
        de una causa o perfil, puedes reportarla directamente. Revisamos cada reporte manualmente
        y actualizamos la base de datos en un plazo máximo de 72 horas.
      </p>
      <div class="report-actions">
        <button class="report-btn" disabled>
          📬 Reportar Error
          <span class="coming-soon">Próximamente</span>
        </button>
      </div>
    </div>

    <!-- Footer disclaimer -->
    <footer class="disclaimer">
      <p>
        Expedientes C es una plataforma ciudadana independiente, sin fines de lucro, sin financiamiento
        estatal ni partidario. No representa a ningún organismo público ni partido político.
      </p>
    </footer>

  </div>
</template>
