/* valid_email (string) => boolean
   Simple email format validation using regex.
*/
function valid_email (email) {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email_regex.test(email);
}

/* valid_pass (string) => boolean
   Simple email format validation using regex.
*/
function valid_pass (pass) {
  // const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // return email_regex.test(pass);
  return true;
}


/* handle_form_submit (Event) => void
   Validate fields and simulate an async login attempt. Shows success or error messages.
*/
function handle_form_submit (evt) {
  evt.preventDefault();
  const form = document.getElementById('login_form');
  const username_input = document.getElementById('username_input');
  const password_input = document.getElementById('password_input');
  const form_message = document.getElementById('form_message');

  // simple client-side validation
  if (!username_input.value || username_input.value.trim().length < 3) {
    form_message.textContent = 'Please enter a username (at least 3 characters).';
    username_input.focus();
    return;
  }
  if (!password_input.value || password_input.value.length < 6) {
    form_message.textContent = 'Password must be at least 6 characters.';
    password_input.focus();
    return;
  }

  form_message.textContent = 'Signing in...';

  // simulate async login
  fake_authenticate(username_input.value.trim(), password_input.value)
    .then((result) => {
      if (result.success) {
        form_message.style.color = 'green';
        form_message.textContent = 'Signed in successfully (demo). Redirecting...';
        // in a real app we'd redirect. For demo we just clear after a moment.
        setTimeout(() => {
          form_message.textContent = '';
          form.reset();
          form_message.style.color = '';
        }, 1200);
      } else {
        form_message.style.color = '';
        form_message.textContent = 'Invalid username or password.';
      }
    })
    .catch((err) => {
      form_message.style.color = '';
      form_message.textContent = 'An unexpected error occurred.';
      console.error(err);
    });
}

/* fake_authenticate (string, string) => Promise<{success: boolean}>
   A tiny fake authentication function that resolves after a short delay.
   Accepts a demo user: demo / password123
*/
function fake_authenticate (username, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (username.toLowerCase() === 'demo' && password === 'password123') {
        resolve({ success: true });
      } else {
        resolve({ success: false });
      }
    }, 700);
  });
}

/* toggle_password_visibility (MouseEvent) => void
   Toggle the password input between text and password for visibility.
*/
function toggle_password_visibility (evt) {
  const btn = evt.currentTarget;
  const input = document.getElementById('password_input');
  const is_pressed = btn.getAttribute('aria-pressed') === 'true';
  if (is_pressed) {
    input.type = 'password';
    btn.textContent = 'Show';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Show password');
  } else {
    input.type = 'text';
    btn.textContent = 'Hide';
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Hide password');
  }
}

/* fill_demo_credentials (MouseEvent) => void
   Populate the form with demo credentials and submit.
*/
function fill_demo_credentials (evt) {
  const username_input = document.getElementById('username_input');
  const password_input = document.getElementById('password_input');
  username_input.value = 'demo';
  password_input.value = 'password123';
  // submit the form programmatically
  document.getElementById('login_form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

// attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login_form');
  const toggle_btn = document.getElementById('toggle_password');
  const demo_btn = document.getElementById('demo_login');

  form.addEventListener('submit', handle_form_submit);
  toggle_btn.addEventListener('click', toggle_password_visibility);
  demo_btn.addEventListener('click', fill_demo_credentials);
});
