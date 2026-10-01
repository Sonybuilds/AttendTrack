import Button from "@mui/material/Button";
import {
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function ClassCard({ classData, onDelete, onEdit, onEmailSchedule, sendingEmail }) {
  const navigate = useNavigate();
  const isWeekSystem = classData.dayAndWeek === "Week System";

  const formatDateTime = (value, options) => {
    if (!value || Number.isNaN(new Date(value).getTime())) return "—";
    return new Date(value).toLocaleString("en-IN", options);
  };

  const schedule = isWeekSystem
    ? classData.days?.length
      ? classData.days.join(" · ")
      : "No days selected"
    : formatDateTime(classData.date, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="flex flex-1 flex-col p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold tracking-wide text-blue-800">
                {classData.subjectCode || "NO CODE"}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {classData.department}
              </span>
            </div>
            <h2 className="truncate text-lg font-semibold leading-6 text-slate-900">
              {classData.subject}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{classData.className}</p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              classData.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${classData.active ? "bg-emerald-500" : "bg-slate-400"}`} />
            {classData.active ? "Active" : "Inactive"}
          </span>
        </header>

        <div className="my-4 border-t border-slate-100" />

        <section className="rounded-lg bg-slate-50 px-3.5 py-3" aria-label="Class schedule">
          <div className="flex items-start gap-3">
            <HiOutlineClock className="mt-0.5 shrink-0 text-lg text-blue-700" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</p>
                <span className="text-[11px] font-medium text-slate-400">{classData.dayAndWeek}</span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800">{schedule}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatDateTime(classData.startTime, { hour: "2-digit", minute: "2-digit", hour12: true })}
                <span className="mx-1.5 text-slate-300">—</span>
                {formatDateTime(classData.endTime, { hour: "2-digit", minute: "2-digit", hour12: true })}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <section className="min-w-0 rounded-lg border border-slate-100 px-3.5 py-3" aria-label="Class location">
            <div className="flex items-center gap-2 text-slate-400">
              <HiOutlineLocationMarker className="text-base text-blue-700" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Location</span>
            </div>
            <p className="mt-1.5 truncate text-sm font-medium text-slate-800" title={classData.location}>
              {classData.location || "Not specified"}
            </p>
          </section>
          <section className="min-w-0 rounded-lg border border-slate-100 px-3.5 py-3" aria-label="Student capacity">
            <div className="flex items-center gap-2 text-slate-400">
              <HiOutlineUsers className="text-base text-blue-700" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Capacity</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">
              {classData.totalStudent ?? 0}<span className="ml-1 font-normal text-slate-500">students</span>
            </p>
          </section>
        </div>

        <footer className="mt-auto flex items-center gap-1 border-t border-slate-100 pt-4">
          <Button size="small" startIcon={<HiOutlinePencil />} onClick={() => onEdit(classData)} className="!rounded-lg !px-2.5 !font-semibold !normal-case !text-slate-600 hover:!bg-slate-100">
            Edit
          </Button>
          <Button size="small" startIcon={<HiOutlineTrash />} onClick={() => onDelete(classData._id)} className="!rounded-lg !px-2.5 !font-semibold !normal-case !text-rose-600 hover:!bg-rose-50">
            Delete
          </Button>
          <Button size="small" startIcon={<HiOutlineMail />} onClick={() => onEmailSchedule(classData)} disabled={sendingEmail} title="Email this schedule to enrolled students" className="!rounded-lg !px-2 !font-semibold !normal-case !text-blue-700 hover:!bg-blue-50">
            {sendingEmail ? "Sending…" : "Email"}
          </Button>
          <Button size="small" endIcon={<HiOutlineArrowRight />} onClick={() => navigate(`student-manage?classId=${classData._id}`, { state: { classData } })} className="!ml-auto !rounded-lg !px-3 !font-semibold !normal-case !text-blue-700 hover:!bg-blue-50">
            Students
          </Button>
        </footer>
      </div>
    </article>
  );
}
