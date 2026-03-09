// Vercel Serverless Function para proxy de APIs de FIIs
import fiisData from './fiis-data.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker é obrigatório' });
  }

  const tickerUpper = ticker.toUpperCase();
  let precoAtual = null;
  let dividendoMensal = null;
  let fonte = null;

  // 1️⃣ Tentar brapi.dev primeiro
  try {
    const brapiRes = await fetch(
      `https://brapi.dev/api/quote/${tickerUpper}?fundamental=true`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }
    );

    if (brapiRes.ok) {
      const data = await brapiRes.json();
      
      if (data.results && data.results.length > 0) {
        const fii = data.results[0];
        
        if (fii.regularMarketPrice && fii.regularMarketPrice > 0) {
          precoAtual = fii.regularMarketPrice;
          fonte = 'brapi.dev';
          
          if (fii.dividendsData?.cashDividends?.length > 0) {
            const dividendosRecentes = fii.dividendsData.cashDividends
              .filter(d => d.rate && d.rate > 0)
              .slice(0, 12);
            
            if (dividendosRecentes.length > 0) {
              const somaDividendos = dividendosRecentes.reduce((acc, div) => acc + div.rate, 0);
              dividendoMensal = somaDividendos / dividendosRecentes.length;
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('brapi.dev falhou:', error.message);
  }

  // 2️⃣ Se não conseguiu pela API, tentar base local
  if (!precoAtual && fiisData[tickerUpper]) {
    precoAtual = fiisData[tickerUpper].price;
    dividendoMensal = fiisData[tickerUpper].dividend;
    fonte = 'Base local (dados recentes)';
  }

  // 3️⃣ Tentar Yahoo Finance como último recurso
  if (!precoAtual) {
    try {
      const tickerSA = `${tickerUpper}.SA`;
      const yahooRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${tickerSA}?interval=1d&range=5d`,
        { 
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }
      );

      if (yahooRes.ok) {
        const data = await yahooRes.json();
        
        if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
          precoAtual = data.chart.result[0].meta.regularMarketPrice;
          if (!fonte) fonte = 'Yahoo Finance';
          
          // Se Yahoo encontrou preço mas não temos dividendo, estimar
          if (!dividendoMensal) {
            dividendoMensal = precoAtual * 0.0075;
            fonte = fonte + ' (dividendo estimado)';
          }
        }
      }
    } catch (error) {
      console.log('Yahoo Finance falhou:', error.message);
    }
  }

  // ✅ Se temos preço E dividendo, retornar sucesso
  if (precoAtual && dividendoMensal && precoAtual > 0 && dividendoMensal > 0) {
    return res.status(200).json({
      success: true,
      source: fonte,
      data: {
        symbol: tickerUpper,
        shortName: tickerUpper,
        regularMarketPrice: precoAtual,
        regularMarketChangePercent: 0,
        dividendoMensal: dividendoMensal,
        estimado: fonte.includes('estimado') || fonte.includes('Base local')
      }
    });
  }

  // ❌ Não encontrou
  return res.status(404).json({
    success: false,
    error: `FII "${tickerUpper}" não encontrado. Verifique se o ticker está correto.`
  });
}
