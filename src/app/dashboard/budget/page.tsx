'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface Budget {
  id: string
  category: string
  allocated: number
  spent: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']

export default function Budget() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: '',
    allocated: '',
  })

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets')
        if (!response.ok) {
          throw new Error('Failed to fetch budgets')
        }
        const data = await response.json()
        setBudgets(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load budgets',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudgets()
  }, [toast])

  const handleAddBudget = async () => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newBudget.category,
          allocated: parseFloat(newBudget.allocated),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add budget')
      }

      const addedBudget = await response.json()
      setBudgets([...budgets, addedBudget])
      setIsAddModalOpen(false)
      setNewBudget({ category: '', allocated: '' })

      toast({
        title: 'Success',
        description: 'Budget added successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add budget',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }

      setBudgets(budgets.filter(b => b.id !== id))
      toast({
        title: 'Success',
        description: 'Budget deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive',
      })
    }
  }

  const calculateRemaining = (allocated: number, spent: number) => {
    return allocated - spent
  }

  const calculatePercentage = (allocated: number, spent: number) => {
    return (spent / allocated) * 100
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400'
    if (percentage >= 70) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Budget</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your budget allocations and track spending
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-6 py-3 border-2 border-blue-500 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-500/20"
        >
          Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Allocation Chart */}
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Budget Allocation</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgets}
                  dataKey="allocated"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {budgets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${value}`, 'Allocated']}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending vs Budget Chart */}
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Spending vs Budget</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgets}>
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value, name) => [`₹${value}`, name === 'allocated' ? 'Budget' : 'Spent']}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6',
                  }}
                />
                <Bar dataKey="allocated" fill="#3B82F6" name="Budget" />
                <Bar dataKey="spent" fill="#EF4444" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Budget Categories</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {budgets.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              No budget categories found
            </div>
          ) : (
            budgets.map((budget) => {
              const remaining = calculateRemaining(budget.allocated, budget.spent)
              const percentage = calculatePercentage(budget.allocated, budget.spent)
              const statusColor = getStatusColor(percentage)

              return (
                <div key={budget.id} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-400">
                            {budget.category.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-medium text-white">
                          {budget.category}
                        </div>
                        <div className="text-sm text-gray-400">
                          Allocated: ₹{budget.allocated.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <div className={`text-lg font-medium ${statusColor}`}>
                          {percentage.toFixed(1)}% Used
                        </div>
                        <div className="text-sm text-gray-400">
                          Remaining: ₹{remaining.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-900/20 transition-colors"
                        aria-label="Delete budget"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          percentage >= 90
                            ? 'bg-red-500'
                            : percentage >= 70
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Budget</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Allocated Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    value={newBudget.allocated}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, allocated: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBudget}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Add Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 