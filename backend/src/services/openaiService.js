const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create temp directory for audio files
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Generate audio from text using OpenAI TTS
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @param {number} speed - Speech speed (0.25 to 4.0)
 * @returns {Promise<string>} - Path to the generated audio file
 */
async function generateAudioFromText(text, voice = 'alloy', speed = 0.8) {
  try {
    console.log(`🎵 Generating audio for text: "${text.substring(0, 50)}..." with voice: ${voice}`);
    
    // Validate voice option
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      throw new Error(`Invalid voice: ${voice}. Must be one of: ${validVoices.join(', ')}`);
    }

    // Validate text length
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 4096) {
      throw new Error('Text too long. Maximum 4096 characters allowed.');
    }

    // Generate audio using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // Use tts-1-hd for higher quality but slower processing
      voice: voice,
      input: text.trim(),
      speed: speed,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Create unique filename
    const timestamp = Date.now();
    const filename = `audio_${timestamp}_${voice}.mp3`;
    const filepath = path.join(tempDir, filename);
    
    // Save to temporary file
    fs.writeFileSync(filepath, buffer);
    
    console.log(`✅ Audio generated successfully: ${filename} (${buffer.length} bytes)`);
    return filepath;
    
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

/**
 * Clean up temporary audio file
 * @param {string} filepath - Path to the file to clean up
 */
function cleanupFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`🧹 Cleaned up file: ${path.basename(filepath)}`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up file:', error.message);
  }
}

/**
 * Clean up all temporary files older than specified time
 * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
 */
function cleanupOldFiles(maxAge = 60 * 60 * 1000) {
  try {
    if (!fs.existsSync(tempDir)) return;
    
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filepath = path.join(tempDir, file);
      const stats = fs.statSync(filepath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filepath);
        console.log(`🧹 Cleaned up old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Error cleaning up old files:', error.message);
  }
}

/**
 * Get available voice options
 * @returns {Array} - Array of voice options with descriptions
 */
function getVoiceOptions() {
  return [
    { value: 'alloy', label: 'Alloy', description: 'Balanced, natural' },
    { value: 'echo', label: 'Echo', description: 'Clear, professional' },
    { value: 'fable', label: 'Fable', description: 'Expressive, storytelling' },
    { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative' },
    { value: 'nova', label: 'Nova', description: 'Bright, energetic' },
    { value: 'shimmer', label: 'Shimmer', description: 'Soft, gentle' }
  ];
}

module.exports = {
  generateAudioFromText,
  cleanupFile,
  cleanupOldFiles,
  getVoiceOptions
}; 