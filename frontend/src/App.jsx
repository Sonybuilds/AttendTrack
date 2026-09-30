import {  Routes, Route } from "react-router-dom";

import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import TeacherProfile from "./pages/TeacherProfile.jsx";

import StudentManage from "./components/manageStudent.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>} />

        <Route path="attendtrack/dashboard" element={<Dashboard/>}/>
        <Route path="attendtrack/dashboard/*" element={<Dashboard/>}/>
        <Route path="attendtrack/dashboard/profile" element={<TeacherProfile/>}/>
        <Route path="/attendtrack/dashboard/class/student-manage" element={<StudentManage/>}/>
      </Routes>
  );
}

export default App;