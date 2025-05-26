import { useCallback, useMemo } from 'react';
import { useAppSelector } from '../redux/store/hooks';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'flag';
export type PermissionResource = 'absence' | 'presence' | 'action_plan' | 'ihm_appointments';
export type PermissionElement = 'btn_pin_action' | 'post_it_action' | 'btn_OS_preventive_history';

export type PermissionPage =
  | 'supervision'
  | 'shop_floor'
  | 'hour_production'
  | 'live_lines'
  | 'management'
  | 'action_plan_management'
  | 'preventive'
  | 'manusis';

// Contexto funcional (cargos)
type FunctionalRole =
  | 'Operadores'
  | 'Lideres'
  | 'Analistas'
  | 'Supervisores'
  | 'Especialistas'
  | 'Coordenadores'
  | 'Gerentes'
  | 'Diretores'
  | 'Dev';

// Contexto setorial
type SectorRole = 'Produção' | 'Manutenção' | 'Qualidade' | 'PCP' | 'TI' | 'Basic' | 'Almoxarifado';

// Mapear níveis para cada contexto
export const functionalLevelMap: Record<FunctionalRole, number> = {
  Operadores: 0.5,
  Lideres: 1,
  Supervisores: 2,
  Analistas: 2,
  Especialistas: 3,
  Coordenadores: 3,
  Gerentes: 4,
  Diretores: 5,
  Dev: 99,
};

export const sectorAccessMap: Record<SectorRole, string[]> = {
  Basic: ['shop_floor', 'live_lines'],
  Produção: ['supervision', 'hour_production', 'management'],
  Manutenção: ['manusis', 'management', 'preventive'],
  Qualidade: [''],
  PCP: [''],
  Almoxarifado: [''],
  TI: ['all'],
};

// Tipo para exceções de usuário
type UserException = {
  resources: {
    [key in PermissionResource]?: PermissionAction[];
  };
  pages?: PermissionPage[];
};

// Mapa de exceções de usuário
// Usuários específicos que possuem permissões especiais independentemente do nível
const userExceptions: Record<string, UserException> = {
  'Cláudia Antunes': {
    resources: {
      ihm_appointments: ['delete', 'flag'],
    },
  },
  'Rogério Inácio': {
    resources: {
      ihm_appointments: ['flag'],
    },
  },
  'Renan Oliveira': {
    resources: {
      ihm_appointments: ['flag'],
    },
  },
  'Tatiani Domingues': {
    resources: {
      ihm_appointments: ['view', 'update', 'create', 'flag'],
    },
    pages: ['management'],
  },
  'Leandro Moraes': {
    resources: {
      ihm_appointments: ['flag'],
    },
  },
  'Gabriel França': {
    resources: {
      ihm_appointments: ['view', 'update', 'create', 'flag'],
    },
    pages: ['management'],
  },
  'João Batista': {
    resources: {
      ihm_appointments: ['view', 'update', 'create', 'flag'],
    },
    pages: ['management'],
  },
  'Bruno Rosa': {
    resources: {
      ihm_appointments: ['view', 'update', 'create'],
    },
  },
};

