import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: { type: String, enum: ["Present", "Absent"], required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
