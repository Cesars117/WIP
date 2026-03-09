import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

// GET /api/items/search?sku=XXXXX — search WIP items by siteKitSku
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sku = request.nextUrl.searchParams.get('sku')
  if (!sku) {
    return NextResponse.json({ error: 'sku parameter required' }, { status: 400 })
  }

  const items = await db.item.findMany({
    where: {
      siteKitSku: sku,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      quantity: true,
      status: true,
      siteKitSku: true,
      createdAt: true,
      location: { select: { name: true } },
      serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } },
    },
  })

  return NextResponse.json(items)
}
