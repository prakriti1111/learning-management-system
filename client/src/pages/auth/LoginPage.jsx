import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

const ROLE_HOMES = { child:'/child', teacher:'/teacher', parent:'/parent', admin:'/admin' };

const DEMO_ACCOUNTS = [
  { label:'Admin',   email:'admin@learnbright.com',   pass:'Admin@123',   icon:'🛡️', color:'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
  { label:'Teacher', email:'teacher@learnbright.com', pass:'Teacher@123', icon:'👩‍🏫', color:'bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB]' },
  { label:'Parent',  email:'parent@learnbright.com',  pass:'Parent@123',  icon:'👨‍👩‍👧', color:'bg-[#EEEDFE] dark:bg-[#3C3489]/20 text-[#3C3489] dark:text-[#AFA9EC]' },
  { label:'Child',   email:'child@learnbright.com',   pass:'Child@123',   icon:'👦',  color:'bg-[#E1F5EE] dark:bg-[#085041]/20 text-[#085041] dark:text-[#5DCAA5]' },
];

export default function LoginPage() {
  const { login, setUser } = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const googleBtnRef       = useRef(null);

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { renderGoogleButton } = useGoogleAuth({
    role:      'child',
    onSuccess: (user) => {
      setUser(user);
      navigate(ROLE_HOMES[user.role] || '/home');
    },
    onError: (msg) => setError(msg),
  });

  // Mount Google button
  useEffect(() => {
    renderGoogleButton(googleBtnRef.current);
  }, [renderGoogleButton]);

  // Pre-fill from landing page role card clicks
  useEffect(() => {
    if (location.state?.prefill) {
      setForm({
        email:    location.state.prefill.email    || '',
        password: location.state.prefill.password || '',
      });
    }
  }, [location.state]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_HOMES[user.role] || '/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E1F5EE] via-white to-[#EEEDFE] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 bg-transparent border-none cursor-pointer font-semibold transition-colors">
          ← Back to Study Hub
        </button>

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">📚</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
            Study Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="card">
          {error && (
            <div className="alert-danger mb-5">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* ── Google Sign-In button ─────────────────────────────────── */}
          <div className="mb-4">
            {/* Google renders its own button here via the SDK */}
            <div ref={googleBtnRef} className="w-full" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* ── Email / Password form ─────────────────────────────────── */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" required autoComplete="email"
                placeholder="your@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" required autoComplete="current-password"
                placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <button className="btn btn-teal btn-full btn-lg mt-1" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="divider" />

          {/* ── Demo quick-fill ───────────────────────────────────────── */}
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-center">
              Demo accounts — click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(d => (
                <button key={d.label} type="button"
                  onClick={() => setForm({ email: d.email, password: d.pass })}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border-none hover:opacity-80 ${d.color}`}
                  style={{ fontFamily: 'Nunito,sans-serif' }}>
                  <span className="text-sm">{d.icon}</span>
                  {d.label}
                  <span className="ml-auto opacity-50 font-normal text-[10px]">click</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-5">
            No account?{' '}
            <Link to="/register" className="text-[#085041] dark:text-[#5DCAA5] font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}