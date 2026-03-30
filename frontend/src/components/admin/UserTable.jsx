import UserRoleSelect from './UserRoleSelect';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'medium'
  }).format(new Date(value));
}

function UserTable({ users, currentUserId, onRoleChange, savingUserId }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-card">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Benutzer</p>
        <h3 className="mt-2 text-2xl font-extrabold text-ink">Alle Benutzer</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rolle</th>
              <th className="px-6 py-4">Registriert</th>
              <th className="px-6 py-4">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-ink">{`${user.firstname} ${user.lastname}`}</p>
                  <p className="mt-1 text-xs text-slate-500">ID {user.id}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <UserRoleSelect
                    value={user.role}
                    onChange={(role) => onRoleChange(user, role)}
                    isSaving={savingUserId === user.id}
                    disabled={user.id === currentUserId}
                  />
                  {user.id === currentUserId ? <p className="mt-2 text-xs text-slate-500">Eigene Admin-Rolle ist gesperrt.</p> : null}
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                  Keine Benutzer vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
