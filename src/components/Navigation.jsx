export const Navigation = ({ activeCalc, setActiveCalc, isOpen, setIsOpen }) => {
  const groups = [
    {
      label: 'Renda Variável',
      items: [
        { id: 'fii', label: 'Magic Number FII', icon: '💎' },
        { id: 'bazin', label: 'Método Bazin', icon: '💰', isNew: true },
        { id: 'graham', label: 'Método Graham', icon: '🔒', isNew: true },
        { id: 'buffett', label: 'Método Buffett', icon: '🎯', isNew: true },
        { id: 'fisher', label: 'Método Fisher', icon: '🚀', isNew: true },
      ]
    },
    {
      label: 'Planejamento',
      items: [
        { id: 'juros', label: 'Juros Compostos', icon: '📈' },
        { id: 'fire', label: 'FIRE / Renda Passiva', icon: '🔥' },
      ]
    },
    {
      label: 'Outros',
      items: [
        { id: 'solar', label: 'Energia Solar', icon: '☀️' },
        { id: 'imovel', label: 'Financiamento', icon: '🏠' },
        { id: 'mei', label: 'Impostos MEI', icon: '📋' },
      ]
    }
  ];

  const handleSelect = (id) => {
    setActiveCalc(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="SimulaGrana" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">SimulaGrana</span>
            <span className="sidebar-logo-sub">Simulador de Investimentos</span>
          </div>
        </div>

        {/* Nav Groups */}
        {groups.map((group) => (
          <div key={group.label}>
            <p className="sidebar-section-title">{group.label}</p>
            <nav className="nav">
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-button ${activeCalc === item.id ? 'active' : ''}`}
                  onClick={() => handleSelect(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.isNew && <span className="badge badge-new">new</span>}
                </button>
              ))}
            </nav>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* Footer sidebar */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          SimulaGrana © 2026 · Gratuito
        </div>
      </aside>
    </>
  );
};
