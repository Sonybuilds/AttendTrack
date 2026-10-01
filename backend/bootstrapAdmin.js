import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./database/userSchema.js";
import teacherID from "./function/generateTeacherID.js";

dotenv.config();

const name = String(process.env.ADMIN_NAME || "").trim();
const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const requestedId = String(process.env.ADMIN_ID || "").trim().toUpperCase();

if (!process.env.LOCAL_MONGODB || !name || !email || password.length < 8 || (requestedId && !/^[A-Z0-9-]{4,24}$/.test(requestedId))) {
  console.error("Set LOCAL_MONGODB, ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 8 characters; ADMIN_ID is optional and must be 4-24 letters, numbers, or hyphens.");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.LOCAL_MONGODB);
    let admin = await User.findOne({ email });
    if (requestedId && await User.exists({ id: requestedId, ...(admin ? { _id: { $ne: admin._id } } : {}) })) {
      throw new Error("The requested admin ID is already in use");
    }
    if (admin) {
      if (admin.role !== "admin") {
        throw new Error("That email already belongs to a teacher. Use a new email to create the first admin.");
      }
      admin.name = name;
      admin.password = password;
      if (requestedId) admin.id = requestedId;
      await admin.save();
    } else {
      admin = await User.create({ name, email, password, role: "admin", id: requestedId || await teacherID(name) });
    }
    console.log(`Admin account ready. Sign in with Teacher ID: ${admin.id}`);
  } catch (error) {
    console.error("Could not create admin account:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
