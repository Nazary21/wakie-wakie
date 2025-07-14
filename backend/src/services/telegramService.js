const TelegramBot = require('node-telegram-bot-api');
const { generateAudioFromText, cleanupFile, getVoiceOptions, getSpeedOptions } = require('./openaiService');

// Telegram bot instance (lazy initialization)
let bot = null;

// Initialize Telegram bot lazily
function getTelegramBot() {
  if (!bot) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
    console.log('✅ Telegram bot initialized');
  }
  return bot;
}

// Store user preferences (in production, use a database)
const userVoices = new Map();
const userSpeeds = new Map();

/**
 * Initialize all Telegram bot event handlers
 */
function initializeTelegramBot() {
  const bot = getTelegramBot(); // Get the bot instance

  console.log('🤖 Initializing Telegram bot...');

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'there';
    
    const welcomeMessage = `
🎵 Welcome to Text-to-Audio Bot, ${userName}! 🎵

I can convert your text messages into high-quality audio files using OpenAI's TTS technology.

📝 **How to use:**
1. Simply send me any text message
2. I'll convert it to audio instantly
3. You'll receive an MP3 file you can play

🎙️ **Voice & Speed Options:**
• Type /voice to see available voices
• Type /speed to see available speeds
• Default: Alloy voice at 0.8x speed

💡 **Tips:**
• Works with any language
• Supports long texts (up to 4096 characters)
• Perfect for creating voice memos, learning pronunciation, or accessibility

Just send me some text to get started! 🚀
    `;
    
    bot.sendMessage(chatId, welcomeMessage);
  });

  // Handle /voice command
  bot.onText(/\/voice/, (msg) => {
    const chatId = msg.chat.id;
    const currentVoice = userVoices.get(chatId) || 'alloy';
    const voices = getVoiceOptions();
    
    let voiceList = '🎙️ **Available Voices:**\n\n';
    voices.forEach(voice => {
      const marker = voice.value === currentVoice ? '✅' : '🔸';
      voiceList += `${marker} **${voice.label}** - ${voice.description}\n`;
    });
    
    voiceList += `\nTo use a specific voice, send: /setvoice [voice_name]\nExample: /setvoice nova\n\n`;
    voiceList += `Your current voice: **${currentVoice}**`;
    
    bot.sendMessage(chatId, voiceList, { parse_mode: 'Markdown' });
  });

  // Handle /setvoice command
  bot.onText(/\/setvoice (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const voice = match[1].toLowerCase();
    const validVoices = getVoiceOptions().map(v => v.value);
    
    if (validVoices.includes(voice)) {
      userVoices.set(chatId, voice);
      bot.sendMessage(chatId, `✅ Voice set to: **${voice}**`, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, `❌ Invalid voice. Use /voice to see available options.`);
    }
  });

  // Handle /speed command
  bot.onText(/\/speed/, (msg) => {
    const chatId = msg.chat.id;
    const currentSpeed = userSpeeds.get(chatId) || 0.8;
    const speeds = getSpeedOptions();
    
    let speedList = '⚡ **Available Speeds:**\n\n';
    speeds.forEach(speed => {
      const marker = speed.value === currentSpeed ? '✅' : '🔸';
      speedList += `${marker} **${speed.label}** - ${speed.description}\n`;
    });
    
    speedList += `\nTo set speed, send: /setspeed [speed]\nExample: /setspeed 1.0\n\n`;
    speedList += `Your current speed: **${currentSpeed}x**`;
    
    bot.sendMessage(chatId, speedList, { parse_mode: 'Markdown' });
  });

  // Handle /setspeed command
  bot.onText(/\/setspeed (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const speed = parseFloat(match[1]);
    const validSpeeds = getSpeedOptions().map(s => s.value);
    
    if (validSpeeds.includes(speed)) {
      userSpeeds.set(chatId, speed);
      bot.sendMessage(chatId, `✅ Speed set to: **${speed}x**`, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, `❌ Invalid speed. Use /speed to see available options.`);
    }
  });

  // Handle /help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 **Help & Commands:**

