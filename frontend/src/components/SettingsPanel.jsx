import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ isOpen, onClose, storeId }) => {
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioNumber, setTwilioNumber] = useState('');
  const [whatsappRecipient, setWhatsappRecipient] = useState('');
  const [paytmMid, setPaytmMid] = useState('');
  const [paytmVpa, setPaytmVpa] = useState('');
  const [wholesalerPhone, setWholesalerPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Load current settings on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchSettings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/settings?storeId=${storeId || 'ramesh'}`);
        const data = await response.json();
        setTwilioSid(data.twilioSid || '');
        setTwilioToken(data.twilioToken || '');
        setTwilioNumber(data.twilioNumber || '');
        setWhatsappRecipient(data.whatsappRecipient || '');
        setPaytmMid(data.paytmMid || '');
        setPaytmVpa(data.paytmVpa || '');
        setWholesalerPhone(data.wholesalerPhone || '');
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    fetchSettings();
  }, [isOpen, storeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/settings?storeId=${storeId || 'ramesh'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twilioSid,
          twilioToken,
          twilioNumber,
          whatsappRecipient,
          paytmMid,
          paytmVpa,
          wholesalerPhone
        })
      });
      if (response.ok) {
        alert("API Settings updated successfully!");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Error saving API keys.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-black/5 rounded-3xl w-full max-w-md overflow-hidden shadow-glow p-6 space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-black font-bold font-mono uppercase text-xs tracking-wider">🛠️ API Integration Settings</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info Tip */}
        <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-3.5 text-[10px] text-sky-600 font-mono leading-relaxed">
          <p className="font-bold uppercase mb-1">💡 Sandbox Integration Tip:</p>
          <p>Configure Twilio WhatsApp Sandbox to send real updates to your mobile phone!</p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-left">
          
          {/* Paytm Section */}
          <div className="space-y-2 border-b border-black/5 pb-3">
            <h4 className="text-[10px] font-bold text-black font-mono uppercase tracking-wider">Paytm Business Credentials</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">Paytm MID</label>
                <input
                  type="text"
                  value={paytmMid}
                  onChange={(e) => setPaytmMid(e.target.value)}
                  placeholder="MIDxxxxxxxxx"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">UPI VPA</label>
                <input
                  type="text"
                  value={paytmVpa}
                  onChange={(e) => setPaytmVpa(e.target.value)}
                  placeholder="name@paytm"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>
          </div>

          {/* Twilio Section */}
          <div className="space-y-2 border-b border-black/5 pb-3">
            <h4 className="text-[10px] font-bold text-black font-mono uppercase tracking-wider">Twilio WhatsApp Config</h4>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">Twilio Account SID</label>
              <input
                type="text"
                value={twilioSid}
                onChange={(e) => setTwilioSid(e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">Twilio Auth Token</label>
              <input
                type="password"
                value={twilioToken}
                onChange={(e) => setTwilioToken(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">Sender (From)</label>
                <input
                  type="text"
                  value={twilioNumber}
                  onChange={(e) => setTwilioNumber(e.target.value)}
                  placeholder="+14155238886"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">Recipient (To)</label>
                <input
                  type="text"
                  value={whatsappRecipient}
                  onChange={(e) => setWhatsappRecipient(e.target.value)}
                  placeholder="+91xxxxxxxxxx"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>
          </div>

          {/* Supplier Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-black font-mono uppercase tracking-wider">Wholesaler Contacts</h4>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-gray-400 font-mono block">Wholesaler WhatsApp Phone</label>
              <input
                type="text"
                value={wholesalerPhone}
                onChange={(e) => setWholesalerPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="w-full bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-black font-semibold focus:outline-none focus:border-black font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-black hover:bg-black/90 text-white font-extrabold rounded-xl transition-colors uppercase font-mono mt-3 shadow-md shadow-black/10"
          >
            {saving ? 'Saving Config...' : 'Save API Settings'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SettingsPanel;
