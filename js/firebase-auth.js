// firebase-auth.js
// Handles Firebase signup, verification, and user management (v8 CDN style)

console.log("Firebase auth loaded (browser global version)");

// Uses: window.db (Firestore), window.auth (Auth)
// Make sure firebase-init.js is loaded BEFORE this file!

// Generate a Blue account number
async function generateBlueAccountNumber() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const dateStr = `${month}${day}${year}`;

  // Get count of users created today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const usersRef = db.collection("users");
  const q = usersRef
    .where("acctCreated", ">=", firebase.firestore.Timestamp.fromDate(startOfDay))
    .where("acctCreated", "<=", firebase.firestore.Timestamp.fromDate(endOfDay));

  const querySnapshot = await q.get();
  const count = querySnapshot.size + 1; // Add 1 for the current user

  // Format: 01-MMDDYY-0001 (for Free Personal Account)
  return `01-${dateStr}-${String(count).padStart(4, '0')}`;
}

// Create a new user account in Firebase
async function createUserAccount(userData) {
  try {
    // Verify reCAPTCHA token first
    const recaptchaResponse = userData.recaptchaResponse;
    if (!recaptchaResponse) {
      return {
        success: false,
        error: "reCAPTCHA verification failed. Please try again."
      };
    }
    
    // You can verify the token on the client side if needed
    // For production, you should verify this on your server/cloud function
    
    // Create user with email and password
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );
    
    const user = userCredential.user;
    
    // Create user document in Firestore
    await firebase.firestore().collection('users').doc(user.uid).set({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username.toLowerCase(),
      phones: userData.phones,
      notifyEmail: userData.notifyEmail,
      notifyPhone1: userData.notifyPhone1,
      notifyPhone2: userData.notifyPhone2,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      verified: false
    });
    
    return {
      success: true,
      userId: user.uid
    };
  } catch (error) {
    console.error("Error creating user account:", error);
    
    // Handle specific Firebase errors
    let errorMessage = "An error occurred during signup.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please use at least 8 characters.";
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType: error.code
    };
  }
}

// Store verification code in user document
async function storeVerificationCode(userId, code) {
  try {
    // Create expiry time (10 minutes from now)
    const expiryTime = firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));

    // Update user document with verification code and expiry
    await db.collection("users").doc(userId).update({
      verificationCode: code,
      verificationCodeExpiry: expiryTime
    });

    return {
      success: true,
      expiry: expiryTime
    };
  } catch (error) {
    console.error("Error storing verification code:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Verify user code
async function verifyUserCode(userId, code) {
  try {
    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found."
      };
    }

    const userData = userDoc.data();

    // Check if code matches
    if (userData.verificationCode !== code) {
      return {
        success: false,
        error: "Invalid verification code."
      };
    }

    // Check if code is expired
    const now = firebase.firestore.Timestamp.now();
    if (userData.verificationCodeExpiry.toMillis() < now.toMillis()) {
      return {
        success: false,
        error: "Verification code has expired."
      };
    }

    // Update user verification status
    await db.collection("users").doc(userId).update({
      verificationStatus: "verified",
      verificationCode: null,
      verificationCodeExpiry: null,
      verifiedOn: now
    });

    return {
      success: true
    };
  } catch (error) {
    console.error("Error verifying user code:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Delete an unverified user
async function deleteUnverifiedUser(userId) {
  try {
    // Delete the user document
    await db.collection("users").doc(userId).delete();

    // Optionally delete any verificationCodes document if you have that structure
    // await db.collection("verificationCodes").doc(userId).delete();

    return {
      success: true
    };
  } catch (error) {
    console.error("Error deleting unverified user:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Check if a username already exists
async function checkUsernameExists(username) {
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", normalizedUsername).get();
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking username:", error);
    // Return false to allow form submission to continue
    return false;
  }
}

// Generate username suggestions
async function generateUsernameSuggestions(baseUsername) {
  const suggestions = [];

  const suggestion1 = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
  const suggestion2 = `${baseUsername}${new Date().getFullYear()}`;

  const suggestion1Exists = await checkUsernameExists(suggestion1);
  const suggestion2Exists = await checkUsernameExists(suggestion2);

  if (!suggestion1Exists) suggestions.push(suggestion1);
  if (!suggestion2Exists) suggestions.push(suggestion2);

  if (suggestions.length < 2) {
    for (let i = 0; suggestions.length < 2 && i < 5; i++) {
      const randomSuggestion = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
      const exists = await checkUsernameExists(randomSuggestion);
      if (!exists) suggestions.push(randomSuggestion);
    }
  }

  return suggestions;
}

// Check if an email already exists in the users collection
async function checkEmailExists(email) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", normalizedEmail).get();
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
}

// Check if a phone number already exists in the users collection
async function checkPhoneExists(phone) {
  try {
    const normalizedPhone = phone.replace(/\D/g, '');
    const usersRef = db.collection("users");
    // Phones is an array in user doc, so check all docs where phones array contains an object with this phone number
    const snapshot = await usersRef.where("phones", "array-contains", 
      { number: normalizedPhone }).get();

    if (!snapshot.empty) return true;

    // If that fails (because Firestore array-contains only matches exact objects), do manual scan
    const allUsers = await usersRef.get();
    let found = false;
    allUsers.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.phones)) {
        if (data.phones.some(ph => (ph && ph.number && ph.number.replace(/\D/g, '') === normalizedPhone))) {
          found = true;
        }
      }
    });
    return found;
  } catch (error) {
    console.error("Error checking phone:", error);
    return false;
  }
}

// Expose functions to window for use elsewhere
window.firebaseSignup = {
  createNewUser: createUserAccount,
  storeVerificationCode: storeVerificationCode,
  verifyUser: verifyUserCode,
  removeUnverifiedUser: deleteUnverifiedUser,
  checkUsernameExists: checkUsernameExists,
  generateUsernameSuggestions: generateUsernameSuggestions,
  checkEmailExists: checkEmailExists,
  checkPhoneExists: checkPhoneExists
};
