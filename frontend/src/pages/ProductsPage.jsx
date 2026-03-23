import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import Sidebar from '../components/Sidebar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function ProductsPage() {
  const { addToCart, cartError } = useCart();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
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

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategories]);

  function handleCategoryToggle(categoryId) {
    setSelectedCategories((current) =>
      current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId]
    );
  }

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedCategories([]);
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
        description="Entdecke unser Sortiment, filtere nach Kategorien und finde schnell die passenden Produkte."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onResetFilters={handleResetFilters}
            isLoading={isCategoriesLoading}
          />

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Katalog</p>
                  <h2 className="text-2xl font-extrabold text-ink">Unsere Auswahl für dich</h2>
                  <p className="text-sm text-slate-500">
                    {filteredProducts.length} Produkte {token ? 'mit aktivem Warenkorb' : 'als Gast'}
                  </p>
                </div>

                <div className="w-full max-w-xl">
                  <label htmlFor="search" className="mb-2 block text-sm font-medium text-slate-600">
                    Produkte suchen
                  </label>
                  <input
                    id="search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Suche nach Produktname, Beschreibung oder Kategorie"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {pageError ? (
              <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-card">
                Die Produkte konnten gerade nicht geladen werden: {pageError}
              </div>
            ) : null}

            <ProductGrid
              products={filteredProducts}
              isLoading={isProductsLoading}
              onAddToCart={handleAddToCart}
              activeProductId={activeProductId}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductsPage;
