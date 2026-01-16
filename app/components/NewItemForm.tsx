'use client'

import { useState } from 'react'
import { ScanButton } from './ScanButton'
import { BarcodeGeneratorButton } from './BarcodeGeneratorButton'

interface NewItemFormProps {
  categories: Array<{ id: number; name: string }>
  locations: Array<{ id: number; name: string }>
  createItem: (formData: FormData) => Promise<void>
  preloadedBarcode?: string | null
}

export function NewItemForm({ categories, locations, createItem, preloadedBarcode }: NewItemFormProps) {
  const [barcode, setBarcode] = useState(preloadedBarcode || '')
  const [unitType, setUnitType] = useState('units')
  const [categoryId, setCategoryId] = useState('')

  const handleBarcodeSet = (newBarcode: string) => {
    setBarcode(newBarcode)
  }

  const selectedCategory = categories.find(cat => cat.id.toString() === categoryId)
  const isMaterial = selectedCategory?.name === 'Material'

  return (
    <form action={createItem} className="card" style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div id="error-message" style={{ display: "none", padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#dc2626", borderRadius: "var(--radius-sm)" }}></div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Nombre del Artículo</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Ej. Taladro Percutor 20V"
          style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Código de Barras</label>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <input
            name="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            type="text"
            placeholder="Escanea o ingresa el código"
            style={{ 
              flex: 1, 
              minWidth: "200px",
              padding: "12px", 
              background: "var(--bg-elevated)", 
              border: "1px solid var(--border-light)", 
              color: "var(--text-main)", 
              borderRadius: "var(--radius-sm)", 
              outline: "none" 
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <ScanButton onScan={handleBarcodeSet} />
            <BarcodeGeneratorButton onBarcodeGenerated={handleBarcodeSet} />
          </div>
        </div>
        <small style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "block", marginTop: "0.5rem" }}>
          Opcional - Debe ser único. Usa &quot;📷 Escanear&quot; para usar la cámara o &quot;Generar&quot; para crear uno automático.
        </small>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Categoría</label>
          <select 
            name="categoryId" 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required 
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          >
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</label>
          <select name="locationId" required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
            <option value="" disabled selected>Selecciona una ubicación</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cantidad</label>
          <input name="quantity" type="number" min="1" defaultValue="1" required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Estado</label>
          <select name="status" defaultValue="AVAILABLE" required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
            <option value="AVAILABLE">Disponible</option>
            <option value="IN_USE">En Uso</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="LOST">Perdido</option>
          </select>
        </div>
      </div>

      {isMaterial && (
        <>
          <div style={{ padding: "16px", background: "rgba(99, 102, 241, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600 }}>Configuración de Material</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Tipo de Unidad</label>
                <select 
                  name="unitType" 
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
                >
                  <option value="units">Unidades</option>
                  <option value="boxes">Cajas</option>
                </select>
              </div>

              {unitType === 'boxes' && (
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Unidades por Caja</label>
                  <input name="unitsPerBox" type="number" min="1" defaultValue="1" style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }} />
                </div>
              )}
            </div>

            <small style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              {unitType === 'boxes' 
                ? 'El total de unidades se calculará automáticamente: Cantidad × Unidades por Caja'
                : 'Se registrará directamente como unidades individuales'
              }
            </small>
          </div>
        </>
      )}

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Descripción (Opcional)</label>
        <textarea name="description" rows={3} placeholder="Información adicional sobre el artículo..." style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none", resize: "vertical", minHeight: "80px" }}></textarea>
      </div>

      <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "1rem", fontWeight: 600 }}>
        Registrar Artículo
      </button>
    </form>
  )
}