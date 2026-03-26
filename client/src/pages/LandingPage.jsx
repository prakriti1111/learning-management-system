// import { Link } from "react-router-dom";

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#E1F5EE] via-white to-[#EEEDFE] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6">
      
//       <div className="text-center max-w-2xl w-full">

//         {/* Logo */}
//         <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-md flex items-center justify-center text-4xl mx-auto mb-6">
//           🎓
//         </div>

//         {/* Title */}
//         <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3"
//           style={{ fontFamily: "Nunito, sans-serif" }}>
//           Study Hub
//         </h1>

//         {/* Subtitle */}
//         <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
//           Smart learning platform for students, teachers, and parents
//         </p>

//         {/* Buttons */}
//         <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
//           <Link to="/login">
//             <button className="btn btn-teal btn-lg w-full md:w-48">
//               Login →
//             </button>
//           </Link>

//           <Link to="/register">
//             <button className="btn btn-outline btn-lg w-full md:w-48">
//               Register
//             </button>
//           </Link>
//         </div>

//         {/* Role Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[
//             { role: "Student", icon: "🧑‍🎓" },
//             { role: "Teacher", icon: "👩‍🏫" },
//             { role: "Parent", icon: "👨‍👩‍👧" },
//             { role: "Admin", icon: "🛠️" },
//           ].map((r) => (
//             <div
//               key={r.role}
//               className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
//             >
//               <div className="text-2xl mb-2">{r.icon}</div>
//               <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//                 {r.role}
//               </p>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

// ── Floating orb background ───────────────────────────────────────────────────
function Orb({ style }) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"
      style={style}
    />
  );
}

// ── Stat counter animation ────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const t = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(t); }
        else setVal(Math.floor(start));
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Role card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, icon, color, bg, borderColor, textColor, desc, features, loginEmail, loginPass, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-3xl border-2 p-6 transition-all duration-300 cursor-default ${bg} ${borderColor} ${hovered ? 'scale-[1.02] shadow-2xl' : 'shadow-md'}`}
    >
      {/* Role icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
        <div>
          <h3 className={`font-black text-lg ${textColor}`} style={{ fontFamily: 'Nunito,sans-serif' }}>{role}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-1.5 mb-5">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${color}`}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/login', { state: { prefill: { email: loginEmail, password: loginPass } } })}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 border-none cursor-pointer ${color} hover:opacity-90`}
          style={{ fontFamily: 'Nunito,sans-serif' }}
        >
          Sign in
        </button>
        <button
          onClick={() => navigate('/register', { state: { role: role.toLowerCase() } })}
          className="flex-1 py-2.5 rounded-xl text-xs font-black border-2 bg-transparent transition-all active:scale-95 cursor-pointer hover:opacity-80"
          style={{ fontFamily: 'Nunito,sans-serif', borderColor: 'currentColor', color: 'inherit' }}
        >
          Register
        </button>
      </div>

      {/* Demo badge */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">Demo: {loginEmail}</span>
      </div>
    </div>
  );
}

