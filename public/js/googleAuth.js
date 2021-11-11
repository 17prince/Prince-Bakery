/*eslint-disable*/

const logoutBtn = document.getElementById('logout');

// Google Authentication

async function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  await sendGoogleToken(id_token);
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
}

function onLoad() {
  gapi.load('auth2', function () {
    gapi.auth2.init();
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', signOut);
}

async function sendGoogleToken(token) {
  try {
    const res = await fetch(`/api/v1/users/google/signin/${token}`, {
      method: 'GET',
    });
    const result = await res.json();
    if (result.status === 'success') {
      showAlert(result.status, 'Successfully Logged In', 1);
    }
  } catch (error) {
    console.log(error);
    // window.location.replace('/login');
  }
}
