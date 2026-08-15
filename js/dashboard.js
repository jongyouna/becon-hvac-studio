requireAuth("index.html");

const session = getSession();
const welcomeText = document.getElementById("welcome-text");
if (session && welcomeText) {
  welcomeText.textContent = `${session.account}님 환영합니다`;
}

document.getElementById("logout-btn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});
