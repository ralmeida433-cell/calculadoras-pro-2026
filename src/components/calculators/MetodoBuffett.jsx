import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { Chart } from '../shared/Chart';

export const MetodoBuffett = () => {
  const [inputs, setInputs] = useState({
    cotacaoAtual: 35.80,
    lpa: 4.50,
    roe: 18.5, // Return on Equity
    margemLiquida: 15.0,
    divLiquidaPL: 0.8, // Dívida Líquida / Patrimônio
    crescimentoMedio: 12.0,
    taxaDesconto: 10.0,
    investimento: 10000,
    prazoAnos: 10
  });
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    // Valuation pelo Fluxo de Caixa Descontado simplificado
    const fcfAtual = inputs.lpa; // Simplificação: FCF ≈ LPA
    let valorPresente = 0;
    const projecaoFCF = [];
    
    for (let ano = 1; ano <= inputs.prazoAnos; ano++) {
      const fcfProjetado = fcfAtual * Math.pow(1 + inputs.crescimentoMedio / 100, ano);
      const vp = fcfProjetado / Math.pow(1 + inputs.taxaDesconto / 100, ano);
      valorPresente += vp;
      projecaoFCF.push({
        ano,
        fcf: Math.round(fcfProjetado * 100) / 100,
        vp: Math.round(vp * 100) / 100
      });
    }
    
    // Valor terminal (perpetuidade)
    const fcfTerminal = fcfAtual * Math.pow(1 + inputs.crescimentoMedio / 100, inputs.prazoAnos);
    const valorTerminal = fcfTerminal * (1 + 0.03) / (inputs.taxaDesconto / 100 - 0.03); // 3% crescimento perpétuo
    const vpTerminal = valorTerminal / Math.pow(1 + inputs.taxaDesconto / 100, inputs.prazoAnos);
    
    const valorIntrinseco = valorPresente + vpTerminal;
    const margemSeguranca = ((valorIntrinseco - inputs.cotacaoAtual) / valorIntrinseco) * 100;
    
    // Puntuação Qualidade Buffett (0-100)
    let pontuacao = 0;
    const criterios = {};
    
    // ROE > 15% (25 pontos)
    if (inputs.roe >= 20) { pontuacao += 25; criterios.roe = 'Excelente'; }
    else if (inputs.roe >= 15) { pontuacao += 15; criterios.roe = 'Bom'; }
    else { criterios.roe = 'Fraco'; }
    
    // Margem Líquida > 10% (25 pontos)
    if (inputs.margemLiquida >= 15) { pontuacao += 25; criterios.margem = 'Excelente'; }
    else if (inputs.margemLiquida >= 10) { pontuacao += 15; criterios.margem = 'Bom'; }
    else { criterios.margem = 'Fraco'; }
    
    // Dívida Líquida/PL < 1 (25 pontos)
    if (inputs.divLiquidaPL <= 0.5) { pontuacao += 25; criterios.divida = 'Excelente'; }
    else if (inputs.divLiquidaPL <= 1) { pontuacao += 15; criterios.divida = 'Bom'; }
    else { criterios.divida = 'Alto risco'; }
    
    // Margem de Segurança > 20% (25 pontos)
    if (margemSeguranca >= 30) { pontuacao += 25; criterios.margem_seguranca = 'Excelente'; }
    else if (margemSeguranca >= 20) { pontuacao += 15; criterios.margem_seguranca = 'Bom'; }
    else if (margemSeguranca >= 0) { criterios.margem_seguranca = 'Justo'; }
    else { criterios.margem_seguranca = 'Caro'; }
    
    const qualidade = pontuacao >= 80 ? 'EXCELENTE' : pontuacao >= 60 ? 'BOA' : pontuacao >= 40 ? 'RAZOÁVEL' : 'FRACA';
    const recomendacao = pontuacao >= 70 && margemSeguranca >= 20 ? 'COMPRAR' : 
                        pontuacao >= 50 ? 'ANALISAR' : 'EVITAR';
    
    const cotas = Math.floor(inputs.investimento / inputs.cotacaoAtual);
    
    setResultado({
      valorIntrinseco,
      margemSeguranca,
      pontuacao,
      qualidade,
      recomendacao,
      criterios,
      cotas,
      projecaoFCF
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🎯 Método Buffett - Qualidade</h2>
      
      <div className="alert alert-info">
        <strong>📚 Warren Buffett:</strong> "Preço é o que você paga, valor é o que você recebe".
        Invista em empresas de QUALIDADE excepcional para o longo prazo. ROE alto, margens boas, pouca dívida.
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
          <label className="input-label">ROE - Return on Equity (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.roe}
            onChange={(e) => setInputs({...inputs, roe: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Margem Líquida (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.margemLiquida}
            onChange={(e) => setInputs({...inputs, margemLiquida: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Dívida Líq./PL (x)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.divLiquidaPL}
            onChange={(e) => setInputs({...inputs, divLiquidaPL: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Crescimento Médio (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.crescimentoMedio}
            onChange={(e) => setInputs({...inputs, crescimentoMedio: Number(e.target.value)})}
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Taxa Desconto (%)</label>
          <input
            type="number"
            className="input-field"
            value={inputs.taxaDesconto}
            onChange={(e) => setInputs({...inputs, taxaDesconto: Number(e.target.value)})}
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

      <button className="button" onClick={calcular}>Analisar pelo Método Buffett</button>

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
              Qualidade: {resultado.qualidade} | Pontuação: {resultado.pontuacao}/100
            </p>
          </div>

          <div className="results-grid">
            <ResultCard 
              label="Valor Intrínseco" 
              value={resultado.valorIntrinseco}
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
              label="Score Qualidade" 
              value={`${resultado.pontuacao}/100`}
              type="text"
            />
          </div>

          <div style={{
            background: '#f3f4f6',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>🏆 Análise de Qualidade Buffett</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>ROE (Retorno Patrim.)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.roe >= 15 ? '#10b981' : '#ef4444' }}>
                  {inputs.roe.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.roe}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Margem Líquida</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.margemLiquida >= 10 ? '#10b981' : '#ef4444' }}>
                  {inputs.margemLiquida.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.margem}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Dívida Líq./PL</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: inputs.divLiquidaPL <= 1 ? '#10b981' : '#ef4444' }}>
                  {inputs.divLiquidaPL.toFixed(2)}x
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.divida}</small>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Margem Segurança</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: resultado.margemSeguranca >= 20 ? '#10b981' : '#ef4444' }}>
                  {resultado.margemSeguranca.toFixed(1)}%
                </div>
                <small style={{ opacity: 0.7 }}>{resultado.criterios.margem_seguranca}</small>
              </div>
            </div>
          </div>

          <Chart
            data={resultado.projecaoFCF}
            dataKeys={['fcf', 'vp']}
            colors={['#667eea', '#10b981']}
            xKey="ano"
            height={300}
          />

          <div className="alert alert-warning">
            <strong>💡 Filosofia Buffett:</strong><br/>
            ✅ Invista em negócios que você entende<br/>
            ✅ Empresas com vantagens competitivas duraduais ("moat")<br/>
            ✅ Gestão honesta e competente<br/>
            ✅ Preço atraente (margem de segurança)<br/>
            ✅ Pense como dono, não especulador
          </div>
        </>
      )}
    </div>
  );
};
