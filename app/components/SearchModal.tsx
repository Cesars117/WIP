'use client'

import { useState } from 'react'
import { X, Package, MapPin, Tag, Barcode as BarcodeIcon, Edit, Check } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface Item {
  id: number
  name: string
  description: string | null
  barcode: string | null
  quantity: number
  status: string
  unitType: string | null
  unitsPerBox: number | null
  totalUnits: number | null
  sku: string | null
  category: { name: string }
  location: { name: string }
}

interface SearchModalProps {
  items: Item[]
  query: string
  onClose: () => void
}

export function SearchModal({ items, query, onClose }: SearchModalProps) {
  const { t } = useLanguage()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }
      case 'IN_USE':
        return { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }
      case 'MAINTENANCE':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }
      case 'LOST':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', color: 'var(--text-secondary)' }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: selectedItem ? '900px' : '700px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: 'max-width 0.3s'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>
              {t('dashboard.searchResults')}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {items.length} {items.length === 1 ? 'result found' : 'results found'} for &quot;{query}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Items List */}
          <div style={{
            flex: selectedItem ? '0 0 300px' : 1,
            overflowY: 'auto',
            padding: '16px',
            borderRight: selectedItem ? '1px solid var(--border-light)' : 'none',
            transition: 'flex 0.3s'
          }}>
            {items.map((item) => {
              const isSelected = selectedItem?.id === item.id
              const statusStyle = getStatusColor(item.status)

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isSelected ? 'var(--primary-light)' : 'white',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--background)'
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'white'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={16} />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Package size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {item.category.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                      Qty: {item.quantity}
                    </span>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {t(`status.${item.status}`)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Item Details */}
          {selectedItem && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              animation: 'slideInRight 0.3s ease-out'
            }}>
              {/* Item Header */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>
                      {selectedItem.name}
                    </h3>
                    <div style={{
                      display: 'inline-block',
                      background: getStatusColor(selectedItem.status).bg,
                      color: getStatusColor(selectedItem.status).color,
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {t(`status.${selectedItem.status}`)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Highlighted */}
              {selectedItem.description && (
                <div style={{
                  background: 'var(--primary-light)',
                  border: '2px solid var(--primary)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                    display: 'block'
                  }}>
                    📋 {t('common.description')}
                  </label>
                  <p style={{
                    margin: 0,
                    color: 'var(--text)',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'var(--background)',
                  padding: '16px',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Tag size={16} style={{ color: 'var(--text-secondary)' }} />
                    <label style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase'
                    }}>
                      {t('common.category')}
                    </label>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                    {selectedItem.category.name}
                  </p>
                </div>

                <div style={{
                  background: 'var(--background)',
                  padding: '16px',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                    <label style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase'
                    }}>
                      {t('common.location')}
                    </label>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                    {selectedItem.location.name}
                  </p>
                </div>

                <div style={{
                  background: 'var(--background)',
                  padding: '16px',
                  borderRadius: '12px'
                }}>
                  <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    {t('common.quantity')}
                  </label>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                    {selectedItem.quantity}
                  </p>
                </div>

                {selectedItem.barcode && (
                  <div style={{
                    background: 'var(--background)',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <BarcodeIcon size={16} style={{ color: 'var(--text-secondary)' }} />
                      <label style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase'
                      }}>
                        {t('common.barcode')}
                      </label>
                    </div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>
                      {selectedItem.barcode}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(selectedItem.sku || selectedItem.unitType === 'BOX') && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {selectedItem.sku && (
                    <div>
                      <label style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                        display: 'block'
                      }}>
                        SKU
                      </label>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)', fontFamily: 'monospace' }}>
                        {selectedItem.sku}
                      </p>
                    </div>
                  )}

                  {selectedItem.unitType === 'BOX' && selectedItem.unitsPerBox && (
                    <>
                      <div>
                        <label style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          {t('newItem.unitsPerBox')}
                        </label>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                          {selectedItem.unitsPerBox}
                        </p>
                      </div>
                      <div>
                        <label style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          {t('newItem.totalUnits')}
                        </label>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                          {selectedItem.totalUnits || (selectedItem.quantity * selectedItem.unitsPerBox)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Link
                href={`/items/${selectedItem.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px 24px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Edit size={20} />
                {t('itemDetails.editItem')}
              </Link>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
