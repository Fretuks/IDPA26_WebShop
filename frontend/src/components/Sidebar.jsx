import { useMemo, useState } from 'react';

function Sidebar({
  categories,
  selectedCategories,
  onCategoryToggle,
  onResetFilters,
  minPrice,
  maxPrice,
  onlyInStock,
  onMinPriceChange,
  onMaxPriceChange,
  onOnlyInStockChange,
  isLoading,
  className = ''
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  const selectedLabels = useMemo(
    () =>
      categories
        .filter((category) => selectedCategories.includes(category.id))
        .map((category) => category.name),
    [categories, selectedCategories]
  );

  return (
    <aside
      className={`rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-card lg:sticky lg:top-44 lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Filter</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Schnell eingrenzen</h2>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-ink"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 space-y-4 lg:max-h-[calc(100vh-17rem)] lg:overflow-y-auto lg:pr-1">
        <section className="rounded-2xl border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setIsPriceOpen((current) => !current)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-ink"
          >
            <span>Preis</span>
            <span className={`text-slate-400 transition ${isPriceOpen ? 'rotate-180' : ''}`}>⌃</span>
          </button>

          {isPriceOpen ? (
            <div className="grid gap-3 border-t border-slate-200 px-4 py-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Min CHF</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(event) => onMinPriceChange(event.target.value)}
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
                  onChange={(event) => onMaxPriceChange(event.target.value)}
                  placeholder="999.99"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand"
                />
              </label>
            </div>
          ) : null}
        </section>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(event) => onOnlyInStockChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>
            <span className="block font-semibold text-ink">Nur verfügbare Produkte</span>
            <span className="mt-1 block text-sm text-slate-500">Versteckt Artikel ohne Lagerbestand.</span>
          </span>
        </label>

        <section className="rounded-2xl border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setIsCategoryOpen((current) => !current)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-ink">Kategorien</p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedLabels.length
                  ? `${selectedLabels.length} ausgewählt`
                  : 'Alle Kategorien sichtbar'}
              </p>
            </div>
            <span className={`text-slate-400 transition ${isCategoryOpen ? 'rotate-180' : ''}`}>⌃</span>
          </button>

          {isCategoryOpen ? (
            <div className="border-t border-slate-200 px-4 py-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="h-10 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="grid gap-2">
                  {categories.map((category) => {
                    const checked = selectedCategories.includes(category.id);

                    return (
                      <label
                        key={category.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                          checked
                            ? 'border-brand bg-brand/5 text-ink'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onCategoryToggle(category.id)}
                          className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">
                  Derzeit sind keine Kategorien verfügbar.
                </p>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </aside>
  );
}

export default Sidebar;
