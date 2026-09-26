import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import {
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

export default function ClassCard({ classData }) {
  return (
    <div
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
      "
    >
      {/* Left Accent */}

      {/* ================= HEADER ================= */}
      <div
        className="
          relative
          flex
          items-center
          justify-between
          border-b
          border-gray-200
          bg-gray-50
          px-5
          py-4
        "
      >
        <div className="min-w-0">
          <Typography
            className="
              !truncate
              !text-[15px]
              !font-bold
              !leading-5
              !text-gray-900
            "
          >
            {classData.subjectName}
          </Typography>

          <div className="mt-1 flex items-center gap-2">
            <span
              className="
                rounded-md
                bg-emerald-200
                px-2
                py-0.5
                text-[10px]
                font-semibold
                text-emerald-700
              "
            >
              {classData.subjectCode}
            </span>

            <span className="h-1 w-1 rounded-full bg-gray-300" />

            <span className="truncate text-[11px] text-gray-500">
              {classData.className}
            </span>
          </div>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="px-5 py-4">
        <div className="space-y-3">

          {/* Schedule */}
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-3
              transition-colors
              group-hover:border-gray-300
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  my-auto
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-gray-600
                  shadow-sm
                "
              >
                <HiOutlineClock className="text-lg" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                  Schedule
                </p>

                <div className="flex gap-5">
                  <p className="mt-1 truncate text-xs text-gray-800">
                    {classData.date}
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-500">
                    {classData.startTime} - {classData.endTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-3
              transition-colors
              group-hover:border-gray-300
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  my-auto
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-gray-600
                  shadow-sm
                "
              >
                <HiOutlineLocationMarker className="text-lg" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
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
            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-3
                transition-colors
                group-hover:border-gray-300
              "
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
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
            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-2
              "
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <span
                    className="
                      mt-1
                      inline-flex
                      items-center
                      rounded-full
                      bg-green-200
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      text-green-700
                    "
                  >
                    Complete
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-gray-200
          bg-gray-50
          px-5
          py-3
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-white
              text-gray-500
              shadow-sm
            "
          >
            <HiOutlineAcademicCap className="text-lg" />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700">
              Class Details
            </p>
          </div>
        </div>

        <div className="!space-x-3">
          <Button
            className="
              !h-8
              !min-w-8
              !rounded-lg
              !bg-white
              !px-6
              !text-xs
              !font-semibold
              !normal-case
              !text-gray-600
              !shadow-sm
              hover:!bg-gray-100
            "
          >
            Edit
          </Button>

          <Button
            className="
              !h-8
              !min-w-8
              !rounded-lg
              !bg-blue-800
              !px-5
              !text-xs
              !font-semibold
              !normal-case
              !text-white
              !shadow-sm
              hover:!bg-blue-700
            "
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}