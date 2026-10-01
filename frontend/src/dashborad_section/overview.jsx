import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import { FiCalendar, FiClock, FiMapPin, FiRefreshCw } from "react-icons/fi";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayAliases = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

function getTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : { hour: date.getHours(), minute: date.getMinutes() };
}

function formatTime(value) {
  const time = getTime(value);
  return time ? new Date(2000, 0, 1, time.hour, time.minute).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Time not set";
}

function getNextClasses(classes, now = new Date()) {
  const upcoming = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + 30);

  classes.filter((classData) => classData?.active !== false).forEach((classData) => {
    const startTime = getTime(classData.startTime);
    const endTime = getTime(classData.endTime);
    if (!startTime) return;

    const addClass = (date) => {
      const startsAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime.hour, startTime.minute);
      if (startsAt < now) return;
      upcoming.push({
        id: `${classData._id}-${startsAt.toISOString()}`,
        classData,
        startsAt,
        endsAt: endTime ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime.hour, endTime.minute) : null,
      });
    };

    if (classData.dayAndWeek === "Date System") {
      const date = classData.date ? new Date(classData.date) : null;
      if (date && !Number.isNaN(date.getTime()) && date >= today && date <= lastDay) addClass(date);
      return;
    }

    const scheduledDays = (classData.days || []).map((day) => dayAliases[day] || day);
    for (let date = new Date(today); date <= lastDay; date.setDate(date.getDate() + 1)) {
      if (scheduledDays.includes(weekDays[date.getDay()])) addClass(new Date(date));
    }
  });

  return upcoming.sort((a, b) => a.startsAt - b.startsAt).slice(0, 8);
}

export default function Overview() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [performanceData, setPerformanceData] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setPerformanceLoading(true);
    setPerformanceError("");
    try {
      const response = await api.get("/teacher/classes");
      const loadedClasses = (response.data.classes || []).filter((classData) => classData?._id);
      setClasses(loadedClasses);
      setError("");

      const activeClasses = loadedClasses.filter((classData) => classData.active !== false);
      const results = await Promise.allSettled(activeClasses.map((classData) =>
        api.get("/teacher/attendance", { params: { classId: classData._id, month: selectedMonth } })
      ));
      const dailyTotals = new Map();
      results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        (result.value.data.attendance || []).forEach((record) => {
          if (!record?.date || !["Present", "Absent"].includes(record.status)) return;
          const totals = dailyTotals.get(record.date) || { present: 0, absent: 0 };
          totals[record.status.toLowerCase()] += 1;
          dailyTotals.set(record.date, totals);
        });
      });
      setPerformanceData([...dailyTotals.entries()].sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, totals]) => ({
        date: date.slice(-2),
        present: totals.present,
        absent: totals.absent,
      })));
      if (results.some((result) => result.status === "rejected")) {
        setPerformanceError("Attendance could not be loaded for every class; the graph may be incomplete.");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load your class schedule from the server.");
      setPerformanceData([]);
    } finally {
      setLoading(false);
      setPerformanceLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { Promise.resolve().then(loadClasses); }, [loadClasses]);

  const nextClasses = useMemo(() => getNextClasses(classes), [classes]);
  const performanceTotals = useMemo(() => performanceData.reduce((totals, day) => ({
    present: totals.present + day.present,
    absent: totals.absent + day.absent,
  }), { present: 0, absent: 0 }), [performanceData]);
  const markedAttendance = performanceTotals.present + performanceTotals.absent;
  const attendanceRate = markedAttendance ? Math.round((performanceTotals.present / markedAttendance) * 100) : null;
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${selectedMonth}-01T00:00:00Z`));

  return (
    <main className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-700">ATTENDTRACK</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
            <p className="mt-1 text-sm text-slate-500">Upcoming sessions from your saved class schedules.</p>
          </div>
          <Button onClick={loadClasses} disabled={loading} variant="outlined" startIcon={loading ? <CircularProgress size={15} /> : <FiRefreshCw />} className="!normal-case">
            Refresh schedule
          </Button>
        </header>

        {error && <Alert severity="error" className="!mb-4" action={<Button color="inherit" size="small" onClick={loadClasses}>Retry</Button>}>{error}</Alert>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Next classes</h2>
              <p className="mt-1 text-sm text-slate-500">Your active classes scheduled in the next 30 days</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"><FiCalendar /> Next 30 days</span>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center"><CircularProgress size={28} /></div>
          ) : nextClasses.length ? (
            <div className="flex gap-4 overflow-x-auto p-4 sm:p-5">
              {nextClasses.map(({ id, classData, startsAt, endsAt }) => (
                <article key={id} className="flex h-full w-[min(320px,85vw)] shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-14 w-14 shrink-0 place-content-center rounded-lg bg-blue-50 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">{startsAt.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                        <p className="text-xl font-bold leading-5 text-slate-900">{startsAt.getDate()}</p>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">{classData.subject || "Class"}</h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">{classData.subjectCode || "Subject code not set"}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Upcoming</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{classData.className || "Class group"} <span className="text-slate-300">·</span> {classData.department || "Department not set"}</p>
                  <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FiClock className="shrink-0 text-slate-400" />
                      <span>{startsAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} · {formatTime(startsAt.toISOString())}{endsAt ? ` – ${formatTime(endsAt.toISOString())}` : ""}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600"><FiMapPin className="shrink-0 text-slate-400" />{classData.location || "Location not set"}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500"><FiCalendar size={21} /></div>
              <h3 className="mt-4 text-sm font-semibold text-slate-800">No upcoming classes</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Active classes scheduled in the next 30 days will appear here. Add or update a class schedule to see upcoming sessions.</p>
            </div>
          )}
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Attendance performance</h2>
              <p className="mt-1 text-sm text-slate-500">Daily attendance marks across your active classes</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <span>Month</span>
                <input
                  aria-label="Attendance month"
                  type="month"
                  value={selectedMonth}
                  max={currentMonth()}
                  onChange={(event) => setSelectedMonth(event.target.value || currentMonth())}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              {attendanceRate !== null && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{attendanceRate}% present</div>}
            </div>
          </div>
          {performanceError && <Alert severity="warning" className="!m-4 !mb-0">{performanceError}</Alert>}
          {performanceLoading ? (
            <div className="flex h-72 items-center justify-center"><CircularProgress size={28} /></div>
          ) : performanceData.length ? (
            <div className="h-72 p-4 sm:p-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(day) => `${day}`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip labelFormatter={(day) => `${monthLabel.split(" ")[0]} ${day}, ${monthLabel.split(" ")[1]}`} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10 }} />
                  <Legend />
                  <Line type="monotone" dataKey="present" name="Present" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="absent" name="Absent" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No attendance data for this month</p>
              <p className="mt-1 text-sm text-slate-500">Mark attendance to see the monthly performance graph.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
