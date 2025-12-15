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
  Function to handle login form submission.
*/
function login () {
  console.log("Login");

  // get email and pass
  let email = document.getElementById('username_input').value;
  let pass = document.getElementById('password_input').value;
  console.log("Email: " + email);
  console.log("Pass: " + pass);

  // navigate to home page
  window.location.href = "rooms/rooms.html";
}

// attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const login_button = document.getElementById('login_button');
  login_button.addEventListener('click', login);
});
