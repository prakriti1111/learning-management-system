import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import {useAuth} from './context/AuthContext'

//Child Pages

import ChildHome        from './pages/child/ChildHome';
import ChildLesson      from './pages/child/ChildLesson';
import ChildBadges      from './pages/child/ChildBadges';
import ChildLeaderboard from './pages/child/ChildLeaderboard';
import ChildQuizzes     from './pages/child/ChildQuizzes';
import ChildFeedback    from './pages/child/ChildFeedback';
import ChildChatbot     from './pages/child/ChildChatbot';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
 
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Nunito,sans-serif', color:'#888' }}>
        Loading…
      </div>
    );
  }
 
  if (!user) return <Navigate to="/login" replace />;
 
  if (roles && !roles.includes(user.role)) {
    const homes = { child:'/child', teacher:'/teacher', parent:'/parent', admin:'/admin' };
    return <Navigate to={homes[user.role] || '/login'} replace />;
  }
 
  return children;
}

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/" replace />;
  const homes = { child:'/child', teacher:'/teacher', parent:'/parent', admin:'/admin' };
  return <Navigate to={homes[user.role] || '/'} replace />;
}
 
const P = (roles, Comp) => (
  <ProtectedRoute roles={roles}><Comp /></ProtectedRoute>
);



function App() {

  return (
    <Routes>
        <Route path="/" element={<LandingPage/>} />
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
    </Routes>
  )
}

export default App
