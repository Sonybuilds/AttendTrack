import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Button,
  Chip,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import { HiOutlineSearch, HiOutlineUsers } from "react-icons/hi";

import { classes_name, departments } from "../data/class_from";
import api from "../api/axios";

export default function StudentTable({ onEdit }) {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState(() => new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({ department: "", className: "", academicYear: "" });
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("success");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/teacher/students", {
        params: {
          page: paginationModel.page,
          limit: paginationModel.pageSize,
          search: debouncedSearch,
          className: selectedClass || "",
          department: selectedDepartment || "",
        },
      });
      const nextStudents = response.data.students || [];
      const total = response.data.total || 0;
      setStudents(nextStudents);
      setTotalStudents(total);
      if (!nextStudents.length && total > 0 && paginationModel.page > 0) {
        setPaginationModel((current) => ({
          ...current,
          page: Math.min(current.page - 1, Math.ceil(total / current.pageSize) - 1),
        }));
      }
    } catch (error) {
      console.error("Failed to load students:", error);
      setMessage(error.response?.data?.message || "Failed to load students");
      setMessageSeverity("error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, paginationModel, selectedClass, selectedDepartment]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    Promise.resolve().then(loadStudents);
  }, [loadStudents]);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      const response = await api.delete(`/teacher/students/${studentToDelete._id}`);
      setMessage(response.data.message || "Student deleted successfully");
      setMessageSeverity("success");
      setSelectedStudentIds((current) => {
        const next = new Set(current);
        next.delete(String(studentToDelete._id));
        return next;
      });
      await loadStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete student");
      setMessageSeverity("error");
    } finally {
      setStudentToDelete(null);
    }
  };

  const toggleStudentSelection = (studentId, checked) => {
    setSelectedStudentIds((current) => {
      const next = new Set(current);
      if (checked) next.add(String(studentId));
      else next.delete(String(studentId));
      return next;
    });
  };

  const visibleStudentIds = students.map((student) => String(student._id));
  const selectedVisibleCount = visibleStudentIds.filter((id) => selectedStudentIds.has(id)).length;
  const allVisibleSelected = visibleStudentIds.length > 0 && selectedVisibleCount === visibleStudentIds.length;

  const toggleVisibleStudents = (checked) => {
    setSelectedStudentIds((current) => {
      const next = new Set(current);
      visibleStudentIds.forEach((id) => checked ? next.add(id) : next.delete(id));
      return next;
    });
  };

  const handleBulkUpdate = async () => {
    const updates = Object.fromEntries(Object.entries(bulkUpdates).filter(([, value]) => value));
    if (!Object.keys(updates).length || !selectedStudentIds.size) return;

    setBulkSaving(true);
    const ids = [...selectedStudentIds];
    const results = await Promise.allSettled(ids.map((id) => api.put(`/teacher/students/${id}`, updates)));
    const failedIds = ids.filter((_, index) => results[index].status === "rejected");
    const updatedCount = ids.length - failedIds.length;
    setSelectedStudentIds(new Set(failedIds));
    setMessage(failedIds.length
      ? `${updatedCount} student(s) updated; ${failedIds.length} failed. Failed students remain selected.`
      : `${updatedCount} student(s) updated successfully`);
    setMessageSeverity(failedIds.length ? (updatedCount ? "warning" : "error") : "success");
    if (!failedIds.length) {
      setBulkEditOpen(false);
      setBulkUpdates({ department: "", className: "", academicYear: "" });
    }
    await loadStudents();
    setBulkSaving(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedClass(null);
    setSelectedDepartment(null);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updateFilter = (setter, value) => {
    setter(value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const hasFilters = Boolean(search || selectedClass || selectedDepartment);
  const firstRow = totalStudents === 0 ? 0 : paginationModel.page * paginationModel.pageSize + 1;
  const lastRow = Math.min((paginationModel.page + 1) * paginationModel.pageSize, totalStudents);

  return (
    <>
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3500}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={messageSeverity} variant="filled" onClose={() => setMessage("")}>
          {message}
        </Alert>
      </Snackbar>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(230px,1fr)_190px_220px_auto]">
              <TextField
                size="small"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPaginationModel((current) => ({ ...current, page: 0 }));
                }}
                placeholder="Search name, roll no, email, subject"
                aria-label="Search students"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HiOutlineSearch className="text-lg text-slate-400" />
                    </InputAdornment>
                  ),
                }}
              />
              <Autocomplete
                size="small"
                options={classes_name}
                value={selectedClass}
                onChange={(_, value) => updateFilter(setSelectedClass, value)}
                renderInput={(params) => <TextField {...params} placeholder="All classes" aria-label="Filter by class" />}
              />
              <Autocomplete
                size="small"
                options={departments}
                value={selectedDepartment}
                onChange={(_, value) => updateFilter(setSelectedDepartment, value)}
                renderInput={(params) => <TextField {...params} placeholder="All departments" aria-label="Filter by department" />}
              />
              {hasFilters && (
                <Button onClick={clearFilters} className="!whitespace-nowrap !normal-case !text-slate-600">
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        <TableContainer className="overflow-x-auto">
          <Table aria-label="Student records" sx={{ minWidth: 1040 }}>
            <TableHead>
              <TableRow sx={{ "& th": { backgroundColor: "#f8fafc", color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid #e2e8f0" } }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allVisibleSelected}
                    indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                    onChange={(event) => toggleVisibleStudents(event.target.checked)}
                    disabled={!students.length || loading}
                    inputProps={{ "aria-label": "Select all students on this page" }}
                  />
                </TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                    <CircularProgress size={24} />
                    <p className="mt-2 text-sm text-slate-500">Loading student records…</p>
                  </TableCell>
                </TableRow>
              ) : students.length ? (
                students.map((student, index) => {
                  const initials = (student.name || "Student")
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("");
                  const subjects = Array.isArray(student.subjects) ? student.subjects : [];
                  return (
                    <TableRow
                      key={student._id}
                      hover
                      sx={{
                        "& td": { borderBottom: "1px solid #f1f5f9", py: 1.5 },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selectedStudentIds.has(String(student._id))}
                          onChange={(event) => toggleStudentSelection(student._id, event.target.checked)}
                          inputProps={{ "aria-label": `Select ${student.name}` }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-48 items-center gap-3">
                          <Avatar sx={{ width: 36, height: 36, bgcolor: ["#dbeafe", "#dcfce7", "#f3e8ff", "#ffedd5"][index % 4], color: ["#1d4ed8", "#15803d", "#7e22ce", "#c2410c"][index % 4], fontSize: 13, fontWeight: 700 }}>
                            {initials}
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
                            <p className="max-w-48 truncate text-xs text-slate-500">{student.email || "Email not provided"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                          {student.rollNo}
                        </span>
                      </TableCell>
                      <TableCell className="!text-sm !font-medium !text-slate-700">{student.className}</TableCell>
                      <TableCell className="!text-sm !text-slate-600">{student.department}</TableCell>
                      <TableCell>
                        <div className="flex min-w-40 flex-wrap gap-1">
                          {subjects.length ? (
                            <>
                              {subjects.slice(0, 2).map((subject) => (
                                <Chip key={subject._id || subject.subject || subject} label={subject.subject || subject} size="small" className="!h-6 !bg-blue-50 !text-xs !font-medium !text-blue-700" />
                              ))}
                              {subjects.length > 2 && <Chip label={`+${subjects.length - 2}`} size="small" className="!h-6 !bg-slate-100 !text-xs !text-slate-600" />}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">No subjects</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="!whitespace-nowrap !text-sm !text-slate-600">{student.phone}</TableCell>
                      <TableCell align="right">
                        <div className="flex justify-end gap-1">
                          <Tooltip title="Edit student">
                            <IconButton aria-label={`Edit ${student.name}`} onClick={() => onEdit(student)} size="small" className="!text-blue-700 hover:!bg-blue-50">
                              <MdEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete student">
                            <IconButton aria-label={`Delete ${student.name}`} onClick={() => setStudentToDelete(student)} size="small" className="!text-rose-600 hover:!bg-rose-50">
                              <MdDelete />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"><HiOutlineUsers className="text-xl" /></span>
                      <p className="mt-3 text-sm font-semibold text-slate-800">{hasFilters ? "No students match your search" : "No student records yet"}</p>
                      <p className="mt-1 text-xs text-slate-500">{hasFilters ? "Try different search terms or clear the filters." : "Student records will appear here after they are added."}</p>
                      {hasFilters && <Button onClick={clearFilters} size="small" className="!mt-2 !normal-case">Clear filters</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={8}
                  count={totalStudents}
                  page={paginationModel.page}
                  rowsPerPage={paginationModel.pageSize}
                  onPageChange={(_, page) => setPaginationModel((current) => ({ ...current, page }))}
                  onRowsPerPageChange={(event) => setPaginationModel({ page: 0, pageSize: Number(event.target.value) })}
                  rowsPerPageOptions={[10, 25, 50]}
                  labelDisplayedRows={() => `${firstRow}–${lastRow} of ${totalStudents}`}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        {selectedStudentIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-blue-900">{selectedStudentIds.size} student(s) selected</p>
            <div className="flex items-center gap-2">
              <Button size="small" onClick={() => setSelectedStudentIds(new Set())} className="!normal-case !text-slate-600">Clear selection</Button>
              <Button size="small" variant="contained" onClick={() => setBulkEditOpen(true)} className="!bg-blue-700 !normal-case">Update selected</Button>
            </div>
          </div>
        )}
      </section>

      <Dialog open={bulkEditOpen} onClose={() => { if (!bulkSaving) setBulkEditOpen(false); }} fullWidth maxWidth="sm">
        <DialogTitle>Update selected students</DialogTitle>
        <DialogContent>
          <p className="mb-4 mt-1 text-sm text-slate-500">Choose the fields to update for all {selectedStudentIds.size} selected students. Leave a field empty to keep each student’s current value.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Autocomplete
              options={[...new Set([...departments, bulkUpdates.department].filter(Boolean))]}
              value={bulkUpdates.department || null}
              onChange={(_, value) => setBulkUpdates((current) => ({ ...current, department: value || "" }))}
              renderInput={(params) => <TextField {...params} label="Department" />}
            />
            <Autocomplete
              options={[...new Set([...classes_name, bulkUpdates.className].filter(Boolean))]}
              value={bulkUpdates.className || null}
              onChange={(_, value) => setBulkUpdates((current) => ({ ...current, className: value || "" }))}
              renderInput={(params) => <TextField {...params} label="Class" />}
            />
            <TextField
              select
              fullWidth
              label="Academic Year"
              value={bulkUpdates.academicYear}
              onChange={(event) => setBulkUpdates((current) => ({ ...current, academicYear: event.target.value }))}
            >
              <MenuItem value=""><em>Keep current</em></MenuItem>
              {["2025 - 2026", "2026 - 2027", "2027 - 2028"].map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </TextField>
          </div>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => setBulkEditOpen(false)} disabled={bulkSaving} className="!normal-case">Cancel</Button>
          <Button
            onClick={handleBulkUpdate}
            disabled={bulkSaving || !Object.values(bulkUpdates).some(Boolean)}
            variant="contained"
            className="!bg-blue-700 !normal-case"
          >
            {bulkSaving ? "Updating…" : "Update students"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(studentToDelete)} onClose={() => setStudentToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete student?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600">
            This will permanently remove <strong>{studentToDelete?.name}</strong> and their enrolled subject records.
          </p>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => setStudentToDelete(null)} className="!normal-case">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" className="!normal-case">Delete Student</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
