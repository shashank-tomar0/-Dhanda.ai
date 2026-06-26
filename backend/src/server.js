const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');

const db = require('./services/database');
const chanakyaCFO = require('./agents/chanakyaCFO');
const kuberProcure = require('./agents/kuberProcure');
const vyasMarketing = require('./agents/vyasMarketing');
const vaniVoice = require('./agents/vaniVoice');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

// Store active WebSocket connections
let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  sendAgentLog("System", "Dhanda.ai Multi-Tenant Agent Swarm online.");
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

function sendAgentLog(agentName, message) {
  const logEntry = {
    agent: agentName,
    message,
    timestamp: new Date().toISOString()
  };
  const data = JSON.stringify({ type: "LOG", log: logEntry });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// REST Endpoints

// 0. Get Tenant profiles
app.get('/api/stores', (req, res) => {
  try {
    const list = {};
    Object.keys(db.data.stores).forEach(key => {
      list[key] = {
        name: db.data.stores[key].name,
        city: db.data.stores[key].city
      };
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings config (scoped by storeId)
app.get('/api/settings', (req, res) => {
  const storeId = req.query.storeId || 'ramesh';
  res.json(db.getSettings(storeId));
});

app.post('/api/settings', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    db.updateSettings(storeId, req.body);
    sendAgentLog("System", `[Store: ${storeId}] API settings updated. Real-time Twilio triggers activated.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authentication and Onboarding endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = db.registerUser(username, password);
    sendAgentLog("System", `New merchant user '${username}' registered with Store ID: ${user.storeId}`);
    res.json({ success: true, user: { username: user.username, storeId: user.storeId, onboarded: user.onboarded } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = db.verifyUser(username, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    sendAgentLog("System", `Merchant user '${username}' logged in successfully.`);
    res.json({ success: true, user: { username: user.username, storeId: user.storeId, onboarded: user.onboarded } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stores/onboard', (req, res) => {
  try {
    const { storeId, storeName, city, credentials } = req.body;
    if (!storeId || !storeName || !city) {
      return res.status(400).json({ error: "Store ID, Store Name, and City are required" });
    }
    const store = db.onboardStore(storeId, storeName, city, credentials || {});
    sendAgentLog("System", `[Store: ${storeId}] Onboarding complete! Paytm & Twilio integrations initialized.`);
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Dashboard Financial Metrics
app.get('/api/metrics', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const summary = chanakyaCFO.getFinancialSummary(storeId);
    const eligibility = chanakyaCFO.getLoanEligibility(storeId);
    const gstReport = chanakyaCFO.getGSTReport(storeId);
    res.json({ summary, eligibility, gstReport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Cash Flow Forecast Data
app.get('/api/metrics/forecast', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const forecast = chanakyaCFO.getCashFlowForecast(storeId);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Trigger Loan Application
app.post('/api/metrics/apply-loan', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Initializing credit scorecard check...`);
    const result = chanakyaCFO.applyForLoan(storeId);
    if (result.success) {
      sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Credit evaluation complete. Paytm Soundbox disbursed ₹${result.details.borrowCapacity} at ${result.details.interestRate}% interest.`);
      res.json(result);
    } else {
      sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Lending scorecard rejected.`);
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Inventory List
app.get('/api/inventory', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    res.json(db.getInventory(storeId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual inventory stock decrement
app.post('/api/inventory/buy', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const { itemName, quantity } = req.body;
    const item = db.getInventory(storeId).find(i => i.item_name.toLowerCase() === itemName.toLowerCase());
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    db.updateStockByName(storeId, itemName, -quantity);
    
    db.addTransaction(storeId, {
      customer_name: "Walk-in Customer",
      customer_phone: "counter-sale",
      amount: item.unit_retail_price * quantity,
      items: `${item.item_name} (${quantity} units)`,
      payment_status: "SUCCESS",
      status: "completed"
    });

    sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Soundbox: Received payment of ₹${item.unit_retail_price * quantity} for ${item.item_name}.`);

    kuberProcure.checkStockAndReplenish(storeId, (msg) => sendAgentLog("Kuber (Procurement)", `[Store: ${storeId}] ${msg}`));

    res.json({ success: true, item: db.getInventory(storeId).find(i => i.id === item.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Wholesaler Negotiations
app.get('/api/negotiations', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    res.json(db.getNegotiations(storeId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve wholesale purchase
app.post('/api/negotiations/:id/approve', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const negId = parseInt(req.params.id);
    const result = kuberProcure.approveOrder(storeId, negId);
    if (result.success) {
      sendAgentLog("Kuber (Procurement)", `[Store: ${storeId}] ${result.message}`);
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. WhatsApp Chats
app.get('/api/marketing/chats', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    res.json(db.getChats(storeId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get marketing metrics
app.get('/api/marketing/metrics', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    res.json(vyasMarketing.getMarketingMetrics(storeId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send mock reply from customer on WhatsApp simulator
app.post('/api/marketing/reply', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const { phone, message } = req.body;
    
    vyasMarketing.handleCustomerReply(storeId, phone, message, (msg) => sendAgentLog("Vyas (Marketing)", `[Store: ${storeId}] ${msg}`));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run Manual Campaign Trigger
app.post('/api/marketing/trigger-campaigns', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    sendAgentLog("Vyas (Marketing)", `[Store: ${storeId}] Running customer segmentation...`);
    const result = vyasMarketing.runCampaigns(storeId, (msg) => sendAgentLog("Vyas (Marketing)", `[Store: ${storeId}] ${msg}`));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Voice intent portal
app.post('/api/voice/command', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const { transcript } = req.body;
    sendAgentLog("Vani (Voice Portal)", `[Store: ${storeId}] Query recorded: "${transcript}"`);
    const actionResult = vaniVoice.processVoiceCommand(storeId, transcript, (msg) => {
      if (msg.includes("[Kuber]")) sendAgentLog("Kuber (Procurement)", `[Store: ${storeId}] ` + msg.replace("[Kuber] ", ""));
      else sendAgentLog("Vani (Voice Portal)", `[Store: ${storeId}] ` + msg);
    });
    res.json(actionResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Syndicate Stores
app.get('/api/syndicate', (req, res) => {
  try {
    res.json({
      stores: db.getSyndicateStores(),
      orders: db.getPooledOrders()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Invoice OCR Scan
app.post('/api/ocr/parse-invoice', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const { invoiceType } = req.body;
    
    sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Document uploaded. Triggering OCR parsing model...`);

    let parsedItem = "Fortune Mustard Oil";
    let qty = 60;
    let rate = 130;
    let supplierName = "Hindustan Oil Depo";

    if (invoiceType === 'rice') {
      parsedItem = "Basmati Rice";
      qty = 80;
      rate = 65;
      supplierName = "Bharat Provisions Store";
    }

    const totalBill = qty * rate;

    setTimeout(() => {
      db.updateStockByName(storeId, parsedItem, qty);

      const lending = db.getLending(storeId);
      const newEligibility = Math.min(lending.eligibility_score + 8, 100);
      const newCapacity = Math.round(lending.borrow_capacity * 1.25);
      
      db.updateLending(storeId, {
        eligibility_score: newEligibility,
        borrow_capacity: newCapacity
      });

      db.addTransaction(storeId, {
        customer_name: supplierName,
        customer_phone: "+91-OCR",
        amount: totalBill,
        items: `OCR Parse Bill: ${parsedItem} (${qty} units)`,
        payment_status: "SUCCESS",
        status: "completed"
      });

      sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] OCR complete. Logged supply expense of ₹${totalBill}.`);
      sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Credit scorecard boosted (+8 points). Credit limit increased to ₹${newCapacity}!`);
    }, 1500);

    res.json({ 
      success: true, 
      parsed: {
        item: parsedItem,
        quantity: qty,
        rate,
        supplier: supplierName,
        total: totalBill
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// NEW NEXT-GEN ENDPOINTS (CCTV & P2P Loans)
// ============================================

// A. Get CCTV logs
app.get('/api/cctv', (req, res) => {
  res.json(db.getCCTVLogs());
});

// B. Trigger CCTV shelf depletion event
app.post('/api/cctv/trigger', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const { itemName } = req.body;
    
    // Set stock to critical (e.g. 5 units)
    const inventory = db.getInventory(storeId);
    const product = inventory.find(i => i.item_name.toLowerCase() === itemName.toLowerCase());
    
    if (product) {
      db.updateInventory(storeId, product.id, { current_stock: 4 });
      
      // Log CCTV YOLOv8 detection
      db.addCCTVLog({
        label: `Shelf: ${product.item_name}`,
        event: "empty_warning_triggered",
        confidence: parseFloat((0.90 + Math.random() * 0.08).toFixed(2))
      });

      sendAgentLog("System", `CCTV Bounding Box Alert: YOLOv8 model detected empty rack on ${product.item_name}.`);
      sendAgentLog("Kuber (Procurement)", `[Store: ${storeId}] CCTV alerts stock deficiency. Starting automatic supply check...`);

      // Force Kuber stock checks
      kuberProcure.checkStockAndReplenish(storeId, (msg) => sendAgentLog("Kuber (Procurement)", `[Store: ${storeId}] ${msg}`));
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. Get active P2P micro-loans
app.get('/api/p2p', (req, res) => {
  res.json(db.getP2PLoans());
});

// D. Request P2P loan from neighboring Soundbox
app.post('/api/p2p/request', (req, res) => {
  try {
    const storeId = req.query.storeId || 'ramesh';
    const { amount, lenderId } = req.body;
    
    const storesList = {
      verma: "Verma Kirana Store",
      gupta: "Gupta Provisions Store",
      fresh: "Noida Fresh Grocery"
    };

    const lenderName = storesList[lenderId] || "Local Peer Shop";
    
    sendAgentLog("Vani (Voice Portal)", `[Store: ${storeId}] Soundbox broadcasting P2P credit query for ₹${amount} to neighbors...`);

    setTimeout(() => {
      // Create active peer loan record
      const loan = db.addP2PLoan({
        debtor: storeId === 'ramesh' ? 'Your Shop' : 'Verma Kirana',
        creditor: lenderName,
        amount,
        interest: "0.05% daily",
        status: "ACTIVE"
      });

      // Increase current bank balance
      db.addTransaction(storeId, {
        customer_name: lenderName,
        customer_phone: "+91-PEER",
        amount,
        items: `P2P Soundbox Loan Refill`,
        payment_status: "SUCCESS",
        status: "completed"
      });

      sendAgentLog("Chanakya (CFO)", `[Store: ${storeId}] Soundbox P2P transfer confirmed. Received ₹${amount} from ${lenderName} P2P vault.`);
    }, 1500);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Background Worker Loops
setInterval(() => {
  const storeIds = Object.keys(db.data.stores);
  storeIds.forEach(id => {
    kuberProcure.checkStockAndReplenish(id, (msg) => sendAgentLog("Kuber (Procurement)", `[Store: ${id}] ${msg}`));
  });
}, 30000);

setInterval(() => {
  const storeIds = Object.keys(db.data.stores);
  storeIds.forEach(id => {
    vyasMarketing.runCampaigns(id, (msg) => sendAgentLog("Vyas (Marketing)", `[Store: ${id}] ${msg}`));
  });
}, 60000);

setInterval(() => {
  const storeIds = Object.keys(db.data.stores);
  const randomStore = storeIds[Math.floor(Math.random() * storeIds.length)];
  const items = db.getInventory(randomStore).filter(i => i.current_stock > 3);
  if (items.length === 0) return;
  const randomItem = items[Math.floor(Math.random() * items.length)];
  const qty = 1 + Math.floor(Math.random() * 2);

  db.updateStockByName(randomStore, randomItem.item_name, -qty);
  db.addTransaction(randomStore, {
    customer_name: ["Karan Johar", "Deepika Padukone", "Amitabh Bachchan", "Ravi Teja", "Mahesh Babu"][Math.floor(Math.random() * 5)],
    customer_phone: "+919" + Math.floor(Math.random() * 900000000 + 100000000),
    amount: randomItem.unit_retail_price * qty,
    items: `${randomItem.item_name} (${qty} units)`,
    payment_status: "SUCCESS",
    status: "completed"
  });

  sendAgentLog("Chanakya (CFO)", `[Store: ${randomStore}] Soundbox alert: Received payment of ₹${randomItem.unit_retail_price * qty} for ${randomItem.item_name}.`);
}, 45000);

// Start server
server.listen(PORT, () => {
  console.log(`Dhanda.ai Backend Gateway running on port ${PORT}`);
});
