// scripts/replace-env-vars.js
const fs = require('fs');
const path = require('path');

function replaceEnvVars(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace placeholders with actual environment variables
        const replacements = {
            '__VITE_FIREBASE_API_KEY__': process.env.VITE_FIREBASE_API_KEY || '',
            '__VITE_FIREBASE_AUTH_DOMAIN__': process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
            '__VITE_FIREBASE_PROJECT_ID__': process.env.VITE_FIREBASE_PROJECT_ID || '',
            '__VITE_FIREBASE_STORAGE_BUCKET__': process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
            '__VITE_FIREBASE_MESSAGING_SENDER_ID__': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
            '__VITE_FIREBASE_APP_ID__': process.env.VITE_FIREBASE_APP_ID || '',
            '__VITE_FIREBASE_MEASUREMENT_ID__': process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
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

// Process service worker files in dist directory
const distDir = path.join(process.cwd(), 'dist');
const filesToProcess = [
    path.join(distDir, 'firebase-messaging-sw.js'),
    path.join(distDir, 'sw.js')
];

filesToProcess.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        replaceEnvVars(filePath);
    } else {
        console.warn(`⚠️  File not found: ${filePath}`);
    }
});

console.log('🎉 Environment variable replacement completed!');