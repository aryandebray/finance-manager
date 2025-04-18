import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { classifyTransaction } from '@/utils/classifier'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where = {
      userId: session.user.id,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, amount, date, paymentMode } = await req.json()

    if (!title || !amount || !date || !paymentMode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use Naive Bayes classifier to determine the category
    const category = classifyTransaction(description || title)

    const transaction = await prisma.transaction.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        paymentMode,
        category,
        userId: session.user.id,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, category } = await req.json()

    if (!id || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the transaction belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        category,
      },
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 