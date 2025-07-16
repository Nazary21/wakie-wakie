import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Clock, 
  Volume2, 
  CheckCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  PlayCircle,
  Send,
  Calendar
} from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [selectedSpeed, setSelectedSpeed] = useState(0.8);
  const [error, setError] = useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentPreviewVoice, setCurrentPreviewVoice] = useState(null);
  
  // Get API URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://wakie-wakie-production.up.railway.app';
  
  console.log('API Base URL:', API_BASE_URL); // Debug log
  
  const audioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const textAreaRef = useRef(null);

  // Voice options for OpenAI TTS
  const voiceOptions = [
    { 
      value: 'alloy', 
      label: 'Alloy', 
      description: 'Balanced and natural - great for general use',
      provider: 'OpenAI',
      accent: 'Neutral',
      gender: 'Neutral',
      style: 'Conversational'
    },
    { 
      value: 'echo', 
      label: 'Echo', 
      description: 'Clear and professional - perfect for business',
      provider: 'OpenAI',
      accent: 'Neutral',
      gender: 'Male',
      style: 'Professional'
    },
    { 
      value: 'fable', 
      label: 'Fable', 
      description: 'Expressive storytelling - ideal for narratives',
      provider: 'OpenAI',
      accent: 'Neutral',
      gender: 'Neutral',
      style: 'Expressive'
    },
    { 
      value: 'onyx', 
      label: 'Onyx', 
      description: 'Deep and authoritative - commanding presence',
      provider: 'OpenAI',
      accent: 'Neutral',
      gender: 'Male',
      style: 'Authoritative'
    },
    { 
      value: 'nova', 
      label: 'Nova', 
      description: 'Bright and energetic - youthful and dynamic',
      provider: 'OpenAI',
      accent: 'Neutral',
      gender: 'Female',
      style: 'Energetic'
    },
    { 
      value: 'shimmer', 
      label: 'Shimmer', 
      description: 'Soft and gentle - warm and soothing',
      provider: 'OpenAI',
      accent: 'Neutral',
      gender: 'Female',
      style: 'Gentle'
    }
  ];

  // Speed options for TTS
  const speedOptions = [
    { value: 0.5, label: '0.5x - Very Slow' },
    { value: 0.75, label: '0.75x - Slow' },
    { value: 0.8, label: '0.8x - Relaxed (Default)' },
    { value: 1.0, label: '1.0x - Normal' },
    { value: 1.25, label: '1.25x - Fast' },
    { value: 1.5, label: '1.5x - Very Fast' },
    { value: 2.0, label: '2.0x - Maximum' }
  ];

  // Auto-resize textarea
  const handleTextChange = (e) => {
    setText(e.target.value);
    setError(''); // Clear any previous errors
    const textarea = textAreaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Generate audio from text using OpenAI TTS
  const generateAudio = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to audio');
      return;
    }

    if (text.length > 4096) {
      setError('Text too long! Maximum 4096 characters allowed.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      console.log('Generating audio with OpenAI TTS...');
      
      const response = await fetch(`${API_BASE_URL}/api/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text.trim(),
          voice: selectedVoice,
          speed: selectedSpeed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Create blob from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setAudioUrl(audioUrl);
      
      // Get audio duration
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      
      console.log('Audio generated successfully!');
      
    } catch (error) {
      console.error('Error generating audio:', error);
      setError(error.message || 'Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Proceed to delivery options
  const proceedToDelivery = () => {
    // setShowDeliveryOptions(true); // Removed as per edit hint
  };

  // Voice preview functionality
  const playVoicePreview = async (voice) => {
    try {
      setIsPreviewPlaying(true);
      setCurrentPreviewVoice(voice);
      
      const response = await fetch(`${API_BASE_URL}/api/voice-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          voice: voice,
          speed: selectedSpeed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice preview');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (previewAudioRef.current) {
        previewAudioRef.current.src = audioUrl;
        previewAudioRef.current.play();
      }
      
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setError('Failed to play voice preview. Please try again.');
    }
  };

  const handlePreviewEnded = () => {
    setIsPreviewPlaying(false);
    setCurrentPreviewVoice(null);
  };

  // Download functionality
  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `generated-audio-${selectedVoice}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get current time for scheduling
  const getCurrentDateTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8" />
              AI Voice Generator
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-blue-200">Convert your text into high-quality audio with multiple voice options</p>
            <p className="text-blue-300 text-sm mt-2">
              Powered by OpenAI TTS • 6 Voice Options • Voice Preview • Download Ready
            </p>
          </motion.div>

          {/* Main Interface */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                // Success State
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Message Sent Successfully!</h2>
                  <p className="text-blue-200 text-lg">
                    Your voice message has been {/* deliveryMode === 'now' ? 'sent immediately' : `scheduled for ${scheduledTime}` */}
                  </p>
                </motion.div>
              ) : (
                // Text Input & Audio Generation
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Voice Selection */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-3">
                      Choose Voice:
                    </label>
                    <div className="space-y-3">
                      {voiceOptions.map((voice) => (
                        <div
                          key={voice.value}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            selectedVoice === voice.value
                              ? 'border-blue-400 bg-blue-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                          onClick={() => setSelectedVoice(voice.value)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  selectedVoice === voice.value ? 'bg-blue-400' : 'bg-white/30'
                                }`}></div>
                                <h3 className="text-white font-semibold">{voice.label}</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                                  {voice.provider}
                                </span>
                              </div>
                              <p className="text-blue-200 text-sm mb-2">{voice.description}</p>
                              <div className="flex items-center gap-4 text-xs text-white/60">
                                <span>👤 {voice.gender}</span>
                                <span>🎭 {voice.style}</span>
                                <span>🌍 {voice.accent}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playVoicePreview(voice.value);
                              }}
                              disabled={isPreviewPlaying && currentPreviewVoice === voice.value}
                              className="ml-4 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-full transition-colors"
                            >
                              {isPreviewPlaying && currentPreviewVoice === voice.value ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <PlayCircle className="w-4 h-4 text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Speed Selection */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Speed:
                    </label>
                    <select 
                      value={selectedSpeed} 
                      onChange={(e) => setSelectedSpeed(parseFloat(e.target.value))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {speedOptions.map((speed) => (
                        <option key={speed.value} value={speed.value} className="bg-gray-800 text-white">
                          {speed.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      What would you like to say?
                    </label>
                    <textarea
                      ref={textAreaRef}
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Type your message here... It will be converted to audio in any language!"
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[120px] max-h-[300px]"
                      maxLength={4096}
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-white/60">
                      <span>{text.length}/4096 characters</span>
                      <span>Language: Auto-detect</span>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateAudio}
                    disabled={isGenerating || !text.trim()}
                    className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isGenerating || !text.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                    } text-white shadow-lg`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Audio...
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Generate Audio
                      </>
                    )}
                  </motion.button>

                  {/* Audio Player */}
                  {audioUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium">Generated Audio</span>
                        </div>
                        <div className="text-white/60 text-sm">
                          {audioDuration > 0 ? formatDuration(audioDuration) : '--:--'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={togglePlayback}
                          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                        </button>
                        
                        <div className="flex-1 text-white/80 text-sm">
                          Voice: {voiceOptions.find(v => v.value === selectedVoice)?.label || selectedVoice} • Speed: {selectedSpeed}x
                        </div>
                      </div>
                      
                      <button
                        onClick={downloadAudio}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Audio
                      </button>
                      
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                    </motion.div>
                  )}
                  
                  {/* Hidden audio element for voice previews */}
                  <audio
                    ref={previewAudioRef}
                    onEnded={handlePreviewEnded}
                    className="hidden"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App; 