import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';

export const MagicNumberFII = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [fiiData, setFiiData] = useState(null);
  const [erro, setErro] = useState('');
  const [apiUsada, setApiUsada] = useState('');
  const [inputs, setInputs] = useState({
    metaRendaMensal: 5000,
    aporteMensal: 2000,
    cotasAtuais: 0
  });
  const [magicNumberBasico, setMagicNumberBasico] = useState(null);
  const [resultado, setResultado] = useState(null);

  const buscarFII = async () => {
    if (!ticker || ticker.length < 5) {
      setErro('❌ Digite um ticker válido (ex: MXRF11)');
      return;
    }

    setLoading(true);
    setErro('');
    setFiiData(null);
    setResultado(null);
    setMagicNumberBasico(null);
    setApiUsada('');

    const tickerUpper = ticker.toUpperCase();

    try {
      const response = await fetch(`/api/fii-proxy?ticker=${tickerUpper}`);
      const data = await response.json();

      if (data.success && data.data) {
        setFiiData(data.data);
        setApiUsada(data.source);
        calcularMagicNumberBasico(data.data);
      } else {
        throw new Error(data.error || 'FII não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar FII:', error);
      setErro(
        `❌ FII "${tickerUpper}" não encontrado.\n\n` +
        `Verifique:\n` +
        `• Ticker está correto (ex: MXRF11, HGLG11)\n` +
        `• FII está ativo e negociado na B3\n` +
        `• Sua conexão com internet\n\n` +
        `💡 Tente FIIs populares:\n` +
        `MXRF11, HGLG11, XPML11, VISC11, KNRI11, BTLG11`
      );
    } finally {
      setLoading(false);
    }
  };

  const calcularMagicNumberBasico = (fii) => {
    const cotacao = Number(fii.regularMarketPrice || 0);
    const dividendoMensal = Number(fii.dividendoMensal || 0);

    if (cotacao <= 0 || dividendoMensal <= 0) {
      setErro('❌ Não foi possível calcular o Magic Number com os dados retornados para este FII.');
      return;
    }

    const magicNumberPercentual = (dividendoMensal / cotacao) * 100;
    const dyMensal = magicNumberPercentual;
    const dyAnualEstimado = dyMensal * 12;

    setMagicNumberBasico({
      percentual: magicNumberPercentual,
      dyMensal,
      dyAnualEstimado,
      cotacao,
      dividendo: dividendoMensal,
      formula: `(${dividendoMensal.toFixed(2)} ÷ ${cotacao.toFixed(2)}) × 100 = ${magicNumberPercentual.toFixed(2)}%`
    });
  };

  const calcularSimulacao = () => {
    if (!fiiData) return;

    const cotacao = Number(fiiData.regularMarketPrice || 0);
    const dividendoMensal = Number(fiiData.dividendoMensal || 0);

    if (cotacao <= 0 || dividendoMensal <= 0) return;

    const cotasParaMeta = Math.ceil(inputs.metaRendaMensal / dividendoMensal);
    const investimentoMeta = cotasParaMeta * cotacao;

    const projecao = [];
    let cotas = inputs.cotasAtuais;
    let valorInvestido = cotas * cotacao;
    let dividendosAcumulados = 0;
    let mes = 0;

    while (cotas < cotasParaMeta && mes < 600) {
      mes++;

      const cotasCompradas = inputs.aporteMensal / cotacao;
      cotas += cotasCompradas;
      valorInvestido += inputs.aporteMensal;

      const dividendosMes = cotas * dividendoMensal;
      dividendosAcumulados += dividendosMes;

      const cotasReinvestidas = dividendosMes / cotacao;
      cotas += cotasReinvestidas;

      if (mes % 12 === 0 || mes === 1 || cotas >= cotasParaMeta) {
        projecao.push({
          mes,
          ano: (mes / 12).toFixed(1),
          cotas: Math.floor(cotas),
          valorInvestido: Math.round(valorInvestido),
          dividendosAcumulados: Math.round(dividendosAcumulados),
          rendaMensal: Math.round(cotas * dividendoMensal),
          atingiuMeta: cotas >= cotasParaMeta
        });
      }
    }

    const tempoParaMeta = mes / 12;

    setResultado({
      cotasParaMeta,
      investimentoMeta,
      tempoParaMeta: tempoParaMeta.toFixed(1),
      projecao: projecao.filter((_, i) => i % 3 === 0 || i === projecao.length - 1).slice(0, 20)
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">💎 Magic Number - Fundos Imobiliários</h2>
      <p className="calculator-subtitle">
        Cálculo em percentual: (dividendo mensal por cota ÷ preço da cota) × 100.
      </p>

      <div className="alert alert-info">
        <strong>📘 Fórmula correta:</strong> Magic Number (%) = (Dividendo Mensal ÷ Preço da Cota) × 100.<br />
        O resultado representa o retorno mensal percentual da cota com base no dividendo mensal informado.
      </div>

      <div className="input-group">
        <label className="input-label">Ticker do FII (ex: MXRF11, HGLG11, CPTS11)</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && buscarFII()}
            placeholder="Digite o ticker (ex: MXRF11)"
            style={{ flex: 1, minWidth: '240px' }}
            maxLength={6}
          />
          <button
            className="button"
            onClick={buscarFII}
            disabled={loading}
            style={{ width: 'auto', minWidth: '170px' }}
          >
            {loading ? '🔄 Buscando...' : '🔎 Buscar'}
          </button>
        </div>
        <small style={{ opacity: 0.75, fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
          💡 FIIs populares: MXRF11, HGLG11, XPML11, VISC11, KNRI11, BTLG11, TRXF11, KNCR11, CPTS11
        </small>
      </div>

      {erro && (
        <div className="alert alert-warning" style={{ whiteSpace: 'pre-line' }}>
          {erro}
        </div>
      )}

      {magicNumberBasico && (
        <>
          <div className="results-grid" style={{ marginTop: '1.5rem' }}>
            <ResultCard label="Preço atual da cota" value={magicNumberBasico.cotacao} />
            <ResultCard label="Dividendo mensal por cota" value={magicNumberBasico.dividendo} />
            <ResultCard label="Magic Number (%)" value={`${magicNumberBasico.percentual.toFixed(2)}%`} type="text" large />
            <ResultCard label="DY anual estimado" value={`${magicNumberBasico.dyAnualEstimado.toFixed(2)}%`} type="text" />
          </div>

          <div className="alert alert-success">
            <strong>✅ Cálculo aplicado:</strong> {magicNumberBasico.formula}.<br />
            <strong>Leitura:</strong> o dividendo mensal de R$ {magicNumberBasico.dividendo.toFixed(2)} representa {magicNumberBasico.percentual.toFixed(2)}% do preço da cota de R$ {magicNumberBasico.cotacao.toFixed(2)} no mês.
          </div>

          {apiUsada && (
            <div style={{ textAlign: 'center', marginTop: '0.75rem', opacity: 0.65, fontSize: '0.875rem' }}>
              📊 Dados em tempo real via {apiUsada}
            </div>
          )}
        </>
      )}

      {fiiData && (
        <>
          <div className="section-divider" />
          <div className="section-label">Simulação personalizada</div>

          <div className="inputs-grid">
            <div className="input-group">
              <label className="input-label">Meta de renda mensal (R$)</label>
              <input
                type="number"
                className="input-field"
                value={inputs.metaRendaMensal}
                onChange={(e) => setInputs({ ...inputs, metaRendaMensal: Number(e.target.value) })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Aporte mensal (R$)</label>
              <input
                type="number"
                className="input-field"
                value={inputs.aporteMensal}
                onChange={(e) => setInputs({ ...inputs, aporteMensal: Number(e.target.value) })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Cotas que já possui</label>
              <input
                type="number"
                className="input-field"
                value={inputs.cotasAtuais}
                onChange={(e) => setInputs({ ...inputs, cotasAtuais: Number(e.target.value) })}
              />
            </div>
          </div>

          <button className="button" onClick={calcularSimulacao}>
            Simular meu cenário
          </button>
        </>
      )}

      {resultado && (
        <>
          <div className="results-grid" style={{ marginTop: '1.5rem' }}>
            <ResultCard label="Cotas necessárias" value={`${resultado.cotasParaMeta} cotas`} type="text" large />
            <ResultCard label="Investimento total" value={resultado.investimentoMeta} />
            <ResultCard label="Tempo estimado" value={`${resultado.tempoParaMeta} anos`} type="text" />
            <ResultCard label="Meta mensal" value={inputs.metaRendaMensal} />
          </div>

          <Chart
            data={resultado.projecao}
            dataKeys={['cotas', 'rendaMensal']}
            colors={['#2B7A5E', '#1B4D6A']}
            xKey="ano"
            height={350}
          />

          <Table
            data={resultado.projecao}
            columns={[
              { key: 'mes', label: 'Mês', format: 'number' },
              { key: 'cotas', label: 'Cotas', format: 'number' },
              { key: 'rendaMensal', label: 'Renda Mensal', format: 'currency' },
              { key: 'valorInvestido', label: 'Investido', format: 'currency' },
              { key: 'dividendosAcumulados', label: 'Dividendos', format: 'currency' }
            ]}
          />

          <div className="alert alert-info">
            <strong>💡 Interpretação:</strong> a simulação abaixo continua usando o dividendo mensal por cota para projetar a renda mensal total e o crescimento da carteira ao longo do tempo.
          </div>
        </>
      )}
    </div>
  );
};
