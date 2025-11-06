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
  window.location.href = "home/home.html";
}

function gotoRoom (room) {
  roomId = room.target.dataset.id
  console.log(roomId)

  const targetPage = 'room/room.html';
  const newURL = `${targetPage}?id=${roomId}`;

  window.location.href = newURL;
}


// attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login_button');
  form.addEventListener('click', login);

  const testBtn = document.getElementById('test_room1');
  testBtn.addEventListener('click', gotoRoom);
  const testBtn2 = document.getElementById('test_room2');
  testBtn2.addEventListener('click', gotoRoom);
});
