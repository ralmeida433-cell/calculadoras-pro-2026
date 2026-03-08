import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';

export const MagicNumberFII = () => {
  const [ticker, setTicker] = useState('MXRF11');
  const [loading, setLoading] = useState(false);
  const [fiiData, setFiiData] = useState(null);
  const [erro, setErro] = useState('');
  const [inputs, setInputs] = useState({
    metaRendaMensal: 5000,
    aporteMensal: 2000,
    cotasAtuais: 0
  });
  const [resultado, setResultado] = useState(null);

  // Dados de exemplo para FIIs populares (fallback)
  const fiisExemplo = {
    'MXRF11': { nome: 'Maxi Renda', cotacao: 10.45, dividendo: 0.092 },
    'HGLG11': { nome: 'CSHG Logística', cotacao: 162.50, dividendo: 1.35 },
    'VISC11': { nome: 'Vinci Shopping', cotacao: 104.20, dividendo: 0.92 },
    'GARE11': { nome: 'Guardian Real Estate', cotacao: 8.95, dividendo: 0.074 },
    'KNRI11': { nome: 'Kinea Renda', cotacao: 99.80, dividendo: 0.83 }
  };

  const buscarFII = async () => {
    setLoading(true);
    setErro('');
    setFiiData(null);
    setResultado(null);
    
    try {
      // Tentar API real primeiro
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?fundamental=true&dividends=true`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );
      
      if (!response.ok) {
        throw new Error('API indisponível');
      }
      
      const data = await response.json();
      console.log('Resposta API:', data);
      
      if (data.results && data.results[0]) {
        const fii = data.results[0];
        const fiiProcessado = {
          symbol: fii.symbol,
          shortName: fii.shortName || fii.longName || ticker,
          regularMarketPrice: fii.regularMarketPrice,
          regularMarketChangePercent: fii.regularMarketChangePercent || 0,
          dividendoMensal: fii.dividendsData?.cashAmount || (fii.regularMarketPrice * 0.008)
        };
        
        setFiiData(fiiProcessado);
        calcularMagicNumber(fiiProcessado);
      } else {
        throw new Error('FII não encontrado');
      }
    } catch (error) {
      console.error('Erro na API:', error);
      
      // Fallback: usar dados de exemplo
      const fiiExemplo = fiisExemplo[ticker.toUpperCase()];
      
      if (fiiExemplo) {
        const fiiProcessado = {
          symbol: ticker,
          shortName: fiiExemplo.nome,
          regularMarketPrice: fiiExemplo.cotacao,
          regularMarketChangePercent: 0,
          dividendoMensal: fiiExemplo.dividendo
        };
        
        setFiiData(fiiProcessado);
        calcularMagicNumber(fiiProcessado);
        setErro('⚠️ Usando dados de exemplo (API offline). Cotações podem estar desatualizadas.');
      } else {
        setErro(`❌ FII "${ticker}" não encontrado. Tente: MXRF11, HGLG11, VISC11, GARE11 ou KNRI11`);
      }
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
        <strong>📋 Dados em Tempo Real:</strong> Cotações atualizadas da B3 via API brapi.dev.
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
            placeholder="MXRF11"
            style={{ flex: 1 }}
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
      </div>

      {erro && (
        <div className="alert alert-warning">
          {erro}
        </div>
      )}

      {fiiData && (
        <>
          <div className="alert alert-success">
            <strong>✅ {fiiData.shortName}</strong><br/>
            Cotação: R$ {fiiData.regularMarketPrice.toFixed(2)} | 
            Dividendo Mensal: R$ {fiiData.dividendoMensal.toFixed(3)}
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
