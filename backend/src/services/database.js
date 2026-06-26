const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'db.json');

const storeDefaultData = {
  ramesh: {
    name: "Ramesh Kirana Store",
    city: "Noida, Sector 98",
    transactions: [
      { id: 1, date: "2026-06-25T08:30:00Z", customer_name: "Aarav Sharma", customer_phone: "+919876543210", amount: 450, items: "Basmati Rice (5kg), Tata Salt (1kg)", payment_status: "SUCCESS", status: "completed" },
      { id: 2, date: "2026-06-25T10:15:00Z", customer_name: "Priyanka Patel", customer_phone: "+919812345678", amount: 120, items: "Amul Butter (100g), Britannia Rusk", payment_status: "SUCCESS", status: "completed" },
      { id: 3, date: "2026-06-25T14:45:00Z", customer_name: "Rahul Verma", customer_phone: "+919922334455", amount: 890, items: "Ashirvaad Atta (10kg), Fortune Mustard Oil (1L)", payment_status: "SUCCESS", status: "completed" }
    ],
    inventory: [
      { id: 1, item_name: "Basmati Rice", current_stock: 45, safety_limit: 50, unit_wholesale_cost: 65, unit_retail_price: 90, replenishment_status: "NORMAL" },
      { id: 2, item_name: "Ashirvaad Atta", current_stock: 80, safety_limit: 30, unit_wholesale_cost: 32, unit_retail_price: 45, replenishment_status: "NORMAL" },
      { id: 3, item_name: "Fortune Mustard Oil", current_stock: 12, safety_limit: 20, unit_wholesale_cost: 130, unit_retail_price: 165, replenishment_status: "NORMAL" },
      { id: 4, item_name: "Sugar", current_stock: 8, safety_limit: 40, unit_wholesale_cost: 34, unit_retail_price: 44, replenishment_status: "NORMAL" },
      { id: 5, item_name: "Surf Excel", current_stock: 25, safety_limit: 15, unit_wholesale_cost: 110, unit_retail_price: 140, replenishment_status: "NORMAL" }
    ],
    negotiations: [],
    whatsapp_chats: [
      { id: 1, customer_phone: "+919876543210", sender: "Vyas (AI)", message: "Namaste Aarav! We noticed you haven't ordered your Basmati Rice this month. Since you are our loyal customer, here is a special offer: get Basmati Rice (5kg) for just ₹420 (MRP ₹450). Reply 'YES' to order!", timestamp: "2026-06-25T16:00:00Z" }
    ],
    lending: { eligibility_score: 85, borrow_capacity: 250000, interest_rate: 11.5, status: "PRE_APPROVED" }
  },
  verma: {
    name: "Verma Provisions Store",
    city: "Delhi, Laxmi Nagar",
    transactions: [
      { id: 1, date: "2026-06-25T09:00:00Z", customer_name: "Amit Kumar", customer_phone: "+919899887766", amount: 1500, items: "Basmati Rice (20kg), Sugar (5kg)", payment_status: "SUCCESS", status: "completed" },
      { id: 2, date: "2026-06-25T12:30:00Z", customer_name: "Neha Goel", customer_phone: "+919811223344", amount: 320, items: "Surf Excel (2kg)", payment_status: "SUCCESS", status: "completed" }
    ],
    inventory: [
      { id: 1, item_name: "Basmati Rice", current_stock: 12, safety_limit: 50, unit_wholesale_cost: 65, unit_retail_price: 90, replenishment_status: "NORMAL" },
      { id: 2, item_name: "Ashirvaad Atta", current_stock: 18, safety_limit: 30, unit_wholesale_cost: 32, unit_retail_price: 45, replenishment_status: "NORMAL" },
      { id: 3, item_name: "Fortune Mustard Oil", current_stock: 35, safety_limit: 20, unit_wholesale_cost: 130, unit_retail_price: 165, replenishment_status: "NORMAL" },
      { id: 4, item_name: "Sugar", current_stock: 55, safety_limit: 40, unit_wholesale_cost: 34, unit_retail_price: 44, replenishment_status: "NORMAL" },
      { id: 5, item_name: "Surf Excel", current_stock: 9, safety_limit: 15, unit_wholesale_cost: 110, unit_retail_price: 140, replenishment_status: "NORMAL" }
    ],
    negotiations: [],
    whatsapp_chats: [],
    lending: { eligibility_score: 55, borrow_capacity: 80000, interest_rate: 13.5, status: "PRE_APPROVED" }
  },
  gupta: {
    name: "Gupta Mart",
    city: "Ghaziabad, Indirapuram",
    transactions: [
      { id: 1, date: "2026-06-25T11:00:00Z", customer_name: "Karan Singh", customer_phone: "+919988776655", amount: 250, items: "Sugar (5kg), Tata Salt (1kg)", payment_status: "SUCCESS", status: "completed" }
    ],
    inventory: [
      { id: 1, item_name: "Basmati Rice", current_stock: 90, safety_limit: 50, unit_wholesale_cost: 65, unit_retail_price: 90, replenishment_status: "NORMAL" },
      { id: 2, item_name: "Ashirvaad Atta", current_stock: 110, safety_limit: 30, unit_wholesale_cost: 32, unit_retail_price: 45, replenishment_status: "NORMAL" },
      { id: 3, item_name: "Fortune Mustard Oil", current_stock: 8, safety_limit: 20, unit_wholesale_cost: 130, unit_retail_price: 165, replenishment_status: "NORMAL" },
      { id: 4, item_name: "Sugar", current_stock: 75, safety_limit: 40, unit_wholesale_cost: 34, unit_retail_price: 44, replenishment_status: "NORMAL" },
      { id: 5, item_name: "Surf Excel", current_stock: 35, safety_limit: 15, unit_wholesale_cost: 110, unit_retail_price: 140, replenishment_status: "NORMAL" }
    ],
    negotiations: [],
    whatsapp_chats: [],
    lending: { eligibility_score: 92, borrow_capacity: 500000, interest_rate: 9.8, status: "PRE_APPROVED" }
  }
};

