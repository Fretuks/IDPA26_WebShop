import CategoryForm from './CategoryForm';

function CategoryTable({ categories, draft, editingCategoryId, onChange, onEdit, onCancelEdit, onSubmit, onDelete, isSaving }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-card">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Kategorien</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">Kategorien verwalten</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Beschreibung</th>
                <th className="px-6 py-4">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 font-semibold text-slate-500">{category.id}</td>
                  <td className="px-6 py-4 font-semibold text-ink">{category.name}</td>
                  <td className="px-6 py-4 text-slate-600">{category.description || 'Keine Beschreibung'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="rounded-full border border-rose-200 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                    Keine Kategorien vorhanden.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryForm
        draft={draft}
        editingCategoryId={editingCategoryId}
        onChange={onChange}
        onCancel={onCancelEdit}
        onSubmit={onSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}

export default CategoryTable;
