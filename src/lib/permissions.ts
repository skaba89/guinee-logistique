/**
 * Permissions System — Guinée Logistique
 * Centralized RBAC (Role-Based Access Control) with helper functions.
 * Uses the module configuration as the source of truth.
 */

import {
  type RoleKey,
  type PermissionLevel,
  type ModuleDefinition,
  type NavGroupKey,
  moduleDefinitions,
  navGroups,
  roleDefinitions,
  mapRoleString,
  getModuleById,
  iconNameToComponent,
} from './module-config';
import type { PageType } from './cargo-store';

// ─── Custom Permissions Override Store ──────────────────────────
// Allows administrators to customize permissions beyond defaults.
// Persisted in localStorage via cargo-store.

export interface PermissionOverrides {
  /** Key format: `${moduleId}:${roleKey}` → overridden PermissionLevel */
  [key: string]: PermissionLevel;
}

export interface ModuleFeatureFlags {
  /** Key format: moduleId → boolean (enabled/disabled) */
  [moduleId: string]: boolean;
}

export interface ClientModuleVisibility {
  /** Key format: clientId → { moduleId → boolean (visible/hidden) } */
  [clientId: string]: {
    [moduleId: string]: boolean;
  };
}

export interface PermissionsConfig {
  /** Overridden permissions (delta from defaults) */
  overrides: PermissionOverrides;
  /** Feature flags (which modules are enabled) */
  featureFlags: ModuleFeatureFlags;
  /** Per-client module visibility overrides */
  clientVisibility: ClientModuleVisibility;
}

const PERMISSIONS_CONFIG_KEY = 'guinee-logistique-permissions-config';
const CLIENT_VISIBILITY_KEY = 'guinee-logistique-client-visibility';

/** Load persisted permissions configuration */
export function loadPermissionsConfig(): PermissionsConfig {
  if (typeof window === 'undefined') {
    return { overrides: {}, featureFlags: {}, clientVisibility: {} };
  }
  try {
    const raw = localStorage.getItem(PERMISSIONS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure clientVisibility exists (backward compat)
      return {
        overrides: parsed.overrides ?? {},
        featureFlags: parsed.featureFlags ?? {},
        clientVisibility: parsed.clientVisibility ?? loadClientModuleVisibility(),
      };
    }
  } catch {
    // ignore parse errors
  }
  return { overrides: {}, featureFlags: {}, clientVisibility: loadClientModuleVisibility() };
}

// ─── Client Module Visibility ─────────────────────────────────

/** Load client module visibility overrides from localStorage */
export function loadClientModuleVisibility(): ClientModuleVisibility {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CLIENT_VISIBILITY_KEY);
    if (raw) return JSON.parse(raw) as ClientModuleVisibility;
  } catch { /* ignore */ }
  return {};
}

/** Save client module visibility overrides to localStorage */
export function saveClientModuleVisibility(vis: ClientModuleVisibility): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIENT_VISIBILITY_KEY, JSON.stringify(vis));
  } catch { /* ignore */ }
}

/**
 * Check if a module is visible for a given client.
 * If no override exists, the module is visible by default (true).
 */
export function isModuleVisibleForClient(
  moduleId: PageType,
  clientId: string,
  clientVisibility?: ClientModuleVisibility
): boolean {
  const vis = clientVisibility ?? loadClientModuleVisibility();
  const clientOverrides = vis[clientId];
  if (!clientOverrides) return true; // No overrides = all visible
  if (clientOverrides[moduleId] === undefined) return true; // No override for this module = visible
  return clientOverrides[moduleId];
}

/**
 * Set visibility for a single module for a specific client.
 */
export function setClientModuleVisibility(
  clientId: string,
  moduleId: PageType,
  visible: boolean,
  currentVisibility?: ClientModuleVisibility
): ClientModuleVisibility {
  const vis = currentVisibility ?? loadClientModuleVisibility();
  const clientOverrides = vis[clientId] ?? {};
  return {
    ...vis,
    [clientId]: {
      ...clientOverrides,
      [moduleId]: visible,
    },
  };
}

/**
 * Set all modules visible or hidden for a specific client.
 */
export function setAllClientModulesVisibility(
  clientId: string,
  visible: boolean,
  currentVisibility?: ClientModuleVisibility
): ClientModuleVisibility {
  const vis = currentVisibility ?? loadClientModuleVisibility();
  const allModules: Record<string, boolean> = {};
  // Set visibility for all modules that the client role can access by default
  moduleDefinitions.forEach((m) => {
    if (m.defaultPermissions.client !== 'none') {
      allModules[m.id] = visible;
    }
  });
  return {
    ...vis,
    [clientId]: allModules,
  };
}

