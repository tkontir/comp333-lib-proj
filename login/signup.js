/* Sign Up Functionality with Firebase Integration */
import { auth, createUserWithEmailAndPassword } from './firebase-config.js';

/* valid_email (string) => boolean
   Simple email format validation using regex.
*/
function valid_email(email) {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email_regex.test(email);
}

/* valid_pass (string) => boolean
  Function to determine if a password is valid.
  A valid password must be:
    - At least 6 characters long
    - Contain at least one number (1-9)
    - Contain at least one special character (!@#$%^&* etc)
*/
function valid_pass(pass) {
  if (pass.length < 6) {
    return false;
  }
  const number_regex = /[0-9]/;
  if (!number_regex.test(pass)) {
    return false;
  }
  const special_char_regex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!special_char_regex.test(pass)) {
    return false;
  }
  return true;
}

/* valid_name (string) => boolean
   Validate name fields (first name, last name).
*/
function valid_name(name) {
  return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
}

/* valid_username (string) => boolean
   Validate username format.
*/
function valid_username(username) {
  return username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username);
}

/* loadUsers() => Promise<Object>
   Load users database from JSON file.
*/
async function loadUsers() {
  const paths = ['../users.json', './users.json', '/users.json'];
  let lastError = null;
  
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Failed to fetch users.json (status ${response.status})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  
  throw lastError || new Error('Users database could not be loaded');
}

