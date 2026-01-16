import { getItemById, updateItem, deleteItem } from "@/app/actions";
import { BarcodeGeneratorButton } from "@/app/components/BarcodeGeneratorButton";
import db from "@/lib/db";
import Link from 'next/link';
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function EditItemPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const item = await getItemById(id);
    const categories = await db.category.findMany();
    const locations = await db.location.findMany();

    if (!item) {
        return (
            <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "2rem", textDecoration: "none" }}>
                    <ArrowLeft size={20} />
                    Volver al Panel
                </Link>
                <p style={{ color: "var(--text-secondary)" }}>Artículo no encontrado.</p>
            </main>
        );
    }

    const isMaterial = categories.find(c => c.id === item.categoryId)?.name === 'Material';

    return (
        <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "2rem", textDecoration: "none" }}>
                <ArrowLeft size={20} />
                Volver al Panel
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="heading-xl">Editar Artículo</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Modifica los detalles del artículo en el inventario.</p>
                </div>
                <form action={deleteItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" style={{ padding: "8px 16px", background: "var(--error)", color: "white", border: "none", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                </form>
            </div>

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
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <input
                            name="barcode"
                            id="barcode-input"
                            type="text"
                            defaultValue={item.barcode || ''}
                            placeholder="Escanea o ingresa el código"
                            style={{ flex: 1, padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
                        />
                        <BarcodeGeneratorButton />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Categoría</label>
                        <select name="categoryId" required defaultValue={item.categoryId} style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</label>
                        <select name="locationId" required defaultValue={item.locationId} style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.subcategory ? loc.name : loc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Material-specific fields */}
                <div id="material-fields" style={{ display: isMaterial ? "block" : "none" }}>
                    <div style={{ background: "rgba(99, 102, 241, 0.05)", padding: "1.5rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                        <h3 style={{ color: "var(--text-main)", marginBottom: "1rem", fontSize: "1.1rem" }}>⚙️ Configuración de Material</h3>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Tipo de Unidad</label>
                                <select name="unitType" defaultValue={item.unitType || 'UNIT'} style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                                    <option value="UNIT">Unidad Individual</option>
                                    <option value="BOX">Cajas</option>
                                </select>
                            </div>
                            
                            <div id="units-per-box" style={{ display: item.unitType === 'BOX' ? 'block' : 'none' }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Unidades por Caja</label>
                                <input name="unitsPerBox" type="number" min="1" defaultValue={item.unitsPerBox || ''} placeholder="ej: 50" style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }} />
                            </div>
                            
                            <div id="total-units" style={{ display: item.unitType === 'BOX' ? 'block' : 'none', padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                <label style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>Total de Unidades</label>
                                <div id="total-display" style={{ color: "var(--success)", fontWeight: 600, fontSize: "1.1rem" }}>
                                    {item.totalUnits || '-'}
                                </div>
                                <input name="totalUnits" type="hidden" defaultValue={item.totalUnits || ''} />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cantidad</label>
                        <input
                            name="quantity"
                            type="number"
                            defaultValue={item.quantity}
                            min="0"
                            required
                            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Estado</label>
                        <select name="status" defaultValue={item.status} style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                            <option value="AVAILABLE">Disponible</option>
                            <option value="IN_USE">En Uso</option>
                            <option value="MAINTENANCE">Mantenimiento</option>
                            <option value="LOST">Perdido</option>
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ marginTop: "1rem" }}
                >
                    Actualizar Artículo
                </button>
            </form>
        </main>
    );
}