// ── Feature block ─────────────────────────────────────────────────────────────
function Feature({ icon, title, desc, delay }) {
  return (
    <div
      className="flex gap-4 items-start animate-fade-up"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="w-10 h-10 rounded-2xl bg-[#E1F5EE] dark:bg-[#085041]/20 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1" style={{ fontFamily: 'Nunito,sans-serif' }}>{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Main landing page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate      = useNavigate();
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const roles = [
    {
      role: 'Admin',
      icon: '🛡️',
      color:       'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      bg:          'bg-red-50/60 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800/40',
      textColor:   'text-red-800 dark:text-red-300',
      desc:        'Platform administrator',
      loginEmail:  'admin@learnbright.com',
      loginPass:   'Admin@123',
      features:    ['Manage all users & schools', 'Approve & remove content', 'Platform-wide analytics', 'Export reports as CSV'],
    },
    {
      role: 'Teacher',
      icon: '👩‍🏫',
      color:       'bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB]',
      bg:          'bg-blue-50/60 dark:bg-[#185FA5]/5',
      borderColor: 'border-[#B5D4F4] dark:border-[#185FA5]/30',
      textColor:   'text-[#185FA5] dark:text-[#85B7EB]',
      desc:        'Class educator',
      loginEmail:  'teacher@learnbright.com',
      loginPass:   'Teacher@123',
      features:    ['Real-time class dashboard', 'Schedule parent meetings', 'Create adaptive lessons', 'Track struggling students'],
    },
    {
      role: 'Parent',
      icon: '👨‍👩‍👧',
      color:       'bg-[#EEEDFE] dark:bg-[#3C3489]/20 text-[#3C3489] dark:text-[#AFA9EC]',
      bg:          'bg-[#EEEDFE]/60 dark:bg-[#3C3489]/5',
      borderColor: 'border-[#AFA9EC] dark:border-[#3C3489]/30',
      textColor:   'text-[#3C3489] dark:text-[#AFA9EC]',
      desc:        "Child's guardian",
      loginEmail:  'parent@learnbright.com',
      loginPass:   'Parent@123',
      features:    ['AI weekly progress reports', 'Join parent-teacher meets', 'Home learning tips', 'Achievement alerts'],
    },
    {
      role: 'Child',
      icon: '👦',
      color:       'bg-[#E1F5EE] dark:bg-[#085041]/20 text-[#085041] dark:text-[#5DCAA5]',
      bg:          'bg-[#E1F5EE]/60 dark:bg-[#085041]/5',
      borderColor: 'border-[#9FE1CB] dark:border-[#085041]/30',
      textColor:   'text-[#085041] dark:text-[#5DCAA5]',
      desc:        'Grade 1–6 learner',
      loginEmail:  'child@learnbright.com',
      loginPass:   'Child@123',
      features:    ['Adaptive AI lessons', 'Earn badges & XP', 'Live quiz competitions', 'Ask Buddy chatbot'],
    },
  ];

  const features = [
    { icon: '🧠', title: 'Adaptive AI engine',        desc: 'SM-2 spaced repetition selects the perfect next lesson for every child based on mastery scores.',        delay: '0ms'   },
    { icon: '🏅', title: 'Gamification',               desc: 'Badges, XP, streaks, and leaderboards keep children engaged and coming back every day.',                 delay: '60ms'  },
    { icon: '📊', title: 'Teacher analytics',          desc: 'Real-time heatmaps, subject radars, and at-risk student alerts — all from one dashboard.',               delay: '120ms' },
    { icon: '📋', title: 'AI parent reports',          desc: 'GPT-4o generates personalised weekly summaries with home tips, sent by SMS and email.',                  delay: '180ms' },
    { icon: '🎤', title: 'Voice input',                desc: 'Children answer questions by speaking — Whisper transcribes their voice in Hindi, English, Tamil, more.', delay: '240ms' },
    { icon: '🌙', title: 'Dark mode',                  desc: 'Full dark/light theme with system preference detection and localStorage persistence.',                    delay: '300ms' },
    { icon: '📅', title: 'Smart scheduling',           desc: 'Teachers schedule meetings — parents get Google Meet link, SMS, and email instantly.',                    delay: '360ms' },
    { icon: '🤖', title: 'Buddy chatbot',              desc: 'Age-appropriate AI tutor explains concepts in simple language with real Indian examples.',                delay: '420ms' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f14] transition-colors duration-200">

      {/* ── Sticky navbar ────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E1F5EE] dark:bg-[#085041]/30 flex items-center justify-center text-lg">📚</div>
            <span className="font-black text-gray-900 dark:text-white text-lg" style={{ fontFamily: 'Nunito,sans-serif' }}>Study Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-none cursor-pointer text-sm">
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
              style={{ fontFamily: 'Nunito,sans-serif' }}>
              Sign in
            </button>
            <button onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-[#5DCAA5] text-[#04342C] hover:bg-[#1D9E75] hover:text-white transition-all border-none cursor-pointer"
              style={{ fontFamily: 'Nunito,sans-serif' }}>
              Get started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background orbs */}
        <Orb style={{ width:600, height:600, top:-200, right:-200, background:'#5DCAA5' }} />
        <Orb style={{ width:400, height:400, bottom:-100, left:-100, background:'#7F77DD' }} />
        <Orb style={{ width:300, height:300, top:'30%', left:'20%', background:'#EF9F27' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle,#000 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E1F5EE] dark:bg-[#085041]/20 border border-[#9FE1CB] dark:border-[#085041]/40 rounded-full px-4 py-1.5 text-xs font-bold text-[#085041] dark:text-[#5DCAA5] mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-[#5DCAA5] animate-pulse-soft" />
            Adaptive learning for rural India · Grade 1–6
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4 leading-tight animate-fade-up"
            style={{ fontFamily: 'Nunito,sans-serif', animationDelay: '60ms', animationFillMode: 'both' }}
          >
            Every child<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#5DCAA5,#1D9E75)' }}>
              deserves
            </span>{' '}to learn
          </h1>

          <p
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 animate-fade-up"
            style={{ animationDelay: '120ms', animationFillMode: 'both' }}
          >
            Study Hub brings AI-powered adaptive learning, gamified lessons, and real-time analytics to every school — even without reliable internet.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap gap-3 justify-center mb-12 animate-fade-up"
            style={{ animationDelay: '180ms', animationFillMode: 'both' }}
          >
            <button onClick={() => { const el = document.getElementById('roles'); el?.scrollIntoView({ behavior:'smooth' }); }}
              className="px-8 py-3.5 rounded-2xl text-base font-black bg-[#5DCAA5] text-[#04342C] hover:bg-[#1D9E75] hover:text-white transition-all active:scale-95 border-none cursor-pointer"
              style={{ fontFamily: 'Nunito,sans-serif' }}>
              Get started free →
            </button>
            <button onClick={() => { const el = document.getElementById('features'); el?.scrollIntoView({ behavior:'smooth' }); }}
              className="px-8 py-3.5 rounded-2xl text-base font-black bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-[#5DCAA5] transition-all active:scale-95 cursor-pointer"
              style={{ fontFamily: 'Nunito,sans-serif' }}>
              See features
            </button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 max-w-md mx-auto animate-fade-up"
            style={{ animationDelay: '240ms', animationFillMode: 'both' }}
          >
            {[
              { val: 500,  suffix: '+',  label: 'Students' },
              { val: 20,   suffix: '+',  label: 'Schools'  },
              { val: 98,   suffix: '%',  label: 'Retention' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
                  <Counter target={s.val} suffix={s.suffix} />
                </p>
                <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">scroll</span>
          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse-soft" />
        </div>
      </section>

      {/* ── Role cards ───────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-6 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#FAEEDA] dark:bg-[#633806]/20 text-[#633806] dark:text-[#FAC775] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Four roles, one platform
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
              Sign in as who you are
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
              Each role has its own dashboard, features, and access level. Click any card to log in instantly with demo credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(r => (
              <RoleCard key={r.role} {...r} navigate={navigate} />
            ))}
          </div>

          {/* Protected routes note */}
          <div className="mt-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-3">
            <div className="text-xl shrink-0">🔐</div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
                Protected routes are active
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Each role can only access its own pages. A child typing <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/admin</code> gets redirected to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/child</code> automatically. The API also enforces role checks server-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#EEEDFE] dark:bg-[#3C3489]/20 text-[#3C3489] dark:text-[#AFA9EC] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Built for real classrooms
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
              Everything a school needs
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map(f => <Feature key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>
              How it works
            </h2>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#5DCAA5] to-[#7F77DD] hidden md:block" style={{ left: 24 }} />
            <div className="flex flex-col gap-8">
              {[
                { step:'01', title:'Admin sets up the school',     desc:'Creates teacher and student accounts, links parents to children, assigns teachers to classes.',          icon:'🛡️', color:'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
                { step:'02', title:'Teacher adds lessons',          desc:'Creates MCQ, fill-in-blank, or audio lessons per subject. Admin approves content in the library.',      icon:'👩‍🏫', color:'bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-[#85B7EB]' },
                { step:'03', title:'Child learns adaptively',       desc:'SM-2 algorithm picks the perfect lesson. Child answers with tap, type, or voice. Earns XP and badges.', icon:'👦', color:'bg-[#E1F5EE] dark:bg-[#085041]/20 text-[#085041] dark:text-[#5DCAA5]' },
                { step:'04', title:'Parent stays informed',         desc:'Receives AI-generated weekly reports by SMS and email. Joins teacher meetings via Google Meet.',         icon:'👨‍👩‍👧', color:'bg-[#EEEDFE] dark:bg-[#3C3489]/20 text-[#3C3489] dark:text-[#AFA9EC]' },
              ].map(s => (
                <div key={s.step} className="flex gap-6 items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${s.color}`} style={{ zIndex: 1, position: 'relative' }}>
                    {s.icon}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">{s.step}</span>
                      <h3 className="font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Nunito,sans-serif' }}>{s.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech stack ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              ['⚛️', 'React 18'],    ['⚡', 'Vite'],        ['🍃', 'MongoDB'],
              ['🟩', 'Node.js'],     ['🚂', 'Express'],     ['🤖', 'OpenAI GPT-4o'],
              ['🎨', 'Tailwind CSS'],['🐍', 'FastAPI'],      ['🎤', 'Whisper'],
              ['📱', 'Twilio SMS'],  ['📧', 'Nodemailer'],  ['📅', 'Google Calendar'],
            ].map(([icon, name]) => (
              <div key={name}
                className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <span>{icon}</span> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA footer ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <Orb style={{ width:400, height:400, top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#5DCAA5' }} />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Nunito,sans-serif' }}>
            Ready to transform<br />your school?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Set up in 5 minutes. No credit card. No app store needed.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-2xl text-base font-black bg-[#5DCAA5] text-[#04342C] hover:bg-[#1D9E75] hover:text-white transition-all active:scale-95 border-none cursor-pointer"
              style={{ fontFamily: 'Nunito,sans-serif' }}>
              Start for free →
            </button>
            <button onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-2xl text-base font-black border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-transparent hover:border-[#5DCAA5] transition-all active:scale-95 cursor-pointer"
              style={{ fontFamily: 'Nunito,sans-serif' }}>
              Use demo account
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#E1F5EE] dark:bg-[#085041]/30 flex items-center justify-center text-sm">📚</div>
            <span className="font-black text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Nunito,sans-serif' }}>Study Hub</span>
          </div>
          <p className="text-xs text-gray-400">Built for rural India · MERN + Python AI · Open source</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')}
              className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer font-semibold">
              Sign in
            </button>
            <button onClick={() => navigate('/register')}
              className="text-xs text-[#085041] dark:text-[#5DCAA5] font-bold hover:underline bg-transparent border-none cursor-pointer">
              Register →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}