🔹 **/start** - Welcome message
🔹 **/voice** - See available voices
🔹 **/setvoice [name]** - Change voice
🔹 **/speed** - See available speeds
🔹 **/setspeed [speed]** - Change speed
🔹 **/help** - Show this help

📝 **Usage:**
Just send any text message and I'll convert it to audio!

⚠️ **Limits:**
• Maximum 4096 characters per message
• Supported languages: Auto-detected
• Audio format: MP3

❓ **Need help?** Just send me a text message to try it out!
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });

  // Handle text messages
  bot.on('message', async (msg) => {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) {
      return;
    }
    
    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from.first_name || 'User';
    
    // Check if message has text
    if (!text) {
      bot.sendMessage(chatId, "❌ Please send me text to convert to audio!");
      return;
    }
    
    // Check text length
    if (text.length > 4096) {
      bot.sendMessage(chatId, "❌ Text too long! Maximum 4096 characters allowed.");
      return;
    }
    
    // Send processing message
    const processingMsg = await bot.sendMessage(chatId, "🎵 Converting text to audio...");
    
    try {
      // Get user's preferred voice and speed or use defaults
      const voice = userVoices.get(chatId) || 'alloy';
      const speed = userSpeeds.get(chatId) || 0.8;
      
      // Generate audio
      const audioPath = await generateAudioFromText(text, voice, speed);
      
      // Send audio file
      await bot.sendAudio(chatId, audioPath, {
        caption: `🎵 Here's your audio, ${userName}! (Voice: ${voice}, Speed: ${speed}x)\n\n"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
        title: 'Generated Audio',
        performer: 'TTS Bot'
      });
      
      // Delete processing message
      await bot.deleteMessage(chatId, processingMsg.message_id);
      
      // Clean up temporary file after a delay
      setTimeout(() => {
        cleanupFile(audioPath);
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error processing message:', error.message);
      
      // Delete processing message
      try {
        await bot.deleteMessage(chatId, processingMsg.message_id);
      } catch (deleteError) {
        console.error('Error deleting processing message:', deleteError.message);
      }
      
      // Send error message
      bot.sendMessage(chatId, `❌ Sorry, I couldn't process your message. Please try again later.\n\nError: ${error.message}`);
    }
  });

  // Handle bot errors
  bot.on('error', (error) => {
    console.error('🚨 Bot error:', error.message);
  });

  // Handle polling errors
  bot.on('polling_error', (error) => {
    console.error('🚨 Polling error:', error.message);
  });

  console.log('✅ Telegram bot initialized successfully');
}

/**
 * Get bot info
 * @returns {Promise<Object>} - Bot information
 */
async function getBotInfo() {
  const bot = getTelegramBot(); // Get the bot instance
  try {
    const botInfo = await bot.getMe();
    return {
      id: botInfo.id,
      username: botInfo.username,
      first_name: botInfo.first_name,
      is_bot: botInfo.is_bot
    };
  } catch (error) {
    console.error('Error getting bot info:', error.message);
    return null;
  }
}

/**
 * Get user voice preference
 * @param {number} chatId - Chat ID
 * @returns {string} - User's preferred voice
 */
function getUserVoice(chatId) {
  return userVoices.get(chatId) || 'alloy';
}

/**
 * Set user voice preference
 * @param {number} chatId - Chat ID
 * @param {string} voice - Voice preference
 */
function setUserVoice(chatId, voice) {
  userVoices.set(chatId, voice);
}

/**
 * Get user speed preference
 * @param {number} chatId - Chat ID
 * @returns {number} - User's preferred speed
 */
function getUserSpeed(chatId) {
  return userSpeeds.get(chatId) || 0.8;
}

/**
 * Set user speed preference
 * @param {number} chatId - Chat ID
 * @param {number} speed - Speed preference
 */
function setUserSpeed(chatId, speed) {
  userSpeeds.set(chatId, speed);
}

module.exports = {
  initializeTelegramBot,
  getBotInfo,
  getUserVoice,
  setUserVoice,
  getUserSpeed,
  setUserSpeed,
  bot
}; 