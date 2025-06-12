// js/gear-tab.js
// Injects the gear-tab inside .workspace, opens sidebar on click, never closes it

document.addEventListener("DOMContentLoaded", () => {
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("overlay");
  const workspace = document.querySelector(".workspace");
  if (!sidebar || !overlay || !workspace) return;

  // avoid injecting twice
  if (document.getElementById("sidebar-tab")) return;

  // 1) create tab
  const tab = document.createElement("div");
  tab.id = "sidebar-tab";

  // 2) gear icon
  const img = document.createElement("img");
  img.src       = "images/gear_white.svg";
  img.alt       = "Menu";
  img.className = "gear-icon";
  tab.appendChild(img);

  // 3) put inside the workspace so it moves with the blue area
  workspace.appendChild(tab);

  // 4) ensure overlay blocks the workspace but lets sidebar/tab stay interactive
  overlay.style.pointerEvents = "all";
  function refreshOverlay() {
    overlay.style.display = sidebar.classList.contains("open") ? "block" : "none";
  }
  refreshOverlay();

  // 5) clicking the tab **only** opens the sidebar
  tab.addEventListener("click", () => {
    if (!sidebar.classList.contains("open")) {
      sidebar.classList.add("open");
      tab.classList.add("open");
      refreshOverlay();
    }
  });

  // 6) only the ✖ inside the sidebar closes it
  const closeBtn = document.getElementById("sidebar-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("open");
      tab.classList.remove("open");
      refreshOverlay();
    });
  }
});