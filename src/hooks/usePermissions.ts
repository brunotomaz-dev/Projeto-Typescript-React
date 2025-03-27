import { useCallback, useMemo } from 'react';
import { useAppSelector } from '../redux/store/hooks';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';
export type PermissionResource =
  | 'absence'
  | 'presence'
  | 'action_plan'
  | 'ihm_appointments';
export type PermissionPage =
  | 'supervision'
  | 'shop_floor'
  | 'hour_production'
  | 'live_lines'
  | 'management';

type roleTypes = 'Líderes' | 'Supervisores' | 'Analistas' | 'Especialistas' | 'Coordenadores' | 'Gerentes' | 'Dev';
export const levelMap: Record<roleTypes, number> = {
  Líderes: 1,
  Analistas: 2,
  Supervisores: 2,
  Especialistas: 3,
  Coordenadores: 3,
  Gerentes: 4,
  Dev: 99,
};

export function usePermissions() {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // Recebe o nível do usuário logado
  const userLvl = useAppSelector((state) => state.user.level);
  // Recebe os grupos do usuário logado
  const userGroups = useAppSelector((state) => state.user.groups);

  /* --------------------------------- MAPA DE NÍVEIS POR RECURSO --------------------------------- */

  const permissionsLevels = useMemo(
    () => ({
      absence: {
        view: 0, // todos podem ver
        create: 1, // líderes e acima podem criar
        update: 1, // líderes e acima podem atualizar
        delete: 2, // somente supervisores e acima podem deletar
      },
      presence: {
        view: 0,
        create: 1,
        update: 1,
        delete: 2,
      },
      action_plan: {
        view: 0,
        create: 0,
        update: 0,
        delete: 2,
      },
      ihm_appointments: {
        view: 1,
        create: 2,
        update: 1,
        delete: 2,
      },
    }),
    []
  );

  /* -------------------------------------- ACESSO A PÁGINAS -------------------------------------- */
  const pageAccessLevels = useMemo(
    () => ({
      home: 0,
      supervision: 2,
      shop_floor: 0,
      hour_production: 1,
      live_lines: 0,
      management: 2,
    }),
    []
  );

  /* -------------------------------- VERIFICAÇÃO DE SUPER USUÁRIO -------------------------------- */
  const isSuperUser = useMemo(() => userGroups.includes('Dev'), [userGroups]);

  /* ------------------------------------ FUNÇÕES DE PERMISSÃO ------------------------------------ */
  // Verifica se o usuário tem permissão para acessar um recurso específico
  const hasResourcePermission = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Verificar o nível de permissão para a ação no recurso
      const requiredLevel = permissionsLevels[resource]?.[action] ?? Infinity;
      return userLvl >= requiredLevel;
    },
    [isSuperUser, userLvl, permissionsLevels]
  );

  // Verifica se o usuário tem permissão para acessar uma página específica
  const hasPageAccess = useCallback(
    (page: PermissionPage): boolean => {
      // Super usuários tem acesso a tudo
      if (isSuperUser) return true;

      // Verificar o nível de acesso necessário para a página
      const requiredLevel = pageAccessLevels[page] ?? Infinity;
      return userLvl >= requiredLevel;
    },
    [isSuperUser, userLvl, pageAccessLevels]
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
    [userLvl]
  );

  /* --------------------------------------- MAIS REPETIDOS --------------------------------------- */

  const hasActionPlanPermission = useCallback(
    (action: PermissionAction): boolean =>
      hasResourcePermission('action_plan', action),
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
  };
}
