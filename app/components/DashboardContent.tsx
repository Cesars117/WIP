'use client'

import { Package, MapPin, BarChart3, Plus, Edit } from "lucide-react";
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { SearchModal } from './SearchModal';
import { useState } from 'react';

interface Item {
  id: number;
  name: string;
  description: string | null;
  barcode: string | null;
  quantity: number;
  status: string;
  unitType: string | null;
  unitsPerBox: number | null;
  totalUnits: number | null;
  sku: string | null;
  category: { name: string };
  location: { name: string };
}

// Wrapper component to manage modal state - key prop on this resets the state on query change
function SearchModalWrapper({ items, query }: { items: Item[], query: string }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <SearchModal
      items={items}
      query={query}
      onClose={() => setIsOpen(false)}
    />
  );
}

interface DashboardContentProps {
  itemCount: number;
  locationCount: number;
  totalValue: number;
  displayItems: Item[];
  sectionTitleKey: string;
  query?: string;
}

export function DashboardContent({ 
  itemCount, 
  locationCount, 
  totalValue, 
  displayItems,
  sectionTitleKey,
  query 
}: DashboardContentProps) {
  const { t } = useLanguage();
  const [selectedTableItem, setSelectedTableItem] = useState<Item | null>(null);

  const getSectionTitle = () => {
    if (query) {
      return `${t('dashboard.searchResults')} (${displayItems.length})`;
    }
    return t(sectionTitleKey);
  };

  return (
    <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      {/* Header Section */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h1 className="heading-xl">{t('dashboard.title')}</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>{t('dashboard.welcome')}</p>
        </div>
        <Link href="/items/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={20} />
          {t('dashboard.newArticle')}
        </Link>
      </header>

      {/* Stats Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <Link href="/?view=categories" className="card" style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>{t('dashboard.totalItems')}</p>
              <h3 className="heading-lg" style={{ marginTop: "0.5rem" }}>{itemCount}</h3>
              <p style={{ color: "var(--primary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{t('dashboard.viewByCategories')}</p>
            </div>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "10px", borderRadius: "8px", color: "var(--primary)" }}>
              <Package size={24} />
            </div>
          </div>
        </Link>

        <Link href="/?view=locations" className="card" style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>{t('dashboard.activeLocations')}</p>
              <h3 className="heading-lg" style={{ marginTop: "0.5rem" }}>{locationCount}</h3>
              <p style={{ color: "var(--success)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{t('dashboard.viewByLocations')}</p>
            </div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px", color: "var(--success)" }}>
              <MapPin size={24} />
            </div>
          </div>
        </Link>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>{t('dashboard.estimatedValue')}</p>
              <h3 className="heading-lg" style={{ marginTop: "0.5rem" }}>${totalValue}</h3>
            </div>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "10px", borderRadius: "8px", color: "var(--warning)" }}>
              <BarChart3 size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Preview */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="heading-lg">{getSectionTitle()}</h2>
        </div>

        {/* Show search modal when there's a query - key prop forces new instance on query change */}
        {query && displayItems.length > 0 && (
          <SearchModalWrapper
            key={query}
            items={displayItems}
            query={query}
          />
        )}

        {/* Table view for non-search results */}
        {!query && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {displayItems.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
                {t('dashboard.noItems')}
              </div>
            ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>{t('common.name')}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>{t('common.barcode')}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>{t('common.category')}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>{t('common.location')}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>{t('common.quantity')}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>{t('common.status')}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500, textAlign: "center" }}>{t('dashboard.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedTableItem(item)}
                    style={{ 
                      borderBottom: "1px solid var(--border-light)",
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: "16px 24px", fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {item.barcode ? (
                        <span style={{ background: "rgba(99, 102, 241, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                          {item.barcode}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{item.category.name}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{item.location.name}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>
                          {(item.unitType === 'BOX' && item.unitsPerBox && typeof item.unitsPerBox === 'number')
                            ? (item.totalUnits || (item.quantity * item.unitsPerBox))
                            : (item.quantity || 0)
                          }
                        </span>
                        {(item.unitType === 'BOX' && item.unitsPerBox && typeof item.unitsPerBox === 'number') && (
                          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {item.quantity} {t('dashboard.boxes')} × {item.unitsPerBox} = {item.totalUnits || (item.quantity * item.unitsPerBox)} {t('dashboard.units')}
                          </div>
                        )}
                        {item.unitType === 'UNIT' && (
                          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{t('dashboard.units')}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "var(--success)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}>
                        {t(`status.${item.status}`)}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <Link href={`/items/${item.id}`} style={{ color: "var(--primary)", cursor: "pointer", textDecoration: "none" }}>
                        <Edit size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
        )}
      </section>

      {/* Item Details Modal for table clicks */}
      {selectedTableItem && (
        <SearchModal
          items={[selectedTableItem]}
          query={selectedTableItem.name}
          onClose={() => setSelectedTableItem(null)}
        />
      )}
    </main>
  );
}
