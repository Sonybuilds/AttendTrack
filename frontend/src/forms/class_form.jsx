
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { classes_name, departments, weekDays } from '../data/class_from';
import dayjs from 'dayjs';
import { Autocomplete, Button, Dialog, TextField, Switch, Select, MenuItem } from '@mui/material';
import { useState } from 'react';
import api from '../api/axios'
import { Alert, CircularProgress, Snackbar } from '@mui/material';

export default function ClassForm({ open, onClose, onSuccess }) {
  const [department, setDepartment] = useState('');
  const [subject, SetSubject] = useState('');
  const [subjectCode, SetSubjectCode] = useState('');
  const [className, SetClassName] = useState('');
  const [location, SetLocation] = useState('');
  const [totalStudent, setTotalStudent] = useState('');
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [active, setActive] = useState(true)
  const [dayAndWeek, SetDayAndWeek] = useState(true)
  const [message, setMessage] = useState('')
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const classData = {
      department,
      subject,
      subjectCode,
      className,
      location,
      totalStudent,
      active,
      dayAndWeek: dayAndWeek ? "Date System" : "Week System",
      date,
      days: selectedDays,
      startTime,
      endTime,
    };
    try{
       const response = await api.post('/teacher/addclass',classData);
       setMessage(response.data.message)
       await onSuccess();
       await new Promise((resolve) => setTimeout(resolve, 500));
       setMessage(false)
       onClose();
    }catch(error)
    {
      console.log(error )
    }
  };

  return (
    <>
    <Snackbar open={message} autoHideDuration={6000} className='!absolute !bg-black/30 w-full h-full !bottom-0 !left-0'>
            <Alert
              icon={<CircularProgress color="inherit" size={'20px'} />}
              variant="filled"
              className='absolute  bottom-8 left-[50%] -translate-x-1/2 !min-h-0 !px-2 '
            >
              <span>{message}</span>
            </Alert>
          </Snackbar>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/*  ADD CLASS DIALOG*/}
        <Dialog fullScreen open={open} >
          <div className="px-8 py-5">
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
                <Button onClick={() => { onClose(); }} variant="outlined" color="error" className="!min-w-0 !w-20 !h-8 !text-xs">
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
              <div className='px-15'>
                {/* Section Heading */}
                <div className="flex items-center mb-2 !px-3 justify-between">
                  <div className="text-sm font-semibold"> Basic Information </div>
                  <div className='!space-x-3 text-lg'>
                    <Switch value={active} onChange={() => { setActive(!active) }} color="success" defaultChecked />
                    {active ? "Active" : "Inactive"}
                  </div>
                </div>
                {/* Basic Information Grid */}

                <div className="!grid !grid-cols-3 !gap-15 border-1 border-gray-300 rounded-lg p-12">
                  {/* Department */}

                  <Autocomplete options={departments} autoHighlight autoSelect clearOnBlur={false} openOnFocus
                    onChange={(e, value) => { setDepartment(value) }}
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
                    onChange={(e, value) => { SetClassName(value) }}
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
              <div className='!mb-8 px-15'>
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
                      onChange={(e) => { setDate(e) }} />
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
                      onChange={(e) => setEndTime(e)}
                      slotProps={{ textField: { fullWidth: true, placeholder: '', }, }} />
                  </DemoContainer>

                </div>
              </div>
            </form>
          </div>
        </Dialog>

      </LocalizationProvider>


    </>
  )
}