import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { calcularFinanciamento, DADOS_2026 } from '../../utils/calculations';

export const FinanciamentoImobiliario = () => {
  const [inputs, setInputs] = useState({
    valorImovel: 300000,
    entrada: 60000,
    prazoAnos: 30,
    modalidade: 'sbpeTR'
  });
  const [resultado, setResultado] = useState(null);

  const taxas = {
    mcmv: 6.0,
    sbpeTR: 11.49,
    cdi: 12.0
  };

  const calcular = () => {
    const taxaSelecionada = taxas[inputs.modalidade];
    const dados = calcularFinanciamento(
      inputs.valorImovel,
      inputs.entrada,
      inputs.prazoAnos,
      taxaSelecionada
    );
    setResultado({...dados, taxa: taxaSelecionada});
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🏠 Calculadora de Financiamento Imobiliário</h2>
      
      <div className="alert alert-info">
        <strong>🏦 Taxas 2026:</strong> MCMV: 4-8,16% | SBPE TR: 10,99-12% | CDI: 11-13,5% a.a.
      </div>

      <div className="input-group">
        <label className="input-label">Valor do Imóvel (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.valorImovel}
          onChange={(e) => setInputs({...inputs, valorImovel: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Entrada (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.entrada}
          onChange={(e) => setInputs({...inputs, entrada: Number(e.target.value)})}
        />
        <small style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Entrada atual: {((inputs.entrada / inputs.valorImovel) * 100).toFixed(1)}% (mínimo 20%)
        </small>
      </div>

      <div className="input-group">
        <label className="input-label">Prazo (anos)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.prazoAnos}
          onChange={(e) => setInputs({...inputs, prazoAnos: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Modalidade</label>
        <select
          className="input-select"
          value={inputs.modalidade}
          onChange={(e) => setInputs({...inputs, modalidade: e.target.value})}
        >
          <option value="mcmv">Minha Casa Minha Vida (6% a.a.)</option>
          <option value="sbpeTR">SBPE TR - SFH (11,49% a.a.)</option>
          <option value="cdi">CDI - Recursos Livres (12% a.a.)</option>
        </select>
      </div>

      <button className="button" onClick={calcular}>Calcular Financiamento</button>

      {resultado && (
        <>
          <div className="results-grid">
            <ResultCard label="Valor Financiado" value={resultado.valorFinanciado} />
            <ResultCard label="Prestação Mensal" value={resultado.prestacao} large />
            <ResultCard label="Total Pago" value={resultado.totalPago} />
            <ResultCard label="Total de Juros" value={resultado.totalJuros} />
          </div>

          <div className="alert alert-warning">
            <strong>💡 Custo Efetivo:</strong> Você pagará {resultado.custoEfetivo}% a mais em juros. 
            Taxa: {resultado.taxa}% a.a. | Prazo: {inputs.prazoAnos * 12} meses.
          </div>

          <Chart
            data={resultado.evolucao}
            dataKeys={['saldo', 'jurosAcumulados']}
            colors={['#ef4444', '#f59e0b']}
            xKey="ano"
          />

          <Table
            data={resultado.evolucao}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'saldo', label: 'Saldo Devedor', format: 'currency' },
              { key: 'amortizadoAcumulado', label: 'Amortizado', format: 'currency' },
              { key: 'jurosAcumulados', label: 'Juros Pagos', format: 'currency' }
            ]}
          />
        </>
      )}
    </div>
  );
};
