'use client';

import { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { Search, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [scannerOpen, setScannerOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleBarcodeScanned = (code: string) => {
        console.log('Barcode scanned:', code);
        setSearchQuery(code);
        setScannerOpen(false);
        
        // Buscar automáticamente cuando se escanea un código
        router.push(`/?query=${encodeURIComponent(code)}`);
    };

    return (
        <>
            <style jsx>{`
                @media (max-width: 640px) {
                    .search-form {
                        flex-direction: column;
                        gap: 12px !important;
                    }
                    .search-buttons {
                        display: flex;
                        gap: 8px;
                        width: 100%;
                    }
                    .search-buttons button {
                        flex: 1;
                        justify-content: center;
                    }
                }
            `}</style>
            <form 
                onSubmit={handleSearch}
                className="search-form"
                style={{ 
                    display: "flex", 
                    gap: "8px", 
                    marginBottom: "2rem",
                    alignItems: "stretch",
                    flexWrap: "wrap"
                }}
            >
                <div style={{ 
                    position: "relative", 
                    flex: 1, 
                    minWidth: "200px" 
                }}>
                    <Search 
                        size={20} 
                        style={{ 
                            position: "absolute", 
                            left: "12px", 
                            top: "50%", 
                            transform: "translateY(-50%)", 
                            color: "var(--text-secondary)" 
                        }} 
                    />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código de barras, categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 12px 12px 44px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--text-main)",
                            outline: "none"
                        }}
                    />
                </div>
                
                <div className="search-buttons" style={{ display: "flex", gap: "8px" }}>
                    <button
                        type="button"
                        onClick={() => setScannerOpen(true)}
                        style={{
                            padding: "12px 16px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "500",
                            whiteSpace: "nowrap"
                        }}
                        title="Escanear código de barras"
                    >
                        <Camera size={20} />
                        <span style={{ 
                            display: "inline-block",
                            minWidth: "max-content"
                        }}>
                            Escanear
                        </span>
                    </button>

                    <button
                        type="submit"
                        style={{
                            padding: "12px 20px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--text-main)",
                            cursor: "pointer",
                            fontWeight: "500",
                            whiteSpace: "nowrap"
                        }}
                    >
                        Buscar
                    </button>
                </div>
            </form>

            {scannerOpen && (
                <BarcodeScanner
                    onCodeScanned={handleBarcodeScanned}
                    onClose={() => setScannerOpen(false)}
                />
            )}
        </>
    );
}