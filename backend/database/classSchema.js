import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    className: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    totalStudent: {
      type: Number,
      required: true,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    dayAndWeek: {
      type: String,
      enum: ["Week System", "Date System"],
      required: true,
    },

    date: {
      type: Date,
      default: null,
    },

    days: {
      type: [String],
      default: [],
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model("Class", classSchema);

export default Class;