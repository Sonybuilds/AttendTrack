import {
  Autocomplete,
  Button,
  InputAdornment,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import { useState, useEffect, useCallback, useMemo } from "react";
import { BiBookAdd } from "react-icons/bi";
import {
  HiOutlineAcademicCap,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";

import { classes_name, departments } from "../data/class_from";
import ClassCard from "../components/class_card";
import ClassForm from "../forms/class_form";
import api from "../api/axios";

export default function Class() {
  const [addAction, setAddAction] = useState(false);
  const [classes, setClasses] = useState([]);
  const [editClass, setEditClass] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("success");
  const [sendingEmailClassId, setSendingEmailClassId] = useState(null);

  const getClasses = useCallback(async () => {
    try {
      const response = await api.get("/teacher/classes");
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(getClasses);
  }, [getClasses]);

  const handleClassAdded = async () => {
    await getClasses();
  };

  const handleDeleteClass = async (id) => {
    try {
      const response = await api.delete(`/teacher/classes/${id}`);
      setMessage(response.data.message);
      await getClasses();
      setTimeout(() => setMessage(""), 1500);
    } catch (error) {
      console.error("Failed to delete class:", error);
      setMessage(error.response?.data?.message || "Failed to delete class");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleEditClass = (classData) => {
    setEditClass(classData);
    setAddAction(true);
  };

  const handleEmailSchedule = async (classData) => {
    setSendingEmailClassId(classData._id);
    try {
      const response = await api.post(`/teacher/classes/${classData._id}/email-schedule`);
      setMessage(response.data.message || "Schedule email sent");
      setMessageSeverity(response.data.failedCount ? "warning" : "success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send schedule emails");
      setMessageSeverity("error");
    } finally {
      setSendingEmailClassId(null);
    }
  };

  const filteredClasses = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    return classes.filter((classData) => {
      const matchesSearch =
        !searchText ||
        classData.subject?.toLowerCase().includes(searchText) ||
        classData.subjectCode?.toLowerCase().includes(searchText);
      const matchesClass = !selectedClass || classData.className === selectedClass;
      const matchesDepartment = !selectedDepartment || classData.department === selectedDepartment;
      return matchesSearch && matchesClass && matchesDepartment;
    });
  }, [classes, search, selectedClass, selectedDepartment]);

  const hasFilters = Boolean(search || selectedClass || selectedDepartment);

  const clearFilters = () => {
    setSearch("");
    setSelectedClass(null);
    setSelectedDepartment(null);
  };

  return (
    <>
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setMessage("")} severity={messageSeverity} variant="filled">
          {message}
        </Alert>
      </Snackbar>

      <ClassForm
        key={editClass?._id || "add-class"}
        open={addAction}
        onClose={() => {
          setAddAction(false);
          setEditClass(null);
        }}
        editData={editClass}
        onSuccess={handleClassAdded}
      />

      <main className="min-h-full bg-slate-50 px-3 py-4 sm:px-4 lg:px-5">
        <div className="mx-auto max-w-[1600px]">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Class Management</h1>
              <p className="mt-1 text-sm text-slate-500">Manage class details, schedules, and student capacity.</p>
            </div>
            <Button
              onClick={() => setAddAction(true)}
              variant="contained"
              startIcon={<BiBookAdd className="text-lg" />}
              className="!h-11 !w-fit !rounded-lg !bg-blue-700 !px-5 !font-semibold !normal-case !shadow-sm hover:!bg-blue-800"
            >
              Add Class
            </Button>
          </header>

          <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" aria-label="Class filters">
            {hasFilters && <div className="mb-3 flex justify-end"><Button onClick={clearFilters} size="small" startIcon={<HiOutlineX />} className="!shrink-0 !normal-case !text-slate-600">Clear filters</Button></div>}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Subject name or code"
                aria-label="Search by subject name or code"
                InputProps={{ startAdornment: <InputAdornment position="start"><HiOutlineSearch className="text-lg text-slate-400" /></InputAdornment> }}
              />
              <Autocomplete
                size="small"
                value={selectedClass}
                onChange={(event, newValue) => setSelectedClass(newValue)}
                options={classes_name}
                autoHighlight
                clearOnBlur={false}
                openOnFocus
                renderInput={(params) => <TextField {...params} placeholder="All classes" aria-label="Filter by class" />}
              />
              <Autocomplete
                size="small"
                value={selectedDepartment}
                onChange={(event, newValue) => setSelectedDepartment(newValue)}
                options={departments}
                autoHighlight
                clearOnBlur={false}
                openOnFocus
                renderInput={(params) => <TextField {...params} placeholder="All departments" aria-label="Filter by department" />}
              />
            </div>
          </section>

          {filteredClasses.length > 0 ? (
            <div className="mb-10 mt-4 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((classData) => (
                <ClassCard
                  key={classData._id}
                  classData={classData}
                  onDelete={handleDeleteClass}
                  onEdit={handleEditClass}
                  onEmailSchedule={handleEmailSchedule}
                  sendingEmail={sendingEmailClassId === classData._id}
                />
              ))}
            </div>
          ) : (
            <section className="my-5 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"><HiOutlineAcademicCap className="text-2xl" /></span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{hasFilters ? "No matching classes" : "No classes added yet"}</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {hasFilters ? "Try a different search or clear the filters to see all classes." : "Add your first class to start organizing schedules and student capacity."}
              </p>
              {hasFilters ? (
                <Button onClick={clearFilters} className="!mt-4 !normal-case !text-blue-700">Clear filters</Button>
              ) : (
                <Button onClick={() => setAddAction(true)} startIcon={<BiBookAdd />} className="!mt-4 !normal-case !text-blue-700">Add your first class</Button>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
