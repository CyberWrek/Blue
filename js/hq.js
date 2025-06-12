// js/hq.js

document.addEventListener("DOMContentLoaded", () => {
  // ── 0) If we're not on the user-admin page, give up immediately
  const usersTable = document.getElementById("users-table");
  if (!usersTable) return;

  // ── 1) Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "index.shtml";
    });
  }

  // ── 2) ELEMENT REFERENCES
  const usersTbody    = usersTable.querySelector("tbody");
  const addBtn        = document.getElementById("add-user-btn");
  const modal         = document.getElementById("user-modal");
  const modalClose    = document.getElementById("modal-close");
  const form          = document.getElementById("user-form");
  const linkedListDiv = document.getElementById("linked-list");
  const linkBtn       = document.getElementById("link-accounts-btn");

  // Form fields
  const uidInput       = document.getElementById("uid");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput  = document.getElementById("lastName");
  const typeInput      = document.getElementById("accountType");
  const blueAcctInput  = document.getElementById("blueAcct");
  const rolesInput     = document.getElementById("roles");
  const rolesDatalist  = document.getElementById("roles-list");
  const emailInput     = document.getElementById("email");
  const phone1Input    = document.getElementById("phone1");
  const phone2Input    = document.getElementById("phone2");
  const mailStreet1    = document.getElementById("mailStreet1");
  const mailStreet2    = document.getElementById("mailStreet2");
  const mailCity       = document.getElementById("mailCity");
  const mailProvince   = document.getElementById("mailProvince");
  const mailPostal     = document.getElementById("mailPostal");
  const sameAsMailChk  = document.getElementById("sameAsMail");
  const svcFields      = document.getElementById("serviceAddressFields");
  const svcStreet1     = document.getElementById("svcStreet1");
  const svcStreet2     = document.getElementById("svcStreet2");
  const svcCity        = document.getElementById("svcCity");
  const svcProvince    = document.getElementById("svcProvince");
  const svcPostal      = document.getElementById("svcPostal");
  const primaryInput   = document.getElementById("primaryUser");
  const activeInput    = document.getElementById("active");

  // ── 3) STATE
  let knownRoles     = new Set();
  let linkedAccounts = [];

  // ── 4) Load & render all users
  async function loadUsers() {
    usersTbody.innerHTML = "<tr><td colspan='8'>Loading…</td></tr>";
    knownRoles.clear();

    try {
      const snap = await window.db.collection("users").get();
      usersTbody.innerHTML = "";

      if (snap.empty) {
        usersTbody.innerHTML = "<tr><td colspan='8'>No users found</td></tr>";
      } else {
        snap.forEach(docSnap => {
          const u = docSnap.data();
          // collect roles
          if (Array.isArray(u.roles)) {
            u.roles.forEach(r => knownRoles.add(r));
          }
          // render row
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${u.firstName  || ""}</td>
            <td>${u.lastName   || ""}</td>
            <td>${u.accountType|| ""}</td>
            <td>${u.blueAcct   || ""}</td>
            <td>${Array.isArray(u.roles)? u.roles.join(", ") : ""}</td>
            <td>${u.email      || ""}</td>
            <td>${u.primaryUser? "Yes" : "No"}</td>
            <td>${u.active     ? "Yes" : "No"}</td>
          `;
          usersTbody.appendChild(tr);
          tr.style.cursor = "pointer";
          tr.addEventListener("click", () => {
            window.location.href = `user-profile.shtml?uid=${docSnap.id}`;
          });
        });
      }

      // populate roles datalist
      rolesDatalist.innerHTML = "";
      knownRoles.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r;
        rolesDatalist.appendChild(opt);
      });

    } catch (err) {
      console.error("Error loading users:", err);
      usersTbody.innerHTML = "<tr><td colspan='8'>Error loading users</td></tr>";
    }
  }

  // ── 5) Generate BlueAcct
  function generateBlueAcct(entity) {
    const now = new Date(),
          pad = n => n.toString().padStart(2,"0"),
          ts  = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}` +
                `-${pad(now.getHours())}${pad(now.getMinutes())}`,
          codeMap = {
            BlueHQ:             "HQ",
            Home:               "HM",
            "Property Manager": "PM",
            "Property Developer":"PD",
            Builder:            "BL",
            "Warranty Provider":"WP",
            "Trade/Supplier":   "TS"
          };
    return `${ts}-${(codeMap[entity]||"XX")}`;
  }

  // ── 6) “Add User” button → new-user.shtml
  if (addBtn) {
    addBtn.onclick = () => {
      window.location.href = "new-user.shtml";
    };
  }

  // ── 7) Stub “Link Accounts”
  if (linkBtn) {
    linkBtn.onclick = async () => {
      const term = prompt("Search by first/last name, street1 or BlueAcct:");
      if (!term) return;
      const snap = await window.db.collection("users").get();
      let matches = [];
      snap.forEach(s => {
        const d = s.data();
        if (
          d.firstName?.includes(term) ||
          d.lastName?.includes(term) ||
          d.mailStreet1?.includes(term) ||
          d.blueAcct?.includes(term)
        ) matches.push({ uid:s.id, ...d });
      });
      if (!matches.length) return alert("No matches");
      const pick = matches[0];
      if (linkedAccounts.includes(pick.uid)) return alert("Already linked");
      linkedAccounts.push(pick.uid);
      linkedListDiv.innerHTML = linkedAccounts
        .map(u => {
          const m = matches.find(x => x.uid === u);
          return `<div>${u} (${m.firstName} ${m.lastName})</div>`;
        }).join("");
    };
  }

  // ── 8) Submit the form → create or update
  if (form) {
    form.onsubmit = async e => {
      e.preventDefault();

      // Role must exist
      const rv = rolesInput.value.trim();
      if (!knownRoles.has(rv)) {
        return alert(`Role “${rv}” not recognized`);
      }

      const uid = uidInput.value.trim();
      if (!uid) return alert("UID required");

      const data = {
        firstName:       firstNameInput.value.trim(),
        lastName:        lastNameInput.value.trim(),
        phones: [
          { number: phone1Input.value.trim() },
          { number: phone2Input.value.trim() }
        ],
        email:           emailInput.value.trim(),
        mailAddress: {
          street1:  mailStreet1.value.trim(),
          street2:  mailStreet2.value.trim(),
          unitNum:  mailStreet2.value.trim(),
          city:     mailCity.value.trim(),
          province: mailProvince.value.trim(),
          postal:   mailPostal.value.trim()
        },
        serviceAddress: sameAsMailChk.checked
          ? {
              street1:  mailStreet1.value.trim(),
              street2:  mailStreet2.value.trim(),
              unitNum:  mailStreet2.value.trim(),
              city:     mailCity.value.trim(),
              province: mailProvince.value.trim(),
              postal:   mailPostal.value.trim()
            }
          : {
              street1:  svcStreet1.value.trim(),
              street2:  svcStreet2.value.trim(),
              unitNum:  svcStreet2.value.trim(),
              city:     svcCity.value.trim(),
              province: svcProvince.value.trim(),
              postal:   svcPostal.value.trim()
            },
        accountType:     typeInput.value.trim(),
        roles:           [ rv ],
        primaryUser:     primaryInput.checked,
        active:          activeInput.checked,
        linkedAccounts
      };

      try {
        const ref = window.db.collection("users").doc(uid);
        await ref.update(data)
          .catch(_ => ref.set(data));
        await loadUsers();
      } catch (err) {
        console.error(err);
        alert("Save failed, see console.");
      }
    };
  }

  // ── 9) Initial load
  loadUsers();
});
