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

    const magicNumber = Math.ceil(cotacao / dividendoMensal);
    const valorInvestimento = magicNumber * cotacao;
    const rendimentoMensalTotal = magicNumber * dividendoMensal;

    setMagicNumberBasico({
      magicNumber,
      cotacao,
      dividendo: dividendoMensal,
      valorInvestimento,
      rendimentoMensalTotal,
      estimado: fii.estimado || false
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
      <h2 className="calculator-title">💎 Magic Number do Fiis</h2>
      <p className="calculator-subtitle">
        Quantas cotas você precisa para que o rendimento delas compre 1 cota nova por mês?
      </p>

      <div className="alert alert-info">
        <strong>📚 Fórmula:</strong> Magic Number = Preço da Cota ÷ Último Rendimento.<br />
        Exemplo: se a cota custa R$ 100 e rende R$ 1/mês, você precisa de 100 cotas para comprar 1 nova todo mês.
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
          {magicNumberBasico.estimado && (
            <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
              ⚠️ <strong>Dividendo estimado:</strong> não foi possível obter o dividendo real deste FII.
              O valor foi estimado em 0.75% ao mês (média de FIIs brasileiros).
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Preço atual da cota</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                R$ {magicNumberBasico.cotacao.toFixed(2)}
              </div>
            </div>

            <div style={{
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Último rendimento</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                R$ {magicNumberBasico.dividendo.toFixed(2)}
              </div>
            </div>

            <div style={{
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Quantidade de cotas</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                {magicNumberBasico.magicNumber}
              </div>
            </div>

            <div style={{
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Valor do investimento</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                R$ {magicNumberBasico.valorInvestimento.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '8px' }}>
              Com este investimento, compra-se 1 nova cota deste ativo todos os meses.
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#10b981',
              marginTop: '12px',
              padding: '16px',
              background: '#ecfdf5',
              borderRadius: '8px'
            }}>
              R$ {magicNumberBasico.dividendo.toFixed(2)} x {magicNumberBasico.magicNumber} = <span style={{ color: '#059669' }}>R$ {magicNumberBasico.rendimentoMensalTotal.toFixed(2)} / mês</span>
            </div>
          </div>

          {apiUsada && (
            <div style={{ textAlign: 'center', marginTop: '0.75rem', opacity: 0.65, fontSize: '0.875rem' }}>
              📊 Dados via {apiUsada}
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
            <strong>💡 Interpretação:</strong> a simulação projeta quanto tempo você leva para atingir sua meta de renda mensal com aportes regulares e reinvestimento de dividendos.
          </div>
        </>
      )}
    </div>
  );
};
