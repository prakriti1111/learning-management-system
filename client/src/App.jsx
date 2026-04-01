import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSchools from './pages/admin/AdminSchools';
import AdminContent from './pages/admin/AdminContent';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherSchedule from './pages/teacher/TeacherSchedule';
import TeacherContent from './pages/teacher/TeacherContent';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';

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


        <Route path="/admin"               element={P(['admin'], AdminDashboard)} />
        <Route path="/admin/users"         element={P(['admin'], AdminUsers)} />
        <Route path="/admin/schools"       element={P(['admin'], AdminSchools)} />
        <Route path="/admin/content"       element={P(['admin'], AdminContent)} />
        <Route path="/admin/analytics"       element={P(['admin'], AdminAnalytics)} />
        <Route path="/admin/reports"       element={P(['admin'], AdminReports)} />


        <Route path="/teacher"    element={P(['teacher','admin'], TeacherDashboard)} />
        <Route path="/teacher/students"    element={P(['teacher','admin'], TeacherStudents)} />
        <Route path="/teacher/schedule"    element={P(['teacher','admin'], TeacherSchedule)} />
        <Route path="/teacher/content"    element={P(['teacher','admin'], TeacherContent)} />
      </Routes>
  )
}

export default App
