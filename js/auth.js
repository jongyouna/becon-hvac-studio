// Firebase Authentication 연동 모듈.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword as fbCreateUser,
  signInWithEmailAndPassword as fbSignIn,
  signInWithPopup as fbSignInPopup,
  GoogleAuthProvider,
  onAuthStateChanged as fbOnAuthStateChanged,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendReset,
  updateProfile as fbUpdateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

let app = null;
let auth = null;
let isDemoConfig = !firebaseConfig?.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY") || firebaseConfig.apiKey.includes("DEMO_");

try {
  if (!isDemoConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (e) {
  console.warn("Firebase Auth 초기화 건너뜀 (데모 모드로 동작):", e);
  isDemoConfig = true;
}

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
      return error.message || "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

// Auth wrappers supporting both Firebase and Demo Guest
async function signInWithEmailAndPassword(_auth, email, password) {
  if (auth && !isDemoConfig) {
    return await fbSignIn(auth, email, password);
  }
  // Local Demo Login fallback
  const demoUser = {
    email,
    displayName: email.split("@")[0] || "BECON Member",
    uid: "demo-" + Math.random().toString(36).substring(2, 9),
  };
  localStorage.setItem("becon_current_user", JSON.stringify(demoUser));
  return { user: demoUser };
}

async function createUserWithEmailAndPassword(_auth, email, password) {
  if (auth && !isDemoConfig) {
    return await fbCreateUser(auth, email, password);
  }
  const demoUser = {
    email,
    displayName: email.split("@")[0] || "BECON Member",
    uid: "demo-" + Math.random().toString(36).substring(2, 9),
  };
  localStorage.setItem("becon_current_user", JSON.stringify(demoUser));
  return { user: demoUser };
}

async function signInWithPopup(_auth, provider) {
  if (auth && !isDemoConfig) {
    return await fbSignInPopup(auth, provider);
  }
  const demoUser = {
    email: "becon.user@gmail.com",
    displayName: "김베콘 (BECON Pro)",
    uid: "demo-google-user",
  };
  localStorage.setItem("becon_current_user", JSON.stringify(demoUser));
  return { user: demoUser };
}

function onAuthStateChanged(_auth, callback) {
  if (auth && !isDemoConfig) {
    return fbOnAuthStateChanged(auth, (user) => {
      if (user) {
        callback(user);
      } else {
        const stored = localStorage.getItem("becon_current_user");
        callback(stored ? JSON.parse(stored) : null);
      }
    });
  }
  const stored = localStorage.getItem("becon_current_user");
  callback(stored ? JSON.parse(stored) : null);
  return () => {};
}

async function signOut(_auth) {
  localStorage.removeItem("becon_current_user");
  if (auth && !isDemoConfig) {
    await fbSignOut(auth);
  }
}

async function sendPasswordResetEmail(_auth, email) {
  if (auth && !isDemoConfig) {
    return await fbSendReset(auth, email);
  }
  return true;
}

async function updateProfile(user, profile) {
  if (auth && !isDemoConfig && user?.updateProfile) {
    return await fbUpdateProfile(user, profile);
  }
  const stored = localStorage.getItem("becon_current_user");
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.assign(parsed, profile);
    localStorage.setItem("becon_current_user", JSON.stringify(parsed));
  }
}

// Quick demo login helper
function setDemoUser(name = "김베콘 닥터", email = "doctor@becon.ai") {
  const user = { displayName: name, email, uid: "demo-doctor-id" };
  localStorage.setItem("becon_current_user", JSON.stringify(user));
  return user;
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
  setDemoUser,
};
