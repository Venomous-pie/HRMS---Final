import { apiFetch } from './apiClient'

export interface CashTransaction {
  id: number
  type: 'in' | 'out'
  amount: number
  description: string
  category: string
  transactionDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DailyCashRegister {
  date: string
  openingBalance: number
  cashIn: number
  cashOut: number
  closingBalance: number
  transactionCount: number
}

export interface PettyCash {
  id: number
  allocated: number
  used: number
  available: number
  lastUpdated: string
}

export interface ShiftHandover {
  id: number
  shiftFrom: string
  shiftTo: string
  cashAmount: number
  handoverDate: string
  status: 'completed' | 'pending' | 'disputed'
  notes?: string
  createdAt: string
}

export interface Reconciliation {
  date: string
  expectedCash: number
  actualCash: number
  variance: number
  discrepancies?: string[]
}

class CashbookService {
  // Get daily cash register summary
  async getDailyCashRegister(date: string): Promise<DailyCashRegister> {
    try {
      return await apiFetch<DailyCashRegister>(`/cashbook/daily-register?date=${date}`)
    } catch (error) {
      console.error('Error fetching daily cash register:', error)
      // Return default structure if endpoint doesn't exist
      return {
        date,
        openingBalance: 0,
        cashIn: 0,
        cashOut: 0,
        closingBalance: 0,
        transactionCount: 0
      }
    }
  }

  // Get cash transactions for a date
  async getCashTransactions(date: string): Promise<CashTransaction[]> {
    try {
      return await apiFetch<CashTransaction[]>(`/cashbook/transactions?date=${date}`)
    } catch (error) {
      console.error('Error fetching cash transactions:', error)
      return []
    }
  }

  // Get petty cash information
  async getPettyCash(): Promise<PettyCash | null> {
    try {
      return await apiFetch<PettyCash>('/cashbook/petty-cash')
    } catch (error) {
      console.error('Error fetching petty cash:', error)
      return null
    }
  }

  // Get shift handover records
  async getShiftHandovers(): Promise<ShiftHandover[]> {
    try {
      return await apiFetch<ShiftHandover[]>('/cashbook/shift-handovers')
    } catch (error) {
      console.error('Error fetching shift handovers:', error)
      return []
    }
  }

  // Get cash reconciliation
  async getReconciliation(date: string): Promise<Reconciliation | null> {
    try {
      return await apiFetch<Reconciliation>(`/cashbook/reconciliation?date=${date}`)
    } catch (error) {
      console.error('Error fetching reconciliation:', error)
      return null
    }
  }

  // Record cash in transaction
  async recordCashIn(amount: number, description: string, category: string, notes?: string): Promise<CashTransaction> {
    try {
      return await apiFetch<CashTransaction>('/cashbook/cash-in', {
        method: 'POST',
        body: JSON.stringify({ amount, description, category, notes })
      })
    } catch (error) {
      console.error('Error recording cash in:', error)
      throw error
    }
  }

  // Record cash out transaction
  async recordCashOut(amount: number, description: string, category: string, notes?: string): Promise<CashTransaction> {
    try {
      return await apiFetch<CashTransaction>('/cashbook/cash-out', {
        method: 'POST',
        body: JSON.stringify({ amount, description, category, notes })
      })
    } catch (error) {
      console.error('Error recording cash out:', error)
      throw error
    }
  }
}

export const cashbookService = new CashbookService()

