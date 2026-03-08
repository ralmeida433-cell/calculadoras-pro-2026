import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { calcularMEI, DADOS_2026 } from '../../utils/calculations';

export const ImpostosMEI = () => {
  const [inputs, setInputs] = useState({
    faturamentoAnual: 60000,
    tipoAtividade: 'servicos'
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const dados = calcularMEI(inputs.faturamentoAnual, inputs.tipoAtividade);
    setResultado(dados);
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">📊 Calculadora de Impostos MEI</h2>
      
      <div className="alert alert-info">
        <strong>💼 Valores 2026:</strong> INSS: R$ 81,05 (5% do salário mínimo R$ 1.621) | 
        ICMS: R$ 1,00 | ISS: R$ 5,00 | Limite anual: R$ 81.000
      </div>

      <div className="input-group">
        <label className="input-label">Faturamento Anual (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.faturamentoAnual}
          onChange={(e) => setInputs({...inputs, faturamentoAnual: Number(e.target.value)})}
        />
        <small style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Limite MEI: R$ 81.000/ano (R$ 6.750/mês)
        </small>
      </div>

      <div className="input-group">
        <label className="input-label">Tipo de Atividade</label>
        <select
          className="input-select"
          value={inputs.tipoAtividade}
          onChange={(e) => setInputs({...inputs, tipoAtividade: e.target.value})}
        >
          <option value="comercio">Comércio/Indústria (INSS + ICMS)</option>
          <option value="servicos">Prestação de Serviços (INSS + ISS)</option>
          <option value="ambos">Comércio e Serviços (INSS + ICMS + ISS)</option>
        </select>
      </div>

      <button className="button" onClick={calcular}>Calcular DAS MEI</button>

      {resultado && (
        <>
          {!resultado.dentroDolimite && (
            <div className="alert alert-warning">
              <strong>⚠️ Atenção!</strong> Seu faturamento está acima do limite MEI (R$ 81.000/ano). 
              Considere migrar para ME (Microempresa) no Simples Nacional.
            </div>
          )}

          <div className="results-grid">
            <ResultCard label="DAS Mensal" value={resultado.valorMensal} large />
            <ResultCard label="Total Anual" value={resultado.totalAnual} />
            <ResultCard label="Alíquota Efetiva" value={resultado.percentualFaturamento} type="percent" />
            <ResultCard label="Lucro Líquido Anual" value={resultado.lucroLiquido} />
          </div>

          <div className="alert alert-success">
            <strong>💰 Resumo:</strong> Pagando apenas R$ {resultado.valorMensal.toFixed(2)}/mês, 
            você garante benefícios do INSS e está regularizado. 
            Sua carga tributária efetiva é de apenas {resultado.percentualFaturamento.toFixed(2)}%!
          </div>

          <Chart
            data={resultado.projecao}
            dataKeys={['faturamento', 'lucroLiquido']}
            colors={['#3b82f6', '#10b981']}
            type="bar"
            xKey="ano"
          />

          <Table
            data={resultado.projecao}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'faturamento', label: 'Faturamento', format: 'currency' },
              { key: 'impostos', label: 'Impostos', format: 'currency' },
              { key: 'lucroLiquido', label: 'Lucro Líquido', format: 'currency' },
              { key: 'aliquotaEfetiva', label: 'Alíquota', format: 'text' }
            ]}
          />

          <div className="alert alert-info">
            <strong>📌 Benefícios inclusos:</strong> Aposentadoria por idade, Auxílio-doença, 
            Salário-maternidade, Pensão por morte, Auxílio-reclusão. 
            <br/><strong>Obrigações:</strong> Pagar DAS mensalmente até dia 20 e enviar DASN anual.
          </div>
        </>
      )}
    </div>
  );
};
