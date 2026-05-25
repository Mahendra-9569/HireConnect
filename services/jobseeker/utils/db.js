import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  console.log("connected to mongodb");
  return mongoose.connection;
};
