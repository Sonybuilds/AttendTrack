import express from "express";
import User from "../database/userSchema.js";
import Class from "../database/classSchema.js";
import Student from "../database/studentSchema.js";
import Attendance from "../database/attendanceSchema.js";
import teacherID from "../function/generateTeacherID.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const routes = express.Router();
const scrypt = promisify(scryptCallback);
const sessionCookieName = "attendtrack_session";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in production");
}
const sessionSecret = process.env.JWT_SECRET || randomBytes(32).toString("hex");
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};
const profileFields = [
  "name", "email", "phone", "location", "dob", "gender", "address",
  "qualification", "specialization", "graduationYear", "certification",
  "experience", "workingSince",
];
const teacherProfileSelection = `id role ${profileFields.join(" ")}`;

const authenticateSession = async (req, res, next) => {
  const token = req.cookies?.[sessionCookieName];
  if (!token) return res.status(401).json({ message: "Please log in to continue" });
  try {
    const payload = jwt.verify(token, sessionSecret, { issuer: "attendtrack" });
    if (payload.kind === "student") return res.status(403).json({ message: "Teacher or administrator access is required" });
    const teacher = await User.findById(payload.sub).select(teacherProfileSelection).lean();
    if (!teacher) return res.status(401).json({ message: "User session is no longer valid" });
    if (!teacher.role) {
      teacher.role = "teacher";
      await User.updateOne({ _id: teacher._id, role: { $exists: false } }, { $set: { role: "teacher" } });
    }
    req.teacher = teacher;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};
const requireRole = (role) => (req, res, next) => {
  if (req.teacher?.role !== role) return res.status(403).json({ message: "You do not have permission to access this area" });
  return next();
};
const hashStudentPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
};
const verifyStudentPassword = async (password, storedValue) => {
  const [salt, savedHash] = String(storedValue || "").split(":");
  if (!salt || !savedHash) return false;
  const actualHash = await scrypt(password, salt, 64);
  const expectedHash = Buffer.from(savedHash, "hex");
  return expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
};
const authenticateStudent = async (req, res, next) => {
  const token = req.cookies?.[sessionCookieName];
  if (!token) return res.status(401).json({ message: "Please log in to continue" });
  try {
    const payload = jwt.verify(token, sessionSecret, { issuer: "attendtrack" });
    if (payload.kind !== "student") return res.status(403).json({ message: "Student access is required" });
    const student = await Student.findById(payload.sub).select("name fatherName rollNo department className phone email gender dob academicYear subjects").lean();
    if (!student) return res.status(401).json({ message: "Student session is no longer valid" });
    req.student = student;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};

routes.post("/register", (_req, res) => {
  return res.status(403).json({ message: "Teacher accounts must be created by an administrator" });
});


routes.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
    const loginId = String(id || "").trim();
    const userFound = await User.findOne({ id: loginId.toUpperCase() });
    if (userFound) {
      if (userFound.password !== password) {
        return res.status(401).json({ message: "Wrong Password" });
      }
      const token = jwt.sign({}, sessionSecret, {
        subject: String(userFound._id),
        issuer: "attendtrack",
        expiresIn: "8h",
      });
      res.cookie(sessionCookieName, token, sessionCookieOptions);
      return res.status(200).json({ message: "Login Successfully", role: userFound.role || "teacher" });
    }

    const escapedLoginId = loginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const student = await Student.findOne({ rollNo: new RegExp(`^${escapedLoginId}$`, "i") }).select("+passwordHash");
    if (!student) return res.status(404).json({ message: "Account not found" });
    if (!await verifyStudentPassword(String(password || ""), student.passwordHash)) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const token = jwt.sign({ kind: "student" }, sessionSecret, {
      subject: String(student._id),
      issuer: "attendtrack",
      expiresIn: "8h",
    });
    res.cookie(sessionCookieName, token, sessionCookieOptions);
    return res.status(200).json({ message: "Login Successfully", role: "student" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

routes.get("/teacher/session", authenticateSession, (req, res) => {
  return res.status(200).json({ authenticated: true, teacher: req.teacher });
});

routes.get("/student/session", authenticateStudent, (req, res) => {
  return res.status(200).json({ authenticated: true, student: req.student });
});
routes.get("/student/portal", authenticateStudent, async (req, res) => {
  try {
    const subjectIds = (req.student.subjects || []).filter((id) => mongoose.isValidObjectId(id));
    const [subjects, attendance] = await Promise.all([
      Class.find({ _id: { $in: subjectIds } }).select("subject subjectCode className department location dayAndWeek date days startTime endTime active").lean(),
      Attendance.find({ studentId: req.student._id }).select("classId date status").sort({ date: -1 }).limit(500).lean(),
    ]);
    return res.status(200).json({ student: req.student, subjects, attendance });
  } catch (error) {
    console.error("Load student portal error:", error);
    return res.status(500).json({ message: "Could not load student portal" });
  }
});

routes.post("/logout", (req, res) => {
  res.clearCookie(sessionCookieName, { ...sessionCookieOptions, maxAge: undefined });
  return res.status(200).json({ message: "Logged out successfully" });
});

routes.use("/teacher", authenticateSession, requireRole("teacher"));
routes.use("/admin", authenticateSession, requireRole("admin"));

routes.get("/admin/teachers", async (_req, res) => {
  try {
    await User.updateMany({ role: { $exists: false } }, { $set: { role: "teacher" } });
    const teachers = await User.find({ role: "teacher" }).select("id name email createdAt").sort({ name: 1 }).lean();
    return res.status(200).json({ teachers });
  } catch (error) {
    console.error("List teachers error:", error);
    return res.status(500).json({ message: "Could not load teacher accounts" });
  }
});

routes.post("/admin/teachers", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (await User.exists({ email })) return res.status(409).json({ message: "Email is already registered" });

    const teacher = await User.create({ name, email, password, role: "teacher", id: await teacherID(name) });
    return res.status(201).json({
      message: "Teacher account created successfully",
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    return res.status(error.code === 11000 ? 409 : 500).json({
      message: error.code === 11000 ? "Email or teacher ID is already in use" : "Could not create teacher account",
    });
  }
});

routes.put("/teacher/profile", async (req, res) => {
  try {
    const updates = Object.fromEntries(
      profileFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, typeof req.body[field] === "string" ? req.body[field].trim() : ""])
    );
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "Enter at least one profile field to update" });
    }
    if (Object.hasOwn(updates, "name") && !updates.name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (Object.hasOwn(updates, "email")) {
      updates.email = updates.email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        return res.status(400).json({ message: "Enter a valid email address" });
      }
      const existingTeacher = await User.findOne({ email: updates.email, _id: { $ne: req.teacher._id } }).select("_id");
      if (existingTeacher) return res.status(409).json({ message: "Email is already used by another teacher" });
    }
    if (Object.hasOwn(updates, "phone") && updates.phone && !/^[+\d\s().-]{7,20}$/.test(updates.phone)) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }

    const teacher = await User.findByIdAndUpdate(req.teacher._id, { $set: updates }, {
      new: true,
      runValidators: true,
    }).select(teacherProfileSelection).lean();
    return res.status(200).json({ message: "Profile updated successfully", teacher });
  } catch (error) {
    console.error("Update teacher profile error:", error);
    return res.status(500).json({ message: "Could not update teacher profile" });
  }
});

