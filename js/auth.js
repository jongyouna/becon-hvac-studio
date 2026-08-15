// Firebase Authentication 연동 모듈. 실제 프로젝트 설정값은 js/firebase-config.js에서
// 가져옵니다(로컬 개발 시 js/firebase-config.example.js를 복사해서 사용하고,
// 배포 시에는 GitHub Actions가 저장소 Secrets로부터 자동 생성합니다).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function firebaseErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않습니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/email-already-in-use":
      return "이미 가입된 이메일입니다.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔습니다. 다시 시도해주세요.";
    default:
      return "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export {
  auth,
  showToast,
  firebaseErrorMessage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
};
