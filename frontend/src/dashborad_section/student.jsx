import { Button } from '@mui/material';
import { IoIosAdd } from "react-icons/io";
import StudentTable from '../components/studentTable';
import { useState } from 'react';
import StudentFrom from '../forms/studentForm';


export default function Student() {
  const [statusForm,setStatusForm] = useState(false);
 

	return (
		<>
   <StudentFrom open={statusForm} onClose={()=>{setStatusForm(false)}} />  

			{/* Header */}
			<div className="flex justify-between py-8 px-8">
				<div className="text-xl font-semibold">Student Management	</div>
				<Button onClick={()=>{setStatusForm(true)}} color="success" variant="contained" className="!rounded-full !min-w-0 !w-9 !h-9 !p-1"	>
					<IoIosAdd className="!w-12 !mx-auto !text-3xl" /></Button>
			</div>

			{/* Student Table */}
    <StudentTable />

			
  
		</>
	);
}