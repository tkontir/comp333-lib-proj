/* valid_email (string) => boolean
   Simple email format validation using regex.
*/
function valid_email (email) {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email_regex.test(email);
}

/* valid_pass (string) => boolean
  Function to determine if a password is valid.
  A valid password must be:
    - At keast 6 characters long
    - Contain at least one number (1-9)
    - Contain at least one special character (!@#$%^&* etc)
*/
function valid_pass (pass) {
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


/* login () => void
  Function to handle login form submission with modern validation and animations.
*/
function login() {
  console.log("Login attempt");

  // Get form elements
  const email_input = document.getElementById('username_input');
  const password_input = document.getElementById('password_input');
  const email_help = document.getElementById('username_help');
  const password_help = document.getElementById('password_help');
  const form_message = document.getElementById('form_message');
  const login_button = document.getElementById('login_button');

  // Clear previous errors
  clear_errors();

  // Get values
  const email = email_input.value.trim();
  const password = password_input.value;

  let has_errors = false;

  // Validate email
  if (!email) {
    show_field_error(email_help, 'Email is required');
    has_errors = true;
  } else if (!valid_email(email)) {
    show_field_error(email_help, 'Please enter a valid email address');
    has_errors = true;
  }

  // Validate password
  if (!password) {
    show_field_error(password_help, 'Password is required');
    has_errors = true;
  } else if (!valid_pass(password)) {
    show_field_error(password_help, 'Password must be at least 6 characters with a number and special character');
    has_errors = true;
  }

  if (has_errors) {
    return;
  }

  // Show loading state
  show_loading_state(login_button, 'Signing in...');

  // Authenticate against user database
  authenticate_user(email, password)
    .then(user => {
      console.log("Login successful for:", user.email);
      
      // Store user session
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      // Show success message
      show_form_message(form_message, `Welcome back, ${user.firstName}! Redirecting...`, 'success');
      
      // Navigate to home page with animation
      setTimeout(() => {
        navigate_with_animation('../rooms/rooms.html');
      }, 1000);
    })
    .catch(error => {
      console.error("Login failed:", error);
      hide_loading_state(login_button, 'Sign In');
      show_form_message(form_message, error.message, 'error');
    });
}

/* goto_rooms () => void
   Function to navigate to the rooms listing page.
*/
function goto_rooms() {
  console.log("Navigating to rooms page as guest");
  navigate_with_animation('rooms/rooms.html');
}

/* authenticate_user(email, password) => Promise<User>
   Authenticate user against the users database.
*/
async function authenticate_user(email, password) {
  try {
    const user_data = await load_users();
    const user = user_data.users.find(u => 
      (u.email === email || u.username === email) && 
      u.password === password && 
      u.isActive
    );
    
    if (!user) {
      throw new Error('Invalid email/username or password');
    }
    
    // Update last login time (in a real app, this would update the database)
    user.lastLogin = new Date().toISOString();
    
    // Don't return password in the user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error.message === 'Invalid email/username or password') {
      throw error;
    }
    throw new Error('Unable to connect to authentication server. Please try again.');
  }
}

/* load_users() => Promise<Object>
   Load users database from JSON file.
*/
async function load_users() {
  const paths = ['../users.json', './users.json', '/users.json'];
  let last_error = null;
  
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Failed to fetch users.json (status ${response.status})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      last_error = error;
    }
  }
  
  throw last_error || new Error('Users database could not be loaded');
}

/* get_current_user() => User|null
   Get the currently logged-in user from session storage.
*/
function get_current_user() {
  const user_json = sessionStorage.getItem('currentUser');
  return user_json ? JSON.parse(user_json) : null;
}

/* logout() => void
   Log out the current user and redirect to login.
*/
function logout() {
  sessionStorage.removeItem('currentUser');
  navigate_with_animation('../login/login.html');
}

/* check_logged_in() => boolean
   Check if a user is currently logged in.
*/
function check_logged_in() {
  return get_current_user() !== null;
}

/* Helper Functions */
/* clear_errors() => void
   Clear all form error messages and reset input styling.
*/
function clear_errors() {
  const help_elements = document.querySelectorAll('.form-help');
  help_elements.forEach(el => el.textContent = '');
  
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => input.classList.remove('error'));
  
  const formMessage = document.getElementById('form_message');
  if (formMessage) {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }
}

/* show_field_error(help_element, message) => void
   Display an error message for a specific field.
*/
function show_field_error(help_element, message) {
  if (help_element) {
    help_element.textContent = message;
    const input = help_element.parentElement.querySelector('input');
    if (input) {
      input.classList.add('error');
      input.style.borderColor = 'var(--error)';
      input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }
  }
}

/* show_form_message(message_element, message, type) => void
   Display a message in the form with appropriate styling.
*/
function show_form_message(message_element, message, type = 'error') {
  if (message_element) {
    message_element.textContent = message;
    message_element.className = `form-message ${type}`;
  }
}

/* show_loading_state(button, text) => void
   Display loading state on a button with spinner and text.
*/
function show_loading_state(button, text) {
  if (button) {
    button.disabled = true;
    button.classList.add('loading');
    const span = button.querySelector('span');
    if (span) span.textContent = text;
  }
}

/* hide_loading_state(button, original_text) => void
   Remove loading state from a button and restore original text.
*/
function hide_loading_state(button, original_text) {
  if (button) {
    button.disabled = false;
    button.classList.remove('loading');
    const span = button.querySelector('span');
    if (span) span.textContent = original_text;
  }
}

/* navigate_with_animation(url) => void
   Navigate to a new URL with smooth fade-out animation.
*/
function navigate_with_animation(url) {
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
  const loginButton = document.getElementById('login_button');
  const guestButton = document.getElementById('guest_button');
  const emailInput = document.getElementById('username_input');
  const passwordInput = document.getElementById('password_input');

  // Login button
  if (loginButton) {
    loginButton.addEventListener('click', login);
  }

  // Guest button (rooms button)
  if (guestButton) {
    guestButton.addEventListener('click', goto_rooms);
  }

  // Enter key support
  const form = document.getElementById('login_form');
  if (form) {
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        login();
      }
    });
  }

  // Real-time validation
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim();
      const helpElement = document.getElementById('username_help');
      
      if (email && !valid_email(email)) {
        showFieldError(helpElement, 'Please enter a valid email address');
      } else if (helpElement) {
        helpElement.textContent = '';
        emailInput.style.borderColor = '';
        emailInput.style.boxShadow = '';
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
});
