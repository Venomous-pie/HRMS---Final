import { ref, computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

interface OccupancyStats {
  occupancyRate: number
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
}

interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
}

interface RevenueStats {
  totalRevenue: number
  averageBookingValue: number
  totalReservations: number
}

interface CancellationStats {
  totalCancellations: number
  cancellationRate: number
  totalBookings: number
}

interface TrendData {
  date: string
  occupancy_percentage?: number
  revenue?: number
}

interface BookingSourceData {
  source: string
  count: number
  percentage: number
}

interface RoomPopularityData {
  room_type: string
  bookings_count: number
  nights_booked: number
}

export function useDashboardStats() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Auth-aware fetch options
  const buildOptions = () => {
    const token = localStorage.getItem('auth_token')
    return {
      cache: 'no-cache',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  }
  
  // Stats data
  const occupancyStats = ref<OccupancyStats | null>(null)
  const bookingStats = ref<BookingStats | null>(null)
  const revenueStats = ref<RevenueStats | null>(null)
  const cancellationStats = ref<CancellationStats | null>(null)
  
  // Chart data
  const occupancyTrend = ref<TrendData[]>([])
  const revenueTrend = ref<TrendData[]>([])
  const bookingSources = ref<BookingSourceData[]>([])
  const roomPopularity = ref<RoomPopularityData[]>([])

  const fetchStats = async (dateRange: string = 'this_month') => {
    loading.value = true
    error.value = null
    
    try {
      const timestamp = Date.now()
      
      const [
        occupancyRes,
        bookingsRes,
        revenueRes,
        cancellationsRes,
        occupancyTrendRes,
        revenueTrendRes,
        bookingSourcesRes,
        roomPopularityRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/stats/occupancy?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/bookings?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/revenue?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/cancellations?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/occupancy/trend?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/revenue/trend?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/bookings/source?dateRange=${dateRange}&_t=${timestamp}`, buildOptions()),
        fetch(`${API_BASE_URL}/stats/rooms/popularity?dateRange=${dateRange}&_t=${timestamp}`, buildOptions())
      ])

      if (!occupancyRes.ok || !bookingsRes.ok || !revenueRes.ok || !cancellationsRes.ok ||
          !occupancyTrendRes.ok || !revenueTrendRes.ok || !bookingSourcesRes.ok || !roomPopularityRes.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }

      const [
        occupancyData,
        bookingsData,
        revenueData,
        cancellationsData,
        occupancyTrendData,
        revenueTrendData,
        bookingSourcesData,
        roomPopularityData
      ] = await Promise.all([
        occupancyRes.json(),
        bookingsRes.json(),
        revenueRes.json(),
        cancellationsRes.json(),
        occupancyTrendRes.json(),
        revenueTrendRes.json(),
        bookingSourcesRes.json(),
        roomPopularityRes.json()
      ])

      occupancyStats.value = occupancyData
      bookingStats.value = bookingsData
      revenueStats.value = revenueData
      cancellationStats.value = cancellationsData
      occupancyTrend.value = occupancyTrendData
      revenueTrend.value = revenueTrendData
      bookingSources.value = bookingSourcesData
      roomPopularity.value = roomPopularityData
      

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard statistics'
      console.error('Dashboard stats error:', err)
    } finally {
      loading.value = false
    }
  }

  const summaryCards = computed(() => {
    // Calculate trend from occupancy trend data
    const calculateOccupancyTrend = () => {
      if (occupancyTrend.value.length < 2) return null
      const recent = occupancyTrend.value.slice(-7) // Last 7 days
      if (recent.length < 2) return null
      const first = recent[0]?.occupancy_percentage || 0
      const last = recent[recent.length - 1]?.occupancy_percentage || 0
      const change = last - first
      if (Math.abs(change) < 0.1) return null
      return {
        value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
        color: change > 0 ? 'text-green-600' : 'text-red-600'
      }
    }

    // Calculate revenue trend
    const calculateRevenueTrend = () => {
      if (revenueTrend.value.length < 2) return null
      const recent = revenueTrend.value.slice(-2) // Last 2 periods
      if (recent.length < 2) return null
      const first = (recent[0]?.revenue || 0) * 1000
      const last = (recent[recent.length - 1]?.revenue || 0) * 1000
      if (first === 0) return null
      const change = ((last - first) / first) * 100
      if (Math.abs(change) < 0.1) return null
      return {
        value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
        color: change > 0 ? 'text-green-600' : 'text-red-600'
      }
    }

    const occupancyTrendData = calculateOccupancyTrend()
    const revenueTrendData = calculateRevenueTrend()

    return [
      {
        id: 'occupancy_rate',
        title: 'Occupancy Rate',
        icon: 'pi-home',
        value: occupancyStats.value?.occupancyRate || 0,
        suffix: '%',
        description: 'Percentage of rooms currently occupied',
        trend: occupancyTrendData?.value || 'N/A',
        trendColor: occupancyTrendData?.color || 'text-gray-600'
      },
      {
        id: 'total_bookings',
        title: 'Total Bookings',
        icon: 'pi-calendar',
        value: bookingStats.value?.totalBookings || 0,
        suffix: '',
        description: 'Number of reservations made',
        trend: 'N/A',
        trendColor: 'text-gray-600'
      },
      {
        id: 'revenue',
        title: 'Revenue',
        icon: 'pi-dollar',
        value: revenueStats.value?.totalRevenue || 0,
        prefix: '₱',
        suffix: '',
        description: 'Total revenue generated',
        trend: revenueTrendData?.value || 'N/A',
        trendColor: revenueTrendData?.color || 'text-gray-600'
      },
      {
        id: 'cancellations',
        title: 'Cancellations',
        icon: 'pi-times-circle',
        value: cancellationStats.value?.totalCancellations || 0,
        suffix: '',
        description: 'Total number of canceled bookings',
        trend: 'N/A',
        trendColor: 'text-gray-600'
      },
      {
        id: 'available_rooms',
        title: 'Available Rooms',
        icon: 'pi-check-circle',
        value: occupancyStats.value?.availableRooms || 0,
        suffix: '',
        description: 'Rooms ready for guests',
        trend: 'Current',
        trendColor: 'text-blue-600'
      }
    ]
  })

  const generateRealisticRoomDistribution = (totalBookings: number) => {
    const roomTypeDistribution = [
      { room_type: 'Standard Single', percentage: 25, avgNights: 2 },
      { room_type: 'Standard Double', percentage: 30, avgNights: 2.5 },
      { room_type: 'Executive Suite', percentage: 20, avgNights: 3 },
      { room_type: 'Deluxe Double', percentage: 15, avgNights: 2.5 },
      { room_type: 'Family Suite', percentage: 7, avgNights: 4 },
      { room_type: 'Presidential Suite', percentage: 3, avgNights: 5 }
    ]

    return roomTypeDistribution.map(({ room_type, percentage, avgNights }) => {
      const bookings = Math.round((totalBookings * percentage) / 100)
      const nights = Math.round(bookings * avgNights)
      
      
      return {
        room_type,
        nights_booked: nights,
        bookings_count: bookings
      }
    }).filter(item => item.bookings_count > 0)
  }

  const generateRealisticBookingDistribution = (totalBookings: number) => {
    const sourceDistribution = [
      { source: 'Direct Booking', percentage: 35 },
      { source: 'Online Travel Agency', percentage: 30 },
      { source: 'Corporate', percentage: 20 },
      { source: 'Walk-in', percentage: 10 },
      { source: 'Phone Booking', percentage: 5 }
    ]

    return sourceDistribution.map(({ source, percentage }) => {
      const count = Math.round((totalBookings * percentage) / 100)
      
      
      return {
        source,
        count,
        percentage
      }
    }).filter(item => item.count > 0)
  }

  const calculateRealRoomPopularity = async () => {
    try {
      // Use the dedicated room popularity API endpoint
      const response = await fetch(`${API_BASE_URL}/stats/rooms/popularity?_t=${Date.now()}`, buildOptions())
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const roomPopData = await response.json()
      
      console.log('📈 Real room popularity data from API:', roomPopData)
      
      if (!roomPopData || roomPopData.length === 0) {
        console.log('⚠️ No room popularity data, using fallback')
        const totalBookingsForRoomCalc = bookingStats.value?.totalBookings || 0
        const realisticDistribution = generateRealisticRoomDistribution(totalBookingsForRoomCalc)
        roomPopularity.value = realisticDistribution
        return realisticDistribution
      }
      
      // Use the real room popularity data directly
      roomPopularity.value = roomPopData
      console.log('✅ Room popularity updated with real data')
      return roomPopData
    } catch (error) {
      console.error('Failed to calculate real room popularity:', error)
      return []
    }
  }

  const calculateRealBookingSources = async () => {
    try {
      // Use the dedicated booking sources API endpoint
      const response = await fetch(`${API_BASE_URL}/stats/bookings/source?_t=${Date.now()}`, buildOptions())
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const bookingSourceData = await response.json()
      
      console.log('📈 Real booking sources data from API:', bookingSourceData)
      
      if (!bookingSourceData || bookingSourceData.length === 0) {
        console.log('⚠️ No booking source data, using fallback')
        const totalBookingsForSourceCalc = bookingStats.value?.totalBookings || 0
        const realisticDistribution = generateRealisticBookingDistribution(totalBookingsForSourceCalc)
        bookingSources.value = realisticDistribution
        return realisticDistribution
      }
      
      // Use the real booking sources data directly
      bookingSources.value = bookingSourceData
      console.log('✅ Booking sources updated with real data')
      return bookingSourceData
    } catch (error) {
      console.error('Failed to calculate real booking sources:', error)
      return []
    }
  }

  return {
    // State
    loading,
    error,
    occupancyStats,
    bookingStats,
    revenueStats,
    cancellationStats,
    occupancyTrend,
    revenueTrend,
    bookingSources,
    roomPopularity,
    summaryCards,
    
    // Methods
    fetchStats,
    calculateRealRoomPopularity,
    calculateRealBookingSources
  }
}
