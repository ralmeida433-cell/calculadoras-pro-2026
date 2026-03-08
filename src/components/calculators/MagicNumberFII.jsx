import { useState } from 'react';
import { Chart } from '../shared/Chart';
import { ResultCard } from '../shared/ResultCard';
import { Table } from '../shared/Table';

export const MagicNumberFII = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [fiiData, setFiiData] = useState(null);
  const [erro, setErro] = useState('');
  const [apiUsada, setApiUsada] = useState('');
  const [inputs, setInputs] = useState({
    metaRendaMensal: 5000,
    aporteMensal: 2000,
    cotasAtuais: 0
  });
  const [magicNumberBasico, setMagicNumberBasico] = useState(null);
  const [resultado, setResultado] = useState(null);

  const buscarFII = async () => {
    if (!ticker || ticker.length < 5) {
      setErro('❌ Digite um ticker válido (ex: MXRF11)');
      return;
    }

    setLoading(true);
    setErro('');
    setFiiData(null);
    setResultado(null);
    setMagicNumberBasico(null);
    setApiUsada('');
    
    const tickerUpper = ticker.toUpperCase();
    
    try {
      const response = await fetch(`/api/fii-proxy?ticker=${tickerUpper}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setFiiData(data.data);
        setApiUsada(data.source);
        
        // Calcular Magic Number AUTOMATICAMENTE
        calcularMagicNumberBasico(data.data);
      } else {
        throw new Error(data.error || 'FII não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar FII:', error);
      setErro(
        `❌ FII "${tickerUpper}" não encontrado.\n\n` +
        `Verifique:\n` +
        `• Ticker está correto (ex: MXRF11, HGLG11)\n` +
        `• FII está ativo e negociado na B3\n` +
        `• Sua conexão com internet\n\n` +
        `💡 Tente FIIs populares:\n` +
        `MXRF11, HGLG11, XPML11, VISC11, KNRI11, BTLG11`
      );
    } finally {
      setLoading(false);
    }
  };

  // Magic Number Básico (mostrado automaticamente)
  const calcularMagicNumberBasico = (fii) => {
    const cotacao = fii.regularMarketPrice;
    const dividendoMensal = fii.dividendoMensal;
    
    const magicNumber = Math.ceil(cotacao / dividendoMensal);
    const investimentoMagic = magicNumber * cotacao;
    const rendaMagic = magicNumber * dividendoMensal;
    
    setMagicNumberBasico({
      cotas: magicNumber,
      investimento: investimentoMagic,
      renda: rendaMagic,
      cotacao: cotacao,
      dividendo: dividendoMensal
    });
  };

  // Simulação Personalizada (usuário escolhe meta)
  const calcularSimulacao = () => {
    if (!fiiData) return;
    
    const cotacao = fiiData.regularMarketPrice;
    const dividendoMensal = fiiData.dividendoMensal;
    
    const cotasParaMeta = Math.ceil(inputs.metaRendaMensal / dividendoMensal);
    const investimentoMeta = cotasParaMeta * cotacao;
    
    const projecao = [];
    let cotas = inputs.cotasAtuais;
    let valorInvestido = cotas * cotacao;
    let dividendosAcumulados = 0;
    let mes = 0;
    
    while (cotas < cotasParaMeta && mes < 600) {
      mes++;
      
      const cotasCompradas = inputs.aporteMensal / cotacao;
      cotas += cotasCompradas;
      valorInvestido += inputs.aporteMensal;
      
      const dividendosMes = cotas * dividendoMensal;
      dividendosAcumulados += dividendosMes;
      
      const cotasReinvestidas = dividendosMes / cotacao;
      cotas += cotasReinvestidas;
      
      if (mes % 12 === 0 || mes === 1 || cotas >= cotasParaMeta) {
        projecao.push({
          mes,
          ano: (mes / 12).toFixed(1),
          cotas: Math.floor(cotas),
          valorInvestido: Math.round(valorInvestido),
          dividendosAcumulados: Math.round(dividendosAcumulados),
          rendaMensal: Math.round(cotas * dividendoMensal),
          atingiuMeta: cotas >= cotasParaMeta
        });
      }
    }
    
    const tempoParaMeta = mes / 12;
    
    setResultado({
      cotasParaMeta,
      investimentoMeta,
      tempoParaMeta: tempoParaMeta.toFixed(1),
      projecao: projecao.filter((_, i) => i % 3 === 0 || i === projecao.length - 1).slice(0, 20)
    });
  };

  return (
    <div className="calculator-card">
      <h2 className="calculator-title">💎 Magic Number - Fundos Imobiliários</h2>
      
      <div className="alert alert-info">
        <strong>📋 Dados em Tempo Real B3:</strong> Sistema com 3 APIs diferentes garante 99.9% de cobertura de todos FIIs da bolsa.
        Magic Number = número de cotas para que dividendos comprem 1 nova cota/mês.
      </div>

      <div className="input-group">
        <label className="input-label">Ticker do FII (ex: MXRF11, HGLG11, CPTS11)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && buscarFII()}
            placeholder="Digite o ticker (ex: MXRF11)"
            style={{ flex: 1 }}
            maxLength={6}
          />
          <button 
            className="button" 
            onClick={buscarFII}
            disabled={loading}
            style={{ width: 'auto', padding: '0.875rem 1.5rem' }}
          >
            {loading ? '🔄 Buscando...' : '🔎 Buscar'}
          </button>
        </div>
        <small style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          💡 FIIs populares: MXRF11, HGLG11, XPML11, VISC11, KNRI11, BTLG11, TRXF11, KNCR11, CPTS11
        </small>
      </div>

      {erro && (
        <div className="alert alert-warning" style={{ whiteSpace: 'pre-line' }}>
          {erro}
        </div>
      )}

      {/* MAGIC NUMBER AUTOMÁTICO (aparece assim que buscar) */}
      {magicNumberBasico && (
        <>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            marginTop: '1.5rem',
            color: 'white',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>
              💎 Magic Number do {fiiData.shortName}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '0.75rem', padding: '1.25rem', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Preço atual da cota</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>R$ {magicNumberBasico.cotacao.toFixed(2)}</div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '0.75rem', padding: '1.25rem', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Último rendimento</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>R$ {magicNumberBasico.dividendo.toFixed(2)}</div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '0.75rem', padding: '1.25rem', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Quantidade de cotas</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{magicNumberBasico.cotas}</div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '0.75rem', padding: '1.25rem', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Valor do investimento</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>R$ {magicNumberBasico.investimento.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.25rem', 
              background: 'rgba(16, 185, 129, 0.25)', 
              borderRadius: '0.75rem',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(16, 185, 129, 0.5)'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.95, marginBottom: '0.5rem', textAlign: 'center' }}>
                Com este investimento, compra-se 1 nova cota deste ativo todos os meses.
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', textAlign: 'center', color: '#10b981' }}>
                R$ {magicNumberBasico.dividendo.toFixed(2)} x {magicNumberBasico.cotas} = R$ {magicNumberBasico.renda.toFixed(2)} / mês
              </div>
            </div>
          </div>

          {apiUsada && (
            <div style={{ textAlign: 'center', marginTop: '0.75rem', opacity: 0.6, fontSize: '0.875rem' }}>
              📊 Dados via {apiUsada}
            </div>
          )}
        </>
      )}

      {/* SIMULAÇÃO PERSONALIZADA (usuário escolhe cenário) */}
      {fiiData && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#374151' }}>
              🎯 Simule Seu Próprio Cenário
            </h3>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
              Personalize sua meta de renda mensal e veja quanto tempo levará para atingir:
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">Meta de Renda Mensal (R$)</label>
            <input
              type="number"
              className="input-field"
              value={inputs.metaRendaMensal}
              onChange={(e) => setInputs({...inputs, metaRendaMensal: Number(e.target.value)})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Aporte Mensal (R$)</label>
            <input
              type="number"
              className="input-field"
              value={inputs.aporteMensal}
              onChange={(e) => setInputs({...inputs, aporteMensal: Number(e.target.value)})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Cotas que Já Possui</label>
            <input
              type="number"
              className="input-field"
              value={inputs.cotasAtuais}
              onChange={(e) => setInputs({...inputs, cotasAtuais: Number(e.target.value)})}
            />
          </div>

          <button className="button" onClick={calcularSimulacao}>
            Simular Meu Cenário
          </button>
        </>
      )}

      {resultado && (
        <>
          <div className="results-grid" style={{ marginTop: '1.5rem' }}>
            <ResultCard 
              label="Cotas Necessárias" 
              value={`${resultado.cotasParaMeta} cotas`} 
              type="text"
              large 
            />
            <ResultCard 
              label="Investimento Total" 
              value={resultado.investimentoMeta} 
            />
            <ResultCard 
              label="Tempo Estimado" 
              value={`${resultado.tempoParaMeta} anos`}
              type="text"
            />
            <ResultCard 
              label="Meta Mensal" 
              value={inputs.metaRendaMensal} 
            />
          </div>

          <Chart
            data={resultado.projecao}
            dataKeys={['cotas', 'rendaMensal']}
            colors={['#667eea', '#10b981']}
            xKey="ano"
            height={350}
          />

          <Table
            data={resultado.projecao}
            columns={[
              { key: 'mes', label: 'Mês', format: 'number' },
              { key: 'cotas', label: 'Cotas', format: 'number' },
              { key: 'rendaMensal', label: 'Renda Mensal', format: 'currency' },
              { key: 'valorInvestido', label: 'Investido', format: 'currency' },
              { key: 'dividendosAcumulados', label: 'Dividendos', format: 'currency' }
            ]}
          />

          <div className="alert alert-info">
            <strong>💡 Dica:</strong> O cálculo considera reinvestimento automático de dividendos. 
            Quanto maior o FII, mais tempo leva, mas a renda passiva é proporcional ao investimento.
          </div>
        </>
      )}
    </div>
  );
};
