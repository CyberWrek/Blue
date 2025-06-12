// =====================================================
// Section 0: Helper Functions
// =====================================================

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// =====================================================
// Section 1: DOMContentLoaded, Key Elements & State Vars
// =====================================================

document.addEventListener("DOMContentLoaded", function() {

  // ---- Section 1.1: Show Tour Buttons on Load ----
  
  setTimeout(function(){
    document.getElementById('skip-tour').classList.add('visible');
    document.getElementById('tour-close').classList.add('visible');
  }, 750);

  // ---- Section 1.2: Key Element Selectors & State Vars ----
  
  const blue   = document.getElementById("blue-circle");
  const white  = document.getElementById("white-circle");
  const hi     = document.getElementById("circle-content");
  const t1     = document.getElementById("text1");
  const t2     = document.getElementById("text2");
  const b      = document.getElementById("blah");
  const tour   = document.getElementById("tour-items");
  const items  = document.querySelectorAll(".tour-item");
  const btn    = document.getElementById("sign-up-btn");
  const skip   = document.getElementById("skip-tour");
  const closeBtn   = document.getElementById("tour-close");
  const close  = document.getElementById("tour-close");
  const signupHeader = document.querySelector('.signup-header-title');
  if (signupHeader) {
    signupHeader.textContent = "Free Personal Account: Sign-Up";
  }
  let skipTriggered = false;
  let morphingToSignup = false;

// =====================================================
// Section 2: Animation Reset & Morph Helpers
// =====================================================

  // ---- Section 2.1: Clear Morph Styles ----
  function clearMorphStyles() {
    [blue, white].forEach(el => {
      el.style.width = "";
      el.style.height = "";
      el.style.left = "";
      el.style.top = "";
      el.style.borderRadius = "";
      el.style.transform = "";
    });
  }

  // ---- Section 2.2: Reset Blue/White Circles ----
  function resetBlueWhiteCircles() {
    clearMorphStyles();
    blue.classList.remove('signup-mode', 'verification-mode');
    white.classList.remove('signup-mode', 'verification-mode');
    blue.removeAttribute('style');
    white.removeAttribute('style');
  }

  // ---- Section 2.3: Hard Reset Tour State ----
  function hardResetTour() {
    skipTriggered = false;
    morphingToSignup = false;
    resetBlueWhiteCircles();
    if (signupHeader) signupHeader.classList.remove('visible');
    [hi, t1, t2, b, tour, btn].forEach(el => {
      if (!el) return;
      el.style.transition = "";
      el.style.opacity    = "";
      el.style.visibility = "";
      el.style.display    = "";
      el.style.transform  = "";
    });
    items.forEach((it, i) => {
      it.classList.remove("active");
      it.classList.remove("fade-out");
      it.classList.remove("visible");
      it.style.opacity = "";
      it.style.visibility = "";
      it.style.transform = "";
    });
    btn.classList.remove("fade-out");
    btn.classList.remove("visible");
    btn.style.opacity = "0";
    btn.style.visibility = "hidden";
    btn.style.pointerEvents = "none";
    btn.style.display = "none";
    b.classList.remove("fade-out");
    white.classList.remove('signup-mode', 'verification-mode');
    blue.classList.remove('signup-mode', 'verification-mode');
    if (white && white.dataset.hasSignup === "true") {
      white.innerHTML = `<div id="circle-content">Hi there!</div>`;
      white.dataset.hasSignup = "";
    }
  }

// =====================================================
// Section 3: Role Blurbs and Tour Item Handlers
// =====================================================

// ---- Section 3.1: Role Blurb Definitions ----
  const blurbs = [
    `<b>New Homeowners</b><br>
    Settle into your new home with confidence. Log warranty issues, track repairs, and access essential resources—everything you need, in one place.`,
    `<b>Strata Agents</b><br>
    Oversee strata properties, submit and monitor warranty claims, and keep your community running smoothly—all from one central hub.`,
    `<b>Builders</b><br>
    Simplify pre-occupancy inspections, manage deficiency lists, and collaborate with your trades and developer teams. Blue streamlines every handover.`,
    `<b>Property Developers</b><br>
    Oversee the entire homeowner care process. Monitor performance metrics, coordinate repairs, and ensure every homeowner’s experience is on-brand.`,
    `<b>Warranty Providers</b><br>
    Resolve claims faster. Track tickets, communicate directly with homeowners and builders, and keep everyone on the same page.`,
    `<b>Trades & Suppliers</b><br>
    Never miss a repair request. Get notified instantly, submit updates, and close out jobs efficiently with full transparency.`
  ];

// ---- Section 3.2: Attach Blurb Display to Tour Item Clicks ----
  items.forEach((it, i) => {
    it.addEventListener("click", () => {
      items.forEach(btn => btn.classList.remove("active"));
      it.classList.add("active");
      b.style.transition = "opacity .75s ease-in-out";
      b.style.opacity = "0";
      b.addEventListener("transitionend", function h() {
        b.removeEventListener("transitionend", h);
        b.style.left = "calc(50% + 110px)";
        b.style.top = "calc(50% - 165px)";
        b.style.transform = "translateX(-50%)";
        b.style.maxWidth = "380px";
        b.style.fontSize = "18px";
        b.style.lineHeight = "1.2";
        b.style.background = "none";
        b.style.padding = "0";
        b.innerHTML = blurbs[i];
        b.style.visibility = "visible";
        b.style.opacity = "1";
        showSignUpButton();
      }, { once: true });
    });
  });

// =====================================================
// Section 4: Signup Form Injection (Grid) and Related Logic
// =====================================================

function injectSignupForm() {
  clearMorphStyles();
  blue.classList.remove('verification-mode');
  white.classList.remove('verification-mode');
  blue.classList.add('signup-mode');
  white.classList.add('signup-mode');
  white.dataset.hasSignup = "true";
  white.innerHTML = `
    <div class="signup-blurb" style="position: absolute; top: 0px; left: 20px; width: calc(100% - 40px);">
      <p>Create your account below to get started. Your details are never shared outside your organization.</p>
    </div>
    <form id="signupForm" class="signup-form-fade" autocomplete="off" action="javascript:void(0);" spellcheck="false" novalidate>
      <input type="text" name="fakeusernameremembered" autocomplete="username" style="display:none">
      <input type="email" name="fakeemailremembered" autocomplete="email" style="display:none">
      <input type="password" name="fakepasswordremembered" autocomplete="new-password" style="display:none">
      <input type="password" name="fakeoldpasswordremembered" autocomplete="current-password" style="display:none">
      <div class="signup-grid">
        <div class="cell" style="grid-row:3;grid-column:3 / span 6;">
          <label for="firstName">First Name *</label>
        </div>
        <div class="cell" style="grid-row:3;grid-column:9 / span 12;">
          <input type="text" id="firstName" name="firstName" class="input-wide" autocomplete="new-firstname-xyz" required>
        </div>
        <div class="cell" style="grid-row:3;grid-column:24 / span 6;">
          <label for="lastName">Last Name *</label>
        </div>
        <div class="cell" style="grid-row:3;grid-column:30 / span 12;">
          <input type="text" id="lastName" name="lastName" class="input-wide" autocomplete="new-lastname-xyz" required>
        </div>
        <div class="cell" style="grid-row:4;grid-column:3 / span 6;">
          <label for="phone1">Phone 1</label>
        </div>
        <div class="cell" style="grid-row:4;grid-column:9 / span 7;">
          <input type="tel" id="phone1" name="phone1" class="input-wide" autocomplete="new-phone1-xyz">
        </div>
        <div class="cell mobile-cell" style="grid-row:4;grid-column:17 / span 3;">
          <label class="inline-label">
            <input type="checkbox" id="mobile1" name="mobile1"/> Mobile?
          </label>
        </div>
        <div class="cell" style="grid-row:4;grid-column:24 / span 6;">
          <span id="phone2wrap" style="display:none;">
            <label for="phone2">Phone 2</label>
          </span>
          <button type="button" id="addPhoneBtn" style="display:none;">Add Second Phone</button>
        </div>
        <div class="cell" style="grid-row:4;grid-column:29 / span 7;">
          <span id="phone2inputwrap" style="display:none;">
            <input type="tel" id="phone2" name="phone2" class="input-wide" autocomplete="new-phone2-xyz">
          </span>
        </div>
        <div class="cell mobile-cell" style="grid-row:4;grid-column:37 / span 3;">
          <span id="mobile2wrap">
            <label class="inline-label">
              <input type="checkbox" id="mobile2" name="mobile2"/> Mobile?
            </label>
          </span>
        </div>
        <div class="cell email-label-cell" style="grid-row:5;grid-column:3 / span 6; display:flex; align-items:center;">
          <label for="email" class="email-label">Email *</label>
        </div>
        <div class="cell" style="grid-row:5;grid-column:9 / span 12;">
          <div class="input-info-wrap">
            <input type="email" id="email" name="email" class="input-wide" autocomplete="new-email-xyz" required>
            <button type="button" id="emailInfoBtn" aria-label="Notification Info" class="info-btn" tabindex="0"></button>
          </div>
        </div>
        <div class="cell" style="grid-row:6;grid-column:3 / span 30;">
          <span id="notifyWrap" style="display:flex; align-items:center; flex-wrap:nowrap;">
            <label style="margin-right:15px;">Notifications:</label>
            <label>
              <input type="checkbox" id="notifyEmail" name="notifyEmail" checked/> Email
            </label>
            <span id="notifyPhone1Wrap" class="hidden">
              <label class="notify-checkbox-label">
                <input type="checkbox" id="notifyPhone1" name="notifyPhone1" disabled/> Phone 1
              </label>
            </span>
            <span id="notifyPhone2Wrap" class="hidden">
              <label class="notify-checkbox-label">
                <input type="checkbox" id="notifyPhone2" name="notifyPhone2" disabled/> Phone 2
              </label>
            </span>
          </span>
        </div>
        <div class="cell" style="grid-row:8;grid-column:3 / span 6;">
          <label for="username">Username *</label>
        </div>
        <div class="cell" style="grid-row:8;grid-column:9 / span 11;">
          <input type="text" id="username" name="username" class="input-wide" autocomplete="new-username-xyz" required>
        </div>
        <!-- Move password fields to row 9 -->
        <div class="cell" style="grid-row:9;grid-column:3 / span 6;">
          <label for="password">Password *</label>
        </div>
        <div class="cell" style="grid-row:9;grid-column:9 / span 12;">
          <input type="password" id="password" name="password" class="input-wide" autocomplete="new-password-xyz" required minlength="8">
        </div>
        <div class="cell" style="grid-row:9;grid-column:24 / span 10;">
          <label for="confirmPassword">Confirm Password*</label>
        </div>
        <div class="cell" style="grid-row:9;grid-column:33 / span 12;">
          <input type="password" id="confirmPassword" name="confirmPassword" class="input-wide" autocomplete="new-confirm-password-xyz" required minlength="8">
        </div>
        <!-- Move Terms of Service to row 10 -->
        <div class="cell tos" style="grid-row:10; grid-column:3 / span 14; justify-content: flex-start;">
          <label id="tosLabel" class="tos-label">
            <input type="checkbox" id="terms" required>
            I agree to the <span class="tos-spacer"></span><a href="#">Terms of Service</a>
          </label>
        </div>
        <!-- Add reCAPTCHA below TOS -->
<div class="cell" style="grid-row:11; grid-column:3 / span 44; margin-top:5px;">
  <div id="recaptcha-container" class="g-recaptcha-container">
    <div id="g-recaptcha" class="g-recaptcha" ...></div>
  </div>
</div>

        <!-- Move button to row 12 -->
        <div class="cell btnrow" style="grid-row:12; grid-column:1 / span 48; justify-content: center; text-align: center; margin-top:15px;">
          <button type="submit" id="nextStepBtn" class="btn">Next Step: Verify Account</button>
        </div>
        <div class="cell error" style="grid-row:13; grid-column:1 / span 12;">
          <div id="signupError"></div>
        </div>
      </div>
    </form>
  `;
  
  setTimeout(() => {
    const mobile2wrap = document.getElementById("mobile2wrap");
    const phone2wrap = document.getElementById("phone2wrap");
    const phone2inputwrap = document.getElementById("phone2inputwrap");
    if (!window._signupFormFields || !window._signupFormFields.phone2 || !window._signupFormFields.phone2.trim()) {
      if (mobile2wrap) mobile2wrap.style.display = "none";
      if (phone2wrap) phone2wrap.style.display = "none";
      if (phone2inputwrap) phone2inputwrap.style.display = "none";
    }
    if (typeof grecaptcha !== 'undefined') {
      if (!document.querySelector('.g-recaptcha iframe')) {
        try {
          const recaptchaElement = document.getElementById('g-recaptcha');
          if (recaptchaElement && grecaptcha.render) {
            grecaptcha.render('g-recaptcha', {
              'sitekey': '6Ldf_VUrAAAAAIP_Fb-FFIZtciePKgNkANxgVoPA',
              'callback': 'recaptchaCallback'
            });
          }
        } catch (e) {}
      }
    }
  }, 800);
  
  white.classList.add('signup-mode');
  blue.classList.add('signup-mode');
  white.dataset.hasSignup = "true";
  if (signupHeader) {
    setTimeout(() => signupHeader.classList.add('visible'), 0);
  }
  if (window.initSignupForm) window.initSignupForm();
}

// =====================================================
// Section 5: Signup Button, Skip, and Close Handlers
// =====================================================

function morphShapesToSignup() {
  clearMorphStyles();
  blue.classList.remove('verification-mode');
  white.classList.remove('verification-mode');
  blue.classList.add('signup-mode');
  white.classList.add('signup-mode');
  white.dataset.hasSignup = "true";
}

btn.addEventListener("click", async () => {
  if (morphingToSignup) return;
  morphingToSignup = true;
  if (signupHeader) signupHeader.classList.remove('visible');
  items.forEach(it => {
    it.classList.remove('active');
    it.classList.add('fade-out');
  });
  btn.classList.add('fade-out');
  b.classList.add('fade-out');
  await sleep(800);

  tour.style.opacity = "0";
  tour.style.visibility = "hidden";
  btn.style.opacity = "0";
  btn.style.visibility = "hidden";
  btn.style.display = "none";
  b.style.opacity = "0";
  b.style.visibility = "hidden";

  morphShapesToSignup();

  await sleep(950);
  injectSignupForm();
});

skip.addEventListener("click", async () => {
  if (morphingToSignup) return;
  skipTriggered = true;
  morphingToSignup = true;
  if (signupHeader) signupHeader.classList.remove('visible');
  [b, hi, t1, t2].forEach(el => {
    if (!el) return;
    el.style.transition = "opacity 0.45s";
    el.style.opacity = "0";
  });
  items.forEach(it => {
    it.classList.remove('active');
    it.classList.add('fade-out');
  });
  btn.classList.add('fade-out');
  skip.classList.add('fade-out');
  await sleep(500);

  tour.style.opacity = "0";
  tour.style.visibility = "hidden";
  btn.style.opacity = "0";
  btn.style.visibility = "hidden";
  btn.style.display = "none";
  b.style.opacity = "0";
  b.style.visibility = "hidden";
  hi.style.visibility = "hidden";
  t1.style.visibility = "hidden";
  t2.style.visibility = "hidden";

  morphShapesToSignup();

  await sleep(950);
  injectSignupForm();
});

// ---- X CLOSE BUTTON HANDLER ----

if (closeBtn) {
  closeBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (signupHeader) signupHeader.classList.remove('visible');
    if (typeof cleanupInjectedSignupForm === "function") cleanupInjectedSignupForm();

    [blue, white].forEach(el => {
      el.classList.remove('signup-mode', 'verification-mode');
      el.style.transition   = "";
      el.style.visibility   = "";
      el.style.opacity      = "";
      el.style.left         = "";
      el.style.top          = "";
      el.style.transform    = "";
      el.style.borderRadius = "";
      el.style.width        = "";
      el.style.height       = "";
    });

    tour.style.opacity = "0";
    tour.style.visibility = "hidden";
    setTimeout(() => {
      tour.style.display = "none";
      if (typeof hardResetTour === "function") hardResetTour();
    }, 400);

    if (window.parent !== window && window.parent.postMessage) {
      window.parent.postMessage({ action: "closeTour" }, "*");
    }
  });
}

