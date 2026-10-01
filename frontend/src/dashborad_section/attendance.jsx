import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import api from "../api/axios";

const pageLimit = 100;
const currentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const classLabel = (classData) => classData
  ? `${classData.subject} (${classData.subjectCode}) · ${classData.className}`
  : "";

const attendanceKey = (studentId, date) => `${studentId}:${date}`;

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [month, setMonth] = useState(currentMonth);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingCells, setSavingCells] = useState(() => new Set());
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("success");

  useEffect(() => {
    let active = true;
    api.get("/teacher/classes")
      .then((response) => {
        if (active) setClasses(response.data.classes || []);
      })
      .catch((error) => {
        if (active) {
          setMessage(error.response?.data?.message || "Could not load classes");
          setMessageSeverity("error");
        }
      })
      .finally(() => {
        if (active) setLoadingClasses(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedClass?._id) return undefined;
    let active = true;

    Promise.all([
      api.get("/teacher/students", { params: { subjectId: selectedClass._id, page: 0, limit: pageLimit } }),
      api.get("/teacher/attendance", { params: { classId: selectedClass._id, month } }),
    ])
      .then(async ([studentResponse, attendanceResponse]) => {
        const firstPage = studentResponse.data.students || [];
        const total = Number(studentResponse.data.total) || firstPage.length;
        const pageCount = Math.ceil(total / pageLimit);
        const laterPages = await Promise.all(
          Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => api.get("/teacher/students", {
            params: { subjectId: selectedClass._id, page: index + 1, limit: pageLimit },
          }))
        );
        if (active) {
          setStudents([...firstPage, ...laterPages.flatMap((response) => response.data.students || [])]);
          setAttendance(Object.fromEntries(
            (attendanceResponse.data.attendance || []).map((record) => [
              attendanceKey(record.studentId, record.date),
              record.status,
            ])
          ));
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(error.response?.data?.message || "Could not load attendance");
          setMessageSeverity("error");
        }
      })
      .finally(() => {
        if (active) setLoadingAttendance(false);
      });
    return () => { active = false; };
  }, [month, selectedClass]);

  const [year, monthNumber] = month.split("-").map(Number);
  const days = useMemo(() => {
    const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    return Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      const weekday = new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay();
      return { day, date: `${month}-${String(day).padStart(2, "0")}`, weekend: weekday === 0 || weekday === 6 };
    });
  }, [month, monthNumber, year]);

  const monthTotals = useMemo(() => Object.values(attendance).reduce((totals, status) => {
    if (status === "Present") totals.present += 1;
    if (status === "Absent") totals.absent += 1;
    return totals;
  }, { present: 0, absent: 0 }), [attendance]);

  const handleAttendanceClick = async (student, date) => {
    if (date.weekend) return;
    const studentId = String(student._id);
    const key = attendanceKey(studentId, date.date);
    if (savingCells.has(key)) return;
    const previousStatus = attendance[key];
    const nextStatus = previousStatus === "Present" ? "Absent" : "Present";
    setAttendance((current) => ({ ...current, [key]: nextStatus }));
    setSavingCells((current) => new Set(current).add(key));
    try {
      await api.put("/teacher/attendance", {
        classId: selectedClass._id,
        studentId,
        date: date.date,
        status: nextStatus,
      });
      setMessage(`${student.name} marked ${nextStatus.toLowerCase()} for ${date.date}`);
      setMessageSeverity("success");
    } catch (error) {
      setAttendance((current) => {
        const next = { ...current };
        if (previousStatus) next[key] = previousStatus;
        else delete next[key];
        return next;
      });
      setMessage(error.response?.data?.message || "Could not save attendance");
      setMessageSeverity("error");
    } finally {
      setSavingCells((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <main className="min-h-full bg-slate-50 px-3 py-4 sm:px-4 lg:px-5">
      <div className="mx-auto max-w-[1600px]">
        <Snackbar open={Boolean(message)} autoHideDuration={2500} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={messageSeverity} variant="filled" onClose={() => setMessage("")}>{message}</Alert>
        </Snackbar>

        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">Select a class and click a weekday cell to mark a student present or absent.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-700"><FiCheckCircle /> Present {monthTotals.present}</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 font-semibold text-rose-700"><FiXCircle /> Absent {monthTotals.absent}</span>
          </div>
        </header>

        <section className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 sm:p-4">
          <Autocomplete
            options={classes}
            value={selectedClass}
            loading={loadingClasses}
            getOptionLabel={classLabel}
            isOptionEqualToValue={(option, value) => String(option._id) === String(value._id)}
            onChange={(_, value) => {
              setSelectedClass(value);
              setStudents([]);
              setAttendance({});
              setLoadingAttendance(Boolean(value));
            }}
            renderInput={(params) => <TextField {...params} label="Class subject" placeholder="Choose a class" />}
          />
          <TextField
            type="month"
            label="Attendance month"
            value={month}
            onChange={(event) => {
              if (!event.target.value) return;
              setMonth(event.target.value);
              setAttendance({});
              setLoadingAttendance(Boolean(selectedClass));
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </section>

        {!selectedClass ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-base font-semibold text-slate-800">Choose a class subject</h2>
            <p className="mt-1 text-sm text-slate-500">The enrolled student list and this month’s attendance will appear here.</p>
          </section>
        ) : loadingAttendance ? (
          <section className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white"><CircularProgress size={28} /></section>
        ) : students.length ? (
          <TableContainer className="max-h-[calc(100vh-230px)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table stickyHeader size="small" aria-label="Monthly student attendance" sx={{ minWidth: Math.max(1100, 260 + days.length * 48) }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ position: "sticky", left: 0, zIndex: 4, minWidth: 240, backgroundColor: "#f8fafc", fontWeight: 700 }}>Student / Roll No</TableCell>
                  {days.map((date) => (
                    <TableCell key={date.date} align="center" sx={{ minWidth: 44, backgroundColor: date.weekend ? "#f1f5f9" : "#f8fafc", color: date.weekend ? "#94a3b8" : "#475569", fontWeight: 700 }}>
                      {date.day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, minWidth: 240, backgroundColor: "#fff" }}>
                      <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      <p className="font-mono text-xs text-slate-500">{student.rollNo}</p>
                    </TableCell>
                    {days.map((date) => {
                      const key = attendanceKey(String(student._id), date.date);
                      const status = date.weekend ? null : attendance[key];
                      return (
                        <TableCell key={date.date} align="center" sx={{ backgroundColor: date.weekend ? "#f8fafc" : undefined, p: 0.5 }}>
                          {date.weekend ? (
                            <span className="text-xs text-slate-300">—</span>
                          ) : (
                            <Button
                              size="small"
                              disabled={savingCells.has(key)}
                              onClick={() => handleAttendanceClick(student, date)}
                              aria-label={`Mark ${student.name} ${status === "Present" ? "absent" : "present"} on ${date.date}`}
                              title={`${date.date}: ${status || "Not marked"}. Click to ${status === "Present" ? "mark absent" : "mark present"}.`}
                              className={`!min-w-8 !rounded-md !px-2 !py-1 !text-xs !font-bold ${
                                status === "Present" ? "!bg-emerald-100 !text-emerald-700 hover:!bg-emerald-200" :
                                  status === "Absent" ? "!bg-rose-100 !text-rose-700 hover:!bg-rose-200" :
                                    "!bg-slate-100 !text-slate-400 hover:!bg-blue-100 hover:!text-blue-700"
                              }`}
                            >
                              {savingCells.has(key) ? "…" : status === "Present" ? "P" : status === "Absent" ? "A" : "—"}
                            </Button>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <h2 className="text-base font-semibold text-slate-800">No students enrolled</h2>
            <p className="mt-1 text-sm text-slate-500">Enroll students in {selectedClass.subject} to take attendance.</p>
          </section>
        )}
      </div>
    </main>
  );
}
