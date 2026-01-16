import { Package, MapPin, Search, BarChart3, Plus, Edit } from "lucide-react";
import { getDashboardStats, seedInitialData, getItems } from "./actions";
import Link from 'next/link';

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: { query?: string, view?: string } }) {
  // Auto-seed on first load solo si no es build time (simplification for this phase)
  if (process.env.NODE_ENV !== 'production') {
    await seedInitialData();
  }

  const query = searchParams.query || '';
  const view = searchParams.view || '';
  
  const [{ itemCount, locationCount, totalValue, recentItems, categorizedItems, locationItems }, allItems] = await Promise.all([
    getDashboardStats(),
    query ? getItems(query) : Promise.resolve([])
  ]);

  // Determinar qué items mostrar basado en la vista y búsqueda
  let displayItems = recentItems;
  let sectionTitle = 'Inventario Reciente';
  
  if (query) {
    displayItems = allItems;
    sectionTitle = `Resultados de Búsqueda (${displayItems.length})`;
  } else if (view === 'categories') {
    displayItems = categorizedItems || [];
    sectionTitle = 'Artículos por Categoría';
  } else if (view === 'locations') {
    displayItems = locationItems || [];
    sectionTitle = 'Artículos por Ubicación';
  }

  return (
    <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      {/* Header Section */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h1 className="heading-xl">Panel de Control</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Bienvenido al sistema de inventario Integrale</p>
        </div>
        <Link href="/items/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={20} />
          Nuevo Artículo
        </Link>
      </header>

      {/* Stats Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <Link href="/?view=categories" className="card" style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>Total Artículos</p>
              <h3 className="heading-lg" style={{ marginTop: "0.5rem" }}>{itemCount}</h3>
              <p style={{ color: "var(--primary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>Ver por categorías →</p>
            </div>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "10px", borderRadius: "8px", color: "var(--primary)" }}>
              <Package size={24} />
            </div>
          </div>
        </Link>

        <Link href="/?view=locations" className="card" style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>Ubicaciones Activas</p>
              <h3 className="heading-lg" style={{ marginTop: "0.5rem" }}>{locationCount}</h3>
              <p style={{ color: "var(--success)", fontSize: "0.75rem", marginTop: "0.25rem" }}>Ver por ubicaciones →</p>
            </div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px", color: "var(--success)" }}>
              <MapPin size={24} />
            </div>
          </div>
        </Link>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>Valor Estimado</p>
              <h3 className="heading-lg" style={{ marginTop: "0.5rem" }}>${totalValue}</h3>
            </div>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "10px", borderRadius: "8px", color: "var(--warning)" }}>
              <BarChart3 size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Preview */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="heading-lg">{sectionTitle}</h2>
          <form method="GET" style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              name="query"
              placeholder="Buscar por nombre, categoría, barcode..."
              defaultValue={query}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-light)",
                padding: "10px 16px 10px 40px",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-main)",
                outline: "none",
                minWidth: "300px"
              }}
            />
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {displayItems.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
              {query ? `No se encontraron artículos con "${query}".` : 'No hay artículos recientes. Agrega uno nuevo para comenzar.'}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Código de Barras</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Categoría</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Cantidad</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Estado</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "16px 24px", fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {item.barcode ? (
                        <span style={{ background: "rgba(99, 102, 241, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                          {item.barcode}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{item.category.name}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{item.location.name}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{item.quantity}</span>
                        {item.unitType === 'BOX' && item.unitsPerBox && (
                          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {item.unitsPerBox} u/caja = <strong>{item.totalUnits || (item.quantity * item.unitsPerBox)}</strong> unidades
                          </div>
                        )}
                        {item.unitType === 'UNIT' && (
                          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>unidades</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "var(--success)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <Link href={`/items/${item.id}`} style={{ color: "var(--primary)", cursor: "pointer", textDecoration: "none" }}>
                        <Edit size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
