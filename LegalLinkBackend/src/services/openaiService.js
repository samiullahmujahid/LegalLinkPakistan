// ==========================================
// IMPORTS & OPENAI CLIENT INIT
// ==========================================
const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure process.env contains this exact key name
});

// ==========================================
// 1. TEXT CHAT COMPLETION SERVICE
// ==========================================
/**
 * Generate response using OpenAI
 * @param {string} prompt - User prompt/query
 * @returns {Promise<string>} - AI response message
 */
const generateOpenAIResponse = async (prompt) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in environment variables.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and accurate model for legal responses
      messages: [
        { 
          role: "system", 
          content: "You are a helpful Pakistani legal assistant. Provide concise and accurate legal information relevant to Pakistani law." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7, // Set temperature for creativity and natural tone
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Service Error:", error.message);
    // Detailed error message for frontend or logs
    throw new Error("Failed to communicate with AI model.");
  }
};

// ==========================================
// 2. VISION DOCUMENT ANALYSIS SERVICE
// ==========================================
/**
 * AI image/document vision analysis function
 * @param {string} prompt - User request / query
 * @param {string} base64Image - Base64 encoded string of document image
 * @returns {Promise<string>} - AI analysis reply
 */
const generateOpenAIVisionResponse = async (prompt, base64Image) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in environment variables.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful Pakistani legal assistant. Analyze the uploaded document picture carefully and provide legal guidance relevant to Pakistani law." 
        },
        { 
          role: "user", 
          content: [
            { type: "text", text: prompt || "Analyze this legal document or contract image." },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}` 
              } 
            }
          ]
        }
      ],
      max_tokens: 1200,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Vision Service Error:", error.message);
    throw new Error("Failed to analyze document image.");
  }
};

// ==========================================
// 3. DALL-E IMAGE GENERATION SERVICE
// ==========================================
/**
 * DALL-E Image Generation function
 * @param {string} prompt - Prompt describing the image
 * @returns {Promise<string>} - Temporary URL of generated image
 */
const generateOpenAIImage = async (prompt) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in environment variables.");
    }

    const response = await openai.images.generate({
      model: "dall-e-2", // Fast and cost-efficient
      prompt: `${prompt}, high quality professional legal vector illustration style`,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url;
  } catch (error) {
    console.error("OpenAI Image Service Error:", error.message);
    throw new Error("Failed to generate image.");
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = { 
  generateOpenAIResponse,
  generateOpenAIVisionResponse,
  generateOpenAIImage
};