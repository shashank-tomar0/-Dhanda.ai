const db = require('./services/database');
const chanakyaCFO = require('./agents/chanakyaCFO');
const kuberProcure = require('./agents/kuberProcure');
const vyasMarketing = require('./agents/vyasMarketing');
const vaniVoice = require('./agents/vaniVoice');

console.log("=========================================");
console.log("⚡ DHANDA.AI AUTOMATED AGENT VALIDATION ⚡");
console.log("=========================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

const storeId = 'ramesh';

try {
  // Test 1: Chanakya CFO Calculations
  console.log("\n--- Testing Chanakya (CFO Agent) ---");
  const summary = chanakyaCFO.getFinancialSummary(storeId);
  assert(summary.totalSales > 0, "Chanakya should compute positive sales volume from database seeds.");
  assert(summary.avgTicketSize > 0, "Chanakya should compute valid average transaction values.");
  
  const forecast = chanakyaCFO.getCashFlowForecast(storeId);
  assert(forecast.length > 5, "Chanakya forecast engine should output multi-day timeseries metrics.");
  assert(forecast.some(f => f.type === 'projected'), "Chanakya forecast should contain future predictions.");

  const loan = chanakyaCFO.getLoanEligibility(storeId);
  assert(loan.borrowCapacity > 0, "Chanakya should return valid borrow eligibility based on sales.");

  // Test 2: Kuber Procurement Warnings
  console.log("\n--- Testing Kuber (Procurement Agent) ---");
  const initialStock = db.getInventory(storeId).find(i => i.item_name === 'Sugar');
  
  // Set sugar stock below limit to trigger alert
  db.updateInventory(storeId, initialStock.id, { current_stock: 5 });
  const checkResult = kuberProcure.checkStockAndReplenish(storeId, (msg) => console.log(`  [Agent Thought] ${msg}`));
  
  assert(checkResult.status === "WARNING", "Kuber should flag inventory levels if they fall below safety limits.");
  
  const negotiations = db.getNegotiations(storeId);
  assert(negotiations.some(n => n.item_name === 'Sugar' && n.status === 'NEGOTIATING'), "Kuber should initialize supplier negotiations for low stock.");

  // Test 3: Vyas Marketing Engagements
  console.log("\n--- Testing Vyas (Marketing Agent) ---");
  const metrics = vyasMarketing.getMarketingMetrics(storeId);
  assert(metrics.campaignsSent >= 0, "Vyas should track campaigns sent counts.");
  
  // Test 4: Vani Voice NLP Command Parser
  console.log("\n--- Testing Vani (Voice Agent) ---");
  const dhandaCmd = vaniVoice.processVoiceCommand(storeId, "dhanda kaisa chal raha hai");
  assert(dhandaCmd.dashboardAction === "SWITCH_VIEW" && dhandaCmd.viewTarget === "dashboard", "Vani should map 'dhanda' queries to Overview tab.");
  assert(dhandaCmd.spokenResponse.includes("sales"), "Vani response should contain financial metrics.");

  const unknownCmd = vaniVoice.processVoiceCommand(storeId, "kuch bhi random text");
  assert(unknownCmd.dashboardAction === "NONE", "Vani should gracefully handle invalid commands.");

  console.log("\n=========================================");
  console.log(`📊 SUMMARY: Passed ${passedTests}/${totalTests} agent assertions.`);
  console.log("=========================================");
  
  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error("Test runner encountered an error:", err);
  process.exit(1);
}
