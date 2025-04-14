import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";

export async function registerStudent(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Make a request to Payload CMS's registration endpoint
    const response = await axios.post(`${process.env.PAYLOAD_CMS_URL}/api/users`, {
      email,
      password,
      firstName,
      lastName,
    });

    // Check if Payload CMS returned a success response
    if (response.data) {
      res.status(201).json({
        message: "User registered successfully",
        data: response.data,
      });
    } else {
      res.status(400).json({ message: "Failed to register user" });
    }
  } catch (error) {
    console.error("Error registering user:", error);

    if (error.response && error.response.data) {
      // If Payload CMS returned an error message, use it
      res.status(400).json({ error: error.response.data.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    let response 
    // Make a request to Payload CMS's login endpoint
    response = await axios.post(`${process.env.PAYLOAD_CMS_URL}/api/users/login`, {
      email,
      password,
    });

    // Check if Payload CMS returned a token
    if (response.data.token) {
      // Generate your own JWT token after successful Payload authentication (optional)
      const token = jwt.sign(
        { id: response.data.user._id, role: response.data.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { id: response.data.user._id, role: response.data.user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      // Send the token and refreshToken back to the client
      res.status(200).json({
        token:response.data.token,
        refreshToken,
        role: response.data.user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
