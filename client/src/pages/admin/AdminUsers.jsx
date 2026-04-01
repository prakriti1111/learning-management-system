import { useState, useEffect, useCallback } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const ROLE_BADGE = {
  child: 'badge-teal', teacher: 'badge-blue',
  parent: 'badge-indigo', admin: 'badge-red',
};

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'child',
  gradeLevel: 3, phone: '', language: 'hi', classId: '',
};

export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');
  const [showLink,   setShowLink]   = useState(false);
  const [linkForm,   setLinkForm]   = useState({ parentId: '', childId: '' });
  const [parents,    setParents]    = useState([]);
  const [children,   setChildren]   = useState([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search)     params.set('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/admin/users', form);
      setSuccess(`✅ ${form.name} created as ${form.role}`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally { setSaving(false); }
  }

  async function toggleActive(user) {
    try {
      await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (e) { console.error(e); }
  }

  async function openLinkModal() {
    try {
      const [p, c] = await Promise.all([
        api.get('/admin/users?role=parent&limit=100'),
        api.get('/admin/users?role=child&limit=100'),
      ]);
      setParents(p.data.users);
      setChildren(c.data.users);
      setShowLink(true);
    } catch (e) { console.error(e); }
  }

  async function handleLink() {
    if (!linkForm.parentId || !linkForm.childId) {
      setError('Select both a parent and a child'); return;
    }
    try {
      await api.post('/admin/users/link-parent-child', linkForm);
      setSuccess('✅ Parent linked to child successfully');
      setShowLink(false);
      setLinkForm({ parentId: '', childId: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Link failed');
    }
  }

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>👤 User management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} total users</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-white btn-sm" onClick={openLinkModal}>🔗 Link parent↔child</button>
            <button className="btn btn-blue btn-sm" onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}>+ Create user</button>
          </div>
        </div>

        {success && (
          <div className="alert-success mb-4 animate-fade-up">
            <p className="text-sm font-bold text-[#085041] dark:text-[#5DCAA5]">{success}</p>
          </div>
        )}
        {error && (
          <div className="alert-danger mb-4 animate-fade-up">
            <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input className="input max-w-xs" placeholder="Search by name…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-1 flex-wrap">
            {['', 'child', 'teacher', 'parent', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`btn btn-sm ${roleFilter === r ? 'btn-blue' : 'btn-ghost'} capitalize`}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading">Loading users…</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 600 }}>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {['User', 'Role', 'Email', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="avatar avatar-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs shrink-0">
                            {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                            {u.role === 'child' && <p className="text-xs text-gray-400">Grade {u.gradeLevel}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'} capitalize`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => toggleActive(u)}
                          className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-success'} text-xs`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400 dark:text-gray-600">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create user modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md animate-fade-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>Create new user</h3>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="label">Full name</label>
                  <input className="input" required value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Arjun Sharma" />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input className="input" type="email" required value={form.email} onChange={e => setF('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Password</label>
                  <input className="input" type="password" required minLength={6} value={form.password} onChange={e => setF('password', e.target.value)} placeholder="min 6 characters" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label">Role</label>
                    <select className="select" value={form.role} onChange={e => setF('role', e.target.value)}>
                      {['child', 'teacher', 'parent', 'admin'].map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Language</label>
                    <select className="select" value={form.language} onChange={e => setF('language', e.target.value)}>
                      <option value="hi">Hindi</option>
                      <option value="en">English</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>
                </div>
                {form.role === 'child' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="label">Grade</label>
                      <select className="select" value={form.gradeLevel} onChange={e => setF('gradeLevel', parseInt(e.target.value))}>
                        {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Class ID</label>
                      <input className="input" value={form.classId} onChange={e => setF('classId', e.target.value)} placeholder="e.g. 4A" />
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="label">Phone (optional)</label>
                  <input className="input" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <button className="btn btn-blue btn-full btn-lg mt-2" type="submit" disabled={saving}>
                  {saving ? 'Creating…' : 'Create user'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Link parent↔child modal */}
        {showLink && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-sm animate-fade-up">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>🔗 Link parent ↔ child</h3>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowLink(false)}>✕</button>
              </div>
              <div className="form-group">
                <label className="label">Parent</label>
                <select className="select" value={linkForm.parentId}
                  onChange={e => setLinkForm(f => ({ ...f, parentId: e.target.value }))}>
                  <option value="">Select parent…</option>
                  {parents.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Child</label>
                <select className="select" value={linkForm.childId}
                  onChange={e => setLinkForm(f => ({ ...f, childId: e.target.value }))}>
                  <option value="">Select child…</option>
                  {children.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.gradeLevel}</option>)}
                </select>
              </div>
              <button className="btn btn-teal btn-full btn-lg"
                onClick={handleLink}
                disabled={!linkForm.parentId || !linkForm.childId}>
                Link accounts ✓
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}