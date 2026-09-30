import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { HiOutlineClock, HiOutlineLocationMarker} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function ClassCard({ classData }) {
  const Navigate = useNavigate();
  return (
    <div className=" group relative w-full overflow-hidden rounded-2xl border border-gray-200 
        bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">

      <div className=" relative flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
        <div className="min-w-0">
          <Typography className=" !truncate !text-[1.1rem] !font-bold !leading-5 !text-gray-900">
            {classData.subjectName}
          </Typography>

          <div className="mt-1 flex items-center gap-2">
            <span className=" rounded-md bg-emerald-200 px-2 py-0.5 text-sm font-semibold text-emerald-700">
              {classData.subjectCode}
            </span>

            <span className="h-1 w-1 rounded-full bg-gray-300" />

            <span className="truncate text-sm text-gray-500">
              {classData.className}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-3">

          {/* Schedule */}
          <div className=" rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors group-hover:border-gray-300">
            <div className="flex items-start gap-4">
              <div className=" my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                <HiOutlineClock className="text-lg" />
              </div>

              <div className="min-w-0">
                <p className="text-sx font-semibold uppercase tracking-wide text-gray-500">
                  Schedule
                </p>

                <div className="flex gap-5">
                  <p className="mt-1 truncate text-xs text-gray-800">
                    {classData.date}
                  </p>

                  <p className="mt-0.5 text-[xs] text-gray-500">
                    {classData.startTime} - {classData.endTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className=" rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors group-hover:border-gray-300">
            <div className="flex items-start gap-3">
              <div className=" my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                <HiOutlineLocationMarker className="text-lg" />
              </div>

              <div className="min-w-0">
                <p className="text-sx font-semibold uppercase tracking-wide text-gray-500">
                  Location
                </p>

                <p className="mt-1 truncate text-xs font-bold text-gray-800">
                  {classData.location}
                </p>
              </div>
            </div>
          </div>

          {/* Students + Status */}
          <div className="grid grid-cols-2 gap-3">

            {/* Students */}
            <div className=" rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors group-hover:border-gray-300">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sx font-semibold uppercase tracking-wide text-gray-500">
                    Students
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {classData.totalStudents}

                    <span className="ml-1 text-[10px] font-medium text-gray-500">
                      Enrolled
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className=" rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <span className=" mt-1 inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-semibold text-green-700" >
                    Complete
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className=" grid grid-cols-3 gap-5 border-t border-gray-200 bg-gray-50 px-5 py-3" >
        
          <Button className=" !h-8 !min-w-8 !rounded-lg !bg-white !px-6 !text-xs  !font-semibold !normal-case !text-gray-600 !shadow-sm hover:!bg-gray-100">
            Edit
          </Button>
           <Button color='error' variant='text'
            className=" !h-8 !min-w-8 !rounded-lg !px-6 !text-xs !font-semibold !normal-case  !shadow-sm/90 shadow-red-200 hover:!bg-gray-100 " >
            Delete
          </Button>

          <Button onClick={()=>{Navigate('student-manage')}}
            className=" !h-8 !min-w-8 !rounded-lg !bg-blue-800 !px-5 !text-xs !font-semibold !normal-case !text-white !shadow-sm hover:!bg-blue-700" >
            View
          </Button>
      </div>
    </div>
  );
}