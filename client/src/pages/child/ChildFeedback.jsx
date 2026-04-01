import { useState } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const TAGS = ['🎮 Games','🎵 Audio lessons','🏅 Badges','📝 Quizzes','🤖 Buddy chatbot','📚 Lessons'];

export default function ChildFeedback() {
  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [tags,      setTags]      = useState([]);
  const [message,   setMessage]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const toggle = t => setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);

  async function handleSubmit() {
    if (!rating || saving) return;
    setSaving(true);
    try { await api.post('/feedback', { rating, tags, message }); setSubmitted(true); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  if (submitted) return (
    <div className="app-layout"><NavBar />
      <main className="app-content page flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">🙏</div>
        <h2 className="font-black text-xl text-gray-900 dark:text-white mb-2" style={{fontFamily:'Nunito,sans-serif'}}>Thank you!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">Your feedback helps us make LearnBright more fun for you.</p>
      </main>
    </div>
  );

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page" style={{maxWidth:520}}>
        <h1 className="dark:text-white mb-1" style={{fontFamily:'Nunito,sans-serif'}}>💬 Feedback</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tell us how we can make learning more fun!</p>
        <div className="card">
          <div className="form-group">
            <label className="label">How was today's learning?</label>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="text-3xl bg-transparent border-none cursor-pointer transition-all duration-100 hover:scale-110 active:scale-95"
                  style={{opacity: n <= (hover||rating) ? 1 : 0.2}}>
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">What did you like best?</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TAGS.map(t => (
                <button key={t} onClick={() => toggle(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    tags.includes(t) ? 'bg-[#E1F5EE] dark:bg-[#085041]/20 border-[#5DCAA5] text-[#085041] dark:text-[#5DCAA5]' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Tell us more (optional)</label>
            <textarea className="textarea" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write anything you want to share…" />
          </div>
          <button className="btn btn-teal btn-full btn-lg" onClick={handleSubmit} disabled={!rating || saving}>
            {saving ? 'Sending…' : 'Send feedback ✓'}
          </button>
        </div>
      </main>
    </div>
  );
}