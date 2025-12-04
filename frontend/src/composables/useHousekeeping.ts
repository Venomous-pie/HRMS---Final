import { ref, computed } from 'vue'
import type { Room } from '@/types/hotel'

export interface HousekeepingTask {
  id: string
  roomNumber: string
  taskType: 'checkout_cleaning' | 'maintenance' | 'deep_clean' | 'inspection' | 'restock'
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  estimatedDuration: number // minutes
  actualDuration?: number
  notes?: string
  checklistItems: ChecklistItem[]
  createdAt: string
  startedAt?: string
  completedAt?: string
  dueDate?: string
}

export interface ChecklistItem {
  id: string
  description: string
  completed: boolean
  notes?: string
}

export interface HousekeepingStaff {
  id: string
  name: string
  isActive: boolean
  currentTasks: string[] // task IDs
  skills: string[] // ['cleaning', 'maintenance', 'inspection']
}

export const useHousekeeping = () => {
  const tasks = ref<HousekeepingTask[]>([])
  const staff = ref<HousekeepingStaff[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const checklistTemplates = {
    checkout_cleaning: [
      { id: '1', description: 'Strip and remake beds with fresh linens', completed: false },
      { id: '2', description: 'Clean and sanitize bathroom thoroughly', completed: false },
      { id: '3', description: 'Vacuum carpets and mop floors', completed: false },
      { id: '4', description: 'Dust all surfaces and furniture', completed: false },
      { id: '5', description: 'Restock amenities and supplies', completed: false },
      { id: '6', description: 'Check and replace towels', completed: false },
      { id: '7', description: 'Empty trash and replace liners', completed: false },
      { id: '8', description: 'Check all appliances and fixtures', completed: false },
      { id: '9', description: 'Final inspection and quality check', completed: false },
    ],
    maintenance: [
      { id: '1', description: 'Check plumbing and fixtures', completed: false },
      { id: '2', description: 'Test electrical outlets and lighting', completed: false },
      { id: '3', description: 'Inspect air conditioning/heating', completed: false },
      { id: '4', description: 'Check door locks and security', completed: false },
      { id: '5', description: 'Inspect furniture for damage', completed: false },
      { id: '6', description: 'Test TV and electronic devices', completed: false },
    ],
    deep_clean: [
      { id: '1', description: 'Deep clean carpets and upholstery', completed: false },
      { id: '2', description: 'Clean windows and mirrors thoroughly', completed: false },
      { id: '3', description: 'Sanitize all surfaces with disinfectant', completed: false },
      { id: '4', description: 'Clean behind and under furniture', completed: false },
      { id: '5', description: 'Deep clean bathroom including grout', completed: false },
      { id: '6', description: 'Clean light fixtures and ceiling fans', completed: false },
    ],
    inspection: [
      { id: '1', description: 'Check room cleanliness standards', completed: false },
      { id: '2', description: 'Verify all amenities are stocked', completed: false },
      { id: '3', description: 'Test all electrical appliances', completed: false },
      { id: '4', description: 'Inspect bathroom functionality', completed: false },
      { id: '5', description: 'Check bed linens and towels quality', completed: false },
      { id: '6', description: 'Verify room temperature and ventilation', completed: false },
    ],
    restock: [
      { id: '1', description: 'Refill bathroom amenities (shampoo, soap)', completed: false },
      { id: '2', description: 'Replace towels and linens if needed', completed: false },
      { id: '3', description: 'Restock minibar items', completed: false },
      { id: '4', description: 'Replace coffee/tea supplies', completed: false },
      { id: '5', description: 'Check and refill tissue boxes', completed: false },
      { id: '6', description: 'Update room service menus if needed', completed: false },
    ]
  }

  const createTask = (
    roomNumber: string,
    taskType: HousekeepingTask['taskType'],
    priority: HousekeepingTask['priority'] = 'medium',
    dueDate?: string
  ): HousekeepingTask => {
    const task: HousekeepingTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomNumber,
      taskType,
      status: 'pending',
      priority,
      estimatedDuration: getEstimatedDuration(taskType),
      checklistItems: [...(checklistTemplates[taskType] || [])],
      createdAt: new Date().toISOString(),
      dueDate,
    }

    tasks.value.push(task)
    return task
  }

  const getEstimatedDuration = (taskType: HousekeepingTask['taskType']): number => {
    const durations = {
      checkout_cleaning: 45,
      maintenance: 30,
      deep_clean: 90,
      inspection: 15,
      restock: 10
    }
    return durations[taskType] || 30
  }

  const assignTask = (taskId: string, staffId: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    const staffMember = staff.value.find(s => s.id === staffId)

    if (!task || !staffMember) {
      error.value = 'Task or staff member not found'
      return false
    }

    if (!staffMember.isActive) {
      error.value = 'Staff member is not active'
      return false
    }

    task.assignedTo = staffId
    staffMember.currentTasks.push(taskId)
    return true
  }

  const startTask = (taskId: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    
    if (!task) {
      error.value = 'Task not found'
      return false
    }

    if (task.status !== 'pending') {
      error.value = 'Task is not in pending status'
      return false
    }

    task.status = 'in_progress'
    task.startedAt = new Date().toISOString()
    return true
  }

  const completeChecklistItem = (taskId: string, itemId: string, notes?: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    
    if (!task) {
      error.value = 'Task not found'
      return false
    }

    const item = task.checklistItems.find(i => i.id === itemId)
    if (!item) {
      error.value = 'Checklist item not found'
      return false
    }

    item.completed = true
    if (notes) item.notes = notes

    return true
  }

  const completeTask = (taskId: string, notes?: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    
    if (!task) {
      error.value = 'Task not found'
      return false
    }

    const incompleteItems = task.checklistItems.filter(item => !item.completed)
    if (incompleteItems.length > 0) {
      error.value = `Cannot complete task. ${incompleteItems.length} checklist items remaining.`
      return false
    }

    task.status = 'completed'
    task.completedAt = new Date().toISOString()
    if (notes) task.notes = notes

    if (task.startedAt) {
      const start = new Date(task.startedAt)
      const end = new Date()
      task.actualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    }

    if (task.assignedTo) {
      const staffMember = staff.value.find(s => s.id === task.assignedTo)
      if (staffMember) {
        staffMember.currentTasks = staffMember.currentTasks.filter(id => id !== taskId)
      }
    }

    return true
  }

  const getTasksByRoom = (roomNumber: string) => {
    return tasks.value.filter(task => task.roomNumber === roomNumber)
  }

  const getTasksByStatus = (status: HousekeepingTask['status']) => {
    return tasks.value.filter(task => task.status === status)
  }

  const getTasksByStaff = (staffId: string) => {
    return tasks.value.filter(task => task.assignedTo === staffId)
  }

  const isRoomReady = (roomNumber: string): boolean => {
    const roomTasks = getTasksByRoom(roomNumber)
    const pendingTasks = roomTasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    )
    return pendingTasks.length === 0
  }

  const getRoomStatus = (roomNumber: string): 'clean' | 'dirty' | 'in_progress' | 'maintenance' => {
    const roomTasks = getTasksByRoom(roomNumber)
    
    if (roomTasks.some(task => task.taskType === 'maintenance' && task.status !== 'completed')) {
      return 'maintenance'
    }
    
    if (roomTasks.some(task => task.status === 'in_progress')) {
      return 'in_progress'
    }
    
    if (roomTasks.some(task => task.status === 'pending')) {
      return 'dirty'
    }
    
    return 'clean'
  }

  const taskStats = computed(() => {
    const total = tasks.value.length
    const byStatus = tasks.value.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const overdueTasks = tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false
      return new Date(task.dueDate) < new Date()
    }).length

    return {
      total,
      pending: byStatus.pending || 0,
      inProgress: byStatus.in_progress || 0,
      completed: byStatus.completed || 0,
      overdue: overdueTasks,
    }
  })

  const staffWorkload = computed(() => {
    return staff.value.map(member => ({
      ...member,
      activeTasks: member.currentTasks.length,
      workload: member.currentTasks.length > 5 ? 'high' : 
                member.currentTasks.length > 2 ? 'medium' : 'low'
    }))
  })

  return {
    // State
    tasks,
    staff,
    isLoading,
    error,
    
    // Computed
    taskStats,
    staffWorkload,
    
    // Methods
    createTask,
    assignTask,
    startTask,
    completeChecklistItem,
    completeTask,
    getTasksByRoom,
    getTasksByStatus,
    getTasksByStaff,
    isRoomReady,
    getRoomStatus,
  }
}
