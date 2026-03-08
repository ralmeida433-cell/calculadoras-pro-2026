import { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ThemeToggle } from './components/ThemeToggle';
import { JurosCompostos } from './components/calculators/JurosCompostos';
import { RendaPassivaFIRE } from './components/calculators/RendaPassivaFIRE';
import { EnergiaSolar } from './components/calculators/EnergiaSolar';
import { FinanciamentoImobiliario } from './components/calculators/FinanciamentoImobiliario';
import { ImpostosMEI } from './components/calculators/ImpostosMEI';
import './styles/globals.css';

function App() {
  const [activeCalc, setActiveCalc] = useState('fire');

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
      default:
        return <RendaPassivaFIRE />;
    }
  };

  return (
    <>
      <ThemeToggle />
      <Header />
      <Navigation activeCalc={activeCalc} setActiveCalc={setActiveCalc} />
      <main className="container" style={{ paddingBottom: '3rem' }}>
        {renderCalculator()}
        
        <footer style={{ 
          marginTop: '4rem', 
          paddingTop: '2rem', 
          borderTop: '2px solid var(--border)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <p>
            <strong>Calculadoras Pro 2026</strong> - Dados atualizados com informações oficiais de março/2026
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Selic: 15% | CDI: 14,5% | Salário Mínimo: R$ 1.621 | Limite MEI: R$ 81.000
          </p>
        </footer>
      </main>
    </>
  );
}

export default App;
