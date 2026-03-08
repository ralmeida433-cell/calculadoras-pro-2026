// Vercel Serverless Function para proxy de APIs de FIIs
// Resolve problema de CORS no navegador

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker é obrigatório' });
  }

  const tickerUpper = ticker.toUpperCase();

  try {
    // 1️⃣ Tentar brapi.dev primeiro
    try {
      const brapiRes = await fetch(
        `https://brapi.dev/api/quote/${tickerUpper}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (brapiRes.ok) {
        const data = await brapiRes.json();
        
        if (data.results && data.results.length > 0) {
          const fii = data.results[0];
          
          if (fii.regularMarketPrice && fii.regularMarketPrice > 0) {
            let dividendoMensal = 0;
            
            if (fii.dividendsData && fii.dividendsData.cashDividends) {
              const dividendos = fii.dividendsData.cashDividends.slice(0, 12);
              const somaDividendos = dividendos.reduce((acc, div) => acc + (div.rate || 0), 0);
              dividendoMensal = somaDividendos / Math.max(dividendos.length, 1);
            } else {
              dividendoMensal = fii.regularMarketPrice * 0.008;
            }

            return res.status(200).json({
              success: true,
              source: 'brapi.dev',
              data: {
                symbol: fii.symbol,
                shortName: fii.shortName || fii.longName || tickerUpper,
                regularMarketPrice: fii.regularMarketPrice,
                regularMarketChangePercent: fii.regularMarketChangePercent || 0,
                dividendoMensal: dividendoMensal
              }
            });
          }
        }
      }
    } catch (error) {
      console.log('brapi falhou:', error.message);
    }

    // 2️⃣ Tentar Yahoo Finance
    try {
      const tickerSA = `${tickerUpper}.SA`;
      const yahooRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${tickerSA}?interval=1d&range=5d`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (yahooRes.ok) {
        const data = await yahooRes.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          
          if (meta.regularMarketPrice && meta.regularMarketPrice > 0) {
            return res.status(200).json({
              success: true,
              source: 'Yahoo Finance',
              data: {
                symbol: tickerUpper,
                shortName: meta.symbol || tickerUpper,
                regularMarketPrice: meta.regularMarketPrice,
                regularMarketChangePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
                dividendoMensal: meta.regularMarketPrice * 0.008
              }
            });
          }
        }
      }
    } catch (error) {
      console.log('Yahoo falhou:', error.message);
    }

    // 3️⃣ Tentar HG Brasil
    try {
      const hgRes = await fetch(
        `https://api.hgbrasil.com/finance/stock_price?key=free&symbol=${tickerUpper}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (hgRes.ok) {
        const data = await hgRes.json();
        
        if (data.results && data.results[tickerUpper]) {
          const fii = data.results[tickerUpper];
          
          if (fii.price && fii.price > 0) {
            return res.status(200).json({
              success: true,
              source: 'HG Brasil',
              data: {
                symbol: tickerUpper,
                shortName: fii.name || tickerUpper,
                regularMarketPrice: fii.price,
                regularMarketChangePercent: fii.change_percent || 0,
                dividendoMensal: fii.price * 0.008
              }
            });
          }
        }
      }
    } catch (error) {
      console.log('HG Brasil falhou:', error.message);
    }

    // Nenhuma API funcionou
    return res.status(404).json({
      success: false,
      error: `FII "${tickerUpper}" não encontrado em nenhuma fonte`
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do FII'
    });
  }
}
