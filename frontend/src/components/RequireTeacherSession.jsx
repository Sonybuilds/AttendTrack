import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function RequireTeacherSession({ requiredRole = "teacher" }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");
  const [role, setRole] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/teacher/session")
      .then((response) => {
        if (!active) return;
        setRole(response.data.teacher?.role || "teacher");
        setStatus("valid");
      })
      .catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, []);

  if (status === "checking") {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" aria-label="Checking teacher session" /></div>;
  }
  if (status === "invalid") return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/attendtrack/admin" : "/attendtrack/dashboard"} replace />;
  }
  return <Outlet />;
}
