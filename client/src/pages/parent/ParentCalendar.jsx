import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

function MeetCard({ m, isPast }) {
  const date = new Date(m.scheduledAt);
  const STATUS_BADGE = { scheduled:'badge-blue', completed:'badge-teal', cancelled:'badge-red' };
  return (
    <div className={`card mb-3 transition-all ${isPast ? 'opacity-60' : 'hover:shadow-md'}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-xl px-3 py-2 text-center min-w-[52px] shrink-0 ${isPast ? 'bg-gray-100 dark:bg-gray-800' : 'bg-[#E6F1FB] dark:bg-[#185FA5]/15'}`}>
          <p className={`font-black text-xl leading-none ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-[#185FA5] dark:text-[#85B7EB]'}`} style={{fontFamily:'Nunito,sans-serif'}}>{date.getDate()}</p>
          <p className={`text-xs font-bold ${isPast ? 'text-gray-400' : 'text-[#0C447C] dark:text-[#85B7EB]/70'}`}>{date.toLocaleString('en-IN',{month:'short'})}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-black text-sm text-gray-900 dark:text-gray-100 truncate" style={{fontFamily:'Nunito,sans-serif'}}>{m.teacherId?.name || 'Teacher meeting'}</p>
            <span className={`badge ${STATUS_BADGE[m.status]||'badge-blue'} shrink-0`}>{m.status}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{date.toLocaleTimeString('en-IN',{timeStyle:'short'})} · {m.type?.replace('_',' ')}</p>
          {m.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.notes}</p>}
          {(m.notifications?.smsSent||m.notifications?.emailSent) && (
            <p className="text-xs text-gray-400 mt-1">{m.notifications.smsSent&&'📱 SMS '}{m.notifications.emailSent&&'📧 Email confirmed'}</p>
          )}
        </div>
        {m.meetLink && !isPast && <a href={m.meetLink} target="_blank" rel="noreferrer" className="btn btn-teal btn-sm no-underline shrink-0">Join</a>}
      </div>
    </div>
  );
}

export default function ParentCalendar() {
  const [meetings, setMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/meetings').then(r => setMeetings(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading calendar…</div></main></div>;

  const now      = new Date();
  const upcoming = meetings.filter(m=>new Date(m.scheduledAt)>=now&&m.status!=='cancelled').sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt));
  const past     = meetings.filter(m=>new Date(m.scheduledAt)<now||m.status==='cancelled').sort((a,b)=>new Date(b.scheduledAt)-new Date(a.scheduledAt));

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        <h1 className="dark:text-white mb-1" style={{fontFamily:'Nunito,sans-serif'}}>📅 My calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">All your parent–teacher meetings</p>

        {upcoming.length===0 && past.length===0 && (
          <div className="card text-center py-12 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-semibold">No meetings scheduled yet.</p>
            <p className="text-sm mt-1">Your teacher will schedule one when needed.</p>
          </div>
        )}
        {upcoming.length>0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#185FA5] animate-pulse-soft" />
              <h3 className="font-black text-[#185FA5] dark:text-[#85B7EB] text-sm uppercase tracking-wide" style={{fontFamily:'Nunito,sans-serif'}}>Upcoming</h3>
            </div>
            {upcoming.map(m=><MeetCard key={m._id} m={m} isPast={false}/>)}
          </>
        )}
        {past.length>0 && (
          <div className="mt-6">
            <h3 className="font-black text-gray-400 dark:text-gray-600 text-sm uppercase tracking-wide mb-3" style={{fontFamily:'Nunito,sans-serif'}}>Past meetings</h3>
            {past.map(m=><MeetCard key={m._id} m={m} isPast={true}/>)}
          </div>
        )}
      </main>
    </div>
  );
}