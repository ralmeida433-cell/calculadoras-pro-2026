import {
  TrendingUp,
  Flame,
  Building2,
  BadgeDollarSign,
  ShieldCheck,
  Target,
  Rocket,
  Sun,
  House,
  Receipt,
} from 'lucide-react';

export const Navigation = ({ activeCalc, setActiveCalc }) => {
  const calculators = [
    { id: 'juros', label: 'Juros Compostos', icon: TrendingUp },
    { id: 'fire', label: 'FIRE / Renda', icon: Flame },
    { id: 'fii', label: 'Magic Number FII', icon: Building2 },
    { id: 'bazin', label: 'M. Bazin', icon: BadgeDollarSign },
    { id: 'graham', label: 'M. Graham', icon: ShieldCheck },
    { id: 'buffett', label: 'M. Buffett', icon: Target },
    { id: 'fisher', label: 'M. Fisher', icon: Rocket },
    { id: 'solar', label: 'Energia Solar', icon: Sun },
    { id: 'imovel', label: 'Financiamento', icon: House },
    { id: 'mei', label: 'Impostos MEI', icon: Receipt },
  ];

  return (
    <nav className="menu">
      {calculators.map((calc) => {
        const Icon = calc.icon;

        return (
          <button
            key={calc.id}
            className={activeCalc === calc.id ? 'active' : ''}
            onClick={() => setActiveCalc(calc.id)}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{calc.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
