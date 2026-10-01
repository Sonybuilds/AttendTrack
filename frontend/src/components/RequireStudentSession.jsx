import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function RequireStudentSession() {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    api.get("/student/session")
      .then(() => { if (active) setStatus("valid"); })
      .catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, []);

  if (status === "checking") {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" aria-label="Checking student session" /></div>;
  }
  if (status === "invalid") return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
