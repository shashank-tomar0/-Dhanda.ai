import React, { useState, useEffect, useRef } from 'react';
import ObsidianCore from './components/ObsidianCore';
import VoicePortal from './components/VoicePortal';
import SoundboxSimulator from './components/SoundboxSimulator';
import VoiceNegotiator from './components/VoiceNegotiator';
import CFOHub from './components/CFOHub';
import ProcurementHub from './components/ProcurementHub';
import MarketingHub from './components/MarketingHub';
import CartelSyndicate from './components/CartelSyndicate';
import InvoiceScanner from './components/InvoiceScanner';
import SpatialStore from './components/SpatialStore';
import KiranaUnion from './components/KiranaUnion';
import AgentTicker from './components/AgentTicker';
import SettingsPanel from './components/SettingsPanel';
import UPIQRModal from './components/UPIQRModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState('none');
  
  // Multi-tenant States
  const [storeId, setStoreId] = useState('ramesh');
  const [stores, setStores] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  // QR Modal States
  const [qrOpen, setQrOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const [qrPayee, setQrPayee] = useState('');
  const [qrDetails, setQrDetails] = useState('');
  const [pendingNegId, setPendingNegId] = useState(null);

  // Sync state stats
  const [metrics, setMetrics] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [chats, setChats] = useState([]);
  
  const wsRef = useRef(null);

  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stores');
      const data = await response.json();
      setStores(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      const resMetrics = await fetch(`http://localhost:5000/api/metrics?storeId=${storeId}`);
      const dataMetrics = await resMetrics.json();
      setMetrics(dataMetrics);

      const resForecast = await fetch(`http://localhost:5000/api/metrics/forecast?storeId=${storeId}`);
      const dataForecast = await resForecast.json();
      setForecast(dataForecast);

      const resInventory = await fetch(`http://localhost:5000/api/inventory?storeId=${storeId}`);
      const dataInventory = await resInventory.json();
      setInventory(dataInventory);

      const resNeg = await fetch(`http://localhost:5000/api/negotiations?storeId=${storeId}`);
      const dataNeg = await resNeg.json();
      setNegotiations(dataNeg);

      const resChats = await fetch(`http://localhost:5000/api/marketing/chats?storeId=${storeId}`);
      const dataChats = await resChats.json();
      setChats(dataChats);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchData();
  }, [storeId]);

  useEffect(() => {
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [storeId]);

  // Setup WebSocket log listener
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'LOG') {
        const msg = data.log.message;
        const isSystem = data.log.agent === 'System';
        const isForCurrentStore = msg.includes(`[Store: ${storeId}]`) || (!msg.includes('[Store: ') && storeId === 'ramesh');

        if (isSystem || isForCurrentStore) {
          const cleanMsg = msg.replace(`[Store: ${storeId}] `, '');
          const cleanLog = {
            ...data.log,
            message: cleanMsg
          };
          setLogs(prev => [cleanLog, ...prev].slice(0, 100));
          
          const name = data.log.agent.toLowerCase();
          if (name.includes('cfo')) setActiveAgent('cfo');
          else if (name.includes('procure')) setActiveAgent('procurement');
          else if (name.includes('marketing')) setActiveAgent('marketing');
          else if (name.includes('voice')) setActiveAgent('voice');
          
          setTimeout(() => setActiveAgent('none'), 1500);
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnect. Retrying...");
      setTimeout(() => fetchData(), 5000);
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [storeId, stores]);

  const addManualLog = (agentName, messageText) => {
    const newLog = {
      agent: agentName,
      message: messageText,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleVoiceAction = (targetView, triggerEvent) => {
    if (targetView && targetView !== 'none') {
      setActiveTab(targetView);
    }
    fetchData();
  };

  const triggerOrderPayment = (neg) => {
    setPendingNegId(neg.id);
    const amount = neg.agreed_price * (neg.is_syndicate ? neg.my_share_qty : neg.quantity);
    setQrAmount(amount);
    setQrPayee(neg.supplier_name);
    setQrDetails(`Wholesale supply restock: ${neg.item_name}`);
    setQrOpen(true);
  };

  const handleQRCompleted = async () => {
    setQrOpen(false);
    if (!pendingNegId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/negotiations/${pendingNegId}/approve?storeId=${storeId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        fetchData();
        addManualLog("System", `Paytm payment confirmed for order #${pendingNegId}.`);
      } else {
        alert(data.message || "Failed to approve order.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPendingNegId(null);
    }
  };

  const handleStoreChange = (e) => {
    const newStoreId = e.target.value;
    setStoreId(newStoreId);
    setLogs([]);
    addManualLog("System", `Logged in as ${stores[newStoreId]?.name || newStoreId}.`);
  };

  // Determine if there is an active WebRTC voice call running
  const hasActiveCall = negotiations.some(n => n.status === 'NEGOTIATING' || n.status === 'WAITING_APPROVAL');

  return (
    <div className="relative min-h-screen text-gray-800 px-4 md:px-8 py-6 z-10 flex flex-col justify-between">
      
      {/* Smoky Background Glow */}
      <div className="smoky-bg-glow top-[10%] left-[25%]" />
      <div className="smoky-bg-glow bottom-[10%] right-[25%]" style={{ animationDelay: '-12s' }} />

      {/* Header Bar */}
      <header className="relative w-full flex flex-col md:flex-row md:items-center justify-between border-b border-black/5 pb-4 mb-6 z-20 gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-black tracking-widest font-syne uppercase text-black">
              Dhanda.ai
            </h1>
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-black/5 text-black border border-black/10">
              Paytm OS
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-1 uppercase">
            / Delhi NCR - 27 June - Agent{'{'}a{'}'}thon /
          </p>
        </div>

        {/* Tenant Profile Selector & Config Panel */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 border border-black/5 bg-white hover:border-black/30 rounded-xl text-gray-600 hover:text-black transition-all"
            title="API Credentials Settings"
          >
            ⚙️
          </button>

          <div className="flex flex-col">
            <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider mb-0.5">Merchant Login</span>
            <select
              value={storeId}
              onChange={handleStoreChange}
              className="bg-white border border-black/5 text-xs text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:border-black font-semibold"
            >
              {Object.keys(stores).map(key => (
                <option key={key} value={key}>{stores[key].name}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex flex-col items-end font-mono">
            <span className="text-sm font-extrabold text-black uppercase tracking-wider">Dhanda.ai OS</span>
            <span className="text-[9px] text-gray-500 tracking-widest uppercase">Paytm Merchant OS</span>
          </div>
        </div>
      </header>

      {/* Main Core Section */}
      <main className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 z-20">
        
        {/* Core WebGL Agent Crystal */}
        <div>
          <ObsidianCore activeAgent={activeAgent} logs={logs} />
        </div>

        {/* Soundbox Simulator */}
        <div>
          <SoundboxSimulator logs={logs} />
        </div>

        {/* Vani Voice Portal or WebRTC Call waveforms */}
        <div>
          {hasActiveCall ? (
            <VoiceNegotiator negotiations={negotiations} />
          ) : (
            <VoicePortal onActionTrigger={handleVoiceAction} addLog={addManualLog} />
          )}
        </div>

      </main>

      {/* Navigation tabs */}
      <nav className="relative flex border-b border-black/5 mb-6 z-20 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('spatial')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'spatial' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          CCTV Spatial Twin
        </button>
        <button
          onClick={() => setActiveTab('cfo')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'cfo' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Chanakya CFO
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'procurement' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Kuber Supply
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'marketing' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Vyas Marketing
        </button>
        <button
          onClick={() => setActiveTab('syndicate')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'syndicate' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Kirana Cartel
        </button>
        <button
          onClick={() => setActiveTab('union')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'union' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          P2P Credit Union
        </button>
        <button
          onClick={() => setActiveTab('underwrite')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'underwrite' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Invoice Underwriting
        </button>
      </nav>

      {/* Dynamic Hub Screen Container */}
      <div className="relative mb-6 z-20 min-h-[380px]">
        {activeTab === 'dashboard' && metrics && (
          <div className="space-y-6">
            <CFOHub metrics={metrics} forecast={forecast} onLoanAction={fetchData} addLog={addManualLog} />
          </div>
        )}
        {activeTab === 'spatial' && (
          <SpatialStore inventory={inventory} onRefresh={fetchData} />
        )}
        {activeTab === 'cfo' && metrics && (
          <CFOHub metrics={metrics} forecast={forecast} onLoanAction={fetchData} addLog={addManualLog} />
        )}
        {activeTab === 'procurement' && (
          <ProcurementHub 
            inventory={inventory} 
            negotiations={negotiations} 
            onRefresh={fetchData} 
            addLog={addManualLog} 
            onCheckout={triggerOrderPayment}
          />
        )}
        {activeTab === 'marketing' && (
          <MarketingHub 
            chats={chats} 
            metrics={metrics?.summary ? vyasMarketingMetrics(chats) : { campaignsSent: 0, conversionReplies: 0, conversionRate: 0 }} 
            onRefresh={fetchData} 
            addLog={addManualLog} 
          />
        )}
        {activeTab === 'syndicate' && (
          <CartelSyndicate inventory={inventory} />
        )}
        {activeTab === 'union' && (
          <KiranaUnion storeId={storeId} onRefresh={fetchData} addLog={addManualLog} />
        )}
        {activeTab === 'underwrite' && (
          <InvoiceScanner onRefresh={fetchData} addLog={addManualLog} />
        )}
      </div>

      {/* Bottom Logger Ticker */}
      <footer className="relative z-20 mt-auto">
        <AgentTicker logs={logs} onClear={() => setLogs([])} />
      </footer>

      {/* Settings Modal */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* UPI QR Payment Modal */}
      <UPIQRModal 
        isOpen={qrOpen} 
        onClose={handleQRCompleted}
        amount={qrAmount}
        payeeName={qrPayee}
        orderDetails={qrDetails}
      />

    </div>
  );
};

function vyasMarketingMetrics(chats) {
  const campaignsSent = chats.filter(c => c.sender === "Vyas (AI)" && (c.message.includes("offer") || c.message.includes("discount"))).length;
  const conversionReplies = chats.filter(c => c.sender === "Customer" && (c.message.toLowerCase().includes("yes") || c.message.toLowerCase().includes("order"))).length;
  return {
    campaignsSent,
    conversionReplies,
    conversionRate: campaignsSent > 0 ? Math.round((conversionReplies / campaignsSent) * 100) : 0
  };
}

export default App;
