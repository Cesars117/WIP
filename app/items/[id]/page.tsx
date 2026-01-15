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

    return (
        <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "2rem", textDecoration: "none" }}>
                <ArrowLeft size={20} />
                Volver al Panel
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="heading-xl">Editar Artículo</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Actualiza la información del artículo.</p>
                </div>
                <form
                    action={async () => {
                        'use server'
                        await deleteItem(id);
                    }}
                    style={{ margin: 0 }}
                    onSubmit={(e) => {
                        if (!confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <button
                        type="submit"
                        style={{
                            padding: "10px 16px",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#dc2626",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Trash2 size={18} />
                        Eliminar
                    </button>
                </form>
            </div>

            <form action={updateItem} className="card" style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <input type="hidden" name="id" value={id} />

                <div id="error-message" style={{ display: "none", padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#dc2626", borderRadius: "var(--radius-sm)" }}></div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Nombre del Artículo</label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={item.name}
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
                            defaultValue={(item as any).barcode || ''}
                            placeholder="Código de barras"
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

                <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                    Guardar Cambios
                </button>
            </form>
        </main>
    );
}
