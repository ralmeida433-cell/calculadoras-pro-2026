import { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ThemeToggle } from './components/ThemeToggle';
import { JurosCompostos } from './components/calculators/JurosCompostos';
import { RendaPassivaFIRE } from './components/calculators/RendaPassivaFIRE';
import { EnergiaSolar } from './components/calculators/EnergiaSolar';
import { FinanciamentoImobiliario } from './components/calculators/FinanciamentoImobiliario';
import { ImpostosMEI } from './components/calculators/ImpostosMEI';
import { MagicNumberFII } from './components/calculators/MagicNumberFII';
import './styles/globals.css';

function App() {
  const [activeCalc, setActiveCalc] = useState('juros');

  const renderCalculator = () => {
    switch(activeCalc) {
      case 'juros':
        return <JurosCompostos />;
      case 'fire':
        return <RendaPassivaFIRE />;
      case 'solar':
        return <EnergiaSolar />;
      case 'imovel':
        return <FinanciamentoImobiliario />;
      case 'mei':
        return <ImpostosMEI />;
      case 'fii':
        return <MagicNumberFII />;
      default:
        return <JurosCompostos />;
    }
  };

  return (
    <div className="app">
      <ThemeToggle />
      <Header />
      <Navigation activeCalc={activeCalc} setActiveCalc={setActiveCalc} />
      <main className="container">
        {renderCalculator()}
      </main>
      <footer className="container" style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.7 }}>
        <p>💰 SimulaGrana © 2026 - Dados atualizados março/2026</p>
        <p style={{ fontSize: '0.875rem' }}>Simulador de investimentos gratuito para brasileiros</p>
      </footer>
    </div>
  );
}

export default App;
