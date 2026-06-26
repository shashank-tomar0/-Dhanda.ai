import React, { useState } from 'react';

const OnboardingWizard = ({ user, onOnboardingComplete }) => {
  const [step, setStep] = useState(1);
  
  // Form fields
  const [storeName, setStoreName] = useState(`${user.username.charAt(0).toUpperCase() + user.username.slice(1)}'s Kirana Store`);
  const [city, setCity] = useState('Noida, Sector 62');
  
  // Paytm credentials
  const [paytmMid, setPaytmMid] = useState('');
  const [paytmKey, setPaytmKey] = useState('');
  const [paytmVpa, setPaytmVpa] = useState('');
  
  // Twilio & Wholesaler settings
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioNumber, setTwilioNumber] = useState('');
  const [whatsappRecipient, setWhatsappRecipient] = useState('');
  const [wholesalerPhone, setWholesalerPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!storeName || !city) {
        setError("Please enter your Store Name and Location.");
        return;
      }
    } else if (step === 2) {
      // Allow moving next even if Paytm is partially empty, but remind them it makes it real.
      setError('');
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      storeId: user.storeId,
      storeName,
      city,
      credentials: {
        paytmMid,
        paytmKey,
        paytmVpa: paytmVpa || `${user.username.toLowerCase()}@paytm`,
        twilioSid,
        twilioToken,
        twilioNumber,
        whatsappRecipient,
        wholesalerPhone
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/stores/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Onboarding failed");
      }

      if (data.success) {
        onOnboardingComplete(data.store);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[#1D1D1F] font-sans flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F7] px-4 py-12">
      {/* Background Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      {/* Card container */}
      <div className="relative w-full max-w-lg bg-white/70 border border-black/5 rounded-3xl p-8 md:p-10 shadow-glow backdrop-blur-lg space-y-8 animate-fadeIn">
        
        {/* Header / Step Tracker */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2">
            <h1 className="text-lg font-black tracking-widest font-syne uppercase text-black">
              Dhanda.ai
            </h1>
            <span className="text-[7px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-black text-white">
              ONBOARDING
            </span>
          </div>
          
          <h2 className="text-2xl font-bold font-outfit text-black tracking-tight">
            {step === 1 && 'Store Setup'}
            {step === 2 && 'Paytm Merchant Settings'}
            {step === 3 && 'Twilio & WhatsApp Integrations'}
          </h2>
          
          {/* Progress Indicators */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-black' : 'bg-black/10'}`} />
            <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-black' : 'bg-black/10'}`} />
            <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-black' : 'bg-black/10'}`} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Step Form Render */}
        <form onSubmit={step === 3 ? handleSubmit : handleNextStep} className="space-y-6">
          
          {/* STEP 1: Store Setup */}
          {step === 1 && (
            <div className="space-y-5 animate-slideUp">
              <div className="space-y-1 text-left">
                <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Verma Provisions Store"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-semibold text-black transition-all"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">City / Location</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Noida, Sector 98"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-semibold text-black transition-all"
                />
              </div>

              <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 text-[10px] text-sky-600 font-mono leading-relaxed text-left">
                <p className="font-bold uppercase mb-1">💡 Initializing Database Tenant</p>
                <p>Completing this wizard seeds a pristine SQLite JSON tenant environment populated with standard inventory lines (rice, flour, oil) and empty negotiation ledgers.</p>
              </div>
            </div>
          )}

          {/* STEP 2: Paytm settings */}
          {step === 2 && (
            <div className="space-y-5 animate-slideUp">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-[10px] text-amber-700 font-mono leading-relaxed text-left">
                <p className="font-bold uppercase mb-1">🔑 Real Paytm Integration (Optional)</p>
                <p>Provide valid Paytm details to construct real UPI QR payments inside the Restock and Soundbox simulator panels. You can leave these blank to run in mock sandbox mode.</p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Paytm Merchant ID (MID)</label>
                <input
                  type="text"
                  value={paytmMid}
                  onChange={(e) => setPaytmMid(e.target.value)}
                  placeholder="MIDxxxxxxxxx"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Paytm Merchant Key</label>
                  <input
                    type="password"
                    value={paytmKey}
                    onChange={(e) => setPaytmKey(e.target.value)}
                    placeholder="Merchant Secret Key"
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Paytm Merchant UPI VPA</label>
                  <input
                    type="text"
                    value={paytmVpa}
                    onChange={(e) => setPaytmVpa(e.target.value)}
                    placeholder="e.g. 9876543210@paytm"
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Twilio & WhatsApp settings */}
          {step === 3 && (
            <div className="space-y-4 animate-slideUp">
              <div className="bg-[#2ECC71]/5 border border-[#2ECC71]/10 rounded-2xl p-4 text-[10px] text-[#27AE60] font-mono leading-relaxed text-left">
                <p className="font-bold uppercase mb-1">💬 Twilio WhatsApp Swarm Setup</p>
                <p>Automate real WhatsApp texts to suppliers and dormant client segments. Configure your free sandbox credentials from your Twilio Console.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Twilio Account SID</label>
                  <input
                    type="text"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Twilio Auth Token</label>
                  <input
                    type="password"
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    placeholder="Auth Token"
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Sender (WhatsApp From)</label>
                  <input
                    type="text"
                    value={twilioNumber}
                    onChange={(e) => setTwilioNumber(e.target.value)}
                    placeholder="e.g. +14155238886"
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Your Phone (WhatsApp To)</label>
                  <input
                    type="text"
                    value={whatsappRecipient}
                    onChange={(e) => setWhatsappRecipient(e.target.value)}
                    placeholder="e.g. +91XXXXXXXXXX"
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left font-mono">
                <label className="text-[9px] uppercase font-bold text-gray-400 block">Wholesaler WhatsApp number</label>
                <input
                  type="text"
                  value={wholesalerPhone}
                  onChange={(e) => setWholesalerPhone(e.target.value)}
                  placeholder="e.g. +919876543210 (For real negotiations)"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black text-black transition-all"
                />
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div className="flex gap-4 pt-4 border-t border-black/5">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 py-3 border border-black/10 hover:bg-gray-50 text-black font-bold rounded-xl transition-all uppercase tracking-wider text-xs"
              >
                Back
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 bg-black hover:bg-black/90 text-white font-extrabold rounded-xl transition-all uppercase tracking-wider text-xs shadow-md shadow-black/10 transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading 
                ? 'Saving Details...' 
                : step === 3 
                  ? 'Complete Onboarding →' 
                  : 'Continue'
              }
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default OnboardingWizard;
