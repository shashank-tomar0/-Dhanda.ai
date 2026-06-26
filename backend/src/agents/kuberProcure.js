const db = require('../services/database');

class KuberProcure {
  constructor() {
    this.name = "Kuber (Procurement)";
    this.suppliers = {
      "Sugar": "Aggarwal Wholesale Distributors",
      "Basmati Rice": "Bharat Provisions Store",
      "Fortune Mustard Oil": "Hindustan Oil Depo",
      "Surf Excel": "Unilever Wholesale Hub",
      "Ashirvaad Atta": "ITC Direct Distribution"
    };
  }

  checkStockAndReplenish(storeId, logCallback) {
    const inventory = db.getInventory(storeId);
    const criticalItems = inventory.filter(i => i.current_stock < i.safety_limit);

    if (criticalItems.length === 0) {
      return { status: "OK", message: "All stocks are above safety limits." };
    }

    const negotiations = db.getNegotiations(storeId);
    const activeItems = negotiations.filter(n => n.status === "NEGOTIATING" || n.status === "WAITING_APPROVAL").map(n => n.item_name);

    criticalItems.forEach(item => {
      if (!activeItems.includes(item.item_name)) {
        this.startSyndicateNegotiation(storeId, item, logCallback);
      }
    });

    return { status: "WARNING", criticalCount: criticalItems.length };
  }

