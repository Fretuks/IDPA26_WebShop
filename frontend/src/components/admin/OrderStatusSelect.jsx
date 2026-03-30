const ORDER_STATUS_OPTIONS = ['OPEN', 'PAID', 'SENT', 'DELIVERED', 'CANCELLED'];

function OrderStatusSelect({ value, onChange, disabled, isSaving = false }) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isSaving}
        className="min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {ORDER_STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {isSaving ? <span className="text-xs font-semibold text-slate-500">Speichert...</span> : null}
    </div>
  );
}

OrderStatusSelect.options = ORDER_STATUS_OPTIONS;

export default OrderStatusSelect;
