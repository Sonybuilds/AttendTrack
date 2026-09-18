import {  Routes, Route } from "react-router-dom";

import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Profile from "./pages/profile.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>} />

        <Route path="attendtrack/dashboard" element={<Dashboard/>}/>
        <Route path="attendtrack/dashboard/*" element={<Dashboard/>}/>
        <Route path="attendtrack/dashboard/profile" element={<Profile/>}/>

      </Routes>
  );
}

export default App;