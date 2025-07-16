import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  CheckCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [selectedSpeed, setSelectedSpeed] = useState(0.8);
  const [error, setError] = useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentPreviewVoice, setCurrentPreviewVoice] = useState(null);
  const [isVoiceExpanded, setIsVoiceExpanded] = useState(false);
  
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

  // Handle text input changes
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (error) setError('');
  };

  // Generate audio from text
  const generateAudio = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to audio');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Set audio duration when loaded
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      
    } catch (error) {
      console.error('Error generating audio:', error);
      setError('Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play/pause audio
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Play voice preview
  const playVoicePreview = async (voiceValue) => {
    if (isPreviewPlaying) return;
    
    setIsPreviewPlaying(true);
    setCurrentPreviewVoice(voiceValue);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice-preview/${voiceValue}`);
      if (!response.ok) {
        throw new Error('Failed to fetch voice preview');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (previewAudioRef.current) {
        previewAudioRef.current.src = audioUrl;
        previewAudioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing voice preview:', error);
    } finally {
      setTimeout(() => {
        setIsPreviewPlaying(false);
        setCurrentPreviewVoice(null);
      }, 3000); // Reset after 3 seconds
    }
  };

  // Download audio file
  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-message-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get the currently selected voice object
  const getSelectedVoiceObject = () => {
    return voiceOptions.find(voice => voice.value === selectedVoice) || voiceOptions[0];
  };

  // Handle voice selection and auto-collapse
  const handleVoiceSelection = (voiceValue) => {
    setSelectedVoice(voiceValue);
    setIsVoiceExpanded(false); // Auto-collapse after selection
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
            
            {/* Telegram Bot Link */}
            <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <p className="text-white/80 text-sm mb-2">
                💬 <strong>Also available as Telegram Bot:</strong>
              </p>
              <a
                href="https://t.me/nekowakiebot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm group"
              >
                <MessageSquare className="w-4 h-4" />
                @nekowakiebot
                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </a>
              <p className="text-white/60 text-xs mt-1">
                Send messages directly in Telegram with voice & speed controls
              </p>
            </div>
          </motion.div>

          {/* Main Interface */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <AnimatePresence mode="wait">
              {/* Text Input & Audio Generation */}
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
                    {/* Always show selected voice */}
                    <motion.div
                      layout
                      className="p-4 rounded-xl border-2 border-blue-400 bg-blue-500/20 cursor-pointer"
                      onClick={() => setIsVoiceExpanded(!isVoiceExpanded)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            <h3 className="text-white font-semibold">{getSelectedVoiceObject().label}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                              {getSelectedVoiceObject().provider}
                            </span>
                          </div>
                          <p className="text-blue-200 text-sm mb-2">{getSelectedVoiceObject().description}</p>
                          <div className="flex items-center gap-4 text-xs text-white/60">
                            <span>👤 {getSelectedVoiceObject().gender}</span>
                            <span>🎭 {getSelectedVoiceObject().style}</span>
                            <span>🌍 {getSelectedVoiceObject().accent}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoicePreview(getSelectedVoiceObject().value);
                            }}
                            disabled={isPreviewPlaying && currentPreviewVoice === getSelectedVoiceObject().value}
                            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-full transition-colors"
                          >
                            {isPreviewPlaying && currentPreviewVoice === getSelectedVoiceObject().value ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <motion.div
                            animate={{ rotate: isVoiceExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-white/70" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Expandable voice options */}
                    <AnimatePresence>
                      {isVoiceExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 pt-2">
                            {voiceOptions
                              .filter(voice => voice.value !== selectedVoice)
                              .map((voice) => (
                                <motion.div
                                  key={voice.value}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="p-3 rounded-lg border border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 cursor-pointer transition-all"
                                  onClick={() => handleVoiceSelection(voice.value)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        <h4 className="text-white font-medium text-sm">{voice.label}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                          {voice.provider}
                                        </span>
                                      </div>
                                      <p className="text-blue-200 text-xs mb-1">{voice.description}</p>
                                      <div className="flex items-center gap-3 text-xs text-white/50">
                                        <span>👤 {voice.gender}</span>
                                        <span>🎭 {voice.style}</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playVoicePreview(voice.value);
                                      }}
                                      disabled={isPreviewPlaying && currentPreviewVoice === voice.value}
                                      className="ml-3 p-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-full transition-colors"
                                    >
                                      {isPreviewPlaying && currentPreviewVoice === voice.value ? (
                                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                                      ) : (
                                        <PlayCircle className="w-3 h-3 text-white" />
                                      )}
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </motion.div>
                )}
                
                {/* Hidden audio element for voice previews */}
                <audio
                  ref={previewAudioRef}
                  onEnded={() => setIsPreviewPlaying(false)}
                  className="hidden"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App; 