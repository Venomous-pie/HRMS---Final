<template>
  <div class="min-h-screen bg-gray-50 flex overflow-y-hidden">
    <!-- Left Side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-20 left-20 w-24 h-24 bg-white/10 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-32 w-20 h-20 bg-white/5 rounded-full"></div>
        <div class="absolute bottom-32 left-40 w-16 h-16 bg-white/10 rounded-lg transform -rotate-12"></div>
        <div class="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
        <div class="text-center flex flex-col items-center justify-center">
          <div class="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Hotel Logo" class="h-16 object-contain">
            <div class="text-left">
              <h1 class="text-3xl font-bold text-white">Grand Resort</h1>
              <p class="text-green-100 text-sm">Admin Portal</p>
            </div>
          </div>
          <h2 class="text-2xl font-semibold mb-4">Hotel Management System</h2>
          <p class="text-green-100 text-center max-w-sm">
            Secure administrative access to manage hotel operations, reservations, and analytics.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-shield text-xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-700 mb-2">Admin Login</h2>
          <p class="text-gray-600 text-sm">Access administrative dashboard</p>
        </div>

        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <div>
              <p class="text-red-700 text-sm font-medium">{{ error }}</p>
              <p class="text-red-600 text-xs mt-1">
                Please check your credentials and try again
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm bg-white"
              placeholder="Enter your username"
              :disabled="isLoading"
            />
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
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm bg-white"
                placeholder="Enter your password"
                :disabled="isLoading"
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
          </div>

          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                :disabled="isLoading"
              />
              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              class="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              :disabled="isLoading"
            >
              Need help?
            </button>
          </div>

          <div class="pt-2">
            <Custombutton
              type="submit"
              :label="isLoading ? 'Signing in...' : 'Sign In'"
              bg-color="bg-green-600"
              hover-bg-color="hover:bg-green-700"
              text-color="text-white"
              width="100%"
              height="3rem"
              :disabled="isLoading || !credentials.username || !credentials.password"
              :hover="true"
              @click="handleLogin"
              class="rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center justify-center gap-2">
                <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-sign-in"></i>
                <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
              </div>
            </Custombutton>
          </div>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="pi pi-info-circle text-green-600 text-sm"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-green-800 font-semibold text-sm mb-2">Demo Admin Credentials</h3>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-green-700 font-medium">Username:</span>
                  <code class="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">admin</code>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-700 font-medium">Password:</span>
                  <code class="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">admin123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import Custombutton from '../components/Custombutton.vue'

const { login, isLoading, error, clearError, checkAuthStatus } = useAuth()

const credentials = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  clearError()
  await login(credentials.value)
}

onMounted(async () => {
  // checkAuthStatus now handles redirects gracefully
  await checkAuthStatus()
})
</script>