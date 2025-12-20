# Firebase Authentication Integration

This document explains how Firebase Authentication has been integrated into the Wesleyan Library application.

## Overview

The application now uses Firebase Authentication for user sign-up and login functionality. All authentication is handled through Firebase's secure backend, replacing the previous local JSON-based authentication.

## Files Modified/Created

### New Files
- **`login/firebase-config.js`** - Firebase initialization and configuration
- **`login/auth-helper.js`** - Reusable authentication helper functions

### Modified Files
- **`login/login.js`** - Updated to use Firebase authentication for login
- **`login/signup.js`** - Updated to use Firebase authentication for user registration
- **`login/login.html`** - Changed script tag to use ES6 modules
- **`login/signup.html`** - Changed script tag to use ES6 modules

## How It Works

### Sign Up Flow
1. User enters email, password, and profile information
2. Form validates all inputs locally
3. `createUserFirebase()` creates a new Firebase Auth user with email/password
4. User profile information (name, department, role) is stored in session storage
5. User is redirected to the rooms page

### Login Flow
1. User enters email and password
2. Form validates inputs locally
3. `authenticate_user_firebase()` authenticates against Firebase
4. On success, user information is stored in session storage
5. User is redirected to the rooms page

### Logout
- Calls Firebase `signOut()` to properly end the session
- Clears local session storage
- Redirects to login page

## Using the Auth System

### Basic Authentication Check
```javascript
import { getCurrentUser, isAuthenticated } from './login/auth-helper.js';

// Check if user is logged in
if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('Logged in as:', user.email);
}
```

### Protecting Pages (Require Login)
```javascript
import { requireAuth } from './login/auth-helper.js';

// At the top of your page script
const user = requireAuth(); // Redirects to login if not authenticated
console.log('Authenticated user:', user);
```

### Auth State Listener
```javascript
import { initAuthListener } from './login/auth-helper.js';

// Initialize auth listener
initAuthListener(
  (user) => {
    // User is signed in
    console.log('User logged in:', user);
  },
  () => {
    // User is signed out
    console.log('User logged out');
  }
);
```

### Logging Out
```javascript
import { logout } from './login/auth-helper.js';

// Log out and redirect
logout('../login/login.html');
```

## Firebase Error Handling

The integration includes user-friendly error messages for common Firebase authentication errors:

- `auth/email-already-in-use` - "An account with this email already exists"
- `auth/invalid-email` - "Invalid email address format"
- `auth/user-not-found` - "No account found with this email"
- `auth/wrong-password` - "Incorrect password"
- `auth/invalid-credential` - "Invalid email or password"
- `auth/weak-password` - "Password is too weak"
- `auth/too-many-requests` - "Too many failed attempts. Try again later"
- `auth/network-request-failed` - "Network error. Check your connection"

## Session Management

User sessions are managed using:
1. **Firebase Auth Session** - Firebase maintains the authentication state
2. **sessionStorage** - User profile information is stored locally for quick access

The `currentUser` object in sessionStorage contains:
```javascript
{
  id: "firebase-user-id",
  email: "user@example.com",
  displayName: "User Name",
  firstName: "First",  // (on signup)
  lastName: "Last",    // (on signup)
  department: "Computer Science",  // (on signup)
  role: "student",     // (on signup)
  lastLogin: "2025-12-19T...",
  isActive: true
}
```

## Testing

You can test the Firebase authentication by:

1. **Creating a new account** at `login/signup.html`
2. **Logging in** at `login/login.html`
3. **Checking the browser console** for Firebase authentication logs

Note: The demo credentials shown on the login page are for the old JSON-based system and won't work with Firebase. You'll need to create new accounts through the signup page.

## Next Steps

To fully leverage Firebase, consider:

1. **Firebase Firestore** - Store additional user profile data in a database
2. **Email Verification** - Send verification emails to new users
3. **Password Reset** - Allow users to reset forgotten passwords
4. **Social Login** - Add Google, Facebook, or other OAuth providers
5. **User Profiles** - Store and retrieve detailed user information from Firestore
6. **Role-Based Access** - Implement custom claims for roles (admin, student, faculty)

## Configuration

The Firebase configuration is stored in `login/firebase-config.js`. If you need to change the Firebase project, update the `firebaseConfig` object with your project's credentials from the Firebase Console.

## Security Notes

- Never commit API keys to public repositories in production
- Use environment variables for sensitive configuration
- Enable Firebase Security Rules to protect data
- Implement proper authentication checks on all protected routes
- Consider using Firebase App Check for additional security
