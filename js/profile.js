// js/profile.js
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const q       = s => document.querySelector(s);
const params  = new URLSearchParams(location.search);
const uid     = params.get("uid");
if (!uid) {
  alert("No user specified");
  location.href = "hq-dash.shtml";
}

// form/buttons
const form           = q("#profile-form");
const suspendBtn     = q("#suspend-btn");
const reactivateBtn  = q("#reactivate-btn");
const deleteBtn      = q("#delete-btn");
const closeBtn       = q("#profile-close");

// modals
const closeModal     = q("#close-modal");
const closeYesBtn    = q("#close-confirm-yes");
const closeNoBtn     = q("#close-confirm-no");
const actionModal    = q("#action-modal");
const actionMessage  = q("#action-modal-message");
const actionYesBtn   = q("#action-confirm-yes");
const actionNoBtn    = q("#action-confirm-no");

// title
const profileTitle   = q("#profile-title");

// inputs
const firstNameInput      = q("#firstName");
const lastNameInput       = q("#lastName");
const phone1Input         = q("#phone1");
const phone2Input         = q("#phone2");
const emailInput          = q("#email");

const mailStreet1Input    = q("#mailStreet1");
const mailStreet2Input    = q("#mailStreet2");
const mailUnitNumInput    = q("#mailUnitNum");
const mailCityInput       = q("#mailCity");
const mailProvinceInput   = q("#mailProvince");
const mailRegionInput     = q("#mailRegion");
const mailCountrySelect   = q("#mailCountry");
const mailPostalCodeInput = q("#mailPostalCode");

const sameAsMailChk       = q("#sameAsMail");
const svcFields           = q("#serviceAddressFields");
const svcStreet1Input     = q("#svcStreet1");
const svcStreet2Input     = q("#svcStreet2");
const svcUnitNumInput     = q("#svcUnitNum");
const svcCityInput        = q("#svcCity");
const svcProvinceInput    = q("#svcProvince");
const svcRegionInput      = q("#svcRegion");
const svcCountrySelect    = q("#svcCountry");
const svcPostalCodeInput  = q("#svcPostalCode");

const accountTypeInput    = q("#accountType");
const rolesInput          = q("#roles");
const primaryUserChk      = q("#primaryUser");
const activeChk           = q("#active");

const blueAcctInput       = q("#blueAcct");
const defaultUidInput     = q("#defaultAccountUid");
const linkedAccountsList  = q("#linkedAccountsList");

let isDirty = false;

// country list
const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada",
  "Central African Republic","Chad","Chile","China","Colombia","Comoros",
  "Congo, Republic of the","Congo, Democratic Republic of the","Costa Rica",
  "Côte d’Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti",
  "Dominica","Dominican Republic","Ecuador","Egypt","El Salvador",
  "Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada",
  "Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South",
  "Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia",
  "Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia",
  "Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
  "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua",
  "Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Palau","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan",
  "Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan",
  "Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen",
  "Zambia","Zimbabwe"
];

// populate selects
function populateCountries() {
  countries.forEach(c => {
    const o1 = document.createElement("option");
    o1.value = c; o1.text = c;
    mailCountrySelect.append(o1);
    const o2 = o1.cloneNode(true);
    svcCountrySelect.append(o2);
  });
}

// mark dirty
form.querySelectorAll("input, select").forEach(el => {
  el.addEventListener("input", () => { isDirty = true; });
});

// if editing service fields, uncheck box
[svcStreet1Input, svcStreet2Input, svcUnitNumInput,
 svcCityInput, svcProvinceInput, svcRegionInput,
 svcCountrySelect, svcPostalCodeInput]
.forEach(el => el.addEventListener("input", () => {
  if (sameAsMailChk.checked) sameAsMailChk.checked = false;
}));

// when box checked, copy mailing fields
sameAsMailChk.addEventListener("change", () => {
  if (sameAsMailChk.checked) {
    svcStreet1Input.value    = mailStreet1Input.value;
    svcStreet2Input.value    = mailStreet2Input.value;
    svcUnitNumInput.value    = mailUnitNumInput.value;
    svcCityInput.value       = mailCityInput.value;
    svcProvinceInput.value   = mailProvinceInput.value;
    svcRegionInput.value     = mailRegionInput.value;
    svcCountrySelect.value   = mailCountrySelect.value;
    svcPostalCodeInput.value = mailPostalCodeInput.value;
  }
});

function showModal(mod) { mod.style.display = "flex"; }
function hideModal(mod) { mod.style.display = "none"; }

function showActionDialog(msg, onConfirm) {
  actionMessage.textContent = msg;
  showModal(actionModal);
  const clean = () => {
    actionYesBtn.removeEventListener("click", yes);
    actionNoBtn.removeEventListener("click", no);
    hideModal(actionModal);
  };
  const yes = () => { onConfirm(); clean(); };
  const no  = () => clean();
  actionYesBtn.addEventListener("click", yes);
  actionNoBtn.addEventListener("click", no);
}

