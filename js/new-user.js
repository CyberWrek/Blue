// js/new-user.js

import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded",()=>{
  const $ = s=>document.querySelector(s);

  // steps
  const step1      = $("#step1");
  const step2      = $("#step2");
  const step3      = $("#step3");
  const step4      = $("#step4");
  const step5      = $("#step5");
  const next4Btn   = $("#step4-next");
  const createBtn  = $("#create-user-btn");
  const closeWizard = document.getElementById("profile-close");
  if (closeWizard) {
      closeWizard.addEventListener("click", () => {
          window.location.href = "/shtml/bluehq/hq-dash.shtml";
      });
  }
  // STEP 1
  $("#opt-new-account").addEventListener("change",_=>{
    hideAllLaterSteps(1);       // hide steps 2, 3 ,4
    step2.classList.remove("hidden");
  });

  // STEP 2
  $("#opt-org").addEventListener("change",_=>{
    step3.classList.remove("hidden");
    $("#summary-type").textContent = "Organization";
  });
  $("#opt-ind").addEventListener("change", _=>{
    step3.classList.remove("hidden");
    $("#summary-type").textContent = "Individual";
  });

  // STEP 3
  document.querySelectorAll('input[name="step3"]').forEach(r=>{
    r.addEventListener("change", e=>{
      step4.classList.remove("hidden");
      $("#summary-subtype").textContent = 
        r.parentNode.textContent.trim();
      step4.dataset.subcode = r.value;
    });
  });

  // STEP 4: Google Autocomplete
  if(window.google?.maps?.places){
    const ac = new google.maps.places.Autocomplete($("#orgAddress"),{ types:["address"] });
    ac.addListener("place_changed",()=>{
      const place = ac.getPlace();
      if(!place.address_components) return;
      const get = (type, short=false)=>{
        const comp = place.address_components.find(c=>c.types.includes(type));
        return comp 
          ? (short ? comp.short_name : comp.long_name) 
          : "";
      };
      $("#orgStreet1").value       = `${get("street_number")} ${get("route")}`.trim();
      $("#orgCity").value          = get("locality")||get("postal_town");
      $("#orgProvince").value  = get("administrative_area_level_1");
      $("#orgCountry").value   = get("country");
      $("#orgPostalCode").value    = get("postal_code");
    });
  }

  // whenever user edits any Step 4 field → hide Step 5 & re-show button
  Array.from(step4.querySelectorAll("input")).forEach(inp=>{
    inp.addEventListener("input", _=>{
      step5.classList.add("hidden");
      createBtn.disabled = true;
      next4Btn.classList.remove("hidden");
    });
  });

  // STEP 4 → generate acct# & show Step 5
  next4Btn.addEventListener("click", async ()=>{
    const country = $("#orgCountry").value,
          prov    = $("#orgProvince").value,
          sub     = step4.dataset.subcode;
    if(!country||!prov||!sub) 
      return alert("Please complete Country/Province & Org-Type");

    // build prefix + date
    const d = new Date(),
          mm = String(d.getMonth()+1).padStart(2,"0"),
          dd = String(d.getDate()).padStart(2,"0"),
          yy = String(d.getFullYear()).slice(-2),
          prefix = `${country}-${prov}-${sub}${mm+dd+yy}-`;

    // count existing
    const usersRef = collection(db,"users"),
          qpref = query(usersRef,
            where("accountNumber",">=",prefix),
            where("accountNumber","<", prefix+"\uf8ff")
          ),
          snap = await getDocs(qpref),
          seq  = String(snap.size+1).padStart(4,"0"),
          acct = prefix+seq;

    $("#summary-acct").textContent = acct;

    // advance
    next4Btn.classList.add("hidden");
    step5.classList.remove("hidden");
    createBtn.disabled = false;
  });

  // FINAL SUBMIT
  $("#new-user-form").addEventListener("submit", async e=>{
    e.preventDefault();
    createBtn.disabled = true;

    // create auth user
    const email   = $("#contactEmail").value.trim(),
          pwd     = Math.random().toString(36).slice(-8),
          { user }= await createUserWithEmailAndPassword(auth,email,pwd);
    await sendPasswordResetEmail(auth,email);

    // assemble profile
    const profile = {
      uid:           user.uid,
      accountNumber: $("#summary-acct").textContent,
      accountType:   "organization",
      orgSubtype:    $("#summary-subtype").textContent,
      organization: {
        name:      $("#orgName").value.trim(),
        unit:      $("#orgUnit").value.trim(),
        street1:   $("#orgStreet1").value.trim(),
        street2:   $("#orgStreet2").value.trim(),
        city:      $("#orgCity").value.trim(),
        province:  $("#orgProvince").value,
        country:   $("#orgCountry").value,
        postal:    $("#orgPostalCode").value.trim(),
        phone:     $("#orgPhone").value.trim(),
        email:     $("#orgEmail").value.trim()
      },
      primaryContact:{
        firstName: $("#contactFirst").value.trim(),
        lastName:  $("#contactLast").value.trim(),
        phones: [
          { number: $("#contactPhone1").value.trim(), mobile: $("#contactPhone1Mobile").checked },
          { number: $("#contactPhone2").value.trim(), mobile: $("#contactPhone2Mobile").checked }
        ],
        email: email
      },
      roles:[],
      linkedAccounts:[]
    };

    // save to Firestore
    await setDoc(doc(db,"users",user.uid),profile);
    alert("✅ Account created — reset link sent to "+email);
    location.href = "hq-dash.shtml";
  });
});