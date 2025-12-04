import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Modal {
  id: string
  component: string
  props?: Record<string, any>
  persistent?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

interface Sidebar {
  id: string
  isOpen: boolean
  component?: string
  props?: Record<string, any>
  side?: 'left' | 'right'
  overlay?: boolean
}

export const useUIStore = defineStore('ui', () => {
  // State
  const theme = ref<'light' | 'dark' | 'auto'>('light')
  const sidebarCollapsed = ref(false)
  const modals = ref<Modal[]>([])
  const sidebars = ref<Record<string, Sidebar>>({})
  const loading = ref<Record<string, boolean>>({})
  const breadcrumbs = ref<Array<{ label: string; path?: string }>>([])
  const pageTitle = ref('')
  const isMobile = ref(false)
  const isTablet = ref(false)
  const screenSize = ref<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')

  // Getters
  const isDarkMode = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const hasOpenModal = computed(() => modals.value.length > 0)
  const topModal = computed(() => modals.value[modals.value.length - 1] || null)
  const modalCount = computed(() => modals.value.length)
  
  const openSidebars = computed(() => 
    Object.values(sidebars.value).filter(sidebar => sidebar.isOpen)
  )
  
  const isLoading = computed(() => (key?: string) => {
    if (key) {
      return loading.value[key] || false
    }
    return Object.values(loading.value).some(isLoading => isLoading)
  })

  const deviceType = computed(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    return 'desktop'
  })

  // Actions
  
  // Theme management
  const setTheme = (newTheme: typeof theme.value) => {
    theme.value = newTheme
    updateDocumentClasses()
  }

  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }

  const updateDocumentClasses = () => {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // Modal management
  const openModal = (modal: Omit<Modal, 'id'>): string => {
    const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newModal: Modal = {
      ...modal,
      id,
      size: modal.size || 'md'
    }
    
    modals.value.push(newModal)
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden'
    
    return id
  }

  const closeModal = (id?: string) => {
    if (id) {
      const index = modals.value.findIndex(modal => modal.id === id)
      if (index > -1) {
        modals.value.splice(index, 1)
      }
    } else {
      // Close the top modal
      modals.value.pop()
    }

    // Restore body scrolling if no modals are open
    if (modals.value.length === 0) {
      document.body.style.overflow = ''
    }
  }

  const closeAllModals = () => {
    modals.value = []
    document.body.style.overflow = ''
  }

  const updateModal = (id: string, updates: Partial<Modal>) => {
    const modal = modals.value.find(m => m.id === id)
    if (modal) {
      Object.assign(modal, updates)
    }
  }

  // Sidebar management
  const toggleSidebar = (id: string = 'main') => {
    if (sidebars.value[id]) {
      sidebars.value[id].isOpen = !sidebars.value[id].isOpen
    } else {
      sidebars.value[id] = {
        id,
        isOpen: true,
        side: 'left',
        overlay: true
      }
    }
  }

  const openSidebar = (id: string, options?: Partial<Sidebar>) => {
    sidebars.value[id] = {
      id,
      isOpen: true,
      side: 'left',
      overlay: true,
      ...options
    }
  }

  const closeSidebar = (id: string) => {
    if (sidebars.value[id]) {
      sidebars.value[id].isOpen = false
    }
  }

  const closeAllSidebars = () => {
    Object.keys(sidebars.value).forEach(id => {
      sidebars.value[id].isOpen = false
    })
  }

  // Main sidebar (for navigation)
  const toggleMainSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setMainSidebar = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  // Loading management
  const setLoading = (key: string, isLoading: boolean) => {
    if (isLoading) {
      loading.value[key] = true
    } else {
      delete loading.value[key]
    }
  }

  const clearAllLoading = () => {
    loading.value = {}
  }

  // Navigation
  const setBreadcrumbs = (items: Array<{ label: string; path?: string }>) => {
    breadcrumbs.value = items
  }

  const addBreadcrumb = (item: { label: string; path?: string }) => {
    breadcrumbs.value.push(item)
  }

  const setPageTitle = (title: string) => {
    pageTitle.value = title
    document.title = title ? `${title} - Hotel Management System` : 'Hotel Management System'
  }

  // Responsive helpers
  const updateScreenSize = () => {
    const width = window.innerWidth
    
    if (width < 640) {
      screenSize.value = 'sm'
      isMobile.value = true
      isTablet.value = false
    } else if (width < 768) {
      screenSize.value = 'md'
      isMobile.value = true
      isTablet.value = false
    } else if (width < 1024) {
      screenSize.value = 'lg'
      isMobile.value = false
      isTablet.value = true
    } else if (width < 1280) {
      screenSize.value = 'xl'
      isMobile.value = false
      isTablet.value = false
    } else {
      screenSize.value = '2xl'
      isMobile.value = false
      isTablet.value = false
    }
  }

  // Initialize responsive listeners
  const initializeResponsive = () => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addListener(updateDocumentClasses)
    }
  }

  // Cleanup
  const cleanup = () => {
    window.removeEventListener('resize', updateScreenSize)
    document.body.style.overflow = ''
  }

  // Keyboard shortcuts
  const handleKeyPress = (event: KeyboardEvent) => {
    // ESC to close modals
    if (event.key === 'Escape' && hasOpenModal.value) {
      const topModalInstance = topModal.value
      if (topModalInstance && !topModalInstance.persistent) {
        closeModal()
      }
    }
    
    // Ctrl/Cmd + K for search (if needed)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      // Trigger search modal or focus search input
    }
  }

  const initializeKeyboardListeners = () => {
    document.addEventListener('keydown', handleKeyPress)
  }

  const removeKeyboardListeners = () => {
    document.removeEventListener('keydown', handleKeyPress)
  }

  // Initialize UI store
  const initialize = () => {
    updateDocumentClasses()
    initializeResponsive()
    initializeKeyboardListeners()
  }

  return {
    // State
    theme,
    sidebarCollapsed,
    modals,
    sidebars,
    loading,
    breadcrumbs,
    pageTitle,
    isMobile,
    isTablet,
    screenSize,
    
    // Getters
    isDarkMode,
    hasOpenModal,
    topModal,
    modalCount,
    openSidebars,
    isLoading,
    deviceType,
    
    // Actions
    setTheme,
    toggleTheme,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    closeAllSidebars,
    toggleMainSidebar,
    setMainSidebar,
    setLoading,
    clearAllLoading,
    setBreadcrumbs,
    addBreadcrumb,
    setPageTitle,
    updateScreenSize,
    initialize,
    cleanup,
    initializeResponsive,
    initializeKeyboardListeners,
    removeKeyboardListeners
  }
}, {
  persist: {
    key: 'ui-store',
    storage: localStorage,
    paths: ['theme', 'sidebarCollapsed']
  }
})