const defaultData = {
  stores: storeDefaultData,
  syndicate_stores: [
    { id: "verma", name: "Verma Kirana Store", distance: "0.2 km", stocks: { "Sugar": 5, "Basmati Rice": 80, "Fortune Mustard Oil": 18, "Surf Excel": 12 } },
    { id: "gupta", name: "Gupta Provisions Store", distance: "0.5 km", stocks: { "Sugar": 8, "Basmati Rice": 20, "Fortune Mustard Oil": 3, "Surf Excel": 22 } },
    { id: "fresh", name: "Noida Fresh Grocery", distance: "1.1 km", stocks: { "Sugar": 42, "Basmati Rice": 10, "Fortune Mustard Oil": 15, "Surf Excel": 8 } }
  ],
  pooled_orders: [],
  settings: {
    twilioSid: '',
    twilioToken: '',
    twilioNumber: '',
    whatsappRecipient: ''
  },
  users: [
    { id: 1, username: "merchant", passwordHash: "5e883767f3759680ec81794790463490058319672f3a41a49e0b8720b6e1b4b4", storeId: "ramesh" } // SHA-256 for "password"
  ],
  
  // NEW next-gen tables
  p2p_loans: [
    { id: 1, date: "2026-06-25T11:20:00Z", debtor: "Verma Kirana Store", creditor: "Your Shop", amount: 1500, interest: "0.05% daily", status: "ACTIVE" }
  ],
  cctv_feeds: [
    { id: 1, time: "14:10:04", label: "Shelf 4 (Sugar)", event: "depleted", confidence: 0.94 },
    { id: 2, time: "14:10:12", label: "Customer #3", event: "shelf_4_empty_warning", confidence: 0.89 }
  ]
};

