import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';

export const MetodoGraham = () => {
  const [inputs, setInputs] = useState({
    cotacaoAtual: 25.50,
    lpa: 3.20, // Lucro por Ação
    vpa: 18.50, // Valor Patrimônio por Ação
    crescimentoAnual: 8.0,
    taxaMinima: 15.0,
    investimento: 10000
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    // Fórmula Graham simplificada: VI = √(22.5 × LPA × VPA)
    const valorIntrinseco = Math.sqrt(22.5 * inputs.lpa * inputs.vpa);
    
    // Fórmula Graham revisada (com crescimento)
    const valorIntrinsecoRevisado = (inputs.lpa * (8.5 + 2 * inputs.crescimentoAnual) * 4.4) / inputs.taxaMinima;
    
    // Média das duas fórmulas
    const valorFinal = (valorIntrinseco + valorIntrinsecoRevisado) / 2;
    
    const margemSeguranca = ((valorFinal - inputs.cotacaoAtual) / valorFinal) * 100;
    const pe = inputs.cotacaoAtual / inputs.lpa;
    const pvp = inputs.cotacaoAtual / inputs.vpa;
    
    // Critérios Graham
    const criteriosPE = pe <= 15;
    const criteriosPVP = pvp <= 1.5;
    const criteriosLPA = inputs.lpa > 0;
    const criteriosVPA = inputs.vpa > 0;
    const criteriosMargem = margemSeguranca >= 30;
    
    const aprovado = criteriosPE && criteriosPVP && criteriosLPA && criteriosVPA && criteriosMargem;
    
    const recomendacao = aprovado ? 'COMPRAR' : 
                        margemSeguranca >= 20 ? 'ANALISAR' : 'EVITAR';
    
    const cotas = Math.floor(inputs.investimento / inputs.cotacaoAtual);
    const potencialGanho = cotas * (valorFinal - inputs.cotacaoAtual);
    
    setResultado({
      valorIntrinseco,
      valorIntrinsecoRevisado,
      valorFinal,
      margemSeguranca,
      pe,
      pvp,
      recomendacao,
      cotas,
      potencialGanho,
      criterios: {
        pe: criteriosPE,
        pvp: criteriosPVP,
        lpa: criteriosLPA,
        vpa: criteriosVPA,
        margem: criteriosMargem
      }
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🔒 Método Graham - Valor Intrínseco</h2>
      
      <div className="alert alert-info">
        <strong>📚 Benjamin Graham:</strong> "Pai do Value Investing". Busque ações baratas com margem de segurança.
        Fórmula: VI = √(22.5 × LPA × VPA). Critérios: P/L ≤ 15, P/VP ≤ 1.5, Margem ≥ 30%.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div className="input-group">
          <label className="input-label">Cotação Atual (R$)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.cotacaoAtual}
            onChange={(e) => setInputs({...inputs, cotacaoAtual: Number(e.target.value)})}
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label className="input-label">LPA - Lucro por Ação (R$)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.lpa}
            onChange={(e) => setInputs({...inputs, lpa: Number(e.target.value)})}
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label className="input-label">VPA - Valor Patrim. (R$)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.vpa}
            onChange={(e) => setInputs({...inputs, vpa: Number(e.target.value)})}
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Crescimento Anual (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.crescimentoAnual}
            onChange={(e) => setInputs({...inputs, crescimentoAnual: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Taxa Mínima Retorno (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.taxaMinima}
            onChange={(e) => setInputs({...inputs, taxaMinima: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Investimento (R$)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.investimento}
            onChange={(e) => setInputs({...inputs, investimento: Number(e.target.value)})}
          />
        </div>
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Método Graham</button>

      {resultado && (
        <>
          <div style={{
            background: resultado.recomendacao === 'COMPRAR' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                       resultado.recomendacao === 'ANALISAR' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                       'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            marginTop: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
              {resultado.recomendacao}
            </h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.125rem', opacity: 0.95 }}>
              {resultado.recomendacao === 'COMPRAR' && '✅ Ação atende aos critérios de Graham!'}
              {resultado.recomendacao === 'ANALISAR' && '⚠️ Margem razoável. Analise outros fatores.'}
              {resultado.recomendacao === 'EVITAR' && '❌ Ação não atende aos critérios.'}
            </p>
          </div>

          <div className="results-grid">
            <ResultCard 
              label="Valor Intrínseco" 
              value={resultado.valorFinal}
              large
            />
            <ResultCard 
              label="Preço Atual" 
              value={inputs.cotacaoAtual}
            />
            <ResultCard 
              label="Margem de Segurança" 
              value={`${resultado.margemSeguranca.toFixed(1)}%`}
              type="text"
            />
            <ResultCard 
              label="Potencial Ganho" 
              value={resultado.potencialGanho}
            />
          </div>

          <div style={{
            background: '#f3f4f6',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>📊 Indicadores Fundamentalistas</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>P/L (Preço/Lucro)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: resultado.criterios.pe ? '#10b981' : '#ef4444' }}>
                  {resultado.pe.toFixed(2)} {resultado.criterios.pe ? '✅' : '❌'}
                </div>
                <small style={{ opacity: 0.7 }}>Ideal: ≤ 15</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>P/VP (Preço/Valor Patrim.)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: resultado.criterios.pvp ? '#10b981' : '#ef4444' }}>
                  {resultado.pvp.toFixed(2)} {resultado.criterios.pvp ? '✅' : '❌'}
                </div>
                <small style={{ opacity: 0.7 }}>Ideal: ≤ 1.5</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>LPA (Lucro por Ação)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: resultado.criterios.lpa ? '#10b981' : '#ef4444' }}>
                  R$ {inputs.lpa.toFixed(2)} {resultado.criterios.lpa ? '✅' : '❌'}
                </div>
                <small style={{ opacity: 0.7 }}>Deve ser positivo</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>VPA (Valor Patrim.)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: resultado.criterios.vpa ? '#10b981' : '#ef4444' }}>
                  R$ {inputs.vpa.toFixed(2)} {resultado.criterios.vpa ? '✅' : '❌'}
                </div>
                <small style={{ opacity: 0.7 }}>Deve ser positivo</small>
              </div>
            </div>
          </div>

          <div className="alert alert-info">
            <strong>📊 Análise Graham:</strong><br/>
            • VI Simplificado: R$ {resultado.valorIntrinseco.toFixed(2)}<br/>
            • VI Revisado (com crescimento): R$ {resultado.valorIntrinsecoRevisado.toFixed(2)}<br/>
            • VI Médio: R$ {resultado.valorFinal.toFixed(2)}<br/>
            • {resultado.cotas} ações com R$ {inputs.investimento.toLocaleString('pt-BR')}
          </div>

          <div className="alert alert-warning">
            <strong>💡 Critérios Graham:</strong><br/>
            {resultado.criterios.pe ? '✅' : '❌'} P/L ≤ 15 (Atual: {resultado.pe.toFixed(2)})<br/>
            {resultado.criterios.pvp ? '✅' : '❌'} P/VP ≤ 1.5 (Atual: {resultado.pvp.toFixed(2)})<br/>
            {resultado.criterios.lpa ? '✅' : '❌'} LPA > 0 (Atual: R$ {inputs.lpa.toFixed(2)})<br/>
            {resultado.criterios.vpa ? '✅' : '❌'} VPA > 0 (Atual: R$ {inputs.vpa.toFixed(2)})<br/>
            {resultado.criterios.margem ? '✅' : '❌'} Margem ≥ 30% (Atual: {resultado.margemSeguranca.toFixed(1)}%)
          </div>
        </>
      )}
    </div>
  );
};