/* createUserFirebase(userInfo) => Promise<User>
   Create a new user account using Firebase Authentication.
*/
async function createUserFirebase(userInfo) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userInfo.email, 
      userInfo.password
    );
    
    const firebaseUser = userCredential.user;
    console.log('Firebase user created:', firebaseUser.uid);
    
    // Create user object with additional profile information
    const newUser = {
      id: firebaseUser.uid,
      username: userInfo.username,
      email: firebaseUser.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      role: userInfo.role,
      department: userInfo.department,
      displayName: `${userInfo.firstName} ${userInfo.lastName}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    
    // TODO: Store additional user profile information in Firestore/Database
    // For now, we're just using Firebase Auth
    
    return newUser;
  } catch (error) {
    console.error('Firebase user creation error:', error);
    
    // Map Firebase error codes to user-friendly messages
    let errorMessage = 'Unable to create account. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use a stronger password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
    }
    
    throw new Error(errorMessage);
  }
}

/* checkUserExists(email, username) => Promise<boolean>
   Check if email or username already exists.
*/
async function checkUserExists(email, username) {
  try {
    const userData = await loadUsers();
    return userData.users.some(u => 
      u.email.toLowerCase() === email.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    );
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

/* createUser(userInfo) => Promise<User>
   [DEPRECATED] Legacy user creation function - kept for reference.
   Create a new user account (simulated - in real app would save to database).
*/
async function createUser(userInfo) {
  try {
    // Check if user already exists
    const exists = await checkUserExists(userInfo.email, userInfo.username);
    if (exists) {
      throw new Error('An account with this email or username already exists');
    }
    
    // Generate new user ID
    const userData = await loadUsers();
    const newId = (Math.max(...userData.users.map(u => parseInt(u.id))) + 1).toString();
    
    // Create new user object
    const newUser = {
      id: newId,
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password, // In real app, this would be hashed
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      role: userInfo.role,
      department: userInfo.department,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    // In a real application, you would save this to the database
    // For this demo, we'll simulate success and return the user
    console.log('New user would be saved:', newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
}

/* signup() => void
   Function to handle sign-up form submission.
*/
async function signup() {
  console.log("Sign-up attempt");

  // Get form elements
  const firstNameInput = document.getElementById('first_name_input');
  const lastNameInput = document.getElementById('last_name_input');
  const emailInput = document.getElementById('email_input');
  const usernameInput = document.getElementById('username_input');
  const departmentInput = document.getElementById('department_input');
  const roleInput = document.getElementById('role_input');
  const passwordInput = document.getElementById('password_input');
  const confirmPasswordInput = document.getElementById('confirm_password_input');
  const formMessage = document.getElementById('form_message');
  const signupButton = document.getElementById('signup_button');

  // Clear previous errors
  clearErrors();

  // Get values
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const username = usernameInput.value.trim();
  const department = departmentInput.value;
  const role = roleInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  let hasErrors = false;

  // Validate all fields
  if (!firstName) {
    showFieldError(document.getElementById('first_name_help'), 'First name is required');
    hasErrors = true;
  } else if (!valid_name(firstName)) {
    showFieldError(document.getElementById('first_name_help'), 'Please enter a valid first name');
    hasErrors = true;
  }

  if (!lastName) {
    showFieldError(document.getElementById('last_name_help'), 'Last name is required');
    hasErrors = true;
  } else if (!valid_name(lastName)) {
    showFieldError(document.getElementById('last_name_help'), 'Please enter a valid last name');
    hasErrors = true;
  }

  if (!email) {
    showFieldError(document.getElementById('email_help'), 'Email is required');
    hasErrors = true;
  } else if (!valid_email(email)) {
    showFieldError(document.getElementById('email_help'), 'Please enter a valid email address');
    hasErrors = true;
  }

  if (!username) {
    showFieldError(document.getElementById('username_help'), 'Username is required');
    hasErrors = true;
  } else if (!valid_username(username)) {
    showFieldError(document.getElementById('username_help'), 'Username must be at least 3 characters (letters, numbers, - and _ only)');
    hasErrors = true;
  }

  if (!department) {
    showFieldError(document.getElementById('department_help'), 'Please select your department');
    hasErrors = true;
  }

  if (!role) {
    showFieldError(document.getElementById('role_help'), 'Please select your role');
    hasErrors = true;
  }

  if (!password) {
    showFieldError(document.getElementById('password_help'), 'Password is required');
    hasErrors = true;
  } else if (!valid_pass(password)) {
    showFieldError(document.getElementById('password_help'), 'Password must be at least 6 characters with a number and special character');
    hasErrors = true;
  }

  if (!confirmPassword) {
    showFieldError(document.getElementById('confirm_password_help'), 'Please confirm your password');
    hasErrors = true;
  } else if (password !== confirmPassword) {
    showFieldError(document.getElementById('confirm_password_help'), 'Passwords do not match');
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  // Show loading state
  showLoadingState(signupButton, 'Creating Account...');

  try {
    // Create user account with Firebase
    const newUser = await createUserFirebase({
      email,
      password,
      firstName,
      lastName,
      username,
      department,
      role
    });

    console.log("Sign-up successful for:", newUser.email);
    
    // Store user session
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Show success message
    showFormMessage(formMessage, `Welcome to Wesleyan Library, ${firstName}! Redirecting...`, 'success');
    
    // Navigate to rooms page with animation
    setTimeout(() => {
      navigateWithAnimation('../rooms/rooms.html');
    }, 1500);

  } catch (error) {
    console.error("Sign-up failed:", error);
    hideLoadingState(signupButton, 'Create Account');
    showFormMessage(formMessage, error.message, 'error');
  }
}

/* goto_rooms () => void
   Function to navigate to the rooms listing page as guest.
*/
function goto_rooms() {
  console.log("Navigating to rooms page as guest");
  navigateWithAnimation('../rooms/rooms.html');
}

/* Helper Functions */
function clearErrors() {
  const helpElements = document.querySelectorAll('.form-help');
  helpElements.forEach(el => el.textContent = '');
  
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('error'));
  
  const formMessage = document.getElementById('form_message');
  if (formMessage) {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }
}

function showFieldError(helpElement, message) {
  if (helpElement) {
    helpElement.textContent = message;
    const input = helpElement.parentElement.querySelector('input, select');
    if (input) {
      input.classList.add('error');
      input.style.borderColor = 'var(--error)';
      input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }
  }
}

function showFormMessage(messageElement, message, type = 'error') {
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
  }
}

function showLoadingState(button, text) {
  if (button) {
    button.disabled = true;
    button.classList.add('loading');
    const span = button.querySelector('span');
    if (span) span.textContent = text;
  }
}

function hideLoadingState(button, originalText) {
  if (button) {
    button.disabled = false;
    button.classList.remove('loading');
    const span = button.querySelector('span');
    if (span) span.textContent = originalText;
  }
}

function navigateWithAnimation(url) {
  // Add exit animation
  document.body.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

// Enhanced event listeners
document.addEventListener('DOMContentLoaded', function() {
  const signupButton = document.getElementById('signup_button');
  const guestButton = document.getElementById('guest_button');

  // Sign up button
  if (signupButton) {
    signupButton.addEventListener('click', signup);
  }

  // Guest button
  if (guestButton) {
    guestButton.addEventListener('click', goto_rooms);
  }

  // Enter key support
  const form = document.getElementById('signup_form');
  if (form) {
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        signup();
      }
    });
  }

  // Real-time validation
  const emailInput = document.getElementById('email_input');
  const usernameInput = document.getElementById('username_input');
  const passwordInput = document.getElementById('password_input');
  const confirmPasswordInput = document.getElementById('confirm_password_input');

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim();
      const helpElement = document.getElementById('email_help');
      
      if (email && !valid_email(email)) {
        showFieldError(helpElement, 'Please enter a valid email address');
      } else if (helpElement) {
        helpElement.textContent = '';
        emailInput.style.borderColor = '';
        emailInput.style.boxShadow = '';
      }
    });
  }

  if (usernameInput) {
    usernameInput.addEventListener('blur', () => {
      const username = usernameInput.value.trim();
      const helpElement = document.getElementById('username_help');
      
      if (username && !valid_username(username)) {
        showFieldError(helpElement, 'Username must be at least 3 characters (letters, numbers, - and _ only)');
      } else if (helpElement) {
        helpElement.textContent = '';
        usernameInput.style.borderColor = '';
        usernameInput.style.boxShadow = '';
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('blur', () => {
      const password = passwordInput.value;
      const helpElement = document.getElementById('password_help');
      
      if (password && !valid_pass(password)) {
        showFieldError(helpElement, 'Password must be at least 6 characters with a number and special character');
      } else if (helpElement) {
        helpElement.textContent = '';
        passwordInput.style.borderColor = '';
        passwordInput.style.boxShadow = '';
      }
    });
  }

  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('blur', () => {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const helpElement = document.getElementById('confirm_password_help');
      
      if (confirmPassword && password !== confirmPassword) {
        showFieldError(helpElement, 'Passwords do not match');
      } else if (helpElement) {
        helpElement.textContent = '';
        confirmPasswordInput.style.borderColor = '';
        confirmPasswordInput.style.boxShadow = '';
      }
    });
  }
});
