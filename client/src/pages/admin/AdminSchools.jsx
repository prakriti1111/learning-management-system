import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

export default function AdminSchools() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form,     setForm]     = useState({ teacherId: '', classId: '', schoolId: 'School_1' });
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/users?role=teacher&limit=100'),
      api.get('/admin/users?role=child&limit=100'),
    ]).then(([t, s]) => {
      setTeachers(t.data.users);
      setStudents(s.data.users);
      if (t.data.users.length) {
        setForm(f => ({ ...f, teacherId: t.data.users[0]._id }));
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAssign(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await api.post('/admin/users/assign-teacher', form);
      setSuccess(`✅ Teacher assigned to class ${form.classId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment failed');
    } finally { setSaving(false); }
  }

  // Group students by classId
  const classes = {};
  students.forEach(s => {
    const cls = s.classId || 'Unassigned';
    if (!classes[cls]) classes[cls] = [];
    classes[cls].push(s);
  });

  if (loading) return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content"><div className="loading">Loading…</div></main>
    </div>
  );

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <h1 className="dark:text-white mb-1" style={{ fontFamily: 'Nunito,sans-serif' }}>🏫 Schools & classes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Assign teachers to classes and manage school structure</p>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Assign form */}
          <div className="card">
            <h3 className="font-black dark:text-white mb-5" style={{ fontFamily: 'Nunito,sans-serif' }}>Assign teacher to class</h3>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label className="label">Teacher</label>
                <select className="select" required value={form.teacherId}
                  onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Select teacher…</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Class ID</label>
                <input className="input" required value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  placeholder="e.g. 4A, 5B, Grade3" />
              </div>
              <div className="form-group">
                <label className="label">School ID</label>
                <input className="input" value={form.schoolId}
                  onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                  placeholder="e.g. School_1" />
              </div>
              <button className="btn btn-teal btn-full btn-lg" type="submit"
                disabled={saving || !form.teacherId || !form.classId}>
                {saving ? 'Assigning…' : 'Assign teacher ✓'}
              </button>
            </form>
          </div>

          {/* Class overview */}
          <div className="card">
            <h3 className="font-black dark:text-white mb-4" style={{ fontFamily: 'Nunito,sans-serif' }}>Class overview</h3>
            {Object.keys(classes).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No students yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(classes).map(([cls, studs]) => (
                  <div key={cls} className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Nunito,sans-serif' }}>
                        Class {cls}
                      </p>
                      <span className="badge badge-teal">{studs.length} students</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {studs.slice(0, 8).map(s => (
                        <span key={s._id}
                          className="text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600">
                          {s.name.split(' ')[0]}
                        </span>
                      ))}
                      {studs.length > 8 && (
                        <span className="text-xs text-gray-400">+{studs.length - 8} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}