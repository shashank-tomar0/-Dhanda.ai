import React, { useEffect, useRef, useState } from 'react';

const VoiceNegotiator = ({ negotiations }) => {
  const canvasRef = useRef(null);
  const [activeCall, setActiveCall] = useState(null);

  // Check if any negotiation is actively negotiating or waiting approval
  useEffect(() => {
    if (negotiations && negotiations.length > 0) {
      // Find latest active negotiation
      const active = negotiations.find(n => n.status === 'NEGOTIATING' || n.status === 'WAITING_APPROVAL');
      if (active) {
        setActiveCall(active);
      } else {
        setActiveCall(null);
      }
    } else {
      setActiveCall(null);
    }
  }, [negotiations]);

  // Audio Canvas Soundwave Visualizer
  useEffect(() => {
    if (!activeCall || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 300;
    const height = canvas.height = 80;

    let animId;
    let t = 0;

    const drawSoundwave = () => {
      animId = requestAnimationFrame(drawSoundwave);
      t += 0.15;

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      
      // Select wave color based on caller state
      // Pulsing purple for active call
      ctx.strokeStyle = activeCall.status === 'WAITING_APPROVAL' ? '#E67E22' : '#9B59B6';

      const amplitude = activeCall.status === 'WAITING_APPROVAL' ? 4 : 20; // lower amplitude when waiting/quiet
      
      for (let i = 0; i < width; i++) {
        // Multi-frequency wave calculation
        const y = (height / 2) + 
          Math.sin(i * 0.05 + t) * amplitude * Math.sin(i * 0.01) + 
          Math.cos(i * 0.1 - t * 0.5) * (amplitude / 3) * Math.sin(i * 0.02);
        
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }
      ctx.stroke();

      // Draw secondary mirror shadow wave
      ctx.beginPath();
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(155, 89, 182, 0.2)';
      for (let i = 0; i < width; i++) {
        const y = (height / 2) - 
          Math.sin(i * 0.04 - t) * (amplitude / 1.5) * Math.sin(i * 0.015);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
    };

    drawSoundwave();

    return () => cancelAnimationFrame(animId);
  }, [activeCall]);

  if (!activeCall) return null;

  // Get last 2 chat logs for quick overview bubble
  const chatLogs = activeCall.log || [];
  const displayLogs = chatLogs.slice(-2);

  return (
    <div className="bg-[#120F0D] border border-purple-500/35 p-5 rounded-2xl shadow-glow max-w-sm w-full font-mono text-xs flex flex-col justify-between h-[340px] animate-fadeIn relative overflow-hidden">
      
      {/* Red lava background pulse to represent call heat */}
      <div className="absolute inset-0 bg-purple-500/5 animate-pulse pointer-events-none" />

      {/* Header call info */}
      <div className="flex justify-between items-center z-10 pb-2 border-b border-white/5">
        <span className="text-[10px] text-purple-400 font-bold tracking-wider flex items-center gap-1 uppercase">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          Voice-to-Voice Bargaining
        </span>
        <span className="text-[9px] text-gray-400">00:42</span>
      </div>

      {/* Avatars */}
      <div className="flex justify-around items-center z-10 my-2">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/50 flex items-center justify-center font-bold text-sm text-orange-500 shadow-glow">
            KB
          </div>
          <span className="text-[9px] text-gray-300 font-bold mt-1.5 uppercase">Kuber (AI)</span>
        </div>
        
        <span className="text-gray-500 font-bold text-sm animate-pulse">📞 VS 📞</span>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-500 shadow-glow">
            SP
          </div>
          <span className="text-[9px] text-gray-300 font-bold mt-1.5 uppercase truncate max-w-[90px]">Supplier</span>
        </div>
      </div>

      {/* Pulsing Waveform */}
      <div className="flex justify-center items-center h-20 bg-black/40 border-glass rounded-xl z-10 shadow-inner p-1">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Transcription overlay bubble */}
      <div className="bg-black/30 border-glass rounded-xl p-2.5 z-10 flex-1 my-2 overflow-y-auto max-h-[80px] flex flex-col justify-end space-y-1.5">
        {displayLogs.map((log, idx) => (
          <div key={idx} className="text-[9px] leading-relaxed">
            <span className={log.sender.startsWith('Kuber') ? 'text-orange-400 font-bold' : 'text-purple-400 font-bold'}>
              {log.sender}:
            </span>
            <span className="text-gray-300 ml-1">"{log.message}"</span>
          </div>
        ))}
      </div>

      {/* Call footer buttons */}
      <div className="flex gap-2 z-10">
        <div className="flex-1 bg-glass border-glass rounded-lg text-[9px] text-gray-400 flex items-center justify-center font-bold p-1 uppercase">
          🔊 Speaker: ON
        </div>
        <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] text-red-500 flex items-center justify-center font-bold p-1 uppercase">
          📞 WebRTC active
        </div>
      </div>

    </div>
  );
};

export default VoiceNegotiator;