// =====================================================
// Section 6: Main Tour Animation Sequence
// =====================================================

// ---- Show "Sign Me Up!" Button ----
function showSignUpButton() {
  btn.classList.add("visible");
  btn.style.opacity = "1";
  btn.style.visibility = "visible";
  btn.style.pointerEvents = "all";
  btn.style.display = "flex";
}

// ---- Animation Sequence ----
(async () => {
  try {
    hardResetTour();
    if (skipTriggered) return;
    blue.style.visibility = white.style.visibility = hi.style.visibility = "visible";
    hi.style.opacity = "1";

    const popDuration          = 1050;
    const circlePause          = 2250;
    const hiFadeOutDuration    = 550;
    const morphDuration        = 1100;
    const t1FadeInDuration     = 1050;
    const t1HangDuration       = 1050;
    const t1t2FadeOutDuration  = 950;
    const t2FadeInDelay        = 200;
    const t2FadeInDuration     = 1950;
    const beforeFadeInDuration = 2000;
    const beforeToNextDelay    = 3250;
    const largeRectMorphDuration = 900;
    const betweenButtonDelay   = 100;
    const finalBlurbDelay      = -1500;
    const t1EarlyFadeIn = 500;

    const popKF = [
      {transform:'translate(-50%,-50%) scale(0)'},
      {transform:'translate(-50%,-50%) scale(1.3)', offset:0.3},
      {transform:'translate(-50%,-50%) scale(0.9)', offset:0.5},
      {transform:'translate(-50%,-50%) scale(1.05)', offset:0.65},
      {transform:'translate(-50%,-50%) scale(0.95)', offset:0.8},
      {transform:'translate(-50%,-50%) scale(1)'}
    ];
    blue.animate(popKF, {duration:popDuration, easing:'ease-in-out', fill:'forwards'});
    white.animate(popKF, {duration:popDuration, easing:'ease-in-out', fill:'forwards'});

    await sleep(popDuration); if (skipTriggered) return;
    await sleep(circlePause); if (skipTriggered) return;

    hi.style.transition = `opacity ${hiFadeOutDuration}ms`;
    hi.style.opacity = "0";

    [blue,white].forEach(el => {
      el.style.transition = "all 0.8s cubic-bezier(.75,.13,.3,1)";
    });
    blue.style.width        = '400px';
    blue.style.height       = '150px';
    blue.style.borderRadius = '20px';
    white.style.width       = '360px';
    white.style.height      = '110px';
    white.style.borderRadius= '10px';

    await sleep(morphDuration - t1EarlyFadeIn); if (skipTriggered) return;

    t1.style.transition = `opacity ${t1FadeInDuration}ms, transform 1s`;
    t1.style.visibility = "visible";
    t1.style.opacity = "1";
    t1.style.fontSize = "20px";
    t1.style.marginBottom = "16px";

    await sleep(t1EarlyFadeIn + hiFadeOutDuration); if (skipTriggered) return;

    hi.style.visibility = "hidden";
    await sleep(t1HangDuration); if (skipTriggered) return;

    t1.style.transform = "translate(-50%,calc(-50% - 15px))";
    t1.style.opacity = "1";
    t2.style.transition = `opacity ${t2FadeInDuration}ms`;
    t2.style.visibility = "visible";
    t2.style.opacity = "1";
    t2.style.fontSize = "20px";

    await sleep(t2FadeInDelay + t2FadeInDuration); if (skipTriggered) return;

    t1.style.transition = `opacity ${t1t2FadeOutDuration}ms`;
    t2.style.transition = `opacity ${t1t2FadeOutDuration}ms`;
    t1.style.opacity = "0";
    t2.style.opacity = "0";

    await sleep(t1t2FadeOutDuration); if (skipTriggered) return;

    t1.style.display = t2.style.display = "none";

    b.style.left       = "50%";
    b.style.top        = "50%";
    b.style.transform  = "translate(-50%, -50%)";
    b.style.maxWidth   = "420px";
    b.style.fontSize   = "20px";
    b.style.lineHeight = "0.7";
    b.style.background = "none";
    b.style.padding    = "20px";
    b.innerHTML = `<span style="display:block;margin-bottom:18px;">Before we jump to the sign-up form,</span>
      here’s what Blue can do for you...`;
    b.style.transition = `opacity ${beforeFadeInDuration}ms`;
    b.style.visibility = "visible";
    b.style.opacity = "1";

    await sleep(beforeToNextDelay); if (skipTriggered) return;

    if (skip) skip.classList.add('fade-out');

    b.style.transition = "opacity .95s ease-in-out";
    b.style.opacity = "0";
    await sleep(950); if (skipTriggered) return;

    b.addEventListener("transitionend", ()=> b.style.visibility="hidden", {once:true});

    [blue, white].forEach(el => {
      el.style.transition = `all ${largeRectMorphDuration}ms cubic-bezier(.75,.13,.3,1)`;
    });
    Object.assign(blue.style, {
      width:  "600px", height: "400px",
      left:   "calc(50% + 110px)",
      top:    "calc(50% - 35px)"
    });
    Object.assign(white.style, {
      width:  "560px", height: "360px",
      left:   "calc(50% + 110px)",
      top:    "calc(50% - 35px)"
    });
    tour.style.left = "calc(50% - 430px)";
    tour.style.top  = "calc(50% - 235px)";
    tour.style.transform = "none";

    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("visible");
    }
    tour.style.visibility = "visible";
    tour.style.opacity = "1";
    for (let i = 0; i < items.length; i++) {
      await sleep(betweenButtonDelay);
      if (skipTriggered) return;
      items[i].classList.add("visible");
      if (i === items.length - 1) {
        showSignUpButton();
      }
    }

    await sleep(finalBlurbDelay); if (skipTriggered) return;

    b.style.left       = "calc(50% + 110px)";
    b.style.top        = "calc(50% - 165px)";
    b.style.transform  = "translateX(-50%)";
    b.style.maxWidth   = "380px";
    b.style.fontSize   = "18px";
    b.style.lineHeight = "1.2";
    b.style.background = "none";
    b.style.padding    = "0";
    b.innerHTML = `<b>So, where do you fit in?</b><br><br>
      Whether you’re a homeowner settling into your new place or a developer
      managing hundreds of homes, Blue is built for every stage of the
      new home journey—from construction to key turnover and beyond.<br><br>
      Use the buttons on the left to explore the different roles we support—
      from homeowners to trades. When you’re done, click “Sign Me Up!”`;
    b.style.visibility = "visible";
    b.style.transition = "opacity .75s ease-in-out";
    b.style.opacity = "1";
    showSignUpButton();
    b.addEventListener("transitionend", function handler(e){
      if(e.propertyName === "opacity"){
        showSignUpButton();
        b.removeEventListener("transitionend", handler);
      }
    }, {once:true});
  } catch (e) {
    console.error("Tour script error:", e);
  }
})();

