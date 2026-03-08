import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { calcularFIRE, DADOS_2026 } from '../../utils/calculations';

export const RendaPassivaFIRE = () => {
  const [inputs, setInputs] = useState({
    gastoMensal: 5000,
    patrimonioAtual: 50000,
    aporteMensal: 2000,
    rentabilidade: DADOS_2026.cdi
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const dados = calcularFIRE(
      inputs.gastoMensal,
      inputs.patrimonioAtual,
      inputs.aporteMensal,
      inputs.rentabilidade
    );
    setResultado(dados);
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🔥 Calculadora FIRE - Independência Financeira</h2>
      
      <div className="alert alert-info">
        <strong>💡 Regra 25x:</strong> Você precisa de 25x suas despesas anuais investidas para alcançar o FIRE. 
        Com rentabilidade de {inputs.rentabilidade}% a.a., você terá renda passiva mensal suficiente.
      </div>

      <div className="input-group">
        <label className="input-label">Gasto Mensal Desejado (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.gastoMensal}
          onChange={(e) => setInputs({...inputs, gastoMensal: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Patrimônio Atual (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.patrimonioAtual}
          onChange={(e) => setInputs({...inputs, patrimonioAtual: Number(e.target.value)})}
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
        <label className="input-label">Rentabilidade Esperada (% a.a.)</label>
        <input
          type="number"
          step="0.1"
          className="input-field"
          value={inputs.rentabilidade}
          onChange={(e) => setInputs({...inputs, rentabilidade: Number(e.target.value)})}
        />
      </div>

      <button className="button" onClick={calcular}>Calcular FIRE</button>

      {resultado && (
        <>
          <div className="results-grid">
            <ResultCard label="Meta FIRE" value={resultado.metaFIRE} large />
            <ResultCard label="Anos para FIRE" value={resultado.anosParaFIRE} type="number" />
            <ResultCard label="Renda Passiva Mensal" value={resultado.rendaMensalFIRE} />
            <ResultCard 
              label="Falta Acumular" 
              value={resultado.metaFIRE - inputs.patrimonioAtual} 
            />
          </div>

          {resultado.anosParaFIRE !== 'Mais de 50' && (
            <div className="alert alert-success">
              <strong>🎯 Parabéns!</strong> Mantendo aportes de R$ {inputs.aporteMensal.toLocaleString('pt-BR')}/mês, 
              você alcançará independência financeira em <strong>{resultado.anosParaFIRE} anos</strong>, 
              com renda passiva de <strong>R$ {resultado.rendaMensalFIRE.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</strong>.
            </div>
          )}

          <Chart
            data={resultado.projecao}
            dataKeys={['patrimonio']}
            colors={['#10b981']}
            type="area"
            xKey="ano"
          />

          <Table
            data={resultado.projecao.filter((_, i) => i % 3 === 0 || i === resultado.projecao.length - 1)}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'patrimonio', label: 'Patrimônio', format: 'currency' }
            ]}
          />
        </>
      )}
    </div>
  );
};
