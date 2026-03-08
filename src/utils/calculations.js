// Dados atualizados de 2026
export const DADOS_2026 = {
  selic: 15.0,
  cdi: 14.5,
  inflacao: 4.0,
  salarioMinimo: 1621.0,
  
  // Energia Solar
  energiaSolar: {
    custoKwp: { min: 3500, max: 5000 },
    economiaMensal: { '3kwp': 240, '5kwp': 400, '8kwp': 650 },
    tarifaMedia: 0.80
  },
  
  // Financiamento Imobiliário
  financiamento: {
    taxas: {
      mcmv: { min: 4.0, max: 8.16 },
      sbpeTR: { min: 10.99, max: 12.0 },
      cdi: { min: 11.0, max: 13.5 }
    }
  },
  
  // MEI
  mei: {
    inss: 81.05,
    icms: 1.0,
    iss: 5.0
  }
};

// Cálculo de Juros Compostos
export const calcularJurosCompostos = (principal, taxa, anos, aporteMensal = 0) => {
  const taxaMensal = taxa / 12 / 100;
  const meses = anos * 12;
  let valores = [];
  let montante = principal;
  
  for (let i = 0; i <= meses; i++) {
    if (i > 0) {
      montante = montante * (1 + taxaMensal) + aporteMensal;
    }
    
    if (i % 12 === 0) {
      const ano = i / 12;
      const totalInvestido = principal + (aporteMensal * i);
      const rendimento = montante - totalInvestido;
      
      valores.push({
        ano,
        montante: Math.round(montante * 100) / 100,
        investido: Math.round(totalInvestido * 100) / 100,
        rendimento: Math.round(rendimento * 100) / 100
      });
    }
  }
  
  return valores;
};

// Cálculo FIRE (Independência Financeira)
export const calcularFIRE = (gastoMensal, patrimonioAtual, aporteMensal, rentabilidade) => {
  const metaFIRE = gastoMensal * 12 * 25; // Regra 25x
  const taxaMensal = rentabilidade / 12 / 100;
  
  let patrimonio = patrimonioAtual;
  let anos = 0;
  let dados = [{ ano: 0, patrimonio: patrimonioAtual }];
  
  while (patrimonio < metaFIRE && anos < 50) {
    for (let mes = 0; mes < 12; mes++) {
      patrimonio = patrimonio * (1 + taxaMensal) + aporteMensal;
    }
    anos++;
    dados.push({ ano: anos, patrimonio: Math.round(patrimonio) });
  }
  
  const rendaMensalFIRE = (metaFIRE * (rentabilidade / 100)) / 12;
  
  return {
    metaFIRE,
    anosParaFIRE: anos <= 50 ? anos : 'Mais de 50',
    rendaMensalFIRE,
    projecao: dados.slice(0, 31)
  };
};

// Cálculo Energia Solar
export const calcularEnergiaSolar = (consumoMensal, tarifaKwh) => {
  const potenciaNecessaria = consumoMensal / 150; // Média 150 kWh por kWp
  const custoMedioKwp = 4250;
  const custoTotal = potenciaNecessaria * custoMedioKwp;
  const economiaMensal = consumoMensal * tarifaKwh * 0.95; // 95% de compensação
  const payback = custoTotal / economiaMensal;
  
  // Projeção 25 anos
  const projecao = [];
  let economiaAcumulada = 0;
  
  for (let ano = 1; ano <= 25; ano++) {
    economiaAcumulada += economiaMensal * 12;
    const roi = ((economiaAcumulada - custoTotal) / custoTotal) * 100;
    
    projecao.push({
      ano,
      economiaAnual: Math.round(economiaMensal * 12),
      economiaAcumulada: Math.round(economiaAcumulada),
      roi: Math.round(roi * 10) / 10
    });
  }
  
  return {
    potenciaNecessaria: Math.round(potenciaNecessaria * 10) / 10,
    custoTotal: Math.round(custoTotal),
    economiaMensal: Math.round(economiaMensal),
    economiaAnual: Math.round(economiaMensal * 12),
    payback: Math.round(payback * 10) / 10,
    economiaTotal25Anos: Math.round(economiaMensal * 12 * 25),
    projecao: projecao.filter(p => p.ano <= 10 || p.ano % 5 === 0)
  };
};

// Cálculo Financiamento Imobiliário
export const calcularFinanciamento = (valorImovel, entrada, prazoAnos, taxaAnual) => {
  const valorFinanciado = valorImovel - entrada;
  const taxaMensal = taxaAnual / 12 / 100;
  const prazoMeses = prazoAnos * 12;
  
  // Tabela Price
  const prestacao = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
                     (Math.pow(1 + taxaMensal, prazoMeses) - 1);
  
  const totalPago = prestacao * prazoMeses;
  const totalJuros = totalPago - valorFinanciado;
  
  // Evolução do saldo devedor
  let saldo = valorFinanciado;
  const evolucao = [];
  
  for (let ano = 0; ano <= prazoAnos; ano++) {
    const mes = ano * 12;
    if (mes < prazoMeses) {
      const jurosAcumulados = (prestacao * mes) - (valorFinanciado - saldo);
      evolucao.push({
        ano,
        saldo: Math.round(saldo),
        jurosAcumulados: Math.round(jurosAcumulados),
        amortizadoAcumulado: Math.round(valorFinanciado - saldo)
      });
      
      // Atualiza saldo para próximo ano
      for (let m = 0; m < 12; m++) {
        const juros = saldo * taxaMensal;
        const amortizacao = prestacao - juros;
        saldo -= amortizacao;
      }
    }
  }
  
  return {
    valorFinanciado: Math.round(valorFinanciado),
    prestacao: Math.round(prestacao),
    totalPago: Math.round(totalPago),
    totalJuros: Math.round(totalJuros),
    custoEfetivo: Math.round((totalJuros / valorFinanciado) * 100 * 10) / 10,
    evolucao: evolucao.filter((e, i) => i === 0 || i % 5 === 0 || i === evolucao.length - 1)
  };
};

// Cálculo Impostos MEI
export const calcularMEI = (faturamentoAnual, tipoAtividade) => {
  const { inss, icms, iss } = DADOS_2026.mei;
  
  let valorMensal = inss;
  if (tipoAtividade === 'comercio') {
    valorMensal += icms;
  } else if (tipoAtividade === 'servicos') {
    valorMensal += iss;
  } else if (tipoAtividade === 'ambos') {
    valorMensal += icms + iss;
  }
  
  const totalAnual = valorMensal * 12;
  const limiteAnual = 81000;
  const percentualFaturamento = (totalAnual / faturamentoAnual) * 100;
  const lucroLiquido = faturamentoAnual - totalAnual;
  
  const projecao = [];
  for (let ano = 1; ano <= 5; ano++) {
    const faturamentoProjetado = faturamentoAnual * Math.pow(1.05, ano - 1);
    projecao.push({
      ano,
      faturamento: Math.round(faturamentoProjetado),
      impostos: totalAnual,
      lucroLiquido: Math.round(faturamentoProjetado - totalAnual),
      aliquotaEfetiva: ((totalAnual / faturamentoProjetado) * 100).toFixed(2)
    });
  }
  
  return {
    valorMensal: Math.round(valorMensal * 100) / 100,
    totalAnual: Math.round(totalAnual * 100) / 100,
    percentualFaturamento: Math.round(percentualFaturamento * 100) / 100,
    lucroLiquido: Math.round(lucroLiquido),
    limiteAnual,
    dentroDolimite: faturamentoAnual <= limiteAnual,
    projecao
  };
};
