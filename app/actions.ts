'use server'

import db from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

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
                siteKitSku: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } },
                serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } }
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
                siteKitSku: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } },
                serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } }
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
                siteKitSku: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } },
                serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } }
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
                { siteKitSku: { contains: query, mode: 'insensitive' } },
                { category: { name: { contains: query, mode: 'insensitive' } } },
                { location: { name: { contains: query, mode: 'insensitive' } } },
                { serialNumbers: { some: { serialNumber: { contains: query, mode: 'insensitive' } } } },
                { serialNumbers: { some: { tmoSerial: { contains: query, mode: 'insensitive' } } } }
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
            siteKitSku: true,
            createdAt: true,
            category: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } },
            serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } }
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
            siteKitSku: true,
            category: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } },
            serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } }
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
    const siteKitSku = formData.get('siteKitSku') as string | null
    
    // Serial numbers (JSON string from the form)
    const serialNumbersJson = formData.get('serialNumbers') as string | null
    let serialEntries: Array<{ serialNumber?: string; tmoSerial?: string }> = []
    if (serialNumbersJson) {
        try {
            serialEntries = JSON.parse(serialNumbersJson)
        } catch {
            // ignore invalid JSON
        }
    }
    
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

    // Filter out empty serial entries
    const validSerials = serialEntries.filter(
        (s) => (s.serialNumber && s.serialNumber.trim()) || (s.tmoSerial && s.tmoSerial.trim())
    )

    await db.$transaction(async (tx) => {
        const item = await tx.item.create({
            data: {
                name,
                categoryId,
                locationId,
                quantity,
                status,
                barcode: barcode || null,
                siteKitSku: siteKitSku || null,
                unitType,
                unitsPerBox,
                totalUnits,
                serialNumbers: validSerials.length > 0 ? {
                    create: validSerials.map((s) => ({
                        serialNumber: s.serialNumber?.trim() || null,
                        tmoSerial: s.tmoSerial?.trim() || null
                    }))
                } : undefined
            }
        })

        const session = await getServerSession(authOptions)
        await createAuditLog(tx, session, {
            action: 'CREATED',
            entityType: 'ITEM',
            entityId: item.id,
            entityLabel: name,
        })
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
    const siteKitSku = formData.get('siteKitSku') as string | null
    
    // Serial numbers (JSON string from the form)
    const serialNumbersJson = formData.get('serialNumbers') as string | null
    let serialEntries: Array<{ id?: number; serialNumber?: string; tmoSerial?: string }> = []
    if (serialNumbersJson) {
        try {
            serialEntries = JSON.parse(serialNumbersJson)
        } catch {
            // ignore invalid JSON
        }
    }
    
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

    // Filter valid serial entries
    const validSerials = serialEntries.filter(
        (s) => (s.serialNumber && s.serialNumber.trim()) || (s.tmoSerial && s.tmoSerial.trim())
    )

    await db.$transaction(async (tx) => {
        await tx.item.update({
            where: { id },
            data: {
                name,
                categoryId,
                locationId,
                quantity,
                status,
                barcode: newBarcode || null,
                siteKitSku: siteKitSku || null,
                unitType,
                unitsPerBox,
                totalUnits
            }
        })

        // Replace all serial numbers: delete old ones and create new ones
        await tx.serialNumber.deleteMany({ where: { itemId: id } })
        if (validSerials.length > 0) {
            await tx.serialNumber.createMany({
                data: validSerials.map((s) => ({
                    itemId: id,
                    serialNumber: s.serialNumber?.trim() || null,
                    tmoSerial: s.tmoSerial?.trim() || null
                }))
            })
        }

        // Audit logging
        const session = await getServerSession(authOptions)
        if (item.quantity !== quantity) {
            await createAuditLog(tx, session, {
                action: 'QTY_CHANGED',
                entityType: 'ITEM',
                entityId: id,
                entityLabel: name,
                fieldChanged: 'quantity',
                oldValue: String(item.quantity),
                newValue: String(quantity),
            })
        }
        if (item.status !== status) {
            await createAuditLog(tx, session, {
                action: 'STATUS_CHANGED',
                entityType: 'ITEM',
                entityId: id,
                entityLabel: name,
                fieldChanged: 'status',
                oldValue: item.status,
                newValue: status,
            })
        }
        if (item.quantity === quantity && item.status === status) {
            await createAuditLog(tx, session, {
                action: 'UPDATED',
                entityType: 'ITEM',
                entityId: id,
                entityLabel: name,
            })
        }
    })

    revalidatePath('/')
    revalidatePath(`/items/${id}`)
    redirect('/')
}

// Eliminar artículo
export async function deleteItem(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    const item = await db.item.findUnique({ where: { id } })
    // Serial numbers are cascade-deleted by the DB relation
    await db.$transaction(async (tx) => {
        await tx.item.delete({ where: { id } })
        const session = await getServerSession(authOptions)
        await createAuditLog(tx, session, {
            action: 'DELETED',
            entityType: 'ITEM',
            entityId: id,
            entityLabel: item?.name || `Item #${id}`,
        })
    })
    revalidatePath('/')
}

// Get serial numbers for an item (used in delete confirmation)
export async function getItemSerialNumbers(itemId: number) {
    return db.serialNumber.findMany({
        where: { itemId },
        select: { id: true, serialNumber: true, tmoSerial: true }
    })
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
            siteKitSku: true,
            categoryId: true,
            locationId: true,
            category: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } },
            serialNumbers: { select: { id: true, serialNumber: true, tmoSerial: true } }
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

