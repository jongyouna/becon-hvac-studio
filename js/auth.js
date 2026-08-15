/**
 * BECON HVAC Studio Authentication Module
 * Firebase Authentication 및 독립형 로컬 데모 세션을 모두 완벽 지원하는 통합 인증 모듈
 */

import { firebaseConfig } from "./firebase-config.js";

let auth = null;
let fbAuthModule = null;
let isFirebaseReady = false;

// Firebase CDN 비동기 동적 로드 (네트워크 차단/실패 시에도 전체 앱이 100% 정상 작동하도록 안전 래핑)
async function initFirebase() {
  const isDemoKey = !firebaseConfig?.apiKey || 
                    firebaseConfig.apiKey.includes("YOUR_API_KEY") || 
                    firebaseConfig.apiKey.includes("DEMO_") || 
                    firebaseConfig.apiKey === "";

  if (isDemoKey) {
    console.log("BECON HVAC: 데모 모드로 인증 시스템 가동");
    return;
  }

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js");
    fbAuthModule = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
    const app = initializeApp(firebaseConfig);
    auth = fbAuthModule.getAuth(app);
    isFirebaseReady = true;
    console.log("BECON HVAC: Firebase Auth 초기화 성공");
  } catch (err) {
    console.warn("BECON HVAC: Firebase CDN 로드 실패 또는 미설정. 로컬 세션 모드로 동작합니다.", err);
  }
}

// 초기화 즉시 비동기 실행
const initPromise = initFirebase();

export function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

export function firebaseErrorMessage(error) {
  if (!error) return "오류가 발생했습니다.";
  switch (error.code) {
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않습니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/email-already-in-use":
      return "이미 등록된 이메일 계정입니다.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔습니다. 다시 시도해주세요.";
    default:
      return error.message || "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  await initPromise;
  if (isFirebaseReady && auth && fbAuthModule) {
    try {
      const cred = await fbAuthModule.signInWithEmailAndPassword(auth, email, password);
      const user = {
        email: cred.user.email,
        displayName: cred.user.displayName || email.split("@")[0],
        uid: cred.user.uid,
      };
      localStorage.setItem("becon_current_user", JSON.stringify(user));
      return { user };
    } catch (e) {
      throw e;
    }
  }

  // Local Session Fallback
  const demoUser = {
    email: email || "engineer@becon-hvac.ai",
    displayName: (email && email.includes("@")) ? email.split("@")[0] : "HVAC 엔지니어",
    uid: "usr-" + Math.random().toString(36).substring(2, 9),
  };
  localStorage.setItem("becon_current_user", JSON.stringify(demoUser));
  return { user: demoUser };
}

export async function createUserWithEmailAndPassword(_auth, email, password) {
  await initPromise;
  if (isFirebaseReady && auth && fbAuthModule) {
    try {
      const cred = await fbAuthModule.createUserWithEmailAndPassword(auth, email, password);
      const user = {
        email: cred.user.email,
        displayName: cred.user.displayName || email.split("@")[0],
        uid: cred.user.uid,
      };
      localStorage.setItem("becon_current_user", JSON.stringify(user));
      return { user };
    } catch (e) {
      throw e;
    }
  }

  const demoUser = {
    email,
    displayName: email.split("@")[0] || "신규 엔지니어",
    uid: "usr-" + Math.random().toString(36).substring(2, 9),
  };
  localStorage.setItem("becon_current_user", JSON.stringify(demoUser));
  return { user: demoUser };
}

export async function signInWithPopup(_auth, _provider) {
  await initPromise;
  if (isFirebaseReady && auth && fbAuthModule) {
    try {
      const provider = new fbAuthModule.GoogleAuthProvider();
      const cred = await fbAuthModule.signInWithPopup(auth, provider);
      const user = {
        email: cred.user.email,
        displayName: cred.user.displayName || "Google 엔지니어",
        uid: cred.user.uid,
      };
      localStorage.setItem("becon_current_user", JSON.stringify(user));
      return { user };
    } catch (e) {
      throw e;
    }
  }

  const demoUser = {
    email: "hvac.expert@gmail.com",
    displayName: "김공조 수석엔지니어",
    uid: "google-demo-uid",
  };
  localStorage.setItem("becon_current_user", JSON.stringify(demoUser));
  return { user: demoUser };
}

export function onAuthStateChanged(_auth, callback) {
  // 1. 즉시 로컬 스토리지 세션 확인 후 콜백 전달
  const stored = localStorage.getItem("becon_current_user");
  let currentUser = null;
  try {
    currentUser = stored ? JSON.parse(stored) : null;
  } catch (e) {
    currentUser = null;
  }

  if (currentUser) {
    callback(currentUser);
  }

  // 2. Firebase가 준비되면 Firebase Auth 상태도 청취
  initPromise.then(() => {
    if (isFirebaseReady && auth && fbAuthModule) {
      fbAuthModule.onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const user = {
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split("@")[0],
            uid: fbUser.uid,
          };
          localStorage.setItem("becon_current_user", JSON.stringify(user));
          callback(user);
        } else {
          // Firebase 로그아웃되었으나 로컬 데모 세션이 있으면 유지
          const localUser = localStorage.getItem("becon_current_user");
          callback(localUser ? JSON.parse(localUser) : null);
        }
      });
    } else {
      if (!currentUser) {
        callback(null);
      }
    }
  });

  return () => {};
}

export async function signOut(_auth) {
  localStorage.removeItem("becon_current_user");
  await initPromise;
  if (isFirebaseReady && auth && fbAuthModule) {
    try {
      await fbAuthModule.signOut(auth);
    } catch (e) {
      console.warn("Firebase SignOut err:", e);
    }
  }
}

export async function sendPasswordResetEmail(_auth, email) {
  await initPromise;
  if (isFirebaseReady && auth && fbAuthModule) {
    return await fbAuthModule.sendPasswordResetEmail(auth, email);
  }
  return true;
}

export async function updateProfile(user, profile) {
  await initPromise;
  if (isFirebaseReady && auth && fbAuthModule && auth.currentUser) {
    try {
      await fbAuthModule.updateProfile(auth.currentUser, profile);
    } catch (e) {}
  }
  const stored = localStorage.getItem("becon_current_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(parsed, profile);
      localStorage.setItem("becon_current_user", JSON.stringify(parsed));
    } catch (e) {}
  }
}

export function setDemoUser(name = "HVAC 제어 엔지니어", email = "engineer@becon-hvac.ai") {
  const user = { displayName: name, email, uid: "demo-hvac-engineer-id" };
  localStorage.setItem("becon_current_user", JSON.stringify(user));
  return user;
}

export class GoogleAuthProvider {}
export { auth };
