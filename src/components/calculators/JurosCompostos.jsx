import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { calcularJurosCompostos, DADOS_2026 } from '../../utils/calculations';

export const JurosCompostos = () => {
  const [inputs, setInputs] = useState({
    valorInicial: 10000,
    aporteMensal: 500,
    taxa: DADOS_2026.selic,
    anos: 20
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const dados = calcularJurosCompostos(
      inputs.valorInicial,
      inputs.taxa,
      inputs.anos,
      inputs.aporteMensal
    );
    setResultado(dados);
  };

  const ultimoAno = resultado?.[resultado.length - 1];

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">💰 Calculadora de Juros Compostos</h2>
      
      <div className="alert alert-info">
        <strong>📊 Taxa Selic 2026:</strong> {DADOS_2026.selic}% a.a. | 
        <strong> CDI:</strong> {DADOS_2026.cdi}% a.a.
      </div>

      <div className="input-group">
        <label className="input-label">Valor Inicial (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.valorInicial}
          onChange={(e) => setInputs({...inputs, valorInicial: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Aporte Mensal (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.aporteMensal}
          onChange={(e) => setInputs({...inputs, aporteMensal: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Taxa de Juros Anual (%)</label>
        <input
          type="number"
          step="0.1"
          className="input-field"
          value={inputs.taxa}
          onChange={(e) => setInputs({...inputs, taxa: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Período (anos)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.anos}
          onChange={(e) => setInputs({...inputs, anos: Number(e.target.value)})}
        />
      </div>

      <button className="button" onClick={calcular}>Calcular Projeção</button>

      {resultado && (
        <>
          <div className="results-grid">
            <ResultCard label="Montante Final" value={ultimoAno.montante} large />
            <ResultCard label="Total Investido" value={ultimoAno.investido} />
            <ResultCard label="Rendimento" value={ultimoAno.rendimento} />
            <ResultCard 
              label="ROI" 
              value={(ultimoAno.rendimento / ultimoAno.investido) * 100} 
              type="percent" 
            />
          </div>

          <Chart
            data={resultado}
            dataKeys={['montante', 'investido']}
            colors={['#10b981', '#3b82f6']}
            xKey="ano"
          />

          <Table
            data={resultado.filter((_, i) => i % 2 === 0 || i === resultado.length - 1)}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'investido', label: 'Total Investido', format: 'currency' },
              { key: 'rendimento', label: 'Rendimento', format: 'currency' },
              { key: 'montante', label: 'Montante', format: 'currency' }
            ]}
          />
        </>
      )}
    </div>
  );
};
