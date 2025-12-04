import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load dotenv if not in production
if (process.env.NODE_ENV !== 'production') {
  try {
    const { config } = await import('dotenv')
    config({ path: join(__dirname, '../.env') })
  } catch (error) {
    console.warn('dotenv not found, using environment variables only')
  }
}

// Environment validation schema
const envSchema = {
  // Required in all environments
  NODE_ENV: {
    required: true,
    type: 'string',
    enum: ['development', 'production', 'test'],
    default: 'development'
  },
  PORT: {
    required: true,
    type: 'number',
    default: 3000,
    min: 1000,
    max: 65535
  },
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    sensitive: true
  },
  JWT_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '24h',
    pattern: /^\d+[smhd]$/
  },
  
  // Database configuration
  DB_TYPE: {
    required: false,
    type: 'string',
    enum: ['sqlite', 'postgres', 'mysql', 'mariadb'],
    default: 'sqlite'
  },
  DB_PATH: {
    required: false,
    type: 'string',
    default: './system.db',
    requiredIf: { DB_TYPE: 'sqlite' }
  },
  DB_HOST: {
    required: false,
    type: 'string',
    requiredIf: { DB_TYPE: ['postgres', 'mysql', 'mariadb'] }
  },
  DB_PORT: {
    required: false,
    type: 'number',
    min: 1,
    max: 65535
  },
  DB_NAME: {
    required: false,
    type: 'string',
    requiredIf: { DB_TYPE: ['postgres', 'mysql', 'mariadb'] }
  },
  DB_USER: {
    required: false,
    type: 'string',
    requiredIf: { DB_TYPE: ['postgres', 'mysql', 'mariadb'] }
  },
  DB_PASSWORD: {
    required: false,
    type: 'string',
    sensitive: true,
    requiredIf: { DB_TYPE: ['postgres', 'mysql', 'mariadb'] }
  },
  
  // Security
  BCRYPT_ROUNDS: {
    required: false,
    type: 'number',
    default: 12,
    min: 10,
    max: 15
  },
  CORS_ORIGIN: {
    required: false,
    type: 'string',
    default: 'http://localhost:5173'
  },
  
  // Optional configurations
  SMTP_HOST: { required: false, type: 'string' },
  SMTP_PORT: { required: false, type: 'number', min: 1, max: 65535 },
  SMTP_USER: { required: false, type: 'string' },
  SMTP_PASS: { required: false, type: 'string', sensitive: true },
  
  LOG_LEVEL: {
    required: false,
    type: 'string',
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info'
  },
  
  // Feature flags
  ENABLE_REGISTRATION: {
    required: false,
    type: 'boolean',
    default: false
  },
  ENABLE_PASSWORD_RESET: {
    required: false,
    type: 'boolean',
    default: true
  },
  
  // Development
  SEED_ON_START: {
    required: false,
    type: 'boolean',
    default: false
  },
  FORCE_SYNC: {
    required: false,
    type: 'boolean',
    default: false
  }
}

class EnvironmentValidator {
  constructor(schema) {
    this.schema = schema
    this.errors = []
    this.warnings = []
    this.config = {}
  }

  validateRequired(key, def) {
    const value = process.env[key]
    
    // Check if required
    if (def.required && !value) {
      this.errors.push(`${key} is required but not set`)
      return false
    }
    
    // Check conditional requirements
    if (def.requiredIf && !value) {
      for (const [conditionKey, conditionValues] of Object.entries(def.requiredIf)) {
        const conditionValue = this.config[conditionKey] || process.env[conditionKey]
        const values = Array.isArray(conditionValues) ? conditionValues : [conditionValues]
        
        if (values.includes(conditionValue)) {
          this.errors.push(`${key} is required when ${conditionKey} is ${conditionValue}`)
          return false
        }
      }
    }
    
    return true
  }

  validateType(key, value, def) {
    if (!value) return true // Skip validation for empty values
    
    switch (def.type) {
      case 'string':
        if (typeof value !== 'string') {
          this.errors.push(`${key} must be a string`)
          return false
        }
        break
        
      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          this.errors.push(`${key} must be a number`)
          return false
        }
        
        if (def.min !== undefined && num < def.min) {
          this.errors.push(`${key} must be at least ${def.min}`)
          return false
        }
        
        if (def.max !== undefined && num > def.max) {
          this.errors.push(`${key} must be at most ${def.max}`)
          return false
        }
        
        this.config[key] = num
        return true
        
      case 'boolean':
        const bool = value.toLowerCase()
        if (!['true', 'false', '1', '0'].includes(bool)) {
          this.errors.push(`${key} must be a boolean (true/false/1/0)`)
          return false
        }
        
        this.config[key] = bool === 'true' || bool === '1'
        return true
        
      default:
        return true
    }
    
