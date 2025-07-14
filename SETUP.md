# 🚀 Telegram Text-to-Audio Bot Setup

## Project Architecture

```
/
├── backend/                    # Backend services
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── services/          # Business logic
│   │   │   ├── openaiService.js
│   │   │   └── telegramService.js
│   │   ├── routes/            # API routes
│   │   │   └── apiRoutes.js
│   │   └── temp/              # Temporary audio files
│   └── package.json           # Backend dependencies
├── src/                       # Frontend React app
├── public/                    # Static assets
├── .env                       # Environment configuration
└── package.json               # Frontend dependencies
```

## Prerequisites

1. **Node.js** - Version 16 or higher
2. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Telegram Bot Token** - Create a bot via [@BotFather](https://t.me/botfather) on Telegram

## Installation

### Quick Setup
```bash
# Install all dependencies (frontend + backend)
npm run setup
```

### Manual Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

## Environment Configuration

Create a `.env` file in your project root with your API keys:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3002

# Environment
NODE_ENV=development

# Webhook Configuration (optional - for production)
WEBHOOK_URL=
```

## Running the Application

### Development Mode (Recommended)
```bash
# Start both backend and frontend simultaneously
npm run dev
```

### Separate Processes
```bash
# Backend only (with auto-restart)
npm run server:dev

# Frontend only (in another terminal)
npm start
```

### Production Mode
```bash
# Backend production
npm run server

# Frontend production build
npm run build
```

## Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run server` - Start backend in production mode
- `npm run server:dev` - Start backend in development mode with auto-restart
- `npm run setup` - Install all dependencies
- `npm run clean` - Clean and reinstall all dependencies

## Usage

### Telegram Bot Commands

- `/start` - Welcome message and instructions
- `/voice` - See available voice options
- `/setvoice [voice_name]` - Change voice (alloy, echo, fable, onyx, nova, shimmer)
- `/help` - Show help and commands

### Web Interface

- Visit `http://localhost:3002` for the web interface
- Generate audio and optionally send to Telegram

## Voice Options

- **alloy** - Balanced, natural (default)
- **echo** - Clear, professional  
- **fable** - Expressive, storytelling
- **onyx** - Deep, authoritative
- **nova** - Bright, energetic
- **shimmer** - Soft, gentle

## API Endpoints

- `GET /` - Server status and information
- `GET /api/health` - Health check
- `POST /api/generate-audio` - Generate audio from text
- `GET /api/voices` - Get available voice options
- `GET /api/bot-info` - Get Telegram bot information
- `POST /api/validate-text` - Validate text input

## Features

✅ **Clean Architecture** - Organized backend services and routes  
✅ **OpenAI TTS Integration** - High-quality text-to-speech  
✅ **Multiple Voice Options** - 6 different voices  
✅ **Telegram Bot** - Send text, receive audio  
✅ **Web Interface** - Modern UI for testing  
✅ **File Cleanup** - Automatic temporary file management  
✅ **Error Handling** - Robust error handling and user feedback  
✅ **Multi-language Support** - Auto-detected language support  
✅ **Request Logging** - Comprehensive logging system  
✅ **Health Monitoring** - Health check endpoints  

## Development

### Project Structure

- **Backend Services**: Located in `backend/src/services/`
  - `openaiService.js` - OpenAI TTS functionality
  - `telegramService.js` - Telegram bot handling
  
- **API Routes**: Located in `backend/src/routes/`
  - `apiRoutes.js` - REST API endpoints
  
- **Frontend**: React app in `src/`

### Adding New Features

1. **New API Endpoint**: Add to `backend/src/routes/apiRoutes.js`
2. **New Service**: Create in `backend/src/services/`
3. **Frontend Component**: Add to `src/` directory

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**: Verify your API key is valid and has sufficient credits
2. **Telegram Bot Not Responding**: Check your bot token and network connection
3. **Audio Generation Failed**: Verify text length is under 4096 characters
4. **Port Already in Use**: Change PORT in .env file or kill existing processes

### Debug Commands

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check bot info
curl http://localhost:3001/api/bot-info

# Test audio generation
curl -X POST http://localhost:3001/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voice": "alloy"}'
```

### Logs

- Backend logs are displayed in the terminal
- Check console for detailed error messages
- All requests are logged with timestamps

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token
OPENAI_API_KEY=your_openai_key
PORT=3001
FRONTEND_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhook
```

### Process Management

Consider using PM2 for production:

```bash
npm install -g pm2
pm2 start backend/src/server.js --name telegram-tts-bot
pm2 startup
pm2 save
```

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure OpenAI API key has sufficient credits
4. Test with simple text messages first
5. Check network connectivity to OpenAI and Telegram APIs

## Next Steps

1. **Database Integration**: Store user preferences and analytics
2. **Rate Limiting**: Implement rate limiting for production use
3. **User Authentication**: Add user authentication system
4. **Voice Cloning**: Add custom voice training capabilities
5. **Analytics**: Add usage analytics and monitoring
6. **Caching**: Implement audio caching for repeated requests 