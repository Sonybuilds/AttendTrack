import {  Routes, Route } from "react-router-dom";

import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import TeacherProfile from "./pages/TeacherProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

import StudentManage from "./components/manageStudent.jsx";
import RequireTeacherSession from "./components/RequireTeacherSession.jsx";
import RequireStudentSession from "./components/RequireStudentSession.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-900">Teacher account required</h1><p className="mt-2 text-sm text-slate-600">Teacher accounts are created by an AttendTrack administrator. Contact your administrator for access.</p><a href="/login" className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Go to login</a></section></div>} />

        <Route element={<RequireTeacherSession requiredRole="admin" />}>
          <Route path="/attendtrack/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<RequireStudentSession />}>
          <Route path="/attendtrack/student" element={<StudentDashboard />} />
        </Route>

        <Route element={<RequireTeacherSession requiredRole="teacher" />}>
          <Route path="attendtrack/dashboard" element={<Dashboard/>}/>
          <Route path="attendtrack/dashboard/*" element={<Dashboard/>}/>
          <Route path="attendtrack/dashboard/profile" element={<TeacherProfile/>}/>
          <Route path="/attendtrack/dashboard/class/student-manage" element={<StudentManage/>}/>
        </Route>
      </Routes>
  );
}

export default App;
