'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface Transaction {
  id: string
  title: string
  amount: number
  date: string
  paymentMode: string
  description: string | null
  category: string
}

const categories = [
  'Food',
  'Travel',
  'Utilities',
  'Rent',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Miscellaneous'
]

export default function Transactions() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load transactions',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setTransactions(transactions.filter((t) => t.id !== id))
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      })
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setSelectedCategory(transaction.category)
    setIsEditModalOpen(true)
  }

  const handleCategoryUpdate = async () => {
    if (!selectedTransaction) return

    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTransaction.id,
          category: selectedCategory,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update transaction')
      }

      const updatedTransaction = await response.json()
      setTransactions(transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      ))

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })

      setIsEditModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Separate income and expenses
  const incomeTransactions = transactions.filter(t => t.amount > 0)
  const expenseTransactions = transactions.filter(t => t.amount < 0)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/transactions/new'}
          className="inline-flex items-center px-6 py-3 border-2 border-blue-500 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-500/20"
        >
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Column */}
        <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-emerald-400">Income</h2>
          </div>
          <ul className="divide-y divide-gray-700">
            {incomeTransactions.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-400">
                No income transactions found
              </li>
            ) : (
              incomeTransactions.map((transaction) => (
                <li key={transaction.id} className="hover:bg-gray-700/50 transition-colors">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-emerald-900/50 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                            <span className="text-lg font-bold text-emerald-400">+</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-medium text-white">
                            {transaction.title}
                          </div>
                          <div className="text-sm text-blue-400">
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-lg font-medium text-emerald-400">
                          +₹{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleEditClick(transaction)}
                            className="p-2.5 text-gray-400 hover:text-blue-400 rounded-full hover:bg-blue-900/20 transition-colors"
                            aria-label="Edit category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-900/20 transition-colors"
                            aria-label="Delete transaction"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2 text-blue-400">Category:</span>
                        {transaction.category}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2 text-blue-400">Payment Mode:</span>
                        {transaction.paymentMode}
                      </div>
                    </div>
                    {transaction.description && (
                      <div className="mt-2 text-sm text-gray-400 bg-gray-700/50 p-3 rounded-lg">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Expenses Column */}
        <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-red-400">Expenses</h2>
          </div>
          <ul className="divide-y divide-gray-700">
            {expenseTransactions.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-400">
                No expense transactions found
              </li>
            ) : (
              expenseTransactions.map((transaction) => (
                <li key={transaction.id} className="hover:bg-gray-700/50 transition-colors">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-red-900/50 flex items-center justify-center shadow-lg shadow-red-900/20">
                            <span className="text-lg font-bold text-red-400">-</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-medium text-white">
                            {transaction.title}
                          </div>
                          <div className="text-sm text-blue-400">
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-lg font-medium text-red-400">
                          -₹{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleEditClick(transaction)}
                            className="p-2.5 text-gray-400 hover:text-blue-400 rounded-full hover:bg-blue-900/20 transition-colors"
                            aria-label="Edit category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-900/20 transition-colors"
                            aria-label="Delete transaction"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2 text-blue-400">Category:</span>
                        {transaction.category}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2 text-blue-400">Payment Mode:</span>
                        {transaction.paymentMode}
                      </div>
                    </div>
                    {transaction.description && (
                      <div className="mt-2 text-sm text-gray-400 bg-gray-700/50 p-3 rounded-lg">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Transaction
                </label>
                <div className="text-white">{selectedTransaction.title}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCategoryUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 