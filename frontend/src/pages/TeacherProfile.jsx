
import {
  Avatar,
  Button,
} from "@mui/material";

import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiEdit3,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
  FiUsers,
  FiBarChart2,
  FiBook,
  FiZap,
  FiClock,
} from "react-icons/fi";

import {
  HiOutlineAcademicCap,
  HiOutlineChartBar,
} from "react-icons/hi2";


const teacher = {
  name: "Ms. Priya Sharma",
  role: "Mathematics Teacher",
  email: "priya.sharma@school.com",
  phone: "+91 98765 43210",
  location: "New Delhi, India",
  dob: "15 Apr 1990",
  gender: "Female",
  address: "123 Green Park, New Delhi - 110016",
  experience: "5+ Years Experience",
  status: "Active",
  classes: "9th, 10th, 11th, 12th",
  students: "180",
  workingSince: "July 2020",
};




const subjects = [
  {
    name: "Mathematics",
    className: "bg-blue-50 text-blue-700",
  },
  {
    name: "Physics",
    className: "bg-green-50 text-green-700",
  },
  {
    name: "Statistics",
    className: "bg-purple-50 text-purple-700",
  },
  {
    name: "Algebra",
    className: "bg-red-50 text-red-600",
  },
];


function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[22px] text-[#244a7c]">
        <Icon />
      </div>

      <div>
        <p className="text-[14px] text-[#7890b0]">
          {label}
        </p>

        <p className="mt-1 text-[14px] font-medium text-[#10254a]">
          {value}
        </p>
      </div>
    </div>
  );
}






function ProfileHero() {
  return (
    <div className="rounded-xl border border-[#e8edf4] bg-white p-7 shadow-[0_3px_15px_rgba(31,73,125,0.04)]">

      <div className="flex flex-col gap-6 md:flex-row md:items-center">

        {/* Avatar */}
        <div className="relative shrink-0">

          <Avatar
            src="/images/teacher.jpg"
            alt={teacher.name}
            sx={{
              width: 150,
              height: 150,
              border: "5px solid #f2f5f8",
            }}
          />

        </div>


        {/* Information */}
        <div className="flex-1">

          <h1 className="text-[26px] font-bold text-[#101f45]">
            {teacher.name}
          </h1>

          <p className="mt-1 text-[17px] text-[#526b91]">
            {teacher.role}
          </p>


        </div>
      </div>
    </div>
  );
}


function QuoteCard() {
  return (
    <div className="h-full rounded-xl border border-[#e8edf4] bg-white p-3 shadow-[0_3px_15px_rgba(31,73,125,0.04)]">

      <div className="relative h-full overflow-hidden rounded-lg bg-gradient-to-br from-[#edf5ff] to-[#dfeaff] p-7">

        <p className="max-w-[310px] text-[16px] font-medium italic leading-6 text-[#1553a0]">
          “Teaching is not just
          <br />
          about imparting knowledge,
          <br />
          it’s about inspiring change.”
        </p>

        <p className="mt-4 text-[14px] text-[#355b8d]">
          — Ms. Priya Sharma
        </p>

        {/* Decorative books */}
        <div className="absolute bottom-4 right-7 opacity-60">
          <div className="flex items-end gap-1">

            <div className="h-3 w-20 rounded-sm bg-[#6c92d9]" />
            <div className="h-3 w-16 rounded-sm bg-[#4672c4]" />
            <div className="h-3 w-20 rounded-sm bg-[#325cae]" />

            <div className="ml-3 h-12 w-8 rounded-b-md border-b-4 border-[#7898d2] bg-[#dce8ff]" />

          </div>
        </div>

      </div>
    </div>
  );
}


function ProfileTabs() {

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8edf4] bg-white shadow-[0_3px_15px_rgba(31,73,125,0.04)]">

      
      <div className="p-7">
            <div className="grid gap-7 md:grid-cols-2">

              <InfoRow
                icon={FiUser}
                label="Full Name"
                value={teacher.name}
              />

              <InfoRow
                icon={FiCalendar}
                label="Date of Birth"
                value={teacher.dob}
              />

              <InfoRow
                icon={FiUser}
                label="Gender"
                value={teacher.gender}
              />

              <InfoRow
                icon={FiPhone}
                label="Phone Number"
                value={teacher.phone}
              />

              <InfoRow
                icon={FiMail}
                label="Email Address"
                value={teacher.email}
              />

              <InfoRow
                icon={FiMapPin}
                label="Address"
                value={teacher.address}
              />

            </div>
    


        
          <div className="grid gap-6 md:grid-cols-2">
            <InfoRow
              icon={FiBookOpen}
              label="Highest Qualification"
              value="M.Sc Mathematics"
            />

            <InfoRow
              icon={FiBook}
              label="Specialization"
              value="Advanced Mathematics"
            />

            <InfoRow
              icon={FiCalendar}
              label="Graduation Year"
              value="2015"
            />

            <InfoRow
              icon={HiOutlineAcademicCap}
              label="Certification"
              value="B.Ed"
            />
          </div>
        

          <div className="grid gap-6 md:grid-cols-2">
            <InfoRow
              icon={FiClock}
              label="Experience"
              value="5+ Years"
            />

            <InfoRow
              icon={FiUsers}
              label="Classes Assigned"
              value="9th, 10th, 11th, 12th"
            />

            <InfoRow
              icon={FiCalendar}
              label="Working Since"
              value="July 2020"
            />

            <InfoRow
              icon={FiBarChart2}
              label="Total Students"
              value="180"
            />
          </div>

      </div>
    </div>
  );
}


