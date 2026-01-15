'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

// --- Dashboard Stats ---
export async function getDashboardStats() {
    const [itemCount, locationCount, items] = await Promise.all([
        db.item.count(),
        db.location.count(),
        db.item.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { category: true, location: true }
        })
    ])

    // Calculate total value only if we add a price field later, for now just 0 or mock
    const totalValue = 0

    return {
        itemCount,
        locationCount,
        totalValue,
        recentItems: items
    }
}

// --- Items ---
export async function getItems(query?: string) {
    return db.item.findMany({
        where: {
            OR: query ? [
                { name: { contains: query } },
                { description: { contains: query } },
                { sku: { contains: query } }
                // TODO: Re-enable barcode search after Prisma sync
                // { barcode: { contains: query } }
            ] : undefined
        },
        include: {
            category: true,
            location: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createItem(formData: FormData) {
    const name = formData.get('name') as string
    const categoryId = parseInt(formData.get('categoryId') as string)
    const locationId = parseInt(formData.get('locationId') as string)
    const quantity = parseInt(formData.get('quantity') as string)
    const status = formData.get('status') as string
    let barcode = formData.get('barcode') as string | null
    const autoGenerateBarcode = formData.get('autoGenerateBarcode') === 'true'

    // Si se solicita generar automáticamente, crear un código único
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
            barcode: barcode || null
        }
    })

    revalidatePath('/')
}

// Generar código de barras único
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
    const quantity = parseInt(formData.get('quantity') as string)
    const status = formData.get('status') as string
    const newBarcode = formData.get('barcode') as string | null

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
            barcode: newBarcode || null
        }
    })

    revalidatePath('/')
    revalidatePath(`/items/${id}`)
}

// Eliminar artículo
export async function deleteItem(id: number) {
    await db.item.delete({
        where: { id }
    })
    revalidatePath('/')
}

// Obtener artículo por ID
export async function getItemById(id: number) {
    return db.item.findUnique({
        where: { id },
        include: { category: true, location: true }
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
