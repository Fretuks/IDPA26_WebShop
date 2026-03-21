import ProductCard from './ProductCard';

function ProductGrid({ products, isLoading, onAddToCart, activeProductId }) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-card">
            <div className="h-56 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-5">
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-11 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-card">
        <p className="text-lg font-bold text-ink">Keine Produkte gefunden</p>
        <p className="mt-2 text-sm text-slate-500">Passe Suche oder Kategorien an, um weitere Treffer zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" id="products">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAdding={activeProductId === product.id}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
