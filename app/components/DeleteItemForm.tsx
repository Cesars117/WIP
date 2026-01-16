'use client'

interface DeleteFormProps {
  itemId: number
  deleteItem: (formData: FormData) => Promise<void>
}

export function DeleteItemForm({ itemId, deleteItem }: DeleteFormProps) {
  return (
    <form 
      action={deleteItem} 
      onSubmit={(e) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
          e.preventDefault()
        }
      }}
      className="card"
      style={{ padding: "1.5rem", border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}
    >
      <input type="hidden" name="id" value={itemId} />
      
      <h3 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
        Zona Peligrosa
      </h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Una vez eliminado, este artículo no se puede recuperar. Esta acción es permanente.
      </p>
      
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px 24px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "var(--radius-sm)",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = "#b91c1c"}
        onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = "#dc2626"}
      >
        Eliminar Artículo Permanentemente
      </button>
    </form>
  )
}