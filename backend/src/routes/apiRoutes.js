const express = require('express');
const { generateAudioFromText, cleanupFile, getVoiceOptions } = require('../services/openaiService');
const { getBotInfo } = require('../services/telegramService');

const router = express.Router();

/**
 * POST /api/generate-audio
 * Generate audio from text using OpenAI TTS
 */
router.post('/generate-audio', async (req, res) => {
  try {
    const { text, voice = 'alloy', speed = 0.8 } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({ 
        error: 'Text is required',
        code: 'MISSING_TEXT'
      });
    }
    
    if (text.length > 4096) {
      return res.status(400).json({ 
        error: 'Text too long (max 4096 characters)',
        code: 'TEXT_TOO_LONG',
        maxLength: 4096,
        currentLength: text.length
      });
    }
    
    // Generate audio
    const audioPath = await generateAudioFromText(text, voice, speed);
    
    // Send the audio file
    res.sendFile(audioPath, (err) => {
      if (err) {
        console.error('❌ Error sending audio file:', err.message);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Failed to send audio file',
            code: 'SEND_FILE_ERROR'
          });
        }
      } else {
        console.log('✅ Audio file sent successfully');
        // Clean up after sending
        setTimeout(() => {
          cleanupFile(audioPath);
        }, 5000);
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /api/generate-audio:', error.message);
    
    // Handle different types of errors
    if (error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'OpenAI API key is invalid or missing',
        code: 'INVALID_API_KEY'
      });
    }
    
    if (error.message.includes('quota')) {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded',
        code: 'QUOTA_EXCEEDED'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate audio',
      code: 'GENERATION_ERROR',
      message: error.message
    });
  }
});

/**
 * GET /api/voices
 * Get available voice options
 */
router.get('/voices', (req, res) => {
  try {
    const voices = getVoiceOptions();
    res.json({
      success: true,
      voices,
      count: voices.length
    });
  } catch (error) {
    console.error('❌ Error getting voices:', error.message);
    res.status(500).json({ 
      error: 'Failed to get voice options',
      code: 'VOICES_ERROR'
    });
  }
});

/**
 * GET /api/bot-info
 * Get Telegram bot information
 */
router.get('/bot-info', async (req, res) => {
  try {
    const botInfo = await getBotInfo();
    
    if (!botInfo) {
      return res.status(500).json({ 
        error: 'Failed to get bot information',
        code: 'BOT_INFO_ERROR'
      });
    }
    
    res.json({
      success: true,
      bot: botInfo
    });
  } catch (error) {
    console.error('❌ Error getting bot info:', error.message);
    res.status(500).json({ 
      error: 'Failed to get bot information',
      code: 'BOT_INFO_ERROR'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    env: process.env.NODE_ENV || 'development'
  });
});

/**
 * POST /api/validate-text
 * Validate text for TTS conversion
 */
router.post('/validate-text', (req, res) => {
  try {
    const { text } = req.body;
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Check if text exists
    if (!text) {
      validation.isValid = false;
      validation.errors.push('Text is required');
    }
    
    // Check text length
    if (text && text.length > 4096) {
      validation.isValid = false;
      validation.errors.push(`Text too long (${text.length}/4096 characters)`);
    }
    
    // Check for empty text
    if (text && text.trim().length === 0) {
      validation.isValid = false;
      validation.errors.push('Text cannot be empty');
    }
    
    // Warnings for very long texts
    if (text && text.length > 3000) {
      validation.warnings.push('Long text may take longer to generate');
    }
    
    res.json({
      success: true,
      validation,
      textLength: text ? text.length : 0,
      maxLength: 4096
    });
    
  } catch (error) {
    console.error('❌ Error validating text:', error.message);
    res.status(500).json({ 
      error: 'Failed to validate text',
      code: 'VALIDATION_ERROR'
    });
  }
});

module.exports = router; 