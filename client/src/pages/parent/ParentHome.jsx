import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function ParentHome() {
  const { user }   = useAuth();
  const [children, setChildren]  = useState([]);
  const [alerts,   setAlerts]    = useState([]);
  const [meetings, setMeetings]  = useState([]);
  const [loading,  setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.get('/parents/children'), api.get('/parents/alerts'), api.get('/meetings')])
      .then(([c,a,m]) => {
        setChildren(c.data);
        setAlerts(a.data);
        setMeetings(m.data.filter(x => x.status==='scheduled' && new Date(x.scheduledAt)>=new Date()));
      }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading…</div></main></div>;

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        {/* Banner */}
        <div className="rounded-3xl p-6 mb-6" style={{background:'linear-gradient(135deg,#7F77DD,#534AB7)'}}>
          <p className="text-[#CECBF6] text-sm font-bold mb-1">Welcome back</p>
          <h1 className="text-white text-2xl font-black mb-1" style={{fontFamily:'Nunito,sans-serif'}}>Hello, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-[#CECBF6] text-sm">Your child's learning journey at a glance</p>
        </div>

        {/* Child cards */}
        {children.length === 0 && (
          <div className="card mb-4 text-center text-gray-400 dark:text-gray-600 py-8">
            <div className="text-3xl mb-2">👦</div>
            <p className="font-semibold">No children linked to your account yet.</p>
            <p className="text-sm mt-1">Ask your admin to link your child's account.</p>
          </div>
        )}
        {children.map(child => (
          <div key={child._id} className="card mb-4 border-2 border-[#AFA9EC] dark:border-[#3C3489]/40 bg-[#EEEDFE] dark:bg-[#3C3489]/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="avatar avatar-lg bg-[#7F77DD] text-white">{child.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div className="flex-1">
                <h2 className="text-[#26215C] dark:text-[#AFA9EC] font-black" style={{fontFamily:'Nunito,sans-serif'}}>{child.name}</h2>
                <p className="text-[#534AB7] dark:text-[#AFA9EC]/70 text-sm">Grade {child.gradeLevel} · ⭐ {(child.xp||0).toLocaleString()} XP</p>
              </div>
              <Link to="/parent/report" className="btn btn-sm no-underline" style={{background:'#7F77DD',color:'#fff'}}>View report</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{label:'Streak',val:`🔥 ${child.streakDays||0}d`},{label:'XP',val:`⭐ ${child.xp||0}`},{label:'Grade',val:`📚 G${child.gradeLevel||'?'}`}].map(s => (
                <div key={s.label} className="bg-white/60 dark:bg-white/5 rounded-xl py-2 text-center">
                  <p className="font-black text-[#26215C] dark:text-[#AFA9EC] text-sm">{s.val}</p>
                  <p className="text-xs text-[#534AB7] dark:text-[#AFA9EC]/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {unread > 0 && (
          <div className="rounded-2xl p-4 mb-4 bg-[#FAEEDA] dark:bg-[#633806]/15 border-2 border-[#FAC775] dark:border-[#633806]/30">
            <p className="font-black text-[#633806] dark:text-[#FAC775] text-sm mb-1">📋 {unread} new report{unread>1?'s':''} available</p>
            <p className="text-[#854F0B] dark:text-[#FAC775]/70 text-sm mb-3">Your child's weekly AI-generated report is ready.</p>
            <Link to="/parent/report" className="btn btn-amber btn-sm no-underline">Read report →</Link>
          </div>
        )}

        {meetings.length > 0 && (
          <div className="card mb-4">
            <h3 className="font-black text-gray-900 dark:text-white mb-4" style={{fontFamily:'Nunito,sans-serif'}}>📅 Upcoming meetings</h3>
            {meetings.slice(0,3).map(m => (
              <div key={m._id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="bg-[#E6F1FB] dark:bg-[#185FA5]/15 text-[#185FA5] dark:text-[#85B7EB] rounded-xl px-3 py-2 text-center min-w-[48px]">
                  <p className="font-black text-lg leading-none">{new Date(m.scheduledAt).getDate()}</p>
                  <p className="text-xs">{new Date(m.scheduledAt).toLocaleString('en-IN',{month:'short'})}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{m.teacherId?.name || 'Teacher'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(m.scheduledAt).toLocaleTimeString('en-IN',{timeStyle:'short'})} · {m.type?.replace('_',' ')}</p>
                </div>
                {m.meetLink && <a href={m.meetLink} target="_blank" rel="noreferrer" className="btn btn-teal btn-sm no-underline">Join</a>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            {to:'/parent/report',   icon:'📋', label:'Weekly report',   sub:'AI-generated insights'},
            {to:'/parent/calendar', icon:'📅', label:'Calendar',        sub:'Meetings & events'},
          ].map(a => (
            <Link key={a.to} to={a.to} className="card-sm flex flex-col items-center gap-2 text-center no-underline hover:shadow-md transition-all">
              <div className="text-2xl">{a.icon}</div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{a.label}</p>
              <p className="text-xs text-gray-400">{a.sub}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}