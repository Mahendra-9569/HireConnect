import axios from "axios";
import cloudinaryModule from "cloudinary";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import getBuffer from "../utils/buffer.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
import { serializeCompany, serializeJob } from "../utils/serialize.js";

const cloudinary = cloudinaryModule.v2;
cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.API_KEY, api_secret: process.env.API_SECRET });

export const createCompany = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  if (user.role !== "recruiter") throw new ErrorHandler(403, "Forbidden: Only recruiter can create a company");
  const { name, description, website } = req.body;
  if (!name || !description || !website) throw new ErrorHandler(400, "All the fields required");
  const existing = await Company.findOne({ name });
  if (existing) throw new ErrorHandler(409, `A company with the name ${name} already exists`);
  const file = req.file;
  if (!file) throw new ErrorHandler(400, "Company Logo file is required");
  const fileBuffer = getBuffer(file);
  const { data } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, { buffer: fileBuffer });
  const company = await Company.create({ name, description, website, logo: data.url, logo_public_id: data.public_id, recruiter_id: user.user_id });
  res.json({ message: "Company created successfully", company: serializeCompany(company) });
});

export const deleteCompany = TryCatch(async (req, res) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await Company.findOne({ _id: companyId, recruiter_id: user?.user_id });
  if (!company) throw new ErrorHandler(404, "Company not found or you're not authorized to delete it.");
  if (company.logo_public_id) { try { await cloudinary.uploader.destroy(company.logo_public_id); } catch {} }
  const jobs = await Job.find({ company_id: company._id }).select("_id");
  const jobIds = jobs.map(j => j._id);
  await Application.deleteMany({ job_id: { $in: jobIds } });
  await Job.deleteMany({ company_id: company._id });
  await Company.deleteOne({ _id: company._id });
  res.json({ message: "Company and all associated jobs have been deleted" });
});

export const createJob = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  if (user.role !== "recruiter") throw new ErrorHandler(403, "Forbidden: Only recruiter can create a company");
  const { title, description, salary, location, role, job_type, work_location, company_id, openings } = req.body;
  if (!title || !description || !salary || !location || !role || !openings || !job_type || !work_location || !company_id) throw new ErrorHandler(400, "All the fields required");
  const company = await Company.findOne({ _id: company_id, recruiter_id: user.user_id });
  if (!company) throw new ErrorHandler(404, "Company not found");
  const job = await Job.create({ title, description, salary, location, role, job_type, work_location, company_id: company._id, posted_by_recuriter_id: user.user_id, openings });
  res.json({ message: "Job posted successfully", job: serializeJob(job) });
});

export const updateJob = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  if (user.role !== "recruiter") throw new ErrorHandler(403, "Forbidden: Only recruiter can create a company");
  const existingJob = await Job.findById(req.params.jobId);
  if (!existingJob) throw new ErrorHandler(404, "Job not found");
  if (existingJob.posted_by_recuriter_id.toString() !== user.user_id) throw new ErrorHandler(403, "Forbiden: You are not allowed");
  const { title, description, salary, location, role, job_type, work_location, openings, is_active } = req.body;
  Object.assign(existingJob, { title, description, salary, location, role, job_type, work_location, openings, is_active });
  await existingJob.save();
  res.json({ message: "Job updated successfully", job: serializeJob(existingJob) });
});

export const getAllCompany = TryCatch(async (req, res) => {
  const companies = await Company.find({ recruiter_id: req.user?.user_id }).lean();
  res.json(companies.map((c) => ({ ...c, _id: c._id.toString(), company_id: c._id.toString(), recruiter_id: c.recruiter_id.toString() })));
});

export const getCompanyDetails = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ErrorHandler(400, "Company id is required");
  const company = await Company.findById(id).lean();
  if (!company) throw new ErrorHandler(404, "Company not found");
  const jobs = await Job.find({ company_id: id }).lean();
  res.json({ ...serializeCompany(company), jobs: jobs.map(serializeJob) });
});

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location } = req.query;
  const filter = { is_active: true };
  if (title) filter.title = { $regex: String(title), $options: "i" };
  if (location) filter.location = { $regex: String(location), $options: "i" };
  const jobs = await Job.find(filter).sort({ created_at: -1 }).lean();
  const companyIds = [...new Set(jobs.map(j => String(j.company_id)))];
  const companies = await Company.find({ _id: { $in: companyIds } }).lean();
  const map = new Map(companies.map(c => [String(c._id), c]));
  res.json(jobs.map((j) => {
    const company = map.get(String(j.company_id));
    return { ...serializeJob(j), company_name: company?.name || null, company_logo: company?.logo || null };
  }));
});

export const getSingleJob = TryCatch(async (req, res) => {
  const job = await Job.findById(req.params.jobId).lean();
  res.json(job ? serializeJob(job) : null);
});

export const getAllApplicationForJob = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  if (user.role !== "recruiter") throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
  const jobId = req.params.jobId;
  const job = await Job.findById(jobId).lean();
  if (!job) throw new ErrorHandler(404, "job not found");
  if (String(job.posted_by_recuriter_id) !== user.user_id) throw new ErrorHandler(403, "Forbidden you are not allowed");
  const applications = await Application.find({ job_id: jobId }).sort({ subscribed: -1, applied_at: 1 }).lean();
  res.json(applications.map((a) => ({ ...a, _id: a._id.toString(), application_id: a._id.toString(), job_id: a.job_id.toString(), applicant_id: a.applicant_id.toString() })));
});

export const updateApplication = TryCatch(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication required");
  if (user.role !== "recruiter") throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
  const application = await Application.findById(req.params.id).lean();
  if (!application) throw new ErrorHandler(404, "Application not found");
  const job = await Job.findById(application.job_id).lean();
  if (!job) throw new ErrorHandler(404, "no job with this id");
  if (String(job.posted_by_recuriter_id) !== user.user_id) throw new ErrorHandler(403, "Forbidden you are not allowed");
  const updatedApplication = await Application.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true }).lean();
  publishToTopic("send-mail", { to: application.applicant_email, subject: "Application Update - Job portal", html: applicationStatusUpdateTemplate(job.title) }).catch((error) => console.error("Failed to publish message to kafka", error));
  res.json({ message: "Application updated", job: serializeJob(job), updatedApplication: { ...updatedApplication, _id: updatedApplication._id.toString(), application_id: updatedApplication._id.toString() } });
});
