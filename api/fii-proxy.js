// Vercel Serverless Function para proxy de APIs de FIIs
// Resolve problema de CORS no navegador

export default async function handler(req, res) {
  // Habilitar CORS
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

  // 1️⃣ Tentar brapi.dev (melhor fonte para FIIs brasileiros)
  try {
    const brapiRes = await fetch(
      `https://brapi.dev/api/quote/${tickerUpper}?fundamental=true`,
      { 
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      }
    );

    if (brapiRes.ok) {
      const data = await brapiRes.json();
      
      if (data.results && data.results.length > 0) {
        const fii = data.results[0];
        
        if (fii.regularMarketPrice && fii.regularMarketPrice > 0) {
          precoAtual = fii.regularMarketPrice;
          fonte = 'brapi.dev';
          
          // Tentar pegar dividendos reais
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

  // 2️⃣ Se não temos preço ainda, tentar Yahoo Finance
  if (!precoAtual) {
    try {
      const tickerSA = `${tickerUpper}.SA`;
      const yahooRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${tickerSA}?interval=1d&range=5d`,
        { 
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000
        }
      );

      if (yahooRes.ok) {
        const data = await yahooRes.json();
        
        if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
          precoAtual = data.chart.result[0].meta.regularMarketPrice;
          if (!fonte) fonte = 'Yahoo Finance';
        }
      }
    } catch (error) {
      console.log('Yahoo Finance falhou:', error.message);
    }
  }

  // 3️⃣ Se temos preço mas não temos dividendo, tentar FundsExplorer
  if (precoAtual && !dividendoMensal) {
    try {
      const fundsRes = await fetch(
        `https://www.fundsexplorer.com.br/funds/${tickerUpper.toLowerCase()}`,
        { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html'
          },
          timeout: 5000
        }
      );

      if (fundsRes.ok) {
        const html = await fundsRes.text();
        
        // Procurar pelo último dividendo
        const dividendoMatch = html.match(/Último Rendimento.*?R\$\s*([\d,\.]+)/is) ||
                               html.match(/dividend-value[^>]*>\s*R\$\s*([\d,\.]+)/is);
        
        if (dividendoMatch) {
          dividendoMensal = parseFloat(dividendoMatch[1].replace('.', '').replace(',', '.'));
          fonte = fonte + ' + FundsExplorer';
        }
      }
    } catch (error) {
      console.log('FundsExplorer falhou:', error.message);
    }
  }

  // 4️⃣ Se ainda não temos dividendo, usar estimativa conservadora baseada em DY médio de FIIs
  if (precoAtual && !dividendoMensal) {
    // FIIs brasileiros têm DY médio de 0.7% a 1.0% ao mês
    // Usando 0.75% como estimativa conservadora
    dividendoMensal = precoAtual * 0.0075;
    fonte = fonte + ' (dividendo estimado em 0.75% a.m.)';
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
        estimado: !fonte.includes('brapi.dev') || fonte.includes('estimado')
      }
    });
  }

  // ❌ Se não conseguimos dados, retornar erro
  return res.status(404).json({
    success: false,
    error: `FII "${tickerUpper}" não encontrado. Verifique se o ticker está correto e se o FII está ativo na B3.`
  });
}
