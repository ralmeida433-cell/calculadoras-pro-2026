// Vercel Serverless Function - Proxy para brapi.dev
// Documentação brapi: https://brapi.dev/docs/acoes/quote

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { ticker } = req.query;

  if (!ticker || ticker.length < 4) {
    return res.status(400).json({ 
      success: false, 
      error: 'Ticker inválido' 
    });
  }

  const tickerUpper = ticker.toUpperCase().trim();
  console.log(`[FII-PROXY] Buscando: ${tickerUpper}`);

  try {
    // Chamar brapi.dev com fundamental=true para trazer dividendos
    const brapiUrl = `https://brapi.dev/api/quote/${tickerUpper}?fundamental=true`;
    console.log(`[FII-PROXY] URL brapi: ${brapiUrl}`);

    const response = await fetch(brapiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SimulaGrana/1.0'
      }
    });

    console.log(`[FII-PROXY] Status brapi: ${response.status}`);

    if (!response.ok) {
      throw new Error(`brapi.dev retornou status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[FII-PROXY] Resposta brapi:`, JSON.stringify(data).substring(0, 200));

    // Validar estrutura da resposta
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('FII não encontrado na brapi.dev');
    }

    const fii = data.results[0];

    // Validar preço
    if (!fii.regularMarketPrice || fii.regularMarketPrice <= 0) {
      throw new Error('Preço não disponível');
    }

    const precoAtual = fii.regularMarketPrice;
    let dividendoMensal = 0;
    let dividendoReal = false;

    // Tentar extrair dividendos reais dos últimos 12 meses
    if (fii.dividendsData && fii.dividendsData.cashDividends && Array.isArray(fii.dividendsData.cashDividends)) {
      console.log(`[FII-PROXY] Dividendos encontrados: ${fii.dividendsData.cashDividends.length}`);
      
      const dividendosValidos = fii.dividendsData.cashDividends
        .filter(d => d && d.rate && d.rate > 0)
        .slice(0, 12); // Últimos 12 pagamentos

      if (dividendosValidos.length > 0) {
        const soma = dividendosValidos.reduce((acc, d) => acc + d.rate, 0);
        dividendoMensal = soma / dividendosValidos.length;
        dividendoReal = true;
        console.log(`[FII-PROXY] Dividendo médio calculado: R$ ${dividendoMensal.toFixed(4)}`);
      }
    }

    // Se não encontrou dividendo real, usar estimativa de 0.75% a.m.
    if (!dividendoReal || dividendoMensal <= 0) {
      dividendoMensal = precoAtual * 0.0075;
      console.log(`[FII-PROXY] Usando dividendo estimado: R$ ${dividendoMensal.toFixed(4)}`);
    }

    // Montar resposta
    const resultado = {
      success: true,
      source: dividendoReal ? 'brapi.dev' : 'brapi.dev (dividendo estimado)',
      data: {
        symbol: fii.symbol || tickerUpper,
        shortName: fii.shortName || fii.longName || tickerUpper,
        regularMarketPrice: precoAtual,
        regularMarketChangePercent: fii.regularMarketChangePercent || 0,
        dividendoMensal: dividendoMensal,
        estimado: !dividendoReal
      }
    };

    console.log(`[FII-PROXY] Sucesso: ${tickerUpper} - R$ ${precoAtual.toFixed(2)} / R$ ${dividendoMensal.toFixed(4)}`);
    return res.status(200).json(resultado);

  } catch (error) {
    console.error(`[FII-PROXY] Erro ao buscar ${tickerUpper}:`, error.message);
    
    return res.status(404).json({
      success: false,
      error: `FII "${tickerUpper}" não encontrado. Verifique se o ticker está correto (ex: MXRF11, HGLG11).`
    });
  }
}
