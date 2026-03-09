// /api/ativo-eua.js — Vercel Serverless Function
// Busca dados de ações americanas via Yahoo Finance

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) return res.status(400).json({ success: false, error: 'Ticker obrigatório' });

  const upper = ticker.toUpperCase().trim();

  try {
    const urlPrice = `https://query1.finance.yahoo.com/v8/finance/chart/${upper}?interval=1d&range=1d`;
    const urlFund = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${upper}?modules=summaryDetail,defaultKeyStatistics,financialData`;

    const [priceRes, fundRes] = await Promise.all([
      fetch(urlPrice, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch(urlFund, { headers: { 'User-Agent': 'Mozilla/5.0' } })
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
        mercado: 'EUA',
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
    return res.status(404).json({ success: false, error: `Ativo ${upper} não encontrado. Verifique o ticker americano.` });
  }
}
