'use client'

import { generateUniqueBarcode } from "@/app/actions"

export function BarcodeGeneratorButton() {
    return (
        <button
            type="button"
            onClick={async (e) => {
                e.preventDefault()
                try {
                    const barcode = await generateUniqueBarcode()
                    const input = document.getElementById('barcode-input') as HTMLInputElement
                    if (input) input.value = barcode
                } catch (err) {
                    alert('Error al generar código')
                }
            }}
            style={{
                padding: "12px 16px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--primary)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap"
            }}
        >
            Generar
        </button>
    )
}
