import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { AtivoSearch } from '../shared/AtivoSearch';

export const MetodoGraham = () => {
  const [ativoInfo, setAtivoInfo] = useState(null);
  const [inputs, setInputs] = useState({
    cotacaoAtual: '',
    lpa: '',
    vpa: '',
    crescimentoAnual: '',
    taxaMinima: 15.0,
    investimento: 10000
  });
  const [resultado, setResultado] = useState(null);

  const handleDados = (dados) => {
    setAtivoInfo(dados);
    setInputs((prev) => ({
      ...prev,
      cotacaoAtual: dados.cotacao ?? '',
      lpa: dados.lpa ?? '',
      vpa: dados.vpa ?? '',
      crescimentoAnual: dados.crescimento ? (dados.crescimento * 100).toFixed(1) : ''
    }));
    setResultado(null);
  };

  const calcular = () => {
    const cotacao = Number(inputs.cotacaoAtual);
    const lpa = Number(inputs.lpa);
    const vpa = Number(inputs.vpa);
    const cresc = Number(inputs.crescimentoAnual);
    if (!cotacao || !lpa || !vpa) return;

    const valorIntrinseco = Math.sqrt(22.5 * lpa * vpa);
    const valorIntrinsecoRevisado = (lpa * (8.5 + 2 * cresc) * 4.4) / inputs.taxaMinima;
    const valorFinal = (valorIntrinseco + valorIntrinsecoRevisado) / 2;
    const margem = ((valorFinal - cotacao) / valorFinal) * 100;
    const pe = cotacao / lpa;
    const pvp = cotacao / vpa;

    const criterios = { pe: pe <= 15, pvp: pvp <= 1.5, lpa: lpa > 0, vpa: vpa > 0, margem: margem >= 30 };
    const aprovado = Object.values(criterios).every(Boolean);
    const recomendacao = aprovado ? 'COMPRAR' : margem >= 20 ? 'ANALISAR' : 'EVITAR';
    const cotas = Math.floor(inputs.investimento / cotacao);

    setResultado({ valorIntrinseco, valorIntrinsecoRevisado, valorFinal, margem, pe, pvp, recomendacao, cotas, potencialGanho: cotas * (valorFinal - cotacao), criterios });
  };

  const cor = resultado?.recomendacao === 'COMPRAR' ? '#10b981' :
              resultado?.recomendacao === 'ANALISAR' ? '#f59e0b' : '#ef4444';

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🔒 Método Graham – Valor Intrínseco</h2>

      <div className="alert alert-info">
        <strong>📚 Benjamin Graham:</strong> Busque ações baratas com margem de segurança.
        Fórmula: VI = √(22.5 × LPA × VPA). Aceita B3 e bolsas americanas.
      </div>

      <AtivoSearch
        onDados={handleDados}
        apenasB3={false}
        placeholder="Digite o ticker (ex: PETR4 ou AAPL)"
      />

      {ativoInfo && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          ✅ <strong>{ativoInfo.ticker}</strong> ({ativoInfo.mercado}) — Cotação: {ativoInfo.mercado === 'B3' ? 'R$' : 'US$'} {Number(ativoInfo.cotacao).toFixed(2)} | LPA: {Number(ativoInfo.lpa).toFixed(2)} | VPA: {Number(ativoInfo.vpa).toFixed(2)}
          <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 12 }}>via {ativoInfo.source || 'API'}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {[['cotacaoAtual','Cotação Atual','0.01'],['lpa','LPA – Lucro por Ação','0.01'],['vpa','VPA – Valor Patrimonial','0.01'],['crescimentoAnual','Crescimento Anual (%)','0.1'],['taxaMinima','Taxa Mínima Retorno (%)','0.1'],['investimento','Investimento (R$)','1']]
          .map(([key, label, step]) => (
            <div className="input-group" key={key}>
              <label className="input-label">{label}</label>
              <input type="number" className="input-field" step={step}
                value={inputs[key]}
                onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })} />
            </div>
          ))}
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Método Graham</button>

      {resultado && (
        <>
          <div style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}dd 100%)`, borderRadius: '1rem', padding: '2rem', marginTop: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{resultado.recomendacao}</h3>
          </div>
          <div className="results-grid">
            <ResultCard label="Valor Intrínseco" value={resultado.valorFinal} large />
            <ResultCard label="Preço Atual" value={Number(inputs.cotacaoAtual)} />
            <ResultCard label="Margem de Segurança" value={`${resultado.margem.toFixed(1)}%`} type="text" />
            <ResultCard label="Potencial Ganho" value={resultado.potencialGanho} />
          </div>
          <div className="alert alert-warning">
            <strong>💡 Critérios Graham:</strong><br />
            {resultado.criterios.pe ? '✅' : '❌'} P/L ≤ 15 (Atual: {resultado.pe.toFixed(2)})<br />
            {resultado.criterios.pvp ? '✅' : '❌'} P/VP ≤ 1.5 (Atual: {resultado.pvp.toFixed(2)})<br />
            {resultado.criterios.lpa ? '✅' : '❌'} LPA positivo<br />
            {resultado.criterios.vpa ? '✅' : '❌'} VPA positivo<br />
            {resultado.criterios.margem ? '✅' : '❌'} Margem ≥ 30% (Atual: {resultado.margem.toFixed(1)}%)
          </div>
        </>
      )}
    </div>
  );
};
