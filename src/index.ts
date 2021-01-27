import * as dotenv from "dotenv";
import { AppLogger } from "./models/Logger";
import { connectToDB } from "./db/mongoose";
import { ServerApp } from "./server";

dotenv.config();

if (!process.env.MONGO_URI || !process.env.JWT_KEY) {
  throw new Error("MONGO_URI and JWT_KEY must be provided");
}

const run = async () => {
  await connectToDB();
  AppLogger.getLogger().info(`Connected to mongodb successfuly!!!`);
  const port = parseInt(process.env.PORT!) || 4000;
  new ServerApp().start(port);
};

run().catch((err) => {
  AppLogger.getLogger().err(err.message);
  process.exit(0);
});
