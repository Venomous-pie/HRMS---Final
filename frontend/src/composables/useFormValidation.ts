import { ref, reactive, computed, watch } from 'vue'

export interface ValidationRule {
  validator: (value: any, formData?: any) => boolean | Promise<boolean>
  message: string
  trigger?: 'change' | 'blur' | 'submit'
}

export interface FieldConfig {
  rules?: ValidationRule[]
  required?: boolean
  debounce?: number
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

export interface ValidationError {
  field: string
  message: string
  rule?: ValidationRule
}

export interface FormConfig {
  fields: Record<string, FieldConfig>
  validateOnSubmit?: boolean
  stopOnFirstError?: boolean
}

export const commonRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validator: (value: any) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim().length > 0
      return value !== null && value !== undefined && value !== ''
    },
    message,
    trigger: 'change'
  }),

  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message,
    trigger: 'blur'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      return value.length >= min
    },
    message: message || `Must be at least ${min} characters`,
    trigger: 'change'
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      return value.length <= max
    },
    message: message || `Must be no more than ${max} characters`,
    trigger: 'change'
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      return regex.test(value)
    },
    message,
    trigger: 'blur'
  }),

  phone: (message: string = 'Please enter a valid phone number'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
    },
    message,
    trigger: 'blur'
  }),

  number: (message: string = 'Please enter a valid number'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true
      return !isNaN(Number(value))
    },
    message,
    trigger: 'change'
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true
      return Number(value) >= min
    },
    message: message || `Must be at least ${min}`,
    trigger: 'change'
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true
      return Number(value) <= max
    },
    message: message || `Must be no more than ${max}`,
    trigger: 'change'
  }),

  date: (message: string = 'Please enter a valid date'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const date = new Date(value)
      return !isNaN(date.getTime())
    },
    message,
    trigger: 'blur'
  }),

  futureDate: (message: string = 'Date must be in the future'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date.getTime() >= today.getTime()
    },
    message,
    trigger: 'blur'
  }),

  pastDate: (message: string = 'Date must be in the past'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const date = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date.getTime() <= today.getTime()
    },
    message,
    trigger: 'blur'
  }),

  match: (fieldName: string, message?: string): ValidationRule => ({
    validator: (value: string, formData: any) => {
      if (!value || !formData) return true
      return value === formData[fieldName]
    },
    message: message || `Must match ${fieldName}`,
    trigger: 'change'
  }),

  unique: (checkUnique: (value: any) => Promise<boolean>, message: string = 'This value already exists'): ValidationRule => ({
    validator: async (value: any) => {
      if (!value) return true
      return await checkUnique(value)
    },
    message,
    trigger: 'blur'
  })
}

export const hotelRules = {
  roomNumber: (message: string = 'Please enter a valid room number'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const roomRegex = /^[A-Za-z0-9]{2,5}$/
      return roomRegex.test(value)
    },
    message,
    trigger: 'blur'
  }),

  guestCount: (message: string = 'Please enter a valid number of guests'): ValidationRule => ({
    validator: (value: any) => {
      const num = Number(value)
      return !isNaN(num) && num >= 1 && num <= 10
    },
    message,
    trigger: 'change'
  }),

  checkInDate: (message: string = 'Check-in date must be today or in the future'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date.getTime() >= today.getTime()
    },
    message,
    trigger: 'blur'
  }),

  checkOutDate: (checkInFieldName: string = 'checkInDate', message: string = 'Check-out date must be after check-in date'): ValidationRule => ({
    validator: (value: string, formData: any) => {
      if (!value || !formData || !formData[checkInFieldName]) return true
      const checkOut = new Date(value)
      const checkIn = new Date(formData[checkInFieldName])
      return checkOut.getTime() > checkIn.getTime()
    },
    message,
    trigger: 'blur'
  })
}

