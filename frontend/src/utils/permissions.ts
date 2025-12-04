// Permission matrix mirrored from backend
const PERMISSIONS = {
  // Reservations
  RESERVATIONS_VIEW_ALL: ['admin', 'manager'],
  RESERVATIONS_VIEW_OWN: ['receptionist'],
  RESERVATIONS_CREATE: ['admin', 'manager', 'receptionist'],
  RESERVATIONS_EDIT: ['admin', 'manager', 'receptionist'],
  RESERVATIONS_CANCEL: ['admin', 'manager', 'receptionist'],
  RESERVATIONS_DELETE: ['admin', 'manager'],
  RESERVATIONS_OVERRIDE_CONFLICTS: ['admin', 'manager'],
  RESERVATIONS_APPROVE_REJECT: ['admin', 'manager'],

  // Room Management
  ROOMS_VIEW: ['admin', 'manager', 'receptionist'],
  ROOMS_CREATE: ['admin', 'manager'],
  ROOMS_EDIT: ['admin', 'manager'],
  ROOMS_DELETE: ['admin', 'manager'],
  ROOMS_MANAGE_STATUS: ['admin', 'manager', 'receptionist'],
  ROOMS_DEFINE_TYPES: ['admin', 'manager'],
  ROOMS_SET_MAINTENANCE: ['admin', 'manager'],

  // Guest Management
  GUESTS_VIEW_ALL: ['admin', 'manager'],
  GUESTS_VIEW_LIMITED: ['receptionist'],
  GUESTS_CREATE: ['admin', 'manager', 'receptionist'],
  GUESTS_EDIT_ALL: ['admin', 'manager'],
  GUESTS_EDIT_CONTACT: ['receptionist'],
  GUESTS_EXPORT: ['admin', 'manager'],
  GUESTS_MANAGE_VIP_BLACKLIST: ['admin', 'manager'],

  // Payments & Billing
  PAYMENTS_VIEW_ALL: ['admin', 'manager'],
  PAYMENTS_RECORD: ['admin', 'manager', 'receptionist', 'accounting'],
  PAYMENTS_ISSUE_RECEIPTS: ['admin', 'manager', 'receptionist'],
  PAYMENTS_ADJUST_PRICING: ['admin', 'manager'],
  PAYMENTS_DISCOUNTS: ['admin', 'manager'],
  PAYMENTS_FINANCIAL_SUMMARIES: ['admin', 'manager'],
  PAYMENTS_MARK_PAID_UNPAID: ['admin', 'manager', 'receptionist'],

  // Dashboard & Reports
  REPORTS_VIEW_OCCUPANCY: ['admin', 'manager'],
  REPORTS_VIEW_REVENUE: ['admin', 'manager'],
  REPORTS_VIEW_KPIS: ['admin', 'manager'],
  REPORTS_EXPORT: ['admin', 'manager'],
  REPORTS_FILTER_BY_STAFF: ['admin', 'manager'],
  REPORTS_VIEW_TODAY_ONLY: ['receptionist'],
  REPORTS_LIMITED_OVERVIEW: ['receptionist'],

  // User Access / Roles
  USERS_CREATE: ['admin', 'manager'],
  USERS_EDIT: ['admin', 'manager'],
  USERS_DELETE: ['admin', 'manager'],
  USERS_ASSIGN_ROLES: ['admin', 'manager'],
  USERS_VIEW_ALL: ['admin', 'manager'],

  // System Settings
  SETTINGS_CONFIGURE_HOTEL: ['admin', 'manager'],
  SETTINGS_MANAGE_TAXES: ['admin', 'manager'],
  SETTINGS_MANAGE_TIMEZONES: ['admin', 'manager'],
  SETTINGS_MANAGE_INTEGRATIONS: ['admin', 'manager'],

  // General System Access
  SYSTEM_FULL_CONTROL: ['admin'],
  SYSTEM_LONG_TERM_DECISIONS: ['admin', 'manager'],
  SYSTEM_DAILY_OPERATIONS: ['receptionist'],
  SYSTEM_ALL_MODULES: ['admin', 'manager'],
  SYSTEM_LIMITED_MODULES: ['receptionist'],
} as const

export type Permission = keyof typeof PERMISSIONS
export type Role = 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'accounting'

// Helper function to check if user has permission
export const hasPermission = (userRole: Role | null | undefined, permission: Permission): boolean => {
  if (!userRole || !permission) return false
  
  const allowedRoles = PERMISSIONS[permission] as ReadonlyArray<Role>
  if (!allowedRoles) return false
  
  return allowedRoles.includes(userRole)
}

// Helper function to check if user has any of the given permissions
export const hasAnyPermission = (userRole: Role | null | undefined, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission))
}

// Helper function to check if user has all of the given permissions
export const hasAllPermissions = (userRole: Role | null | undefined, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// Helper function to check role directly
export const hasRole = (userRole: Role | null | undefined, ...roles: Role[]): boolean => {
  if (!userRole) return false
  return roles.includes(userRole)
}

// Common role checks
export const isAdmin = (userRole: Role | null | undefined): boolean => {
  return hasRole(userRole, 'admin')
}

export const isManager = (userRole: Role | null | undefined): boolean => {
  return hasRole(userRole, 'manager')
}

export const isAdminOrManager = (userRole: Role | null | undefined): boolean => {
  return hasRole(userRole, 'admin', 'manager')
}

export const isReceptionist = (userRole: Role | null | undefined): boolean => {
  return hasRole(userRole, 'receptionist')
}

// UI feature access checks based on your design
export const canViewAdminDashboard = (userRole: Role | null | undefined): boolean => {
  return isAdminOrManager(userRole)
}

export const canManageUsers = (userRole: Role | null | undefined): boolean => {
  return hasPermission(userRole, 'USERS_VIEW_ALL')
}

export const canOverrideBookings = (userRole: Role | null | undefined): boolean => {
  return hasPermission(userRole, 'RESERVATIONS_OVERRIDE_CONFLICTS')
}

export const canViewFinancialReports = (userRole: Role | null | undefined): boolean => {
  return hasPermission(userRole, 'REPORTS_VIEW_REVENUE')
}

export const canManageRoomTypes = (userRole: Role | null | undefined): boolean => {
  return hasPermission(userRole, 'ROOMS_DEFINE_TYPES')
}

export const canExportData = (userRole: Role | null | undefined): boolean => {
  return hasAnyPermission(userRole, ['REPORTS_EXPORT', 'GUESTS_EXPORT'])
}

export const canAccessSystemSettings = (userRole: Role | null | undefined): boolean => {
  return hasPermission(userRole, 'SETTINGS_CONFIGURE_HOTEL')
}

export { PERMISSIONS }