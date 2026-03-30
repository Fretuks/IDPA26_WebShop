const initialProductState = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  stock: '',
  active: true
};

function normalizeProductForm(product) {
  if (!product) {
    return initialProductState;
  }

  return {
    name: product.name || '',
    description: product.description || '',
    price: String(product.price ?? ''),
    categoryId: String(product.categoryId ?? ''),
    stock: String(product.stock ?? ''),
    active: Boolean(product.active)
  };
}

function ProductForm({ categories, draft, onChange, onSubmit, onCancel, isSaving, editingProduct }) {
  return (
    <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Produktformular</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">{editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}</h3>
        </div>
        {editingProduct ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Abbrechen
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="product-name" className="mb-2 block text-sm font-semibold text-slate-700">
            Name
          </label>
          <input
            id="product-name"
            value={draft.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="product-description" className="mb-2 block text-sm font-semibold text-slate-700">
            Beschreibung
          </label>
          <textarea
            id="product-description"
            rows="4"
            value={draft.description}
            onChange={(event) => onChange('description', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="product-price" className="mb-2 block text-sm font-semibold text-slate-700">
            Preis
          </label>
          <input
            id="product-price"
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
          <label htmlFor="product-stock" className="mb-2 block text-sm font-semibold text-slate-700">
            Lagerbestand
          </label>
          <input
            id="product-stock"
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
          <label htmlFor="product-category" className="mb-2 block text-sm font-semibold text-slate-700">
            Kategorie
          </label>
          <select
            id="product-category"
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
            id="product-active"
            type="checkbox"
            checked={draft.active}
            onChange={(event) => onChange('active', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <label htmlFor="product-active" className="text-sm font-semibold text-slate-700">
            Produkt aktiv
          </label>
        </div>
      </div>

      <button type="submit" disabled={isSaving} className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60">
        {isSaving ? 'Speichert...' : editingProduct ? 'Produkt speichern' : 'Produkt erstellen'}
      </button>
    </form>
  );
}

ProductForm.initialState = initialProductState;
ProductForm.normalize = normalizeProductForm;

export default ProductForm;
