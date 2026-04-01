import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

export default function AdminReports() {
  const [fb,         setFb]         = useState([]);
  const [avgRating,  setAvgRating]  = useState(0);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get('/admin/feedback')
      .then(r => {
        setFb(r.data.feedback);
        setAvgRating(r.data.avgRating);
        setTotal(r.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function downloadCSV() {
    const rows = [['Name', 'Role', 'Rating', 'Tags', 'Message', 'Date']];
    fb.forEach(f => rows.push([
      f.userId?.name || '',
      f.userId?.role || '',
      f.rating,
      (f.tags || []).join('; '),
      (f.message || '').replace(/,/g, ' '),
      new Date(f.createdAt).toLocaleDateString('en-IN'),
    ]));
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'learnbright_feedback.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = roleFilter ? fb.filter(f => f.userId?.role === roleFilter) : fb;

  const STAR_DIST = [1, 2, 3, 4, 5].map(n => ({
    n,
    count: fb.filter(f => f.rating === n).length,
    pct:   fb.length ? Math.round((fb.filter(f => f.rating === n).length / fb.length) * 100) : 0,
  })).reverse();

  if (loading) return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content"><div className="loading">Loading reports…</div></main>
    </div>
  );

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>📊 Reports & feedback</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} responses collected</p>
          </div>
          <button className="btn btn-white btn-sm" onClick={downloadCSV}>⬇ Export CSV</button>
        </div>

        {/* Rating summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="card text-center">
            <p className="text-5xl font-black text-[#EF9F27]" style={{ fontFamily: 'Nunito,sans-serif' }}>
              {avgRating}
            </p>
            <div className="flex justify-center gap-0.5 my-2">
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`text-lg ${n <= Math.round(avgRating) ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">Average rating</p>
          </div>

          <div className="card col-span-2">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">Rating breakdown</h3>
            {STAR_DIST.map(d => (
              <div key={d.n} className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-3">{d.n}</span>
                <span className="text-sm">⭐</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF9F27] rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter + table */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['', 'child', 'teacher', 'parent'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`btn btn-sm ${roleFilter === r ? 'btn-blue' : 'btn-ghost'} capitalize`}>
              {r || 'All roles'}
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 600 }}>
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[22%]">User</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[10%]">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[14%]">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[28%]">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[26%]">Message</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{f.userId?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-gray capitalize">{f.userId?.role}</span>
                    </td>
                    <td className="px-4 py-3 text-base">{'⭐'.repeat(f.rating || 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(f.tags || []).slice(0, 3).map(t => (
                          <span key={t} className="badge badge-gray text-xs">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {f.message || '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-600">
                      No feedback yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}