// Definindo tipos
type GroupLevel = string[];
type GroupLevels = Record<number, GroupLevel>;

export const CICLOS_ESPERADOS = 11.2
export const CICLOS_ESPERADOS_BOL = 7

// Aplicando os tipos
export const groupLevels: GroupLevels = {
  1: ['Dev'],
  2: ['Dev', 'Gerentes'],
  3: ['Dev', 'Gerentes', 'Coordenadores'],
  4: ['Dev', 'Gerentes', 'Coordenadores', 'Supervisores'],
  5: ['Dev', 'Gerentes', 'Coordenadores', 'Supervisores', 'Líderes'],
};

export enum IndicatorType {
  PERFORMANCE = 'performance',
  REPAIR = 'reparo',
  EFFICIENCY = 'eficiencia'
}

export enum RecheioMeta {
  PERFORMANCE = 4,
  REPAIR = 4,
  EFFICIENCY = 90
}

export enum ColorsSTM {
  RED = "#E30613",
  LIGHT_GREY = "#E3E3E3",
  YELLOW = "#FFDD00",
  GREEN = "#00A13A"
}

export const TurnosObj = [
  { id: 1, name: 'Matutino', turno: 'MAT' },
  { id: 2, name: 'Vespertino', turno: 'VES' },
  { id: 3, name: 'Noturno', turno: 'NOT' },
] 

export enum BSColors {
  PRIMARY_COLOR = "#0d6efd",
  SECONDARY_COLOR = "#6c757d",
  SUCCESS_COLOR = "#00A13A",
  WARNING_COLOR = "#ffc107",
  DANGER_COLOR = "#E30613",
  INFO_COLOR = "#0dcaf0",
  TEAL_COLOR = "#20c997",
  INDIGO_COLOR = "#6610f2",
  GRAY_COLOR = "#adb5bd",
  GREY_400_COLOR = "#ced4da",
  GREY_500_COLOR = "#adb5bd",
  GREY_600_COLOR = "#6c757d",
  GREY_700_COLOR = "#495057",
  GREY_800_COLOR = "#343a40",
  GREY_900_COLOR = "#212529",
  ORANGE_COLOR = "#fd7e14",
  PINK_COLOR = "#d63384",
  PURPLE_COLOR = "#6f42c1",
  SPACE_CADET_COLOR = "#282f44",
  BLUE_DELFT_COLOR = "#353e5a",
}

export const colorObj = {
  ["Rodando"]: BSColors.SUCCESS_COLOR,
  ["Refeição"]: BSColors.PINK_COLOR,
  ["Ajustes"]: BSColors.PRIMARY_COLOR,
  ["Manutenção"]: BSColors.SPACE_CADET_COLOR,
  ["Setup"]: BSColors.BLUE_DELFT_COLOR,
  ["Fluxo"]: BSColors.INDIGO_COLOR,
  ["Qualidade"]: BSColors.INFO_COLOR,
  ["Saída para Backup"]: BSColors.TEAL_COLOR,
  ["Liberada"]: BSColors.GREY_500_COLOR,
  ["Limpeza"]: BSColors.ORANGE_COLOR,
  ["Parada Programada"]: BSColors.DANGER_COLOR,
  ["Não apontado"]: BSColors.WARNING_COLOR,
}

export const DESC_EFF = {
  "Troca de Sabor": 15,
  "Troca de Produto": 35,
  "Refeição": 65,
  "Café e Ginástica Laboral": 10,
  "Treinamento": 60,
}

export const NOT_EFF = [
  "Sem Produção",
  "Backup",
  "Limpeza para parada de Fábrica",
  "Saída para backup",
  "Revezamento",
  "Manutenção Preventiva",
  "Manutenção Corretiva Programada",
]