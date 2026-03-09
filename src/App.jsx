import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { JurosCompostos } from './components/calculators/JurosCompostos';
import { RendaPassivaFIRE } from './components/calculators/RendaPassivaFIRE';
import { EnergiaSolar } from './components/calculators/EnergiaSolar';
import { FinanciamentoImobiliario } from './components/calculators/FinanciamentoImobiliario';
import { ImpostosMEI } from './components/calculators/ImpostosMEI';
import { MagicNumberFII } from './components/calculators/MagicNumberFII';
import { MetodoBazin } from './components/calculators/MetodoBazin';
import { MetodoGraham } from './components/calculators/MetodoGraham';
import { MetodoBuffett } from './components/calculators/MetodoBuffett';
import { MetodoFisher } from './components/calculators/MetodoFisher';
import './styles/globals.css';

function App() {
  const [activeCalc, setActiveCalc] = useState('juros');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const renderCalculator = () => {
    switch(activeCalc) {
      case 'juros': return <JurosCompostos />;
      case 'fire': return <RendaPassivaFIRE />;
      case 'solar': return <EnergiaSolar />;
      case 'imovel': return <FinanciamentoImobiliario />;
      case 'mei': return <ImpostosMEI />;
      case 'fii': return <MagicNumberFII />;
      case 'bazin': return <MetodoBazin />;
      case 'graham': return <MetodoGraham />;
      case 'buffett': return <MetodoBuffett />;
      case 'fisher': return <MetodoFisher />;
      default: return <JurosCompostos />;
    }
  };

  return (
    <div className="app">
      <Navigation
        activeCalc={activeCalc}
        setActiveCalc={setActiveCalc}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      />
      <div className="app-main">
        <TopBar
          activeCalc={activeCalc}
          setIsOpen={setIsNavOpen}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        <Header activeCalc={activeCalc} />
        <main className="main-content">
          <div className="container" style={{ padding: '0' }}>
            {renderCalculator()}
          </div>
        </main>
        <footer className="app-footer">
          <p>📊 SimulaGrana © 2026 · Calculadoras financeiras gratuitas para brasileiros</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
