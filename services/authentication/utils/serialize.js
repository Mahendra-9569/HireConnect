export const serializeUser = (user, includePassword = false) => {
  if (!user) return null;
  const obj = typeof user.toObject === "function" ? user.toObject({ versionKey: false }) : { ...user };
  const id = obj._id?.toString?.() || obj._id;
  obj._id = id;
  obj.user_id = id;
  if (!includePassword) delete obj.password;
  return obj;
};
