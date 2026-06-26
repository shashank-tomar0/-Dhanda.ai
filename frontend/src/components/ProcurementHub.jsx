import React, { useState } from 'react';

const ProcurementHub = ({ inventory, negotiations, onRefresh, addLog, onCheckout }) => {
  const [selectedNeg, setSelectedNeg] = useState(null);
  const [buyingItem, setBuyingItem] = useState('');
  const [buyQty, setBuyQty] = useState(5);

  const simulateSale = async (itemName) => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName, quantity: buyQty })
      });
      if (response.ok) {
        onRefresh();
        addLog("System", `Simulated customer purchase: ${buyQty} units of ${itemName}.`);
      } else {
        alert("Failed to buy. Item may be out of stock.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const approveNegotiation = async (negId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/negotiations/${negId}/approve`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        onRefresh();
        alert(data.message);
      } else {
        alert(data.message || "Failed to approve order.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Stock Level column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Inventory Monitor Card */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">Inventory Tracker</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Real-time stock monitoring & auto-replenishment levels</p>
            </div>
            <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/35 px-2 py-0.5 rounded font-mono font-bold">KUBER STOCK AUTOMATION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-mono">
                  <th className="py-2">Item Name</th>
                  <th className="py-2">Stock Level</th>
                  <th className="py-2">Min Limit</th>
                  <th className="py-2">Replenish Status</th>
                  <th className="py-2 text-right">Simulate Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map(item => {
                  const isLow = item.current_stock < item.safety_limit;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold text-gray-100">{item.item_name}</td>
                      <td className="py-3 font-mono">
                        <span className={isLow ? 'text-red-400 font-bold' : 'text-gray-300'}>
                          {item.current_stock} units
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 font-mono">{item.safety_limit}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                          item.replenishment_status === 'NORMAL' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.replenishment_status === 'NEGOTIATING'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {item.replenishment_status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => simulateSale(item.item_name)}
                          className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black font-semibold font-mono text-[10px] px-2.5 py-1 rounded transition-all duration-300"
                        >
                          Buy 5
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Negotiations & Pending Approvals */}
      <div className="space-y-6">
        
        {/* Wholesaler Deals and approval lists */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow h-[420px] flex flex-col justify-between">
          <div className="h-[90%] overflow-y-auto pr-1">
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200 mb-4">Active Supplier Bids</h2>
            
            {negotiations.length === 0 ? (
              <p className="text-xs text-gray-500 italic mt-8 text-center">No active pricing bids running.</p>
            ) : (
              <div className="space-y-3">
                {negotiations.map(neg => (
                  <div 
                    key={neg.id}
                    className="p-3 bg-[#1A1614] border-glass rounded-xl cursor-pointer hover:border-orange-500/50 transition-all duration-300"
                    onClick={() => setSelectedNeg(neg)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wide truncate max-w-[150px]">
                        {neg.supplier_name}
                      </span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                        neg.status === 'COMPLETED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : neg.status === 'WAITING_APPROVAL'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {neg.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-200 mt-2">{neg.quantity} units of {neg.item_name}</p>
                    
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 pt-2 border-t border-white/5 font-mono">
                      <span>Rate: ₹{neg.agreed_price || neg.catalog_price}/unit</span>
                      {neg.status === 'WAITING_APPROVAL' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onCheckout) onCheckout(neg);
                            else approveNegotiation(neg.id);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-black font-bold font-mono text-[9px] px-2 py-0.5 rounded transition-all duration-300"
                        >
                          PAY & APPROVE
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <span className="text-[9px] text-gray-500 text-center font-mono mt-2">Click card to view negotiation transcript</span>
        </div>

      </div>

      {/* Negotiation Logs Dialog (Modal overlay) */}
      {selectedNeg && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#120F0D] border border-orange-500/35 rounded-2xl w-full max-w-lg overflow-hidden shadow-glow max-h-[90vh] flex flex-col justify-between">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-glass">
              <div>
                <h3 className="text-sm font-bold uppercase text-orange-500">{selectedNeg.supplier_name}</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Procurement negotiation transcript for {selectedNeg.item_name}</p>
              </div>
              <button 
                onClick={() => setSelectedNeg(null)}
                className="text-gray-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[350px] min-h-[250px] bg-[#0E0C0B] font-mono text-xs">
              {selectedNeg.log.map((chat, idx) => {
                const isKuber = chat.sender.startsWith('Kuber');
                return (
                  <div key={idx} className={`flex flex-col ${isKuber ? 'items-start' : 'items-end'}`}>
                    <span className={`text-[9px] uppercase font-bold mb-1 ${isKuber ? 'text-orange-400' : 'text-purple-400'}`}>
                      {chat.sender}
                    </span>
                    <p className={`p-3 rounded-lg leading-relaxed max-w-[85%] ${
                      isKuber ? 'bg-[#1D1411] border border-orange-500/10 text-gray-200' : 'bg-[#18111D] border border-purple-500/10 text-gray-200'
                    }`}>
                      {chat.message}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/5 bg-glass flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-400">Negotiated Rate:</span>
                <span className="text-white font-bold ml-1 font-mono">₹{selectedNeg.agreed_price || selectedNeg.catalog_price}/unit</span>
              </div>
              {selectedNeg.status === 'WAITING_APPROVAL' ? (
                <button
                  onClick={() => {
                    if (onCheckout) onCheckout(selectedNeg);
                    else approveNegotiation(selectedNeg.id);
                    setSelectedNeg(null);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-bold font-mono px-4 py-1.5 rounded-lg transition-colors"
                >
                  Pay via Paytm Soundbox
                </button>
              ) : (
                <span className="text-gray-500 font-bold uppercase">{selectedNeg.status}</span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProcurementHub;
