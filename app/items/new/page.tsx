import { createItem } from "@/app/actions";
import { BarcodeGeneratorButton } from "@/app/components/BarcodeGeneratorButton";
import db from "@/lib/db";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

export default async function NewItemPage() {
    const categories = await db.category.findMany();
    const locations = await db.location.findMany();

    return (
        <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "2rem", textDecoration: "none" }}>
                <ArrowLeft size={20} />
                Volver al Panel
            </Link>

            <h1 className="heading-xl">Nuevo Artículo</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Registra una nueva herramienta o material en el inventario.</p>

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
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <input
                            name="barcode"
                            id="barcode-input"
                            type="text"
                            placeholder="Escanea o ingresa el código"
                            style={{ flex: 1, padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
                        />
                        <BarcodeGeneratorButton />
                    </div>
                    <small style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "block", marginTop: "0.5rem" }}>
                        Opcional - Debe ser único. Usa &quot;Generar&quot; para crear uno automático.
                    </small>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Categoría</label>
                        <select name="categoryId" required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</label>
                        <select name="locationId" required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
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
                            defaultValue="1"
                            min="0"
                            required
                            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Estado</label>
                        <select name="status" style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
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
                    Registrar Artículo
                </button>
            </form>
        </main>
    );
}
