import React, { useState, useEffect } from 'react';

const CFOHub = ({ metrics, forecast, onLoanAction, addLog }) => {
  const [loadingLoan, setLoadingLoan] = useState(false);

  const applyForLoan = async () => {
    setLoadingLoan(true);
    try {
      const response = await fetch('http://localhost:5000/api/metrics/apply-loan', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        onLoanAction(); // Callback to tell parent to refresh metrics
        alert(data.message);
      } else {
        alert(data.message || "Failed to apply for loan.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting loan application.");
    } finally {
      setLoadingLoan(false);
    }
  };

  // Render a custom SVG Line Chart representing cash flow history + forecast
  const renderSVGChart = () => {
    if (!forecast || forecast.length === 0) return <div className="h-48 flex items-center justify-center text-xs text-gray-500">No forecasting data available.</div>;

    const width = 600;
    const height = 180;
    const padding = 20;

    const values = forecast.map(d => d.amount);
    const maxVal = Math.max(...values, 1000);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    // Helper to calculate X and Y coordinates on SVG
    const getX = (index) => padding + (index * (width - 2 * padding) / (forecast.length - 1));
    const getY = (val) => height - padding - ((val - minVal) * (height - 2 * padding) / range);

    // Build the SVG path strings
    let histPoints = [];
    let forePoints = [];
    let lastHistPoint = null;

    forecast.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.amount);
      if (d.type === 'historical') {
        histPoints.push(`${x},${y}`);
        lastHistPoint = { x, y };
      } else {
        if (forePoints.length === 0 && lastHistPoint) {
          forePoints.push(`${lastHistPoint.x},${lastHistPoint.y}`);
        }
        forePoints.push(`${x},${y}`);
      }
    });

    const historicalPath = histPoints.length > 0 ? `M ${histPoints.join(' L ')}` : '';
    const forecastedPath = forePoints.length > 0 ? `M ${forePoints.join(' L ')}` : '';

    // Area path for historical data (filled gradient)
    const fillPathHistorical = histPoints.length > 0 
      ? `M ${getX(0)},${height - padding} L ${histPoints.join(' L ')} L ${getX(histPoints.length - 1)},${height - padding} Z` 
      : '';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E67E22" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#E67E22" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Guideline (Zero or base) */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

        {/* Filled Gradients */}
        {fillPathHistorical && <path d={fillPathHistorical} fill="url(#histGrad)" />}

        {/* Historical Line */}
        {historicalPath && (
          <path d={historicalPath} fill="none" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Forecasted Line */}
        {forecastedPath && (
          <path d={forecastedPath} fill="none" stroke="#E67E22" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        )}

        {/* Dots on Key points */}
        {forecast.map((d, idx) => {
          if (idx === 0 || idx === forecast.length - 1 || d.type === 'forecasted' && idx === Math.floor(forecast.length / 2)) {
            const x = getX(idx);
            const y = getY(d.amount);
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="4" fill={d.type === 'historical' ? '#2ECC71' : '#E67E22'} />
                <text x={x} y={y - 8} fill="#A0A0A0" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  ₹{d.amount}
                </text>
              </g>
            );
          }
          return null;
        })}
      </svg>
    );
  };

  const summary = metrics?.summary || { totalSales: 0, avgTicketSize: 0, currentBalance: 0 };
  const eligibility = metrics?.eligibility || { eligibilityScore: 0, borrowCapacity: 0, interestRate: 0, status: 'REJECTED' };
  const gstReport = metrics?.gstReport || { tax5Collected: 0, tax18Collected: 0, totalTaxDue: 0 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Financial Overview Cards */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Core stats block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-glass border-glass p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Total Sales (Cycle)</span>
            <h3 className="text-2xl font-bold text-[#2ECC71] mt-1 text-glow-emerald">₹{summary.totalSales}</h3>
          </div>
          <div className="bg-glass border-glass p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Average Ticket</span>
            <h3 className="text-2xl font-bold text-gray-100 mt-1">₹{summary.avgTicketSize}</h3>
          </div>
          <div className="bg-glass border-glass p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Estimated Balance</span>
            <h3 className="text-2xl font-bold text-[#00B9F1] mt-1 text-glow-blue">₹{summary.currentBalance}</h3>
          </div>
        </div>

        {/* Forecasting Canvas */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">Chanakya Cash Flow Forecast</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">30-day projection based on Paytm merchant transaction history</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-[#2ECC71] inline-block"></span> Sales History</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-[#E67E22] border-dashed border inline-block"></span> Forecast (AI)</span>
            </div>
          </div>
          <div className="h-48 w-full mt-2">
            {renderSVGChart()}
          </div>
        </div>
      </div>

      {/* Credit & Tax columns */}
      <div className="space-y-6">
        
        {/* Loan Section */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow-emerald flex flex-col justify-between h-[230px]">
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">Paytm Business Loan</h2>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                eligibility.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {eligibility.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Autonomous scorecard by Chanakya Agent</p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-[9px] uppercase text-gray-400">Limit Pre-Approved</span>
                <p className="text-xl font-bold text-gray-100">₹{eligibility.borrowCapacity || '0'}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase text-gray-400">Interest Rate</span>
                <p className="text-xl font-bold text-gray-100">{eligibility.interestRate || '0'}%</p>
              </div>
            </div>
          </div>

          <button
            onClick={applyForLoan}
            disabled={loadingLoan || eligibility.status !== 'APPROVED'}
            className={`w-full py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              eligibility.status === 'APPROVED' 
                ? 'bg-emerald-500 text-black hover:bg-emerald-600 hover:scale-[1.02]' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loadingLoan ? 'Disbursing...' : 'Apply & Disburse Instant'}
          </button>
        </div>

        {/* GST Reporting section */}
        <div className="bg-glass border-glass p-6 rounded-2xl shadow-glow flex flex-col justify-between h-[230px]">
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">GST Compliance Ledger</h2>
            <p className="text-[10px] text-gray-400 mt-1">Real-time tax categorization of transaction invoices</p>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-400">5% Grocery Tax Bracket</span>
                <span className="text-gray-100 font-mono">₹{gstReport.tax5Collected}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-400">18% Standard Bracket</span>
                <span className="text-gray-100 font-mono">₹{gstReport.tax18Collected}</span>
              </div>
              <div className="flex justify-between font-bold pt-1">
                <span className="text-[#E67E22]">Total Tax Due</span>
                <span className="text-[#E67E22] font-mono">₹{gstReport.totalTaxDue}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("GST Ledger exported to JSON ledger format!")}
            className="w-full py-2 bg-glass border border-orange-500/30 text-orange-500 rounded-lg text-xs font-bold hover:bg-orange-500/10 transition-all duration-300"
          >
            Download GST Invoice Report
          </button>
        </div>

      </div>

    </div>
  );
};

export default CFOHub;
