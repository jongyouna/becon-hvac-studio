document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const account = document.getElementById("account").value.trim();
  const password = document.getElementById("password").value;

  if (!account || !password) {
    showToast("계정과 비밀번호를 입력해주세요.");
    return;
  }

  const user = findUserByAccount(account);
  if (!user || user.password !== password) {
    showToast("계정 또는 비밀번호가 올바르지 않습니다.");
    return;
  }

  setSession(account);
  window.location.href = "dashboard.html";
});

document.getElementById("google-login").addEventListener("click", () => {
  showToast("디자인 목업입니다. 실제 구글 로그인은 연결되어 있지 않습니다.");
});

document.getElementById("google-otp").addEventListener("click", () => {
  showToast("디자인 목업입니다. 실제 OTP 등록은 연결되어 있지 않습니다.");
});
