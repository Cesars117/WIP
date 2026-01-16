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
        if (!confirm('Are you sure you want to delete this item?')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={itemId} />
      <button
        type="submit"
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Delete Item
      </button>
    </form>
  )
}