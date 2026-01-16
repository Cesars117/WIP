import { getItemById, updateItem, deleteItem } from '@/app/actions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: Props) {
  const { id } = await params
  const item = await getItemById(parseInt(id))

  if (!item) {
    redirect('/')
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Item</h1>
      
      <form action={updateItem} className="space-y-4 mb-6">
        <input type="hidden" name="id" value={item.id} />
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={item.name}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            defaultValue={item.barcode || ''}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={item.category.id}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            <option value="1">Equipment</option>
            <option value="2">Material</option>
            <option value="3">Tool</option>
          </select>
        </div>

        <div>
          <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            id="locationId"
            name="locationId"
            defaultValue={item.location.id}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a location</option>
            <option value="1">8th Floor - Box 1</option>
            <option value="2">8th Floor - Box 2</option>
            <option value="3">8th Floor - Personal Milwaukee Box</option>
            <option value="4">8th Floor - Mesa Principal</option>
            <option value="5">8th Floor - Area General</option>
            <option value="6">Vehicle 1</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={item.status}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            defaultValue={item.quantity}
            min="0"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {item.category.name === 'Material' && (
          <>
            <div>
              <label htmlFor="unitType" className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
              <select
                id="unitType"
                name="unitType"
                defaultValue={item.unitType || 'units'}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="units">Units</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>

            <div>
              <label htmlFor="unitsPerBox" className="block text-sm font-medium text-gray-700 mb-1">Units per Box</label>
              <input
                type="number"
                id="unitsPerBox"
                name="unitsPerBox"
                defaultValue={item.unitsPerBox || 1}
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
              <div className="text-gray-600">
                {item.unitType === 'boxes' 
                  ? `${item.quantity} boxes × ${item.unitsPerBox || 1} = ${item.totalUnits}`
                  : `${item.totalUnits}`}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Update Item
        </button>
      </form>

      <form action={deleteItem} onSubmit={(e) => {
        if (!confirm('Are you sure you want to delete this item?')) {
          e.preventDefault()
        }
      }}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete Item
        </button>
      </form>
    </div>
  )
}
