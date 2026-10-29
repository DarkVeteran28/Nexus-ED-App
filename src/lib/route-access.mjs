const dashboardByRole = Object.freeze({
  student: '/dashboard/student/chat',
  teacher: '/dashboard/teacher/enrollment',
  admin: '/dashboard/admin/teachers',
  parent: '/dashboard/parent',
});

const protectedDashboardPrefixes = Object.freeze([
  ['/dashboard/student', 'student'],
  ['/dashboard/teacher', 'teacher'],
  ['/dashboard/parent', 'parent'],
  ['/dashboard/admin', 'admin'],
]);

export function dashboardForRole(role) {
  return typeof role === 'string' ? dashboardByRole[role] : undefined;
}

export function isSupportedRole(role) {
  return typeof role === 'string' && Object.hasOwn(dashboardByRole, role);
}

export function requiredRoleForPath(pathname) {
  return protectedDashboardPrefixes.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1];
}
