import {
  auth,
  showToast,
  firebaseErrorMessage,
  createUserWithEmailAndPassword,
  updateProfile,
} from "./auth.js";

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("account").value.trim();
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("password-confirm").value;

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
    showToast("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (error) {
    showToast(firebaseErrorMessage(error));
  }
});
