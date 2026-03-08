import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';

export const MetodoBazin = () => {
  const [inputs, setInputs] = useState({
    cotacaoAtual: 25.50,
    dividendoAnual: 2.10,
    investimentoInicial: 10000,
    aporteMensal: 500,
    taxaMinima: 6.0,
    prazoAnos: 10
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const dividendYield = (inputs.dividendoAnual / inputs.cotacaoAtual) * 100;
    const precoJusto = inputs.dividendoAnual / (inputs.taxaMinima / 100);
    const margemSeguranca = ((precoJusto - inputs.cotacaoAtual) / precoJusto) * 100;
    const recomendacao = margemSeguranca >= 30 ? 'COMPRAR' : margemSeguranca >= 0 ? 'ANALISAR' : 'EVITAR';
    
    // Projeção de renda passiva
    const projecao = [];
    let cotas = Math.floor(inputs.investimentoInicial / inputs.cotacaoAtual);
    let valorInvestido = inputs.investimentoInicial;
    let dividendosAcumulados = 0;
    
    for (let ano = 1; ano <= inputs.prazoAnos; ano++) {
      // Aportes mensais
      const cotasNovas = Math.floor((inputs.aporteMensal * 12) / inputs.cotacaoAtual);
      cotas += cotasNovas;
      valorInvestido += inputs.aporteMensal * 12;
      
      // Dividendos do ano
      const dividendosAno = cotas * inputs.dividendoAnual;
      dividendosAcumulados += dividendosAno;
      
      // Reinvestir dividendos
      const cotasDividendos = Math.floor(dividendosAno / inputs.cotacaoAtual);
      cotas += cotasDividendos;
      
      projecao.push({
        ano,
        cotas,
        valorInvestido: Math.round(valorInvestido),
        dividendosAno: Math.round(dividendosAno),
        dividendosAcumulados: Math.round(dividendosAcumulados),
        rendaMensal: Math.round(dividendosAno / 12)
      });
    }
    
    setResultado({
      dividendYield,
      precoJusto,
      margemSeguranca,
      recomendacao,
      cotasIniciais: Math.floor(inputs.investimentoInicial / inputs.cotacaoAtual),
      projecao
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">💰 Método Bazin - Dividendos</h2>
      
      <div className="alert alert-info">
        <strong>📚 Décio Bazin:</strong> Invista em ações que pagam dividendos consistentes (DY ≥ 6%).
        Foco em renda passiva e segurança. Preço justo = Dividendo / Taxa mínima.
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
          <label className="input-label">Dividendo Anual (R$)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.dividendoAnual}
            onChange={(e) => setInputs({...inputs, dividendoAnual: Number(e.target.value)})}
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Taxa Mínima Bazin (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.taxaMinima}
            onChange={(e) => setInputs({...inputs, taxaMinima: Number(e.target.value)})}
            step="0.1"
          />
          <small style={{opacity: 0.7, fontSize: '0.875rem'}}>Bazin sugere 6% a.a.</small>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>📈 Projeção de Renda Passiva</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Investimento Inicial (R$)</label>
            <input
              type="number"
              className="input-field"
              value={inputs.investimentoInicial}
              onChange={(e) => setInputs({...inputs, investimentoInicial: Number(e.target.value)})}
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
            <label className="input-label">Prazo (anos)</label>
            <input
              type="number"
              className="input-field"
              value={inputs.prazoAnos}
              onChange={(e) => setInputs({...inputs, prazoAnos: Number(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Método Bazin</button>

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
              {resultado.recomendacao === 'COMPRAR' && '✅ Ação está barata e paga bons dividendos!'}
              {resultado.recomendacao === 'ANALISAR' && '⚠️ Ação no preço justo. Analise outros fatores.'}
              {resultado.recomendacao === 'EVITAR' && '❌ Ação cara para o Método Bazin.'}
            </p>
          </div>

          <div className="results-grid">
            <ResultCard 
              label="Dividend Yield" 
              value={`${resultado.dividendYield.toFixed(2)}%`}
              type="text"
              large
            />
            <ResultCard 
              label="Preço Justo Bazin" 
              value={resultado.precoJusto}
            />
            <ResultCard 
              label="Margem de Segurança" 
              value={`${resultado.margemSeguranca.toFixed(1)}%`}
              type="text"
            />
            <ResultCard 
              label="Cotas Iniciais" 
              value={`${resultado.cotasIniciais} ações`}
              type="text"
            />
          </div>

          <div className="alert alert-info">
            <strong>📊 Análise Bazin:</strong><br/>
            • Dividend Yield: {resultado.dividendYield.toFixed(2)}% {resultado.dividendYield >= 6 ? '✅ Acima de 6%' : '❌ Abaixo de 6%'}<br/>
            • Preço Atual: R$ {inputs.cotacaoAtual.toFixed(2)} | Preço Justo: R$ {resultado.precoJusto.toFixed(2)}<br/>
            • Margem: {resultado.margemSeguranca >= 30 ? '✅ Excelente (≥30%)' : resultado.margemSeguranca >= 0 ? '⚠️ Justa' : '❌ Negativa'}
          </div>

          <Table
            data={resultado.projecao}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'cotas', label: 'Ações', format: 'number' },
              { key: 'dividendosAno', label: 'Dividendos/Ano', format: 'currency' },
              { key: 'rendaMensal', label: 'Renda/Mês', format: 'currency' },
              { key: 'dividendosAcumulados', label: 'Total Dividendos', format: 'currency' }
            ]}
          />

          <div className="alert alert-warning">
            <strong>💡 Critérios Bazin:</strong><br/>
            ✅ Dividend Yield ≥ 6% a.a.<br/>
            ✅ Pagamento consistente por 5+ anos<br/>
            ✅ Margem de segurança ≥ 30%<br/>
            ✅ Empresa sólida e lucrativa
          </div>
        </>
      )}
    </div>
  );
};
