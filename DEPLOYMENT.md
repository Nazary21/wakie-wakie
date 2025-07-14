# 🚀 Deployment Guide

This guide covers deploying the **Wakie-Wakie** Telegram Text-to-Audio bot to production.

## Architecture

- **Frontend**: React app deployed to Vercel
- **Backend**: Node.js server deployed to Railway
- **Why separate**: Telegram bots need continuous polling, which requires persistent servers

## 🎯 Quick Deployment

### Prerequisites
- GitHub account
- Vercel account
- Railway account
- OpenAI API key
- Telegram bot token

---

## 📱 Frontend Deployment (Vercel)

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit: Telegram TTS bot"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo: `wakie-wakie`
4. **Root Directory**: Leave as root (don't change)
5. **Framework**: Will auto-detect Create React App
6. Click "Deploy"

### 3. Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

---

## 🖥️ Backend Deployment (Railway)

### 1. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your `wakie-wakie` repo
4. **Root Directory**: Set to `backend`
5. Click "Deploy"

### 2. Configure Environment Variables
In Railway dashboard → Variables:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 3. Update Frontend URL
After deploying frontend, update the Railway `FRONTEND_URL` variable with your actual Vercel URL.

---

## 🔗 Connect Frontend to Backend

### Update Vercel Configuration
1. In Vercel, update the environment variable:
```env
REACT_APP_API_URL=https://your-actual-railway-url.railway.app
```

2. Redeploy frontend (automatic after env var update)

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/api/health
```

### Frontend Test
1. Visit your Vercel URL
2. Try generating audio
3. Check if it connects to your Railway backend

### Telegram Bot Test
1. Message your bot on Telegram
2. Send text → should receive audio
3. Try commands: `/start`, `/voice`, `/help`

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend can't connect to backend
- Check `REACT_APP_API_URL` in Vercel settings
- Ensure Railway backend is running
- Check CORS settings in backend

#### Telegram bot not responding
- Verify `TELEGRAM_BOT_TOKEN` in Railway
- Check Railway logs for errors
- Ensure bot is not rate-limited

#### Audio generation fails
- Verify `OPENAI_API_KEY` in Railway
- Check OpenAI account billing/limits
- Review Railway logs for API errors

### Checking Logs

#### Railway Logs
```bash
# In Railway dashboard
Deploy → View Logs
```

#### Vercel Logs
```bash
# In Vercel dashboard
Project → Functions → View Logs
```

---

## 🔧 Production Optimizations

### Backend Optimizations
1. **Use tts-1-hd model** for higher quality:
   ```javascript
   model: "tts-1-hd"  // In openaiService.js
   ```

2. **Add rate limiting**:
   ```bash
   npm install express-rate-limit
   ```

3. **Database for user preferences**:
   - Consider MongoDB Atlas or Railway PostgreSQL

### Frontend Optimizations
1. **Build optimization** - Already handled by Vercel
2. **CDN** - Vercel provides global CDN
3. **PWA features** - Add service worker for offline use

---

## 💰 Cost Estimation

### Free Tiers
- **Vercel**: 100GB bandwidth/month
- **Railway**: $5/month credit (enough for hobby use)
- **OpenAI**: Pay per use (~$15/1M characters)

### Monthly Costs (Light Usage)
- **Vercel**: Free
- **Railway**: ~$5/month
- **OpenAI**: ~$10-50/month depending on usage
- **Total**: ~$15-55/month

---

## 🔄 Updates & Maintenance

### Updating Code
1. Push changes to GitHub
2. Vercel auto-deploys on push
3. Railway auto-deploys on push

### Monitoring
- **Railway**: Built-in metrics
- **Vercel**: Analytics dashboard
- **OpenAI**: Usage dashboard

### Backup
- **Code**: GitHub (automated)
- **Environment variables**: Document separately
- **User data**: If using database, implement backups

---

## 🚀 Going Live Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Telegram bot responding
- [ ] Audio generation working
- [ ] Frontend-backend connection working
- [ ] Error monitoring set up
- [ ] Domain configured (optional)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Verify all environment variables
4. Test each component individually

Happy deploying! 🎉 