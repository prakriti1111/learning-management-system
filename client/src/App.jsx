import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage  from './pages/LandingPage';
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import ChildHome        from './pages/child/ChildHome';
import ChildLesson      from './pages/child/ChildLesson';
import ChildBadges      from './pages/child/ChildBadges';
import ChildLeaderboard from './pages/child/ChildLeaderboard';
import ChildQuizzes     from './pages/child/ChildQuizzes';
import ChildFeedback    from './pages/child/ChildFeedback';
import ChildChatbot     from './pages/child/ChildChatbot';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents  from './pages/teacher/TeacherStudents';
import TeacherSchedule  from './pages/teacher/TeacherSchedule';
import TeacherContent   from './pages/teacher/TeacherContent';

import ParentHome     from './pages/parent/ParentHome';
import ParentReport   from './pages/parent/ParentReport';
import ParentCalendar from './pages/parent/ParentCalendar';
import ParentFeedback from './pages/parent/ParentFeedback';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminSchools   from './pages/admin/AdminSchools';
import AdminContent   from './pages/admin/AdminContent';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports   from './pages/admin/AdminReports';

// ── Protected route wrapper ────────────────────────────────────────────────────
// Redirects to /login if not authenticated.
// Redirects to role home if authenticated but wrong role.
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Nunito,sans-serif', color:'#888' }}>
        Loading…
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → redirect to own home
  if (roles && !roles.includes(user.role)) {
    const homes = { child:'/child', teacher:'/teacher', parent:'/parent', admin:'/admin' };
    return <Navigate to={homes[user.role] || '/login'} replace />;
  }

  return children;
}

// ── Role-based home redirect ───────────────────────────────────────────────────
function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/" replace />;
  const homes = { child:'/child', teacher:'/teacher', parent:'/parent', admin:'/admin' };
  return <Navigate to={homes[user.role] || '/'} replace />;
}

// Helper to reduce repetition
const P = (roles, Comp) => (
  <ProtectedRoute roles={roles}><Comp /></ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      {/* Public ─────────────────────────────────────────────────────────── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home"     element={<RoleHome />} />

      {/* Child ──────────────────────────────────────────────────────────── */}
      <Route path="/child"               element={P(['child'], ChildHome)} />
      <Route path="/child/lesson/:id"    element={P(['child'], ChildLesson)} />
      <Route path="/child/badges"        element={P(['child'], ChildBadges)} />
      <Route path="/child/leaderboard"   element={P(['child'], ChildLeaderboard)} />
      <Route path="/child/quizzes"       element={P(['child'], ChildQuizzes)} />
      <Route path="/child/feedback"      element={P(['child'], ChildFeedback)} />
      <Route path="/child/chat"          element={P(['child'], ChildChatbot)} />

      {/* Teacher ────────────────────────────────────────────────────────── */}
      <Route path="/teacher"             element={P(['teacher','admin'], TeacherDashboard)} />
      <Route path="/teacher/students"    element={P(['teacher','admin'], TeacherStudents)} />
      <Route path="/teacher/schedule"    element={P(['teacher','admin'], TeacherSchedule)} />
      <Route path="/teacher/content"     element={P(['teacher','admin'], TeacherContent)} />

      {/* Parent ─────────────────────────────────────────────────────────── */}
      <Route path="/parent"              element={P(['parent'], ParentHome)} />
      <Route path="/parent/report"       element={P(['parent'], ParentReport)} />
      <Route path="/parent/calendar"     element={P(['parent'], ParentCalendar)} />
      <Route path="/parent/feedback"     element={P(['parent'], ParentFeedback)} />

      {/* Admin ──────────────────────────────────────────────────────────── */}
      <Route path="/admin"               element={P(['admin'], AdminDashboard)} />
      <Route path="/admin/users"         element={P(['admin'], AdminUsers)} />
      <Route path="/admin/schools"       element={P(['admin'], AdminSchools)} />
      <Route path="/admin/content"       element={P(['admin'], AdminContent)} />
      <Route path="/admin/analytics"     element={P(['admin'], AdminAnalytics)} />
      <Route path="/admin/reports"       element={P(['admin'], AdminReports)} />

      {/* Fallback ───────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
