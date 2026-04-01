import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

export default function ParentReport() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parents/alerts').then(r => {
      setAlerts(r.data);
      r.data.filter(a=>!a.read).forEach(a => api.patch(`/parents/alerts/${a._id}/read`).catch(()=>{}));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading reports…</div></main></div>;

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        <h1 className="dark:text-white mb-1" style={{fontFamily:'Nunito,sans-serif'}}>📋 Weekly reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">AI-generated summaries of your child's progress</p>

        {alerts.length === 0 && (
          <div className="card text-center py-12 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-3">📬</div>
            <p className="font-semibold">No reports yet.</p>
            <p className="text-sm mt-1">Reports are generated every Sunday morning.</p>
          </div>
        )}

        {alerts.map(alert => (
          <div key={alert._id} className="card mb-5">
            <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>{alert.childId?.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Week of {new Date(alert.weekOf||alert.createdAt).toLocaleDateString('en-IN',{dateStyle:'medium'})}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`badge ${alert.avgScore>=70?'badge-teal':alert.avgScore>=50?'badge-amber':'badge-red'}`}>{alert.avgScore}% avg</span>
                <p className="text-xs text-gray-400 mt-1">📚 {alert.sessionsThisWeek} sessions</p>
              </div>
            </div>

            {alert.summary && (
              <div className="rounded-xl bg-[#EEEDFE] dark:bg-[#3C3489]/15 border border-[#AFA9EC] dark:border-[#3C3489]/30 px-4 py-3 mb-4">
                <p className="text-xs font-black text-[#534AB7] dark:text-[#AFA9EC] uppercase tracking-wide mb-2">AI Summary</p>
                <p className="text-sm text-[#26215C] dark:text-[#AFA9EC] leading-relaxed">{alert.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {alert.strongAreas?.length > 0 && (
                <div className="rounded-xl bg-[#E1F5EE] dark:bg-[#085041]/15 p-3 border border-[#9FE1CB] dark:border-[#085041]/30">
                  <p className="text-xs font-black text-[#085041] dark:text-[#5DCAA5] mb-2">💪 Strong areas</p>
                  <div className="flex flex-wrap gap-1.5">{alert.strongAreas.map(s=><span key={s} className="badge badge-teal capitalize">{s}</span>)}</div>
                </div>
              )}
              {alert.weakAreas?.length > 0 && (
                <div className="rounded-xl bg-[#FAECE7] dark:bg-[#712B13]/15 p-3 border border-[#F0997B] dark:border-[#712B13]/30">
                  <p className="text-xs font-black text-[#993C1D] dark:text-[#F0997B] mb-2">📌 Focus areas</p>
                  <div className="flex flex-wrap gap-1.5">{alert.weakAreas.map(s=><span key={s} className="badge badge-coral capitalize">{s}</span>)}</div>
                </div>
              )}
            </div>

            {alert.tips?.length > 0 && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <p className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">💡 Tips for home</p>
                <div className="flex flex-col gap-2">
                  {alert.tips.map((tip,i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#E1F5EE] dark:bg-[#085041]/20 text-[#085041] dark:text-[#5DCAA5] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alert.achievements?.length > 0 && (
              <div>
                <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">🏅 Achievements this week</p>
                <div className="flex flex-wrap gap-2">{alert.achievements.map(a=><span key={a} className="badge badge-amber capitalize">{a.replace(/_/g,' ')}</span>)}</div>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
