export const serializeCompany = (company) => {
  if (!company) return null;
  const obj = typeof company.toObject === "function" ? company.toObject({ versionKey: false }) : { ...company };
  obj._id = obj._id?.toString?.() || obj._id;
  obj.company_id = obj._id;
  obj.recruiter_id = obj.recruiter_id?.toString?.() || obj.recruiter_id;
  return obj;
};
export const serializeJob = (job) => {
  if (!job) return null;
  const obj = typeof job.toObject === "function" ? job.toObject({ versionKey: false }) : { ...job };
  obj._id = obj._id?.toString?.() || obj._id;
  obj.job_id = obj._id;
  obj.company_id = obj.company_id?.toString?.() || obj.company_id;
  obj.posted_by_recuriter_id = obj.posted_by_recuriter_id?.toString?.() || obj.posted_by_recuriter_id;
  return obj;
};
export const serializeApplication = (app) => {
  if (!app) return null;
  const obj = typeof app.toObject === "function" ? app.toObject({ versionKey: false }) : { ...app };
  obj._id = obj._id?.toString?.() || obj._id;
  obj.application_id = obj._id;
  obj.job_id = obj.job_id?.toString?.() || obj.job_id;
  obj.applicant_id = obj.applicant_id?.toString?.() || obj.applicant_id;
  return obj;
};
