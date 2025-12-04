<template>
  <AdminLayout page-title="System Logs">
    <!-- Page Controls -->
    <div class="px-6 py-2">
      <div class="flex items-center justify-between">
        <Searchbar
          placeholder="Search logs..."
          icon="pi pi-search"
          :outline="false"
          @search="handleLogSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4">
          <!-- Log Level Filter -->
          <div class="relative log-level-dropdown">
            <div
              @click="showLogLevelDropdown = !showLogLevelDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ selectedLogLevel || 'All Levels' }}
              <i class="pi pi-chevron-down absolute right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div
              v-if="showLogLevelDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div
                v-for="level in logLevels"
                :key="level"
                @click="selectedLogLevel = level; showLogLevelDropdown = false; filterLogs();"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedLogLevel === level }"
              >
                {{ level }}
              </div>
            </div>
          </div>
          <button
            @click="refreshLogs"
            class="flex items-center gap-2 px-3 py-2 text-xs text-blue-700 bg-blue-50 outline outline-1 outline-blue-200 rounded-full transition-colors hover:bg-blue-100"
          >
            <i class="pi pi-refresh w-3 h-3"></i>
            Refresh
          </button>
          <Custombutton 
            label="Export Logs" 
            bg-color="bg-purple-600"
            hover-bg-color="hover:bg-purple-700"
            text-color="text-white"
            :hover="true"
            @click="exportLogs"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-2 overflow-y-auto h-full">
      <!-- Log Statistics -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Log Overview</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-file-edit text-blue-600 text-lg"></i>
              <span class="text-sm text-gray-600">Total Logs</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ totalLogs }}</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-exclamation-triangle text-red-600 text-lg"></i>
              <span class="text-sm text-gray-600">Errors</span>
            </div>
            <div class="text-2xl font-bold text-red-600">{{ errorLogs }}</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-exclamation-circle text-yellow-600 text-lg"></i>
              <span class="text-sm text-gray-600">Warnings</span>
            </div>
            <div class="text-2xl font-bold text-yellow-600">{{ warningLogs }}</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-info-circle text-blue-600 text-lg"></i>
              <span class="text-sm text-gray-600">Info</span>
            </div>
            <div class="text-2xl font-bold text-blue-600">{{ infoLogs }}</div>
          </div>
        </div>
      </div>

      <!-- Log Entries -->
      <div class="border-t border-gray-200 pt-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Recent System Activities</h3>
            <p class="text-sm text-gray-600">Real-time system logs and events</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-xs text-gray-600">Live</span>
            </div>
          </div>
        </div>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div 
            v-for="log in filteredLogs" 
            :key="log.id"
            class="flex items-start gap-3 p-3 border border-gray-200 hover:border-gray-400 transition-colors"
            :class="getLogLevelClass(log.level)"
          >
            <div class="flex-shrink-0 mt-1">
              <div 
                class="w-2 h-2 rounded-full"
                :class="getLogDotClass(log.level)"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-medium text-gray-900">{{ log.timestamp }}</span>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getLogBadgeClass(log.level)"
                >
                  {{ log.level.toUpperCase() }}
                </span>
                <span class="text-xs text-gray-600">{{ log.source }}</span>
              </div>
              <p class="text-sm text-gray-900 mb-1">{{ log.message }}</p>
              <div v-if="log.details" class="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded border">
                {{ log.details }}
              </div>
            </div>
            <div class="flex-shrink-0">
              <button 
                class="text-xs text-gray-400 hover:text-gray-600"
                @click="viewLogDetails(log)"
              >
                <i class="pi pi-eye"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="filteredLogs.length === 0" class="text-center py-8">
          <i class="pi pi-file-edit text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">No logs found matching your criteria</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  source: string
  message: string
  details?: string
}

const showLogLevelDropdown = ref(false)
const selectedLogLevel = ref('')
const searchQuery = ref('')

const logLevels = ['All Levels', 'Info', 'Warning', 'Error', 'Debug']

const logs = ref<LogEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const totalLogs = computed(() => logs.value.length)
const errorLogs = computed(() => logs.value.filter(log => log.level === 'error').length)
const warningLogs = computed(() => logs.value.filter(log => log.level === 'warning').length)
const infoLogs = computed(() => logs.value.filter(log => log.level === 'info').length)

const filteredLogs = computed(() => {
  let filtered = logs.value
  
  if (selectedLogLevel.value && selectedLogLevel.value !== 'All Levels') {
    filtered = filtered.filter(log => log.level === selectedLogLevel.value.toLowerCase())
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(query) ||
      log.source.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query)
    )
  }
  
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const handleLogSearch = (query: string) => {
  searchQuery.value = query
}

const filterLogs = () => {
  // Filtering is handled by computed property
}

// Fetch logs from API
const fetchLogs = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const response = await fetch('http://localhost:3000/api/admin/logs', {
      cache: 'no-cache',
      headers
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        // Transform timestamps to local string format
        const transformedLogs = result.data.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp).toLocaleString()
        }))
        logs.value = transformedLogs
        console.log('✅ System logs loaded:', transformedLogs.length, 'entries')
      }
    } else {
      throw new Error(`Failed to fetch logs: ${response.statusText}`)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load system logs'
    console.error('Error fetching logs:', err)
  } finally {
    loading.value = false
  }
}

const refreshLogs = async () => {
  console.log('Refreshing logs...')
  await fetchLogs()
}

const exportLogs = () => {
  console.log('Exporting logs...', filteredLogs.value)
}

const getLogLevelClass = (level: string) => {
  const classes = {
    info: 'border-l-4 border-l-blue-500',
    warning: 'border-l-4 border-l-yellow-500',
    error: 'border-l-4 border-l-red-500',
    debug: 'border-l-4 border-l-gray-500'
  }
  return classes[level as keyof typeof classes] || 'border-l-4 border-l-gray-300'
}

const getLogDotClass = (level: string) => {
  const classes = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    debug: 'bg-gray-500'
  }
  return classes[level as keyof typeof classes] || 'bg-gray-300'
}

const getLogBadgeClass = (level: string) => {
  const classes = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    debug: 'bg-gray-100 text-gray-800'
  }
  return classes[level as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const viewLogDetails = (log: LogEntry) => {
  console.log('Viewing log details:', log)
}

onMounted(() => {
  // Initial load of logs
  fetchLogs()
  
  // Auto-refresh logs every 30 seconds
  setInterval(() => {
    fetchLogs()
  }, 30000)
})
</script>
