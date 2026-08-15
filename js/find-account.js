import { auth, showToast, firebaseErrorMessage, sendPasswordResetEmail } from "./auth.js";

document.getElementById("reset-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("reset-email").value.trim();
  if (!email) {
    showToast("이메일을 입력해주세요.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("비밀번호 재설정 메일을 전송했습니다. 메일함을 확인해주세요.");
  } catch (error) {
    showToast(firebaseErrorMessage(error));
  }
});
