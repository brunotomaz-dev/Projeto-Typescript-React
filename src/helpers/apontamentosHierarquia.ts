export const apontamentosHierarquia = {
  Ajustes: {
    Recheadora: {
      'Quantidade de Recheio não Conforme': [
        'Bico entupido',
        'Bomba com Falha',
        'Falha durante a dosagem',
        'Falha no sensor de posição',
        'Pão sem corte',
      ],
      'Pão amassado': ['Seleção de Pão com tamanho irregular'],
    },
    Termoformadora: {
      'Bobina desenquadrando na vertical': ['Ajuste de Fotocélula', 'Ajuste de Freio'],
      'Bobina desenquadrando na horizontal': ['Ajuste de posição da Bobina'],
      'Abrindo Bandejas': [
        'Limpeza de Placa',
        'Ajuste de ATM',
        'Ajuste no enquadramento do filme superior',
        'Análise de Formação',
        'Análise de falta de sr comprimido',
        'Ajuste de Temperatura',
        'Troca de Bobina',
        'Análise de corte da faca',
      ],
      'Bandeja Murcha ou Cheia': ['Ajuste na quantidade de gás', 'Ajuste de vácuo', 'Troca de Bobina'],
      'Bandeja deformada ou manchada': ['Troca de Bobina', 'Ajuste na temperatura de Formação'],
      'Bobina inferior saindo da corrente': ['Troca de Bobina', 'Ajuste na posição da Bobina'],
      'Troca de Bobina': ['Troca de Bobina Inferior', 'Troca de Bobina Superior', 'Troca da Ribon'],
    },
    Robô: {
      'Robô Travando': ['Rearme do Robô', 'Ajuste nas Guias das Caixas', 'Ajuste das Guias das Bandejas'],
    },
    'Detector de Metais': {
      'Variação de Peso': ['Solicitado ajuste na dosagem do recheio'],
      'Falha no teste do corpo de prova': ['Reavaliar o último lote produzido'],
    },
    'Seladora de Caixas': {
      'Caixa Rasgada': ['Troca do Lote de Caixas', 'Ajuste na Dimensão da Caixa'],
      'Caixa não Selando': [
        'Troca do Lote de Adesivos',
        'Ajuste na Dimensão da Caixa',
        'Troca do Lote de Caixas',
      ],
    },
    'Armadora de Caixas': {
      'Caixa Rasgada': ['Troca do Lote de Caixas', 'Ajuste na Dimensão da Caixa'],
      'Caixa não Selando': [
        'Troca do Lote de Adesivos',
        'Ajuste na Dimensão da Caixa',
        'Troca do Lote de Caixas',
      ],
    },
  },
  Manutenção: {
    Recheadora: {
      'Quantidade de Recheio não Conforme': [
        'Faca não corta adequadamente',
        'Correção de falha no drive',
        'Falha na bomba de estator',
        'Necessidade de análise',
      ],
      'Pão amassado': [
        'Correção da altura do guia da faca',
        'Faca sem corte afiado',
        'Necessidade de análise',
      ],
      'Alarme constante ou não sai': [
        'Alarme de pressão',
        'Alarme de falha na bomba de dosagem',
        'Alarme de bomba de moega',
      ],
      'Parada de função da máquina': ['Esteira parou', 'Rolete parou', 'Berço parou'],
      'Manutenção Preventiva': ['Preventiva Programada'],
    },
    Termoformadora: {
      'Falha no corte da bandeja': [
        'Ajuste ou troca da faca transversal',
        'Ajuste ou troca da faca longitudinal',
      ],
      'CLP com erro': ['CLP desarmou', 'CLP com erro de comunicação', 'CLP não está respondendo'],
      'Abrindo Bandejas': ['Realizar análise de falha'],
      'Bandeja Murcha ou Cheia': ['Realizar análise de falha'],
      'Bandeja deformada ou manchada': ['Realizar análise de falha'],
      'Bobina inferior saindo da corrente': ['Realizar análise de falha'],
      'Bobina Desenquadrando': ['Quebra do Freio', 'Realizar análise de falha'],
      'Alarme constante ou não sai': [
        'Alarme de fim de filme superior ou inferior',
        'Alarme referente ao gás',
        'Alarme referente ao vácuo',
        'Alarme de fluxo de água',
        'Alarme de falha nos motores',
        'Alarme de falha de avanço',
        'Alarme de falha de codificadores',
        'Alarme de não detecta conjunto acima',
        'Alarme de não detecta conjunto abaixo',
        'Alarme de falha na pressão do circuito pneumático',
        'Alarme de grade de segurança aberta',
        'Alarme de temperatura',
      ],
      'Esteira parou': [
        'Esteira parada',
        'Esteira quebrada',
        'Esteira com falha no motor',
        'Esteira com falha no sensor',
      ],
      'Manutenção Preventiva': ['Preventiva Programada'],
    },
    Robô: {
      'Robô Travando': ['Rearme do Robô', 'Ajuste nas Guias das Caixas', 'Ajuste das Guias das Bandejas'],
      'Manutenção Preventiva': ['Preventiva Programada'],
    },
    'Detector de Metais': {
      'Variação de Peso': ['Solicitado ajuste na dosagem do recheio'],
      'Falha no teste do corpo de prova': ['Reavaliar o último lote produzido'],
      'Manutenção Preventiva': ['Preventiva Programada'],
    },
    'Seladora de Caixas': {
      'Caixa Rasgada': ['Troca do Lote de Caixas', 'Ajuste na Dimensão da Caixa'],
      'Caixa não Selando': [
        'Troca do Lote de Adesivos',
        'Ajuste na Dimensão da Caixa',
        'Troca do Lote de Caixas',
      ],
      'Manutenção Preventiva': ['Preventiva Programada'],
    },
    'Armadora de Caixas': {
      'Caixa Rasgada': ['Troca do Lote de Caixas', 'Ajuste na Dimensão da Caixa'],
      'Caixa não Selando': [
        'Troca do Lote de Adesivos',
        'Ajuste na Dimensão da Caixa',
        'Troca do Lote de Caixas',
      ],
      'Manutenção Preventiva': ['Preventiva Programada'],
    },
  },
  Setup: {
    Recheadora: {
      'Troca de Produto': ['Troca de Faca', 'Troca de Recheadora'],
      'Troca de Sabor': [
        'Troca para sabor Tradicional',
        'Troca para sabor Picante',
        'Troca para sabor Doce',
        'Troca para sabor Cebola',
      ],
    },
    Termoformadora: {
      'Troca de Produto': [
        'Troca de molde para baguete 400g',
        'Troca de molde para baguete 240g',
        'Troca de molde para bolinha',
      ],
      'Troca de Sabor': [
        'Troca para bobina Tradicional 400g',
        'Troca para bobina Picante 400g',
        'Troca para bobina Doce Bolinha',
        'Troca para bobina Cebola 400g',
        'Troca para bobina Tradicional Bolinha',
        'Troca para bobina Doce Swift',
        'Troca para bobina Cebola Bolinha',
        'Troca para bobina Picante 240g',
        'Troca para bobina Tradicional 240g',
        'Troca para bobina Tradicional 400g Paraguai',
        'Troca para bobina Picante 400g Paraguai',
        'Troca para bobina Tradicional 240g Paraguai',
        'Troca para bobina Cebola 400g Paraguai',
        'Troca para bobina Picante 240g Paraguai',
        'Troca para bobina Pepperoni 240g',
      ],
    },
  },
  Qualidade: {
    Termoformadora: {
      'Parâmetros de Qualidade': [
        'Bandeja com formação não conforme',
        'Solda não conforme',
        'ATM fora do padrão',
        'Data manchado ou ilegível',
        'Data fora de posição',
        'Esquadro da bandeja inadequado',
        'Corte inadequado',
        'Rebarba no corte da bandeja',
        'Limpeza de Placa',
      ],
    },
    Recheadora: {
      'Risco de Contaminação': [
        'Elemento Mecânico',
        'Odor Diferente',
        'Pasta com Tempo ALto',
        'Limpeza da Esteira de Lamecação',
        'Limpeza do Filtro',
      ],
    },
  },
  Fluxo: {
    Recheadora: {
      'Falta de Pão': ['Pão sem tamanho uniforme', 'Temperatura do pão', 'Panificação com máquina quebrada'],
      'Falta de Pasta': [
        'Reator quebrado',
        'Bomba com problemas',
        'Batida de pasta interrompida pela qualidade',
      ],
    },
    Termoformadora: {
      'Esteira Cheia': [
        'Robô parado',
        'Detector de metais com problema',
        'Problema com montagem de caixas',
        'Esteira parada',
      ],
      'Falta de Energia': ['Falta de energia elétrica'],
    },
  },
  Limpeza: {
    Linha: {
      'Limpeza para parada de Fábrica': ['Limpeza para parada de Fábrica'],
    },
  },
  'Parada Programada': {
    Linha: {
      Revezamento: [
        'Revezamento de Refeição',
        'Revezamento de Café e Ginástica Laboral',
        'Revezamento de Reunião',
      ],
      'Parada Planejada': ['Refeição', 'Café e Ginástica Laboral', 'Reunião', 'Backup', 'Sem Produção'],
      'Parada para Treinamento': [
        'Relacionado a Qualidade',
        'Relacionado a Melhoria',
        'Kaizen',
        'Solução de Problemas',
      ],
    },
  },
};

export const equipamentos = [
  'Recheadora',
  'Termoformadora',
  'Robô',
  'Detector de Metais',
  'Seladora de Caixas',
  'Armadora de Caixas',
  'Linha',
];

export const afetaEficiencia = [
  { valor: 0, label: 'Sim' },
  { valor: 1, label: 'Não' },
];
