import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioNumber, setTwilioNumber] = useState('');
  const [whatsappRecipient, setWhatsappRecipient] = useState('');
  const [saving, setSaving] = useState(false);

  // Load current settings on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings');
        const data = await response.json();
        setTwilioSid(data.twilioSid || '');
        setTwilioToken(data.twilioToken || '');
        setTwilioNumber(data.twilioNumber || '');
        setWhatsappRecipient(data.whatsappRecipient || '');
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twilioSid,
          twilioToken,
          twilioNumber,
          whatsappRecipient
        })
      });
      if (response.ok) {
        alert("Twilio credentials saved successfully!");
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#120F0D] border border-orange-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-glow p-6 space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-orange-500 font-bold font-mono uppercase text-xs tracking-wider">🛠️ API Integration Settings</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Info Tip */}
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 text-[10px] text-sky-400 font-mono leading-relaxed">
          <p className="font-bold uppercase mb-1">💡 Sandbox Integration Tip:</p>
          <p>Configure Twilio WhatsApp Sandbox to send real SMS updates to your mobile phone!</p>
          <ul className="list-disc pl-4 mt-1.5 space-y-0.5">
            <li>Find Account SID & Auth Token on Twilio Console dashboard.</li>
            <li>Use the designated sandbox sender number (e.g., +14155238886).</li>
            <li>Join the sandbox on your device (e.g. text 'join [sandbox code]' to the number).</li>
          </ul>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Twilio Account SID</label>
            <input
              type="text"
              value={twilioSid}
              onChange={(e) => setTwilioSid(e.target.value)}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#1A1614] border-glass rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Twilio Auth Token</label>
            <input
              type="password"
              value={twilioToken}
              onChange={(e) => setTwilioToken(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full bg-[#1A1614] border-glass rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Sender (WhatsApp From)</label>
              <input
                type="text"
                value={twilioNumber}
                onChange={(e) => setTwilioNumber(e.target.value)}
                placeholder="+14155238886"
                className="w-full bg-[#1A1614] border-glass rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Recipient (WhatsApp To)</label>
              <input
                type="text"
                value={whatsappRecipient}
                onChange={(e) => setWhatsappRecipient(e.target.value)}
                placeholder="+919876543210"
                className="w-full bg-[#1A1614] border-glass rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-extrabold rounded-lg transition-colors uppercase font-mono mt-2"
          >
            {saving ? 'Saving Config...' : 'Save API Settings'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SettingsPanel;
