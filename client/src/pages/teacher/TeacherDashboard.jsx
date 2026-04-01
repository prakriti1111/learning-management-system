import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const SUBJ_COLORS = { math:'#7F77DD', science:'#5DCAA5', hindi:'#EF9F27', english:'#D85A30', evs:'#639922' };

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');

  useEffect(() => {
    api.get('/analytics/class').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading dashboard…</div></main></div>;

  const { all=[], topPerformers=[], needAttention=[], totalStudents=0 } = data || {};
  const avgScore   = all.length ? Math.round(all.reduce((s,x)=>s+x.avgScore,0)/all.length) : 0;
  const activeWeek = all.filter(s=>s.sessionsThisWeek>0).length;

  const subjectData = [
    {subject:'Math',    score:82},{subject:'Science',score:74},
    {subject:'Hindi',   score:68},{subject:'English',score:71},{subject:'EVS',score:65},
  ];

  const TABS = [
    {id:'overview',  label:'📊 Overview'},
    {id:'top',       label:'🏆 Top performers'},
    {id:'attention', label:'⚠️ Need attention'},
  ];

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <div className="flex items-center justify-between mb-6">
          <h1 className="dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>Class dashboard</h1>
          <span className="badge badge-blue">{totalStudents} students</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {val:`${avgScore}%`,       label:'Class avg score',  color:''},
            {val:activeWeek,           label:'Active this week', color:''},
            {val:topPerformers.length, label:'Top performers',   color:'text-[#085041] dark:text-[#5DCAA5]'},
            {val:needAttention.length, label:'Need attention',   color:'text-red-600 dark:text-red-400'},
          ].map(m => (
            <div key={m.label} className="metric-card">
              <div className={`metric-value ${m.color}`}>{m.val}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="tab-bar rounded-t-2xl">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab===t.id?' active':''}`}>{t.label}</button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-b-2xl border border-t-0 border-gray-100 dark:border-gray-800 p-5">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">Subject performance</h3>
                <div style={{height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} margin={{top:0,right:0,left:-20,bottom:0}}>
                      <XAxis dataKey="subject" tick={{fontSize:11}} />
                      <YAxis domain={[0,100]} tick={{fontSize:10}} />
                      <Tooltip formatter={v=>`${v}%`} />
                      <Bar dataKey="score" fill="#378ADD" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">Skill radar</h3>
                <div style={{height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={subjectData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize:10}} />
                      <Radar dataKey="score" fill="#5DCAA5" fillOpacity={0.35} stroke="#1D9E75" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === 'top' && (
            <div className="flex flex-col gap-2">
              {topPerformers.length === 0 && <p className="text-gray-400 text-center py-8">No data yet. Students need to complete lessons first.</p>}
              {topPerformers.map((s,i) => (
                <div key={s.student._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="text-xl w-7 text-center">{['🥇','🥈','🥉'][i]||i+1}</div>
                  <div className="avatar avatar-sm bg-[#E1F5EE] dark:bg-[#085041]/20 text-[#085041] dark:text-[#5DCAA5]">
                    {s.student.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100" style={{fontFamily:'Nunito,sans-serif'}}>{s.student.name}</p>
                    <p className="text-xs text-gray-400">{s.sessionsThisWeek} sessions this week</p>
                  </div>
                  <div className="text-right">
                    <div className="progress-track w-24 mb-1"><div className="progress-fill bg-[#5DCAA5]" style={{width:`${s.avgScore}%`}} /></div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{s.avgScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'attention' && (
            <div className="flex flex-col gap-2">
              {needAttention.length === 0 && <p className="text-gray-400 text-center py-8">All students are on track! 🎉</p>}
              {needAttention.map(s => (
                <div key={s.student._id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border-l-4 border-red-300 dark:border-red-700">
                  <div className="avatar avatar-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    {s.student.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100" style={{fontFamily:'Nunito,sans-serif'}}>{s.student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.sessionsThisWeek===0 ? 'No activity this week' : `Score: ${s.avgScore}% · ${s.sessionsThisWeek} sessions`}</p>
                  </div>
                  <span className="badge badge-red">{s.sessionsThisWeek===0 ? 'Inactive' : 'Low score'}</span>
                  <button className="btn btn-white btn-sm shrink-0" onClick={() => navigate('/teacher/schedule')}>Schedule meet</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}