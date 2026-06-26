const db = require('../services/database');
const chanakyaCFO = require('./chanakyaCFO');
const kuberProcure = require('./kuberProcure');

class VaniVoice {
  constructor() {
    this.name = "Vani (Voice Portal)";
  }

  processVoiceCommand(storeId, transcriptText, logCallback) {
    if (logCallback) logCallback(`[Vani] Processing voice query: "${transcriptText}"`);
    
    const text = transcriptText.toLowerCase();
    
    // Command 1: Business Overview
    if (text.includes("dhanda") || text.includes("business") || text.includes("overview") || text.includes("business kaisa")) {
      const summary = chanakyaCFO.getFinancialSummary(storeId);
      const responseText = `Aapka dhanda badhiya chal raha hai. Total sales ₹${summary.totalSales} hai aur bank balance ₹${summary.currentBalance} hai.`;
      
      return {
        spokenResponse: responseText,
        displayText: responseText,
        dashboardAction: "SWITCH_VIEW",
        viewTarget: "dashboard"
      };
    }

    // Command 2: Sales Metrics
    if (text.includes("sales") || text.includes("bikri") || text.includes("revenue")) {
      const summary = chanakyaCFO.getFinancialSummary(storeId);
      const responseText = `Aapki total sales ₹${summary.totalSales} hai, jisme average ticket size ₹${summary.avgTicketSize} hai.`;
      
      return {
        spokenResponse: responseText,
        displayText: responseText,
        dashboardAction: "SWITCH_VIEW",
        viewTarget: "cfo"
      };
    }

    // Command 3: Loan Eligibility or Apply
    if (text.includes("loan") || text.includes("udhaar") || text.includes("credit")) {
      if (text.includes("apply") || text.includes("le lo") || text.includes("maango")) {
        const result = chanakyaCFO.applyForLoan(storeId);
        if (result.success) {
          const responseText = `Badhai ho! ₹${result.details.borrowCapacity} ka loan approve ho gaya hai aur Paytm wallet me transfer kar diya gaya hai.`;
          return {
            spokenResponse: responseText,
            displayText: responseText,
            dashboardAction: "SWITCH_VIEW",
            viewTarget: "cfo",
            triggerEvent: "LOAN_APPROVED"
          };
        } else {
          return {
            spokenResponse: "Maaf kijiye, abhi aapka sales scorecard loan ke liye eligible nahi hai.",
            displayText: "Loan application rejected due to low credit score.",
            dashboardAction: "SWITCH_VIEW",
            viewTarget: "cfo"
          };
        }
      } else {
        const eligibility = chanakyaCFO.getLoanEligibility(storeId);
        const responseText = `Chanakya ke mutabik aap ₹${eligibility.borrowCapacity} tak ke Paytm loan ke liye eligible hain. Interest rate ${eligibility.interestRate} percent hai.`;
        return {
          spokenResponse: responseText,
          displayText: responseText,
          dashboardAction: "SWITCH_VIEW",
          viewTarget: "cfo"
        };
      }
    }

    // Command 4: Stock / Inventory Check
    if (text.includes("stock") || text.includes("inventory") || text.includes("maal")) {
      const inventory = db.getInventory(storeId);
      
      let specificItem = null;
      if (text.includes("rice") || text.includes("chawal")) specificItem = "Basmati Rice";
      else if (text.includes("atta") || text.includes("aata")) specificItem = "Ashirvaad Atta";
      else if (text.includes("sugar") || text.includes("chini")) specificItem = "Sugar";
      else if (text.includes("oil") || text.includes("tel")) specificItem = "Fortune Mustard Oil";
      else if (text.includes("surf") || text.includes("detergent")) specificItem = "Surf Excel";

      if (specificItem) {
        const item = inventory.find(i => i.item_name === specificItem);
        if (item) {
          const statusText = item.current_stock < item.safety_limit ? "stock kam hai" : "stock pariyaapt hai";
          const responseText = `${specificItem} ka stock ${item.current_stock} units hai. Yeh ${statusText}.`;
          
          if (item.current_stock < item.safety_limit) {
            if (text.includes("order") || text.includes("kharid") || text.includes("negotiate") || text.includes("manga")) {
              kuberProcure.startSyndicateNegotiation(storeId, item, logCallback);
              return {
                spokenResponse: `${specificItem} ke liye automated supplier negotiation chalu kar di gayi hai.`,
                displayText: `Initiated Kuber pricing negotiation for ${specificItem}.`,
                dashboardAction: "SWITCH_VIEW",
                viewTarget: "procurement"
              };
            }
          }
          return {
            spokenResponse: responseText,
            displayText: responseText,
            dashboardAction: "SWITCH_VIEW",
            viewTarget: "procurement"
          };
        }
      }

      const lowItems = inventory.filter(i => i.current_stock < i.safety_limit);
      if (lowItems.length > 0) {
        const itemNames = lowItems.map(i => i.item_name).join(", ");
        const responseText = `Aapke store me ${lowItems.length} items ka stock kam hai, jisme ${itemNames} shamil hain.`;
        return {
          spokenResponse: responseText,
          displayText: responseText,
          dashboardAction: "SWITCH_VIEW",
          viewTarget: "procurement"
        };
      } else {
        const responseText = "Aapke sabhi items ka stock safe level par hai. Fikar ki koi baat nahi.";
        return {
          spokenResponse: responseText,
          displayText: responseText,
          dashboardAction: "SWITCH_VIEW",
          viewTarget: "procurement"
        };
      }
    }

    // Command 5: Marketing status
    if (text.includes("marketing") || text.includes("promo") || text.includes("customer") || text.includes("prachar")) {
      const chats = db.getChats(storeId);
      const promosSent = chats.filter(c => c.sender === "Vyas (AI)" && c.message.includes("offer")).length;
      const responseText = `Vyas marketing agent ne aaj ${promosSent} customers ko discount offer bheja hai. Campaign dashboard par dekh lijiye.`;
      
      return {
        spokenResponse: responseText,
        displayText: responseText,
        dashboardAction: "SWITCH_VIEW",
        viewTarget: "marketing"
      };
    }

    const responseText = "Maaf kijiye, main aapka hukum samajh nahi payi. Kripya dhanda status, sales, stock, ya loan ke baare me puchiye.";
    return {
      spokenResponse: responseText,
      displayText: responseText,
      dashboardAction: "NONE"
    };
  }
}

module.exports = new VaniVoice();
