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
            text-color="text-white"
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
        <div v-if="error" class="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-red-600 text-lg"></i>
            </div>
            <div>
              <p class="text-red-800 text-sm font-semibold">Error</p>
              <p class="text-red-700 text-sm mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="px-8 py-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <i class="pi pi-users text-blue-600 text-lg"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Staff Accounts</h2>
                <p class="text-sm text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-if="loading && users.length === 0" class="p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
            </div>
            <p class="text-gray-600 font-medium">Loading users...</p>
            <p class="text-gray-500 text-sm mt-1">Please wait while we fetch the staff accounts</p>
          </div>

          <!-- Users List -->
          <div v-else-if="users.length > 0" class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th class="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                  <th class="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th class="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                  <th class="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th class="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Login</th>
                  <th class="px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-8 py-6 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-12 w-12">
                        <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                          <i class="pi pi-user text-gray-600 text-lg"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-base font-semibold text-gray-900 flex items-center gap-3">
                          {{ user.firstName }} {{ user.lastName }}
                          <span v-if="isCurrentUser(user)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                            <i class="pi pi-star-fill mr-1"></i>
                            You
                          </span>
                        </div>
                        <div class="text-sm text-gray-600 mt-1">{{ user.email }}</div>
                        <div class="text-xs text-gray-500 font-mono">@{{ user.username }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap">
                    <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
                          :class="getRoleBadgeClass(user.role)">
                      <i class="pi pi-shield mr-2"></i>
                      {{ capitalizeRole(user.role) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ user.department || '-' }}
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap">
                    <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
                          :class="user.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'">
                      <i :class="user.isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'" class="mr-2"></i>
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {{ formatLastLogin(user.lastLogin) }}
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        @click="editUser(user)"
                        class="w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                        title="Edit User"
                      >
                        <i class="pi pi-pencil text-sm"></i>
                      </button>
                      <button
                        @click="resetPassword(user)"
                        class="w-10 h-10 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                        title="Reset Password"
                      >
                        <i class="pi pi-key text-sm"></i>
                      </button>
                      <button
                        @click="toggleUserStatus(user)"
                        :class="user.isActive ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-green-100 hover:bg-green-200 text-green-600'"
                        :disabled="isCurrentUser(user) && user.isActive"
                        class="w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        :title="getToggleButtonTitle(user)"
                      >
                        <i :class="user.isActive ? 'pi pi-ban' : 'pi pi-check-circle'" class="text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="p-16 text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i class="pi pi-users text-4xl text-gray-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Staff Accounts Found</h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating your first staff account to manage hotel operations.</p>
            <button
              @click="showCreateModal = true"
              class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <i class="pi pi-plus mr-2"></i>
              Create First User
            </button>
          </div>
        </div>
      </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-8 py-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-user-plus text-green-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Create New User</h3>
              <p class="text-sm text-gray-600">Add a new staff member to the system</p>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="createUser" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input v-model="newUser.firstName" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input v-model="newUser.lastName" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input v-model="newUser.username" type="text" required
                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input v-model="newUser.email" type="email" required
                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input v-model="newUser.password" type="password" required
                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select v-model="newUser.role" required
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="accounting">Accounting</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <input v-model="newUser.department" type="text"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input v-model="newUser.phone" type="tel"
                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm">
          </div>
          
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="cancelCreate"
              class="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
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