const USER_ROLE_OPTIONS = ['CUSTOMER', 'ADMIN'];

function UserRoleSelect({ value, onChange, disabled, isSaving = false }) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isSaving}
        className="min-w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {USER_ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {isSaving ? <span className="text-xs font-semibold text-slate-500">Speichert...</span> : null}
    </div>
  );
}

UserRoleSelect.options = USER_ROLE_OPTIONS;

export default UserRoleSelect;
