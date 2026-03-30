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
    <aside className="sticky top-6 h-fit rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-card">
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
  );
}

export default Sidebar;
