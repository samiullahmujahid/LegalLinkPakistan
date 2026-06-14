const { 
  generateOpenAIResponse,
  generateOpenAIVisionResponse,
  generateOpenAIImage
} = require('../services/openaiService'); 
const AiChat = require('../models/AiChat');

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
      reply: aiReply 
    });

  } catch (error) {
    console.error('OpenAI Controller Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch response from AI assistant' 
    });
  }
};

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