class Database {
  constructor() {
    this.data = { ...defaultData };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          stores: { ...defaultData.stores, ...parsed.stores },
          syndicate_stores: parsed.syndicate_stores || defaultData.syndicate_stores,
          pooled_orders: parsed.pooled_orders || defaultData.pooled_orders,
          settings: { ...defaultData.settings, ...parsed.settings },
          p2p_loans: parsed.p2p_loans || defaultData.p2p_loans,
          cctv_feeds: parsed.cctv_feeds || defaultData.cctv_feeds,
          users: parsed.users || defaultData.users
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load JSON database, using in-memory fallback", e);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error("Failed to save JSON database", e);
    }
  }

  getStore(storeId) {
    const id = storeId || 'ramesh';
    if (!this.data.stores[id]) {
      this.data.stores[id] = JSON.parse(JSON.stringify(storeDefaultData.ramesh));
      this.save();
    }
    return this.data.stores[id];
  }

  // Transactions
  getTransactions(storeId) {
    return this.getStore(storeId).transactions;
  }

  addTransaction(storeId, tx) {
    const store = this.getStore(storeId);
    const newId = store.transactions.length > 0 ? Math.max(...store.transactions.map(t => t.id)) + 1 : 1;
    const newTx = { id: newId, date: new Date().toISOString(), ...tx };
    store.transactions.push(newTx);
    this.save();
    return newTx;
  }

  // Inventory
  getInventory(storeId) {
    return this.getStore(storeId).inventory;
  }

  updateInventory(storeId, id, updates) {
    const store = this.getStore(storeId);
    const item = store.inventory.find(i => i.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  }

  updateStockByName(storeId, name, quantityChange) {
    const store = this.getStore(storeId);
    const item = store.inventory.find(i => i.item_name.toLowerCase() === name.toLowerCase());
    if (item) {
      item.current_stock += quantityChange;
      if (item.current_stock < 0) item.current_stock = 0;
      this.save();
    }
    return item;
  }

  // Negotiations
  getNegotiations(storeId) {
    return this.getStore(storeId).negotiations;
  }

  addNegotiation(storeId, neg) {
    const store = this.getStore(storeId);
    const newId = store.negotiations.length > 0 ? Math.max(...store.negotiations.map(n => n.id)) + 1 : 1;
    const newNeg = { id: newId, ...neg };
    store.negotiations.push(newNeg);
    this.save();
    return newNeg;
  }

  updateNegotiation(storeId, id, updates) {
    const store = this.getStore(storeId);
    const neg = store.negotiations.find(n => n.id === id);
    if (neg) {
      Object.assign(neg, updates);
      this.save();
    }
    return neg;
  }

  // WhatsApp Chats
  getChats(storeId) {
    return this.getStore(storeId).whatsapp_chats;
  }

  getChatByPhone(storeId, phone) {
    return this.getChats(storeId).filter(c => c.customer_phone === phone);
  }

  addChatMessage(storeId, phone, sender, message) {
    const store = this.getStore(storeId);
    const newId = store.whatsapp_chats.length > 0 ? Math.max(...store.whatsapp_chats.map(c => c.id)) + 1 : 1;
    const newMsg = { id: newId, customer_phone: phone, sender, message, timestamp: new Date().toISOString() };
    store.whatsapp_chats.push(newMsg);
    this.save();
    return newMsg;
  }

  // Lending
  getLending(storeId) {
    return this.getStore(storeId).lending;
  }

  updateLending(storeId, updates) {
    const store = this.getStore(storeId);
    Object.assign(store.lending, updates);
    this.save();
    return store.lending;
  }

  // Syndicate Stores
  getSyndicateStores() {
    return this.data.syndicate_stores;
  }

  updateSyndicateStoreStock(storeId, itemName, stock) {
    const store = this.data.syndicate_stores.find(s => s.id === storeId);
    if (store && store.stocks) {
      store.stocks[itemName] = stock;
      this.save();
    }
    return store;
  }

  // Pooled Orders
  getPooledOrders() {
    return this.data.pooled_orders;
  }

  addPooledOrder(order) {
    const newId = this.data.pooled_orders.length > 0 ? Math.max(...this.data.pooled_orders.map(o => o.id)) + 1 : 1;
    const newOrder = { id: newId, date: new Date().toISOString(), ...order };
    this.data.pooled_orders.push(newOrder);
    this.save();
    return newOrder;
  }

  // Twilio Settings
  getSettings(storeId) {
    const id = storeId || 'ramesh';
    const store = this.getStore(id);
    if (!store.settings) {
      store.settings = {
        twilioSid: this.data.settings.twilioSid || '',
        twilioToken: this.data.settings.twilioToken || '',
        twilioNumber: this.data.settings.twilioNumber || '',
        whatsappRecipient: this.data.settings.whatsappRecipient || '',
        wholesalerPhone: '',
        paytmMid: '',
        paytmKey: '',
        paytmVpa: ''
      };
    }
    return store.settings;
  }

  updateSettings(storeId, updates) {
    const id = storeId || 'ramesh';
    const store = this.getStore(id);
    if (!store.settings) {
      store.settings = {};
    }
    Object.assign(store.settings, updates);
    this.save();
    return store.settings;
  }

  // Auth Methods
  registerUser(username, password) {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const existing = this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      throw new Error("Username already exists");
    }
    const storeId = `store_${username.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      id: this.data.users.length + 1,
      username,
      passwordHash,
      storeId,
      onboarded: false
    };
    this.data.users.push(newUser);
    
    // Seed new store defaults
    const store = this.getStore(storeId);
    store.name = `${username.charAt(0).toUpperCase() + username.slice(1)}'s Kirana Store`;
    
    this.save();
    return newUser;
  }

  verifyUser(username, password) {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === passwordHash);
    return user || null;
  }

  onboardStore(storeId, storeName, city, details) {
    const store = this.getStore(storeId);
    store.name = storeName;
    store.city = city;
    store.settings = {
      twilioSid: details.twilioSid || '',
      twilioToken: details.twilioToken || '',
      twilioNumber: details.twilioNumber || '',
      whatsappRecipient: details.whatsappRecipient || '',
      wholesalerPhone: details.wholesalerPhone || '',
      paytmMid: details.paytmMid || '',
      paytmKey: details.paytmKey || '',
      paytmVpa: details.paytmVpa || ''
    };
    
    const user = this.data.users.find(u => u.storeId === storeId);
    if (user) {
      user.onboarded = true;
    }
    
    this.save();
    return store;
  }

  // NEW P2P Loans
  getP2PLoans() {
    return this.data.p2p_loans;
  }

  addP2PLoan(loan) {
    const newId = this.data.p2p_loans.length > 0 ? Math.max(...this.data.p2p_loans.map(l => l.id)) + 1 : 1;
    const newLoan = { id: newId, date: new Date().toISOString(), ...loan };
    this.data.p2p_loans.push(newLoan);
    this.save();
    return newLoan;
  }

  // NEW CCTV logs
  getCCTVLogs() {
    return this.data.cctv_feeds;
  }

  addCCTVLog(log) {
    const newId = this.data.cctv_feeds.length > 0 ? Math.max(...this.data.cctv_feeds.map(f => f.id)) + 1 : 1;
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newLog = { id: newId, time: timeStr, ...log };
    this.data.cctv_feeds.push(newLog);
    // Cap at 10 items
    if (this.data.cctv_feeds.length > 10) this.data.cctv_feeds.shift();
    this.save();
    return newLog;
  }
}

module.exports = new Database();
