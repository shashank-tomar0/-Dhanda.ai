import React, { useState, useEffect, useRef } from 'react';

const VoicePortal = ({ onActionTrigger, addLog }) => {
  const [isListening, setIsListening] = useState(false);
  const [textCommand, setTextCommand] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [displayText, setDisplayText] = useState('Ask me something like: "Mera dhanda kaisa chal raha hai"');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup browser Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'hi-IN'; // Set to Hindi/Indian English support

      rec.onstart = () => {
        setIsListening(true);
        setDisplayText('Sunkar rahi hoon... (Listening...)');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setDisplayText(`Aapne kaha: "${transcript}"`);
        sendVoiceCommand(transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        setDisplayText('Kripya dubara boliye, ya niche command type karein.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setDisplayText("Speech Recognition is not supported on this browser. Please type commands below.");
        return;
      }
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Clear any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a Hindi voice, otherwise use default
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(voice => voice.lang.includes('hi') || voice.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendVoiceCommand = async (commandStr) => {
    if (!commandStr.trim()) return;

    try {
      addLog("Vani (Voice Portal)", `Command sent: "${commandStr}"`);
      const response = await fetch('http://localhost:5000/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: commandStr })
      });

      const data = await response.json();
      setDisplayText(data.displayText);
      setSpokenResponse(data.spokenResponse);

      // Play back audio response
      speakText(data.spokenResponse);

      // Trigger action in parent dashboard (like switching tab)
      if (data.dashboardAction === 'SWITCH_VIEW') {
        onActionTrigger(data.viewTarget, data.triggerEvent);
      }
    } catch (err) {
      console.error(err);
      setDisplayText("Error communicating with Vani Voice Agent.");
    }
  };

  const handleSubmitText = (e) => {
    e.preventDefault();
    if (textCommand.trim()) {
      sendVoiceCommand(textCommand);
      setTextCommand('');
    }
  };

  return (
    <div className="flex flex-col p-6 rounded-2xl border-glass bg-glass shadow-glow h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold italic tracking-wider text-orange-500 text-glow-orange">VANI VOICE PORTAL</h2>
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase font-mono">Bilingual Intent AI</span>
        </div>

        {/* Display Status or Speech bubble */}
        <div className="bg-[#120F0D] border-glass rounded-xl p-4 min-h-[100px] mb-6 flex flex-col justify-between">
          <p className="text-sm text-gray-300 italic leading-relaxed">
            {displayText}
          </p>
          {spokenResponse && (
            <p className="text-xs text-purple-400 font-mono mt-3 text-right">
              🔊 Vani: "{spokenResponse}"
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Glowing Mic button */}
        <div className="flex justify-center">
          <button
            onClick={toggleListen}
            className={`w-16 h-16 rounded-full flex items-center justify-center border-glass transition-all duration-300 ${
              isListening 
                ? 'bg-red-500/25 border-red-500 animate-pulse text-red-500' 
                : 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500 text-orange-500 hover:scale-105'
            }`}
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        {/* Text fallback input */}
        <form onSubmit={handleSubmitText} className="flex gap-2">
          <input
            type="text"
            value={textCommand}
            onChange={(e) => setTextCommand(e.target.value)}
            placeholder="Type query (e.g. sales report, check sugar)"
            className="flex-1 bg-[#1A1614] border-glass rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Ask Vani
          </button>
        </form>
      </div>
    </div>
  );
};

export default VoicePortal;
