import { ref, computed } from 'vue'

interface AsyncOperation {
  id: string
  label?: string
  startTime: Date
}

interface LoadingOptions {
  timeout?: number
  onTimeout?: (operation: AsyncOperation) => void
  onError?: (error: any, operation: AsyncOperation) => void
}

export function useLoading(defaultOptions: LoadingOptions = {}) {
  const operations = ref<Map<string, AsyncOperation>>(new Map())
  
  const isLoading = computed(() => operations.value.size > 0)
  const loadingOperations = computed(() => Array.from(operations.value.values()))
  const loadingCount = computed(() => operations.value.size)
  
  const startLoading = (id: string, label?: string): string => {
    const operation: AsyncOperation = {
      id,
      label,
      startTime: new Date()
    }
    
    operations.value.set(id, operation)
    
    // Setup timeout if specified
    if (defaultOptions.timeout) {
      setTimeout(() => {
        if (operations.value.has(id)) {
          defaultOptions.onTimeout?.(operation)
          stopLoading(id)
        }
      }, defaultOptions.timeout)
    }
    
    return id
  }
  
  const stopLoading = (id: string): void => {
    operations.value.delete(id)
  }
  
  const isOperationLoading = (id: string): boolean => {
    return operations.value.has(id)
  }
  
  const getOperation = (id: string): AsyncOperation | undefined => {
    return operations.value.get(id)
  }
  
  const clearAll = (): void => {
    operations.value.clear()
  }
  
  // Wrapper function for async operations
  const withLoading = async <T>(
    operation: () => Promise<T>,
    id?: string,
    label?: string,
    options?: LoadingOptions
  ): Promise<T> => {
    const operationId = id || `operation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mergedOptions = { ...defaultOptions, ...options }
    
    try {
      startLoading(operationId, label)
      const result = await operation()
      return result
    } catch (error) {
      mergedOptions.onError?.(error, operations.value.get(operationId)!)
      throw error
    } finally {
      stopLoading(operationId)
    }
  }
  
  return {
    // State
    isLoading,
    loadingOperations,
    loadingCount,
    
    // Methods
    startLoading,
    stopLoading,
    isOperationLoading,
    getOperation,
    clearAll,
    withLoading
  }
}

// Global loading state for app-wide operations
const globalLoading = useLoading({
  timeout: 30000, // 30 second timeout
  onTimeout: (operation) => {
    console.warn(`Operation "${operation.label || operation.id}" timed out`)
  },
  onError: (error, operation) => {
    console.error(`Operation "${operation.label || operation.id}" failed:`, error)
  }
})

export const useGlobalLoading = () => globalLoading