/* ------------------------------------------------------------------------------------------------------------------ */
/*                                                        HOOK                                                        */
/* ------------------------------------------------------------------------------------------------------------------ */
export function usePermissions() {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // Recebe os grupos do usuário logado
  const userGroups = useAppSelector((state) => state.user.groups);
  // Recebe o nome completo do usuário
  const userName = useAppSelector((state) => state.user.fullName);
  // Recebe função e setor dos grupos
  const userFunctionalLevel = useAppSelector((state) => state.user.functionalLevel);
  const sectorGroups = useAppSelector((state) => state.user.sectors);

  // Recebe Role do usuário
  const userRole = useAppSelector((state) => state.user.functionalRole);

  /* -------------------------------- VERIFICAÇÃO DE SUPER USUÁRIO -------------------------------- */
  const isSuperUser = useMemo(() => userGroups.includes('Dev'), [userGroups]);

  /* ----------------------------- VERIFICAÇÃO DE EXCEÇÕES DE USUÁRIO ---------------------------- */
  // Verifica se o usuário atual tem exceções
  const userException = useMemo(() => (userName ? userExceptions[userName] : undefined), [userName]);

  /* -------------------------------------- ACESSO A PÁGINAS -------------------------------------- */
  // Verifica acesso a páginas
  const hasPageAccess = useCallback(
    (page: PermissionPage): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Verificar exceções específicas
      if (userException?.pages?.includes(page)) return true;

      // Requisitos específicos para cada página
      const pageRequirements: Record<
        PermissionPage,
        {
          minLevel: number;
          requiredSectors?: string[];
          customCheck?: (userFunctionalLevel: number, sectorGroups: string[]) => boolean;
        }
      > = {
        supervision: { minLevel: 1 },
        shop_floor: { minLevel: 0.5 },
        hour_production: { minLevel: 1 },
        live_lines: { minLevel: 0.5 },
        management: { minLevel: 2 },
        action_plan_management: { minLevel: 3 },
        manusis: {
          minLevel: 1,
          customCheck: (fLvl, sectors) => {
            // Se for do setor de Manutenção, nível mínimo é 2
            if (sectors.includes('Manutenção')) {
              return fLvl >= 1;
            }
            // Se for de outro setor, nível mínimo é 3
            return fLvl >= 3;
          },
        },
        preventive: {
          minLevel: 3, // Nível padrão para outros setores
          customCheck: (fLvl, sectors) => {
            // Se for do setor de Manutenção, nível mínimo é 2
            if (sectors.includes('Manutenção')) {
              return fLvl >= 2;
            }
            // Se for de outro setor, nível mínimo é 3
            return fLvl >= 3;
          },
        },
      };

      const requirements = pageRequirements[page];

      // Se existe uma verificação personalizada, use-a
      if (requirements.customCheck) {
        return requirements.customCheck(userFunctionalLevel, sectorGroups);
      }

      // Verificar nível funcional
      if (userFunctionalLevel < requirements.minLevel) return false;

      // Verificar setores necessários (se definidos)
      if (
        requirements.requiredSectors &&
        !requirements.requiredSectors.some((sector) => sectorGroups.includes(sector))
      ) {
        return false;
      }

      return true;
    },
    [isSuperUser, userFunctionalLevel, sectorGroups, userException]
  );

  /* ------------------------------------- Acesso A Recursos ------------------------------------ */
  // Verifica acesso a recursos e ações
  const hasResourcePermission = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Verificar exceções específicas
      if (userException?.resources?.[resource]?.includes(action)) return true;

      // Definir requisitos para cada recurso e ação
      const resourceRequirements: Record<
        PermissionResource,
        Record<
          PermissionAction,
          {
            minLevel: number;
            requiredSectors?: string[];
          }
        >
      > = {
        absence: {
          view: { minLevel: 0 },
          create: { minLevel: 1, requiredSectors: ['Produção'] },
          update: { minLevel: 1, requiredSectors: ['Produção'] },
          delete: { minLevel: 2, requiredSectors: ['Produção'] },
          flag: { minLevel: 3, requiredSectors: ['Produção'] },
        },
        presence: {
          view: { minLevel: 0 },
          create: { minLevel: 1, requiredSectors: ['Produção'] },
          update: { minLevel: 1, requiredSectors: ['Produção'] },
          delete: { minLevel: 2, requiredSectors: ['Produção'] },
          flag: { minLevel: 3, requiredSectors: ['Produção'] },
        },
        action_plan: {
          view: { minLevel: 1 },
          create: { minLevel: 1 },
          update: { minLevel: 1 },
          delete: { minLevel: 2 },
          flag: { minLevel: 3 },
        },
        ihm_appointments: {
          view: { minLevel: 2 },
          create: { minLevel: 2, requiredSectors: ['Produção'] },
          update: { minLevel: 2, requiredSectors: ['Produção'] },
          delete: { minLevel: 3, requiredSectors: ['Produção'] },
          flag: { minLevel: 3, requiredSectors: ['Produção'] },
        },
      };

      const requirements = resourceRequirements[resource]?.[action];
      if (!requirements) return false;

      // Verificar nível funcional
      if (userFunctionalLevel < requirements.minLevel) return false;

      // Verificar setores necessários (se definidos)
      if (
        requirements.requiredSectors &&
        !requirements.requiredSectors.some((sector) => sectorGroups.includes(sector))
      ) {
        return false;
      }

      return true;
    },
    [isSuperUser, userFunctionalLevel, sectorGroups, userException]
  );

  /* --------------------------------------- Elementos UI --------------------------------------- */
  // Verificação para botões e elementos da UI
  const hasElementAccess = useCallback(
    (elementId: PermissionElement): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Definir requisitos para cada elemento
      const elementRequirements: Record<
        PermissionElement,
        {
          minLevel?: number;
          requiredSectors?: string[];
          customCheck?: (userFunctionalLevel: number, sectorGroups: string[]) => boolean;
        }
      > = {
        btn_pin_action: { minLevel: 3 },
        post_it_action: { minLevel: 2, requiredSectors: ['Produção'] },
        btn_OS_preventive_history: {
          customCheck: (fLvl, sec) => {
            if (fLvl >= 3) return true; // Permite para níveis 3 ou superiores
            if (fLvl === 2 && sec.includes('Manutenção')) return true; // Permite para nível 2 se setor for Manutenção
            return false; // Caso contrário, não permite
          },
        },
      };

      const requirements = elementRequirements[elementId];
      if (!requirements) return true; // Se não definido, permite por padrão

      // Verifica se há uma verificação personalizada
      if (requirements.customCheck) {
        return requirements.customCheck(userFunctionalLevel, sectorGroups);
      }

      // Verificar nível funcional
      if (requirements.minLevel && userFunctionalLevel < requirements.minLevel) return false;

      // Verificar setores necessários (se definidos)
      if (
        requirements.requiredSectors &&
        !requirements.requiredSectors.some((sector) => sectorGroups.includes(sector))
      ) {
        return false;
      }

      return true;
    },
    [isSuperUser, userFunctionalLevel, sectorGroups]
  );

  /* ---------------------------------------------------------------------------------------------- */
  /*                                         RETORNO DO HOOK                                        */
  /* ---------------------------------------------------------------------------------------------- */
  return {
    hasResourcePermission,
    hasPageAccess,
    hasElementAccess,
    userFunctionalLevel,
    userSectors: sectorGroups,
    isSuperUser,
    userName,
    userRole,
  };
}
