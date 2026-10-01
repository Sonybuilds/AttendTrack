import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { FiArrowLeft, FiCheckCircle, FiPlus, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import api from "../api/axios";

const todayInIndia = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};

const subjectIdsOf = (student) => (student.subjects || [])
  .map((subject) => typeof subject === "object" ? subject?._id : subject)
  .filter(Boolean)
  .map(String);

export default function StudentManage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId") || location.state?.classData?._id;
  const [classData, setClassData] = useState(location.state?.classData || null);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("success");
  const [todayAttendance, setTodayAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(() => new Set());
  const attendanceDate = todayInIndia();
  const attendanceMonth = attendanceDate.slice(0, 7);

  useEffect(() => {
    if (classData || !classId) return;
    api.get("/teacher/classes")
      .then((response) => {
        const selectedClass = (response.data.classes || []).find((item) => String(item._id) === String(classId));
        if (selectedClass) setClassData(selectedClass);
      })
      .catch((error) => console.error("Failed to load class:", error));
  }, [classData, classId]);

  const loadEnrolledStudents = useCallback(async () => {
    if (!classId) return;
    setPageLoading(true);
    try {
      const response = await api.get("/teacher/students", {
        params: { subjectId: classId, search: debouncedSearch, page, limit: pageSize },
      });
      setStudents(response.data.students || []);
      setTotalStudents(response.data.total || 0);
      if (!response.data.students?.length && response.data.total > 0 && page > 0) {
        setPage((current) => Math.max(0, Math.min(current - 1, Math.ceil(response.data.total / pageSize) - 1)));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load enrolled students");
      setMessageSeverity("error");
    } finally {
      setPageLoading(false);
    }
  }, [classId, debouncedSearch, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    Promise.resolve().then(loadEnrolledStudents);
  }, [loadEnrolledStudents]);

  useEffect(() => {
    if (!classId) return undefined;
    let active = true;
    api.get("/teacher/attendance", { params: { classId, month: attendanceMonth } })
      .then((response) => {
        if (!active) return;
        const attendance = (response.data.attendance || []).filter((record) => record?.date === attendanceDate);
        setTodayAttendance(Object.fromEntries(attendance.map((record) => [String(record.studentId?._id || record.studentId), record.status])));
      })
      .catch((error) => {
        if (active) {
          setMessage(error.response?.data?.message || "Could not load today's attendance");
          setMessageSeverity("error");
        }
      });
    return () => { active = false; };
  }, [attendanceDate, attendanceMonth, classId]);

  const handleAttendanceClick = async (student) => {
    const studentId = String(student?._id || "");
    if (!studentId || savingAttendance.has(studentId)) return;
    const previousStatus = todayAttendance[studentId];
    const nextStatus = previousStatus === "Present" ? "Absent" : "Present";
    setTodayAttendance((current) => ({ ...current, [studentId]: nextStatus }));
    setSavingAttendance((current) => new Set(current).add(studentId));
    try {
      await api.put("/teacher/attendance", {
        classId,
        studentId,
        date: attendanceDate,
        status: nextStatus,
      });
      setMessage(`${student.name} marked ${nextStatus.toLowerCase()} for today`);
      setMessageSeverity("success");
    } catch (error) {
      setTodayAttendance((current) => {
        const next = { ...current };
        if (previousStatus) next[studentId] = previousStatus;
        else delete next[studentId];
        return next;
      });
      setMessage(error.response?.data?.message || "Could not save attendance");
      setMessageSeverity("error");
    } finally {
      setSavingAttendance((current) => {
        const next = new Set(current);
        next.delete(studentId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!addOpen || !classId) return;
    let current = true;
    api.get("/teacher/students", {
      params: {
        search: debouncedCandidateSearch,
        excludeSubjectId: classId,
        page: 0,
        limit: 20,
      },
    })
      .then((response) => {
        if (current) setCandidates(response.data.students || []);
      })
      .catch((error) => {
        if (current) {
          setMessage(error.response?.data?.message || "Failed to search students");
          setMessageSeverity("error");
        }
      })
      .finally(() => {
        if (current) setCandidateLoading(false);
      });
    return () => { current = false; };
  }, [addOpen, classId, debouncedCandidateSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCandidateSearch(candidateSearch.trim()), 300);
    return () => clearTimeout(timer);
  }, [candidateSearch]);

  const handleEnroll = async () => {
    if (!selectedCandidates.length || !classId) return;
    setSaving(true);
    try {
      const results = await Promise.allSettled(selectedCandidates.map((student) => {
        const subjects = [...new Set([...subjectIdsOf(student), String(classId)])];
        return api.put(`/teacher/students/${student._id}`, { subjects });
      }));
      const failedCandidates = selectedCandidates.filter((_, index) => results[index].status === "rejected");
      const enrolledCount = selectedCandidates.length - failedCandidates.length;
      setSelectedCandidates(failedCandidates);
      if (failedCandidates.length) {
        setMessage(`${enrolledCount} enrolled; ${failedCandidates.length} could not be enrolled. Please retry.`);
        setMessageSeverity(enrolledCount ? "warning" : "error");
      } else {
        setMessage(`${enrolledCount} student${enrolledCount === 1 ? "" : "s"} enrolled in ${classData?.subject || "this subject"}`);
        setMessageSeverity("success");
        setCandidateSearch("");
        setDebouncedCandidateSearch("");
        setAddOpen(false);
      }
      setPage(0);
      await loadEnrolledStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to enroll student");
      setMessageSeverity("error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!studentToRemove || !classId) return;
    setSaving(true);
    try {
      const subjects = subjectIdsOf(studentToRemove).filter((id) => id !== String(classId));
      const response = await api.put(`/teacher/students/${studentToRemove._id}`, { subjects });
      setMessage(response.data.message ? "Student removed from this subject" : "Enrollment updated");
      setMessageSeverity("success");
      setStudentToRemove(null);
      await loadEnrolledStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove student from subject");
      setMessageSeverity("error");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => [
    {
      label: "Student",
      render: (student, index) => (
        <div className="flex items-center gap-3">
          <Avatar sx={{ width: 38, height: 38, bgcolor: ["#dbeafe", "#dcfce7", "#f3e8ff", "#ffedd5"][index % 4], color: ["#1d4ed8", "#15803d", "#7e22ce", "#c2410c"][index % 4], fontSize: 13, fontWeight: 700 }}>
            {(student.name || "S").split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
            <p className="truncate text-xs text-slate-500">{student.email || "Email not provided"}</p>
          </div>
        </div>
      ),
    },
    { label: "Roll Number", render: (student) => <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">{student.rollNo}</span> },
    { label: "Class", render: (student) => <span className="text-sm text-slate-700">{student.className}</span> },
    { label: "Department", render: (student) => <span className="text-sm text-slate-600">{student.department}</span> },
    { label: "Phone", render: (student) => <span className="whitespace-nowrap text-sm text-slate-600">{student.phone}</span> },
  ], []);

  if (!classId) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Choose a class subject first</h1>
          <p className="mt-2 text-sm text-slate-500">Open the Students action on a class card to manage its enrollments.</p>
          <Button onClick={() => navigate("/attendtrack/dashboard/class")} className="!mt-4 !normal-case">Back to classes</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Tooltip title="Back to classes">
              <IconButton onClick={() => navigate(-1)} className="!mt-0.5 !bg-white !text-slate-600 !shadow-sm"><FiArrowLeft /></IconButton>
            </Tooltip>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Class enrollment</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{classData?.subject || "Subject Students"}</h1>
              <p className="mt-1 text-sm text-slate-500">{classData?.subjectCode} · {classData?.className} · {classData?.department}</p>
            </div>
          </div>
          <Button onClick={() => { setCandidateLoading(true); setAddOpen(true); }} variant="contained" startIcon={<FiPlus />} className="!h-11 !w-fit !rounded-lg !bg-blue-700 !px-5 !normal-case hover:!bg-blue-800">
            Enroll Student
          </Button>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FiUsers /></span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Enrolled students</h2>
                <p className="mt-0.5 text-xs text-slate-500">{totalStudents} student{totalStudents === 1 ? "" : "s"} enrolled in this subject</p>
              </div>
            </div>
            <TextField
              size="small"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(0); }}
              placeholder="Search name or roll number"
              aria-label="Search enrolled students"
              className="sm:!w-80"
              InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch className="text-slate-400" /></InputAdornment> }}
            />
          </div>

          <TableContainer className="overflow-x-auto">
            <Table aria-label="Enrolled students" sx={{ minWidth: 800 }}>
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((column) => <th key={column.label} className="px-4 py-3 font-semibold">{column.label}</th>)}
                  <th className="px-4 py-3 font-semibold">Today</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <TableBody>
                {pageLoading ? (
                  <TableRow><TableCell colSpan={columns.length + 2} align="center" sx={{ py: 7 }}><CircularProgress size={24} /><p className="mt-2 text-sm text-slate-500">Loading enrolled students…</p></TableCell></TableRow>
                ) : students.length ? (
                  students.map((student, index) => (
                    <TableRow key={student._id} hover sx={{ "& td": { borderBottom: "1px solid #f1f5f9", py: 1.5 }, "&:last-child td": { borderBottom: 0 } }}>
                      {columns.map((column) => <TableCell key={column.label}>{column.render(student, index)}</TableCell>)}
                      <TableCell>
                        <Button
                          size="small"
                          variant={todayAttendance[String(student._id)] ? "contained" : "outlined"}
                          color={todayAttendance[String(student._id)] === "Absent" ? "error" : "success"}
                          startIcon={savingAttendance.has(String(student._id)) ? <CircularProgress size={14} color="inherit" /> : <FiCheckCircle />}
                          onClick={() => handleAttendanceClick(student)}
                          disabled={savingAttendance.has(String(student._id))}
                          className="!whitespace-nowrap !normal-case"
                          aria-label={`Mark ${student.name} ${todayAttendance[String(student._id)] === "Present" ? "absent" : "present"} today`}
                        >
                          {todayAttendance[String(student._id)] || "Mark present"}
                        </Button>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove from this subject">
                          <IconButton aria-label={`Remove ${student.name} from subject`} onClick={() => setStudentToRemove(student)} size="small" className="!text-rose-600 hover:!bg-rose-50"><FiTrash2 /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={columns.length + 2} align="center" sx={{ py: 8 }}>
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"><FiUsers /></span>
                      <p className="mt-3 text-sm font-semibold text-slate-800">{debouncedSearch ? "No matching students" : "No students enrolled yet"}</p>
                      <p className="mt-1 text-xs text-slate-500">Use Enroll Student to add an existing student to this subject.</p>
                    </div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalStudents}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </section>
      </div>

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={messageSeverity} variant="filled" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>

      <Dialog open={addOpen} onClose={() => { if (!saving) { setAddOpen(false); setSelectedCandidates([]); } }} fullWidth maxWidth="sm">
        <DialogTitle>Enroll a student</DialogTitle>
        <DialogContent>
          <p className="mb-4 mt-1 text-sm text-slate-500">Search by student name or roll number. Enrolling updates the student’s subject list.</p>
          <Autocomplete
            multiple
            filterSelectedOptions
            options={candidates}
            value={selectedCandidates}
            loading={candidateLoading}
            filterOptions={(options) => options}
            onChange={(_, values) => setSelectedCandidates(values)}
            inputValue={candidateSearch}
            onInputChange={(_, value, reason) => { if (reason === "input" || reason === "clear") { setCandidateLoading(true); setCandidateSearch(value); } }}
            getOptionLabel={(student) => student?.name ? `${student.name} · ${student.rollNo}` : ""}
            isOptionEqualToValue={(option, value) => String(option._id) === String(value._id)}
            noOptionsText={candidateSearch ? "No available student found" : "No available students"}
            renderTags={(values, getTagProps) => values.map((student, index) => (
              <Chip {...getTagProps({ index })} key={student._id} label={`${student.name} · Roll No: ${student.rollNo}`} size="small" />
            ))}
            renderInput={(params) => <TextField {...params} autoFocus label="Student name or roll number" placeholder="Start typing to search" />}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => { setAddOpen(false); setSelectedCandidates([]); }} disabled={saving} className="!normal-case">Cancel</Button>
          <Button onClick={handleEnroll} disabled={!selectedCandidates.length || saving} variant="contained" className="!bg-blue-700 !normal-case">
            {saving ? "Adding…" : `Add ${selectedCandidates.length || ""} to Subject`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(studentToRemove)} onClose={() => { if (!saving) setStudentToRemove(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Remove from subject?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600">{studentToRemove?.name} will remain in the student directory; only this subject enrollment will be removed.</p>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => setStudentToRemove(null)} disabled={saving} className="!normal-case">Cancel</Button>
          <Button onClick={handleRemove} disabled={saving} color="error" variant="contained" className="!normal-case">Remove enrollment</Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
