const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center', padding: '2rem',
      background: '#1a1a1a', color: '#aaa',
      marginTop: '3rem', fontSize: '14px',
    }}>
      <p>© {new Date().getFullYear()} MyShop — All rights reserved</p>
      <p style={{ marginTop: '0.5rem' }}>
        <a href="/impressum"   style={{ color: '#aaa', marginRight: '1rem' }}>Impressum</a>
        <a href="/datenschutz" style={{ color: '#aaa' }}>Datenschutz</a>
      </p>
    </footer>
  );
};

export default Footer;