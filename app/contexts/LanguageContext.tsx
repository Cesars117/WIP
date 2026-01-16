'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage on first render
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        return savedLanguage
      }
    }
    return 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string): string => {
    const translations = language === 'en' ? enTranslations : esTranslations
    const keys = key.split('.')
    let value: Record<string, unknown> | string = translations

    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[k] as Record<string, unknown> | string
      } else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// English translations
const enTranslations = {
  common: {
    search: 'Search',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    loading: 'Loading...',
    saving: 'Saving...',
    error: 'Error',
    success: 'Success',
    quantity: 'Quantity',
    status: 'Status',
    category: 'Category',
    location: 'Location',
    barcode: 'Barcode',
    name: 'Name',
    description: 'Description',
  },
  nav: {
    dashboard: 'Dashboard',
    items: 'Items',
    locations: 'Locations',
    categories: 'Categories',
  },
  search: {
    placeholder: 'Search items...',
    scanBarcode: 'Scan Barcode',
  },
  scanner: {
    title: 'Barcode Scanner',
    instructions: 'Point your camera at a barcode',
    permissionDenied: 'Camera permissions are denied. Enable them in browser settings.',
    cameraError: 'Error accessing camera',
    retry: 'Retry',
    close: 'Close Scanner',
    initializing: 'Initializing camera...',
    unsupported: 'getUserMedia is not available in this browser',
    mobileDetected: 'Mobile detected: skipping permission pre-check',
  },
  scanResult: {
    found: 'Item Found!',
    notFound: 'Code Not Found',
    code: 'Code',
    viewDetails: 'View Details',
    createNew: 'Create New Item',
    addToExisting: 'Add to Existing Item',
    notRegistered: 'This code is not registered. What would you like to do?',
  },
  addBarcodeModal: {
    title: 'Add Code to Item',
    codeToAssign: 'Code to assign',
    searchPlaceholder: 'Search items...',
    noItems: 'No items found',
    hasCode: 'Already has code',
    assign: 'Assign Code',
  },
  newItem: {
    title: 'New Item',
    createItem: 'Create Item',
    name: 'Item Name',
    namePlaceholder: 'Enter item name',
    description: 'Description',
    descriptionPlaceholder: 'Enter description (optional)',
    category: 'Category',
    selectCategory: 'Select a category',
    location: 'Location',
    selectLocation: 'Select a location',
    quantity: 'Quantity',
    status: 'Status',
    barcode: 'Barcode',
    barcodePlaceholder: 'Enter or scan barcode',
    generateBarcode: 'Generate Barcode',
    scanBarcode: 'Scan Barcode',
    autoGenerate: 'Auto-generate unique barcode',
    materialConfig: 'Material Configuration',
    unitType: 'Unit Type',
    selectUnitType: 'Select unit type',
    unit: 'Unit',
    box: 'Box',
    unitsPerBox: 'Units per Box',
    totalUnits: 'Total Units',
  },
  editItem: {
    title: 'Edit Item',
    updateItem: 'Update Item',
    currentBarcode: 'Current barcode',
    noBarcode: 'No barcode assigned',
  },
  itemDetails: {
    editItem: 'Edit Item',
    deleteItem: 'Delete Item',
    confirmDelete: 'Are you sure you want to delete this item?',
    sku: 'SKU',
    createdAt: 'Created',
    updatedAt: 'Updated',
  },
  status: {
    AVAILABLE: 'Available',
    IN_USE: 'In Use',
    MAINTENANCE: 'Maintenance',
    LOST: 'Lost',
  },
  dashboard: {
    title: 'WIP Dashboard',
    welcome: 'Welcome to Integrale Inventory System',
    totalItems: 'Total Items',
    activeLocations: 'Active Locations',
    estimatedValue: 'Estimated Value',
    recentInventory: 'Recent Inventory',
    itemsByCategory: 'Items by Category',
    itemsByLocation: 'Items by Location',
    searchResults: 'Search Results',
    newArticle: 'New Item',
    viewByCategories: 'View by categories →',
    viewByLocations: 'View by locations →',
    noItems: 'No recent items. Add a new one to get started.',
    noSearchResults: 'No items found with',
    actions: 'Actions',
    units: 'units',
    unitsPerBox: 'u/box',
  },
}

