'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useToast } from '@/components/ui/use-toast'

interface DashboardData {
  totalExpenses: number
  totalIncome: number
  totalInvestments: number
  categoryDistribution: {
    name: string
    value: number
  }[]
}

const COLORS = [
  '#3B82F6', // Primary Blue
  '#1E40AF', // Dark Blue
  '#60A5FA', // Light Blue
  '#172554', // Navy Blue
  '#2563EB', // Royal Blue
  '#93C5FD', // Sky Blue
]

export default function Dashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-lg bg-red-900/50 flex items-center justify-center shadow-lg shadow-red-900/20">
                  <svg
                    className="h-7 w-7 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Total Expenses
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">
                      ₹{dashboardData?.totalExpenses.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-lg bg-emerald-900/50 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <svg
                    className="h-7 w-7 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Total Income
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">
                      ₹{dashboardData?.totalIncome.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-lg bg-blue-900/50 flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <svg
                    className="h-7 w-7 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Total Investments
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">
                      ₹{dashboardData?.totalInvestments.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">
          Expense Distribution
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dashboardData?.categoryDistribution}
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
                {dashboardData?.categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {dashboardData?.categoryDistribution.map((category, index) => (
            <div key={category.name} className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full shadow-lg" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="text-sm font-medium text-white">
                {category.name}: {((category.value / dashboardData.totalExpenses) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 