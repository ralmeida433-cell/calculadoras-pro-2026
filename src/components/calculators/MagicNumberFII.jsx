import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';

export const MagicNumberFII = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [fiiData, setFiiData] = useState(null);
  const [erro, setErro] = useState('');
  const [inputs, setInputs] = useState({
    metaRendaMensal: 5000,
    aporteMensal: 2000,
    cotasAtuais: 0
  });
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
    
    try {
      // API brapi.dev - Melhor para mercado brasileiro
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker.toUpperCase()}`,
        { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'SimulaGrana/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta brapi.dev:', data);
      
      if (data.results && data.results.length > 0) {
        const fii = data.results[0];
        
        // Validar se é realmente um FII
        if (!fii.regularMarketPrice || fii.regularMarketPrice <= 0) {
          throw new Error('Ticker não encontrado ou sem cotação');
        }

        // Calcular dividendo mensal (média dos últimos 12 meses se disponível)
        let dividendoMensal = 0;
        if (fii.dividendsData && fii.dividendsData.cashDividends) {
          const dividendos = fii.dividendsData.cashDividends.slice(0, 12);
          const somaDividendos = dividendos.reduce((acc, div) => acc + (div.rate || 0), 0);
          dividendoMensal = somaDividendos / Math.max(dividendos.length, 1);
        } else {
          // Fallback: estimar 0.8% ao mês (DY médio conservador)
          dividendoMensal = fii.regularMarketPrice * 0.008;
        }
        
        const fiiProcessado = {
          symbol: fii.symbol,
          shortName: fii.shortName || fii.longName || ticker,
          regularMarketPrice: fii.regularMarketPrice,
          regularMarketChangePercent: fii.regularMarketChangePercent || 0,
          dividendoMensal: dividendoMensal
        };
        
        setFiiData(fiiProcessado);
        calcularMagicNumber(fiiProcessado);
      } else {
        throw new Error('FII não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar FII:', error);
      setErro(
        `❌ Erro ao buscar "${ticker}". Verifique:\n` +
        `• Ticker correto (deve terminar em 11: MXRF11, HGLG11, etc)\n` +
        `• FII está ativo na B3\n` +
        `• Conexão com internet\n\n` +
        `Exemplos válidos: MXRF11, HGLG11, VISC11, KNRI11, XPML11`
      );
    } finally {
      setLoading(false);
    }
  };

  const calcularMagicNumber = (fii) => {
    const cotacao = fii.regularMarketPrice;
    const dividendoMensal = fii.dividendoMensal;
    
    const magicNumber = Math.ceil(cotacao / dividendoMensal);
    const investimentoMagic = magicNumber * cotacao;
    
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
      magicNumber,
      investimentoMagic,
      cotasParaMeta,
      investimentoMeta,
      tempoParaMeta: tempoParaMeta.toFixed(1),
      rendaMagic: Math.round(magicNumber * dividendoMensal),
      dividendoMensal,
      cotacao,
      projecao: projecao.filter((_, i) => i % 3 === 0 || i === projecao.length - 1).slice(0, 20)
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">💎 Magic Number - Fundos Imobiliários</h2>
      
      <div className="alert alert-info">
        <strong>📋 Dados em Tempo Real via brapi.dev:</strong> Cotações atualizadas da B3 (delay 30 min).
        Magic Number = número de cotas para que dividendos comprem 1 nova cota/mês.
      </div>

      <div className="input-group">
        <label className="input-label">Ticker do FII (ex: MXRF11, HGLG11, VISC11)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && buscarFII()}
            placeholder="Digite o ticker (ex: MXRF11)"
            style={{ flex: 1 }}
            maxLength={6}
          />
          <button 
            className="button" 
            onClick={buscarFII}
            disabled={loading}
            style={{ width: 'auto', padding: '0.875rem 1.5rem' }}
          >
            {loading ? '🔄 Buscando...' : '🔎 Buscar'}
          </button>
        </div>
        <small style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          💡 Principais FIIs: MXRF11, HGLG11, XPML11, VISC11, KNRI11, BTLG11, TRXF11
        </small>
      </div>

      {erro && (
        <div className="alert alert-warning" style={{ whiteSpace: 'pre-line' }}>
          {erro}
        </div>
      )}

      {fiiData && (
        <>
          <div className="alert alert-success">
            <strong>✅ {fiiData.shortName}</strong><br/>
            Cotação: R$ {fiiData.regularMarketPrice.toFixed(2)} | 
            Variação: {fiiData.regularMarketChangePercent.toFixed(2)}% | 
            Dividendo Médio: R$ {fiiData.dividendoMensal.toFixed(3)}/mês
          </div>

          <div className="input-group">
            <label className="input-label">Meta de Renda Mensal (R$)</label>
            <input
              type="number"
              className="input-field"
              value={inputs.metaRendaMensal}
              onChange={(e) => setInputs({...inputs, metaRendaMensal: Number(e.target.value)})}
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
            <label className="input-label">Cotas que Já Possui</label>
            <input
              type="number"
              className="input-field"
              value={inputs.cotasAtuais}
              onChange={(e) => setInputs({...inputs, cotasAtuais: Number(e.target.value)})}
            />
          </div>

          <button className="button" onClick={() => calcularMagicNumber(fiiData)}>
            Calcular Magic Number
          </button>
        </>
      )}

      {resultado && (
        <>
          <div className="results-grid">
            <ResultCard 
              label="💎 Magic Number" 
              value={`${resultado.magicNumber} cotas`} 
              type="text"
              large 
            />
            <ResultCard 
              label="Investimento Magic" 
              value={resultado.investimentoMagic} 
            />
            <ResultCard 
              label="Renda com Magic Number" 
              value={resultado.rendaMagic} 
            />
            <ResultCard 
              label="Dividendo/Cota/Mês" 
              value={resultado.dividendoMensal} 
            />
          </div>

          <div className="alert alert-warning">
            <strong>🎯 Para atingir R$ {inputs.metaRendaMensal.toLocaleString('pt-BR')}/mês:</strong><br/>
            Você precisa de <strong>{resultado.cotasParaMeta.toLocaleString('pt-BR')} cotas</strong> | 
            Investimento: <strong>R$ {resultado.investimentoMeta.toLocaleString('pt-BR')}</strong><br/>
            Tempo estimado: <strong>{resultado.tempoParaMeta} anos</strong> com aportes de R$ {inputs.aporteMensal.toLocaleString('pt-BR')}/mês
          </div>

          <Chart
            data={resultado.projecao}
            dataKeys={['cotas', 'rendaMensal']}
            colors={['#10b981', '#f59e0b']}
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
            <strong>💡 Dica:</strong> O Magic Number considera reinvestimento automático de dividendos. 
            Quanto maior o FII, mais tempo leva, mas a renda passiva é proporcional ao investimento.
          </div>
        </>
      )}
    </div>
  );
};
