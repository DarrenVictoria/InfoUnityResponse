/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
admin.initializeApp();

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBhjljWoplYl2TQc9NrYJw_zq2yyX_vWzQ';
const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;

const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post(translateUrl, {
      q: text,
      target: targetLanguage
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    return text; // Return original text if translation fails
  }
};

// Function to fetch and translate data from Firestore
exports.getTranslatedLocationStatus = functions.https.onRequest(async (req, res) => {
  const { language } = req.query; // e.g., 'en', 'si', 'ta'

  if (!language) {
    return res.status(400).send({ error: 'Language query parameter is required' });
  }

  try {
    const docRef = admin.firestore().collection('Location_Status').doc('divisionalSecretariats');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).send({ error: 'Document not found' });
    }

    const data = docSnap.data();
    const translatedData = {};

    // Translate each field in the document
    for (const [location, status] of Object.entries(data)) {
      translatedData[location] = {
        Safety: await translateText(status.Safety ? 'Safe' : 'Unsafe', language),
        VolunteerNeed: await translateText(status['Volunteer Need'] ? 'Needed' : 'Not Needed', language),
        WarningStatus: await translateText(status.WarningStatus, language)
      };
    }

    return res.status(200).send(translatedData);
  } catch (error) {
    console.error('Error fetching or translating data:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});
