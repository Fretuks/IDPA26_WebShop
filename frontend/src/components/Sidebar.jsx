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
  isLoading
}) {
  const selectedLabels = categories
    .filter((category) => selectedCategories.includes(category.id))
    .map((category) => category.name);

  return (
    <aside className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-card lg:sticky lg:top-28 lg:flex lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Filter</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Produkte filtern</h2>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-sm font-semibold text-slate-500 transition hover:text-ink"
        >
          Zurücksetzen
        </button>
      </div>

      <div className="mt-5 space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Preisbereich</h3>
            <span className="text-xs font-medium text-slate-400">CHF</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Min</span>
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
              <span className="mb-2 block text-sm text-slate-600">Max</span>
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
        </section>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(event) => onOnlyInStockChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>
            <span className="block font-semibold text-ink">Auf Lager</span>
            <span className="mt-1 block text-sm text-slate-500">Zeigt nur Produkte mit verfügbarem Bestand.</span>
          </span>
        </label>

        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink transition hover:border-slate-300">
            <span>
              {selectedLabels.length
                ? `${selectedLabels.length} Kategorie${selectedLabels.length > 1 ? 'n' : ''} ausgewählt`
                : 'Alle Kategorien'}
            </span>
            <span className="text-slate-400 transition group-open:rotate-180">⌄</span>
          </summary>

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-11 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((category) => {
                  const checked = selectedCategories.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        checked
                          ? 'border-brand bg-brand/5 text-ink'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onCategoryToggle(category.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                      />
                      <span>
                        <span className="block font-semibold">{category.name}</span>
                        {category.description ? (
                          <span className="mt-1 block text-sm text-slate-500">{category.description}</span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Derzeit sind keine Kategorien verfügbar.
              </p>
            )}
          </div>
        </details>
      </div>
    </aside>
  );
}

export default Sidebar;
