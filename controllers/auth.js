import bcrypt from "bcrypt";
import User from "../models/user.js";

export async function registerStudent(req, res) {
  try {
    const {password, email, firstName, lastName} = req.body;

    // Check if the user already exists
    const user= await User.findOne({email});
    if(user){
        return res.status(400).json({message: "User already exists"});
    }

    const newUser = new User({
        email,
        password: bcrypt.hashSync(password, 10),
        firstName,
        lastName,
        role: "student"
    });

    await newUser.save();
    res.status(201).json({message: "User created successfully"});

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error}" }); 
  }

}

export async function login(req, res) {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message: "User does not exist"});
    }
    if(!bcrypt.compareSync(password, user.password)){
        return res.status(400).json({message: "Invalid credentials"});
    }
    res.status(200).json({message: "Login successful"});
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error}" }); 
  }
}