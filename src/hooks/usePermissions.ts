import { useCallback, useMemo } from 'react';
import { useAppSelector } from '../redux/store/hooks';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'flag';
export type PermissionResource = 'absence' | 'presence' | 'action_plan' | 'ihm_appointments';
export type PermissionPage =
  | 'supervision'
  | 'shop_floor'
  | 'hour_production'
  | 'live_lines'
  | 'management'
  | 'manusis';

type roleTypes =
  | 'Líderes'
  | 'Supervisores'
  | 'Analistas'
  | 'Especialistas'
  | 'Coordenadores'
  | 'Gerentes'
  | 'Dev'
  | 'Basic'
  | 'Manutenção';
export const levelMap: Record<roleTypes, number> = {
  Basic: 0.5,
  Líderes: 1,
  Analistas: 2,
  Supervisores: 2,
  Especialistas: 3,
  Coordenadores: 3,
  Gerentes: 4,
  Manutenção: 10,
  Dev: 99,
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
  },
  'João Batista': {
    resources: {
      ihm_appointments: ['view', 'update', 'create', 'flag'],
    },
  },
  // Exemplo: Maria Oliveira tem acesso à página de supervisão e pode gerenciar ausências
  'Maria Oliveira': {
    resources: {
      absence: ['view', 'create', 'update'],
    },
    pages: ['supervision'],
  },
  // Adicione outros usuários com exceções aqui
};

export function usePermissions() {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // Recebe o nível do usuário logado
  const userLvl = useAppSelector((state) => state.user.level);
  // Recebe os grupos do usuário logado
  const userGroups = useAppSelector((state) => state.user.groups);
  // Recebe o nome completo do usuário
  const userName = useAppSelector((state) => state.user.fullName);

  /* --------------------------------- MAPA DE NÍVEIS POR RECURSO --------------------------------- */
  const permissionsLevels = useMemo(
    () => ({
      absence: {
        view: 0, // todos podem ver
        create: 1, // líderes e acima podem criar
        update: 1, // líderes e acima podem atualizar
        delete: 2, // somente supervisores e acima podem deletar
        flag: 3,
      },
      presence: {
        view: 0,
        create: 1,
        update: 1,
        delete: 2,
        flag: 3,
      },
      action_plan: {
        view: 1,
        create: 1,
        update: 1,
        delete: 2,
        flag: 3,
      },
      ihm_appointments: {
        view: 2,
        create: 2,
        update: 2,
        delete: 3,
        flag: 3,
      },
    }),
    []
  );

  /* -------------------------------------- ACESSO A PÁGINAS -------------------------------------- */
  const pageAccessLevels = useMemo(
    () => ({
      home: 0,
      supervision: 1,
      shop_floor: 0.5,
      hour_production: 1,
      live_lines: 0.5,
      management: 2,
      manusis: 10,
    }),
    []
  );

  /* -------------------------------- VERIFICAÇÃO DE SUPER USUÁRIO -------------------------------- */
  const isSuperUser = useMemo(() => userGroups.includes('Dev'), [userGroups]);

  /* ----------------------------- VERIFICAÇÃO DE EXCEÇÕES DE USUÁRIO ---------------------------- */
  // Verifica se o usuário atual tem exceções
  const userException = useMemo(
    () => (userName ? userExceptions[userName] : undefined),
    [userName]
  );

  /* ------------------------------------ FUNÇÕES DE PERMISSÃO ------------------------------------ */
  // Verifica se o usuário tem permissão para acessar um recurso específico
  const hasResourcePermission = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Verificar se o usuário tem uma exceção para esse recurso e ação
      if (userException?.resources?.[resource]?.includes(action)) {
        return true;
      }

      // Verificar o nível de permissão para a ação no recurso
      const requiredLevel = permissionsLevels[resource]?.[action] ?? Infinity;
      return userLvl >= requiredLevel;
    },
    [isSuperUser, userLvl, permissionsLevels, userException]
  );

  // Verifica se o usuário tem permissão para acessar uma página específica
  const hasPageAccess = useCallback(
    (page: PermissionPage, equal: Boolean = false): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Verificar se o usuário tem uma exceção para essa página
      if (userException?.pages?.includes(page)) {
        return true;
      }

      // Verificar o nível de acesso necessário para a página
      const requiredLevel = pageAccessLevels[page] ?? Infinity;
      // Se equal for true, verifica se o nível do usuário é igual ao nível necessário
      if (equal) {
        return userLvl === requiredLevel;
      }
      // Caso contrário, verifica se o nível do usuário é maior ou igual ao nível necessário
      return userLvl >= requiredLevel;
    },
    [isSuperUser, userLvl, pageAccessLevels, userException]
  );

  // Verificação de nível mínimo
  const hasMinLevel = useCallback(
    (level: number): boolean => {
      return isSuperUser || userLvl >= level;
    },
    [isSuperUser, userLvl]
  );

  // Verificação de um nível específico
  const hasLevel = useCallback(
    (level: number): boolean => {
      return isSuperUser || userLvl === level;
    },
    [userLvl, isSuperUser]
  );

  /* --------------------------------------- MAIS REPETIDOS --------------------------------------- */
  const hasActionPlanPermission = useCallback(
    (action: PermissionAction): boolean => hasResourcePermission('action_plan', action),
    [hasResourcePermission]
  );

  /* ---------------------------------------------------------------------------------------------- */
  /*                                         RETORNO DO HOOK                                        */
  /* ---------------------------------------------------------------------------------------------- */
  return {
    hasResourcePermission,
    hasPageAccess,
    hasMinLevel,
    hasActionPlanPermission,
    hasLevel,
    isSuperUser,
    userLvl,
    userName, // Adicionando o nome do usuário ao retorno para facilitar depuração
  };
}
