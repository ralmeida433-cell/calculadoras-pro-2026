export const Navigation = ({ activeCalc, setActiveCalc }) => {
  const calculators = [
    { id: 'juros', label: '💰 Juros Compostos', emoji: '📈' },
    { id: 'fire', label: '🔥 FIRE / Renda Passiva', emoji: '💵' },
    { id: 'fii', label: '💎 Magic Number FII', emoji: '🏢' },
    { id: 'bazin', label: '💰 Método Bazin', emoji: '💵' },
    { id: 'graham', label: '🔒 Método Graham', emoji: '📊' },
    { id: 'buffett', label: '🎯 Método Buffett', emoji: '🏆' },
    { id: 'fisher', label: '🚀 Método Fisher', emoji: '📈' },
    { id: 'solar', label: '☀️ Energia Solar', emoji: '⚡' },
    { id: 'imovel', label: '🏠 Financiamento', emoji: '🏬' },
    { id: 'mei', label: '📋 Impostos MEI', emoji: '💼' }
  ];

  return (
    <nav className="nav container">
      {calculators.map(calc => (
        <button
          key={calc.id}
          className={`nav-button ${activeCalc === calc.id ? 'active' : ''}`}
          onClick={() => setActiveCalc(calc.id)}
        >
          <span>{calc.emoji}</span> {calc.label}
        </button>
      ))}
    </nav>
  );
};
