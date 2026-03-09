import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { Chart } from '../shared/Chart';
import { AtivoSearch } from '../shared/AtivoSearch';

export const MetodoBuffett = () => {
  const [ativoInfo, setAtivoInfo] = useState(null);
  const [inputs, setInputs] = useState({
    cotacaoAtual: '',
    lpa: '',
    roe: '',
    crescimentoLucro: '',
    margem: '',
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
      roe: dados.roe ? (dados.roe * 100).toFixed(1) : '',
      crescimentoLucro: dados.crescimento ? (dados.crescimento * 100).toFixed(1) : '',
      margem: dados.margem ? (dados.margem * 100).toFixed(1) : ''
    }));
    setResultado(null);
  };

  const calcular = () => {
    const cotacao = Number(inputs.cotacaoAtual);
    const lpa = Number(inputs.lpa);
    const roe = Number(inputs.roe);
    const cresc = Number(inputs.crescimentoLucro);
    const margem = Number(inputs.margem);
    if (!cotacao || !lpa) return;

    const projecao = [];
    let lpaAtual = lpa;
    let valorAcumulado = 0;

    for (let ano = 1; ano <= inputs.prazoAnos; ano++) {
      lpaAtual *= 1 + cresc / 100;
      valorAcumulado += lpaAtual;
      const valorProjetado = lpaAtual * 15;
      projecao.push({ ano, lpa: Math.round(lpaAtual * 100) / 100, valorProjetado: Math.round(valorProjetado * 100) / 100 });
    }

    const pe = cotacao / lpa;
    const roeScore = roe >= 15 ? 25 : roe >= 10 ? 15 : 0;
    const crescScore = cresc >= 15 ? 25 : cresc >= 8 ? 15 : 0;
    const margemScore = margem >= 20 ? 25 : margem >= 10 ? 15 : 0;
    const peScore = pe <= 20 ? 25 : pe <= 30 ? 10 : 0;
    const pontuacao = roeScore + crescScore + margemScore + peScore;

    const recomendacao = pontuacao >= 75 ? 'COMPRAR' : pontuacao >= 50 ? 'ANALISAR' : 'EVITAR';
    const valorFuturo = projecao[projecao.length - 1].valorProjetado;
    const potencial = ((valorFuturo - cotacao) / cotacao) * 100;
    const cotas = Math.floor(inputs.investimento / cotacao);

    setResultado({ pe, pontuacao, recomendacao, roe, cresc, margem, valorFuturo, potencial, cotas, ganho: cotas * (valorFuturo - cotacao), projecao: projecao.slice(0, 10) });
  };

  const cor = resultado?.recomendacao === 'COMPRAR' ? '#10b981' :
              resultado?.recomendacao === 'ANALISAR' ? '#f59e0b' : '#ef4444';

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🎯 Método Buffett – Valor a Longo Prazo</h2>

      <div className="alert alert-info">
        <strong>📚 Warren Buffett:</strong> Compre empresas maravilhosas a preços justos.
        ROE alto, margens consistentes e crescimento sustentável. Aceita B3 e EUA.
      </div>

      <AtivoSearch
        onDados={handleDados}
        apenasB3={false}
        placeholder="Digite o ticker (ex: WEGE3 ou MSFT)"
      />

      {ativoInfo && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          ✅ <strong>{ativoInfo.ticker}</strong> ({ativoInfo.mercado}) — Cotação: {ativoInfo.mercado === 'B3' ? 'R$' : 'US$'} {Number(ativoInfo.cotacao).toFixed(2)} | ROE: {ativoInfo.roe ? (Number(ativoInfo.roe) * 100).toFixed(1) : 'N/D'}% | Margem: {ativoInfo.margem ? (Number(ativoInfo.margem) * 100).toFixed(1) : 'N/D'}%
          <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 12 }}>via {ativoInfo.source || 'API'}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {[['cotacaoAtual','Cotação Atual','0.01'],['lpa','LPA – Lucro por Ação','0.01'],['roe','ROE (%)','0.1'],['crescimentoLucro','Crescimento Lucro (%)','0.1'],['margem','Margem Líquida (%)','0.1'],['investimento','Investimento (R$)','1'],['prazoAnos','Prazo (anos)','1']]
          .map(([key, label, step]) => (
            <div className="input-group" key={key}>
              <label className="input-label">{label}</label>
              <input type="number" className="input-field" step={step}
                value={inputs[key]}
                onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })} />
            </div>
          ))}
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Método Buffett</button>

      {resultado && (
        <>
          <div style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}dd 100%)`, borderRadius: '1rem', padding: '2rem', marginTop: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{resultado.recomendacao}</h3>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Score Buffett: {resultado.pontuacao}/100</p>
          </div>
          <div className="results-grid">
            <ResultCard label="Potencial (10a)" value={`${resultado.potencial.toFixed(0)}%`} type="text" large />
            <ResultCard label="Valor Futuro" value={resultado.valorFuturo} />
            <ResultCard label="P/L Atual" value={`${resultado.pe.toFixed(2)}`} type="text" />
            <ResultCard label="Ganho Estimado" value={resultado.ganho} />
          </div>
          <Chart data={resultado.projecao} dataKeys={['lpa','valorProjetado']} colors={['#10b981','#2563eb']} xKey="ano" height={320} />
          <div className="alert alert-warning">
            <strong>💡 Score Buffett ({resultado.pontuacao}/100):</strong><br />
            {resultado.roe >= 15 ? '✅' : '❌'} ROE ≥ 15% (Atual: {resultado.roe}%)<br />
            {resultado.cresc >= 8 ? '✅' : '❌'} Crescimento ≥ 8% (Atual: {resultado.cresc}%)<br />
            {resultado.margem >= 10 ? '✅' : '❌'} Margem ≥ 10% (Atual: {resultado.margem}%)<br />
            {resultado.pe <= 20 ? '✅' : '❌'} P/L ≤ 20 (Atual: {resultado.pe.toFixed(2)})
          </div>
        </>
      )}
    </div>
  );
};
