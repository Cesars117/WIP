'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Package, Plus, Camera, ArrowLeft, Loader2 } from 'lucide-react'
import { BOMPhotoImporter } from '@/app/components/BOMPhotoImporter'

interface SiteKitSummary {
  id: number
  siteKitId: string
  siteId: string | null
  projectName: string | null
  bomId: string | null
  status: string
  createdAt: string
  totalItems: number
  verified: number
  matchPct: number
}

export default function SiteKitsPage() {
  const [siteKits, setSiteKits] = useState<SiteKitSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showImporter, setShowImporter] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({
    siteKitId: '', bomId: '', siteId: '', projectName: '',
    pallets: '', authNumber: '', mslLocation: '', company: '',
    catsCode: '', subcontractor: '',
  })
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/site-kits')
      if (res.ok) setSiteKits(await res.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      PENDING: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
      IN_PROGRESS: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
      COMPLETE: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
      DISCREPANCY: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    }
    const s = map[status] || map.PENDING
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem',
        fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap',
      }}>
        {status}
      </span>
    )
  }

  const handleCreateManual = async () => {
    if (!newForm.siteKitId.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/site-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newForm, items: [] }),
      })
      if (res.ok) {
        setShowNewForm(false)
        setNewForm({ siteKitId: '', bomId: '', siteId: '', projectName: '', pallets: '', authNumber: '', mslLocation: '', company: '', catsCode: '', subcontractor: '' })
        loadData()
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="heading-xl">T-Mobile BOM / Site Kits</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Compare BOM deliveries vs actual inventory</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowImporter(true)} className="btn" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
            <Camera size={18} /> Import from Photo
          </button>
          <button onClick={() => setShowNewForm(true)} className="btn btn-primary">
            <Plus size={18} /> New Site Kit
          </button>
        </div>
      </header>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} />
        </div>
      ) : siteKits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No Site Kits yet. Create one or import from a BOM photo.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
                  {['Site Kit ID', 'Site ID', 'Project', 'BOM ID', 'Items', 'Verified', 'Match %', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.813rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siteKits.map((sk) => (
                  <tr key={sk.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/site-kits/${sk.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {sk.siteKitId}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{sk.siteId || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{sk.projectName || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{sk.bomId || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{sk.totalItems}</td>
                    <td style={{ padding: '12px 16px' }}>{sk.verified}/{sk.totalItems}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${sk.matchPct}%`, height: '100%', borderRadius: '3px',
                            background: sk.matchPct === 100 ? '#10b981' : sk.matchPct > 50 ? '#f59e0b' : '#ef4444',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{sk.matchPct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{statusBadge(sk.status)}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
                      {new Date(sk.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOM Photo Importer Modal */}
      {showImporter && (
        <BOMPhotoImporter
          onImportComplete={() => { setShowImporter(false); loadData() }}
          onClose={() => setShowImporter(false)}
        />
      )}

      {/* New Site Kit Manual Form Modal */}
      {showNewForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
            <h2 className="heading-lg" style={{ marginBottom: '1.5rem' }}>New Site Kit</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Site Kit ID *', key: 'siteKitId' },
                { label: 'BOM ID', key: 'bomId' },
                { label: 'Site ID', key: 'siteId' },
                { label: 'Project Name', key: 'projectName' },
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
                    value={newForm[key as keyof typeof newForm]}
                    onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowNewForm(false)} className="btn" style={{ flex: 1, background: 'var(--surface-secondary)' }}>Cancel</button>
              <button onClick={handleCreateManual} disabled={saving || !newForm.siteKitId.trim()} className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
