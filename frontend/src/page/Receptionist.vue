<template>
  <div class="flex w-full h-screen gap-1">
    <SideBar />
    <div class="flex flex-col w-[85%] p-0 m-0 overflow-auto">
      <Content />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import SideBar from '../components/Sidebar.vue'
import Content from '../components/Maincontent.vue'

const { checkAuthStatus } = useAuth()

// Verify authentication status when component mounts
onMounted(async () => {
  // checkAuthStatus now handles redirects gracefully, no need for error handling
  await checkAuthStatus()
})
</script>
