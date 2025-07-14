# 🎵 Wakie-Wakie - Telegram Text-to-Audio Bot

<div align="center">

![Wakie-Wakie Banner](https://img.shields.io/badge/Wakie--Wakie-Text%20to%20Audio-purple?style=for-the-badge&logo=telegram&logoColor=white)

**Convert text to high-quality audio with OpenAI TTS and send via Telegram**

[![Deploy Frontend](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nazary21/wakie-wakie)
[![Deploy Backend](https://railway.app/button.svg)](https://railway.app/new/template)

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-16+-green?style=flat-square)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square)

</div>

## ✨ Features

### 🎙️ **Multi-Voice TTS**
- **6 Premium Voices**: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **Speed Control**: 0.5x to 2.0x speed adjustment
- **Multi-language**: Auto-detection for 50+ languages

### 📱 **Telegram Integration**
- **Instant Conversion**: Send text → Receive audio
- **Voice Commands**: `/voice`, `/setvoice`, `/help`
- **User Preferences**: Remembers your favorite voice

### 🌐 **Web Interface**
- **Modern UI**: Beautiful, responsive design
- **Real-time Preview**: Play audio before sending
- **Speed Controls**: Adjust playback speed
- **Error Handling**: Clear feedback and validation

### 🏗️ **Clean Architecture**
- **Modular Backend**: Organized services and routes
- **Type Safety**: Robust error handling
- **Scalable**: Easy to extend and maintain

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **OpenAI API Key** ([Get here](https://platform.openai.com/api-keys))
- **Telegram Bot Token** ([Create bot](https://t.me/botfather))

### Installation
```bash
# Clone repository
git clone https://github.com/Nazary21/wakie-wakie.git
cd wakie-wakie

# Install dependencies (frontend + backend)
npm run setup

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start development servers
npm run dev
```

### Environment Setup
Create `.env` file:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

## 🎯 Usage

### Web Interface
1. Visit `http://localhost:3002`
2. Choose voice and speed
3. Enter text (max 4096 characters)
4. Generate and preview audio
5. Send to Telegram (optional)

### Telegram Bot
1. Message your bot with any text
2. Receive audio instantly
3. Use commands:
   - `/start` - Welcome message
   - `/voice` - View available voices
   - `/setvoice nova` - Change voice
   - `/help` - Show help

## 🏛️ Architecture

```
wakie-wakie/
├── frontend/          # React web interface
│   ├── src/
│   │   ├── App.js     # Main application
│   │   └── ...
│   └── package.json
├── backend/           # Node.js server
│   ├── src/
│   │   ├── server.js  # Main server
│   │   ├── services/  # Business logic
│   │   │   ├── openaiService.js
│   │   │   └── telegramService.js
│   │   └── routes/    # API endpoints
│   └── package.json
└── docs/             # Documentation
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/generate-audio` | Generate TTS audio |
| `GET` | `/api/voices` | Get voice options |
| `GET` | `/api/bot-info` | Bot information |
| `POST` | `/api/validate-text` | Validate input |

## 🚀 Deployment

### Recommended Setup
- **Frontend**: Deploy to [Vercel](https://vercel.com) (free)
- **Backend**: Deploy to [Railway](https://railway.app) (~$5/month)

### Quick Deploy
1. **Push to GitHub**
2. **Frontend**: Connect Vercel to your repo
3. **Backend**: Connect Railway to your repo (`/backend` folder)
4. **Configure environment variables** in both platforms

📚 **[Complete Deployment Guide](DEPLOYMENT.md)**

## 💰 Cost Breakdown

| Service | Free Tier | Typical Cost |
|---------|-----------|--------------|
| **Vercel** | 100GB/month | Free |
| **Railway** | $5 credit | ~$5/month |
| **OpenAI TTS** | Pay per use | ~$15/1M chars |
| **Total** | - | ~$20-55/month |

## 🎵 Voice Options

| Voice | Style | Best For |
|-------|-------|----------|
| **Alloy** | Balanced, natural | General use |
| **Echo** | Clear, professional | Business, podcasts |
| **Fable** | Expressive, storytelling | Audiobooks, stories |
| **Onyx** | Deep, authoritative | Announcements |
| **Nova** | Bright, energetic | Casual, friendly |
| **Shimmer** | Soft, gentle | Meditation, calm content |

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start both servers
npm run server:dev   # Backend only (auto-restart)
npm start           # Frontend only
npm run build       # Production build
npm run setup       # Install all dependencies
```

### Adding Features
1. **New API endpoint**: Add to `backend/src/routes/`
2. **New service**: Create in `backend/src/services/`
3. **Frontend component**: Add to `src/`

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts**: Kill processes on ports 3001/3002
- **API key errors**: Verify keys in `.env`
- **Audio generation fails**: Check OpenAI quotas
- **Bot not responding**: Verify Telegram token

### Debug Commands
```bash
# Check backend health
curl http://localhost:3001/api/health

# Test audio generation
curl -X POST http://localhost:3001/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voice": "alloy"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for the amazing TTS API
- **Telegram** for the bot platform
- **Vercel** & **Railway** for hosting
- **React** & **Node.js** communities

## 📞 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/Nazary21/wakie-wakie/issues)
- 📖 **Documentation**: [Setup Guide](SETUP.md) | [Deployment Guide](DEPLOYMENT.md)
- 🚀 **Live Demo**: [Try it here](https://your-demo-url.vercel.app)

---

<div align="center">

**Made with ❤️ by [Nazary21](https://github.com/Nazary21)**

⭐ **Star this repo if you find it useful!** ⭐

</div> 