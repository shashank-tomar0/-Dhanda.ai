const db = require('../services/database');
const whatsappService = require('../services/whatsappService');

class VyasMarketing {
  constructor() {
    this.name = "Vyas (Marketing)";
  }

  getMarketingMetrics(storeId) {
    const chats = db.getChats(storeId);
    const campaignsSent = chats.filter(c => c.sender === "Vyas (AI)" && (c.message.includes("special offer") || c.message.includes("discount"))).length;
    const conversionReplies = chats.filter(c => c.sender === "Customer" && (c.message.toLowerCase().includes("yes") || c.message.toLowerCase().includes("order"))).length;
    
    return {
      campaignsSent,
      conversionReplies,
      conversionRate: campaignsSent > 0 ? Math.round((conversionReplies / campaignsSent) * 100) : 0,
      activePromos: 2
    };
  }

  runCampaigns(storeId, logCallback) {
    const transactions = db.getTransactions(storeId);
    const chats = db.getChats(storeId);
    
    const customers = {};
    transactions.forEach(t => {
      if (t.payment_status === "SUCCESS" && t.customer_phone.startsWith("+91")) {
        customers[t.customer_phone] = {
          name: t.customer_name,
          phone: t.customer_phone,
          lastPurchase: t.date,
          items: t.items
        };
      }
    });

    const dormantPhones = Object.keys(customers);
    if (dormantPhones.length === 0) return { status: "OK", sent: 0 };

    let sentCount = 0;
    dormantPhones.forEach(phone => {
      const chatHistory = chats.filter(c => c.customer_phone === phone);
      const hasRecentOffer = chatHistory.some(c => c.sender === "Vyas (AI)" && c.message.includes("offer"));

      if (!hasRecentOffer) {
        const customer = customers[phone];
        this.triggerPersonalizedOffer(storeId, customer, logCallback);
        sentCount++;
      }
    });

    return { status: "OK", sent: sentCount };
  }

  async triggerPersonalizedOffer(storeId, customer, logCallback) {
    let favoredProduct = "groceries";
    if (customer.items.toLowerCase().includes("rice")) favoredProduct = "Basmati Rice (5kg)";
    else if (customer.items.toLowerCase().includes("atta")) favoredProduct = "Ashirvaad Atta (10kg)";
    else if (customer.items.toLowerCase().includes("oil")) favoredProduct = "Fortune Mustard Oil (1L)";
    else if (customer.items.toLowerCase().includes("surf")) favoredProduct = "Surf Excel (1kg)";

    const offerPrice = favoredProduct.includes("Rice") ? 410 : favoredProduct.includes("Atta") ? 390 : 120;
    const mrp = favoredProduct.includes("Rice") ? 450 : favoredProduct.includes("Atta") ? 430 : 140;

    const languages = [
      `Namaste ${customer.name}! We noticed you haven't ordered your usual ${favoredProduct} recently. Since you are a loyal customer of our store, we have a special discount: Buy now for just ₹${offerPrice} (MRP ₹${mrp}). Reply 'YES' to confirm your order!`,
      `Hello ${customer.name}! Get your monthly stock of ${favoredProduct} at a member-exclusive rate of ₹${offerPrice} instead of ₹${mrp}. Reply 'YES' to order now and pay cash on delivery or Paytm.`
    ];

    const text = languages[Math.floor(Math.random() * languages.length)];
    
    db.addChatMessage(storeId, customer.phone, "Vyas (AI)", text);

    // TRIGGER REAL WHATSAPP CALL IF CONFIGURED
    await whatsappService.sendMessage(customer.phone, text, storeId);

    if (logCallback) logCallback(`[Vyas] Sent WhatsApp marketing offer to ${customer.name} (${customer.phone}) for ${favoredProduct}.`);
  }

  handleCustomerReply(storeId, phone, messageText, logCallback) {
    db.addChatMessage(storeId, phone, "Customer", messageText);
    if (logCallback) logCallback(`[Vyas] Received customer reply from ${phone}: "${messageText}"`);

    const lowerMsg = messageText.toLowerCase();

    setTimeout(async () => {
      if (lowerMsg.includes("yes") || lowerMsg.includes("order") || lowerMsg.includes("haan") || lowerMsg.includes("okay")) {
        const chats = db.getChats(storeId).filter(c => c.customer_phone === phone);
        const lastOffer = chats.reverse().find(c => c.sender === "Vyas (AI)" && (c.message.includes("offer") || c.message.includes("special")));
        
        let itemOrdered = "Grocery Pack";
        let amount = 250;
        
        if (lastOffer) {
          if (lastOffer.message.toLowerCase().includes("rice")) {
            itemOrdered = "Basmati Rice (5kg)";
            amount = 410;
          } else if (lastOffer.message.toLowerCase().includes("atta")) {
            itemOrdered = "Ashirvaad Atta (10kg)";
            amount = 390;
          } else if (lastOffer.message.toLowerCase().includes("oil")) {
            itemOrdered = "Fortune Mustard Oil (1L)";
            amount = 120;
          }
        }

        const inventory = db.getInventory(storeId);
        const product = inventory.find(i => itemOrdered.toLowerCase().includes(i.item_name.toLowerCase()));
        
        if (product && product.current_stock <= 0) {
          const outOfStockMsg = `We apologize, but ${product.item_name} just ran out of stock. We will notify you when it arrives.`;
          db.addChatMessage(storeId, phone, "Vyas (AI)", outOfStockMsg);
          await whatsappService.sendMessage(phone, outOfStockMsg, storeId);
          return;
        }

        const customerTx = db.getTransactions(storeId).find(t => t.customer_phone === phone) || { customer_name: "Valued Customer" };
        
        db.addTransaction(storeId, {
          customer_name: customerTx.customer_name,
          customer_phone: phone,
          amount,
          items: itemOrdered,
          payment_status: "PENDING",
          status: "pending"
        });

        db.updateStockByName(storeId, product ? product.item_name : "Sugar", -1);

        const confirmMsg = `Dhanyawad! Your order for ${itemOrdered} is booked and has been sent for packaging. Here is your Paytm link to make secure payment of ₹${amount}: https://p.paytm.me/m/dhanda_${phone.substring(9)}`;
        db.addChatMessage(storeId, phone, "Vyas (AI)", confirmMsg);
        
        // TRIGGER REAL WHATSAPP RESPONSE IF CONFIGURED
        await whatsappService.sendMessage(phone, confirmMsg, storeId);

        if (logCallback) logCallback(`[Vyas] Order confirmed for ${customerTx.customer_name}. Generated Paytm Payment link for ₹${amount}.`);

      } else {
        const fallbackMsg = "Namaste! This is the automated assistant for our store. To place an order, reply 'YES' to our latest offer, or type the items you need and we will create a bill for you!";
        db.addChatMessage(storeId, phone, "Vyas (AI)", fallbackMsg);
        await whatsappService.sendMessage(phone, fallbackMsg, storeId);
        if (logCallback) logCallback(`[Vyas] Handled chatbot query from ${phone}.`);
      }
    }, 1000);
  }
}

module.exports = new VyasMarketing();
