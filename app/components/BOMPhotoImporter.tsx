'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Check, AlertTriangle } from 'lucide-react'

interface ParsedItem {
  siteKitSku: string
  quantity: number
  description: string
  assetTags: string[]
}

interface ParsedBOM {
  siteKitId: string
  bomId: string | null
  siteId: string | null
  projectName: string | null
  pallets: number | null
  authNumber: string | null
  dateCompleted: string | null
  mslLocation: string | null
  company: string | null
  catsCode: string | null
  subcontractor: string | null
  items: ParsedItem[]
}

interface BOMPhotoImporterProps {
  existingSiteKitId?: number // if adding to existing kit
  onImportComplete: () => void
  onClose: () => void
}

export function BOMPhotoImporter({ existingSiteKitId, onImportComplete, onClose }: BOMPhotoImporterProps) {
  const [images, setImages] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [parsed, setParsed] = useState<ParsedBOM | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Editable parsed data
  const [editableData, setEditableData] = useState<ParsedBOM | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setImages((prev) => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const processImages = async () => {
    if (images.length === 0) return
    setProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/site-kits/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'OCR failed')
      }

      const data: ParsedBOM = await res.json()
      setParsed(data)
      setEditableData(JSON.parse(JSON.stringify(data))) // deep clone for editing
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const updateItem = (idx: number, field: keyof ParsedItem, value: string | number | string[]) => {
    if (!editableData) return
    setEditableData({
      ...editableData,
      items: editableData.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    })
  }

  const confirmImport = async () => {
    if (!editableData) return
    setSaving(true)
    setError(null)

    try {
      if (existingSiteKitId) {
        // Add items to existing kit
        const res = await fetch(`/api/site-kits/${existingSiteKitId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: editableData.items }),
        })
        if (!res.ok) throw new Error('Failed to add items')
      } else {
        // Create new site kit
        const res = await fetch('/api/site-kits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editableData),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to create site kit')
        }
      }
      onImportComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
    }}>
      <div className="card" style={{
        maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="heading-lg">
            {existingSiteKitId ? 'Import BOM Items from Photo' : 'Import BOM from Photo'}
          </h2>
          <button onClick={onClose} className="btn" style={{ background: 'transparent', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {!parsed ? (
          <>
            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-light)', borderRadius: '12px',
                padding: '3rem', textAlign: 'center', cursor: 'pointer',
                background: 'var(--surface-secondary)', marginBottom: '1rem',
              }}
            >
              <Upload size={40} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Click or drag to upload BOM photos</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Supports JPEG, PNG, WebP — multiple pages allowed
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Image previews */}
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <img src={img} alt={`BOM page ${i + 1}`} style={{
                      width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px',
                    }} />
                    <button
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: 'var(--error)', color: 'white', border: 'none',
                        borderRadius: '50%', width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--error)', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {error}
              </div>
            )}

            <button
              onClick={processImages}
              disabled={images.length === 0 || processing}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} />
                  Processing with AI...
                </>
              ) : (
                <>Process {images.length} image{images.length !== 1 ? 's' : ''}</>
              )}
            </button>
          </>
        ) : editableData && (
          <>
            {/* Preview parsed data */}
            {!existingSiteKitId && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Site Kit Header</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Site Kit ID', key: 'siteKitId' },
                    { label: 'BOM ID', key: 'bomId' },
                    { label: 'Site ID', key: 'siteId' },
                    { label: 'Project', key: 'projectName' },
                    { label: 'Pallets', key: 'pallets' },
                    { label: 'Auth #', key: 'authNumber' },
                    { label: 'MSL Location', key: 'mslLocation' },
                    { label: 'Company', key: 'company' },
                    { label: 'CATS Code', key: 'catsCode' },
                    { label: 'Subcontractor', key: 'subcontractor' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</label>
                      <input
                        className="input"
                        value={String(editableData[key as keyof ParsedBOM] ?? '')}
                        onChange={(e) => setEditableData({ ...editableData, [key]: e.target.value || null })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
              BOM Items ({editableData.items.length})
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>SKU</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Qty</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Description</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Asset Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {editableData.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          className="input"
                          value={item.siteKitSku}
                          onChange={(e) => updateItem(idx, 'siteKitSku', e.target.value)}
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          className="input"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          className="input"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          style={{ width: '100%', minWidth: '200px' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '0.75rem', maxWidth: '200px' }}>
                        {item.assetTags.length > 0 ? item.assetTags.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <div style={{ color: 'var(--error)', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setParsed(null); setEditableData(null) }}
                className="btn"
                style={{ flex: 1, background: 'var(--surface-secondary)' }}
              >
                Back
              </button>
              <button
                onClick={confirmImport}
                disabled={saving}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> Saving...</>
                ) : (
                  <><Check size={18} style={{ marginRight: '0.5rem' }} /> Confirm Import</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
