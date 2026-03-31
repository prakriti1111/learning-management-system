import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import NavBar from '../../components/shared/Navbar';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar/><main className="app-content"><div className="loading">Loading platform stats…</div></main></div>;

  const metrics = [
    { val: stats.totalStudents,          label: 'Total students',      icon: '👦', color: 'text-[#085041]', bg: 'bg-[#E1F5EE] dark:bg-[#085041]/15' },
    { val: stats.totalTeachers,          label: 'Teachers',            icon: '👩‍🏫', color: 'text-[#185FA5]', bg: 'bg-[#E6F1FB] dark:bg-[#185FA5]/15' },
    { val: stats.totalParents,           label: 'Parents',             icon: '👨‍👩‍👧', color: 'text-[#3C3489]', bg: 'bg-[#EEEDFE] dark:bg-[#3C3489]/15' },
    { val: stats.activeStudentsThisWeek, label: 'Active this week',    icon: '🔥', color: 'text-[#993C1D]', bg: 'bg-[#FAECE7] dark:bg-[#993C1D]/15' },
    { val: stats.totalLessons,           label: 'Live lessons',        icon: '📚', color: 'text-[#633806]', bg: 'bg-[#FAEEDA] dark:bg-[#633806]/15' },
    { val: stats.totalMeetings,          label: 'Upcoming meetings',   icon: '📅', color: 'text-[#185FA5]', bg: 'bg-[#E6F1FB] dark:bg-[#185FA5]/15' },
  ];

  return (
    <div className="app-layout">
      <NavBar/>
      <main className="app-content page-wide">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>🛡️ Admin dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform-wide overview</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-blue btn-sm" onClick={() => navigate('/admin/users')}>+ Add user</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/reports')}>Export data</button>
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {metrics.map(m => (
            <div key={m.label} className={`rounded-2xl p-4 border border-gray-100 dark:border-gray-800 ${m.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{m.label}</span>
              </div>
              <p className={`text-3xl font-black ${m.color}`} style={{fontFamily:'Nunito,sans-serif'}}>{m.val}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Subject breakdown */}
          {stats.subjectBreakdown?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Lessons by subject</h3>
              <div style={{height:200}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.subjectBreakdown} margin={{top:0,right:0,left:-20,bottom:0}}>
                    <XAxis dataKey="_id" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:10}} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#5DCAA5" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent feedback */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Recent feedback</h3>
              <button className="text-xs text-[#185FA5] dark:text-[#85B7EB] font-bold hover:underline" onClick={() => navigate('/admin/reports')}>View all</button>
            </div>
            <div className="flex flex-col gap-2">
              {(stats.recentFeedback || []).map((f,i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="avatar avatar-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
                    {f.userId?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{f.userId?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{f.userId?.role}</p>
                  </div>
                  <div className="text-xs font-bold text-[#EF9F27]">{'⭐'.repeat(f.rating)}</div>
                </div>
              ))}
              {!stats.recentFeedback?.length && <p className="text-sm text-gray-400 text-center py-4">No feedback yet</p>}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Quick actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:'Add teacher',   icon:'👩‍🏫', action:() => navigate('/admin/users?role=teacher'), color:'bg-[#E6F1FB] dark:bg-[#185FA5]/15 text-[#185FA5] dark:text-[#85B7EB]' },
              { label:'Add student',   icon:'👦',   action:() => navigate('/admin/users?role=child'),   color:'bg-[#E1F5EE] dark:bg-[#085041]/15 text-[#085041] dark:text-[#5DCAA5]' },
              { label:'Review lessons',icon:'📚',   action:() => navigate('/admin/content'),            color:'bg-[#FAEEDA] dark:bg-[#633806]/15 text-[#633806] dark:text-[#FAC775]' },
              { label:'Analytics',     icon:'📈',   action:() => navigate('/admin/analytics'),          color:'bg-[#EEEDFE] dark:bg-[#3C3489]/15 text-[#3C3489] dark:text-[#AFA9EC]' },
            ].map(a => (
              <button key={a.label} onClick={a.action}
                className={`${a.color} rounded-2xl p-4 text-center cursor-pointer border-none hover:opacity-80 transition-opacity`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <p className="text-xs font-bold" style={{fontFamily:'Nunito,sans-serif'}}>{a.label}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}