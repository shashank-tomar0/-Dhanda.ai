const db = require('../services/database');

class ChanakyaCFO {
  constructor() {
    this.name = "Chanakya (CFO)";
  }

  getFinancialSummary(storeId) {
    const transactions = db.getTransactions(storeId);
    const successfulTx = transactions.filter(t => t.payment_status === "SUCCESS");
    
    const totalSales = successfulTx.reduce((sum, t) => sum + t.amount, 0);
    const avgTicketSize = totalSales / (successfulTx.length || 1);
    const currentBalance = totalSales * 0.85;
    
    return {
      totalSales,
      avgTicketSize: Math.round(avgTicketSize),
      currentBalance: Math.round(currentBalance),
      transactionCount: successfulTx.length
    };
  }

  getCashFlowForecast(storeId) {
    const transactions = db.getTransactions(storeId);
    
    const dailySales = {};
    transactions.forEach(t => {
      const dateStr = t.date.substring(0, 10);
      if (t.payment_status === "SUCCESS") {
        dailySales[dateStr] = (dailySales[dateStr] || 0) + t.amount;
      }
    });

    const dates = Object.keys(dailySales).sort();
    const salesValues = dates.map(d => dailySales[d]);

    let trend = 20;
    if (salesValues.length >= 2) {
      trend = (salesValues[salesValues.length - 1] - salesValues[0]) / salesValues.length;
    }
    if (isNaN(trend) || Math.abs(trend) > 200) trend = 15;

    const forecast = [];
    const lastDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date();
    let currentBase = salesValues.length > 0 ? salesValues[salesValues.length - 1] : 500;

    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);

      const dayOfWeek = forecastDate.getDay();
      const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.25 : 0.95;
      const noise = (Math.random() - 0.5) * 50;

      currentBase += trend;
      if (currentBase < 100) currentBase = 150;

      const projectedAmount = Math.round(currentBase * weekendBoost + noise);

      forecast.push({
        date: forecastDate.toISOString().substring(0, 10),
        amount: projectedAmount,
        type: "projected"
      });
    }

    const historical = Object.keys(dailySales).map(date => ({
      date,
      amount: dailySales[date],
      type: "historical"
    }));

    return [...historical, ...forecast];
  }

  getLoanEligibility(storeId) {
    const summary = this.getFinancialSummary(storeId);
    const lendingInfo = db.getLending(storeId);

    const DSCR = (summary.totalSales * 0.15) / (lendingInfo.borrow_capacity * 0.05 / 12); 
    const creditScore = Math.min(Math.max(Math.round(700 + (summary.transactionCount * 4) + (summary.totalSales / 500)), 300), 850);

    const eligible = creditScore > 650 && summary.totalSales > 1000;
    
    return {
      eligibilityScore: Math.round(creditScore / 10),
      borrowCapacity: eligible ? Math.round(summary.totalSales * 2.5) : 0,
      interestRate: eligible ? parseFloat((14.5 - (creditScore - 600) * 0.02).toFixed(2)) : 0,
      status: eligible ? "APPROVED" : "REJECTED",
      dscr: parseFloat(DSCR.toFixed(2))
    };
  }

  getGSTReport(storeId) {
    const transactions = db.getTransactions(storeId).filter(t => t.payment_status === "SUCCESS");
    
    let tax5Amount = 0;
    let tax18Amount = 0;

    transactions.forEach(t => {
      const items = t.items.toLowerCase();
      if (items.includes('rice') || items.includes('atta') || items.includes('sugar') || items.includes('butter')) {
        tax5Amount += t.amount;
      } else {
        tax18Amount += t.amount;
      }
    });

    const tax5Paid = Math.round(tax5Amount * 0.05);
    const tax18Paid = Math.round(tax18Amount * 0.18);
    const totalTaxDue = tax5Paid + tax18Paid;

    return {
      tax5Base: tax5Amount - tax5Paid,
      tax5Collected: tax5Paid,
      tax18Base: tax18Amount - tax18Paid,
      tax18Collected: tax18Paid,
      totalTaxDue,
      gstinStatus: "ACTIVE",
      filingReady: true
    };
  }

  applyForLoan(storeId) {
    const eligibility = this.getLoanEligibility(storeId);
    if (eligibility.status === "APPROVED") {
      db.updateLending(storeId, {
        eligibility_score: eligibility.eligibilityScore,
        borrow_capacity: eligibility.borrowCapacity,
        interest_rate: eligibility.interestRate,
        status: "ACTIVE"
      });
      return { success: true, message: `Loan of ₹${eligibility.borrowCapacity} approved and disbursed into Paytm Wallet!`, details: eligibility };
    }
    return { success: false, message: "Loan application rejected due to insufficient transaction scores." };
  }
}

module.exports = new ChanakyaCFO();
