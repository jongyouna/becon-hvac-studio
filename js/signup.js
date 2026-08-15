/**
 * BECON HVAC Studio Signup Controller
 */
import {
  auth,
  showToast,
  firebaseErrorMessage,
  createUserWithEmailAndPassword,
  updateProfile,
} from "./auth.js";

function initSignupForm() {
  const form = document.getElementById("signup-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("account")?.value.trim();
    const password = document.getElementById("password")?.value;
    const passwordConfirm = document.getElementById("password-confirm")?.value;

    if (!name || !email || !password || !passwordConfirm) {
      showToast("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      showToast("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      showToast("계정 등록이 완료되었습니다. 로그인 화면으로 이동합니다.");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      showToast(firebaseErrorMessage(error));
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSignupForm);
} else {
  initSignupForm();
}
