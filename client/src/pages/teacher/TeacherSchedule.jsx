import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import { useMeetingScheduler } from '../../hooks/useMeetingScheduler';
import api from '../../api/axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function buildCal(year, month) {
  return { first: new Date(year,month,1).getDay(), days: new Date(year,month+1,0).getDate() };
}

export default function TeacherSchedule() {
  const today = new Date();
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [selDay,   setSelDay]   = useState(today.getDate());
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [form,     setForm]     = useState({ studentId:'', time:'16:00', type:'google_meet', notes:'' });
  const [success,  setSuccess]  = useState(false);
  const { scheduleMeeting, loading, result, error } = useMeetingScheduler();

  useEffect(() => {
    Promise.all([api.get('/students'), api.get('/meetings')])
      .then(([s, m]) => {
        setStudents(s.data);
        setMeetings(m.data);
        if (s.data.length) setForm(f => ({ ...f, studentId: s.data[0]._id }));
      }).catch(console.error);
  }, []);

  const meetDays = new Set(
    meetings.filter(m => {
      const d = new Date(m.scheduledAt);
      return d.getFullYear()===year && d.getMonth()===month && m.status==='scheduled';
    }).map(m => new Date(m.scheduledAt).getDate())
  );

  const { first, days } = buildCal(year, month);

  function prevMonth() { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function nextMonth() { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }

  async function handleSchedule() {
    const scheduledAt = new Date(year, month, selDay, ...form.time.split(':').map(Number)).toISOString();
    try {
      await scheduleMeeting({ ...form, scheduledAt });
      setSuccess(true);
      const { data } = await api.get('/meetings');
      setMeetings(data);
    } catch {}
  }

  const dayMeetings = meetings.filter(m => {
    const d = new Date(m.scheduledAt);
    return d.getFullYear()===year && d.getMonth()===month && d.getDate()===selDay;
  });

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <h1 className="dark:text-white mb-6" style={{fontFamily:'Nunito,sans-serif'}}>📅 Schedule parent meeting</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Calendar */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
              <h3 className="font-black text-gray-900 dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>{MONTHS[month]} {year}</h3>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}>›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length:first}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:days},(_,i)=>i+1).map(d => {
                const isToday = d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
                const hasMeet = meetDays.has(d);
                const isSel   = d===selDay;
                return (
                  <button key={d} onClick={() => { setSelDay(d); setSuccess(false); }}
                    className={`relative py-2 rounded-xl text-sm font-bold transition-all border-none cursor-pointer ${
                      isSel   ? 'bg-[#185FA5] text-white' :
                      hasMeet ? 'bg-[#E1F5EE] dark:bg-[#085041]/20 text-[#085041] dark:text-[#5DCAA5]' :
                      isToday ? 'bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB]' :
                      'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {d}
                    {hasMeet && !isSel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5DCAA5]" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#E6F1FB] dark:bg-[#185FA5]/20 inline-block"/>Today</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#E1F5EE] dark:bg-[#085041]/20 inline-block"/>Has meeting</span>
            </div>
            {dayMeetings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Meetings on {selDay} {MONTHS[month]}</p>
                {dayMeetings.map(m => (
                  <div key={m._id} className="rounded-xl bg-[#E6F1FB] dark:bg-[#185FA5]/15 px-3 py-2.5 mb-2">
                    <p className="font-bold text-sm text-[#185FA5] dark:text-[#85B7EB]">{m.studentId?.name}</p>
                    <p className="text-xs text-[#0C447C] dark:text-[#85B7EB]/70">{new Date(m.scheduledAt).toLocaleTimeString('en-IN',{timeStyle:'short'})} · {m.type?.replace('_',' ')}</p>
                    {m.meetLink && <a href={m.meetLink} target="_blank" rel="noreferrer" className="inline-block mt-1.5 btn btn-teal btn-sm text-xs no-underline">Join meet</a>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="card">
            <h3 className="font-black text-gray-900 dark:text-white mb-5" style={{fontFamily:'Nunito,sans-serif'}}>New meeting — {selDay} {MONTHS[month]} {year}</h3>
            {success && result && (
              <div className="alert-success mb-4 animate-fade-up">
                <p className="text-sm font-bold text-[#085041] dark:text-[#5DCAA5]">✅ Meeting scheduled! SMS and email sent to parent.</p>
                {result.meetLink && <a href={result.meetLink} target="_blank" rel="noreferrer" className="text-xs text-[#185FA5] dark:text-[#85B7EB] mt-1 block hover:underline truncate">{result.meetLink}</a>}
              </div>
            )}
            {error && <div className="alert-danger mb-4"><p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p></div>}
            <div className="form-group">
              <label className="label">Student</label>
              <select className="select" value={form.studentId} onChange={e => setForm(f=>({...f,studentId:e.target.value}))}>
                <option value="">Select a student…</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} · Grade {s.gradeLevel}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">Time</label>
                <input className="input" type="time" value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="label">Meeting type</label>
                <select className="select" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                  <option value="google_meet">Google Meet</option>
                  <option value="in_person">In-person</option>
                  <option value="phone">Phone call</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Notes for parent (optional)</label>
              <textarea className="textarea" rows={3} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="e.g. Would like to discuss math progress and home support…" />
            </div>
            <button className="btn btn-blue btn-full btn-lg" onClick={handleSchedule} disabled={loading || !form.studentId}>
              {loading ? 'Scheduling…' : '📨 Send invite (SMS + Email) ✓'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Parent will receive SMS, email, and calendar invite automatically.</p>
          </div>
        </div>
      </main>
    </div>
  );
}