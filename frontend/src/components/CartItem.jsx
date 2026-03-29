function formatPrice(value) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(Number(value || 0));
}

function CartItem({
  item,
  quantity,
  onQuantityChange,
  onQuantityCommit,
  onRemove,
  isUpdating = false,
  isRemoving = false
}) {
  return (
    <article className="grid gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-card sm:grid-cols-[minmax(0,1.4fr)_140px_140px_120px] sm:items-center">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-ink via-slate-800 to-brand text-lg font-extrabold text-white shadow-card">
          {item.name?.slice(0, 1) || 'P'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Produkt</p>
          <h3 className="mt-1 truncate text-lg font-bold text-ink">{item.name}</h3>
          <p className="mt-2 text-sm text-slate-500">Artikel #{item.productId}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Preis</p>
        <p className="mt-2 text-base font-bold text-ink">{formatPrice(item.price)}</p>
      </div>

      <div>
        <label htmlFor={`quantity-${item.id}`} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Menge
        </label>
        <input
          id={`quantity-${item.id}`}
          type="number"
          min="1"
          max={item.stock || undefined}
          step="1"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          onBlur={onQuantityCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onQuantityCommit();
            }
          }}
          disabled={isUpdating || isRemoving}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        <p className="mt-2 text-xs text-slate-500">Verfuegbar: {item.stock}</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Summe</p>
          <p className="mt-2 text-base font-bold text-ink">{formatPrice(item.price * item.quantity)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={isRemoving || isUpdating}
          className="inline-flex w-full items-center justify-center rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRemoving ? 'Entfernt...' : 'Entfernen'}
        </button>
      </div>
    </article>
  );
}

export default CartItem;
