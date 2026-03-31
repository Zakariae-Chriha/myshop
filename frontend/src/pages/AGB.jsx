const AGB = () => {
  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #F3F4F6' }}>
          <h1 style={{ marginBottom: '2rem' }}>Allgemeine Geschäftsbedingungen (AGB)</h1>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>§1 Geltungsbereich</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Diese AGB gelten für alle Bestellungen, die über unseren Online-Shop aufgegeben werden.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>§2 Vertragsschluss</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Mit Abschluss der Bestellung geben Sie ein verbindliches Angebot ab. Der Vertrag kommt mit unserer Auftragsbestätigung per E-Mail zustande.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>§3 Preise und Zahlung</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer von 19%. Die Zahlung erfolgt per Kreditkarte (Stripe) oder auf Nachnahme.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>§4 Digitale Produkte</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Bei digitalen Produkten beginnt die Ausführung des Vertrages sofort nach Zahlungseingang. Das Widerrufsrecht erlischt mit Beginn des Downloads, sofern Sie dem ausdrücklich zugestimmt haben.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>§5 Widerrufsrecht</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Bei physischen Produkten haben Sie das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Kontaktieren Sie uns unter: [your@email.com]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>§6 Gerichtsstand</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
              Es gilt deutsches Recht. Gerichtsstand ist [Your City], Deutschland.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AGB;