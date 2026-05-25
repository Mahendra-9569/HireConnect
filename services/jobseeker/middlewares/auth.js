import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blacklist from "../models/BlackList.js";
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Authorization header is missing or invalid" });
    const token = authHeader.split(" ")[1];
    const blacklisted = await Blacklist.findOne({ token }).lean();
    if (blacklisted) return res.status(401).json({ message: "Session expired. Please login again." });

    const decoded = jwt.verify(token, process.env.JWT_SEC);
    if (!decoded?.id) return res.status(401).json({ message: "Invalid Token" });
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ message: "User associated with this token no longer exists." });
    user._id = user._id.toString();
    user.user_id = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Authentication Failed. Please login again" });
  }
};
