import { useState } from 'react';
import { Navigation } from './components/Navigation';
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
      <Header />
      <Navigation activeCalc={activeCalc} setActiveCalc={setActiveCalc} />
      
      <main className="container">
        {renderCalculator()}
      </main>

      <footer className="footer">
        <p>📊 SimulaGrana © 2026 · Calculadoras financeiras profissionais para brasileiros</p>
      </footer>
    </div>
  );
}

export default App;
