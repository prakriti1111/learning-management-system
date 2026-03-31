import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [detLoading,setDetLoading]=useState(false);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function viewStudent(s) {
    setSelected(s); setDetail(null); setDetLoading(true);
    try {
      const { data } = await api.get(`/analytics/student/${s._id}`);
      setDetail(data);
    } catch (e) { console.error(e); }
    finally { setDetLoading(false); }
  }

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading students…</div></main></div>;

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <h1 className="dark:text-white mb-5" style={{fontFamily:'Nunito,sans-serif'}}>👥 All students</h1>
        <input className="input max-w-xs mb-5" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Student list */}
          <div className="flex flex-col gap-2">
            {filtered.length === 0 && (
              <div className="card text-center text-gray-400 py-8">
                <p>{search ? 'No students match your search' : 'No students in your class yet'}</p>
              </div>
            )}
            {filtered.map(s => (
              <button key={s._id} onClick={() => viewStudent(s)}
                className={`card-sm flex items-center gap-3 text-left w-full hover:shadow-md transition-all cursor-pointer ${selected?._id===s._id?'ring-2 ring-[#185FA5] dark:ring-[#85B7EB]':''}`}>
                <div className="avatar avatar-md bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB]">
                  {s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate" style={{fontFamily:'Nunito,sans-serif'}}>{s.name}</p>
                  <p className="text-xs text-gray-400">Grade {s.gradeLevel} · ⭐ {s.xp||0} XP</p>
                </div>
                <span className={`text-xs font-bold shrink-0 ${s.lastActiveAt ? 'text-[#085041] dark:text-[#5DCAA5]' : 'text-red-500 dark:text-red-400'}`}>
                  {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString('en-IN') : 'Inactive'}
                </span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card animate-fade-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="avatar avatar-lg bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB]">
                  {selected.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <h3 className="dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>{selected.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Grade {selected.gradeLevel} · {selected.classId || 'No class'}</p>
                </div>
              </div>
              {detLoading ? (
                <div className="loading">Loading details…</div>
              ) : detail ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="metric-card"><div className="metric-value">{detail.achievements?.length||0}</div><div className="metric-label">Badges</div></div>
                    <div className="metric-card"><div className="metric-value">{detail.sessions?.length||0}</div><div className="metric-label">Sessions</div></div>
                  </div>
                  {detail.subjects?.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Subject mastery</p>
                      {detail.subjects.map(s => (
                        <div key={s.name} className="flex items-center gap-3 mb-2.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-16 capitalize shrink-0">{s.name}</span>
                          <div className="progress-track flex-1">
                            <div className="progress-fill" style={{width:`${s.avgMastery}%`, background: s.avgMastery>=65?'#5DCAA5':s.avgMastery>=45?'#EF9F27':'#e24b4a'}} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-9 text-right">{s.avgMastery}%</span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : null}
              <button className="btn btn-blue btn-full mt-4 btn-sm" onClick={() => navigate('/teacher/schedule')}>
                📅 Schedule parent meeting
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}