// Spanish translations
const esTranslations = {
  common: {
    search: 'Buscar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    create: 'Crear',
    loading: 'Cargando...',
    saving: 'Guardando...',
    error: 'Error',
    success: 'Éxito',
    quantity: 'Cantidad',
    status: 'Estado',
    category: 'Categoría',
    location: 'Ubicación',
    barcode: 'Código de Barras',
    name: 'Nombre',
    description: 'Descripción',
  },
  nav: {
    dashboard: 'Dashboard',
    items: 'Items',
    locations: 'Ubicaciones',
    categories: 'Categorías',
  },
  search: {
    placeholder: 'Buscar items...',
    scanBarcode: 'Escanear Código',
  },
  scanner: {
    title: 'Escáner de Códigos',
    instructions: 'Apunta tu cámara a un código de barras',
    permissionDenied: 'Los permisos de cámara están denegados. Habilítalos en la configuración del navegador.',
    cameraError: 'Error al acceder a la cámara',
    retry: 'Reintentar',
    close: 'Cerrar Escáner',
    initializing: 'Inicializando cámara...',
    unsupported: 'getUserMedia no está disponible en este navegador',
    mobileDetected: 'Móvil detectado: omitiendo verificación previa de permisos',
  },
  scanResult: {
    found: '¡Item Encontrado!',
    notFound: 'Código no encontrado',
    code: 'Código',
    viewDetails: 'Ver Detalles',
    createNew: 'Crear Nuevo Item',
    addToExisting: 'Agregar a Item Existente',
    notRegistered: 'Este código no está registrado. ¿Qué deseas hacer?',
  },
  addBarcodeModal: {
    title: 'Agregar Código a Item',
    codeToAssign: 'Código a asignar',
    searchPlaceholder: 'Buscar items...',
    noItems: 'No se encontraron items',
    hasCode: 'Ya tiene código',
    assign: 'Asignar Código',
  },
  newItem: {
    title: 'Nuevo Item',
    createItem: 'Crear Item',
    name: 'Nombre del Item',
    namePlaceholder: 'Ingresa el nombre del item',
    description: 'Descripción',
    descriptionPlaceholder: 'Ingresa una descripción (opcional)',
    category: 'Categoría',
    selectCategory: 'Selecciona una categoría',
    location: 'Ubicación',
    selectLocation: 'Selecciona una ubicación',
    quantity: 'Cantidad',
    status: 'Estado',
    barcode: 'Código de Barras',
    barcodePlaceholder: 'Ingresa o escanea el código',
    generateBarcode: 'Generar Código',
    scanBarcode: 'Escanear Código',
    autoGenerate: 'Auto-generar código único',
    materialConfig: 'Configuración de Material',
    unitType: 'Tipo de Unidad',
    selectUnitType: 'Selecciona el tipo de unidad',
    unit: 'Unidad',
    box: 'Caja',
    unitsPerBox: 'Unidades por Caja',
    totalUnits: 'Unidades Totales',
  },
  editItem: {
    title: 'Editar Item',
    updateItem: 'Actualizar Item',
    currentBarcode: 'Código actual',
    noBarcode: 'Sin código asignado',
  },
  itemDetails: {
    editItem: 'Editar Item',
    deleteItem: 'Eliminar Item',
    confirmDelete: '¿Estás seguro de que deseas eliminar este item?',
    sku: 'SKU',
    createdAt: 'Creado',
    updatedAt: 'Actualizado',
  },
  status: {
    AVAILABLE: 'Disponible',
    IN_USE: 'En Uso',
    MAINTENANCE: 'Mantenimiento',
    LOST: 'Perdido',
  },
  dashboard: {
    title: 'WIP Panel de Control',
    welcome: 'Bienvenido al sistema de inventario Integrale',
    totalItems: 'Total Artículos',
    activeLocations: 'Ubicaciones Activas',
    estimatedValue: 'Valor Estimado',
    recentInventory: 'Inventario Reciente',
    itemsByCategory: 'Artículos por Categoría',
    itemsByLocation: 'Artículos por Ubicación',
    searchResults: 'Resultados de Búsqueda',
    newArticle: 'Nuevo Artículo',
    viewByCategories: 'Ver por categorías →',
    viewByLocations: 'Ver por ubicaciones →',
    noItems: 'No hay artículos recientes. Agrega uno nuevo para comenzar.',
    noSearchResults: 'No se encontraron artículos con',
    actions: 'Acciones',
    units: 'unidades',
    unitsPerBox: 'u/caja',
  },
}
