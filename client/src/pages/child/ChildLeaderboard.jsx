import { useState, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const RANK_STYLE = [
  { bg:'bg-[#FAEEDA] dark:bg-[#633806]/20', txt:'text-[#633806] dark:text-[#FAC775]', icon:'🥇' },
  { bg:'bg-[#F1EFE8] dark:bg-gray-800',     txt:'text-gray-600 dark:text-gray-400',   icon:'🥈' },
  { bg:'bg-[#FAECE7] dark:bg-[#712B13]/20', txt:'text-[#712B13] dark:text-[#F0997B]', icon:'🥉' },
];

export default function ChildLeaderboard() {
  const { user }  = useAuth();
  const [board,   setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/leaderboard')
      .then(r => setBoard(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><NavBar /><main className="app-content"><div className="loading">Loading leaderboard…</div></main></div>;

  const myEntry = board.find(e => e.studentId?.toString() === user?._id?.toString());

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page">
        <h1 className="dark:text-white mb-1" style={{fontFamily:'Nunito,sans-serif'}}>🏆 Leaderboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Ranked by XP and badges</p>

        {myEntry && (
          <div className="rounded-2xl p-4 mb-5 bg-[#E1F5EE] dark:bg-[#085041]/15 border-2 border-[#5DCAA5] flex items-center gap-3 animate-fade-up">
            <div className="w-10 h-10 rounded-full bg-[#5DCAA5] text-[#04342C] flex items-center justify-center font-black text-lg" style={{fontFamily:'Nunito,sans-serif'}}>
              {myEntry.rank}
            </div>
            <div className="flex-1">
              <p className="font-black text-[#085041] dark:text-[#5DCAA5]" style={{fontFamily:'Nunito,sans-serif'}}>You are #{myEntry.rank}!</p>
              <p className="text-xs text-[#0F6E56] dark:text-[#5DCAA5]/70">🏅 {myEntry.badgeCount} badges · ⭐ {myEntry.xp?.toLocaleString()} XP</p>
            </div>
          </div>
        )}

        {board.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-semibold">No rankings yet. Be the first to earn XP!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {board.map((entry, i) => {
              const isMe = entry.studentId?.toString() === user?._id?.toString();
              const rs   = RANK_STYLE[i];
              return (
                <div key={entry.studentId?.toString() || i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isMe ? 'bg-[#E1F5EE] dark:bg-[#085041]/15 border-[#5DCAA5] border-2' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${rs ? `${rs.bg} ${rs.txt}` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {i < 3 ? rs.icon : entry.rank}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB] flex items-center justify-center font-black text-sm flex-shrink-0">
                    {(entry.name || '?').split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate" style={{fontFamily:'Nunito,sans-serif'}}>
                      {entry.name}
                      {isMe && <span className="ml-2 badge badge-teal text-xs">You</span>}
                    </p>
                    <p className="text-xs text-gray-400">🏅 {entry.badgeCount} badges</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-[#085041] dark:text-[#5DCAA5]" style={{fontFamily:'Nunito,sans-serif'}}>{entry.xp?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}