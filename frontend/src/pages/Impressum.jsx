const Impressum = () => {
  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #F3F4F6' }}>
          <h1 style={{ marginBottom: '2rem', color: '#1F2937' }}>Impressum</h1>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>
              Angaben gemäß § 5 TMG
            </h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
              [Your Full Name]<br />
              [Your Street Address]<br />
              [ZIP Code] [City]<br />
              Deutschland
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>Kontakt</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
              E-Mail: [your@email.com]<br />
              Telefon: [+49 xxx xxxxxxx]
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>
              Umsatzsteuer-ID
            </h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
              [Your USt-IdNr. or Steuernummer]
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>
              Verantwortlich für den Inhalt
            </h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
              [Your Full Name]<br />
              [Your Address]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>Haftungsausschluss</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.875rem' }}>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Impressum;