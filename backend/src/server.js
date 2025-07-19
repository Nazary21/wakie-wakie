const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables (Railway sets them directly, but this handles local dev)
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch (error) {
  // Railway doesn't need .env files, environment variables are set directly
  console.log('🔧 Running in production mode - using Railway environment variables');
}

// Import services
const { initializeTelegramBot, getBotInfo } = require('./services/telegramService');
const { cleanupOldFiles } = require('./services/openaiService');

// Import routes
const apiRoutes = require('./routes/apiRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://wakie-talkie.vercel.app' 
    : (process.env.FRONTEND_URL || 'http://localhost:3002'),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 ${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', async (req, res) => {
  try {
    const botInfo = await getBotInfo();
    res.json({ 
      message: 'Telegram Text-to-Audio Bot Server',
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      bot: botInfo ? {
        active: true,
        username: botInfo.username,
        name: botInfo.first_name
      } : {
        active: false,
        error: 'Bot not responding'
      },
      endpoints: {
        health: '/api/health',
        generateAudio: '/api/generate-audio',
        voices: '/api/voices',
        voicePreview: '/api/voice-preview/:voice',
        botInfo: '/api/bot-info',
        validateText: '/api/validate-text'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON'
    });
  }
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request payload too large',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Starting Telegram Text-to-Audio Bot Server...');
    console.log('🔍 Environment check:');
    console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   • PORT: ${process.env.PORT || 'not set'}`);
    console.log(`   • FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`   • TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ set (' + process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...)' : '❌ missing'}`);
    console.log(`   • OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ set (' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : '❌ missing'}`);
    
    // Debug: Show all environment variables starting with our prefixes
    console.log('🔍 All environment variables:');
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('TELEGRAM_') || key.startsWith('OPENAI_') || key.startsWith('NODE_') || key.startsWith('PORT') || key.startsWith('FRONTEND_')) {
        const value = process.env[key];
        const maskedValue = key.includes('TOKEN') || key.includes('KEY') 
          ? value.substring(0, 10) + '...' 
          : value;
        console.log(`   ${key}: ${maskedValue}`);
      }
    });
    
    // Validate required environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is required. Please set it in Railway Variables tab.');
    }
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required. Please set it in Railway Variables tab.');
    }
    
    console.log('✅ Environment variables validated');
    
    // Initialize Telegram bot (non-blocking to prevent server crashes)
    try {
      await initializeTelegramBot();
    } catch (telegramError) {
      console.error('⚠️ Telegram bot failed to initialize:', telegramError.message);
      console.log('🚀 Continuing without Telegram bot - API server will still work');
    }
    
    // Schedule cleanup of old files every hour
    setInterval(() => {
      cleanupOldFiles();
    }, 60 * 60 * 1000); // 1 hour
    
    console.log('✅ Services initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize services:', error.message);
    process.exit(1);
  }
}

// Start the server
app.listen(PORT, async () => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://wakie-talkie.vercel.app';
  const apiBaseUrl = process.env.NODE_ENV === 'production' 
    ? `https://wakie-wakie-production.up.railway.app/api`
    : `http://localhost:${PORT}/api`;
    
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`📱 API Base URL: ${apiBaseUrl}`);
  
  // Initialize services
  await initializeServices();
  
  console.log('🎉 Server is ready and running!');
  console.log('📋 Available endpoints:');
  console.log(`   • GET  /              - Server info`);
  console.log(`   • GET  /api/health    - Health check`);
  console.log(`   • POST /api/generate-audio - Generate TTS audio`);
  console.log(`   • GET  /api/voices    - Get voice options`);
  console.log(`   • GET  /api/bot-info  - Get bot information`);
  console.log(`   • POST /api/validate-text - Validate text input`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Clean up temp files
  try {
    cleanupOldFiles(0); // Clean up all files
    console.log('✅ Cleaned up temporary files');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
  
  console.log('👋 Server shut down completed');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 