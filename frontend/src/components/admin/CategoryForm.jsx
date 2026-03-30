function CategoryForm({ draft, editingCategoryId, onChange, onCancel, onSubmit, isSaving }) {
  return (
    <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Formular</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">{editingCategoryId ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</h3>
        </div>
        {editingCategoryId ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Abbrechen
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="category-name" className="mb-2 block text-sm font-semibold text-slate-700">
            Name
          </label>
          <input
            id="category-name"
            value={draft.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
          />
        </div>
        <div>
          <label htmlFor="category-description" className="mb-2 block text-sm font-semibold text-slate-700">
            Beschreibung
          </label>
          <textarea
            id="category-description"
            rows="5"
            value={draft.description}
            onChange={(event) => onChange('description', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? 'Speichert...' : editingCategoryId ? 'Kategorie speichern' : 'Kategorie erstellen'}
      </button>
    </form>
  );
}

export default CategoryForm;
