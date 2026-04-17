const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

// It's recommended to initialize firebase-admin only once.
// This can be done in your main index.js file.
// If you haven't, uncomment the following line:
// admin.initializeApp();

exports.logTestResult = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { testType, testData } = data;
  const userId = context.auth.uid;

  if (!testType || !testData) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "testType" and "testData" arguments.');
  }

  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Create a new test result document reference.
      const testResultRef = db.collection('test_results').doc();

      // 2. Save the test result.
      transaction.set(testResultRef, {
        userId,
        testType,
        testData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Create a hash of the test data for the audit trail.
      const hash = crypto.createHash('sha256').update(JSON.stringify(testData)).digest('hex');

      // 4. Create a new audit log document reference.
      const auditLogRef = db.collection('audit_log').doc();
      
      // 5. Save the audit log entry.
      transaction.set(auditLogRef, {
        userId,
        testResultId: testResultRef.id,
        action: 'CREATE_TEST_RESULT',
        hash,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { result: 'Test result logged successfully' };
  } catch (error) {
    console.error('Error in transaction:', error);
    throw new functions.https.HttpsError('internal', 'Error logging test result.');
  }
});
