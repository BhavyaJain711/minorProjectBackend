import crypto from "crypto";
import jwt from "jsonwebtoken";

export const verifyTeacherToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    let token = req.header("Authorization");
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    // Remove "Bearer " prefix if it exists
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    // Hash the secret and truncate to 32 characters
    const hashedSecret = crypto
      .createHash("sha256")
      .update(process.env.PAYLOAD_SECRET)
      .digest("hex")
      .slice(0, 32);

    // Verify the JWT token with the hashed secret
    const decoded = jwt.verify(token, hashedSecret, { algorithms: ["HS256"] });

    // Check if the user role is teacher
    if (decoded.role !== "teacher") {
      return res.status(403).json({ message: "Access restricted to teachers only" });
    }

    // Attach user information to the request
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
