'use client';

import { useState } from 'react';
import { exportToCSV, createManualBackup } from '@/app/actions';

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportToCSV();
      if (result.success) {
        // Crear y descargar el archivo CSV
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', result.filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setMessage(`✅ CSV exportado exitosamente (${result.count} artículos)`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error exportando: ${error}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await createManualBackup();
      if (result.success) {
        setMessage(
          `✅ Backup creado exitosamente
📊 ${result.counts.items} artículos
📂 ${result.counts.categories} categorías  
📍 ${result.counts.locations} ubicaciones
📁 Guardado en: backups/`
        );
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error creando backup: ${error}`);
    } finally {
      setIsBackingUp(false);
      setTimeout(() => setMessage(''), 10000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ Backup y Protección de Datos</h1>
        <p className="text-gray-600">Sistema de respaldo para proteger tu inventario</p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-blue-800">{message}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export CSV */}
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">📤</div>
            <h3 className="text-xl font-semibold">Exportar CSV</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Descarga todos tus artículos en formato CSV para tener una copia local
          </p>
          
          <div className="bg-gray-50 p-3 rounded text-sm mb-4">
            <strong>Incluye:</strong><br/>
            • Nombre, SKU, descripción<br/>
            • Estado, categoría, ubicación<br/>
            • Fecha de creación
          </div>
          
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '🔄 Exportando...' : '📥 Descargar CSV'}
          </button>
        </div>

        {/* Backup completo */}
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">💾</div>
            <h3 className="text-xl font-semibold">Backup Completo</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Crea un respaldo completo con estructura de base de datos para restauración
          </p>
          
          <div className="bg-gray-50 p-3 rounded text-sm mb-4">
            <strong>Incluye:</strong><br/>
            • Todos los artículos con IDs<br/>
            • Categorías y ubicaciones<br/>
            • Script de restauración automática
          </div>
          
          <button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBackingUp ? '🔄 Creando backup...' : '💾 Crear Backup'}
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup automático */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center mb-3">
            <div className="text-2xl mr-3">⏰</div>
            <h4 className="text-lg font-semibold text-yellow-800">Backup Automático</h4>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            El sistema crea backups automáticamente cada día para proteger tus datos.
          </p>
          <div className="text-xs text-yellow-600">
            📁 Ubicación: <code>/backups/backup-YYYY-MM-DD.json</code>
          </div>
        </div>

        {/* Procedimientos seguros */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center mb-3">
            <div className="text-2xl mr-3">⚠️</div>
            <h4 className="text-lg font-semibold text-red-800">Procedimientos Seguros</h4>
          </div>
          <p className="text-red-700 text-sm mb-3">
            SIEMPRE crear backup antes de:
          </p>
          <ul className="text-xs text-red-600 space-y-1">
            <li>• Migraciones de base de datos</li>
            <li>• Actualizaciones del sistema</li>
            <li>• Cambios en el esquema</li>
            <li>• Deploy a producción</li>
          </ul>
        </div>
      </div>
    </div>
  );
}