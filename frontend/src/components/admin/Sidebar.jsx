const navigationItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Produkte' },
  { key: 'categories', label: 'Kategorien' },
  { key: 'orders', label: 'Bestellungen' },
  { key: 'users', label: 'Benutzer' },
  { key: 'settings', label: 'Einstellungen' }
];

function Sidebar({ activeSection, onSelect }) {
  return (
    <>
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-card lg:hidden">
        <label htmlFor="admin-navigation" className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand">
          Navigation
        </label>
        <select
          id="admin-navigation"
          value={activeSection}
          onChange={(event) => onSelect(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-brand focus:bg-white"
        >
          {navigationItems.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <aside className="sticky top-6 hidden h-fit rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-card lg:block">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand">Navigation</p>
        <nav className="mt-4 space-y-2">
          {navigationItems.map((item) => {
            const active = item.key === activeSection;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active ? 'bg-ink text-white shadow-lg shadow-slate-900/10' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-xs ${active ? 'text-slate-200' : 'text-slate-400'}`}>•</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
