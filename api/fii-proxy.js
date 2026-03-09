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
    // 1️⃣ Tentar brapi.dev primeiro (tem dividendos reais)
    try {
      const brapiRes = await fetch(
        `https://brapi.dev/api/quote/${tickerUpper}?fundamental=true`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (brapiRes.ok) {
        const data = await brapiRes.json();
        
        if (data.results && data.results.length > 0) {
          const fii = data.results[0];
          
          if (fii.regularMarketPrice && fii.regularMarketPrice > 0) {
            let dividendoMensal = 0;
            
            // Tentar pegar dividendos reais dos últimos 12 meses
            if (fii.dividendsData && fii.dividendsData.cashDividends && fii.dividendsData.cashDividends.length > 0) {
              const dividendosRecentes = fii.dividendsData.cashDividends
                .filter(d => d.rate && d.rate > 0)
                .slice(0, 12);
              
              if (dividendosRecentes.length > 0) {
                const somaDividendos = dividendosRecentes.reduce((acc, div) => acc + div.rate, 0);
                dividendoMensal = somaDividendos / dividendosRecentes.length;
              }
            }
            
            // Se não conseguiu dividendo real, retornar erro
            if (dividendoMensal <= 0) {
              return res.status(404).json({
                success: false,
                error: `FII "${tickerUpper}" encontrado, mas sem histórico de dividendos disponível. Tente outro ticker.`
              });
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

    // 2️⃣ Tentar Status Invest (dados fundamentalistas brasileiros)
    try {
      const statusRes = await fetch(
        `https://statusinvest.com.br/fundos-imobiliarios/${tickerUpper.toLowerCase()}`,
        { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html'
          } 
        }
      );

      if (statusRes.ok) {
        const html = await statusRes.text();
        
        // Extrair preço atual
        const precoMatch = html.match(/value f-indicator-value[^>]*>\s*R\$\s*([\d,\.]+)/i);
        // Extrair último rendimento
        const rendMatch = html.match(/Último\s*rendimento[^>]*>\s*R\$\s*([\d,\.]+)/i);
        
        if (precoMatch && rendMatch) {
          const preco = parseFloat(precoMatch[1].replace('.', '').replace(',', '.'));
          const rendimento = parseFloat(rendMatch[1].replace('.', '').replace(',', '.'));
          
          if (preco > 0 && rendimento > 0) {
            return res.status(200).json({
              success: true,
              source: 'Status Invest',
              data: {
                symbol: tickerUpper,
                shortName: tickerUpper,
                regularMarketPrice: preco,
                regularMarketChangePercent: 0,
                dividendoMensal: rendimento
              }
            });
          }
        }
      }
    } catch (error) {
      console.log('Status Invest falhou:', error.message);
    }

    // 3️⃣ Tentar Yahoo Finance (mas sem dividendos reais, só preço)
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
            // Yahoo não tem dividendos de FIIs brasileiros - informar isso ao usuário
            return res.status(404).json({
              success: false,
              error: `FII "${tickerUpper}" encontrado (preço R$ ${meta.regularMarketPrice.toFixed(2)}), mas dividendos não disponíveis nesta fonte. Tente outro ticker ou aguarde atualização dos dados.`
            });
          }
        }
      }
    } catch (error) {
      console.log('Yahoo falhou:', error.message);
    }

    // Nenhuma API funcionou
    return res.status(404).json({
      success: false,
      error: `FII "${tickerUpper}" não encontrado ou sem dados de dividendos disponíveis. Verifique o ticker e tente novamente.`
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do FII'
    });
  }
}
