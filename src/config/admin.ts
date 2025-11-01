/**
 * Admin Panel Configuration
 */

export const ADMIN_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  // Table Settings
  ITEMS_PER_PAGE: 20,

  // User Management
  USER_STATUS_OPTIONS: [
    { value: "active", labelKey: "admin.active" },
    { value: "inactive", labelKey: "admin.inactive" },
    { value: "pending", labelKey: "admin.pending" },
  ],

  SUBSCRIPTION_TIERS: [
    { value: "free", label: "Free" },
    { value: "premium", label: "Premium" },
    { value: "enterprise", label: "Enterprise" },
  ],

  // Company Management
  VERIFICATION_STATUS_OPTIONS: [
    { value: "verified", labelKey: "admin.verified" },
    { value: "pending", labelKey: "admin.pending" },
    { value: "unverified", labelKey: "admin.unverified" },
  ],

  // Dashboard Refresh
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds

  // Toast Duration
  TOAST_DURATION: 3000, // 3 seconds

  // Search Debounce
  SEARCH_DEBOUNCE_MS: 300,
} as const;

/**
 * Admin Navigation Items
 */
export const ADMIN_NAV_ITEMS = [
  {
    id: "dashboard",
    labelKey: "admin.dashboard",
    path: "/admin",
    icon: "LayoutDashboard",
  },
  {
    id: "users",
    labelKey: "admin.users",
    path: "/admin/users",
    icon: "Users",
  },
  {
    id: "companies",
    labelKey: "admin.companies",
    path: "/admin/companies",
    icon: "Building2",
  },
] as const;

/**
 * Admin Permissions
 * Use this for role-based access control
 */
export const ADMIN_PERMISSIONS = {
  DASHBOARD: {
    VIEW: "dashboard.view",
  },
  USERS: {
    VIEW: "users.view",
    CREATE: "users.create",
    EDIT: "users.edit",
    DELETE: "users.delete",
    EXPORT: "users.export",
  },
  COMPANIES: {
    VIEW: "companies.view",
    CREATE: "companies.create",
    EDIT: "companies.edit",
    DELETE: "companies.delete",
    VERIFY: "companies.verify",
    EXPORT: "companies.export",
  },
} as const;

/**
 * Badge Variants Mapping
 */
export const STATUS_BADGE_VARIANTS = {
  active: "success",
  inactive: "error",
  pending: "warning",
  verified: "success",
  unverified: "error",
} as const;