// =====================================================
// Section 7: Signup Form, Validation, and Stacked Modals
// =====================================================

window.initSignupForm = function() {

// Section 7.1: Modal Display Function
// ===================================
function displayEmailUsernameModals(emailTaken, usernameTaken) {
    const emailTakenModal = $('#emailTakenModal'); // jQuery selector for email modal element
    const usernameTakenModal = $('#usernameTakenModal'); // jQuery selector for username modal element

    let showEmailModal = emailTaken;
    let showUsernameModal = usernameTaken;

    // Check if either email or username is taken
    if (showEmailModal || showUsernameModal) {
        // If an email or username is taken, apply the overlay and blur
        showModalOverlayAndBlur();

        // Determine which specific modals to show based on validation results
        if (showEmailModal && showUsernameModal) {
            // Both email and username are taken, show both modals
            // Use Bootstrap's modal('show') method
            emailTakenModal.modal('show');
            usernameTakenModal.modal('show');
        } else if (showEmailModal) {
            // Only email is taken, show the email modal
            emailTakenModal.modal('show');
        } else if (showUsernameModal) {
            // Only username is taken, show the username modal
            usernameTakenModal.modal('show');
        }
    } else {
        // If neither email nor username is taken, ensure all modals are hidden
        // and remove the overlay and blur effects.
        hideModalOverlayAndBlur(); // Remove overlay and blur
        emailTakenModal.modal('hide'); // Ensure email modal is hidden
        usernameTakenModal.modal('hide'); // Ensure username modal is hidden
    }
}

// Section 7.2: Modal Event Listeners for Overlay Hiding
// ======================================================
$(document).ready(function() {
    // Listener for when the email taken modal is fully hidden
    $('#emailTakenModal').on('hidden.bs.modal', function () {
        // Check if the username modal is currently visible.
        // If it's NOT visible, then hide the overlay and blur.
        // This ensures the overlay remains if the other modal is still open.
        if (!$('#usernameTakenModal').is(':visible')) {
            hideModalOverlayAndBlur();
        }
    });

    // Listener for when the username taken modal is fully hidden
    $('#usernameTakenModal').on('hidden.bs.modal', function () {
        // Check if the email modal is currently visible.
        // If it's NOT visible, then hide the overlay and blur.
        if (!$('#emailTakenModal').is(':visible')) {
            hideModalOverlayAndBlur();
        }
    });
});

// Section 7.3: Email/Username Input Event Listeners
// ===============================================
$(document).ready(function() {
    // Listener for email input field: Handles auto-population and validation checks
    $('#email').on('blur keyup', function() { // Use blur and keyup for immediate feedback and final check
        const emailInput = $(this);
        const usernameInput = $('#username');
        const emailValue = emailInput.val().trim();

        // 7.3.1: Auto-populate Username if empty and email is valid enough
        if (emailValue.length > 0 && usernameInput.val().trim() === '') {
            // Simple logic to create a username from email (before '@' symbol)
            const usernameSuggestion = emailValue.split('@')[0];
            if (usernameSuggestion) {
                usernameInput.val(usernameSuggestion);
            }
        }

        // 7.3.2: Trigger Email and Username validation checks
        if (emailValue.length > 0) { // Only check if email has content
            // Assuming checkIfEmailTaken and checkIfUsernameTaken are defined elsewhere and manage Firestore checks
            // These functions should eventually call displayEmailUsernameModals based on their results.
            checkIfEmailTaken(emailValue);
        } else {
            // If email is empty, ensure modals are hidden
            displayEmailUsernameModals(false, false);
            // Also clear username if it was auto-populated from an empty email
            if (usernameInput.data('autoPopulated')) { // Using a data attribute to track auto-population
                usernameInput.val('');
                usernameInput.removeData('autoPopulated');
            }
        }

        // Check username validity as well, especially if it was auto-populated or user changed it
        const usernameValue = usernameInput.val().trim();
        if (usernameValue.length > 0) {
            checkIfUsernameTaken(usernameValue);
        } else {
            // If username is empty, ensure username modal is hidden
            displayEmailUsernameModals(false, false); // This might be redundant if already called for email
        }
    });

    // Listener for username input field: Only checks username validity on its own
    $('#username').on('blur keyup', function() {
        const usernameInput = $(this);
        const usernameValue = usernameInput.val().trim();

        if (usernameValue.length > 0) { // Only check if username has content
            checkIfUsernameTaken(usernameValue);
        } else {
            // If username is empty, ensure username modal is hidden
            displayEmailUsernameModals(false, false);
        }
    });
});
  // ---- 7.4: DOM Selectors ----

  const form = document.getElementById('signupForm');
  if (!form) return;

  const phone1 = document.getElementById('phone1');
  const mobile1 = document.getElementById('mobile1');
  const addPhoneBtn = document.getElementById('addPhoneBtn');
  const phone2wrap = document.getElementById('phone2wrap');
  const phone2inputwrap = document.getElementById('phone2inputwrap');
  const phone2 = document.getElementById('phone2');
  const mobile2 = document.getElementById('mobile2');
  const mobile2wrap = document.getElementById('mobile2wrap');
  const notifyEmail = document.getElementById('notifyEmail');
  const notifyPhone1Wrap = document.getElementById('notifyPhone1Wrap');
  const notifyPhone1 = document.getElementById('notifyPhone1');
  const notifyPhone2Wrap = document.getElementById('notifyPhone2Wrap');
  const notifyPhone2 = document.getElementById('notifyPhone2');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const terms = document.getElementById('terms');
  const username = document.getElementById('username');

  let triedSubmit = false;

  // ---- 7.5: Phone 2 Field Logic ----

  function hidePhone2Fields() {
    if (phone2wrap) phone2wrap.style.display = "none";
    if (phone2inputwrap) phone2inputwrap.style.display = "none";
    if (mobile2wrap) mobile2wrap.style.display = "none";
    if (phone2) phone2.value = "";
    if (mobile2) mobile2.checked = false;
    if (notifyPhone2) {
      notifyPhone2.checked = false;
      notifyPhone2.disabled = true;
    }
    if (notifyPhone2Wrap) notifyPhone2Wrap.classList.add('hidden');
  }

  function showPhone2Fields() {
    if (phone2wrap) phone2wrap.style.display = "flex";
    if (phone2inputwrap) phone2inputwrap.style.display = "";
    if (mobile2wrap) mobile2wrap.style.display = "";
    if (notifyPhone2Wrap) notifyPhone2Wrap.classList.remove('hidden');
    if (notifyPhone2) notifyPhone2.disabled = false;
  }

  function updatePhones() {
    const phone1Num = cleanPhoneVal(phone1.value);
    const phone2Num = phone2 && phone2.value ? cleanPhoneVal(phone2.value) : '';

    // Prevent Phone 2 = Phone 1 (in-form duplicate checker)
    if (phone2 && phone2Num && phone1Num && phone2Num === phone1Num) {
      phone2.value = "";
      phone2.classList.add('input-error');
      showErrorModal({
        type: "default",
        title: "Whoops!",
        messages: ["Phone 2 cannot be the same as Phone 1. Please enter a different number."],
        onClose: () => {
          phone2.classList.remove('input-error');
          phone2.focus();
        }
      });
      return;
    }

    if (phone1Num.length < 3) {
      hidePhone2Fields();
      if (addPhoneBtn) addPhoneBtn.style.display = 'none';
    } else {
      if (addPhoneBtn) addPhoneBtn.style.display = (phone2wrap && phone2wrap.style.display !== 'flex') ? 'block' : 'none';
    }
    if (mobile1 && notifyPhone1 && notifyPhone1Wrap) {
      if (mobile1.checked && phone1Num.length >= 3) {
        notifyPhone1Wrap.classList.remove('hidden');
        notifyPhone1.disabled = false;
      } else {
        notifyPhone1.checked = false;
        notifyPhone1Wrap.classList.add('hidden');
        notifyPhone1.disabled = true;
      }
    }
    if (phone2 && mobile2 && notifyPhone2 && notifyPhone2Wrap) {
      if (mobile2.checked && phone2Num.length >= 3) {
        notifyPhone2Wrap.classList.remove('hidden');
        notifyPhone2.disabled = false;
      } else {
        notifyPhone2.checked = false;
        notifyPhone2Wrap.classList.add('hidden');
        notifyPhone2.disabled = true;
      }
    }
    if (
      notifyEmail && !notifyPhone1.checked &&
      (!notifyPhone2 || !notifyPhone2.checked)
    ) {
      notifyEmail.checked = true;
      notifyEmail.disabled = false;
    }
  }

  if (phone1) phone1.addEventListener('input', updatePhones);
  if (mobile1) mobile1.addEventListener('change', updatePhones);
  if (email) email.addEventListener('input', updatePhones);
  if (phone2) phone2.addEventListener('input', updatePhones);
  if (mobile2) mobile2.addEventListener('change', updatePhones);
  if (addPhoneBtn) addPhoneBtn.addEventListener('click', function () {
    addPhoneBtn.style.display = 'none';
    showPhone2Fields();
    setTimeout(() => { if (phone2) phone2.focus(); }, 100);
    updatePhones();
  });

  // ---- 7.6: Firestore Duplicate Checks (async) ----

  async function checkEmail(emailValue) {
    if (!window.firebaseSignup || !window.firebaseSignup.checkEmailExists) return false;
    return await window.firebaseSignup.checkEmailExists(emailValue.trim().toLowerCase());
  }
  async function checkPhone(phoneValue) {
    if (!window.firebaseSignup || !window.firebaseSignup.checkPhoneExists) return false;
    return await window.firebaseSignup.checkPhoneExists(phoneValue);
  }
  async function checkUsername(usernameValue) {
    if (!window.firebaseSignup || !window.firebaseSignup.checkUsernameExists) return false;
    return await window.firebaseSignup.checkUsernameExists(usernameValue.trim().toLowerCase());
  }
  async function suggestUsernames(usernameValue) {
    if (!window.firebaseSignup || !window.firebaseSignup.generateUsernameSuggestions) return [];
    let arr = await window.firebaseSignup.generateUsernameSuggestions(usernameValue.trim().toLowerCase());
    while (arr.length < 3) {
      const next = usernameValue + Math.floor(Math.random() * 10000);
      if (!arr.includes(next)) arr.push(next);
    }
    return arr.slice(0, 3);
  }

  // ---- 7.7: Live Duplicate Checks - on input (not just blur) ----

  if (username) username.addEventListener('input', async function () {
    const userVal = username.value.trim();
    if (userVal.length >= 5 && await checkUsername(userVal)) {
      let suggestions = await suggestUsernames(userVal);
      showErrorModal({
        type: "username",
        title: "Whoops!",
        messages: ["The username is already taken. Please select one of the alternate options below."],
        suggestions,
        onAcceptSuggestion: (selectedUsername) => {
          username.value = selectedUsername;
          username.focus();
        },
        onClose: () => {
          username.value = "";
          username.focus();
        }
      });
    }
  });

  if (email) email.addEventListener('input', async function () {
    const emailVal = email.value.trim();
    if (emailVal.length >= 6 && await checkEmail(emailVal)) {
      showErrorModal({
        type: "email",
        title: "Whoops!",
        messages: ["This email address is already registered to another account. Please use another email address or log into your existing account."],
        onClose: () => {
          email.value = "";
          email.focus();
        }
      });
    }
  });

  if (phone1) phone1.addEventListener('blur', async function () {
    const val = cleanPhoneVal(phone1.value);
    if (!val) return;
    if (await checkPhone(val)) {
      showErrorModal({
        type: "default",
        title: "Whoops!",
        messages: ["Phone 1 is already registered to another user. Please use a different number or log into your existing account."],
        onClose: () => {
          phone1.value = "";
          phone1.focus();
          if (typeof hidePhone2Fields === "function") hidePhone2Fields();
          if (addPhoneBtn) addPhoneBtn.style.display = 'none';
          if (typeof updatePhones === "function") updatePhones();
        }
      });
    }
  });

  if (phone2) phone2.addEventListener('blur', async function () {
    const val = cleanPhoneVal(phone2.value);
    if (!val) return;
    if (await checkPhone(val)) {
      showErrorModal({
        type: "default",
        title: "Whoops!",
        messages: ["Phone 2 is already registered to another user. Please use a different number."],
        onClose: () => {
          phone2.value = "";
          phone2.focus();
          if (typeof updatePhones === "function") updatePhones();
        }
      });
    }
  });

  // ---- 7.8: Notification Checkbox Logic ----

  function enforceNotificationCheckboxes() {
    const emailChecked = notifyEmail && notifyEmail.checked;
    const phone1Checked = notifyPhone1 && notifyPhone1.checked;
    const phone2Checked = notifyPhone2 && notifyPhone2.checked;
    const emailValue = email && email.value.trim();
    if (!phone1Checked && !phone2Checked) {
      if (notifyEmail) {
        notifyEmail.checked = true;
        notifyEmail.disabled = false;
      }
    } else {
      if (!emailValue) {
        if (notifyEmail) notifyEmail.checked = false;
      }
      if (notifyEmail) {
        notifyEmail.disabled = false;
      }
    }
    if (
      notifyEmail && !notifyEmail.checked &&
      notifyPhone1 && !notifyPhone1.checked &&
      notifyPhone2 && !notifyPhone2.checked
    ) {
      notifyEmail.checked = true;
      notifyEmail.disabled = false;
    }
  }
  if (email) {
    email.addEventListener('input', function () {
      enforceNotificationCheckboxes();
      setNextStepBtnState();
    });
  }
  [notifyEmail, notifyPhone1, notifyPhone2].forEach(cb => {
    if (cb) {
      cb.addEventListener('change', function () {
        enforceNotificationCheckboxes();
        setNextStepBtnState();
      });
    }
  });
  enforceNotificationCheckboxes();

  // ---- 7.9: Autofill username from email ----

  let lastAutofilledEmail = "";
  function isValidEmailSuffix(email) {
    return /^[^@]+@[^@]+\.(ca|com|net|org|co|biz|me|us|info|tv|io|app|xyz|store|online|dev|ai|cloud|solutions|gov|edu|pro|site|life|world|today|press|group|agency|club|design|media|news|works|plus|center|systems|studio|support|digital|partners|one|guru|tips|team|events|city|capital|ventures|zone|live|company|space|network|academy|consulting|house|technology|care|expert|services|works|express|direct|link|market|shop|host|finance|fund|health|global|gallery|exchange|cheap|camp|community|cool|tools|email|estate|fashion|fit|garden|gift|gold|graphics|holiday|international|jewelry|kitchen|land|law|lease|love|ltd|mobi|moda|news|organic|partners|photography|photos|place|plumbing|plus|productions|properties|recipes|red|rentals|repair|report|rest|reviews|rocks|run|school|science|shoes|show|singles|social|software|solutions|store|studio|style|supplies|supply|systems|tattoo|tax|technology|theater|tips|today|tools|town|toys|trade|training|university|vacations|ventures|via|villas|vision|voyage|watch|webcam|website|wiki|works|world|wtf|zone)(\.[a-z]{2})?$/i.test(email);
  }
  if (email && username) {
    email.addEventListener('input', function () {
      const val = email.value.trim();
      if (isValidEmailSuffix(val)) {
        if (!username.value || username.value === lastAutofilledEmail) {
          username.value = val;
          lastAutofilledEmail = val;
        }
      } else if (!val && username.value === lastAutofilledEmail) {
        username.value = "";
        lastAutofilledEmail = "";
      }
    });
    username.addEventListener('input', function () {
      if (username.value !== lastAutofilledEmail) {
        lastAutofilledEmail = "";
      }
    });
  }

  // ---- 7.10: Button/Validation State ----

  window.setNextStepBtnState = function () {
    if (nextStepBtn) {
      let recaptchaCompleted = false;
      try {
        recaptchaCompleted = typeof grecaptcha !== 'undefined' &&
          grecaptcha.getResponse &&
          grecaptcha.getResponse().length > 0;
      } catch (e) {
        recaptchaCompleted = false;
      }

      const notifyEmailChecked = notifyEmail && notifyEmail.checked;
      const notifyPhone1Checked = notifyPhone1 && notifyPhone1.checked;
      const notifyPhone2Checked = notifyPhone2 && notifyPhone2.checked;
      const emailValue = email && email.value.trim();
      const emailIsValid = email && /^\S+@\S+\.\S+$/.test(emailValue);

      let notificationsValid = false;
      if ((notifyPhone1Checked || notifyPhone2Checked)) {
        notificationsValid = true;
      } else if (notifyEmailChecked && emailIsValid) {
        notificationsValid = true;
      }

      const isValid = (
        firstName && firstName.value.trim() !== "" &&
        lastName && lastName.value.trim() !== "" &&
        username && username.value.trim().length >= 5 &&
        password && password.value.length >= 8 &&
        confirmPassword && confirmPassword.value === password.value &&
        terms && terms.checked &&
        notificationsValid &&
        recaptchaCompleted
      );

      nextStepBtn.classList.toggle('disabled', !isValid);
      nextStepBtn.removeAttribute('disabled');
      return isValid;
    }
    return false;
  };

  [
    firstName, lastName, email, username, password, confirmPassword,
    phone1, phone2, mobile1, mobile2, terms
  ].forEach(el => {
    if (el) {
      el.addEventListener('input', setNextStepBtnState);
      el.addEventListener('change', setNextStepBtnState);
    }
  });
  [notifyEmail, notifyPhone1, notifyPhone2].forEach(el => {
    if (el) {
      el.addEventListener('change', setNextStepBtnState);
    }
  });
  setNextStepBtnState();

  // ---- 7.11: Field Highlight on Error ----

  function highlightFields(fields) {
    [firstName, lastName, username, email, phone1, phone2, password, confirmPassword].forEach(el => el && el.classList.remove('input-error'));
    if (terms) terms.classList.remove('input-error-box');
    if (triedSubmit) {
      fields.forEach(el => {
        if (el && el !== terms) el.classList.add('input-error');
      });
      if (terms && !terms.checked) terms.classList.add('input-error-box');
    }
  }

  // ---- 7.12: Validation & Next Step Modal ----

  function validate(showErrorsOnSubmit = false) {
    let valid = true;
    let missing = [];
    let errorMessages = [];

    const firstNameMissing = !firstName.value.trim();
    const lastNameMissing = !lastName.value.trim();
    const usernameMissing = !username.value.trim() || username.value.length < 5;
    const pw = password.value;
    const cpw = confirmPassword.value;
    const passwordMissing = !pw || pw.length < 8;
    const confirmMissing = !cpw;
    const passwordsMismatch = !passwordMissing && cpw && pw !== cpw;
    const termsMissing = !terms.checked;
    const recaptchaContainer = document.getElementById('recaptcha-container');
    let recaptchaCompleted = false;

    if (showErrorsOnSubmit) {
      try {
        recaptchaCompleted = typeof grecaptcha !== 'undefined' &&
          grecaptcha.getResponse && grecaptcha.getResponse().length > 0;
      } catch (e) {
        recaptchaCompleted = false;
      }
    }

    const notifyEmailChecked = notifyEmail && notifyEmail.checked;
    const notifyPhone1Checked = notifyPhone1 && notifyPhone1.checked;
    const notifyPhone2Checked = notifyPhone2 && notifyPhone2.checked;
    const emailValue = email && email.value.trim();
    const emailIsValid = email && /^\S+@\S+\.\S+$/.test(emailValue);

    let notificationsValid = false;
    if ((notifyPhone1Checked || notifyPhone2Checked)) {
      notificationsValid = true;
    } else if (notifyEmailChecked && emailIsValid) {
      notificationsValid = true;
    }

    if (firstNameMissing) {
      valid = false; missing.push(firstName); errorMessages.push("First Name is required.");
    }
    if (lastNameMissing) {
      valid = false; missing.push(lastName); errorMessages.push("Last Name is required.");
    }
    if ((!notifyPhone1Checked && !notifyPhone2Checked)) {
      if (!notifyEmailChecked || !emailIsValid) {
        valid = false;
        missing.push(email);
        if (!emailValue) {
          errorMessages.push("A valid email address is required.");
        } else if (!emailIsValid) {
          errorMessages.push("Please enter a valid email address.");
        }
      }
    }
    if (usernameMissing) {
      valid = false; missing.push(username); errorMessages.push("Username is required (minimum 5 characters).");
    }
    if (passwordMissing) {
      valid = false; missing.push(password); errorMessages.push("Password is required (minimum 8 characters including a capital letter, number, and special character ! $ & ?).");
    } else {
      if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[!$&?]/.test(pw)) {
        valid = false; missing.push(password);
        errorMessages.push("Password is required (minimum 8 characters including a capital letter, number, and special character ! $ & ?).");
      }
    }
    if (confirmMissing) {
      valid = false; missing.push(confirmPassword); errorMessages.push("Passwords must match.");
    } else if (!passwordMissing && pw !== cpw) {
      valid = false; missing.push(confirmPassword); errorMessages.push("Passwords must match.");
    }
    if (termsMissing) {
      valid = false; missing.push(terms); errorMessages.push("You must agree to the Terms of Service.");
    }
    if (!recaptchaCompleted && showErrorsOnSubmit) {
      valid = false;
      if (recaptchaContainer) recaptchaContainer.classList.add('error');
      errorMessages.push("Please complete the reCAPTCHA.");
    }
    const phone1Num = phone1.value.replace(/\D/g, '');
    const phone2Num = phone2 ? phone2.value.replace(/\D/g, '') : '';
    if (phone1Num && phone2Num && phone1Num === phone2Num) {
      valid = false; missing.push(phone2);
    }

    if (showErrorsOnSubmit) highlightFields(missing);
    if (showErrorsOnSubmit && errorMessages.length > 0) {
      showErrorModal({
        type: "default",
        title: "Whoops!",
        messages: errorMessages,
        onClose: () => { if (missing.length) missing[0].focus(); }
      });
    }
    return valid;
  }

  // ---- 7.13: Autofill on Paste ----

  [firstName, lastName, username, email, phone1, phone2].forEach(el => {
    if (el) el.addEventListener('paste', function () {
      setTimeout(() => setNextStepBtnState(), 10);
    });
  });

  // ---- 7.14: Submission Handler ----

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    triedSubmit = true;
    setNextStepBtnState();

    if (!validate(true)) return false;

    // Final combined duplicate check for email and username
    const emailVal = email.value.trim();
    const userVal = username.value.trim();
    let emailDup = false, userDup = false, suggestions = [];

    if (emailVal) emailDup = await checkEmail(emailVal);
    if (userVal) userDup = await checkUsername(userVal);
    if (userDup) suggestions = await suggestUsernames(userVal);

    if (emailDup && userDup) {
      // --- FIX: STACK BOTH MODALS AT ONCE! ---
      showErrorModal({
        type: "email",
        title: "Whoops!",
        messages: ["This email address is already registered to another account. Please use another email address or log into your existing account."],
        lockOverlay: true,
        onClose: () => {
          email.value = "";
          email.focus();
        }
      });
      showErrorModal({
        type: "username",
        title: "Whoops!",
        messages: ["The username is already taken. Please select one of the alternate options below."],
        suggestions,
        lockOverlay: true,
        onAcceptSuggestion: (selectedUsername) => {
          username.value = selectedUsername;
          username.focus();
        },
        onClose: () => {
          username.value = "";
          username.focus();
        }
      });
      return false;
    }
    if (emailDup) {
      showErrorModal({
        type: "email",
        title: "Whoops!",
        messages: ["This email address is already registered to another account. Please use another email address or log into your existing account."],
        onClose: () => {
          email.value = "";
          email.focus();
        }
      });
      return false;
    }
    if (userDup) {
      showErrorModal({
        type: "username",
        title: "Whoops!",
        messages: ["The username is already taken. Please select one of the alternate options below."],
        suggestions,
        onAcceptSuggestion: (selectedUsername) => {
          username.value = selectedUsername;
          username.focus();
        },
        onClose: () => {
          username.value = "";
          username.focus();
        }
      });
      return false;
    }

    // ...proceed to next step (verification code, etc.) here...
  });
}


  // ---- 7.15: Focus/Blur Style for Error Removal ----

  [firstName, lastName, username, email, phone1, phone2, password, confirmPassword].forEach(el => {
    if (el) {
      el.addEventListener('focus', function () {
        el.classList.remove('input-error');
      });
    }
  });

  // ---- 7.16: Initial State ----

  hidePhone2Fields();
  updatePhones();
  enforceNotificationCheckboxes();
  setNextStepBtnState();
};


