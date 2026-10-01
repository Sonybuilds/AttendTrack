import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  TextField,
} from "@mui/material";
import { FiBarChart2, FiDownload, FiPrinter, FiRefreshCcw } from "react-icons/fi";
import api from "../api/axios";

const pageLimit = 100;
const currentMonth = () => {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = values.find((part) => part.type === "year")?.value;
  const month = values.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
};

const escapeCsv = (value) => {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

const classLabel = (classData) => classData
  ? `${classData.subject} (${classData.subjectCode}) · ${classData.className} · ${classData.department}`
  : "";

const recordId = (record) => record && typeof record === "object" ? record._id ?? null : null;
const sameRecord = (option, value) => {
  const optionId = recordId(option);
  const valueId = recordId(value);
  return optionId !== null && valueId !== null && String(optionId) === String(valueId);
};

export default function Reports() {
  const [reportType, setReportType] = useState("student");
  const [month, setMonth] = useState(currentMonth);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [reportStudents, setReportStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [reportSummary, setReportSummary] = useState({ present: 0, absent: 0, marked: 0, rate: 0 });
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [reportCreated, setReportCreated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/teacher/classes")
      .then((response) => {
        if (active) setClasses((response.data.classes || []).filter((classData) => recordId(classData)));
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load classes");
      })
      .finally(() => {
        if (active) setLoadingClasses(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const classId = recordId(selectedClass);
    if (!classId) {
      return undefined;
    }

    let active = true;
    Promise.all([
      api.get("/teacher/students", {
        params: { subjectId: classId, page: 0, limit: pageLimit },
      }),
      api.get("/teacher/attendance", { params: { classId, month } }),
    ])
      .then(async ([studentResponse, attendanceResponse]) => {
        const firstPage = studentResponse.data.students || [];
        const total = Number(studentResponse.data.total) || firstPage.length;
        const pageCount = Math.ceil(total / pageLimit);
        const remainingPages = await Promise.all(
          Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
            api.get("/teacher/students", {
              params: { subjectId: classId, page: index + 1, limit: pageLimit },
            })
          )
        );
        if (active) {
          const loadedStudents = [
            ...firstPage,
            ...remainingPages.flatMap((page) => page.data.students || []),
          ].filter((student) => recordId(student));
          setAvailableStudents([...new Map(loadedStudents.map((student) => [String(recordId(student)), student])).values()]);
          setAttendanceRecords((attendanceResponse.data.attendance || []).filter(Boolean));
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load students or attendance for this class and month");
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });
    return () => { active = false; };
  }, [month, selectedClass]);

  const studentsForReport = useMemo(
    () => {
      const selected = selectedStudents.filter((student) => recordId(student));
      return selected.length ? selected : availableStudents.filter((student) => recordId(student));
    },
    [availableStudents, selectedStudents]
  );

  const resetReport = () => {
    setSelectedClass(null);
    setSelectedStudents([]);
    setReportStudents([]);
    setAttendanceRecords([]);
    setReportSummary({ present: 0, absent: 0, marked: 0, rate: 0 });
    setMonth(currentMonth());
    setReportCreated(false);
    setError("");
  };

  const createReport = () => {
    if (!recordId(selectedClass)) {
      setError("Select a class subject to create a report.");
      return;
    }
    if (loadingStudents) {
      setError("Wait for the enrolled student list to finish loading.");
      return;
    }
    if (!studentsForReport.length && reportType === "student") {
      setError("No students are enrolled in this class subject yet.");
      return;
    }

    const totalsByStudent = new Map();
    attendanceRecords.forEach((record) => {
      if (!record?.studentId || !["Present", "Absent"].includes(record.status)) return;
      const studentId = String(record.studentId?._id || record.studentId);
      const totals = totalsByStudent.get(studentId) || { present: 0, absent: 0 };
      if (record.status === "Present") totals.present += 1;
      if (record.status === "Absent") totals.absent += 1;
      totalsByStudent.set(studentId, totals);
    });
    const rows = studentsForReport.filter((student) => recordId(student)).map((student) => {
      const totals = totalsByStudent.get(String(recordId(student))) || { present: 0, absent: 0 };
      const marked = totals.present + totals.absent;
      return { ...student, ...totals, marked, attendanceRate: marked ? Math.round((totals.present / marked) * 100) : 0 };
    });
    const present = rows.reduce((sum, student) => sum + student.present, 0);
    const absent = rows.reduce((sum, student) => sum + student.absent, 0);
    const marked = present + absent;
    setReportStudents(rows);
    setReportSummary({ present, absent, marked, rate: marked ? Math.round((present / marked) * 100) : 0 });
    setReportCreated(true);
    setError("");
  };

  const handleExport = () => {
    if (!recordId(selectedClass)) return;
    const safeReportStudents = reportStudents.filter((student) => recordId(student));
    const studentRows = safeReportStudents.map((student) => [
      student.name,
      student.rollNo,
      student.className,
      student.department,
      student.academicYear,
      student.email,
      student.present,
      student.absent,
      student.marked,
      student.marked ? `${student.attendanceRate}%` : "No records",
    ]);
    const rows = reportType === "class"
      ? [
          ["Subject", "Subject Code", "Class", "Department", "Location", "Month", "Schedule", "Start Time", "End Time", "Student", "Roll Number", "Present", "Absent", "Marked Days", "Attendance %"],
          ...(safeReportStudents.length ? safeReportStudents : [null]).map((student) => [
            selectedClass.subject,
            selectedClass.subjectCode,
            selectedClass.className,
            selectedClass.department,
            selectedClass.location,
            month,
            selectedClass.dayAndWeek === "Week System" ? (selectedClass.days || []).join("; ") : formatDate(selectedClass.date),
            formatTime(selectedClass.startTime),
            formatTime(selectedClass.endTime),
            student?.name || "",
            student?.rollNo || "",
            student?.present ?? "",
            student?.absent ?? "",
            student?.marked ?? "",
            student?.marked ? `${student.attendanceRate}%` : "No records",
          ]),
        ]
      : [
          ["Student", "Roll Number", "Class", "Department", "Academic Year", "Email", "Present", "Absent", "Marked Days", "Attendance %"],
          ...studentRows,
        ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report-${selectedClass.subjectCode || "class"}-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .report-print-area, .report-print-area * { visibility: visible !important; }
        .report-print-area { position: absolute; inset: 0; width: 100%; margin: 0 !important; border: 0 !important; box-shadow: none !important; }
        .report-no-print { display: none !important; }
      }`}</style>
      <div className="mx-auto max-w-[1500px]">
        <header className="report-no-print mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-700"><FiBarChart2 size={21} /><h1 className="text-xl font-semibold text-slate-900">Reports</h1></div>
            <p className="mt-1 text-sm text-slate-500">Review monthly attendance and student enrollment from saved classes.</p>
          </div>
          <Button variant="outlined" startIcon={<FiRefreshCcw size={15} />} onClick={resetReport} className="!w-fit !normal-case">Reset</Button>
        </header>

        <section className="report-no-print rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Report type</h2>
          <div className="mb-5 flex flex-wrap gap-3">
            {[{ id: "student", label: "Student Report" }, { id: "class", label: "Class Report" }].map((type) => (
              <Button
                key={type.id}
                variant={reportType === type.id ? "contained" : "outlined"}
                onClick={() => { setReportType(type.id); setReportCreated(false); }}
                className={reportType === type.id ? "!bg-blue-700 !normal-case" : "!normal-case"}
              >
                {type.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Autocomplete
              options={classes.filter((classData) => recordId(classData))}
              value={selectedClass}
              loading={loadingClasses}
              onChange={(_, value) => {
                setSelectedClass(value);
                setAvailableStudents([]);
                setSelectedStudents([]);
                setAttendanceRecords([]);
                setLoadingStudents(Boolean(value));
                setReportCreated(false);
                setError("");
              }}
              getOptionLabel={classLabel}
              isOptionEqualToValue={sameRecord}
              renderInput={(params) => <TextField {...params} label="Class subject" placeholder="Choose a saved class subject" />}
            />
            <TextField
              type="month"
              label="Report month"
              value={month}
              onChange={(event) => {
                if (!event.target.value) return;
                setMonth(event.target.value);
                setReportCreated(false);
                setLoadingStudents(Boolean(selectedClass));
                setError("");
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Autocomplete
              multiple
              options={availableStudents.filter((student) => recordId(student))}
              value={selectedStudents.filter((student) => recordId(student))}
              loading={loadingStudents}
              disabled={!selectedClass || loadingStudents}
              onChange={(_, values) => { setSelectedStudents(values.filter((student) => recordId(student))); setReportCreated(false); }}
              getOptionLabel={(student) => student ? `${student.name || "Student"} · ${student.rollNo || "No roll number"}` : ""}
              isOptionEqualToValue={sameRecord}
              renderTags={(values, getTagProps) => values.filter((student) => recordId(student)).map((student, index) => (
                <Chip {...getTagProps({ index })} key={recordId(student) || index} size="small" label={`${student.name || "Student"} · ${student.rollNo || "No roll number"}`} />
              ))}
              noOptionsText={selectedClass ? "No enrolled students" : "Select a class subject first"}
              renderInput={(params) => <TextField {...params} label="Students (optional)" placeholder="Choose specific students or leave empty for all" />}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Choose specific students for a focused report, or leave the student selector empty for the full class roster. Attendance percentages use the records marked in the selected month.</p>

          {error && <Alert severity="error" className="!mt-4">{error}</Alert>}

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <Button variant="contained" onClick={createReport} disabled={loadingClasses || loadingStudents} className="!min-w-36 !bg-blue-700 !normal-case">
              {loadingStudents ? <><CircularProgress size={17} color="inherit" className="!mr-2" />Loading students</> : "Create Report"}
            </Button>
          </div>
        </section>

        {reportCreated && selectedClass && (
          <section className="report-print-area mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{reportType === "student" ? "Student Report" : "Class Report"}</h2>
                <p className="mt-1 text-sm text-slate-500">{classLabel(selectedClass)} · {formatMonth(month)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outlined" startIcon={<FiPrinter size={14} />} onClick={handlePrint} className="!normal-case">Print</Button>
                <Button variant="contained" startIcon={<FiDownload size={14} />} onClick={handleExport} className="!bg-blue-700 !normal-case">Export CSV</Button>
              </div>
            </header>

              <div className="grid grid-cols-2 border-b border-slate-100 sm:grid-cols-4">
                <ReportDetail label="Students" value={reportStudents.filter((student) => recordId(student)).length} />
                <ReportDetail label="Present marks" value={reportSummary.present} />
                <ReportDetail label="Absent marks" value={reportSummary.absent} />
                <ReportDetail label="Attendance rate" value={reportSummary.marked ? `${reportSummary.rate}%` : "No records"} />
              </div>

            {reportType === "class" && (
              <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <ReportDetail label="Subject" value={selectedClass.subject} />
                <ReportDetail label="Department" value={selectedClass.department} />
                <ReportDetail label="Location" value={selectedClass.location} />
                <ReportDetail label="Report month" value={formatMonth(month)} />
                <ReportDetail label="Schedule" value={selectedClass.dayAndWeek === "Week System" ? (selectedClass.days || []).join(", ") : formatDate(selectedClass.date)} />
                <ReportDetail label="Time" value={`${formatTime(selectedClass.startTime)} – ${formatTime(selectedClass.endTime)} IST`} />
              </div>
            )}

            <div className="overflow-x-auto p-4 sm:p-5">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Present</th>
                    <th className="px-4 py-3">Absent</th>
                    <th className="px-4 py-3">Marked Days</th>
                    <th className="px-4 py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportStudents.filter((student) => recordId(student)).map((student) => (
                    <tr key={recordId(student)} className="border-b border-slate-100 text-sm last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{student.rollNo}</td>
                      <td className="px-4 py-3 text-slate-600">{student.className}</td>
                      <td className="px-4 py-3 text-slate-600">{student.department}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{student.present}</td>
                      <td className="px-4 py-3 font-semibold text-rose-700">{student.absent}</td>
                      <td className="px-4 py-3 text-slate-600">{student.marked}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{student.marked ? `${student.attendanceRate}%` : "No records"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!reportStudents.some((student) => recordId(student)) && <p className="py-6 text-center text-sm text-slate-500">No students are enrolled in this class subject.</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ReportDetail({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value ?? "—"}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
}

function formatMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatTime(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
}
