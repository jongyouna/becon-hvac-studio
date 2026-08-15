import { auth, onAuthStateChanged, signOut } from "./auth.js";
import { HvacCopilot } from "./copilot.js";

// Initialize HVAC AI Copilot
let copilotInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  copilotInstance = new HvacCopilot();
  initTabNavigation();
});

// Authentication state check
onAuthStateChanged(auth, (user) => {
  const welcomeText = document.getElementById("welcome-text");
  if (!user) {
    const isDemo = localStorage.getItem("becon_current_user");
    if (!isDemo) {
      window.location.href = "index.html";
      return;
    }
  }

  if (welcomeText && user) {
    welcomeText.textContent = `${user.displayName || user.email?.split("@")[0] || "HVAC 엔지니어"}님 (Pro)`;
  }
});

// Logout handler
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Tab navigation handler
function initTabNavigation() {
  const navItems = document.querySelectorAll(".sidebar__item[data-tab]");
  const panes = document.querySelectorAll(".tab-pane");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;

      navItems.forEach((n) => n.classList.remove("sidebar__item--active"));
      item.classList.add("sidebar__item--active");

      panes.forEach((pane) => {
        pane.classList.remove("active");
        if (pane.id === `pane-${targetTab}`) {
          pane.classList.add("active");
        }
      });
    });
  });
}
