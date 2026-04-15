import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const sortOptions = [
  { value: 'price-asc', label: 'Preis aufsteigend' },
  { value: 'price-desc', label: 'Preis absteigend' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' }
];

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, cartError } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortOption, setSortOption] = useState('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [activeProductId, setActiveProductId] = useState(null);
  const searchTerm = searchParams.get('q') ?? '';

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

  const activeCategoryNames = useMemo(
    () =>
      categories
        .filter((category) => selectedCategories.includes(category.id))
        .map((category) => category.name),
    [categories, selectedCategories]
  );

  function handleCategoryToggle(categoryId) {
    setSelectedCategories((current) =>
      current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId]
    );
  }

  function handleResetFilters() {
    setSearchParams({});
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
      setFeedback({ type: 'success', message: `${product.name} wurde deinem Warenkorb hinzugefuegt.` });
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
        title="Produktuebersicht"
        description="Entdecke unser Sortiment, kombiniere Suche, Kategorien und Filter und finde schneller passende Produkte."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="space-y-6">
          <div className="sticky top-4 z-20 rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-card backdrop-blur">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Katalog</p>
                  <h2 className="text-2xl font-extrabold text-ink">Produkte gezielt eingrenzen</h2>
                  <p className="text-sm text-slate-500">
                    {sortedProducts.length} Produkte gefunden
                    {activeFilterCount > 0 ? ` | ${activeFilterCount} Filter aktiv` : ''}
                    {searchTerm ? ` | Suche: "${searchTerm}"` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Filter zuruecksetzen
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">Kategorien</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activeCategoryNames.length
                          ? `${activeCategoryNames.length} ausgewaehlt`
                          : 'Alle Kategorien sichtbar'}
                      </p>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Mehrfachauswahl
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isCategoriesLoading ? (
                      [0, 1, 2, 3].map((item) => (
                        <div key={item} className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
                      ))
                    ) : categories.length > 0 ? (
                      categories.map((category) => {
                        const checked = selectedCategories.includes(category.id);

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                              checked
                                ? 'border-brand bg-brand text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {category.name}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">Derzeit sind keine Kategorien verfuegbar.</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-ink">Preisbereich</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-600">Min CHF</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={minPrice}
                          onChange={(event) => setMinPrice(event.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-600">Max CHF</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={maxPrice}
                          onChange={(event) => setMaxPrice(event.target.value)}
                          placeholder="999.99"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-4 py-4 transition hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(event) => setOnlyInStock(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                      />
                      <span>
                        <span className="block font-semibold text-ink">Nur verfuegbare Produkte</span>
                        <span className="mt-1 block text-sm text-slate-500">
                          Versteckt Artikel ohne Lagerbestand.
                        </span>
                      </span>
                    </label>

                    <div className="mt-4">
                      <label htmlFor="sort" className="mb-2 block text-sm font-medium text-slate-600">
                        Sortierung
                      </label>
                      <select
                        id="sort"
                        value={sortOption}
                        onChange={(event) => setSortOption(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-brand"
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
            </div>
          </div>

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
                    Zurueck
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
        </section>
      </main>
    </div>
  );
}

export default ProductsPage;
