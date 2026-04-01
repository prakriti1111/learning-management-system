import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content"><div className="loading">Loading analytics…</div></main>
    </div>
  );

  const { sessionsByDay = [], topStudents = [] } = data || {};

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page-wide">
        <h1 className="dark:text-white mb-1" style={{ fontFamily: 'Nunito,sans-serif' }}>📈 Platform analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">30-day view across all schools</p>

        {sessionsByDay.length === 0 && topStudents.length === 0 ? (
          <div className="card text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-3">📊</div>
            <p className="font-semibold">No analytics data yet.</p>
            <p className="text-sm mt-1">Data appears once students start completing lessons.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Sessions over time */}
              <div className="card">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Daily sessions (last 30 days)</h3>
                {sessionsByDay.length > 0 ? (
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sessionsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip labelFormatter={v => `Date: ${v}`} formatter={v => [v, 'Sessions']} />
                        <Line type="monotone" dataKey="count" stroke="#5DCAA5" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No session data yet</div>
                )}
              </div>

              {/* Top students */}
              <div className="card">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Top 10 students by XP</h3>
                {topStudents.length > 0 ? (
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topStudents} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip formatter={v => [v, 'XP']} />
                        <Bar dataKey="xp" fill="#7F77DD" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No student data yet</div>
                )}
              </div>
            </div>

            {/* XP per day */}
            {sessionsByDay.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">XP earned per day</h3>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip labelFormatter={v => `Date: ${v}`} formatter={v => [v, 'XP']} />
                      <Bar dataKey="xpTotal" fill="#EF9F27" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}