import { Link } from 'react-router-dom';

const placeholder = encodeURI(
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 420'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop stop-color='%230f172a'/><stop offset='1' stop-color='%230f766e'/></linearGradient></defs><rect width='600' height='420' fill='url(%23g)'/><circle cx='460' cy='95' r='74' fill='%23ffffff18'/><circle cx='160' cy='320' r='94' fill='%23ffffff14'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='34'>Produktbild</text></svg>"
);

function formatPrice(price) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(price);
}

function ProductCard({ product, onAddToCart, isAdding }) {
  const isOutOfStock = product.stock < 1;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl || placeholder}
          alt={product.name}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand">
          {product.categoryName || 'Produkt'}
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <Link to={`/products/${product.id}`} className="text-lg font-bold text-ink transition hover:text-brand">
              {product.name}
            </Link>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Lager: {product.stock}
            </span>
          </div>
          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
            {product.description || 'Ein sorgfältig ausgewählter Artikel mit zuverlässiger Qualität und attraktivem Preis.'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preis</p>
            <p className="text-2xl font-extrabold text-ink">{formatPrice(product.price)}</p>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={isAdding || isOutOfStock}
            className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isOutOfStock ? 'Ausverkauft' : isAdding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
