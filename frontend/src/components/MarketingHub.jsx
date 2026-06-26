import React, { useState, useEffect } from 'react';

const MarketingHub = ({ chats, metrics, onRefresh, addLog }) => {
  const [selectedPhone, setSelectedPhone] = useState('');
  const [customerMsg, setCustomerMsg] = useState('');
  const [sending, setSending] = useState(false);

  // Group chats by phone number
  const chatGroups = {};
  chats.forEach(chat => {
    if (!chatGroups[chat.customer_phone]) {
      chatGroups[chat.customer_phone] = [];
    }
    chatGroups[chat.customer_phone].push(chat);
  });

  const phones = Object.keys(chatGroups);

  useEffect(() => {
    if (phones.length > 0 && !selectedPhone) {
      setSelectedPhone(phones[0]);
    }
  }, [chats, phones, selectedPhone]);

  const triggerCampaign = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/marketing/trigger-campaigns', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        onRefresh();
        alert(`Campaign complete! WhatsApp promos sent to ${data.sent} customers.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!customerMsg.trim() || !selectedPhone) return;

    setSending(true);
    const textToSend = customerMsg;
    setCustomerMsg('');

    try {
      // Optimistically push message locally to avoid delay
      chats.push({
        id: Math.random(),
        customer_phone: selectedPhone,
        sender: 'Customer',
        message: textToSend,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('http://localhost:5000/api/marketing/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selectedPhone, message: textToSend })
      });

      if (response.ok) {
        // Vyas processes reply and appends to db, which refreshes via parent interval
        setTimeout(() => {
          onRefresh();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeChats = chatGroups[selectedPhone] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Campaign Analytics column */}
      <div className="space-y-6">
        
        {/* Campaign Metrics Card */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow h-[240px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">Customer Growth</h2>
              <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-mono font-bold">VYAS MARKETING</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Autonomous WhatsApp customer acquisition and retention</p>

            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              <div className="p-2 bg-[#1A1614] border-glass rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase">Promo Sent</span>
                <p className="text-lg font-bold text-gray-100 mt-0.5 font-mono">{metrics.campaignsSent}</p>
              </div>
              <div className="p-2 bg-[#1A1614] border-glass rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase">Replies</span>
                <p className="text-lg font-bold text-gray-100 mt-0.5 font-mono">{metrics.conversionReplies}</p>
              </div>
              <div className="p-2 bg-[#1A1614] border-glass rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase">Conv. %</span>
                <p className="text-lg font-bold text-[#00B9F1] mt-0.5 font-mono">{metrics.conversionRate}%</p>
              </div>
            </div>
          </div>

          <button
            onClick={triggerCampaign}
            className="w-full py-2 bg-sky-500 text-black font-bold text-xs rounded-lg hover:bg-sky-600 transition-colors shadow-glow-blue"
          >
            Scan & Trigger Retention Campaign
          </button>
        </div>

        {/* Quick Customer Segment details */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow h-[160px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-300">Target Audiences</h3>
            <div className="space-y-1.5 mt-3 text-[11px] text-gray-400 font-mono">
              <div className="flex justify-between">
                <span>Dormant Customers (7+ days):</span>
                <span className="text-gray-100">4 active targets</span>
              </div>
              <div className="flex justify-between">
                <span>Top Favorites:</span>
                <span className="text-gray-100">Basmati Rice, Atta</span>
              </div>
              <div className="flex justify-between">
                <span>Primary Channel:</span>
                <span className="text-sky-400 font-bold">WhatsApp Business</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* WhatsApp Chat Simulator */}
      <div className="lg:col-span-2 bg-glass border-glass rounded-2xl shadow-glow h-[420px] overflow-hidden flex">
        
        {/* Contact List sidebar */}
        <div className="w-[30%] border-r border-white/5 bg-[#120F0D] overflow-y-auto">
          <div className="p-3 border-b border-white/5 bg-glass">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">Conversations</span>
          </div>
          <div className="divide-y divide-white/5">
            {phones.map(phone => {
              const isActive = selectedPhone === phone;
              const group = chatGroups[phone];
              const lastMsg = group[group.length - 1];
              return (
                <div
                  key={phone}
                  onClick={() => setSelectedPhone(phone)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-sky-500/10 border-l-2 border-sky-500' : 'hover:bg-white/5'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-200 truncate font-mono">{phone}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-1">{lastMsg?.message}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messaging Box */}
        <div className="flex-1 flex flex-col justify-between bg-[#0E0C0B]">
          
          {/* Header */}
          <div className="p-3 border-b border-white/5 bg-glass flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-gray-200">{selectedPhone || "Select Chat"}</span>
            <span className="text-[9px] text-[#00B9F1] font-mono flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B9F1] inline-block animate-ping"></span>
              Live Sandbox Simulator
            </span>
          </div>

          {/* Conversation list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs max-h-[300px]">
            {activeChats.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center mt-12">No chat selected.</p>
            ) : (
              activeChats.map((chat, idx) => {
                const isVyas = chat.sender.startsWith('Vyas');
                return (
                  <div key={idx} className={`flex flex-col ${isVyas ? 'items-start' : 'items-end'}`}>
                    <span className={`text-[8px] font-bold uppercase mb-1 ${isVyas ? 'text-sky-400' : 'text-emerald-400'}`}>
                      {chat.sender}
                    </span>
                    <p className={`p-2.5 rounded-lg leading-relaxed max-w-[80%] ${
                      isVyas ? 'bg-[#11171A] border border-sky-500/10 text-gray-200' : 'bg-[#111A15] border border-emerald-500/10 text-gray-200'
                    }`}>
                      {chat.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendResponse} className="p-3 border-t border-white/5 bg-glass flex gap-2">
            <input
              type="text"
              value={customerMsg}
              onChange={(e) => setCustomerMsg(e.target.value)}
              placeholder="Type customer reply (e.g. YES, order basmati)"
              className="flex-1 bg-[#1A1614] border-glass rounded-lg px-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={sending || !selectedPhone}
              className="bg-[#00B9F1] hover:bg-[#00B9F1]/80 text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              {sending ? 'Sending...' : 'Reply'}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default MarketingHub;
