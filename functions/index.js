/* eslint-disable */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const client = twilio(accountSid, authToken);

const fromNumber = functions.config().twilio.from;
const toNumber = functions.config().twilio.to;

const thresholds = {
  pH: { min: 7.0, max: 7.5 },
  temperature: { min: 24, max: 27 },
  ammonia: { min: 0, max: 0.02 },
};

exports.monitorSensors = functions.database
  .ref("/sensors/{sensor}/current")
  .onUpdate(async (change, context) => {
    const sensor = context.params.sensor;
    const after = change.after.val();

    if (!thresholds[sensor]) return null;

    const { min, max } = thresholds[sensor];

    if (after < min || after > max) {
      const messageBody = `ALERT! ${sensor.toUpperCase()} is out of range.\nCurrent: ${after}\nThreshold: ${min} - ${max}`;

      try {
        await client.messages.create({
          body: messageBody,
          from: fromNumber,
          to: toNumber,
        });
        console.log(`SMS sent: ${messageBody}`);
      } catch (err) {
        console.error("Error sending SMS:", err);
      }
    }

    return null;
  });
