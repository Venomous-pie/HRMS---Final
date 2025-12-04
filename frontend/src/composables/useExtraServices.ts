import { ref, computed } from 'vue'
import type { Reservation } from '@/types/hotel'

export interface ServiceItem {
  id: string
  name: string
  category: 'minibar' | 'room_service' | 'laundry' | 'spa' | 'phone' | 'internet' | 'parking' | 'other'
  price: number
  description?: string
  isActive: boolean
  taxable: boolean
}

export interface ServiceCharge {
  id: string
  reservationId: string
  serviceItemId: string
  serviceName: string
  category: string
  quantity: number
  unitPrice: number
  totalAmount: number
  chargedAt: string
  chargedBy?: string // staff member ID
  notes?: string
  status: 'pending' | 'confirmed' | 'disputed' | 'refunded'
}

export interface ServiceOrder {
  id: string
  reservationId: string
  roomNumber: string
  guestName: string
  items: ServiceOrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled'
  orderedAt: string
  deliveredAt?: string
  notes?: string
}

export interface ServiceOrderItem {
  serviceItemId: string
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specialInstructions?: string
}

export const useExtraServices = () => {
  const serviceItems = ref<ServiceItem[]>([])
  const serviceCharges = ref<ServiceCharge[]>([])
  const serviceOrders = ref<ServiceOrder[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const defaultServiceItems: ServiceItem[] = [
    { id: 'mb_water', name: 'Bottled Water', category: 'minibar', price: 50, isActive: true, taxable: true },
    { id: 'mb_soda', name: 'Soft Drinks', category: 'minibar', price: 80, isActive: true, taxable: true },
    { id: 'mb_beer', name: 'Local Beer', category: 'minibar', price: 150, isActive: true, taxable: true },
    { id: 'mb_wine', name: 'House Wine', category: 'minibar', price: 300, isActive: true, taxable: true },
    { id: 'mb_snacks', name: 'Snacks/Chips', category: 'minibar', price: 120, isActive: true, taxable: true },
    
    { id: 'rs_breakfast', name: 'Continental Breakfast', category: 'room_service', price: 450, isActive: true, taxable: true },
    { id: 'rs_lunch', name: 'Lunch Set', category: 'room_service', price: 650, isActive: true, taxable: true },
    { id: 'rs_dinner', name: 'Dinner Set', category: 'room_service', price: 850, isActive: true, taxable: true },
    { id: 'rs_coffee', name: 'Coffee/Tea Service', category: 'room_service', price: 200, isActive: true, taxable: true },
    
    { id: 'ld_wash', name: 'Laundry - Wash & Fold', category: 'laundry', price: 80, description: 'Per piece', isActive: true, taxable: true },
    { id: 'ld_press', name: 'Pressing/Ironing', category: 'laundry', price: 60, description: 'Per piece', isActive: true, taxable: true },
    { id: 'ld_dry', name: 'Dry Cleaning', category: 'laundry', price: 150, description: 'Per piece', isActive: true, taxable: true },
    
    { id: 'sv_phone', name: 'Long Distance Call', category: 'phone', price: 25, description: 'Per minute', isActive: true, taxable: true },
    { id: 'sv_internet', name: 'Premium Internet', category: 'internet', price: 200, description: 'Per day', isActive: true, taxable: true },
    { id: 'sv_parking', name: 'Valet Parking', category: 'parking', price: 300, description: 'Per day', isActive: true, taxable: false },
    { id: 'sv_late_checkout', name: 'Late Checkout Fee', category: 'other', price: 500, description: 'After 2 PM', isActive: true, taxable: false },
  ]

  if (serviceItems.value.length === 0) {
    serviceItems.value = [...defaultServiceItems]
  }

  const addServiceCharge = (
    reservationId: string,
    serviceItemId: string,
    quantity: number = 1,
    notes?: string,
    chargedBy?: string
  ): ServiceCharge | null => {
    const serviceItem = serviceItems.value.find(item => item.id === serviceItemId)
    
    if (!serviceItem) {
      error.value = 'Service item not found'
      return null
    }

    if (!serviceItem.isActive) {
      error.value = 'Service item is not active'
      return null
    }

    const charge: ServiceCharge = {
      id: `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reservationId,
      serviceItemId,
      serviceName: serviceItem.name,
      category: serviceItem.category,
      quantity,
      unitPrice: serviceItem.price,
      totalAmount: serviceItem.price * quantity,
      chargedAt: new Date().toISOString(),
      chargedBy,
      notes,
      status: 'confirmed',
    }

    serviceCharges.value.push(charge)
    return charge
  }

  const createServiceOrder = (
    reservationId: string,
    roomNumber: string,
    guestName: string,
    items: Omit<ServiceOrderItem, 'totalPrice'>[],
    notes?: string
  ): ServiceOrder | null => {
    if (items.length === 0) {
      error.value = 'Order must have at least one item'
      return null
    }

    const orderItems: ServiceOrderItem[] = []
    let totalAmount = 0

    for (const item of items) {
      const serviceItem = serviceItems.value.find(si => si.id === item.serviceItemId)
      if (!serviceItem || !serviceItem.isActive) {
        error.value = `Service item ${item.serviceName} is not available`
        return null
      }

      const orderItem: ServiceOrderItem = {
        ...item,
        totalPrice: item.unitPrice * item.quantity
      }
      
      orderItems.push(orderItem)
      totalAmount += orderItem.totalPrice
    }

    const order: ServiceOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reservationId,
      roomNumber,
      guestName,
      items: orderItems,
      totalAmount,
      status: 'pending',
      orderedAt: new Date().toISOString(),
      notes,
    }

    serviceOrders.value.push(order)
    return order
  }

  // Update order status
  const updateOrderStatus = (orderId: string, status: ServiceOrder['status']): boolean => {
    const order = serviceOrders.value.find(o => o.id === orderId)
    
    if (!order) {
      error.value = 'Order not found'
      return false
    }

    order.status = status
    
    if (status === 'delivered') {
      order.deliveredAt = new Date().toISOString()
      
      for (const item of order.items) {
        addServiceCharge(
          order.reservationId,
          item.serviceItemId,
          item.quantity,
          `Room service order #${order.id}`,
        )
      }
    }

    return true
  }

  const getChargesByReservation = (reservationId: string): ServiceCharge[] => {
    return serviceCharges.value.filter(charge => charge.reservationId === reservationId)
  }

  const getOrdersByReservation = (reservationId: string): ServiceOrder[] => {
    return serviceOrders.value.filter(order => order.reservationId === reservationId)
  }

  const calculateTotalCharges = (reservationId: string): number => {
    const charges = getChargesByReservation(reservationId)
    return charges
      .filter(charge => charge.status === 'confirmed')
      .reduce((total, charge) => total + charge.totalAmount, 0)
  }

  const getChargesByCategory = (reservationId: string, category: string): ServiceCharge[] => {
    return getChargesByReservation(reservationId).filter(charge => charge.category === category)
  }

  const disputeCharge = (chargeId: string, reason: string): boolean => {
    const charge = serviceCharges.value.find(c => c.id === chargeId)
    
    if (!charge) {
      error.value = 'Charge not found'
      return false
    }

    charge.status = 'disputed'
    charge.notes = `${charge.notes || ''}\nDisputed: ${reason}`.trim()
    return true
  }

  const refundCharge = (chargeId: string, reason: string): boolean => {
    const charge = serviceCharges.value.find(c => c.id === chargeId)
    
    if (!charge) {
      error.value = 'Charge not found'
      return false
    }

    charge.status = 'refunded'
    charge.notes = `${charge.notes || ''}\nRefunded: ${reason}`.trim()
    return true
  }

  const getServicesByCategory = (category: string): ServiceItem[] => {
    return serviceItems.value.filter(item => item.category === category && item.isActive)
  }

  const chargeStats = computed(() => {
    const total = serviceCharges.value.length
    const totalAmount = serviceCharges.value
      .filter(c => c.status === 'confirmed')
      .reduce((sum, c) => sum + c.totalAmount, 0)
    
    const byCategory = serviceCharges.value.reduce((acc, charge) => {
      if (charge.status === 'confirmed') {
        acc[charge.category] = (acc[charge.category] || 0) + charge.totalAmount
      }
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      totalAmount,
      byCategory,
      disputed: serviceCharges.value.filter(c => c.status === 'disputed').length,
      refunded: serviceCharges.value.filter(c => c.status === 'refunded').length,
    }
  })

  const orderStats = computed(() => {
    const total = serviceOrders.value.length
    const byStatus = serviceOrders.value.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRevenue = serviceOrders.value
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0)

    return {
      total,
      byStatus,
      totalRevenue,
      pending: byStatus.pending || 0,
      inProgress: byStatus.in_progress || 0,
      delivered: byStatus.delivered || 0,
    }
  })

  return {
    // State
    serviceItems,
    serviceCharges,
    serviceOrders,
    isLoading,
    error,
    
    // Computed
    chargeStats,
    orderStats,
    
    // Methods
    addServiceCharge,
    createServiceOrder,
    updateOrderStatus,
    getChargesByReservation,
    getOrdersByReservation,
    calculateTotalCharges,
    getChargesByCategory,
    disputeCharge,
    refundCharge,
    getServicesByCategory,
  }
}
