/**
 * BECON HVAC Studio Main Login Controller
 */
import {
  auth,
  showToast,
  firebaseErrorMessage,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setDemoUser,
} from "./auth.js";

function setupLoginForm() {
  const loginForm = document.getElementById("login-form");
  const demoLoginBtn = document.getElementById("demo-login-btn");
  const googleLoginBtn = document.getElementById("google-login");
  const otpBtn = document.getElementById("google-otp");

  // 1. 데모 체험 로그인 (원클릭 즉시 접속)
  demoLoginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    setDemoUser("HVAC 수석 엔지니어", "engineer@becon-hvac.ai");
    showToast("🚀 체험 모드로 로그인되었습니다. 대시보드로 이동합니다...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 300);
  });

  // 2. 이메일/비밀번호 로그인
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("account");
    const passInput = document.getElementById("password");
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passInput ? passInput.value : "";

    if (!email || !password) {
      showToast("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("로그인 성공! 대시보드로 이동합니다...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 300);
    } catch (error) {
      showToast(firebaseErrorMessage(error));
    }
  });

  // 3. 구글 로그인
  googleLoginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      showToast("구글 계정으로 로그인되었습니다. 대시보드로 이동합니다...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 300);
    } catch (error) {
      showToast(firebaseErrorMessage(error));
    }
  });

  // 4. OTP 버튼
  otpBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("BECON 2단계 보안 인증(OTP)이 활성화되어 있습니다.");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLoginForm);
} else {
  setupLoginForm();
}
