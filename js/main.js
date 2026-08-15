const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("디자인 목업입니다. 실제 로그인은 동작하지 않습니다.");
});

document.getElementById("google-login").addEventListener("click", () => {
  showToast("디자인 목업입니다. 실제 구글 로그인은 연결되어 있지 않습니다.");
});

document.getElementById("google-otp").addEventListener("click", () => {
  showToast("디자인 목업입니다. 실제 OTP 등록은 연결되어 있지 않습니다.");
});

document.querySelectorAll(".link[data-mock]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showToast(`디자인 목업입니다: "${link.dataset.mock}" 링크는 연결되어 있지 않습니다.`);
  });
});
