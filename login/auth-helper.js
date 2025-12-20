/* Authentication Helper Functions */
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

/* initAuthListener() => void
   Initialize Firebase auth state listener.
   Call this on pages that need to check authentication status.
*/
export function initAuthListener(onAuthenticated, onUnauthenticated) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is signed in:', user.uid);
      
      // Create user session object
      const userSession = {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        emailVerified: user.emailVerified,
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      
      // Store in session
      sessionStorage.setItem('currentUser', JSON.stringify(userSession));
      
      if (onAuthenticated) {
        onAuthenticated(userSession);
      }
    } else {
      console.log('User is signed out');
      sessionStorage.removeItem('currentUser');
      
      if (onUnauthenticated) {
        onUnauthenticated();
      }
    }
  });
}

/* getCurrentUser() => User|null
   Get the currently logged-in user from session storage.
*/
export function getCurrentUser() {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

/* requireAuth(redirectUrl) => void
   Redirect to login if user is not authenticated.
   Use this on protected pages.
*/
export function requireAuth(redirectUrl = '../login/login.html') {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = redirectUrl;
  }
  return user;
}

/* logout(redirectUrl) => Promise<void>
   Log out the current user.
*/
export async function logout(redirectUrl = '../login/login.html') {
  try {
    await signOut(auth);
    console.log('User signed out from Firebase');
    sessionStorage.removeItem('currentUser');
    window.location.href = redirectUrl;
  } catch (error) {
    console.error('Error signing out:', error);
    // Still clear local session even if Firebase signout fails
    sessionStorage.removeItem('currentUser');
    window.location.href = redirectUrl;
  }
}

/* isAuthenticated() => boolean
   Check if a user is currently logged in.
*/
export function isAuthenticated() {
  return getCurrentUser() !== null;
}
