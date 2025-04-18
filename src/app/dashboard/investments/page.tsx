'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface Investment {
  id: string
  assetType: string
  name: string
  amount: number
  purchaseDate: string
  currentValue: number
}

interface PieChartData {
  name: string;
  value: number;
  percent: number;
}

const COLORS = [
  '#3B82F6', // Primary Blue
  '#1E40AF', // Dark Blue
  '#60A5FA', // Light Blue
  '#172554', // Navy Blue
  '#2563EB', // Royal Blue
  '#93C5FD', // Sky Blue
]

export default function Investments() {
  const { data: session } = useSession()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await fetch('/api/investments')
        if (!response.ok) {
          throw new Error('Failed to fetch investments')
        }
        const data = await response.json()
        setInvestments(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load investments',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestments()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete investment')
      }

      setInvestments(investments.filter((i) => i.id !== id))
      toast({
        title: 'Success',
        description: 'Investment deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete investment',
        variant: 'destructive',
      })
    }
  }

  const calculateROI = (investment: Investment) => {
    const profit = investment.currentValue - investment.amount
    const roi = (profit / investment.amount) * 100
    return roi.toFixed(2)
  }

  const getAssetTypeDistribution = () => {
    const distribution = investments.reduce((acc, investment) => {
      acc[investment.assetType] = (acc[investment.assetType] || 0) + investment.currentValue
      return acc
    }, {} as Record<string, number>)

    const totalValue = Object.values(distribution).reduce((sum, value) => sum + value, 0)

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percent: value / totalValue
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const assetTypeData: PieChartData[] = getAssetTypeDistribution()
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Investments</h1>
            <p className="mt-2 text-lg text-blue-400">
              Total Portfolio Value: ₹{totalValue.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/investments/new'}
            className="inline-flex items-center px-6 py-3 border-2 border-blue-500 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-500/20"
          >
            Add Investment
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
            <div className="px-6 py-5 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">
                Investment Portfolio
              </h3>
            </div>
            <div className="divide-y divide-gray-700">
              {investments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  No investments found. Add your first investment to get started.
                </div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {investments.map((investment) => (
                    <li key={investment.id} className="hover:bg-gray-700/50 transition-colors">
                      <div className="px-6 py-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-14 w-14 rounded-lg bg-blue-900 flex items-center justify-center shadow-lg shadow-blue-900/50">
                                <span className="text-xl font-bold text-blue-300">
                                  {investment.assetType[0].toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-white">
                                {investment.name}
                              </h4>
                              <div className="mt-1.5 flex items-center space-x-4 text-sm text-blue-400">
                                <span>{investment.assetType}</span>
                                <span className="text-gray-600">•</span>
                                <span>{format(new Date(investment.purchaseDate), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-8">
                            <div className="text-right">
                              <div className="text-lg font-medium text-white">
                                ₹{investment.currentValue.toLocaleString()}
                              </div>
                              <div className={`text-base font-medium ${
                                Number(calculateROI(investment)) >= 0 
                                  ? 'text-emerald-400' 
                                  : 'text-red-400'
                              }`}>
                                {calculateROI(investment)}% ROI
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(investment.id)}
                              className="p-2.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-900/20 transition-colors"
                              aria-label="Delete investment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">
              Asset Distribution
            </h2>
            {investments.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-400">
                Add investments to see your asset distribution
              </div>
            ) : (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => (
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        )}
                        outerRadius={100}
                        innerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {assetTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-6">
                  {assetTypeData.map((asset, index) => (
                    <div key={asset.name} className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full shadow-lg" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="text-sm font-medium text-white">
                        {asset.name}: {(asset.percent * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 