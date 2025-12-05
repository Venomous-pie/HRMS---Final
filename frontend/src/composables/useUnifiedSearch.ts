import { computed, ref, type Ref } from 'vue'
import type { Reservation, Guest, Room } from '@/types/hotel'

/**
 * Simple debounce function
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export interface SearchResult {
  type: 'reservation' | 'guest' | 'room'
  item: Reservation | Guest | Room
  score: number
  matchedFields: string[]
}

export interface SearchOptions {
  debounceMs?: number
  minQueryLength?: number
  maxResults?: number
  includeFields?: {
    reservations?: string[]
    guests?: string[]
    rooms?: string[]
  }
}

/**
 * Normalizes a string for searching (lowercase, trim, remove extra spaces)
 */
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Calculates a simple similarity score between query and text
 * Returns a score from 0-100, where 100 is exact match
 */
function calculateMatchScore(query: string, text: string): number {
  if (!text) return 0
  
  const normalizedText = normalizeQuery(text)
  const normalizedQuery = normalizeQuery(query)
  
  // Exact match
  if (normalizedText === normalizedQuery) return 100
  
  // Starts with query
  if (normalizedText.startsWith(normalizedQuery)) return 90
  
  // Contains query
  if (normalizedText.includes(normalizedQuery)) {
    // Higher score if match is at the beginning
    const index = normalizedText.indexOf(normalizedQuery)
    return Math.max(70 - index * 2, 50)
  }
  
  // Word boundary match (matches individual words)
  const words = normalizedText.split(/\s+/)
  const queryWords = normalizedQuery.split(/\s+/)
  
  let wordMatches = 0
  for (const qWord of queryWords) {
    if (words.some(w => w.startsWith(qWord) || w.includes(qWord))) {
      wordMatches++
    }
  }
  
  if (wordMatches > 0) {
    return (wordMatches / queryWords.length) * 60
  }
  
  return 0
}

/**
 * Extracts searchable text from a reservation
 */
export function getReservationSearchText(reservation: Reservation | any): { text: string; fields: string[] } {
  const fields: string[] = []
  const texts: string[] = []
  
  // Booking ID
  const bookingId = reservation.bookingNumber || reservation.id
  if (bookingId) {
    texts.push(String(bookingId))
    fields.push('bookingNumber')
  }
  
  // Guest name (multiple possible formats)
  const guestName = reservation.guest || reservation.guestName || ''
  if (guestName) {
    texts.push(guestName)
    fields.push('guestName')
  }
  
  // Guest object fields
  const guest = reservation.Guest || reservation.guestObj
  if (guest) {
    const firstName = guest.firstName || ''
    const middleName = guest.middleName || ''
    const lastName = guest.lastName || ''
    
    if (firstName) {
      texts.push(firstName)
      fields.push('guest.firstName')
    }
    if (middleName) {
      texts.push(middleName)
      fields.push('guest.middleName')
    }
    if (lastName) {
      texts.push(lastName)
      fields.push('guest.lastName')
    }
    
    const fullName = `${firstName} ${middleName} ${lastName}`.trim()
    if (fullName) {
      texts.push(fullName)
    }
    
    if (guest.email) {
      texts.push(guest.email)
      fields.push('guest.email')
    }
    if (guest.phone) {
      texts.push(guest.phone)
      fields.push('guest.phone')
    }
  }
  
  // Room number
  const roomNumber = reservation.roomNumber || reservation.room
  if (roomNumber) {
    texts.push(String(roomNumber))
    fields.push('roomNumber')
  }
  
  // Status
  if (reservation.status) {
    texts.push(String(reservation.status))
    fields.push('status')
  }
  
  return { text: texts.join(' '), fields }
}

/**
 * Extracts searchable text from a guest
 */
export function getGuestSearchText(guest: Guest | any): { text: string; fields: string[] } {
  const fields: string[] = []
  const texts: string[] = []
  
  if (guest.firstName) {
    texts.push(guest.firstName)
    fields.push('firstName')
  }
  if (guest.middleName) {
    texts.push(guest.middleName)
    fields.push('middleName')
  }
  if (guest.lastName) {
    texts.push(guest.lastName)
    fields.push('lastName')
  }
  
  const fullName = `${guest.firstName || ''} ${guest.middleName || ''} ${guest.lastName || ''}`.trim()
  if (fullName) {
    texts.push(fullName)
  }
  
  if (guest.email) {
    texts.push(guest.email)
    fields.push('email')
  }
  if (guest.phone) {
    texts.push(guest.phone)
    fields.push('phone')
  }
  if (guest.address) {
    texts.push(guest.address)
    fields.push('address')
  }
  if (guest.idDocument) {
    texts.push(guest.idDocument)
    fields.push('idDocument')
  }
  if (guest.nationality) {
    texts.push(guest.nationality)
    fields.push('nationality')
  }
  
  return { text: texts.join(' '), fields }
}

/**
 * Extracts searchable text from a room
 */
export function getRoomSearchText(room: Room | any): { text: string; fields: string[] } {
  const fields: string[] = []
  const texts: string[] = []
  
  const roomNumber = room.number || room.roomNumber
  if (roomNumber) {
    texts.push(String(roomNumber))
    fields.push('roomNumber')
  }
  
  if (room.type || room.roomType) {
    texts.push(String(room.type || room.roomType))
    fields.push('type')
  }
  
  if (room.status) {
    texts.push(String(room.status))
    fields.push('status')
  }
  
  if (room.notes) {
    texts.push(room.notes)
    fields.push('notes')
  }
  
  return { text: texts.join(' '), fields }
}

/**
 * Searches reservations with scoring
 */
