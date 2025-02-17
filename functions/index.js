// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Use body-parser middleware to parse Twilio webhook requests
app.use(bodyParser.urlencoded({ extended: false }));

// Validate disaster type against allowed types
const VALID_DISASTER_TYPES = [
  "Flood", "Landslide", "Drought", "Cyclone", "Tsunami",
  "Coastal Erosion", "Lightning Strike", "Forest Fire",
  "Industrial Accident", "Epidemic"
];

// Helper function to validate disaster type
function isValidDisasterType(type) {
  return VALID_DISASTER_TYPES.includes(type);
}

// SMS webhook endpoint
app.post('/', async (req, res) => {
  try {
    // Get message body and sender's phone number
    const messageBody = req.body.Body;
    const fromNumber = req.body.From;

    // Parse the message
    const parts = messageBody.split('#');

    // Validate message format
    if (parts.length !== 7 || parts[0].toUpperCase() !== 'DISASTER') {
      throw new Error('Invalid message format');
    }

    // Extract data from message
    const [_, district, dsDivision, disasterType, description, reporterName, reporterIdNumber] = parts;

    // Validate disaster type
    if (!isValidDisasterType(disasterType)) {
      throw new Error('Invalid disaster type');
    }

    // Create report document
    const reportData = {
      district: district.trim(),
      dsDivision: dsDivision.trim(),
      disasterType: disasterType.trim(),
      description: description.trim(),
      reporterName: reporterName.trim(),
      reporterIdNumber: reporterIdNumber.trim(),
      reportType: 'single',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      source: 'sms',
      phoneNumber: fromNumber
    };

    // Add to Firestore
    const docRef = await admin.firestore()
      .collection('crowdsourcedReports')
      .add(reportData);

    // Create response message
    const twiml = new MessagingResponse();
    twiml.message(`Report received. Reference ID: ${docRef.id}`);

    // Send response
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Error processing SMS:', error);

    // Create error response
    const twiml = new MessagingResponse();
    twiml.message('Error: Please use format DISASTER#DISTRICT#DSDIVISION#TYPE#DESCRIPTION#NAME#ID');

    // Send error response
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

// New function for sending warning notifications
exports.sendWarningNotification = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { warning } = data;

    try {
      // Get all users in the affected division
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('division', '==', warning.dsDivision)
        .get();

      const tokens = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmTokens) {
          tokens.push(...userData.fcmTokens);
        }
      });

      if (tokens.length > 0) {
        const message = {
          notification: {
            title: `${warning.type} Warning for ${warning.dsDivision}`,
            body: warning.warningMessage,
          },
          data: {
            warningId: warning.messageId,
            type: warning.type,
            severity: warning.severity,
          },
          tokens: tokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log(`Successfully sent messages: ${response.successCount}`);

        // Clean up invalid tokens
        if (response.failureCount > 0) {
          const invalidTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              invalidTokens.push(tokens[idx]);
            }
          });

          const batch = admin.firestore().batch();
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const validTokens = userData.fcmTokens.filter(
              token => !invalidTokens.includes(token)
            );
            if (validTokens.length !== userData.fcmTokens.length) {
              batch.update(doc.ref, { fcmTokens: validTokens });
            }
          });
          await batch.commit();
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw new functions.https.HttpsError('internal', 'Error sending notifications');
    }
  });

// Trigger notification on new warning
exports.onNewWarning = functions
  .region('asia-southeast1')
  .firestore
  .document('warnings/{warningId}')
  .onCreate(async (snap, context) => {
    const warning = snap.data();
    try {
      await exports.sendWarningNotification.call(null, { warning });
    } catch (error) {
      console.error('Error triggering warning notification:', error);
    }
  });

// Export the function
exports.smsWebhook = functions
  .region('asia-southeast1') // Set region close to Sri Lanka
  .https.onRequest(app);