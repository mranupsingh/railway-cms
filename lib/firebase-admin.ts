import admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

const formatPrivateKey = (key: string) => {
    return key.replace(/\\n/g, '\n');
};

export function initFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin;
    }

    try {
        let serviceAccount: any;

        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // Priority 1: Environment Variable (JSON String)
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY json");
            }
        }

        if (!serviceAccount) {
            // Priority 2: Service Key File (Fallback for local dev)
            try {
                // Using dynamic require to avoid build errors if file is missing in production
                serviceAccount = require("@/service_key.json");
            } catch (e) {
                console.warn("service_key.json not found.");
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin initialized successfully.");
        } else {
            console.error("Firebase Admin initialization failed: No credentials found.");
        }
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }

    return admin;
}
