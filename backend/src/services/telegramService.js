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
    
    // Better polling configuration to fix delays and failures
    const pollingOptions = {
      polling: {
        interval: 300, // Poll every 300ms for faster response
        autoStart: true,
        params: {
          timeout: 10, // 10 second timeout for long polling
          limit: 100   // Process up to 100 updates at once
        }
      }
    };
    
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, pollingOptions);
    
    // Add error handling for polling
    bot.on('polling_error', (error) => {
      console.error('🚨 Telegram polling error:', error.message);
      // Don't crash the server, just log the error
    });
    
    bot.on('error', (error) => {
      console.error('🚨 Telegram bot error:', error.message);
    });
    
    console.log('✅ Telegram bot initialized with improved polling');
  }
  return bot;
}

// Store user preferences (in production, use a database)
const userVoices = new Map();
const userSpeeds = new Map();

/**
 * Initialize all Telegram bot event handlers
 */
async function initializeTelegramBot() {
  try {
    const bot = getTelegramBot(); // Get the bot instance

    console.log('🤖 Initializing Telegram bot...');
    
    // Verify bot connection
    const botInfo = await bot.getMe();
    console.log(`✅ Bot connected successfully: @${botInfo.username} (${botInfo.first_name})`);
    
    // Clear any existing webhook (in case it was set before)
    try {
      await bot.deleteWebHook();
      console.log('✅ Webhook cleared for polling mode');
    } catch (webhookError) {
      console.log('ℹ️  No webhook to clear');
    }

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'there';
    
    const welcomeMessage = `
🎵 **Welcome to Text-to-Audio Bot, ${userName}!** 🎵

I convert your text messages into high-quality audio using OpenAI's advanced TTS technology.

🚀 **Quick Start:**
1. Send me any text message
2. Get instant MP3 audio file
3. Play it anywhere!

🎛️ **Customize Your Experience:**

🎙️ **Choose Your Voice** (6 options):
• \`/voice\` - See all voices
• \`/setvoice nova\` - Set energetic voice
• \`/setvoice alloy\` - Set balanced voice (default)

⚡ **Adjust Speaking Speed** (7 options):
• \`/speed\` - See all speeds  
• \`/setspeed 1.0\` - Normal speed
• \`/setspeed 0.8\` - Relaxed speed (default)
• \`/setspeed 1.5\` - Fast speed

💡 **Perfect For:**
• 📚 Learning pronunciation in any language
• 🎧 Creating voice memos
• ♿ Accessibility support
• 🎯 Quick audio summaries

📱 **Pro Tips:**
• Works with any language (auto-detected)
• Supports up to 4096 characters
• Each user gets personal preferences
• Use \`/help\` for detailed instructions

**Ready to try?** Just send me some text! 🌟
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
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
    
    voiceList += `\n📝 **How to Change Voice:**\n`;
    voiceList += `Send: \`/setvoice [voice_name]\`\n`;
    voiceList += `Example: \`/setvoice nova\` or \`/setvoice echo\`\n\n`;
    voiceList += `🎯 **Your Current Voice:** **${currentVoice}**\n\n`;
    voiceList += `💡 **Tip:** Also try \`/speed\` to adjust speaking speed!`;
    
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
    
    speedList += `\n📝 **How to Change Speed:**\n`;
    speedList += `Send: \`/setspeed [speed]\`\n`;
    speedList += `Example: \`/setspeed 1.0\` or \`/setspeed 1.5\`\n\n`;
    speedList += `🎯 **Your Current Speed:** **${currentSpeed}x**\n\n`;
    speedList += `💡 **Tip:** Also try \`/voice\` to change speaking voice!`;
    
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

🎙️ **Voice Commands:**
🔹 **/voice** - See all available voices
🔹 **/setvoice [name]** - Change voice
   Example: \`/setvoice nova\`

⚡ **Speed Commands:**
🔹 **/speed** - See all available speeds
🔹 **/setspeed [speed]** - Change speaking speed
   Example: \`/setspeed 1.25\`
   Available: 0.5, 0.75, 0.8, 1.0, 1.25, 1.5, 2.0

📋 **General:**
🔹 **/start** - Welcome message & introduction
🔹 **/help** - Show this help menu

📝 **How to Use:**
1. **Set your preferences** (optional):
   • \`/setvoice echo\` - for professional sound
   • \`/setspeed 1.0\` - for normal speed
2. **Send any text message** - I'll convert it to audio!
3. **Receive MP3 file** with your chosen voice & speed

⚙️ **Current Defaults:**
• Voice: Alloy (balanced, natural)
• Speed: 0.8x (relaxed pace)

⚠️ **Limits:**
• Maximum 4096 characters per message
• Supported: All languages (auto-detected)
• Format: High-quality MP3 audio

💡 **Pro Tips:**
• Try different voices for different moods
• Use slower speeds for learning languages
• Faster speeds work great for quick summaries

❓ **Questions?** Just send me any text to try it out!
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
  
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
    throw error;
  }
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