function ProductEditModal({ categories, draft, onChange, onSubmit, onClose, isSaving, isOpen }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Produkt bearbeiten</p>
            <h3 className="mt-2 text-2xl font-extrabold text-ink">Produktdetails anpassen</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Zurück zur Liste
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="modal-product-name" className="mb-2 block text-sm font-semibold text-slate-700">
                Name
              </label>
              <input
                id="modal-product-name"
                value={draft.name}
                onChange={(event) => onChange('name', event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="modal-product-description" className="mb-2 block text-sm font-semibold text-slate-700">
                Beschreibung
              </label>
              <textarea
                id="modal-product-description"
                rows="4"
                value={draft.description}
                onChange={(event) => onChange('description', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="modal-product-price" className="mb-2 block text-sm font-semibold text-slate-700">
                Preis
              </label>
              <input
                id="modal-product-price"
                type="number"
                min="0.01"
                step="0.01"
                value={draft.price}
                onChange={(event) => onChange('price', event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="modal-product-stock" className="mb-2 block text-sm font-semibold text-slate-700">
                Lagerbestand
              </label>
              <input
                id="modal-product-stock"
                type="number"
                min="0"
                step="1"
                value={draft.stock}
                onChange={(event) => onChange('stock', event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="modal-product-category" className="mb-2 block text-sm font-semibold text-slate-700">
                Kategorie
              </label>
              <select
                id="modal-product-category"
                value={draft.categoryId}
                onChange={(event) => onChange('categoryId', event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              >
                <option value="">Kategorie wählen</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                id="modal-product-active"
                type="checkbox"
                checked={draft.active}
                onChange={(event) => onChange('active', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <label htmlFor="modal-product-active" className="text-sm font-semibold text-slate-700">
                Produkt aktiv
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEditModal;
