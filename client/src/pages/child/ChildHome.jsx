import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const SUBJ = {
  math:    { bg:'bg-[#EEEDFE] dark:bg-[#3C3489]/20', border:'border-[#AFA9EC] dark:border-[#3C3489]/40', txt:'text-[#3C3489] dark:text-[#AFA9EC]', btn:'bg-[#7F77DD] text-white', icon:'➕' },
  science: { bg:'bg-[#E1F5EE] dark:bg-[#085041]/20', border:'border-[#9FE1CB] dark:border-[#085041]/40', txt:'text-[#085041] dark:text-[#5DCAA5]', btn:'bg-[#5DCAA5] text-[#04342C]', icon:'🔬' },
  hindi:   { bg:'bg-[#FAEEDA] dark:bg-[#633806]/20', border:'border-[#FAC775] dark:border-[#633806]/40', txt:'text-[#633806] dark:text-[#FAC775]', btn:'bg-[#EF9F27] text-[#412402]', icon:'📖' },
  english: { bg:'bg-[#FAECE7] dark:bg-[#712B13]/20', border:'border-[#F0997B] dark:border-[#712B13]/40', txt:'text-[#712B13] dark:text-[#F0997B]', btn:'bg-[#D85A30] text-white',    icon:'🔤' },
  evs:     { bg:'bg-[#EAF3DE] dark:bg-[#27500A]/20', border:'border-[#97C459] dark:border-[#27500A]/40', txt:'text-[#27500A] dark:text-[#97C459]', btn:'bg-[#639922] text-white',    icon:'🌿' },
};
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function ChildHome() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [lessons,   setLessons]  = useState([]);
  const [quizzes,   setQuizzes]  = useState([]);
  const [newBadge,  setNewBadge] = useState(null);
  const [loading,   setLoading]  = useState(true);
  const streak = user?.streakDays || 0;

  useEffect(() => {
    Promise.all([
      api.get(`/lessons?gradeLevel=${user?.gradeLevel || 3}`),
      api.get('/quizzes'),
    ]).then(([l, q]) => {
      setLessons(l.data.slice(0, 4));
      setQuizzes(q.data.slice(0, 2));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="app-layout"><NavBar />
      <main className="app-content"><div className="loading">Loading your lessons…</div></main>
    </div>
  );

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        {/* Hero */}
        <div className="rounded-3xl p-6 mb-6" style={{background:'linear-gradient(135deg,#5DCAA5,#1D9E75)'}}>
          <p className="text-[#d0f5e8] text-sm font-bold mb-1">Welcome back!</p>
          <h1 className="text-white text-2xl font-black mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
            Hi {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-white text-sm font-bold">⭐ {(user?.xp||0).toLocaleString()} XP</div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-white text-sm font-bold">🔥 {streak}-day streak</div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-white text-sm font-bold">📚 Grade {user?.gradeLevel||3}</div>
          </div>
        </div>

        {/* Streak tracker */}
        <div className="card mb-6">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Your week</p>
          <div className="flex gap-2">
            {DAYS.map((day, i) => (
              <div key={day} className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all ${i < streak ? 'bg-[#5DCAA5] text-[#04342C]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Lessons */}
        <h2 className="font-black text-gray-900 dark:text-white mb-3" style={{fontFamily:'Nunito,sans-serif'}}>Today's lessons</h2>
        {lessons.length === 0 ? (
          <div className="card text-center text-gray-400 dark:text-gray-600 py-8 mb-6">
            <div className="text-3xl mb-2">📚</div>
            <p className="font-semibold text-sm">No lessons yet. Ask your teacher to add some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {lessons.map(l => {
              const c = SUBJ[l.subject] || SUBJ.math;
              return (
                <button key={l._id} onClick={() => navigate(`/child/lesson/${l._id}`)}
                  className={`card-sm ${c.bg} border ${c.border} text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-full`}>
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <p className={`font-black text-sm mb-0.5 ${c.txt}`} style={{fontFamily:'Nunito,sans-serif'}}>{l.topic}</p>
                  <p className={`text-xs mb-3 opacity-75 ${c.txt} capitalize`}>{l.subject} · Level {l.difficulty}</p>
                  <span className={`inline-block ${c.btn} text-xs font-bold px-3 py-1.5 rounded-lg`}>Start ▶</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quizzes */}
        {quizzes.length > 0 && (
          <>
            <h2 className="font-black text-gray-900 dark:text-white mb-3" style={{fontFamily:'Nunito,sans-serif'}}>Live quizzes 🔴</h2>
            <div className="flex flex-col gap-3 mb-6">
              {quizzes.map(q => (
                <div key={q._id} className="card flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/child/quizzes')}>
                  <div className="flex-1">
                    <span className={`badge ${q.subject==='math'?'badge-indigo':q.subject==='science'?'badge-teal':'badge-amber'} mb-1`}>{q.subject}</span>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{q.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">+{q.xpReward} XP · {q.participants?.length||0} joined</p>
                  </div>
                  <button className="btn btn-indigo btn-sm shrink-0">Join ▶</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Daily challenge */}
        <div className="rounded-2xl p-4 bg-[#FAEEDA] dark:bg-[#633806]/20 border border-[#FAC775] dark:border-[#633806]/40">
          <p className="font-black text-[#633806] dark:text-[#FAC775] text-sm mb-1" style={{fontFamily:'Nunito,sans-serif'}}>🔥 Daily challenge</p>
          <p className="text-[#854F0B] dark:text-[#FAC775]/80 text-sm">Complete 3 lessons today to earn the <strong>Daily Hero</strong> badge and +200 XP!</p>
        </div>

        {/* Badge modal */}
        {newBadge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setNewBadge(null)}>
            <div className="card max-w-xs w-full text-center animate-bounce-in" onClick={e => e.stopPropagation()}>
              <div className="text-6xl mb-4">🏅</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2" style={{fontFamily:'Nunito,sans-serif'}}>Badge unlocked!</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">{newBadge}</p>
              <button className="btn btn-teal btn-full" onClick={() => setNewBadge(null)}>Awesome! 🎉</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}