document.addEventListener('DOMContentLoaded', function() {
    // === SAFARI BROWSER CHECK (YOUR ORIGINAL CODE) ===
    function isSafari() {
        // Returns true for Safari (not Chrome/Edge/Firefox)
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    if (isSafari()) {
        var modal = document.getElementById("safari-modal");
        if (modal) modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    // === LOGIN FORM LOGIC (YOUR ORIGINAL CODE) ===
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const rememberMeCheckbox = document.getElementById('remember-me');

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const email = emailInput.value;
            const password = passwordInput.value;

            // Basic validation
            if (!email || !password) {
                errorMessage.textContent = 'Please enter both username and password.';
                errorMessage.style.display = 'block';
                return;
            }

            // You can replace this with actual Firebase authentication (commented out as in your original file)
            /*
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    errorMessage.style.display = 'none';
                    alert('Logged in as: ' + user.email);
                })
                .catch((error) => {
                    const message = error.message;
                    errorMessage.textContent = 'Login failed: ' + message;
                    errorMessage.style.display = 'block';
                });
            */

            // For now, simple mock login (your original code)
            if (email === 'test@example.com' && password === 'password123') {
                errorMessage.style.display = 'none';
                alert('Login successful!');
            } else {
                errorMessage.textContent = 'Invalid username or password.';
                errorMessage.style.display = 'block';
            }
        });
    }

    // === "REMEMBER ME" FUNCTIONALITY (YOUR ORIGINAL CODE) ===
    if (rememberMeCheckbox) {
        if (localStorage.getItem('rememberMe') === 'true') {
            rememberMeCheckbox.checked = true;
        }
        rememberMeCheckbox.addEventListener('change', function() {
            localStorage.setItem('rememberMe', this.checked);
        });
    }

    // === ELEMENTS FOR TOUR ANIMATIONS ===
    const tourIframe = document.getElementById('tour-iframe');
    const loginLogoContainer = document.querySelector('.login-logo-container');
    const loginContainer = document.querySelector('.login-container');
    const modalOverlay = document.getElementById('modal-overlay');

    // === "CLICK HERE" LINK TO OPEN TOUR (UPDATED FOR IFRAME) ===
    const signupLink = document.querySelector('.signup-link');

    if (signupLink && tourIframe && loginLogoContainer && loginContainer && modalOverlay) {
        signupLink.addEventListener('click', function(event) {
            event.preventDefault();

            // Fade out login content
            loginLogoContainer.classList.add('fade-out');
            loginContainer.classList.add('fade-out');
            modalOverlay.classList.add('show'); // Show the overlay behind the iframe

            // After fade out, show the iframe and set its src
            setTimeout(() => {
                tourIframe.src = 'tour.shtml'; // Load the tour page into the iframe
                tourIframe.classList.add('show'); // Make iframe visible and interactive
            }, 750); // Match CSS transition duration from index.shtml style block
        });
    }

    // === FUNCTION TO CLOSE THE TOUR IFRAME AND RESTORE LANDING PAGE (NEW) ===
    // This function is made globally accessible so it can be called from within the iframe's tour.js
    window.closeTourIframe = function() {
        if (tourIframe && loginLogoContainer && loginContainer && modalOverlay) {
            // Hide iframe
            tourIframe.classList.remove('show');
            tourIframe.src = ''; // Clear src to stop video/audio if any, and reset iframe state

            // Fade in login content and hide overlay
            loginLogoContainer.classList.remove('fade-out');
            loginContainer.classList.remove('fade-out');
            modalOverlay.classList.remove('show');

            // Reset scroll if needed (assuming user might have scrolled in the iframe)
            document.body.style.overflow = ''; // Re-enable scrolling on main page if it was disabled
        }
    };
});
