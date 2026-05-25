import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./utils/db.js";
import { connectKafka } from "./producer.js";

dotenv.config();
const start = async () => {
  await connectDB();
  await connectKafka();
  const port = process.env.PORT || 5003;
  app.listen(port, () => console.log(`Job service is running on http://localhost:${port}`));
};
start().catch((error) => { console.error("Job service failed to start", error); process.exit(1); });
