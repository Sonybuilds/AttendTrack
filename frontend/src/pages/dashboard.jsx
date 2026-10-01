import { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tab, Tabs, TextField } from '@mui/material';
import Class from "../dashborad_section/class";
import Overview from "../dashborad_section/overview";
import Report from "../dashborad_section/report";
import Student from "../dashborad_section/student";
import Attendance from "../dashborad_section/attendance";

import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaUsers } from "react-icons/fa";
import { MdAssignment, MdClass } from "react-icons/md";
import { FiCheckSquare } from "react-icons/fi";
import { RiConnectorFill, RiSendPlaneFill } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";

import { useLocation, useNavigate } from "react-router-dom";
import Checked from "../assets/checked.png";
import api from "../api/axios";


export default function Dashboard() {
	const navigate = useNavigate();
	const location = useLocation().pathname.split('/').at(-1);
	const [open, setOpen] = useState(false);
	const [address, setAddress] = useState('')
 const [teacherName, setTeacherName] = useState('Teacher')

	useEffect(() => {
		document.title = "AttendTrack | Dashboard"
	})

	useEffect(() => {
		let active = true;
		api.get("/teacher/session").then((response) => {
			if (active) setTeacherName(response.data.teacher?.name || "Teacher");
		}).catch(() => {});
		return () => { active = false; };
	}, [])

	const section = [
		{
			icon: <TbLayoutDashboardFilled />,
			name: 'OverView',
			element: <Overview />
		},
		{
			icon: <MdClass />,
			name: 'Class',
			element: <Class />
		},
		{
			icon: <FaUsers />,
			name: 'Student',
			element: <Student />
		},
		{
			icon: <FiCheckSquare />,
			name: 'Attendance',
			element: <Attendance />
		},
		{
			icon: <MdAssignment />,
			name: 'Report',
			element: <Report />
		},
	]

	const [activeTab, setActiveTab] = useState(() => {
		const index = section.findIndex(
			(item) => item.name.toLowerCase() === location.toLowerCase()
		);
		return index !== -1 ? index : 0; // Defaults to index 0 if location doesn't match
	})
	const handleTab = (event, value) => {
		setActiveTab(value)
		navigate(`/attendtrack/dashboard/${section[value].name.toLocaleLowerCase()}`)
	}

	const handleClose = () => {
		setOpen(false
		)
	}

	const handleLogout = async () => {
		try {
			await api.post("/logout");
		} catch {
			// Continue to the login screen even if the server cannot be reached.
		} finally {
			navigate("/login", { replace: true });
		}
	}

	return (
		<>
			<div className="h-screen overflow-hidden flex flex-col ">
			
				<div className="px-8 py-2.5 flex justify-between shadow-xs/20">
					<div className="text-2xl space-x-2">
						<img src={Checked} alt="" className="w-8 h-8 inline-block" /><span>AttendTrack</span>
					</div>
					<div className="!space-x-3">
						<Button onClick={() => { setOpen(true) }} variant="contained" color="success" className="!min-w-0 !p-0 !w-8 !h-8 !rounded-full"><RiConnectorFill className="text-lg" /></Button>
						<Button onClick={() => { navigate('/attendtrack/dashboard/profile') }} variant="contained" className="!min-w-0 !p-0 !w-8 !h-8 !rounded-full">{teacherName.split(' ').map((word) => word[0]).join('')}</Button>
						<Button onClick={handleLogout} variant="outlined" color="inherit" startIcon={<FiLogOut />} className="!ml-2 !normal-case">Logout</Button>
					</div>
				</div>

				<div className="flex overflow-hidden ">
					<div className="h-dvh border-r border-gray-300">
						<Tabs value={activeTab} onChange={handleTab} orientation="vertical" className="mt-2 !p-0 !w-min-0 !w-12 " sx={{
							minWidth: 0,
							padding: 0,
							'& .MuiTabs-indicator': {
								display: 'none',
								width: '8px',
								backgroundColor: '', // Indigo-600// Left side ki default line hataane ke liye
							},
						}}>
							{section.map((data, index) => (
								<Tab key={index} label={data.icon} className="!text-2xl !mx-auto !my-3 !p-1.5 !w-8 !h-8 !min-h-0 !min-w-0" sx={{
									minWidth: 'unset',
									borderRadius: '30%',
									color: '#64748b', // Slate-500
									transition: 'all 0.25s ease-in-out',
									'&.Mui-selected': {
										backgroundColor: '#e0dfdffe', // Slablte-900 (Dark modern theme)
										color: '#010f18',
										transform: 'scale(1.05)', // Halka sa pop/zoom effect jab select ho
									},
								}} />
							))}
						</Tabs>
					</div>
					<div className="flex-1 overflow-x-scroll scrollbar-thin">
						{section[activeTab].element}
					</div>
				</div>

			</div>

			<Dialog	open={open} onClose={handleClose} aria-labelledby="draggable-dialog-title">
				<DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
					Connect Attendance Scanner
				</DialogTitle>
				<DialogContent>
					<DialogContentText className="!p-5 !mt-5">
						Please enter your device's MAC address below to establish a live connection.
						<div className="!flex items-center gap-2 mt-5">
							<TextField
								variant="outlined"
								className="!w-full !text-black"
								onChange={(e) => { setAddress(e.target.value) }}
								value={address}
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
										},
									},
								}}
							/>
							<Button color="success" variant="contained" className="!rounded-full !min-w-0 !min-h-0 !w-13 !h-13 !text-5xl"><RiSendPlaneFill className="!text-5xl" /></Button>
						</div>
						<div className="mt-10 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
							<p className="font-semibold text-slate-700 mb-1">💡 Quick Help:</p>
							<ul className="list-disc pl-4 space-y-1">
								<li>Check the hardware device label sticker for the MAC address.</li>
								<li>Don't have the address? <span className="text-blue-600 underline cursor-pointer">Download our setup utility app</span> to auto-detect connected devices.</li>
							</ul>
						</div>
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button autoFocus variant="outlined" color="error" onClick={handleClose}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

		</>
	)
}
