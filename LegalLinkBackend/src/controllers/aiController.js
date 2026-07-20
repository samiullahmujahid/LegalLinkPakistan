// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
const { 
  generateOpenAIResponse,
  generateOpenAIVisionResponse,
  generateOpenAIImage
} = require('../services/openaiService'); 
const AiChat = require('../models/AiChat');
const Lawyer = require('../models/Lawyer');

// ==========================================
// 1. LEGAL AI CONSULTANT (TEXT & VISION)
// ==========================================
exports.askLegalAI = async (req, res) => {
  try {
    const { message, image } = req.body; // 'image' should contain base64 string
    const userId = req.user?.id; 

    if (!message && !image) {
      return res.status(400).json({ success: false, message: 'Message or document image is required' });
    }

    let aiReply;
    if (image) {
      // Trigger Vision Analysis (GPT-4o-mini)
      aiReply = await generateOpenAIVisionResponse(message, image);
    } else {
      // Standard Text Response (GPT-4o-mini)
      aiReply = await generateOpenAIResponse(message);
    }

    // Process Lawyer Recommendations dynamically
    let recommendedLawyers = [];
    if (message && !image) {
      const cleanMsg = message.toLowerCase();
      const queryKeywords = ["lawyer", "lawyers", "advocate", "recommend", "best", "top", "gavel", "attorney", "specialist"];
      const isSearchingLawyers = queryKeywords.some(kw => cleanMsg.includes(kw));

      if (isSearchingLawyers) {
        let matchQuery = {};
        const specializations = [
          { key: "criminal", term: "Criminal" },
          { key: "civil", term: "Civil" },
          { key: "family", term: "Family" },
          { key: "corporate", term: "Corporate" },
          { key: "intellectual", term: "Intellectual" },
          { key: "property", term: "Property" }
        ];
        
        const matchedTerms = specializations.filter(sp => cleanMsg.includes(sp.key)).map(sp => sp.term);
        
        if (matchedTerms.length > 0) {
          matchQuery.areasOfPractice = { $in: matchedTerms.map(term => new RegExp(term, 'i')) };
        }
        
        const rawLawyers = await Lawyer.find(matchQuery)
          .sort({ averageRating: -1, totalReviews: -1 })
          .limit(3);

        recommendedLawyers = rawLawyers.map(l => ({
          _id: l._id,
          name: l.name,
          averageRating: l.averageRating || 5.0,
          totalReviews: l.totalReviews || 0,
          expertise: l.areasOfPractice ? (Array.isArray(l.areasOfPractice) ? l.areasOfPractice.join(', ') : l.areasOfPractice) : "Legal Consultant",
          city: l.address?.city || l.city || "Pakistan",
          profilePicUri: l.profilePicUri || ""
        }));
      }
    }

    // Save history logs
    if (userId) {
      await AiChat.create({ 
        userId, 
        message: message || "[Document Image Analysis Request]", 
        reply: aiReply,
        timestamp: new Date()
      });
    }

    return res.status(200).json({ 
      success: true, 
      reply: aiReply,
      recommendedLawyers
    });

  } catch (error) {
    console.error('OpenAI Controller Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch response from AI assistant' 
    });
  }
};

// ==========================================
// 2. DALL-E IMAGE GENERATION
// ==========================================
exports.generateImageAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required for generating an image' });
    }

    console.log(`🎨 Triggering DALL-E Image Generation for Prompt: "${prompt}"`);
    const imageUrl = await generateOpenAIImage(prompt);

    if (userId) {
      await AiChat.create({
        userId,
        message: `[Image Generation Prompt]: ${prompt}`,
        reply: `Generated Image: ${imageUrl}`,
        timestamp: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('DALL-E Image Generation Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate illustration from DALL-E'
    });
  }
};