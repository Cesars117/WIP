import { getItemById, updateItem, deleteItem } from '@/app/actions'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import { DeleteItemForm } from '@/app/components/DeleteItemForm'
import { EditItemForm } from '@/app/components/EditItemForm'
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

      <h1 className="heading-xl">Editar ArtÃ­culo</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Modifica los datos del artÃ­culo: <strong>{item.name}</strong> - Escanea o genera un cÃ³digo de barras Ãºnico
      </p>
      
      <EditItemForm 
        item={item}
        categories={categories}
        locations={locations}
        updateItem={updateItem}
      />

      <div style={{ maxWidth: "600px", marginTop: "2rem" }}>
        <DeleteItemForm itemId={item.id} deleteItem={deleteItem} />
      </div>
    </main>
  )
}
