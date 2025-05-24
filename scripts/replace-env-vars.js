// scripts/replace-env-vars.js
const fs = require('fs');
const path = require('path');

function createFirebaseConfigScript() {
    const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || '',
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.VITE_FIREBASE_APP_ID || '',
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };

    const configScript = `
// Auto-generated Firebase configuration
window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 2)};
    `.trim();

    return configScript;
}

function updateServiceWorkerFiles(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Replace placeholder values with actual environment variables
        const replacements = {
            'PLACEHOLDER_API_KEY': process.env.VITE_FIREBASE_API_KEY || '',
            'PLACEHOLDER_AUTH_DOMAIN': process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
            'PLACEHOLDER_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID || '',
            'PLACEHOLDER_STORAGE_BUCKET': process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
            'PLACEHOLDER_MESSAGING_SENDER_ID': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
            'PLACEHOLDER_APP_ID': process.env.VITE_FIREBASE_APP_ID || '',
            'PLACEHOLDER_MEASUREMENT_ID': process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
        };

        for (const [placeholder, value] of Object.entries(replacements)) {
            content = content.replace(new RegExp(placeholder, 'g'), value);
        }

        fs.writeFileSync(filePath, content);
        console.log(`✅ Environment variables replaced in ${filePath}`);
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        process.exit(1);
    }
}

// Create Firebase config script
const distDir = path.join(process.cwd(), 'dist');
const configScriptPath = path.join(distDir, 'firebase-config.js');

try {
    const configScript = createFirebaseConfigScript();
    fs.writeFileSync(configScriptPath, configScript);
    console.log('✅ Firebase config script created at dist/firebase-config.js');
} catch (error) {
    console.error('❌ Error creating Firebase config script:', error.message);
    process.exit(1);
}

// Process service worker files in dist directory
const filesToProcess = [
    path.join(distDir, 'firebase-messaging-sw.js'),
    path.join(distDir, 'sw.js')
];

filesToProcess.forEach(filePath => {
    updateServiceWorkerFiles(filePath);
});

console.log('🎉 Environment variable replacement completed!');