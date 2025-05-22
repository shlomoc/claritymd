import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { MedicalTerm, Source } from '../types';

// Initialize GoogleGenAI directly with process.env.API_KEY as per guidelines.
// The API key's availability is assumed to be handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  // Remove trailing commas from objects and arrays
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Raw text:", text);
    return null;
  }
};

export async function reformatDocumentText(text: string): Promise<string> {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable is not set. Cannot reformat text.");
  try {
    const prompt = `Reformat the following medical text to improve its readability. Focus on adding appropriate paragraph breaks, list formatting if applicable, and improving overall structure.
DO NOT change any of the original wording, medical terms, or meaning. Return only the reformatted text.

Original Text:
---
${text}
---

Reformatted Text:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2, // Lower temperature for more deterministic formatting
        topP: 0.9,
        topK: 40,
      }
    });
    return response.text ?? text; // Fallback to original text if API returns undefined
  } catch (error) {
    console.error("Error reformatting text:", error);
    // Fallback to original text if reformatting fails
    // This ensures the app can still display the original text even if this specific LLM call fails.
    // The caller in App.tsx also has a fallback.
    // throw new Error(`Text reformatting failed: ${(error as Error).message}`);
    return text; // Return original text as a fallback to prevent breaking the flow
  }
}


export async function translateText(text: string): Promise<string> {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable is not set. Cannot perform translation.");
  try {
    const prompt = `Translate the following medical text into plain, easy-to-understand language for a layperson. Aim for clarity and simplicity, avoiding jargon where possible or explaining it if essential.

Medical Text:
---
${text}
---

Plain Language Translation:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        topP: 0.9,
        topK: 40,
      }
    });
    return response.text ?? ""; // Return empty string if API returns undefined
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error(`Translation failed: ${(error as Error).message}`);
  }
}

export async function generateGlossary(text: string): Promise<MedicalTerm[]> {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable is not set. Cannot generate glossary.");
  try {
    const prompt = `Analyze the following medical text. Identify key medical terms that a non-medical person would likely find confusing. For each term, provide a concise, easy-to-understand definition. Return the result as a JSON array of objects, where each object has a "term" (string) and "definition" (string) field. If no specific medical terms requiring explanation are found, return an empty array.

Medical Text:
---
${text}
---
`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });
    
    const glossaryText = response.text ?? ""; // Default to empty string if undefined
    const parsedGlossary = parseJsonFromText<MedicalTerm[]>(glossaryText);
    if (parsedGlossary === null) {
        // If parsing fails but there's text, it might not be valid JSON.
        // If response.text is empty or just whitespace, it might indicate no terms.
        if (glossaryText.trim() === "" || glossaryText.trim() === "[]") {
          return []; // Valid empty response
        }
        throw new Error("AI returned glossary in an unexpected format. Could not parse JSON.");
    }
    if (!Array.isArray(parsedGlossary)) {
        console.warn("Parsed glossary is not an array:", parsedGlossary);
        throw new Error("AI returned glossary data that is not an array.");
    }
    // Allow empty array, otherwise validate structure
    if (parsedGlossary.length > 0 && !parsedGlossary.every(item => typeof item.term === 'string' && typeof item.definition === 'string')) {
        console.warn("Parsed glossary has items with invalid structure:", parsedGlossary);
        throw new Error("AI returned glossary data with invalid item structure.");
    }
    return parsedGlossary;

  } catch (error) {
    console.error("Error generating glossary:", error);
    throw new Error(`Glossary generation failed: ${(error as Error).message}`);
  }
}

export async function getAnswer(
  question: string,
  documentText: string
): Promise<{ text: string; sources?: Source[] }> {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable is not set. Cannot get answer.");

  const systemInstruction = `You are ClarityMD, an AI assistant designed to help users understand medical information.
You have access to the following medical document provided by the user:
--- START OF DOCUMENT ---
${documentText}
--- END OF DOCUMENT ---

Your tasks are:
1.  Answer the user's question: "${question}".
2.  Prioritize Information: Base your answer *primarily* on the content of the provided medical document.
3.  Use General Knowledge/Search: If the document does not contain the answer, or only partially answers it, use your general medical knowledge and the integrated Google Search tool to provide a comprehensive and accurate response.
4.  Explain Medical Terms: Regardless of the information source (document or general knowledge/search), if you use any medical terms, conditions, or procedures, briefly explain them in simple, easy-to-understand language. Your goal is to make the information accessible to someone without a medical background.
5.  Cite Sources: If Google Search is used to find information, you MUST cite your sources clearly by listing the web pages used. Provide the title and URI for each source. If no search is used, do not invent sources.`;
  
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: question, // User's question is the primary content
      config: { 
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Always enable Google Search
        temperature: 0.6 // Balanced temperature for informative and accurate responses
      }
    });

    const answerText = response.text ?? ""; // Default to empty string if undefined
    let sources: Source[] | undefined = undefined;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    if (groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
      sources = groundingMetadata.groundingChunks
        .map((chunk: GroundingChunk) => chunk.web)
        .flatMap((web): Source[] => {
          if (web && typeof web.uri === 'string' && typeof web.title === 'string') {
            return [{ uri: web.uri, title: web.title }];
          }
          return [];
        });
    }

    return { text: answerText, sources };

  } catch (error) {
    console.error("Error getting answer:", error);
    // It's important to check the type of error and handle specific API errors if necessary
    // For now, rethrow a generic error message
    throw new Error(`Q&A process failed: ${(error as Error).message}`);
  }
}
