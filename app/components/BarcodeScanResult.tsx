'use client'

import { useRouter } from 'next/navigation'
import { Package, Plus, Link2 } from 'lucide-react'

interface Item {
  id: number
  name: string
  barcode: string | null
  quantity: number
  status: string
  category: { name: string }
  location: { name: string }
}

interface BarcodeScanResultProps {
  barcode: string
  item: Item | null
  onClose: () => void
}

export function BarcodeScanResult({ barcode, item, onClose }: BarcodeScanResultProps) {
  const router = useRouter()

  const handleViewItem = () => {
    if (item) {
      router.push(`/items/${item.id}`)
    }
  }

  const handleCreateNew = () => {
    router.push(`/items/new?barcode=${encodeURIComponent(barcode)}`)
  }

  const handleAddToExisting = () => {
    router.push(`/?query=&addBarcode=${encodeURIComponent(barcode)}`)
  }

  if (item) {
    // Código existe - mostrar el item
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              background: 'var(--success-light)',
              color: 'var(--success)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Package size={30} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--text)' }}>
              ¡Item Encontrado!
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Código: {barcode}
            </p>
          </div>

          <div style={{
            background: 'var(--background)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.125rem', color: 'var(--text)' }}>
              {item.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Categoría:</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.category.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ubicación:</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.location.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cantidad:</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.quantity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                <span style={{ 
                  color: item.status === 'AVAILABLE' ? 'var(--success)' : 'var(--warning)',
                  fontWeight: 500 
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'white',
                color: 'var(--text)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
            <button
              onClick={handleViewItem}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Código no existe - mostrar opciones
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: 'var(--warning-light)',
            color: 'var(--warning)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Package size={30} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--text)' }}>
            Código no encontrado
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Código: {barcode}
          </p>
        </div>

        <p style={{ 
          margin: '0 0 20px 0', 
          color: 'var(--text-secondary)',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          Este código no está registrado. ¿Qué deseas hacer?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleCreateNew}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            Crear Nuevo Item
          </button>

          <button
            onClick={handleAddToExisting}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'white',
              color: 'var(--text)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Link2 size={18} />
            Agregar a Item Existente
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'white',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
