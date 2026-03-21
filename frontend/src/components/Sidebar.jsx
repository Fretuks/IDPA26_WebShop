function Sidebar({ categories, selectedCategories, onCategoryToggle, onResetFilters, isLoading }) {
  return (
    <aside className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Filter</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Kategorien</h2>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-sm font-semibold text-slate-500 transition hover:text-ink"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-11 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => {
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
                  {category.description ? <span className="mt-1 block text-sm text-slate-500">{category.description}</span> : null}
                </span>
              </label>
            );
          })
        ) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Keine Kategorien verfügbar.</p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