async function loadUser() {
  const ref  = doc(db,"users",uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) { alert("Not found"); return location.href="hq-dash.shtml";}
  const u = snap.data();

  // title
  profileTitle.textContent = `User Profile – ${u.firstName||""} ${u.lastName||""}`;

  // personal
  firstNameInput.value = u.firstName||"";
  lastNameInput.value  = u.lastName||"";
  phone1Input.value    = u.phones?.[0]?.number||"";
  phone2Input.value    = u.phones?.[1]?.number||"";
  emailInput.value     = u.email||"";

  // mailing
  const m = u.mailAddress||{};
  mailStreet1Input.value    = m.street1||"";
  mailStreet2Input.value    = m.street2||"";
  mailUnitNumInput.value    = m.unitNum||"";
  mailCityInput.value       = m.city||"";
  mailProvinceInput.value   = m.province||"";
  mailRegionInput.value     = m.region||"";
  mailCountrySelect.value   = m.country||"";
  mailPostalCodeInput.value = m.postalCode||"";

  sameAsMailChk.checked = !!u.sameAsMail;
  if (sameAsMailChk.checked) sameAsMailChk.dispatchEvent(new Event("change"));

  // account
  accountTypeInput.value  = u.accountType||"";
  rolesInput.value        = (u.roles||[]).join(", ");
  primaryUserChk.checked  = !!u.primaryUser;
  activeChk.checked       = !!u.active;

  // bottom
  blueAcctInput.value      = u.blueAcct||"";
  defaultUidInput.value    = u.defaultAccountUid||"";
  linkedAccountsList.innerHTML = (u.linkedAccounts||[]).map(id=>`<li>${id}</li>`).join("");

  // buttons
  suspendBtn.style.display    = u.active?"inline-block":"none";
  reactivateBtn.style.display = u.active?"none":"inline-block";

  isDirty = false;
}

form.onsubmit = async e => {
  e.preventDefault();
  // reassemble
  const mailAddr = {
    street1: mailStreet1Input.value.trim(),
    street2: mailStreet2Input.value.trim(),
    unitNum: mailUnitNumInput.value.trim(),
    city:    mailCityInput.value.trim(),
    province:mailProvinceInput.value.trim(),
    region:  mailRegionInput.value.trim(),
    country: mailCountrySelect.value,
    postalCode: mailPostalCodeInput.value.trim()
  };
  const serviceAddr = sameAsMailChk.checked
    ? mailAddr
    : {
        street1: svcStreet1Input.value.trim(),
        street2: svcStreet2Input.value.trim(),
        unitNum: svcUnitNumInput.value.trim(),
        city:    svcCityInput.value.trim(),
        province:svcProvinceInput.value.trim(),
        region:  svcRegionInput.value.trim(),
        country: svcCountrySelect.value,
        postalCode: svcPostalCodeInput.value.trim()
      };

  const data = {
    firstName: firstNameInput.value.trim(),
    lastName:  lastNameInput.value.trim(),
    phones: [
      { number: phone1Input.value.trim(), mobile: true },
      { number: phone2Input.value.trim(), mobile: false }
    ],
    email: emailInput.value.trim(),
    mailAddress:    mailAddr,
    serviceAddress: serviceAddr,
    sameAsMail:     sameAsMailChk.checked,
    accountType:    accountTypeInput.value.trim(),
    roles:          rolesInput.value.split(",").map(s=>s.trim()).filter(Boolean),
    primaryUser:    primaryUserChk.checked,
    active:         activeChk.checked
  };

  await updateDoc(doc(db,"users",uid), data);
  alert("Profile saved");
  await loadUser();
};

suspendBtn.onclick = () => {
  showActionDialog(
    "Are you sure you want to suspend this account?",
    async () => { await updateDoc(doc(db,"users",uid),{active:false}); await loadUser(); }
  );
};
reactivateBtn.onclick = () => {
  showActionDialog(
    "Are you sure you want to reactivate this account?",
    async () => { await updateDoc(doc(db,"users",uid),{active:true}); await loadUser(); }
  );
};
deleteBtn.onclick = () => {
  showActionDialog(
    "Are you sure you want to delete this account?",
    async () => { await deleteDoc(doc(db,"users",uid)); location.href="hq-dash.shtml"; }
  );
};

// close logic
closeBtn.addEventListener("click", () => {
  if (isDirty) showModal(closeModal);
  else location.href = "hq-dash.shtml";
});
closeYesBtn.addEventListener("click", () => location.href="hq-dash.shtml");
closeNoBtn.addEventListener("click", () => hideModal(closeModal));

populateCountries();
loadUser();