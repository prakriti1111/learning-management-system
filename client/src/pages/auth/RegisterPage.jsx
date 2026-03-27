import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

const ROLE_HOMES = { child:'/child', teacher:'/teacher', parent:'/parent', admin:'/admin' };

const ROLE_OPTS = [
  { val:'child',   icon:'👦',   lbl:'Student'  },
  { val:'teacher', icon:'👩‍🏫', lbl:'Teacher'  },
  { val:'parent',  icon:'👨‍👩‍👧', lbl:'Parent'  },
  { val:'admin',   icon:'🛡️',  lbl:'Admin'    },
];

const ROLE_RING = {
  child:   'ring-[#5DCAA5] bg-[#E1F5EE] dark:bg-[#085041]/20',
  teacher: 'ring-[#378ADD] bg-[#E6F1FB] dark:bg-[#185FA5]/20',
  parent:  'ring-[#7F77DD] bg-[#EEEDFE] dark:bg-[#3C3489]/20',
  admin:   'ring-red-400   bg-red-50    dark:bg-red-900/20',
};

export default function RegisterPage() {
  const { register, setUser } = useAuth();
  const navigate              = useNavigate();
  const location              = useLocation();
  const googleBtnRef          = useRef(null);

  const [form, setForm] = useState({
    name:'', email:'', password:'', role:'child',
    gradeLevel:3, phone:'', language:'hi', classId:'',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.role) {
      const r = location.state.role.toLowerCase();
      if (ROLE_OPTS.map(o => o.val).includes(r)) {
        setForm(f => ({ ...f, role: r }));
      }
    }
  }, [location.state]);

  const { renderGoogleButton } = useGoogleAuth({
    role:      form.role,
    onSuccess: (user) => {
      setUser(user);
      navigate(ROLE_HOMES[user.role] || '/home');
    },
    onError: (msg) => setError(msg),
  });

  useEffect(() => {
    renderGoogleButton(googleBtnRef.current);
  }, [renderGoogleButton, form.role]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(ROLE_HOMES[user.role] || '/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E1F5EE] via-white to-[#EEEDFE] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <button onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 bg-transparent border-none cursor-pointer font-semibold transition-colors">
          ← Back to Study Hub
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-3">📚</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
            Create account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join Study Hub today</p>
        </div>

        <div className="card">
          {error && (
            <div className="alert-danger mb-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="form-group">
            <label className="label">I am a</label>
            <div className="grid grid-cols-4 gap-2">
              {ROLE_OPTS.map(r => (
                <button key={r.val} type="button" onClick={() => set('role', r.val)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    form.role === r.val
                      ? `ring-2 ${ROLE_RING[r.val]} border-transparent`
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ fontFamily: 'Nunito,sans-serif' }}>
                  <span className="text-xl">{r.icon}</span>
                  {r.lbl}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-1.5">
              This role applies to Google sign-in too ↓
            </p>
          </div>

          <div className="mb-4">
            <div ref={googleBtnRef} className="w-full" key={form.role} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">or register with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Full name</label>
              <input className="input" required value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Arjun Sharma" />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6}
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="min 6 characters" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">Language</label>
                <select className="select" value={form.language} onChange={e => set('language', e.target.value)}>
                  <option value="hi">Hindi</option>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Phone (optional)</label>
                <input className="input" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+91 98765..." />
              </div>
            </div>

            {form.role === 'child' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">Grade</label>
                  <select className="select" value={form.gradeLevel}
                    onChange={e => set('gradeLevel', parseInt(e.target.value))}>
                    {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Class ID</label>
                  <input className="input" value={form.classId}
                    onChange={e => set('classId', e.target.value)} placeholder="e.g. 4A" />
                </div>
              </div>
            )}

            <button className="btn btn-teal btn-full btn-lg mt-2" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#085041] dark:text-[#5DCAA5] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}