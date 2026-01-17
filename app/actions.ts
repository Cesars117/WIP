'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Dashboard Stats ---
export async function getDashboardStats() {
    const [itemCount, locationCount, items, categorizedItems, locationItems] = await Promise.all([
        db.item.count(),
        db.location.count(),
        db.item.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                barcode: true,
                quantity: true,
                status: true,
                unitType: true,
                unitsPerBox: true,
                totalUnits: true,
                sku: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } }
            }
        }),
        db.item.findMany({
            orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                description: true,
                barcode: true,
                quantity: true,
                status: true,
                unitType: true,
                unitsPerBox: true,
                totalUnits: true,
                sku: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } }
            }
        }),
        db.item.findMany({
            orderBy: [{ location: { name: 'asc' } }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                description: true,
                barcode: true,
                quantity: true,
                status: true,
                unitType: true,
                unitsPerBox: true,
                totalUnits: true,
                sku: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } }
            }
        })
    ])

    // Calculate total value only if we add a price field later, for now just 0 or mock
    const totalValue = 0

    return {
        itemCount,
        locationCount,
        totalValue,
        recentItems: items,
        categorizedItems,
        locationItems
    }
}

// --- Items ---
export async function getItems(query?: string) {
    return db.item.findMany({
        where: {
            OR: query ? [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { sku: { contains: query, mode: 'insensitive' } },
                { barcode: { contains: query, mode: 'insensitive' } },
                { category: { name: { contains: query, mode: 'insensitive' } } },
                { location: { name: { contains: query, mode: 'insensitive' } } }
            ] : undefined
        },
        select: {
            id: true,
            name: true,
            description: true,
            barcode: true,
            quantity: true,
            status: true,
            unitType: true,
            unitsPerBox: true,
            totalUnits: true,
            sku: true,
            createdAt: true,
            category: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function findItemByBarcode(barcode: string) {
    return db.item.findUnique({
        where: { barcode },
        select: {
            id: true,
            name: true,
            description: true,
            barcode: true,
            quantity: true,
            status: true,
            unitType: true,
            unitsPerBox: true,
            totalUnits: true,
            sku: true,
            category: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } }
        }
    })
}

export async function updateItemBarcode(itemId: number, barcode: string) {
    await db.item.update({
        where: { id: itemId },
        data: { barcode }
    })
    revalidatePath('/')
    revalidatePath(`/items/${itemId}`)
}

export async function createItem(formData: FormData) {
    const name = formData.get('name') as string
    const categoryId = parseInt(formData.get('categoryId') as string)
    const locationId = parseInt(formData.get('locationId') as string)
    const quantity = parseInt(formData.get('quantity') as string)
    const status = formData.get('status') as string
    let barcode = formData.get('barcode') as string | null
    const autoGenerateBarcode = formData.get('autoGenerateBarcode') === 'true'
    
    // Material-specific fields
    const unitType = formData.get('unitType') as string | null
    const unitsPerBox = formData.get('unitsPerBox') ? parseInt(formData.get('unitsPerBox') as string) : null
    const totalUnits = formData.get('totalUnits') ? parseInt(formData.get('totalUnits') as string) : null

    // Generar código de barras automático si se solicita
    if (autoGenerateBarcode) {
        barcode = `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }

    // Si hay código de barras, validar que sea único
    if (barcode) {
        const existing = await db.item.findUnique({
            where: { barcode }
        })
        if (existing) {
            throw new Error(`El código de barras "${barcode}" ya existe en el inventario.`)
        }
    }

    await db.item.create({
        data: {
            name,
            categoryId,
            locationId,
            quantity,
            status,
            barcode: barcode || null,
            unitType,
            unitsPerBox,
            totalUnits
        }
    })

    revalidatePath('/')
}

export async function generateUniqueBarcode() {
    let barcode = ''
    let exists = true
    
    while (exists) {
        barcode = `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        const check = await db.item.findUnique({
            where: { barcode }
        })
        exists = !!check
    }
    
    return barcode
}

// Actualizar artículo
export async function updateItem(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    const name = formData.get('name') as string
    const categoryId = parseInt(formData.get('categoryId') as string)
    const locationId = parseInt(formData.get('locationId') as string)
    const quantity = parseInt(formData.get('quantity') as string) || 0
    const status = formData.get('status') as string || 'AVAILABLE'
    const newBarcode = formData.get('barcode') as string | null
    
    // Material-specific fields
    const unitType = formData.get('unitType') as string | null
    const unitsPerBox = formData.get('unitsPerBox') ? parseInt(formData.get('unitsPerBox') as string) : null
    const totalUnits = formData.get('totalUnits') ? parseInt(formData.get('totalUnits') as string) : null

    // Validar barcode único si cambió
    const item = await db.item.findUnique({ where: { id } })
    if (!item) throw new Error('Artículo no encontrado')

    if (newBarcode && newBarcode !== item.barcode) {
        const existing = await db.item.findUnique({
            where: { barcode: newBarcode }
        })
        if (existing) {
            throw new Error(`El código de barras "${newBarcode}" ya existe en el inventario.`)
        }
    }

    await db.item.update({
        where: { id },
        data: {
            name,
            categoryId,
            locationId,
            quantity,
            status,
            barcode: newBarcode || null,
            unitType,
            unitsPerBox,
            totalUnits
        }
    })

    revalidatePath('/')
    revalidatePath(`/items/${id}`)
    redirect('/')
}

// Eliminar artículo
export async function deleteItem(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    await db.item.delete({
        where: { id }
    })
    revalidatePath('/')
}

// Obtener artículo por ID
export async function getItemById(id: number) {
    return db.item.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            barcode: true,
            quantity: true,
            status: true,
            unitType: true,
            unitsPerBox: true,
            totalUnits: true,
            sku: true,
            categoryId: true,
            locationId: true,
            category: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } }
        }
    })
}

// --- Seeding helper (safe to run in prod if checks flow) ---
export async function seedInitialData() {
    const catCount = await db.category.count()
    if (catCount === 0) {
        await db.category.createMany({
            data: [
                { name: 'Herramientas Eléctricas', description: 'Taladros, sierras, etc.' },
                { name: 'Herramientas Manuales', description: 'Martillos, destornilladores' },
                { name: 'Conectividad', description: 'Cables, conectores coax, fibra' },
                { name: 'Consumibles', description: 'Tornillos, cintas, pegamentos' }
            ]
        })
    }

    const locCount = await db.location.count()
    if (locCount === 0) {
        await db.location.createMany({
            data: [
                { name: 'Bodega Central', type: 'WAREHOUSE' },
                { name: 'Camioneta #1', type: 'VEHICLE' },
                { name: 'Camioneta #2', type: 'VEHICLE' },
                { name: 'Sitio Alpha', type: 'SITE' }
            ]
        })
    }
}
