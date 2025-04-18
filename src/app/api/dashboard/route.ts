import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

interface Transaction {
  amount: number
}

interface Investment {
  currentValue: number
}

interface CategoryDistribution {
  category: string
  _sum: {
    amount: number | null
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get total expenses
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        amount: {
          lt: 0,
        },
      },
    })

    const totalExpenses = Math.abs(
      expenses.reduce((sum: number, transaction: Transaction) => sum + transaction.amount, 0)
    )

    // Get total income
    const income = await prisma.transaction.findMany({
      where: {
        userId,
        amount: {
          gt: 0,
        },
      },
    })

    const totalIncome = income.reduce(
      (sum: number, transaction: Transaction) => sum + transaction.amount,
      0
    )

    // Get total investments
    const investments = await prisma.investment.findMany({
      where: {
        userId,
      },
    })

    const totalInvestments = investments.reduce(
      (sum: number, investment: Investment) => sum + investment.currentValue,
      0
    )

    // Get category distribution
    const categoryDistribution = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const formattedCategoryDistribution = categoryDistribution.map((item: CategoryDistribution) => ({
      name: item.category,
      value: Math.abs(item._sum.amount || 0),
    }))

    return NextResponse.json({
      totalExpenses,
      totalIncome,
      totalInvestments,
      categoryDistribution: formattedCategoryDistribution,
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 