// =====================================================
// Section 8: reCAPTCHA Callback and Verification Logic
// =====================================================

// ---- Section 8.1: reCAPTCHA callback handler ----
window.recaptchaCallback = function() {
  // Remove error border if present
  const recaptchaContainer = document.getElementById('recaptcha-container');
  if (recaptchaContainer) recaptchaContainer.classList.remove('error');

  // Usual callback stuff
  if (typeof setNextStepBtnState === 'function') {
    setTimeout(setNextStepBtnState, 100);

    // Fallback: directly enable the button if all other fields are valid
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (nextStepBtn) {
      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const email = document.getElementById('email');
      const username = document.getElementById('username');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const terms = document.getElementById('terms');
      const phone1 = document.getElementById('phone1');

      const isValid = (
        firstName && firstName.value.trim() !== "" &&
        lastName && lastName.value.trim() !== "" &&
        email && /^\S+@\S+\.\S+$/.test(email.value) &&
        username && username.value.trim().length >= 5 &&
        password && password.value.length >= 8 &&
        confirmPassword && confirmPassword.value === password.value &&
        terms && terms.checked &&
        phone1 && phone1.value.replace(/\D/g, '').length >= 3
      );

      if (isValid) {
        nextStepBtn.classList.remove('disabled');
        console.log("Next Step button enabled by reCAPTCHA callback");
      }
    }
  }
};

