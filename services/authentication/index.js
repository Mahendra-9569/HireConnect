import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./utils/db.js";

dotenv.config();

const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Auth service running on http://localhost:${port}`));
};

start().catch((error) => {
  console.error("Auth service failed to start", error);
  process.exit(1);
});
