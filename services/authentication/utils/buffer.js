export const getBuffer = (file) => {
  if (!file) return null;
  const mime = file.mimetype || "application/octet-stream";
  const base64 = file.buffer.toString("base64");
  return `data:${mime};base64,${base64}`;
};

export default getBuffer;
