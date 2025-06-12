// js/index.js

function isSafari() {
  // True for Safari, false for Chrome, Edge, Firefox
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

if (isSafari()) {
  // Hide login form and show the modal
  document.addEventListener("DOMContentLoaded", function() {
    var safariModal = document.getElementById("safari-modal");
    var loginForm = document.getElementById("login-form");
    if (safariModal) {
      safariModal.style.display = "flex";
    }
    if (loginForm) {
      loginForm.style.display = "none";
    }
    document.body.style.overflow = "hidden";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Wait until firebase, auth, and db are available
  function waitForFirebase() {
    return new Promise(resolve => {
      (function check() {
        if (window.firebase && window.auth && window.db) return resolve();
        setTimeout(check, 30);
      })();
    });
  }
  await waitForFirebase();

  // Remove credentials from URL if present
  if (window.location.search.includes('email=') || window.location.search.includes('password=')) {
    const cleanUrl = window.location.protocol + '//' +
                    window.location.host +
                    window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  const formEl   = document.getElementById("login-form");
  const msgBox   = document.getElementById("error-message");
  const remember = document.getElementById("remember-me");
  const emailEl  = formEl ? formEl.email : null;
  const passEl   = formEl ? formEl.password : null;

  if (formEl && remember && emailEl && passEl) {
    if (localStorage.getItem("rememberMe") === "true") {
      remember.checked = true;
      emailEl.value    = localStorage.getItem("email")    || "";
      passEl.value     = localStorage.getItem("password") || "";
    }

    formEl.addEventListener("submit", async e => {
      e.preventDefault();
      msgBox.textContent = "";
      try {
        // Sign in using Firebase Auth
        const uc = await window.auth.signInWithEmailAndPassword(
          emailEl.value.trim(),
          passEl.value.trim()
        );

        if (remember.checked) {
          localStorage.setItem("rememberMe","true");
          localStorage.setItem("email", emailEl.value);
          localStorage.setItem("password", passEl.value);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        // Look up user profile
        const meRef  = window.db.collection("users").doc(uc.user.uid);
        const meSnap = await meRef.get();
        if (!meSnap.exists) throw new Error("No user record found.");
        const me = meSnap.data();

        const dest =
          me.defaultAccount?.type === "Home"              ? "/shtml/ho/ho-dash.shtml" :
          me.defaultAccount?.type === "Property Manager" ? "/shtml/pm/pm-dash.shtml" :
          "/shtml/bluehq/hq-dash.shtml";
        window.location.href = dest;
      } catch (err) {
        msgBox.textContent = `❌ ${err.message}`;
      }
    });
  }

  // OVERLAY & TOUR INJECTION LOGIC
  const logoContainer   = document.querySelector('.login-logo-container');
  const loginContainer  = document.querySelector('.login-container');
  const overlayIndex    = document.getElementById('modal-overlay');
  const tourIframe      = document.getElementById('tour-iframe');

  function launchTour(e) {
    if (e) e.preventDefault();

    if (!overlayIndex || !logoContainer || !loginContainer || !tourIframe) {
      return;
    }

    overlayIndex.classList.add('show');
    logoContainer.classList.add('fade-out');
    loginContainer.classList.add('fade-out');

    setTimeout(() => {
      tourIframe.src = 'tour.shtml';
      tourIframe.classList.add('show');
    }, 750);
  }

  const startTourBtn = document.getElementById('start-tour-btn');
  if (startTourBtn) {
    startTourBtn.addEventListener('click', launchTour);
  }

  const signupLink = document.querySelector('.signup-link');
  if (signupLink) {
    signupLink.addEventListener('click', launchTour);
  }

  function closeTour(e) {
    if (e) e.preventDefault();
    if (tourIframe) {
      tourIframe.classList.remove('show');
      setTimeout(() => {
        tourIframe.src = '';
      }, 500);
    }
    if (overlayIndex) overlayIndex.classList.remove('show');
    if (logoContainer) logoContainer.classList.remove('fade-out');
    if (loginContainer) loginContainer.classList.remove('fade-out');
  }

  // Listen for closeTour messages from the iframe
  window.addEventListener("message", (event) => {
    if (event.data && event.data.action === "closeTour") {
      closeTour();
    }
  });
});
