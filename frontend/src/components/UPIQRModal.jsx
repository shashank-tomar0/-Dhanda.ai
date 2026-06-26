import React, { useEffect, useState } from 'react';

const UPIQRModal = ({ isOpen, onClose, amount, payeeName, orderDetails }) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose(); // auto close when expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate a mock but highly realistic-looking SVG QR Code matrix pattern
  const renderMockQR = () => {
    // Generate pseudo-random grid paths based on the amount to make each transaction visual unique!
    const hash = (amount * 17) % 31;
    const paths = [];
    for (let r = 0; r < 25; r++) {
      for (let c = 0; c < 25; c++) {
        // Leave margins for the corner square targets (position detection patterns)
        const isCorner = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
        if (isCorner) continue;

        // Pseudo-random check
        const isFilled = ((r * c + hash + (r % 3) * (c % 2)) % 2) === 0;
        if (isFilled) {
          paths.push(`M ${c * 4} ${r * 4} h 4 v 4 h -4 Z`);
        }
      }
    }

    return (
      <svg viewBox="0 0 100 100" className="w-48 h-48 bg-white p-2.5 rounded-lg">
        {/* Positional Targets (Top-Left) */}
        <path d="M 0 0 h 28 v 28 h -28 Z M 4 4 h 20 v 20 h -20 Z M 8 8 h 12 v 12 h -12 Z" fill="black" />
        {/* Positional Targets (Top-Right) */}
        <path d="M 72 0 h 28 v 28 h -28 Z M 76 4 h 20 v 20 h -20 Z M 80 8 h 12 v 12 h -12 Z" fill="black" />
        {/* Positional Targets (Bottom-Left) */}
        <path d="M 0 72 h 28 v 28 h -28 Z M 4 76 h 20 v 20 h -20 Z M 8 80 h 12 v 12 h -12 Z" fill="black" />
        {/* Positional Targets (Bottom-Right Alignment Dot) */}
        <path d="M 80 80 h 8 v 8 h -8 Z" fill="black" />
        
        {/* Data Pattern */}
        <path d={paths.join(' ')} fill="black" />
        
        {/* UPI Center Logo backing */}
        <rect x="40" y="40" width="20" height="20" rx="3" fill="white" />
        <text x="50" y="52" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#0979B9" fontFamily="sans-serif">UPI</text>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#120F0D] border border-orange-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-glow text-center p-6 space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B9F1] inline-block animate-ping"></span>
            <span className="text-[10px] uppercase font-bold text-gray-200 font-mono tracking-wider">Paytm UPI Scan-to-Pay</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <span className="text-[9px] uppercase text-gray-400 font-mono">Invoice Amount Due</span>
          <h2 className="text-3xl font-extrabold text-[#2ECC71] font-mono text-glow-emerald">₹{amount}</h2>
          <p className="text-[9px] text-gray-400 font-mono italic">{orderDetails}</p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center p-2 bg-[#1A1614] border-glass rounded-xl w-fit mx-auto shadow-inner">
          {renderMockQR()}
        </div>

        {/* UPI Payee Info */}
        <div className="text-[10px] text-gray-400 font-mono">
          <p>Payee: <span className="text-white font-bold">{payeeName}</span></p>
          <p className="text-[8px] text-gray-500 mt-0.5">UPI ID: paytmmerchant_{payeeName.toLowerCase().replace(/ /g, '')}@upi</p>
        </div>

        {/* Countdown */}
        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500 font-mono">
          <span>⚠️ Code expires in: {countdown}s</span>
          <span>Paytm Soundbox Secured</span>
        </div>

      </div>
    </div>
  );
};

export default UPIQRModal;
