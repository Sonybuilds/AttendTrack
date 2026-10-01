import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true, unique: true },
    department: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    passwordHash: { type: String, select: false, default: "" },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    dob: { type: Date, required: true },
    academicYear: { type: String, required: true, trim: true },
    // New values are validated Class ObjectIds; Mixed keeps older subject labels readable until edited.
    subjects: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
