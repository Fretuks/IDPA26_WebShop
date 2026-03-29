function formatPrice(value) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(Number(value || 0));
}

function OrderSummary({
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  title = 'Bestellübersicht',
  buttonLabel,
  onButtonClick,
  buttonDisabled = false,
  buttonType = 'button',
  isSubmitting = false,
  compact = false,
  note = '',
  formId
}) {
  return (
    <aside className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-card sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">{title}</p>
      <h2 className="mt-3 text-2xl font-extrabold text-ink">Dein Einkauf</h2>

      <div className="mt-6 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.quantity} x {formatPrice(item.price ?? item.priceAtPurchase)}
                </p>
              </div>
              <p className="text-sm font-bold text-ink">
                {formatPrice((item.price ?? item.priceAtPurchase ?? 0) * item.quantity)}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Es befinden sich noch keine Positionen in dieser Übersicht.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3 rounded-[1.5rem] bg-slate-50 px-4 py-5">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Zwischensumme</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Versand</span>
          <span>{shipping > 0 ? formatPrice(shipping) : 'Kostenlos'}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-ink">
          <span>Gesamt</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {note ? <p className="mt-4 text-sm leading-6 text-slate-500">{note}</p> : null}

      {buttonLabel ? (
        <button
          type={buttonType}
          form={formId}
          onClick={onButtonClick}
          disabled={buttonDisabled}
          className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-bold text-white transition ${
            compact ? 'bg-brand hover:bg-emerald-700' : 'bg-ink hover:bg-brand'
          } disabled:cursor-not-allowed disabled:bg-slate-300`}
        >
          {isSubmitting ? 'Wird verarbeitet...' : buttonLabel}
        </button>
      ) : null}
    </aside>
  );
}

export default OrderSummary;
