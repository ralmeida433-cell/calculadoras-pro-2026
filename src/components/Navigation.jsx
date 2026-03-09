export const Navigation = ({ activeCalc, setActiveCalc }) => {
  const calculators = [
    { id: 'juros', label: 'Juros Compostos', icon: '📈' },
    { id: 'fire', label: 'FIRE / Renda', icon: '🔥' },
    { id: 'fii', label: 'Magic Number FII', icon: '💎' },
    { id: 'bazin', label: 'M. Bazin', icon: '💰' },
    { id: 'graham', label: 'M. Graham', icon: '🔒' },
    { id: 'buffett', label: 'M. Buffett', icon: '🎯' },
    { id: 'fisher', label: 'M. Fisher', icon: '🚀' },
    { id: 'solar', label: 'Energia Solar', icon: '☀️' },
    { id: 'imovel', label: 'Financiamento', icon: '🏠' },
    { id: 'mei', label: 'Impostos MEI', icon: '📋' },
  ];

  return (
    <nav className="menu">
      {calculators.map(calc => (
        <button
          key={calc.id}
          className={activeCalc === calc.id ? 'active' : ''}
          onClick={() => setActiveCalc(calc.id)}
        >
          <span style={{ fontSize: '1.1rem' }}>{calc.icon}</span> {calc.label}
        </button>
      ))}
    </nav>
  );
};
