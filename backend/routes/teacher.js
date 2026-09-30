import express from "express";
import User from "../database/userSchema.js";
import Class from "../database/classSchema.js";
import teacherID from "../function/generateTeacherID.js";

const routes = express.Router();

routes.post("/register",async (req,res)=>{
	try{ 
	 const data = req.body
		const userExist = await User.findOne({email : data.email})
		if(userExist)
			 return res.status(500).json({message:"Email already registered."})
	
		const id = await teacherID(data.name);
		const user = new User({
      ...data,
      id,
    });
			await user.save()
			res.status(200).json({message : "Account created successfully."
})
		}catch(error)
		{
			console.log(error)
			res.status(300).json({message : "Something went wrong"})
		}
	})


routes.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
    const userFound = await User.findOne({ id });
    if (!userFound) 
      return res.status(404).json({
        message: "Account Not Found",
      });
    if (userFound.password !== password) {
      return res.status(401).json({
        message: "Wrong Password",
      });
    }
    return res.status(200).json({
      message: "Login Successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

routes.post("/teacher/addclass", async (req, res) => {
  try {
    
    const classData = req.body;
        console.log(classData)

    const existingClass = await Class.findOne({ subjectCode: classData.subjectCode });
    console.log(existingClass);
    
    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "Subject code already exists",
      });
    }


    const newClass = new Class(classData);

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



export default routes;

