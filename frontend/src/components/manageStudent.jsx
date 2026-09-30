import React, { useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiMapPin,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";


// =====================================================
// Student Data
// =====================================================

const initialStudents = [
  {
    id: 1,
    name: "Rahul Sharma",
    rollNo: "101",
    email: "rahul@example.com",
    attendance: 92,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Singh",
    rollNo: "102",
    email: "priya@example.com",
    attendance: 88,
    status: "Active",
  },
  {
    id: 3,
    name: "Amit Kumar",
    rollNo: "103",
    email: "amit@example.com",
    attendance: 76,
    status: "Active",
  },
  {
    id: 4,
    name: "Neha Gupta",
    rollNo: "104",
    email: "neha@example.com",
    attendance: 95,
    status: "Active",
  },
  {
    id: 5,
    name: "Rohit Verma",
    rollNo: "105",
    email: "rohit@example.com",
    attendance: 68,
    status: "Inactive",
  },
];


// =====================================================
// Main Component
// =====================================================

export default function StudentManage() {
  const [students, setStudents] = useState(initialStudents);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
  });


  // =====================================================
  // Filter Students
  // =====================================================

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        student.name.toLowerCase().includes(searchText) ||
        student.rollNo.toLowerCase().includes(searchText) ||
        student.email.toLowerCase().includes(searchText);

      const matchesStatus =
        status === "All" || student.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, status]);


  // =====================================================
  // Share Class Time
  // =====================================================

  const handleShareTime = async () => {
    const shareText = `
Mathematics
Class: 10-A
Subject Code: MAT-101
Department: Science

Date: 30 Sep 2026
Time: 10:00 AM - 11:00 AM
Location: Room 204
    `.trim();

    // Mobile / supported browser
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Class Schedule",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
								console.log(error)
      }

      return;
    }

    // Desktop fallback
    try {
      await navigator.clipboard.writeText(shareText);

      alert("Class schedule copied to clipboard!");
    } catch (error) {
      console.log("Unable to copy schedule");
						console.log(error)
    }
  };


  // =====================================================
  // Menu
  // =====================================================

  const handleMenuOpen = (event, student) => {
    setMenuAnchor(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };


  // =====================================================
  // Add Student
  // =====================================================

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.rollNo.trim()) {
      return;
    }

    const student = {
      id: Date.now(),
      name: newStudent.name,
      rollNo: newStudent.rollNo,
      email: newStudent.email,
      attendance: 0,
      status: "Active",
    };

    setStudents((prev) => [...prev, student]);

    setNewStudent({
      name: "",
      rollNo: "",
      email: "",
    });

    setAddStudentOpen(false);
  };


  // =====================================================
  // Delete Student
  // =====================================================

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.filter(
        (student) => student.id !== selectedStudent.id
      )
    );

    setDeleteOpen(false);
    setSelectedStudent(null);
  };


  // =====================================================
  // View Student
  // =====================================================

  const handleViewStudent = () => {
    handleMenuClose();

    console.log("View Student:", selectedStudent);
  };


  // =====================================================
  // Edit Student
  // =====================================================

  const handleEditStudent = () => {
    handleMenuClose();

    console.log("Edit Student:", selectedStudent);
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="mx-auto max-w-7xl">


        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <IconButton
              onClick={() => window.history.back()}
              sx={{
                width: 38,
                height: 38,
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#fff",
              }}
            >
              <FiArrowLeft size={18} />
            </IconButton>

            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Student Manage
              </h1>

              <p className="mt-0.5 text-xs text-gray-500">
                Manage students enrolled in this class
              </p>
            </div>

          </div>


          <Button
            variant="contained"
            startIcon={<FiPlus size={16} />}
            onClick={() => setAddStudentOpen(true)}
            sx={{
              minHeight: 38,
              borderRadius: "8px",
              backgroundColor: "#1976d2",
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#1565c0",
                boxShadow: "none",
              },
            }}
          >
            Add Student
          </Button>

        </div>


        {/* ================================================= */}
        {/* CLASS INFORMATION */}
        {/* ================================================= */}

        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="p-5">


            {/* Class Header */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FiBookOpen size={20} />
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-base font-semibold text-gray-800">
                      Mathematics
                    </h2>

                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                      Active
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    MAT-101 • Class 10-A • Science
                  </p>

                </div>

              </div>


              {/* Student Count */}

              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">

                <FiUsers
                  size={16}
                  className="text-gray-400"
                />

                <div>

                  <p className="text-[10px] text-gray-400">
                    Total Students
                  </p>

                  <p className="text-sm font-semibold text-gray-700">
                    {students.length}
                  </p>

                </div>

              </div>

            </div>


            {/* Divider */}

            <div className="my-5 border-t border-gray-100" />


            {/* Date / Time / Location */}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">


                {/* Date */}

                <ClassInfo
                  icon={<FiCalendar />}
                  label="Class Date"
                  value="30 Sep 2026"
                />


                {/* Time */}

                <ClassInfo
                  icon={<FiClock />}
                  label="Class Time"
                  value="10:00 AM - 11:00 AM"
                />


                {/* Location */}

                <ClassInfo
                  icon={<FiMapPin />}
                  label="Location"
                  value="Room 204"
                />

              </div>


              {/* Share Button */}

              <Button
                variant="outlined"
                size="small"
                startIcon={<FiShare2 size={15} />}
                onClick={handleShareTime}
                sx={{
                  minHeight: 36,
                  borderRadius: "7px",
                  borderColor: "#d5dde8",
                  color: "#1976d2",
                  textTransform: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",

                  "&:hover": {
                    borderColor: "#1976d2",
                    backgroundColor: "#f5f9ff",
                  },
                }}
              >
                Share Time
              </Button>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* STUDENT LIST */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">


          {/* Toolbar */}

          <div className="border-b border-gray-100 p-4">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h3 className="text-sm font-semibold text-gray-800">
                  Students
                </h3>

                <p className="mt-0.5 text-xs text-gray-500">
                  {filteredStudents.length} students found
                </p>

              </div>


              <div className="flex flex-col gap-2 sm:flex-row">


                {/* Search */}

                <div className="relative">

                  <FiSearch
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 sm:w-60"
                  />

                </div>


                {/* Status Filter */}

                <Select
                  size="small"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  sx={{
                    minWidth: 120,
                    height: 36,
                    fontSize: "12px",
                    borderRadius: "8px",

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                  }}
                >

                  <MenuItem value="All">
                    All Status
                  </MenuItem>

                  <MenuItem value="Active">
                    Active
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>

                </Select>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* TABLE */}
          {/* ================================================= */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px]">

              <thead>

                <tr className="border-b border-gray-100 bg-gray-50/70">

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Roll No.
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Attendance
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStudents.length > 0 ? (

                  filteredStudents.map((student) => (

                    <tr
                      key={student.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                    >

                      {/* Student */}

                      <td className="px-5 py-3">

                        <div className="flex items-center gap-3">

                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: 12,
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                            }}
                          >
                            {student.name.charAt(0)}
                          </Avatar>

                          <div>

                            <p className="text-xs font-semibold text-gray-800">
                              {student.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-gray-400">
                              {student.email}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Roll Number */}

                      <td className="px-5 py-3">

                        <span className="text-xs font-medium text-gray-600">
                          {student.rollNo}
                        </span>

                      </td>


                      {/* Attendance */}

                      <td className="px-5 py-3">

                        <div className="flex items-center gap-2">

                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">

                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${student.attendance}%`,
                              }}
                            />

                          </div>

                          <span className="text-xs font-medium text-gray-600">
                            {student.attendance}%
                          </span>

                        </div>

                      </td>


                      {/* Status */}

                      <td className="px-5 py-3">

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            student.status === "Active"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              student.status === "Active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />

                          {student.status}

                        </span>

                      </td>


                      {/* Action */}

                      <td className="px-5 py-3 text-right">

                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleMenuOpen(e, student)
                          }
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "7px",
                            color: "#6b7280",

                            "&:hover": {
                              backgroundColor: "#f3f4f6",
                            },
                          }}
                        >
                          <FiMoreVertical size={17} />
                        </IconButton>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <FiUser size={20} />
                        </div>

                        <p className="text-sm font-medium text-gray-700">
                          No students found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your search or filter.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* ACTION MENU */}
      {/* ================================================= */}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 160,
            borderRadius: "9px",
            border: "1px solid #eeeeee",
            boxShadow: "0 8px 25px rgba(0,0,0,0.10)",
          },
        }}
      >

        <MenuItem
          onClick={handleViewStudent}
          sx={{
            fontSize: 12,
            gap: 1,
          }}
        >
          <FiUser size={15} />
          View Student
        </MenuItem>


        <MenuItem
          onClick={handleEditStudent}
          sx={{
            fontSize: 12,
            gap: 1,
          }}
        >
          <FiEdit2 size={15} />
          Edit Student
        </MenuItem>


        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDeleteOpen(true);
          }}
          sx={{
            fontSize: 12,
            gap: 1,
            color: "#d32f2f",
          }}
        >
          <FiTrash2 size={15} />
          Remove Student
        </MenuItem>

      </Menu>


      {/* ================================================= */}
      {/* ADD STUDENT DIALOG */}
      {/* ================================================= */}

      <Dialog
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontSize: 17,
            fontWeight: 600,
            borderBottom: "1px solid #eeeeee",
          }}
        >
          Add Student
        </DialogTitle>


        <DialogContent>

          <p className="mb-5 mt-4 text-xs text-gray-500">
            Enter the student details to add them to this class.
          </p>


          <div className="space-y-4">

            <TextField
              fullWidth
              size="small"
              label="Student Name"
              placeholder="Enter student name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  name: e.target.value,
                })
              }
            />


            <TextField
              fullWidth
              size="small"
              label="Roll Number"
              placeholder="Enter roll number"
              value={newStudent.rollNo}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  rollNo: e.target.value,
                })
              }
            />


            <TextField
              fullWidth
              size="small"
              label="Email"
              placeholder="Enter email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  email: e.target.value,
                })
              }
            />

          </div>

        </DialogContent>


        <DialogActions
          sx={{
            borderTop: "1px solid #eeeeee",
            padding: "12px 20px",
          }}
        >

          <Button
            onClick={() => setAddStudentOpen(false)}
            sx={{
              textTransform: "none",
              color: "#6b7280",
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={handleAddStudent}
            startIcon={<FiPlus size={15} />}
            sx={{
              textTransform: "none",
              borderRadius: "7px",
              boxShadow: "none",
            }}
          >
            Add Student
          </Button>

        </DialogActions>

      </Dialog>


      {/* ================================================= */}
      {/* DELETE CONFIRMATION */}
      {/* ================================================= */}

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Remove Student
        </DialogTitle>


        <DialogContent>

          <Alert
            severity="warning"
            sx={{
              fontSize: 12,
              alignItems: "center",
            }}
          >
            Are you sure you want to remove{" "}
            <strong className="mx-1">
              {selectedStudent?.name}
            </strong>
            from this class?
          </Alert>

        </DialogContent>


        <DialogActions
          sx={{
            padding: "10px 20px 18px",
          }}
        >

          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{
              textTransform: "none",
              color: "#6b7280",
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            color="error"
            startIcon={<FiTrash2 size={14} />}
            onClick={handleDeleteStudent}
            sx={{
              textTransform: "none",
              borderRadius: "7px",
              boxShadow: "none",
            }}
          >
            Remove
          </Button>

        </DialogActions>

      </Dialog>

    </div>
  );
}


// =====================================================
// Class Info Component
// =====================================================

function ClassInfo({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-gray-500">
        {React.cloneElement(icon, {
          size: 15,
        })}
      </div>

      <div>

        <p className="text-[10px] font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 whitespace-nowrap text-xs font-semibold text-gray-700">
          {value}
        </p>

      </div>

    </div>
  );
}