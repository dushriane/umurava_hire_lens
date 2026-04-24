import dotenv from "dotenv";

dotenv.config();

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/hire_lens",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || process.env.API_KEY || "dev-secret",
    apiKey: process.env.API_KEY,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
};

export default config;
