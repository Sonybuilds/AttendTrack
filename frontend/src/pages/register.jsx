import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Register_Image from "../assets/register_image.jpg";
import Checked from "../assets/checked.png";

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { MdLock } from "react-icons/md";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { LuFingerprint } from "react-icons/lu";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { MdAssignment } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";


export default function Register() {
		const information = [
		 	 {
						icon : <LuFingerprint/>,
						title :'Biometric Enrollment' ,
						description : 'Register new students and pair their fingerprint data with their profiles in seconds.' 
					},
					{
						icon : <MdAssignment/>	,
						title :'Instant Report Generation' ,
						description : 'Create daily and monthly attendance summaries automatically without manual record-keeping.'
					},
					{
						icon : <RiCalendarScheduleFill/>,
						title :'Class & Schedule Management' ,
						description : 'Assign specific timetable slots and subjects to automatically categorize incoming attendance records.' 
					},
					{
						icon : <TbLayoutDashboardFilled/>,
						title :'Web Management Dashboard' ,
						description : 'View live logs, register new students, and export attendance files through an intuitive web interface.'
					}	
		
		
		];

		useEffect(() => {
				document.title = "AttendTrack | Register";
		}, []);

  const [name,setName] = useState('');
		const [email,setEmail] = useState('');
		const [password, setPassword] = useState('');
		const [alert, setAlert] = useState(false);

		const LoginHandle = (e) => {
				e.preventDefault();

				if (name.trim() === "" ||email.trim() === '' || password.trim() === "") {
						setAlert("Please fill in all complete information before submitting.");
						setTimeout(() => {
								setAlert(false);
						}, 1500);
						return;
				}
				console.log("Teacher Name :", name);
				console.log("Teacher Email:",email)
				console.log("Password     :", password);
		};

		return (
				<>
						<div className="grid md:grid-cols-2 h-screen">
								<div className="hidden md:block overflow-hidden relative">
										<img src={Register_Image} alt="" className="h-full object-cover brightness-75 w-full" />
										<div className="absolute bottom-0 p-4 !w-full  backdrop-blur-xs">
           <List className='!w-full !space-y-3'>
												{ information.map((data,index)=>(
      							<ListItem key={index} className='bg-white/50 !rounded-xl'> 
        					<ListItemAvatar className='!text-3xl'>
														 {data.icon}
       					 </ListItemAvatar>
    					    <ListItemText primary={data.title} secondary={data.description} />
									    </ListItem>
												))}
												</List>
										</div>
								</div>

								<div className="flex flex-col justify-center items-center">
										<div className="flex flex-col items-center space-y-5">
												<div className="text-4xl font-semibold space-x-1">
														<img src={Checked} alt="" className="w-10 h-10 inline-block" /> <span>AttendTrack</span>
												</div>
												<div className="w-70 md:w-100 text-center text-sm">
														Create an account to register students, connect scanning devices, and generate attendance reports.
												</div>
										</div>

										<form onSubmit={LoginHandle} className="w-3/4 lg:w-1/2 mt-10 !space-y-13">
												<div className="!space-y-6">
														<TextField
																placeholder="Enter your Name"
																variant="outlined"
																className="!w-full !text-black"
																onChange={(e) => setName(e.target.value)}
																value={name}
																slotProps={{
																		input: {
																				startAdornment: (
																						<InputAdornment position="start" className="pr-2 border-r-2 border-gray-500">
																								<FaUser className="!text-black text-xl" />
																						</InputAdornment>
																				),
																		},
																}}
																sx={{
																		"& .MuiOutlinedInput-root": {
																				borderRadius: "0.5rem",
																				"& fieldset": {
																						borderWidth: "1.5px",
																						borderColor: "black",
																				},
																				"& .MuiInputBase-input": {
																						fontSize: "1rem",
																						color: "black",
																						"&::placeholder": {
																								color: "black",
																								opacity: 0.9,
																						},
																				},
																		},
																}}
														/>
														<TextField
																placeholder="Enter your Email"
																variant="outlined"
																className="!w-full !text-black"
																onChange={(e) => setEmail(e.target.value)}
																value={email}
																type='email'
																slotProps={{
																		input: {
																				startAdornment: (
																						<InputAdornment position="start" className="pr-2 border-r-2 border-gray-500">
																								<MdEmail className="!text-black text-2xl" />
																						</InputAdornment>
																				),
																		},
																}}
																sx={{
																		"& .MuiOutlinedInput-root": {
																				borderRadius: "0.5rem",
																				"& fieldset": {
																						borderWidth: "1.5px",
																						borderColor: "black",
																				},
																				"& .MuiInputBase-input": {
																						fontSize: "1rem",
																						color: "black",
																						"&::placeholder": {
																								color: "black",
																								opacity: 0.9,
																						},
																				},
																		},
																}}
														/>

														<TextField
																placeholder="Create your Password"
																type="password"
																variant="outlined"
																className="!w-full !text-black"
																onChange={(e) => setPassword(e.target.value)}
																value={password}
																slotProps={{
																		input: {
																				className: "text-lg",
																				startAdornment: (
																						<InputAdornment position="start" className="pr-2 border-r-2 border-gray-500">
																								<MdLock className="!text-black text-2xl" />
																						</InputAdornment>
																				),
																		},
																}}
																sx={{
																		"& .MuiOutlinedInput-root": {
																				borderRadius: "0.5rem",
																				"& fieldset": {
																						borderWidth: "1.5px",
																						borderColor: "black",
																				},
																				"& .MuiInputBase-input": {
																						fontSize: "1rem",
																						color: "black",
																						"&::placeholder": {
																								color: "black",
																								opacity: 0.9,
																						},
																				},
																		},
																}}
														/>
												</div>

												<div className="!space-y-5">
														{alert && <Alert severity="error">{alert}</Alert>}
														<Button variant="contained" color="success" type="submit" className="!w-full !rounded-lg !text-sm !h-12">
																Register Now
														</Button>
												</div>
										</form>

										<div className="w-1/2 mt-9 text-center space-y-3">
												<div className="border-b border-gray-400 w-full"></div>
												<div className="text-sm">
														Have an account?<Link to={'/login'} className="!text-blue-800 hover:underline"> Sign In</Link>
												</div>
										</div>
								</div>
						</div>
				</>
		);
}