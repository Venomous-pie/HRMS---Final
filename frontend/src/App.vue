<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { useAutoLogout } from './composables/useAutoLogout'
import { setUnauthorizedHandler, clearUnauthorizedHandler } from './services/apiClient'
import LogoutWarning from './components/LogoutWarning.vue'
import ToastNotifications from './components/ToastNotifications.vue'

const { isAuthenticated, checkAuthStatus } = useAuth()
const { 
  showLogoutWarning, 
  warningCountdown, 
  cancelLogout, 
  handleUnauthorized,
  startPeriodicCheck,
  stopPeriodicCheck 
} = useAutoLogout({
  checkIntervalMinutes: 2, // Check more frequently
  showWarning: false, // Don't show warning for account deactivation - immediate logout
  warningDurationSeconds: 10 // Shorter warning for other issues
})

// Initialize auth check and auto logout when app starts
onMounted(async () => {
  // Always set up the unauthorized handler first
  setUnauthorizedHandler(handleUnauthorized)
  
  // Check auth status - no need for try/catch as it handles errors gracefully now
  const isValid = await checkAuthStatus()
  
  if (isValid && isAuthenticated.value) {
    startPeriodicCheck()
  }
})

// Cleanup on app unmount
onUnmounted(() => {
  clearUnauthorizedHandler()
  stopPeriodicCheck()
})

const handleLogoutNow = async () => {
  await handleUnauthorized('User requested logout')
}
</script>

<template>
  <div class="font-sans">
    <router-view />
    
    <!-- Auto logout warning modal -->
    <LogoutWarning
      :show="showLogoutWarning"
      :countdown="warningCountdown"
      @cancel="cancelLogout"
      @logout="handleLogoutNow"
    />
    
    <!-- Toast notifications -->
    <ToastNotifications />
  </div>
</template>

<style scoped></style>
