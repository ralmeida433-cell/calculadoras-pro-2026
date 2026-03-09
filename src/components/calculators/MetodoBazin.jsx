import { useState } from 'react';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { AtivoSearch } from '../shared/AtivoSearch';

export const MetodoBazin = () => {
  const [ativoInfo, setAtivoInfo] = useState(null);
  const [inputs, setInputs] = useState({
    cotacaoAtual: '',
    dividendoAnual: '',
    taxaMinima: 6.0,
    investimentoInicial: 10000,
    aporteMensal: 500,
    prazoAnos: 10
  });
  const [resultado, setResultado] = useState(null);

  const handleDados = (dados) => {
    setAtivoInfo(dados);
    setInputs((prev) => ({
      ...prev,
      cotacaoAtual: dados.cotacao ?? '',
      dividendoAnual: dados.dividendoAnual ?? ''
    }));
    setResultado(null);
  };

  const calcular = () => {
    const cotacao = Number(inputs.cotacaoAtual);
    const dividendo = Number(inputs.dividendoAnual);
    if (!cotacao || !dividendo) return;

    const dividendYield = (dividendo / cotacao) * 100;
    const precoJusto = dividendo / (inputs.taxaMinima / 100);
    const margemSeguranca = ((precoJusto - cotacao) / precoJusto) * 100;
    const recomendacao = margemSeguranca >= 30 ? 'COMPRAR' : margemSeguranca >= 0 ? 'ANALISAR' : 'EVITAR';

    const projecao = [];
    let cotas = Math.floor(inputs.investimentoInicial / cotacao);
    let valorInvestido = inputs.investimentoInicial;
    let dividendosAcumulados = 0;

    for (let ano = 1; ano <= inputs.prazoAnos; ano++) {
      const cotasNovas = Math.floor((inputs.aporteMensal * 12) / cotacao);
      cotas += cotasNovas;
      valorInvestido += inputs.aporteMensal * 12;
      const dividendosAno = cotas * dividendo;
      dividendosAcumulados += dividendosAno;
      cotas += Math.floor(dividendosAno / cotacao);
      projecao.push({
        ano, cotas,
        valorInvestido: Math.round(valorInvestido),
        dividendosAno: Math.round(dividendosAno),
        dividendosAcumulados: Math.round(dividendosAcumulados),
        rendaMensal: Math.round(dividendosAno / 12)
      });
    }

    setResultado({
      dividendYield, precoJusto, margemSeguranca, recomendacao,
      cotasIniciais: Math.floor(inputs.investimentoInicial / cotacao),
      projecao
    });
  };

  const cor = resultado?.recomendacao === 'COMPRAR' ? '#10b981' :
              resultado?.recomendacao === 'ANALISAR' ? '#f59e0b' : '#ef4444';

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">💰 Método Bazin – Dividendos</h2>

      <div className="alert alert-info">
        <strong>📚 Décio Bazin:</strong> Invista em ações da B3 que pagam dividendos consistentes (DY ≥ 6%).
        Preço justo = Dividendo Anual / Taxa Mínima (6%).
      </div>

      <AtivoSearch
        onDados={handleDados}
        apenasB3
        placeholder="Digite o ticker (ex: PETR4, VALE3, ITUB4)"
      />

      {ativoInfo && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          ✅ <strong>{ativoInfo.ticker}</strong> ({ativoInfo.mercado}) — Cotação: R$ {Number(ativoInfo.cotacao).toFixed(2)} | Dividendo anual: R$ {Number(ativoInfo.dividendoAnual).toFixed(2)}
          <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 12 }}>via {ativoInfo.source || 'API'}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div className="input-group">
          <label className="input-label">Cotação Atual (R$)</label>
          <input type="number" className="input-field" step="0.01"
            value={inputs.cotacaoAtual}
            onChange={(e) => setInputs({ ...inputs, cotacaoAtual: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Dividendo Anual (R$)</label>
          <input type="number" className="input-field" step="0.01"
            value={inputs.dividendoAnual}
            onChange={(e) => setInputs({ ...inputs, dividendoAnual: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Taxa Mínima Bazin (%)</label>
          <input type="number" className="input-field" step="0.1"
            value={inputs.taxaMinima}
            onChange={(e) => setInputs({ ...inputs, taxaMinima: Number(e.target.value) })} />
          <small style={{ opacity: 0.7, fontSize: '0.875rem' }}>Bazin sugere 6% a.a.</small>
        </div>
        <div className="input-group">
          <label className="input-label">Investimento Inicial (R$)</label>
          <input type="number" className="input-field"
            value={inputs.investimentoInicial}
            onChange={(e) => setInputs({ ...inputs, investimentoInicial: Number(e.target.value) })} />
        </div>
        <div className="input-group">
          <label className="input-label">Aporte Mensal (R$)</label>
          <input type="number" className="input-field"
            value={inputs.aporteMensal}
            onChange={(e) => setInputs({ ...inputs, aporteMensal: Number(e.target.value) })} />
        </div>
        <div className="input-group">
          <label className="input-label">Prazo (anos)</label>
          <input type="number" className="input-field"
            value={inputs.prazoAnos}
            onChange={(e) => setInputs({ ...inputs, prazoAnos: Number(e.target.value) })} />
        </div>
      </div>

      <button className="button" onClick={calcular}>Analisar pelo Método Bazin</button>

      {resultado && (
        <>
          <div style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}dd 100%)`, borderRadius: '1rem', padding: '2rem', marginTop: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{resultado.recomendacao}</h3>
          </div>
          <div className="results-grid">
            <ResultCard label="Dividend Yield" value={`${resultado.dividendYield.toFixed(2)}%`} type="text" large />
            <ResultCard label="Preço Justo Bazin" value={resultado.precoJusto} />
            <ResultCard label="Margem de Segurança" value={`${resultado.margemSeguranca.toFixed(1)}%`} type="text" />
            <ResultCard label="Cotas Iniciais" value={`${resultado.cotasIniciais} ações`} type="text" />
          </div>
          <Table data={resultado.projecao} columns={[
            { key: 'ano', label: 'Ano', format: 'number' },
            { key: 'cotas', label: 'Ações', format: 'number' },
            { key: 'dividendosAno', label: 'Dividendos/Ano', format: 'currency' },
            { key: 'rendaMensal', label: 'Renda/Mês', format: 'currency' },
            { key: 'dividendosAcumulados', label: 'Total Dividendos', format: 'currency' }
          ]} />
          <div className="alert alert-warning">
            <strong>💡 Critérios Bazin:</strong><br />
            {resultado.dividendYield >= 6 ? '✅' : '❌'} Dividend Yield ≥ 6% (Atual: {resultado.dividendYield.toFixed(2)}%)<br />
            {resultado.margemSeguranca >= 30 ? '✅' : '❌'} Margem de segurança ≥ 30% (Atual: {resultado.margemSeguranca.toFixed(1)}%)
          </div>
        </>
      )}
    </div>
  );
};
