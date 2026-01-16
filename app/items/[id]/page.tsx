import { getItemById, updateItem, deleteItem } from '@/app/actions'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import { DeleteItemForm } from '@/app/components/DeleteItemForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: Props) {
  const { id } = await params
  const [item, categories, locations] = await Promise.all([
    getItemById(parseInt(id)),
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.location.findMany({ orderBy: { name: 'asc' } })
  ])

  if (!item) {
    redirect('/')
  }

  return (
    <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "2rem", textDecoration: "none" }}>
        <ArrowLeft size={20} />
        Volver al Panel
      </Link>

      <h1 className="heading-xl">Editar Artículo</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Modifica los datos del artículo: <strong>{item.name}</strong></p>
      
      <form action={updateItem} className="card" style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <input type="hidden" name="id" value={item.id} />
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Nombre del Artículo</label>
          <input
            type="text"
            name="name"
            defaultValue={item.name}
            required
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Código de Barras</label>
          <input
            type="text"
            name="barcode"
            defaultValue={item.barcode || ''}
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          />
          <small style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "block", marginTop: "0.5rem" }}>
            Opcional - Debe ser único si se especifica.
          </small>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Categoría</label>
          <select
            name="categoryId"
            defaultValue={item.category.id}
            required
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Ubicación</label>
          <select
            name="locationId"
            defaultValue={item.location.id}
            required
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          >
            <option value="">Selecciona una ubicación</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Estado</label>
          <select
            name="status"
            defaultValue={item.status}
            required
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="IN_USE">En Uso</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="LOST">Perdido</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cantidad</label>
          <input
            type="number"
            name="quantity"
            defaultValue={item.quantity}
            min="0"
            required
            style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
          />
        </div>

        {item.category.name === 'Material' && (
          <>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Tipo de Unidad</label>
              <select
                name="unitType"
                defaultValue={item.unitType || 'units'}
                style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
              >
                <option value="units">Unidades</option>
                <option value="boxes">Cajas</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Unidades por Caja</label>
              <input
                type="number"
                name="unitsPerBox"
                defaultValue={item.unitsPerBox || 1}
                min="1"
                style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
            </div>

            <div style={{ padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>Total de Unidades</label>
              <div style={{ color: "var(--text-main)", fontWeight: 600 }}>
                {item.unitType === 'boxes' 
                  ? `${item.quantity} cajas × ${item.unitsPerBox || 1} = ${item.totalUnits} unidades`
                  : `${item.totalUnits} unidades`}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px 24px" }}
        >
          Actualizar Artículo
        </button>
      </form>

      <div style={{ maxWidth: "600px", marginTop: "1rem" }}>
        <DeleteItemForm itemId={item.id} deleteItem={deleteItem} />
      </div>
    </main>
  )
}