/**
 * Reset all visibility overrides for a specific client.
 */
export function resetClientModuleVisibility(
  clientId: string,
  currentVisibility?: ClientModuleVisibility
): ClientModuleVisibility {
  const vis = currentVisibility ?? loadClientModuleVisibility();
  const newVis = { ...vis };
  delete newVis[clientId];
  return newVis;
}

/** Save permissions configuration to localStorage */
export function savePermissionsConfig(config: PermissionsConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PERMISSIONS_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

/** Clear all permission overrides and feature flags */
export function resetPermissionsConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PERMISSIONS_CONFIG_KEY);
}

// ─── Permission Resolution ──────────────────────────────────────

/**
 * Get the effective permission for a role on a module.
 * Checks overrides first, then falls back to default permissions.
 */
export function getEffectivePermission(
  moduleId: PageType,
  role: RoleKey,
  config?: PermissionsConfig
): PermissionLevel {
  const moduleDef = getModuleById(moduleId);
  if (!moduleDef) return 'none';

  // Check if module is disabled via feature flag
  const cfg = config ?? loadPermissionsConfig();
  if (cfg.featureFlags[moduleId] === false) return 'none';

  // Check overrides
  const overrideKey = `${moduleId}:${role}`;
  if (cfg.overrides[overrideKey]) {
    return cfg.overrides[overrideKey];
  }

  // Fall back to default
  return moduleDef.defaultPermissions[role] ?? 'none';
}

/**
 * Check if a role has at least the specified permission level on a module.
 * Permission hierarchy: write > read > none
 */
export function hasPermission(
  moduleId: PageType,
  role: RoleKey,
  requiredLevel: PermissionLevel,
  config?: PermissionsConfig
): boolean {
  const effective = getEffectivePermission(moduleId, role, config);

  if (requiredLevel === 'none') return true; // everyone has at least 'none'
  if (requiredLevel === 'read') return effective === 'read' || effective === 'write';
  if (requiredLevel === 'write') return effective === 'write';

  return false;
}

/**
 * Check if a user with a given role can view (at least read) a page.
 * For client-role users, also checks client module visibility.
 */
export function canViewPage(
  page: PageType,
  role: RoleKey | string,
  config?: PermissionsConfig,
  clientId?: string
): boolean {
  const roleKey = typeof role === 'string' ? mapRoleString(role) : role;
  if (!hasPermission(page, roleKey, 'read', config)) return false;
  // For client role, also check client-specific visibility
  if (roleKey === 'client' && clientId) {
    const cfg = config ?? loadPermissionsConfig();
    return isModuleVisibleForClient(page, clientId, cfg.clientVisibility);
  }
  return true;
}

/**
 * Check if a user with a given role can edit (write) on a page.
 * For client-role users, also checks client module visibility.
 */
export function canEditPage(
  page: PageType,
  role: RoleKey | string,
  config?: PermissionsConfig,
  clientId?: string
): boolean {
  const roleKey = typeof role === 'string' ? mapRoleString(role) : role;
  if (!hasPermission(page, roleKey, 'write', config)) return false;
  // For client role, also check client-specific visibility
  if (roleKey === 'client' && clientId) {
    const cfg = config ?? loadPermissionsConfig();
    return isModuleVisibleForClient(page, clientId, cfg.clientVisibility);
  }
  return true;
}

/**
 * Check if a module is enabled via feature flags.
 */
export function isModuleEnabled(
  moduleId: PageType,
  config?: PermissionsConfig
): boolean {
  const moduleDef = getModuleById(moduleId);
  if (!moduleDef) return false;

  const cfg = config ?? loadPermissionsConfig();
  // If no feature flag is set, use the module's default enabled state
  if (cfg.featureFlags[moduleId] === undefined) {
    return moduleDef.enabled;
  }
  return cfg.featureFlags[moduleId];
}

// ─── Navigation Helpers ─────────────────────────────────────────

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
}

interface NavGroupResult {
  key: NavGroupKey;
  label: string;
  items: NavItem[];
}

/**
 * Get the filtered navigation groups for a given role.
 * Only includes modules the user has at least read access to.
 */
