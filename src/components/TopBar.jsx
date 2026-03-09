export const TopBar = ({ activeCalc, setIsOpen, isDark, toggleTheme }) => {
  const titles = {
    juros: 'Juros Compostos',
    fire: 'FIRE / Renda Passiva',
    fii: 'Magic Number FII',
    bazin: 'Método Bazin',
    graham: 'Método Graham',
    buffett: 'Método Buffett',
    fisher: 'Método Fisher',
    solar: 'Energia Solar',
    imovel: 'Financiamento Imobiliário',
    mei: 'Impostos MEI',
  };

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="mobile-menu-btn" onClick={() => setIsOpen(prev => !prev)} aria-label="Menu">
          ☰
        </button>
        <div>
          <div className="topbar-title">{titles[activeCalc] || 'SimulaGrana'}</div>
          <div className="topbar-subtitle">Calculadoras Financeiras · 2026</div>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};
