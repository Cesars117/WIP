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
                            <option value="" disabled selected>Selecciona una categoría</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p style={{ color: "orange", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                                ⚠️ No hay categorías. <a href="http://localhost:5555" target="_blank" style={{ color: "var(--accent-main)" }}>Crear en Prisma Studio</a>
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</label>
                        <select name="locationId" required style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                            <option value="" disabled selected>Selecciona una ubicación</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.subcategory ? `${loc.name}` : loc.name} {loc.type !== 'WAREHOUSE' && `(${loc.type})`}
                                </option>
                            ))}
                        </select>
                        {locations.length === 0 && (
                            <p style={{ color: "orange", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                                ⚠️ No hay ubicaciones. <a href="http://localhost:5555" target="_blank" style={{ color: "var(--accent-main)" }}>Crear en Prisma Studio</a>
                            </p>
                        )}
                    </div>
                </div>

                {/* Material-specific fields */}
                <div id="material-fields" style={{ display: "none" }}>
                    <div style={{ background: "rgba(99, 102, 241, 0.05)", padding: "1.5rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                        <h3 style={{ color: "var(--text-main)", marginBottom: "1rem", fontSize: "1.1rem" }}>⚙️ Configuración de Material</h3>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Tipo de Unidad</label>
                                <select name="unitType" style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}>
                                    <option value="UNIT">Unidad Individual</option>
                                    <option value="BOX">Cajas</option>
                                </select>
                            </div>
                            
                            <div id="units-per-box" style={{ display: "none" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Unidades por Caja</label>
                                <input name="unitsPerBox" type="number" min="1" placeholder="ej: 50" style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }} />
                            </div>
                            
                            <div id="total-units" style={{ display: "none", padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                <label style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>Total de Unidades</label>
                                <div id="total-display" style={{ color: "var(--success)", fontWeight: 600, fontSize: "1.1rem" }}>-</div>
                                <input name="totalUnits" type="hidden" />
                            </div>
                        </div>
                    </div>
                </div>

                <script dangerouslySetInnerHTML={{
                    __html: `
                        document.addEventListener('DOMContentLoaded', function() {
                            const categorySelect = document.querySelector('select[name="categoryId"]');
                            const materialFields = document.getElementById('material-fields');
                            const unitTypeSelect = document.querySelector('select[name="unitType"]');
                            const unitsPerBoxDiv = document.getElementById('units-per-box');
                            const totalUnitsDiv = document.getElementById('total-units');
                            const quantityInput = document.querySelector('input[name="quantity"]');
                            const unitsPerBoxInput = document.querySelector('input[name="unitsPerBox"]');
                            const totalUnitsInput = document.querySelector('input[name="totalUnits"]');
                            const totalDisplay = document.getElementById('total-display');
                            
                            function toggleMaterialFields() {
                                const selectedOption = categorySelect.options[categorySelect.selectedIndex];
                                const isMaterial = selectedOption.text === 'Material';
                                materialFields.style.display = isMaterial ? 'block' : 'none';
                            }
                            
                            function toggleUnitsPerBox() {
                                const isBox = unitTypeSelect.value === 'BOX';
                                unitsPerBoxDiv.style.display = isBox ? 'block' : 'none';
                                totalUnitsDiv.style.display = isBox ? 'block' : 'none';
                                calculateTotal();
                            }
                            
                            function calculateTotal() {
                                if (unitTypeSelect.value === 'BOX') {
                                    const quantity = parseInt(quantityInput.value) || 0;
                                    const unitsPerBox = parseInt(unitsPerBoxInput.value) || 0;
                                    const total = quantity * unitsPerBox;
                                    totalDisplay.textContent = total + ' unidades totales';
                                    totalUnitsInput.value = total;
                                } else {
                                    totalUnitsInput.value = '';
                                }
                            }
                            
                            categorySelect.addEventListener('change', toggleMaterialFields);
                            unitTypeSelect.addEventListener('change', toggleUnitsPerBox);
                            quantityInput.addEventListener('input', calculateTotal);
                            unitsPerBoxInput.addEventListener('input', calculateTotal);
                            
                            toggleMaterialFields();
                            toggleUnitsPerBox();
                        });
                    `
                }} />

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
