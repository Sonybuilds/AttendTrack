
import { classes_name, departments } from "../data/class_from";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import dayjs from 'dayjs';
import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';

export default function ClassForm(){
	return(
		<>
		 <Dialog fullScreen open={addAction} >
        <div className='p-5'>
          <div className='flex justify-between items-center'>
            <div>
              <div className='text-xl text-semibold'>Class & Subject Info</div>
              <div>Enter the main identification details for the course.</div>
            </div>
            <div className='!flex justify-end gap-5 pr-8'>
              <Button onClick={() => (setAddAction(!addAction))} variant="outlined" color="error" className='!min-w-0 w-20 h-8 !text-xs'>
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
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: '1px solid black',
                        }
                      }}

                    />
                  )}
                />

                <TextField
                  label="Subject"
                  variant="outlined"
                  className="!w-full !min-h-0 !p-0 !text-black "
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: '1px solid black',
                    }
                  }}
                />
                <TextField
                  label="Subject Code"
                  variant="outlined"
                  className="!w-full !min-h-0 !p-0 !text-black "
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: '1px solid black',
                    }
                  }}
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
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: '1px solid black',
                        }
                      }}

                    />
                  )}
                />

                <TextField
                  label="Workplace"
                  variant="outlined"
                  className="!w-full !min-h-0 !p-0 !text-black "
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: '1px solid black',
                    }
                  }}
                />
                <TextField
                  label="Max Student"
                  type='number'
                  variant="outlined"
                  className="!w-full !min-h-0 !p-0 !text-black "
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: '1px solid black',
                    }
                  }}
                />
              </div>
            </div>
        
            <div>
              <div className='flex items-center mb-8 space-x-2'><span className='w-20 border-1 border-gray-200 rounded-lg mb-2 !h-0 my-auto'></span><div className='text-sm  font-semibold'>Time Information</div><span className='w-20 border-1 border-gray-200 rounded-lg mb-2 !h-0 my-auto'></span> </div>
              <div className='!grid !grid-cols-3 !gap-15 '>
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker label="Choose Date" className="!w-full" minDate={dayjs()} slotProps={{
                      textField: {
                        sx: {
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: '1px solid black',
                          },
                        },
                      },
                    }} />
                  </DemoContainer>
                </LocalizationProvider>
                <TextField
                  label="Start Time"
                  placeholder="e.g. 09:00 AM"
                  variant="outlined"
                  className="!w-full !min-h-0 !p-0 !text-black"
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: '1px solid black' } }}
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
		
		</>
	)
}