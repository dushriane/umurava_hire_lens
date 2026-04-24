import dotenv from "dotenv";

dotenv.config();

interface Config {
  mongodb: {
    uri: string;
  };
  gemini: {
    apiKey: string | undefined;
    model: string;
  };
  auth: {
    jwtSecret: string;
    apiKey: string | undefined;
  };
  server: {
    port: number;
    nodeEnv: "development" | "production" | "test";
  };
}

function validateConfig(): void {
  const missingVars: string[] = [];

  if (!process.env.GEMINI_API_KEY) {
    missingVars.push("GEMINI_API_KEY");
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET && !process.env.API_KEY) {
      missingVars.push("JWT_SECRET or API_KEY (required in production)");
    }
    if (!process.env.MONGODB_URI) {
      missingVars.push("MONGODB_URI (required in production)");
    }
  }

  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(", ")}`);
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing critical env vars: ${missingVars.join(", ")}`);
    }
  }
}

function parsePort(portStr: string | undefined): number {
  if (!portStr) return 3000;
  const parsed = parseInt(portStr, 10);
  if (isNaN(parsed)) {
    console.warn(`⚠️  Invalid PORT "${portStr}", using 3000`);
    return 3000;
  }
  return parsed;
}

export const config: Config = {
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/hire_lens",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || process.env.API_KEY || "",
    apiKey: process.env.API_KEY,
  },
  server: {
    port: parsePort(process.env.PORT),
    nodeEnv: (process.env.NODE_ENV as "development" | "production" | "test")|| "development",
  },
};

validateConfig();

export default config;
