

import classes from '../data/class_information.js';
import Button from '@mui/material/Button';
import { BiBookAdd } from "react-icons/bi";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';


export default function Class(){
	 return(
			<>
			 <div className="px-4 py-6">
					 <div className="flex justify-between pr-8 items-center">
							 <div>
							  <div className="text-xl font-semibold">Class Management</div>
							  <span>Create, assign, and organize class sections and teachers.</span>
						 </div>
							<div>
          <Button color='success' className='!bg-green-100/80 !rounded-lg !min-w-0 w-15'>
											<BiBookAdd className='text-2xl'/>
										</Button>
							</div>
						</div>

						<div className='grid grid-cols-3 gap-8 pt-8 mt-2 border-t border-gray-200'>
							 {classes.map((data,index)=>(
									<Card >
										<CardContent>
											 <Typography gutterBottom className='!space-x-2 !text-center'>
													 <span>{data.subjectName}</span><span>({data.subjectCode})</span>
												</Typography>
												<Typography>
													{data.className}
												</Typography>
										</CardContent>
									</Card>
								))}
					 </div>
				</div>
			
			</>
		)
}