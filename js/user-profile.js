// File: js/user-profile.js

import { db } from "/js/firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let _currentUserId = null;
let _currentOrgUid = null;

function openUserProfile() {
  document.getElementById("profile-overlay").style.display = "block";
  document.getElementById("profile-modal").style.display   = "flex";
}

function closeUserProfile() {
  document.getElementById("profile-overlay").style.display = "none";
  document.getElementById("profile-modal").style.display   = "none";
  hideConfirmDialog();
}

function showConfirmDialog() {
  document.getElementById("confirm-overlay").classList.remove("hidden");
  document.getElementById("confirm-dialog").classList.remove("hidden");
}

function hideConfirmDialog() {
  document.getElementById("confirm-overlay").classList.add("hidden");
  document.getElementById("confirm-dialog").classList.add("hidden");
}

function setupUserProfileModal() {
  // Close “X”
  document.querySelector("#profile-modal .close-btn")
    .addEventListener("click", closeUserProfile);

  // Intercept Save → show confirm
  document.getElementById("btn-save-close")
    .addEventListener("click", e => {
      e.preventDefault();
      showConfirmDialog();
    });

  // Confirm dialog buttons
  document.getElementById("confirm-yes")
    .addEventListener("click", () => {
      hideConfirmDialog();
      saveUserProfile();
    });
  document.getElementById("confirm-no")
    .addEventListener("click", hideConfirmDialog);

  // Recolor acct-no if Account Type changes
  const acctTypeSelect = document.getElementById("org-accountType");
  const acctSpan       = document.getElementById("acct-no");
  if (acctTypeSelect && acctSpan) {
    acctTypeSelect.addEventListener("change", () => {
      const originalType = (acctSpan.textContent.split("-")[2] || "");
      acctSpan.style.color =
        acctTypeSelect.value !== originalType ? "orange" : "";
    });
  }
}

window.populateUserProfile = async function(c, uid) {
  _currentUserId = uid;
  openUserProfile();

  // 1) Derive the org-UID from the user's defaultAccount
  if (!c.defaultAccount?.id || c.defaultAccount.type !== "organization") {
    console.warn("populateUserProfile: no defaultAccount.id for organization!");
    _currentOrgUid = null;
  } else {
    _currentOrgUid = c.defaultAccount.id;
  }

  // 2) Fetch the org document so we can update its principals
  let principalEntry = null;
  if (_currentOrgUid) {
    const orgRef  = doc(db, "organizations", _currentOrgUid);
    const orgSnap = await getDoc(orgRef);
    if (orgSnap.exists()) {
      principalEntry = (orgSnap.data().orgPrincipals || [])
        .find(p => p.uid === uid) || null;
    }
  }

  // Helper to set inputs or spans
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return console.warn(`populateUserProfile: missing #${id}`);
    if (el.tagName === "INPUT" || el.tagName === "SELECT") el.value       = val ?? "";
    else                                         el.textContent = val ?? "";
  };

  // — Blue Acct No —
  setVal("acct-no", c.blueAcct);

  // — Organization fields —
  setVal("org-name",        c.organization?.name);
  setVal("org-street1",     c.organization?.street1);
  setVal("org-street2",     c.organization?.street2);
  setVal("org-unit",        c.organization?.unit);
  setVal("org-city",        c.organization?.city);
  setVal("org-province",    c.organization?.province);
  setVal("org-country",     c.organization?.country);
  setVal("org-postal",      c.organization?.postal);
  setVal("org-tel",         c.organization?.tel);
  setVal("org-email",       c.organization?.email);
  setVal("org-accountType", c.accountType);
  setVal("org-doors",       c.doors);

  // — Individual (personal) fields —
  setVal("ind-firstName",   c.primaryContact?.firstName);
  setVal("ind-lastName",    c.primaryContact?.lastName);
  setVal("ind-phone1",      c.primaryContact?.phones?.[0]?.number);
  document.getElementById("ind-phone1-mobile").checked =
    !!c.primaryContact?.phones?.[0]?.mobile;
  setVal("ind-phone2",      c.primaryContact?.phones?.[1]?.number);
  document.getElementById("ind-phone2-mobile").checked =
    !!c.primaryContact?.phones?.[1]?.mobile;
  setVal("ind-email",       c.primaryContact?.email);

  // — Verification method radios —
  document.getElementById("verify-email").checked =
    c.verificationMethod === "email";
  document.getElementById("verify-tel1").checked  =
    c.verificationMethod === "tel1";
  document.getElementById("verify-tel2").checked  =
    c.verificationMethod === "tel2";

  // — Notification checkboxes —
  document.getElementById("notify-email").checked =
    Array.isArray(c.notifications) && c.notifications.includes("email");
  document.getElementById("notify-tel1").checked  =
    Array.isArray(c.notifications) && c.notifications.includes("tel1");
  document.getElementById("notify-tel2").checked  =
    Array.isArray(c.notifications) && c.notifications.includes("tel2");

  // — Principal flags (from orgPrincipals if available) —
  if (principalEntry) {
    setVal("ind-userType", principalEntry.userType);
    setVal("ind-primary",  principalEntry.isPrimary ? "Y" : "N");
  } else {
    setVal("ind-userType", c.userType);
    setVal("ind-primary",  c.primaryUser ? "Y" : "N");
  }

  // — Read-only account metadata —
  setVal("acct-created",
    c.createdAt ? new Date(c.createdAt.seconds*1000).toLocaleString() : "");
  setVal("acct-edited",
    c.updatedAt ? new Date(c.updatedAt.seconds*1000).toLocaleString() : "");
  setVal("acct-status", c.active ? "Active" : "Inactive");
  setVal("acct-expiry",
    c.subscription?.expiry
      ? new Date(c.subscription.expiry.seconds*1000).toLocaleDateString()
      : "");
  setVal("acct-verificationStatus", c.verificationStatus);
  setVal("acct-verificationIssued",  c.verificationIssued);
  setVal("acct-reverifiedOn",        c.reverifiedOn);

  // — Counts & resend-coloring —
  setVal("subscriptions-count",
    `There are ${c.subscriptions?.length||0} ${
       c.accountType==="01"?"homes":"subscriptions"}`);
  setVal("linked-count",   `There are ${c.linkedAccounts?.length||0} linked accounts`);
  setVal("subusers-count", `There are ${c.subUsers?.length||0} sub-users`);
  setVal("log-count",      `There are ${c.log?.length||0} log items`);

  const resendBtn = document.getElementById("btn-resend-verif");
  resendBtn.classList.remove("btn--alert");
  if (c.verificationStatus==="Unverified" && c.verificationIssued) {
    const ageDays = (Date.now() - new Date(c.verificationIssued)) / (1000*60*60*24);
    if (ageDays >= 3) resendBtn.classList.add("btn--alert");
  }
};