  startSyndicateNegotiation(storeId, item, logCallback) {
    const supplier = this.suppliers[item.item_name] || "Local Wholesale Market";
    const myQty = item.safety_limit * 3;
    
    const neighbors = db.getSyndicateStores();
    const participatingNeighbors = [];
    let aggregatedQty = myQty;

    neighbors.forEach(nStore => {
      const stock = nStore.stocks[item.item_name] || 50;
      if (stock < 25) {
        const neighborNeedQty = 100;
        participatingNeighbors.push({
          id: nStore.id,
          name: nStore.name,
          qty: neighborNeedQty
        });
        aggregatedQty += neighborNeedQty;
      }
    });

    const isCartelFormed = participatingNeighbors.length > 0;
    const catalogRate = item.unit_wholesale_cost;
    
    const targetDiscount = isCartelFormed ? 0.78 : 0.90; 
    const initialBid = Math.round(catalogRate * targetDiscount);

    if (logCallback) {
      if (isCartelFormed) {
        const names = participatingNeighbors.map(n => n.name).join(", ");
        logCallback(`Kirana Cartel formed! Aggregated demand for ${item.item_name} with [${names}]. Total pooled demand: ${aggregatedQty} units. Initial leverage bid: ₹${initialBid}/unit.`);
      } else {
        logCallback(`No neighboring demand. Proceeding with single store restock of ${myQty} units of ${item.item_name}. Initial bid: ₹${initialBid}/unit.`);
      }
    }

    const newNeg = {
      supplier_name: supplier,
      item_name: item.item_name,
      quantity: aggregatedQty,
      catalog_price: catalogRate,
      offered_price: initialBid,
      agreed_price: null,
      status: "NEGOTIATING",
      is_syndicate: isCartelFormed,
      my_share_qty: myQty,
      contributions: participatingNeighbors,
      log: [
        {
          sender: "Kuber (AI)",
          message: isCartelFormed 
            ? `Namaste ${supplier}! Representing Noida Kirana Cartel (4 stores pooled). We are ready to place a joint bulk order for ${aggregatedQty} units of ${item.item_name}. Your catalog price is ₹${catalogRate}/unit. Given this aggregated demand, we are looking for a contract price of ₹${initialBid}/unit.`
            : `Hello ${supplier}, our store's ${item.item_name} inventory is critical (${item.current_stock} units). We are placing a restock order of ${myQty} units. Standard catalog price is ₹${catalogRate}/unit. Can you offer bulk discount of ₹${initialBid}/unit?`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const createdNeg = db.addNegotiation(storeId, newNeg);
    db.updateInventory(storeId, item.id, { replenishment_status: "NEGOTIATING" });

    this.runSimulatedNegotiation(storeId, createdNeg.id, logCallback);
  }

  runSimulatedNegotiation(storeId, negId, logCallback) {
    setTimeout(() => {
      const neg = db.getNegotiations(storeId).find(n => n.id === negId);
      if (!neg || neg.status !== "NEGOTIATING") return;

      const discountFactor = neg.is_syndicate ? 0.94 : 0.97;
      const counterOffer = Math.round(neg.catalog_price * discountFactor);

      neg.log.push({
        sender: neg.supplier_name,
        message: neg.is_syndicate 
          ? `Hello Cartel! ${neg.quantity} units is a substantial volume. We cannot do ₹${neg.offered_price}, but we can offer a special syndicate contract rate of ₹${counterOffer}/unit.`
          : `Hello! For ${neg.quantity} units, we cannot offer ₹${neg.offered_price}. Best we can offer is ₹${counterOffer}/unit.`,
        timestamp: new Date().toISOString()
      });
      db.updateNegotiation(storeId, negId, { log: neg.log });
      
      if (logCallback) logCallback(`[Kuber] Wholesaler counter-offered ₹${counterOffer}/unit for ${neg.item_name} order.`);

      setTimeout(() => {
        const finalBid = Math.round((neg.offered_price + counterOffer) / 2);
        neg.log.push({
          sender: "Kuber (AI)",
          message: neg.is_syndicate
            ? `Understood. Since the Syndicate pays instantly via Paytm QR Soundbox Transfer, we can split the difference. Let's settle at ₹${finalBid}/unit for this entire pooled order.`
            : `We pay instantly. Let's split the difference and settle at ₹${finalBid}/unit.`,
          timestamp: new Date().toISOString()
        });
        db.updateNegotiation(storeId, negId, { log: neg.log });
        if (logCallback) logCallback(`[Kuber] Negotiator counter-offered final compromise rate at ₹${finalBid}/unit.`);

        setTimeout(() => {
          neg.log.push({
            sender: neg.supplier_name,
            message: `Deal! ₹${finalBid}/unit is locked. Please approve the checkout link to release dispatch of pooled items.`,
            timestamp: new Date().toISOString()
          });
          db.updateNegotiation(storeId, negId, {
            log: neg.log,
            agreed_price: finalBid,
            status: "WAITING_APPROVAL"
          });

          const item = db.getInventory(storeId).find(i => i.item_name === neg.item_name);
          if (item) {
            db.updateInventory(storeId, item.id, { replenishment_status: "WAITING_APPROVAL" });
          }

          if (logCallback) logCallback(`[Kuber] Negotiation completed. Rate: ₹${finalBid}/unit. Awaiting merchant Soundbox approval.`);
        }, 1200);
      }, 1200);
    }, 1200);
  }

  approveOrder(storeId, negId) {
    const neg = db.getNegotiations(storeId).find(n => n.id === negId);
    if (!neg || neg.status !== "WAITING_APPROVAL") {
      return { success: false, message: "Order is not waiting for approval." };
    }

    const purchaseQty = neg.is_syndicate ? neg.my_share_qty : neg.quantity;

    const item = db.getInventory(storeId).find(i => i.item_name === neg.item_name);
    if (item) {
      db.updateStockByName(storeId, neg.item_name, purchaseQty);
      db.updateInventory(storeId, item.id, { replenishment_status: "NORMAL" });
    }

    db.updateNegotiation(storeId, negId, { status: "COMPLETED" });

    if (neg.is_syndicate && neg.contributions) {
      neg.contributions.forEach(contrib => {
        db.updateSyndicateStoreStock(contrib.id, neg.item_name, 100);
      });
      db.addPooledOrder({
        item_name: neg.item_name,
        total_quantity: neg.quantity,
        my_quantity: neg.my_share_qty,
        negotiated_price: neg.agreed_price,
        catalog_price: neg.catalog_price,
        savings: (neg.catalog_price - neg.agreed_price) * neg.my_share_qty,
        status: "DELIVERED"
      });
    }

    db.addTransaction(storeId, {
      customer_name: neg.supplier_name,
      customer_phone: "+91-Supplier",
      amount: neg.agreed_price * purchaseQty,
      items: neg.is_syndicate 
        ? `Kirana Cartel Pooled Refill: ${neg.item_name} (${purchaseQty} units)`
        : `Stock Refill: ${neg.item_name} (${purchaseQty} units)`,
      payment_status: "SUCCESS",
      status: "completed"
    });

    const savings = (neg.catalog_price - neg.agreed_price) * purchaseQty;

    return { 
      success: true, 
      message: `Payment of ₹${neg.agreed_price * purchaseQty} to ${neg.supplier_name} confirmed. Stock updated! ${neg.is_syndicate ? `Cartel bulk power saved you ₹${savings}!` : ''}` 
    };
  }
}

module.exports = new KuberProcure();
