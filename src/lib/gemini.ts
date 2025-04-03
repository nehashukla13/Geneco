import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result?.toString().split(",")[1]; // Remove 'data:image/...;base64,' prefix
      resolve(base64data || "");
    };
  });
}

export async function classifyWasteImage(imageUrl: string): Promise<{
  classification: string;
  confidence: number;
  recommendations: string[];
}> {
  try {
    const base64Image = await fetchImageAsBase64(imageUrl);
    if (!base64Image) {
      throw new Error("Failed to convert image to Base64");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this image and classify the waste shown. Provide:
1. The main category (one of: Recyclable, Hazardous, Organic, Non-Recyclable, Industrial)
2. Confidence score (0-1)
3. Three specific recommendations for handling or recycling this waste
Format the response exactly as follows (including the ---):
Category: [category]
Confidence: [score]
---
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the response
    const [header, recommendations] = text.split("---").map((part) => part.trim());
    const category = header.match(/Category: (.+)/)?.[1] || "Unknown";
    const confidence = parseFloat(header.match(/Confidence: (.+)/)?.[1] || "0");
    const recommendationList = recommendations
      .split("\n")
      .map((r) => r.replace(/^- /, "").trim())
      .filter(Boolean);

    return {
      classification: category,
      confidence,
      recommendations: recommendationList,
    };
  } catch (error) {
    console.error("Error classifying waste image:", error);
    throw new Error("Failed to classify waste image");
  }
}
