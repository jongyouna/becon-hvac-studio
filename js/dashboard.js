/**
 * BECON HVAC Studio Dashboard Controller
 */
import { auth, onAuthStateChanged, signOut, setDemoUser } from "./auth.js";
import { HvacCopilot } from "./copilot.js";

let copilotInstance = null;

function initDashboard() {
  if (!copilotInstance) {
    copilotInstance = new HvacCopilot();
  }
  initTabNavigation();
  initAuthListener();
}

function initAuthListener() {
  const welcomeText = document.getElementById("welcome-text");
  const logoutBtn = document.getElementById("logout-btn");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // 만약 세션이 비어있더라도 대시보드 접근 시 기본 엔지니어 데모 세션을 자동 부여하여 튕기지 않도록 처리
      const guest = setDemoUser("HVAC 수석 엔지니어", "engineer@becon-hvac.ai");
      if (welcomeText) {
        welcomeText.textContent = `${guest.displayName}님 (Pro)`;
      }
      return;
    }

    if (welcomeText) {
      welcomeText.textContent = `${user.displayName || user.email?.split("@")[0] || "HVAC 엔지니어"}님 (Pro)`;
    }
  });

  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
  });
}

function initTabNavigation() {
  const navItems = document.querySelectorAll(".sidebar__item[data-tab]");
  const panes = document.querySelectorAll(".tab-pane");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;
      if (!targetTab) return;

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
