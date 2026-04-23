import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function listModels() {
  try {
    console.log("🔍 Checking available Gemini models for your API key...");
    const commonModels = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
      "gemini-pro",
    ];

    for (const modelName of commonModels) {
      try {
        const m = genAI.getGenerativeModel({ model: modelName });
        await m.generateContent("test");
        console.log(`✅ [AVAILABLE] ${modelName}`);
      } catch (e: any) {
        console.log(`❌ [UNAVAILABLE] ${modelName} (Error: ${e.status || e.message})`);
      }
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
