// File: js/clients.js

import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// NOTE: assumes user-profile.js has already been loaded & defines window.populateUserProfile

document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.querySelector("#clients-table tbody");
  if (!tbody) {
    console.error("clients.js: #clients-table tbody not found");
    return;
  }

  // 1) Fetch all users
  const userSnaps = await getDocs(collection(db, "users"));
  const rows = await Promise.all(userSnaps.docs.map(async userSnap => {
    const u = { uid: userSnap.id, ...userSnap.data() };

    // 2) Lookup the organization name via defaultAccount.id
    let orgName = "[no org]";
    if (u.defaultAccount?.type === "organization" && u.defaultAccount.id) {
      const orgSnap = await getDoc(doc(db, "organizations", u.defaultAccount.id));
      if (orgSnap.exists()) {
        orgName = orgSnap.data().name || "[no name]";
      }
    }

    // 3) Primary contact details
    const first = u.primaryContact?.firstName || "";
    const last  = u.primaryContact?.lastName  || "";
    const phone1 = u.primaryContact?.phones?.[0]?.number || "";
    const phone2 = u.primaryContact?.phones?.[1]?.number || "";
    const email  = u.primaryContact?.email || "";

    // 4) Other columns
    const primary = u.primaryUser ? "Y" : "N";
    const doors   = u.doors || 0;
    const acct    = u.accountType || "";
    const userT   = u.userType    || "";
    const blueNo  = u.blueAcct     || "";
    const active  = u.active ? "Y" : "N";
    const linked  = (u.linkedAccounts?.length || 0);
    const paid    = u.subscription?.paid ? "Y" : "N";
    const expiry  = u.subscription?.expiry
      ? new Date(u.subscription.expiry.seconds * 1000)
          .toLocaleDateString()
      : "";

    return `
      <tr data-uid="${u.uid}">
        <td>${orgName}</td>
        <td>${u.organization?.street1 || ""} ${u.organization?.street2 || ""}</td>
        <td>${u.organization?.city || ""}</td>
        <td>${u.organization?.province || ""}</td>
        <td>${first}</td>
        <td>${last}</td>
        <td>${phone1}</td>
        <td>${phone2}</td>
        <td>${email}</td>
        <td>${primary}</td>
        <td>${doors}</td>
        <td>${acct}</td>
        <td>${userT}</td>
        <td>${blueNo}</td>
        <td>${active}</td>
        <td>${linked}</td>
        <td>${paid}</td>
        <td>${expiry}</td>
      </tr>
    `;
  }));

  // 5) Inject all rows at once
  tbody.innerHTML = rows.join("");

  // 6) Wire up clicks
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", async () => {
      const uid = tr.dataset.uid;
      if (!uid) return;
      // re-fetch the full user record so populateUserProfile gets up-to-date data
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return;
      window.populateUserProfile(snap.data(), uid);
    });
  });

  console.log(`🟢 rows injected: ${rows.length}`);
});