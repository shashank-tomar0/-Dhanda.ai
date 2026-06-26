import React, { useEffect, useRef } from 'react';

const AgentTicker = ({ logs, onClear }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper to color-code agent outputs
  const getAgentStyles = (agentName) => {
    const name = agentName.toLowerCase();
    if (name.includes('cf') || name.includes('chanakya')) {
      return { label: 'text-[#2ECC71]', border: 'border-[#2ECC71]/20', bg: 'bg-[#2ECC71]/5' };
    }
    if (name.includes('procure') || name.includes('kuber')) {
      return { label: 'text-[#E67E22]', border: 'border-[#E67E22]/20', bg: 'bg-[#E67E22]/5' };
    }
    if (name.includes('marketing') || name.includes('vyas')) {
      return { label: 'text-[#00B9F1]', border: 'border-[#00B9F1]/20', bg: 'bg-[#00B9F1]/5' };
    }
    if (name.includes('voice') || name.includes('vani')) {
      return { label: 'text-[#9B59B6]', border: 'border-[#9B59B6]/20', bg: 'bg-[#9B59B6]/5' };
    }
    return { label: 'text-gray-400', border: 'border-white/5', bg: 'bg-white/5' };
  };

  return (
    <div className="bg-glass border-glass rounded-2xl shadow-glow overflow-hidden h-[240px] flex flex-col justify-between">
      {/* Header */}
      <div className="p-3 border-b border-white/5 bg-glass flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <h2 className="text-xs font-bold tracking-wider uppercase text-gray-200 font-mono">Dhanda Agent Logs Ticker</h2>
        </div>
        <button
          onClick={onClear}
          className="text-[9px] font-mono text-gray-500 hover:text-orange-500 transition-colors uppercase"
        >
          Clear Stream
        </button>
      </div>

      {/* Logger Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-[10px] md:text-xs bg-[#0E0C0B]">
        {logs.length === 0 ? (
          <p className="text-gray-500 italic text-center mt-12">Waiting for agent thoughts and network messages...</p>
        ) : (
          logs.map((log, idx) => {
            const styles = getAgentStyles(log.agent);
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            return (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border ${styles.border} ${styles.bg} flex items-start gap-3 transition-all duration-300 animate-fadeIn`}
              >
                <span className="text-gray-500 shrink-0 select-none">[{timeStr}]</span>
                <div className="flex-1">
                  <span className={`font-bold mr-1.5 ${styles.label}`}>[{log.agent}]:</span>
                  <span className="text-gray-300 leading-relaxed">{log.message}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default AgentTicker;
