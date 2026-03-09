import { useState } from 'react';
import { detectarMercado } from '../../services/mercadoService';

/**
 * Componente reutilizável de busca de ativos.
 * Props:
 *  - onDados: (dados) => void  — chamado quando a busca retorna com sucesso
 *  - apenasB3: boolean          — quando true, rejeita tickers americanos
 *  - placeholder: string
 */
export const AtivoSearch = ({ onDados, apenasB3 = false, placeholder = 'Digite o ticker (ex: PETR4)' }) => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mercadoDetectado, setMercadoDetectado] = useState('');

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase();
    setTicker(val);
    if (val.length >= 2) setMercadoDetectado(detectarMercado(val));
    else setMercadoDetectado('');
  };

  const buscar = async () => {
    if (!ticker || ticker.length < 3) {
      setErro('❌ Digite um ticker válido (ex: PETR4 ou AAPL)');
      return;
    }

    const mercado = detectarMercado(ticker);

    if (apenasB3 && mercado === 'EUA') {
      setErro('❌ Este método aceita apenas ações da B3. Use tickers como PETR4, VALE3, ITUB4.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { buscarAtivo } = await import('../../services/mercadoService');
      const dados = await buscarAtivo(ticker);
      onDados(dados);
    } catch (err) {
      setErro(`❌ ${err.message || 'Erro ao buscar o ativo. Verifique o ticker e tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-group">
      <label className="input-label">
        Ticker do ativo
        {apenasB3 && <span style={{ marginLeft: 8, fontSize: 12, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Apenas B3</span>}
        {!apenasB3 && <span style={{ marginLeft: 8, fontSize: 12, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>B3 + EUA</span>}
      </label>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <input
            type="text"
            className="input-field"
            value={ticker}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder={placeholder}
            maxLength={6}
          />
          {mercadoDetectado && (
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
              background: mercadoDetectado === 'B3' ? '#dbeafe' : '#fef3c7',
              color: mercadoDetectado === 'B3' ? '#1e40af' : '#92400e'
            }}>
              {mercadoDetectado}
            </span>
          )}
        </div>

        <button
          className="button"
          onClick={buscar}
          disabled={loading}
          style={{ width: 'auto', minWidth: 160 }}
        >
          {loading ? '🔄 Buscando...' : '🔎 Buscar Dados'}
        </button>
      </div>

      {erro && (
        <div className="alert alert-warning" style={{ marginTop: '0.75rem', whiteSpace: 'pre-line' }}>
          {erro}
        </div>
      )}
    </div>
  );
};
