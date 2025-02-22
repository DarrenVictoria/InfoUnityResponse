const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MessagingResponse } = require('twilio').twiml;
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();

// Add CORS middleware
app.use(cors({ origin: true }));

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || functions.config().gemini.key);

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

// Get system prompt based on language
function getSystemPrompt(language) {
  const disasters = VALID_DISASTER_TYPES.join(', ');
  const prompts = {
    english: `You are a disaster response expert focusing on ${disasters}. 
              Provide clear, actionable advice. Include specific safety measures and mitigation strategies.`,
    sinhala: `ඔබ ${disasters} පිළිබඳ ආපදා ප්‍රතිචාර විශේෂඥයෙකි. 
              පැහැදිලි, ක්‍රියාත්මක කළ හැකි උපදෙස් ලබා ද෇න්න. විශේෂිත ආරක්ෂණ පියවර සහ අවම කිරීමේ උපාය මාර්ග ඇතුළත් කරන්න.`,
    tamil: `நீங்கள் ${disasters} பற்றிய பேரழிவு மீட்பு நிபுணர். 
           தெளிவான, செயல்படுத்தக்கூடிய ஆலோசனையை வழங்குங்கள். குறிப்பிட்ட பாதுகாப்பு நடவடிக்கைகள் மற்றும் தணிப்பு உத்திகளை சேர்க்கவும்.`
  };
  return prompts[language] || prompts.english;
}

// AI response function using Gemini
async function getModelResponse(prompt, language = 'english') {
  try {
    const model = genAI.getGenerativeModel({
      model: "tunedModels/iurchatbot-7pcq1pnz48r0",
    });

    const chat = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      history: [
        {
          role: "user",
          parts: [{ text: getSystemPrompt(language) }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in getModelResponse:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

// Helper function for border colors
function getBorderColor(disasterType) {
  const colors = {
    'Flood': 'blue',
    'Landslide': 'brown',
    'Drought': 'orange',
    'Cyclone': 'yellow',
    'Tsunami': 'teal',
    'Coastal Erosion': 'cyan',
    'Lightning Strike': 'purple',
    'Forest Fire': 'red',
    'Industrial Accident': 'gray',
    'Epidemic': 'pink'
  };
  return colors[disasterType] || 'black';
}

// SMS webhook endpoint
app.post('/', async (req, res) => {
  try {
    const messageBody = req.body.Body;
    const fromNumber = req.body.From;

    const parts = messageBody.split('#');

    if (parts.length !== 7 || parts[0].toUpperCase() !== 'DISASTER') {
      throw new Error('Invalid message format');
    }

    const [_, district, dsDivision, disasterType, description, reporterName, reporterIdNumber] = parts;

    if (!isValidDisasterType(disasterType)) {
      throw new Error('Invalid disaster type');
    }

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

    const docRef = await admin.firestore()
      .collection('crowdsourcedReports')
      .add(reportData);

    const twiml = new MessagingResponse();
    twiml.message(`Report received. Reference ID: ${docRef.id}`);

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Error processing SMS:', error);
    const twiml = new MessagingResponse();
    twiml.message('Error: Please use format DISASTER#DISTRICT#DSDIVISION#TYPE#DESCRIPTION#NAME#ID');
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

// Cloud Functions exports
exports.getDisasterResponse = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    try {
      if (!data.prompt || !data.language) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing prompt or language');
      }

      const response = await getModelResponse(data.prompt, data.language);
      return { success: true, response };
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get AI response',
        { originalError: error.message }
      );
    }
  });

exports.sendWarningNotification = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    const { warning } = data;

    try {
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
            borderColor: getBorderColor(warning.type),
            sound: 'warning_sound.mp3'
          },
          tokens: tokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log(`Successfully sent messages: ${response.successCount}`);

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

// Export the SMS webhook
exports.smsWebhook = functions
  .region('asia-southeast1')
  .https.onRequest(app);