const studentFields = [
  "name",
  "fatherName",
  "rollNo",
  "department",
  "className",
  "phone",
  "email",
  "gender",
  "dob",
  "academicYear",
  "subjects",
];

const normalizeSubjectIds = async (subjectIds, teacherId) => {
  if (!Array.isArray(subjectIds)) {
    const error = new Error("Subjects must be an array of class IDs");
    error.name = "ValidationError";
    throw error;
  }

  const uniqueIds = [...new Set(subjectIds.map((id) => String(id)))];
  if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) {
    const error = new Error("A subject ID is invalid");
    error.name = "ValidationError";
    throw error;
  }

  const matchingSubjects = await Class.countDocuments({ _id: { $in: uniqueIds }, teacherId });
  if (matchingSubjects !== uniqueIds.length) {
    const error = new Error("One or more selected subjects do not exist");
    error.name = "ValidationError";
    throw error;
  }

  return uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
};

const populateStudentSubjects = async (students, teacherId) => {
  const rawSubjectValues = students.flatMap((student) => student.subjects || []);
  const subjectIds = rawSubjectValues
    .filter((value) => mongoose.isValidObjectId(value))
    .map((value) => new mongoose.Types.ObjectId(value));
  const legacyLabels = rawSubjectValues.filter((value) => !mongoose.isValidObjectId(value));
  const subjectFilter = [];
  if (subjectIds.length) subjectFilter.push({ _id: { $in: subjectIds } });
  if (legacyLabels.length) {
    subjectFilter.push(
      { subject: { $in: legacyLabels } },
      { subjectCode: { $in: legacyLabels } }
    );
  }

  const subjectRecords = subjectFilter.length
    ? await Class.find({ teacherId, $or: subjectFilter }).select("subject subjectCode className").lean()
    : [];
  const subjectsById = new Map(subjectRecords.map((subject) => [String(subject._id), subject]));
  const subjectsByLabel = new Map();
  subjectRecords.forEach((subject) => {
    subjectsByLabel.set(subject.subject, subject);
    subjectsByLabel.set(subject.subjectCode, subject);
  });

  return students.map((student) => ({
    ...student,
    subjects: (student.subjects || []).map((value) => {
      const key = String(value);
      return subjectsById.get(key) || subjectsByLabel.get(key) || {
        _id: mongoose.isValidObjectId(value) ? key : null,
        subject: key,
        subjectCode: "",
        className: "",
      };
    }),
  }));
};