export function useFormValidation(formData: any, config: FormConfig) {
  const errors = ref<ValidationError[]>([])
  const validating = ref<Record<string, boolean>>({})
  const touched = ref<Record<string, boolean>>({})
  const submitted = ref(false)

  const isValid = computed(() => errors.value.length === 0)
  const hasErrors = computed(() => errors.value.length > 0)
  
  const fieldErrors = computed(() => {
    const errorMap: Record<string, string[]> = {}
    errors.value.forEach(error => {
      if (!errorMap[error.field]) {
        errorMap[error.field] = []
      }
      errorMap[error.field].push(error.message)
    })
    return errorMap
  })

  const isFieldValid = computed(() => (field: string) => {
    return !fieldErrors.value[field] || fieldErrors.value[field].length === 0
  })

  const isFieldTouched = computed(() => (field: string) => {
    return touched.value[field] || false
  })

  const isFieldValidating = computed(() => (field: string) => {
    return validating.value[field] || false
  })

  const shouldShowError = computed(() => (field: string) => {
    return (touched.value[field] || submitted.value) && !isFieldValid.value(field)
  })

  const debounceTimers: Record<string, NodeJS.Timeout> = {}

  const clearFieldErrors = (field: string) => {
    errors.value = errors.value.filter(error => error.field !== field)
  }

  const addFieldError = (field: string, message: string, rule?: ValidationRule) => {
    const existingError = errors.value.find(e => e.field === field && e.message === message)
    if (!existingError) {
      errors.value.push({ field, message, rule })
    }
  }

  const validateField = async (field: string, trigger: 'change' | 'blur' | 'submit' = 'change') => {
    const fieldConfig = config.fields[field]
    if (!fieldConfig) return true

    clearFieldErrors(field)
    
    const value = formData[field]
    let isFieldValid = true

    validating.value[field] = true

    try {
      if (fieldConfig.required) {
        const requiredRule = commonRules.required()
        if (!requiredRule.validator(value, formData)) {
          addFieldError(field, requiredRule.message, requiredRule)
          isFieldValid = false
          if (config.stopOnFirstError) {
            return false
          }
        }
      }

      if (fieldConfig.rules) {
        for (const rule of fieldConfig.rules) {
          if (rule.trigger && rule.trigger !== trigger && trigger !== 'submit') {
            continue
          }

          try {
            const result = await rule.validator(value, formData)
            if (!result) {
              addFieldError(field, rule.message, rule)
              isFieldValid = false
              if (config.stopOnFirstError) {
                break
              }
            }
          } catch (error) {
            console.error(`Validation error for field ${field}:`, error)
            addFieldError(field, 'Validation error occurred')
            isFieldValid = false
          }
        }
      }
    } finally {
      validating.value[field] = false
    }

    return isFieldValid
  }

  const validateFieldDebounced = (field: string, trigger: 'change' | 'blur' | 'submit' = 'change') => {
    const fieldConfig = config.fields[field]
    const delay = fieldConfig?.debounce || 300

    if (debounceTimers[field]) {
      clearTimeout(debounceTimers[field])
    }

    debounceTimers[field] = setTimeout(() => {
      validateField(field, trigger)
    }, delay)
  }

  const validateAllFields = async (trigger: 'submit' = 'submit') => {
    const fieldNames = Object.keys(config.fields)
    const validationPromises = fieldNames.map(field => validateField(field, trigger))
    
    const results = await Promise.all(validationPromises)
    return results.every(result => result)
  }

  const handleFieldChange = (field: string) => {
    touched.value[field] = true
    
    const fieldConfig = config.fields[field]
    if (fieldConfig?.validateOnChange !== false) {
      validateFieldDebounced(field, 'change')
    }
  }

  const handleFieldBlur = (field: string) => {
    touched.value[field] = true
    
    const fieldConfig = config.fields[field]
    if (fieldConfig?.validateOnBlur !== false) {
      validateField(field, 'blur')
    }
  }

  const handleSubmit = async (callback?: (data: any) => Promise<void> | void) => {
    submitted.value = true
    
    Object.keys(config.fields).forEach(field => {
      touched.value[field] = true
    })

    if (config.validateOnSubmit !== false) {
      const isFormValid = await validateAllFields('submit')
      if (!isFormValid) {
        return false
      }
    }

    if (callback) {
      try {
        await callback(formData)
        return true
      } catch (error) {
        console.error('Form submission error:', error)
        return false
      }
    }

    return true
  }

  const reset = () => {
    errors.value = []
    touched.value = {}
    submitted.value = false
    validating.value = {}
    
    Object.values(debounceTimers).forEach(timer => clearTimeout(timer))
  }

  const setFieldTouched = (field: string, isTouched: boolean = true) => {
    touched.value[field] = isTouched
  }

  const setFieldError = (field: string, message: string) => {
    clearFieldErrors(field)
    addFieldError(field, message)
  }

  const clearFieldError = (field: string) => {
    clearFieldErrors(field)
  }

  const clearAllErrors = () => {
    errors.value = []
  }

  Object.keys(config.fields).forEach(field => {
    watch(() => formData[field], () => {
      handleFieldChange(field)
    })
  })

  return {
    // State
    errors,
    validating,
    touched,
    submitted,
    
    // Computed
    isValid,
    hasErrors,
    fieldErrors,
    isFieldValid,
    isFieldTouched,
    isFieldValidating,
    shouldShowError,
    
    // Methods
    validateField,
    validateAllFields,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    reset,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    
    // Utils
    getFieldError: (field: string) => fieldErrors.value[field]?.[0] || '',
    getFieldErrors: (field: string) => fieldErrors.value[field] || [],
  }
}