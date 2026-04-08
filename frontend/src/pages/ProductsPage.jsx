import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import Sidebar from '../components/Sidebar';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const sortOptions = [
  { value: 'price-asc', label: 'Preis aufsteigend' },
  { value: 'price-desc', label: 'Preis absteigend' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' }
];

function ProductsPage() {
  const { addToCart, cartError } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortOption, setSortOption] = useState('price-asc');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [activeProductId, setActiveProductId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsProductsLoading(true);
      setIsCategoriesLoading(true);
      setPageError('');

      try {
        const [nextProducts, nextCategories] = await Promise.all([api.getProducts(), api.getCategories()]);
        if (!ignore) {
          setProducts(nextProducts.filter((product) => product.active !== false));
          setCategories(nextCategories);
        }
      } catch (error) {
        if (!ignore) {
          setPageError(error.message);
        }
      } finally {
        if (!ignore) {
          setIsProductsLoading(false);
          setIsCategoriesLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (cartError) {
      setFeedback({ type: 'error', message: cartError });
    }
  }, [cartError]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const normalizedMinPrice = minPrice === '' ? null : Number(minPrice);
    const normalizedMaxPrice = maxPrice === '' ? null : Number(maxPrice);

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);
      const matchesMinPrice = normalizedMinPrice === null || product.price >= normalizedMinPrice;
      const matchesMaxPrice = normalizedMaxPrice === null || product.price <= normalizedMaxPrice;
      const matchesStock = !onlyInStock || product.stock > 0;

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
    });
  }, [products, searchTerm, selectedCategories, minPrice, maxPrice, onlyInStock]);

  const sortedProducts = useMemo(() => {
    const nextProducts = [...filteredProducts];

    nextProducts.sort((left, right) => {
      switch (sortOption) {
        case 'price-desc':
          return right.price - left.price;
        case 'name-asc':
          return left.name.localeCompare(right.name, 'de', { sensitivity: 'base' });
        case 'name-desc':
          return right.name.localeCompare(left.name, 'de', { sensitivity: 'base' });
        case 'price-asc':
        default:
          return left.price - right.price;
      }
    });

    return nextProducts;
  }, [filteredProducts, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, minPrice, maxPrice, onlyInStock, pageSize, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProducts.slice(startIndex, startIndex + pageSize);
  }, [currentPage, sortedProducts, pageSize]);

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [currentPage, totalPages]);

  const activeFilterCount = selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (onlyInStock ? 1 : 0);

  function handleCategoryToggle(categoryId) {
    setSelectedCategories((current) =>
      current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId]
    );
  }

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setSortOption('price-asc');
  }

  async function handleAddToCart(product) {
    setActiveProductId(product.id);
    setFeedback({ type: '', message: '' });

    try {
      await addToCart(product.id, 1);
      setFeedback({ type: 'success', message: `${product.name} wurde deinem Warenkorb hinzugefügt.` });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setActiveProductId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        feedback={feedback}
        title="Produktübersicht"
        description="Entdecke unser Sortiment, kombiniere Suche, Kategorien und Filter und finde schneller passende Produkte."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <Sidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onResetFilters={handleResetFilters}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onlyInStock={onlyInStock}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onOnlyInStockChange={setOnlyInStock}
            isLoading={isCategoriesLoading}
            className="hidden lg:block"
          />

          <div className="space-y-6">
            <div className="sticky top-4 z-20 rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-card backdrop-blur">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Katalog</p>
                    <h2 className="text-2xl font-extrabold text-ink">Suchen, filtern, direkt vergleichen</h2>
                    <p className="text-sm text-slate-500">
                      {sortedProducts.length} Produkte gefunden
                      {activeFilterCount > 0 ? ` | ${activeFilterCount} Filter aktiv` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setIsMobileFiltersOpen((current) => !current)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {isMobileFiltersOpen ? 'Filter schliessen' : `Filter ${activeFilterCount ? `(${activeFilterCount})` : ''}`}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Zurücksetzen
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <label htmlFor="search" className="mb-2 block text-sm font-medium text-slate-600">
                      Produkte suchen
                    </label>
                    <input
                      id="search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Produktname, Beschreibung oder Kategorie"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="sort" className="mb-2 block text-sm font-medium text-slate-600">
                      Sortierung
                    </label>
                    <select
                      id="sort"
                      value={sortOption}
                      onChange={(event) => setSortOption(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {isMobileFiltersOpen ? (
              <Sidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                onResetFilters={handleResetFilters}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onlyInStock={onlyInStock}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onOnlyInStockChange={setOnlyInStock}
                isLoading={isCategoriesLoading}
                className="lg:hidden"
              />
            ) : null}

            {pageError ? (
              <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-card">
                Die Produkte konnten gerade nicht geladen werden: {pageError}
              </div>
            ) : null}

            <ProductGrid
              products={paginatedProducts}
              isLoading={isProductsLoading}
              onAddToCart={handleAddToCart}
              activeProductId={activeProductId}
            />

            {!isProductsLoading && sortedProducts.length > 0 ? (
              <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-card">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <p className="text-sm text-slate-500">
                    Seite {currentPage} von {totalPages} |{' '}
                    {Math.min((currentPage - 1) * pageSize + 1, sortedProducts.length)}-
                    {Math.min(currentPage * pageSize, sortedProducts.length)} von {sortedProducts.length}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="page-size" className="text-sm font-medium text-slate-600">
                        Produkte pro Seite
                      </label>
                      <select
                        id="page-size"
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Zurück
                    </button>

                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          pageNumber === currentPage
                            ? 'bg-ink text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Weiter
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductsPage;
