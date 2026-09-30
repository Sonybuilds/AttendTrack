import { Autocomplete, Button, TextField } from '@mui/material';
import { useState , useEffect } from 'react';
import { BiBookAdd } from 'react-icons/bi';
import { classes_name, departments } from '../data/class_from';
import classes from '../data/class_information';
import ClassCard from '../components/class_card';
import ClassForm from '../forms/class_form';


export default function Class() {
  const [addAction, setAddAction] = useState(false)
  const handleAddClass = () => { setAddAction(true); };


  return (
    <>
      <ClassForm open={addAction} onClose={() => {setAddAction(false) }} />

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
          {classes.map((classData, index) => (
            <ClassCard key={index} classData={classData} />
          ))}
        </div>

      </div>

    </>

  );
}