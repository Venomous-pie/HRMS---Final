<template>
  <AdminLayout page-title="User Management">
    <!-- Page Controls -->
    <div class="px-6 py-2">
      <div class="flex items-center justify-between">
        <Searchbar
          placeholder="Search users..."
          icon="pi pi-search"
          :outline="false"
          @search="handleUserSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4">
          <Custombutton 
            label="Add User" 
            bg-color="bg-green-600"
            hover-bg-color="hover:bg-green-700"
            :hover="true"
            @click="showCreateModal = true"
          />
          <button
            @click="refreshUsers"
            :disabled="loading"
            class="flex items-center gap-2 px-3 py-2 text-xs text-blue-700 bg-blue-50 outline outline-1 outline-blue-200 rounded-full transition-colors hover:bg-blue-100 disabled:opacity-50"
          >
            <i class="pi pi-refresh w-3 h-3" :class="{ 'pi-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-2 overflow-y-auto h-full">
        
        <!-- Error Alert -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-red-600"></i>
            </div>
            <div>
              <p class="text-red-800 text-sm font-semibold">Error</p>
              <p class="text-red-700 text-sm mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-lg shadow border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <i class="pi pi-users text-blue-600 text-sm"></i>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Staff Accounts</h2>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-if="loading && users.length === 0" class="p-12 text-center">
            <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-spin pi-spinner text-xl text-gray-400"></i>
            </div>
            <p class="text-gray-600 font-medium">Loading users...</p>
          </div>

          <!-- Users List -->
          <div v-else-if="users.length > 0" class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <i class="pi pi-user text-gray-600"></i>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          {{ user.firstName }} {{ user.lastName }}
                          <span v-if="isCurrentUser(user)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            You
                          </span>
                        </div>
                        <div class="text-xs text-gray-600">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
                          :class="getRoleBadgeClass(user.role)">
                      {{ capitalizeRole(user.role) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.department || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
                          :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ formatLastLogin(user.lastLogin) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="editUser(user)"
                        class="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors flex items-center justify-center"
                        title="Edit User"
                      >
                        <i class="pi pi-pencil text-xs"></i>
                      </button>
                      <button
                        @click="resetPassword(user)"
                        class="w-8 h-8 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded transition-colors flex items-center justify-center"
                        title="Reset Password"
                      >
                        <i class="pi pi-key text-xs"></i>
                      </button>
                      <button
                        @click="toggleUserStatus(user)"
                        :class="user.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'"
                        :disabled="isCurrentUser(user) && user.isActive"
                        class="w-8 h-8 rounded transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        :title="getToggleButtonTitle(user)"
                      >
                        <i :class="user.isActive ? 'pi pi-ban' : 'pi pi-check-circle'" class="text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-users text-3xl text-gray-400"></i>
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-2">No Staff Accounts Found</h3>
            <p class="text-gray-600 text-sm mb-4">Get started by creating your first staff account</p>
            <button
              @click="showCreateModal = true"
              class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors"
            >
              <i class="pi pi-plus mr-2"></i>
              Create First User
            </button>
          </div>
        </div>
      </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <i class="pi pi-user-plus text-green-600"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Create New User</h3>
              <p class="text-xs text-gray-600">Add a new staff member to the system</p>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="createUser" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">First Name</label>
              <input v-model="newUser.firstName" type="text" required
                     class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">Last Name</label>
              <input v-model="newUser.lastName" type="text" required
                     class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Username</label>
            <input v-model="newUser.username" type="text" required
                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input v-model="newUser.email" type="email" required
                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
            <input v-model="newUser.password" type="password" required
                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
              <select v-model="newUser.role" required
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="accounting">Accounting</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
              <input v-model="newUser.department" type="text"
                     class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <input v-model="newUser.phone" type="tel"
                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="cancelCreate"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <i v-if="creating" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-plus"></i>
              <span v-if="creating">Creating...</span>
              <span v-else>Create User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'
import { api } from '../utils/api'
import { useAuth } from '../composables/useAuth'

const { currentUser } = useAuth()

const users = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const creating = ref(false)

const newUser = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  role: '',
  department: '',
  phone: ''
})

const handleUserSearch = (query: string) => {
  // TODO: Implement user search functionality
  console.log('Searching users:', query)
}

const refreshUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.users.getAll()
    users.value = response.data || []
    
    // Auto-reactivate admin account if needed - this is bussin fr 🔥
    await ensureAdminAccountActive()
    
  } catch (err: any) {
    error.value = err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const ensureAdminAccountActive = async () => {
  try {
    // Find all admin/manager accounts
    const adminUsers = users.value.filter(user => 
      user.role === 'admin' || user.role === 'manager'
    )
    
    // Check if any admin is active
    const hasActiveAdmin = adminUsers.some(user => user.isActive)
    
    if (!hasActiveAdmin && adminUsers.length > 0) {
      // Find the first admin account to reactivate
      const adminToReactivate = adminUsers.find(user => user.role === 'admin') || adminUsers[0]
      
      console.log(`No active admin found. Reactivating ${adminToReactivate.username}...`)
      
      // Reactivate the admin account
      await api.users.update(adminToReactivate.id, { isActive: true })
      
      // Refresh the users list to show the change
      const response = await api.users.getAll()
      users.value = response.data || []
      
      // Show success message
      error.value = null
      console.log(`Admin account ${adminToReactivate.username} has been automatically reactivated`)
    }
  } catch (err: any) {
    console.warn('Failed to ensure admin account is active:', err)
    // Don't show this error to user as it's an automatic process
  }
}

const createUser = async () => {
  creating.value = true
  error.value = null
  
  try {
    await api.users.create(newUser.value)
    showCreateModal.value = false
    resetNewUser()
    await refreshUsers()
  } catch (err: any) {
    error.value = err.message || 'Failed to create user'
  } finally {
    creating.value = false
  }
}

const cancelCreate = () => {
  showCreateModal.value = false
  resetNewUser()
}

const resetNewUser = () => {
  newUser.value = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: '',
    department: '',
    phone: ''
  }
}

const editUser = (user: any) => {
  // TODO: Implement edit functionality
  console.log('Edit user:', user)
}

const resetPassword = async (user: any) => {
  if (confirm(`Reset password for ${user.firstName} ${user.lastName}?`)) {
    try {
      const newPassword = 'TempPassword123!' // In real app, generate or prompt
      await api.users.resetPassword(user.id, newPassword)
      alert(`Password reset to: ${newPassword}`)
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password'
    }
  }
}

const toggleUserStatus = async (user: any) => {
  // Prevent self-deactivation - no cap bestie, can't yeet yourself 💀
  if (isCurrentUser(user) && user.isActive) {
    error.value = "You cannot deactivate your own account while logged in"
    return
  }

  const action = user.isActive ? 'deactivate' : 'activate'
  
  // Check if trying to deactivate the last active admin
  if (user.isActive && (user.role === 'admin' || user.role === 'manager')) {
    const activeAdmins = users.value.filter(u => 
      (u.role === 'admin' || u.role === 'manager') && u.isActive && u.id !== user.id
    )
    
    if (activeAdmins.length === 0) {
      error.value = "Cannot deactivate the last active administrator. At least one admin must remain active."
      return
    }
  }
  
  const confirmMessage = user.isActive 
    ? `Are you sure you want to deactivate ${user.firstName} ${user.lastName}? They will lose access to the system.`
    : `Reactivate ${user.firstName} ${user.lastName}? They will regain access to the system.`
    
  if (confirm(confirmMessage)) {
    try {
      await api.users.update(user.id, { isActive: !user.isActive })
      await refreshUsers()
      
      // Show success message
      const successMessage = user.isActive 
        ? `${user.firstName} ${user.lastName} has been deactivated`
        : `${user.firstName} ${user.lastName} has been reactivated`
      
      // Clear any previous errors
      error.value = null
      
      // You could add a success toast here if you have one
      console.log(successMessage)
      
    } catch (err: any) {
      error.value = err.message || `Failed to ${action} user`
    }
  }
}

const getRoleBadgeClass = (role: string) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    receptionist: 'bg-green-100 text-green-800',
    housekeeping: 'bg-yellow-100 text-yellow-800',
    accounting: 'bg-orange-100 text-orange-800'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const capitalizeRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const formatLastLogin = (lastLogin: string | null) => {
  if (!lastLogin) return 'Never'
  return new Date(lastLogin).toLocaleString()
}

// Helper to check if user is the currently logged in user
const isCurrentUser = (user: any) => {
  return currentUser.value?.id === user.id
}

// Helper to get appropriate button title
const getToggleButtonTitle = (user: any) => {
  if (isCurrentUser(user) && user.isActive) {
    return "Cannot deactivate your own account"
  }
  return user.isActive ? 'Deactivate' : 'Activate'
}

onMounted(() => {
  refreshUsers()
})
</script>