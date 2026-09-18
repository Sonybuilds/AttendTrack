import Chip from '@mui/material/Chip';
import Login_Image from "../assets/Login_Image.jpg";
import Checked from "../assets/checked.png";

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { FaIdCardClip } from "react-icons/fa6";
import { MdLock } from "react-icons/md";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Login() {
  const feature_Chip_information = [
    "One-Tap Attendance",
    "Attendance Analytics",
    "Subject-Wise Tracking",
    "Class & Section Filter",
  ];

  useEffect(() => {
    document.title = "AttendTrack | Login";
  }, []);

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(false);

  const LoginHandle = (e) => {
    e.preventDefault();

    if (id.trim() === "" || password.trim() === "") {
      setAlert("Please Enter The Id and Password");
      setTimeout(() => {
        setAlert(false);
      }, 1500);
      return;
    }
    console.log("Teacher Id:", id);
    console.log("Password  :", password);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 h-screen">
        <div className="hidden md:block overflow-hidden relative">
          <img src={Login_Image} alt="" className="h-full object-cover brightness-75 w-full" />
          <div className="absolute bottom-0 p-4 w-full grid grid-cols-2 lg:grid-cols-4 gap-2">
            {feature_Chip_information.map((data, index) => (
              <Chip key={index} label={data} className="!bg-gray-200" />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col items-center space-y-5">
            <div className="text-4xl font-semibold space-x-1">
              <img src={Checked} alt="" className="w-10 h-10 inline-block" /> <span>AttendTrack</span>
            </div>
            <div className="w-70 md:w-90 text-center text-lg">
              Sign in to take attendance, manage students, and view attendance reports
            </div>
          </div>

          <form onSubmit={LoginHandle} className="w-3/4 lg:w-1/2 mt-15 !space-y-20">
            <div className="!space-y-8">
              <TextField
                placeholder="Teacher ID"
                variant="outlined"
                className="!w-full !text-black"
                onChange={(e) => setId(e.target.value.toUpperCase())}
                value={id}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" className="pr-2 border-r-2 border-gray-500">
                        <FaIdCardClip className="!text-black text-2xl" />
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
                placeholder="Password"
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
                Login Now
              </Button>
            </div>
          </form>

          <div className="w-1/2 mt-9 text-center space-y-3">
            <div className="border-b border-gray-400 w-full"></div>
            <div className="text-sm">
              Don't have an account? <Link to={'/register'} className="!text-blue-800 hover:underline">Register Now</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}