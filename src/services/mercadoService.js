// Detecta automaticamente B3 ou EUA pelo ticker
export function detectarMercado(ticker) {
  return /\d/.test(ticker) ? 'B3' : 'EUA';
}

// Busca ativo via proxy backend
export async function buscarAtivo(ticker) {
  const upper = ticker.toUpperCase().trim();
  const mercado = detectarMercado(upper);

  const endpoint = mercado === 'B3'
    ? `/api/ativo-b3?ticker=${upper}`
    : `/api/ativo-eua?ticker=${upper}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  if (!data.success) throw new Error(data.error || 'Ativo não encontrado');
  return { ...data.data, mercado };
}