// --- Categories CRUD ---
export async function getCategories() {
    return db.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { items: true } } }
    })
}

export async function getCategoryById(id: number) {
    return db.category.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } }
    })
}

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    await db.category.create({
        data: {
            name,
            description: description || null
        }
    })

    revalidatePath('/categories')
    redirect('/categories')
}

export async function updateCategory(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    await db.category.update({
        where: { id },
        data: {
            name,
            description: description || null
        }
    })

    revalidatePath('/categories')
    redirect('/categories')
}

export async function deleteCategory(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    
    // Check if category has items
    const category = await db.category.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } }
    })
    
    if (category?._count?.items && category._count.items > 0) {
        throw new Error(`No se puede eliminar la categoría "${category.name}" porque tiene ${category._count.items} artículos asociados.`)
    }

    await db.category.delete({
        where: { id }
    })

    revalidatePath('/categories')
}

// --- Locations CRUD ---
export async function getLocations() {
    return db.location.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { items: true } } }
    })
}

export async function getLocationById(id: number) {
    return db.location.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } }
    })
}

export async function createLocation(formData: FormData) {
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string

    await db.location.create({
        data: {
            name,
            type,
            description: description || null
        }
    })

    revalidatePath('/locations')
    redirect('/locations')
}

export async function updateLocation(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string

    await db.location.update({
        where: { id },
        data: {
            name,
            type,
            description: description || null
        }
    })

    revalidatePath('/locations')
    redirect('/locations')
}

export async function deleteLocation(formData: FormData) {
    const id = parseInt(formData.get('id') as string)
    
    // Check if location has items
    const location = await db.location.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } }
    })
    
    if (location?._count?.items && location._count.items > 0) {
        throw new Error(`No se puede eliminar la ubicación "${location.name}" porque tiene ${location._count.items} artículos asociados.`)
    }

    await db.location.delete({
        where: { id }
    })

    revalidatePath('/locations')
}

// 📤 EXPORT Y BACKUP
export async function exportToCSV() {
  try {
    const items = await db.item.findMany({
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const csvContent = [
      'nombre,sku,descripcion,estado,categoria,ubicacion,fechaCreacion',
      ...items.map(item => 
        `"${item.name}","${item.sku || ''}","${item.description || ''}","${item.status}","${item.category?.name || 'Sin categoría'}","${item.location?.name || 'Sin ubicación'}","${item.createdAt}"`
      )
    ].join('\n');

    return {
      success: true,
      data: csvContent,
      filename: `inventario-${new Date().toISOString().split('T')[0]}.csv`,
      count: items.length
    };
  } catch (error) {
    console.error('Error generando CSV:', error);
    return { success: false, error: 'Error generando CSV' };
  }
}

export async function createManualBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const [items, categories, locations] = await Promise.all([
      db.item.findMany({ include: { category: true, location: true } }),
      db.category.findMany(),
      db.location.findMany()
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      counts: {
        items: items.length,
        categories: categories.length,
        locations: locations.length
      },
      data: { items, categories, locations }
    };

    const backupPath = path.join(backupDir, `manual-backup-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    return {
      success: true,
      path: backupPath,
      counts: backup.counts,
      timestamp
    };
  } catch (error) {
    console.error('Error creando backup:', error);
    return { success: false, error: 'Error creando backup' };
  }
}
