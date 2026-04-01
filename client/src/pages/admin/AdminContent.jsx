import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const SUBJ_BADGE = {
  math: 'badge-indigo', science: 'badge-teal',
  hindi: 'badge-amber', english: 'badge-coral', evs: 'badge-green',
};

const DIFF_BG = [
  '', 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
];

export default function AdminContent() {
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [subjFilter,   setSubjFilter]   = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [toggling,     setToggling]     = useState(null);
  const [deleting,     setDeleting]     = useState(null);

  useEffect(() => { fetchLessons(); }, [subjFilter, activeFilter]);

  async function fetchLessons() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjFilter)           params.set('subject',  subjFilter);
      if (activeFilter !== 'all') params.set('isActive', activeFilter);
      const { data } = await api.get(`/admin/lessons?${params}`);
      setLessons(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function toggleLesson(id) {
    setToggling(id);
    try {
      await api.patch(`/admin/lessons/${id}/toggle`);
      fetchLessons();
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  }

  async function deleteLesson(id) {
    if (!window.confirm('Permanently delete this lesson?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/lessons/${id}`);
      fetchLessons();
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  }

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>📚 Content library</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{lessons.length} lessons shown</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex gap-1 flex-wrap">
            {['', 'math', 'science', 'hindi', 'english', 'evs'].map(s => (
              <button key={s} onClick={() => setSubjFilter(s)}
                className={`btn btn-sm ${subjFilter === s ? 'btn-blue' : 'btn-ghost'} capitalize`}>
                {s || 'All subjects'}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {[['all', 'All'], ['true', 'Active'], ['false', 'Inactive']].map(([v, l]) => (
              <button key={v} onClick={() => setActiveFilter(v)}
                className={`btn btn-sm ${activeFilter === v ? 'btn-teal' : 'btn-ghost'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading lessons…</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 640 }}>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[28%]">Lesson</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[12%]">Subject</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[8%]">Grade</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[12%]">Difficulty</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[18%]">Created by</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-[10%]">Status</th>
                    <th className="px-4 py-3 w-[12%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(l => (
                    <tr key={l._id}
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${!l.isActive ? 'opacity-50' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/40`}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{l.topic}</p>
                        <p className="text-xs text-gray-400 capitalize">{l.contentType?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${SUBJ_BADGE[l.subject] || 'badge-gray'} capitalize`}>{l.subject}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">G{l.gradeLevel}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${DIFF_BG[l.difficulty] || ''} text-xs`}>Lvl {l.difficulty}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {l.createdBy?.name || 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${l.isActive ? 'badge-green' : 'badge-red'}`}>
                          {l.isActive ? 'Active' : 'Off'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => toggleLesson(l._id)}
                            disabled={toggling === l._id}
                            className={`btn btn-sm ${l.isActive ? 'btn-ghost' : 'btn-success'} text-xs`}>
                            {toggling === l._id ? '…' : l.isActive ? 'Hide' : 'Show'}
                          </button>
                          <button onClick={() => deleteLesson(l._id)}
                            disabled={deleting === l._id}
                            className="btn btn-sm btn-danger text-xs">
                            {deleting === l._id ? '…' : 'Del'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lessons.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 dark:text-gray-600">
                        No lessons found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}