// /api/ativo-b3.js — Vercel Serverless Function
// Busca dados de ações da B3 via Yahoo Finance (.SA) e brapi.dev como fallback

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) return res.status(400).json({ success: false, error: 'Ticker obrigatório' });

  const upper = ticker.toUpperCase().trim();
  const tickerSA = `${upper}.SA`;

  // Tentativa 1: Yahoo Finance
  try {
    const fields = 'regularMarketPrice,trailingEps,bookValue,trailingAnnualDividendRate,revenueGrowth,profitMargins,returnOnEquity,earningsGrowth';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${tickerSA}?interval=1d&range=1d`;
    const urlFundamentals = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${tickerSA}?modules=summaryDetail,defaultKeyStatistics,financialData`;

    const [priceRes, fundRes] = await Promise.all([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch(urlFundamentals, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    ]);

    const priceData = await priceRes.json();
    const fundData = await fundRes.json();

    const cotacao = priceData?.chart?.result?.[0]?.meta?.regularMarketPrice;
    const summary = fundData?.quoteSummary?.result?.[0];
    const sd = summary?.summaryDetail || {};
    const ks = summary?.defaultKeyStatistics || {};
    const fd = summary?.financialData || {};

    if (!cotacao) throw new Error('Cotação não encontrada');

    return res.status(200).json({
      success: true,
      source: 'Yahoo Finance',
      data: {
        ticker: upper,
        mercado: 'B3',
        cotacao: cotacao,
        dividendoAnual: sd.trailingAnnualDividendRate?.raw || 0,
        lpa: ks.trailingEps?.raw || 0,
        vpa: ks.bookValue?.raw || 0,
        crescimento: fd.earningsGrowth?.raw || fd.revenueGrowth?.raw || 0,
        roe: fd.returnOnEquity?.raw || 0,
        margem: fd.profitMargins?.raw || 0,
        receita: fd.totalRevenue?.raw || 0
      }
    });
  } catch (e) {
    console.warn('Yahoo Finance B3 falhou:', e.message);
  }

  // Tentativa 2: brapi.dev
  try {
    const brapiUrl = `https://brapi.dev/api/quote/${upper}?fundamental=true`;
    const brapiRes = await fetch(brapiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const brapiData = await brapiRes.json();
    const ativo = brapiData?.results?.[0];

    if (!ativo || !ativo.regularMarketPrice) throw new Error('brapi sem dados');

    return res.status(200).json({
      success: true,
      source: 'brapi.dev',
      data: {
        ticker: upper,
        mercado: 'B3',
        cotacao: ativo.regularMarketPrice,
        dividendoAnual: ativo.dividendsData?.cashDividends?.[0]?.paymentAmount || 0,
        lpa: ativo.eps || 0,
        vpa: ativo.bookValuePerShare || 0,
        crescimento: ativo.revenueGrowth || 0,
        roe: ativo.returnOnEquity || 0,
        margem: ativo.profitMargin || 0,
        receita: ativo.revenue || 0
      }
    });
  } catch (e) {
    console.warn('brapi.dev falhou:', e.message);
  }

  return res.status(404).json({ success: false, error: `Ativo ${upper} não encontrado na B3.` });
}
