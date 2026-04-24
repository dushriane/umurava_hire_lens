import mongoose from "mongoose";
import logger from "../utils/logger";
import config from "./index";

let isConnected: boolean = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info("Database already connected");
    return;
  }

  try {
    const mongoURI = config.mongodb.uri;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    logger.info("Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoURI);

    isConnected = true;
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to connect to MongoDB: ${message}`);
    throw error; // Let caller (app.ts) handle exit
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      logger.info("✅ MongoDB disconnected");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error disconnecting MongoDB: ${message}`);
    throw error;
  }
};

export const getConnectionStatus = (): boolean => isConnected;