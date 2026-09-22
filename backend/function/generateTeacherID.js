import User from "../database/userSchema.js";

async function teacherID(name) {
  const namePart = name
    .replace(/\s+/g, "")
    .substring(0, 5)
    .toUpperCase();

  let teacherId;

  do {
    const random = Math.floor(10000 + Math.random() * 90000);

    teacherId = `${namePart}${random}`;

    const IDExist = await User.findOne({ id: teacherId });

    if (!IDExist) {
      return teacherId;
    }
  } while (true);
}

export default teacherID;