routes.get("/teacher/attendance", async (req, res) => {
  try {
    const { classId, month } = req.query;
    if (!mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ message: "A valid class ID is required" });
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) {
      return res.status(400).json({ message: "Month must use YYYY-MM format" });
    }
    const classExists = await Class.exists({ _id: classId, teacherId: req.teacher._id });
    if (!classExists) return res.status(404).json({ message: "Class not found" });

    const attendance = await Attendance.find({
      classId,
      date: new RegExp(`^${month}-`),
    }).select("studentId date status").lean();
    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({ message: "Failed to load attendance" });
  }
});

routes.put("/teacher/attendance", async (req, res) => {
  try {
    const { classId, studentId, date, status } = req.body;
    if (!mongoose.isValidObjectId(classId) || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Valid class and student IDs are required" });
    }
    const dateValue = new Date(`${date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || Number.isNaN(dateValue.getTime()) || dateValue.toISOString().slice(0, 10) !== date) {
      return res.status(400).json({ message: "Date must be a valid YYYY-MM-DD date" });
    }
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({ message: "Status must be Present or Absent" });
    }

    const classObjectId = new mongoose.Types.ObjectId(classId);
    const classIsOwned = await Class.exists({ _id: classId, teacherId: req.teacher._id });
    if (!classIsOwned) return res.status(404).json({ message: "Class not found" });

    const studentIsEnrolled = await Student.exists({
      _id: studentId,
      subjects: { $in: [classObjectId, String(classId)] },
    });
    if (!studentIsEnrolled) {
      return res.status(400).json({ message: "Student is not enrolled in this class subject" });
    }

    const record = await Attendance.findOneAndUpdate(
      { classId: classObjectId, studentId: new mongoose.Types.ObjectId(studentId), date },
      { $set: { status } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ attendance: record, message: `Marked ${status.toLowerCase()}` });
  } catch (error) {
    console.error("Update attendance error:", error);
    return res.status(500).json({ message: "Failed to update attendance" });
  }
});

routes.get("/teacher/students", async (req, res) => {
  try {
    const page = Math.max(0, Number.parseInt(req.query.page, 10) || 0);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const search = String(req.query.search || "").trim();
    const className = String(req.query.className || "").trim();
    const department = String(req.query.department || "").trim();
    const subjectId = String(req.query.subjectId || "").trim();
    const excludeSubjectId = String(req.query.excludeSubjectId || "").trim();
    const filter = {};

    for (const id of [subjectId, excludeSubjectId].filter(Boolean)) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }
    }

    for (const scopedSubjectId of [subjectId, excludeSubjectId].filter(Boolean)) {
      const selectedSubject = await Class.exists({ _id: scopedSubjectId, teacherId: req.teacher._id });
      if (!selectedSubject) return res.status(404).json({ message: "Subject not found" });
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      const matchingSubjectIds = await Class.find({
        teacherId: req.teacher._id,
        $or: [
          { subject: searchRegex },
          { subjectCode: searchRegex },
        ],
      }).distinct("_id");
      filter.$or = [
        { name: searchRegex },
        { fatherName: searchRegex },
        { rollNo: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subjects: searchRegex },
      ];
      if (mongoose.isValidObjectId(search)) {
        filter.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }
      if (matchingSubjectIds.length) {
        filter.$or.push({ subjects: { $in: matchingSubjectIds } });
      }
    }
    if (className) filter.className = className;
    if (department) filter.department = department;
    if (subjectId) filter.subjects = new mongoose.Types.ObjectId(subjectId);
    if (excludeSubjectId) {
      filter.$and ||= [];
      filter.$and.push({
        subjects: {
          $nin: [new mongoose.Types.ObjectId(excludeSubjectId), excludeSubjectId],
        },
      });
    }

    const [studentDocuments, total] = await Promise.all([
      Student.find(filter)
        .lean()
        .sort({ name: 1 })
        .skip(page * limit)
        .limit(limit),
      Student.countDocuments(filter),
    ]);
    const students = await populateStudentSubjects(studentDocuments, req.teacher._id);
    return res.status(200).json({ students, total, page, limit });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ message: "Failed to load students" });
  }
});

routes.post("/teacher/addstudent", async (req, res) => {
  try {
    const studentData = Object.fromEntries(
      studentFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );
    studentData.rollNo = String(studentData.rollNo || "").trim();
    const password = String(req.body.password || "");
    if (password.length < 8) {
      return res.status(400).json({ message: "Student portal password must be at least 8 characters" });
    }
    studentData.passwordHash = await hashStudentPassword(password);
    studentData.subjects = await normalizeSubjectIds(studentData.subjects || [], req.teacher._id);

    const existingStudent = await Student.findOne({ rollNo: studentData.rollNo });
    if (existingStudent) {
      return res.status(409).json({ message: "Roll number already exists" });
    }

    const student = await Student.create(studentData);
    const safeStudent = student.toObject();
    delete safeStudent.passwordHash;
    return res.status(201).json({
      success: true,
      message: "Student added successfully",
      student: safeStudent,
    });
  } catch (error) {
    console.error("Add student error:", error);
    const status = error.code === 11000 ? 409 : error.name === "ValidationError" ? 400 : 500;
    return res.status(status).json({
      message: status === 409 ? "Roll number already exists" : status === 400 ? error.message : "Failed to add student",
    });
  }
});

routes.put("/teacher/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const updates = Object.fromEntries(
      studentFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    if (Object.hasOwn(req.body, "password") && String(req.body.password || "")) {
      const password = String(req.body.password);
      if (password.length < 8) {
        return res.status(400).json({ message: "Student portal password must be at least 8 characters" });
      }
      updates.passwordHash = await hashStudentPassword(password);
    }

    if (Object.hasOwn(updates, "subjects")) {
      updates.subjects = await normalizeSubjectIds(updates.subjects, req.teacher._id);
    }

    if (Object.hasOwn(updates, "rollNo")) {
      updates.rollNo = String(updates.rollNo).trim();
      const duplicateStudent = await Student.findOne({
        rollNo: updates.rollNo,
        _id: { $ne: id },
      });
      if (duplicateStudent) {
        return res.status(409).json({ message: "Roll number already exists" });
      }
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true, select: "-passwordHash" }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error);
    const status = error.code === 11000 ? 409 : ["ValidationError", "CastError"].includes(error.name) ? 400 : 500;
    return res.status(status).json({
      message: status === 409 ? "Roll number already exists" : status === 400 ? error.message : "Failed to update student",
    });
  }
});

routes.delete("/teacher/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({ message: "Failed to delete student" });
  }
});

routes.post("/teacher/classes/:id/email-schedule", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      return res.status(503).json({
        message: "Email is not configured. Set RESEND_API_KEY and EMAIL_FROM in the backend environment.",
      });
    }

    const classData = await Class.findOne({ _id: id, teacherId: req.teacher._id }).lean();
    if (!classData) return res.status(404).json({ message: "Class not found" });

    const enrolledStudents = await Student.find({
      subjects: { $in: [new mongoose.Types.ObjectId(id), id] },
    }).select("name email").lean();
    const recipients = [...new Map(
      enrolledStudents
        .filter((student) => student.email?.trim())
        .map((student) => [student.email.trim().toLowerCase(), student])
    ).values()];

    if (!recipients.length) {
      return res.status(200).json({ sentCount: 0, skippedCount: enrolledStudents.length, message: "No enrolled students have an email address." });
    }

    const formatDate = (value, options) => value
      ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ...options })
      : "—";
    const schedule = classData.dayAndWeek === "Week System"
      ? (classData.days || []).join(", ") || "Days not set"
      : formatDate(classData.date, { day: "2-digit", month: "long", year: "numeric" });
    const startTime = formatDate(classData.startTime, { hour: "2-digit", minute: "2-digit", hour12: true });
    const endTime = formatDate(classData.endTime, { hour: "2-digit", minute: "2-digit", hour12: true });
    const escapeHtml = (value) => String(value || "—").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
    const subject = `${classData.subject} (${classData.subjectCode}) schedule`;
    const text = [
      `Hello,`,
      `The schedule for ${classData.subject} (${classData.subjectCode}) has been shared.`,
      `Class: ${classData.className}`,
      `Date / days: ${schedule}`,
      `Time: ${startTime} – ${endTime} (IST)`,
      `Location: ${classData.location || "Not specified"}`,
    ].join("\n");
    const html = `<p>Hello {{name}},</p><p>The schedule for <strong>${escapeHtml(classData.subject)} (${escapeHtml(classData.subjectCode)})</strong> has been shared.</p><p><strong>Class:</strong> ${escapeHtml(classData.className)}<br><strong>Date / days:</strong> ${escapeHtml(schedule)}<br><strong>Time:</strong> ${escapeHtml(startTime)} – ${escapeHtml(endTime)} IST<br><strong>Location:</strong> ${escapeHtml(classData.location || "Not specified")}</p>`;

    let sentCount = 0;
    const failedEmails = [];
    for (let index = 0; index < recipients.length; index += 5) {
      const batch = recipients.slice(index, index + 5);
      const results = await Promise.all(batch.map(async (student) => {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from,
              to: [student.email.trim()],
              subject,
              text: text.replace("Hello,", `Hello ${student.name || "Student"},`),
              html: html.replace("{{name}}", escapeHtml(student.name || "Student")),
            }),
          });
          return { email: student.email, ok: response.ok };
        } catch {
          return { email: student.email, ok: false };
        }
      }));
      results.forEach((result) => {
        if (result.ok) sentCount += 1;
        else failedEmails.push(result.email);
      });
    }

    return res.status(failedEmails.length ? 207 : 200).json({
      sentCount,
      failedCount: failedEmails.length,
      skippedCount: enrolledStudents.length - recipients.length,
      message: failedEmails.length
        ? `${sentCount} email(s) sent; ${failedEmails.length} failed.`
        : `Schedule sent to ${sentCount} student(s).`,
    });
  } catch (error) {
    console.error("Email class schedule error:", error);
    return res.status(500).json({ message: "Failed to send class schedule emails" });
  }
});

routes.post("/teacher/addclass", async (req, res) => {
  try {
    
    const classData = req.body;
        console.log(classData)

    const existingClass = await Class.findOne({ teacherId: req.teacher._id, subjectCode: classData.subjectCode });
    console.log(existingClass);

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "Subject code already exists",
      });
    }


    const newClass = new Class({ ...classData, teacherId: req.teacher._id });

    const savedClass = await newClass.save();
    console.log(newClass);

    res.status(200).json({
      success: true,
      message: "Class added successfully",
      data: savedClass,
    });
  } catch (error) {
    console.error("Add Class Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add class",
      error: error.message,
    });
  }
});

routes.get("/teacher/classes", async (req, res) => {
  try {
    const firstTeacher = await User.findOne({ role: { $ne: "admin" } }).sort({ createdAt: 1, _id: 1 }).select("_id").lean();
    if (firstTeacher && String(firstTeacher._id) === String(req.teacher._id)) {
      await Class.updateMany(
        { $or: [{ teacherId: { $exists: false } }, { teacherId: null }] },
        { $set: { teacherId: req.teacher._id } }
      );
    }
    const classes = await Class.find({ teacherId: req.teacher._id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ classes });
  } catch (error) {
    console.error("Get teacher classes error:", error);
    return res.status(500).json({ message: "Failed to load classes" });
  }
});

routes.delete('/teacher/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid class ID" });
    }
    const deletedClass = await Class.findOneAndDelete({ _id: id, teacherId: req.teacher._id });

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
      data: deletedClass,
    });
  } catch (error) {
    console.error('Delete class error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message,
    });
  }
});


routes.put('/teacher/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    const fields = [
      'department',
      'subject',
      'subjectCode',
      'className',
      'location',
      'totalStudent',
      'active',
      'dayAndWeek',
      'date',
      'days',
      'startTime',
      'endTime',
    ];
    const updates = Object.fromEntries(
      fields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    if (Object.hasOwn(updates, 'subjectCode')) {
      updates.subjectCode = String(updates.subjectCode).trim().toUpperCase();
      const duplicateClass = await Class.findOne({
        teacherId: req.teacher._id,
        subjectCode: updates.subjectCode,
        _id: { $ne: id },
      });

      if (duplicateClass) {
        return res.status(409).json({
          success: false,
          message: 'Subject code already exists',
        });
      }
    }

    const updatedClass = await Class.findOneAndUpdate(
      { _id: id, teacherId: req.teacher._id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass,
    });

  } catch (error) {
    console.error('Update class error:', error);

    const status = ['ValidationError', 'CastError'].includes(error.name)
      ? 400
      : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? error.message : 'Failed to update class',
    });
  }
});





export default routes;

