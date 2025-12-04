// Permission matrix based on the role-based access control design
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
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
};

// Middleware to check specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check multiple permissions (user needs at least one)
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const hasAnyPermission = permissions.some(permission => 
      hasPermission(req.user.role, permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check role directly
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient role permissions',
        required: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole('admin');

// Admin or Manager middleware  
export const requireAdminOrManager = requireRole('admin', 'manager');

// Export permissions for frontend use
export { PERMISSIONS };