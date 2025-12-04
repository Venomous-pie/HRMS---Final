// Environment configuration for the frontend
// Vite automatically loads .env files and makes them available via import.meta.env

interface AppConfig {
  // API Configuration
  apiBaseUrl: string
  apiTimeout: number
  
  // Application Information
  appName: string
  appVersion: string
  appDescription: string
  
  // Authentication
  tokenStorageKey: string
  userDataStorageKey: string
  autoLogoutMinutes: number
  
  // Feature Flags
  features: {
    darkMode: boolean
    notifications: boolean
    offlineMode: boolean
    pwa: boolean
    analytics: boolean
    payments: boolean
  }
  
  // UI Configuration
  ui: {
    defaultTheme: 'light' | 'dark' | 'auto'
    defaultLanguage: string
    itemsPerPage: number
    maxUploadSize: number
    dateFormat: string
    timeFormat: string
    defaultCheckinTime: string
    defaultCheckoutTime: string
    maxGuestsPerRoom: number
  }
  
  // Development
  debug: boolean
  mockApi: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  
  // External Services
  services: {
    googleMapsApiKey?: string
    mapboxAccessToken?: string
    stripePublishableKey?: string
    paypalClientId?: string
    googleAnalyticsId?: string
    hotjarId?: string
    sentryDsn?: string
  }
  
  // Runtime flags
  isDevelopment: boolean
  isProduction: boolean
}

// Helper function to get environment variable with type checking
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key]
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not set`)
    return ''
  }
  return value ?? defaultValue ?? ''
}

function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key]
  if (!value) return defaultValue
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

// Validate required environment variables
function validateRequiredEnvVars() {
  const required = [
    'VITE_API_BASE_URL'
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Validate environment configuration
function validateEnvironment(): void {
  try {
    validateRequiredEnvVars()
    
    // Validate API URL format
    const apiUrl = getEnvVar('VITE_API_BASE_URL')
    if (apiUrl && !apiUrl.match(/^https?:\/\/.+/)) {
      console.warn('VITE_API_BASE_URL should start with http:// or https://')
    }
    
    // Validate timeout
    const timeout = getEnvNumber('VITE_API_TIMEOUT', 30000)
    if (timeout < 1000 || timeout > 120000) {
      console.warn('VITE_API_TIMEOUT should be between 1000 and 120000 milliseconds')
    }
    
    // Validate upload size
    const maxUploadSize = getEnvNumber('VITE_MAX_UPLOAD_SIZE', 10485760)
    if (maxUploadSize > 100 * 1024 * 1024) { // 100MB
      console.warn('VITE_MAX_UPLOAD_SIZE is very large, consider reducing it')
    }
    
    // Production-specific validations
    if (import.meta.env.PROD) {
      if (apiUrl.includes('localhost')) {
        console.warn('API URL contains localhost in production build')
      }
      
      if (getEnvBoolean('VITE_DEBUG')) {
        console.warn('Debug mode is enabled in production')
      }
      
      if (getEnvBoolean('VITE_MOCK_API')) {
        console.warn('Mock API is enabled in production')
      }
    }
    
  } catch (error) {
    console.error('Environment validation failed:', error)
    if (import.meta.env.PROD) {
      throw error
    }
  }
}

// Run validation
validateEnvironment()

// Export configuration object
export const config: AppConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
  
  // Application Information
  appName: getEnvVar('VITE_APP_NAME', 'Hotel Management System'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Comprehensive hotel management solution'),
  
  // Authentication
  tokenStorageKey: getEnvVar('VITE_TOKEN_STORAGE_KEY', 'auth_token'),
  userDataStorageKey: getEnvVar('VITE_USER_DATA_STORAGE_KEY', 'user_data'),
  autoLogoutMinutes: getEnvNumber('VITE_AUTO_LOGOUT_MINUTES', 30),
  
  // Feature Flags
  features: {
    darkMode: getEnvBoolean('VITE_ENABLE_DARK_MODE', true),
    notifications: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
    offlineMode: getEnvBoolean('VITE_ENABLE_OFFLINE_MODE', false),
    pwa: getEnvBoolean('VITE_ENABLE_PWA', false),
    analytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
    payments: getEnvBoolean('VITE_ENABLE_PAYMENTS', false)
  },
  
  // UI Configuration
  ui: {
    defaultTheme: getEnvVar('VITE_DEFAULT_THEME', 'light') as 'light' | 'dark' | 'auto',
    defaultLanguage: getEnvVar('VITE_DEFAULT_LANGUAGE', 'en'),
    itemsPerPage: getEnvNumber('VITE_ITEMS_PER_PAGE', 20),
    maxUploadSize: getEnvNumber('VITE_MAX_UPLOAD_SIZE', 10485760),
    dateFormat: getEnvVar('VITE_DATE_FORMAT', 'YYYY-MM-DD'),
    timeFormat: getEnvVar('VITE_TIME_FORMAT', 'HH:mm'),
    defaultCheckinTime: getEnvVar('VITE_DEFAULT_CHECKIN_TIME', '15:00'),
    defaultCheckoutTime: getEnvVar('VITE_DEFAULT_CHECKOUT_TIME', '11:00'),
    maxGuestsPerRoom: getEnvNumber('VITE_MAX_GUESTS_PER_ROOM', 10)
  },
  
  // Development
  debug: getEnvBoolean('VITE_DEBUG', import.meta.env.DEV),
  mockApi: getEnvBoolean('VITE_MOCK_API', false),
  logLevel: getEnvVar('VITE_LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug',
  
  // External Services
  services: {
    googleMapsApiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY') || undefined,
    mapboxAccessToken: getEnvVar('VITE_MAPBOX_ACCESS_TOKEN') || undefined,
    stripePublishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY') || undefined,
    paypalClientId: getEnvVar('VITE_PAYPAL_CLIENT_ID') || undefined,
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID') || undefined,
    hotjarId: getEnvVar('VITE_HOTJAR_ID') || undefined,
    sentryDsn: getEnvVar('VITE_SENTRY_DSN') || undefined
  },
  
  // Runtime flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
}

// Helper functions for common configuration checks
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature]
}

export const getApiEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${config.apiBaseUrl}${cleanPath}`
}

export const shouldLogLevel = (level: AppConfig['logLevel']): boolean => {
  const levels = ['error', 'warn', 'info', 'debug']
  const currentLevelIndex = levels.indexOf(config.logLevel)
  const requestedLevelIndex = levels.indexOf(level)
  return requestedLevelIndex <= currentLevelIndex
}

// Log configuration in development
if (config.isDevelopment && config.debug) {
  console.log('🔧 App Configuration:', {
    ...config,
    services: Object.keys(config.services).reduce((acc, key) => {
      acc[key] = config.services[key as keyof typeof config.services] ? '***' : undefined
      return acc
    }, {} as Record<string, string | undefined>)
  })
}

export default config