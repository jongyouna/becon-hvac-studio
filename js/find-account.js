/**
 * BECON HVAC Studio Find Account Controller
 */
import { auth, showToast, firebaseErrorMessage, sendPasswordResetEmail } from "./auth.js";

function initFindForm() {
  const form = document.getElementById("find-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("account");
    const email = emailInput ? emailInput.value.trim() : "";
    if (!email) {
      showToast("엔지니어 이메일을 입력해주세요.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("비밀번호 재설정 메일을 전송했습니다. 메일함을 확인해주세요.");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      showToast(firebaseErrorMessage(error));
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFindForm);
} else {
  initFindForm();
}
