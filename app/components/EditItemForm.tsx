'use client';

import { useState } from 'react';
import { ScanButton } from './ScanButton';
import { BarcodeGeneratorButton } from './BarcodeGeneratorButton';

interface EditItemFormProps {
    item: {
        id: number;
        name: string;
        barcode?: string | null;
        categoryId: number;
        locationId: number;
        quantity: number;
        status: string;
        description?: string | null;
        unitType?: string | null;
        unitsPerBox?: number | null;
    };
    categories: Array<{ id: number; name: string }>;
    locations: Array<{ id: number; name: string }>;
    updateItem: (formData: FormData) => Promise<void>;
}

export function EditItemForm({ item, categories, locations, updateItem }: EditItemFormProps) {
    const [barcode, setBarcode] = useState(item.barcode || '');
    const [unitType, setUnitType] = useState(item.unitType || 'units');
    const [categoryId, setCategoryId] = useState(item.categoryId);

    const handleBarcodeSet = (scannedBarcode: string) => {
        setBarcode(scannedBarcode);
    };

    // Check if the selected category is "Material"
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    const isMaterial = selectedCategory?.name === 'Material';

    return (
        <form action={updateItem} className="card" style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <input type="hidden" name="id" value={item.id} />
            
            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Nombre del Artículo</label>
                <input
                    name="name"
                    type="text"
                    required
                    defaultValue={item.name}
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
                    {barcode 
                        ? `Código actual: ${barcode}` 
                        : "Sin código - Usa \"📷 Escanear\" o \"Generar\" para asignar uno"
                    }
                </small>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Categoría</label>
                    <select 
                        name="categoryId" 
                        value={categoryId}
                        onChange={(e) => setCategoryId(parseInt(e.target.value))}
                        required 
                        style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</label>
                    <select name="locationId" defaultValue={item.locationId} required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cantidad</label>
                    <input 
                        name="quantity" 
                        type="number" 
                        min="1" 
                        defaultValue={item.quantity} 
                        required 
                        style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }} 
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Estado</label>
                    <select name="status" defaultValue={item.status} required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                        <option value="AVAILABLE">Disponible</option>
                        <option value="IN_USE">En Uso</option>
                        <option value="MAINTENANCE">Mantenimiento</option>
                        <option value="LOST">Perdido</option>
                    </select>
                </div>
            </div>

            {/* Material Configuration - Show if Material category is selected */}
            {isMaterial && (
                <div style={{ padding: "16px", background: "rgba(99, 102, 241, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600 }}>⚙️ Configuración de Material</h4>
                    
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
                                <input 
                                    name="unitsPerBox" 
                                    type="number" 
                                    min="1" 
                                    defaultValue={item.unitsPerBox || 1}
                                    style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }} 
                                />
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
            )}

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Descripción (Opcional)</label>
                <textarea 
                    name="description" 
                    rows={3} 
                    defaultValue={item.description || ''}
                    placeholder="Información adicional sobre el artículo..." 
                    style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none", resize: "vertical", minHeight: "80px" }}
                />
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "1rem", fontWeight: 600, flex: 1, minWidth: "180px" }}>
                    💾 Guardar Cambios
                </button>
            </div>
        </form>
    );
}