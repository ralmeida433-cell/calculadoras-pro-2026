import { useState, useEffect } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';
import { calcularFinanciamento } from '../../utils/calculations';

export const FinanciamentoImobiliario = () => {
  const [inputs, setInputs] = useState({
    valorImovel: 300000,
    entrada: 60000,
    prazoAnos: 30,
    banco: 'CAIXA'
  });
  const [resultado, setResultado] = useState(null);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataAtualizacao, setDataAtualizacao] = useState('');

  // Buscar taxas REAIS do Banco Central
  useEffect(() => {
    const buscarTaxas = async () => {
      try {
        const response = await fetch('/api/taxas-bancos');
        const data = await response.json();
        
        if (data.success) {
          setBancos(data.bancos);
          setDataAtualizacao(data.dataAtualizacao);
        }
      } catch (error) {
        console.error('Erro ao buscar taxas:', error);
        // Fallback: taxas estáticas
        setBancos([
          { nome: 'Caixa Econômica', codigo: 'CAIXA', taxaMedia: 11.85, taxaMin: 11.19, taxaMax: 12.50 },
          { nome: 'Banco do Brasil', codigo: 'BB', taxaMedia: 12.60, taxaMin: 12.00, taxaMax: 13.20 },
          { nome: 'Itaú Unibanco', codigo: 'ITAU', taxaMedia: 12.20, taxaMin: 11.60, taxaMax: 12.80 },
          { nome: 'Bradesco', codigo: 'BRADESCO', taxaMedia: 13.97, taxaMin: 13.49, taxaMax: 14.45 },
          { nome: 'Santander', codigo: 'SANTANDER', taxaMedia: 12.40, taxaMin: 11.79, taxaMax: 13.00 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    buscarTaxas();
  }, []);

  const bancoSelecionado = bancos.find(b => b.codigo === inputs.banco);

  const calcular = () => {
    if (!bancoSelecionado) return;
    
    const dados = calcularFinanciamento(
      inputs.valorImovel,
      inputs.entrada,
      inputs.prazoAnos,
      bancoSelecionado.taxaMedia
    );
    setResultado({
      ...dados, 
      taxa: bancoSelecionado.taxaMedia,
      banco: bancoSelecionado.nome,
      taxaMin: bancoSelecionado.taxaMin,
      taxaMax: bancoSelecionado.taxaMax
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">🏠 Calculadora de Financiamento Imobiliário</h2>
      
      <div className="alert alert-success">
        <strong>🏦 Taxas REAIS dos Bancos</strong> (via Banco Central do Brasil)<br/>
        {dataAtualizacao && <small>📅 Atualização: {dataAtualizacao}</small>}
        {loading && <small>🔄 Carregando taxas...</small>}
      </div>

      <div className="input-group">
        <label className="input-label">Valor do Imóvel (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.valorImovel}
          onChange={(e) => setInputs({...inputs, valorImovel: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Entrada (R$)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.entrada}
          onChange={(e) => setInputs({...inputs, entrada: Number(e.target.value)})}
        />
        <small style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          Entrada atual: {((inputs.entrada / inputs.valorImovel) * 100).toFixed(1)}% (mínimo 20%)
        </small>
      </div>

      <div className="input-group">
        <label className="input-label">Prazo (anos)</label>
        <input
          type="number"
          className="input-field"
          value={inputs.prazoAnos}
          onChange={(e) => setInputs({...inputs, prazoAnos: Number(e.target.value)})}
        />
      </div>

      <div className="input-group">
        <label className="input-label">🏦 Banco (Taxas Reais de Março/2026)</label>
        <select
          className="input-select"
          value={inputs.banco}
          onChange={(e) => setInputs({...inputs, banco: e.target.value})}
          disabled={loading}
        >
          {bancos.map(banco => (
            <option key={banco.codigo} value={banco.codigo}>
              {banco.nome} - {banco.taxaMedia}% a.a. (de {banco.taxaMin}% a {banco.taxaMax}%)
            </option>
          ))}
        </select>
        {bancoSelecionado && (
          <small style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block'}}>
            📊 {bancoSelecionado.modalidade} | {bancoSelecionado.observacao}
          </small>
        )}
      </div>

      {bancoSelecionado && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          color: 'white'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Taxa Mínima</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{bancoSelecionado.taxaMin}% a.a.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Taxa Média</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{bancoSelecionado.taxaMedia}% a.a.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Taxa Máxima</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{bancoSelecionado.taxaMax}% a.a.</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.9 }}>
            📌 {bancoSelecionado.observacao}
          </div>
        </div>
      )}

      <button className="button" onClick={calcular} disabled={loading}>
        {loading ? '🔄 Carregando...' : 'Calcular Financiamento'}
      </button>

      {resultado && (
        <>
          <div className="results-grid">
            <ResultCard label="Valor Financiado" value={resultado.valorFinanciado} />
            <ResultCard label="Prestação Mensal" value={resultado.prestacao} large />
            <ResultCard label="Total Pago" value={resultado.totalPago} />
            <ResultCard label="Total de Juros" value={resultado.totalJuros} />
          </div>

          <div className="alert alert-warning">
            <strong>📊 {resultado.banco}:</strong> Prestação de <strong>R$ {resultado.prestacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> por {inputs.prazoAnos * 12} meses.<br/>
            Taxa aplicada: <strong>{resultado.taxa}% a.a.</strong> | Juros totais: <strong>R$ {resultado.totalJuros.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong><br/>
            <small>💡 Taxa pode variar de {resultado.taxaMin}% a {resultado.taxaMax}% conforme seu perfil de crédito</small>
          </div>

          <Chart
            data={resultado.evolucao}
            dataKeys={['saldo', 'jurosAcumulados']}
            colors={['#ef4444', '#f59e0b']}
            xKey="ano"
            height={350}
          />

          <Table
            data={resultado.evolucao}
            columns={[
              { key: 'ano', label: 'Ano', format: 'number' },
              { key: 'saldo', label: 'Saldo Devedor', format: 'currency' },
              { key: 'amortizadoAcumulado', label: 'Amortizado', format: 'currency' },
              { key: 'jurosAcumulados', label: 'Juros Pagos', format: 'currency' }
            ]}
          />

          <div className="alert alert-info">
            <strong>💡 Dicas para conseguir melhores taxas:</strong><br/>
            • Score de crédito alto (acima de 800) pode reduzir até 1% a.a.<br/>
            • Entrada acima de 30% melhora condições<br/>
            • Relacionamento bancário (conta salário, investimentos) gera descontos<br/>
            • Faça simulações em TODOS os bancos antes de decidir
          </div>
        </>
      )}
    </div>
  );
};
