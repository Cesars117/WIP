import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function BulkEntry() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">🚨 Recuperación Urgente de Datos</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">⚠️ Datos perdidos durante migración</h2>
        <p className="text-red-700">Se perdieron 125 artículos del inventario. Use este formulario para reingreso rápido.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Formulario de entrada rápida */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">📝 Entrada Rápida Individual</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del artículo</label>
              <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option value="AVAILABLE">Disponible</option>
                  <option value="IN_USE">En uso</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="LOST">Perdido</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              ➕ Agregar Artículo
            </button>
          </form>
        </div>

        {/* Entrada masiva con CSV */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">📄 Entrada Masiva (CSV)</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato CSV (nombre,sku,categoria,ubicacion,estado):
            </label>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <div>Taladro DeWalt,DW001,Electric-Tool,8 Floor NRG,AVAILABLE</div>
              <div>Cable Ethernet,ETH001,Cable,Almacen Principal,AVAILABLE</div>
              <div>Martillo,MAR001,Manual-Tool,8 Floor NRG,IN_USE</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Pegar datos CSV</label>
            <textarea 
              rows={10} 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
              placeholder="Pega aquí tus datos en formato CSV..."
            />
          </div>
          
          <button type="button" className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
            📊 Procesar CSV
          </button>
        </div>
      </div>
      
      {/* Lista de artículos por agregar */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">📋 Lista de Artículos Pendientes</h3>
        <div className="text-gray-500">Los artículos se mostrarán aquí antes de confirmar...</div>
      </div>
      
      {/* Categorías y ubicaciones existentes */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">📂 Categorías existentes:</h4>
          <div className="text-sm text-blue-600 mt-2">
            Electric-Tool • Manual-Tool • Material
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">📍 Ubicaciones existentes:</h4>
          <div className="text-sm text-green-600 mt-2">
            8 Floor NRG • Astrodome • Memorial • Center NRG
          </div>
        </div>
      </div>
    </div>
  );
}