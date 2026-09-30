import { Autocomplete, Button, Dialog, MenuItem, Select, TextField, Typography,} from '@mui/material';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { HiOutlineAcademicCap, HiOutlineUser } from 'react-icons/hi';

const departments = [
  'Computer Science',
  'Information Technology',
  'Commerce',
  'Arts',
  'Science',
];

const classNames = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const academicYears = [
  '2025 - 2026',
  '2026 - 2027',
  '2027 - 2028',
];

export default function StudentForm({ open, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    rollNo: '',
    department: null,
    className: null,
    phone: '',
    email: '',
    gender: '',
    dob: null,
    academicYear: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required';
    }

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = 'Roll number is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.className) {
      newErrors.className = 'Class name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10 digit phone number';
    }

    if ( formData.email ) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const studentData = {
      name: formData.name,
      fatherName: formData.fatherName,
      rollNo: formData.rollNo,
      department: formData.department,
      className: formData.className,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      dob: formData.dob?.format('YYYY-MM-DD'),
      academicYear: formData.academicYear,
    };

    console.log('Student Data:', studentData);

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      fatherName: '',
      rollNo: '',
      department: null,
      className: null,
      phone: '',
      email: '',
      gender: '',
      dob: null,
      academicYear: null,
    });

    setErrors({});
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleCancel}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: '#f8fafc',
          },
        }}
      >
        {/* Header */}
        <div className="top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-5">
          <div>
            <Typography
              variant="h5"
              className="!font-semibold !text-gray-900"
            >
              Add New Student
            </Typography>

            <Typography
              variant="body2"
              className="!mt-1 !text-gray-500"
            >
              Create a new student profile and academic record.
            </Typography>
          </div>
        </div>

        {/* Form */}
        <form
          id="student-form"
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-7xl space-y-6 px-8 py-7"
        >
          {/* Basic Information */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HiOutlineUser className="text-2xl" />
              </div>

              <div>
                <Typography className="!font-semibold !text-gray-900">
                  Basic Information
                </Typography>

                <Typography
                  variant="body2"
                  className="!text-gray-500"
                >
                  Enter the student's personal information.
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-10 py-8 md:grid-cols-2">
              {/* Name */}
              <TextField
                fullWidth
                label="Student Name"
                placeholder="Enter student name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />

              {/* Father Name */}
              <TextField
                fullWidth
                label="Father Name"
                placeholder="Enter father name"
                value={formData.fatherName}
                onChange={(e) =>
                  handleChange('fatherName', e.target.value)
                }
                error={Boolean(errors.fatherName)}
                helperText={errors.fatherName}
              />

              {/* Phone */}
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="Enter 10 digit phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleChange(
                    'phone',
                    e.target.value.replace(/\D/g, '').slice(0, 10)
                  )
                }
                error={Boolean(errors.phone)}
                helperText={errors.phone}
              />

              {/* Email */}
              <TextField
                fullWidth
                label="Email"
                placeholder="Enter email address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />

              {/* Gender */}
              <div>
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.gender}
                  onChange={(e) =>
                    handleChange('gender', e.target.value)
                  }
                  error={Boolean(errors.gender)}
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>

                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>

                {errors.gender && (
                  <Typography
                    variant="caption"
                    className="!ml-3 !text-red-600"
                  >
                    {errors.gender}
                  </Typography>
                )}
              </div>

              {/* DOB */}
              <DatePicker
                label="Date of Birth"
                value={formData.dob}
                maxDate={dayjs()}
                onChange={(value) => handleChange('dob', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.dob),
                    helperText: errors.dob,
                  },
                }}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <HiOutlineAcademicCap className="text-2xl" />
              </div>

              <div>
                <Typography className="!font-semibold !text-gray-900">
                  Academic Information
                </Typography>

                <Typography
                  variant="body2"
                  className="!text-gray-500"
                >
                  Assign the student to an academic department and class.
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* Roll Number */}
              <TextField
                fullWidth
                label="Roll Number"
                placeholder="Enter roll number"
                value={formData.rollNo}
                onChange={(e) =>
                  handleChange('rollNo', e.target.value)
                }
                error={Boolean(errors.rollNo)}
                helperText={errors.rollNo}
              />

              {/* Academic Year */}
              <Autocomplete
                options={academicYears}
                value={formData.academicYear}
                onChange={(_, value) =>
                  handleChange('academicYear', value)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Academic Year"
                    placeholder="Select academic year"
                    error={Boolean(errors.academicYear)}
                    helperText={errors.academicYear}
                  />
                )}
              />

              {/* Department */}
              <Autocomplete
                options={departments}
                value={formData.department}
                onChange={(_, value) =>
                  handleChange('department', value)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    placeholder="Select department"
                    error={Boolean(errors.department)}
                    helperText={errors.department}
                  />
                )}
              />

              {/* Class Name */}
              <Autocomplete
                options={classNames}
                value={formData.className}
                onChange={(_, value) =>
                  handleChange('className', value)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Class Name"
                    placeholder="Select class"
                    error={Boolean(errors.className)}
                    helperText={errors.className}
                  />
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-[#f8fafc] py-5">
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              className="!rounded-lg !px-6"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="success"
              className="!rounded-lg !px-7"
            >
              Add Student
            </Button>
          </div>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}
