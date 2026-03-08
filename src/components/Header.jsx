export const Header = () => {
  return (
    <header className="header">
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '3rem',
          fontWeight: '700',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '3.5rem' }}>💰</span>
          <span>SimulaGrana</span>
        </div>
        <p style={{ 
          marginTop: '0.5rem',
          fontSize: '1.1rem',
          opacity: 0.95,
          maxWidth: '800px'
        }}>
          10 calculadoras profissionais para simular investimentos, FIIs, ações e planeje seu futuro financeiro com dados de 2026
        </p>
      </div>
    </header>
  );
};
