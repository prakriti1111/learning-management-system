import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const BADGE_META = {
  first_lesson:  { icon:'🌟', name:'First Step',     desc:'Completed your first lesson!',         color:'bg-[#FAEEDA] dark:bg-[#633806]/20 border-[#FAC775]' },
  streak_3:      { icon:'🔥', name:'3-day streak',   desc:'Learned 3 days in a row!',              color:'bg-[#FAECE7] dark:bg-[#712B13]/20 border-[#F0997B]' },
  streak_7:      { icon:'⚡', name:'7-day hero',     desc:'One full week of learning!',            color:'bg-[#FAEEDA] dark:bg-[#633806]/20 border-[#FAC775]' },
  streak_30:     { icon:'👑', name:'Month master',   desc:'30-day streak — incredible!',           color:'bg-[#EEEDFE] dark:bg-[#3C3489]/20 border-[#AFA9EC]' },
  math_explorer: { icon:'🧮', name:'Math wizard',    desc:'Mastered 5 math skills!',               color:'bg-[#EEEDFE] dark:bg-[#3C3489]/20 border-[#AFA9EC]' },
  science_star:  { icon:'🔬', name:'Science star',   desc:'Mastered 5 science skills!',            color:'bg-[#E1F5EE] dark:bg-[#085041]/20 border-[#9FE1CB]' },
  hindi_hero:    { icon:'📖', name:'Hindi hero',     desc:'Mastered 5 Hindi skills!',              color:'bg-[#FAEEDA] dark:bg-[#633806]/20 border-[#FAC775]' },
  english_ace:   { icon:'🔤', name:'English ace',    desc:'Mastered 5 English skills!',            color:'bg-[#E6F1FB] dark:bg-[#185FA5]/20 border-[#B5D4F4]' },
  speed_reader:  { icon:'⚡', name:'Speed reader',   desc:'Finished a lesson in record time!',     color:'bg-[#FAEEDA] dark:bg-[#633806]/20 border-[#FAC775]' },
  perfect_score: { icon:'💯', name:'Perfect score',  desc:'Got 100% on a quiz!',                   color:'bg-[#E1F5EE] dark:bg-[#085041]/20 border-[#9FE1CB]' },
  top_of_class:  { icon:'🥇', name:'Top of class',   desc:'Reached #1 on the leaderboard!',        color:'bg-[#FAEEDA] dark:bg-[#633806]/20 border-[#FAC775]' },
  quiz_winner:   { icon:'🏆', name:'Quiz champion',  desc:'Won a live quiz!',                      color:'bg-[#EEEDFE] dark:bg-[#3C3489]/20 border-[#AFA9EC]' },
};

export default function ChildBadges() {
  const [earned,   setEarned]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/students/achievements')
      .then(r => setEarned(r.data.map(a => a.type)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading badges…</div></main></div>;

  const total = Object.keys(BADGE_META).length;
  const pct   = Math.round((earned.length / total) * 100);

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        <div className="flex items-center justify-between mb-2">
          <h1 className="dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>Your badges</h1>
          <span className="badge badge-teal">{earned.length}/{total} earned</span>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Collection progress</span>
            <span className="text-sm font-black text-[#085041] dark:text-[#5DCAA5]">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill bg-[#5DCAA5]" style={{width:`${pct}%`}} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
          {Object.entries(BADGE_META).map(([type, meta]) => {
            const isEarned = earned.includes(type);
            const isSel    = selected?.type === type;
            return (
              <button key={type}
                onClick={() => isEarned && setSelected(isSel ? null : { type, ...meta })}
                className={`card-sm text-center transition-all duration-200 ${isEarned ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'opacity-35 cursor-not-allowed'} ${isSel ? 'ring-2 ring-[#5DCAA5]' : ''}`}>
                <div className="text-4xl mb-2">{meta.icon}</div>
                <p className="text-xs font-black text-gray-900 dark:text-gray-100 leading-tight" style={{fontFamily:'Nunito,sans-serif'}}>{meta.name}</p>
                {!isEarned && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">🔒 Locked</p>}
                {isEarned  && <p className="text-xs text-[#085041] dark:text-[#5DCAA5] font-bold mt-1">✓ Earned</p>}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className={`rounded-2xl p-4 border-2 animate-fade-up ${selected.color}`}>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{selected.icon}</div>
              <div>
                <p className="font-black text-gray-900 dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>{selected.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selected.desc}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}