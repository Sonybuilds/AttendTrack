import classes from '../data/class_information';
import Button from '@mui/material/Button';
import { BiBookAdd } from "react-icons/bi";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineUsers } from "react-icons/hi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import Dialog from '@mui/material/Dialog';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';

import { departments, classes_name } from "../data/class_from";

export default function Class() {
	 const [addAction,setAddAction] = useState(false);
		const [time,setTime] = useState('');
  return (
    <>
					  <Dialog fullScreen open={addAction} >
         <div className='p-5'>
											<div className='flex justify-between items-center'>
												 <div>
														 <div className='text-xl text-semibold'>Class & Subject Info</div>
															<div>Enter the main identification details for the course.</div> 
													</div>
													<div className='!flex justify-end gap-5 pr-8'>
												 <Button onClick={()=>(setAddAction(!addAction))} variant="outlined" color="error" className='!min-w-0 w-20 h-8 !text-xs'>
														 cancel
													</Button>
													<Button variant="contained" color="success" className='!min-w-0 w-20 h-8 !text-xs'>
														 Submit
													</Button>
											</div>
									</div>

									<form className=' !mt-10 p-5 space-y-25'>
										  <div>
													 <div className='flex items-center mb-8 space-x-2'><span className='w-20 border-1 border-gray-200 rounded-lg mb-2 !h-0 my-auto'></span><div className='text-sm  font-semibold'>Basic Information</div><span className='w-20 border-1 border-gray-200 rounded-lg mb-2 !h-0 my-auto'></span> </div>
              <div className='!grid !grid-cols-3 !gap-15 '>
		<Autocomplete
      options={departments}
      
      autoHighlight
      autoSelect
      clearOnBlur={false}
      openOnFocus
      renderInput={(params) => (
        <TextField
          {...params}
          label="Department"
          placeholder="Search department..."
										sx={{"& .MuiOutlinedInput-notchedOutline" :{
																border:'1px solid black',}	}}
										 			 
        />
      )}
    />

															<TextField
															label="Subject"
															variant="outlined"
															className="!w-full !min-h-0 !p-0 !text-black "																												
															sx={{"& .MuiOutlinedInput-notchedOutline" :{
																border:'1px solid black',}	}}
										 			 />
															<TextField
															label="Subject Code"
															variant="outlined"
															className="!w-full !min-h-0 !p-0 !text-black "																												
															sx={{"& .MuiOutlinedInput-notchedOutline" :{
																border:'1px solid black',}	}}
										 			 />
															<Autocomplete
      options={classes_name}
      
      autoHighlight
      autoSelect
      clearOnBlur={false}
      openOnFocus
      renderInput={(params) => (
        <TextField
          {...params}
          label="Class Name"
          placeholder="Search department..."
										sx={{"& .MuiOutlinedInput-notchedOutline" :{
																border:'1px solid black',}	}}
										 			 
        />
      )}
    />
				
															<TextField
															label="Workplace"
															variant="outlined"
															className="!w-full !min-h-0 !p-0 !text-black "																												
															sx={{"& .MuiOutlinedInput-notchedOutline" :{
																border:'1px solid black',}	}}
										 			 />
															<TextField
															label="Max Student"
															type='number'
															variant="outlined"
															className="!w-full !min-h-0 !p-0 !text-black "																												
															sx={{"& .MuiOutlinedInput-notchedOutline" :{
																border:'1px solid black',}	}}
										 			 />
														</div>
												</div>

										 <div>
													 <div className='flex items-center mb-8 space-x-2'><span className='w-20 border-1 border-gray-200 rounded-lg mb-2 !h-0 my-auto'></span><div className='text-sm  font-semibold'>Time Information</div><span className='w-20 border-1 border-gray-200 rounded-lg mb-2 !h-0 my-auto'></span> </div>
              <div className='!grid !grid-cols-3 !gap-15 '>
															<LocalizationProvider dateAdapter={AdapterDayjs} >
      <DemoContainer components={['DatePicker']}>
        <DatePicker label="Choose Date" className="!w-full"minDate={dayjs()} slotProps={{
    textField: {
      sx: {
        "& .MuiOutlinedInput-notchedOutline": {
          border: '1px solid black',
        },
      },
    },
  }}/>
      </DemoContainer>
    </LocalizationProvider>
						<TextField
							label="Start Time"
							placeholder="e.g. 09:00 AM"
							variant="outlined"
							className="!w-full !min-h-0 !p-0 !text-black"																												
							sx={{"& .MuiOutlinedInput-notchedOutline" :{ border:'1px solid black' }}}
						/><LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimeClock 
        onChange={(newValue) => {
          console.log(newValue ? newValue.format('hh:mm A') : 'No time selected');
        }} 
      />
    </LocalizationProvider>						</div>
												</div>
											
												
									</form>
								</div>
							</Dialog> 

					

      <div className="px-4 py-8">
        <div className="flex justify-between pr-8 items-center">
          <div>
            <div className="text-xl font-semibold">Class Management</div>
            <span>Create, assign, and organize class sections and teachers.</span>
          </div>
          <div>
            <Button onClick={()=>{setAddAction(!addAction)}} color='success' className='!bg-green-100/80 !rounded-lg !min-w-0 w-15'>
              <BiBookAdd className='text-2xl'/>
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 mt-2 border-t border-gray-200'>
          {classes.map((data, index) => (
            <Card key={index} className='!rounded-xl !shadow-sm/20 hover:!shadow-md/80 transition-shadow duration-200 !border !border-gray-100 flex flex-col justify-between'>
              <CardContent className='!p-5'>
                
                {/* Header: Subject Code & Status Badge */}
                <div className='flex justify-between items-start mb-3 '>
                  <span className='text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md'>
                    {data.subjectCode}
                  </span>
                  <div className='space-x-3'>
																			<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    data.status === 'Scheduled' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {data.status}
                  </span>
																		<span>
																			 <Button className='!text-2xl !min-w-0 !min-h-0 !p-0 !m-0'>
																					 <HiOutlineDotsVertical/>
																				</Button>
																		</span>
																		</div>
                </div>

                {/* Main Titles */}
                <Typography variant="h6" className='!font-bold !text-gray-900 !text-base !line-clamp-1'>
                  {data.subjectName}
                </Typography>
                
                <Typography variant="body2" className='!text-gray-600 !font-medium !mt-0.5'>
                  {data.className}
                </Typography>

                <div className='text-xs text-gray-400 mt-1 mb-4'>
                  {data.department}
                </div>

                {/* Divider Line */}
                <div className='border-t border-gray-100 my-3'></div>

                {/* Details Section (Time, Location, Students) */}
                <div className='space-y-2 text-sm text-gray-600'>
                  
                  {/* Date & Time */}
                  <div className='flex items-center gap-2'>
                    <HiOutlineClock className='text-gray-400 text-lg flex-shrink-0' />
                    <span className='text-xs'>{data.date} • {data.startTime} - {data.endTime}</span>
                  </div>

                  {/* Location */}
                  <div className='flex items-center gap-2'>
                    <HiOutlineLocationMarker className='text-gray-400 text-lg flex-shrink-0' />
                    <span className='text-xs'>{data.location}</span>
                  </div>

                  {/* Total Students */}
                  <div className='flex items-center gap-2'>
                    <HiOutlineUsers className='text-gray-400 text-lg flex-shrink-0' />
                    <span className='text-xs'>{data.totalStudents} Students Enrolled</span>
                  </div>

                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}