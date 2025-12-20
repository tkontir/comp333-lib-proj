/* Example: How to use Firebase Auth in your pages */

// Import the auth helper functions
import { initAuthListener, requireAuth, getCurrentUser, logout } from '../login/auth-helper.js';

/* Example 1: Check if user is logged in on page load */
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  
  if (user) {
    console.log('User is logged in:', user.email);
    // Show user-specific content
    displayUserInfo(user);
  } else {
    console.log('No user logged in');
    // Show guest content or redirect
  }
});

/* Example 2: Require authentication (redirect if not logged in) */
// Put this at the top of your script for protected pages
const currentUser = requireAuth(); // Will redirect to login if not authenticated
console.log('Authenticated user:', currentUser);

/* Example 3: Initialize auth state listener */
// This listens for real-time authentication changes
initAuthListener(
  (user) => {
    // Called when user signs in
    console.log('User signed in:', user.email);
    document.getElementById('user-name').textContent = user.displayName;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
  },
  () => {
    // Called when user signs out
    console.log('User signed out');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
  }
);

/* Example 4: Logout functionality */
document.getElementById('logout-button')?.addEventListener('click', () => {
  logout('../login/login.html'); // Logs out and redirects
});

/* Helper function to display user info */
function displayUserInfo(user) {
  const userDisplay = document.getElementById('user-display');
  if (userDisplay) {
    userDisplay.innerHTML = `
      <div class="user-info">
        <p>Welcome, ${user.displayName || user.email}!</p>
        <p>Email: ${user.email}</p>
        ${user.department ? `<p>Department: ${user.department}</p>` : ''}
        ${user.role ? `<p>Role: ${user.role}</p>` : ''}
      </div>
    `;
  }
}

/* Example HTML structure for the page:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Protected Page</title>
</head>
<body>
    <div id="login-section">
        <p>Please <a href="../login/login.html">log in</a> to continue</p>
    </div>
    
    <div id="user-section" style="display: none;">
        <div id="user-display"></div>
        <button id="logout-button">Logout</button>
    </div>
    
    <script type="module" src="your-script.js"></script>
</body>
</html>
*/
