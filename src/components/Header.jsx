export const Header = ({ activeCalc, calcNames }) => {
  const titles = {
    juros: { title: 'Juros Compostos', sub: 'Simule o crescimento do seu investimento ao longo do tempo' },
    fire: { title: 'FIRE / Renda Passiva', sub: 'Calcule quanto você precisa para se aposentar com liberdade financeira' },
    fii: { title: 'Magic Number FII', sub: 'Descubra quantas cotas você precisa para viver de dividendos' },
    bazin: { title: 'Método Bazin', sub: 'Avalie ações pagadoras de dividendos com o critério de Décio Bazin' },
    graham: { title: 'Método Graham', sub: 'Calcule o valor intrínseco e a margem de segurança de uma ação' },
    buffett: { title: 'Método Buffett', sub: 'Analise a qualidade e o valuation da empresa como Warren Buffett' },
    fisher: { title: 'Método Fisher', sub: 'Identifique growth stocks de alto potencial com o método Philip Fisher' },
    solar: { title: 'Energia Solar', sub: 'Calcule a economia e o retorno do investimento em painéis solares' },
    imovel: { title: 'Financiamento Imobiliário', sub: 'Simule parcelas e compare sistemas SAC e Price' },
    mei: { title: 'Impostos MEI', sub: 'Calcule impostos, pró-labore e margem líquida para MEI' },
  };

  const info = titles[activeCalc] || { title: 'SimulaGrana', sub: 'Calculadoras financeiras profissionais' };

  return (
    <div className="hero-banner">
      <div>
        <h1>{info.title}</h1>
        <p>{info.sub}</p>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-dot"></div>
          10 Calculadoras
        </div>
        <div className="hero-stat">
          <div className="hero-stat-dot"></div>
          Dados de 2026
        </div>
        <div className="hero-stat">
          <div className="hero-stat-dot"></div>
          100% Gratuito
        </div>
      </div>
    </div>
  );
};
