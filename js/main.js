import {
  auth,
  showToast,
  firebaseErrorMessage,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "./auth.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("account").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showToast("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(firebaseErrorMessage(error));
  }
});

document.getElementById("google-login").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(firebaseErrorMessage(error));
  }
});

document.getElementById("google-otp").addEventListener("click", () => {
  showToast("디자인 목업입니다. 실제 OTP 등록은 연결되어 있지 않습니다.");
});
