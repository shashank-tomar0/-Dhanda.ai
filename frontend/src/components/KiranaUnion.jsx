import React, { useState, useEffect } from 'react';

const KiranaUnion = ({ storeId, onRefresh, addLog }) => {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState('');
  const [lenderId, setLenderId] = useState('verma');
  const [requesting, setRequesting] = useState(false);

  const fetchLoans = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/p2p');
      const data = await response.json();
      setLoans(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLoans();
    const interval = setInterval(fetchLoans, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!amount.trim() || isNaN(amount)) return;
    
    setRequesting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/p2p/request?storeId=${storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount), lenderId })
      });
      if (response.ok) {
        setAmount('');
        fetchLoans();
        onRefresh(); // refresh bank balance metrics
        alert(`P2P Credit query broadcasted! Check Soundbox for audio loan status updates.`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send P2P credit query.");
    } finally {
      setRequesting(false);
    }
  };

  // Calculate stats
  const borrowedSum = loans.filter(l => l.debtor === 'Your Shop').reduce((sum, l) => sum + l.amount, 0);
  const lentSum = loans.filter(l => l.creditor === 'Your Shop').reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Active Loans ledger */}
      <div className="lg:col-span-2 bg-glass border-glass p-6 rounded-2xl shadow-glow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">De-Fi Kirana Credit Ledger</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Decentralized peer-to-peer liquidity bridge connecting local Soundboxes</p>
          </div>
          <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-bold">P2P LEDGER LINK</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 uppercase font-mono">
                <th className="py-2">Date</th>
                <th className="py-2">Debtor</th>
                <th className="py-2">Creditor (Lender)</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Interest</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loans.map(loan => (
                <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-gray-400">{new Date(loan.date).toLocaleDateString()}</td>
                  <td className="py-3 font-semibold text-gray-100">{loan.debtor}</td>
                  <td className="py-3 text-gray-300">{loan.creditor}</td>
                  <td className="py-3 text-[#2ECC71] font-bold">₹{loan.amount}</td>
                  <td className="py-3 text-gray-400">{loan.interest}</td>
                  <td className="py-3 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit request controller */}
      <div className="space-y-6">
        
        {/* Request peer loan card */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow-emerald h-[210px] flex flex-col justify-between">
          <h2 className="text-xs font-bold tracking-wider uppercase text-gray-200">Request Peer Credit</h2>
          
          <form onSubmit={handleRequestLoan} className="space-y-3 mt-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase text-gray-400 font-mono block mb-1">Select Lender</label>
                <select
                  value={lenderId}
                  onChange={(e) => setLenderId(e.target.value)}
                  className="w-full bg-[#1A1614] border-glass rounded-lg px-2.5 py-1.5 text-gray-200 focus:outline-none"
                >
                  <option value="verma">Verma Kirana</option>
                  <option value="gupta">Gupta Provisions</option>
                  <option value="fresh">Noida Fresh</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase text-gray-400 font-mono block mb-1">Amount (INR)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹2,000"
                  className="w-full bg-[#1A1614] border-glass rounded-lg px-2.5 py-1.5 text-gray-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={requesting}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] rounded-lg transition-colors uppercase font-mono"
            >
              {requesting ? 'Requesting Peer Credit...' : '💸 Broadcast Peer Loan Request'}
            </button>
          </form>
        </div>

        {/* P2P Stats */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow h-[130px] flex flex-col justify-between">
          <div>
            <h3 className="text-[9px] uppercase font-bold text-gray-400 font-mono">Peer Union Balances</h3>
            <div className="grid grid-cols-2 gap-4 mt-3 text-xs font-mono">
              <div>
                <span className="text-gray-500 text-[8px] block uppercase">Total Borrowed</span>
                <span className="text-red-400 font-bold text-sm">₹{borrowedSum}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[8px] block uppercase">Total Lent</span>
                <span className="text-emerald-400 font-bold text-sm">₹{lentSum}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default KiranaUnion;