    return true
  }

  validateConstraints(key, value, def) {
    if (!value) return true
    
    // Enum validation
    if (def.enum && !def.enum.includes(value)) {
      this.errors.push(`${key} must be one of: ${def.enum.join(', ')}`)
      return false
    }
    
    // String length validation
    if (def.minLength && value.length < def.minLength) {
      this.errors.push(`${key} must be at least ${def.minLength} characters`)
      return false
    }
    
    if (def.maxLength && value.length > def.maxLength) {
      this.errors.push(`${key} must be at most ${def.maxLength} characters`)
      return false
    }
    
    // Pattern validation
    if (def.pattern && !def.pattern.test(value)) {
      this.errors.push(`${key} format is invalid`)
      return false
    }
    
    return true
  }

  validate() {
    // First pass: validate and set defaults
    for (const [key, def] of Object.entries(this.schema)) {
      let value = process.env[key]
      
      // Set default if not provided
      if (!value && def.default !== undefined) {
        value = def.default.toString()
        this.config[key] = def.type === 'number' ? Number(def.default) : 
                           def.type === 'boolean' ? def.default : def.default
      } else if (value) {
        this.config[key] = value
      }
    }
    
    // Second pass: validate all values
    for (const [key, def] of Object.entries(this.schema)) {
      const value = process.env[key] || (def.default && def.default.toString())
      
      // Required validation
      if (!this.validateRequired(key, def)) continue
      
      // Type validation
      if (!this.validateType(key, value, def)) continue
      
      // Constraint validation
      if (!this.validateConstraints(key, value, def)) continue
      
      // Store final value
      if (value && def.type === 'string') {
        this.config[key] = value
      }
    }
    
    // Production-specific validations
    if (process.env.NODE_ENV === 'production') {
      this.validateProduction()
    }
    
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      config: this.config
    }
  }

  validateProduction() {
    // Check for insecure defaults in production
    if (this.config.JWT_SECRET && this.config.JWT_SECRET.includes('change-in-production')) {
      this.errors.push('JWT_SECRET must be changed for production use')
    }
    
    if (this.config.DB_TYPE === 'sqlite') {
      this.warnings.push('SQLite is not recommended for production use')
    }
    
    if (this.config.CORS_ORIGIN === 'http://localhost:5173') {
      this.warnings.push('CORS_ORIGIN should be set to your production domain')
    }
    
    // Ensure sensitive data is properly secured
    const sensitiveKeys = Object.entries(this.schema)
      .filter(([, def]) => def.sensitive)
      .map(([key]) => key)
    
    for (const key of sensitiveKeys) {
      if (this.config[key] && this.config[key].length < 16) {
        this.warnings.push(`${key} should be at least 16 characters for security`)
      }
    }
  }

  logConfiguration() {
    console.log('\n=== Environment Configuration ===')
    console.log(`Environment: ${this.config.NODE_ENV}`)
    console.log(`Port: ${this.config.PORT}`)
    console.log(`Database: ${this.config.DB_TYPE}`)
    
    // Log non-sensitive configuration
    const nonSensitiveConfig = Object.entries(this.config)
      .filter(([key]) => !this.schema[key]?.sensitive)
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})
    
    console.log('Configuration:', JSON.stringify(nonSensitiveConfig, null, 2))
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      this.warnings.forEach(warning => console.log(`  - ${warning}`))
    }
    
    console.log('=================================\n')
  }
}

// Validate environment
const validator = new EnvironmentValidator(envSchema)
const result = validator.validate()

if (!result.isValid) {
  console.error('\n❌ Environment validation failed:')
  result.errors.forEach(error => console.error(`  - ${error}`))
  console.error('\nPlease check your .env file or environment variables.')
  process.exit(1)
}

if (result.warnings.length > 0 && process.env.NODE_ENV !== 'test') {
  validator.logConfiguration()
}

// Export validated configuration
export const config = {
  ...result.config,
  
  // Computed values
  isDevelopment: result.config.NODE_ENV === 'development',
  isProduction: result.config.NODE_ENV === 'production',
  isTest: result.config.NODE_ENV === 'test',
  
  // Database URL for production
  databaseUrl: result.config.DB_TYPE === 'sqlite' 
    ? result.config.DB_PATH
    : `${result.config.DB_TYPE}://${result.config.DB_USER}:${result.config.DB_PASSWORD}@${result.config.DB_HOST}:${result.config.DB_PORT}/${result.config.DB_NAME}`,
    
  // Feature flags
  features: {
    registration: result.config.ENABLE_REGISTRATION,
    passwordReset: result.config.ENABLE_PASSWORD_RESET,
    emailNotifications: result.config.ENABLE_EMAIL_NOTIFICATIONS,
    payments: {
      stripe: result.config.ENABLE_STRIPE_PAYMENTS,
      paypal: result.config.ENABLE_PAYPAL_PAYMENTS
    }
  }
}

export default config