function SubjectsCard() {
  return (
    <div className="rounded-xl border border-[#e8edf4] bg-white p-5 shadow-[0_3px_15px_rgba(31,73,125,0.04)]">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <FiBookOpen className="text-[23px] text-[#1769ff]" />

          <h2 className="text-[16px] font-semibold text-[#13264b]">
            Subjects
          </h2>
        </div>

        <button className="text-[13px] font-medium text-[#1264e8] hover:underline">
          View All
        </button>

      </div>


      <div className="mt-5 flex flex-wrap gap-3">

        {subjects.map((subject) => (
          <span
            key={subject.name}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${subject.className}`}
          >
            {subject.name}
          </span>
        ))}

      </div>
    </div>
  );
}


function ClassDetailsCard() {
  return (
    <div className="rounded-xl border border-[#e8edf4] bg-white p-5 shadow-[0_3px_15px_rgba(31,73,125,0.04)]">

      <div className="flex items-center gap-3">

        <FiUsers className="text-[23px] text-[#1769ff]" />

        <h2 className="text-[16px] font-semibold text-[#13264b]">
          Class Details
        </h2>

      </div>


      <div className="mt-6 space-y-5">

        <div className="flex justify-between gap-4">
          <span className="text-[14px] text-[#7188a8]">
            Classes Assigned
          </span>

          <span className="text-right text-[14px] font-medium text-[#13264b]">
            {teacher.classes}
          </span>
        </div>


        <div className="flex justify-between">
          <span className="text-[14px] text-[#7188a8]">
            Total Students
          </span>

          <span className="text-[14px] font-medium text-[#13264b]">
            {teacher.students}
          </span>
        </div>


        <div className="flex justify-between">
          <span className="text-[14px] text-[#7188a8]">
            Working Since
          </span>

          <span className="text-[14px] font-medium text-[#13264b]">
            {teacher.workingSince}
          </span>
        </div>

      </div>
    </div>
  );
}


function QuickActionsCard() {
  return (
    <div className="rounded-xl border border-[#e8edf4] bg-white p-5 shadow-[0_3px_15px_rgba(31,73,125,0.04)]">

      <div className="flex items-center gap-3">

        <FiZap className="text-[23px] text-[#1769ff]" />

        <h2 className="text-[16px] font-semibold text-[#13264b]">
          Quick Actions
        </h2>

      </div>


      <div className="mt-5 grid grid-cols-3 gap-3">

        <button className="flex min-h-[88px] flex-col items-center justify-center rounded-lg border border-[#e4eefb] bg-[#f5f9ff] px-2 transition hover:-translate-y-0.5">

          <FiCalendar className="text-[23px] text-[#1769ff]" />

          <span className="mt-3 text-center text-[11px] font-medium text-[#1255b7]">
            View Attendance
          </span>

        </button>


        <button className="flex min-h-[88px] flex-col items-center justify-center rounded-lg border border-[#e1f2e9] bg-[#f3fbf7] px-2 transition hover:-translate-y-0.5">

          <FiUsers className="text-[23px] text-[#16a05d]" />

          <span className="mt-3 text-center text-[11px] font-medium text-[#16824f]">
            Manage Classes
          </span>

        </button>


        <button className="flex min-h-[88px] flex-col items-center justify-center rounded-lg border border-[#eee5fc] bg-[#faf7ff] px-2 transition hover:-translate-y-0.5">

          <HiOutlineChartBar className="text-[23px] text-[#7c3aed]" />

          <span className="mt-3 text-center text-[11px] font-medium text-[#7134c8]">
            View Reports
          </span>

        </button>

      </div>
    </div>
  );
}


export default function TeacherProfile() {

  return (
    <div className="min-h-screen bg-[#f7faff] text-[#10254a]">



      {/* Main */}
      <main className="py-8 px-10">

        {/* Top action */}
        <div className="mb-5 flex items-center justify-between">

          <button className="flex items-center gap-2 text-[14px] font-medium text-[#17365f] hover:text-[#1264e8]">
            <FiArrowLeft className="text-[19px]" />
            Back
          </button>


          <Button
            variant="outlined"
            startIcon={<FiEdit3 />}
            sx={{
              textTransform: "none",
              borderRadius: "6px",
              height: "40px",
              px: 2.5,
              borderColor: "#1769ff",
              color: "#1769ff",
              fontWeight: 500,
              "&:hover": {
                borderColor: "#1769ff",
                backgroundColor: "#f1f6ff",
              },
            }}
          >
            Edit Profile
          </Button>

        </div>


        {/* Hero */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">

          <ProfileHero />

          <QuoteCard />

        </div>


        {/* Content */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">

          {/* Left */}
          <ProfileTabs />


          {/* Right */}
          <div className="space-y-5">

            <SubjectsCard />

            <ClassDetailsCard />

            <QuickActionsCard />

          </div>

        </div>

      </main>
    </div>
  );
}