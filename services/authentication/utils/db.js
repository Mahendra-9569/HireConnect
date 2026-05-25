import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try{
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connected to mongodb");
  }catch(err){
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};
