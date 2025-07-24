// Definindo tipos e constantes globais
export const CICLOS_ESPERADOS = 11.2;
export const CICLOS_ESPERADOS_BOL = 7;

export type TurnoID = 'MAT' | 'VES' | 'NOT' | 'ALL';

export const TurnosObj = [
  { id: 1, name: 'Noturno', turno: 'NOT' },
  { id: 3, name: 'Matutino', turno: 'MAT' },
  { id: 2, name: 'Vespertino', turno: 'VES' },
];

export enum Turno {
  MAT = 'MAT',
  VES = 'VES',
  NOT = 'NOT',
}

export const getTurnoName = (turno: TurnoID) => {
  const turnoObj = TurnosObj.find((t) => t.turno === turno);
  return turnoObj ? turnoObj.name : turno;
};

export const superTurns: Record<string, TurnoID> = {
  // ['Cláudia Antunes']: 'MAT',
  ['Rogério Inácio']: 'MAT',
  ['Renan Oliveira']: 'VES',
  ['Leandro Moraes']: 'NOT',
  ['Rogério Pereira']: 'MAT',
  ['Marcos Gomes']: 'MAT',
  ['Eduardo Silva']: 'MAT',
  ['Gabriel França']: 'MAT',
  ['Kelven Silva']: 'MAT',
  ['Silvio Jr']: 'MAT',
  ['Tatiani Domingues']: 'NOT',
  ['Wellington Augusto']: 'NOT',
  ['Everton Oliveira']: 'NOT',
  ['Elton Martins']: 'NOT',
  ['Bruno Rego']: 'VES',
  ['Bruno Rosa']: 'VES',
  ['João Batista']: 'VES',
  ['Lizete Maia']: 'MAT',
  ['Developer Teste']: 'MAT',
};

export enum ActionPlanStatus {
  Aberto = 0,
  Concluído = 1,
  Cancelado = 2,
  PDCA = 3,
}

export enum IndicatorType {
  PERFORMANCE = 'performance',
  REPAIR = 'reparo',
  EFFICIENCY = 'eficiencia',
}

export enum RecheioMeta {
  PERFORMANCE = 4,
  REPAIR = 4,
  EFFICIENCY = 90,
}

export enum ColorsSTM {
  RED = '#E30613',
  LIGHT_GREY = '#E3E3E3',
  YELLOW = '#FFDD00',
  GREEN = '#00A13A',
}

export enum BSColors {
  PRIMARY_COLOR = '#0d6efd',
  SECONDARY_COLOR = '#6c757d',
  SUCCESS_COLOR = '#00A13A',
  WARNING_COLOR = '#ffc107',
  DANGER_COLOR = '#E30613',
  INFO_COLOR = '#0dcaf0',
  TEAL_COLOR = '#20c997',
  INDIGO_COLOR = '#6610f2',
  GRAY_COLOR = '#adb5bd',
  GREY_400_COLOR = '#ced4da',
  GREY_500_COLOR = '#adb5bd',
  GREY_600_COLOR = '#6c757d',
  GREY_700_COLOR = '#495057',
  GREY_800_COLOR = '#343a40',
  GREY_900_COLOR = '#212529',
  ORANGE_COLOR = '#fd7e14',
  PINK_COLOR = '#d63384',
  PURPLE_COLOR = '#6f42c1',
  SPACE_CADET_COLOR = '#282f44',
  BLUE_DELFT_COLOR = '#353e5a',
  CAT_POLY_GREEN_COLOR = '#1E441E',
  CAFE_COLOR = '#854A32',
}

export const DESC_EFF = {
  'Troca de Sabor': 15,
  'Troca de Produto': 35,
  Refeição: 65,
  'Café e Ginástica Laboral': 10,
  Treinamento: 60,
};

export const NOT_EFF = [
  'Sem Produção',
  'Backup',
  'Limpeza para parada de Fábrica',
  'Saída para backup',
  'Revezamento',
  'Manutenção Preventiva',
  'Manutenção Corretiva Programada',
];

export const DETECTORES_ID = [
  { id: 1, name: 'Detector Linha 1' },
  { id: 2, name: 'Detector Linha 2' },
  { id: 3, name: 'Detector Linha 3' },
  { id: 4, name: 'Detector Linha 4' },
  { id: 5, name: 'Detector Linha 5' },
  { id: 6, name: 'Detector Linha 6' },
  { id: 7, name: 'Detector Linha 7' },
];

const iconMap: Record<string, string> = {
  Rodando: 'bi-play-circle-fill',
  Refeição: 'bi-cup-hot',
  Ajustes: 'bi-gear',
  Manutenção: 'bi-wrench',
  Setup: 'bi-tools',
  Fluxo: 'bi-arrow-right-circle',
  Qualidade: 'bi-shield-check',
  'Saída para Backup': 'bi-archive',
  Liberada: 'bi-unlock',
  Limpeza: 'bi-brush',
  'Parada Programada': 'bi-calendar-x',
  'Não apontado': 'bi-exclamation-triangle',
  'Perda de Ciclo': 'bi-speedometer2',
};

const iconMapCausa: Record<string, string> = {
  Refeição: 'bi-cup-hot',
  'Café e Ginástica Laboral': 'bi-cup',
};

export const getMotivoIcon = (motivo?: string, causa?: string): string => {
  // Priorizar refeição se estiver na causa
  if (causa && iconMapCausa[causa]) {
    return iconMapCausa[causa] || 'bi-circle';
  }

  // Se motivo não for passado, retorna ícone de pergunta
  if (!motivo) return 'bi-question-circle';
  // Retorna o ícone correspondente ao motivo
  return iconMap[motivo] || 'bi-circle';
};

export const colorObj: Record<string, string> = {
  ['Rodando']: BSColors.SUCCESS_COLOR,
  ['Refeição']: BSColors.PINK_COLOR,
  ['Ajustes']: BSColors.PRIMARY_COLOR,
  ['Manutenção']: BSColors.SPACE_CADET_COLOR,
  ['Setup']: BSColors.BLUE_DELFT_COLOR,
  ['Fluxo']: BSColors.INDIGO_COLOR,
  ['Qualidade']: BSColors.INFO_COLOR,
  ['Saída para Backup']: BSColors.TEAL_COLOR,
  ['Liberada']: BSColors.GREY_500_COLOR,
  ['Limpeza']: BSColors.ORANGE_COLOR,
  ['Parada Programada']: BSColors.DANGER_COLOR,
  ['Não apontado']: BSColors.WARNING_COLOR,
  ['Perda de Ciclo']: BSColors.CAT_POLY_GREEN_COLOR,
};

const colorObjCausa: Record<string, string> = {
  ['Refeição']: BSColors.PINK_COLOR,
  ['Café e Ginástica Laboral']: BSColors.CAFE_COLOR,
};

// Função para obter cor do motivo
export const getMotivoColor = (motivo?: string, causa?: string): string => {
  // Priorizar refeição se estiver na causa
  if (causa && colorObjCausa[causa]) {
    return colorObjCausa[causa] || BSColors.PINK_COLOR;
  }

  if (!motivo) return BSColors.WARNING_COLOR;
  return colorObj[motivo] || BSColors.GREY_600_COLOR;
};

export const indicatorsActionPlan: Record<string, string> = {
  Q: 'Qualidade',
  D: 'Desempenho',
  S: 'Segurança',
  C: 'Custo',
};
