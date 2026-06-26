const db = require('./database');

class WhatsappService {
  async sendMessage(to, body) {
    const settings = db.getSettings();
    const { twilioSid, twilioToken, twilioNumber, whatsappRecipient } = settings;

    // Check if real Twilio keys are configured
    if (!twilioSid || !twilioToken || !twilioNumber) {
      console.log(`[Twilio Service] (MOCKED) Message to ${to}: "${body}"`);
      return { success: true, status: "mocked" };
    }

    const recipient = whatsappRecipient || to;
    console.log(`[Twilio Service] Sending REAL WhatsApp message to ${recipient}...`);

    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', `whatsapp:${twilioNumber}`);
      params.append('To', `whatsapp:${recipient}`);
      params.append('Body', body);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Twilio request failed");
      }

      console.log(`[Twilio Service] Real WhatsApp sent successfully! SID: ${data.sid}`);
      return { success: true, status: "sent", sid: data.sid };
    } catch (err) {
      console.error("[Twilio Service] Failed to send real WhatsApp message:", err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new WhatsappService();
