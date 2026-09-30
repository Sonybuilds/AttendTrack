import { useState } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import {
  FiBarChart2,
  FiDownload,
  FiPrinter,
  FiRefreshCcw,
} from "react-icons/fi";

export default function Reports() {
  const [reportType, setReportType] = useState("student");

  const [filters, setFilters] = useState({
    academicYear: "",
    department: "",
    className: "",
    subject: "",
    fromDate: "",
    toDate: "",
  });

  const [reportCreated, setReportCreated] = useState(false);
  const [error, setError] = useState("");

  const students = [
    {
      name: "Priya Sharma",
      rollNo: "ST-001",
      className: "10-A",
      attendance: "96%",
      marks: "89%",
      status: "Good",
    },
    {
      name: "Rahul Kumar",
      rollNo: "ST-002",
      className: "10-A",
      attendance: "84%",
      marks: "72%",
      status: "Good",
    },
    {
      name: "Aman Verma",
      rollNo: "ST-003",
      className: "10-A",
      attendance: "68%",
      marks: "51%",
      status: "At Risk",
    },
    {
      name: "Sneha Gupta",
      rollNo: "ST-004",
      className: "10-A",
      attendance: "91%",
      marks: "86%",
      status: "Good",
    },
  ];

  const classes = [
    {
      className: "10-A",
      department: "Science",
      students: 42,
      attendance: "91%",
      marks: "82%",
      status: "Good",
    },
    {
      className: "10-B",
      department: "Commerce",
      students: 38,
      attendance: "86%",
      marks: "76%",
      status: "Good",
    },
    {
      className: "9-A",
      department: "Science",
      students: 40,
      attendance: "74%",
      marks: "69%",
      status: "Needs Attention",
    },
  ];

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      height: 44,
      borderRadius: "7px",
      backgroundColor: "#fff",
      fontSize: "13px",

      "& fieldset": {
        borderColor: "#d9e0e8",
      },

      "&:hover fieldset": {
        borderColor: "#b8c4d2",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#1976d2",
      },
    },

    "& .MuiInputLabel-root": {
      fontSize: "13px",
      color: "#667085",
    },
  };

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    setReportCreated(false);
    setError("");
  };

  const createReport = () => {
    if (!filters.academicYear) {
      setError("Please select academic year.");
      return;
    }

    if (!filters.department) {
      setError("Please select department.");
      return;
    }

    if (!filters.className) {
      setError("Please select class.");
      return;
    }

    if (!filters.fromDate || !filters.toDate) {
      setError("Please select date range.");
      return;
    }

    if (filters.fromDate > filters.toDate) {
      setError("From date cannot be greater than To date.");
      return;
    }

    setError("");
    setReportCreated(true);
  };

  const resetFilters = () => {
    setFilters({
      academicYear: "",
      department: "",
      className: "",
      subject: "",
      fromDate: "",
      toDate: "",
    });

    setReportCreated(false);
    setError("");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const data =
      reportType === "student"
        ? students
        : classes;

    const headers =
      reportType === "student"
        ? [
            "Student",
            "Roll No",
            "Class",
            "Attendance",
            "Marks",
            "Status",
          ]
        : [
            "Class",
            "Department",
            "Students",
            "Attendance",
            "Marks",
            "Status",
          ];

    const rows = data.map((item) =>
      reportType === "student"
        ? [
            item.name,
            item.rollNo,
            item.className,
            item.attendance,
            item.marks,
            item.status,
          ]
        : [
            item.className,
            item.department,
            item.students,
            item.attendance,
            item.marks,
            item.status,
          ]
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${reportType}-report.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  const reportData =
    reportType === "student"
      ? students
      : classes;

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6">

      {/* HEADER */}

      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

        <div>
          <div className="flex items-center gap-2">
            <FiBarChart2
              size={21}
              className="text-blue-600"
            />

            <h1 className="text-xl font-semibold text-gray-800">
              Reports
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Create student and class reports using filters.
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<FiRefreshCcw size={15} />}
          onClick={resetFilters}
          sx={{
            textTransform: "none",
            borderRadius: "7px",
            fontSize: "13px",
          }}
        >
          Reset
        </Button>

      </div>

      {/* MAIN FILTER CARD */}

      <div className="rounded-xl border border-gray-200 bg-white p-5">

        {/* REPORT TYPE */}

        <div className="mb-6">

          <h2 className="mb-3 text-sm font-semibold text-gray-800">
            Report Type
          </h2>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => {
                setReportType("student");
                setReportCreated(false);
              }}
              className={`rounded-lg border px-5 py-3 text-sm font-medium transition ${
                reportType === "student"
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Student Report
            </button>

            <button
              type="button"
              onClick={() => {
                setReportType("class");
                setReportCreated(false);
              }}
              className={`rounded-lg border px-5 py-3 text-sm font-medium transition ${
                reportType === "class"
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Class Report
            </button>

          </div>

        </div>

        {/* DIVIDER */}

        <div className="mb-6 border-t border-gray-100" />

        {/* FILTERS */}

        <h2 className="mb-4 text-sm font-semibold text-gray-800">
          Filters
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* ACADEMIC YEAR */}

          <TextField
            select
            fullWidth
            size="small"
            label="Academic Year"
            value={filters.academicYear}
            onChange={(e) =>
              handleChange(
                "academicYear",
                e.target.value
              )
            }
            sx={fieldStyle}
          >
            <MenuItem value="">
              Select Academic Year
            </MenuItem>

            <MenuItem value="2026-27">
              2026-27
            </MenuItem>

            <MenuItem value="2025-26">
              2025-26
            </MenuItem>
          </TextField>

          {/* DEPARTMENT */}

          <TextField
            select
            fullWidth
            size="small"
            label="Department"
            value={filters.department}
            onChange={(e) =>
              handleChange(
                "department",
                e.target.value
              )
            }
            sx={fieldStyle}
          >
            <MenuItem value="">
              Select Department
            </MenuItem>

            <MenuItem value="Science">
              Science
            </MenuItem>

            <MenuItem value="Commerce">
              Commerce
            </MenuItem>

            <MenuItem value="Arts">
              Arts
            </MenuItem>
          </TextField>

          {/* CLASS */}

          <TextField
            select
            fullWidth
            size="small"
            label="Class"
            value={filters.className}
            onChange={(e) =>
              handleChange(
                "className",
                e.target.value
              )
            }
            sx={fieldStyle}
          >
            <MenuItem value="">
              Select Class
            </MenuItem>

            <MenuItem value="9-A">
              9-A
            </MenuItem>

            <MenuItem value="9-B">
              9-B
            </MenuItem>

            <MenuItem value="10-A">
              10-A
            </MenuItem>

            <MenuItem value="10-B">
              10-B
            </MenuItem>

            <MenuItem value="11-A">
              11-A
            </MenuItem>

            <MenuItem value="12-A">
              12-A
            </MenuItem>
          </TextField>

          {/* SUBJECT */}

          <TextField
            select
            fullWidth
            size="small"
            label="Subject"
            value={filters.subject}
            onChange={(e) =>
              handleChange(
                "subject",
                e.target.value
              )
            }
            sx={fieldStyle}
          >
            <MenuItem value="">
              All Subjects
            </MenuItem>

            <MenuItem value="Mathematics">
              Mathematics
            </MenuItem>

            <MenuItem value="Physics">
              Physics
            </MenuItem>

            <MenuItem value="Chemistry">
              Chemistry
            </MenuItem>

            <MenuItem value="English">
              English
            </MenuItem>
          </TextField>

          {/* FROM DATE */}

          <TextField
            fullWidth
            size="small"
            type="date"
            label="From Date"
            value={filters.fromDate}
            onChange={(e) =>
              handleChange(
                "fromDate",
                e.target.value
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            sx={fieldStyle}
          />

          {/* TO DATE */}

          <TextField
            fullWidth
            size="small"
            type="date"
            label="To Date"
            value={filters.toDate}
            onChange={(e) =>
              handleChange(
                "toDate",
                e.target.value
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            sx={fieldStyle}
          />

        </div>

        {/* ERROR */}

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* CREATE BUTTON */}

        <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">

          <Button
            variant="contained"
            onClick={createReport}
            sx={{
              minWidth: 145,
              height: 42,
              borderRadius: "7px",
              backgroundColor: "#1976d2",
              textTransform: "none",
              fontSize: "13px",
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#1565c0",
                boxShadow: "none",
              },
            }}
          >
            Create Report
          </Button>

        </div>

      </div>

      {/* REPORT */}

      {reportCreated && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white">

          {/* REPORT HEADER */}

          <div className="flex flex-col justify-between gap-3 border-b border-gray-200 p-5 md:flex-row md:items-center">

            <div>
              <h2 className="text-base font-semibold text-gray-800">
                {reportType === "student"
                  ? "Student Report"
                  : "Class Report"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filters.className} •{" "}
                {filters.department} •{" "}
                {filters.academicYear}
              </p>
            </div>

            <div className="flex gap-2">

              <Button
                variant="outlined"
                startIcon={<FiPrinter size={14} />}
                onClick={handlePrint}
                sx={{
                  textTransform: "none",
                  borderRadius: "7px",
                  fontSize: "12px",
                }}
              >
                Print
              </Button>

              <Button
                variant="contained"
                startIcon={<FiDownload size={14} />}
                onClick={handleExport}
                sx={{
                  textTransform: "none",
                  borderRadius: "7px",
                  fontSize: "12px",
                  boxShadow: "none",
                }}
              >
                Export
              </Button>

            </div>

          </div>

          {/* SIMPLE SUMMARY */}

          <div className="grid grid-cols-2 border-b border-gray-100 md:grid-cols-4">

            <Summary
              title={
                reportType === "student"
                  ? "Total Students"
                  : "Total Classes"
              }
              value={
                reportType === "student"
                  ? "124"
                  : "18"
              }
            />

            <Summary
              title="Attendance"
              value="87%"
            />

            <Summary
              title="Average Marks"
              value="78%"
            />

            <Summary
              title="Pass Rate"
              value="92%"
            />

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto p-5">

            <table className="w-full min-w-[700px] border-collapse">

              <thead>

                <tr className="bg-gray-50">

                  {reportType === "student" ? (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Student
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Roll No
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Class
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Attendance
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Marks
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Status
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Class
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Department
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Students
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Attendance
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Marks
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        Status
                      </th>
                    </>
                  )}

                </tr>

              </thead>

              <tbody>

                {reportData.map((item, index) => (

                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >

                    {reportType === "student" ? (
                      <>
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">
                          {item.name}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.rollNo}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.className}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.attendance}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.marks}
                        </td>

                        <td className="px-4 py-4">
                          <Status status={item.status} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">
                          {item.className}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.department}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.students}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.attendance}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.marks}
                        </td>

                        <td className="px-4 py-4">
                          <Status status={item.status} />
                        </td>
                      </>
                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}


// SUMMARY

function Summary({ title, value }) {
  return (
    <div className="border-r border-gray-100 p-5 last:border-r-0">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}


// STATUS

function Status({ status }) {
  const good = status === "Good";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        good
          ? "bg-green-50 text-green-600"
          : "bg-orange-50 text-orange-600"
      }`}
    >
      {status}
    </span>
  );
}