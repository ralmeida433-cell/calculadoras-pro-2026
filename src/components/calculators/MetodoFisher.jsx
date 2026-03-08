import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { Chart } from '../shared/Chart';

export const MetodoFisher = () => {
  const [inputs, setInputs] = useState({
    cotacaoAtual: 42.30,
    lpa: 2.80,
    receitaAtual: 1000, // Milhões
    crescReceitaAnual: 25.0,
    margemOperacional: 22.0,
    crescMargem: 2.0, // Expansão margem/ano
    investimentoPD: 8.0, // % receita em P&D
    pegRatio: 1.5, // PEG ideal < 2
    investimento: 10000,
    prazoAnos: 10
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    // Projeção de crescimento
    const projecao = [];
    let receita = inputs.receitaAtual;
    let margem = inputs.margemOperacional;
    
    for (let ano = 1; ano <= inputs.prazoAnos; ano++) {
      receita = receita * (1 + inputs.crescReceitaAnual / 100);
      margem = Math.min(margem + inputs.crescMargem, 40); // Cap em 40%
      const lucro = (receita * margem) / 100;
      
      projecao.push({
        ano,
        receita: Math.round(receita),
        margem: Math.round(margem * 10) / 10,
        lucro: Math.round(lucro)
      });
    }
    
    // PEG Ratio (P/L / Crescimento)
    const pe = inputs.cotacaoAtual / inputs.lpa;
    const pegCalculado = pe / inputs.crescReceitaAnual;
    
    // Score Fisher (0-100)
    let pontuacao = 0;
    const criterios = {};
    
    // Crescimento receita > 15% (25 pontos)
    if (inputs.crescReceitaAnual >= 25) { pontuacao += 25; criterios.crescimento = 'Excepcional'; }
    else if (inputs.crescReceitaAnual >= 15) { pontuacao += 15; criterios.crescimento = 'Bom'; }
    else { criterios.crescimento = 'Fraco'; }
    
    // Margem operacional > 15% (20 pontos)
    if (inputs.margemOperacional >= 20) { pontuacao += 20; criterios.margem = 'Excelente'; }
    else if (inputs.margemOperacional >= 15) { pontuacao += 10; criterios.margem = 'Bom'; }
    else { criterios.margem = 'Fraco'; }
    
    // Investimento em P&D > 5% (20 pontos)
    if (inputs.investimentoPD >= 10) { pontuacao += 20; criterios.pd = 'Alto (Inovação)'; }
    else if (inputs.investimentoPD >= 5) { pontuacao += 10; criterios.pd = 'Moderado'; }
    else { criterios.pd = 'Baixo'; }
    
    // Expansão margem (15 pontos)
    if (inputs.crescMargem >= 2) { pontuacao += 15; criterios.expansao = 'Sim'; }
    else if (inputs.crescMargem >= 0) { pontuacao += 5; criterios.expansao = 'Estável'; }
    else { criterios.expansao = 'Retração'; }
    
    // PEG Ratio < 2 (20 pontos)
    if (pegCalculado <= 1) { pontuacao += 20; criterios.peg = 'Excelente'; }
    else if (pegCalculado <= 2) { pontuacao += 10; criterios.peg = 'Aceitável'; }
    else { criterios.peg = 'Caro'; }
    
    const qualidade = pontuacao >= 80 ? 'GROWTH EXCEPCIONAL' : 
                     pontuacao >= 60 ? 'BOM GROWTH' : 
                     pontuacao >= 40 ? 'GROWTH MODERADO' : 'NÃO É GROWTH';
    
    const recomendacao = pontuacao >= 70 && pegCalculado <= 2 ? 'COMPRAR' : 
                        pontuacao >= 50 ? 'ANALISAR' : 'EVITAR';
    
    // Projeção valor futuro (simplificado)
    const lpaFuturo = inputs.lpa * Math.pow(1 + inputs.crescReceitaAnual / 100, 5);
    const peFuturo = pe * 0.9; // P/L tende a comprimir com crescimento
    const cotacaoProjetada = lpaFuturo * peFuturo;
    const potencialValorizacao = ((cotacaoProjetada - inputs.cotacaoAtual) / inputs.cotacaoAtual) * 100;
    
    const cotas = Math.floor(inputs.investimento / inputs.cotacaoAtual);
    const ganhoProjetado = cotas * (cotacaoProjetada - inputs.cotacaoAtual);
    
    setResultado({
      pe,
      pegCalculado,
      pontuacao,
      qualidade,
      recomendacao,
      criterios,
      cotacaoProjetada,
      potencialValorizacao,
      cotas,
      ganhoProjetado,
      projecao: projecao.slice(0, 10)
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🚀 Método Fisher - Crescimento</h2>
      
      <div className="alert alert-info">
        <strong>📚 Philip Fisher:</strong> "Scuttlebutt" - Invista em empresas com crescimento EXCEPCIONAL de longo prazo.
        Foco: alta receita, expansão margens, inovação (P&D), gestão visiona´ria. PEG < 2.
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
          <label className="input-label">LPA - Lucro/Ação (R$)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.lpa}
            onChange={(e) => setInputs({...inputs, lpa: Number(e.target.value)})}
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Receita Atual (R$ Mi)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.receitaAtual}
            onChange={(e) => setInputs({...inputs, receitaAtual: Number(e.target.value)})}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Cresc. Receita Anual (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.crescReceitaAnual}
            onChange={(e) => setInputs({...inputs, crescReceitaAnual: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Margem Operacional (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.margemOperacional}
            onChange={(e) => setInputs({...inputs, margemOperacional: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Expansão Margem/Ano (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.crescMargem}
            onChange={(e) => setInputs({...inputs, crescMargem: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Invest. P&D (% receita)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.investimentoPD}
            onChange={(e) => setInputs({...inputs, investimentoPD: Number(e.target.value)})}
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

        <div className="input-group">
          <label className="input-label">Prazo Projeção (anos)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.prazoAnos}
            onChange={(e) => setInputs({...inputs, prazoAnos: Number(e.target.value)})}
          />
        </div>
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Método Fisher</button>

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
              {resultado.qualidade} | Score: {resultado.pontuacao}/100
            </p>
          </div>

          <div className="results-grid">
            <ResultCard 
              label="Potencial Valorização (5a)" 
              value={`${resultado.potencialValorizacao.toFixed(0)}%`}
              type="text"
              large
            />
            <ResultCard 
              label="Preço Projetado (5a)" 
              value={resultado.cotacaoProjetada}
            />
            <ResultCard 
              label="PEG Ratio" 
              value={`${resultado.pegCalculado.toFixed(2)}`}
              type="text"
            />
            <ResultCard 
              label="Ganho Projetado" 
              value={resultado.ganhoProjetado}
            />
          </div>

          <div style={{
            background: '#f3f4f6',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>🚀 Análise Growth Fisher</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Crescimento Receita</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.crescReceitaAnual >= 15 ? '#10b981' : '#ef4444' }}>
                  {inputs.crescReceitaAnual.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.crescimento}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Margem Operacional</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.margemOperacional >= 15 ? '#10b981' : '#ef4444' }}>
                  {inputs.margemOperacional.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.margem}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Investimento P&D</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.investimentoPD >= 5 ? '#10b981' : '#ef4444' }}>
                  {inputs.investimentoPD.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.pd}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Expansão Margem</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.crescMargem >= 1 ? '#10b981' : '#ef4444' }}>
                  {inputs.crescMargem >= 0 ? '+' : ''}{inputs.crescMargem.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.expansao}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>PEG Ratio</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: resultado.pegCalculado <= 2 ? '#10b981' : '#ef4444' }}>
                  {resultado.pegCalculado.toFixed(2)}
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.peg}</small>
              </div>
            </div>
          </div>

          <Chart
            data={resultado.projecao}
            dataKeys={['receita', 'lucro']}
            colors={['#667eea', '#10b981']}
            xKey="ano"
            height={350}
          />

          <div className="alert alert-warning">
            <strong>💡 15 Pontos Fisher (resumo 5 principais):</strong><br/>
            ✅ Crescimento vendas superior à média do setor<br/>
            ✅ Gestão excepcional e visiona´ria<br/>
            ✅ Margens em expansão (eficiência operacional)<br/>
            ✅ Investimento consistente em P&D e inovação<br/>
            ✅ Vantagens competitivas sustenta´veis de longo prazo
          </div>

          <div className="alert alert-info">
            <strong>📈 Projeção 5 anos:</strong><br/>
            Preço Atual: R$ {inputs.cotacaoAtual.toFixed(2)} → Preço Projetado: R$ {resultado.cotacaoProjetada.toFixed(2)}<br/>
            Valorização: {resultado.potencialValorizacao.toFixed(0)}% | Ganho: R$ {resultado.ganhoProjetado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
        </>
      )}
    </div>
  );
};
