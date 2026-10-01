import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import {
  Autocomplete,
  Button,
  Dialog,
  TextField,
  Switch,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";

import { useState } from "react";
import dayjs from "dayjs";

import {
  classes_name,
  departments,
  weekDays,
} from "../data/class_from";

import api from "../api/axios";

const parsePickerValue = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};


export default function ClassForm({
  open,
  onClose,
  onSuccess,
  editData = null,
}) {

  // =====================================================
  // FORM STATES
  // =====================================================

  const [department, setDepartment] = useState(() => editData?.department || "");
  const [subject, setSubject] = useState(() => editData?.subject || "");
  const [subjectCode, setSubjectCode] = useState(() => editData?.subjectCode || "");
  const [className, setClassName] = useState(() => editData?.className || "");
  const [location, setLocation] = useState(() => editData?.location || "");
  const [totalStudent, setTotalStudent] = useState(() => editData?.totalStudent ?? "");

  const [date, setDate] = useState(() => parsePickerValue(editData?.date));
  const [startTime, setStartTime] = useState(() => parsePickerValue(editData?.startTime));
  const [endTime, setEndTime] = useState(() => parsePickerValue(editData?.endTime));

  const [selectedDays, setSelectedDays] = useState(() =>
    Array.isArray(editData?.days) ? editData.days : []
  );

  const [active, setActive] = useState(() => editData?.active ?? true);

  // true = Date System
  // false = Week System
  const [dayAndWeek, setDayAndWeek] = useState(
    () => editData?.dayAndWeek !== "Week System"
  );

  // =====================================================
  // UI STATES
  // =====================================================

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setDepartment("");
    setSubject("");
    setSubjectCode("");
    setClassName("");
    setLocation("");
    setTotalStudent("");

    setDate(null);
    setStartTime(null);
    setEndTime(null);

    setSelectedDays([]);

    setActive(true);
    setDayAndWeek(true);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // ---------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------

    if (!department) {
      setMessage("Please select department");
      return;
    }

    if (!subject.trim()) {
      setMessage("Please enter subject");
      return;
    }

    if (!subjectCode.trim()) {
      setMessage("Please enter subject code");
      return;
    }

    if (!className) {
      setMessage("Please select class");
      return;
    }

    if (!location.trim()) {
      setMessage("Please enter workplace");
      return;
    }

    if (!totalStudent || Number(totalStudent) < 0) {
      setMessage("Please enter valid student count");
      return;
    }

    if (dayAndWeek && (!date || !dayjs(date).isValid())) {
      setMessage("Please select class date");
      return;
    }

    if (!dayAndWeek && selectedDays.length === 0) {
      setMessage("Please select at least one day");
      return;
    }

    if (!startTime || !dayjs(startTime).isValid()) {
      setMessage("Please select start time");
      return;
    }

    if (!endTime || !dayjs(endTime).isValid()) {
      setMessage("Please select end time");
      return;
    }

    // ---------------------------------------------
    // TIME VALIDATION
    // ---------------------------------------------

    if (
      dayjs(endTime).isBefore(dayjs(startTime))
    ) {
      setMessage(
        "End time must be after start time"
      );
      return;
    }

    // ---------------------------------------------
    // REQUEST DATA
    // ---------------------------------------------

    const classData = {
      department: department.trim(),

      subject: subject.trim(),

      subjectCode: subjectCode
        .trim()
        .toUpperCase(),

      className: className.trim(),

      location: location.trim(),

      totalStudent: Number(totalStudent),

      active,

      dayAndWeek: dayAndWeek
        ? "Date System"
        : "Week System",

      date: dayAndWeek && date
        ? dayjs(date).toISOString()
        : null,

      days: dayAndWeek
        ? []
        : selectedDays,

      startTime: startTime
        ? dayjs(startTime).toISOString()
        : null,

      endTime: endTime
        ? dayjs(endTime).toISOString()
        : null,
    };

    // ---------------------------------------------
    // API CALL
    // ---------------------------------------------

    try {

      setLoading(true);

      let response;

      // =========================
      // EDIT
      // =========================

      if (editData?._id) {

        response = await api.put(
          `/teacher/classes/${editData._id}`,
          classData
        );

      }

      // =========================
      // ADD
      // =========================

      else {

        response = await api.post(
          "/teacher/addclass",
          classData
        );

      }

      setMessage(
        response.data.message ||
        "Operation successful"
      );

      // Refresh classes
      await onSuccess();

      // Small delay so message can appear
      setTimeout(() => {

        setMessage("");

        resetForm();

        onClose();

      }, 700);

    } catch (error) {

      console.error(
        "Class submit error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {

    if (loading) {
      return;
    }

    resetForm();

    onClose();

  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* =================================================
          MESSAGE
      ================================================= */}

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
        className="
          !absolute
          !bg-black/30
          !w-full
          !h-full
          !bottom-0
          !left-0
        "
      >

        <Alert
          icon={
            loading ? (
              <CircularProgress
                color="inherit"
                size={20}
              />
            ) : undefined
          }
          variant="filled"
          severity={
            message.toLowerCase().includes("success")
              ? "success"
              : "info"
          }
          className="
            absolute
            bottom-8
            left-[50%]
            -translate-x-1/2
            !min-h-0
            !px-3
          "
        >
          {message}
        </Alert>

      </Snackbar>


      {/* =================================================
          DIALOG
      ================================================= */}

      <LocalizationProvider
        dateAdapter={AdapterDayjs}
      >

        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
        >

          <div className="px-8 py-5">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex justify-between items-center">

              <div>

                <div className="text-xl font-semibold">

                  {editData
                    ? "Edit Class & Subject"
                    : "Class & Subject Info"}

                </div>

                <div className="text-sm text-gray-500">

                  {editData
                    ? "Update the class and schedule information."
                    : "Enter the main identification details for the course."}

                </div>

              </div>


              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="flex justify-end gap-5 pr-8">

                <Button
                  onClick={handleClose}
                  disabled={loading}
                  variant="outlined"
                  color="error"
                  className="
                    !min-w-0
                    !w-20
                    !h-8
                    !text-xs
                  "
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  form="class-form"
                  disabled={loading}
                  variant="contained"
                  color="success"
                  className="
                    !min-w-0
                    !w-24
                    !h-8
                    !text-xs
                  "
                >

                  {loading
                    ? "Saving..."
                    : editData
                      ? "Update"
                      : "Submit"}

                </Button>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              id="class-form"
              onSubmit={handleSubmit}
              className="!mt-10 p-5 space-y-20"
            >

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="px-15">

                <div
                  className="
                    flex
                    items-center
                    mb-2
                    !px-3
                    justify-between
                  "
                >

                  <div className="text-sm font-semibold">
                    Basic Information
                  </div>


                  <div className="!space-x-3 text-lg">

                    <Switch
                      checked={active}
                      onChange={(e) =>
                        setActive(
                          e.target.checked
                        )
                      }
                      color="success"
                    />

                    {active
                      ? "Active"
                      : "Inactive"}

                  </div>

                </div>


                {/* BASIC GRID */}

                <div
                  className="
                    !grid
                    !grid-cols-3
                    !gap-15
                    border-1
                    border-gray-300
                    rounded-lg
                    p-12
                  "
                >

                  {/* ================= DEPARTMENT ================= */}

                  <Autocomplete
                    value={department}
                    options={[...new Set([
                      ...departments,
                      editData?.department,
                    ].filter(Boolean))]}
                    isOptionEqualToValue={(option, value) => option === value}
                    autoHighlight
                    autoSelect
                    clearOnBlur={false}
                    openOnFocus
                    onChange={(e, value) =>
                      setDepartment(
                        value || ""
                      )
                    }
                    renderInput={(params) => (

                      <TextField
                        {...params}
                        label="Department"
                        placeholder="Search department..."
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline":
                            {
                              border:
                                "1px solid black",
                            },
                        }}
                      />

                    )}
                  />


                  {/* ================= SUBJECT ================= */}

                  <TextField
                    label="Subject"
                    variant="outlined"
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline":
                        {
                          border:
                            "1px solid black",
                        },
                    }}
                  />


                  {/* ================= SUBJECT CODE ================= */}

                  <TextField
                    label="Subject Code"
                    variant="outlined"
                    value={subjectCode}
                    onChange={(e) =>
                      setSubjectCode(
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline":
                        {
                          border:
                            "1px solid black",
                        },
                    }}
                  />


                  {/* ================= CLASS ================= */}

                  <Autocomplete
                    value={className}
                    options={[...new Set([
                      ...classes_name,
                      editData?.className,
                    ].filter(Boolean))]}
                    isOptionEqualToValue={(option, value) => option === value}
                    autoHighlight
                    autoSelect
                    clearOnBlur={false}
                    openOnFocus
                    onChange={(e, value) =>
                      setClassName(
                        value || ""
                      )
                    }
                    renderInput={(params) => (

                      <TextField
                        {...params}
                        label="Class Name"
                        placeholder="Search class..."
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline":
                            {
                              border:
                                "1px solid black",
                            },
                        }}
                      />

                    )}
                  />


                  {/* ================= LOCATION ================= */}

                  <TextField
                    label="Workplace"
                    variant="outlined"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline":
                        {
                          border:
                            "1px solid black",
                        },
                    }}
                  />


                  {/* ================= STUDENTS ================= */}

                  <TextField
                    label="Max Student"
                    type="number"
                    variant="outlined"
                    value={totalStudent}
                    inputProps={{
                      min: 0,
                    }}
                    onChange={(e) =>
                      setTotalStudent(
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline":
                        {
                          border:
                            "1px solid black",
                        },
                    }}
                  />

                </div>

              </div>


              {/* =================================================
                  DATE & TIME
              ================================================= */}

              <div className="!mb-8 px-15">

                <div
                  className="
                    flex
                    items-center
                    mb-2
                    !px-3
                    justify-between
                  "
                >

                  <div className="text-sm font-semibold">
                    Date & Time Information
                  </div>


                  <div>

                    <Switch
                      checked={dayAndWeek}
                      onChange={(e) =>
                        setDayAndWeek(
                          e.target.checked
                        )
                      }
                      color="success"
                    />

                    {dayAndWeek
                      ? "Day System"
                      : "Week System"}

                  </div>

                </div>


                <div
                  className="
                    !grid
                    !grid-cols-4
                    items-end
                    !gap-15
                    border-1
                    border-gray-300
                    rounded-lg
                    p-5
                    py-8
                  "
                >

                  {/* ================= DATE ================= */}

                  <DemoContainer
                    components={[
                      "DatePicker",
                    ]}
                  >

                    <DatePicker
                      label="Select Date"
                      value={date}
                      minDate={!editData ? dayjs() : undefined}
                      format="DD/MM/YY"
                      className="!w-full"
                      disabled={!dayAndWeek}
                      onChange={(value) =>
                        setDate(value)
                      }
                    />

                  </DemoContainer>


                  {/* ================= DAYS ================= */}

                  <Select
                    multiple
                    disabled={dayAndWeek}
                    value={selectedDays}
                    displayEmpty
                    onChange={(e) =>
                      setSelectedDays(
                        e.target.value
                      )
                    }
                    renderValue={(selected) =>
                      selected.length
                        ? selected.join(", ")
                        : "Select Days"
                    }
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                    }}
                  >

                    {weekDays.map(
                      (value, index) => (

                        <MenuItem
                          key={index}
                          value={value.value}
                        >
                          {value.value}
                        </MenuItem>

                      )
                    )}

                  </Select>


                  {/* ================= START TIME ================= */}

                  <DemoContainer
                    components={[
                      "TimePicker",
                    ]}
                  >

                    <TimePicker
                      label="Select Class Start Time"
                      value={startTime}
                      format="hh:mm a"
                      ampm
                      minutesStep={5}
                      onChange={(value) =>
                        setStartTime(value)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />

                  </DemoContainer>


                  {/* ================= END TIME ================= */}

                  <DemoContainer
                    components={[
                      "TimePicker",
                    ]}
                  >

                    <TimePicker
                      label="Select Class End Time"
                      value={endTime}
                      format="hh:mm a"
                      ampm
                      minutesStep={5}
                      onChange={(value) =>
                        setEndTime(value)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />

                  </DemoContainer>

                </div>

              </div>

            </form>

          </div>

        </Dialog>

      </LocalizationProvider>
    </>
  );
}
