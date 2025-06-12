// File: js/dashboard.js

import { auth } from "./firebase.js";
import { db }   from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // ─── Sidebar toggle ──────────────────────────────────────
  const sidebar  = document.getElementById("sidebar");
  const gearTab  = document.getElementById("sidebar-tab");
  const closeBtn = document.getElementById("sidebar-close");

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    gearTab.classList.toggle("open");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    gearTab.classList.remove("open");
  }

  gearTab  && gearTab.addEventListener("click", toggleSidebar);
  closeBtn && closeBtn.addEventListener("click", closeSidebar);

  // ─── Logout ───────────────────────────────────────────────
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    window.location.href = "/index.shtml";
  });

  // ─── Top-Menu population ──────────────────────────────────
  const menuLeft  = document.querySelector(".menu-left");
  const menuRight = document.querySelector(".menu-right");
  if (menuLeft && menuRight) {
    menuLeft.innerHTML = [
      { href: "hq-dash.shtml",  label: "Dashboard" },
      { href: "clients.shtml",  label: "Clients"   },
      { href: "new-user.shtml", label: "New…"      }
    ].map(it => `<li><a href="${it.href}">${it.label}</a></li>`).join("");
    menuRight.innerHTML = [
      { href: "inbox.shtml",     label: "Inbox"     },
      { href: "reminders.shtml", label: "Reminders" }
    ].map(it => `<li><a href="${it.href}">${it.label}</a></li>`).join("");
  }

  // ─── Info widget (date/time + account + user) ────────────
  const info = document.createElement("div");
  info.id = "top-bar-info";
  Object.assign(info.style, {
    position:      "fixed",
    top:           "10px",
    right:         "20px",
    color:         "#333",
    textAlign:     "right",
    lineHeight:    "1.2",
    fontSize:      "0.9rem",
    zIndex:        "1000",
    pointerEvents: "none"
  });
  document.body.appendChild(info);

  // ─── Auth state & role-switcher ─────────────────────────
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // 1) build timestamp in 12-hour clock
    const now   = new Date();
    const mo    = now.toLocaleString("default", { month: "long" });
    const d     = now.getDate();
    const y     = now.getFullYear();
    let   hrs   = now.getHours();
    const ampm  = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12 || 12;
    const mins  = String(now.getMinutes()).padStart(2, "0");
    const stamp = `${mo} ${d}, ${y} ${hrs}:${mins} ${ampm}`;

    // 2) fetch current user document
    const meRef  = doc(db, "users", user.uid);
    const meSnap = await getDoc(meRef);
    if (!meSnap.exists()) {
      console.error("No user record for", user.uid);
      return;
    }
    const me = meSnap.data();

    // 3) render info widget
    const firstName = me.primaryContact?.firstName || me.firstName || "";
    const lastName  = me.primaryContact?.lastName  || me.lastName  || "";
    const acctType  = me.defaultAccount?.type
                      ? me.defaultAccount.type.charAt(0).toUpperCase() + me.defaultAccount.type.slice(1)
                      : "";
    info.innerHTML = `
      <div>${stamp}</div>
      <div>Account: ${acctType}</div>
      <div>Logged In As: ${firstName} ${lastName}</div>
    `;

    // 4) role-switcher
    const container = document.querySelector(".role-switcher");
    const avatarImg = document.getElementById("role-avatar");
    const sel       = document.getElementById("role-switcher");
    const cur       = document.getElementById("role-current");
    if (!container || !avatarImg || !sel || !cur) return;

    // a) gather accounts: self + linkedAccounts[].id
    const allIds = [
      user.uid,
      ...(Array.isArray(me.linkedAccounts)
        ? me.linkedAccounts.map(a => a.id)
        : [])
    ];
    const docs = await Promise.all(allIds.map(async uid => {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.exists() ? { uid, ...snap.data() } : null;
    }));
    const active = docs.filter(x => x && x.active);

    // b) populate hidden <select>
    sel.innerHTML = active.map(acc =>
      `<option value="${acc.uid}">${
         acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1)
       }</option>`
    ).join("");
    sel.value = user.uid;

    // c) set avatar
    avatarImg.src = me.avatarUrl || "/images/default-avatar.png";

    // d) mirror into #role-current
    const updateCurrent = () =>
      cur.textContent = sel.selectedOptions[0]?.textContent || "";
    sel.addEventListener("change", updateCurrent);
    updateCurrent();

    // e) hide native select
    sel.classList.add("hidden");

    // f) clicking text toggles select
    cur.style.cursor = "pointer";
    cur.addEventListener("click", () => {
      sel.classList.toggle("hidden");
      if (!sel.classList.contains("hidden")) sel.focus();
    });

    // g) on change → redirect with new uid
    sel.addEventListener("change", () => {
      avatarImg.classList.add("spin");
      const acc = active.find(a => a.uid === sel.value);
      setTimeout(() => avatarImg.src = acc?.avatarUrl || "/images/default-avatar.png", 300);
      avatarImg.addEventListener("animationend", () => {
        avatarImg.classList.remove("spin");
        const ps = new URLSearchParams(location.search);
        ps.set("uid", sel.value);
        location.search = ps.toString();
      }, { once: true });
    });

    // h) hide again on blur
    sel.addEventListener("blur", () => sel.classList.add("hidden"));
  });
});