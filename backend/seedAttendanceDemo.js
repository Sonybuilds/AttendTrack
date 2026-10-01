import dotenv from "dotenv";
import mongoose from "mongoose";
import Class from "./database/classSchema.js";
import Student from "./database/studentSchema.js";
import Attendance from "./database/attendanceSchema.js";
import User from "./database/userSchema.js";

dotenv.config();

const classDefinitions = [
  { department: "Computer Science", subject: "Programming Fundamentals", subjectCode: "BCA101", className: "BCA 1st Year", location: "Computer Lab 1", startHourUtc: 4, endHourUtc: 5 },
  { department: "Information Technology", subject: "Database Management Systems", subjectCode: "BCA201", className: "BCA 2nd Year", location: "Computer Lab 2", startHourUtc: 5, endHourUtc: 6 },
  { department: "Electronics and Communication", subject: "Engineering Mathematics", subjectCode: "BTECH101", className: "B.Tech 1st Year", location: "Room A-204", startHourUtc: 6, endHourUtc: 7 },
  { department: "Business Administration", subject: "Principles of Management", subjectCode: "BBA101", className: "BBA 1st Year", location: "Room B-105", startHourUtc: 7, endHourUtc: 8 },
];

const firstNames = ["Aarav", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Meera", "Neel", "Prisha", "Rohan", "Saanvi", "Tanish", "Vanya", "Vivaan", "Zoya"];
const lastNames = ["Sharma", "Verma", "Patel", "Singh", "Gupta", "Kumar", "Joshi", "Mehta", "Reddy", "Shah", "Yadav", "Kapoor", "Malhotra", "Nair", "Das"];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const istToday = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const [seedYear, seedMonth, seedDay] = istToday.split("-").map(Number);
const monthKey = `${seedYear}-${String(seedMonth).padStart(2, "0")}`;

try {
  if (!process.env.LOCAL_MONGODB) throw new Error("LOCAL_MONGODB is not configured");
  await mongoose.connect(process.env.LOCAL_MONGODB);
  await Promise.all([Class.init(), Student.init(), Attendance.init()]);

  const teacher = await User.findOne({ role: { $ne: "admin" } }).sort({ createdAt: 1, _id: 1 }).select("_id").lean();
  if (!teacher) throw new Error("Create a teacher account before seeding demo classes");

  const existingCounts = {
    classes: await Class.countDocuments(),
    students: await Student.countDocuments(),
    attendance: await Attendance.countDocuments(),
  };
  if (existingCounts.classes || existingCounts.students || existingCounts.attendance) {
    throw new Error(`Seed cancelled: database already contains data (${JSON.stringify(existingCounts)})`);
  }

  const classDocuments = classDefinitions.map((definition, index) => new Class({
    teacherId: teacher._id,
    department: definition.department,
    subject: definition.subject,
    subjectCode: definition.subjectCode,
    className: definition.className,
    location: definition.location,
    totalStudent: 15,
    active: true,
    dayAndWeek: "Week System",
    date: null,
    days: weekdays,
    startTime: new Date(Date.UTC(seedYear, seedMonth - 1, 1, definition.startHourUtc, 30)),
    endTime: new Date(Date.UTC(seedYear, seedMonth - 1, 1, definition.endHourUtc, 30)),
    createdAt: new Date(Date.UTC(seedYear, seedMonth - 1, 1, index + 9)),
  }));
  await Class.insertMany(classDocuments);

  const studentDocuments = classDocuments.flatMap((classDocument, classIndex) =>
    Array.from({ length: 15 }, (_, studentIndex) => {
      const sequence = classIndex * 15 + studentIndex;
      return new Student({
        name: `${firstNames[(studentIndex + classIndex * 3) % firstNames.length]} ${lastNames[(studentIndex + classIndex * 4) % lastNames.length]}`,
        fatherName: `${firstNames[(studentIndex + classIndex * 3 + 5) % firstNames.length]} ${lastNames[(studentIndex + classIndex * 4 + 7) % lastNames.length]}`,
        rollNo: `AT-${String(seedYear).slice(-2)}${String(sequence + 1).padStart(3, "0")}`,
        department: classDocument.department,
        className: classDocument.className,
        phone: `90000${String(sequence + 1).padStart(5, "0")}`,
        email: `student${String(sequence + 1).padStart(2, "0")}@example.test`,
        gender: ["Male", "Female", "Other"][sequence % 3],
        dob: new Date(Date.UTC(2005 + (studentIndex % 3), studentIndex % 12, (studentIndex % 27) + 1)),
        academicYear: `${seedYear} - ${seedYear + 1}`,
        subjects: [classDocument._id],
      });
    })
  );
  await Student.insertMany(studentDocuments);

  const attendanceRecords = [];
  const workingDaysInMonth = new Date(Date.UTC(seedYear, seedMonth, 0)).getUTCDate();
  for (let day = 1; day <= Math.min(seedDay, workingDaysInMonth); day += 1) {
    const dateValue = new Date(Date.UTC(seedYear, seedMonth - 1, day));
    const weekday = dateValue.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;

    for (let classIndex = 0; classIndex < classDocuments.length; classIndex += 1) {
      const classDocument = classDocuments[classIndex];
      for (let studentIndex = 0; studentIndex < 15; studentIndex += 1) {
        const studentDocument = studentDocuments[classIndex * 15 + studentIndex];
        const absent = (day * 3 + studentIndex * 5 + classIndex * 7) % 13 === 0;
        attendanceRecords.push({
          classId: classDocument._id,
          studentId: studentDocument._id,
          date,
          status: absent ? "Absent" : "Present",
        });
      }
    }
  }
  await Attendance.insertMany(attendanceRecords);

  console.log(JSON.stringify({
    database: mongoose.connection.name,
    month: monthKey,
    classes: await Class.countDocuments(),
    students: await Student.countDocuments(),
    attendanceRecords: await Attendance.countDocuments({ date: new RegExp(`^${monthKey}-`) }),
    presentRecords: await Attendance.countDocuments({ date: new RegExp(`^${monthKey}-`), status: "Present" }),
    absentRecords: await Attendance.countDocuments({ date: new RegExp(`^${monthKey}-`), status: "Absent" }),
  }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
