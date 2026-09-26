import { Autocomplete, Button, Dialog, TextField, Switch, Select, MenuItem } from '@mui/material';

import dayjs from 'dayjs';
import { useState } from 'react';
import { BiBookAdd } from 'react-icons/bi';
import { classes_name, departments, weekDays } from '../data/class_from';
import classes from '../data/class_information';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ClassCard from '../components/class_card';

export default function Class() {

  const [active, setActive] = useState(true)
  const [dayAndWeek, SetDayAndWeek] = useState(true)
  const [addAction, setAddAction] = useState(false);
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [errors, setErrors] = useState({});

  const [department, setDepartment] = useState('');
  const [subject, SetSubject] = useState('');
  const [subjectCode, SetSubjectCode] = useState('');
  const [className, SetClassName] = useState('');
  const [location, SetLocation] = useState('');
  const [totalStudent, setTotalStudent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const classData = {
      department,
      subject,
      subjectCode,
      className,
      location,
      totalStudent,
      active,
      dayAndWeek: dayAndWeek ? "Day System" : "Week System",
      date,
      days: selectedDays,
      startTime,
      endTime,
    };
    console.log('Class Data:', classData);
    console.log("print ")
  };

  const resetForm = () => {
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedDays([]);
    setErrors({});
  };
  const handleCancel = () => { resetForm(); setAddAction(false); };
  const handleAddClass = () => { resetForm(); setAddAction(true); };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/*  ADD CLASS DIALOG*/}
        <Dialog fullScreen open={addAction} >
          <div className="p-5">
            {/* HEADER*/}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold">
                  Class & Subject Info
                </div>
                <div className="text-sm text-gray-500">
                  Enter the main identification details for the course.
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-5 pr-8">
                <div className='w-20 my-auto mx-auto'>
                </div>
                <Button onClick={handleCancel} variant="outlined" color="error" className="!min-w-0 !w-20 !h-8 !text-xs">
                  Cancel
                </Button>
                <Button type="submit" form="class-form" variant="contained" color="success" className="!min-w-0 !w-20 !h-8 !text-xs">
                  Submit
                </Button>
              </div>
            </div>

            {/* FORM */}
            <form id="class-form" onSubmit={handleSubmit} className="!mt-10 p-5 space-y-20">

              {/* BASIC INFORMATION */}
              <div>
                {/* Section Heading */}
                <div className="flex items-center mb-2 !px-3 justify-between">
                  <div className="text-sm font-semibold"> Basic Information </div>
                  <div className='!space-x-3 text-lg'>
                    <Switch value={active} onChange={() => { setActive(!active) }} color="success" defaultChecked />
                    {active ? "Active" : "Inactive"}
                  </div>
                </div>
                {/* Basic Information Grid */}

                <div className="!grid !grid-cols-3 !gap-15 border-1 border-gray-300 rounded-lg p-15">
                  {/* Department */}

                  <Autocomplete options={departments}  autoHighlight autoSelect clearOnBlur={false} openOnFocus
                    onChange={(e,value) => {setDepartment(value) }}
                    renderInput={(params) => (<TextField {...params} value={department} label="Department" placeholder="Search department..."
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { border: '1px solid black', }, }} />
                    )} />

                  {/* Subject */}
                  <TextField label="Subject" variant="outlined" className="!w-full !min-h-0 !p-0 !text-black"
                    onChange={(e) => { SetSubject(e.target.value) }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: '1px solid black', }, }} />

                  {/* Subject Code */}
                  <TextField label="Subject Code" variant="outlined" className=" !w-full !min-h-0 !p-0 !text-black "
                    onChange={(e) => { SetSubjectCode(e.target.value) }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: '1px solid black', }, }} />

                  {/* Class Name */}
                  <Autocomplete options={classes_name} autoHighlight autoSelect clearOnBlur={false} openOnFocus
                    onChange={(e,value) => { SetClassName(value) }}
                    renderInput={(params) => (<TextField {...params} label="Class Name" placeholder="Search class..."
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { border: '1px solid black', }, }} />
                    )} />

                  {/* Workplace */}
                  <TextField label="Workplace" variant="outlined" className=" !w-full !min-h-0 !p-0 !text-black"
                    onChange={(e) => { SetLocation(e.target.value) }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: '1px solid black', }, }} />

                  {/* Max Student */}
                  <TextField label="Max Student" type="number" variant="outlined" className=" !w-full !min-h-0 !p-0 !text-black"
                    onChange={(e) => { setTotalStudent(e.target.value) }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: '1px solid black', }, }}
                  />
                </div>
              </div>

              {/* TIME INFORMATION */}
              <div className='!mb-8'>
                {/* Section Heading */}
                <div className="flex items-center mb-2 !px-3 justify-between">
                  <div className="text-sm font-semibold"> Date & Time Information </div>
                  <div>
                    <Switch value={dayAndWeek} onChange={() => { SetDayAndWeek(!dayAndWeek) }} color="success" defaultChecked />
                    {dayAndWeek ? "Day System" : "Week System"}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 items-end !gap-15 border-1 border-gray-300 rounded-lg p-5 py-8">
                  {/* DATE */}
                  <DemoContainer components={['DatePicker']} >
                    <DatePicker label="Select Date" value={date} minDate={dayjs()} format='DD/MM/YY' className='!w-full' disabled={!dayAndWeek}
                      onChange={(e) => { setDate(e) }}
                      slotProps={{ textField: { error: Boolean(errors.date), helperText: errors.date, }, }} />
                  </DemoContainer>

                  <Select label="select Days" multiple disabled={dayAndWeek} value={selectedDays} className=''
                    onChange={(e) => setSelectedDays(e.target.value)}
                    MenuProps={{ anchorOrigin: { vertical: 'top', horizontal: 'left' }, transformOrigin: { vertical: 'bottom', horizontal: 'left' } }}
                    sx={{ '& .MuiInputLabel-root': { color: 'black' }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }}>
                    {weekDays.map((value, index) => (<MenuItem key={index} value={value.value}> {value.value} </MenuItem>))}
                  </Select>

                  {/* START & END TIME */}
                  <DemoContainer components={['TimePicker']}>
                    <TimePicker label="Select Class Start Time" format="hh:mm a" ampm minutesStep={5}
                      onChange={(e) => setStartTime(e)}
                      slotProps={{ textField: { fullWidth: true, placeholder: '', }, }} />
                  </DemoContainer>

                  <DemoContainer components={['TimePicker']}>
                    <TimePicker label="Select Class End Time" format="hh:mm a" ampm minutesStep={5}
                      onChange={(e) => setStartTime(e)}
                      slotProps={{textField: { fullWidth: true, placeholder: '', }, }} />
                  </DemoContainer>

                </div>
              </div>
            </form>
          </div>
        </Dialog>

      </LocalizationProvider>

      {/*  CLASS MANAGEMENT PAGE */}
      <div className="px-6 py-5 bg-[#fbfbcc07]">
        <div className="flex justify-between pr-8 items-center">
          <div className="text-lg font-bold">
            Class Management
          </div>
          <Button onClick={handleAddClass} color="success" className=" !bg-green-100/80 hover:!bg-green-200 !rounded-lg !min-w-0 !min-h-0 !w-9 !h-9 !p-0 !m-0">
            <BiBookAdd className="text-xl" />
          </Button>
        </div>

        {/* Search Filter */}
        <div className='mt-12 !pl-5 !pr-8 '>
          <div className='flex gap-3 items-center w-full'>

            <TextField id="standard-basic" placeholder="Serach by Subject Code & Name" variant="standard" className='w-full' sx={{
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                color: '#111827',
                paddingLeft: '5px !important',
                '&::placeholder': {
                  color: '#6b7280',
                  opacity: 1,
                },
              },
            }} />

            <Autocomplete options={classes_name} autoHighlight autoSelect clearOnBlur={false} openOnFocus
              renderInput={(params) => (
                <TextField {...params} placeholder="Search class..." variant='standard' className='!w-70'
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      color: '#111827',
                      paddingLeft: '5px !important',
                      '&::placeholder': {
                        color: '#6b7280',
                        opacity: 1,
                      },
                    },
                  }} />
              )}
            />

            <Autocomplete options={departments} autoHighlight autoSelect clearOnBlur={false} openOnFocus
              renderInput={(params) => (
                <TextField {...params} placeholder="Search class..." variant='standard' className='!w-70'
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      color: '#111827',
                      paddingLeft: '5px !important',
                      '&::placeholder': {
                        color: '#6b7280',
                        opacity: 1,
                      },
                    },
                  }}
                />
              )}
            />
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 gap-15 px-5 md:grid-cols-2 mt-20 mb-10 xl:grid-cols-3">
          {classes.map((classData ,index) => (
            <ClassCard
              key={index}
              classData={classData}
            />
          ))}
        </div>

      </div>

    </>

  );
}