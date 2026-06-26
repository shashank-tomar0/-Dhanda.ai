import React, { useState } from 'react';
import ObsidianCore from './ObsidianCore';

const LandingPage = ({ onGetStarted }) => {
  const [activeAgent, setActiveAgent] = useState('landing');
  const [openMilestone, setOpenMilestone] = useState(1);
  const [openFAQ, setOpenFAQ] = useState(null);

  const agentDetails = {
    landing: {
      name: "Dhanda Swarm Engine",
      role: "System Swarm Manager",
      description: "Dhanda.ai connects your storefront with a synchronized multi-agent system. Select an agent below to preview its specialized WebGL morphing shape, transaction streams, and autonomous tasks.",
      logs: [
        "● [System] Swarm core initializing...",
        "● [System] Active nodes connected: 284 Kirana outlets",
        "● [System] Awaiting instruction command..."
      ]
    },
    cfo: {
      name: "Chanakya CFO",
      role: "Automated Accountant",
      description: "Audits every checkout ticket, runs OCR scans on wholesale bills, projects monthly cash flow, and automatically reports daily GST summaries to Paytm Soundbox wallets.",
      logs: [
        "● [Chanakya] Scanned invoice: Bharat provisions (Rice) - ₹5,200",
        "● [Chanakya] Recalculating Paytm Soundbox credit line scorecard...",
        "● [Chanakya] Credit limit boosted to ₹3,10,000 (+15%)"
      ]
    },
    procurement: {
      name: "Kuber Supply",
      role: "Syndicate Negotiator",
      description: "Monitors inventory levels. If items fall below safety limits, Kuber pools demand with neighboring shops, forms a Kirana Cartel, and negotiates wholesale discounts.",
      logs: [
        "● [Kuber] Sugar stock level dropped to 8 units (Critical)",
        "------------- Kirana Cartel Pooled Order -------------",
        "● [Kuber] Aggregating demand with Verma & Gupta stores: 320 units",
        "● [Kuber] Supplier accepted syndicate contract price: ₹31/unit (MRP ₹44)"
      ]
    },
    marketing: {
      name: "Vyas Marketing",
      role: "Loyalty Reactivation",
      description: "Triggers personalized customer outreach. Scans checkout histories, segments dormant accounts, and drafts customized WhatsApp offers with direct Paytm payment links.",
      logs: [
        "● [Vyas] Dormant segment check complete: 18 customers identified",
        "● [Vyas] Dispatched Twilio WhatsApp offer to Aarav Sharma (+91987...)",
        "● [Vyas] Customer reply recorded: 'YES'. Order confirmed!"
      ]
    },
    voice: {
      name: "Vani Voice",
      role: "Intent Processing Portal",
      description: "Our conversational gateway. Transcribes spoken commands, checks ledger balances, creates sales invoices, and launches cartel restocks from natural voice chats.",
      logs: [
        "● [Vani] Audio packet received: 'basmati chawal kitna bacha hai'",
        "● [Vani] Extracting inventory search query for Basmati Rice...",
        "● [Vani] Spoken response: 'Aapke paas 45 units Basmati Rice bacha hai.'"
      ]
    }
  };

  const milestones = [
    {
      id: 1,
      title: "1. Register & Seed Store",
      description: "Create an account. Our system dynamically spawns an isolated database profile pre-populated with standard Kirana stock lines and mock cash flow ledger entries."
    },
    {
      id: 2,
      title: "2. Paytm Merchant Integration",
      description: "Input your Paytm Merchant ID (MID) and UPI VPA. This configures the scanning gateway to generate real Paytm UPI QR codes for checkouts and restocking payments."
    },
    {
      id: 3,
      title: "3. Twilio API Sandbox",
      description: "Link your Twilio API account SID and WhatsApp sandbox sender. Your agents can now text real WhatsApp restocking alerts and personalized customer campaign offers."
    },
    {
      id: 4,
      title: "4. Autonomous Swarm Automation",
      description: "Your agents run in background loops. Chanakya audits sales, Kuber automatically bargains with suppliers, and Vyas secures client retention campaigns 24/7."
    }
  ];

  const faqs = [
    {
      q: "How does the Kirana Cartel syndicate restock work?",
      a: "When your stock drops below the threshold, Kuber scans nearby store inventories in the database. If it finds neighbors with low stock, it groups your orders together to negotiate a bulk volume discount from the supplier, saving you up to 20% on catalog prices."
    },
    {
      q: "Is it safe to enter my real Paytm Merchant ID and Keys?",
      a: "Yes. All credentials are saved strictly inside your local database instance. They are only utilized to build standard merchant QR payment deep links (upi://pay) and fetch ledger summaries."
    },
    {
      q: "Can I test the system without real Twilio credentials?",
      a: "Absolutely. If Twilio credentials are left blank during onboarding, the WhatsApp agents will automatically run in sandbox simulation mode. You will see their logs in the dashboard ticker without sending SMS messages."
    }
  ];

  const currentAgent = agentDetails[activeAgent];

  return (
    <div className="min-h-screen text-[#1D1D1F] font-sans flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F7]">
      
      {/* Background Grid Lines and Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-black/[0.01] blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-black/[0.015] blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Header bar */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-widest font-syne uppercase text-black">
            Dhanda.ai
          </h1>
          <span className="text-[8px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-black text-white">
            OS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onGetStarted}
            className="text-xs font-semibold hover:text-black text-gray-500 transition-colors uppercase tracking-wider"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-black/90 rounded-full transition-all shadow-glow transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 flex-grow z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Text */}
        <div className="lg:col-span-7 space-y-8 text-left max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 border border-black/5 text-[9px] uppercase font-bold tracking-wider text-gray-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-ping" />
            V1.0.0 Now Live - Noida Kirana Syndicate
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-outfit leading-[1.05] tracking-tight text-black">
            The Autonomous <br />
            <span className="bg-gradient-to-r from-black via-gray-600 to-black bg-clip-text text-transparent">
              Kirana Swarm OS
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed font-sans">
            Replace manual bookkeeping, inventory guesses, and bulk supplier negotiations with an AI-driven merchant swarm. Connect your real Paytm Soundbox, configure Twilio notifications, and trade at cartel-scale with neighboring shops.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-black/90 rounded-full transition-all shadow-lg shadow-black/10 hover:shadow-black/20 transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Start Free Trial →
            </button>
            <a
              href="#console"
              className="px-8 py-4 text-xs font-bold uppercase tracking-wider border border-black/10 bg-white hover:bg-gray-50 text-black rounded-full transition-all text-center flex items-center justify-center"
            >
              Interactive Agent Preview
            </a>
          </div>

          {/* Micro stats banner */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-black/5 font-mono text-[10px] text-gray-500">
            <div>
              <p className="text-lg font-bold text-black font-outfit">280+</p>
              <p className="uppercase tracking-wider mt-0.5">NCR Stores</p>
            </div>
            <div>
              <p className="text-lg font-bold text-black font-outfit">₹48L+</p>
              <p className="uppercase tracking-wider mt-0.5">Pooled Orders</p>
            </div>
            <div>
              <p className="text-lg font-bold text-black font-outfit">18.5%</p>
              <p className="uppercase tracking-wider mt-0.5">Margin Boost</p>
            </div>
          </div>
        </div>

        {/* Right Hero Visuals - Interactive Agent Swarm Console */}
        <div id="console" className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
          <div className="w-full max-w-[420px] bg-white border border-black/5 shadow-glow rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden backdrop-blur-lg glare-container">
            
            {/* Console Header */}
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-widest text-gray-400">
                [Agent Console Interactive]
              </div>
              <span className="text-[8px] uppercase font-mono text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ready to Morph
              </span>
            </div>

            {/* Canvas WebGL morpher */}
            <div className="w-full h-48 flex items-center justify-center relative">
              <ObsidianCore activeAgent={activeAgent} logs={[]} />
            </div>

            {/* Agent Selector Controls */}
            <div className="grid grid-cols-5 gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-black/5">
              {['landing', 'cfo', 'procurement', 'marketing', 'voice'].map((agent) => (
                <button
                  key={agent}
                  onClick={() => setActiveAgent(agent)}
                  className={`py-2 text-[8px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeAgent === agent 
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {agent === 'procurement' ? 'Kuber' : agent === 'landing' ? 'Core' : agent}
                </button>
              ))}
            </div>

            {/* Dynamic Console details */}
            <div className="bg-[#FAF9F7] border border-black/5 rounded-2xl p-4 text-left space-y-2 animate-fadeIn" key={activeAgent}>
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-black font-outfit text-black">{currentAgent.name}</h4>
                <span className="text-[8px] uppercase font-mono font-bold text-gray-400">{currentAgent.role}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed font-sans">{currentAgent.description}</p>
              
              {/* Ticker logs */}
              <div className="pt-2 border-t border-black/5 space-y-1">
                <span className="text-[7.5px] uppercase font-mono text-gray-400 tracking-wider">Live Agent Thought Log:</span>
                <div className="font-mono text-[8.5px] text-gray-600 leading-relaxed space-y-0.5">
                  {currentAgent.logs.map((log, idx) => (
                    <p key={idx} className={log.includes('System') ? 'text-gray-400' : 'text-black'}>{log}</p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Feature Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-20 border-t border-black/5 bg-white/50 backdrop-blur-sm z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-mono">
            / The Five Pillars of Kirana Swarm OS /
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold font-outfit tracking-tight text-black">
            Designed for Real, Mock-Free Integration
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-sans">
            Connect your own APIs. No fake simulations. Input your Paytm credentials and Twilio sandbox numbers to automate WhatsApp client marketing campaigns and wholesale restock negotiations immediately.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white hover:bg-[#FAF9F7] border border-black/5 rounded-2xl p-6 transition-all duration-300 shadow-glow hover:shadow-lg flex flex-col justify-between group glare-container">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-lg">
                💸
              </div>
              <h4 className="text-base font-bold text-black font-outfit">Chanakya CFO Hub</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Real-time financial auditing. Scans invoice bills with OCR, calculates instant credit eligibility scorecards, forecasts future cash flows, and processes immediate Paytm loan disbursements.
              </p>
            </div>
            <div className="pt-6 font-mono text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
              // Automated Underwriting
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white hover:bg-[#FAF9F7] border border-black/5 rounded-2xl p-6 transition-all duration-300 shadow-glow hover:shadow-lg flex flex-col justify-between group glare-container">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-lg">
                🤝
              </div>
              <h4 className="text-base font-bold text-black font-outfit">Kuber Kirana Syndicate</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Pooled buying power. If your sugar stock drops below limits, Kuber checks neighbor stock levels, forms a syndicate cartel automatically, and negotiates bulk discounts with wholesalers.
              </p>
            </div>
            <div className="pt-6 font-mono text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
              // Wholesale Negotiations
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white hover:bg-[#FAF9F7] border border-black/5 rounded-2xl p-6 transition-all duration-300 shadow-glow hover:shadow-lg flex flex-col justify-between group glare-container">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-lg">
                📣
              </div>
              <h4 className="text-base font-bold text-black font-outfit">Vyas Marketing Swarm</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Loyalty reactivation. Automatically segments dormant store clients who haven't ordered recently. Generates personalized discounts and texts them via Twilio WhatsApp with instant payment links.
              </p>
            </div>
            <div className="pt-6 font-mono text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
              // WhatsApp Campaign Swarms
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white hover:bg-[#FAF9F7] border border-black/5 rounded-2xl p-6 transition-all duration-300 shadow-glow hover:shadow-lg flex flex-col justify-between group glare-container">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-lg">
                🎙️
              </div>
              <h4 className="text-base font-bold text-black font-outfit">Vani Voice Portal</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Voice command intent portal. Dictate invoices, query stock limits, check daily profits, or order rice. Vani processes spoken transcription and updates the dashboard instantly.
              </p>
            </div>
            <div className="pt-6 font-mono text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
              // Voice Intent Processing
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white hover:bg-[#FAF9F7] border border-black/5 rounded-2xl p-6 transition-all duration-300 shadow-glow hover:shadow-lg flex flex-col justify-between group glare-container">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-lg">
                📹
              </div>
              <h4 className="text-base font-bold text-black font-outfit">CCTV Spatial Twin</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                YOLOv8 layout visualizer. Integrates local camera feeds, maps bounding-box triggers for depleted product racks, alerts on stock theft warnings, and synchronizes warehouse inventory counts.
              </p>
            </div>
            <div className="pt-6 font-mono text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
              // YOLOv8 Computer Vision
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white hover:bg-[#FAF9F7] border border-black/5 rounded-2xl p-6 transition-all duration-300 shadow-glow hover:shadow-lg flex flex-col justify-between group glare-container">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center text-lg">
                💳
              </div>
              <h4 className="text-base font-bold text-black font-outfit">Paytm soundbox scan</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Real UPI code. Enter your merchant Paytm details to generate valid QR codes. Wholesalers scan QR codes on deliveries, releasing funds instantly through the Paytm Soundbox merchant ledger.
              </p>
            </div>
            <div className="pt-6 font-mono text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
              // Live Paytm & UPI QR Codes
            </div>
          </div>

        </div>
      </section>

      {/* How it Works Milestone Section */}
      <section className="relative w-full max-w-5xl mx-auto px-6 py-16 border-t border-black/5 bg-[#FAF9F7] rounded-3xl mb-20 shadow-inner z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 text-left space-y-4">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-widest">// The Onboarding Path</span>
            <h3 className="text-3xl font-extrabold font-outfit tracking-tight text-black">
              Setting Up Your Isolated Kirana Swarm
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Unlock the B2B Kirana syndicate. Follow our checklist to initialize multi-tenant database entries, link Paytm merchants, and connect Twilio sandbox lines.
            </p>
          </div>

          {/* Stepper timeline list */}
          <div className="lg:col-span-7 space-y-3.5">
            {milestones.map((m) => {
              const isOpen = openMilestone === m.id;
              return (
                <div 
                  key={m.id}
                  onClick={() => setOpenMilestone(m.id)}
                  className={`bg-white border rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 ${
                    isOpen ? 'border-black shadow-glow' : 'border-black/5 hover:border-black/20'
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-black font-mono tracking-wider">{m.title}</h4>
                    <span className="text-xs text-gray-400">{isOpen ? '▼' : '►'}</span>
                  </div>
                  
                  {isOpen && (
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-2 pt-2 border-t border-black/5 animate-slideUp">
                      {m.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative w-full max-w-3xl mx-auto px-6 py-16 border-t border-black/5 z-10 mb-10">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-widest">// Common Enquiries</span>
          <h3 className="text-2xl font-black font-outfit text-black">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isFaqOpen = openFAQ === idx;
            return (
              <div 
                key={idx}
                onClick={() => setOpenFAQ(isFaqOpen ? null : idx)}
                className="bg-white border border-black/5 rounded-2xl p-5 cursor-pointer hover:border-black/10 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-black font-outfit">{faq.q}</h4>
                  <span className="text-gray-400 font-bold text-xs">{isFaqOpen ? '−' : '+'}</span>
                </div>
                
                {isFaqOpen && (
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-3 pt-3 border-t border-black/5 animate-slideUp">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-mono uppercase tracking-wider bg-white/40 backdrop-blur-md z-15">
        <span>© 2026 Dhanda.ai OS Technologies Inc.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-black">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-black">Terms of Service</a>
          <span>·</span>
          <a href="#" className="hover:text-black">Paytm API Sandbox</a>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
