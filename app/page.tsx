import { getDashboardStats, seedInitialData, getItems } from "./actions";
import { SearchBar } from "./components/SearchBar";
import { DashboardContent } from "./components/DashboardContent";

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string, view?: string }> }) {
  // Auto-seed on first load solo si no es build time (simplification for this phase)
  if (process.env.NODE_ENV !== 'production') {
    await seedInitialData();
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || '';
  const view = resolvedSearchParams.view || '';
  
  const [{ itemCount, locationCount, totalValue, recentItems, categorizedItems, locationItems }, allItems] = await Promise.all([
    getDashboardStats(),
    query ? getItems(query) : Promise.resolve([])
  ]);

  // Determinar qué items mostrar basado en la vista y búsqueda
  let displayItems = recentItems;
  let sectionTitleKey = 'dashboard.recentInventory';
  
  if (query) {
    displayItems = allItems;
    sectionTitleKey = 'dashboard.searchResults';
  } else if (view === 'categories') {
    displayItems = categorizedItems || [];
    sectionTitleKey = 'dashboard.itemsByCategory';
  } else if (view === 'locations') {
    displayItems = locationItems || [];
    sectionTitleKey = 'dashboard.itemsByLocation';
  }

  return (
    <>
      <SearchBar />
      <DashboardContent
        itemCount={itemCount}
        locationCount={locationCount}
        totalValue={totalValue}
        displayItems={displayItems}
        sectionTitleKey={sectionTitleKey}
        query={query}
      />
    </>
  );
}
