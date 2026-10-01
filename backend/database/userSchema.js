import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "teacher"],
      default: "teacher",
      required: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    dob: { type: String, trim: true, default: "" },
    gender: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    qualification: { type: String, trim: true, default: "" },
    specialization: { type: String, trim: true, default: "" },
    graduationYear: { type: String, trim: true, default: "" },
    certification: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    workingSince: { type: String, trim: true, default: "" },

    password: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
