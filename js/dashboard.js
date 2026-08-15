import { auth, onAuthStateChanged, signOut } from "./auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const welcomeText = document.getElementById("welcome-text");
  if (welcomeText) {
    welcomeText.textContent = `${user.displayName || user.email}님 환영합니다`;
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
