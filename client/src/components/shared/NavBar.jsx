import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV = {
  child:   [
    { to:'/child',             emoji:'🏠', label:'Home'        },
    { to:'/child/badges',      emoji:'🏅', label:'Badges'      },
    { to:'/child/leaderboard', emoji:'🏆', label:'Leaderboard' },
    { to:'/child/quizzes',     emoji:'📝', label:'Quizzes'     },
    { to:'/child/chat',        emoji:'🤖', label:'Ask Buddy'   },
    { to:'/child/feedback',    emoji:'💬', label:'Feedback'    },
  ],
  teacher: [
    { to:'/teacher',           emoji:'📊', label:'Dashboard'   },
    { to:'/teacher/students',  emoji:'👥', label:'Students'    },
    { to:'/teacher/schedule',  emoji:'📅', label:'Schedule'    },
    { to:'/teacher/content',   emoji:'📚', label:'Content'     },
  ],
  parent:  [
    { to:'/parent',            emoji:'🏠', label:'Home'        },
    { to:'/parent/report',     emoji:'📋', label:'Reports'     },
    { to:'/parent/calendar',   emoji:'📅', label:'Calendar'    },
    { to:'/parent/feedback',   emoji:'💬', label:'Feedback'    },
  ],
  admin:   [
    { to:'/admin',             emoji:'🛡️', label:'Dashboard'   },
    { to:'/admin/users',       emoji:'👤', label:'Users'       },
    { to:'/admin/schools',     emoji:'🏫', label:'Schools'     },
    { to:'/admin/content',     emoji:'📚', label:'Content'     },
    { to:'/admin/analytics',   emoji:'📈', label:'Analytics'   },
    { to:'/admin/reports',     emoji:'📊', label:'Reports'     },
  ],
};

const ROLE_STYLES = {
  child:   { avatar:'bg-[#E1F5EE] text-[#085041]', accent:'#5DCAA5', label:'Student' },
  teacher: { avatar:'bg-[#E6F1FB] text-[#185FA5]', accent:'#378ADD', label:'Teacher' },
  parent:  { avatar:'bg-[#EEEDFE] text-[#3C3489]', accent:'#7F77DD', label:'Parent'  },
  admin:   { avatar:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',   accent:'#EF4444', label:'Admin'   },
};

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { dark, toggle } = useTheme();
  if (!user) return null;

  const role    = user.role;
  const links   = NAV[role] || NAV.teacher;
  const rs      = ROLE_STYLES[role] || ROLE_STYLES.teacher;
  const initials= user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <nav className="sidenav">
      {/* Brand */}
      <div className="px-4 pb-4 mb-1 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E1F5EE] dark:bg-[#085041]/30 flex items-center justify-center text-lg">📚</div>
          <span className="font-black text-gray-900 dark:text-white text-base" style={{fontFamily:'Nunito,sans-serif'}}>
          </span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">{rs.label} menu</span>
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to.split('/').length <= 2}
            className={({isActive}) => `sidenav-link${isActive?' active':''}`}>
            <span className="text-base w-5 text-center">{l.emoji}</span>
            {l.label}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto px-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {/* User info */}
        <div className="flex items-center gap-2.5 px-1">
          <div className={`avatar avatar-md ${rs.avatar}`}>{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate" style={{fontFamily:'Nunito,sans-serif'}}>{user.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{role}</p>
          </div>
        </div>

        {/* XP for child */}
        {role === 'child' && (
          <div className="bg-[#FAEEDA] dark:bg-[#633806]/20 rounded-xl px-3 py-1.5 text-xs font-bold text-[#633806] dark:text-[#FAC775]">
            ⭐ {(user.xp||0).toLocaleString()} XP
          </div>
        )}

        {/* Dark mode toggle */}
        <button onClick={toggle}
          className="btn btn-ghost btn-sm btn-full text-xs flex items-center gap-2 justify-center">
          <span>{dark ? '☀️' : '🌙'}</span>
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        {/* Sign out */}
        <button className="btn btn-ghost btn-sm btn-full text-xs"
          onClick={() => { logout(); navigate('/login'); }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}