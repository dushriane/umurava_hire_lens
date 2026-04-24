import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

function validateEnv(): void {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not set in .env");
    process.exit(1);
  }
}

async function listModels(): Promise<void> {
  validateEnv();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const currentModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const modelsToCheck = [
    "gemini-2.0-flash",        
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-pro",
  ];

  console.log(`\n🔍 Checking available Gemini models (current: ${currentModel})\n`);

  let available = 0;
  let unavailable = 0;

  for (const modelName of modelsToCheck) {
    try {
      const m = genAI.getGenerativeModel({ model: modelName });
      await m.generateContent("test");
      console.log(`✅ [AVAILABLE] ${modelName}${modelName === currentModel ? " ← Currently configured" : ""}`);
      available++;
    } catch (e: any) {
      const reason = e.status || e.message || "Unknown error";
      console.log(`❌ [UNAVAILABLE] ${modelName} (${reason})`);
      unavailable++;
    }
  }

  console.log(`\n📊 Summary: ${available} available, ${unavailable} unavailable`);
  
  if (!modelsToCheck.includes(currentModel)) {
    console.log(`\n⚠️  Your GEMINI_MODEL="${currentModel}" is not in the test list.`);
  }
}

listModels().catch((err) => {
  console.error("\n❌ Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});