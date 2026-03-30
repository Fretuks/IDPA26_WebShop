function StatusBadge({ active }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
      {active ? 'Aktiv' : 'Inaktiv'}
    </span>
  );
}

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-card">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Produkte</p>
        <h3 className="mt-2 text-2xl font-extrabold text-ink">Produktverwaltung</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Kategorie</th>
              <th className="px-6 py-4">Preis</th>
              <th className="px-6 py-4">Lager</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="align-top">
                <td className="px-6 py-4 font-semibold text-slate-500">{product.id}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{product.description || 'Keine Beschreibung'}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{product.categoryName || '-'}</td>
                <td className="px-6 py-4 font-semibold text-ink">CHF {product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-600">{product.stock}</td>
                <td className="px-6 py-4">
                  <StatusBadge active={product.active} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="rounded-full border border-rose-200 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                  Keine Produkte vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