function searchReservations(
  reservations: Reservation[],
  query: string,
  options?: SearchOptions
): SearchResult[] {
  if (!query || query.trim().length < (options?.minQueryLength || 1)) {
    return []
  }
  
  const normalizedQuery = normalizeQuery(query)
  const results: SearchResult[] = []
  
  for (const reservation of reservations) {
    const { text, fields } = getReservationSearchText(reservation)
    const score = calculateMatchScore(normalizedQuery, text)
    
    if (score > 0) {
      const matchedFields = fields.filter(field => {
        const fieldValue = getFieldValue(reservation, field)
        return fieldValue && calculateMatchScore(normalizedQuery, String(fieldValue)) > 0
      })
      
      results.push({
        type: 'reservation',
        item: reservation,
        score,
        matchedFields
      })
    }
  }
  
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Searches guests with scoring
 */
function searchGuests(
  guests: Guest[],
  query: string,
  options?: SearchOptions
): SearchResult[] {
  if (!query || query.trim().length < (options?.minQueryLength || 1)) {
    return []
  }
  
  const normalizedQuery = normalizeQuery(query)
  const results: SearchResult[] = []
  
  for (const guest of guests) {
    const { text, fields } = getGuestSearchText(guest)
    const score = calculateMatchScore(normalizedQuery, text)
    
    if (score > 0) {
      const matchedFields = fields.filter(field => {
        const fieldValue = getFieldValue(guest, field)
        return fieldValue && calculateMatchScore(normalizedQuery, String(fieldValue)) > 0
      })
      
      results.push({
        type: 'guest',
        item: guest,
        score,
        matchedFields
      })
    }
  }
  
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Searches rooms with scoring
 */
function searchRooms(
  rooms: Room[],
  query: string,
  options?: SearchOptions
): SearchResult[] {
  if (!query || query.trim().length < (options?.minQueryLength || 1)) {
    return []
  }
  
  const normalizedQuery = normalizeQuery(query)
  const results: SearchResult[] = []
  
  for (const room of rooms) {
    const { text, fields } = getRoomSearchText(room)
    const score = calculateMatchScore(normalizedQuery, text)
    
    if (score > 0) {
      const matchedFields = fields.filter(field => {
        const fieldValue = getFieldValue(room, field)
        return fieldValue && calculateMatchScore(normalizedQuery, String(fieldValue)) > 0
      })
      
      results.push({
        type: 'room',
        item: room,
        score,
        matchedFields
      })
    }
  }
  
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Helper to get nested field value
 */
function getFieldValue(obj: any, path: string): any {
  const parts = path.split('.')
  let value = obj
  for (const part of parts) {
    value = value?.[part]
    if (value === undefined) return undefined
  }
  return value
}

/**
 * Unified search composable
 */
export function useUnifiedSearch(
  reservations: Ref<Reservation[]>,
  guests: Ref<Guest[]>,
  rooms: Ref<Room[]>,
  options: SearchOptions = {}
) {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 50
  } = options
  
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const isSearching = ref(false)
  
  const performSearch = (query: string) => {
    if (!query || query.trim().length < minQueryLength) {
      searchResults.value = []
      isSearching.value = false
      return
    }
    
    isSearching.value = true
    
    try {
      const results: SearchResult[] = []
      
      // Search reservations
      const reservationResults = searchReservations(reservations.value, query, options)
      results.push(...reservationResults)
      
      // Search guests
      const guestResults = searchGuests(guests.value, query, options)
      results.push(...guestResults)
      
      // Search rooms
      const roomResults = searchRooms(rooms.value, query, options)
      results.push(...roomResults)
      
      // Sort all results by score and limit
      searchResults.value = results
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }
  
  const debouncedSearch = debounce(performSearch, debounceMs)
  
  const search = (query: string) => {
    searchQuery.value = query
    debouncedSearch(query)
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    isSearching.value = false
  }
  
  // Filtered results by type
  const reservationResults = computed(() =>
    searchResults.value.filter(r => r.type === 'reservation').map(r => r.item as Reservation)
  )
  
  const guestResults = computed(() =>
    searchResults.value.filter(r => r.type === 'guest').map(r => r.item as Guest)
  )
  
  const roomResults = computed(() =>
    searchResults.value.filter(r => r.type === 'room').map(r => r.item as Room)
  )
  
  return {
    searchQuery,
    searchResults,
    reservationResults,
    guestResults,
    roomResults,
    isSearching,
    search,
    clearSearch,
    performSearch // Non-debounced version for immediate search
  }
}

/**
 * Simplified search for a single entity type
 */
export function useEntitySearch<T extends Reservation | Guest | Room>(
  items: Ref<T[]>,
  getSearchText: (item: T) => { text: string; fields: string[] },
  options: SearchOptions = {}
) {
  const {
    debounceMs = 300,
    minQueryLength = 1
  } = options
  
  const searchQuery = ref('')
  const filteredItems = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim().length < minQueryLength) {
      return items.value
    }
    
    const normalizedQuery = normalizeQuery(searchQuery.value)
    const results: Array<{ item: T; score: number }> = []
    
    for (const item of items.value) {
      const { text } = getSearchText(item)
      const score = calculateMatchScore(normalizedQuery, text)
      
      if (score > 0) {
        results.push({ item, score })
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.item)
  })
  
  const debouncedSetQuery = debounce((query: string) => {
    searchQuery.value = query
  }, debounceMs)
  
  const search = (query: string) => {
    debouncedSetQuery(query)
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
  }
  
  return {
    searchQuery,
    filteredItems,
    search,
    clearSearch
  }
}