async function saveUserProfile() {
  if (!_currentUserId || !_currentOrgUid) {
    console.warn("saveUserProfile: missing user or org ID, aborting");
    return;
  }

  try {
    // 1) Update the organization document
    const orgRef = doc(db, "organizations", _currentOrgUid);
    await updateDoc(orgRef, {
      name:        document.getElementById("org-name").value,
      street1:     document.getElementById("org-street1").value,
      street2:     document.getElementById("org-street2").value,
      unit:        document.getElementById("org-unit").value,
      city:        document.getElementById("org-city").value,
      province:    document.getElementById("org-province").value,
      country:     document.getElementById("org-country").value,
      postal:      document.getElementById("org-postal").value,
      tel:         document.getElementById("org-tel").value,
      email:       document.getElementById("org-email").value,
      accountType: document.getElementById("org-accountType").value,
      doors:       parseInt(document.getElementById("org-doors").value,10) || 0
    });

    // 2) Refresh the principal entry
    await updateDoc(orgRef, {
      orgPrincipals: arrayRemove({ uid: _currentUserId })
    });
    await updateDoc(orgRef, {
      orgPrincipals: arrayUnion({
        uid:       _currentUserId,
        isPrimary: document.getElementById("ind-primary").value === "Y",
        userType:  document.getElementById("ind-userType").value
      })
    });

    // 3) Update the user document with personal & notification fields
    const userRef = doc(db, "users", _currentUserId);
    await updateDoc(userRef, {
      primaryContact: {
        firstName: document.getElementById("ind-firstName").value,
        lastName:  document.getElementById("ind-lastName").value,
        phones: [
          {
            number: document.getElementById("ind-phone1").value,
            mobile: document.getElementById("ind-phone1-mobile").checked
          },
          {
            number: document.getElementById("ind-phone2").value,
            mobile: document.getElementById("ind-phone2-mobile").checked
          }
        ],
        email: document.getElementById("ind-email").value
      },
      verificationMethod: document.getElementById("verify-email").checked
          ? "email"
          : document.getElementById("verify-tel1").checked
              ? "tel1"
              : "tel2",
      notifications: [
        ...(document.getElementById("notify-email").checked ? ["email"] : []),
        ...(document.getElementById("notify-tel1").checked  ? ["tel1"]  : []),
        ...(document.getElementById("notify-tel2").checked  ? ["tel2"]  : [])
      ],
      userType:    document.getElementById("ind-userType").value,
      primaryUser: document.getElementById("ind-primary").value === "Y"
    });

  } catch (err) {
    console.error("Save failed:", err);
    alert("Error saving—please try again.");
    return;
  }

  // 4) Close & redirect back to Clients
  closeUserProfile();
  window.location.href = "/shtml/bluehq/clients.shtml";
}

window.openUserProfile      = openUserProfile;
window.closeUserProfile     = closeUserProfile;
window.populateUserProfile  = populateUserProfile;

document.addEventListener("DOMContentLoaded", setupUserProfileModal);