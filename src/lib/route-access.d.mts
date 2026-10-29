export type AppRole = 'student' | 'teacher' | 'admin' | 'parent';
export function dashboardForRole(role: string | undefined): string | undefined;
export function isSupportedRole(role: unknown): role is AppRole;
export function requiredRoleForPath(pathname: string): AppRole | undefined;
