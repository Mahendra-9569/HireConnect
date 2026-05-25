import mongoose from "mongoose";
import axios from "axios";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import getBuffer from "../utils/buffer.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const myProfile = TryCatch(async (req, res) => {
  res.json(req.user);
});

export const getUserProfile = TryCatch(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).lean();
  if (!user) throw new ErrorHandler(404, "User not found");
  user._id = user._id.toString();
  user.user_id = user._id;
  res.json(user);
});

export const updateUserProfile = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  const { name, phoneNumber, bio } = req.body;
  const updated = await User.findByIdAndUpdate(user.user_id, {
    $set: { name: name || user.name, phone_number: phoneNumber || user.phone_number, bio: bio ?? user.bio }
  }, { new: true }).lean();
  updated._id = updated._id.toString();
  updated.user_id = updated._id;
  res.json({ message: "Profile Updated successfully", updatedUser: updated });
});

export const updateProfilePic = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  const file = req.file;
  if (!file) throw new ErrorHandler(400, "No image file provided");
  const fileBuffer = getBuffer(file);
  const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, { buffer: fileBuffer, public_id: user.profile_pic_public_id });
  const updated = await User.findByIdAndUpdate(user.user_id, { $set: { profile_pic: uploadResult.url, profile_pic_public_id: uploadResult.public_id } }, { new: true }).lean();
  updated._id = updated._id.toString();
  updated.user_id = updated._id;
  res.json({ message: "profile pic updated", updatedUser: updated });
});

export const updateResume = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  const file = req.file;
  if (!file) throw new ErrorHandler(400, "No pdf file provided");
  const fileBuffer = getBuffer(file);
  const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, { buffer: fileBuffer, public_id: user.resume_public_id });
  const updated = await User.findByIdAndUpdate(user.user_id, { $set: { resume: uploadResult.url, resume_public_id: uploadResult.public_id } }, { new: true }).lean();
  updated._id = updated._id.toString();
  updated.user_id = updated._id;
  res.json({ message: "Resume updated", updatedUser: updated });
});

export const addSkillToUser = TryCatch(async (req, res) => {
  const userId = req.user?.user_id;
  const { skillName } = req.body;
  if (!skillName || skillName.trim() === "") throw new ErrorHandler(400, "Please provide a skill name");
  const user = await User.findById(userId);
  if (!user) throw new ErrorHandler(404, "User not found.");
  if (user.skills.includes(skillName.trim())) {
    return res.status(200).json({ message: "User already possesses this skill" });
  }
  user.skills.push(skillName.trim());
  await user.save();
  res.json({ message: `Skill ${skillName.trim()} is added successfully` });
});

export const deleteSkillFromUser = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication Required");
  const { skillName } = req.body;
  if (!skillName || skillName.trim() === "") throw new ErrorHandler(400, "Please provide a skill name");
  const dbUser = await User.findById(user.user_id);
  if (!dbUser) throw new ErrorHandler(404, "User not found");
  if (!dbUser.skills.includes(skillName.trim())) throw new ErrorHandler(404, `Skill ${skillName.trim()} was not found`);
  dbUser.skills = dbUser.skills.filter((s) => s !== skillName.trim());
  await dbUser.save();
  res.json({ message: `Skill ${skillName.trim()} was deleted successfully` });
});

export const applyForJob = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  if (user.role !== "jobseeker") throw new ErrorHandler(403, "Forbidden you are not allowed for this api");
  if (!user.resume) throw new ErrorHandler(400, "You need to add resume in your profile to apply for this job");
  const { job_id } = req.body;
  if (!job_id) throw new ErrorHandler(400, "job id is required");
  const job = await Job.findById(job_id).lean();
  if (!job) throw new ErrorHandler(404, "No jobs with this id");
  if (!job.is_active) throw new ErrorHandler(400, "Job is not active");
  const isSubscribed = user.subscription ? new Date(user.subscription).getTime() > Date.now() : false;
  try {
    const application = await Application.create({ job_id, applicant_id: user.user_id, applicant_email: user.email, resume: user.resume, subscribed: isSubscribed });
    res.json({ message: "Applied for job successfully", application });
  } catch (error) {
    if (error?.code === 11000) throw new ErrorHandler(409, "you have already applied to this job.");
    throw error;
  }
});

export const getAllaplications = TryCatch(async (req, res) => {
  const userId = req.user?.user_id;
  const applications = await Application.aggregate([
    { $match: { applicant_id: new mongoose.Types.ObjectId(userId) } },
    { $lookup: { from: "jobs", localField: "job_id", foreignField: "_id", as: "job" } },
    { $unwind: "$job" },
    { $sort: { subscribed: -1, applied_at: 1 } },
    { $project: { applicant_email: 1, status: 1, resume: 1, applied_at: 1, subscribed: 1, job_title: "$job.title", job_salary: "$job.salary", job_location: "$job.location", job_id: 1, applicant_id: 1 } }
  ]);
  res.json(applications.map((app) => ({ ...app, _id: app._id.toString(), application_id: app._id.toString(), job_id: app.job_id?.toString?.() || app.job_id, applicant_id: app.applicant_id?.toString?.() || app.applicant_id })));
});
