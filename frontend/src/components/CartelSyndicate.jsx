import React, { useState, useEffect } from 'react';

const CartelSyndicate = ({ inventory }) => {
  const [syndicateData, setSyndicateData] = useState({ stores: [], orders: [] });

  const fetchSyndicate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/syndicate');
      const data = await response.json();
      setSyndicateData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSyndicate();
    const interval = setInterval(fetchSyndicate, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate overall cartel savings
  const totalSavings = syndicateData.orders.reduce((sum, o) => sum + (o.savings || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual map coordinate network */}
      <div className="lg:col-span-2 bg-glass border-glass p-6 rounded-2xl shadow-glow relative overflow-hidden h-[400px] flex flex-col justify-between">
        
        {/* Header info */}
        <div className="z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">Sector 98 Noida Kirana Cartel</h2>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">GROUP BUYING FORCE</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Real-time pooled demand network mapping local shop inventories</p>
        </div>

        {/* Local Map Overlay (SVG Graph) */}
        <div className="relative w-full h-[240px] flex items-center justify-center border border-white/5 rounded-xl bg-black/30 my-3">
          
          {/* Map grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* SVG Map Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Noida Fresh (Top Right) */}
            <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="rgba(0,185,241,0.2)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Verma Kirana (Left Central) */}
            <line x1="50%" y1="50%" x2="20%" y2="48%" stroke="rgba(0,185,241,0.2)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Gupta Provisions (Bottom Right) */}
            <line x1="50%" y1="50%" x2="70%" y2="78%" stroke="rgba(0,185,241,0.2)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Noida Fresh Node (Top Right) */}
          <div className="absolute top-[15%] right-[15%] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1A1614] border border-sky-500/30 flex items-center justify-center font-bold text-[10px] text-sky-400 shadow-glow-blue">NF</div>
            <span className="text-[8px] text-gray-400 font-mono mt-1">Noida Fresh (1.1km)</span>
          </div>

          {/* Verma Kirana Node (Left Central) */}
          <div className="absolute top-[40%] left-[12%] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1A1614] border border-sky-500/30 flex items-center justify-center font-bold text-[10px] text-sky-400 shadow-glow-blue">VK</div>
            <span className="text-[8px] text-gray-400 font-mono mt-1">Verma Kirana (0.2km)</span>
          </div>

          {/* Gupta Provisions Node (Bottom Right) */}
          <div className="absolute bottom-[10%] right-[20%] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1A1614] border border-sky-500/30 flex items-center justify-center font-bold text-[10px] text-sky-400 shadow-glow-blue">GP</div>
            <span className="text-[8px] text-gray-400 font-mono mt-1">Gupta Provisions (0.5km)</span>
          </div>

          {/* Our Store (Center) */}
          <div className="absolute top-[42%] left-[45%] flex flex-col items-center z-10 scale-110">
            <div className="w-12 h-12 rounded-full bg-[#1A1614] border-2 border-orange-500 flex flex-col items-center justify-center font-bold text-[10px] text-orange-500 shadow-glow">
              <span>ME</span>
            </div>
            <span className="text-[9px] text-white font-mono font-bold mt-1.5 uppercase">Your Shop</span>
          </div>

        </div>

        {/* Footer help */}
        <div className="text-[9px] text-gray-400 font-mono flex items-center justify-between z-10 border-t border-white/5 pt-2">
          <span>🎯 Noida Kirana Cartel has 4 shops participating</span>
          <span>Joint Leveraged Buying Active</span>
        </div>
      </div>

      {/* Cartel Ledger Column */}
      <div className="space-y-6">
        
        {/* Savings Tracker */}
        <div className="bg-glass border-glass p-5 rounded-2xl shadow-glow-emerald h-[150px] flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-emerald-400 font-mono">Syndicate Financial Gains</h3>
            <p className="text-2xl font-bold text-gray-100 mt-2 font-mono">₹{totalSavings}</p>
            <p className="text-[9px] text-gray-400 mt-1">Cumulative wholesale savings achieved via pooled leverage</p>
          </div>
          <span className="text-[8px] font-mono text-emerald-500 text-glow-emerald uppercase font-bold">✨ Cartel leverage discounts save ~22% average</span>
        </div>

        {/* Syndicate order history list */}
        <div className="bg-glass border-glass p-5 rounded-2xl shadow-glow h-[230px] flex flex-col justify-between overflow-hidden">
          <div className="h-[90%] overflow-y-auto pr-1">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 font-mono mb-3">Pooled Order History</h3>
            
            {syndicateData.orders.length === 0 ? (
              <p className="text-xs text-gray-500 italic mt-8 text-center">No group orders booked yet.</p>
            ) : (
              <div className="space-y-2">
                {syndicateData.orders.map(order => (
                  <div key={order.id} className="p-2 bg-[#1A1614] border-glass rounded-lg text-[10px] font-mono">
                    <div className="flex justify-between font-bold text-gray-200">
                      <span>{order.item_name}</span>
                      <span className="text-emerald-400">Saved ₹{order.savings}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 mt-1">
                      <span>Total order: {order.total_quantity}kg</span>
                      <span>Rate: ₹{order.negotiated_price}/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CartelSyndicate;
