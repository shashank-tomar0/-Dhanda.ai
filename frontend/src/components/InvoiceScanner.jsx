import React, { useState } from 'react';

const InvoiceScanner = ({ onRefresh, addLog }) => {
  const [selectedPreset, setSelectedPreset] = useState('rice');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const presets = {
    rice: {
      distributor: "Bharat Provisions Store",
      item: "Basmati Rice",
      qty: "80 units",
      rate: "₹65/unit",
      total: "₹5,200",
      taxBracket: "5% CGST/SGST",
      mrp: "₹90"
    },
    oil: {
      distributor: "Hindustan Oil Depo",
      item: "Fortune Mustard Oil",
      qty: "60 units",
      rate: "₹130/unit",
      total: "₹7,800",
      taxBracket: "18% CGST/SGST",
      mrp: "₹165"
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    addLog("System", `Initializing OCR model scanner on invoice: ${presets[selectedPreset].distributor}...`);

    // Simulate scanning delay
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ocr/parse-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceType: selectedPreset })
        });
        const data = await response.json();
        
        if (response.ok) {
          setScanResult(data.parsed);
          onRefresh(); // Refresh parent metrics so cash flow & inventory stock update immediately!
          addLog("Chanakya (CFO)", `Parsed invoice for ${data.parsed.item}. Added stock. Score card adjusted.`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsScanning(false);
      }
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Upload camera screen */}
      <div className="lg:col-span-2 bg-glass border-glass p-6 rounded-2xl shadow-glow flex flex-col justify-between h-[400px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">Tap-to-Underwrite OCR</h2>
            <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-bold">TRADE UNDERWRITING ENGINE</span>
          </div>
          <p className="text-[10px] text-gray-400">Scan paper invoices from local distributors to update inventory and boost credit ratings autonomously</p>
          
          {/* Preset selector */}
          <div className="mt-4 space-y-3">
            <label className="text-[10px] font-mono uppercase text-gray-400 block">Select Paper Invoice Receipt to Scan</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPreset('rice')}
                disabled={isScanning}
                className={`flex-1 p-3 rounded-xl border text-xs font-mono text-left transition-all duration-300 ${
                  selectedPreset === 'rice' 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-glow' 
                    : 'bg-[#1A1614] border-glass text-gray-400 hover:text-white'
                }`}
              >
                📝 Bharat Provisions (80kg Rice)
              </button>
              <button
                onClick={() => setSelectedPreset('oil')}
                disabled={isScanning}
                className={`flex-1 p-3 rounded-xl border text-xs font-mono text-left transition-all duration-300 ${
                  selectedPreset === 'oil' 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-glow' 
                    : 'bg-[#1A1614] border-glass text-gray-400 hover:text-white'
                }`}
              >
                📝 Hindustan Oil Depo (60L Oil)
              </button>
            </div>
          </div>
        </div>

        {/* OCR Visualizer Container */}
        <div className="relative w-full h-44 rounded-xl border border-white/5 bg-black/40 overflow-hidden flex items-center justify-center">
          {isScanning ? (
            <>
              {/* Glowing red scanner beam */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 shadow-[0_0_15px_#ef4444] animate-[scan_2s_infinite_linear]" style={{ zIndex: 1 }} />
              <div className="flex flex-col items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <p className="text-xs font-mono text-purple-400 animate-pulse uppercase">Reading characters & verifying ledger...</p>
              </div>
            </>
          ) : scanResult ? (
            <div className="text-center p-4">
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono uppercase font-bold">
                ✓ OCR verification complete
              </span>
              <p className="text-[10px] text-gray-400 mt-3 font-mono">Invoice matches trades, uploaded to inventory and Paytm Lending scorecard</p>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500 text-xs font-mono">
              📷 Camera calibrated. Place paper invoice and click Scan.
            </div>
          )}
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg transition-colors uppercase font-mono shadow-glow"
        >
          {isScanning ? 'Verifying invoice receipt...' : 'Scan & Underwrite Invoice'}
        </button>

        {/* Scan animation stylesheet in CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 97%; }
            100% { top: 0%; }
          }
        `}} />
      </div>

      {/* OCR Result Ledger Card */}
      <div className="space-y-6">
        
        {/* Receipt display sheet */}
        <div className="bg-glass border-glass p-5 rounded-2xl shadow-glow h-[400px] flex flex-col justify-between overflow-hidden relative">
          {/* Paper receipt overlay */}
          <div className="bg-white text-black p-4 rounded-lg shadow-2xl h-full font-mono text-[10px] flex flex-col justify-between leading-relaxed">
            
            {/* Receipt header */}
            <div className="text-center border-b border-black/10 pb-2">
              <h3 className="font-bold uppercase text-xs tracking-wider">INVOICE SHEET</h3>
              <p className="text-[8px] text-gray-500">Noida Wholesale Distributors</p>
              <p className="text-[8px] text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Receipt details */}
            <div className="space-y-2 mt-4 flex-1">
              <div className="flex justify-between">
                <span>Distributor:</span>
                <span className="font-bold">{presets[selectedPreset].distributor}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Item:</span>
                <span className="font-bold">{presets[selectedPreset].item}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-black/20 pb-1">
                <span>Quantity Count:</span>
                <span className="font-bold">{presets[selectedPreset].qty}</span>
              </div>
              <div className="flex justify-between">
                <span>Wholesale Rate:</span>
                <span>{presets[selectedPreset].rate}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[8px]">
                <span>Tax tier:</span>
                <span>{presets[selectedPreset].taxBracket}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[8px]">
                <span>Product MRP:</span>
                <span>{presets[selectedPreset].mrp}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-dashed border-black/20 pt-2 flex justify-between font-bold text-xs uppercase">
              <span>Total Bill:</span>
              <span>{presets[selectedPreset].total}</span>
            </div>
            
            {/* Verification status stamp */}
            <div className="text-center border-t border-black/10 pt-2 mt-2">
              <span className="text-[8px] font-bold text-gray-400">PAYTM SOUNDBOX TRADE RECORD DEPO</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InvoiceScanner;
