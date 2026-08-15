import {
  auth,
  showToast,
  firebaseErrorMessage,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setDemoUser,
} from "./auth.js";

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("account").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showToast("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("로그인 성공! 대시보드로 이동합니다.");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 400);
  } catch (error) {
    showToast(firebaseErrorMessage(error));
  }
});

document.getElementById("google-login")?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    showToast("구글 계정으로 로그인되었습니다.");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 400);
  } catch (error) {
    showToast(firebaseErrorMessage(error));
  }
});

document.getElementById("demo-login-btn")?.addEventListener("click", () => {
  setDemoUser("BECON Pro 테스터", "tester@becon.ai");
  showToast("체험 모드로 로그인되었습니다. 대시보드로 이동합니다.");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 400);
});

document.getElementById("google-otp")?.addEventListener("click", () => {
  showToast("BECON 2단계 보안 인증(OTP)이 활성화되어 있습니다.");
});
