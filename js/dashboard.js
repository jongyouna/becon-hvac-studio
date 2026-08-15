/**
 * BECON HVAC Studio Dashboard Controller
 */
import { auth, onAuthStateChanged, signOut, setDemoUser } from "./auth.js";
import { HvacCopilot } from "./copilot.js";
import { getLanguage, t } from "./i18n.js";

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

  const updateWelcome = (user) => {
    if (!welcomeText) return;
    const isKo = getLanguage() === "ko";
    const role = isKo ? "님 (Pro)" : " (Pro)";
    const defaultName = isKo ? "HVAC 수석 엔지니어" : "Lead HVAC Engineer";
    const name = user?.displayName || user?.email?.split("@")[0] || defaultName;
    welcomeText.textContent = `${name}${role}`;
  };

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      const guest = setDemoUser("HVAC 수석 엔지니어", "engineer@becon-hvac.ai");
      updateWelcome(guest);
      return;
    }
    updateWelcome(user);
  });

  // 언어 변경 시 사용자 웰컴 명칭도 언어에 맞게 자동 갱신
  window.addEventListener("languageChanged", () => {
    const stored = localStorage.getItem("becon_current_user");
    let user = null;
    try {
      user = stored ? JSON.parse(stored) : null;
    } catch (e) {}
    updateWelcome(user);
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
