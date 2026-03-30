import OrderStatusSelect from './OrderStatusSelect';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function OrderTable({ orders, onStatusChange, savingOrderId }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-card">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Bestellungen</p>
        <h3 className="mt-2 text-2xl font-extrabold text-ink">Alle Bestellungen</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Betrag</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Datum</th>
              <th className="px-6 py-4">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 font-semibold text-slate-500">{order.id}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-ink">{`${order.firstname} ${order.lastname}`.trim() || `User #${order.userId}`}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.email || '-'}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-ink">CHF {order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.status}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-4">
                  <OrderStatusSelect
                    value={order.status}
                    onChange={(status) => onStatusChange(order, status)}
                    isSaving={savingOrderId === order.id}
                  />
                </td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                  Keine Bestellungen vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;
