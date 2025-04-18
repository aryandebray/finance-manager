import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Investments error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { assetType, name, amount, purchaseDate, currentValue } = await req.json()

    if (!assetType || !name || !amount || !purchaseDate || !currentValue) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const investment = await prisma.investment.create({
      data: {
        assetType,
        name,
        amount,
        purchaseDate: new Date(purchaseDate),
        currentValue,
        userId: session.user.id,
      },
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Create investment error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 