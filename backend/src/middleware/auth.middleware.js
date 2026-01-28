import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.status(401).json({ message: "User not found" });
    
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email first.", code: "EMAIL_NOT_VERIFIED" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
