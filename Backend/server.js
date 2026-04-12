import dotenv from "dotenv";
dotenv.config();

import app from "./src/app/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 JSS Connect server running on http://localhost:${PORT}`);
  });
};

startServer();
