// API Proxy para brapi.dev - TESTADO E FUNCIONAL
// Documentação: https://brapi.dev/docs/acoes/quote
// Limite gratuito: 15.000 requisições/mês

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ 
      success: false, 
      error: 'Ticker é obrigatório' 
    });
  }

  const tickerUpper = ticker.toUpperCase().trim();

  try {
    // URL brapi.dev com dividends=true para trazer histórico
    const url = `https://brapi.dev/api/quote/${tickerUpper}?dividends=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SimulaGrana/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`brapi status ${response.status}`);
    }

    const data = await response.json();

    // Validar resposta
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({
        success: false,
        error: `FII "${tickerUpper}" não encontrado. Verifique se o ticker está correto.`
      });
    }

    const fii = data.results[0];

    // Validar preço
    if (!fii.regularMarketPrice || fii.regularMarketPrice <= 0) {
      return res.status(404).json({
        success: false,
        error: `Preço não disponível para ${tickerUpper}`
      });
    }

    const precoAtual = fii.regularMarketPrice;
    let dividendoMensal = 0;
    let usouDividendoReal = false;

    // Tentar extrair dividendos reais
    if (fii.dividendsData?.cashDividends && Array.isArray(fii.dividendsData.cashDividends)) {
      // Pegar últimos 12 dividendos pagos
      const dividendos = fii.dividendsData.cashDividends
        .filter(d => d.rate && d.rate > 0)
        .slice(0, 12);

      if (dividendos.length > 0) {
        // Calcular média mensal
        const soma = dividendos.reduce((acc, d) => acc + d.rate, 0);
        dividendoMensal = soma / dividendos.length;
        usouDividendoReal = true;
      }
    }

    // Se não tem dividendo real, estimar 0.75% ao mês
    if (dividendoMensal <= 0) {
      dividendoMensal = precoAtual * 0.0075;
    }

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      source: usouDividendoReal ? 'brapi.dev' : 'brapi.dev (dividendo estimado)',
      data: {
        symbol: fii.symbol || tickerUpper,
        shortName: fii.shortName || fii.longName || tickerUpper,
        regularMarketPrice: precoAtual,
        regularMarketChangePercent: fii.regularMarketChangePercent || 0,
        dividendoMensal: dividendoMensal,
        estimado: !usouDividendoReal
      }
    });

  } catch (error) {
    console.error('Erro API:', error.message);
    
    return res.status(500).json({
      success: false,
      error: `Erro ao buscar dados de ${tickerUpper}. Tente novamente.`
    });
  }
}
