<template>
  <div class="min-h-screen bg-gray-50 flex overflow-y-hidden">
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full"></div>
        <div class="absolute bottom-32 left-40 w-20 h-20 bg-white/10 rounded-lg transform -rotate-12"></div>
        <div class="absolute bottom-20 right-20 w-28 h-28 bg-white/5 rounded-full"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
        <div class="text-center flex flex-col items-center justify-center">
          <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
            <img src="/logo.png" alt="Hotel Logo" class="w-full h-full object-contain filter brightness-0 invert">
          </div>
          <h1 class="text-4xl font-bold mb-4">Staff Portal</h1>
          <p class="text-xl text-blue-100 mb-8">Hotel Management System</p>
        </div>
      </div>
    </div>

    <div class="flex-1 flex items-center justify-center p-4 overflow-y-auto">
      <div class="w-full max-w-md my-auto">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-id-card text-2xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Staff Login</h2>
          <p class="text-gray-600 text-sm">Access your work dashboard</p>
        </div>

        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <div>
              <p class="text-red-700 text-sm font-medium">{{ error }}</p>
              <p v-if="showRetryHint" class="text-red-600 text-xs mt-1">
                Please check your credentials and try again
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="pi pi-user text-gray-400 mr-2"></i>
              Username
            </label>
            <input
              id="username"
              v-model="credentials.username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              :class="{
                'border-gray-300': !shouldShowError('username'),
                'border-red-300 focus:ring-red-500 focus:border-red-500': shouldShowError('username')
              }"
              placeholder="Enter your username"
              :disabled="isLoading"
              @blur="handleFieldBlur('username')"
            />
            <!-- Field Error -->
            <div v-if="shouldShowError('username')" class="mt-1 text-sm text-red-600">
              {{ getFieldError('username') }}
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="pi pi-lock text-gray-400 mr-2"></i>
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                :class="{
                  'border-gray-300': !shouldShowError('password'),
                  'border-red-300 focus:ring-red-500 focus:border-red-500': shouldShowError('password')
                }"
                placeholder="Enter your password"
                :disabled="isLoading"
                @blur="handleFieldBlur('password')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                :disabled="isLoading"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
            <!-- Field Error -->
            <div v-if="shouldShowError('password')" class="mt-1 text-sm text-red-600">
              {{ getFieldError('password') }}
            </div>
          </div>


          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                :disabled="isLoading"
              />
              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              :disabled="isLoading"
            >
              Need help?
            </button>
          </div>

          <Custombutton
            type="submit"
            :label="isLoading ? 'Signing in...' : 'Sign In'"
            bg-color="bg-blue-600"
            hover-bg-color="hover:bg-blue-700"
            font-size="0.875rem"
            padding="0.75rem 1.5rem"
            width="100%"
            height="3rem"
            :rounded="false"
            text-class="font-semibold"
            :disabled="isLoading || !isFormValid"
            :hover="true"
          >
            <div class="flex items-center justify-center gap-2">
              <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-sign-in"></i>
              <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
            </div>
          </Custombutton>
        </form>

        <div class="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-600 mt-0.5"></i>
            <div>
              <p class="text-xs text-blue-600">
                Use your employee credentials to access your department's tools and features.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center">
          <router-link
            to="/admin"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Administrator? <span class="font-medium text-blue-600 hover:text-blue-700">Sign in here</span>
          </router-link>
        </div>

        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            © 2024 Hotel Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useFormValidation, commonRules } from '../composables/useFormValidation'
import Custombutton from '../components/Custombutton.vue'

const { login, isLoading, error, clearError, checkAuthStatus } = useAuth()

// Form data
const credentials = reactive({
  username: '',
  password: ''
})

// Form validation
const formConfig = {
  fields: {
    username: {
      required: true,
      rules: [
        commonRules.minLength(3, 'Username must be at least 3 characters')
      ]
    },
    password: {
      required: true,
      rules: [
        commonRules.minLength(4, 'Password must be at least 4 characters')
      ]
    }
  }
}

const {
  isValid,
  shouldShowError,
  getFieldError,
  handleFieldBlur,
  handleSubmit,
  reset: resetValidation
} = useFormValidation(credentials, formConfig)

const showPassword = ref(false)
const rememberMe = ref(false)
const loginAttempts = ref(0)

// Form validation computed
const isFormValid = computed(() => {
  return isValid.value && credentials.username.trim().length >= 3 && 
         credentials.password.length >= 4
})

const showRetryHint = computed(() => {
  return error.value && loginAttempts.value > 0
})

// Clear error when user starts typing - smooth UX bestie ✨
watch([() => credentials.username, () => credentials.password], () => {
  if (error.value) {
    clearError()
  }
})

const handleLogin = async () => {
  if (!isFormValid.value) return
  
  const success = await handleSubmit(async () => {
    clearError()
    loginAttempts.value++
    
    await login(credentials)
    // Reset attempts on successful login
    loginAttempts.value = 0
  })
  
  // No need to log anything here - useAuth composable handles error display
  // The success variable indicates whether the login was successful
}

onMounted(async () => {
  await checkAuthStatus()
})
</script>
