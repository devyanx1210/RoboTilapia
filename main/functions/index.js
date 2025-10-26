const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Twilio credentials
const accountSid = "USa868e3ffa703687475ed23ad0783535a";
const authToken = "d7281144092794156825229b711342f1";
const client = new twilio(accountSid, authToken);

// This function listens for temperature alerts in your database
exports.sendSMSAlert = functions.database
  .ref("/alerts/{alertId}")
  .onCreate(async (snapshot, context) => {
    const alert = snapshot.val();

    const messageBody = `⚠️ ALERT: ${alert.message}\nTemperature: ${alert.temperature}°C`;

    try {
      await client.messages.create({
        body: messageBody,
        from: "09672534800",
        to: alert.phone, // e.g. "+639123456789"
      });

      console.log("SMS sent successfully!");
    } catch (error) {
      console.error("Failed to send SMS:", error);
    }
  });
