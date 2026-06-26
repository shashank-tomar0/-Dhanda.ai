import React, { useState, useEffect } from 'react';

const SoundboxSimulator = ({ logs }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechText, setSpeechText] = useState('Paytm Soundbox Active');

  // Speak out announcements
  const announceOutLoud = (text) => {
    if (!soundEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SynthesisUtteranceWrapper(text);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Custom Synthesis Wrapper to set Indian voice
  class SynthesisUtteranceWrapper extends SpeechSynthesisUtterance {
    constructor(text) {
      super(text);
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) this.voice = hindiVoice;
      this.rate = 1.0;
      this.pitch = 1.05;
    }
  }

  // Listen to WebSocket logs, announce sales or loan approvals in real-time!
  useEffect(() => {
    if (logs && logs.length > 0) {
      const latestLog = logs[0];
      const message = latestLog.message;
      
      // If payment announcement
      if (message.includes('Received Paytm payment') || message.includes('Received cash payment')) {
        // Extract rupee value
        const rupeesMatch = message.match(/₹\d+/);
        const rupees = rupeesMatch ? rupeesMatch[0] : 'Kuch';
        const cleanMsg = `Paytm par ${rupees} prapt hue.`;
        setSpeechText(cleanMsg);
        announceOutLoud(cleanMsg);
      }
      
      // If loan approved
      if (message.includes('disbursed') && message.includes('Paytm Soundbox')) {
        const rupeesMatch = message.match(/₹\d+/);
        const rupees = rupeesMatch ? rupeesMatch[0] : 'Loan';
        const cleanMsg = `Mubarak ho! Paytm instant loan of ${rupees} disburse ho chuka hai.`;
        setSpeechText(cleanMsg);
        announceOutLoud(cleanMsg);
      }
    }
  }, [logs]);

  // Voice credit request simulation (Merchant speaking directly to Soundbox)
  const simulateVoiceLending = () => {
    const speakPrompt = "Soundbox command: Paytm, emergency delivery boy is here, approve credit.";
    setSpeechText("Listening to voice command...");
    setIsPlaying(true);
    
    setTimeout(() => {
      setSpeechText("Processing credit limits...");
      
      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/metrics/apply-loan', { method: 'POST' });
          const data = await response.json();
          
          if (response.ok) {
            const announce = `Approved! Instant loan of ₹${data.details.borrowCapacity} disbursed directly to Supplier Aggarwal wholesale wallet!`;
            setSpeechText(announce);
            announceOutLoud(announce);
          } else {
            const rejectAnnounce = "Sorry, credit score is not sufficient to issue instant lending limit.";
            setSpeechText(rejectAnnounce);
            announceOutLoud(rejectAnnounce);
          }
        } catch (e) {
          console.error(e);
          setSpeechText("Error connecting to lending ledger.");
          setIsPlaying(false);
        }
      }, 1500);
    }, 1500);
  };

  return (
    <div className="bg-glass border-glass p-5 rounded-2xl shadow-glow flex flex-col items-center justify-between h-[360px]">
      
      {/* Soundbox Header */}
      <div className="w-full flex justify-between items-center pb-2 border-b border-black/5">
        <span className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wider">Paytm Soundbox 4.0</span>
        
        {/* Toggle Sound */}
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (soundEnabled) window.speechSynthesis.cancel();
          }}
          className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border transition-colors ${
            soundEnabled 
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-600 border-red-500/20'
          }`}
        >
          AUDIO: {soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Physical Device Shell */}
      <div className="relative w-40 h-40 bg-gradient-to-br from-[#00b9f1] to-[#005c78] rounded-3xl border border-[#ffffff30] flex flex-col items-center justify-center p-4 shadow-[0_12px_24px_rgba(0,185,241,0.2)] transition-all duration-300 hover:scale-105">
        
        {/* White border insert */}
        <div className="absolute inset-2 border border-white/10 rounded-2xl pointer-events-none" />

        {/* LED Indicator Light */}
        <div className="absolute top-4 right-4 flex items-center justify-center">
          <span className="text-[7px] text-white/50 uppercase font-mono mr-1.5">LED</span>
          <span className={`w-3 h-3 rounded-full border border-black/20 transition-colors duration-300 ${
            isPlaying 
              ? 'bg-orange-500 shadow-[0_0_10px_#e67e22] animate-pulse' 
              : 'bg-emerald-500 shadow-[0_0_5px_#2ecc71]'
          }`} />
        </div>

        {/* Speaker Grill */}
        <div className="w-24 h-24 rounded-full bg-black/40 border border-white/10 flex flex-col items-center justify-center gap-1.5 p-2 shadow-inner">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500/40"></span>
          </div>
          <div className="text-[14px] font-bold text-white tracking-widest font-syne">paytm</div>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500/40"></span>
          </div>
        </div>

        {/* Brand footer logo */}
        <div className="absolute bottom-2 text-[8px] font-mono text-white/40 tracking-wider">AUDIO ASSISTANT</div>
      </div>

      {/* Interactive Controls */}
      <div className="w-full space-y-3">
        {/* Output display text */}
        <div className="bg-black/5 border-glass rounded-xl p-2.5 text-center min-h-[48px] flex items-center justify-center">
          <p className="text-[10px] text-gray-700 font-mono leading-relaxed truncate max-w-[280px]">
            {speechText}
          </p>
        </div>

        {/* Push-to-Talk emergency loan */}
        <button
          onClick={simulateVoiceLending}
          className="w-full py-2 bg-black text-white hover:bg-zinc-800 font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5 uppercase font-mono shadow-glow"
        >
          🎙️ Push-to-Talk: Voice Loan Request
        </button>
      </div>

    </div>
  );
};

export default SoundboxSimulator;
