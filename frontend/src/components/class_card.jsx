import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
export default function ClassCard({ classData , onDelete}) {
  const navigate = useNavigate();


  const isWeekSystem = classData.dayAndWeek === 'Week System';

  const formatTime = (time) => {
    if (!time) return '--';

    return new Date(time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return '--';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  


  return (
    <div className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">

      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-5 py-5">

        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-125" />

        <div className="relative flex items-start justify-between gap-3">

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                {classData.subjectCode}
              </span>

              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {classData.department}
              </span>
            </div>

            <Typography
              className="!truncate !text-lg !font-bold !leading-6 !text-slate-900"
            >
              {classData.subject}
            </Typography>

            <p className="mt-1 truncate text-xs font-medium text-slate-500">
              {classData.className}
            </p>
          </div>

          {/* Status */}
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              classData.active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {classData.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="space-y-3 p-5">

        {/* Schedule */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-colors group-hover:border-blue-100">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <HiOutlineClock className="text-xl" />
            </div>

            <div className="min-w-0 flex-1">

              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Schedule
                </p>

                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-slate-500 shadow-sm">
                  {classData.dayAndWeek}
                </span>
              </div>

              {isWeekSystem ? (
                <p className="truncate text-sm font-bold text-slate-800">
                  {classData.days?.length
                    ? classData.days.join(' • ')
                    : 'No days selected'}
                </p>
              ) : (
                <p className="text-sm font-bold text-slate-800">
                  {formatDate(classData.date)}
                </p>
              )}

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {formatTime(classData.startTime)}
                <span className="mx-1.5 text-slate-300">→</span>
                {formatTime(classData.endTime)}
              </p>

            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
            <HiOutlineLocationMarker className="text-xl" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Location
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
              {classData.location || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Students */}
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
              <HiOutlineUsers className="text-xl" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Students
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-800">
                {classData.totalStudent ?? 0}
                <span className="ml-1 text-xs font-medium text-slate-400">
                  Enrolled
                </span>
              </p>
            </div>

          </div>

          {/* Active badge */}
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </p>

            <p
              className={`mt-1 text-xs font-bold ${
                classData.active
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }`}
            >
              {classData.active ? 'Running' : 'Disabled'}
            </p>
          </div>

        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">

        {/* Edit */}
        <Button
          startIcon={<HiOutlinePencil />}
          className="!h-9 !rounded-lg !bg-white !px-3 !text-xs !font-semibold !normal-case !text-slate-600 !shadow-sm hover:!bg-slate-100"
        >
          Edit
        </Button>

        {/* Delete */}
        <Button
          onClick={()=>{onDelete(classData._id)}}
          startIcon={<HiOutlineTrash />}
          color="error"
          className="!h-9 !rounded-lg !px-3 !text-xs !font-semibold !normal-case"
        >
          Delete
        </Button>

        {/* View */}
        <Button
          onClick={() => navigate('student-manage')}
          endIcon={<HiOutlineArrowRight />}
          className="!ml-auto !h-9 !rounded-lg !bg-blue-700 !px-4 !text-xs !font-bold !normal-case !text-white !shadow-sm hover:!bg-blue-800"
        >
          Students
        </Button>

      </div>
    </div>
  );
}