export function getFilteredNavigation(
  role: RoleKey | string,
  config?: PermissionsConfig,
  clientId?: string
): NavGroupResult[] {
  const roleKey = typeof role === 'string' ? mapRoleString(role) : role;
  const cfg = config ?? loadPermissionsConfig();

  return navGroups
    .map((group) => {
      const items = moduleDefinitions
        .filter((m) => m.group === group.key)
        .filter((m) => isModuleEnabled(m.id, cfg))
        .filter((m) => hasPermission(m.id, roleKey, 'read', cfg))
        // Filter by client visibility if a clientId is provided and role is client
        .filter((m) => {
          if (clientId && roleKey === 'client') {
            return isModuleVisibleForClient(m.id, clientId, cfg.clientVisibility);
          }
          return true;
        })
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          id: m.id,
          label: m.label,
          icon: iconNameToComponent[m.icon] ?? (() => null),
        }));

      return {
        key: group.key,
        label: group.label,
        items,
      };
    })
    .filter((group) => group.items.length > 0)
    .sort((a, b) => {
      const aGroup = navGroups.find((g) => g.key === a.key);
      const bGroup = navGroups.find((g) => g.key === b.key);
      return (aGroup?.order ?? 99) - (bGroup?.order ?? 99);
    });
}

/**
 * Get the full permission matrix for all modules and roles.
 * Includes overrides if provided.
 */
export function getFullPermissionMatrix(
  config?: PermissionsConfig
): { module: ModuleDefinition; permissions: Record<RoleKey, PermissionLevel> }[] {
  const cfg = config ?? loadPermissionsConfig();

  return moduleDefinitions.map((module) => ({
    module,
    permissions: Object.fromEntries(
      roleDefinitions.map((role) => [
        role.key,
        getEffectivePermission(module.id, role.key, cfg),
      ])
    ) as Record<RoleKey, PermissionLevel>,
  }));
}

/**
 * Set a permission override for a specific module and role.
 */
export function setPermissionOverride(
  moduleId: PageType,
  role: RoleKey,
  level: PermissionLevel,
  config?: PermissionsConfig
): PermissionsConfig {
  const cfg = config ?? loadPermissionsConfig();
  const key = `${moduleId}:${role}`;

  if (level === getModuleById(moduleId)?.defaultPermissions[role]) {
    // If the override equals the default, remove it
    const newOverrides = { ...cfg.overrides };
    delete newOverrides[key];
    return { ...cfg, overrides: newOverrides };
  }

  return {
    ...cfg,
    overrides: { ...cfg.overrides, [key]: level },
  };
}

/**
 * Set a feature flag for a module.
 */
export function setFeatureFlag(
  moduleId: PageType,
  enabled: boolean,
  config?: PermissionsConfig
): PermissionsConfig {
  const cfg = config ?? loadPermissionsConfig();

  // If setting to the module's default, remove the flag
  const moduleDef = getModuleById(moduleId);
  if (moduleDef && enabled === moduleDef.enabled) {
    const newFlags = { ...cfg.featureFlags };
    delete newFlags[moduleId];
    return { ...cfg, featureFlags: newFlags };
  }

  return {
    ...cfg,
    featureFlags: { ...cfg.featureFlags, [moduleId]: enabled },
  };
}

/**
 * Get modules that a role can access (read or write).
 */
export function getAccessibleModules(
  role: RoleKey | string,
  config?: PermissionsConfig
): ModuleDefinition[] {
  const roleKey = typeof role === 'string' ? mapRoleString(role) : role;
  const cfg = config ?? loadPermissionsConfig();

  return moduleDefinitions.filter(
    (m) => isModuleEnabled(m.id, cfg) && hasPermission(m.id, roleKey, 'read', cfg)
  );
}

/**
 * Get modules that a role cannot access at all.
 */
export function getInaccessibleModules(
  role: RoleKey | string,
  config?: PermissionsConfig
): ModuleDefinition[] {
  const roleKey = typeof role === 'string' ? mapRoleString(role) : role;
  const cfg = config ?? loadPermissionsConfig();

  return moduleDefinitions.filter(
    (m) => !isModuleEnabled(m.id, cfg) || !hasPermission(m.id, roleKey, 'read', cfg)
  );
}

// ─── Re-export types for convenience ────────────────────────────

export type { RoleKey, PermissionLevel, ModuleDefinition, NavGroupKey };
export {
  moduleDefinitions,
  navGroups,
  roleDefinitions,
  mapRoleString,
  getModuleById,
};
