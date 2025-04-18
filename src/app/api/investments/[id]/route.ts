import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const investment = await prisma.investment.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!investment) {
      return NextResponse.json(
        { message: 'Investment not found' },
        { status: 404 }
      )
    }

    if (investment.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.investment.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Investment deleted successfully' })
  } catch (error) {
    console.error('Delete investment error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 