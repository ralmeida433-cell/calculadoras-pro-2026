import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { Chart } from '../shared/Chart';
import { AtivoSearch } from '../shared/AtivoSearch';

export const MetodoFisher = () => {
  const [ativoInfo, setAtivoInfo] = useState(null);
  const [inputs, setInputs] = useState({
    cotacaoAtual: '',
    lpa: '',
    receitaAtual: '',
    crescReceitaAnual: '',
    margemOperacional: '',
    crescMargem: 2.0,
    investimentoPD: 8.0,
    investimento: 10000,
    prazoAnos: 10
  });
  const [resultado, setResultado] = useState(null);

  const handleDados = (dados) => {
    setAtivoInfo(dados);
    setInputs((prev) => ({
      ...prev,
      cotacaoAtual: dados.cotacao ?? '',
      lpa: dados.lpa ?? '',
      receitaAtual: dados.receita ? Math.round(Number(dados.receita) / 1e6) : '',
      crescReceitaAnual: dados.crescimento ? (Number(dados.crescimento) * 100).toFixed(1) : '',
      margemOperacional: dados.margem ? (Number(dados.margem) * 100).toFixed(1) : ''
    }));
    setResultado(null);
  };

  const calcular = () => {
    const cotacao = Number(inputs.cotacaoAtual);
    const lpa = Number(inputs.lpa);
    const crescimento = Number(inputs.crescReceitaAnual);
    const margem = Number(inputs.margemOperacional);
    if (!cotacao || !lpa) return;

    const projecao = [];
    let receita = Number(inputs.receitaAtual) || 100;
    let margemAtual = margem;
    for (let ano = 1; ano <= inputs.prazoAnos; ano++) {
      receita *= 1 + crescimento / 100;
      margemAtual = Math.min(margemAtual + inputs.crescMargem, 40);
      const lucro = (receita * margemAtual) / 100;
      projecao.push({ ano, receita: Math.round(receita), margem: Math.round(margemAtual * 10) / 10, lucro: Math.round(lucro) });
    }

    const pe = cotacao / lpa;
    const pegCalculado = pe / crescimento;
    let pontuacao = 0;
    if (crescimento >= 25) pontuacao += 25; else if (crescimento >= 15) pontuacao += 15;
    if (margem >= 20) pontuacao += 20; else if (margem >= 15) pontuacao += 10;
    if (inputs.investimentoPD >= 10) pontuacao += 20; else if (inputs.investimentoPD >= 5) pontuacao += 10;
    if (inputs.crescMargem >= 2) pontuacao += 15; else if (inputs.crescMargem >= 0) pontuacao += 5;
    if (pegCalculado <= 1) pontuacao += 20; else if (pegCalculado <= 2) pontuacao += 10;

    const qualidade = pontuacao >= 80 ? 'GROWTH EXCEPCIONAL' : pontuacao >= 60 ? 'BOM GROWTH' : pontuacao >= 40 ? 'GROWTH MODERADO' : 'NAO E GROWTH';
    const recomendacao = pontuacao >= 70 && pegCalculado <= 2 ? 'COMPRAR' : pontuacao >= 50 ? 'ANALISAR' : 'EVITAR';
    const lpaFuturo = lpa * Math.pow(1 + crescimento / 100, 5);
    const cotacaoProjetada = lpaFuturo * pe * 0.9;
    const potencial = ((cotacaoProjetada - cotacao) / cotacao) * 100;
    const cotas = Math.floor(inputs.investimento / cotacao);

    setResultado({ pe, pegCalculado, pontuacao, qualidade, recomendacao, cotacaoProjetada, potencial, cotas, ganho: cotas * (cotacaoProjetada - cotacao), projecao: projecao.slice(0, 10) });
  };

  const cor = resultado?.recomendacao === 'COMPRAR' ? '#10b981' :
              resultado?.recomendacao === 'ANALISAR' ? '#f59e0b' : '#ef4444';

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🚀 Método Fisher – Crescimento</h2>

      <div className="alert alert-info">
        <strong>📚 Philip Fisher:</strong> Invista em empresas com crescimento EXCEPCIONAL de longo prazo.
        Foco: alta receita, expansao de margens, inovacao. PEG menor que 2. Aceita B3 e EUA.
      </div>

      <AtivoSearch
        onDados={handleDados}
        apenasB3={false}
        placeholder="Digite o ticker (ex: MGLU3 ou NVDA)"
      />

      {ativoInfo && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          ✅ <strong>{ativoInfo.ticker}</strong> ({ativoInfo.mercado}) — Cotacao: {ativoInfo.mercado === 'B3' ? 'R$' : 'US$'} {Number(ativoInfo.cotacao).toFixed(2)} | Crescimento: {ativoInfo.crescimento ? (Number(ativoInfo.crescimento) * 100).toFixed(1) : 'N/D'}% | Margem: {ativoInfo.margem ? (Number(ativoInfo.margem) * 100).toFixed(1) : 'N/D'}%
          <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 12 }}>via {ativoInfo.source || 'API'}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {[['cotacaoAtual','Cotacao Atual','0.01'],['lpa','LPA','0.01'],['receitaAtual','Receita Atual (R$ Mi)','1'],['crescReceitaAnual','Cresc. Receita Anual (%)','0.1'],['margemOperacional','Margem Operacional (%)','0.1'],['crescMargem','Expansao Margem/Ano (%)','0.1'],['investimentoPD','Invest. P&D (% receita)','0.1'],['investimento','Investimento (R$)','1'],['prazoAnos','Prazo (anos)','1']]
          .map(([key, label, step]) => (
            <div className="input-group" key={key}>
              <label className="input-label">{label}</label>
              <input type="number" className="input-field" step={step}
                value={inputs[key]}
                onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })} />
            </div>
          ))}
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Metodo Fisher</button>

      {resultado && (
        <>
          <div style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}dd 100%)`, borderRadius: '1rem', padding: '2rem', marginTop: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{resultado.recomendacao}</h3>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{resultado.qualidade} | Score: {resultado.pontuacao}/100</p>
          </div>
          <div className="results-grid">
            <ResultCard label="Potencial Valorizacao (5a)" value={`${resultado.potencial.toFixed(0)}%`} type="text" large />
            <ResultCard label="Preco Projetado (5a)" value={resultado.cotacaoProjetada} />
            <ResultCard label="PEG Ratio" value={`${resultado.pegCalculado.toFixed(2)}`} type="text" />
            <ResultCard label="Ganho Projetado" value={resultado.ganho} />
          </div>
          <Chart data={resultado.projecao} dataKeys={['receita','lucro']} colors={['#667eea','#10b981']} xKey="ano" height={320} />
          <div className="alert alert-warning">
            <strong>15 Pontos Fisher (resumo):</strong><br />
            Crescimento vendas superior a media do setor<br />
            Gestao excepcional e visionaria<br />
            Margens em expansao (eficiencia operacional)<br />
            Investimento consistente em P&D e inovacao<br />
            Vantagens competitivas sustentaveis de longo prazo
          </div>
        </>
      )}
    </div>
  );
};