// ---- Section 8.2: Verification modal display ----
function showVerificationModal(code, callback) {
  console.log("Showing verification modal with code:", code);

  // Create a modal to show the verification code
  const modal = document.createElement('div');
  modal.id = 'verificationModal';
  modal.className = 'modal-modal active';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '10000'; // Ensure it's on top of everything

  modal.innerHTML = `
    <div class="modal-content" style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
      <h3 style="margin-top: 0; color: #0071BC;">Verification Code</h3>
      <p>Your verification code is: <strong style="font-size: 24px; letter-spacing: 2px;">${code || 'Error: No code generated'}</strong></p>
      <p>Please use this code to verify your account.</p>
      <button type="button" id="verificationModalBtn" class="btn" style="background: #0071BC; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px;">Continue</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listener to the button
  const continueBtn = document.getElementById('verificationModalBtn');
  if (continueBtn) {
    continueBtn.addEventListener('click', function() {
      modal.remove();
      if (typeof callback === 'function') {
        callback();
      }
    });
  }
}
window.showVerificationModal = showVerificationModal;

// ---- Section 8.3: Inject Verification Form ----
function injectVerificationForm(target, code, expiryEpoch) {
  // Remove previous signup/verification classes from target (white circle)
  target.classList.remove('signup-mode');
  target.classList.add('verification-mode');

  // Ensure blue circle morphs too
  const blue = document.getElementById("blue-circle");
  if (blue) {
    // Remove any inline styles that might be interfering
    blue.removeAttribute('style');
    // Remove old classes, add verification-mode
    blue.classList.remove('signup-mode');
    blue.classList.add('verification-mode');
  }

  // Ensure white also gets rid of inline styles
  target.removeAttribute('style');

  // Store the verification code and expiry time
  const verificationCode = code;
  const verificationExpiry = expiryEpoch;

  // Reset the target element
  target.innerHTML = `
    <div class="verify-container">
      <div class="verify-blurb">
        A verification code was sent to you at the notification methods you previously selected. This code is valid for 10 minutes. If you do not enter the code within 10 minutes, click Resend Code and we'll submit a new code to you.<br>
        If you'd like to change your notification methods, click the Back button below.
      </div>
      <div class="code-center">
        <div class="code-input-row">
          ${[...Array(7)].map((_,i)=>`
            <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="code-input"
              tabindex="${i+1}">
          `).join('')}
        </div>
        <div id="verify-status-row">
          <div id="verify-timer">Time remaining: <span id="timer-span">10:00</span></div>
          <div id="verify-success" style="display:none;">✓ Verified</div>
          <div id="verify-expired" style="display:none;">⚠ Expired</div>
        </div>
      </div>
      <div class="verify-buttons">
        <button id="back-btn" class="btn secondary">Back</button>
        <button id="to-account-btn" class="btn" disabled>To My Account</button>
      </div>
    </div>
  `;

  // Set up verification form logic
  const digitInputs = Array.from(target.querySelectorAll('.code-input'));
  const verifyTimer = target.querySelector('#verify-timer');
  const verifySuccess = target.querySelector('#verify-success');
  const verifyExpired = target.querySelector('#verify-expired');
  const timerSpan = target.querySelector('#timer-span');
  const backBtn = target.querySelector('#back-btn');
  const resendBtn = target.querySelector('#resend-btn');
  const toAccountBtn = target.querySelector('#to-account-btn');

  let timeLeft = Math.max(0, Math.floor(expiryEpoch - Date.now() / 1000));
  let timerInterval;
  let expired = false;

  // Section 8.3.1: Format time left as MM:SS
  function formatTimeLeft(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Set initial timer value
  timerSpan.textContent = formatTimeLeft(timeLeft);

  // Section 8.3.2: Handle digit input navigation
  digitInputs.forEach((input, i) => {
    input.addEventListener('input', e => {
      const val = e.target.value;
      if (val && i < digitInputs.length - 1) {
        digitInputs[i+1].focus();
      }
      checkCodeEntry();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        digitInputs[i-1].focus();
      }
    });

    // Add paste event handler to each input
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pastedText.replace(/\D/g, '');
      for (let j = 0; j < digitInputs.length && j < digits.length; j++) {
        digitInputs[j].value = digits[j];
      }
      const nextEmptyIndex = digitInputs.findIndex(input => !input.value);
      if (nextEmptyIndex !== -1) {
        digitInputs[nextEmptyIndex].focus();
      } else if (digitInputs.length > 0) {
        digitInputs[digitInputs.length - 1].focus();
      }
      checkCodeEntry();
    });
  });

  // Section 8.3.3: Check if entered code matches
  function checkCodeEntry() {
    if (expired) return;
    let entered = digitInputs.map(i=>i.value).join('');
    if (entered.length === 7) {
      if (entered === String(code)) {
        // Correct code entered - NOW create the user in Firebase
        verifyTimer.style.display = "none";
        verifySuccess.style.display = "inline-flex";
        toAccountBtn.style.background = "#2769c4";
        toAccountBtn.style.cursor = "pointer";
        toAccountBtn.disabled = false;
        toAccountBtn.removeAttribute("disabled");
        digitInputs.forEach(i=>i.disabled=true);
        clearInterval(timerInterval);

        // Disable the back button - user can't go back after verification
        if (backBtn) {
          backBtn.disabled = true;
          backBtn.style.opacity = "0.5";
          backBtn.style.cursor = "not-allowed";
        }

        // Disable the resend button as well
        if (resendBtn) {
          resendBtn.disabled = true;
          resendBtn.style.opacity = "0.5";
          resendBtn.style.cursor = "not-allowed";
        }

        // Get the pending user data from localStorage
        const pendingUserData = JSON.parse(localStorage.getItem('pendingUserData') || '{}');

        // Create the user in Firebase
        if (window.firebaseSignup && window.firebaseSignup.createNewUser) {
          window.firebaseSignup.createNewUser(pendingUserData)
            .then(result => {
              if (result.success) {
                localStorage.setItem('pendingUserId', result.userId);
                console.log("User created successfully:", result.userId);
              } else {
                console.error("Failed to create user:", result.error);
                if (typeof showErrorModal === "function") showErrorModal([result.error || 'Error creating account. Please try again.']);
              }
            })
            .catch(error => {
              console.error("Error creating user:", error);
              if (typeof showErrorModal === "function") showErrorModal([error.message || 'An unexpected error occurred. Please try again.']);
            });
        }
      } else {
        if (typeof showErrorModal === "function") {
          showErrorModal(["Code incorrect. Please try again"], ()=>{
            digitInputs.forEach(i=>i.value="");
            digitInputs[0].focus();
          });
        }
      }
    } else {
      verifySuccess.style.display = "none";
      verifyTimer.style.display = "";
      toAccountBtn.style.background = "#aaa";
      toAccountBtn.style.cursor = "not-allowed";
      toAccountBtn.disabled = true;
      toAccountBtn.setAttribute("disabled", "disabled");
    }
  }

  // Section 8.3.4: Timer logic
  timerInterval = setInterval(() => {
    timeLeft = Math.max(0, Math.floor(expiryEpoch - Date.now() / 1000));
    timerSpan.textContent = formatTimeLeft(timeLeft);
    if (timeLeft === 0 && !expired) {
      expired = true;
      verifyTimer.style.display = "none";
      verifyExpired.style.display = "inline";
      digitInputs.forEach(i=>i.disabled=true);
      clearInterval(timerInterval);
    }
  }, 1000);

  // Section 8.3.5: Button handlers
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      clearInterval(timerInterval);

      // Clear the verification process flags
      signupVerificationInProgress = false;

      // Reset morph state to signup mode before going back
      if (blue) {
        blue.classList.remove('verification-mode');
        blue.classList.add('signup-mode');
      }
      target.classList.remove('verification-mode');
      target.classList.add('signup-mode');
      target.dataset.hasSignup = "true";

      // Keep the pendingUserData in localStorage for form repopulation
      localStorage.removeItem('pendingUserId');

      // Go back to the signup form
      injectSignupForm();

      // After the form is injected, repopulate it with the saved data
      setTimeout(() => {
        const savedData = JSON.parse(localStorage.getItem('pendingUserData') || '{}');
        const form = document.getElementById('signupForm');

        if (form && savedData) {
          // Repopulate text fields
          if (savedData.firstName) form.firstName.value = savedData.firstName;
          if (savedData.lastName) form.lastName.value = savedData.lastName;
          if (savedData.email) form.email.value = savedData.email;
          if (savedData.username) form.username.value = savedData.username;

          // Don't repopulate passwords for security
          if (form.password) form.password.value = '';
          if (form.confirmPassword) form.confirmPassword.value = '';

          // Repopulate phone fields
          if (savedData.phones && savedData.phones.length > 0) {
            if (form.phone1) form.phone1.value = savedData.phones[0].number;
            if (form.mobile1) form.mobile1.checked = savedData.phones[0].mobile;

            // Handle second phone if it exists
            if (savedData.phones.length > 1) {
              // Make sure the second phone UI is visible first
              const addPhoneBtn = document.getElementById('addPhoneBtn');
              const phone2wrap = document.getElementById('phone2wrap');
              const phone2inputwrap = document.getElementById('phone2inputwrap');
              const mobile2wrap = document.getElementById('mobile2wrap');

              if (addPhoneBtn) addPhoneBtn.style.display = 'none';
              if (phone2wrap) phone2wrap.style.display = '';
              if (phone2inputwrap) phone2inputwrap.style.display = '';
              if (mobile2wrap) mobile2wrap.style.display = '';

              // Now set the values
              if (form.phone2) form.phone2.value = savedData.phones[1].number;
              if (form.mobile2) form.mobile2.checked = savedData.phones[1].mobile;
            }
          }

          // Repopulate notification preferences
          if (form.notifyEmail) form.notifyEmail.checked = savedData.notifyEmail;
          if (form.notifyPhone1) form.notifyPhone1.checked = savedData.notifyPhone1;
          if (form.notifyPhone2) form.notifyPhone2.checked = savedData.notifyPhone2;

          // Make sure terms is checked
          if (form.terms) form.terms.checked = true;

          // Update notification options visibility based on phone/mobile selections
          // This is crucial - we need to make the notification checkboxes visible
          // if the corresponding mobile checkboxes are checked
          if (form.mobile1 && form.mobile1.checked) {
            const notifyPhone1Wrap = document.getElementById('notifyPhone1Wrap');
            if (notifyPhone1Wrap) notifyPhone1Wrap.classList.remove('hidden');
            if (form.notifyPhone1) form.notifyPhone1.disabled = false;
          }

          if (form.mobile2 && form.mobile2.checked) {
            const notifyPhone2Wrap = document.getElementById('notifyPhone2Wrap');
            if (notifyPhone2Wrap) notifyPhone2Wrap.classList.remove('hidden');
            if (form.notifyPhone2) form.notifyPhone2.disabled = false;
          }

          // Run the updatePhones function to ensure all visibility states are correct
          if (typeof updatePhones === 'function') {
            updatePhones();
          }

          // Update button state
          if (typeof setNextStepBtnState === 'function') {
            setNextStepBtnState();
          }
        }
      }, 100);
    });
  }

  if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
      try {
        // Generate a new verification code
        const newCode = String(Math.floor(1000000 + Math.random() * 9000000));
        const newExpiryEpoch = Math.floor(Date.now() / 1000) + 600; // 10 minutes

        // Reset the verification form with the new code
        clearInterval(timerInterval);
        injectVerificationForm(target, newCode, newExpiryEpoch);
      } catch (error) {
        if (typeof showErrorModal === "function") showErrorModal(["Failed to resend verification code. Please try again."]);
      }
    });
  }

  if (toAccountBtn) {
    toAccountBtn.addEventListener('click', () => {
      // Redirect to account page or show success message
      window.location.href = "/account";
    });
  }

  // Focus first input
  setTimeout(() => {
    if (digitInputs.length > 0) {
      digitInputs[0].focus();
    }
  }, 100);
}
window.injectVerificationForm = injectVerificationForm;

});
