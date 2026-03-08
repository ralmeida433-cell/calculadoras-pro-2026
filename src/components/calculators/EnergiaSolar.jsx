import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { calcularEnergiaSolar, DADOS_2026 } from '../../utils/calculations';

export const EnergiaSolar = () => {
  const [inputs, setInputs] = useState({
    consumoMensal: 400,
    tarifaKwh: 0.80
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const dados = calcularEnergiaSolar(inputs.consumoMensal, inputs.tarifaKwh);
    setResultado(dados);
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">☀️ Calculadora de Energia Solar</h2>
      
      <div className="alert alert-info">
        <strong>⚡ Dados 2026:</strong> Sistema 3 kWp: R$ 10.500-15.000 | 
        5 kWp: R$ 17.500-25.000 | 8 kWp: R$ 28.000-40.000. 
        Payback médio: 4-6 anos.
      </div>

      <div className="input-group">
        <label className="input-label">Consumo Mensal Médio (kWh)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.consumoMensal}
          onChange={(e) => setInputs({...inputs, consumoMensal: Number(e.target.value)})}
          placeholder="Ex: 400"
        />
        <small style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Verifique sua conta de luz para encontrar o consumo médio
        </small>
      </div>

      <div className="input-group">
        <label className="input-label">Tarifa por kWh (R$)</label>
        <input
          type="number"
          step="0.01"
          className="input-field"
          value={inputs.tarifaKwh}
          onChange={(e) => setInputs({...inputs, tarifaKwh: Number(e.target.value)})}
        />
        <small style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Média Brasil 2026: R$ 0,80/kWh (sem impostos)
        </small>
      </div>

      <button className="button" onClick={calcular}>Calcular Viabilidade</button>

      {resultado && (
        <>
          <div className="results-grid">
            <ResultCard label="Potência Necessária" value={`${resultado.potenciaNecessaria} kWp`} type="text" />
            <ResultCard label="Investimento Total" value={resultado.custoTotal} large />
            <ResultCard label="Economia Mensal" value={resultado.economiaMensal} />
            <ResultCard label="Payback" value={`${resultado.payback} anos`} type="text" />
          </div>

          <div className="alert alert-success">
            <strong>💰 Economia Total em 25 anos:</strong> R$ {resultado.economiaTotal25Anos.toLocaleString('pt-BR')} | 
            <strong> ROI:</strong> {Math.round((resultado.economiaTotal25Anos / resultado.custoTotal - 1) * 100)}%
          </div>

          <Chart
            data={resultado.projecao}
            dataKeys={['economiaAcumulada']}
            colors={['#f59e0b']}
            type="area"
            xKey="ano"
          />

          <Table
            data={resultado.projecao}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'economiaAnual', label: 'Economia Anual', format: 'currency' },
              { key: 'economiaAcumulada', label: 'Acumulado', format: 'currency' },
              { key: 'roi', label: 'ROI (%)', format: 'percent' }
            ]}
          />

          <div className="alert alert-warning">
            <strong>📋 Atenção:</strong> A partir de 2026, consumidores pagam 60% do Fio B (taxa de distribuição). 
            Esta calculadora já considera 95% de compensação. Vida útil dos painéis: 25+ anos.
          </div>
        </>
      )}
    </div>
  );
};
