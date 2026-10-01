import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  createFilterOptions,
  Dialog,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { HiOutlineAcademicCap, HiOutlineUser } from "react-icons/hi";

import { classes_name, departments } from "../data/class_from";
import api from "../api/axios";

const academicYears = ["2025 - 2026", "2026 - 2027", "2027 - 2028"];
const filterSubjectOptions = createFilterOptions({
  stringify: (subject) => `${subject.subject || ""} ${subject.subjectCode || ""}`,
});

const emptyForm = {
  name: "",
  password: "",
  fatherName: "",
  rollNo: "",
  department: null,
  className: null,
  phone: "",
  email: "",
  gender: "",
  dob: null,
  academicYear: null,
  subjects: [],
};

const getInitialForm = (student) => ({
  ...emptyForm,
  ...student,
  password: "",
  department: student?.department || null,
  className: student?.className || null,
  academicYear: student?.academicYear || null,
  subjects: Array.isArray(student?.subjects)
    ? student.subjects
      .map((subject) => typeof subject === "object" ? subject?._id && String(subject._id) : String(subject))
      .filter(Boolean)
    : [],
  dob: student?.dob && dayjs(student.dob).isValid() ? dayjs(student.dob) : null,
});

export default function StudentForm({ open, onClose, onSuccess, editData = null }) {
  const [formData, setFormData] = useState(() => getInitialForm(editData));
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(editData?._id);

  useEffect(() => {
    let isCurrent = true;
    api.get("/teacher/classes")
      .then((response) => {
        if (isCurrent) setSubjectOptions(response.data.classes || []);
      })
      .catch((error) => console.error("Failed to load subjects:", error));
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Student name is required";
    if (!formData.fatherName.trim()) nextErrors.fatherName = "Father name is required";
    if (!formData.rollNo.trim()) nextErrors.rollNo = "Roll number is required";
    if ((!isEditing || formData.password) && formData.password.length < 8) nextErrors.password = "Use at least 8 characters";
    if (!formData.department) nextErrors.department = "Department is required";
    if (!formData.className) nextErrors.className = "Class name is required";
    if (!/^[0-9]{10}$/.test(formData.phone)) nextErrors.phone = "Enter a valid 10 digit phone number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!formData.gender) nextErrors.gender = "Gender is required";
    if (!formData.dob || !dayjs(formData.dob).isValid()) nextErrors.dob = "Date of birth is required";
    if (!formData.academicYear) nextErrors.academicYear = "Academic year is required";
    if (!formData.subjects.length) nextErrors.subjects = "Add at least one subject";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const studentData = {
      name: formData.name.trim(),
      fatherName: formData.fatherName.trim(),
      rollNo: formData.rollNo.trim(),
      department: formData.department,
      className: formData.className,
      phone: formData.phone,
      email: formData.email.trim().toLowerCase(),
      gender: formData.gender,
      dob: dayjs(formData.dob).toISOString(),
      academicYear: formData.academicYear,
      subjects: formData.subjects,
      ...(formData.password ? { password: formData.password } : {}),
    };

    try {
      setLoading(true);
      const response = isEditing
        ? await api.put(`/teacher/students/${editData._id}`, studentData)
        : await api.post("/teacher/addstudent", studentData);
      await onSuccess?.();
      setMessage(response.data.message || (isEditing ? "Student updated successfully" : "Student added successfully"));
      setTimeout(() => {
        setMessage("");
        setFormData(emptyForm);
        setErrors({});
        onClose();
      }, 700);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save student");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(emptyForm);
      setErrors({});
      onClose();
    }
  };

  return (
    <>
      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={message.toLowerCase().includes("success") ? "success" : "error"} variant="filled" onClose={() => setMessage("")}>
          {loading ? <CircularProgress color="inherit" size={16} className="!mr-2" /> : null}
          {message}
        </Alert>
      </Snackbar>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog
          open={open}
          onClose={handleClose}
          fullScreen
          PaperProps={{ sx: { backgroundColor: "#f8fafc" } }}
        >
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div>
              <Typography variant="h5" className="!font-semibold !text-slate-900">
                {isEditing ? "Edit Student" : "Add New Student"}
              </Typography>
              <Typography variant="body2" className="!mt-1 !text-slate-500">
                {isEditing ? "Update the student profile and academic details." : "Create a student profile and academic record."}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" onClick={handleClose} disabled={loading} className="!normal-case">Cancel</Button>
              <Button type="submit" form="student-form" variant="contained" disabled={loading} className="!bg-blue-700 !normal-case hover:!bg-blue-800">
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Student"}
              </Button>
            </div>
          </header>

          <form id="student-form" onSubmit={handleSubmit} className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-8">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><HiOutlineUser className="text-xl" /></span>
                <div><h2 className="text-sm font-semibold text-slate-900">Personal Information</h2><p className="mt-0.5 text-xs text-slate-500">Student identity and contact details</p></div>
              </div>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <TextField fullWidth label="Student Name" value={formData.name} onChange={(event) => handleChange("name", event.target.value)} error={Boolean(errors.name)} helperText={errors.name} />
                <TextField fullWidth label={isEditing ? "Reset portal password (optional)" : "Student portal password"} type="password" autoComplete="new-password" value={formData.password} onChange={(event) => handleChange("password", event.target.value)} error={Boolean(errors.password)} helperText={errors.password || (isEditing ? "Leave blank to keep the current password" : "At least 8 characters; students sign in with their roll number")} />
                <TextField fullWidth label="Father Name" value={formData.fatherName} onChange={(event) => handleChange("fatherName", event.target.value)} error={Boolean(errors.fatherName)} helperText={errors.fatherName} />
                <TextField fullWidth label="Phone Number" value={formData.phone} onChange={(event) => handleChange("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} error={Boolean(errors.phone)} helperText={errors.phone || "10 digit phone number"} />
                <TextField fullWidth label="Email (optional)" type="email" value={formData.email} onChange={(event) => handleChange("email", event.target.value)} error={Boolean(errors.email)} helperText={errors.email} />
                <TextField select fullWidth label="Gender" value={formData.gender} onChange={(event) => handleChange("gender", event.target.value)} error={Boolean(errors.gender)} helperText={errors.gender}>
                  <MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem>
                </TextField>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dob}
                  maxDate={dayjs()}
                  onChange={(value) => handleChange("dob", value)}
                  slotProps={{ textField: { fullWidth: true, error: Boolean(errors.dob), helperText: errors.dob } }}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><HiOutlineAcademicCap className="text-xl" /></span>
                <div><h2 className="text-sm font-semibold text-slate-900">Academic Information</h2><p className="mt-0.5 text-xs text-slate-500">Class placement, year, and enrolled subjects</p></div>
              </div>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <TextField fullWidth label="Roll Number" value={formData.rollNo} onChange={(event) => handleChange("rollNo", event.target.value)} error={Boolean(errors.rollNo)} helperText={errors.rollNo} />
                <Autocomplete
                  options={academicYears}
                  value={formData.academicYear}
                  onChange={(_, value) => handleChange("academicYear", value)}
                  renderInput={(params) => <TextField {...params} label="Academic Year" error={Boolean(errors.academicYear)} helperText={errors.academicYear} />}
                />
                <Autocomplete
                  options={[...new Set([...departments, formData.department].filter(Boolean))]}
                  value={formData.department}
                  onChange={(_, value) => handleChange("department", value)}
                  renderInput={(params) => <TextField {...params} label="Department" error={Boolean(errors.department)} helperText={errors.department} />}
                />
                <Autocomplete
                  options={[...new Set([...classes_name, formData.className].filter(Boolean))]}
                  value={formData.className}
                  onChange={(_, value) => handleChange("className", value)}
                  renderInput={(params) => <TextField {...params} label="Class Name" error={Boolean(errors.className)} helperText={errors.className} />}
                />
                <Autocomplete
                  multiple
                  options={subjectOptions}
                  value={subjectOptions.filter((subject) => formData.subjects.includes(String(subject._id)))}
                  getOptionLabel={(subject) => `${subject.subject} (${subject.subjectCode})`}
                  filterOptions={filterSubjectOptions}
                  isOptionEqualToValue={(option, value) => String(option._id) === String(value._id)}
                  onChange={(_, values) => handleChange("subjects", values.map((subject) => String(subject._id)))}
                  renderInput={(params) => <TextField {...params} label="Subjects" placeholder="Select class subjects" error={Boolean(errors.subjects)} helperText={errors.subjects || "Subjects are linked by their class record IDs"} />}
                  className="sm:col-span-2"
                />
              </div>
            </section>
          </form>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}
