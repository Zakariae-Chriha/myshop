const Datenschutz = () => {
  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #F3F4F6' }}>
          <h1 style={{ marginBottom: '2rem' }}>Datenschutzerklärung</h1>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>1. Datenschutz auf einen Blick</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>2. Welche Daten wir erheben</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Wir erheben folgende Daten wenn Sie sich registrieren oder eine Bestellung aufgeben:
            </p>
            <ul style={{ color: '#6B7280', lineHeight: 2, fontSize: '0.9rem', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Name und E-Mail-Adresse</li>
              <li>Lieferadresse (bei physischen Produkten)</li>
              <li>Zahlungsinformationen (verarbeitet durch Stripe)</li>
              <li>Bestellhistorie</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>3. Wie wir Ihre Daten nutzen</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Ihre Daten werden ausschließlich zur Bestellabwicklung, Kundenbetreuung und zur Verbesserung unseres Services verwendet. Wir geben Ihre Daten nicht an Dritte weiter.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>4. Cookies</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu verbessern. Sie können die Verwendung von Cookies in Ihren Browsereinstellungen ablehnen.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>5. Ihre Rechte</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Kontaktieren Sie uns unter: [your@email.com]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>6. Kontakt</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Bei Fragen zum Datenschutz wenden Sie sich bitte an:<br />
              [Your Name] · [your@email.com]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;