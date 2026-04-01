import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

export default function ChildQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(null);
  const [answers, setAnswers] = useState({});
  const [result,  setResult]  = useState(null);
  const [submitting,setSubmitting]=useState(false);

  useEffect(() => {
    api.get('/quizzes').then(r => setQuizzes(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function submitQuiz() {
    if (!active || submitting) return;
    setSubmitting(true);
    const total   = active.lessonIds?.length || 0;
    const correct = Object.values(answers).filter(v => v === 'correct').length;
    const score   = total ? Math.round((correct / total) * 100) : 0;
    try {
      const { data } = await api.post(`/quizzes/${active._id}/submit`, { score });
      setResult({ score, xpEarned: data.xpEarned });
      setActive(null);
    } catch (e) {
      console.error(e);
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading quizzes…</div></main></div>;

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        <h1 className="dark:text-white mb-1" style={{fontFamily:'Nunito,sans-serif'}}>📝 Live quizzes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Compete and earn bonus XP!</p>

        {result && (
          <div className="rounded-2xl p-5 bg-[#E1F5EE] dark:bg-[#085041]/15 border-2 border-[#5DCAA5] mb-6 text-center animate-bounce-in">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="font-black text-[#085041] dark:text-[#5DCAA5] text-xl mb-1" style={{fontFamily:'Nunito,sans-serif'}}>Score: {result.score}%</h2>
            <p className="text-[#0F6E56] dark:text-[#5DCAA5]/70 font-semibold">+{result.xpEarned} XP earned!</p>
            <button className="btn btn-teal mt-4" onClick={() => setResult(null)}>Close</button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {quizzes.length === 0 && (
            <div className="card text-center text-gray-400 dark:text-gray-600 py-10">
              <div className="text-4xl mb-3">🎮</div>
              <p className="font-semibold">No live quizzes right now. Check back soon!</p>
            </div>
          )}
          {quizzes.map(quiz => {
            const now    = new Date();
            const starts = new Date(quiz.startsAt);
            const ends   = new Date(quiz.endsAt);
            const live   = now >= starts && now <= ends;
            const soon   = starts > now;
            return (
              <div key={quiz._id} className="card hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${quiz.subject==='math'?'badge-indigo':quiz.subject==='science'?'badge-teal':'badge-amber'}`}>{quiz.subject}</span>
                      {live && <span className="badge badge-red animate-pulse-soft">● LIVE</span>}
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-gray-100 mb-1" style={{fontFamily:'Nunito,sans-serif'}}>{quiz.title}</h3>
                    <p className="text-xs text-gray-400">{quiz.lessonIds?.length||0} questions · +{quiz.xpReward} XP · {quiz.participants?.length||0} joined</p>
                    {soon && <p className="text-xs text-[#854F0B] dark:text-[#FAC775] mt-1 font-semibold">⏰ Starts {starts.toLocaleTimeString('en-IN',{timeStyle:'short'})}</p>}
                  </div>
                  {live && (
                    <button className="btn btn-indigo btn-sm shrink-0" onClick={() => { setActive(quiz); setAnswers({}); }}>Join ▶</button>
                  )}
                  {soon && (
                    <button className="btn btn-ghost btn-sm shrink-0" disabled>Coming soon</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiz modal */}
        {active && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md max-h-[80vh] overflow-y-auto animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>{active.title}</h2>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setActive(null)}>✕</button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Answer all questions then submit. This is a demo — tap any option.</p>
              {(active.lessonIds || []).map((_, i) => (
                <div key={i} className="card-sm mb-3">
                  <p className="font-bold text-sm mb-3 text-gray-700 dark:text-gray-300">Question {i + 1}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setAnswers(a => ({ ...a, [i]: 'correct' }))}
                      className={`btn btn-sm flex-1 ${answers[i]==='correct' ? 'btn-teal' : 'btn-ghost'}`}>Option A</button>
                    <button onClick={() => setAnswers(a => ({ ...a, [i]: 'wrong' }))}
                      className={`btn btn-sm flex-1 ${answers[i]==='wrong' ? 'btn-coral' : 'btn-ghost'}`}>Option B</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-indigo btn-full mt-2" onClick={submitQuiz} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit quiz'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
