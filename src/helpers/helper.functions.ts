// Função para tornar string Title Case
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Função para identificar o tipo de pasta
export const extrairTipoPasta = (produto: string): string => {
  const pastaMappings: Record<string, string> = {
    ALHO: 'Alho Tradicional',
    DOCE: 'Alho Doce',
    CEBOLA: 'Cebola',
    PEPPERONI: 'Pepperoni',
  };

  for (const [key, value] of Object.entries(pastaMappings)) {
    if (produto.includes(key)) {
      // Adicionar "Picante" se tiver PIC
      if (produto.includes('PIC')) {
        return `${value} Picante`;
      }
      return value;
    }
  }

  return '?';
};

// Função para extrair o tipo de pão (Bolinha ou Baguete)
export const extrairTipoPao = (produto: string): string => {
  return produto.includes(' BOL') ? 'Bolinha' : 'Baguete';
};
