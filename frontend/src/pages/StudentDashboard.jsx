import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import { FiBookOpen, FiCalendar, FiClock, FiLogOut, FiMapPin, FiUser } from "react-icons/fi";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const currentMonth = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
};

const timeLabel = (value) => {
  if (!value) return "Time not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time not set" : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState({ student: null, subjects: [], attendance: [] });
  const [month, setMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPortal = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/student/portal");
      setPortal({
        student: response.data.student || null,
        subjects: response.data.subjects || [],
        attendance: response.data.attendance || [],
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load your student portal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(loadPortal); }, [loadPortal]);
  useEffect(() => { document.title = "AttendTrack | Student Portal"; }, []);

  const monthAttendance = useMemo(() => portal.attendance.filter((record) => record.date?.startsWith(`${month}-`)), [portal.attendance, month]);
  const totals = useMemo(() => monthAttendance.reduce((result, record) => {
    if (record.status === "Present") result.present += 1;
    if (record.status === "Absent") result.absent += 1;
    return result;
  }, { present: 0, absent: 0 }), [monthAttendance]);
  const rate = totals.present + totals.absent ? Math.round((totals.present / (totals.present + totals.absent)) * 100) : 0;
  const chartData = useMemo(() => {
    const byDate = new Map();
    monthAttendance.forEach(({ date, status }) => {
      const row = byDate.get(date) || { date: date.slice(-2), present: 0, absent: 0 };
      if (status === "Present") row.present += 1;
      if (status === "Absent") row.absent += 1;
      byDate.set(date, row);
    });
    return [...byDate.entries()].sort(([first], [second]) => first.localeCompare(second)).map(([, row]) => row);
  }, [monthAttendance]);
  const subjectById = useMemo(() => new Map(portal.subjects.map((subject) => [String(subject._id), subject])), [portal.subjects]);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${month}-01T00:00:00Z`));

  const logout = async () => {
    try { await api.post("/logout"); } finally { navigate("/login", { replace: true }); }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl text-blue-700"><FiUser /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Student portal</p>
              <h1 className="text-xl font-bold text-slate-900">{portal.student?.name || "My dashboard"}</h1>
              <p className="text-sm text-slate-500">Roll No. {portal.student?.rollNo || "—"}</p>
            </div>
          </div>
          <Button variant="outlined" onClick={logout} startIcon={<FiLogOut />} className="!normal-case">Sign out</Button>
        </header>

        {error && <Alert severity="error" className="!mb-5" action={<Button color="inherit" size="small" onClick={loadPortal}>Retry</Button>}>{error}</Alert>}
        {loading ? <div className="grid min-h-80 place-items-center"><CircularProgress /></div> : (
          <>
            <section className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Enrolled subjects", value: portal.subjects.length, tone: "text-blue-700 bg-blue-50", icon: <FiBookOpen /> },
                { label: "Present this month", value: totals.present, tone: "text-emerald-700 bg-emerald-50", icon: <FiCalendar /> },
                { label: "Absent this month", value: totals.absent, tone: "text-rose-700 bg-rose-50", icon: <FiCalendar /> },
                { label: "Attendance rate", value: `${rate}%`, tone: "text-indigo-700 bg-indigo-50", icon: <FiUser /> },
              ].map((item) => (
                <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{item.label}</span><span className={`grid h-9 w-9 place-items-center rounded-lg ${item.tone}`}>{item.icon}</span></div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
                </article>
              ))}
            </section>

            <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div><h2 className="font-semibold text-slate-900">My attendance</h2><p className="mt-1 text-sm text-slate-500">Your daily attendance record and monthly trend</p></div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600"><span>Month</span><input aria-label="Attendance month" type="month" value={month} max={currentMonth()} onChange={(event) => event.target.value && setMonth(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
              </div>
              {chartData.length ? <div className="h-72 p-4 sm:p-5"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip labelFormatter={(day) => `${monthLabel.split(" ")[0]} ${day}, ${monthLabel.split(" ")[1]}`} /><Legend /><Line type="monotone" dataKey="present" name="Present" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="absent" name="Absent" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div> : <div className="grid h-56 place-items-center px-6 text-center"><div><p className="font-medium text-slate-700">No attendance marked for {monthLabel}</p><p className="mt-1 text-sm text-slate-500">Attendance records will appear here after your teacher marks them.</p></div></div>}
            </section>

            <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">My subjects</h2><p className="mt-1 text-sm text-slate-500">Classes linked to your student profile</p></div>
              {portal.subjects.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{portal.subjects.map((subject) => <article key={subject._id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{subject.subject}</h3><p className="mt-1 text-xs font-medium text-slate-500">{subject.subjectCode} · {subject.className}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${subject.active === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{subject.active === false ? "Inactive" : "Active"}</span></div><div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600"><p className="flex items-center gap-2"><FiClock className="text-slate-400" />{timeLabel(subject.startTime)} – {timeLabel(subject.endTime)}</p><p className="flex items-center gap-2"><FiMapPin className="text-slate-400" />{subject.location || "Location not set"}</p><p className="flex items-center gap-2"><FiCalendar className="text-slate-400" />{subject.days?.length ? subject.days.join(", ") : subject.date ? new Date(subject.date).toLocaleDateString("en-IN") : "Schedule not set"}</p></div></article>)}</div> : <div className="px-5 py-10 text-center text-sm text-slate-500">No subjects have been assigned to your profile yet.</div>}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Recent attendance</h2><p className="mt-1 text-sm text-slate-500">Latest marked sessions</p></div>
              {portal.attendance.length ? <div className="divide-y divide-slate-100">{portal.attendance.slice(0, 12).map((record) => { const subject = subjectById.get(String(record.classId)); return <div key={`${record.classId}-${record.date}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div><p className="text-sm font-medium text-slate-800">{subject?.subject || "Subject"}{subject?.subjectCode ? ` · ${subject.subjectCode}` : ""}</p><p className="text-xs text-slate-500">{new Date(`${record.date}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === "Present" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{record.status}</span></div>; })}</div> : <div className="px-5 py-10 text-center text-sm text-slate-500">No attendance records yet.</div>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
